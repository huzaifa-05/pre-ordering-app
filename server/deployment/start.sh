#!/bin/bash
set -e

APP_DIR="/opt/preordering-backend"
IMAGE_FILE="$APP_DIR/deployment/image.json"

CONTAINER_NAME="preordering-backend"
SECRET_NAME="preordering-backend-config"
AWS_REGION="us-west-2"

# Temporary runtime environment file
ENV_FILE="/tmp/preordering-backend.env"

echo "========== STARTING NEW CONTAINER =========="

# Ensure image metadata exists
if [ ! -f "$IMAGE_FILE" ]; then
  echo "ERROR: $IMAGE_FILE was not found."
  exit 1
fi

# Read the image URI produced by CodeBuild
IMAGE_URI=$(python3 -c "
import json
with open('$IMAGE_FILE', 'r') as file:
    print(json.load(file)['imageUri'])
")

if [ -z "$IMAGE_URI" ]; then
  echo "ERROR: imageUri is empty."
  exit 1
fi

echo "Fetching runtime configuration from Secrets Manager..."

# Retrieve only SecretString; do not print it in deployment logs
SECRET_JSON=$(aws secretsmanager get-secret-value \
  --secret-id "$SECRET_NAME" \
  --region "$AWS_REGION" \
  --query SecretString \
  --output text)

if [ -z "$SECRET_JSON" ] || [ "$SECRET_JSON" = "None" ]; then
  echo "ERROR: Secret value could not be retrieved."
  exit 1
fi

# Convert the JSON secret into Docker env-file format
SECRET_JSON="$SECRET_JSON" python3 - "$ENV_FILE" <<'PYTHON'
import json
import os
import sys

output_file = sys.argv[1]
secret = json.loads(os.environ["SECRET_JSON"])

with open(output_file, "w", encoding="utf-8") as file:
    for key, value in secret.items():
        value = "" if value is None else str(value)

        # Docker env files require one KEY=VALUE entry per line
        value = value.replace("\n", "\\n")
        file.write(f"{key}={value}\n")
PYTHON

# Restrict access to the temporary environment file
chmod 600 "$ENV_FILE"

echo "Starting container from image: $IMAGE_URI"

sudo docker run -d \
  --name "$CONTAINER_NAME" \
  --publish 5000:5000 \
  --restart unless-stopped \
  --env-file "$ENV_FILE" \
  "$IMAGE_URI"

# Remove the temporary file after Docker reads it
rm -f "$ENV_FILE"
unset SECRET_JSON

# Give the application time to initialize
sleep 5

# Fail the deployment if the container exited immediately
if [ "$(sudo docker inspect -f '{{.State.Running}}' "$CONTAINER_NAME")" != "true" ]; then
  echo "ERROR: Container failed to remain running."
  sudo docker logs "$CONTAINER_NAME" || true
  exit 1
fi

echo "Container started successfully."
sudo docker ps --filter "name=$CONTAINER_NAME"
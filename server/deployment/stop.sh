#!/bin/bash
set -e

CONTAINER_NAME="preordering-backend"

echo "========== STOPPING OLD CONTAINER =========="

# Check whether the container exists before stopping it
if sudo docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  echo "Stopping container: $CONTAINER_NAME"
  sudo docker stop "$CONTAINER_NAME" || true

  echo "Removing container: $CONTAINER_NAME"
  sudo docker rm "$CONTAINER_NAME" || true
else
  echo "No existing container found. Continuing..."
fi
-- Seed role data
INSERT INTO roles (name) VALUES ('customer'), ('admin')
  ON DUPLICATE KEY UPDATE name=name;

-- Seed category data (new categories)
INSERT INTO categories (name) VALUES ('burgers'), ('pizza'), ('pasta')
  ON DUPLICATE KEY UPDATE name=name;

-- Seed status data
INSERT INTO statuses (name) VALUES ('Received'), ('Preparing'), ('Ready'), ('Completed'), ('Cancelled')
  ON DUPLICATE KEY UPDATE name=name;

#!/bin/sh
set -e

echo "================================================"
echo "Starting application initialization..."
echo "================================================"

# Wait for database directory to be ready
echo "Checking database directory..."
if [ ! -d "/app/data" ]; then
  echo "Creating /app/data directory..."
  mkdir -p /app/data
fi

# Ensure the database file exists and has correct permissions
DB_FILE="/app/data/dev.db"
if [ ! -f "$DB_FILE" ]; then
  echo "Creating empty database file..."
  touch "$DB_FILE"
fi

# Run database migrations before starting the app
# This ensures the schema exists before any requests are handled
# Using the bundled prisma from node_modules (not npx which downloads a new version)
echo "Running database migrations..."
node ./node_modules/prisma/build/index.js db push --accept-data-loss 2>&1 || {
  echo "WARNING: Database migration failed, but continuing startup..."
  echo "The database may need manual intervention."
}

echo "================================================"
echo "Database initialization complete!"
echo "Starting Next.js server..."
echo "================================================"

# Start the application
exec node server.js

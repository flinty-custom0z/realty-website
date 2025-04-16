#!/bin/bash

# Setup script for the realty website
echo "Setting up development environment..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Create placeholder images
echo "Creating placeholder images..."
node scripts/create-placeholders.js

# Check if placeholders were created successfully
if [ $? -eq 0 ]; then
    echo "Placeholder images created successfully"
else
    echo "Failed to create placeholder images. Check errors above."
    exit 1
fi

# Check if the database is set up
echo "Checking database..."
if [ ! -f ".env" ]; then
    echo "No .env file found. Create one with your DATABASE_URL configuration."
    echo "Example: DATABASE_URL=\"postgresql://user:password@localhost:5432/realty_db\""
    exit 1
fi

# Run migrations and seed data
echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database with initial data..."
npm run seed

echo "Seeding listings..."
npm run seed-listings

echo "Setup complete! You can now run the development server with 'npm run dev'"
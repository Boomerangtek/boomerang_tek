#!/bin/bash

# Setup script for Neon database
# Run this after you have a Neon account and API key

echo "🗄️  Setting up Neon database..."

# Install Neon CLI (if not installed)
if ! command -v neonctl &> /dev/null; then
    echo "📦 Installing Neon CLI..."
    npm install -g neonctl
fi

# Authenticate (you'll need to do this once)
echo "🔐 Please authenticate with Neon..."
echo "Run: neonctl auth"
echo "Then run this script again"

# Check if authenticated
if ! neonctl projects list &> /dev/null; then
    echo "❌ Not authenticated. Please run: neonctl auth"
    exit 1
fi

# Create project
echo "🚀 Creating Neon project..."
PROJECT_ID=$(neonctl projects create --name emissionbot --output json | jq -r '.id')

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Failed to create project"
    exit 1
fi

echo "✅ Project created: $PROJECT_ID"

# Get connection string
echo "🔗 Getting connection string..."
CONNECTION_STRING=$(neonctl connection-string --project-id $PROJECT_ID)

echo "✅ Database ready!"
echo ""
echo "📝 Your connection string:"
echo "$CONNECTION_STRING"
echo ""
echo "💾 Updating .env file..."

# Update .env file
cd backend
if [ -f .env ]; then
    # Update existing DATABASE_URL
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=$CONNECTION_STRING|" .env
else
    # Create new .env from example
    cp .env.example .env
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=$CONNECTION_STRING|" .env
fi

echo "✅ .env file updated!"
echo ""
echo "🎉 Setup complete! Run 'npm run migrate' to create tables."

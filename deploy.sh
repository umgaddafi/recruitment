#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "==================================="
echo "🚀 Starting Deployment Process..."
echo "==================================="

# 1. Build the frontend
echo ""
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# 2. Stage changes
echo ""
echo "📝 Staging changes for git..."
# Force add the frontend/dist folder in case it is ignored in any global gitignore
git add -f frontend/dist/
git add .

# 3. Commit changes
echo ""
echo "💾 Committing changes..."
# We use || true so the script doesn't fail if there's nothing to commit
git commit -m "updated code - $(date +'%Y-%m-%d %H:%M:%S')" || true

# 4. Push to GitHub
echo ""
echo "☁️  Pushing to GitHub..."
git push origin HEAD

echo ""
echo "✅ Deployment pushed to GitHub successfully!"


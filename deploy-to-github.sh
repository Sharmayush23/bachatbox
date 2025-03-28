#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Set repository name - CHANGE THIS TO YOUR ACTUAL REPO NAME
REPO_NAME="bachatbox"

# Build the app
echo "Building the application..."
npm run build

# Create necessary files for GitHub Pages
echo "Creating GitHub Pages files..."
touch dist/.nojekyll
cp public/404.html dist/404.html

# Navigate to the build folder
cd dist

# Initialize git
git init
git checkout -b gh-pages

# Add all files to git
git add -A

# Commit changes
git commit -m "Deploy to GitHub Pages"

# Add remote repository - CHANGE YOUR_USERNAME to your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git

# Force push to the gh-pages branch
git push -f origin gh-pages

# Go back to the project root
cd -

echo "🚀 Successfully deployed to GitHub Pages!"
echo "Visit https://YOUR_USERNAME.github.io/$REPO_NAME/ once GitHub Pages is enabled for your repository."
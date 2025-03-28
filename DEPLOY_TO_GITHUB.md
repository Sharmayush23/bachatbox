# Deploying BachatBox to GitHub Pages

This guide will walk you through the process of deploying your BachatBox Personal Finance Manager to GitHub Pages.

## Prerequisites

1. A GitHub account
2. Git installed on your computer
3. Your project pushed to a GitHub repository

## Option 1: Manual Deployment (First Time Setup)

1. **Clone your repository on your local machine** (if you haven't already):
   ```bash
   git clone https://github.com/bachatbox/bachatbox.git
   cd bachatbox
   ```

2. **Edit the `deploy-to-github.sh` script**:
   - Change `REPO_NAME="bachatbox"` to your actual repository name
   - Change `git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git` to use your GitHub username

3. **Make the script executable** (if not already):
   ```bash
   chmod +x deploy-to-github.sh
   ```

4. **Run the deployment script**:
   ```bash
   ./deploy-to-github.sh
   ```

5. **Enable GitHub Pages** in your repository settings:
   - Go to your repository on GitHub
   - Click on "Settings"
   - Scroll down to "GitHub Pages"
   - Select the "gh-pages" branch as the source
   - Click "Save"

6. Your app will be available at `https://YOUR_USERNAME.github.io/bachatbox/` (replace bachatbox with your repo name)

## Option 2: Automated Deployment with GitHub Actions

This project includes a GitHub Actions workflow file that will automatically deploy your app to GitHub Pages whenever you push to the main branch.

1. **Push your code to GitHub** (including the `.github/workflows/deploy.yml` file)

2. **Enable GitHub Pages** in your repository settings:
   - Go to your repository on GitHub
   - Click on "Settings"
   - Scroll down to "GitHub Pages"
   - Select the "gh-pages" branch as the source
   - Click "Save"

3. **Enable GitHub Actions**:
   - Go to your repository on GitHub
   - Click on "Actions"
   - Click on "I understand my workflows, go ahead and enable them"

4. Now, whenever you push to the main branch, your app will be automatically deployed to GitHub Pages.

## Configuration Changes for GitHub Pages

To ensure your application works correctly on GitHub Pages:

1. **Use relative paths** for all assets and API calls in your application.

2. **Handle routing properly** for a single-page application:
   - The project includes a `404.html` file with a script that handles GitHub Pages routing
   - This ensures that direct navigation to routes like `/dashboard` or `/wallet` works correctly

3. **Update your app to use hash-based routing** (optional):
   - In your main router component, consider using hash-based routing to avoid 404 errors on page refreshes
   - Example: `<Router base="/bachatbox" /> -> <Router base="/bachatbox/#" />`
   - Replace 'bachatbox' with your repository name

## Limitations and Considerations

1. **Backend Services**: GitHub Pages only hosts static content, so your backend services need to be hosted separately. Consider using:
   - Mock data directly in the frontend (current approach)
   - Serverless functions (AWS Lambda, Vercel Functions, Netlify Functions)
   - A separate backend hosting service

2. **Environment Variables**: Any environment variables need to be set during build time. Sensitive data should not be included in your public repository.

3. **Custom Domain**: You can use a custom domain with GitHub Pages. See GitHub's documentation for instructions.
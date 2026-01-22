# 🚀 GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages via GitHub Actions.

## 📍 Live URL

Once deployed, your application will be available at:
**<https://dafum.github.io/github-repository-vi/>**

## ⚙️ Configuration

The following changes have been made to enable GitHub Pages deployment:

### 1. Vite Base URL
- **File**: `vite.config.ts`
- **Change**: Sets `base: '/github-repository-vi/'` when `GITHUB_PAGES=true`
- **Purpose**: Ensures all asset paths (JS, CSS, images) work under the repo subdirectory

### 2. Build Script
- **File**: `package.json`
- **Script**: `npm run build:gh-pages`
- **Purpose**: Builds the app with the correct base URL for GitHub Pages

### 3. GitHub Actions Workflow
- **File**: `.github/workflows/deploy.yml`
- **Trigger**: Automatic deployment on push to `main` branch
- **Steps**:
  1. Checkout code
  2. Install dependencies
  3. Build with `npm run build:gh-pages`
  4. Deploy to GitHub Pages

### 4. Jekyll Bypass
- **File**: `public/.nojekyll`
- **Purpose**: Prevents GitHub Pages from ignoring files starting with `_`

## 🔧 One-Time Setup

Before the first deployment, you need to enable GitHub Pages in your repository settings:

1. Go to your repository: <https://github.com/DaFum/github-repository-vi>
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select:
   - Source: **GitHub Actions**
4. Save the settings

## 🚀 Deployment

### Automatic Deployment
Every push to the `main` branch will automatically trigger a deployment:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

The GitHub Actions workflow will:
1. Build the application
2. Upload the `dist` folder to GitHub Pages
3. Deploy to <https://dafum.github.io/github-repository-vi/>

### Manual Deployment
You can also trigger a deployment manually:

1. Go to **Actions** tab in your repository
2. Select the "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

## 🧪 Local Testing

To test the production build locally with the correct base URL:

```bash
# Build with GitHub Pages configuration
npm run build:gh-pages

# Preview the build
npm run preview
```

**Note**: The preview will run at `http://localhost:4173/github-repository-vi/`

## 📊 Monitoring Deployments

To check deployment status:

1. Go to **Actions** tab in your repository
2. View the latest "Deploy to GitHub Pages" workflow run
3. Check for any errors or warnings

## 🔍 Troubleshooting

### Assets not loading (404 errors)
- Ensure `vite.config.ts` has the correct `base` URL
- Verify the build script uses `GITHUB_PAGES=true`
- Check that GitHub Pages is enabled in repository settings

### Deployment fails
- Check the **Actions** tab for error logs
- Ensure repository has **Pages** write permissions
- Verify `npm ci` and `npm run build:gh-pages` work locally

### 404 on page refresh
- This is expected behavior for SPA routing
- Consider adding a custom 404.html that redirects to index.html if needed

## 🧬 Architecture Notes

This deployment configuration follows the HyperSmol philosophy:
- **Zero-Config**: Deployment happens automatically
- **Browser as OS**: The entire application runs client-side
- **Edge-First**: No server required, everything on GitHub's CDN

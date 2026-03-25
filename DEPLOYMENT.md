# Deployment Guide

This guide covers deploying the Multi-Model Reasoning App to various hosting platforms.

## GitHub Pages (Recommended)

GitHub Pages is the simplest option—free hosting directly from your repository.

### Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `multi-model-reasoning-app` (or your preferred name)
3. Clone it locally:
```bash
git clone https://github.com/yourusername/multi-model-reasoning-app.git
cd multi-model-reasoning-app
```

### Step 2: Add Project Files

Copy all files from this project into your cloned repository:

```bash
# Copy client, server, package.json, etc.
cp -r client server package.json pnpm-lock.yaml vite.config.ts tsconfig.json .
```

### Step 3: Build the Project

```bash
pnpm install
pnpm run build
```

This creates a `dist/` folder with the static site.

### Step 4: Configure GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: Select "Deploy from a branch"
   - Branch: Select `main` (or your default branch)
   - Folder: Select `/dist`
4. Click **Save**

### Step 5: Deploy

Push the `dist/` folder to GitHub:

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

GitHub will automatically deploy the `dist/` folder. Your site will be available at `https://yourusername.github.io/multi-model-reasoning-app/`.

### Automatic Deployment with GitHub Actions

To automate builds, create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        if: github.ref == 'refs/heads/main'
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist/public
```

Commit this file to your repository. GitHub will automatically build and deploy on every push to `main`.

## Netlify

Netlify offers free hosting with automatic deployments from GitHub.

### Step 1: Connect Repository

1. Go to https://netlify.com
2. Click **Add new site** → **Import an existing project**
3. Select **GitHub** and authorize
4. Choose your repository

### Step 2: Configure Build Settings

- **Build command**: `pnpm run build`
- **Publish directory**: `dist/public`
- **Node version**: `18.x` (set in environment variables if needed)

### Step 3: Deploy

Click **Deploy site**. Netlify will automatically build and deploy your site.

### Custom Domain

1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Follow DNS configuration instructions

## Vercel

Vercel is optimized for static sites and offers excellent performance.

### Step 1: Import Project

1. Go to https://vercel.com
2. Click **Add New** → **Project**
3. Select **Import Git Repository** and choose your GitHub repo

### Step 2: Configure

Vercel auto-detects the build settings. Verify:
- **Build Command**: `pnpm run build`
- **Output Directory**: `dist/public`
- **Install Command**: `pnpm install`

### Step 3: Deploy

Click **Deploy**. Your site will be live at `your-project.vercel.app`.

## Self-Hosted (Any Static Host)

You can host the static site anywhere that serves HTTP files.

### Step 1: Build Locally

```bash
pnpm install
pnpm run build
```

### Step 2: Upload `dist/public/` Folder

Upload the contents of `dist/public/` to your web server:

**Using FTP**:
```bash
ftp your-server.com
cd public_html
put -r dist/public/* .
```

**Using SSH/SCP**:
```bash
scp -r dist/public/* user@your-server.com:/var/www/html/
```

**Using AWS S3**:
```bash
aws s3 sync dist/public/ s3://your-bucket-name/
```

### Step 3: Configure Web Server

Ensure your web server serves `index.html` for all routes (single-page app):

**Nginx**:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache** (`.htaccess`):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Environment Variables

The app doesn't require any environment variables for deployment. API keys are entered by users at runtime and stored in browser localStorage.

## Performance Optimization

### Enable Gzip Compression

Most hosting services enable gzip by default. Verify it's enabled:

```bash
# Check if gzip is enabled (look for Content-Encoding: gzip)
curl -I -H "Accept-Encoding: gzip" https://your-site.com
```

### Cache Headers

Set long cache expiration for static assets:

**Netlify** (`netlify.toml`):
```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

**Vercel** (`vercel.json`):
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Troubleshooting

### "Cannot find module" errors during build

Ensure all dependencies are installed:
```bash
pnpm install
```

### Build succeeds but site shows blank page

Check browser console for errors. Common issues:
- Incorrect base path (if deploying to subdirectory)
- Missing assets or incorrect paths
- JavaScript errors in console

### Models won't load after deployment

Verify WebGPU is supported in your browser. Check that model CDN URLs are accessible.

### API key not working

Ensure OpenRouter API key is correct. Check that your account has credits.

## Monitoring

### GitHub Pages

GitHub Pages provides basic analytics. Check **Settings** → **Pages** for deployment status.

### Netlify

Netlify provides detailed analytics and performance metrics in the dashboard.

### Vercel

Vercel includes Web Vitals and performance analytics.

### Custom Monitoring

Add Google Analytics or similar service to `client/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

## Updates & Maintenance

To update the deployed site:

1. Make changes locally
2. Test with `pnpm run dev`
3. Build: `pnpm run build`
4. Commit and push to GitHub

Your hosting service will automatically rebuild and deploy.

## Rollback

If something goes wrong after deployment:

**GitHub Pages**: Revert the commit and push
```bash
git revert HEAD
git push origin main
```

**Netlify/Vercel**: Use the deployment history to rollback to a previous version from the dashboard.

## SSL/HTTPS

All major hosting services provide free SSL certificates:
- **GitHub Pages**: Automatic HTTPS
- **Netlify**: Automatic HTTPS
- **Vercel**: Automatic HTTPS
- **Self-hosted**: Use Let's Encrypt (free)

## Custom Domain

All hosting services support custom domains. Configure DNS records to point to your hosting provider's servers.

---

**Questions?** Check the main README.md or open a GitHub issue.

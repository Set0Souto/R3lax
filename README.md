# Personal Project WebApp

This is a static webapp. The repository is set up to deploy to GitHub Pages automatically via GitHub Actions when you push to the `main` branch.

Quick steps to publish:

1. Create a repository on GitHub (or use `gh repo create`).
2. From this project folder run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
git push -u origin main
```

After the push the workflow `.github/workflows/deploy.yml` will run and publish the repository root to the `gh-pages` branch. Your site will be available at `https://<YOUR_USERNAME>.github.io/<YOUR_REPO>` within a few minutes.

If you prefer serving from `main` or the `/docs` folder, change the action's `publish_dir` or GitHub Pages settings in the repository Settings → Pages.

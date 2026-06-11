This repository is ready for GitHub Pages deployment via GitHub Actions.

### Deployment checklist

1. Confirm the repository remote is `https://github.com/AdvayBagaria/old_cassette_.git`
2. Confirm the current branch is `main`
3. Confirm `.github/workflows/deploy.yml` exists
4. Confirm `.nojekyll` exists at the repository root
5. Confirm `index.html` is present in the repository root
6. Open GitHub repository **Settings → Pages**
7. Set **Build and deployment** to **GitHub Actions**
8. Push a commit to `main`
9. Verify the workflow run passes and deployment succeeds
10. Visit `https://advaybagaria.github.io/old_cassette_/`

### Notes

- The workflow uses the repository root as the Pages artifact path.
- No build step is required because the site is plain HTML/CSS/JS.
- `.nojekyll` prevents GitHub Pages from ignoring files or directories starting with `_`.

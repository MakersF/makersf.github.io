# Francesco Zoffoli's website

Personal site at <https://www.francescozoffoli.com>, hosted on GitHub Pages.
Migrated from the legacy al-folio fork to the [al-folio v1.2 starter contract](https://github.com/alshedivat/al-folio/releases/tag/v1.2).
The theme runtime comes from versioned Ruby gems rather than copied layouts and scripts.

## Local development

Use Ruby 3.3, Bundler 4.0.6, Node 22, and ImageMagick (on Windows, use WSL).

```sh
gem install bundler -v 4.0.6
bundle config set --local path vendor/bundle
bundle install
npm ci
bundle exec jekyll serve
```

Open <http://localhost:4000>. Personal content lives in `_pages/about.md`, social links in
`_data/socials.yml`, and the résumé in `assets/pdf/francesco_zoffoli-CV.pdf`.
Keep `CNAME` and the `_config.yml` URL aligned with the custom domain.

## Validate and publish

```sh
bundle exec al-folio upgrade audit
bundle exec al-folio upgrade overrides audit
JEKYLL_ENV=production bundle exec jekyll build --trace
npx playwright install --with-deps chromium
npm test
```

Stop any server on port 4000 before running the browser tests. Tests serve `_site` themselves,
check desktop/mobile behavior, and save light/dark screenshots under `test-results/`.

GitHub Actions runs these checks on pull requests and `upgrade/**` branches. Only successful
builds on `main` or `master` publish to `gh-pages`. Keep GitHub Pages configured to serve
the root of `gh-pages`. The workflow also supports manual runs.

See [upgrade and maintenance notes](docs/UPGRADING.md) for future theme updates and migration details.

# Theme maintenance

## Migration baseline

This site follows al-folio **v1.2**, with `al_folio_core 1.0.15` and the plugin versions
specified by that release. `Gemfile.lock` and `package-lock.json` are tracked for reproducible builds.
The `upstream` Git remote still points to `https://github.com/alshedivat/al-folio.git`.

The migration preserves the biography, publication/talk records, personal images, PDF résumé,
social accounts, blog URL, and `www.francescozoffoli.com` domain. Publications now render as
content in the about page, so they need no local theme override. Talk video links use `video_link`.
The empty blog remains available at `/blog/`; upstream example posts and profiles are not imported.
The unused Einstein demo image `prof_pic.jpg` was removed: it shared a filename stem with the
personal `prof_pic.png`, causing both to generate the same WebP filenames. Personal images remain unchanged.

The old `_layouts`, `_includes`, `_sass`, `assets/css/main.scss`, and theme JavaScript were
removed because the v1 theme/plugin gems provide them. The homepage uses the current theme's
typography and responsive layout; publications use headings instead of the old table.
There are no intentional local runtime overrides. Bootstrap compatibility is disabled.
The optional `jekyll-terser` plugin is omitted: it derives output paths from gem source paths,
placing theme JavaScript under `vendor/` instead of `assets/js/`. Shipping the theme's original
scripts preserves working dark mode and mobile navigation. The unused notebook integration
and demo books archive are also omitted.

The legacy deploy script no longer rewrites the working tree. GitHub Actions builds `_site`,
checks it, and publishes using `JamesIves/github-pages-deploy-action`. Migration branches and
pull requests never publish. The separate legacy-workflow fix is commit `5f865865` and can
be cherry-picked independently if needed before adopting the migration.

## Routine updates

Dependabot is configured for monthly GitHub Actions, Bundler, and npm update PRs once the
configuration is on GitHub's default branch. It groups `al_*` gems for review; it does not auto-merge.
Review al-folio release notes alongside these PRs because configuration changes can accompany gem updates.

1. Create an update branch. Read the [upstream release notes](https://github.com/alshedivat/al-folio/releases)
   and [migration guide](https://github.com/alshedivat/al-folio/blob/main/docs/INSTALL.md#upgrading-from-a-previous-version).
2. Update the exact `al_*` pins in `Gemfile` to the chosen release. Apply that release's configuration changes
   in `_config.yml`; adding/removing a plugin requires updating both files.
3. Run `bundle update`, then the checks below. Commit both dependency manifests and lockfiles.

```sh
bundle exec al-folio upgrade audit
bundle exec al-folio upgrade overrides audit
bundle exec al-folio upgrade report
JEKYLL_ENV=production bundle exec jekyll build --trace
npm ci
npm test
```

4. Review the generated home, blog, résumé link, mobile navigation, and light/dark appearance.
5. Merge only after the workflow and review pass. The merge into the publishing branch triggers deployment.

Do not blindly merge upstream's demo content or copy its configuration over personal settings.
`git fetch upstream --tags` is useful for comparing starter changes; routine theme updates are managed
through gems. Keep the custom domain and empty `baseurl` when comparing against upstream's `/al-folio` demo.

If a future customization needs a local layout/include override, follow upstream's
`al-folio upgrade overrides diff` and `overrides accept` workflow and commit `.al-folio-overrides.yml`.
That lets subsequent upgrades flag a changed gem file hidden by the local override.

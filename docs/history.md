# Profile history artwork

The README uses light/dark SVG assets rendered from GitHub contribution data. Existing Komarev profile views remain an embedded counter; no traffic count is synthesized by the renderer.

`npm ci --ignore-scripts` and `npm run check` check strict TypeScript and six date/data/render regressions. `npm run update:history` uses the authenticated GitHub CLI to fetch current data and regenerate both themes. Credentials are never placed in artwork or command arguments.

The workflow runs daily at 03:23 UTC and can be dispatched manually. Only the trusted default branch may update committed assets. Check jobs on pull requests have read-only permissions. A failed API request or incomplete all-time history leaves the previous assets unchanged; every panel prints its update date.

The contribution total is GitHub's reported aggregate. Calendar squares and weekly activity use daily contribution counts, which GitHub may report with a slightly different aggregate. Active days count nonzero recent squares. The recent window comes from GitHub's default contribution collection. Current and longest streaks use complete yearly collections from account creation through today, deduplicated by date. UTC day boundaries apply; an unfinished today does not break an otherwise active streak ending yesterday. Missing dates never bridge runs. All-time coverage is the history exposed by GitHub for the workflow credential, not a promise of access to private contributions.

Artwork has no scripts, external images, foreignObject or remote fonts. It uses the existing onur.af monochrome design: Helvetica-family type, 12px outer corners, quiet borders, white/black theme surfaces and grayscale density. No contribution colors or external chart services are embedded.

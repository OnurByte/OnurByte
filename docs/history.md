# Profile history artwork

The README uses light/dark SVG assets rendered from GitHub contribution data. The existing Komarev profile view count is parsed from its standard SVG and rendered as a native metric inside both cards. Its official pixel mode keeps the same counter active in the README without an external visible badge.

`npm ci --ignore-scripts` and `npm run check` check strict TypeScript and nine date/data/render/counter regressions. `npm run update:history` uses the authenticated GitHub CLI to fetch current data and regenerate both themes. Credentials are never placed in artwork or command arguments.

The workflow runs daily at 03:23 UTC and can be dispatched manually. Only the trusted default branch may update committed assets. Check jobs on pull requests have read-only permissions. A failed API request or incomplete all-time history leaves the previous assets unchanged; every panel prints its update date.

The contribution total is GitHub's reported aggregate. Calendar squares and weekly activity use daily contribution counts, which GitHub may report with a slightly different aggregate. Active days count nonzero recent squares. The recent window comes from GitHub's default contribution collection. Current and longest streaks use complete yearly collections from account creation through today, deduplicated by date. UTC day boundaries apply; an unfinished today does not break an otherwise active streak ending yesterday. Missing dates never bridge runs. All-time coverage is the history exposed by GitHub for the workflow credential, not a promise of access to private contributions.

Artwork has no scripts, external images, foreignObject or remote fonts. It uses the existing onur.af monochrome design: Helvetica-family type, 12px outer corners, quiet borders, white/black theme surfaces and grayscale density. No contribution colors or external chart services are embedded.

The account creation date is the header’s main typographic anchor, distinct from the recent chart window. The view count is labelled “daily snapshot” and refreshed along with the contribution artwork. It represents provider-recorded page hits, not unique visitors; GitHub image caching and the updater’s own request can affect the count. Counter failures retain the previous dated artwork, never an invented zero. The header motto follows onur.af’s existing “I am. I think. I will.” wording.

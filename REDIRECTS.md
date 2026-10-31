# Redirects – smallspacecompass.com (rebuild October 2026)

## Old URLs on the main domain (implemented as noindex meta-refresh pages with canonical in `docs/`)

| Old URL | New URL |
|---|---|
| /entryway-reset.html | /guides/entryway-storage-without-a-closet/ |
| /vertical-storage.html | /guides/vertical-storage-by-reach/ |
| /compact-work-corner.html | /guides/desk-in-a-studio/ |
| /room-layout-paper.html | /tools/clearance-planner/ |
| /about.html | /about/ |
| /imprint.html | /imprint/ |
| /privacy.html | /privacy/ |
| /advertise.html | /contact/ |

## Former subdomains (to be handled by DNS/hosting – NOT done in this repo)

Function is integrated into the main domain. Recommended: 301 redirect of every path to the target below, then remove the old projects.

| Old URL | Function now in | New URL |
|---|---|---|
| https://rooms.smallspacecompass.com/ (Room Fit Lab) | Clearance Planner (incl. A/B comparison) | https://smallspacecompass.com/tools/clearance-planner/ |
| https://rooms.smallspacecompass.com/measure-before-moving.html | Measuring guide | https://smallspacecompass.com/guides/how-to-measure-a-room-for-furniture/ |
| https://rooms.smallspacecompass.com/compare-two-layouts.html | Planner „Compare two versions“ | https://smallspacecompass.com/tools/clearance-planner/ |
| https://rooms.smallspacecompass.com/{imprint,privacy,advertise}.html | | /imprint/, /privacy/, /contact/ |
| https://atlas.smallspacecompass.com/ (Storage Atlas) | Storage Wall Audit | https://smallspacecompass.com/tools/storage-wall/ |
| https://shelves.smallspacecompass.com/ (Shelf Measure) | Storage Wall Audit → „Equal compartments“ | https://smallspacecompass.com/tools/storage-wall/ |
| atlas./shelves. {imprint,privacy,advertise}.html | | /imprint/, /privacy/, /contact/ |

Note: the atlas/shelves sitemaps still point to `*.chatgpt.site` hosts; those should be taken down or redirected as well.

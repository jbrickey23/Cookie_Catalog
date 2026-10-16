# First-release layout refinement — October 16, 2026

## Full-height and thumbnail refinement

October 16 owner screenshot: extend right-side scroll to the bottom of the focused card. Desktop panes now align to the full focused-card height; an out-of-flow results grid keeps the record count from inflating that height. Both focus and scroll image areas use a shared 200 × 200-pixel display box with responsive width clamp and contain fitting. Read-only open/download actions and dirty switching remain. This is display-only; originals and the deferred image-standards backlog are unchanged.

## Latest requested layout

October 16: owner requested two columns of thumbnail cards in the smaller right scrolling pane, with only image, name and location. This supersedes the earlier single-column compact rows below. Card clicks retain existing dirty/busy confirmation, result scroll and keyboard View behavior; full record details stay in the focused editor. Read-only image pop-outs and original download links are available from the focused card.

## Earlier compact-row acceptance

Owner requested smaller remaining-record cards in the focused screen and more than three visible in the right pane. Expanded-workspace results now use compact rows with five-rem thumbnails, smaller headings and tighter spacing. Name, BIN, quantity and View remain visible; reference-size, repeated image-kind/status notes and measurements remain available in the full focused details instead of taking space in every nearby result. The normal unfocused browse layout is unchanged.

This follows the focused heading/caption wrapping, narrow-screen input/touch-target, Save/Cancel wrapping and backup-action spacing refinement. CSS only; no data/API/schema/recovery/permission or schedule change. Build/type-check passed. Both current-head CI runs and Workers Build passed for `4ca1b1d`. Authenticated live source/health matched that SHA. Cloud desktop visual acceptance showed four full nearby cards plus part of a fifth, with focused images still above editable fields. This supersedes the earlier pending-publication note. Actual owner Windows Chrome/Edge and iPhone Safari remain distinct acceptance targets; cloud desktop evidence cannot close them. Production remains separately unapproved.

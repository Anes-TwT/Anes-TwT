# Vendored webfonts

Big Shoulders Display, Archivo and Chivo Mono, all under the SIL Open Font
License 1.1, pulled from Google Fonts and served from here instead of from
fonts.googleapis.com.

Self-hosting means the display face is guaranteed to render — a blocked or slow
font host used to leave the whole site in Helvetica — and no visitor request
goes to a third party.

`scripts/inline-preview.mjs` embeds these as data URIs in the single-file
preview, so that build needs no network at all.

To refresh: request the css2 URL in `fonts.css` with a browser user-agent,
download the woff2 files it names, and rewrite the src urls to local filenames.

# Synthetic samples

All fixtures in this directory are invented for testing and may be committed to the public repository. Do not add purchased STL/3MF, photos, client designs, credentials or actual catalog exports. `synthetic_catalog.json` is not a production database or source of truth.

Use `python samples/import_synthetic.py` from repository root to build an isolated, disposable in-memory SQLite catalog and exercise the first two migrations. The script does not connect to Cloudflare or write user data.

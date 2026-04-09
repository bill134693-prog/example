# Release Notes

## v1.0.0 (2026-04-09)

### Highlights

- Restored the project into a runnable state (backend + frontend).
- Repaired broken scripts and startup flow:
  - `start.py`
  - `run_system.py`
  - `install_frontend.py`
  - `install.bat`
- Reworked backend core modules and API routes:
  - models
  - classification engine
  - complaint/department/classification/duplicate routes
- Reworked frontend pages/components with a stable flow:
  - complaint submission
  - dashboard listing
  - complaint detail actions
  - duplicate alert rendering
- Fixed `frontend/package.json` and validated production build.
- Added `.gitignore` and repository baseline for GitHub push.

### Verification

- Frontend production build succeeded:
  - `npm --prefix frontend run build`

### Known Limitations

- Classification is currently keyword/rule-based and intended as a baseline.
- SQLite is used as the default DB for local/dev usage.

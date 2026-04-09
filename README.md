# Complaint Classification System

Flask (backend) + React (frontend) based complaint intake and routing system.

## Features

- Complaint submission API and UI
- Automatic department/sub-department recommendation
- Duplicate complaint detection for the same citizen
- Dashboard for status tracking and complaint handling

## Tech Stack

- Backend: Flask, Flask-SQLAlchemy, scikit-learn
- Frontend: React, axios, react-router-dom
- Database: SQLite (default)

## Quick Start

Run from project root:

```bash
python start.py
```

After startup:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## Manual Run

### Backend

```bash
cd backend
pip install -r requirements.txt
python run.py
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## API Overview

- `POST /api/complaints/` create complaint
- `GET /api/complaints/` list complaints
- `GET /api/complaints/<id>` complaint detail
- `PUT /api/complaints/<id>/answer` answer complaint
- `PUT /api/complaints/<id>/close` close complaint
- `PUT /api/complaints/<id>/withdraw` withdraw complaint
- `PUT /api/complaints/<id>/transfer` transfer complaint
- `POST /api/classification/analyze` classify complaint
- `POST /api/duplicates/check` check duplicate complaint
- `GET /api/departments/` list departments

## Notes

- Sample department data can be initialized with:
  - `POST /api/departments/init-sample-data`
- Default local DB path: `backend/complaint.db`

## Release Docs

- Release summary: [`RELEASE_NOTES.md`](./RELEASE_NOTES.md)
- Release template: [`.github/release-template.md`](./.github/release-template.md)

# Notification System Design

## Overview

This repository contains a lightweight notification application split into three parts:
- `logging_middleware` - shared logging helper and priority inbox script.
- `notification_app_be` - backend scaffold for API routing and logging.
- `notification_app_fe` - frontend React/Next.js client that displays notifications and a priority inbox.

## Architecture

1. `logging_middleware`
   - Provides a simple logger that prints structured timestamps and log levels.
   - Used for backend request logging, API fetch errors, and priority computation.

2. `notification_app_be`
   - Serves as the backend API layer.
   - Provides a proxy endpoint to fetch protected notifications from the upstream evaluation API.
   - Uses logging middleware to record request start, success, and error events.

3. `notification_app_fe`
   - User-facing frontend built with Next.js and Material UI.
   - Displays all notifications, filters by type, and distinguishes viewed vs new notifications.
   - Includes a priority inbox page that sorts notifications by weighted importance and recency.

## Priority Inbox Logic

Priority is computed as:
- Placement > Result > Event
- More recent notifications rank higher within the same type

Scoring example:
- Placement has weight 3
- Result has weight 2
- Event has weight 1
- Score = weight * 1e12 + timestamp

This ensures type weight dominates while recency resolves ties.

## API Flow

- Frontend fetches notifications from the backend.
- Backend retrieves notifications from the evaluation service, using authorization headers when required.
- The frontend sorts and displays the top `n` notifications.

## Notes

- The repository structure is aligned to the frontend track submission requirements.
- All references to company names or personal names are excluded from the repository name, README files, and commit messages.

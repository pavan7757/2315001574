# Logging Middleware

This folder contains a simple Node.js logger and the Stage 1 priority notifications implementation.

## Usage

1. Open a terminal in `logging_middleware`
2. Run `npm install` if needed
3. Run `node priority_notifications.js`

The script fetches notifications from the evaluation API and prints the top 10 priority notifications.

## Authorization

If the API is protected, use one of the following:

```bash
AUTH_TOKEN=your_token node priority_notifications.js
```

```bash
node priority_notifications.js --token=your_token
```

# Campus Notifications Frontend

This folder contains a small Next.js application that displays notifications and a priority inbox.

## Run locally

1. Open a terminal in `notification_app_fe`
2. Run `npm install`
3. Run `npm run dev`
4. Open `http://localhost:3000`

## Pages

- `/` - All notifications with type filtering and viewed/unviewed marking.
- `/priority` - Top priority notifications with `top n` selection and type filter.

## Notes

- Uses Material UI for styling.
- Keeps viewed notification ids in browser `localStorage`.
- Uses the provided notifications API and query parameters.
- Supports protected API access with `NEXT_PUBLIC_AUTH_TOKEN` in `.env.local`.

## Protected API

If the API route is protected, create a `.env.local` file in this folder with:

```text
NEXT_PUBLIC_AUTH_TOKEN=your_token
```

Then restart `npm run dev`.

# Chetranj ♟️☕

Chetranj is a multiplayer chess game inspired by an old Tunisian café: chess over coffee, familiar voices, and music in the background.

The current version has room-based play, automatic color assignment, live move syncing, warm wood-inspired styling, and an in-app music player. The broader café atmosphere is something I plan to keep building out.

**Play:** [genuine-pastelito-4babe7.netlify.app](https://genuine-pastelito-4babe7.netlify.app)

## Play with a friend

1. Create a room and choose White or Black.
2. Copy the room link and send it to your friend.
3. Your friend opens the same link and gets the other color.

## Built with

React, TypeScript, Vite, React Router, chess.js, react-chessboard, Supabase, and Tailwind CSS.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` using your Supabase project URL and publishable key.
4. Follow [DEPLOY.md](DEPLOY.md) to configure Supabase Realtime.
5. Start the development server with `npm run dev`.

Use a Supabase publishable key for the browser app. Do not put a Supabase secret or service-role key in a `VITE_` variable.

Build and preview locally with `npm run build` and `npm run preview`.

---

© reserved to MAT

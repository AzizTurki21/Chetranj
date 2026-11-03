# Chetranj ♟️

A small browser chess project built around creating a game room or joining one with a room ID. The app includes a live demo and uses Supabase for shared room state.

**Play:** [chetranj.vercel.app](https://chetranj.vercel.app)

## What it does

- Create a room and choose a side
- Join an existing room with its ID
- Play on an interactive chessboard
- Keep the room state in sync through Supabase Realtime

## Built with

React, TypeScript, Vite, React Router, chess.js, react-chessboard, Supabase, and Tailwind CSS.

## Run locally

1. Install the project dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project.
4. Follow [DEPLOY.md](DEPLOY.md) to create the database tables and enable Realtime.
5. Start the development server with `npm run dev`.

The available production build and local preview scripts are `npm run build` and `npm run preview`.

This is a personal project. The hosted demo and multiplayer flow depend on the Supabase project configuration.

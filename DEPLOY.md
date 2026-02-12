# 🚀 Deploying Chetranj ♟️🇹🇳

## Quick Deploy Options

### Option 1: Vercel (Recommended - Free & Fast)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from your project folder
vercel
```

Or just drag your project folder to [vercel.com/drop](https://vercel.com/drop)

---

### Option 2: Netlify (Free & Easy)

1. Go to [netlify.com](https://www.netlify.com)
2. Drag and drop your `dist` folder after running `npm run build`
3. Done! 🎉

---

### Option 3: GitHub Pages

```bash
# Add to package.json homepage
"homepage": "https://yourusername.github.io/chetranj"

# Deploy
npm run build
npm run deploy
```

---

## Setting Up Supabase (Required for Multiplayer)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name it "chetranj"
4. Copy your `Project URL` and `anon public` key

### 2. Create Database Tables
Go to **SQL Editor** in Supabase and run:

```sql
-- Rooms table
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'waiting',
  player_white TEXT,
  player_black TEXT,
  game_state TEXT,
  moves TEXT DEFAULT '[]'
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

-- Create a simple public table for signaling (if needed)
CREATE TABLE room_signaling (
  room_id TEXT PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message JSONB
);
ALTER PUBLICATION supabase_realtime ADD TABLE room_signaling;
```

### 3. Add Environment Variables

Create `.env.local` file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Playing with Friends

### After Deployment:

1. **Create a Game:**
   - Open the deployed site
   - Click "Create Game"
   - Copy the unique URL (e.g., `https://your-site.com/room/abc123`)

2. **Send to Friend:**
   - Send the URL to your friend
   - When they open it, they'll automatically join your room

3. **Play:**
   - First player picks White/Black
   - Second player gets the remaining color
   - Game starts! 🎲

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  Your Deploy                     │
│         (Vercel/Netlify/Firebase)               │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              Supabase Realtime                  │
│         (Room sync, moves, chat)                │
└─────────────────────────────────────────────────┘
```

---

## Troubleshooting

### "Failed to connect to room"
- Check Supabase credentials in `.env`
- Make sure database tables are created
- Check Supabase project is active (not paused)

### "Moves not syncing"
- Make sure Realtime is enabled on the tables
- Check browser console for errors

### "Music not playing"
- Browser autoplay policies require user interaction first
- Music starts after you click "Create Game" or "Join Game"

# Stockline client: setup

1. Copy these into your existing `client` folder, replacing what is there:
   - the whole `src` folder (delete your old `src` first)
   - `index.html`
   - `vite.config.ts`
   - `public/favicon.svg`

2. Install the extra packages (run inside `client`):

   npm install react-router-dom @reduxjs/toolkit react-redux react-hook-form zod @hookform/resolvers lucide-react

3. Update the server so `GET /api/auth/me` also returns the user's name, email, role name and
   business name (the dashboard and menu need them). See the message in the chat.

4. Start both:
   - server:  npm run dev      (port 5000)
   - client:  npm run dev      (port 5173)

Open http://localhost:5173

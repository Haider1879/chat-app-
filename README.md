# Ring Chat — localhost setup

React + TypeScript frontend wired to the supplied Express/MongoDB/Socket.IO backend. The supplied backend is included unchanged (apart from `.env.example`) for a complete local project.

## Requirements

Node.js 18+, npm, MongoDB running locally (or a MongoDB Atlas connection). Images, audio and avatars are stored under `Backend/uploads/` locally. Password reset emails require SMTP credentials.

## Start

1. In `Backend`, copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET` (and optional email credentials). Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` to enable email.
2. Run `npm install` and `npm run dev` inside `Backend`. It must report that it is running on `http://localhost:5000`.
3. In another terminal, run `npm install` and `npm run dev` inside `Frontend`.
4. Open `http://localhost:5173` in a browser. Register two accounts, then use two browser windows to test live messages.

The frontend defaults to `http://localhost:5000`; set `VITE_API_URL` in `Frontend/.env` if the backend uses another address. The backend allows the frontend's default port 5173 through CORS. Vite may choose another port if 5173 is occupied; free that port before testing.

## Frontend structure

```text
Frontend/
├── public/                 # Static assets
├── src/
│   ├── api/                # Typed HTTP client
│   ├── components/         # Chat, sidebar, modals, shared UI
│   ├── context/            # Chat provider
│   ├── hooks/              # Chat state, socket events and actions
│   ├── lib/                # Formatting helpers
│   ├── pages/              # Auth and chat pages
│   ├── types/              # Shared data types
│   ├── App.tsx             # App root
│   ├── index.css           # Styles
│   └── main.tsx            # Entry point
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Features

Registration, login, forgotten/reset password screens, account profile/avatar, people search, direct conversations, group creation, requests list, text messages, replies, images/audio uploads, history pagination, message deletion, typing status, presence and read-status display. REST writes persist messages; Socket.IO delivers real-time events with the login JWT.

## Backend limitations inherited from the supplied code

- The socket server stores only one socket ID per user. Opening multiple tabs for the same account can make presence and delivery inconsistent.
- The backend's `send_message` socket handler does not validate group/conversation membership before storing a message. This frontend sends messages through the authenticated REST endpoints, which validate membership and still emit `receive_message` to connected recipients.
- Running the backend requires a reachable MongoDB and valid configuration; these services are not bundled in the zip.

## Local media storage

Uploads are saved in `Backend/uploads/`, which is ignored by git and excluded from the zip. Keep this folder when moving the app if you want to keep existing attachments. No Cloudinary credentials are needed for local use. Existing Cloudinary URLs still display if present in the database.

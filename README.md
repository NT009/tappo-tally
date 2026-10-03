# Tappo Tally

Tappo Tally is a habit and task tracker application built with modern web technologies. It allows users to create custom tally trackers (with customized colors and increment rates), log their daily counts with satisfying tap interactions, and visualize their progress over time using a History Matrix.

## Features

- **Custom Trackers:** Create, edit, and delete tally trackers. Pick custom colors and step increments.
- **Rapid Logging:** Tap directly on your dashboard tallies to increment them seamlessly. Background syncing ensures your data is saved without interrupting your flow.
- **History Matrix:** View a monthly grid of all your trackers to see your daily progress visually. Drag-to-scroll support on desktop.
- **Progressive Web App (PWA):** Installable on mobile devices with manifest and service worker support (powered by Serwist).
- **Authentication:** Secure sign-up, login, and session management using Better Auth.
- **Timezone Support:** Save and sync your local timezone to ensure accurate day roll-overs for your habits.

## Tech Stack

This project is built using the following technologies:

- **Framework:** [Next.js](https://nextjs.org) 16 (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com), Space Grotesk font
- **Icons:** [Lucide React](https://lucide.dev)
- **Database:** [MongoDB](https://www.mongodb.com) (via [Mongoose](https://mongoosejs.com))
- **Authentication:** [Better Auth](https://better-auth.com/) (with `@better-auth/mongo-adapter`)
- **PWA Integration:** [@serwist/next](https://serwist.build)
- **UI & Toast:** [Shadcn UI](https://ui.shadcn.com) patterns, [Sonner](https://sonner.emilkowal.ski) for toast notifications
- **Date Management:** [Day.js](https://day.js.org)

## Environment Variables

To run the project locally, you need to configure your environment variables. A template is provided in the repository.

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Fill in the values in your `.env` file:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `BETTER_AUTH_SECRET`: A random secure string for encrypting sessions.
   - `BETTER_AUTH_URL`: The base URL of your application (e.g., `http://localhost:3000`).
   - `NEXT_PUBLIC_BETTER_AUTH_URL`: Same as above, accessible by the client.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

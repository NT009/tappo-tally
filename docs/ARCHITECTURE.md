# App Architecture Blueprint: Tappo Tally

## 1. App Vision
- **Description:** A frictionless tally-tracking application designed to minimize the obstacle of logging habits (e.g., nail-biting, glasses of water). Users can create custom tallies that appear as interactive boxes on their dashboard, which increment with a single tap. 
- **Target Audience:** General users wanting to track daily habits effortlessly.
- **Primary Goal:** Provide a seamless, one-tap mechanism to count how many times an event occurs in a day, automatically resetting at the start of a new day.

## 2. Tech Stack
- **Framework:** Next.js (App Router) v16
- **Language:** TypeScript (Strict mode)
- **Database:** MongoDB (using Mongoose)
- **Authentication:** Better-Auth (Email/Password)
- **Styling:** Tailwind CSS v4 (using the defined brand palette in `globals.css`)
- **State Management:** Zustand / React Local State
- **Icons/UI Libraries:** Lucide-React, Sonner (Toasts), shadcn/ui

## 3. Data Schema (Mongoose)

*Note: MongoDB automatically generates a unique `_id` (ObjectId) for every document across all collections.*

### **Collection 1: `User`** (Managed by Better Auth)
- **Custom Fields Added:**
  - `timezone`: String (IANA timezone, e.g. `Asia/Kolkata`. Required to calculate "today" correctly for the user).

### **Collection 2: `Tallies`**
Stores the metadata for the counters the user creates.
- `userId`: String (Foreign key to `User`. Required)
- `name`: String (Required, max 50 chars)
- `color`: String (Hex color string. Required)
- `incrementRate`: Number (Default: 1)
- `createdAt`: Date (Default: `Date.now`)
- `updatedAt`: Date (Default: `Date.now`)

**Indexes:**
- Index on `userId` to quickly fetch all tallies for a specific user.

### **Collection 3: `TallyEntries`**
Stores the actual count data per tally, per day.
- `userId`: String (Foreign key to `User`. Required for global data isolation queries).
- `tallyId`: ObjectId (Foreign key to `Tallies`. Required)
- `date`: String (Format: `YYYY-MM-DD`, based on user's timezone. Required)
- `count`: Number (Default: 0)
- `createdAt`: Date (Default: `Date.now`)
- `updatedAt`: Date (Default: `Date.now`)

**Indexes:**
- **Unique compound index** on `{ tallyId: 1, date: 1 }` to ensure only one entry exists per tally per day.

---

## 4. Routes & User Flow

> **🚨 GLOBAL API REQUIREMENT:** 
> **STRICT USER ISOLATION:** Every single database query across *all* API routes must filter by the current authenticated `userId`. Under no circumstances should User A be able to read, update, or delete User B's data.

### **Authentication (`/login` & `/signup`)**
- **Type:** Public routes.
- **Functionality:** Standard Email/Password forms. 
- **Timezone Capture:** During sign-up, the frontend detects the user's IANA timezone and passes it to Better-Auth's `signUp` via `additionalFields`. For log-in, because `signIn` doesn't natively update fields, the frontend must make a separate background call to `PUT /api/user/timezone` immediately after a successful login to ensure the timezone is up-to-date if the user traveled.
- **Redirects to:** `/` (Dashboard) on success.

### **Dashboard (`/`)**
- **Type:** Protected route.
- **Layout:** A persistent Sidebar with navigation to: `Dashboard`, `Tallies`, `Tally Entries`, and `Profile`.
- **Functionality:** 
  - Displays the user's created `Tallies` as large, tappable colored boxes.
  - **Data Fetched:** Calls the `/api/tallies?countToday=true` endpoint to efficiently load the user's `Tallies` along with today's current count in a single request.
  - **Action:** Clicking a tally box calls the `/api/tally-entries` Upsert endpoint to increment the count by the tally's `incrementRate`.

### **Tallies Management (`/tallies`)**
- **Type:** Protected route.
- **Functionality:** Full CRUD interface for `Tallies`.
  - Displays a data table showing tally details (Name, Color, Increment Rate, Created At).
  - **Create:** A button opens a modal to define a new tally (Name, Color Picker, Increment Rate). Calls `POST /api/tallies`.
  - **Edit:** Action button in the table row to update existing tally properties. Calls `PUT /api/tallies`.
  - **Delete:** Action button to remove a tally, protected by a confirmation modal. Calls `DELETE /api/tallies`.

### **Tallies API (`/api/tallies` & `/api/tallies/[id]`)**
- **Type:** Protected API Routes.
- **Functionality:** 
  - **Create, Update, Delete:** Basic endpoints for `Tallies` CRUD.
  - **Read All (GET):** Fetches tallies with basic filters and pagination. 
    - *Special Feature:* If the `countToday=true` query parameter is active, the API must calculate "today's date" using the user's saved IANA timezone, fetch the corresponding `TallyEntries` for today, and append today's `count` directly into each returned tally object.
  - **Read One (GET):** Fetches a single `Tally` document by its unique MongoDB `ObjectId`.

### **Tally Entries History (`/tally-entries`)**
- **Type:** Protected route (Read-Only).
- **Functionality:** A matrix/heatmap table to visualize habit history over a month.
  - **Rows:** Represent the user's `Tallies` (paginated, ordered by last updated).
  - **Columns:** Represent the days of the month (Day 1 to 30/31). The last column represents the current day.
  - **Filters:** A month selector defaulting to the current month. Changing the month updates the column headers and fetches historical data via `/api/tally-entries`.

### **Tally Entries API (`/api/tally-entries`)**
- **Type:** Protected API Routes.
- **Functionality:** 
  - **Upsert (POST/PUT):** Receives the `tallyId` and increment amount. Gets the user's IANA timezone to determine the exact local date. Finds the document for that date and `tallyId`; if found, increments the count. If not, creates a new entry. **Crucially**, it must also update the `updatedAt` timestamp of the parent `Tally` so that recently updated tallies sort to the top.
  - **Read All (GET):** Fetches the data for a specific month (based on user timezone), grouped by `tallyId`, returning the date and count for each group.

### **Profile (`/profile`)**
- **Type:** Protected route.
- **Functionality:** Displays user settings, email, and a manual button to "Update Timezone" (fetches current browser timezone and saves it). Contains the Logout button.

---

## 5. UI & Theming (Design System)
- **Mode:** Light Mode exclusively.
- **Colors:** STRICT adherence to the variables defined in `globals.css`:
  - `bg-background` (Warm Ivory)
  - `text-charcoal` (Headings & Body)
  - `bg-forest` (Primary actions/active states)
  - `border-sage` (Cards and subtle highlights)
  - `text-terracotta` / `bg-terracotta` (Destructive actions/alerts)
- **Components:**
  - **Cards:** Must have a 1px solid `sage` border and a subtle shadow (`shadow-sm`).
  - **Buttons:** Must feature a disabled loading state displaying a `<Loader2 className="animate-spin" />` from `lucide-react`.
- **Responsiveness & PWA:**
  - Fully mobile-responsive (container padding scales from `p-4` on mobile to `p-8` on desktop).
  - Configured as an installable Progressive Web App (PWA).

---

## 6. Strict Rules & Conventions

1. **User Isolation:** STRICT data privacy. Every single database query must include a check for the current `userId` to ensure User A can never read, update, or delete User B's data.
2. **Data Fetching & Mutations:** 
   - Use **Server Components** for initial page loads where applicable.
   - Use **Traditional API Routes** (`app/api/.../route.ts`) for all data fetching from the client and all mutations.
3. **API Route Authentication Wrapper:** ALL protected API routes must be wrapped in a custom higher-order function (e.g., `withAuth`) that automatically checks if the user session is valid. If invalid, it immediately returns a 401 Unauthorized response. If valid, it passes the session/user details down to the route handler.
4. **Client Boundaries:** Push `"use client"` directives as far down the component tree as possible (e.g., wrap only interactive buttons or forms, leave layouts and tables as Server Components).
5. **Error Handling:** API routes must wrap logic in `try/catch` blocks and return standardized JSON objects: `{ success: true, data: ... }` or `{ success: false, error: "..." }`.
6. **Notifications:** Every client-side mutation must trigger a `sonner` toast (`toast.success` or `toast.error`) based on the API response.

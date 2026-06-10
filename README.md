# My Tracker - Personal Media Logger

A clean, modern, and dark-themed personal media tracker built with **Next.js 14 (App Router)**, **Tailwind CSS**, and **Supabase**.

---

## Getting Started

Follow these 3 simple steps to get the project up and running:

### Step 1: Set Up Supabase

1. Go to [Supabase](https://supabase.com) and sign up or sign in to your dashboard.
2. Click **New Project** and configure your project details.
3. Once the database is ready, navigate to the **SQL Editor** from the left-side menu.
4. Click **New Query**, open the file [supabase/schema.sql](supabase/schema.sql), copy its contents, paste them into the editor, and click **Run**.
   * *This will create the `entries` table and set up the default indexes and public read/write permissions.*

### Step 2: Configure Environment Variables

1. Go to your Supabase project's **Project Settings** -> **API**.
2. Locate the **Project URL** and the **Anon Public API Key**.
3. Create a `.env.local` file in the root folder of this project (you can copy the structure from `.env.local.example`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```
4. Paste your Supabase credentials in place of the placeholders.

### Step 3: Run Locally or Deploy to Vercel

#### Run Locally
1. Run `npm install` in your terminal to install the dependencies.
2. Run `npm run dev` to launch the development server.
3. Open [http://localhost:3000](http://localhost:3000) in your browser to start tracking!

#### Deploy to Vercel
1. Push this codebase to a GitHub, GitLab, or Bitbucket repository.
2. Go to the [Vercel Dashboard](https://vercel.com) and click **Add New** -> **Project**.
3. Import your repository.
4. Expand the **Environment Variables** section and add:
   * Key: `NEXT_PUBLIC_SUPABASE_URL` | Value: *(Your Supabase URL)*
   * Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Value: *(Your Supabase Anon Key)*
5. Click **Deploy**. Vercel will build and launch your media tracker in seconds!

---

## Features

* **Dashboard Overview**: Access completion statistics, progress bars, and recent additions.
* **Filter by Categories**: Beautiful sidebar routing for **Movies**, **TV Shows**, and **Games**.
* **Filter by Status**: Check off items as **Finished**, **Wishlist**, **Currently Watching/Playing**, or **Dropped**.
* **Search & Edit**: Quick title search filters with instant modal popups for editing ratings (1-5 stars) and reviews.

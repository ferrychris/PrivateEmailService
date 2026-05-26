# Raymail

A minimal, modern personal email client built with Next.js, Supabase, and Resend. Your own private inbox.

## Features

- **Custom Domain Email:** Send and receive emails from your custom domain using Resend.
- **Inbound Webhooks:** Receives incoming emails securely via Resend webhooks and stores them in Supabase.
- **Secure Authentication:** User login and session management powered by Supabase Auth with Row Level Security (RLS).
- **Modern UI:** Built with Next.js 15 App Router, Tailwind CSS, and standard React patterns.
- **Full Email Capabilities:** Inbox view, Sent view, reading threads, and composing/replying to emails.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Database & Auth:** Supabase (PostgreSQL)
- **Email Delivery:** Resend
- **Styling:** Tailwind CSS

## Prerequisites

- Node.js installed
- A [Supabase](https://supabase.com/) project
- A [Resend](https://resend.com/) account and configured domain

## Setup

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Copy the example environment file and fill in your details:
   ```bash
   cp .env.local.example .env
   ```
   *Note: Ensure you set up `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ALLOWED_EMAIL`, and `FROM_EMAIL`.*

3. **Database Migration:**
   Apply the initial database schema to your Supabase project. You can find the necessary SQL files in the `supabase/migrations/` directory.

4. **Add the authorized user:**
   To set up the single authorized user account, run the `supabase/create_user.sql` script directly in your Supabase SQL Editor. *Make sure to change the default password in the script before running it, and delete the script afterward!*

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

6. **Webhooks:**
   To receive emails, set up a webhook in Resend pointing to your production deployment's `/api/webhook/resend` endpoint.

## License

MIT

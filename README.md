# EdTech HRMS - Role-Based Human Resource Management System

A comprehensive role-based HRMS (Human Resource Management System) for EdTech companies with login/signup and role-specific dashboards.

## Features

- **Role-Based Access Control**: Different dashboards for Admin, HR, Teacher, Content Creator, Support Staff, and Employee roles
- **Authentication**: Secure login/signup with email/password and Google OAuth support
- **User Management**: Admin can create, edit, and manage users and their roles
- **Profile Management**: Users can update their profiles and change passwords
- **Support Ticketing**: Built-in support ticket system for assistance requests
- **Dashboard Analytics**: Role-specific statistics and data visualization
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, React, TypeScript
- **Backend**: Next.js API Routes, Server Components
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js
- **UI**: Tailwind CSS, shadcn/ui components

## Deployment to Vercel

### Prerequisites

- A MongoDB Atlas database (or compatible MongoDB provider)
- Vercel account
- (Optional) Google OAuth credentials for Google Sign-In

### Environment Variables

Add the following environment variables to your Vercel project:

- `DATABASE_URL`: MongoDB connection string (e.g., `mongodb+srv://user:pass@cluster0.mongodb.net/hrms?retryWrites=true&w=majority`)
- `NEXTAUTH_URL`: Your Vercel app URL (e.g., `https://your-app.vercel.app`)
- `NEXTAUTH_SECRET`: A long random string for NextAuth.js security
- `GOOGLE_CLIENT_ID`: (Optional) Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: (Optional) Google OAuth client secret
- `NODE_ENV`: Set to `production` (Vercel sets this automatically)

### Deployment Steps

1. **Connect your repository to Vercel**:
   - Import your GitHub/GitLab/Bitbucket repository
   - Select the main branch for production deployment

2. **Configure build settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run vercel-build` (This runs Prisma generate before Next.js build)
   - Output Directory: (Leave as default)
   - Install Command: `npm ci`

3. **Add environment variables**:
   - Add all required environment variables listed above
   - Ensure they are added to both Production and Preview environments

4. **Deploy**:
   - Click "Deploy" and wait for the build to complete
   - Vercel will automatically run the build process and deploy your application

### Vercel-Specific Setup

The project includes a custom build command in `package.json`:

\`\`\`json
"vercel-build": "prisma generate && next build"
\`\`\`

This ensures that Prisma generates the client before the Next.js build, preventing the common `@prisma/client did not initialize yet` error.

### Post-Deployment Verification

After deployment, verify the following:

1. Visit `/auth/signup` to create an admin user
2. Test login functionality at `/auth/signin`
3. Verify role-based redirects to appropriate dashboards
4. Test protected routes to ensure proper access control
5. Verify database connectivity by creating and retrieving data

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## License

MIT

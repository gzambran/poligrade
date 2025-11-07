# Admin UI Implementation Plan

## Overview
Build a custom admin interface for managing politician data, moving from static JSON to Vercel Postgres database.

## Requirements

### Users
- Multiple team members (starting with 2: 1 technical, 1 non-technical)
- No role-based permissions needed (all admins have full access)
- Whitelisted email addresses only (Google OAuth)

### Data Model
**Politician Schema:**
- `id`: UUID (primary key)
- `name`: String
- `state`: String (full state name, not abbreviation)
- `district`: String (optional - only for House Representatives, e.g., "14", "At-Large")
- `office`: Enum (Governor, Senator, House Representative)
- `status`: Enum (Incumbent, Candidate, None)
- `grade`: Enum (Progressive, Liberal, Centrist, Moderate, Conservative, Nationalist)
- `createdAt`: DateTime (auto)
- `updatedAt`: DateTime (auto)

**State/District Logic:**
- **Governors**: State only (district = null)
- **Senators**: State only (district = null)
- **House Representatives**: State + district

### Features
- Search politicians by name
- Filter by state, office, status, grade
- Add new politician (modal/drawer)
- Edit politician (click row to open modal)
- Delete politician (with confirmation modal)
- All operations on same page (no navigation to separate pages)

## Tech Stack

### Database
- **Vercel Postgres** (free hobby tier: 256 MB storage, 60 hours compute/month)
- **Prisma ORM** (type-safe queries, migrations, schema management)

### Authentication
- **NextAuth.js** with Google OAuth provider
- Email whitelist in environment variables
- Session-based auth

### Frontend
- **NextUI components** (consistent with existing site design)
- Modal/drawer components for add/edit
- Confirmation modal for delete

### API
- Next.js API routes (`/api/admin/politicians/*`)
- CRUD endpoints with auth middleware

## URL Structure
- `/admin` - Login page (redirects here if not authenticated)
- `/admin/politicians` - Main admin dashboard (list view, add/edit/delete)

## UI Design

### Login Page (`/admin`)
- "Sign in with Google" button
- Redirect to `/admin/politicians` after successful auth
- Error message if email not whitelisted

### Admin Dashboard (`/admin/politicians`)

**Layout:**
- Header with logout button
- Search bar (by name)
- Filter dropdowns (state, office, status, grade)
- "Add Politician" button (top right)
- Table with columns: Name, State/District, Office, Status, Grade
- Click any row to open edit modal

**Add/Edit Modal:**
- Form fields:
  - Name (text input)
  - State (dropdown - 50 states, full names)
  - District (text input - only shown if office = House Representative)
  - Office (dropdown)
  - Status (dropdown)
  - Grade (dropdown)
- Save button
- Cancel button
- Delete button (only in edit mode, opens confirmation modal)

**Delete Confirmation Modal:**
- Message: "Are you sure you want to delete [politician name]?"
- Confirm button (destructive color)
- Cancel button

## Implementation Phases

### Phase 1: Database Setup
1. Set up Vercel Postgres database
2. Install Prisma
3. Create Prisma schema
4. Run initial migration
5. Test database connection

### Phase 2: Authentication
1. Create Google Cloud project and OAuth credentials
2. Install and configure NextAuth.js
3. Create email whitelist in environment variables
4. Build login page (`/admin`)
5. Add auth middleware for admin routes
6. Test authentication flow

### Phase 3: API Routes
1. Create API route structure (`/api/admin/politicians/`)
2. GET `/api/admin/politicians` - List all with optional filters
3. POST `/api/admin/politicians` - Create new politician
4. PUT `/api/admin/politicians/[id]` - Update politician
5. DELETE `/api/admin/politicians/[id]` - Delete politician
6. Add auth checks to all routes
7. Test all endpoints

### Phase 4: Admin UI
1. Create admin layout component
2. Build politician list view with table
3. Add search and filter functionality
4. Create add/edit modal component
5. Create delete confirmation modal
6. Wire up all UI to API routes
7. Add loading states and error handling
8. Test complete workflow

### Phase 5: Data Migration
1. Create migration script to import politicians.json to database
2. Run migration
3. Verify data integrity
4. Keep JSON file as backup

### Phase 6: Update Public Site
1. Update `/grades` page to fetch from database API route
2. Create public API route `/api/politicians` (read-only)
3. Test public site with database data
4. Remove politicians.json from public fetch (keep file for reference)

## Environment Variables Needed

```
# Database
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=

# NextAuth
NEXTAUTH_URL=http://localhost:3000 (or production URL)
NEXTAUTH_SECRET= (generate with `openssl rand -base64 32`)

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Admin Access
ADMIN_EMAILS=email1@example.com,email2@example.com
```

## Google OAuth Setup Steps
1. Go to Google Cloud Console (console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://yourdomain.com/api/auth/callback/google` (prod)
6. Copy Client ID and Client Secret to environment variables

## Success Criteria
- [x] Admin can log in with whitelisted Google account
- [x] Admin can view all politicians in searchable/filterable list
- [x] Admin can add new politician via modal
- [x] Admin can edit politician by clicking row
- [x] Admin can delete politician with confirmation
- [x] Public `/grades` page displays data from database
- [x] All 585 politicians migrated successfully (4 candidates skipped)
- [x] Non-technical user can complete all operations

## Implementation Status

### ✅ Phase 1: Database Setup - COMPLETE
- Installed Prisma ORM
- Created database schema with Politician model
- Set up Neon PostgreSQL database via Vercel
- Ran migrations successfully
- Database tested and working

### ✅ Phase 2: Authentication - COMPLETE
- Installed NextAuth.js
- Set up Google OAuth
- Created login page at `/admin`
- Added auth middleware for protected routes
- Email whitelist working correctly

### ✅ Phase 3: API Routes - COMPLETE
- GET `/api/admin/politicians` - List/filter politicians
- POST `/api/admin/politicians` - Create politician
- PUT `/api/admin/politicians/[id]` - Update politician
- DELETE `/api/admin/politicians/[id]` - Delete politician
- All endpoints include auth checks and validation

### ✅ Phase 4: Admin UI - COMPLETE
- Politician list view with table
- Search and filter functionality
- Add/edit politician modal (conditional district field)
- Delete confirmation modal
- All CRUD operations working

### ✅ Phase 5: Data Migration - COMPLETE
- Created migration script
- Migrated 585 politicians from JSON to database
- Normalized district values ("AL" → "At-Large")
- Skipped 4 candidate entries without state info
- Data verified and correct

### ✅ Phase 6: Update Public Site - COMPLETE
- Created public API endpoint `/api/politicians`
- Updated `/grades` page to fetch from database
- Maintains backward compatibility
- Grade filtering working for quiz integration

## Future Enhancements (Not in Scope)
- Bulk import/export
- Audit logs
- Role-based permissions
- Approval workflows
- Version history
- Photo uploads
- Additional politician fields (bio, voting records, etc.)

## Notes
- Build admin first, migrate data later
- Keep politicians.json as backup reference
- All admin operations stay on same page (no separate edit pages)
- State names displayed in full (not abbreviations) in UI
- District field conditional based on office type

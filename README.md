# PoliGrade

**Democracy Powered by Data, Not Drama**

A political accountability platform that helps voters make informed decisions through data-driven evaluations of politicians and policy-based party alignments.

## Features

- **Politician Database**: Search and filter 585+ elected officials by name, state, office, and political alignment
- **Voter Alignment Quiz**: 27-question quiz across 9 policy areas to discover your political alignment
- **Six Policy Parties**: Progressive, Liberal, Centrist, Moderate, Conservative, and Nationalist classifications based on policy positions
- **Dark Mode**: Full dark mode support with system preference detection
- **Mobile-First Design**: Fully responsive with optimized layouts for all screen sizes
- **Accessibility**: WCAG compliant with comprehensive ARIA labels and screen reader support
- **Admin Interface**: Protected admin panel for managing politician database

## Tech Stack

- **Framework**: Next.js 15 with App Router (Server-Side Rendering)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **UI**: NextUI component library
- **Styling**: Tailwind CSS with dark mode support
- **Typography**: Inter font family
- **Theme**: next-themes for dark mode

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY="your-web3forms-key"
```

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

See [CLAUDE.md](./CLAUDE.md) for detailed technical documentation.

## License

All rights reserved.

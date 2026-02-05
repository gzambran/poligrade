# PoliGrade

**Democracy Powered by Data, Not Drama**

A political accountability platform that evaluates 589 elected officials through data-driven analysis and helps voters discover their political alignment through a comprehensive policy quiz.

## Features

- **Politician Database**: Search and filter elected officials by name, state, office, and political alignment
- **Voter Alignment Quiz**: 27-question quiz to discover your alignment across 6 policy-based parties
- **Data-Driven Evaluations**: Politicians classified as Progressive, Liberal, Centrist, Moderate, Conservative, or Nationalist
- **Mobile-First & Accessible**: Fully responsive design with dark mode support

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

Copy `.env.example` to `.env` and fill in the values.

## Build for Production

```bash
npm run build
npm start
```

## Tech Stack

Next.js 15, TypeScript, PostgreSQL, Prisma, NextUI, Tailwind CSS

## License

All rights reserved.

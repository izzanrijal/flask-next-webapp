# Clinical Question Update Web App

A single-user web application to systematically update a MySQL database of UKMPPD-level clinical questions.

## Features

- Secure authentication with limited login attempts
- Hierarchical question management organized by body systems
- AI-powered question generation using Grok API
- Real-time form validation and error handling
- Progress tracking across question sets
- Responsive design optimized for desktop use

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, React Query, React Hook Form
- **Backend**: Express.js, Sequelize ORM, MySQL
- **Authentication**: Supabase Auth + JWT
- **API Integration**: Grok API for AI-generated content

## Getting Started

### Prerequisites

- Node.js (v16+)
- MySQL database
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example` and fill in your configuration

4. Start the development server:

```bash
# Run backend server
npm run server

# In a separate terminal, run frontend
npm run dev
```

## Database Schema

The application works with the following database structure:

- `systems`: Top-level categorization of medical systems
- `topic_lists`: Topics within each system
- `subtopic_lists`: Subtopics within each topic
- `questions_duplicated`: The main questions table with all question data

## Project Structure

```
/
├── src/               # Frontend React application
│   ├── api/           # API client functions
│   ├── components/    # React components
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Library code (e.g., Supabase client)
│   ├── pages/         # Page components
│   └── types/         # TypeScript type definitions
│
├── server/            # Backend Express server
│   ├── middleware/    # Express middleware
│   ├── models/        # Sequelize models
│   └── routes/        # Express routes
│
└── public/            # Static assets
```

## Authentication Flow

1. User enters credentials (from `.env` file)
2. Authentication is verified against Supabase
3. JWT token is issued for API access
4. Login attempts are tracked to prevent brute force attacks

## License

This project is proprietary and confidential.
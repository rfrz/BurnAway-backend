# BurnAway Backend

BurnAway is a comprehensive API gateway and backend service designed for predicting burnout risk in software developers. It bridges user management, mental health assessments, and external AI/Deep Learning services to provide real-time burnout predictions and personalized recovery interventions.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ORM**: Prisma (PostgreSQL)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **Validation**: Zod
- **Networking**: Axios
- **Security**: Helmet, express-rate-limit, CORS

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) database
- (Optional) Docker & Docker Compose for containerized development

## ⚙️ Environment Variables

Create a `.env` file in the root of the backend directory. You can use `.env.example` as a reference:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/burnaway?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
PORT=3000
DL_API_URL="http://localhost:8000"
DL_PREDICT_PATH="/predict_burnout"
CORS_ORIGIN="*"
```

## 📦 Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize the database schema using Prisma:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

## 🛠️ Running the Server

### Development Mode (with hot-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## 📜 Available Scripts

- `npm start`: Runs the server normally.
- `npm run dev`: Runs the server using nodemon for automatic reloads on changes.
- `npm run prisma:generate`: Generates the Prisma client.
- `npm run prisma:migrate`: Runs database migrations against the development database.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run lint:fix`: Automatically fixes linting errors.

## 📁 Project Structure

```text
BurnAway-backend/
├── prisma/             # Database schema and migrations
├── src/
│   ├── config/         # Environment and database configuration
│   ├── controllers/    # Route controllers (auth, profile, predict, etc.)
│   ├── middlewares/    # Express middlewares (auth, error handler, rate limit)
│   ├── routes/         # Express route definitions
│   ├── services/       # External service integrations (e.g., AI Service)
│   ├── utils/          # Utility functions and Zod schemas
│   └── server.js       # Express application entry point
├── package.json        # Dependencies and scripts
└── .env.example        # Example environment variables
```

## 🔐 Security & Features

- **Data Privacy**: Complete account deletion safely removes all associated user data and prediction history.
- **Rate Limiting**: Protects endpoints against brute-force attacks.
- **Input Validation**: Uses strict Zod schemas for all incoming API requests.
- **AI Integration**: Seamlessly connects to external Deep Learning models for real-time analysis.

# Daily Task Tracker - Backend Server

Express.js backend server with PostgreSQL database for the Daily Task Tracker application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=dail_task
DB_PASSWORD=Resolve@321
DB_PORT=5432
PORT=3001
```

3. Create the database:
```sql
CREATE DATABASE dail_task;
```

4. Run the schema:
```bash
psql -U postgres -d dail_task -f db/schema.sql
```

5. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

## API Endpoints

See main README.md for API documentation.


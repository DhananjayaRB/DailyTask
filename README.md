# Daily Task Tracker 👑

A modern, beautiful daily task and habit tracking application built with React, TypeScript, PostgreSQL, and Tailwind CSS. Track your habits, visualize your progress, and build consistency in your daily routine.

## Features

✨ **Key Features:**
- 📅 **Daily Habit Tracking** - Track multiple habits with daily checkboxes
- 📊 **Progress Visualization** - See your progress with circular progress indicators and bar charts
- 📆 **Week & Month Views** - Switch between weekly and monthly views
- 🎯 **Goal Setting** - Set monthly goals for each habit
- 🗄️ **PostgreSQL Database** - Persistent data storage with PostgreSQL
- 🌙 **Dark Mode UI** - Beautiful dark theme with modern gradient colors
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- ➕ **Easy Management** - Add, edit, and delete habits with ease
- 📈 **Analytics Dashboard** - Detailed analytics and insights
- ⚙️ **Settings Page** - Manage all your habits in one place
- 🎨 **Modern Color Palette** - Beautiful gradient colors and modern design
- 😊 **100+ Emojis** - Extensive emoji selection for habits

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Multi-page navigation
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling with modern gradients
- **Axios** - HTTP client
- **date-fns** - Date utilities

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Database
- **pg** - PostgreSQL client

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE dail_task;
```

2. Run the schema to create tables:
```bash
psql -U postgres -d dail_task -f server/db/schema.sql
```

Or manually run the SQL from `server/db/schema.sql` in your PostgreSQL client.

### Installation

1. **Install backend dependencies:**
```bash
cd server
npm install
```

2. **Install frontend dependencies:**
```bash
cd ..
npm install
```

3. **Configure environment variables:**

Create `server/.env` file (or copy from `server/.env.example`):
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=dail_task
DB_PASSWORD=Resolve@321
DB_PORT=5432
PORT=3001
```

### Running the Application

1. **Start the backend server:**
```bash
cd server
npm run dev
```

The server will run on `http://localhost:3001`

2. **Start the frontend (in a new terminal):**
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

3. **Open your browser and navigate to `http://localhost:5173`**

### Building for Production

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
.
├── server/                 # Backend server
│   ├── db/
│   │   ├── connection.js   # Database connection
│   │   └── schema.sql      # Database schema
│   ├── routes/
│   │   ├── habits.js       # Habits API routes
│   │   └── completions.js # Completions API routes
│   ├── server.js           # Express server
│   └── package.json
├── src/                    # Frontend source
│   ├── components/         # React components
│   │   ├── HabitTracker.tsx
│   │   ├── HabitRow.tsx
│   │   ├── ProgressChart.tsx
│   │   ├── Navigation.tsx
│   │   ├── ViewToggle.tsx
│   │   └── AddHabitModal.tsx
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Analytics.tsx
│   │   └── Settings.tsx
│   ├── services/           # API services
│   │   └── api.ts
│   ├── utils/              # Utility functions
│   │   ├── storage.ts      # (Legacy - now uses API)
│   │   └── dates.ts
│   ├── types.ts            # TypeScript types
│   ├── App.tsx             # Main app with routing
│   └── main.tsx            # Entry point
└── package.json
```

## API Endpoints

### Habits
- `GET /api/habits` - Get all habits
- `GET /api/habits/:id` - Get a single habit
- `POST /api/habits` - Create a new habit
- `PUT /api/habits/:id` - Update a habit
- `DELETE /api/habits/:id` - Delete a habit

### Completions
- `GET /api/completions` - Get completions (with optional query params: startDate, endDate, habitId)
- `GET /api/completions/:habitId/:date` - Get completion for specific habit and date
- `POST /api/completions` - Create or update a completion
- `GET /api/completions/stats/summary` - Get summary statistics

### Health
- `GET /api/health` - Health check endpoint

## Usage

### Adding a Habit

1. Navigate to **Dashboard** or **Settings**
2. Click the **"+ Add Habit"** button
3. Enter the habit name (e.g., "Wake up at 05:00")
4. Choose an emoji from 100+ options
5. Set your monthly goal (number of days)
6. Select a color theme
7. Click **"Add Habit"**

### Tracking Your Habits

- Click on any checkbox to mark a habit as completed for that day
- Completed habits show a green checkmark with gradient background
- Today's date is highlighted with a ring
- Your progress is automatically calculated and displayed

### Viewing Progress

- **Dashboard**: Main tracking interface with week/month views
- **Analytics**: Detailed analytics with monthly breakdowns
- **Settings**: Manage all your habits

### Pages

1. **Dashboard** (`/`) - Main habit tracking interface
2. **Analytics** (`/analytics`) - Detailed progress analytics
3. **Settings** (`/settings`) - Manage habits and preferences

## Database Schema

### Habits Table
- `id` - Primary key
- `name` - Habit name
- `emoji` - Emoji representation
- `goal` - Monthly goal (days)
- `color` - Color theme
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

### Completions Table
- `id` - Primary key
- `habit_id` - Foreign key to habits
- `date` - Date of completion
- `completed` - Boolean completion status
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp
- Unique constraint on (habit_id, date)

## Default Habits

The app comes with 10 pre-configured habits:
- ⏰ Wake up at 05:00
- 💪 Gym
- 📚 Reading / Learning
- 💰 Budget Tracking
- 🎯 Project Work
- 🚫 No Alcohol
- 📵 Social Media Detox
- 📝 Goal Journaling
- ❄️ Cold Shower
- 🧘 Meditation

## Color Palette

The app uses a modern color palette with:
- **Primary**: Blue gradients
- **Accent Colors**: Purple, Pink, Orange, Teal, Indigo, Emerald, Amber, Rose, Cyan, Violet
- **Dark Theme**: Slate-based dark colors for backgrounds

## Contributing

Feel free to fork this project and make it your own! Some ideas for enhancements:
- User authentication
- Multiple users support
- Habit streaks tracking
- Reminders and notifications
- Data export/import
- Habit templates
- Social sharing
- Mobile app

## License

This project is open source and available for personal and commercial use.

---

**Your Growth Starts Here 🌱**

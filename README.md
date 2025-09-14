# Smart Order Table - Admin Frontend

A modern React-based admin panel for managing the Smart Order Table restaurant system.

## Features

- **Dashboard**: Overview of system statistics and recent activity
- **Menu Management**: Add, edit, and manage menu items and categories
- **Table Management**: Manage restaurant tables and QR codes
- **User Management**: Manage user accounts and roles
- **Reports & Analytics**: View revenue reports and analytics
- **Promotion Management**: Create and manage promotional codes

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hook Form
- Recharts (for analytics)
- Lucide React (icons)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3001](http://localhost:3001) in your browser

## Default Login

- **Username**: admin
- **Password**: admin123

## API Configuration

The frontend is configured to connect to the backend API at `http://localhost:8080/api`. Make sure your Spring Boot backend is running on port 8080.

## Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable components
├── contexts/           # React contexts (Auth)
├── pages/              # Page components
├── services/           # API services
└── App.jsx            # Main app component
```

## Role-Based Access

This admin panel is designed for users with the `ADMIN` role. The authentication system will redirect users with other roles to the appropriate frontend application.
# SmartOrderTable-ADMIN

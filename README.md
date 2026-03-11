# Sington Engineering Website

A full-stack web application for Sington Engineering company featuring a responsive frontend and admin CMS dashboard.

## 🚀 Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

### Backend
- **Express.js** - REST API
- **SQLite** - Database (better-sqlite3)
- **JSON Web Token** - Authentication
- **Multer** - File uploads
- **Nodemailer** - Email sending

## 📁 Project Structure

```
sington/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── app.js          # Main Express app
│   │   ├── db.js           # Database configuration
│   │   ├── routes/         # API routes
│   │   │   ├── auth.js     # Authentication endpoints
│   │   │   ├── contact.js # Contact form endpoints
│   │   │   ├── content.js # Content management
│   │   │   └── upload.js  # File upload handling
│   │   ├── middleware/
│   │   │   └── auth.js     # JWT authentication
│   │   └── public/
│   │       └── uploads/   # Uploaded files
│   └── package.json
│
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── ServiceDetail.jsx
│   │   │   ├── ProjectDetail.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       └── AdminLogin.jsx
│   │   ├── context/       # React contexts
│   │   └── App.jsx        # Main app component
│   ├── public/
│   │   └── images/        # Static images
│   └── package.json
│
└── images/                # Project assets
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 📱 Features

### Public Website
- Home page with hero section, services, projects
- Service details page
- Project details page
- Contact form with submission
- Dynamic content from database
- Dark/Light theme support
- Responsive design

### Admin CMS
- Secure admin login
- Dashboard with statistics
- Manage services (CRUD)
- Manage projects (CRUD)
- Manage testimonials
- Manage partners
- View & handle contact submissions
- Update site content
- Image upload support

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content` | Get all site content |
| PUT | `/api/content` | Update site content |
| POST | `/api/contact` | Submit contact form |
| GET | `/api/contact/submissions` | Get all submissions (admin) |
| PUT | `/api/contact/submissions/:id/handle` | Handle submission |
| POST | `/api/auth/login` | Admin login |
| GET | `/api/auth/profile` | Get admin profile |
| PUT | `/api/auth/update-credentials` | Update credentials |
| POST | `/api/upload` | Upload file |

## 🎨 Customization

### Tailwind Configuration
Edit `frontend/tailwind.config.js` to customize colors, fonts, and theme.

### Content Management
Access the admin panel at `/sington-cms-portal` to manage:
- Company information
- Services offered
- Portfolio projects
- Testimonials
- Partner logos



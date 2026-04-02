# Singitan Engineering Website

A full-stack web application for Singitan Engineering company featuring a responsive frontend and an admin CMS dashboard.

## 🚀 Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Express.js** - REST API server
- **MySQL** - Relational Database (via `mysql2`)
- **JSON Web Token** - Authentication
- **Multer & Sharp** - File uploads and image processing
- **Nodemailer** - Custom email sending via company email provider

## 📁 Project Structure

```text
singitan/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── app.js          # Main Express app
│   │   ├── db.js           # MySQL Database configuration & Automatic Seeding
│   │   ├── routes/         # API routes (auth, contact, content, upload, etc.)
│   │   ├── middleware/     # JWT authentication
│   │   ├── data/           # Contains content.json for DB seeding
│   │   └── public/
│   │       └── uploads/    # Uploaded images & files
│   └── package.json
│
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Home, ServiceDetail, ProjectDetail)
│   │   │   └── admin/      # Admin dashboard & login portal
│   │   ├── context/        # React Contexts
│   │   └── App.jsx         # Main App component
│   └── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm
- MySQL Server

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend server will start on `http://localhost:5000`.

**Note:** On the first run, `db.js` will automatically connect to your MySQL database (if the credentials are correct), create all necessary tables (such as settings, services, projects, careers, blogs, etc.), and seed initial data from `backend/src/data/content.json` if the tables are empty. It will also seed an initial Admin user if one is provided via environment variables.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend application will start on `http://localhost:5173`.

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key

# MySQL DB Credentials
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=Singitan_Db

# Admin Seeding
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=your_bcrypt_hash

# Nodemailer / Email Service
SMTP_HOST=your_smtp_host
SMTP_PORT=465
EMAIL_USER=your_custom_email
EMAIL_PASS=your_email_password
```

*(Refer to your specific email provider for the SMTP details).*

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 📱 Features

### Public Website
- Dynamic homepage with hero sections, stats, projects, and services
- Service details and Project details pages
- Careers and Blogs sections
- Contact form allowing immediate email notification via specific company email
- Dynamic content loaded directly from normalized MySQL tables
- Dark/Light theme support with responsive modern design

### Admin CMS
- Secure Admin login with JWT
- Comprehensive dashboard with analytics and statistics
- Manage components seamlessly (CRUD for Services, Projects, Testimonials, Partners, Careers, Blogs, Social Links)
- Image upload support handled directly, saving binary/file data cleanly
- Normalized settings management (data split logically into schema columns instead of bulk JSON)

## 🔌 API Endpoints
*Key endpoints. See `backend/src/routes` for more detailed specifications.*
- **GET/PUT** `/api/content` - Read/Update site-wide settings and resources
- **POST** `/api/contact` - Submit contact form
- **GET/PUT** `/api/contact/submissions` - Manage interactions (admin)
- **POST** `/api/auth/login` - Administrator login
- **POST** `/api/upload` - Secure file & image upload

## 🎨 Customization

### Tailwind Configuration
Edit `frontend/tailwind.config.js` to modify the brand color palette, typographies, and constraints.

### Content Management
Access the admin portal at `/singitan-cms-portal` (or your defined routing path) to securely modify the organizational content.

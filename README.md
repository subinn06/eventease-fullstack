# EventEase – Fullstack Event Management Platform

EventEase is a fullstack **event booking and management web app** that allows users to discover, create, and book events effortlessly.  
It includes **user authentication**, **organizer dashboards**, **ticket management**, and **secure booking flow** — all built using **React, Node.js, Express, and Prisma ORM**.

Live link: https://eventease-fullstack.vercel.app

---

## 🚀 Features

### 👥 Authentication
- User & Organizer roles (with role based access control)
- JWT based login & logout with refresh token rotation
- Secure password hashing using bcrypt
- Persistent session with HTTP only cookies

### 🎫 Event Management
- Organizers can create events with:
  - Title, description, location, category, and date range
  - Image upload (via Multer)
  - Multiple ticket tiers (e.g., General / VIP)
  - Optional capacity limit
- Organizers can view & delete their created events from a clean dashboard

### 🧾 Bookings
- Users can view all events and book tickets from available tiers
- Booking status tracking (Pending / Confirmed / Cancelled)
- “My Bookings” page to view all previous bookings

### 🖼️ File Uploads
- Event images uploaded to the `server/uploads` directory
- Served statically using Express middleware

### 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React.js, React Router, Context API, CSS Modules |
| Backend | Node.js, Express.js |
| Database | SQLite (via Prisma ORM) |
| Auth | JWT, Bcrypt, Cookie Parser |
| File Upload | Multer |
| Styling | Modern responsive CSS (custom theme with gradients and shadows) |

---

## ⚙️ Setup & Installation

### 1️⃣ Clone the Repository

git clone https://github.com/subinn06/eventease-fullstack.git

cd eventease

2️⃣ Backend Setup

cd server

npm install

npx prisma migrate dev

npx prisma db seed

npm start

The backend runs by default at:
👉 http://localhost:4000

3️⃣ Frontend Setup

cd client

npm install

npm start

Frontend runs by default at:
👉 http://localhost:3000

---

## 🌐 Environment Variables

### For the server (.env):

PORT=4000

DATABASE_URL="file:./dev.db"

JWT_ACCESS_SECRET=youraccesstokensecret

JWT_REFRESH_SECRET=yourrefreshtokensecret

ACCESS_TOKEN_EXPIRES_IN=15m

REFRESH_TOKEN_EXPIRES_IN_DAYS=30

### For the client (.env):

REACT_APP_API_BASE=http://localhost:4000/api

---

## 🧩 Key Functionalities Explained

AuthContext	- Maintains user login state across the app using React Context

Header Component - Displays navigation, and logout button

CreateEvent Page - Organizer only event creation with live image preview & ticket tier management

Organizer Dashboard - Displays all events created by logged in organizer

Bookings Page - Shows all confirmed bookings with clean card layout

API Layer (client/api.js) - Handles all frontend backend communication

Multer Upload Middleware - Saves event images and builds accessible image URLs

---

## 🧠 Default Credentials (for testing)

Role   -   Email   -   Password

Organizer   org@example.com   password

User   user@example.com   password

---

## 🧾 Sample Flow

- Login as Organizer

- Create a new event → upload image → add ticket tiers

- Logout and login as User

- View and book the event

- Check your My Bookings page

- Organizer can see and delete their events from Dashboard

---

## 🎨 Design Highlights

- Consistent theme.css across all pages

- Modern gradient buttons & rounded cards

- Light & clean layout suitable for display

- Responsive for both desktop and mobile views

---

## 🧑‍💻 Author

Subin A

💼 Fullstack Developer | React • Node • Prisma • Express

🔗 GitHub - https://github.com/subinn06

🔗 LinkedIn - https://www.linkedin.com/in/subin06

---

## 🪄 License

This project is open source and available under the MIT License.
# 🤖 AI-Based Smart Attendance Monitoring System

An AI-based smart attendance monitoring system designed to automate student attendance using face recognition technology and a full-stack web application.

## 📌 About the Project

The **AI-Based Smart Attendance Monitoring System** is a full-stack web application designed to help educational institutions manage student attendance efficiently.

The system provides separate dashboards for:

- 👨‍💼 Admin
- 👨‍🏫 Teacher
- 👨‍🎓 Student

It includes attendance management, analytics, face registration, AI-assisted attendance, notifications, and attendance reports.

---

## ✨ Features

### 👨‍💼 Admin

- Admin login
- Manage students
- Manage teachers
- Manage subjects
- View attendance records
- View attendance analytics
- Generate attendance reports
- Manage notifications
- View dashboard statistics

### 👨‍🏫 Teacher

- Teacher login
- View assigned subjects
- Start attendance sessions
- AI-assisted attendance
- View attendance history
- View attendance analytics
- Generate attendance reports
- Monitor low-attendance students

### 👨‍🎓 Student

- Student login
- View personal attendance
- View subject-wise attendance
- View attendance history
- View attendance percentage
- Register face
- View notifications
- Manage profile

---

## 🧠 AI Attendance Workflow

The system provides an AI-assisted attendance workflow:

**Student → Camera → Face Detection → Face Recognition/Verification → Student Identification → Attendance Validation → Database → Analytics**

The current AI service contains a prototype/demo recognition pipeline and can be extended with a production-grade face recognition model.

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │     React Client    │
                    │      Port 5173      │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │  Node.js + Express  │
                    │      Port 5000      │
                    └───────┬───────┬─────┘
                            │       │
                            ▼       ▼
                    ┌──────────┐  ┌──────────────┐
                    │ MongoDB  │  │ Python AI    │
                    │ Database │  │ FastAPI      │
                    └──────────┘  │ Port 8000    │
                                  └──────────────┘

🛠️ Technologies Used
Frontend
React.js
Vite
JavaScript
CSS
React Router
Axios
Backend
Node.js
Express.js
MongoDB
Mongoose
JWT Authentication
bcrypt
AI Service
Python
FastAPI
OpenCV
Face recognition workflow
Development Tools
Git
GitHub
VS Code
Postman
📂 Project Structure
AI based project/
│
├── ai-service/
│   ├── main.py
│   └── requirements.txt
│
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed.js
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md

⚙️ Requirements

Before running the project, install:

Node.js
npm
Python 3.x
MongoDB or MongoDB Atlas
Git
Check the installations:
node --version
npm --version
python --version
git --version
🚀 Installation
1. Clone the Repository
git clone https://github.com/ansh1789/ai-smart-attendance-system.git
cd ai-smart-attendance-system
2. Install Frontend Dependencies
cd client
npm install
3. Install Backend Dependencies
cd ../server
npm install
4. Install AI Service Dependencies
cd ../ai-service
pip install -r requirements.txt
🔐 Environment Variables

Create a .env file inside the server directory.

Example:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AI_SERVICE_URL=http://localhost:8000

Important: Never upload your actual .env file, passwords, API keys, or database credentials to GitHub.

▶️ Running the Project

The project consists of three services.

1. Backend

Open a terminal:

cd server
npm run dev

Backend:

http://localhost:5000
2. Frontend

Open another terminal:

cd client
npm run dev

Frontend:

http://localhost:5173
3. AI Service

Open a third terminal:

cd ai-service
python -m uvicorn main:app --reload --port 8000

AI service:

http://localhost:8000
📊 Attendance Analytics

The system provides attendance analytics such as:

Overall attendance percentage
Subject-wise attendance
Student-wise attendance
Present vs absent statistics
Attendance history
Low-attendance monitoring
Attendance trends
🔒 Security

The application uses or is designed to support:

JWT authentication
Password hashing
Protected API routes
Role-based authorization
Environment variables
Duplicate attendance prevention
Input validation
Error handling

Sensitive credentials should never be committed to the public repository.

🔮 Future Improvements
Production-grade real-time face recognition
Liveness detection
Anti-spoofing
QR-code attendance
Email notifications
Cloud deployment
Mobile application
Advanced attendance analytics
Improved AI-based attendance insights
⚠️ Project Status

This project is currently a development/academic prototype.

The AI attendance component currently contains a prototype/demo recognition pipeline. It can be further enhanced with a properly validated face-recognition and liveness-detection solution before production deployment.

🎓 Academic Project

This project demonstrates concepts related to:

Full-stack web development
REST API development
Database management
Authentication and authorization
Artificial Intelligence
Computer Vision
Face recognition
Data analytics
👨‍💻 Author

Ansh

GitHub:
https://github.com/ansh1789

Project Repository:
https://github.com/ansh1789/ai-smart-attendance-system

📄 License

This project is intended primarily for educational and academic purposes.
                                 
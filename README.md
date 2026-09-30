# 🤖 AI-Based Smart Attendance Monitoring System

An AI-based smart attendance monitoring system designed to automate student attendance using face recognition technology and a full-stack web application.

## 📌 About the Project

The AI-Based Smart Attendance Monitoring System is a full-stack web application that helps educational institutions manage student attendance efficiently.

The system provides separate dashboards for Admin, Teacher, and Student users. It includes attendance management, analytics, face registration, AI-assisted attendance, and attendance reports.

## ✨ Features

### 👨‍💼 Admin
- Manage students
- Manage teachers
- Manage subjects
- View attendance records
- View attendance analytics
- Generate attendance reports
- Manage notifications
- Dashboard with attendance statistics

### 👨‍🏫 Teacher
- Teacher login
- View assigned subjects
- Start attendance sessions
- AI-assisted attendance
- View attendance history
- View attendance analytics
- Generate reports
- Monitor low-attendance students

### 👨‍🎓 Student
- Student login
- View attendance percentage
- View subject-wise attendance
- View attendance history
- Register face
- View notifications
- Manage profile

## 🧠 AI Attendance System

The system provides an AI-based attendance workflow:

```text
Student
   ↓
Camera
   ↓
Face Detection
   ↓
Face Recognition / Verification
   ↓
Student Identification
   ↓
Attendance Validation
   ↓
Attendance Database
   ↓
Analytics

The current AI service contains a prototype/demo recognition pipeline and can be extended with a production-grade face recognition model.

🛠️ Technologies Used
Frontend
React.js
Vite
JavaScript
CSS
Axios
React Router
Backend
Node.js
Express.js
MongoDB
Mongoose
JWT
bcrypt
AI Service
Python
FastAPI
OpenCV
Face recognition workflow
Tools
Git
GitHub
VS Code
Postman
🏗️ Project Structure
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
MongoDB / MongoDB Atlas
Git

Check your installation:

node --version
npm --version
python --version
git --version
🚀 Installation
1. Clone the repository
git clone https://github.com/ansh1789/ai-smart-attendance-system.git
cd ai-smart-attendance-system
2. Install frontend dependencies
cd client
npm install
3. Install backend dependencies
cd ../server
npm install
4. Install AI service dependencies
cd ../ai-service
pip install -r requirements.txt
🔐 Environment Variables

Create a .env file inside the server folder.

Example:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AI_SERVICE_URL=http://localhost:8000

Do not upload your actual .env file to GitHub.

▶️ Running the Project

The project contains three services.

Backend

Open Terminal 1:

cd server
npm run dev

Backend will run on:

http://localhost:5000
Frontend

Open Terminal 2:

cd client
npm run dev

Frontend will normally run on:

http://localhost:5173
AI Service

Open Terminal 3:

cd ai-service
python -m uvicorn main:app --reload --port 8000

AI service will run on:

http://localhost:8000
📊 Attendance Analytics

The system provides:

Overall attendance percentage
Subject-wise attendance
Student-wise attendance
Present/absent statistics
Attendance history
Low-attendance monitoring
Attendance trends
🔒 Security

The application uses:

JWT authentication
Password hashing
Protected routes
Role-based authorization
Environment variables
Duplicate attendance prevention

Sensitive credentials should never be uploaded to GitHub.

🔮 Future Improvements
Real-time production-grade face recognition
Liveness detection
Anti-spoofing
QR-based attendance
Email notifications
Cloud deployment
Mobile application
Advanced attendance analytics
Improved AI-based insights
⚠️ Project Status

This project is currently a development/academic prototype.

The AI attendance component currently contains a prototype/demo recognition pipeline and can be further enhanced with a properly validated face-recognition and liveness-detection solution for production use.

🎓 Academic Project

This project demonstrates:

Full-stack web development
REST API development
Database management
Authentication and authorization
Artificial Intelligence
Computer Vision
Face recognition concepts
Data analytics
👨‍💻 Author

Ansh

GitHub:
https://github.com/ansh1789

Project Repository:
https://github.com/ansh1789/ai-smart-attendance-system
# 🎙️ Virtual AI Assistant

A full-stack, voice-enabled AI Assistant that leverages Generative AI to provide intelligent conversational interactions through voice and text. Built with React, Node.js, MongoDB, and Google Gemini AI, the application supports voice commands, AI-generated responses, website navigation, mathematical calculations, and personalized assistant experiences.

---

## 🚀 Key Features

### 🤖 AI-Powered Conversations

* Generate intelligent responses using Google Gemini AI.
* Support for both voice and text-based interactions.

### 🎤 Voice Recognition & Response

* Real-time speech-to-text conversion.
* AI-generated voice responses for seamless interaction.

### 💬 Interactive Chat Experience

* Modern chat interface for natural conversations.
* Persistent chat history management.

### 🌐 Voice Command Automation

* Open websites using voice commands.
* Execute predefined assistant actions instantly.

### 🧮 Smart Utility Features

* Solve mathematical expressions.
* Answer general knowledge and informational queries.

### 🔐 User Authentication & Personalization

* Secure user registration and login using JWT authentication.
* Personalized assistant settings and customization options.

### ☁️ Cloud Storage Integration

* Upload and manage assistant images through Cloudinary.
* Secure media handling and storage.

### 📱 Responsive Design

* Optimized for desktop, tablet, and mobile devices.
* Modern and user-friendly interface.

---

## 🛠️ Technology Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* JWT Authentication
* Multer
* Cloudinary

### Artificial Intelligence

* Google Gemini AI
* Speech Recognition API
* Text-to-Speech Integration

---

## 📂 Project Architecture

```text
VirtualAIAssistant/
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── gemini.js
│   └── index.js
│
└── README.md
```

---

## ⚙️ Installation & Setup

### Clone the Repository

```bash
git clone <repository-url>
cd VirtualAIAssistant
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
npm start
```

---

## 🔑 Environment Variables

Create a `.env` file inside the backend directory and configure the following variables:

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 🎯 Supported Voice Commands

* Open YouTube
* Open WhatsApp
* Open Instagram
* Search on Google
* Solve Mathematical Expressions
* Show Weather Information
* Clear Chat History

---

## 📸 Application Screens

* User Registration & Login
* Assistant Customization
* Home Dashboard
* AI Chat Interface
* Voice Interaction Panel

---
## 📸 Screenshots

### Sign Up Screen
<img width="100%" alt="Sign Up Screen" src="https://github.com/user-attachments/assets/09a10136-6cee-4c43-9f60-0a0058b2f38f" />

### Customize Assistant
<img width="100%" alt="Customize Assistant" src="https://github.com/user-attachments/assets/c4b89c64-f0b3-4181-9b23-202250bb2384" />

### Home Screen
<img width="100%" alt="Home Screen" src="https://github.com/user-attachments/assets/7c949e82-aa5c-4dcc-962b-be1b27d5393f" />

### Chat Screen
<img width="100%" alt="Chat Screen" src="https://github.com/user-attachments/assets/e5790e5c-bd08-4f1a-8785-150cfaf4e17e" />

---

## 🔮 Future Enhancements

* Long-Term AI Memory
* Multi-Language Support
* Multiple Assistant Voices
* Real-Time Weather Integration
* Mobile Application Development
* Smart Device & IoT Integration

---

## 👩‍💻 Developer

**Raavi Vishnupriya**

---

## ⭐ Support

If you found this project useful, consider giving it a star ⭐ on GitHub.

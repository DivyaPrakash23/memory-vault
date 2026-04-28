# MemoryVault AI — Complete MERN Stack

> Memory-support and caregiver-assistance platform for elderly users, early-stage Alzheimer's / dementia patients, and their caregivers.

---

## Tech Stack

| Layer       | Technology                                          |
|-------------|-----------------------------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS + Redux Toolkit      |
| Backend     | Node.js + Express.js + Socket.IO                    |
| Database    | MongoDB Atlas + Mongoose                            |
| AI          | Google Gemini API (summarize, chat, voice, captions)|
| ML          | face-api.js + TensorFlow.js (client-side, private)  |
| Queue       | BullMQ + Redis (reminder scheduling)                |
| Notify      | Web Push + Twilio SMS + Nodemailer                  |
| Media       | Cloudinary (journal photos)                         |
| Auth        | JWT + bcrypt + httpOnly cookies                     |
| Security    | Helmet + CORS + Rate limit + AES encryption         |

---

## Features

| Module                  | Description                                             |
|-------------------------|---------------------------------------------------------|
| Daily Memory Assistant  | Ask "What happened yesterday?" — Gemini answers from logs|
| Medicine Reminders      | Scheduled alerts, voice confirmation, caregiver escalation|
| Family Recognition      | face-api.js in browser — private, no raw images uploaded |
| Appointment Manager     | Today's schedule, Gemini reads it aloud                 |
| Voice Assistant         | Speak any command — Gemini parses intent → action       |
| Cognitive Tests         | Recall objects, identify day — score trends tracked     |
| Memory Journal          | Photo uploads + AI-generated captions                   |
| Caregiver Dashboard     | Live alerts, compliance charts, AI daily summary        |
| Anomaly Detection       | Rule-based + z-score ML risk scoring, auto-escalation   |
| Family Members          | Register family with memory notes, log visits           |

---

## Project Structure

```
memoryvault-ai/
├── client/                         # React frontend (Vite)
│   ├── public/
│   │   ├── manifest.json           # PWA manifest
│   │   └── models/                 # face-api.js model files (download separately)
│   └── src/
│       ├── api/                    # Axios API wrappers
│       │   ├── axios.js            # Base axios instance with auth interceptor
│       │   ├── auth.api.js
│       │   ├── medication.api.js
│       │   ├── appointment.api.js
│       │   ├── ai.api.js
│       │   ├── alert.api.js
│       │   ├── journal.api.js
│       │   └── test.api.js
│       ├── store/                  # Redux Toolkit
│       │   ├── index.js
│       │   └── authSlice.js
│       ├── hooks/                  # Custom React hooks
│       │   ├── useSpeech.js
│       │   └── useSocket.js
│       ├── services/               # Client-side services
│       │   ├── speech.js           # Web Speech API wrapper
│       │   ├── socket.js           # Socket.IO client
│       │   └── faceRecognition.js  # face-api.js wrapper
│       ├── components/
│       │   ├── common/
│       │   │   ├── Navbar.jsx
│       │   │   ├── ProtectedRoute.jsx
│       │   │   └── LoadingSpinner.jsx
│       │   ├── elderly/
│       │   │   ├── MedicineCard.jsx
│       │   │   ├── AppointmentCard.jsx
│       │   │   └── MemorySummary.jsx
│       │   ├── caregiver/
│       │   │   ├── AlertCard.jsx
│       │   │   ├── ComplianceChart.jsx
│       │   │   └── MoodTrend.jsx
│       │   └── voice/
│       │       └── VoiceCapture.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Home.jsx
│       │   ├── Medicines.jsx
│       │   ├── MemoryAssistant.jsx
│       │   ├── VoiceMode.jsx
│       │   ├── Journal.jsx
│       │   ├── CognitiveTests.jsx
│       │   ├── FaceRecognition.jsx
│       │   ├── FamilyMembers.jsx
│       │   └── CaregiverDashboard.jsx
│       ├── styles/
│       │   └── index.css
│       ├── App.jsx
│       └── main.jsx
│
├── server/                         # Node/Express backend
│   └── src/
│       ├── config/
│       │   ├── db.js               # MongoDB connection
│       │   ├── redis.js            # Redis connection
│       │   ├── socket.js           # Socket.IO setup
│       │   └── cloudinary.js       # Cloudinary config
│       ├── models/                 # Mongoose schemas
│       │   ├── User.js
│       │   ├── Medication.js
│       │   ├── MedicationLog.js
│       │   ├── Appointment.js
│       │   ├── ActivityLog.js
│       │   ├── FamilyMember.js
│       │   ├── FaceProfile.js
│       │   ├── MemoryJournal.js
│       │   ├── Conversation.js
│       │   ├── Alert.js
│       │   ├── CognitiveTest.js
│       │   ├── AnomalyScore.js
│       │   └── VoiceCommand.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── user.controller.js
│       │   ├── medication.controller.js
│       │   ├── appointment.controller.js
│       │   ├── activityLog.controller.js
│       │   ├── ai.controller.js
│       │   ├── journal.controller.js
│       │   ├── alert.controller.js
│       │   ├── face.controller.js
│       │   ├── test.controller.js
│       │   └── family.controller.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── user.routes.js
│       │   ├── medication.routes.js
│       │   ├── appointment.routes.js
│       │   ├── activityLog.routes.js
│       │   ├── ai.routes.js
│       │   ├── journal.routes.js
│       │   ├── alert.routes.js
│       │   ├── face.routes.js
│       │   ├── test.routes.js
│       │   └── family.routes.js
│       ├── middleware/
│       │   ├── auth.middleware.js
│       │   ├── error.middleware.js
│       │   └── upload.middleware.js
│       ├── services/
│       │   ├── gemini.service.js
│       │   ├── notification.service.js
│       │   ├── anomaly.service.js
│       │   ├── face.service.js
│       │   ├── reminder.service.js
│       │   ├── ml.service.js
│       │   └── voice.service.js
│       ├── jobs/
│       │   ├── medicineReminder.job.js
│       │   ├── anomalyCheck.job.js
│       │   └── inactivityCheck.job.js
│       ├── prompts/
│       │   ├── memory.prompt.js
│       │   └── voice.prompt.js
│       ├── utils/
│       │   ├── token.js
│       │   ├── encrypt.js
│       │   └── asyncHandler.js
│       ├── app.js
│       └── server.js
│
├── docs/
│   ├── api-spec.md
│   ├── architecture.md
│   ├── database-schema.md
│   └── setup-guide.md
│
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## Quick Start

```bash
# 1. Copy env and fill keys
cp .env.example .env

# 2. Install dependencies
cd server && npm install
cd ../client && npm install

# 3. Run
cd server && npm run dev        # :5000
cd client && npm run dev        # :5173
```

See `docs/setup-guide.md` for full setup instructions.

---

## MVP Build Order (Hackathon)

1. Auth + roles
2. Medication module
3. Activity logs
4. Gemini AI summary + chat
5. Voice mode
6. Caregiver dashboard + alerts
7. Anomaly detection
8. Face recognition
9. Memory journal
10. Cognitive tests

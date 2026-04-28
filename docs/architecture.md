# MemoryVault AI — System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  React (Vite) + Tailwind CSS + Redux Toolkit                    │
│                                                                  │
│  Pages:                  Services:          ML (Browser):       │
│  • Home                  • speech.js        • face-api.js       │
│  • Medicines             • socket.js        • TensorFlow.js     │
│  • MemoryAssistant       • faceRecognition  • MediaPipe         │
│  • VoiceMode                                                    │
│  • Journal               Components:                            │
│  • CognitiveTests        • MedicineCard     Hooks:              │
│  • FaceRecognition       • AlertCard        • useSpeech         │
│  • FamilyMembers         • ComplianceChart  • useSocket         │
│  • CaregiverDashboard    • MoodTrend                            │
└──────────────────┬──────────────────────────────────────────────┘
                   │ HTTP REST + Socket.IO
┌──────────────────▼──────────────────────────────────────────────┐
│                       BACKEND LAYER                             │
│  Node.js + Express.js                                           │
│                                                                  │
│  Routes → Controllers → Services → Models                       │
│                                                                  │
│  Services:                        Jobs (node-cron):             │
│  • gemini.service.js              • medicineReminder.job        │
│  • notification.service.js        • anomalyCheck.job            │
│  • anomaly.service.js             • inactivityCheck.job         │
│  • face.service.js                                              │
│  • reminder.service.js            Middleware:                   │
│  • ml.service.js                  • JWT auth                    │
│  • voice.service.js               • Rate limiting               │
│                                   • Error handler               │
└──────┬─────────────────┬─────────────────┬───────────────────┬─┘
       │                 │                 │                   │
┌──────▼────┐   ┌────────▼────────┐  ┌────▼──────┐  ┌────────▼────┐
│  MongoDB  │   │  Gemini API     │  │   Redis   │  │  Cloudinary │
│  Atlas    │   │  (AI/ML layer)  │  │  (Queue)  │  │  (Media)    │
│           │   │                 │  │  BullMQ   │  │             │
│ 12 colls  │   │ • summarize     │  │           │  │ Journal     │
│ • users   │   │ • chat          │  │           │  │ photos      │
│ • meds    │   │ • parse voice   │  │           │  │             │
│ • logs    │   │ • captions      │  └───────────┘  └────────────┘
│ • alerts  │   │ • caregiver rpt │
└───────────┘   └─────────────────┘
                                            Notifications:
                                            ┌─────────────────┐
                                            │ Socket.IO (live)│
                                            │ Web Push        │
                                            │ Twilio SMS      │
                                            │ Nodemailer      │
                                            └─────────────────┘
```

## Data Flow Examples

### 1. Medicine Reminder Flow
```
node-cron (every min)
  → finds due medications
  → creates MedicationLog (pending)
  → sendReminderToUser()
      → Socket.IO (in-app popup)
      → Web Push (browser notification)
  → 30 min later: if still pending → mark missed
      → escalateToCaregivers()
          → SMS via Twilio
          → Email via Nodemailer
          → Socket.IO to caregiver room
```

### 2. Voice Assistant Flow
```
React (Web Speech API)
  → captures audio → transcript text
  → POST /api/ai/parse-voice-command
      → Gemini API → JSON intent
  → route intent to handler:
      GET_NEXT_MEDICINE → /api/medications/:id/logs
      GET_YESTERDAY_SUMMARY → /api/ai/ask-memory
      GET_TODAY_SCHEDULE → /api/appointments/:id/today
  → response text → Web Speech SpeechSynthesis (read aloud)
```

### 3. Face Recognition Flow (100% client-side)
```
React webcam → face-api.js
  → detectSingleFace()
  → extractDescriptor() → Float32Array
  → GET /api/faces/:userId → stored encrypted descriptors
      → decrypt on server → send plaintext to client
  → FaceMatcher.findBestMatch()
  → display: "This is your son Rahul 👋"
  → speakText("Welcome Rahul!")
```

### 4. Anomaly Detection Flow
```
node-cron (every hour)
  → runAnomalyChecks(userId)
      → count confusionCount, missedMeds, inactivityHours, nightInteractions
      → ml.service.js → computeAnomalyScore()
          → rule-based score + z-score vs 14-day baseline
      → save AnomalyScore record
      → if thresholds exceeded → create Alert + escalate caregivers
```

## Security Architecture

```
JWT Access Token  (7d)  → in Authorization header + httpOnly cookie
JWT Refresh Token (30d) → httpOnly cookie only
bcrypt (12 rounds)      → password hashing
AES-256               → face descriptor encryption
helmet + cors           → HTTP security headers
express-rate-limit      → 200 req/15min per IP
RBAC (elderly/caregiver/admin) → route-level enforcement
```


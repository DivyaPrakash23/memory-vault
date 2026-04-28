# MemoryVault AI — MongoDB Collections Schema

## Collections Overview

| Collection     | Purpose                                  |
|----------------|------------------------------------------|
| users          | Elderly users, caregivers, admins        |
| medications    | Medicine schedules                       |
| medicationlogs | Dose tracking (taken/missed/pending)     |
| appointments   | Scheduled events and doctor visits       |
| activitylogs   | All daily activity events                |
| familymembers  | Known family members per user            |
| faceprofiles   | Encrypted face descriptors               |
| memoryjournals | Photo memories with AI captions          |
| conversations  | Chat history with AI assistant           |
| alerts         | Caregiver alerts and notifications       |
| cognitivetests | Brain test results and scores            |
| anomalyscores  | Daily ML risk scores per user            |
| voicecommands  | Voice command logs with parsed intents   |

## Key Indexes

```javascript
// Activity logs — most frequent query pattern
activitylogs: { userId: 1, occurredAt: -1 }

// Conversations per session
conversations: { userId: 1, sessionId: 1 }

// Unresolved alerts per user
alerts: { userId: 1, resolved: 1 }

// Pending medication logs
medicationlogs: { userId: 1, status: 1, scheduledTime: -1 }
```

## Relationships

```
User (elderly)
  ├── Medications[]         (userId ref)
  │     └── MedicationLogs[] (medicationId + userId refs)
  ├── Appointments[]        (userId ref)
  ├── ActivityLogs[]        (userId ref)
  ├── FamilyMembers[]       (userId ref)
  │     └── FaceProfiles[]  (userId + familyMemberId refs)
  ├── MemoryJournals[]      (userId ref)
  ├── Conversations[]       (userId ref)
  ├── Alerts[]              (userId ref)
  ├── CognitiveTests[]      (userId ref)
  └── AnomalyScores[]       (userId ref)

User (caregiver)
  └── caregiverIds[] on User (elderly) — bidirectional link
```
EOF

cat > /home/claude/memoryvault-ai/docs/setup-guide.md << 'EOF'
# MemoryVault AI — Setup Guide

## Prerequisites
- Node.js >= 18
- MongoDB Atlas account (free tier works)
- Redis (local or Upstash free tier)
- Google AI Studio API key (Gemini)
- Cloudinary account (free tier)
- Twilio account (optional, for SMS)
- Gmail app password (optional, for email)

## 1. Clone & Install

```bash
git clone <your-repo>
cd memoryvault-ai

# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

## 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your actual keys
```

**Required keys to get started:**
- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — any random 32+ char string
- `JWT_REFRESH_SECRET` — different random 32+ char string
- `GEMINI_API_KEY` — from https://aistudio.google.com
- `ENCRYPTION_KEY` — exactly 32 characters for face descriptor encryption

**Optional (for full features):**
- `REDIS_URL` — Redis connection (reminder scheduling)
- `CLOUDINARY_*` — for journal photo uploads
- `TWILIO_*` — for caregiver SMS alerts
- `EMAIL_USER/PASS` — for email escalation
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` — for Web Push
  - Generate with: `npx web-push generate-vapid-keys`

## 3. Face Recognition Models

Download face-api.js models and place in `client/public/models/`:
```bash
# Download from:
# https://github.com/justadudewhohacks/face-api.js/tree/master/weights
# Required files:
# - tiny_face_detector_model-weights_manifest.json + shard1
# - face_landmark_68_tiny_model-weights_manifest.json + shard1
# - face_recognition_model-weights_manifest.json + shard1 + shard2
```

## 4. Run Development

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Visit: http://localhost:5173

## 5. First Steps

1. Register as **Elderly User** → use the full app
2. Register another account as **Caregiver** → access `/dashboard`
3. Copy the elderly user's MongoDB `_id` into the caregiver dashboard to start monitoring

## 6. Docker (Optional)

```bash
docker-compose up --build
```

## 7. Production Deployment

| Service    | Platform              |
|------------|-----------------------|
| Frontend   | Vercel / Netlify      |
| Backend    | Railway / Render      |
| Database   | MongoDB Atlas         |
| Redis      | Upstash               |
| Media      | Cloudinary            |

Set `FRONTEND_URL` in backend env to your deployed frontend URL.
Set `VITE_API_URL` in client env to your deployed backend URL.

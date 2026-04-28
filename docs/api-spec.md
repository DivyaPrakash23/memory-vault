# MemoryVault AI — API Reference

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

---

## Auth
| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| POST   | /auth/register     | Register new user  |
| POST   | /auth/login        | Login              |
| GET    | /auth/me           | Get current user   |
| POST   | /auth/refresh      | Refresh token      |
| POST   | /auth/logout       | Logout             |

**Register body:**
```json
{ "fullName":"Savitri Devi", "email":"s@example.com", "password":"abc123", "role":"elderly", "age":72 }
```

---

## Users
| Method | Endpoint                   | Description              |
|--------|----------------------------|--------------------------|
| GET    | /users/:id                 | Get user profile         |
| PUT    | /users/:id                 | Update profile           |
| PUT    | /users/:id/preferences     | Update preferences       |
| POST   | /users/:id/push-subscribe  | Save push subscription   |

---

## Medications
| Method | Endpoint                            | Description             |
|--------|-------------------------------------|-------------------------|
| POST   | /medications                        | Add medication          |
| GET    | /medications/:userId                | Get all medications     |
| GET    | /medications/:userId/logs           | Get today's med logs    |
| PUT    | /medications/:medicationId          | Update medication       |
| DELETE | /medications/:medicationId          | Deactivate medication   |
| POST   | /medications/:medicationId/confirm  | Confirm dose taken      |

**Create body:**
```json
{ "userId":"...", "name":"Amlodipine", "dose":"5mg", "times":["08:00","20:00"], "instructions":"After breakfast" }
```

---

## Appointments
| Method | Endpoint                      | Description           |
|--------|-------------------------------|-----------------------|
| POST   | /appointments                 | Create appointment    |
| GET    | /appointments/:userId         | All appointments      |
| GET    | /appointments/:userId/today   | Today's appointments  |
| PUT    | /appointments/:id             | Update                |
| DELETE | /appointments/:id             | Delete                |

---

## Activity Logs
| Method | Endpoint                        | Description          |
|--------|---------------------------------|----------------------|
| POST   | /activity-logs                  | Create log entry     |
| GET    | /activity-logs/:userId          | Get all logs         |
| GET    | /activity-logs/:userId/yesterday| Yesterday's logs     |

**Log types:** `meal`, `visit`, `task`, `confusion_question`, `mood`, `note`, `wake_event`, `hydration`

---

## AI Endpoints
| Method | Endpoint                          | Description                  |
|--------|-----------------------------------|------------------------------|
| POST   | /ai/ask-memory                    | Ask about past activity logs |
| POST   | /ai/chat                          | Conversational AI chat       |
| POST   | /ai/parse-voice-command           | Parse voice to JSON intent   |
| POST   | /ai/summarize-day                 | Full day summary              |
| POST   | /ai/generate-memory-caption       | AI journal caption           |
| POST   | /ai/caregiver-report              | AI daily caregiver summary   |

**ask-memory body:**
```json
{
  "userId": "...",
  "question": "What happened yesterday?",
  "dateRange": { "start": "2025-01-01T00:00:00Z", "end": "2025-01-01T23:59:59Z" }
}
```

---

## Journal
| Method | Endpoint              | Description               |
|--------|-----------------------|---------------------------|
| POST   | /journal/upload       | Upload photo + get caption|
| GET    | /journal/:userId      | Get all journal entries   |
| DELETE | /journal/:id          | Delete entry              |

---

## Alerts
| Method | Endpoint             | Description          |
|--------|----------------------|----------------------|
| GET    | /alerts/:userId      | Get unresolved alerts|
| POST   | /alerts/resolve/:id  | Mark as resolved     |

**Alert types:** `missed_medicine`, `inactivity`, `repeated_confusion`, `unusual_behavior`, `mood_drop`

---

## Face Recognition
| Method | Endpoint             | Description                    |
|--------|----------------------|--------------------------------|
| POST   | /faces/register      | Save encrypted face descriptor |
| GET    | /faces/:userId       | Get all face profiles          |
| DELETE | /faces/:id           | Delete face profile            |

---

## Cognitive Tests
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | /tests/submit             | Submit test result       |
| GET    | /tests/:userId/trends     | Get score trend          |

**Test types:** `recall_3_objects`, `identify_day`, `sequence_memory`, `visual_matching`, `reaction_test`

---

## Family Members
| Method | Endpoint                | Description          |
|--------|-------------------------|----------------------|
| POST   | /family                 | Add family member    |
| GET    | /family/:userId         | Get all members      |
| PUT    | /family/:id             | Update member        |
| DELETE | /family/:id             | Remove member        |
| POST   | /family/:id/visit       | Log a visit          |

---

## Socket.IO Events

### Client → Server
| Event       | Payload         | Description        |
|-------------|-----------------|-------------------|
| `join_room` | `userId: string` | Join user's room  |

### Server → Client
| Event          | Payload                          | Description              |
|----------------|----------------------------------|--------------------------|
| `notification` | `{ type, title, body }`         | Medicine/general reminder|
| `notification` | `{ type:"caregiver_alert", message }` | Alert for caregiver |

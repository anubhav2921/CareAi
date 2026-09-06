# Notifications & Reminders

## Notification abstraction

Don't hardcode `send_whatsapp()` calls throughout the codebase. Route
everything through one service:

```
Notification Service
       │
       ├── Email Provider
       ├── WhatsApp Provider
       └── Push Notification
```

Backend call site stays generic:

```python
send_notification(user, notification_type, payload)
```

The notification service decides the channel based on user preference and
notification type.

## Delivery integration notes

- **Email:** transactional email provider.
- **WhatsApp:** requires integrating an appropriate WhatsApp Business
  Platform/API provider and following its messaging and consent
  requirements. Treat WhatsApp as a delivery/notification layer, not a core
  architectural dependency.
- Users choose their preferred channel(s) in Settings; delivery preference
  is per-user, per-notification-type.

## Reminder architecture

```
Reminder → PostgreSQL → Scheduler → Queue → Notification Worker →
Email / WhatsApp / Push
```

`reminders` table:

```
id, user_id, report_id, title, scheduled_at, timezone, channel, status, created_at
```

Flow:

```
10:00 AM (scheduler tick)
   ↓
Scheduler finds due reminders (Celery Beat)
   ↓
Creates notification job
   ↓
Worker sends it
```

Example user-facing intents this should support:
- "Remind me to discuss this report with my doctor next week."
- "Remind me to review my follow-up test in three months."

The user always controls what gets reminded — reminders are opt-in per
report/finding, never auto-created without confirmation.

# DPWorks-AI: Common Features Across All Chapters

This document outlines the universal features and standards that apply to every chapter in the DPWorks-AI system. These ensure consistency, user-friendliness, and a seva-driven experience.

---

## ✅ Universal Features Checklist

| Feature                          | Purpose                                  | Implementation Details |
|----------------------------------|------------------------------------------|-------------------------|
| 🔁 **Back, Back Main, Reset**    | User navigation and safety               | `back → flowHistory.goBack()`, `back main → reset state`, `reset → fresh start` |
| 💾 **Step Tracking**             | Supports "back" and analytics            | `flowHistory.saveStep(from, step, prompt)` for every prompt |
| 📝 **Dialog Logging**            | Audit trail for input/output             | `Dialog.create({ phone, userId, input, response, flow, role })` |
| 💬 **Bilingual Prompts**         | Accessibility in Odia + English          | Every message has both languages |
| 🧑‍🌾 **Tone Personalization**     | Respectful and familiar salutation       | `getSalutation(user)` for Bhai, Maa, etc. |
| 🛂 **Role-aware Responses**       | Customized logic by user role            | `user.role` (volunteer, admin, etc.) branches logic |
| 🧠 **Memory-safe State**         | Prevent user from getting stuck          | Support reset, handle missing states gracefully |
| 🔒 **Admin Visibility Hooks**     | Escalate issues or corrections           | Logs to `VisitLog`, `Dialog`, flags, etc. |
| 👁️ **Invisible Logging**          | Log without affecting user UX            | Silent `Dialog.create()` at each step |
| 📅 **Date Awareness**             | Ensure daily freshness and rotation      | `moment.tz(...).format('YYYY-MM-DD')` |
| 🌞 **Time Awareness**             | Restrict or modify flows by time         | e.g., Horoscope: 6–9AM window |
| 🌐 **Fallback Safety**           | Resilience against network/API issues    | Fallback to generic prompt or cache |
| 🧍‍♀️ **Walk-of-Life Sensitivity** | Gender/age-sensitive responses           | Adjust tone for women, children, elders |
| 🚨 **Escalation Hooks**          | Critical flags routed to Chapter 11      | BLEED mode triggers or feedback flags |
| 🎯 **Modular Chapter Structure**  | Code maintainability                     | Each flow in its own file with clean exports |
| 🌱 **Divine Seva Tone**           | Warmth, spirituality, and purpose        | Avoid "bot-speak" — responses feel loving and human |

---

## 🔐 Every Chapter Must:

- Begin with checks for:
  ```js
  if (inputLower === 'reset') {...}
  if (inputLower === 'back') {...}
  if (inputLower === 'back main' || inputLower === 'exit') {...}
  ```

- Call `flowHistory.saveStep(...)` before every user-facing prompt
- Log every question and user reply via `Dialog.create(...)`
- Respond with bilingual, spiritually-rooted tone
- Provide graceful exit/reset paths at every step

---

## 🔁 Cross-Chapter Integrations

| Condition                          | Redirected Chapter        |
|-----------------------------------|----------------------------|
| Need Help (health, finance)       | → Chapter 10              |
| Complaint / Feedback emotional    | → Chapter 11              |
| DP App update needed              | → Reminder via Chapter 6  |

---

This document should be kept updated whenever any global design rule or standard is added.

*Joyguru.*


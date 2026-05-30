# OrgDon

**A mobile-first platform for organ donor registration and hospital mapping.**

OrgDon was built to address a real gap — organ donation registration is fragmented, buried in government portals, and designed without the people who need it most in mind. This project reimagines that experience: clear, humane, and fast, whether you're a first-time donor, a family member, or a hospital administrator coordinating logistics under pressure.

---

## What it does

**Donor Registration**
A guided, single-question-per-screen registration flow that walks donors through the process without overwhelming them. Medical and legal language is rewritten in plain English at every step. Progress is always visible. The experience is designed to feel human, not institutional.

**Hospital Mapping**
A searchable, filterable map interface for locating nearby hospitals by specialization, availability, and distance. Critical information — contact details, organ specializations, availability indicators — is surfaced immediately, never buried.

**Cross-team architecture**
Built with a clean separation between layout, data, and presentation layers to support a multi-contributor codebase. Components are documented and reusable across both the donor and admin-facing flows.

---

## Why it was built this way

Most health platforms default to clinical blues, dense forms, and bureaucratic language — a visual and verbal register that adds friction to an already difficult process. OrgDon deliberately breaks from that pattern.

The visual system uses a warm, restrained palette. The registration flow is broken into digestible steps with explicit progress tracking. The mapping interface is optimized for speed — filters are persistent, the most important information is always one tap away.

The design principle throughout: **reduce cognitive load in a high-stakes emotional context.**

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Python, REST API |
| Build | Vite |
| Deployment | Vercel |

---

## Running locally

```bash
# Clone the repository
git clone https://github.com/EmanMukhtar/OrgDon-

# Install dependencies
cd OrgDon-
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

For the backend API, navigate to the `/api` directory and follow the setup instructions in the backend README.

---

## Project status

This is a working prototype covering the full donor registration flow and hospital mapping interface. The frontend is connected to a Python backend API. Designed and built as a cross-team project — I owned the full product design, component architecture, and frontend engineering.

---

## Design decisions worth noting

- **Single-question screens** in the registration flow — keeps the user focused, reduces drop-off
- **Plain-language rewrites** of all medical and legal copy — tested with first-time users, consistently described as "actually understandable"
- **Persistent filters** on the hospital map — never reset between sessions, reducing repeated work for frequent users
- **Warm palette over clinical blues** — a deliberate departure from the visual language of institutional health products

---

## Author

**Eman Mukhtar** — Design Engineer & Full-Stack Developer
[Portfolio](https://eman-eight.vercel.app) · [LinkedIn](https://www.linkedin.com/in/eman-mukhtar) · [emanmukhtar5@gmail.com](mailto:emanmukhtar5@gmail.com)

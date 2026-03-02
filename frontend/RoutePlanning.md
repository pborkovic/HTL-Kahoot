//Bitte hier weitermachen mit erstellen der directorys
/*
app/
├── globals.css              # Globale Styles
├── layout.tsx               # Root Layout (HTML/Body Tags)
├── page.tsx                 # [Issue 1] Login / Startseite (OAuth Button)
│
├── (auth)/                  # Route Group für Auth-Logik (optional, für Sauberkeit)
│   └── error/               # Fehlerseite bei Login-Problemen
│       └── page.tsx
│
├── join/                    # [Issue 2] GameCode Eingabe (Schüler Start)
│   └── page.tsx             # Input-Feld + QR-Code Scanner Button
│
├── play/                    # Bereich für das aktive Schüler-Spiel
│   └── [gameCode]/          # Dynamische Route (z.B. /play/123456)
│       ├── lobby/           # [Issue 9] Schüler Lobby (Wartebereich)
│       │   └── page.tsx
│       ├── game/            # [Issue 3] Quiz Ansicht (Frage für Frage)
│       │   └── page.tsx
│       └── results/         # [Issue 4] Abschluss Ansicht Schüler (Platzierung)
│           └── page.tsx
│
├── teacher/                 # Geschützter Bereich für Lehrer
│   ├── layout.tsx           # Lehrer-Layout (z.B. Sidebar/Header Menü)
│   ├── dashboard/           # [Issue 5] Quiz Editor & Übersicht
│   │   └── page.tsx         # Liste der Quizze, Fragenauswahl Setup, Lobby eröffnen Knopf
│   ├── editor/ -> VORERST NOCH AUSGELASSEN!!!
│   │   └── [quizId]/        # Editor für spezifisches Quiz
│   │       └── page.tsx     # Fragenpool, Drag&Drop Import, Einstellungen
│   └── session/             # Bereich für laufende Spiele (Lehrer-Sicht)
│       └── [gameCode]/
│           ├── lobby/       # [Issue 9] Lehrer Lobby (Spielerliste, Start-Button)
│           │   └── page.tsx
│           ├── live/        # [Issue 7] Lehrer Quiz Ansicht (Live Ergebnisse)
│           │   └── page.tsx
│           └── results/     # [Issue 8] Abschluss Ansicht Lehrer (Tabelle, Excel Export)
│               └── page.tsx
│
├── admin/                   # Geschützter Bereich für Admins
│   ├── layout.tsx           # Admin-Layout
│   ├── dashboard/           # [Issue 10] Admin Dashboard (Kacheln)
│   │   └── page.tsx
│   └── users/               # [Issue 11] Userverwaltung
│       └── page.tsx         # Tabelle, Suche, Rollen zuweisen
│
└── api/                     # Backend API Routes (Next.js spezifisch)
    └── auth/
        └── [...nextauth]/   # [Issue 1] NextAuth / Microsoft Entra ID Handler
            └── route.ts

*/

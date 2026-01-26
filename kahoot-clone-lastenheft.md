- # 📘 **Lasten- und Pflichtenheft – Kahoot‑ähnliche Quizplattform**
  *(Version 1.1 – Optimierte Fassung)*
  
  # **1. Lastenheft (Was soll gebaut werden?)**
  
  ## **1.1 Zielsetzung des Systems**
  Die Plattform soll ein interaktives, webbasiertes Quizsystem bereitstellen, das Live‑Quizze wie Kahoot ermöglicht, jedoch mit erweiterten Funktionen für Schulen, Lehrer, Administratoren und Bildungseinrichtungen.  
  Schwerpunkte:
  
  - Benutzerfreundlichkeit  
  - Sicherheit  
  - Erweiterbarkeit  
  - LMS‑Integration  
  - Open‑Source‑Bereitstellung unter **AGPL3**
  
  ## **1.2 Zielgruppen**
  - **Schüler** (Teilnehmer)
  - **Lehrer** (Ersteller & Durchführer von Quizzen)
  - **Administratoren** (Systemverwaltung)
  - **Superadministratoren** (technische Gesamtverwaltung)
  - **Optionale Rollen** (Tutor, Moderator, Externe)

  ## **1.3 Muss‑Anforderungen**

  ### **1.3.1 Fragenformate**
  Das System muss folgende Fragetypen unterstützen:
  
  - Kurzantwort (mehrere gültige Lösungen)
  - Ja/Nein
  - Multiple Choice (Single-/Multiple-Answer)
  - Zuordnen (Matching)
  - Richtige Reihenfolge
  - Numerische Antwort (Range)
  - Kategorisierung
  - Erweiterbare Fragetypen (Plugin‑System)
  
  **Zusatzanforderungen:**
  - Gewichtung pro Frage  
  - Zeitlimit pro Frage  
  - Randomisierung von Antwortoptionen  
  - Medienunterstützung (Bild, Audio, Video)

  ### **1.3.2 Quiz-Funktionen**
  - Quizze aus Fragenpools generierbar  
  - Zufallsfragen (gleich/individuell)  
  - Zeitsteuerung (pro Frage, Gesamtzeit, Bufferzeit)  
  - Punkte- und Speed-System  
  - Lucky-Gamble-Funktion  
  - Teilnahme via QR-Code oder Game-PIN  
  - Import/Export:
    - JSON (Fragen, Quizze, Ergebnisse)
    - GIFT-Format (kompatibel zu Moodle)
  
  ### **1.3.3 Benutzerverwaltung & Login**
  - Login über **Microsoft Entra ID (OIDC)**
  - Lokale Admin-Accounts
  - Rollenmodell:
    - Schüler  
    - Lehrer  
    - Admin  
    - Superadmin  
  - Rechtematrix konfigurierbar

  ### **1.3.4 Backend-WebUI**
  - Verwaltung von Fragen, Pools und Quizzen  
  - Moderner Frageneditor  
  - Live-Preview  
  - Versionierung  
  - Such- und Filterfunktionen  
  
  ### **1.3.5 Auswertung**
  - Punkteberechnung  
  - Prozentuale Auswertung  
  - Export der Ergebnisse  
  - Statistiken:
    - Antwortverteilung  
    - Schwierigkeit  
    - Durchschnittszeit  
    - Teilnehmerübersicht  
  
  ### **1.3.6 Sicherheit**
  - PostgreSQL  
  - Argon2id Hashing  
  - reCAPTCHA  
  - 2FA optional  
  - Schutz vor XSS, CSRF, SQLi  
  - Rate-Limiting  
  - Mehrfach-Login-Sperre für Schüler  
  
  ### **1.3.7 Allgemeine Anforderungen**
  - Barrierefreiheit  
  - Mobile Unterstützung  
  - Anpassbare Designs  
  - Feedback-Funktion  
  - Optional: LMS-Integration  
  - Open Source unter **AGPL3**
  
  ## **1.4 Kann‑Anforderungen**
  - LTI 1.3 Integration  
  - Offline-Modus  
  - Mandantenfähigkeit  
  - Erweiterte Statistiken  
  
  ## **1.5 Abgrenzung**
  Nicht Bestandteil der ersten Version:
  - Native Mobile Apps  
  - KI-Fragen  
  - Gamification-Avatare  
  
  ---

  # **2. Pflichtenheft (Wie wird es umgesetzt?)**

  ## **2.1 Systemarchitektur**
  
  ### **2.1.1 Technologiestack**
  - **Backend:** Laravel oder Next.js  
  - **Frontend:** Next.js  
  - **Echtzeit:** WebSockets  
  - **Datenbank:** PostgreSQL  
  - **Auth:** OIDC (Entra ID), PKCE  
  - **Containerisierung:** Docker  
  
  ---
  
  ## **2.2 Datenmodell**
  
  ### **2.2.1 Haupttabellen**
  | Tabelle                | Zweck                    |
  | ---------------------- | ------------------------ |
  | `users`                | Benutzerkonten           |
  | `roles`                | Rollenverwaltung         |
  | `permissions`          | Rechte                   |
  | `questions`            | Fragenstammdaten         |
  | `question_versions`    | Versionierung            |
  | `question_pools`       | Fragenpools              |
  | `quizzes`              | Quizdefinitionen         |
  | `quiz_questions`       | Zuordnung Quiz → Fragen  |
  | `sessions`             | Live-Durchführungen      |
  | `session_participants` | Teilnehmer einer Session |
  | `responses`            | Antworten der Schüler    |
  | `feedback`             | Feedback zu Fragen       |
  
  ---
  
  ## **2.3 Funktionsspezifikation**
  
  ### **2.3.1 Frageneditor**
  - Step-by-step UI  
  - Live-Vorschau  
  - Drag & Drop  
  - Medienupload  
  - Validierung  
  - Versionierung  
  
  ### **2.3.2 Quizdurchführung**
  - Session starten  
  - PIN/QR generieren  
  - Schüler beitreten  
  - Echtzeit-Updates  
  - Anti-Cheating  
  
  ### **2.3.3 Punkteberechnung**
  
  ```
  score = base_points * weight * speed_factor
  ```
  
  Speed-Faktor:
  - 0.8 – 1.0  
  - pro Frage änderbar  
  - global deaktivierbar  
  
  Lucky-Gamble:
  - X Nutzungen pro Quiz  
  
  ### **2.3.4 Import/Export**
  - JSON-Schema  
  - Validierungsreport  
  - Export von Fragen, Quizzen, Ergebnissen  
  - GIFT-Import/Export  

  ### **2.3.5 Sicherheit**
  - Argon2id  
  - CSP  
  - Rate-Limiting  
  - Audit-Logs  
  - reCAPTCHA  
  - Mehrfach-Login-Sperre  

  ---
  
  ## **2.4 UX-Anforderungen**
  - Mobile-first  
  - Große Buttons  
  - Barrierefrei  
  - Lehrer-UI übersichtlich  
  - Themes via CSS-Variablen  

  ---
  
  ## **2.5 Tests**
  
  ### **2.5.1 Funktionale Tests**
  - Fragearten  
  - Quizstart/Stop  
  - Punkteberechnung  
  - Rollenrechte  
  
  ### **2.5.2 Sicherheitstests**
  - OWASP Top 10  
  - Penetrationstest  
  - Lasttest (≥ 500 Schüler)  
  - Statische Codeanalyse  
  - Authentifizierungstests  
  - Zugriffskontrolltests  
  - Verschlüsselungstests  
  - Drittanbieter-Check  
  - CI/CD-Security-Integration  

  ---
  
  # **3. CI/CD**
  - GitHub Actions / GitLab CI  
  - Automatisierte Tests  
  - Docker-Builds  
  - Deployment-Pipeline  

  ---

  # **4. Docker & Deployment**
  
  ## **4.1 Docker**
  - Backend, Frontend, DB als Container  
  - Reverse Proxy (Traefik/Nginx)  
  - Volumes für DB, Uploads, Logs  

  ## **4.2 Deployment auf Hetzner**
  ### **Option A: Hetzner Cloud (empfohlen)**
  - Docker Compose  
  - Reverse Proxy  
  - Firewall  
  - CI/CD Deployment  

  ### **Option B: Shared Hosting (nicht empfohlen)**
  - Kein Docker  
  - Kein WebSocket-Support  
  - Nur PHP-Deployment  
  
  ---
  
  # **5. Links**
  - Moodle Questionnaire (Plugin-Seite): https://moodle.org/plugins/mod_questionnaire  
  - Moodle Questionnaire (MoodleDocs): https://docs.moodle.org/en/Questionnaire_module  
  - GIFT Format (MoodleDocs): https://docs.moodle.org/en/GIFT_format  





---

# **GitLab Repository Template (struktur \+ Dateien)**

Nachfolgend bekommst du ein vollständiges Template, das du direkt als Repository anlegen kannst.

## 📁 **Repository-Struktur**

text

Kopieren

```
quiz-platform/
│
├── backend/
│   ├── app/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   ├── tests/
│   ├── Dockerfile
│   └── composer.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── next.config.js
│   ├── package.json
│   └── Dockerfile
│
├── docker/
│   ├── nginx/
│   │   ├── default.conf
│   │   └── Dockerfile
│   └── traefik/
│       ├── traefik.yml
│       └── dynamic_conf.yml
│
├── docker-compose.yml
├── .gitlab-ci.yml
├── README.md
└── LICENSE

```

# ⚙️ **docker-compose.yml (Template)**

yaml

Kopieren

```
version: "3.9"

services:
  backend:
    build: ./backend
    container_name: quiz_backend
    env_file: .env
    depends_on:
      - db
    networks:
      - quiznet

  frontend:
    build: ./frontend
    container_name: quiz_frontend
    depends_on:
      - backend
    networks:
      - quiznet

  db:
    image: postgres:16
    container_name: quiz_db
    environment:
      POSTGRES_DB: quiz
      POSTGRES_USER: quizuser
      POSTGRES_PASSWORD: quizpass
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - quiznet

  nginx:
    build: ./docker/nginx
    container_name: quiz_nginx
    ports:
      - "80:80"
    depends_on:
      - frontend
    networks:
      - quiznet

networks:
  quiznet:

volumes:
  pgdata:

```

# 🔧 **.gitlab-ci.yml (CI/CD Template)**

yaml

Kopieren

```
stages:
  - build
  - test
  - security
  - deploy

variables:
  DOCKER_DRIVER: overlay2

build_backend:
  stage: build
  script:
    - docker build -t quiz-backend ./backend

build_frontend:
  stage: build
  script:
    - docker build -t quiz-frontend ./frontend

php_tests:
  stage: test
  script:
    - cd backend
    - composer install
    - php artisan test

js_tests:
  stage: test
  script:
    - cd frontend
    - npm install
    - npm run test

security_scan:
  stage: security
  script:
    - echo "Running security scan"
    - snyk test || true

deploy:
  stage: deploy
  script:
    - echo "Deploying to server"
    - ssh $DEPLOY_USER@$DEPLOY_HOST "cd /srv/quiz && docker-compose pull && docker-compose up -d"
  only:
    - main

```

# 📘 **README.md (Template)**

markdown

Kopieren

```
# Quiz Platform – Open Source (AGPL3)

Eine moderne, sichere und erweiterbare Quizplattform ähnlich Kahoot.

## Features
- Live-Quiz Sessions
- Fragenpools & Editor
- Microsoft Entra ID Login
- JSON & GIFT Import/Export
- Echtzeit WebSockets
- Docker Deployment

## Installation
```bash
git clone <repo>
docker-compose up -d

```

## Lizenz

AGPL-3.0

Code

Kopieren

```

---

# 🗂️ **LICENSE (AGPL3)**

```text
GNU AFFERO GENERAL PUBLIC LICENSE
Version 3, 19 November 2007

```

_(voller Text kann automatisch von GitLab eingefügt werden)_

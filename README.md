# 📚 StudyApp — MVP

StudyApp er en AI‑drevet studieplattform for studenter som kombinerer notater, planlegging, AI‑oppsummering, quiz‑generering og enkel deling av notater.  
Dette er MVP‑versjonen, bygget for å være rask, fokusert og ekstremt nyttig fra dag én.

---

## 🚀 Funksjoner i MVP

### ✅ Notater
- Opprett, rediger og organiser notater etter fag
- Enkel og rask editor
- Søk i notater
- Lagre notater i Supabase

### ✅ AI‑funksjoner
- **Oppsummer notat** (kort + lang versjon)
- **Generer quiz** basert på notatinnhold
- Resultater lagres i `ai_history`

### ✅ Study Planner Lite
En superenkel planleggingsmodul som gir struktur uten kompleksitet:
- Hovedmål for faget
- Antall uker igjen til eksamen
- Ukens plan (3 punkter)
- Vises både på web og mobil

### ✅ Deling av notater (public link)
- Gjør et notat offentlig med én toggle
- Genererer en unik, offentlig URL
- Read‑only visning
- Perfekt for deling i TikTok, Messenger, Discord osv.

### ✅ Mobilapp (React Native)
- Se fag og notater
- Åpne notater (read‑only + enkel editor)
- Kjør AI‑oppsummering og quiz
- Oppdater Study Planner Lite
- Del notater direkte fra mobil

---

## 🏛️ Arkitektur

```text
WEB (Next.js)          MOBIL (React Native)
- Notater              - Se notater
- AI-funksjoner        - AI-funksjoner
- Planner Lite         - Planner Lite
- Deling               - Deling

                ↓
          SUPABASE
- Auth
- Database (Postgres)
- Storage
- Edge Functions (AI-kall, public notes)

                ↓
        OpenAI / Azure OpenAI
- Oppsummering
- Quiz-generering
## 🗂️ Datamodell

### `users`
| felt | type |
|------|------|
| id | uuid |
| email | text |

### `subjects`
| felt | type |
|------|------|
| id | uuid |
| user_id | uuid |
| name | text |

### `notes`
| felt | type |
|------|------|
| id | uuid |
| user_id | uuid |
| subject_id | uuid |
| content | text |
| is_public | boolean |
| public_id | text |

### `study_plan`
| felt | type |
|------|------|
| user_id | uuid |
| subject_id | uuid |
| goal | text |
| weeks_left | int |
| weekly_plan | text |

### `ai_history`
| felt | type |
|------|------|
| id | uuid |
| user_id | uuid |
| note_id | uuid |
| type | text |
| result | json |

---

## 🧠 AI‑endepunkter (Supabase Edge Functions)

- `/api/ai/summary`  
- `/api/ai/quiz`  
- `/api/notes/public/[public_id]`  
- `/api/study-plan/update`

---

## 📱 Mobilapp (React Native + Expo)

### Skjermer
- Login  
- Dashboard  
- Subjects  
- Notes  
- Note view  
- AI actions  
- Study Planner Lite  
- Settings  

Mobilappen bruker samme Supabase‑instans og samme API‑kall som web.

---

## 🛠️ Teknologi

- **Next.js** (web)  
- **React Native + Expo** (mobil)  
- **Supabase** (auth, database, storage, edge functions)  
- **OpenAI / Azure OpenAI** (AI‑funksjoner)  
- **Tailwind CSS** (web UI)  
- **GitHub** (kode, CI/CD)  
- **Vercel** (web hosting)

---

## ✅ MVP‑mål

- Rask lansering  
- Minimal kompleksitet  
- Høy nytteverdi for studenter  
- Innebygd viralitet (deling)  
- Daglig bruk (planner)  
- Klar for internasjonal skalering  

---

## 📦 Neste steg (post‑MVP)

- Full Study Planner  
- Flashcards  
- Transkribering (Premium+)  
- Offline‑modus i mobilapp  
- Samarbeid i notater  
- Flere språk (11+)  

---

## 📄 Lisens

Proprietær – ikke for distribusjon uten tillatelse.


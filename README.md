# 📚 StudyApp — MVP

StudyApp er en AI‑drevet studieplattform for studenter som kombinerer notater, planlegging, AI‑oppsummering, quiz‑generering og enkel deling av notater.  
Dette er MVP‑versjonen, bygget for å være rask, fokusert og ekstremt nyttig fra dag én.

---

## 🚀 Installasjon og oppsett

### Forutsetninger
- Node.js 18.x eller nyere
- npm eller yarn
- Supabase-konto (gratis tier fungerer)
- OpenAI API-nøkkel (valgfritt for AI-funksjoner)

### Steg 1: Klon repositoriet
```bash
git clone https://github.com/wangensteen-knaplund/Silen-edu.git
cd Silen-edu
```

### Steg 2: Installer avhengigheter
```bash
npm install
```

### Steg 3: Konfigurer miljøvariabler
Lag en `.env.local`-fil i rotmappen basert på `.env.example`:

```bash
cp .env.example .env.local
```

Rediger `.env.local` og legg til dine nøkler:
```env
NEXT_PUBLIC_SUPABASE_URL=din_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=din_supabase_anon_key
OPENAI_API_KEY=din_openai_api_key
```

### Steg 4: Sett opp Supabase database
Kjør følgende SQL i Supabase SQL Editor for å opprette tabeller:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (handled by Supabase Auth)

-- Subjects table
CREATE TABLE subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table
CREATE TABLE notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  public_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study plan table
CREATE TABLE study_plan (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  goal TEXT,
  weeks_left INTEGER DEFAULT 0,
  weekly_plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subject_id)
);

-- AI history table
CREATE TABLE ai_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_history ENABLE ROW LEVEL SECURITY;

-- Subjects policies
CREATE POLICY "Users can view their own subjects" ON subjects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own subjects" ON subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subjects" ON subjects
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own subjects" ON subjects
  FOR DELETE USING (auth.uid() = user_id);

-- Notes policies
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public notes" ON notes
  FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create their own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Study plan policies
CREATE POLICY "Users can view their own study plans" ON study_plan
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own study plans" ON study_plan
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own study plans" ON study_plan
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own study plans" ON study_plan
  FOR DELETE USING (auth.uid() = user_id);

-- AI history policies
CREATE POLICY "Users can view their own AI history" ON ai_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own AI history" ON ai_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Steg 5: Start utviklingsserver
```bash
npm run dev
```

Applikasjonen kjører nå på [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Utviklingsflyt

### Tilgjengelige kommandoer
```bash
npm run dev      # Start utviklingsserver
npm run build    # Bygg for produksjon
npm run start    # Start produksjonsserver
npm run lint     # Kjør ESLint
npm run format   # Formater kode med Prettier
```

### Mappestruktur
```
/app
  /auth
    /login          # Innloggingsside
    /register       # Registreringsside
  /dashboard        # Hovedoversikt
  /subjects         # Fagoversikt
    /[id]           # Fagdetaljer
  /notes
    /[id]           # Notatredigering
  /public
    /[public_id]    # Offentlige notater
  /api
    /ai
      /summary      # AI oppsummering
      /quiz         # AI quiz-generering
  layout.tsx        # Hoved-layout
  page.tsx          # Forside

/components
  Navbar.tsx        # Navigasjonsmeny
  NoteEditor.tsx    # Notatredigering
  SubjectCard.tsx   # Fagkort
  PlannerLite.tsx   # Planleggingsmodul

/lib
  supabaseClient.ts # Supabase klient
  ai.ts             # AI-funksjoner
  utils.ts          # Hjelpefunksjoner

/styles
  globals.css       # Global CSS
```

---

## 🚀 Funksjoner i MVP

### ✅ Notater
- Opprett, rediger og organiser notater etter fag
- Enkel og rask editor
- Lagre notater i Supabase
- Sletting og oppdatering

### ✅ AI‑funksjoner
- **Oppsummer notat** (kort + lang versjon)
- **Generer quiz** basert på notatinnhold
- Resultater lagres i `ai_history`
- Krever OpenAI API-nøkkel

### ✅ Study Planner Lite
En superenkel planleggingsmodul som gir struktur uten kompleksitet:
- Hovedmål for faget
- Antall uker igjen til eksamen
- Ukens plan (3 punkter)
- Knyttet til hvert fag

### ✅ Deling av notater (public link)
- Gjør et notat offentlig med én toggle
- Genererer en unik, offentlig URL
- Read‑only visning
- Perfekt for deling i sosiale medier

### ✅ Autentisering
- E-post og passord registrering
- Sikker innlogging med Supabase Auth
- Automatisk sesjonshåndtering

---

## 🏛️ Arkitektur

```text
WEB (Next.js)
- Notater
- AI-funksjoner
- Planner Lite
- Deling

        ↓
  SUPABASE
- Auth
- Database (Postgres)
- Row Level Security

        ↓
OpenAI / Azure OpenAI
- Oppsummering
- Quiz-generering
```

---

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

## 📦 Deploy til Vercel

### Automatisk deploy
1. Push koden til GitHub
2. Gå til [vercel.com](https://vercel.com)
3. Import prosjektet fra GitHub
4. Legg til miljøvariabler:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
5. Deploy!

### Manuell deploy
```bash
npm run build
vercel --prod
```

---

## 🧠 AI‑endepunkter

### `/api/ai/summary` (POST)
Genererer sammendrag av notatinnhold.

**Request:**
```json
{
  "content": "Notatinnhold...",
  "noteId": "uuid" // valgfritt
}
```

**Response:**
```json
{
  "summary": "Sammendrag av notatet..."
}
```

### `/api/ai/quiz` (POST)
Genererer quiz basert på notatinnhold.

**Request:**
```json
{
  "content": "Notatinnhold...",
  "noteId": "uuid", // valgfritt
  "numQuestions": 5 // valgfritt, standard 5
}
```

**Response:**
```json
{
  "quiz": [
    {
      "question": "Spørsmål...",
      "options": ["A", "B", "C", "D"],
      "correct": 0
    }
  ]
}
```

---

## 🧪 Testing

### Utviklingsmiljø
1. Opprett en Supabase-konto og database
2. Kjør SQL-skriptet for å sette opp tabeller
3. Konfigurer `.env.local` med dine nøkler
4. Start utviklingsserveren: `npm run dev`
5. Gå til `http://localhost:3000`
6. Registrer en ny bruker
7. Test funksjonalitet:
   - Opprett fag
   - Opprett notater
   - Rediger notater
   - Test Study Planner
   - Test deling av notater
   - Test AI-funksjoner (krever OpenAI API-nøkkel)

---

## 🛠️ Teknologi

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Supabase** (auth, database)
- **OpenAI API** (AI-funksjoner)
- **Zustand** (state management)
- **nanoid** (public ID generering)
- **ESLint + Prettier** (kode kvalitet)

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

*(Ikke implementert i denne MVP-versjonen)*

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
- Rich text editor
- Søk i notater
- Kategorier og tags

---

## 🤝 Bidrag

Dette er et proprietært prosjekt. Kontakt eier for bidrag eller samarbeid.

---

## 📄 Lisens

Proprietær – ikke for distribusjon uten tillatelse.

---

## 📞 Support

For spørsmål eller problemer, opprett en issue på GitHub eller kontakt prosjekteier.


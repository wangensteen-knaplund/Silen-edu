# 🛠️ Developer Guide - StudyApp MVP

Dette dokumentet forklarer hvordan du setter opp utviklingsmiljøet og bidrar til StudyApp.

---

## 🚀 Rask start

### 1. Klon repositoriet
```bash
git clone https://github.com/wangensteen-knaplund/Silen-edu.git
cd Silen-edu
```

### 2. Installer avhengigheter
```bash
npm install
```

### 3. Sett opp miljøvariabler
```bash
cp .env.example .env.local
```

Rediger `.env.local` og legg til dine Supabase-nøkler:
```env
NEXT_PUBLIC_SUPABASE_URL=din_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=din_supabase_anon_key
OPENAI_API_KEY=din_openai_key (valgfritt)
```

### 4. Start utviklingsserver
```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000) i nettleseren.

---

## 📁 Prosjektstruktur

```
/app                    # Next.js App Router
  /api                  # API routes
    /ai                 # AI endpoints (summary, quiz)
  /auth                 # Authentication pages
  /dashboard            # Dashboard page
  /subjects             # Subject pages
  /notes                # Note pages
  /public               # Public note sharing
  layout.tsx            # Root layout
  page.tsx              # Home page

/components             # React components
  Navbar.tsx            # Navigation bar
  NoteEditor.tsx        # Note editing component
  SubjectCard.tsx       # Subject card component
  PlannerLite.tsx       # Study planner component

/lib                    # Utility functions
  supabaseClient.ts     # Supabase client
  ai.ts                 # AI functions (OpenAI)
  utils.ts              # Helper functions

/styles                 # Global styles
  globals.css           # Tailwind CSS + custom styles

/public                 # Static assets (if needed)
```

---

## 🧪 Tilgjengelige kommandoer

```bash
npm run dev        # Start utviklingsserver (localhost:3000)
npm run build      # Bygg for produksjon
npm run start      # Start produksjonsserver
npm run lint       # Kjør ESLint
npm run format     # Formater kode med Prettier
```

---

## 🎨 Kode-stil

### TypeScript
- Bruk TypeScript for all kode
- Definer interfaces for komponenter og data
- Unngå `any` - bruk spesifikke typer

### React-komponenter
```tsx
// Eksempel på en komponent
"use client";

import { useState } from "react";

interface MyComponentProps {
  title: string;
  onSave: (value: string) => void;
}

export default function MyComponent({ title, onSave }: MyComponentProps) {
  const [value, setValue] = useState("");

  return (
    <div>
      <h1>{title}</h1>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={() => onSave(value)}>Save</button>
    </div>
  );
}
```

### Styling
- Bruk Tailwind CSS utility classes
- Følg responsive design (mobile-first)
- Bruk dark mode støtte

```tsx
// Eksempel
<div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Tittel
  </h1>
</div>
```

---

## 🗄️ Database

### Supabase tabeller
- `subjects` - Fag
- `notes` - Notater
- `study_plan` - Studieplaner
- `ai_history` - AI-historikk

### Eksempel på database-spørring
```typescript
// Hent alle fag for en bruker
const { data, error } = await supabase
  .from("subjects")
  .select("id, name")
  .eq("user_id", userId)
  .order("name");

// Opprett et nytt notat
const { error } = await supabase
  .from("notes")
  .insert({
    user_id: userId,
    subject_id: subjectId,
    content: content,
  });
```

---

## 🔐 Autentisering

### Sjekk om bruker er logget inn
```typescript
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  // Redirect til login
  router.push("/auth/login");
}
```

### Logg inn
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

### Logg ut
```typescript
await supabase.auth.signOut();
```

---

## 🤖 AI-integrasjon

### Generer sammendrag
```typescript
const response = await fetch("/api/ai/summary", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    content: noteContent,
    noteId: noteId,
  }),
});

const data = await response.json();
console.log(data.summary);
```

### Generer quiz
```typescript
const response = await fetch("/api/ai/quiz", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    content: noteContent,
    noteId: noteId,
    numQuestions: 5,
  }),
});

const data = await response.json();
console.log(data.quiz);
```

---

## 🐛 Debugging

### Nettleser DevTools
- Åpne med F12 eller Cmd+Opt+I (Mac)
- Bruk Console for logging
- Bruk Network-fanen for API-kall
- Bruk React DevTools-extension

### Server-side logging
```typescript
console.log("Debug info:", data);
console.error("Error:", error);
```

### Supabase logging
- Gå til Supabase Dashboard
- Se "Logs" for database-queries
- Se "Auth" for autentiseringslogger

---

## ✅ Testing

### Manuelle tester
1. Opprett en ny bruker
2. Opprett et fag
3. Opprett et notat i faget
4. Rediger notatet
5. Test Study Planner
6. Gjør notatet offentlig
7. Test public link i inkognito-vindu
8. Test AI-funksjoner (hvis konfigurert)

### Viktige test-scenarier
- ✅ Registrering av ny bruker
- ✅ Innlogging
- ✅ Utlogging
- ✅ Opprette, redigere, slette fag
- ✅ Opprette, redigere, slette notater
- ✅ Opprette og oppdatere Study Planner
- ✅ Dele notater offentlig
- ✅ Se offentlige notater uten innlogging
- ✅ AI-oppsummering
- ✅ AI-quiz

---

## 🔄 Git workflow

### Opprett en ny feature branch
```bash
git checkout -b feature/min-nye-feature
```

### Commit endringer
```bash
git add .
git commit -m "feat: legg til ny funksjonalitet"
```

### Push til GitHub
```bash
git push origin feature/min-nye-feature
```

### Commit message-format
```
feat: ny funksjonalitet
fix: bug-fix
docs: dokumentasjon
style: formatering
refactor: refaktorering
test: tester
chore: vedlikehold
```

---

## 📚 Nyttige ressurser

### Dokumentasjon
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)

### Verktøy
- [VS Code](https://code.visualstudio.com) - Anbefalt editor
- [Supabase Studio](https://supabase.com/docs/guides/platform/studio) - Database GUI
- [Postman](https://www.postman.com) - API testing

### VS Code Extensions (anbefalt)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

---

## 🚨 Vanlige problemer

### Problem: Build feiler lokalt
**Løsning**: Sjekk at alle avhengigheter er installert
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problem: Supabase connection error
**Løsning**: Verifiser miljøvariabler i `.env.local`

### Problem: TypeScript errors
**Løsning**: Restart TypeScript server i VS Code (Cmd+Shift+P > "TypeScript: Restart TS Server")

---

## 🤝 Bidrag

For å bidra til prosjektet:
1. Fork repositoriet
2. Opprett en feature branch
3. Gjør dine endringer
4. Test grundig
5. Opprett en Pull Request

---

## 📞 Kontakt

For spørsmål eller problemer, kontakt prosjekteier eller opprett en issue på GitHub.

---

Happy coding! 🚀

# ⚡ Quick Start Guide - StudyApp MVP

Kom i gang med StudyApp på 5 minutter!

---

## 🚀 For utviklere (lokalt)

### 1. Installer
```bash
git clone https://github.com/wangensteen-knaplund/Silen-edu.git
cd Silen-edu
npm install
```

### 2. Konfigurer
```bash
cp .env.example .env.local
# Rediger .env.local og legg til dine Supabase-nøkler
```

### 3. Start
```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000) 🎉

---

## 🌐 For deployment (Vercel)

### 1. Push til GitHub
```bash
git push origin main
```

### 2. Importer til Vercel
- Gå til [vercel.com](https://vercel.com)
- Klikk "Import Project"
- Velg ditt GitHub-repo

### 3. Legg til miljøvariabler
```
NEXT_PUBLIC_SUPABASE_URL=din_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=din_key
OPENAI_API_KEY=din_openai_key (valgfritt)
```

### 4. Deploy
Klikk "Deploy" - ferdig! 🚀

---

## 🗄️ Sett opp Supabase

### 1. Opprett prosjekt
- Gå til [supabase.com](https://supabase.com)
- Klikk "New project"

### 2. Kjør SQL
- Gå til SQL Editor
- Kopier innholdet fra `supabase-setup.sql`
- Kjør SQL

### 3. Hent nøkler
- Gå til Settings > API
- Kopier URL og anon key

---

## 📚 Kom i gang som bruker

### 1. Registrer deg
- Gå til [din-app-url]/auth/register
- Opprett en konto

### 2. Opprett fag
- Klikk "Nytt fag"
- Legg til f.eks. "Matematikk"

### 3. Opprett notater
- Klikk på faget
- Klikk "Nytt notat"
- Skriv notater

### 4. Bruk Study Planner
- Se Study Planner på fagside
- Klikk "Rediger"
- Legg til mål og planer

### 5. Del notater
- Åpne et notat
- Klikk "Offentlig"
- Kopier link og del!

---

## 🤖 Test AI-funksjoner

### 1. Legg til OpenAI-nøkkel
```env
OPENAI_API_KEY=sk-...
```

### 2. Opprett et notat med innhold
```
Photosynthesis er prosessen hvor planter...
```

### 3. Klikk "Oppsummer notat"
AI genererer et sammendrag! ✨

### 4. Klikk "Generer quiz"
AI lager quiz-spørsmål! 🎯

---

## ❓ Trenger du hjelp?

- 📖 Les [README.md](README.md) for full dokumentasjon
- 🚀 Les [DEPLOYMENT.md](DEPLOYMENT.md) for deployment-guide
- 🛠️ Les [DEVELOPER.md](DEVELOPER.md) for utviklerinfo
- 🐛 Opprett en issue på GitHub

---

## ✅ Sjekkliste

- [ ] Node.js 18+ installert
- [ ] Supabase-konto opprettet
- [ ] Database-tabeller opprettet
- [ ] Miljøvariabler konfigurert
- [ ] Utviklingsserver kjører
- [ ] (Valgfritt) OpenAI API-nøkkel lagt til

---

**Lykke til med StudyApp! 🎓📚✨**

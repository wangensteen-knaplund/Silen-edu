# 🚀 Deployment Guide - StudyApp MVP

Dette dokumentet forklarer hvordan du deployer StudyApp til Vercel og setter opp Supabase.

---

## 📋 Før du starter

Du trenger:
- En GitHub-konto
- En Vercel-konto (gratis tier fungerer)
- En Supabase-konto (gratis tier fungerer)
- (Valgfritt) En OpenAI API-nøkkel for AI-funksjoner

---

## 🗄️ Steg 1: Sett opp Supabase

### 1.1 Opprett et nytt prosjekt
1. Gå til [supabase.com](https://supabase.com)
2. Klikk "Start your project" eller "New project"
3. Velg organisasjon og gi prosjektet et navn (f.eks. "studyapp")
4. Velg et sterkt database-passord
5. Velg en region (anbefalt: Frankfurt eller nærmeste til brukerne dine)
6. Klikk "Create new project"

### 1.2 Kjør database-setup
1. Gå til SQL Editor i Supabase-dashboardet
2. Klikk "New query"
3. Kopier innholdet fra `supabase-setup.sql` i dette repositoriet
4. Lim inn i SQL-editoren
5. Klikk "Run" for å kjøre SQL-skriptet
6. Verifiser at alle tabellene er opprettet under "Table Editor"

### 1.3 Hent API-nøkler
1. Gå til "Project Settings" > "API"
2. Kopier følgende verdier:
   - `Project URL` → Dette er din `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → Dette er din `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🌐 Steg 2: Deploy til Vercel

### 2.1 Push koden til GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2.2 Importer til Vercel
1. Gå til [vercel.com](https://vercel.com)
2. Klikk "Add New..." > "Project"
3. Importer ditt GitHub-repository
4. Vercel vil automatisk detektere Next.js

### 2.3 Konfigurer miljøvariabler
Før du deployer, legg til disse miljøvariablene:

1. Klikk på "Environment Variables"
2. Legg til følgende variabler:

```
NEXT_PUBLIC_SUPABASE_URL=din_supabase_url_her
NEXT_PUBLIC_SUPABASE_ANON_KEY=din_supabase_anon_key_her
OPENAI_API_KEY=din_openai_api_key_her (valgfritt)
```

3. Velg "Production", "Preview", og "Development" for alle variabler
4. Klikk "Deploy"

### 2.4 Deploy
1. Vercel vil nå bygge og deploye applikasjonen
2. Dette tar ca. 2-3 minutter
3. Du får en URL når deployingen er ferdig (f.eks. `studyapp.vercel.app`)

---

## 🤖 Steg 3: Sett opp AI-funksjoner (Valgfritt)

### 3.1 Få OpenAI API-nøkkel
1. Gå til [platform.openai.com](https://platform.openai.com)
2. Opprett en konto eller logg inn
3. Gå til "API keys"
4. Klikk "Create new secret key"
5. Kopier nøkkelen (du vil ikke se den igjen!)

### 3.2 Legg til i Vercel
1. Gå til ditt prosjekt i Vercel
2. Gå til "Settings" > "Environment Variables"
3. Legg til: `OPENAI_API_KEY=din_openai_key`
4. Klikk "Save"
5. Redeploy applikasjonen (Vercel vil spørre om dette)

---

## ✅ Steg 4: Verifiser deployeringen

### 4.1 Test hjemmesiden
1. Åpne din Vercel URL
2. Du skal se StudyApp-hjemmesiden

### 4.2 Test registrering
1. Klikk "Registrer deg"
2. Opprett en testkonto
3. Sjekk at du får en bekreftelsesmail (hvis Supabase email er aktivert)

### 4.3 Test funksjonalitet
1. Logg inn med testkontoen
2. Opprett et nytt fag
3. Opprett et notat
4. Test Study Planner
5. Test deling av notater
6. (Hvis OpenAI er konfigurert) Test AI-oppsummering og quiz

---

## 🔧 Vedlikehold og oppdateringer

### Oppdatere koden
```bash
git add .
git commit -m "Din commit-melding"
git push origin main
```
Vercel vil automatisk rebuilde og deploye når du pusher til main-branchen.

### Overvåke deployment
1. Gå til Vercel Dashboard
2. Se deployment-status under "Deployments"
3. Se logger under "Logs"

### Databaseoppdateringer
1. Gå til Supabase Dashboard
2. Bruk SQL Editor for å kjøre migrations
3. Eller bruk Supabase CLI for versjonskontroll

---

## 🐛 Feilsøking

### Build-feil i Vercel
**Problem**: Build feiler med TypeScript-feil
**Løsning**: Kjør `npm run build` lokalt for å verifisere at koden bygger

**Problem**: Manglende miljøvariabler
**Løsning**: Sjekk at alle miljøvariabler er lagt til i Vercel

### Supabase-feil
**Problem**: "Invalid API key"
**Løsning**: Verifiser at `NEXT_PUBLIC_SUPABASE_URL` og `NEXT_PUBLIC_SUPABASE_ANON_KEY` er riktige

**Problem**: "Row Level Security policy violation"
**Løsning**: Sjekk at RLS-policies er korrekt satt opp i Supabase

### AI-funksjoner virker ikke
**Problem**: "OpenAI API key not configured"
**Løsning**: Legg til `OPENAI_API_KEY` i Vercel miljøvariabler

**Problem**: "Rate limit exceeded"
**Løsning**: Du har nådd grensen for OpenAI free tier. Oppgrader eller vent til neste måned.

---

## 📊 Ytelse og skalering

### Supabase gratis tier
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth per måned
- Ubegrensede API-requests

### Vercel gratis tier
- 100 GB bandwidth per måned
- Unlimited deployments
- Automatic HTTPS
- Analytics

### Oppgradering
Når du vokser, vurder:
- Supabase Pro: $25/måned
- Vercel Pro: $20/måned
- OpenAI API: Pay-as-you-go

---

## 🔐 Sikkerhet

### Beste praksis
1. ✅ Bruk sterke passord for Supabase database
2. ✅ Aldri commit `.env`-filer til Git
3. ✅ Bruk Supabase Row Level Security (RLS)
4. ✅ Hold API-nøkler hemmelige
5. ✅ Oppdater dependencies regelmessig

### Supabase RLS
All data er beskyttet med Row Level Security (RLS). Brukere kan bare:
- Se sine egne fag, notater og planer
- Se offentlige notater (med `is_public=true`)
- Ikke se andres private data

---

## 📞 Support

### Problemer?
1. Sjekk dokumentasjonen
2. Se Vercel deployment logs
3. Se Supabase logs
4. Opprett en issue på GitHub

### Nyttige lenker
- [Next.js dokumentasjon](https://nextjs.org/docs)
- [Supabase dokumentasjon](https://supabase.com/docs)
- [Vercel dokumentasjon](https://vercel.com/docs)
- [OpenAI API dokumentasjon](https://platform.openai.com/docs)

---

## 🎉 Ferdig!

Din StudyApp MVP er nå live og klar til bruk! 🚀

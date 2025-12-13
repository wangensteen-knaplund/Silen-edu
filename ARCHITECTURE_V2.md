# V2 Frontend Architecture Proposal

## Executive Summary

This document proposes a robust v2 frontend architecture for Silen-edu that addresses current reliability issues while maintaining simplicity. The architecture focuses on **deterministic initialization**, **clear data ownership**, and **safe error boundaries**.

**Key Problems Addressed:**
1. Application breaks when a user cannot open a subject → **Guaranteed subject resolution**
2. Planner/overview not properly testable → **Isolated, testable components**
3. Unreliable state hydration → **Deterministic initialization flow**
4. Frontend/Supabase schema misalignment → **Clear entity mapping**
5. Regressions from new features → **Clear responsibility boundaries**

---

## 1. Core Entities & Ownership Model

### Entity Hierarchy

```
User (Auth)
  └── Subjects (root entities)
      ├── Notes (child of Subject)
      ├── Planner (child of Subject)
      │   ├── Exam Date
      │   ├── Goals
      │   ├── Deadlines (Pro)
      │   └── Reading Items (Pro)
      └── Study Activity (linked to Subject)
```

### Data Ownership Rules

**Confirmed assumptions:**
- ✅ **Subject is the root entity** - All data belongs to a subject
- ✅ **Notes always belong to a subject** - Cannot exist without parent
- ✅ **Planner always belongs to a subject** - Tied to subject lifecycle
- ✅ **A subject must always be resolvable** - Before children can be used

**Additional rules:**
- Auth state is prerequisite for all data
- Study activity can reference subjects but doesn't require them
- All entities are user-scoped (RLS enforced)

---

## 2. State/Store Structure

### Store Inventory

#### A) `useAuthStore` (NEW - consolidates auth state)
**Owns:**
- Current user object
- Authentication status
- Session management

**Does NOT own:**
- User preferences (future)
- Application data

**Why separate:** Auth is the foundation. Should be independent and reliable.

#### B) `useSubjectsStore` (REFACTORED)
**Owns:**
- Subject list (id, name, semester, examDate)
- Subject CRUD operations
- Subject loading state

**Does NOT own:**
- Planner details (beyond examDate)
- Notes
- Any child entity data

**Key change:** Remove hydration logic. Only manage subjects.

#### C) `useNotesStore` (REFACTORED)
**Owns:**
- Notes list for current user
- Note CRUD operations
- Note loading state

**Does NOT own:**
- Subject data (only references subjectId)
- Planner data
- AI-generated content (that belongs in a separate store)

**Key change:** Simplified to pure notes management.

#### D) `usePlannerStore` (REFACTORED)
**Owns:**
- Planner data indexed by subjectId
  - Exam dates
  - Goals
  - Deadlines (Pro)
  - Reading items (Pro)
- Planner CRUD operations
- Planner loading state per subject

**Does NOT own:**
- Subject metadata
- Notes
- Which subject is "active"

**Key changes:**
- Store data per-subject, not globally
- Lazy-load per subject, not all at once
- Clear separation from subject entity

#### E) `useStudyTrackerStore` (UNCHANGED)
**Owns:**
- Daily study activity
- Activity registration
- Weekly intensity calculations

**Does NOT own:**
- Subject data
- Notes
- Planner

---

## 3. Deterministic Initialization Flow

### Current Flow Issues
```
❌ Problem: Parallel, uncoordinated initialization
├── SubjectsInitializer loads subjects
├── SubjectsInitializer loads notes  
├── SubjectsInitializer hydrates planner
└── Pages may render before completion
```

### V2 Flow (Sequential & Safe)

```
✅ Solution: Phased initialization with clear dependencies

Phase 1: Auth (CRITICAL)
├── Load user session
├── Set auth state
└── Gate: user !== null

Phase 2: Subjects (ROOT)
├── Load subjects for user
├── Set subjects state
└── Gate: subjects.initialized === true

Phase 3: Dependent Data (PARALLEL)
├── Load notes for user
└── Study activity loaded on-demand

Phase 4: Page-Specific Data (LAZY)
└── Load planner for specific subjectId when needed
```

### Implementation Pattern

**Global Initializer (App-level)**
```typescript
// components/AppInitializer.tsx
// Replaces SubjectsInitializer

1. Wait for auth to complete
2. If user exists:
   a. Load subjects (sequential)
   b. Load notes (parallel with subjects)
   c. Mark app as "hydrated"
3. If no user: Clear all stores
```

**Page-Level Guards**
```typescript
// Every page that needs data:

1. Check if app is hydrated
2. If not hydrated: Show loading state
3. If hydrated: Proceed to render
4. Load page-specific data (e.g., planner for subjectId)
```

---

## 4. Subject Detail Pages: Guaranteed Resolution

### Problem Statement
**Current:** Pages can render before subjects are loaded, breaking the app.

### V2 Solution: Defense-in-Depth

**Layer 1: Global Initialization**
- App-level initializer loads subjects before any page renders data

**Layer 2: Page-Level Checks**
```typescript
// Pattern for subject detail page

function SubjectDetailPage({ params }) {
  const { subjectId } = params;
  
  // Wait for global hydration
  const appHydrated = useAppStore(s => s.hydrated);
  const subjects = useSubjectsStore(s => s.subjects);
  const subjectsLoading = useSubjectsStore(s => s.loading);
  
  // Guard 1: Wait for hydration
  if (!appHydrated || subjectsLoading) {
    return <LoadingState />;
  }
  
  // Guard 2: Validate subject exists
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) {
    return <SubjectNotFound />;
  }
  
  // Guard 3: Load page-specific data
  const plannerReady = usePlannerForSubject(subjectId);
  if (!plannerReady) {
    return <LoadingState />;
  }
  
  // Safe to render
  return <SubjectContent subject={subject} />;
}
```

**Layer 3: Component Guards**
```typescript
// Planner/Oversikt component

function Oversikt({ subjectId }) {
  const subject = useSubjectsStore(s => 
    s.subjects.find(sub => sub.id === subjectId)
  );
  
  // Guard: Require subject
  if (!subject) {
    return <div>Subject not found</div>;
  }
  
  // Load planner data
  const planner = usePlanner(subjectId);
  
  // Render with guaranteed subject
  return <PlannerContent subject={subject} planner={planner} />;
}
```

### Key Principle: Never Render Without Valid Data

---

## 5. Planner/Overview Isolation

### Problem
**Current:** Planner is tightly coupled to subject pages, making it hard to test and reason about.

### V2 Solution: Clear Separation

**A) Data Layer**
- `usePlannerStore` manages planner data independently
- Indexed by subjectId: `plannerBySubjectId: Record<string, PlannerData>`
- Lazy-loaded per subject

**B) Component Layer**
```
Oversikt (Smart Component)
├── Reads from usePlannerStore
├── Reads subject data for context
├── Manages local UI state
└── Delegates to sub-components:
    ├── ExamDateSection
    ├── GoalsSection
    ├── DeadlinesSection (Pro)
    └── ReadingProgressSection (Pro)
```

**C) Testing Strategy**
```typescript
// Test planner store in isolation
test('planner store manages goals', () => {
  const { addGoal, getGoals } = usePlannerStore.getState();
  addGoal('subject-1', { id: '1', text: 'Pass exam' });
  expect(getGoals('subject-1')).toHaveLength(1);
});

// Test component with mock store
test('Oversikt renders goals', () => {
  mockPlannerStore({ goals: [{ id: '1', text: 'Pass' }] });
  render(<Oversikt subjectId="subject-1" />);
  expect(screen.getByText('Pass')).toBeInTheDocument();
});
```

---

## 6. State Hydration: Reliability Rules

### Current Issues
- Data disappears on navigation
- Pages render before data is ready
- Race conditions in parallel loads

### V2 Rules

**Rule 1: Single Source of Initialization**
- Only `AppInitializer` triggers global data loads
- Pages never trigger global loads
- Pages only trigger page-specific loads

**Rule 2: Explicit Loading States**
```typescript
interface Store {
  data: T[];
  loading: boolean;      // Currently fetching
  initialized: boolean;  // Has attempted fetch at least once
  error: Error | null;   // Last error
}
```

**Rule 3: Idempotent Load Functions**
```typescript
// Stores should prevent duplicate loads
async loadSubjects(userId: string) {
  if (this.loading) return this.loadPromise; // Dedup
  if (this.initialized && this.lastUserId === userId) {
    return this.data; // Cache
  }
  
  this.loading = true;
  this.loadPromise = fetchSubjects(userId);
  const data = await this.loadPromise;
  this.data = data;
  this.initialized = true;
  this.loading = false;
  return data;
}
```

**Rule 4: Navigation Should Not Clear State**
- State persists across navigation
- Only clear state on logout or explicit reset
- Use React keys to force component remounts if needed

**Rule 5: Fail Fast with Error Boundaries**
```typescript
// Wrap pages in error boundaries
<ErrorBoundary fallback={<ErrorPage />}>
  <SubjectDetailPage />
</ErrorBoundary>
```

---

## 7. Frontend-Backend Schema Alignment

### Current Misalignment
- Planner data stored in `study_plan` table (legacy)
- Reading items have different schema (completed vs. progress)
- Goals not in database (only in frontend store)

### V2 Schema Proposals (Minimal Changes)

**Option A: Normalize Planner Data (Recommended)**
```sql
-- Store each planner entity separately
CREATE TABLE planner_goals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  subject_id UUID REFERENCES subjects(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP
);

-- Update reading_items to match frontend
ALTER TABLE reading_items 
  RENAME COLUMN title TO text;
  
ALTER TABLE reading_items
  ADD COLUMN completed BOOLEAN DEFAULT FALSE;
  
ALTER TABLE reading_items
  DROP COLUMN progress;

-- Deprecate study_plan table (legacy)
-- Data migrated to subjects.exam_date + planner_goals
```

**Option B: Use JSONB (Alternative)**
```sql
-- Store planner as JSONB blob per subject
ALTER TABLE subjects
  ADD COLUMN planner_data JSONB DEFAULT '{}'::jsonb;

-- Structure:
{
  "examDate": "2024-06-01",
  "goals": [{ "id": "1", "text": "Pass" }],
  "deadlines": [...],
  "readingItems": [...]
}
```

**Recommendation:** Option A (normalized)
- Easier to query and update individual items
- Better for RLS policies
- More maintainable

---

## 8. Change Prevention Strategy

### Problem
Adding new features (like planner) caused regressions.

### V2 Prevention Mechanisms

**A) Architectural Boundaries**
```
Clear boundaries prevent accidental coupling:

AppInitializer
├── AuthStore (independent)
├── SubjectsStore (independent)
└── NotesStore (independent)

SubjectDetailPage
└── PlannerStore (subject-scoped)
```

**B) Store Contract Tests**
```typescript
// Each store has a test suite validating:
// 1. Can initialize without other stores
// 2. Doesn't mutate other stores
// 3. Has clear loading states
// 4. Handles errors gracefully
```

**C) Page-Level Integration Tests**
```typescript
// Test critical paths:
test('can open subject page', async () => {
  await login();
  await waitForSubjectsToLoad();
  await navigateToSubject('math-101');
  expect(screen.getByText('Math 101')).toBeVisible();
});
```

**D) Linting Rules**
```typescript
// Enforce patterns:
// - Pages must check hydration before reading stores
// - Stores must not import other stores
// - Components must not directly fetch data
```

---

## 9. How This Architecture Prevents Current Failures

### Issue 1: Application breaks when subject cannot be opened
**V2 Fix:**
- **Layer 1:** Global initializer guarantees subjects are loaded
- **Layer 2:** Page guard checks subject exists before render
- **Layer 3:** Component guard validates subject prop
- **Result:** Impossible to render with missing subject

### Issue 2: Planner not properly testable
**V2 Fix:**
- **Isolated store:** `usePlannerStore` has no dependencies
- **Clear component:** `Oversikt` receives subjectId prop, reads from store
- **Mockable:** Can test store and component independently
- **Result:** Fully testable in isolation

### Issue 3: State hydration unreliable
**V2 Fix:**
- **Single initializer:** One place to load data (AppInitializer)
- **Sequential loading:** Auth → Subjects → Notes (clear order)
- **Idempotent loads:** Prevent duplicate fetches
- **Persistent state:** Don't clear on navigation
- **Result:** Predictable, reliable hydration

### Issue 4: Frontend/backend misalignment
**V2 Fix:**
- **Schema updates:** Align reading_items, add planner_goals
- **Clear mapping:** Each store maps to specific tables
- **Type safety:** TypeScript types match database schema
- **Result:** Consistent data model

### Issue 5: Regressions from new features
**V2 Fix:**
- **Clear boundaries:** Each store owns specific data
- **Contract tests:** Validate store behavior
- **Integration tests:** Catch page-level regressions
- **Linting rules:** Prevent bad patterns
- **Result:** Safe to add features

---

## 10. Migration Path (High-Level)

### Phase 1: Foundation
1. Create `useAppStore` for hydration state
2. Create `AppInitializer` component
3. Update `useSubjectsStore` to remove hydration logic
4. Add loading/error states to all stores

### Phase 2: Planner Isolation
1. Refactor `usePlannerStore` to per-subject indexing
2. Update `Oversikt` to read from refactored store
3. Remove planner hydration from SubjectsInitializer

### Phase 3: Page Guards
1. Add hydration checks to all pages
2. Add subject existence checks to subject pages
3. Add error boundaries

### Phase 4: Schema Alignment
1. Create migration for planner_goals table
2. Update reading_items schema
3. Migrate data from study_plan
4. Update stores to use new schema

### Phase 5: Testing
1. Add store unit tests
2. Add component tests
3. Add integration tests
4. Add linting rules

---

## 11. Future Extensibility

This architecture supports future needs:

**✅ New Features**
- Clear where to add data (new store vs. existing)
- Won't break existing features (isolated boundaries)

**✅ Pro Features**
- Store-level feature flags
- Component-level Pro guards
- Database-level RLS policies

**✅ AI Features**
- Separate `useAIStore` for AI-generated content
- Doesn't affect core data flow
- Can fail gracefully

**✅ Offline Support**
- Stores already manage loading/error states
- Can add persistence layer under stores
- Pages don't need to change

**✅ Real-time Updates**
- Stores can subscribe to Supabase realtime
- Pages automatically re-render
- No architectural changes needed

---

## 12. Key Principles Summary

1. **Auth is foundation** - Nothing loads without valid user
2. **Subjects are root entities** - All data belongs to subjects
3. **Sequential initialization** - Auth → Subjects → Children
4. **Lazy-load page data** - Only load what's needed when needed
5. **Validate before render** - Multiple layers of guards
6. **Clear ownership** - Each store owns specific data
7. **No cross-store dependencies** - Stores are independent
8. **Fail fast and safe** - Error boundaries catch failures
9. **State persists** - Don't clear on navigation
10. **Test in isolation** - Stores and components are mockable

---

## 13. Glossary

**Hydration:** Process of loading data from Supabase into Zustand stores

**Initialized:** Store has attempted to load data at least once

**Loading:** Store is currently fetching data

**Guard:** Code that prevents rendering until conditions are met

**Root entity:** Subject - the top-level data that everything else belongs to

**Child entity:** Notes, Planner - data that requires a parent subject

**Store contract:** Expected behavior of a store (loading states, idempotency, etc.)

---

## Appendix: Flow Diagrams

### A) Current Flow (Problematic)
```
User lands on /subjects/123
│
├─> AuthProvider renders
│   └─> user available
│
├─> SubjectsInitializer runs
│   ├─> loadSubjects() (async)
│   ├─> loadNotes() (async)
│   └─> hydratePlanner() (async)
│
└─> SubjectDetailPage renders
    ├─> reads subjects (might be empty!)
    ├─> reads planner (might be empty!)
    └─> BREAKS if data not ready
```

### B) V2 Flow (Robust)
```
User lands on /subjects/123
│
├─> AuthProvider renders
│   └─> user available
│
├─> AppInitializer runs (sequential)
│   ├─> loadSubjects() → wait
│   ├─> loadNotes() → wait
│   └─> set appHydrated = true
│
└─> SubjectDetailPage renders
    │
    ├─> Guard 1: Check appHydrated
    │   └─> If false: return <Loading />
    │
    ├─> Guard 2: Check subject exists
    │   └─> If false: return <NotFound />
    │
    ├─> Guard 3: Load planner for subjectId
    │   └─> If loading: return <Loading />
    │
    └─> Safe to render with all data
```

### C) Store Dependency Graph (V2)
```
AuthStore (no dependencies)
  ↓
AppStore (hydration state)
  ↓
┌─────────────┬─────────────┬─────────────┐
│             │             │             │
SubjectsStore NotesStore    StudyStore    
(independent) (independent) (independent)
│             │             
└─────────────┤             
              ↓             
        PlannerStore        
        (per-subject)       
```

---

**End of V2 Architecture Proposal**

This architecture provides a **stable, testable, and extensible foundation** for Silen-edu. It directly addresses all current reliability issues while maintaining simplicity and following Next.js + Zustand best practices.

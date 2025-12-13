# V2 Architecture - Migration Plan

This document provides a step-by-step migration plan from the current architecture to V2.

**Prerequisites:**
- Read [ARCHITECTURE_V2.md](./ARCHITECTURE_V2.md) for conceptual foundation
- Read [ARCHITECTURE_V2_IMPLEMENTATION.md](./ARCHITECTURE_V2_IMPLEMENTATION.md) for code patterns

---

## Migration Strategy

**Approach:** Incremental, non-breaking changes

We will migrate the application in phases, ensuring the app remains functional at each step. Each phase can be tested independently before moving to the next.

---

## Phase 0: Preparation (1-2 hours)

### 0.1 Backup Current State
- [ ] Create a git branch: `git checkout -b architecture-v2`
- [ ] Document current functionality that must not break
- [ ] Create baseline tests for critical paths

### 0.2 Install Testing Infrastructure (Optional but Recommended)
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

- [ ] Configure Jest
- [ ] Create test utilities

### 0.3 Review Current Issues
- [ ] List all known bugs related to state hydration
- [ ] Identify pages that break on subject loading failures
- [ ] Document planner/oversikt coupling issues

**Deliverable:** Branch ready, issues documented

---

## Phase 1: Foundation (2-3 hours)

### 1.1 Create useAppStore
**Goal:** Central hydration state management

- [ ] Create `/store/useAppStore.ts` (see IMPLEMENTATION.md)
- [ ] Export `useAppStore` hook
- [ ] Add initial state: `hydrated`, `hydrating`, `hydrateError`
- [ ] Test store in isolation

**Test:**
```typescript
const { hydrated, setHydrated } = useAppStore.getState();
expect(hydrated).toBe(false);
setHydrated(true);
expect(useAppStore.getState().hydrated).toBe(true);
```

### 1.2 Refactor useSubjectsStore
**Goal:** Remove cross-store dependencies

**Changes:**
- [ ] Add `error` field to state
- [ ] Improve `loadSubjects` with try/catch
- [ ] Ensure deduplication logic is solid
- [ ] Remove any hydration of other stores (if present)

**Test:**
```bash
npm run build
```
Should build without errors.

### 1.3 Create AppInitializer Component
**Goal:** Replace SubjectsInitializer with proper sequential loading

- [ ] Create `/components/AppInitializer.tsx` (see IMPLEMENTATION.md)
- [ ] Import useAppStore, useSubjectsStore, useNotesStore
- [ ] Implement sequential hydration: Auth → Subjects → Notes
- [ ] Handle errors gracefully

**Do NOT activate yet** - just create the file.

### 1.4 Create usePageGuard Hook
**Goal:** Reusable page-level guard

- [ ] Create `/hooks/usePageGuard.ts` (see IMPLEMENTATION.md)
- [ ] Returns `{ isReady, isLoading, error }`
- [ ] Test in isolation

**Deliverable:** New stores and hooks created, app still uses old flow

---

## Phase 2: Switch to AppInitializer (1 hour)

### 2.1 Update ClientLayout
**Goal:** Replace SubjectsInitializer with AppInitializer

**File:** `/components/layout/ClientLayout.tsx`

**Changes:**
```diff
- import SubjectsInitializer from "@/components/subjects/SubjectsInitializer";
+ import AppInitializer from "@/components/AppInitializer";

  <AuthProvider>
-   <SubjectsInitializer />
+   <AppInitializer />
    <MainNav />
```

- [ ] Make the change
- [ ] Test locally: `npm run dev`
- [ ] Navigate to dashboard → subjects → subject detail
- [ ] Verify data loads correctly

### 2.2 Verify Hydration Works
- [ ] Open browser DevTools → Network tab
- [ ] Refresh page
- [ ] Verify subjects and notes load (only once each)
- [ ] Check console for errors

**Test Critical Paths:**
- [ ] Login → Dashboard → Subjects → Subject Detail
- [ ] Refresh on Subject Detail page
- [ ] Navigate back to dashboard
- [ ] Navigate to subject detail again (should use cache)

**Rollback Plan:**
If issues arise, revert ClientLayout.tsx change and commit.

**Deliverable:** AppInitializer active, hydration working

---

## Phase 3: Add Page Guards (2-3 hours)

### 3.1 Update Dashboard Page
**File:** `/app/page.tsx`

**Changes:**
```typescript
import { usePageGuard } from "@/hooks/usePageGuard";

export default function Dashboard() {
  const { user } = useAuth();
  const { isReady, isLoading, error } = usePageGuard();
  
  // Add guards before rendering data
  if (error) {
    return <ErrorState error={error} />;
  }
  
  if (isLoading || !isReady) {
    return <LoadingState />;
  }
  
  // Existing code...
}
```

- [ ] Add usePageGuard
- [ ] Add loading state
- [ ] Add error state
- [ ] Test page loads correctly

### 3.2 Update Subjects List Page
**File:** `/app/subjects/page.tsx`

- [ ] Add usePageGuard
- [ ] Add guards
- [ ] Test

### 3.3 Update Subject Detail Page
**File:** `/app/subjects/[subjectId]/page.tsx`

**This is critical** - see IMPLEMENTATION.md for full example

**Changes:**
- [ ] Add usePageGuard for global state
- [ ] Add subject existence check
- [ ] Add planner loading check (prepare for Phase 4)
- [ ] Add three loading states (global, subject, planner)
- [ ] Add error states

**Test thoroughly:**
- [ ] Navigate to valid subject → renders correctly
- [ ] Navigate to invalid subject ID → shows "Not Found"
- [ ] Refresh on subject page → data persists
- [ ] Open DevTools → no console errors

### 3.4 Update Notes Page
**File:** `/app/notes/page.tsx`

- [ ] Add usePageGuard
- [ ] Add guards
- [ ] Test

### 3.5 Update Notes Detail Page
**File:** `/app/notes/[noteId]/page.tsx`

- [ ] Add usePageGuard
- [ ] Add note existence check
- [ ] Test

**Deliverable:** All pages have proper guards, no crashes on missing data

---

## Phase 4: Planner Isolation (3-4 hours)

### 4.1 Database Migration - Create planner_goals Table

**File:** Create `/migrations/001_create_planner_goals.sql`

```sql
CREATE TABLE IF NOT EXISTS planner_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_planner_goals_subject ON planner_goals(subject_id);
CREATE INDEX idx_planner_goals_user ON planner_goals(user_id);

ALTER TABLE planner_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON planner_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON planner_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON planner_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON planner_goals FOR DELETE
  USING (auth.uid() = user_id);
```

- [ ] Create migration file
- [ ] Run in Supabase SQL Editor
- [ ] Verify table created: `SELECT * FROM planner_goals;`

### 4.2 Database Migration - Update reading_items Table

**File:** Create `/migrations/002_update_reading_items.sql`

```sql
-- Rename title to text
ALTER TABLE reading_items RENAME COLUMN title TO text;

-- Add completed column
ALTER TABLE reading_items ADD COLUMN completed BOOLEAN DEFAULT FALSE;

-- Remove progress column
ALTER TABLE reading_items DROP COLUMN IF EXISTS progress;

-- Update existing data
UPDATE reading_items SET completed = FALSE WHERE completed IS NULL;
```

- [ ] Create migration file
- [ ] **Backup existing reading_items data first!**
- [ ] Run in Supabase SQL Editor
- [ ] Verify: `SELECT * FROM reading_items;`

### 4.3 Refactor usePlannerStore

**File:** `/store/usePlannerStore.ts`

**Major changes** (see IMPLEMENTATION.md for full code):
- [ ] Change to per-subject indexing
- [ ] Add `loadPlannerForSubject(subjectId)` function
- [ ] Add `loadingBySubjectId`, `initializedBySubjectId`, `errorBySubjectId`
- [ ] Update all actions to work with database (async)
- [ ] Remove `hydrateFromSubjects` function

**This is a large refactor. Proceed carefully:**
1. Create a new file: `/store/usePlannerStore.v2.ts`
2. Implement new pattern
3. Test thoroughly
4. When ready, replace old file

### 4.4 Update types/planner.ts

**Changes:**
```diff
  export interface ReadingItem {
    id: string;
    subjectId: string;
-   title: string;
+   text: string;
-   progress: number;
+   completed: boolean;
  }
```

- [ ] Update types
- [ ] Fix any TypeScript errors

### 4.5 Refactor Oversikt Component

**File:** `/components/subjects/Oversikt.tsx`

**Changes:**
- [ ] Remove local state for planner data
- [ ] Read from `usePlannerStore` per-subject
- [ ] Update all handlers to be async (call store actions)
- [ ] Simplify props: only need `subjectId` and `isPro`

**See IMPLEMENTATION.md for full example**

### 4.6 Update Subject Detail Page to Load Planner

**File:** `/app/subjects/[subjectId]/page.tsx`

**Add:**
```typescript
const loadPlannerForSubject = usePlannerStore(
  (state) => state.loadPlannerForSubject
);
const plannerLoading =
  usePlannerStore((state) => state.loadingBySubjectId[subjectId]) || false;
const plannerInitialized =
  usePlannerStore((state) => state.initializedBySubjectId[subjectId]) || false;

useEffect(() => {
  if (isReady && subjectId) {
    loadPlannerForSubject(subjectId).catch(console.error);
  }
}, [isReady, subjectId, loadPlannerForSubject]);

// Add guard
if (plannerLoading || !plannerInitialized) {
  return <LoadingState message="Laster planlegger…" />;
}
```

### 4.7 Remove Old SubjectsInitializer

- [ ] Delete `/components/subjects/SubjectsInitializer.tsx` (no longer needed)
- [ ] Verify app still works

**Test Planner Thoroughly:**
- [ ] Add exam date → saves to DB
- [ ] Add goal → saves to DB
- [ ] Remove goal → deletes from DB
- [ ] Add deadline → saves to DB
- [ ] Add reading item → saves to DB
- [ ] Toggle reading item → updates DB
- [ ] Refresh page → data persists
- [ ] Open different subject → loads its planner
- [ ] Navigate away and back → uses cache

**Deliverable:** Planner fully isolated, backed by database, testable

---

## Phase 5: Error Boundaries (1 hour)

### 5.1 Create ErrorBoundary Component

- [ ] Create `/components/ErrorBoundary.tsx` (see IMPLEMENTATION.md)
- [ ] Implement class component with `componentDidCatch`
- [ ] Add fallback UI

### 5.2 Wrap ClientLayout

**File:** `/components/layout/ClientLayout.tsx`

```typescript
import ErrorBoundary from "@/components/ErrorBoundary";

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppInitializer />
        <MainNav />
        <main>{children}</main>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

- [ ] Add ErrorBoundary wrapper
- [ ] Test: Throw error in component to verify boundary catches it

### 5.3 Add Per-Page Error Boundaries (Optional)

- [ ] Wrap individual pages if needed
- [ ] Allows granular error handling

**Deliverable:** App fails gracefully with user-friendly errors

---

## Phase 6: Testing (2-3 hours)

### 6.1 Write Store Tests

For each store:
- [ ] Test initial state
- [ ] Test successful load
- [ ] Test error handling
- [ ] Test deduplication
- [ ] Test caching

**Example:** See IMPLEMENTATION.md for `useSubjectsStore.test.ts`

### 6.2 Write Component Tests

For key components:
- [ ] Oversikt component
- [ ] Subject detail page logic
- [ ] AppInitializer

**Example:** See IMPLEMENTATION.md for `Oversikt.test.tsx`

### 6.3 Write Integration Tests

Test critical user flows:
- [ ] Login → Dashboard → Subject → Planner works
- [ ] Add goal → Persists on refresh
- [ ] Invalid subject ID → Shows error

### 6.4 Manual Testing Checklist

- [ ] Create new user account
- [ ] Add subject
- [ ] Set exam date
- [ ] Add goals
- [ ] Add deadlines (if Pro)
- [ ] Add reading items (if Pro)
- [ ] Create notes
- [ ] Navigate between pages
- [ ] Refresh pages
- [ ] Logout
- [ ] Login again
- [ ] Verify data persists

**Deliverable:** Comprehensive test coverage

---

## Phase 7: Documentation (1 hour)

### 7.1 Update README

- [ ] Add link to ARCHITECTURE_V2.md
- [ ] Update "How it works" section
- [ ] Update data flow diagram

### 7.2 Update DEVELOPER.md

- [ ] Document new store patterns
- [ ] Document page guard pattern
- [ ] Add testing instructions

### 7.3 Create CHANGELOG

- [ ] Document all changes
- [ ] Note breaking changes (if any)
- [ ] Migration notes for developers

**Deliverable:** Updated documentation

---

## Phase 8: Deployment & Monitoring (1 hour)

### 8.1 Pre-Deployment Checks

- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Lint passes: `npm run lint`
- [ ] No console errors in dev mode

### 8.2 Database Migration in Production

**IMPORTANT: Do this during low-traffic period**

1. [ ] Backup production database
2. [ ] Run `001_create_planner_goals.sql`
3. [ ] Run `002_update_reading_items.sql`
4. [ ] Verify tables updated correctly
5. [ ] If errors, rollback and investigate

### 8.3 Deploy Application

- [ ] Deploy to staging first (if available)
- [ ] Test on staging
- [ ] Deploy to production
- [ ] Monitor logs for errors

### 8.4 Monitor Post-Deployment

First 24 hours:
- [ ] Check error tracking (Sentry, etc.)
- [ ] Monitor Supabase logs
- [ ] Check user reports
- [ ] Verify key metrics (page loads, errors)

**Deliverable:** V2 architecture live in production

---

## Rollback Plan

If critical issues arise after deployment:

### Emergency Rollback

1. **Revert code:**
   ```bash
   git revert <merge-commit>
   git push
   ```

2. **Redeploy previous version**

3. **Database rollback (if needed):**
   ```sql
   -- Rollback reading_items
   ALTER TABLE reading_items ADD COLUMN progress INTEGER DEFAULT 0;
   ALTER TABLE reading_items RENAME COLUMN text TO title;
   ALTER TABLE reading_items DROP COLUMN completed;
   
   -- Rollback planner_goals (data loss!)
   DROP TABLE planner_goals CASCADE;
   ```
   **Warning:** This loses goals data!

### Partial Rollback

If only specific features have issues:

1. **Keep infrastructure changes** (stores, guards)
2. **Disable problematic features** (e.g., planner Pro features)
3. **Fix and redeploy**

---

## Success Criteria

V2 architecture is successful when:

### Reliability
- [x] **No crashes when opening subjects** - All guards in place
- [x] **Data loads predictably** - Sequential initialization
- [x] **State persists across navigation** - No unwanted resets

### Testability
- [x] **Stores can be tested in isolation** - No cross-dependencies
- [x] **Components can be tested with mocks** - Clear boundaries
- [x] **Integration tests cover critical paths** - User flows tested

### Maintainability
- [x] **Clear data ownership** - Each store owns specific data
- [x] **Documented patterns** - Architecture docs guide development
- [x] **Error handling** - Graceful failures with error boundaries

### Performance
- [x] **No duplicate fetches** - Deduplication working
- [x] **Fast page loads** - Cached data reused
- [x] **Lazy loading** - Planner loaded per-subject as needed

---

## Timeline Estimate

| Phase | Description | Time | Dependencies |
|-------|-------------|------|--------------|
| 0 | Preparation | 1-2h | None |
| 1 | Foundation | 2-3h | Phase 0 |
| 2 | Switch Initializer | 1h | Phase 1 |
| 3 | Add Page Guards | 2-3h | Phase 2 |
| 4 | Planner Isolation | 3-4h | Phase 3 |
| 5 | Error Boundaries | 1h | Phase 4 |
| 6 | Testing | 2-3h | Phase 5 |
| 7 | Documentation | 1h | Phase 6 |
| 8 | Deployment | 1h | Phase 7 |
| **Total** | | **14-20h** | |

**Recommendation:** Spread over 3-5 days, testing thoroughly at each phase.

---

## Risk Assessment

### High Risk Items
1. **Database migrations** - Could lose data if not careful
   - **Mitigation:** Backup before migrations, test on staging first
   
2. **Planner store refactor** - Large change, many dependencies
   - **Mitigation:** Create new file first, test thoroughly, gradual rollout

3. **Breaking changes for users** - Data structure changes
   - **Mitigation:** Migrate data automatically, provide fallbacks

### Medium Risk Items
1. **Performance regression** - More guards = more checks
   - **Mitigation:** Optimize guards, measure performance
   
2. **Testing gaps** - Hard to test all scenarios
   - **Mitigation:** Focus on critical paths, add tests over time

### Low Risk Items
1. **Error boundaries** - Additive, doesn't change logic
2. **Documentation** - No code impact
3. **Type updates** - Caught by TypeScript

---

## Post-Migration Tasks

After V2 is stable:

### Optimization
- [ ] Add caching layer for frequently accessed data
- [ ] Optimize re-renders with selective subscriptions
- [ ] Add loading skeletons for better UX

### Features
- [ ] Real-time updates via Supabase subscriptions
- [ ] Offline support with local persistence
- [ ] Advanced planner features (drag-and-drop, etc.)

### Monitoring
- [ ] Set up performance monitoring
- [ ] Add custom metrics (hydration time, etc.)
- [ ] User analytics on feature usage

---

## FAQ

### Q: Do I need to do all phases at once?
**A:** No! Each phase builds on the previous, but you can take breaks. Just don't deploy until a phase is complete.

### Q: What if I find issues mid-migration?
**A:** Fix issues before moving to next phase. Each phase should leave the app in a working state.

### Q: Can users continue using the app during migration?
**A:** Yes, until deployment. Once you deploy, users get the new architecture.

### Q: What if tests fail after a phase?
**A:** Don't proceed. Fix tests first. They're catching real issues.

### Q: Do I need to migrate all pages at once?
**A:** No. You can add guards page-by-page in Phase 3. Start with critical pages.

### Q: What about existing user data?
**A:** Phase 4 migrations handle this. Backup first!

---

## Support

If issues arise:

1. **Check logs:** Browser console, Supabase logs
2. **Verify state:** Use React DevTools to inspect stores
3. **Review guards:** Are all guards in place?
4. **Check database:** Verify migrations ran correctly
5. **Rollback if needed:** See Rollback Plan above

---

**End of Migration Plan**

This plan ensures a **safe, incremental migration** to V2 architecture with minimal risk and clear rollback options at each step.

# V2 Architecture Proposal - Quick Reference

## 📚 Document Overview

This proposal consists of three main documents:

1. **[ARCHITECTURE_V2.md](./ARCHITECTURE_V2.md)** - Conceptual architecture (15-20 min read)
   - Core entities and ownership model
   - State/store structure
   - Deterministic initialization flow
   - How V2 prevents current failures
   - Architectural principles

2. **[ARCHITECTURE_V2_IMPLEMENTATION.md](./ARCHITECTURE_V2_IMPLEMENTATION.md)** - Code patterns (30-40 min read)
   - Concrete store implementations
   - Component patterns with guards
   - Database migrations
   - Testing patterns
   - Error boundaries

3. **[ARCHITECTURE_V2_MIGRATION.md](./ARCHITECTURE_V2_MIGRATION.md)** - Step-by-step migration (20-25 min read)
   - 8-phase migration plan
   - Estimated timeline: 14-20 hours
   - Risk assessment
   - Rollback plans

---

## 🎯 Key Problems Solved

| Problem | V2 Solution |
|---------|-------------|
| App breaks when subject cannot be opened | 3-layer guards (app, page, component) |
| Planner not testable | Isolated store + lazy loading |
| State hydration unreliable | Sequential initialization (Auth → Subjects → Notes) |
| Frontend/backend misalignment | Schema normalization + type safety |
| Regressions from new features | Clear boundaries + contract tests |

---

## 🏗️ Core Architecture Changes

### Before (Current)
```
SubjectsInitializer (parallel, uncoordinated)
├── loadSubjects() 🔄
├── loadNotes() 🔄
└── hydratePlanner() 🔄

Pages render immediately ❌
└── May render with missing data
```

### After (V2)
```
AppInitializer (sequential, coordinated)
├── loadSubjects() ✅
├── loadNotes() ✅
└── set appHydrated = true ✅

Pages check appHydrated ✅
├── Guard 1: Global hydration
├── Guard 2: Entity exists
└── Guard 3: Page data loaded
```

---

## 🗄️ Store Structure

### New Stores
- **`useAppStore`** - Global hydration state (NEW)

### Refactored Stores
- **`useSubjectsStore`** - Pure subject management (simplified)
- **`useNotesStore`** - Pure notes management (simplified)
- **`usePlannerStore`** - Per-subject planner data (refactored)

### Unchanged Stores
- **`useStudyTrackerStore`** - Study activity tracking

### Key Principle
**Each store is independent.** No cross-store dependencies.

---

## 🔐 Data Ownership

| Entity | Owned By | Parent |
|--------|----------|--------|
| User | Auth | - |
| Subject | useSubjectsStore | User |
| Note | useNotesStore | Subject (ref) |
| Planner | usePlannerStore | Subject (indexed) |
| Study Activity | useStudyTrackerStore | - |

**Rule:** Child entities reference parent by ID, don't duplicate parent data.

---

## 🛡️ Guard Pattern (3 Layers)

Every page that depends on data uses this pattern:

```typescript
// Layer 1: Global hydration
const { isReady, isLoading, error } = usePageGuard();
if (!isReady) return <Loading />;

// Layer 2: Entity existence
const subject = useSubjectsStore(s => s.getById(subjectId));
if (!subject) return <NotFound />;

// Layer 3: Page-specific data
const plannerReady = usePlanner(subjectId);
if (!plannerReady) return <Loading />;

// Safe to render ✅
return <Content subject={subject} />;
```

---

## 📊 Database Changes

### New Tables
- `planner_goals` - Stores goals (previously in-memory)

### Schema Updates
- `reading_items.title` → `text`
- `reading_items.progress` → `completed` (Boolean)

### Deprecated
- `study_plan` table (data migrated to `subjects.exam_date` + `planner_goals`)

**Migration SQL provided in IMPLEMENTATION.md**

---

## ✅ Migration Timeline

| Phase | Description | Time | Can Skip? |
|-------|-------------|------|-----------|
| 0 | Preparation | 1-2h | No |
| 1 | Foundation (stores, hooks) | 2-3h | No |
| 2 | Switch to AppInitializer | 1h | No |
| 3 | Add page guards | 2-3h | Partial |
| 4 | Planner isolation | 3-4h | No |
| 5 | Error boundaries | 1h | Yes |
| 6 | Testing | 2-3h | Yes* |
| 7 | Documentation | 1h | Yes |
| 8 | Deployment | 1h | No |

**Total: 14-20 hours** (spread over 3-5 days recommended)

*Testing is optional but strongly recommended

---

## 🚨 High-Risk Areas

### 1. Database Migrations (Phase 4)
**Risk:** Data loss
**Mitigation:** Backup first, test on staging

### 2. Planner Store Refactor (Phase 4)
**Risk:** Breaking existing functionality
**Mitigation:** Create new file first, test thoroughly

### 3. Breaking User Flows (Phase 2-3)
**Risk:** Users can't access features
**Mitigation:** Test critical paths after each phase

---

## 🎓 Key Principles (Remember These)

1. **Auth is foundation** - Nothing loads without valid user
2. **Subjects are root entities** - All data belongs to subjects
3. **Sequential initialization** - Auth → Subjects → Children
4. **Validate before render** - Multiple guard layers
5. **Clear ownership** - Each store owns specific data
6. **No cross-store dependencies** - Stores are independent
7. **Fail fast and safe** - Error boundaries catch failures
8. **State persists** - Don't clear on navigation
9. **Test in isolation** - Stores and components are mockable
10. **Lazy-load page data** - Only load what's needed

---

## 📖 Reading Order

### For Product/Stakeholders (30 min)
1. This document (5 min)
2. ARCHITECTURE_V2.md sections 1-9 (20 min)
3. ARCHITECTURE_V2.md section 13 (Summary) (5 min)

### For Developers (1-2 hours)
1. This document (5 min)
2. ARCHITECTURE_V2.md in full (20 min)
3. ARCHITECTURE_V2_IMPLEMENTATION.md sections 1-2 (30 min)
4. ARCHITECTURE_V2_MIGRATION.md phases 0-4 (30 min)

### For Implementation (deep dive)
1. All documents in order
2. Study code examples
3. Review current codebase alongside proposals
4. Follow migration plan step-by-step

---

## 🤔 Common Questions

### Q: Is this overengineered?
**A:** No. These are standard patterns for reliable frontend apps. Current issues stem from lack of these patterns.

### Q: Do we have to do all of this?
**A:** Phases 0-4 are critical for stability. Phases 5-8 are best practices but can be done later.

### Q: What about existing features?
**A:** V2 maintains all existing features. It's a foundation improvement, not a feature change.

### Q: How do we test this?
**A:** Each phase has test steps. Migration plan includes comprehensive testing checklist.

### Q: What if something breaks?
**A:** Rollback plan provided. Each phase is reversible. Test thoroughly before moving forward.

### Q: When can we start?
**A:** After this proposal is reviewed and approved. Then follow Phase 0 of migration plan.

---

## ✨ Expected Outcomes

### Immediately (Phases 1-4)
- ✅ No more crashes when opening subjects
- ✅ Predictable, reliable state hydration
- ✅ Clear data flow (easy to debug)
- ✅ Planner can be tested independently

### Short-term (Phases 5-8)
- ✅ Graceful error handling
- ✅ Comprehensive test coverage
- ✅ Updated documentation
- ✅ Production-ready architecture

### Long-term (Future)
- ✅ Easy to add new features
- ✅ Supports real-time updates
- ✅ Supports offline mode
- ✅ Foundation for scale

---

## 🚀 Next Steps

1. **Review this proposal** - Read all three documents
2. **Ask questions** - Clarify anything unclear
3. **Approve architecture** - Get stakeholder buy-in
4. **Schedule migration** - Plan 3-5 day sprint
5. **Begin Phase 0** - Prepare branch and baseline
6. **Execute migration** - Follow plan phase-by-phase
7. **Deploy and monitor** - Watch for issues
8. **Iterate** - Improve based on learnings

---

## 📞 Support

For questions or clarifications on this proposal:
- Review the detailed documents
- Check the FAQ sections
- Examine code examples in IMPLEMENTATION.md
- Follow the step-by-step migration plan

---

**Summary:** This V2 architecture transforms Silen-edu from an unreliable, hard-to-maintain app into a robust, testable, and scalable foundation. The migration is low-risk, incremental, and has clear rollback options at each step.

**Recommendation:** Approve and begin migration. The current issues are architectural and will persist (or worsen) without these foundational changes.

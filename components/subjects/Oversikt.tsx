"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { daysUntil, formatDateNO } from "@/utils/date";
import { usePlannerStore } from "@/store/usePlannerStore";
import { useCurriculumStore } from "@/store/useCurriculumStore";
import { useStudyActivityStore } from "@/store/useStudyActivityStore";
import { useSubjectsStore } from "@/store/useSubjectsStore";
import { Subject } from "@/types/data";

interface OversiktProps {
  subject: Subject;
  isPro: boolean;
}

export default function Oversikt({ subject, isPro }: OversiktProps) {
  const router = useRouter();
  const { user } = useAuth();
  const plannerState = usePlannerStore(
    (state) => state.dataBySubjectId[subject.id]
  );
  const addGoalAction = usePlannerStore((state) => state.addGoal);
  const removeGoalAction = usePlannerStore((state) => state.removeGoal);
  const addDeadlineAction = usePlannerStore((state) => state.addDeadline);
  const removeDeadlineAction = usePlannerStore((state) => state.removeDeadline);

  // Curriculum store actions
  const curriculumState = useCurriculumStore(
    (state) => state.dataBySubjectId[subject.id]
  );
  const loadCurriculum = useCurriculumStore((state) => state.loadForSubject);
  const addCurriculumItemsFromText = useCurriculumStore(
    (state) => state.addItemsFromText
  );
  const toggleCurriculumItem = useCurriculumStore((state) => state.toggleItem);
  const removeCurriculumItem = useCurriculumStore((state) => state.removeItem);
  
  // Study activity store
  const recordActivity = useStudyActivityStore((state) => state.recordActivity);

  const updateSubject = useSubjectsStore((state) => state.updateSubject);

  const [localError, setLocalError] = useState<string | null>(null);

  // Exam date state
  const [isEditingExam, setIsEditingExam] = useState(false);
  const [tempExamDate, setTempExamDate] = useState("");
  const [savingExam, setSavingExam] = useState(false);

  // Goals state
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalText, setGoalText] = useState("");

  // Deadlines state
  const [showDeadlineForm, setShowDeadlineForm] = useState(false);
  const [deadlineTitle, setDeadlineTitle] = useState("");
  const [deadlineDueDate, setDeadlineDueDate] = useState("");
  const [deadlineType, setDeadlineType] = useState<"innlevering" | "prøve" | "prosjekt">("innlevering");

  // Curriculum items state
  const [showCurriculumForm, setShowCurriculumForm] = useState(false);
  const [curriculumRawText, setCurriculumRawText] = useState("");

  // Load curriculum data
  useEffect(() => {
    if (user && subject.id && !curriculumState?.initialized && !curriculumState?.loading) {
      loadCurriculum(subject.id, user.id).catch((err) => {
        console.error("Error loading curriculum:", err);
      });
    }
  }, [user, subject.id, curriculumState, loadCurriculum]);

  useEffect(() => {
    setTempExamDate(subject.examDate || "");
  }, [subject.examDate, subject.id]);

  const examDate = subject.examDate || "";
  const daysToExam = examDate ? daysUntil(examDate) : null;
  const deadlines = plannerState?.deadlines || [];
  const goals = plannerState?.goals || [];
  const curriculumItems = curriculumState?.items || [];
  const completedCount = curriculumItems.filter((item) => item.completed).length;
  const totalCount = curriculumItems.length;

  const handleSaveExam = async () => {
    if (!user) return;
    setSavingExam(true);
    setLocalError(null);
    try {
      await updateSubject(subject.id, { examDate: tempExamDate || undefined });
      setIsEditingExam(false);
    } catch (error) {
      console.error("Failed to save exam date", error);
      setLocalError("Kunne ikke lagre eksamensdato.");
    } finally {
      setSavingExam(false);
    }
  };

  const handleCancelExam = () => {
    setTempExamDate(examDate);
    setIsEditingExam(false);
  };

  const handleAddGoal = async () => {
    if (!user) return;
    if (!goalText.trim()) {
      alert("Vennligst skriv inn et mål");
      return;
    }

    const newGoal = await addGoalAction(subject.id, user.id, goalText.trim());
    if (!newGoal) {
      setLocalError("Kunne ikke legge til mål.");
      return;
    }

    setGoalText("");
    setShowGoalForm(false);
  };

  const handleAddDeadline = async () => {
    if (!user) return;
    if (!deadlineTitle.trim() || !deadlineDueDate) {
      alert("Vennligst fyll ut tittel og dato");
      return;
    }

    const newDeadline = await addDeadlineAction(subject.id, user.id, {
      title: deadlineTitle.trim(),
      dueDate: deadlineDueDate,
      type: deadlineType,
    });

    if (!newDeadline) {
      setLocalError("Kunne ikke legge til deadline.");
      return;
    }

    setDeadlineTitle("");
    setDeadlineDueDate("");
    setDeadlineType("innlevering");
    setShowDeadlineForm(false);
  };

  const handleAddReadingItems = async () => {
    if (!user) return;
    if (!curriculumRawText.trim()) {
      alert("Vennligst lim inn pensum");
      return;
    }

    const added = await addCurriculumItemsFromText(
      subject.id,
      user.id,
      curriculumRawText
    );

    if (added.length === 0) {
      setLocalError("Kunne ikke legge til pensum.");
      return;
    }

    setCurriculumRawText("");
    setShowCurriculumForm(false);
  };

  const handleToggleCurriculumItem = async (itemId: string) => {
    if (!user) return;
    
    const updated = await toggleCurriculumItem(subject.id, itemId, user.id);
    if (updated) {
      // Record study activity when curriculum item is toggled
      await recordActivity(user.id, subject.id, 'curriculum_toggled');
    }
  };

  const handleCreateNoteFromCurriculum = (curriculumItemId: string) => {
    router.push(`/notes/new?subjectId=${subject.id}&curriculumItemId=${curriculumItemId}`);
  };

  const getDeadlineTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      innlevering: "Innlevering",
      prøve: "Prøve",
      prosjekt: "Prosjekt",
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Oversikt
      </h3>

      {(localError || plannerState?.error) && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-200">
          {localError || plannerState?.error}
        </div>
      )}

      {/* A) EKSAMEN SECTION */}
      <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            📅 Eksamen
          </h4>
          <button
            onClick={() => setIsEditingExam(!isEditingExam)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isEditingExam ? "Avbryt" : "Rediger"}
          </button>
        </div>

        {isEditingExam ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Eksamensdato
              </label>
              <input
                type="date"
                value={tempExamDate}
                onChange={(e) => setTempExamDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveExam}
                disabled={savingExam}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70"
              >
                {savingExam ? "Lagrer..." : "Lagre"}
              </button>
              <button
                onClick={handleCancelExam}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Avbryt
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {examDate ? (
              <>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Eksamensdato:
                  </span>
                  <p className="text-gray-900 dark:text-white">
                    {formatDateNO(examDate)}
                  </p>
                </div>
                {daysToExam !== null && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {daysToExam > 0
                        ? `${daysToExam} dager til eksamen`
                        : daysToExam === 0
                        ? "Eksamen i dag!"
                        : "Eksamen er over"}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Ingen eksamensdato satt. Klikk "Rediger" for å legge til.
              </p>
            )}
          </div>
        )}
      </div>

      {/* B) MÅL SECTION */}
      <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            🎯 Mål
          </h4>
          <button
            onClick={() => setShowGoalForm(!showGoalForm)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showGoalForm ? "Avbryt" : "+ Legg til"}
          </button>
        </div>

        {showGoalForm && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Mål
              </label>
              <input
                type="text"
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="F.eks. Bestå eksamen med B eller bedre"
              />
            </div>
            <button
              onClick={handleAddGoal}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Legg til mål
            </button>
          </div>
        )}

        <div className="space-y-2">
          {goals.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Ingen mål lagt til ennå
            </p>
          ) : (
            goals.map((goal) => (
              <div
                key={goal.id}
                className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600 flex justify-between items-center"
              >
                <p className="text-gray-900 dark:text-white">{goal.text}</p>
                <button
                  onClick={() => user && removeGoalAction(subject.id, goal.id, user.id)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm ml-2"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* C) DEADLINES SECTION (Pro feature) */}
      {isPro && (
        <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                📌 Deadlines
              </h4>
              <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded">
                Pro
              </span>
            </div>
            <button
              onClick={() => setShowDeadlineForm(!showDeadlineForm)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {showDeadlineForm ? "Avbryt" : "+ Legg til"}
            </button>
          </div>

          {showDeadlineForm && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Tittel
                </label>
                <input
                  type="text"
                  value={deadlineTitle}
                  onChange={(e) => setDeadlineTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="F.eks. Innlevering 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Frist
                </label>
                <input
                  type="date"
                  value={deadlineDueDate}
                  onChange={(e) => setDeadlineDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Type
                </label>
                <select
                  value={deadlineType}
                  onChange={(e) => setDeadlineType(e.target.value as "innlevering" | "prøve" | "prosjekt")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="innlevering">Innlevering</option>
                  <option value="prøve">Prøve</option>
                  <option value="prosjekt">Prosjekt</option>
                </select>
              </div>
              <button
                onClick={handleAddDeadline}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Legg til deadline
              </button>
            </div>
          )}

          <div className="space-y-2">
            {deadlines.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                Ingen deadlines lagt til ennå
              </p>
            ) : (
              deadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {deadline.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {formatDateNO(deadline.dueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded">
                        {getDeadlineTypeLabel(deadline.type)}
                      </span>
                      <button
                        onClick={() => user && removeDeadlineAction(subject.id, deadline.id, user.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* D) PENSUM / LESEFREMGANG SECTION (Pro feature) */}
      {isPro && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                📖 Pensum / Lesefremgang
              </h4>
              <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded">
                Pro
              </span>
            </div>
            <button
              onClick={() => setShowCurriculumForm(!showCurriculumForm)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {showCurriculumForm ? "Avbryt" : "+ Legg til"}
            </button>
          </div>

          {showCurriculumForm && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Lim inn pensum (én linje per lesestykke)
                </label>
                <textarea
                  value={curriculumRawText}
                  onChange={(e) => setCurriculumRawText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={`Kapittel 1: Introduksjon\nKapittel 2: Grunnleggende begreper\nArtikkel: Machine Learning Basics`}
                  rows={5}
                />
              </div>
              <button
                onClick={handleAddReadingItems}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Legg til pensum
              </button>
            </div>
          )}

          {totalCount > 0 && (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Fremgang: {completedCount} av {totalCount} fullført
              </p>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            {curriculumItems.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                Ingen pensum lagt til ennå
              </p>
            ) : (
              curriculumItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleCurriculumItem(item.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <p className={`flex-1 text-sm text-gray-900 dark:text-white ${item.completed ? "line-through opacity-60" : ""}`}>
                    {item.title}
                  </p>
                  <button
                    onClick={() => handleCreateNoteFromCurriculum(item.id)}
                    className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                    title="Opprett notat knyttet til denne pensumlinja"
                  >
                    + Notat
                  </button>
                  <button
                    onClick={() => user && removeCurriculumItem(subject.id, item.id, user.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

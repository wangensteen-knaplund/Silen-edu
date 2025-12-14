"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { formatDateNO } from "@/utils/date";
import { usePlannerStore } from "@/store/usePlannerStore";

interface PlannerProProps {
  subjectId: string;
  initialExamDate?: string;
}

export default function PlannerPro({ subjectId }: PlannerProProps) {
  const { user } = useAuth();
  const plannerState = usePlannerStore((state) => state.dataBySubjectId[subjectId]);
  const loadPlanner = usePlannerStore((state) => state.loadForSubject);
  const addDeadlineAction = usePlannerStore((state) => state.addDeadline);
  const removeDeadlineAction = usePlannerStore((state) => state.removeDeadline);
  const addReadingItemsFromTextAction = usePlannerStore(
    (state) => state.addReadingItemsFromText
  );
  const toggleReadingItemAction = usePlannerStore((state) => state.toggleReadingItem);
  const removeReadingItemAction = usePlannerStore((state) => state.removeReadingItem);

  const [showDeadlineForm, setShowDeadlineForm] = useState(false);
  const [deadlineTitle, setDeadlineTitle] = useState("");
  const [deadlineDueDate, setDeadlineDueDate] = useState("");
  const [deadlineType, setDeadlineType] = useState<"innlevering" | "prøve" | "prosjekt">("innlevering");

  const [showReadingForm, setShowReadingForm] = useState(false);
  const [readingTitle, setReadingTitle] = useState("");

  useEffect(() => {
    if (!user) return;
    void loadPlanner(subjectId, user.id);
  }, [user, subjectId, loadPlanner]);

  if (!user) return null;

  const deadlines = plannerState?.deadlines || [];
  const readingItems = plannerState?.readingItems || [];

  const completedCount = readingItems.filter((item) => item.completed).length;
  const totalCount = readingItems.length;

  const handleAddDeadline = async () => {
    if (!deadlineTitle.trim() || !deadlineDueDate) {
      alert("Vennligst fyll ut tittel og dato");
      return;
    }

    const created = await addDeadlineAction(subjectId, user.id, {
      title: deadlineTitle.trim(),
      dueDate: deadlineDueDate,
      type: deadlineType,
    });

    if (created) {
      setDeadlineTitle("");
      setDeadlineDueDate("");
      setDeadlineType("innlevering");
      setShowDeadlineForm(false);
    }
  };

  const handleAddReadingItem = async () => {
    if (!readingTitle.trim()) {
      alert("Vennligst fyll ut tittel");
      return;
    }

    await addReadingItemsFromTextAction(subjectId, user.id, readingTitle);
    setReadingTitle("");
    setShowReadingForm(false);
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          ⭐ Planner Pro
        </h3>
        <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded">
          Pro Feature
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Pro-funksjoner inkluderer deadlines, lesefremgang og avansert planlegging.
      </p>

      {/* Deadlines Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">📌 Deadlines</h4>
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
                      onClick={() => removeDeadlineAction(subjectId, deadline.id, user.id)}
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

      {/* Reading Items Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">📖 Pensum</h4>
          <button
            onClick={() => setShowReadingForm(!showReadingForm)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showReadingForm ? "Avbryt" : "+ Legg til"}
          </button>
        </div>

        {showReadingForm && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Pensumlinje
              </label>
              <input
                type="text"
                value={readingTitle}
                onChange={(e) => setReadingTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Kapittel 1: Introduksjon"
              />
            </div>
            <button
              onClick={handleAddReadingItem}
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

        <div className="space-y-2">
          {readingItems.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Ingen pensum lagt til ennå
            </p>
          ) : (
            readingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleReadingItemAction(subjectId, item.id, user.id)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <p className={`flex-1 text-sm text-gray-900 dark:text-white ${item.completed ? "line-through opacity-60" : ""}`}>
                  {item.text}
                </p>
                <button
                  onClick={() => removeReadingItemAction(subjectId, item.id, user.id)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

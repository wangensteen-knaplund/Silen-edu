"use client";

import { useEffect, useState } from "react";
import { daysUntil, formatDateNO } from "@/utils/date";
import { usePlannerStore } from "@/store/usePlannerStore";

interface PlannerLiteProps {
  subjectId: string;
  initialExamDate?: string;
}

export default function PlannerLite({ subjectId, initialExamDate }: PlannerLiteProps) {
  const plannerData = usePlannerStore((state) => state.plannerLiteBySubjectId[subjectId]);
  const setExamDate = usePlannerStore((state) => state.setExamDate);
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempExamDate, setTempExamDate] = useState("");

  useEffect(() => {
    // Initialize with data from store or initial prop
    if (plannerData?.examDate) {
      setTempExamDate(plannerData.examDate);
    } else if (initialExamDate) {
      setTempExamDate(initialExamDate);
    }
  }, [plannerData?.examDate, initialExamDate]);

  const examDate = plannerData?.examDate || initialExamDate || "";
  const daysToExam = examDate ? daysUntil(examDate) : null;

  const handleSave = () => {
    if (tempExamDate) {
      setExamDate(subjectId, tempExamDate);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempExamDate(examDate);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          📅 Planner Lite
        </h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isEditing ? "Avbryt" : "Rediger"}
        </button>
      </div>

      {isEditing ? (
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
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lagre
            </button>
            <button
              onClick={handleCancel}
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
              Ingen eksamensdato satt. Klikk &quot;Rediger&quot; for å legge til.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface PlannerLiteProps {
  subjectId: string;
}

interface StudyPlan {
  goal: string;
  weeks_left: number;
  weekly_plan: string;
}

export default function PlannerLite({ subjectId }: PlannerLiteProps) {
  const [plan, setPlan] = useState<StudyPlan>({
    goal: "",
    weeks_left: 0,
    weekly_plan: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlan();
  }, [subjectId]);

  const fetchPlan = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("study_plan")
        .select("*")
        .eq("user_id", user.id)
        .eq("subject_id", subjectId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching plan:", error);
        return;
      }

      if (data) {
        setPlan({
          goal: data.goal || "",
          weeks_left: data.weeks_left || 0,
          weekly_plan: data.weekly_plan || "",
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("study_plan").upsert({
        user_id: user.id,
        subject_id: subjectId,
        goal: plan.goal,
        weeks_left: plan.weeks_left,
        weekly_plan: plan.weekly_plan,
      });

      if (error) {
        console.error("Error saving plan:", error);
        alert("Feil ved lagring av plan");
        return;
      }

      setIsEditing(false);
      alert("Plan lagret!");
    } catch (error) {
      console.error("Error:", error);
      alert("Feil ved lagring av plan");
    }
  };

  if (loading) {
    return <div className="text-center py-4">Laster...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          📅 Study Planner Lite
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
              Hovedmål
            </label>
            <input
              type="text"
              value={plan.goal}
              onChange={(e) => setPlan({ ...plan, goal: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="F.eks. Bestå eksamen med B eller bedre"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Uker igjen til eksamen
            </label>
            <input
              type="number"
              value={plan.weeks_left}
              onChange={(e) =>
                setPlan({ ...plan, weeks_left: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Ukens plan
            </label>
            <textarea
              value={plan.weekly_plan}
              onChange={(e) =>
                setPlan({ ...plan, weekly_plan: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-32 resize-none"
              placeholder="F.eks.&#10;- Gå gjennom kapittel 1-3&#10;- Lag quiz på notater&#10;- Gjør øvingsoppgaver"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Lagre plan
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {plan.goal ? (
            <>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Mål:
                </span>
                <p className="text-gray-900 dark:text-white">{plan.goal}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Uker igjen:
                </span>
                <p className="text-gray-900 dark:text-white">
                  {plan.weeks_left}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ukens plan:
                </span>
                <p className="text-gray-900 dark:text-white whitespace-pre-line">
                  {plan.weekly_plan}
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              Ingen plan opprettet ennå. Klikk &quot;Rediger&quot; for å
              opprette en plan.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

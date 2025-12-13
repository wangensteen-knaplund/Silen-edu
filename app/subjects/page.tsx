"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SubjectCard from "@/components/SubjectCard";
import { useSubjectsStore } from "@/store/useSubjectsStore";

export default function SubjectsPage() {
  const subjects = useSubjectsStore((state) => state.subjects);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Mine fag
          </h1>

          {subjects.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-gray-600 dark:text-gray-400">
                Du har ingen fag ennå. Fag vil bli lagt til her.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  id={subject.id}
                  name={subject.name}
                  examDate={subject.examDate}
                  noteCount={0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

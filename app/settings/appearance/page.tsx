"use client";

import Link from "next/link";

export default function AppearanceSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link
              href="/settings"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-2 inline-block"
            >
              ← Tilbake til innstillinger
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Utseende
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Tema
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  className="w-4 h-4"
                  disabled
                />
                <span className="text-gray-900 dark:text-white">Lyst tema</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  className="w-4 h-4"
                  disabled
                />
                <span className="text-gray-900 dark:text-white">Mørkt tema</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <input
                  type="radio"
                  name="theme"
                  value="system"
                  className="w-4 h-4"
                  defaultChecked
                  disabled
                />
                <span className="text-gray-900 dark:text-white">System (automatisk)</span>
              </label>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-4">
              Temavalg er ikke implementert ennå. Følger systemet ditt automatisk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";

export default function AccountSettingsPage() {
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
              Kontoinnstillinger
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Profil
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Navn
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ditt navn"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  E-post
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="din@epost.no"
                  disabled
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                Kontoinnstillinger er ikke implementert ennå
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Passord
            </h2>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700" disabled>
              Endre passord
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-2">
              Funksjon ikke implementert ennå
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

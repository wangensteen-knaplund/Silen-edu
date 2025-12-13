"use client";

import Link from "next/link";

export default function SubscriptionSettingsPage() {
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
              Abonnement
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Nåværende plan
            </h2>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg font-semibold">
                GRATIS
              </div>
              <span className="text-gray-600 dark:text-gray-400">
                Du bruker gratis-versjonen
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Oppgrader til Pro
            </h2>
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Pro-funksjoner inkluderer:
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>✅ Planner Pro med deadlines og lesefremgang</li>
                <li>✅ AI-genererte quiz og refleksjonsspørsmål</li>
                <li>✅ AI-oppsummering av notater</li>
                <li>✅ Ubegrenset lagring</li>
                <li>✅ Prioritert support</li>
              </ul>
            </div>
            <button
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              disabled
            >
              Oppgrader til Pro (Kommer snart)
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-2">
              Abonnementsfunksjon er ikke implementert ennå
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsPage() {
  const pathname = usePathname();

  const settingsLinks = [
    { path: "/settings/account", label: "Konto", icon: "👤" },
    { path: "/settings/appearance", label: "Utseende", icon: "🎨" },
    { path: "/settings/subscription", label: "Abonnement", icon: "⭐" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Innstillinger
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {settingsLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <div className="text-4xl mb-3">{link.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {link.label}
                </h3>
              </Link>
            ))}
          </div>

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Om Silen-Edu
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Versjon: 1.0.0 (MVP)
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              En AI-drevet studieplattform for studenter
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

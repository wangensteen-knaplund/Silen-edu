import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <main className="max-w-4xl text-center">
        <h1 className="text-5xl font-bold mb-4 text-blue-600 dark:text-blue-400">
          📚 StudyApp
        </h1>
        <p className="text-xl mb-8 text-gray-700 dark:text-gray-300">
          AI-drevet studieplattform for smarte studenter
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">✅ Notater</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Opprett, rediger og organiser notater etter fag
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">🧠 AI-funksjoner</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Oppsummer notater og generer quiz automatisk
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">📅 Study Planner</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enkel planlegging med mål og ukentlig struktur
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">🔗 Del notater</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gjør notater offentlige med én toggle
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Logg inn
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
          >
            Registrer deg
          </Link>
        </div>
      </main>
    </div>
  );
}

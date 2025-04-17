import { useAuth } from "./providers/AuthProvider";

export default function Navigation() {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <a href="/" className="text-xl font-bold text-gray-900">
            AltImageOptimizer
          </a>
          <nav>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-600">Witaj, {user.email}</span>
                <a href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </a>
                <button
                  onClick={logout}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Wylogowywanie..." : "Wyloguj się"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <a href="/auth/login" className="px-4 py-2 text-gray-600 hover:text-gray-900">
                  Zaloguj się
                </a>
                <a
                  href="/auth/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Zarejestruj się
                </a>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useState, useEffect } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  profile_image?: string;
  created_at: string;
}

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const currentUser = authService.getUser();
    setUser(currentUser);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    navigate("/");
  };
  return (
    <header className="bg-game-grid-header shadow-[0_-1px_37px_0_rgba(129,129,129,0.25)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Mobile Header */}
          <div className="flex items-center justify-between h-20 py-4">
            {/* Mobile Logo */}
            <div className="flex flex-col items-center">
              <h1 className="text-white font-ethnocentric text-lg font-light leading-tight">
                THE
              </h1>
              <h2 className="text-white font-ethnocentric text-lg font-light leading-tight">
                GAME GRID
              </h2>
            </div>

            {/* Mobile User Profile */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <button
                    onClick={handleLogout}
                    className="text-white font-jost font-bold text-sm uppercase tracking-wider hover:text-accent transition-colors"
                  >
                    Logout
                  </button>
                  <div className="text-white font-jost font-bold text-sm uppercase tracking-wider underline">
                    {user.display_name}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gray-600 overflow-hidden">
                    {user.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt="User Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-game-grid-gradient-start to-game-grid-gradient-end flex items-center justify-center text-white font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/signin"
                    className="text-white font-jost font-bold text-sm uppercase tracking-wider hover:text-accent transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-accent text-black px-4 py-2 rounded-lg font-jost font-bold text-sm uppercase tracking-wider hover:bg-accent/90 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex justify-center space-x-6 pb-4 border-t border-white/20 pt-4">
            <Link
              to="/games"
              className="text-white font-jost font-bold text-sm uppercase tracking-wider hover:text-accent transition-colors"
            >
              Home
            </Link>
            <Link
              to="/games"
              className="text-white font-jost font-bold text-sm uppercase tracking-wider hover:text-accent transition-colors"
            >
              Games
            </Link>
            <Link
              to="/community"
              className="text-white font-jost font-bold text-sm uppercase tracking-wider hover:text-accent transition-colors"
            >
              Community
            </Link>
            <Link
              to="/news"
              className="text-white font-jost font-bold text-sm uppercase tracking-wider hover:text-accent transition-colors"
            >
              News
            </Link>
          </nav>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between h-36">
          {/* Left Navigation - moved to far left edge */}
          <nav className="flex items-center space-x-3 xl:space-x-4 -ml-12 xl:-ml-24">
            <Link
              to="/games"
              className="text-white font-jost font-bold text-xl uppercase tracking-wider hover:text-accent transition-colors"
            >
              Home
            </Link>
            <Link
              to="/games"
              className="text-white font-jost font-bold text-xl uppercase tracking-wider hover:text-accent transition-colors"
            >
              Games
            </Link>
            <Link
              to="/community"
              className="text-white font-jost font-bold text-xl uppercase tracking-wider hover:text-accent transition-colors"
            >
              Community
            </Link>
            <Link
              to="/news"
              className="text-white font-jost font-bold text-xl uppercase tracking-wider hover:text-accent transition-colors"
            >
              News
            </Link>
          </nav>

          {/* Center Logo */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <h1 className="text-white font-ethnocentric text-3xl xl:text-5xl font-light">
                  THE
                </h1>
                {/* Decorative elements */}
                <div className="absolute -right-6 xl:-right-8 top-2 xl:top-3 flex items-center space-x-1 xl:space-x-2">
                  <div className="w-12 xl:w-16 h-px bg-white"></div>
                  <div className="w-5 xl:w-6 h-5 xl:h-6 rounded-full bg-gradient-to-br from-game-grid-gradient-start to-game-grid-gradient-end"></div>
                  <div className="w-3 xl:w-4 h-3 xl:h-4 rounded-full bg-gradient-to-br from-game-grid-gradient-start to-game-grid-gradient-end"></div>
                </div>
                <div className="absolute -left-6 xl:-left-8 top-3 xl:top-5">
                  <div className="w-3 xl:w-4 h-3 xl:h-4 rounded-full bg-gradient-to-br from-game-grid-gradient-start to-game-grid-gradient-end"></div>
                </div>
              </div>
              <h2 className="text-white font-ethnocentric text-3xl xl:text-5xl font-light">
                GAME GRID
              </h2>
            </div>
          </div>

          {/* Right User Profile */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={handleLogout}
                  className="text-white font-jost font-bold text-xl uppercase tracking-wider hover:text-accent transition-colors"
                >
                  Logout
                </button>
                <div className="text-white font-jost font-bold text-xl uppercase tracking-wider underline">
                  {user.display_name}
                </div>
                <div className="w-20 h-20 xl:w-22 xl:h-22 rounded-full bg-gray-600 overflow-hidden">
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt="User Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-game-grid-gradient-start to-game-grid-gradient-end flex items-center justify-center text-white font-bold text-2xl">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/signin"
                  className="text-white font-jost font-bold text-xl uppercase tracking-wider hover:text-accent transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-accent text-black px-6 py-3 rounded-lg font-jost font-bold text-xl uppercase tracking-wider hover:bg-accent/90 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

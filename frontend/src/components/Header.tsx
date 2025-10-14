import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useState, useEffect, useCallback } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  profile_image?: string;
  created_at: string;
}

export function Header({ variant = 'default' }: { variant?: 'default' | 'centeredLogo' }) {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", to: "/home" },
    { label: "Games", to: "/games" },
    { label: "Community", to: "/community" },
    { label: "News", to: "/news" },
  ];

  useEffect(() => {
    setUser(authService.getUser());
  }, []);

  const handleLogout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    navigate("/");
  }, [navigate]);

  const activeClasses = "text-accent";
  const baseLink =
    "relative px-3 py-2 font-jost text-sm tracking-wide uppercase text-white/70 hover:text-white transition-colors group";

  const renderNav = (mobile = false) => (
    <ul className={`flex ${mobile ? "flex-col gap-1" : "items-center gap-1"}`}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <li key={item.to}>
            <Link
              to={item.to}
              className={`${baseLink} ${isActive ? activeClasses : ""}`}
              onClick={() => mobile && setMenuOpen(false)}
            >
              <span className="relative z-10">{item.label}</span>
              <span
                className={`pointer-events-none absolute inset-0 rounded-md bg-gradient-to-r from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  isActive ? "opacity-100" : ""
                }`}
              />
              <span
                className={`absolute left-1/2 -bottom-0.5 h-[2px] w-0 -translate-x-1/2 bg-accent transition-all duration-500 group-hover:w-8 ${
                  isActive ? "w-8" : ""
                }`}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );

  if (variant === 'centeredLogo') {
    return (
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/55 supports-[backdrop-filter]:bg-black/40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex h-20 items-center justify-center">
            <Link to="/" className="group flex items-center gap-2">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-game-grid-gradient-start to-game-grid-gradient-end shadow-inner shadow-black/50 flex items-center justify-center">
                <span className="font-ethnocentric text-[0.55rem] tracking-wider text-white/90 leading-none">
                  GG
                </span>
                <div className="absolute -inset-[2px] rounded-xl ring-1 ring-white/10 group-hover:ring-accent/40 transition" />
              </div>
              <div className="flex flex-col leading-tight select-none">
                <span className="font-ethnocentric text-xs text-white/70 group-hover:text-white transition-colors">
                  THE
                </span>
                <span className="font-ethnocentric text-base text-white group-hover:text-accent transition-colors">
                  GAME GRID
                </span>
              </div>
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-70" />
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-black/55 supports-[backdrop-filter]:bg-black/40 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Top bar */}
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Left: Brand & Desktop Nav */}
          <div className="flex items-center gap-8 min-w-0">
            <Link to="/" className="group flex items-center gap-2">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-game-grid-gradient-start to-game-grid-gradient-end shadow-inner shadow-black/50 flex items-center justify-center">
                <span className="font-ethnocentric text-[0.55rem] tracking-wider text-white/90 leading-none">
                  GG
                </span>
                <div className="absolute -inset-[2px] rounded-xl ring-1 ring-white/10 group-hover:ring-accent/40 transition" />
              </div>
              <div className="flex flex-col leading-tight select-none">
                <span className="font-ethnocentric text-xs text-white/70 group-hover:text-white transition-colors">
                  THE
                </span>
                <span className="font-ethnocentric text-base text-white group-hover:text-accent transition-colors">
                  GAME GRID
                </span>
              </div>
            </Link>
            <nav className="hidden lg:block">{renderNav()}</nav>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Auth State */}
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs font-jost tracking-wide text-white/70 hover:text-white border border-white/10 hover:border-accent/40 transition-colors"
                >
                  Logout
                </button>
                <div className="hidden md:block text-white/70 text-xs font-jost tracking-wide max-w-[120px] truncate">
                  {user.display_name}
                </div>
                <button
                  className="relative w-11 h-11 rounded-full overflow-hidden ring-1 ring-white/15 hover:ring-accent/50 transition group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm"
                  onClick={() => navigate('/profile')}
                >
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center font-ethnocentric text-sm text-white/80 group-hover:text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_4px_12px_-2px_rgba(0,0,0,0.6)]" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/signin"
                  className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs font-jost tracking-wide text-white/70 hover:text-white border border-white/10 hover:border-accent/40 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-md bg-accent text-black text-xs font-jost tracking-wide font-semibold hover:bg-accent/90 shadow-[0_4px_18px_-4px_rgba(255,120,50,0.45)] transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden relative w-11 h-11 flex flex-col items-center justify-center gap-[5px] group"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle navigation menu"
            >
              {[0, 1, 2].map((b) => (
                <span
                  key={b}
                  className={`h-[2px] w-6 rounded-full bg-white/80 transition-all duration-300 ${
                    menuOpen
                      ? b === 0
                        ? 'translate-y-[7px] rotate-45'
                        : b === 1
                        ? 'opacity-0'
                        : '-translate-y-[7px] -rotate-45'
                      : ''
                  }`}
                />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile / small screen Navigation Drawer */}
        <div
          className={`lg:hidden transition-[max-height,opacity] duration-500 ease-out overflow-hidden ${
            menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pt-2 pb-6 border-t border-white/10 flex flex-col gap-5">
            <nav>{renderNav(true)}</nav>
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            {user ? (
              <div className="flex items-center gap-3 px-1">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-1 ring-white/10 bg-white/5">
                  {user.profile_image ? (
                    <img src={user.profile_image} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center font-ethnocentric text-sm text-white/70">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-white/80 text-sm font-jost tracking-wide">
                    {user.display_name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="mt-1 self-start text-[11px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 hover:border-accent/40 transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Subtle gradient line */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-70" />
    </header>
  );
}


import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header with Logo */}
      <header className="bg-game-grid-header shadow-[0_-1px_37px_0_rgba(129,129,129,0.25)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-center h-24 lg:h-36">
            {/* Center Logo */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <h1 className="text-white font-ethnocentric text-2xl lg:text-5xl font-light">
                  THE
                </h1>
                {/* Decorative elements */}
                <div className="absolute -right-6 lg:-right-8 top-2 lg:top-3 flex items-center space-x-1 lg:space-x-2">
                  <div className="w-12 lg:w-16 h-px bg-white"></div>
                  <div className="w-5 lg:w-6 h-5 lg:h-6 rounded-full bg-gradient-to-br from-game-grid-gradient-start to-game-grid-gradient-end"></div>
                  <div className="w-3 lg:w-4 h-3 lg:h-4 rounded-full bg-gradient-to-br from-game-grid-gradient-start to-game-grid-gradient-end"></div>
                </div>
                <div className="absolute -left-6 lg:-left-8 top-3 lg:top-5">
                  <div className="w-3 lg:w-4 h-3 lg:h-4 rounded-full bg-gradient-to-br from-game-grid-gradient-start to-game-grid-gradient-end"></div>
                </div>
              </div>
              <h2 className="text-white font-ethnocentric text-2xl lg:text-5xl font-light">
                GAME GRID
              </h2>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Welcome Message */}
          <div className="text-center">
            <h3 className="text-white font-montserrat text-3xl lg:text-4xl font-bold tracking-wider mb-4 uppercase">
              Welcome to the Grid
            </h3>
            <p className="text-white/70 font-jost text-lg lg:text-xl leading-relaxed">
              Join the ultimate gaming community and discover your next favorite game.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Sign Up Button */}
            <Link
              to="/signup"
              className="w-full flex justify-center py-4 px-6 border border-transparent rounded-lg text-black bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent focus:ring-offset-background transition-all duration-200 transform hover:scale-105"
            >
              <span className="font-jost font-bold text-lg uppercase tracking-wider">
                Sign Up
              </span>
            </Link>

            {/* Sign In Button */}
            <Link
              to="/signin"
              className="w-full flex justify-center py-4 px-6 border-2 border-white rounded-lg text-white bg-transparent hover:bg-white hover:text-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-background transition-all duration-200 transform hover:scale-105"
            >
              <span className="font-jost font-bold text-lg uppercase tracking-wider">
                Sign In
              </span>
            </Link>

            {/* Guest Access */}
            <div className="text-center">
              <span className="text-white/50 font-jost text-sm">or</span>
            </div>
            <Link
              to="/games"
              className="w-full flex justify-center py-3 px-6 text-white/70 hover:text-accent focus:outline-none focus:text-accent transition-colors duration-200"
            >
              <span className="font-jost font-normal text-base uppercase tracking-wider underline">
                Browse as Guest
              </span>
            </Link>
          </div>

          {/* Features Highlight */}
          <div className="mt-12 text-center space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-accent/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white/60 font-jost text-xs uppercase tracking-wider">
                  Discover
                </p>
              </div>
              <div>
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-accent/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-white/60 font-jost text-xs uppercase tracking-wider">
                  Connect
                </p>
              </div>
              <div>
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-accent/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-white/60 font-jost text-xs uppercase tracking-wider">
                  Play
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-game-grid-header border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6">
          <div className="text-center">
            <p className="text-white/50 font-jost text-sm">
              © 2024 The Game Grid. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

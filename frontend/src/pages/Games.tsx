import { Header } from "../components/Header";
import { GameRow } from "../components/GameRow";
import { useState, useEffect } from "react";
import { Game } from "../../../shared/api";

// Animated Background Component - Floating light beams
const AnimatedBackground = () => {
  return (
    <div className="animated-bg-container">
      <div className="light x1"></div>
      <div className="light x2"></div>
      <div className="light x3"></div>
      <div className="light x4"></div>
      <div className="light x5"></div>
      <div className="light x6"></div>
      <div className="light x7"></div>
      <div className="light x8"></div>
      <div className="light x9"></div>
    </div>
  );
};

// Custom React Hook - Manages all API calls and game data state
const useGameAPI = () => {
  // State variables to store games and loading status
  const [topGames, setTopGames] = useState<Game[]>([]);
  const [shooterGames, setShooterGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const searchGames = async (query: string) => {
    if (!query.trim()) {
      // If search is empty, reload original games
      fetchTopGames();
      fetchShooterGames();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/games/search?q=${encodeURIComponent(query)}&limit=20`);
      if (!response.ok) throw new Error('Failed to search games');
      const data = await response.json();

      setTopGames(data.games || []);
      setShooterGames([]);
      setError(null);
    } catch (err) {
      setError('Failed to search games');
      console.error('Search Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch popular games from our backend API
  const fetchTopGames = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/games/random?limit=10');
      if (!response.ok) throw new Error('Failed to fetch games');
      const data = await response.json();
      setTopGames(data.games);
    } catch (err) {
      setError('Failed to load top games');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch games by genre (shooter games in this case)
  const fetchShooterGames = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/games?genre=shooter&limit=10');
      if (!response.ok) throw new Error('Failed to fetch games');
      const data = await response.json();
      setShooterGames(data.games);
    } catch (err) {
      setError('Failed to load shooter games');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Infinite scroll functionality - loads more games when user scrolls
  const loadMoreTopGames = async () => {
    try {
      const response = await fetch(`/api/games/random?limit=10&offset=${topGames.length}`);
      if (!response.ok) throw new Error('Failed to fetch more games');
      const data = await response.json();
      setTopGames(prev => [...prev, ...data.games]);
    } catch (err) {
      console.error('Failed to load more top games:', err);
    }
  };

  const loadMoreShooterGames = async () => {
    try {
      const response = await fetch(`/api/games?genre=shooter&limit=10&offset=${shooterGames.length}`);
      if (!response.ok) throw new Error('Failed to fetch more games');
      const data = await response.json();
      setShooterGames(prev => [...prev, ...data.games]);
    } catch (err) {
      console.error('Failed to load more shooter games:', err);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search) {
        searchGames(search);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  // Return all state and functions for components to use
  return {
    topGames,
    shooterGames,
    loading,
    error,
    fetchTopGames,
    fetchShooterGames,
    loadMoreTopGames,
    loadMoreShooterGames,
    search,
    setSearch,
    searchGames,
  };
};

// Main Games Page Component
export default function Games() {
  // Use our custom hook to get game data and functions
  const {
    topGames,
    shooterGames,
    loading,
    search,
    setSearch,
    error,
    fetchTopGames,
    fetchShooterGames,
    loadMoreTopGames,
    loadMoreShooterGames,
    
    
  } = useGameAPI();

  // Load games when component first renders
  useEffect(() => {
    fetchTopGames();
    fetchShooterGames();
  }, []);

  // Show error page if something goes wrong
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="max-w-[1869px] mx-auto px-6 lg:px-12 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-white font-jost text-lg mb-4">{error}</p>
              <button 
                onClick={() => {
                  fetchTopGames();
                  fetchShooterGames();
                }} 
                className="bg-accent text-black font-jost font-bold px-6 py-3 rounded-lg uppercase tracking-wider hover:bg-accent/90 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main page layout
  return (
    <div className="min-h-screen text-foreground relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Main Content - positioned above background */}
      <div className="relative z-10 min-h-screen">
        <Header />

      <main className="max-w-[1869px] mx-auto py-12 relative z-20">
        {/* Top Games - Hero grid layout */}
        <GameRow
          games={topGames}
          title="TOP GAMES"
          onLoadMore={loadMoreTopGames}
          loading={loading}
          hasMore={true}
          gridFeatured={true}
        />

     {/* Filter Bar */}
<section className="mb-20">
  <div className="flex flex-col lg:flex-row lg:items-center gap-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-6 shadow-[0_4px_30px_-5px_rgba(0,0,0,0.4)]">
    <div className="flex-1">
      <h2 className="text-white font-montserrat text-xl md:text-2xl font-bold tracking-wide flex items-center gap-3">
        Browse Library <span className="h-px w-16 bg-gradient-to-r from-accent to-transparent" />
      </h2>
      <p className="text-white font-inter text-sm md:text-base tracking-wide mt-1">
        Discover new games by genre, platform, or popularity
      </p>
    </div>

    <div className="flex-1 max-w-lg">
      <label className="block">
        <span className="sr-only">Search games</span>
        <div className="relative">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="search games..."
            className="w-full bg-black/40 border border-white/15 rounded-lg px-4 py-3 pr-11 text-white placeholder-white/40 font-jost tracking-wide focus:outline-none focus:ring-2 focus:ring-accent/70 focus:border-accent/70 transition" 
          />
          <svg className="w-5 h-5 absolute top-1/2 -translate-y-1/2 right-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z" />
          </svg>
        </div>
      </label>
    </div>
  </div>
</section>


        {/* Visual separator between sections */}
        <div className="w-full h-px bg-white my-16"></div>

        {/* Second row showing shooter games */}
        <GameRow
          games={shooterGames}
          title="SHOOTERS"
          onLoadMore={loadMoreShooterGames}
          loading={loading}
          hasMore={true}
          featured={false}
        />

        {/* EXPLORE Section Header */}
        <div className="flex justify-center mt-16 mb-12">
          <h2 className="text-white font-montserrat text-2xl md:text-3xl lg:text-4xl font-bold tracking-wider uppercase">
            Explore
          </h2>
        </div>

        {/* Platform Info */}
        <div className="flex justify-center mt-6 lg:mt-8">
          <span className="text-white font-inter text-sm lg:text-base tracking-wider">
            
          </span>
        </div>
      </main>
      </div>
    </div>
  );

}

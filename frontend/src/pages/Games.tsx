import { Header } from "../components/Header";
import { GameRow } from "../components/GameRow";
import { GameDetailOverlay } from "../components/GameDetailOverlay";
import { useState, useEffect } from "react";
import { Game } from "../../../shared/api";
import { NetworkBackground } from "../components/NetworkBackground";

// Replaced old beam background with shared network background

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
    // Not needed in new design
    // loadMoreTopGames,
    loadMoreShooterGames,
  } = useGameAPI();
  
  const [activeGame, setActiveGame] = useState<Game | null>(null);

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
      <NetworkBackground />
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-12 pb-24 relative z-20">
          {/* Hero Section */}
          <section className="mt-10 lg:mt-14 mb-24">
            <div className="grid lg:grid-cols-5 gap-8 items-stretch">
              <div className="lg:col-span-3 relative group rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl min-h-[420px] lg:min-h-[520px] flex">
                {topGames.length > 0 ? (
                  <>
                    <div className="absolute inset-0">
                      <img src={topGames[0].image} alt={topGames[0].title} className="w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity duration-700" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/40 to-transparent" />
                    </div>
                    <div className="relative z-10 p-6 lg:p-10 flex flex-col justify-end w-full">
                      <div className="mb-4 flex gap-2 flex-wrap">
                        {topGames[0].genres.slice(0,3).map(g => <span key={g} className="px-3 py-1 rounded-full bg-accent text-black text-xs font-jost tracking-wide">{g}</span>)}
                      </div>
                      <h1 className="text-white font-montserrat text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-lg max-w-xl leading-[1.1]">{topGames[0].title}</h1>
                      <div className="mt-6 flex items-center gap-6">
                        <button onClick={() => setActiveGame(topGames[0])} className="px-5 py-2.5 rounded-lg bg-accent text-black font-jost font-bold uppercase tracking-wider text-xs lg:text-sm shadow-[0_0_0_0_rgba(255,255,255,0.15)] hover:shadow-[0_0_0_4px_rgba(255,255,255,0.25)] transition-all">View Details</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="m-auto text-white/60 font-jost tracking-wide text-sm">Loading featured...</div>
                )}
              </div>
              <div className="lg:col-span-2 grid sm:grid-cols-3 lg:grid-cols-2 gap-4 content-start">
                {topGames.slice(1,7).map((g) => (
                  <button key={g.id} onClick={() => setActiveGame(g)} className="group relative rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm shadow-md h-40 sm:h-44 lg:h-48 text-left transition-all hover:ring-2 hover:ring-white/30">
                    <img src={g.image} alt={g.title} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <h3 className="text-white font-monomaniac text-xs sm:text-sm font-normal leading-snug line-clamp-2">{g.title}</h3>
                    </div>
                  </button>
                ))}
                {topGames.length === 0 && <div className="col-span-full text-center text-white/50 font-jost text-sm">Loading top games...</div>}
              </div>
            </div>
          </section>

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


          <GameRow games={shooterGames} title="Shooter Spotlight" onLoadMore={loadMoreShooterGames} loading={loading} hasMore={true} />

          <section className="mt-24">
            <div className="text-center mb-10">
              <h2 className="text-white font-montserrat text-2xl md:text-3xl lg:text-4xl font-bold tracking-wider uppercase">Explore</h2>
              <p className="mt-4 text-white/60 font-jost text-sm tracking-wide max-w-xl mx-auto">Dive deeper by genre or combine filters. Dynamic discovery incoming.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group relative rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm h-40 flex items-end p-5 transition-all hover:border-accent/50 hover:shadow-[0_0_0_2px_rgba(255,255,255,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/30 to-transparent opacity-70 group-hover:opacity-60 transition" />
                <div className="relative z-10">
                  <h3 className="text-white font-montserrat font-semibold text-lg tracking-wide">Coming Soon</h3>
                  <p className="text-accent font-jost text-xs mt-1 tracking-wide">More genres and filters</p>
                </div>
              </div>
            </div>
          </section>
  </main>
  {activeGame && <GameDetailOverlay game={activeGame} onClose={()=>setActiveGame(null)} />}
      </div>
    </div>
  );

}

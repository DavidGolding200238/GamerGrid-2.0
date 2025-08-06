import { Header } from "../components/Header";
import { GameRow } from "../components/GameRow";
import { useState, useEffect } from "react";
import { Game } from "../../../shared/api";

// API integration functions - replace these with your actual API calls
const useGameAPI = () => {
  const [topGames, setTopGames] = useState<Game[]>([]);
  const [shooterGames, setShooterGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch random games for the top row
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

  // Function to fetch shooter games
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

  // Function to load more games for infinite scroll
  const loadMoreTopGames = async () => {
    try {
      const currentPage = Math.floor(topGames.length / 10) + 1;
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

  return {
    topGames,
    shooterGames,
    loading,
    error,
    fetchTopGames,
    fetchShooterGames,
    loadMoreTopGames,
    loadMoreShooterGames,
  };
};

export default function Games() {
  const {
    topGames,
    shooterGames,
    loading,
    error,
    fetchTopGames,
    fetchShooterGames,
    loadMoreTopGames,
    loadMoreShooterGames,
  } = useGameAPI();

  useEffect(() => {
    // Initial load - now using real API
    fetchTopGames();
    fetchShooterGames();
  }, []);

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="max-w-[1869px] mx-auto py-12">
        {/* TOP GAMES Section - Horizontal Sliding Row */}
        <GameRow
          games={topGames}
          title="TOP GAMES"
          onLoadMore={loadMoreTopGames}
          loading={loading}
          hasMore={true}
          featured={true}
          carousel={true}
        />

        {/* Divider Line */}
        <div className="w-full h-px bg-white my-16"></div>

        {/* SHOOTERS Section - Now using GameRow for consistent styling */}
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
  );
}

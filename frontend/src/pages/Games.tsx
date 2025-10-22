import { Header } from "../components/Header";
import { GameRow } from "../components/GameRow";
import { GameDetailOverlay } from "../components/GameDetailOverlay";
import { GameCard } from "../components/GameCard";
import Footer from "../components/footer";
import { useState, useEffect, useMemo } from "react";
import { Game } from "../../../shared/api";
import { NetworkBackground } from "../components/NetworkBackground";

// Config: which genre rows to show
const GENRE_ROWS = ["shooter", "rpg", "action", "adventure", "indie", "strategy"] as const;
type GenreKey = typeof GENRE_ROWS[number];

// Light platform list to filter against Game.platform names
const PLATFORMS = ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"];

const ROW_PAGE_SIZE = 10;
const SLIDE_SIZE = 5;

type RowMap = Record<string, Game[]>;
type LoadingMap = Record<string, boolean>;
type HasMoreMap = Record<string, boolean>;

// Utilities
const sortGames = (games: Game[], sortBy: string) => {
  const arr = [...games];
  switch (sortBy) {
    case "rating_desc":
      return arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "rating_asc":
      return arr.sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0));
    case "title_az":
      return arr.sort((a, b) => a.title.localeCompare(b.title));
    case "title_za":
      return arr.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return arr;
  }
};

export default function Games() {
  // Hero/top carousel source
  const [topGames, setTopGames] = useState<Game[]>([]);
  const [topLoading, setTopLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  // Genre rows
  const [rows, setRows] = useState<RowMap>({});
  const [rowLoading, setRowLoading] = useState<LoadingMap>({});
  const [hasMoreByGenre, setHasMoreByGenre] = useState<HasMoreMap>({});

  // Search and filters
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("rating_desc");

  // Detail
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  // Hero slider
  const [slide, setSlide] = useState(0);
  const [heroLoadingMore, setHeroLoadingMore] = useState(false);

  // Reset to first slide when changing hero source
  useEffect(() => {
    setSlide(0);
  }, [search, genreFilter]);

  // Fetch functions
  const fetchTopGames = async () => {
    try {
      setTopLoading(true);
      // Get enough to build 3 slides
  const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';
  const response = await fetch(`${API_BASE}/games/random?limit=24`);
      if (!response.ok) throw new Error("Failed to fetch games");
      const data = await response.json();
      setTopGames(data.games || []);
      setError(null);
    } catch (err) {
      console.error("API Error:", err);
      setError("Failed to load top games");
    } finally {
      setTopLoading(false);
    }
  };

  const fetchGenreRow = async (genre: GenreKey, append = false) => {
    try {
      setRowLoading((m) => ({ ...m, [genre]: true }));
      const offset = append ? (rows[genre]?.length || 0) : 0;
  const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';
  const response = await fetch(`${API_BASE}/games?genre=${encodeURIComponent(genre)}&limit=${ROW_PAGE_SIZE}&offset=${offset}`);
      if (!response.ok) throw new Error(`Failed to fetch ${genre} games`);
      const data = await response.json();
      const incoming: Game[] = data.games || [];

      setRows((prev) => ({
        ...prev,
        [genre]: append ? [...(prev[genre] || []), ...incoming] : incoming,
      }));

      // hasMore if we received a full page; if fewer than page-size, we've reached the end
      setHasMoreByGenre((prev) => ({
        ...prev,
        [genre]: incoming.length === ROW_PAGE_SIZE,
      }));
    } catch (err) {
      console.error(`Failed to load ${genre} games:`, err);
      // stop trying for this genre on error
      setHasMoreByGenre((prev) => ({ ...prev, [genre]: false }));
    } finally {
      setRowLoading((m) => ({ ...m, [genre]: false }));
    }
  };

  const loadMoreGenre = async (genre: GenreKey) => {
    if (rowLoading[genre] || hasMoreByGenre[genre] === false) return;
    await fetchGenreRow(genre, true);
  };

  const searchGames = async (query: string) => {
    if (!query.trim()) return;
    try {
      setTopLoading(true);
  const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';
  const response = await fetch(`${API_BASE}/games/search?q=${encodeURIComponent(query)}&limit=30`);
      if (!response.ok) throw new Error("Failed to search games");
      const data = await response.json();
      setTopGames(data.games || []);
      setError(null);
      // When searching, keep rows as-is; we’ll display search results section
    } catch (err) {
      console.error("Search Error:", err);
      setError("Failed to search games");
    } finally {
      setTopLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTopGames();
    GENRE_ROWS.forEach((g) => fetchGenreRow(g));
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (search) searchGames(search);
      else fetchTopGames(); // reset to default random when clearing search
    }, 500);
    return () => clearTimeout(t);
  }, [search]);

  // Derived: filters
  const filtersActive =
    (genreFilter && genreFilter !== "all") ||
    (platformFilter && platformFilter !== "all") ||
    minRating > 0 ||
    !!search;

  const filtered = useMemo(() => {
    let base: Game[] = [];

    // If user is searching, filtered grid shows search results
    if (search.trim()) {
      base = topGames;
    } else if (genreFilter !== "all") {
      base = rows[genreFilter] || [];
    } else {
      // Show a mix of top/rows when just platform/minRating/sort are set
      base = topGames.length ? topGames : Object.values(rows).flat();
    }

    // Apply platform filter
    if (platformFilter !== "all") {
      base = base.filter((g) => (g.platform || []).some((p) => p?.toLowerCase().includes(platformFilter.toLowerCase())));
    }

    // Apply rating filter
    if (minRating > 0) {
      base = base.filter((g) => (g.rating || 0) >= minRating);
    }

    // Sort
    base = sortGames(base, sortBy);

    return base;
  }, [search, topGames, rows, genreFilter, platformFilter, minRating, sortBy]);

  // Pick hero source: when filtering by a genre (and not searching), use that genre row
  const heroSource = useMemo(() => {
    if (search.trim()) return topGames; // search results already replace topGames
    if (genreFilter !== "all") return rows[genreFilter] || [];
    return topGames;
  }, [search, genreFilter, rows, topGames]);

  // Hero slider slices using SLIDE_SIZE (hero + 4 support = 5 per slide)
  const totalSlides = Math.max(1, Math.ceil(heroSource.length / SLIDE_SIZE));
  const currentSlide = Math.min(slide, totalSlides - 1);
  const heroIndex = currentSlide * SLIDE_SIZE;
  const heroGame = heroSource[heroIndex];
  const supportGames = heroSource.slice(heroIndex + 1, heroIndex + SLIDE_SIZE);

  // Prefetch next slide when user reaches the last available slide for a genre
  useEffect(() => {
    if (!search.trim() && genreFilter !== "all") {
      const onLastSlide = currentSlide >= totalSlides - 1;
      const needUpToIndex = (currentSlide + 1) * SLIDE_SIZE + (SLIDE_SIZE - 1);
      const currentLen = heroSource.length;
      const canLoadMore = hasMoreByGenre[genreFilter as GenreKey];

      if (onLastSlide && currentLen <= needUpToIndex && canLoadMore && !heroLoadingMore) {
        (async () => {
          try {
            setHeroLoadingMore(true);
            await fetchGenreRow(genreFilter as GenreKey, true);
          } finally {
            setHeroLoadingMore(false);
          }
        })();
      }
    }
  }, [currentSlide, totalSlides, heroSource.length, genreFilter, search, hasMoreByGenre, heroLoadingMore]);

  return (
    <div className="min-h-screen text-foreground relative overflow-hidden">
      <NetworkBackground />
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-12 pb-24 relative z-20">
          {error && (
            <div className="mt-6 mb-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3 font-jost tracking-wide">
              {error}
            </div>
          )}
          {/* Hero Section with adaptive slides */}
          <section className="mt-10 lg:mt-14 mb-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-montserrat text-xl md:text-2xl font-bold tracking-wide flex items-center gap-3">
                Top Games <span className="h-0.5 w-16 bg-accent rounded-full" />
              </h2>
            </div>

            <div className="grid lg:grid-cols-5 gap-8 items-stretch">
              <div className="lg:col-span-3 relative group rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl min-h-[420px] lg:min-h-[520px] flex">
                {topLoading ? (
                  <div className="m-auto text-white/60 font-jost tracking-wide text-sm">Loading featured...</div>
                ) : heroGame ? (
                  <>
                    <div className="absolute inset-0">
                      <img src={heroGame.image} alt={heroGame.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/40 to-transparent" />
                    </div>
                    <div className="relative z-10 p-6 lg:p-10 flex flex-col justify-end w-full">
                      <div className="mb-4 flex gap-2 flex-wrap">
                        {heroGame.genres.slice(0,3).map(g => <span key={g} className="px-3 py-1 rounded-full bg-accent text-black text-xs font-jost tracking-wide">{g}</span>)}
                      </div>
                      <h1 className="text-white font-montserrat text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-lg max-w-xl leading-[1.1]">{heroGame.title}</h1>
                      <div className="mt-6 flex items-center gap-6">
                        <button onClick={() => setActiveGame(heroGame)} className="px-5 py-2.5 rounded-lg bg-accent text-black font-jost font-bold uppercase tracking-wider text-xs lg:text-sm hover:bg-accent/90 transition">View Details</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="m-auto text-white/60 font-jost tracking-wide text-sm">No featured available</div>
                )}
              </div>

              <div className="lg:col-span-2 grid sm:grid-cols-3 lg:grid-cols-2 gap-4 content-start">
                {supportGames.map((g) => (
                  <button key={g.id} onClick={() => setActiveGame(g)} className="group relative rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm shadow-md h-48 sm:h-56 lg:h-64 text-left transition-all hover:ring-2 hover:ring-accent/50 hover:border-accent/40">
                    <img src={g.image} alt={g.title} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    {/* Rating badge for consistency */}
                    {typeof g.rating === 'number' && !isNaN(g.rating) && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className="px-2 py-0.5 rounded-md bg-black/55 backdrop-blur-sm border border-white/10 text-[0.65rem] font-mono font-semibold tracking-wider text-white flex items-center gap-1 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.6)]">
                          <span className="text-accent text-xs leading-none">★</span>{g.rating.toFixed(1)}
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 right-2">
                      <h3 className="text-white font-monomaniac text-xs sm:text-sm font-normal leading-snug line-clamp-2">{g.title}</h3>
                      {/* Tags/genres with hero yellow pill style */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {g.genres.slice(0, 3).map((gen) => (
                          <span key={gen} className="px-3 py-1 rounded-full bg-accent text-black font-jost text-[0.6rem] sm:text-xs font-medium tracking-wide">
                            {gen}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
                {supportGames.length === 0 && !topLoading && (
                  <div className="col-span-full text-center text-white/50 font-jost text-sm">No supporting games</div>
                )}
              </div>
            </div>
            {/* Centered pagination controls under the cards */}
            <div className="mt-5 flex items-center justify-center gap-3">
              {/* Prev */}
              <button
                onClick={() => setSlide((s) => (s - 1 + totalSlides) % totalSlides)}
                aria-label="Previous slide"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-accent/40 flex items-center justify-center"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {Array.from({ length: totalSlides }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`${i === currentSlide ? 'w-2.5 h-2.5 bg-accent' : 'w-2 h-2 bg-white/30 hover:bg-white/50'} rounded-full transition-colors`}
                  />
                ))}
                {heroLoadingMore && (
                  <span className="ml-2 w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {/* Next */}
              <button
                onClick={() => setSlide((s) => (s + 1) % totalSlides)}
                aria-label="Next slide"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-accent/40 flex items-center justify-center"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </section>

          {/* Filter Bar */}
          <section className="mb-10">
            <div className="flex flex-col lg:flex-row lg:items-end gap-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-6">
              <div className="flex-1">
                <h2 className="text-white font-montserrat text-xl md:text-2xl font-bold tracking-wide flex items-center gap-3">
                  Browse Library <span className="h-px w-16 bg-gradient-to-r from-accent to-transparent" />
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">Search</label>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search games..."
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2.5 text-white placeholder-white/40 font-jost tracking-wide focus:outline-none focus:ring-2 focus:ring-accent/70"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">Genre</label>
                  <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)} className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2.5 text-white">
                    <option value="all">All</option>
                    {GENRE_ROWS.map((g) => <option key={g} value={g}>{g[0].toUpperCase() + g.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">Platform</label>
                  <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)} className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2.5 text-white">
                    <option value="all">All</option>
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">Min Rating</label>
                  <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2.5 text-white">
                    {[0, 1, 2, 3, 4].map((r) => <option key={r} value={r}>{r}+</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">Sort</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2.5 text-white">
                    <option value="rating_desc">Rating: High → Low</option>
                    <option value="rating_asc">Rating: Low → High</option>
                    <option value="title_az">Title: A → Z</option>
                    <option value="title_za">Title: Z → A</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* When filters/search are active, show a results grid */}
          {filtersActive && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-montserrat text-lg md:text-xl font-semibold">
                  {search ? "Search Results" : "Filtered Results"} <span className="text-white/50 font-jost text-sm">({filtered.length})</span>
                </h3>
              </div>
              {filtered.length ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filtered.slice(0, 20).map((g) => (
                    <GameCard key={g.id} game={g} onSelect={(game) => setActiveGame(game)} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-white/60 font-jost">No games match your filters.</div>
              )}
            </section>
          )}

          {/* Genre rows when not filtering/searching */}
          {!filtersActive && (
            <>
              {GENRE_ROWS.map((g) => (
                <GameRow
                  key={g}
                  title={`${g[0].toUpperCase() + g.slice(1)} Spotlight`}
                  games={rows[g] || []}
                  onLoadMore={() => loadMoreGenre(g)}
                  loading={!!rowLoading[g]}
                  hasMore={!!hasMoreByGenre[g]}
                  onSelectGame={(game) => setActiveGame(game)} 
                />
              ))}
            </>
          )}

          
        </main>

        <Footer />

        {activeGame && <GameDetailOverlay game={activeGame} onClose={() => setActiveGame(null)} />}
      </div>
    </div>
  );
}
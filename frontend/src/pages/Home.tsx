import { Link } from 'react-router-dom';
import { Game } from '../../../shared/api';
import { gameApi } from '../services/gameApi';
import { newsApi, NewsArticle } from '../services/newsApi';
import { communityApi, Community } from '../services/communityApi';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { NetworkBackground } from '../components/NetworkBackground';
import Footer from '../components/footer';

// Use reliable static fallback images
const imageFallback = '/assets/placeholders/game-placeholder.jpg';
const newsFallback = '/assets/placeholders/news-placeholder.jpg';

// Local fallback games to show if the API returns nothing
const FALLBACK_GAMES: Game[] = [
  {
    id: '3498',
    title: 'Grand Theft Auto V',
    image: 'https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg',
    genres: ['Action', 'Adventure'],
    platform: ['PC', 'PlayStation', 'Xbox'],
    rating: 4.47,
  },
  {
    id: '3328',
    title: 'The Witcher 3: Wild Hunt',
    image: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg',
    genres: ['Action', 'Adventure', 'RPG'],
    platform: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    rating: 4.66,
  },
  {
    id: '4200',
    title: 'Portal 2',
    image: 'https://media.rawg.io/media/games/328/3283617cb7d75d67257fc58339188742.jpg',
    genres: ['Shooter', 'Puzzle'],
    platform: ['PC', 'PlayStation', 'Xbox'],
    rating: 4.62,
  },
  {
    id: '5286',
    title: 'Tomb Raider (2013)',
    image: 'https://media.rawg.io/media/games/021/021c4e21a1824d2526f925eff6324653.jpg',
    genres: ['Action', 'Adventure'],
    platform: ['PC', 'PlayStation', 'Xbox'],
    rating: 4.05,
  },
  {
    id: '4291',
    title: 'Counter-Strike: Global Offensive',
    image: 'https://media.rawg.io/media/games/736/73619bd336c894d6941d926bfd563946.jpg',
    genres: ['Action', 'Shooter'],
    platform: ['PC', 'PlayStation', 'Xbox'],
    rating: 3.57,
  },
];

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mixSeed, setMixSeed] = useState(0);

  // Debug function to check image URLs
  const checkImageUrl = (url: string | undefined) => {
    if (!url) return false;
    return url.startsWith('http') || url.startsWith('/');
  };

  // Note: RAWG browser fallback was removed to avoid CORS and key exposure

  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // First, try to get games from our backend API
      const fetched = await gameApi.fetchRandomGames(18);
      // If our API returns games, use them; otherwise use local fallback
      if (fetched && fetched.length > 0) {
        setGames(fetched);
      } else {
        console.warn('No games from API; using local fallback list');
        setGames(FALLBACK_GAMES);
      }
    } catch (e: any) {
      console.error('Error in main fetchGames flow:', e);
      setError(e?.message || 'Error loading games');
      // Also fall back locally on error
      setGames(FALLBACK_GAMES);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCommunities = useCallback(async () => {
    try {
      const all = await communityApi.getCommunities();
      console.log('Fetched communities:', all);
      
      if (all && all.length > 0) {
        setCommunities(all);
      } else {
        console.log('No communities returned, using fallbacks');
        // Provide some fallback communities if needed
        const nowIso = new Date().toISOString();
        const fallbackCommunities: Community[] = [
          { id: 1, name: "RPG Enthusiasts", description: "Discuss and discover role-playing games.", category: "RPG", image_url: "/assets/community-rpg.jpg", member_count: 12500, post_count: 248, created_at: nowIso },
          { id: 2, name: "FPS Gamers", description: "First-person shooter strategies and news.", category: "Shooter", image_url: "/assets/community-fps.jpg", member_count: 9800, post_count: 192, created_at: nowIso },
          { id: 3, name: "Strategy Masters", description: "RTS/TBS tactics and community events.", category: "Strategy", image_url: "/assets/community-strategy.jpg", member_count: 7200, post_count: 134, created_at: nowIso },
          { id: 4, name: "Indie Game Explorers", description: "Hidden gems from indie creators.", category: "Indie", image_url: "/assets/community-indie.jpg", member_count: 5400, post_count: 118, created_at: nowIso },
          { id: 5, name: "Retro Gaming", description: "Classics, mods, and preservation.", category: "Retro", image_url: "/assets/community-retro.jpg", member_count: 4800, post_count: 89, created_at: nowIso },
          { id: 6, name: "Game Developers", description: "Dev logs, feedback, and collaboration.", category: "Development", image_url: "/assets/community-devs.jpg", member_count: 3200, post_count: 76, created_at: nowIso }
        ];
        setCommunities(fallbackCommunities);
      }
    } catch (e) {
      console.error('Failed to fetch communities:', e);
      // Fall back to empty array rather than null
      setCommunities([]);
    }
  }, []);

  const fetchNews = useCallback(async () => {
    try {
      const response = await newsApi.fetchGamingNews(12);
      console.log('Fetched news:', response);
      
      if (response?.articles && response.articles.length > 0) {
        setNewsItems(response.articles);
      } else {
        console.log('No news returned, using fallbacks');
        // Fallback news if needed
        const now = new Date().toISOString();
        const fallbackNews: NewsArticle[] = [
          { 
            id: "1", 
            title: "Next-Gen Console Releases Pushed Back",
            description: "Manufacturing delays push back anticipated console shipments.",
            url: "#",
            urlToImage: "/assets/news-console.jpg",
            publishedAt: now,
            content: "Manufacturing delays push back anticipated console shipments due to supply chain issues.",
            author: "GamerGrid Staff",
            source: { name: "GameNews" }
          },
          { 
            id: "2", 
            title: "Major Studio Announces New Open-World RPG",
            description: "An ambitious open-world RPG is in development with a 2026 target.",
            url: "#",
            urlToImage: "/assets/news-rpg.jpg",
            publishedAt: now,
            content: "The studio teased dynamic weather systems, reactive NPCs, and cross-platform play.",
            author: "Gaming Today Editorial",
            source: { name: "Gaming Today" }
          },
          { 
            id: "3", 
            title: "Indie Hit Surpasses 1 Million Sales in First Week",
            description: "Surprise indie breakout hits a sales milestone in record time.",
            url: "#",
            urlToImage: "/assets/news-indie.jpg",
            publishedAt: now,
            content: "Developers thanked the community and announced a content roadmap for Q4.",
            author: "Indie Wire Contributors",
            source: { name: "Indie Wire" }
          }
        ];
        setNewsItems(fallbackNews);
      }
    } catch (e) {
      console.error('Failed to fetch news:', e);
      // Fall back to empty array
      setNewsItems([]);
    }
  }, []);

  useEffect(() => {
    fetchGames();
    fetchCommunities();
    fetchNews();
  }, [fetchGames, fetchCommunities, fetchNews]);

  const hero = games[0];
  const heroSupport = games.slice(1, 5);

  const topCommunities = useMemo(() => {
    if (!communities.length) return [];
    const ordered = [...communities].sort((a, b) => b.member_count - a.member_count);
    if (!mixSeed) return ordered.slice(0, 12);
    const offset = mixSeed % ordered.length;
    return ordered.slice(offset).concat(ordered.slice(0, offset)).slice(0, 12);
  }, [communities, mixSeed]);

  const sidebarNews = useMemo(() => newsItems.slice(0, 8), [newsItems]);

  // Image error handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.onerror = null; // Prevent infinite loops
    
    // Use appropriate fallback based on container size
    if (target.width > 300) {
      target.src = imageFallback;
    } else {
      target.src = newsFallback;
    }
  };

  return (
    <div className="min-h-screen relative text-foreground overflow-hidden">
      <NetworkBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 pt-20 pb-32">
          <section className="mb-10 mt-6 flex flex-col gap-6">
            <h1 className="font-montserrat font-semibold text-3xl sm:text-4xl tracking-tight text-white">
              Welcome{' '}
              <span className="bg-gradient-to-r from-accent via-orange-300 to-pink-400 bg-clip-text text-transparent">
                Home
              </span>
            </h1>
            <p className="text-white/65 font-jost text-sm sm:text-base max-w-2xl leading-relaxed">
              Magazine-style overview with featured games, curated communities, and a live news rail.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  fetchGames();
                  fetchCommunities();
                  fetchNews();
                }}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-accent text-black text-xs sm:text-sm font-semibold tracking-wide shadow-[0_4px_18px_-4px_rgba(255,120,50,0.45)] hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Refreshing…' : 'Refresh Data'}
              </button>
              <button
                onClick={() => setMixSeed((s) => s + 1)}
                className="px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/40 text-white/80 hover:text-white text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-sm transition"
              >
                Shuffle Communities
              </button>
              <Link
                to="/games"
                className="px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/40 text-white/80 hover:text-white text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-sm transition"
              >
                Browse Library
              </Link>
            </div>
            {error && (
              <div className="text-xs font-mono text-destructive/80 bg-destructive/10 border border-destructive/30 px-3 py-2 rounded-md max-w-sm">
                {error}
              </div>
            )}
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_1px_320px] gap-8">
            <div className="flex flex-col gap-10">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-montserrat font-semibold text-xl sm:text-2xl text-white flex items-center gap-3">
                    Featured{' '}
                    <span className="h-px w-20 bg-gradient-to-r from-accent/70 to-transparent" />
                  </h2>
                  <Link
                    to="/games"
                    className="text-xs font-jost tracking-wide text-accent hover:underline"
                  >
                    More
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  <div className="md:col-span-7 rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10 backdrop-blur-sm relative">
                    {hero ? (
                      <Link to={`/games?focus=${hero.id}`} className="group block h-full">
                        <img
                          src={checkImageUrl(hero.image) ? hero.image : imageFallback}
                          alt={hero.title}
                          className="w-full h-[320px] md:h-[420px] object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                          onError={handleImageError}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/50 to-black/90" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="flex gap-2 mb-2 flex-wrap">
                            {hero.genres?.slice(0, 3)?.map((gen) => (
                              <span
                                key={gen}
                                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/40 text-white/75 backdrop-blur-sm ring-1 ring-white/10"
                              >
                                {gen}
                              </span>
                            ))}
                          </div>
                          <h3 className="text-white text-lg sm:text-2xl font-montserrat leading-snug">
                            {hero.title}
                          </h3>
                          {hero.rating && (
                            <div className="mt-1 text-[11px] text-accent/90 font-mono tracking-wider flex items-center gap-1">
                              <span className="text-accent">★</span>
                              {hero.rating.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div className="h-[320px] md:h-[420px] animate-pulse bg-white/5" />
                    )}
                  </div>

                  <div className="md:col-span-5 grid grid-cols-2 gap-5 auto-rows-[minmax(120px,1fr)]">
                    {heroSupport.length
                      ? heroSupport.map((g) => (
                          <Link
                            key={g.id}
                            to={`/games?focus=${g.id}`}
                            className="group relative rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10 backdrop-blur-sm hover:border-accent/40 transition-colors"
                          >
                            <img
                              src={checkImageUrl(g.image) ? g.image : imageFallback}
                              alt={g.title}
                              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100"
                              onError={handleImageError}
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/60 to-black/95" />
                            <div className="relative z-10 p-2 mt-auto">
                              <h4 className="text-[0.68rem] sm:text-[0.78rem] font-montserrat text-white/90 leading-snug line-clamp-2 group-hover:text-white pr-2">
                                {g.title}
                              </h4>
                              {g.rating && (
                                <div className="mt-1 text-[10px] text-accent/90 font-mono tracking-wider flex items-center gap-1">
                                  <span className="text-accent">★</span>
                                  {g.rating.toFixed(1)}
                                </div>
                              )}
                            </div>
                          </Link>
                        ))
                      : Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            className="rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                          />
                        ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-montserrat font-semibold text-xl sm:text-2xl text-white flex items-center gap-3">
                    Communities{' '}
                    <span className="h-px w-20 bg-gradient-to-r from-accent/70 to-transparent" />
                  </h2>
                  <Link
                    to="/community"
                    className="text-xs font-jost tracking-wide text-accent hover:underline"
                  >
                    Explore
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-5 auto-rows-[140px] md:auto-rows-[160px]">
                  {topCommunities.length
                    ? topCommunities.map((c) => (
                        <Link
                          key={c.id}
                          to={`/community?focus=${c.id}`}
                          className="group relative rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10 hover:border-accent/40 backdrop-blur-sm transition-colors"
                        >
                          <img
                            src={checkImageUrl(c.image_url) ? c.image_url : imageFallback}
                            alt={c.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-95"
                            onError={handleImageError}
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/55 to-black/95" />
                          <div className="relative z-10 p-3 mt-auto">
                            <div className="text-[10px] font-mono text-white/60 tracking-wider mb-1">
                              Community
                            </div>
                            <h3 className="text-sm sm:text-base font-montserrat text-white leading-tight line-clamp-2">
                              {c.name}
                            </h3>
                            <div className="text-[10px] text-accent/90 font-mono tracking-wider mt-1">
                              {c.member_count.toLocaleString()} members
                            </div>
                          </div>
                        </Link>
                      ))
                    : Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                        />
                      ))}
                </div>
              </div>
            </div>

            <div aria-hidden="true" className="hidden xl:block w-px bg-gradient-to-b from-white/10 via-white/20 to-white/10 mx-[-1px]" />
            <div className="xl:hidden h-px bg-white/10 my-6" role="separator" />

            <aside className="xl:sticky xl:top-24 h-fit xl:pl-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-montserrat font-semibold text-lg text-white">News</h3>
                <Link
                  to="/news"
                  className="text-xs font-jost tracking-wide text-accent hover:underline"
                >
                  More
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                {sidebarNews.length
                  ? sidebarNews.map((n) => (
                      <Link
                        key={n.id}
                        to={`/news?focus=${n.id}`}
                        className="group grid grid-cols-[88px_1fr] gap-3 items-center rounded-xl overflow-hidden bg-white/[0.04] border border-white/10 hover:border-accent/40 backdrop-blur-sm"
                      >
                        <div className="relative h-[72px] w-[88px] overflow-hidden">
                          <img
                            src={checkImageUrl(n.urlToImage) ? n.urlToImage : newsFallback}
                            alt={n.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100"
                            onError={handleImageError}
                          />
                        </div>
                        <div className="pr-3 py-2">
                          <h4 className="text-[0.78rem] text-white/90 leading-snug line-clamp-2 group-hover:text-white">
                            {n.title}
                          </h4>
                          <div className="text-[10px] text-white/55 font-mono tracking-wider mt-1 flex items-center justify-between">
                            <span>{n.source?.name || 'News'}</span>
                            <span>{n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : 'Recent'}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  : Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[88px_1fr] gap-3 items-center rounded-xl overflow-hidden bg-white/5 border border-white/10 animate-pulse h-[72px]"
                      />
                    ))}
              </div>
            </aside>
          </section>
        </main>
        <Footer />
      </div>

      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-40"
        style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08), transparent 60%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background:
            'linear-gradient(120deg, rgba(255,120,50,0.12), transparent 55%, rgba(255,120,50,0.15))',
        }}
      />
    </div>
  );
}
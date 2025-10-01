import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

// Define the Game interface locally to avoid import issues
interface Game {
  id: string;
  title: string;
  image: string;
  genres: string[];
  platform: string[];
  featured?: boolean;
  description?: string;
  rating?: number;
  releaseDate?: string;
  developer?: string;
  publisher?: string;
};

interface CommunityItem { id: string; name: string; members: number; image?: string; tagline?: string; }
interface NewsItem { id: string; title: string; source: string; image?: string; published: string; }

type Tile = (
  { type: 'game'; game: Game } |
  { type: 'community'; community: CommunityItem } |
  { type: 'news'; news: NewsItem }
) & { weight: number };

const mockGames: Game[] = Array.from({ length: 12 }).map((_, i) => ({
  id: 'g' + i,
  title: 'Sample Game ' + (i + 1),
  image: `https://picsum.photos/seed/game${i}/600/800`,
  genres: ['Action','Indie','RPG'].slice(0, (i % 3) + 1),
  platform: ['PC','PS5','Xbox'].slice(0, (i % 2) + 1),
  rating: 3.5 + (i % 5) * 0.5,
}));
const mockCommunities: CommunityItem[] = [
  { id: 'c1', name: 'Speedrunners Hub', members: 12450, tagline: 'Frames matter.', image: 'https://picsum.photos/seed/comm1/500/500' },
  { id: 'c2', name: 'Indie Forge', members: 8421, tagline: 'Build. Share. Iterate.', image: 'https://picsum.photos/seed/comm2/500/500' },
  { id: 'c3', name: 'Tactical Minds', members: 6312, tagline: 'Every move counts.', image: 'https://picsum.photos/seed/comm3/500/500' },
];
const mockNews: NewsItem[] = [
  { id: 'n1', title: 'Major Studio Announces Surprise Title', source: 'GameWire', image: 'https://picsum.photos/seed/news1/800/500', published: '2025-08-09' },
  { id: 'n2', title: 'Indie Breakout Smashes Charts Globally', source: 'IndiePulse', image: 'https://picsum.photos/seed/news2/800/500', published: '2025-08-08' },
  { id: 'n3', title: 'Competitive Finals Set New Viewership Record', source: 'eSportsCentral', image: 'https://picsum.photos/seed/news3/800/500', published: '2025-08-07' },
];

export default function Dashboard() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  useEffect(() => {
    const merged: Tile[] = [
      ...mockGames.map(g => ({ type: 'game', game: g, weight: 1 } as Tile)),
      ...mockCommunities.map(c => ({ type: 'community', community: c, weight: 1.2 } as Tile)),
      ...mockNews.map(n => ({ type: 'news', news: n, weight: 1.4 } as Tile)),
    ];
    for (let i = merged.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [merged[i], merged[j]] = [merged[j], merged[i]]; }
    setTiles(merged);
  }, []);

  const renderTile = (t: Tile) => {
    if (t.type === 'game') {
      const g = t.game;
      return (
        <Link to={`/games?focus=${g.id}`} className="group relative block w-full h-full rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10 backdrop-blur-sm hover:border-accent/40 transition-colors">
          <img src={g.image} alt={g.title} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/50 to-black/80" />
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
            {g.genres.slice(0,2).map((gen: string) => (
              <span key={gen} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/10 text-white/70 backdrop-blur-sm ring-1 ring-white/10 group-hover:bg-white/15">{gen}</span>
            ))}
          </div>
          <div className="absolute bottom-0 inset-x-0 p-3">
            <h3 className="text-[0.75rem] sm:text-sm font-semibold font-monomaniac text-white/90 leading-snug line-clamp-2">{g.title}</h3>
            {g.rating && (<div className="mt-1 text-[10px] text-white/60 font-mono tracking-wider flex items-center gap-1"><span className="text-accent">★</span>{g.rating.toFixed(1)}</div>)}
          </div>
          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-screen" style={{background:'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25), transparent 60%)'}} />
        </Link>
      );
    }
    if (t.type === 'community') {
      const c = t.community;
      return (
        <Link to={`/community?focus=${c.id}`} className="group relative block w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-white/[0.02] border border-white/10 backdrop-blur-sm hover:border-accent/40 transition-colors">
          {c.image && <img src={c.image} alt={c.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 transition" loading="lazy" />}
          <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/50 to-black/80" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-700 bg-[radial-gradient(circle_at_70%_80%,rgba(255,120,50,0.35),transparent_55%)]" />
          <div className="absolute bottom-0 inset-x-0 p-3 flex flex-col gap-1">
            <h3 className="text-[0.78rem] sm:text-sm font-semibold font-monomaniac text-white/90 line-clamp-2">{c.name}</h3>
            <div className="flex items-center justify-between text-[10px] text-white/60 font-mono tracking-wider">
              <span>{c.members.toLocaleString()} members</span>
              {c.tagline && <span className="text-white/40 italic hidden sm:inline">{c.tagline}</span>}
            </div>
          </div>
        </Link>
      );
    }
    const n = t.news;
    return (
      <Link to={`/news?focus=${n.id}`} className="group relative block w-full h-full rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10 backdrop-blur-sm hover:border-accent/40 transition-colors">
        {n.image && <img src={n.image} alt={n.title} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-95 transition" loading="lazy" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/50 to-black/85" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-700 bg-[radial-gradient(circle_at_68%_78%,rgba(255,120,50,0.32),transparent_55%)]" />
        <div className="absolute bottom-0 inset-x-0 p-3 flex flex-col gap-1">
          <h3 className="text-[0.75rem] sm:text-sm font-semibold font-monomaniac text-white/90 leading-snug line-clamp-3">{n.title}</h3>
          <div className="flex items-center justify-between text-[10px] text-white/50 font-mono tracking-wider">
            <span>{n.source}</span>
            <span>{n.published}</span>
          </div>
        </div>
      </Link>
    );
  };

  const mosaic = useMemo(() => tiles.map((tile, i) => {
    const large = i % 7 === 0;
    const span = large ? 'md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto' : 'aspect-[4/5]';
    return (
      <div key={i} className={`relative rounded-2xl overflow-hidden ${span} animate-fade-in`} style={{animationDelay: `${i * 40}ms`}}>
        {renderTile(tile)}
      </div>
    );
  }), [tiles]);

  return (
    <main className="relative min-h-screen w-full pt-24 pb-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end gap-8 mb-16">
          <div className="flex-1 flex flex-col gap-5">
            <h1 className="font-montserrat text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white">Your <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-accent via-orange-300 to-pink-400">Gaming Nexus</span></h1>
            <p className="text-white/60 max-w-2xl text-sm sm:text-base leading-relaxed font-jost">A unified glance at what's pulsing across the platform: trending games, active communities, and fresh headlines—curated into a living mosaic feed.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/games" className="px-5 py-2.5 rounded-lg bg-accent text-black text-sm font-semibold tracking-wide shadow-[0_4px_18px_-4px_rgba(255,120,50,0.45)] hover:bg-accent/90 transition">Explore Games</Link>
              <Link to="/community" className="px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/40 text-white/80 hover:text-white text-sm font-semibold tracking-wide backdrop-blur-sm transition">Join Communities</Link>
              <Link to="/news" className="px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/40 text-white/80 hover:text-white text-sm font-semibold tracking-wide backdrop-blur-sm transition">Latest News</Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full max-w-sm self-start lg:self-end">
            <div className="col-span-1 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col gap-1"><span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Games Indexed</span><span className="text-lg font-semibold text-white/90">12,532</span></div>
            <div className="col-span-1 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col gap-1"><span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Communities</span><span className="text-lg font-semibold text-white/90">2,314</span></div>
            <div className="col-span-1 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col gap-1"><span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">News Feeds</span><span className="text-lg font-semibold text-white/90">58</span></div>
            <div className="col-span-3 p-3 rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm flex items-center justify-between"><span className="text-xs text-white/60 tracking-wide">Feed refreshes every 30s (mock)</span><button className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-[11px] text-white/70 hover:text-white transition border border-white/10 hover:border-accent/40">Manual Refresh</button></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[140px] md:auto-rows-[180px] gap-5">{mosaic}</div>
      </div>
      <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-40" style={{background:'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08), transparent 60%)'}} />
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{background:'linear-gradient(120deg, rgba(255,120,50,0.12), transparent 55%, rgba(255,120,50,0.15))'}} />
    </main>
  );
}
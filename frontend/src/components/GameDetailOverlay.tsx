import { useEffect, useState, useCallback, useMemo } from 'react';
import { Game } from '../../../shared/api';

// Define these locally since they are not exported from gameApi
const imageFallback = 'https://placehold.co/600x400/222222/cccccc?text=No+Image';
const RAWG_API_KEY = 'c60ed11f699e430485308b3a910b1cb7'; // Use your actual RAWG API key
const withKey = (endpoint: string, params: Record<string, any> = {}) => {
  const url = new URL(`https://api.rawg.io/api${endpoint}`);
  url.searchParams.append('key', RAWG_API_KEY);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  }
  return url.toString();
};

interface RawgGameDetails {
  id: number;
  name: string;
  description_raw: string;
  description: string;
  background_image: string;
  background_image_additional?: string;
  metacritic?: number;
  released?: string;
  genres?: { name: string }[];
  platforms?: { platform: { name: string } }[];
  publishers?: { name: string }[];
  developers?: { name: string }[];
  rating?: number;
  tags?: { name: string }[];
  website?: string;
  reddit_url?: string;
  stores?: { store: { name: string } }[];
  short_screenshots?: { image: string }[];
}

interface RawgMovieResult {
  id: number;
  name: string;
  preview: string; // thumbnail
  data: { 480: string; max: string };
}

interface GameDetailOverlayProps {
  game: Game | null;
  onClose: () => void;
}

export function GameDetailOverlay({ game, onClose }: GameDetailOverlayProps) {
  const [details, setDetails] = useState<RawgGameDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screensExtra, setScreensExtra] = useState<string[]>([]);
  const [screensLoading, setScreensLoading] = useState(false);
  const [showAllScreens, setShowAllScreens] = useState(false);
  const [movies, setMovies] = useState<RawgMovieResult[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // mock related communities for this game (derived from genres / tags)
  const relatedCommunities = useMemo(()=>{
    const bases = (details?.genres||[]).map(g=>g.name).slice(0,3);
    const tagExtras = (details?.tags||[]).map(t=>t.name).slice(0,5);
    const pool = [...bases, ...tagExtras];
    const adjectives = ['Elite','Casual','Prime','Quantum','Arcane','Mythic','Hyper','Meta','Retro','Pro'];
    const suffixes = ['Hub','Network','Lounge','Alliance','Squad','Collective','Den','Guild','Hangout','Channel'];
    const pick = (arr:string[])=>arr[Math.floor(Math.random()*arr.length)];
    return Array.from({length:4}).map((_,i)=>{
      const topic = pick(pool) || (game?.title.split(/\s+/)[0] || 'Game');
      return {
        id: 'rel-'+i,
        name: `${pick(adjectives)} ${topic} ${pick(suffixes)}`.replace(/\s+/g,' ').trim(),
        members: Math.floor(800 + Math.random()*25000),
        tagline: `All about ${topic}`,
        image: `https://picsum.photos/seed/${encodeURIComponent(topic)}-${i}/400/400`
      };
    });
  }, [details, game?.title]);

  const fetchDetails = useCallback(async (id: string) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(withKey(`/games/${id}`));
      if(!res.ok) throw new Error('Failed to fetch details');
      const data = await res.json();
      setDetails(data);
    } catch(e:any) { setError(e.message||'Error'); }
    finally { setLoading(false); }
  }, []);

  const fetchMovies = useCallback(async (id: string) => {
    setMoviesLoading(true);
    try {
      const res = await fetch(withKey(`/games/${id}/movies`));
      if(res.ok){
        const data = await res.json();
        setMovies((data.results||[]) as RawgMovieResult[]);
      }
    } catch { /* ignore */ }
    finally { setMoviesLoading(false); }
  }, []);

  useEffect(()=>{
    if(game){
      fetchDetails(game.id);
      fetchMovies(game.id);
    }
  }, [game, fetchDetails, fetchMovies]);

  const fetchScreenshots = useCallback(async (id: string) => {
    setScreensLoading(true);
    try {
      const res = await fetch(withKey(`/games/${id}/screenshots`, { page_size: 30 }));
      if(res.ok){
        const data = await res.json();
        const list: string[] = (data.results||[]).map((r: any)=> r.image).filter(Boolean);
        setScreensExtra(list);
      }
    } catch { /* silent */ }
    finally { setScreensLoading(false); }
  }, []);

  useEffect(()=>{
    if(game) fetchScreenshots(game.id);
  }, [game, fetchScreenshots]);

  // Declare allScreenUrls first then attach ESC/navigation listener below

  if(!game) return null;

  const cover = details?.background_image || details?.background_image_additional || game.image || imageFallback;
  const allScreenUrls = useMemo(()=>{
    const base = (details?.short_screenshots||[]).map(s=>s.image).filter(Boolean);
    const combined = [...base, ...screensExtra];
    const dedup = Array.from(new Set(combined));
    return dedup;
  }, [details, screensExtra]);
  useEffect(()=>{
    const esc = (e:KeyboardEvent)=>{ 
      if(e.key==='Escape') { 
        if(lightboxOpen) setLightboxOpen(false); 
        else onClose(); 
      }
      if(lightboxOpen && (e.key==='ArrowRight' || e.key==='ArrowLeft')){
        setLightboxIndex(i=>{
          const max = allScreenUrls.length; if(max===0) return i;
          if(e.key==='ArrowRight') return (i+1)%max; else return (i-1+max)%max;
        });
      }
    };
    window.addEventListener('keydown', esc);
    return ()=> window.removeEventListener('keydown', esc);
  }, [onClose, lightboxOpen, allScreenUrls.length]);
  const screenshots = useMemo(()=> showAllScreens ? allScreenUrls : allScreenUrls.slice(0,12), [allScreenUrls, showAllScreens]);

  const openLightbox = (idx:number) => { setLightboxIndex(idx); setLightboxOpen(true); };
  const navLightbox = (dir:1|-1) => setLightboxIndex(i=>{ const max = allScreenUrls.length; return (i+dir+max)%max; });
  const longDesc = details?.description_raw || details?.description?.replace(/<[^>]+>/g,'') || 'No description available.';

  return (
    <div className="fixed inset-0 z-[500] flex items-start justify-center overflow-y-auto p-6 sm:p-10 bg-black/80 backdrop-blur-xl">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-6xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-white/[0.05] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Hero */}
        <div className="relative h-[280px] sm:h-[360px] md:h-[420px]">
          <img src={cover} alt={game.title} className="absolute inset-0 w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,120,50,0.35),transparent_60%)] mix-blend-overlay" />
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-black/50 border border-white/15 flex items-center justify-center text-white hover:text-accent hover:border-accent/50 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
          <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {game.genres.slice(0,4).map((g: string) => <span key={g} className="px-3 py-1 rounded-full bg-accent text-black text-[10px] font-bold tracking-wider font-jost">{g}</span>)}
            </div>
            <h1 className="font-montserrat text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.05] max-w-4xl drop-shadow-lg">{game.title}</h1>
            <div className="flex flex-wrap gap-6 text-[11px] sm:text-xs font-mono tracking-wider text-white/70">
              {details?.released && <span>RELEASE: <strong className="text-white/90 font-semibold ml-1">{details.released}</strong></span>}
              {details?.metacritic && <span>METACRITIC: <strong className="text-accent font-semibold ml-1">{details.metacritic}</strong></span>}
              {details?.rating && <span>RATING: <strong className="text-accent font-semibold ml-1">{details.rating.toFixed(1)}</strong></span>}
              {details?.platforms && <span>PLATFORMS: <strong className="text-white/90 ml-1">{details.platforms.map(p=>p.platform.name).slice(0,4).join(', ')}</strong></span>}
            </div>
          </div>
        </div>
        {/* Body */}
        <div className="p-6 sm:p-10 space-y-12">
          {loading && <div className="text-white/60 text-sm font-jost">Loading details...</div>}
          {error && <div className="text-destructive text-sm font-mono">{error}</div>}
          {!loading && !error && (
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-10">
                <section>
                  <h2 className="font-montserrat font-semibold text-lg tracking-wide text-white mb-4 flex items-center gap-2">Overview <span className="h-px w-16 bg-gradient-to-r from-accent/80 to-transparent" /></h2>
                  <p className="text-white/70 font-jost text-sm leading-relaxed whitespace-pre-line max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">{longDesc}</p>
                </section>
                { (screenshots.length>0 || screensLoading) && (
                  <section>
                    <h2 className="font-montserrat font-semibold text-lg tracking-wide text-white mb-4 flex items-center gap-2">Screenshots <span className="h-px w-16 bg-gradient-to-r from-accent/80 to-transparent" /></h2>
                    {screensLoading && <div className="text-white/50 text-xs font-mono mb-2">Fetching gallery…</div>}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      {screenshots.map((src,i)=> <button type="button" onClick={()=>openLightbox(i)} key={src} className="group relative rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent/60">
                        <img src={src} alt="Screenshot" className="object-cover w-full h-32 sm:h-40 md:h-44 xl:h-48 group-hover:opacity-90 transition" loading="lazy" />
                        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/40 flex items-center justify-center text-white text-xs font-mono tracking-wide">VIEW</span>
                      </button>)}
                      {screenshots.length===0 && !screensLoading && <div className="col-span-full text-white/40 text-xs font-mono">No screenshots.</div>}
                    </div>
                    {allScreenUrls.length>12 && (
                      <div className="mt-4">
                        <button onClick={()=>setShowAllScreens(s=>!s)} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 hover:border-accent/40 text-white/70 hover:text-white text-xs font-jost tracking-wide transition">{showAllScreens? 'Show Less' : `Show All (${allScreenUrls.length})`}</button>
                      </div>
                    )}
                  </section>
                )}
              </div>
              <div className="space-y-10">
                {/* Trailers */}
                <section>
                  <h3 className="font-montserrat font-semibold text-sm tracking-wide text-white mb-3 uppercase flex items-center gap-2">Trailers {moviesLoading && <span className="text-[10px] text-white/40 font-mono">loading…</span>}</h3>
                  {(!moviesLoading && movies.length===0) && <div className="text-white/40 text-xs font-mono">No trailers.</div>}
                  {movies.slice(0,2).map(m => (
                    <div key={m.id} className="mb-4 last:mb-0 rounded-xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-sm">
                      <div className="relative w-full pt-[56.25%]">
                        <video controls poster={m.preview} className="absolute inset-0 w-full h-full object-cover rounded-xl" src={m.data.max || m.data[480]} />
                      </div>
                      <div className="px-3 py-2 flex items-center justify-between">
                        <span className="text-white/70 text-[11px] font-mono tracking-wide line-clamp-1">{m.name}</span>
                        <span className="text-accent text-[10px] font-mono">HD</span>
                      </div>
                    </div>
                  ))}
                </section>
                <section>
                  <h3 className="font-montserrat font-semibold text-sm tracking-wide text-white mb-3 uppercase">Meta & Stats</h3>
                  <div className="grid grid-cols-2 gap-4 text-[11px] font-mono tracking-wide text-white/70">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1"><span className="text-white/40">Metacritic</span><span className="text-accent text-lg font-bold">{details?.metacritic ?? '—'}</span></div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1"><span className="text-white/40">User Rating</span><span className="text-accent text-lg font-bold">{details?.rating?.toFixed(1) ?? '—'}</span></div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1"><span className="text-white/40">Release</span><span className="text-white text-xs font-semibold">{details?.released || '—'}</span></div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1"><span className="text-white/40">Platforms</span><span className="text-white text-[10px] font-semibold leading-snug">{details?.platforms?.map(p=>p.platform.name).slice(0,5).join(', ') || '—'}</span></div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1 col-span-2"><span className="text-white/40">Developers</span><span className="text-white text-[10px] font-semibold leading-snug">{details?.developers?.map(d=>d.name).join(', ') || '—'}</span></div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1 col-span-2"><span className="text-white/40">Publishers</span><span className="text-white text-[10px] font-semibold leading-snug">{details?.publishers?.map(d=>d.name).join(', ') || '—'}</span></div>
                  </div>
                </section>
                <section>
                  <h3 className="font-montserrat font-semibold text-sm tracking-wide text-white mb-3 uppercase">Tags</h3>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                    {details?.tags?.slice(0,30).map(t=> <span key={t.name} className="px-2 py-1 rounded-md bg-white/5 text-white/60 hover:text-white hover:bg-white/10 text-[10px] font-mono tracking-wide border border-white/10">{t.name}</span>) || <span className="text-white/40 text-xs">No tags</span>}
                  </div>
                </section>
                <section className="space-y-4">
                  <button className="w-full py-3 rounded-xl bg-accent text-black font-jost font-bold tracking-wide text-xs shadow-[0_5px_18px_-5px_rgba(255,120,50,0.6)] hover:bg-accent/90 transition">Write Review (Soon)</button>
                  {details?.website && <a href={details.website} target="_blank" rel="noopener" className="block w-full py-3 rounded-xl bg-white/10 text-white/80 hover:text-white hover:bg-white/15 border border-white/15 text-xs font-jost tracking-wide text-center">Official Site</a>}
                  {details?.reddit_url && <a href={details.reddit_url} target="_blank" rel="noopener" className="block w-full py-3 rounded-xl bg-white/10 text-white/80 hover:text-white hover:bg-white/15 border border-white/15 text-xs font-jost tracking-wide text-center">Reddit</a>}
                </section>
                {/* Related Communities */}
                <section>
                  <h3 className="font-montserrat font-semibold text-sm tracking-wide text-white mb-3 uppercase">Related Communities</h3>
                  <div className="space-y-3">
                    {relatedCommunities.map(c => (
                      <div key={c.id} className="group relative flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-accent/40 transition overflow-hidden">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition" loading="lazy" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <span className="text-white/90 text-[11px] font-montserrat font-semibold tracking-wide truncate">{c.name}</span>
                          <span className="text-white/50 text-[10px] font-mono tracking-wider">{c.members.toLocaleString()} members</span>
                          <span className="text-white/40 text-[10px] font-jost line-clamp-1">{c.tagline}</span>
                        </div>
                        <span className="absolute top-2 right-2 text-[9px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/50 border border-white/10">JOIN</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
      {lightboxOpen && (
        <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-lg flex flex-col">
          <button onClick={()=>setLightboxOpen(false)} className="absolute top-4 right-4 w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 flex items-center justify-center text-white hover:text-accent transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
          <div className="m-auto w-full max-w-7xl px-6">
            <div className="relative">
              <img src={allScreenUrls[lightboxIndex]} alt={`Screenshot ${lightboxIndex+1}`} className="w-full max-h-[78vh] object-contain rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.1)]" />
              <button onClick={()=>navLightbox(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center" aria-label="Previous screenshot">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18L9 12l6-6"/></svg>
              </button>
              <button onClick={()=>navLightbox(1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center" aria-label="Next screenshot">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-black/60 text-white/80 text-[11px] font-mono tracking-wider">{lightboxIndex+1} / {allScreenUrls.length}</div>
            </div>
            <div className="mt-6 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
              {allScreenUrls.map((src,i)=> (
                <button key={src} onClick={()=>{ setLightboxIndex(i); }} className={`relative h-14 rounded-md overflow-hidden border ${i===lightboxIndex? 'border-accent ring-2 ring-accent/50' : 'border-white/10 hover:border-white/30'} group`}> 
                  <img src={src} alt={`Thumb ${i+1}`} className="w-full h-full object-cover group-hover:opacity-80" />
                  {i===lightboxIndex && <span className="absolute inset-0 bg-accent/10" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
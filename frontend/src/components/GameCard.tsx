import { Game } from "../../../shared/api";
import { useState } from "react";

// Props interface for type safety
interface GameCardProps {
  game?: Game; // Optional for loading states
  featured?: boolean;
  className?: string;
  onSelect?: (game: Game) => void;
}

// GameCard Component - Individual game display card
export function GameCard({ game, featured = false, className = "", onSelect }: GameCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const cardClass = featured
    ? "w-[240px] sm:w-[260px] lg:w-[300px] aspect-[3/4] flex-shrink-0"
    : "w-[190px] sm:w-[210px] lg:w-[240px] aspect-[3/4] flex-shrink-0";

  if (!game) {
    return (
      <div className={`${cardClass} ${className} relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm animate-pulse`}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/10" />
          <div className="w-32 h-4 rounded bg-white/15" />
          <div className="flex gap-2">
            <div className="w-10 h-4 rounded bg-accent/30" />
            <div className="w-14 h-4 rounded bg-accent/30" />
          </div>
        </div>
      </div>
    );
  }

  const { title, image, genres, rating } = game;
  const handleActivate = () => { if (game && onSelect) onSelect(game); };
  const interactiveProps = game && onSelect ? { onClick: handleActivate, onKeyDown: (e: React.KeyboardEvent)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); handleActivate(); }}, role:'button', tabIndex:0 } : {};
  return (
    <div
      {...interactiveProps}
      className={`group relative ${cardClass} ${className} rounded-2xl overflow-hidden ${onSelect && game ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/70' : ''}
      bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-white/[0.02] 
      border border-white/10 backdrop-blur-sm
      shadow-[0_4px_18px_-6px_rgba(0,0,0,0.55)] 
      transition-all duration-500 
      hover:shadow-[0_8px_34px_-8px_rgba(0,0,0,0.7)] hover:border-accent/40 
      hover:-translate-y-1 hover:rotate-[0.25deg]`}>
      {featured && (
        <div className="pointer-events-none absolute -inset-[2px] rounded-2xl bg-gradient-to-br from-accent/50 via-transparent to-transparent opacity-40 group-hover:opacity-70 blur-[2px]" />
      )}
      <div className="absolute inset-0 overflow-hidden">
        {!imageError && (
          <img
            src={image}
            alt={title}
            loading="lazy"
            className={`w-full h-full object-cover select-none scale-[1.08] group-hover:scale-[1.16] 
            transition-transform duration-[3500ms] ease-[cubic-bezier(.19,1,.22,1)] 
            ${imageLoading ? 'opacity-0' : 'opacity-100'} group-hover:opacity-100`}
            onLoad={() => setImageLoading(false)}
            onError={() => { setImageLoading(false); setImageError(true); }}
            draggable={false}
          />
        )}
        {(imageLoading || imageError) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/40 to-black/75">
            {imageLoading ? (
              <div className="w-9 h-9 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="text-center text-white/70">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs">No Image</p>
              </div>
            )}
          </div>
        )}
        <div className="absolute inset-0 mix-blend-overlay opacity-[0.15] bg-[radial-gradient(circle_at_32%_24%,rgba(255,255,255,0.45),transparent_62%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/30 to-black/80" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-600 bg-[radial-gradient(circle_at_70%_80%,rgba(255,120,50,0.28),transparent_60%)]" />
      </div>
      {typeof rating === 'number' && !isNaN(rating) && (
        <div className="absolute top-2 left-2 z-10">
          <div className="relative group/score">
            <div className="px-2 py-0.5 rounded-md bg-black/55 backdrop-blur-sm border border-white/10 text-[0.55rem] font-mono font-semibold tracking-wider text-white flex items-center gap-1 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.6)]">
              <span className="text-accent text-xs leading-none">★</span>{rating.toFixed(1)}
            </div>
            <div className="absolute inset-0 rounded-md bg-accent/40 blur-sm opacity-30 group-hover/score:opacity-60 transition" />
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 p-3 pt-8 flex flex-col gap-2">
        <h3
          title={title}
          className={`relative z-10 font-monomaniac font-normal tracking-wide leading-snug line-clamp-2 text-white/90 drop-shadow-md ${featured ? 'text-sm sm:text-base md:text-lg' : 'text-[0.7rem] sm:text-xs md:text-sm'} 
          after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 group-hover:after:w-full after:bg-accent after:transition-all after:duration-500`}
        >{title}</h3>
        <div className="flex flex-wrap gap-1 max-w-full">
          {genres.slice(0,3).map((g,i) => (
            <span key={i} className="relative px-2 py-0.5 rounded-md bg-white/5 text-white/70 font-jost text-[0.55rem] sm:text-[0.6rem] font-medium tracking-wide ring-1 ring-white/10 backdrop-blur-[2px] 
            group-hover:bg-white/10 group-hover:text-white transition-colors">{g}</span>
          ))}
          {genres.length > 3 && (
            <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/60 font-jost text-[0.55rem] sm:text-[0.6rem] font-medium tracking-wide ring-1 ring-white/10">+{genres.length-3}</span>
          )}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-accent/50 transition-colors duration-500" />
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-screen" style={{background:'radial-gradient(circle at 28% 18%, rgba(255,255,255,0.28), transparent 58%)'}} />
      <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
    </div>
  );
}
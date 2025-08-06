import { Game } from "../../../shared/api";
import { useState } from "react";

interface GameCardProps {
  game?: Game; // Make game optional for API loading states
  featured?: boolean;
  className?: string;
}

export function GameCard({ game, featured = false, className = "" }: GameCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Define dimensions - smaller cards with proper proportions
  const cardClass = featured
    ? "w-full max-w-[280px] lg:max-w-[320px] h-[480px] lg:h-[580px]"
    : "w-full max-w-[240px] lg:max-w-[280px] h-[420px] lg:h-[520px]";

  const imageClass = featured
    ? "h-[340px] lg:h-[420px]"
    : "h-[300px] lg:h-[380px]";

  const contentClass = featured
    ? "h-[140px] lg:h-[160px]"
    : "h-[120px] lg:h-[140px]";

  // If no game data, show placeholder
  if (!game) {
    return (
      <div className={`${cardClass} ${className} animate-pulse bg-game-grid-card rounded-[10px] overflow-hidden shadow-[0_4px_9.2px_0_rgba(0,0,0,0.25)]`}>
        <div className={`${imageClass} w-full relative overflow-hidden bg-muted`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white/30">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs">Loading...</p>
            </div>
          </div>
        </div>
        <div className={`${contentClass} w-full p-3 lg:p-4 flex flex-col justify-between`}>
          <div className={`${featured ? 'h-8 lg:h-10' : 'h-6 lg:h-8'} bg-white/20 rounded mb-2 lg:mb-3 flex-shrink-0`}></div>
          <div className="flex gap-1 flex-wrap items-end">
            <div className="w-12 h-6 bg-accent/30 rounded-sm flex-shrink-0"></div>
            <div className="w-16 h-6 bg-accent/30 rounded-sm flex-shrink-0"></div>
          </div>
        </div>
      </div>
    );
  }

  const { title, image, genres } = game;

  return (
    <div className={`${cardClass} ${className} bg-game-grid-card rounded-[10px] overflow-hidden shadow-[0_4px_9.2px_0_rgba(0,0,0,0.25)]`}>
      {/* Game Image */}
      <div
        className={`${imageClass} w-full relative overflow-hidden bg-muted`}
      >
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center text-white/70">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs">Image unavailable</p>
            </div>
          </div>
        ) : (
          <img 
            src={image} 
            alt={title} 
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        )}
      </div>

      {/* Game Info */}
      <div
        className={`${contentClass} w-full p-3 lg:p-4 flex flex-col justify-between`}
      >
        {/* Game Title */}
        <h3
          className={`text-white font-monomaniac ${featured ? "text-sm sm:text-base md:text-lg lg:text-xl" : "text-xs sm:text-sm md:text-base lg:text-lg"} font-normal leading-tight tracking-wide underline mb-2 lg:mb-3 line-clamp-2 flex-shrink-0`}
          title={title}
        >
          {title}
        </h3>

        {/* Genre Tags */}
        <div className="flex gap-1 flex-wrap items-end">
          {genres.slice(0, 2).map((genre, index) => (
            <span
              key={index}
              className={`px-2 py-1 bg-accent text-black font-jost ${featured ? "text-xs" : "text-xs"} font-normal tracking-wide rounded-sm truncate flex-shrink-0`}
            >
              {genre}
            </span>
          ))}
          {genres.length > 2 && (
            <span className={`px-2 py-1 bg-accent/70 text-black font-jost ${featured ? "text-xs" : "text-xs"} font-normal tracking-wide rounded-sm flex-shrink-0`}>
              +{genres.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

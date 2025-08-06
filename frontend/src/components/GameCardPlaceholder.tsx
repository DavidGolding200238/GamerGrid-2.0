interface GameCardPlaceholderProps {
  featured?: boolean;
  className?: string;
}

export function GameCardPlaceholder({ featured = false, className = "" }: GameCardPlaceholderProps) {
  const cardClass = featured
    ? "w-full max-w-[300px] lg:max-w-[362px] h-[500px] lg:h-[691px]"
    : "w-full max-w-[280px] lg:max-w-[300px] h-[420px] lg:h-[572px]";

  const imageClass = featured
    ? "h-[400px] lg:h-[559px]"
    : "h-[320px] lg:h-[463px]";

  const contentClass = featured
    ? "h-[100px] lg:h-[132px]"
    : "h-[100px] lg:h-[109px]";

  return (
    <div className={`${cardClass} ${className} animate-pulse`}>
      {/* Game Image Placeholder */}
      <div
        className={`${imageClass} w-full relative overflow-hidden rounded-t-[10px] shadow-[0_4px_11.2px_0_rgba(0,0,0,0.25)] bg-muted`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/30">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Loading...</p>
          </div>
        </div>
      </div>

      {/* Game Info Placeholder */}
      <div
        className={`${contentClass} w-full bg-game-grid-card rounded-b-[10px] shadow-[0_4px_9.2px_0_rgba(0,0,0,0.25)] p-3 lg:p-4 flex flex-col justify-center`}
      >
        {/* Game Title Placeholder */}
        <div className={`${featured ? 'h-8 lg:h-12' : 'h-6 lg:h-8'} bg-white/20 rounded mb-2 lg:mb-3`}></div>
        
        {/* Genre Tags Placeholder */}
        <div className="flex gap-1 flex-wrap">
          <div className="w-12 h-6 bg-accent/30 rounded-sm"></div>
          <div className="w-16 h-6 bg-accent/30 rounded-sm"></div>
          <div className="w-20 h-6 bg-accent/30 rounded-sm"></div>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { GameCard } from "./GameCard";
import { Game } from "../../../shared/api";

// Component props interface for type safety
interface GameRowProps {
  games: Game[];
  title: string;
  onLoadMore?: () => void;
  loading?: boolean;
  hasMore?: boolean;
  featured?: boolean;
  carousel?: boolean; // Enables 5-card carousel with center focus
  gridFeatured?: boolean; // Hero grid layout
  onSelectGame?: (game: Game) => void; // Callback when a game is selected
}

// GameRow Component - Displays games in horizontal rows or carousel format
export function GameRow({ games, title, onLoadMore, loading = false, hasMore = true, featured = false, carousel = false, gridFeatured = false, onSelectGame }: GameRowProps) {
  // References and state for scroll functionality
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0); // Track center card in carousel
  
  // State for drag/swipe functionality
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);

  // Function to show/hide navigation arrows based on scroll position
  const checkScrollButtons = () => {
    if (carousel) {
      // Carousel mode: show arrows based on current index
      setShowLeftArrow(currentIndex > 0);
      setShowRightArrow(currentIndex < Math.max(0, games.length - 5));
    } else {
      // Normal mode: check scroll position
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      }
    }
  };

  useEffect(() => {
    checkScrollButtons();
    if (!carousel) {
      const container = scrollContainerRef.current;
      if (container) {
        container.addEventListener('scroll', checkScrollButtons);
        return () => container.removeEventListener('scroll', checkScrollButtons);
      }
    }
  }, [games, currentIndex, carousel]);

  // Hero grid layout with large featured card + 6 smaller cards
  if (gridFeatured) {
    const [activeFeatured, setActiveFeatured] = useState(0);
    
    return (
      <section className="mt-10 lg:mt-14 mb-24">
        <h2 className="text-white font-montserrat text-2xl md:text-3xl font-bold tracking-wide flex items-center gap-3 mb-12 lg:mb-16">
          {title} <span className="h-0.5 w-16 bg-accent rounded-full" />
        </h2>
        
        <div className="px-6 lg:px-12">
          <div className="grid lg:grid-cols-5 gap-8 items-stretch">
            {/* Large featured game - takes 3 columns */}
            <div className="lg:col-span-3 relative group rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl min-h-[420px] lg:min-h-[520px] flex">
              {games.length > 0 ? (
                <>
                  <div className="absolute inset-0">
                    <img src={games[activeFeatured % games.length].image} 
                         alt={games[activeFeatured % games.length].title} 
                         className="w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity duration-700" 
                         loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/40 to-transparent" />
                  </div>
                  <div className="relative z-10 p-6 lg:p-10 flex flex-col justify-end w-full">
                    <div className="mb-4 flex gap-2 flex-wrap">
                      {games[activeFeatured % games.length].genres.slice(0,3).map(g => 
                        <span key={g} className="px-3 py-1 rounded-full bg-accent text-black text-xs font-jost tracking-wide">{g}</span>
                      )}
                    </div>
                    <h1 className="text-white font-montserrat text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-lg max-w-xl leading-[1.1]">
                      {games[activeFeatured % games.length].title}
                    </h1>
                    <div className="mt-6 flex items-center gap-6">
                      <button onClick={() => setActiveFeatured(i => (i + 1) % Math.max(1, games.length))} 
                              className="px-5 py-2.5 rounded-lg bg-accent text-black font-jost font-bold uppercase tracking-wider text-xs lg:text-sm shadow-[0_0_0_0_rgba(255,255,255,0.15)] hover:shadow-[0_0_0_4px_rgba(255,255,255,0.25)] transition-all">
                        Next
                      </button>
                      <div className="flex items-center gap-2">
                        {games.slice(0,5).map((_, idx) => 
                          <span key={idx} className={`w-2 h-2 rounded-full ${idx === activeFeatured % 5 ? 'bg-accent' : 'bg-white/30'} transition-colors`} />
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="m-auto text-white/60 font-jost tracking-wide text-sm">Loading featured...</div>
              )}
            </div>

            {/* Smaller featured games grid - takes 2 columns */}
            <div className="lg:col-span-2 grid sm:grid-cols-3 lg:grid-cols-2 gap-4 content-start">
              {games.slice(0,6).map((g, idx) => (
                <button key={g.id} 
                        onClick={() => setActiveFeatured(idx)} 
                        className={`group relative rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm shadow-md h-40 sm:h-44 lg:h-48 text-left transition-all ${idx === activeFeatured ? 'ring-2 ring-accent' : 'hover:ring-2 hover:ring-white/30'}`}>
                  <img src={g.image} 
                       alt={g.title} 
                       className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" 
                       loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <h3 className="text-white font-monomaniac text-xs sm:text-sm font-normal leading-snug line-clamp-2">
                      {g.title}
                    </h3>
                  </div>
                </button>
              ))}
              {games.length === 0 && 
                <div className="col-span-full text-center text-white/50 font-jost text-sm">
                  Preparing highlights...
                </div>
              }
            </div>
          </div>
        </div>
      </section>
    );
  }

  const scrollLeft = () => {
    if (carousel) {
      // Carousel mode: move to previous set of 5 cards
      const newIndex = Math.max(0, currentIndex - 1);
      setCurrentIndex(newIndex);
    } else {
      // Normal mode: scroll by fixed amount
      scrollContainerRef.current?.scrollBy({
        left: -400,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (carousel) {
      // Carousel mode: move to next set of 5 cards
      const maxIndex = Math.max(0, games.length - 5);
      const newIndex = Math.min(maxIndex, currentIndex + 1);
      setCurrentIndex(newIndex);
    } else {
      // Normal mode: scroll by fixed amount
      scrollContainerRef.current?.scrollBy({
        left: 400,
        behavior: 'smooth'
      });
    }
  };

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carousel && scrollContainerRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeftStart(scrollContainerRef.current.scrollLeft);
      scrollContainerRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || carousel || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeftStart - walk;
  };

  const handleMouseUp = () => {
    if (scrollContainerRef.current) {
      setIsDragging(false);
      scrollContainerRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    if (scrollContainerRef.current) {
      setIsDragging(false);
      scrollContainerRef.current.style.cursor = 'grab';
    }
  };

  // Touch drag functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    if (carousel) {
      setStartX(e.touches[0].clientX);
    } else if (scrollContainerRef.current) {
      setIsDragging(true);
      setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeftStart(scrollContainerRef.current.scrollLeft);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (carousel) return;
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeftStart - walk;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (carousel) {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0) {
          scrollRight(); // Swipe left, go to next
        } else {
          scrollLeft(); // Swipe right, go to previous
        }
      }
    } else {
      setIsDragging(false);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current && onLoadMore && hasMore && !loading) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      // Load more when 80% through the scroll
      if (scrollLeft + clientWidth >= scrollWidth * 0.8) {
        onLoadMore();
      }
    }
    checkScrollButtons();
  };

  // Show placeholder cards when loading
  const placeholderCount = 8;
  const placeholderCards = Array.from({ length: placeholderCount }, (_, i) => (
    <GameCard key={`placeholder-${i}`} featured={featured && i === Math.floor(placeholderCount / 2)} />
  ));

  return (
    <section className="mb-20 relative z-20">
      <h2 className="text-white font-montserrat text-2xl md:text-3xl font-bold tracking-wide flex items-center gap-3 mb-12 lg:mb-16">
        {title} <span className="h-0.5 w-16 bg-accent rounded-full" />
      </h2>

      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-background/80 border border-white/20 rounded-full flex items-center justify-center text-white hover:text-accent hover:bg-background transition-all duration-200 backdrop-blur-sm"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={scrollRight}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-background/80 border border-white/20 rounded-full flex items-center justify-center text-white hover:text-accent hover:bg-background transition-all duration-200 backdrop-blur-sm"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={carousel ? undefined : handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`${carousel ? 'overflow-hidden' : 'overflow-x-auto scrollbar-hide'} pb-4 ${!carousel ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''} select-none`}
          style={carousel ? {} : {
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {carousel ? (
            /* Carousel Mode: 5 cards with center card larger */
            <div className="flex justify-center items-center gap-4 px-6 lg:px-12">
              {games.slice(currentIndex, currentIndex + 5).map((game, index) => {
                const isCenter = index === 2;
                return (
                  <div key={game.id} className={`transition-all duration-300 ${isCenter ? 'transform scale-110 z-10' : 'opacity-80 hover:opacity-100 scale-90'}`}>
                    <GameCard 
                      game={game} 
                      featured={isCenter} 
                      className=""
                    />
                  </div>
                );
              })}
              
              {/* Loading placeholders for carousel */}
              {loading && games.length < 5 && Array.from({ length: 5 - games.slice(currentIndex, currentIndex + 5).length }, (_, i) => (
                <div key={`carousel-placeholder-${i}`} className={`transition-all duration-300 ${i === 2 ? 'transform scale-110 z-10' : 'opacity-80 scale-90'}`}>
                  <GameCard featured={i === 2} className="" />
                </div>
              ))}
            </div>
          ) : (
            /* Normal Mode: Horizontal scrolling */
            <div className="flex gap-6 px-6 lg:px-12" style={{ width: 'max-content' }}>
              {/* Actual game cards */}
              {games.map((game) => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  featured={featured}
                  onSelect={onSelectGame} 
                />
              ))}
              
              {/* Loading placeholders */}
              {loading && placeholderCards}
              
              {/* Load more indicator */}
              {hasMore && !loading && games.length > 0 && (
                <div className="flex items-center justify-center min-w-[240px] lg:min-w-[280px]">
                  <button
                    onClick={onLoadMore}
                    className="w-full h-full min-h-[420px] lg:min-h-[520px] border-2 border-dashed border-white/30 rounded-lg flex flex-col items-center justify-center text-white/50 hover:text-accent hover:border-accent/50 transition-colors duration-200"
                  >
                    <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-jost text-lg uppercase tracking-wider">Load More</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Carousel Indicators */}
        {carousel && games.length > 5 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: Math.max(1, games.length - 4) }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  currentIndex === i ? 'bg-accent' : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

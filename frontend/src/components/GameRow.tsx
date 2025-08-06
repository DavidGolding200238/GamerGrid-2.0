import { useState, useRef, useEffect } from "react";
import { GameCard } from "./GameCard";
import { Game } from "../../../shared/api";

interface GameRowProps {
  games: Game[];
  title: string;
  onLoadMore?: () => void;
  loading?: boolean;
  hasMore?: boolean;
  featured?: boolean;
  carousel?: boolean; // New prop for 5-card carousel layout
}

export function  GameRow({ games, title, onLoadMore, loading = false, hasMore = true, featured = false, carousel = false }: GameRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0); // Track current center card for carousel
  
  // Drag functionality states
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);

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
    <section className="mb-20">
      <h2 className="text-white font-montserrat text-2xl md:text-3xl lg:text-4xl font-bold tracking-wider text-center underline decoration-2 underline-offset-4 mb-12 lg:mb-16 uppercase">
        {title}
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
                <GameCard key={game.id} game={game} featured={featured} />
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

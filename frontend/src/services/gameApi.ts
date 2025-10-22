import { Game } from "../../../shared/api";
import { apiUrl } from '../config/api';

// Define types for communities and news
interface CommunityItem { 
  id: string; 
  name: string; 
  members: number; 
  image?: string; 
  tagline?: string;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  image?: string;
  published: string;
}

// Note: Response shapes vary between endpoints; parsing is handled inline in each method.

export class GameApiService {
  private static instance: GameApiService;
  private constructor() {}

  public static getInstance(): GameApiService {
    if (!GameApiService.instance) {
      GameApiService.instance = new GameApiService();
    }
    return GameApiService.instance;
  }

  /**
   * Fetch random games for the top games row
   * TODO: Replace this with your actual API endpoint
   */
  async fetchRandomGames(limit: number = 10, offset: number = 0): Promise<Game[]> {
    try {
      // Call the backend API
      const response = await fetch(apiUrl(`/games/random?limit=${limit}&offset=${offset}`));
      const json = await response.json();
      // Backend sometimes returns { data: { games: [...] } } and sometimes { games: [...] }
      if (json?.data?.games && Array.isArray(json.data.games)) {
        return json.data.games as Game[];
      }
      if (json?.games && Array.isArray(json.games)) {
        return json.games as Game[];
      }
      // Fallback: if the API returned an array directly
      if (Array.isArray(json)) return json as Game[];
      console.error('Unexpected fetchRandomGames response shape:', json);
      throw new Error('Unexpected response from games API');
    } catch (error) {
      console.error('Failed to fetch random games:', error);
      throw new Error('Failed to fetch random games');
    }
  }

  /**
   * Fetch games by genre (e.g., shooter games)
   * TODO: Replace this with your actual API endpoint
   */
  async fetchGamesByGenre(genre: string, limit: number = 10, offset: number = 0): Promise<Game[]> {
    try {
      // Call the backend API
      const response = await fetch(apiUrl(`/games/genre/${genre}?limit=${limit}&offset=${offset}`));
      const json = await response.json();
      if (json?.data?.games && Array.isArray(json.data.games)) return json.data.games as Game[];
      if (json?.games && Array.isArray(json.games)) return json.games as Game[];
      if (Array.isArray(json)) return json as Game[];
      console.error(`Unexpected fetchGamesByGenre response for genre=${genre}:`, json);
      throw new Error('Unexpected response from games API');
    } catch (error) {
      console.error(`Failed to fetch ${genre} games:`, error);
      throw new Error(`Failed to fetch ${genre} games`);
    }
  }

  /**
   * Search games by query
   * TODO: Replace this with your actual API endpoint
   */
  async searchGames(query: string, limit: number = 10, offset: number = 0): Promise<Game[]> {
    try {
      // Call the backend API
      const response = await fetch(apiUrl(`/games/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`));
      const json = await response.json();
      if (json?.data?.games && Array.isArray(json.data.games)) return json.data.games as Game[];
      if (json?.games && Array.isArray(json.games)) return json.games as Game[];
      if (Array.isArray(json)) return json as Game[];
      console.error(`Unexpected searchGames response for q=${query}:`, json);
      throw new Error('Unexpected response from games API');
    } catch (error) {
      console.error('Failed to search games:', error);
      throw new Error('Failed to search games');
    }
  }

  /**
   * Fetch games with filters and sorting
   * TODO: Replace this with your actual API endpoint
   */
  async fetchGamesWithFilters(filters: {
    genre?: string;
    platform?: string;
    sortBy?: 'name' | 'rating' | 'release_date';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<Game[]> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      // Call the backend API
      const response = await fetch(apiUrl(`/games?${queryParams}`));
      const json = await response.json();
      if (json?.data?.games && Array.isArray(json.data.games)) return json.data.games as Game[];
      if (json?.games && Array.isArray(json.games)) return json.games as Game[];
      if (Array.isArray(json)) return json as Game[];
      console.error('Unexpected fetchGamesWithFilters response:', json);
      throw new Error('Unexpected response from games API');
    } catch (error) {
      console.error('Failed to fetch games with filters:', error);
      throw new Error('Failed to fetch games with filters');
    }
  }
  
  /**
   * Fetch communities
   * TODO: Replace with your actual API endpoint
   */
  async fetchCommunities(limit: number = 5): Promise<CommunityItem[]> {
    try {
      // For now, return mock data until you connect your API
      // TODO: Make mock image URLs configurable via env if needed
      console.log(`API Call: Fetch ${limit} communities`);
      return [
        { id: 'c1', name: 'Speedrunners Hub', members: 12450, tagline: 'Frames matter.', image: import.meta.env.VITE_COMMUNITY_IMAGE_1 || 'https://picsum.photos/seed/comm1/500/500' },
        { id: 'c2', name: 'Indie Forge', members: 8421, tagline: 'Build. Share. Iterate.', image: import.meta.env.VITE_COMMUNITY_IMAGE_2 || 'https://picsum.photos/seed/comm2/500/500' },
        { id: 'c3', name: 'Tactical Minds', members: 6312, tagline: 'Every move counts.', image: import.meta.env.VITE_COMMUNITY_IMAGE_3 || 'https://picsum.photos/seed/comm3/500/500' }
      ];
    } catch (error) {
      console.error('Failed to fetch communities:', error);
      return [];
    }
  }

  /**
   * Fetch news
   * TODO: Replace with your actual API endpoint
   */
  async fetchNews(limit: number = 6): Promise<NewsItem[]> {
    try {
      // For now, return mock data until you connect your API
      // TODO: Make mock news image URLs configurable via env if needed
      console.log(`API Call: Fetch ${limit} news items`);
      return [
        { id: 'n1', title: 'Major Studio Announces Surprise Title', source: 'GameWire', image: import.meta.env.VITE_NEWS_IMAGE_1 || 'https://picsum.photos/seed/news1/800/500', published: '2025-08-09' },
        { id: 'n2', title: 'Indie Breakout Smashes Charts Globally', source: 'IndiePulse', image: import.meta.env.VITE_NEWS_IMAGE_2 || 'https://picsum.photos/seed/news2/800/500', published: '2025-08-08' },
        { id: 'n3', title: 'Competitive Finals Set New Viewership Record', source: 'eSportsCentral', image: import.meta.env.VITE_NEWS_IMAGE_3 || 'https://picsum.photos/seed/news3/800/500', published: '2025-08-07' }
      ];
    } catch (error) {
      console.error('Failed to fetch news:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const gameApi = GameApiService.getInstance();

// Example usage:
// import { gameApi } from '../services/gameApi';
// 
// const games = await gameApi.fetchRandomGames(10);
// const shooterGames = await gameApi.fetchGamesByGenre('shooter', 8);
// const searchResults = await gameApi.searchGames('cyberpunk');

import { Game } from "../../../shared/api";

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

// Configuration - Update these with your actual API details
const API_BASE_URL = import.meta.env.VITE_GAME_API_URL || '/api';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

interface GamesResponse {
  games: Game[];
  total: number;
  page: number;
  hasMore: boolean;
}

export class GameApiService {
  private static instance: GameApiService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = API_BASE_URL;
  }

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
      // Example API call - replace with your endpoint
      // const response = await fetch(`${this.baseUrl}/games/random?limit=${limit}&offset=${offset}`);
      // const data: ApiResponse<GamesResponse> = await response.json();
      // return data.data.games;

      // For now, return empty array until you connect your API
      console.log(`API Call: Fetch ${limit} random games with offset ${offset}`);
      return [];
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
      // Example API call - replace with your endpoint
      // const response = await fetch(`${this.baseUrl}/games?genre=${genre}&limit=${limit}&offset=${offset}`);
      // const data: ApiResponse<GamesResponse> = await response.json();
      // return data.data.games;

      // For now, return empty array until you connect your API
      console.log(`API Call: Fetch ${limit} ${genre} games with offset ${offset}`);
      return [];
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
      // Example API call - replace with your endpoint
      // const response = await fetch(`${this.baseUrl}/games/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`);
      // const data: ApiResponse<GamesResponse> = await response.json();
      // return data.data.games;

      // For now, return empty array until you connect your API
      console.log(`API Call: Search "${query}" with limit ${limit} and offset ${offset}`);
      return [];
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

      // Example API call - replace with your endpoint
      // const response = await fetch(`${this.baseUrl}/games?${queryParams}`);
      // const data: ApiResponse<GamesResponse> = await response.json();
      // return data.data.games;

      // For now, return empty array until you connect your API
      console.log(`API Call: Fetch games with filters:`, filters);
      return [];
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
      console.log(`API Call: Fetch ${limit} communities`);
      return [
        { id: 'c1', name: 'Speedrunners Hub', members: 12450, tagline: 'Frames matter.', image: 'https://picsum.photos/seed/comm1/500/500' },
        { id: 'c2', name: 'Indie Forge', members: 8421, tagline: 'Build. Share. Iterate.', image: 'https://picsum.photos/seed/comm2/500/500' },
        { id: 'c3', name: 'Tactical Minds', members: 6312, tagline: 'Every move counts.', image: 'https://picsum.photos/seed/comm3/500/500' }
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
      console.log(`API Call: Fetch ${limit} news items`);
      return [
        { id: 'n1', title: 'Major Studio Announces Surprise Title', source: 'GameWire', image: 'https://picsum.photos/seed/news1/800/500', published: '2025-08-09' },
        { id: 'n2', title: 'Indie Breakout Smashes Charts Globally', source: 'IndiePulse', image: 'https://picsum.photos/seed/news2/800/500', published: '2025-08-08' },
        { id: 'n3', title: 'Competitive Finals Set New Viewership Record', source: 'eSportsCentral', image: 'https://picsum.photos/seed/news3/800/500', published: '2025-08-07' }
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

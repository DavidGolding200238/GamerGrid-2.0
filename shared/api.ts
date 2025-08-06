/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Game data types
 */
export interface Game {
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
}

export interface GamesResponse {
  games: Game[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GamesFilters {
  genre?: string;
  platform?: string;
  featured?: boolean;
  search?: string;
  sortBy?: 'title' | 'rating' | 'releaseDate';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

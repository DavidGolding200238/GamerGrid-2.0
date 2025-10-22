interface Game {
  id: string;
  title: string;
  image: string;
  genres: string[];
  platform: string[];
  rating: number;
  releaseDate?: string;
  description?: string;
  featured?: boolean;
}

interface GamesResponse {
  games: Game[];
  total: number;
  page: number;
  pageSize: number;
}

const RAWG_API_KEY = "c60ed11f699e430485308b3a910b1cb7";
const RAWG_BASE_URL = "https://api.rawg.io/api";

// Interface for RAWG API response
interface RAWGGame {
  id: number;
  name: string;
  background_image: string;
  genres: Array<{ id: number; name: string }>;
  platforms: Array<{ platform: { id: number; name: string } }>;
  rating: number;
  released: string;
  description_raw?: string;
  metacritic?: number;
}

interface RAWGResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RAWGGame[];
}

// Convert RAWG game format to our Game interface
function convertRAWGGame(rawgGame: RAWGGame): Game {
  return {
    id: rawgGame.id.toString(),
    title: rawgGame.name,
    image: rawgGame.background_image || "https://via.placeholder.com/400x600",
    genres: rawgGame.genres.map(g => g.name),
    platform: rawgGame.platforms.map(p => p.platform.name),
    rating: rawgGame.rating,
    releaseDate: rawgGame.released,
    description: rawgGame.description_raw,
    featured: rawgGame.metacritic ? rawgGame.metacritic > 80 : false,
  };
}

// Fetch games from RAWG API
export async function fetchGamesFromRAWG(params: {
  page?: number;
  pageSize?: number;
  genres?: string;
  search?: string;
  ordering?: string;
}): Promise<GamesResponse> {
  try {
    const searchParams = new URLSearchParams({
      key: RAWG_API_KEY,
      page: (params.page || 1).toString(),
      page_size: (params.pageSize || 10).toString(),
    });

    if (params.genres) {
      searchParams.append('genres', params.genres);
    }

    if (params.search) {
      searchParams.append('search', params.search);
    }

    if (params.ordering) {
      searchParams.append('ordering', params.ordering);
    }

    const response = await fetch(`${RAWG_BASE_URL}/games?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`);
    }

    const data = await response.json() as RAWGResponse;

    return {
      games: data.results.map(convertRAWGGame),
      total: data.count,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    };
  } catch (error) {
    console.error('Error fetching from RAWG API:', error);
    throw new Error('Failed to fetch games from RAWG API');
  }
}

// Fetch top/popular games
export async function fetchTopGames(page: number = 1, pageSize: number = 10): Promise<GamesResponse> {
  return fetchGamesFromRAWG({
    page,
    pageSize,
    ordering: '-rating,-metacritic',
  });
}

// Fetch games by genre
export async function fetchGamesByGenre(genre: string, page: number = 1, pageSize: number = 10): Promise<GamesResponse> {
  // Map common genre names to RAWG genre IDs or names
  const genreMap: { [key: string]: string } = {
    'shooter': 'shooter',
    'action': 'action',
    'adventure': 'adventure',
    'rpg': 'role-playing-games-rpg',
    'strategy': 'strategy',
    'sports': 'sports',
    'racing': 'racing',
    'puzzle': 'puzzle',
  };

  const rawgGenre = genreMap[genre.toLowerCase()] || genre;

  return fetchGamesFromRAWG({
    page,
    pageSize,
    genres: rawgGenre,
  });
}

// Fetch random games (using different ordering methods)
export async function fetchRandomGames(page: number = 1, pageSize: number = 10): Promise<GamesResponse> {
  // RAWG doesn't have true random, but we can use different ordering methods
  const orderingOptions = ['-released', '-rating', '-added', '-created'];
  const randomOrdering = orderingOptions[Math.floor(Math.random() * orderingOptions.length)];

  return fetchGamesFromRAWG({
    page,
    pageSize,
    ordering: randomOrdering,
  });
}

export async function fetchGamesBySearch(query: string, page: number = 1, pageSize: number = 20): Promise<GamesResponse> {
  return fetchGamesFromRAWG({
    page,
    pageSize,
    search: query,
  });
}

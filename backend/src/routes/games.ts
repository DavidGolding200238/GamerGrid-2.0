import { Request, Response , Router } from 'express';
import axios from 'axios';

const RAWG_BASE_URL = 'https://api.rawg.io/api';
const API_KEY = 'c60ed11f699e430485308b3a910b1cb7';
const router = Router();

if (!API_KEY) {
  throw new Error('RAWG_API_KEY is not set');
}

router.get('/search', async (req: Request, res: Response) => {
  try { // ADD THIS - missing try block
    const { q, limit = 20 } = req.query; // FIX: req.query not require.query
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    console.log('Searching for:', q);

    // Direct API call instead of using RawgApiService
    const response = await axios.get(`${RAWG_BASE_URL}/games`, {
      params: {
        key: API_KEY,
        search: q,
        page_size: parseInt(limit as string),
      },
    });

    const formattedGames = formatGames(response.data.results);
    res.json({ games: formattedGames });
    
  } catch (error) {
    console.error('Error searching games:', error);
    res.status(500).json({ error: 'Failed to search games' });
  }
});


// Helper function to shuffle an array (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Helper function to format RAWG game data to match your frontend Game interface
function formatGames(games: any[]): any[] {
  return games.map(game => ({
    id: game.id.toString(),
    title: game.name,
    image: game.background_image || 'https://via.placeholder.com/400x600',
    genres: game.genres?.map((g: any) => g.name) || [],
    platform: game.parent_platforms?.map((p: any) => p.platform.name) || [],
    rating: game.rating,
    releaseDate: game.released,
    description: game.description_raw,
    featured: game.metacritic ? game.metacritic > 80 : false,
  }));
}

// General endpoint for fetching games (supports genre filtering, pagination, etc.)
export async function getAllGames(req: Request, res: Response) {
  try {
    const { genre, limit = '10', offset = '0', ordering = '-rating' } = req.query;
    const pageSize = parseInt(limit as string, 10);
    const page = Math.floor(parseInt(offset as string, 10) / pageSize) + 1;

    const params: any = {
      key: API_KEY,
      page,
      page_size: pageSize,
      ordering,
    };

    if (genre) {
      params.genres = genre; // e.g., 'shooter' – RAWG supports genre slugs
    }

    const response = await axios.get(`${RAWG_BASE_URL}/games`, { params });
    const formattedGames = formatGames(response.data.results);

    res.json({
      games: formattedGames,
      total: response.data.count,
      page: page,
      pageSize: pageSize,
      hasMore: page * pageSize < response.data.count,
    });
  } catch (error) {
    console.error('Error fetching all games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
}

// Endpoint for random games (fetches top-rated and shuffles them for randomness)
export async function getRandomGames(req: Request, res: Response) {
  try {
    const { limit = '10', offset = '0' } = req.query;
    const pageSize = parseInt(limit as string, 10);
    const page = Math.floor(parseInt(offset as string, 10) / pageSize) + 1;

    const params = {
      key: API_KEY,
      page,
      page_size: pageSize,
      ordering: '-rating,-metacritic', // Fetch high-quality games first
    };

    const response = await axios.get(`${RAWG_BASE_URL}/games`, { params });
    const shuffledGames = shuffleArray(response.data.results);
    const formattedGames = formatGames(shuffledGames);

    res.json({
      games: formattedGames,
      total: response.data.count,
      page: page,
      pageSize: pageSize,
      hasMore: page * pageSize < response.data.count,
    });
  } catch (error) {
    console.error('Error fetching random games:', error);
    res.status(500).json({ error: 'Failed to fetch random games' });
  }
}

// Endpoint for top games (ordered by rating or metacritic)
export async function getTopGames(req: Request, res: Response) {
  try {
    const { limit = '10', offset = '0' } = req.query;
    const pageSize = parseInt(limit as string, 10);
    const page = Math.floor(parseInt(offset as string, 10) / pageSize) + 1;

    const params = {
      key: API_KEY,
      page,
      page_size: pageSize,
      ordering: '-metacritic,-rating', // Prioritize metacritic, then rating
    };

    const response = await axios.get(`${RAWG_BASE_URL}/games`, { params });
    const formattedGames = formatGames(response.data.results);

    res.json({
      games: formattedGames,
      total: response.data.count,
      page: page,
      pageSize: pageSize,
      hasMore: page * pageSize < response.data.count,
    });
  } catch (error) {
    console.error('Error fetching top games:', error);
    res.status(500).json({ error: 'Failed to fetch top games' });
  }
}

// Endpoint for games by genre (can be mounted as /api/games/genre or integrated into getAllGames)
export async function getGamesByGenre(req: Request, res: Response) {
  try {
    // Assuming genre is passed as a query param or route param (e.g., /genre/shooter)
    const genre = req.query.genre || req.params.genre || 'shooter'; // Default to shooter for example
    const { limit = '10', offset = '0', ordering = '-rating' } = req.query;
    const pageSize = parseInt(limit as string, 10);
    const page = Math.floor(parseInt(offset as string, 10) / pageSize) + 1;

    const params = {
      key: API_KEY,
      page,
      page_size: pageSize,
      genres: genre, // e.g., 'shooter'
      ordering,
    };

    const response = await axios.get(`${RAWG_BASE_URL}/games`, { params });
    const formattedGames = formatGames(response.data.results);

    res.json({
      games: formattedGames,
      total: response.data.count,
      page: page,
      pageSize: pageSize,
      hasMore: page * pageSize < response.data.count,
    });
  } catch (error) {
    console.error('Error fetching games by genre:', error);
    res.status(500).json({ error: 'Failed to fetch games by genre' });
  }
}

// Add these route definitions at the bottom of your games.ts file

// Set up your routes
router.get('/', getAllGames);
router.get('/random', getRandomGames);
router.get('/top', getTopGames);
router.get('/genre/:genre', getGamesByGenre);
// search route is already defined above

// Export the router so it can be used in your main server
export default router;
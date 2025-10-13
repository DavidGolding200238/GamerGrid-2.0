import { Router} from 'express';
import axios from 'axios';

const router = Router();
const NEWS_API_BASE_URL = 'https://newsapi.org/v2'; 
const NEWS_API_KEY = process.env.NEWS_API_KEY;
router.get('/gaming', async (req, res) => {
  try {
    const { pageSize = '15', page = '1' } = req.query as { pageSize?: string; page?: string };

    const { data } = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
      params: {
        apiKey: NEWS_API_KEY,
        q: 'gaming OR "video games" OR playstation OR xbox OR nintendo',
        language: 'en',
        pageSize,
        page,
        sortBy: 'publishedAt'
      },
    });

    res.json(data);
  } catch (error) {
    console.error('Error fetching gaming news:', error);
    res.status(500).json({ message: 'Failed to fetch gaming news' });
  }
});

export default router;
const RAPID_API_URL = 'https://mmo-games.p.rapidapi.com/latestnews';
const RAPID_API_KEY = '1435a946f8msh6f48b802001f9bap184306jsn3db9537b6580';
const RAPID_API_HOST = 'mmo-games.p.rapidapi.com';

export interface NewsArticle {
    id: string;
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    content: string;
    author: string;
    source: {
        id?: string;
        name: string;
    };
}

class NewsApiService {
    private static instance: NewsApiService;

    public static getInstance(): NewsApiService {
        if (!NewsApiService.instance) {
            NewsApiService.instance = new NewsApiService();
        }
        return NewsApiService.instance;
    }

    async fetchGamingNews(limit: number = 10): Promise<NewsArticle[]> {
        try {
            const response = await fetch(RAPID_API_URL, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': RAPID_API_KEY,
                    'X-RapidAPI-Host': RAPID_API_HOST
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Transform the API response to match our NewsArticle interface
            return data.slice(0, limit).map((item: any, index: number) => ({
                id: item.id || index.toString(),
                title: item.title || 'No title',
                description: item.description || item.short_description || 'No description',
                url: item.article_url || item.url || '#',
                urlToImage: item.main_image || item.thumbnail || '',
                publishedAt: item.publish_date || new Date().toISOString(),
                content: item.article_content || item.description || '',
                author: item.author || 'Unknown',
                source: {
                    id: 'mmo-games',
                    name: item.source || 'MMO Games'
                }
            }));
        } catch (error) {
            console.error('Failed to fetch gaming news:', error);
            throw error;
        }
    }
}

export const newsApi = NewsApiService.getInstance()
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

      async fetchGamingNews(limit: number = 12, page: number = 1) {
        try {
            const response = await fetch(`/api/news/gaming?pageSize=${limit}&page=${page}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Return both the articles array and total results
            return {
                articles: data.articles.map((item: any) => ({
                    id: item.url || Math.random().toString(), // Fallback ID if URL is missing
                    title: item.title || 'No title',
                    description: item.description || 'No description',
                    url: item.url || '#',
                    urlToImage: item.urlToImage || '',
                    publishedAt: item.publishedAt || new Date().toISOString(),
                    content: item.content || item.description || '',
                    author: item.author || 'Unknown',
                    source: {
                        id: item.source?.id || '',
                        name: item.source?.name || 'Unknown Source'
                    }
                })),
                totalResults: data.totalResults || 0
            };
        } catch (error) {
            console.error('Failed to fetch gaming news:', error);
            throw error;
        }
    }
}

export const newsApi = NewsApiService.getInstance();


import { Header } from "../components/Header";
import { useState, useEffect} from 'react';
import {newsApi, NewsArticle} from "../services/newsApi";

export default function News() {
  const[articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const newsArticles = await newsApi.fetchGamingNews(10);
        setArticles(newsArticles);
        setError(null);
      } catch (err) {
        setError("Failed to load news articles.");
        console.error("News API Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <p className="text-white text-center">Loading news articles...</p>
        </main>
      </div>
    );
  }

return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Gaming News</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article 
              key={article.id} 
              className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {article.urlToImage && (
                <img 
                  src={article.urlToImage} 
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
                <p className="text-muted-foreground mb-4">{article.description}</p>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{article.source.name}</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-4 inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Read More
                </a>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

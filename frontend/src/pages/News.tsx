import { Header } from "../components/Header";
import { useState, useEffect} from 'react';
import {newsApi, NewsArticle} from "../services/newsApi";
import { NetworkBackground } from "../components/NetworkBackground";

export default function News() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const articlesPerPage = 12; // Increased from 10

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const response = await newsApi.fetchGamingNews(articlesPerPage, currentPage);
        setArticles(response.articles);
        
        // Calculate total pages based on totalResults from NewsAPI
        const total = Math.ceil(response.totalResults / articlesPerPage);
        setTotalPages(total > 10 ? 10 : total); // NewsAPI limits to 100 results (10 pages of 10)
        
        setError(null);
      } catch (err) {
        setError("Failed to load news articles.");
        console.error("News API Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, [currentPage]); // Re-fetch when page changes

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top when changing pages
  };

  if (loading && currentPage === 1) {
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
    <div className="min-h-screen bg-background relative"> 
      <NetworkBackground /> 
      <Header />
      <main className="container mx-auto px-4 py-8 relative z-10"> 
        <h1 className="text-3xl font-bold mb-6">Gaming News</h1>

        {loading && <div className="text-center my-4">Loading more articles...</div>}

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
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-game.jpg';
                  }}
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
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === i + 1 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card hover:bg-primary/20'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Header } from "../components/Header";
import Footer from '../components/footer';
import { communityApi, Community as CommunityType, Post as PostType, CreateCommunityData, CreatePostData } from '../services/communityApi';
import { NetworkBackground } from '../components/NetworkBackground';

// Helper to resolve image URLs from the backend
const resolveImageUrl = (url?: string) =>
  url ? (url.startsWith('http') ? url : `http://localhost:3000${url}`) : '';

export default function Community() {
  const [communities, setCommunities] = useState<CommunityType[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityType | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Form states
  const [newCommunity, setNewCommunity] = useState<CreateCommunityData>({
    name: '',
    description: '',
    category: 'FPS',
    image_url: ''
  });

  const [newPost, setNewPost] = useState<CreatePostData>({
    title: '',
    content: '',
    image_url: '',
    author: 'Anonymous'
  });

  const categories = ['All', 'FPS', 'RPG', 'Sandbox', 'Racing', 'Indie', 'Esports'];

  // Fetch communities on component mount
  useEffect(() => {
    fetchCommunities();
  }, []);

  // Fetch posts when community is selected
  useEffect(() => {
    if (selectedCommunity) {
      fetchPosts(selectedCommunity.id);
    }
  }, [selectedCommunity]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const fetchedCommunities = await communityApi.getCommunities();
      setCommunities(fetchedCommunities);
      setError(null);
    } catch (err) {
      setError('Failed to load communities');
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (communityId: number) => {
    try {
      setLoading(true);
      const fetchedPosts = await communityApi.getCommunityPosts(communityId);
      setPosts(fetchedPosts);
      setError(null);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunity.name.trim() || !newCommunity.description.trim()) return;

    try {
      setLoading(true);
      await communityApi.createCommunity(newCommunity);
      setNewCommunity({ name: '', description: '', category: 'FPS', image_url: '' });
      setShowCreateCommunity(false);
      await fetchCommunities(); // Refresh communities
    } catch (err) {
      setError('Failed to create community');
      console.error('Error creating community:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunity || !newPost.title.trim() || !newPost.content.trim()) return;

    try {
      setLoading(true);
      await communityApi.createPost(selectedCommunity.id, newPost);
      setNewPost({ title: '', content: '', image_url: '', author: 'Anonymous' });
      setShowCreatePost(false);
      await fetchPosts(selectedCommunity.id); // Refresh posts
      
      // Update community post count
      setCommunities(prev => prev.map(c => 
        c.id === selectedCommunity.id 
          ? { ...c, post_count: c.post_count + 1 }
          : c
      ));
      setSelectedCommunity(prev => prev ? { ...prev, post_count: prev.post_count + 1 } : null);
    } catch (err) {
      setError('Failed to create post');
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedCommunity) {
    return (
      <div className="min-h-screen text-foreground relative overflow-hidden">
        <NetworkBackground />
        
        <div className="relative z-10 min-h-screen">
          <Header />

          <main className="max-w-7xl mx-auto px-6 py-12 relative z-20">
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedCommunity(null);
                setPosts([]);
              }}
              className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-jost">Back to Communities</span>
            </button>

            {/* Community Header */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden mb-8 shadow-[0_4px_30px_-5px_rgba(0,0,0,0.4)]">
              <div className="relative h-32 bg-gradient-to-r from-accent/20 to-purple-500/20">
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
              <div className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 -mt-16 relative z-10 rounded-xl overflow-hidden border-4 border-white/20 shadow-xl bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center">
                    {selectedCommunity.image_url ? (
                      <img 
                        src={resolveImageUrl(selectedCommunity.image_url)} 
                        alt={selectedCommunity.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-black font-bold text-2xl">
                        {selectedCommunity.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <h1 className="text-white font-montserrat text-3xl md:text-4xl font-bold tracking-wider uppercase mb-2">
                      {selectedCommunity.name}
                    </h1>
                    <p className="text-white/80 text-lg mb-4 leading-relaxed">{selectedCommunity.description}</p>
                    <div className="flex items-center gap-6 text-white/60">
                      <span className="font-jost">{selectedCommunity.member_count} members</span>
                      <span className="font-jost">{selectedCommunity.post_count} posts</span>
                      <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-sm font-jost uppercase tracking-wide">
                        {selectedCommunity.category}
                      </span>
                    </div>
                  </div>
                  <button className="bg-accent text-black font-jost font-bold px-6 py-3 rounded-lg uppercase tracking-wider hover:bg-accent/90 transition-colors">
                    Join Community
                  </button>
                </div>
              </div>
            </div>

            {/* Create Post Button */}
            <div className="mb-8">
              <button
                onClick={() => setShowCreatePost(!showCreatePost)}
                className="bg-accent text-black font-jost font-bold px-6 py-3 rounded-lg uppercase tracking-wider hover:bg-accent/90 transition-colors"
              >
                {showCreatePost ? 'Cancel' : 'Create New Post'}
              </button>
            </div>

            {/* Create Post Form */}
            {showCreatePost && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8 shadow-[0_4px_30px_-5px_rgba(0,0,0,0.4)]">
                <h3 className="text-white font-montserrat text-xl font-bold tracking-wider uppercase mb-4">Create New Post</h3>
                <form onSubmit={handleCreatePost}>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                      placeholder="Post title..."
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-white/40 font-jost focus:outline-none focus:ring-2 focus:ring-accent/70 focus:border-accent/70 transition"
                      required
                    />
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                      placeholder="Share your thoughts, tips, or experiences..."
                      rows={4}
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-white/40 font-jost focus:outline-none focus:ring-2 focus:ring-accent/70 focus:border-accent/70 transition resize-none"
                      required
                    />
                    <div className="flex gap-4">
                      <input
                        type="url"
                        value={newPost.image_url || ''}
                        onChange={(e) => setNewPost({...newPost, image_url: e.target.value})}
                        placeholder="Image URL (optional)"
                        className="flex-1 bg-black/40 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-white/40 font-jost focus:outline-none focus:ring-2 focus:ring-accent/70 focus:border-accent/70 transition"
                      />
                      <input
                        type="text"
                        value={newPost.author || ''}
                        onChange={(e) => setNewPost({...newPost, author: e.target.value})}
                        placeholder="Your name (optional)"
                        className="flex-1 bg-black/40 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-white/40 font-jost focus:outline-none focus:ring-2 focus:ring-accent/70 focus:border-accent/70 transition"
                      />
                      <button 
                        type="submit"
                        disabled={loading}
                        className="bg-accent text-black font-jost font-bold px-6 py-3 rounded-lg uppercase tracking-wider hover:bg-accent/90 transition-colors whitespace-nowrap disabled:opacity-50"
                      >
                        {loading ? 'Posting...' : 'Create Post'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-100 px-6 py-4 rounded-lg mb-8">
                {error}
              </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-6">
              {loading && posts.length === 0 ? (
                <div className="text-center text-white/60 py-12">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  Loading posts...
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center text-white/60 py-12">
                  <p className="text-lg font-jost">No posts yet. Be the first to post!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <article key={post.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-[0_4px_30px_-5px_rgba(0,0,0,0.4)] hover:bg-white/8 transition-colors">
                    <div className="p-6">
                      {/* Post Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-accent to-purple-400 rounded-full flex items-center justify-center">
                          <span className="text-black font-bold text-sm">
                            {post.author.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-jost font-semibold">{post.author}</h4>
                          <p className="text-white/50 text-sm font-jost">{formatTimeAgo(post.created_at)}</p>
                        </div>
                      </div>

                      {/* Post Content */}
                      <h3 className="text-white font-montserrat text-xl font-bold tracking-wide mb-3">{post.title}</h3>
                      <p className="text-white/90 font-jost leading-relaxed mb-4 whitespace-pre-line">{post.content}</p>

                      {/* Post Image */}
                      {post.image_url && (
                        <div className="mb-4 -mx-6">
                          <img 
                            src={resolveImageUrl(post.image_url)} 
                            alt="Post content" 
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                        <button className="flex items-center gap-2 text-white/60 hover:text-accent transition-colors group">
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="font-jost">{post.likes_count} likes</span>
                        </button>
                        
                        <button className="flex items-center gap-2 text-white/60 hover:text-accent transition-colors group">
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="font-jost">{post.comments_count} comments</span>
                        </button>

                        <button className="flex items-center gap-2 text-white/60 hover:text-accent transition-colors group ml-auto">
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                          <span className="font-jost">Share</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground relative overflow-hidden">
      <NetworkBackground />
      
      <div className="relative z-10 min-h-screen">
        <Header />

        <main className="max-w-7xl mx-auto px-6 py-12 relative z-20">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-white font-montserrat text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider uppercase mb-6">
              Communities
            </h1>
            <p className="text-white/80 font-inter text-xl max-w-2xl mx-auto">
              Join gaming communities, share experiences, and connect with players worldwide
            </p>
          </div>

          {/* Create Community Button */}
          <div className="text-center mb-8">
            <button
              onClick={() => setShowCreateCommunity(!showCreateCommunity)}
              className="bg-accent text-black font-jost font-bold px-8 py-4 rounded-lg uppercase tracking-wider hover:bg-accent/90 transition-colors"
            >
              {showCreateCommunity ? 'Cancel' : 'Create New Community'}
            </button>
          </div>

          {/* Create Community Form */}
          {showCreateCommunity && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8 shadow-[0_4px_30px_-5px_rgba(0,0,0,0.4)] max-w-2xl mx-auto">
              <h3 className="text-white font-montserrat text-xl font-bold tracking-wider uppercase mb-4 text-center">Create New Community</h3>
              <form onSubmit={handleCreateCommunity}>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newCommunity.name}
                    onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                    placeholder="Community name (e.g., Call of Duty Zone)"
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-white/40 font-jost focus:outline-none focus:ring-2 focus:ring-accent/70 focus:border-accent/70 transition"
                    required
                  />
                  <textarea
                    value={newCommunity.description}
                    onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
                    placeholder="Describe your community..."
                    rows={3}
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-white/40 font-jost focus:outline-none focus:ring-2 focus:ring-accent/70 focus:border-accent/70 transition resize-none"
                    required
                  />
                <div className="flex flex-col gap-2">
  <label className="text-white/70 text-sm">Community Image (optional)</label>
  <div className="flex items-center gap-2">
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const formData = new FormData();
          formData.append('image', file);
          
          setLoading(true);
          fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData,
          })
            .then(res => res.json())
            .then(data => {
              setNewCommunity({...newCommunity, image_url: data.url});
              setError(null);
            })
            .catch(err => {
              console.error('Error uploading image:', err);
              setError('Failed to upload image');
            })
            .finally(() => setLoading(false));
        }
      }}
      className="hidden" 
      id="communityImageUpload"
    />
    <label 
      htmlFor="communityImageUpload"
      className="flex-1 bg-black/40 border border-white/15 rounded-lg px-4 py-3 text-white/60 font-jost cursor-pointer hover:bg-black/50 transition flex items-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {newCommunity.image_url ? 'Image selected' : 'Choose image...'}
    </label>
    {newCommunity.image_url && (
      <button
        type="button"
        onClick={() => setNewCommunity({...newCommunity, image_url: ''})}
        className="bg-red-500/20 hover:bg-red-500/30 text-red-100 p-3 rounded-lg transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
  {newCommunity.image_url && (
    <div className="mt-2 relative h-32 w-32 rounded-lg overflow-hidden border-2 border-white/20">
      <img 
        src={resolveImageUrl(newCommunity.image_url)}
        alt="Preview" 
        className="w-full h-full object-cover"
      />
    </div>
  )}
</div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-accent text-black font-jost font-bold px-6 py-3 rounded-lg uppercase tracking-wider hover:bg-accent/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Community'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/40 font-jost focus:outline-none focus:ring-2 focus:ring-accent/70 focus:border-accent/70 transition shadow-[0_4px_30px_-5px_rgba(0,0,0,0.4)]"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-4 rounded-2xl font-jost font-medium transition-all duration-300 shadow-[0_4px_30px_-5px_rgba(0,0,0,0.4)] ${
                    selectedCategory === category
                      ? 'bg-accent text-black'
                      : 'bg-white/5 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 px-6 py-4 rounded-lg mb-8 text-center">
              {error}
            </div>
          )}

          {/* Communities Grid */}
          {loading && communities.length === 0 ? (
            <div className="text-center text-white/60 py-12">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              Loading communities...
            </div>
            
          ) : filteredCommunities.length === 0 ? (
            <div className="text-center text-white/60 py-12">
              <p className="text-lg font-jost mb-4">
                {communities.length === 0 ? 'No communities yet. Create the first one!' : 'No communities match your search.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCommunities.map((community) => (
                <div
                  key={community.id}
                  onClick={() => setSelectedCommunity(community)}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:bg-white/10 transition-all duration-300 shadow-[0_4px_30px_-5px_rgba(0,0,0,0.4)] hover:scale-105 hover:shadow-[0_8px_40px_-5px_rgba(0,0,0,0.6)]"
                >
                  {/* Community Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-accent/20 to-purple-500/20">
                    {community.image_url ? (
                      <img 
                        src={resolveImageUrl(community.image_url)} 
                        alt={community.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">
                          {community.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-accent/90 text-black px-3 py-1 rounded-full text-sm font-jost font-bold uppercase tracking-wide">
                        {community.category}
                      </span>
                    </div>
                  </div>

                  {/* Community Info */}
                  <div className="p-6">
                    <h3 className="text-white font-montserrat text-xl font-bold tracking-wide mb-3">
                      {community.name}
                    </h3>
                    <p className="text-white/70 font-jost leading-relaxed mb-4 line-clamp-2">
                      {community.description}
                    </p>

                    {/* Community Stats */}
                    <div className="flex justify-between items-center text-white/60 text-sm border-t border-white/10 pt-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                        <span className="font-jost">{community.member_count.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="font-jost">{community.post_count} posts</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}
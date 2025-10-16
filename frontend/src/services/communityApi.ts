const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface Community {
  id: number;
  name: string;
  description: string;
  category: string;
  image_url?: string;
  member_count: number;
  post_count: number;
  created_at: string;
  is_member?: boolean;
  role?: string | null;
}

export interface Post {
  id: number;
  community_id: number;
  title: string;
  content: string;
  image_url?: string;
  author: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  is_liked?: boolean;
}

export interface CreateCommunityData {
  name: string;
  description: string;
  category: string;
  image_url?: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  image_url?: string;
}

// Helper to get auth headers (optional for GET requests)
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Community API functions
export const communityApi = {
  // Get all communities (with auth for user flags)
  async getCommunities(): Promise<Community[]> {
    const response = await fetch(`${API_BASE_URL}/communities`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch communities');
    }
    const data = await response.json();
    if (!data.communities || !Array.isArray(data.communities)) {
      throw new Error('Invalid response structure for communities');
    }
  return data.communities;
  },

  // Create new community (auth required)
  async createCommunity(communityData: CreateCommunityData): Promise<{ id: number; message: string }> {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('User is not authenticated');

    const response = await fetch(`${API_BASE_URL}/communities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(communityData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create community');
    }
    return response.json();
  },

  // Get community detail (with auth for user flags)
  async getCommunity(id: number): Promise<Community> {
    const response = await fetch(`${API_BASE_URL}/communities/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch community');
    }
    const data = await response.json();
    if (!data.community) {
      throw new Error('Invalid response structure for community');
    }
    return data.community;
  },

  // Join community (auth required)
  async joinCommunity(id: number): Promise<{ message: string }> {
    const token = localStorage.getItem('accessToken');
    console.log('joinCommunity - token from localStorage:', token);
    if (!token) throw new Error('User is not authenticated');

    console.log('joinCommunity - sending request to:', `${API_BASE_URL}/communities/${id}/join`);
    const response = await fetch(`${API_BASE_URL}/communities/${id}/join`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('joinCommunity - response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('joinCommunity - error data:', errorData);
      throw new Error(errorData.message || 'Failed to join community');
    }
    return response.json();
  },

  // Leave community (auth required)
  async leaveCommunity(id: number): Promise<{ message: string }> {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('User is not authenticated');

    const response = await fetch(`${API_BASE_URL}/communities/${id}/join`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to leave community');
    }
    return response.json();
  },

  // Get posts for a community (with auth for is_liked)
  async getCommunityPosts(communityId: number): Promise<Post[]> {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/posts`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch posts');
    }
    const data = await response.json();
    if (!data.posts || !Array.isArray(data.posts)) {
      throw new Error('Invalid response structure for posts');
    }
    return data.posts;
  },

  // Create post in community (auth required)
  async createPost(communityId: number, postData: CreatePostData): Promise<{ id: number; message: string }> {
    const token = localStorage.getItem('accessToken');
    console.log('createPost - token from localStorage:', token);
    if (!token) throw new Error('User is not authenticated');

    console.log('createPost - sending request to:', `${API_BASE_URL}/communities/${communityId}/posts`);
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });
    console.log('createPost - response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('createPost - error data:', errorData);
      throw new Error(errorData.message || 'Failed to create post');
    }
    return response.json();
  },

  // Like a post (auth required)
  async likePost(postId: number): Promise<{ message: string }> {
    const token = localStorage.getItem('accessToken');
    console.log('likePost - token from localStorage:', token);
    if (!token) throw new Error('User is not authenticated');

    console.log('likePost - sending request to:', `${API_BASE_URL}/posts/${postId}/like`);
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('likePost - response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('likePost - error data:', errorData);
      throw new Error(errorData.message || 'Failed to like post');
    }
    return response.json();
  },

  // Unlike a post (auth required)
  async unlikePost(postId: number): Promise<{ message: string }> {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('User is not authenticated');

    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to unlike post');
    }
    return response.json();
  }
};
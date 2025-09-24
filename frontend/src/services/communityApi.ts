const API_BASE_URL = 'http://localhost:3000/api';

export interface Community {
  id: number;
  name: string;
  description: string;
  category: string;
  image_url?: string;
  member_count: number;
  post_count: number;
  created_at: string;
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
  author?: string;
}

// Community API functions
export const communityApi = {
  // Get all communities
  async getCommunities(): Promise<Community[]> {
    const response = await fetch(`${API_BASE_URL}/communities`);
    if (!response.ok) throw new Error('Failed to fetch communities');
    const data = await response.json();
    return data.communities;
  },

  // Create new community
  async createCommunity(communityData: CreateCommunityData): Promise<{ id: number; message: string }> {
    const response = await fetch(`${API_BASE_URL}/communities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(communityData),
    });
    if (!response.ok) throw new Error('Failed to create community');
    return response.json();
  },

  // Get posts for a community
  async getCommunityPosts(communityId: number): Promise<Post[]> {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/posts`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    const data = await response.json();
    return data.posts;
  },

  // Create post in community
  async createPost(communityId: number, postData: CreatePostData): Promise<{ id: number; message: string }> {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  },
};
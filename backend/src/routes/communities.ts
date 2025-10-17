import { Router } from "express";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";
import { db } from "../config/database.js";

const router = Router();

// Get all communities (optional auth for user flags)
router.get("/communities", optionalAuth, async (req, res) => {
  try {
    const userId = req.userId;
    let query = `
      SELECT id, name, description, category, image_url, banner_image_url, member_count, post_count, created_at
      FROM communities
      ORDER BY created_at DESC
    `;
    const [communities] = await db.execute(query);

    // If user is authenticated, add membership flags
    if (userId) {
      for (const community of communities as any[]) {
        const [membership] = await db.execute(
          'SELECT role FROM community_members WHERE user_id = ? AND community_id = ?',
          [userId, community.id]
        );
        community.is_member = (membership as any[]).length > 0;
        community.role = (membership as any[])[0]?.role || null;
      }
    }

    res.json({ communities });
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
});

// Get single community (optional auth)
router.get("/communities/:id", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const [communities] = await db.execute(
      'SELECT id, name, description, category, image_url, banner_image_url, member_count, post_count, created_at FROM communities WHERE id = ?',
      [id]
    );

    if ((communities as any[]).length === 0) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const community = (communities as any[])[0];

    // Add membership info if authenticated
    if (userId) {
      const [membership] = await db.execute(
        'SELECT role FROM community_members WHERE user_id = ? AND community_id = ?',
        [userId, community.id]
      );
      community.is_member = (membership as any[]).length > 0;
      community.role = (membership as any[])[0]?.role || null;
    }

    res.json({ community });
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({ error: 'Failed to fetch community' });
  }
});

// Create community (auth required)
router.post("/communities", authenticateToken, async (req, res) => {
  try {
    const { name, description, category, image_url, banner_image_url } = req.body;
    const userId = req.userId;

    console.log('userId:', userId);  // Debug log
    console.log('Token:', req.headers.authorization);  // Debug log

    if (!name || !description || !category) {
      return res.status(400).json({ error: 'Name, description, and category are required' });
    }

    const [result] = await db.execute(
      'INSERT INTO communities (name, description, category, image_url, banner_image_url) VALUES (?, ?, ?, ?, ?)',
      [name, description, category, image_url || null, banner_image_url || null]
    );
    const communityId = (result as any).insertId;

    // Add creator as member with admin role
    await db.execute(
      'INSERT INTO community_members (user_id, community_id, role) VALUES (?, ?, ?)',
      [userId, communityId, 'admin']
    );

    res.status(201).json({ id: communityId, message: 'Community created successfully' });
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ error: 'Failed to create community' });
  }
});

// Join community (auth required)
router.post("/communities/:id/join", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log('Join community - userId:', userId, 'communityId:', id);

    // Check if community exists
    const [communities] = await db.execute('SELECT id FROM communities WHERE id = ?', [id]);
    console.log('Community exists check:', (communities as any[]).length > 0);
    if ((communities as any[]).length === 0) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if already member
    const [existing] = await db.execute(
      'SELECT 1 FROM community_members WHERE user_id = ? AND community_id = ?',
      [userId, id]
    );
    console.log('Already member check:', (existing as any[]).length > 0);
    if ((existing as any[]).length > 0) {
      return res.status(400).json({ error: 'Already a member of this community' });
    }

    // Add membership
    console.log('Inserting membership...');
    await db.execute(
      'INSERT INTO community_members (user_id, community_id, role) VALUES (?, ?, ?)',
      [userId, id, 'member']
    );

    // Update member count
    console.log('Updating member count...');
    await db.execute(
      'UPDATE communities SET member_count = member_count + 1 WHERE id = ?',
      [id]
    );

    res.json({ message: 'Joined community successfully' });
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ error: 'Failed to join community' });
  }
});

// Leave community (auth required)
router.delete("/communities/:id/join", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Remove membership
    const [result] = await db.execute(
      'DELETE FROM community_members WHERE user_id = ? AND community_id = ?',
      [userId, id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(400).json({ error: 'Not a member of this community' });
    }

    // Update member count
    await db.execute(
      'UPDATE communities SET member_count = member_count - 1 WHERE id = ?',
      [id]
    );

    res.json({ message: 'Left community successfully' });
  } catch (error) {
    console.error('Error leaving community:', error);
    res.status(500).json({ error: 'Failed to leave community' });
  }
});

// Get community posts (optional auth for like flags)
router.get("/communities/:id/posts", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    // const userId = req.userId;

    const [posts] = await db.execute(
      'SELECT id, community_id, user_id, title, content, image_url, author, likes_count, comments_count, created_at FROM community_posts WHERE community_id = ? ORDER BY created_at DESC',
      [id]
    );

    // Add is_liked flag if authenticated
    // if (userId) {
    //   for (const post of posts as any[]) {
    //     const [likes] = await db.execute(
    //       'SELECT id FROM post_likes WHERE user_id = ? AND post_id = ?',
    //       [userId, post.id]
    //     );
    //     post.is_liked = (likes as any[]).length > 0;
    //   }
    // }

    res.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create post (auth required)
router.post("/communities/:id/posts", authenticateToken, async (req, res) => {
  console.log('🚀🚀🚀 CREATE POST ROUTE CALLED - THIS SHOULD SHOW 🚀🚀🚀');
  try {
    const { id } = req.params;
    const { title, content, image_url } = req.body;
    const userId = req.userId;

    console.log('🔥 USER ID:', userId, 'COMMUNITY ID:', id);
    console.log('Create post - req.user:', req.user);

    if (!userId) {
      console.log('❌ NO USER ID - AUTH FAILED');
      return res.status(401).json({ error: 'Authentication failed' });
    }

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Check if user is member
    // const [membership] = await db.execute(
    //   'SELECT role FROM community_members WHERE user_id = ? AND community_id = ?',
    //   [userId, id]
    // );

    // if ((membership as any[]).length === 0) {
    //   return res.status(403).json({ error: 'Must be a member to post' });
    // }

    // Get user info for author name
    console.log('About to query user with userId:', userId);
    let authorName = 'Anonymous';
    try {
      const [userRows] = await db.execute(
        'SELECT username, display_name FROM users WHERE id = ?',
        [userId]
      );
      console.log('User query result:', userRows);
      const user = (userRows as any[])[0];
      console.log('User object:', user);
      authorName = user?.display_name || user?.username || 'Anonymous';
      console.log('Final authorName:', authorName);
    } catch (dbError) {
      console.error('Database query error:', dbError);
      authorName = 'Anonymous';
    }
    
    console.log('Create post - user from DB:', authorName);
    console.log('Create post - authorName:', authorName);

    const [result] = await db.execute(
      'INSERT INTO community_posts (community_id, user_id, title, content, image_url, author) VALUES (?, ?, ?, ?, ?, ?)',
      [id, userId, title, content, image_url || null, authorName]
    );

    const postId = (result as any).insertId;

    // Update post count
    await db.execute(
      'UPDATE communities SET post_count = post_count + 1 WHERE id = ?',
      [id]
    );

    res.status(201).json({ id: postId, message: 'Post created successfully' });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Like post (auth required)
router.post("/posts/:postId/like", authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    console.log('Like post - userId:', userId, 'postId:', postId);

    // Check if already liked
    const [existing] = await db.execute(
      'SELECT 1 FROM post_likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );
    console.log('Already liked check:', (existing as any[]).length > 0);
    if ((existing as any[]).length > 0) {
      return res.status(400).json({ error: 'Already liked this post' });
    }

    // Add like
    console.log('Inserting like...');
    await db.execute(
      'INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)',
      [userId, postId]
    );

    // Update likes count
    console.log('Updating likes count...');
    await db.execute(
      'UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = ?',
      [postId]
    );

    res.json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Unlike post (auth required)
router.delete("/posts/:postId/like", authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    // Remove like
    const [result] = await db.execute(
      'DELETE FROM post_likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(400).json({ error: 'Post not liked' });
    }

    // Update likes count
    await db.execute(
      'UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = ?',
      [postId]
    );

    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
});

// Get comments for a post
router.get("/communities/:id/posts/:postId/comments", async (req, res) => {
  console.log('GET comments route called for postId:', req.params.postId);
  try {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;
    const offset = parseInt(req.query.offset as string) || 0;
    const userId = req.userId; // May be undefined if not authenticated

    let query = `
      SELECT id, post_id, parent_comment_id, user_id, content, image_url, author, likes_count, created_at
      FROM community_comments 
      WHERE post_id = ? 
      ORDER BY created_at ASC 
      LIMIT ? OFFSET ?
    `;
    let params = [postId, limit + 1, offset];

    const [comments] = await db.execute(query, params);

    const commentsArray = comments as any[];
    
    // Add is_liked field if user is authenticated
    if (userId) {
      for (const comment of commentsArray) {
        const [liked] = await db.execute(
          'SELECT id FROM community_comment_likes WHERE comment_id = ? AND user_id = ?',
          [comment.id, userId]
        );
        comment.is_liked = (liked as any[]).length > 0;
      }
    } else {
      // Set is_liked to false for all comments if not authenticated
      commentsArray.forEach(comment => comment.is_liked = false);
    }

    const hasMore = commentsArray.length > limit;
    const commentsToReturn = hasMore ? commentsArray.slice(0, limit) : commentsArray;

    console.log('Comments fetched:', commentsToReturn.length, 'hasMore:', hasMore);
    res.json({ comments: commentsToReturn, hasMore });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create comment on a post (auth required)
router.post("/communities/:id/posts/:postId/comments", authenticateToken, async (req, res) => {
  console.log('POST comment route called');
  try {
    const { postId } = req.params;
    const { content, parent_comment_id, image_url } = req.body;
    const userId = req.userId;

    console.log('postId:', postId, 'content:', content, 'parent_comment_id:', parent_comment_id, 'userId:', userId);

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Get user info for author name
    let authorName = 'Anonymous';
    try {
      const [userRows] = await db.execute(
        'SELECT username, display_name FROM users WHERE id = ?',
        [userId]
      );
      const user = (userRows as any[])[0];
      authorName = user?.display_name || user?.username || 'Anonymous';
    } catch (dbError) {
      console.error('Database query error:', dbError);
      authorName = 'Anonymous';
    }

    const [result] = await db.execute(
      'INSERT INTO community_comments (post_id, parent_comment_id, user_id, content, image_url, author) VALUES (?, ?, ?, ?, ?, ?)',
      [postId, parent_comment_id || null, userId, content, image_url || null, authorName]
    );

    const commentId = (result as any).insertId;

    // Update comments count
    await db.execute(
      'UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = ?',
      [postId]
    );

    res.status(201).json({ id: commentId, message: 'Comment created successfully' });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Like a comment
router.post("/communities/:id/posts/:postId/comments/:commentId/like", authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    // Check if already liked
    const [existing] = await db.execute(
      'SELECT id FROM community_comment_likes WHERE comment_id = ? AND user_id = ?',
      [commentId, userId]
    );

    if ((existing as any[]).length > 0) {
      return res.status(400).json({ error: 'Already liked' });
    }

    // Insert like
    await db.execute(
      'INSERT INTO community_comment_likes (comment_id, user_id) VALUES (?, ?)',
      [commentId, userId]
    );

    // Increment likes_count
    await db.execute(
      'UPDATE community_comments SET likes_count = likes_count + 1 WHERE id = ?',
      [commentId]
    );

    res.status(200).json({ message: 'Comment liked' });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ error: 'Failed to like comment' });
  }
});

// Unlike a comment
router.delete("/communities/:id/posts/:postId/comments/:commentId/like", authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    // Delete like
    const [result] = await db.execute(
      'DELETE FROM community_comment_likes WHERE comment_id = ? AND user_id = ?',
      [commentId, userId]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(400).json({ error: 'Not liked' });
    }

    // Decrement likes_count
    await db.execute(
      'UPDATE community_comments SET likes_count = likes_count - 1 WHERE id = ?',
      [commentId]
    );

    res.status(200).json({ message: 'Comment unliked' });
  } catch (error) {
    console.error('Error unliking comment:', error);
    res.status(500).json({ error: 'Failed to unlike comment' });
  }
});

// Delete a comment (admin only)
router.delete("/communities/:id/posts/:postId/comments/:commentId", authenticateToken, async (req, res) => {
  try {
    const { id: communityId, commentId } = req.params;
    const userId = req.userId;

    // Check if user is admin of the community
    const [adminCheck] = await db.execute(
      'SELECT role FROM community_members WHERE user_id = ? AND community_id = ? AND role = ?',
      [userId, communityId, 'admin']
    );

    if ((adminCheck as any[]).length === 0) {
      return res.status(403).json({ error: 'Only community admins can delete comments' });
    }

    // Check if comment exists and belongs to a post in this community
    const [commentCheck] = await db.execute(
      'SELECT c.id, p.community_id FROM community_comments c JOIN community_posts p ON c.post_id = p.id WHERE c.id = ? AND p.community_id = ?',
      [commentId, communityId]
    );

    if ((commentCheck as any[]).length === 0) {
      return res.status(404).json({ error: 'Comment not found in this community' });
    }

    // Delete comment likes first (due to foreign key constraint)
    await db.execute('DELETE FROM community_comment_likes WHERE comment_id = ?', [commentId]);

    // Delete the comment
    const [result] = await db.execute('DELETE FROM community_comments WHERE id = ?', [commentId]);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Update comments count on the post
    await db.execute(
      'UPDATE community_posts SET comments_count = comments_count - 1 WHERE id = (SELECT post_id FROM community_comments WHERE id = ?)',
      [commentId]
    );

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;

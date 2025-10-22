import { Router } from "express";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";
import { db } from "../config/database.js";
import { normalizeUploadCollection, normalizeUploadFields, toRelativeUploadPath } from "../utils/uploads.js";

const router = Router();

const normalizeCommunityRecord = (community: any) =>
  normalizeUploadFields(community, ["image_url", "banner_image_url"]);

// Get all communities (optional auth for user flags)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const query = `
      SELECT id, name, description, category, image_url, banner_image_url, member_count, post_count, created_at
      FROM communities
      ORDER BY created_at DESC
    `;
    const [communities] = await db.execute(query);
    const communityRows = Array.isArray(communities) ? [...(communities as any[])] : [];

    if (userId && communityRows.length > 0) {
      const communityIds = communityRows.map((community) => Number(community.id));
      const membershipMap = new Map<number, string | null>();

      if (communityIds.length > 0) {
        const placeholders = communityIds.map(() => "?").join(",");
        const [memberships] = await db.execute(
          `SELECT community_id, role
             FROM community_members
            WHERE user_id = ?
              AND community_id IN (${placeholders})`,
          [userId, ...communityIds]
        );
        for (const membership of memberships as any[]) {
          membershipMap.set(Number(membership.community_id), membership.role ?? null);
        }
      }
      for (const community of communityRows) {
        const id = Number(community.id);
        const role = membershipMap.get(id) ?? null;
        community.is_member = membershipMap.has(id);
        community.role = role;
      }
    } else {
      for (const community of communityRows) {
        community.is_member = false;
        community.role = null;
      }
    }

    communityRows.forEach(normalizeCommunityRecord);

    res.json({ communities: communityRows });
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
});

// Get single community (optional auth)
router.get("/:id", optionalAuth, async (req, res) => {
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

    normalizeCommunityRecord(community);

    res.json({ community });
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({ error: 'Failed to fetch community' });
  }
});

// Create community (auth required)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, description, category, image_url, banner_image_url } = req.body;
    const userId = req.userId;

    console.log('userId:', userId);  // Debug log
    console.log('Token:', req.headers.authorization);  // Debug log

    if (!name || !description || !category) {
      return res.status(400).json({ error: 'Name, description, and category are required' });
    }

    const normalizedImageUrl = toRelativeUploadPath(image_url);
    const normalizedBannerUrl = toRelativeUploadPath(banner_image_url);

    const [result] = await db.execute(
      'INSERT INTO communities (name, description, category, image_url, banner_image_url) VALUES (?, ?, ?, ?, ?)',
      [name, description, category, normalizedImageUrl || null, normalizedBannerUrl || null]
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
router.post("/:id/join", authenticateToken, async (req, res) => {
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
router.delete("/:id/join", authenticateToken, async (req, res) => {
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
router.get("/:id/posts", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    // const userId = req.userId;

    const [posts] = await db.execute(
      'SELECT id, community_id, user_id, title, content, image_url, author, likes_count, comments_count, created_at FROM community_posts WHERE community_id = ? ORDER BY created_at DESC',
      [id]
    );

    const postRows = Array.isArray(posts) ? [...(posts as any[])] : [];
    normalizeUploadCollection(postRows, ["image_url"]);

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

    res.json({ posts: postRows });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create post (auth required)
router.post("/:id/posts", authenticateToken, async (req, res) => {
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

    const normalizedImageUrl = toRelativeUploadPath(image_url);

    const [result] = await db.execute(
      'INSERT INTO community_posts (community_id, user_id, title, content, image_url, author) VALUES (?, ?, ?, ?, ?, ?)',
      [id, userId, title, content, normalizedImageUrl || null, authorName]
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

// Delete post (author or admin)
router.delete("/:id/posts/:postId", authenticateToken, async (req, res) => {
  try {
    const { id: communityId, postId } = req.params;
    const userId = req.userId;

    const [postRows] = await db.execute(
      'SELECT id, community_id, user_id FROM community_posts WHERE id = ? AND community_id = ?',
      [postId, communityId]
    );

    if ((postRows as any[]).length === 0) {
      return res.status(404).json({ error: 'Post not found in this community' });
    }

    const post = (postRows as any[])[0];
    const postOwnerId = post.user_id !== null ? Number(post.user_id) : null;
    const isOwner = postOwnerId !== null && postOwnerId === Number(userId);

    let isAdmin = false;
    if (!isOwner) {
      const [adminCheck] = await db.execute(
        'SELECT 1 FROM community_members WHERE user_id = ? AND community_id = ? AND role = ?',
        [userId, communityId, 'admin']
      );
      isAdmin = (adminCheck as any[]).length > 0;
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only the post owner or a community admin can delete this post' });
      }
    }

    const [commentRows] = await db.execute(
      'SELECT id FROM community_comments WHERE post_id = ?',
      [postId]
    );
    const commentIds = (commentRows as any[]).map((row: any) => Number(row.id));

    if (commentIds.length > 0) {
      const commentPlaceholders = commentIds.map(() => "?").join(",");
      await db.execute(
        `DELETE FROM community_comment_likes WHERE comment_id IN (${commentPlaceholders})`,
        commentIds
      );
      await db.execute(
        `DELETE FROM community_comments WHERE id IN (${commentPlaceholders})`,
        commentIds
      );
    }

    await db.execute('DELETE FROM post_likes WHERE post_id = ?', [postId]);

    const [deleteResult] = await db.execute(
      'DELETE FROM community_posts WHERE id = ?',
      [postId]
    );

    if ((deleteResult as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await db.execute(
      'UPDATE communities SET post_count = GREATEST(post_count - 1, 0) WHERE id = ?',
      [communityId]
    );

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Like post (auth required)
async function ensurePostInCommunity(postId: number, communityId?: number) {
  if (!communityId) {
    return true;
  }

  const [rows] = await db.execute(
    'SELECT 1 FROM community_posts WHERE id = ? AND community_id = ?',
    [postId, communityId]
  );
  return (rows as any[]).length > 0;
}

async function handleLikePost(req: any, res: any) {
  try {
    const { postId } = req.params;
    const communityIdRaw = req.params.id;
    const communityId = communityIdRaw ? Number(communityIdRaw) : undefined;
    const userId = req.userId;

    if (!Number.isInteger(Number(postId))) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    if (communityId !== undefined) {
      const belongs = await ensurePostInCommunity(Number(postId), communityId);
      if (!belongs) {
        return res.status(404).json({ error: 'Post not found in this community' });
      }
    }

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
}

router.post("/posts/:postId/like", authenticateToken, handleLikePost);
router.post("/:id/posts/:postId/like", authenticateToken, handleLikePost);

// Unlike post (auth required)
async function handleUnlikePost(req: any, res: any) {
  try {
    const { postId } = req.params;
    const communityIdRaw = req.params.id;
    const communityId = communityIdRaw ? Number(communityIdRaw) : undefined;
    const userId = req.userId;

    if (!Number.isInteger(Number(postId))) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    if (communityId !== undefined) {
      const belongs = await ensurePostInCommunity(Number(postId), communityId);
      if (!belongs) {
        return res.status(404).json({ error: 'Post not found in this community' });
      }
    }

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
}

router.delete("/posts/:postId/like", authenticateToken, handleUnlikePost);
router.delete("/:id/posts/:postId/like", authenticateToken, handleUnlikePost);

// Get comments for a post
router.get("/:id/posts/:postId/comments", optionalAuth, async (req, res) => {
  try {
    const communityId = Number.parseInt(req.params.id, 10);
    const postId = Number.parseInt(req.params.postId, 10);

    if (!Number.isInteger(communityId) || !Number.isInteger(postId)) {
      return res.status(400).json({ error: 'Invalid community or post ID' });
    }

    const limitParam = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
    const offsetParam = Array.isArray(req.query.offset) ? req.query.offset[0] : req.query.offset;

    const limitRaw = typeof limitParam === 'string' ? limitParam : undefined;
    const offsetRaw = typeof offsetParam === 'string' ? offsetParam : undefined;
    const parsedLimit = limitRaw !== undefined ? Number.parseInt(limitRaw, 10) : Number.NaN;
    const parsedOffset = offsetRaw !== undefined ? Number.parseInt(offsetRaw, 10) : Number.NaN;
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 50) : 5;
    const offset = Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;
    const userId = req.userId;

    const [postRows] = await db.execute(
      'SELECT id FROM community_posts WHERE id = ? AND community_id = ? LIMIT 1',
      [postId, communityId]
    );
    if ((postRows as any[]).length === 0) {
      return res.status(404).json({ error: 'Post not found in community' });
    }

    const [countRows] = await db.execute(
      'SELECT COUNT(*) AS total FROM community_comments WHERE post_id = ?',
      [postId]
    );
    const total = Number((countRows as any[])[0]?.total ?? 0);

    const commentsQuery = `
        SELECT
          pc.id,
          pc.post_id,
          pc.parent_comment_id,
          pc.user_id,
          pc.content,
          pc.image_url,
          pc.author,
          pc.likes_count,
          pc.created_at,
          u.display_name,
          u.username
        FROM community_comments pc
        LEFT JOIN users u ON u.id = pc.user_id
        WHERE pc.post_id = ?
        ORDER BY pc.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    const [comments] = await db.execute(commentsQuery, [postId]);

    const commentsArray = Array.isArray(comments) ? [...(comments as any[])] : [];

    for (const comment of commentsArray) {
      if (!comment.author) {
        comment.author = comment.display_name ?? comment.username ?? 'Anonymous';
      }
      comment.is_liked = false;
      delete comment.display_name;
      delete comment.username;
    }

    if (userId && commentsArray.length > 0) {
      const commentIds = commentsArray.map((comment) => Number(comment.id));
      const [likes] = await db.execute(
        'SELECT comment_id FROM community_comment_likes WHERE user_id = ? AND comment_id IN (?)',
        [userId, commentIds]
      );
      const likedIds = new Set<number>((likes as any[]).map((row) => Number(row.comment_id)));
      for (const comment of commentsArray) {
        comment.is_liked = likedIds.has(Number(comment.id));
      }
    }

    normalizeUploadCollection(commentsArray, ["image_url"]);

    const hasMore = offset + commentsArray.length < total;

    res.json({
      comments: commentsArray,
      total,
      limit,
      offset,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create comment on a post (auth required)
router.post("/:id/posts/:postId/comments", authenticateToken, async (req, res) => {
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

    const normalizedImageUrl = toRelativeUploadPath(image_url);

    const [result] = await db.execute(
      'INSERT INTO community_comments (post_id, parent_comment_id, user_id, content, image_url, author) VALUES (?, ?, ?, ?, ?, ?)',
      [postId, parent_comment_id || null, userId, content, normalizedImageUrl || null, authorName]
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
router.post("/:id/posts/:postId/comments/:commentId/like", authenticateToken, async (req, res) => {
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
router.delete("/:id/posts/:postId/comments/:commentId/like", authenticateToken, async (req, res) => {
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

// Delete a comment (admin or comment owner)
router.delete("/:id/posts/:postId/comments/:commentId", authenticateToken, async (req, res) => {
  try {
    const { id: communityId, commentId } = req.params;
    const userId = req.userId;

    // Check if the comment exists, belongs to this community, and capture owner info
    const [commentRows] = await db.execute(
      `SELECT c.id, c.post_id, c.user_id, c.parent_comment_id
         FROM community_comments c
         JOIN community_posts p ON c.post_id = p.id
        WHERE c.id = ? AND p.community_id = ?`,
      [commentId, communityId]
    );

    if ((commentRows as any[]).length === 0) {
      return res.status(404).json({ error: 'Comment not found in this community' });
    }

    const comment = (commentRows as any[])[0];
    const postId = Number(comment.post_id);
    const commentOwnerId = comment.user_id !== null ? Number(comment.user_id) : null;
    const isOwner = commentOwnerId !== null && commentOwnerId === Number(userId);

    let isAdmin = false;
    if (!isOwner) {
      const [adminCheck] = await db.execute(
        'SELECT 1 FROM community_members WHERE user_id = ? AND community_id = ? AND role = ?',
        [userId, communityId, 'admin']
      );
      isAdmin = (adminCheck as any[]).length > 0;
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only the comment owner or a community admin can delete this comment' });
      }
    }

    // Collect comment IDs to delete (target + any descendants)
    const idsToDelete: number[] = [Number(commentId)];
    const queue: number[] = [Number(commentId)];

    while (queue.length > 0) {
      const currentId = queue.pop()!;
      const [childRows] = await db.execute(
        'SELECT id FROM community_comments WHERE parent_comment_id = ?',
        [currentId]
      );
      for (const row of childRows as any[]) {
        const childId = Number(row.id);
        idsToDelete.push(childId);
        queue.push(childId);
      }
    }

    const placeholders = idsToDelete.map(() => "?").join(",");

    // Delete likes referencing any of the comments
    await db.execute(
      `DELETE FROM community_comment_likes WHERE comment_id IN (${placeholders})`,
      idsToDelete
    );

    // Delete the comments themselves
    const [deleteResult] = await db.execute(
      `DELETE FROM community_comments WHERE id IN (${placeholders})`,
      idsToDelete
    );

    if ((deleteResult as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Update comments count on the post
    await db.execute(
      'UPDATE community_posts SET comments_count = GREATEST(comments_count - ?, 0) WHERE id = ?',
      [idsToDelete.length, postId]
    );

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;

// Local API endpoint that simulates Supabase posts table
// This will work until you set up your actual Supabase project

export interface CommunityPost {
  id: string;
  user_id: string;
  username: string;
  user_name: string;
  user_level: string;
  avatar: string;
  message: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
}

// In-memory storage (simulates database)
let posts: CommunityPost[] = [];

export function createLocalPost(data: {
  userId: string;
  userName: string;
  username?: string;
  userLevel?: string;
  avatar?: string;
  content: string;
  timestamp?: string;
}): Promise<{ success: boolean; post: CommunityPost; message: string }> {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const post: CommunityPost = {
        id: Date.now().toString(),
        user_id: data.userId,
        username: data.username || data.userName.toLowerCase().replace(/s+/g, ''),
        user_name: data.userName,
        user_level: data.userLevel || 'Beginner',
        avatar: data.avatar || '🎸',
        message: data.content.trim(),
        timestamp: data.timestamp || new Date().toISOString(),
        likes: 0,
        comments: 0,
        shares: 0,
        created_at: new Date().toISOString()
      };

      // Add to in-memory storage
      posts.unshift(post);
      
      // Keep only last 100 posts to prevent memory issues
      if (posts.length > 100) {
        posts = posts.slice(0, 100);
      }

      resolve({
        success: true,
        post,
        message: 'Community post created successfully'
      });
    }, 500);
  });
}

// Function to get all posts (for future use)
export function getAllPosts(): CommunityPost[] {
  return [...posts];
}

// Function to get posts by user
export function getPostsByUser(userId: string): CommunityPost[] {
  return posts.filter(post => post.user_id === userId);
}

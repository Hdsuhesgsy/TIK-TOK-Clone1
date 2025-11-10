// Mock Data for TikTok Clone
export const mockData = {
    users: [
        {
            id: 1,
            username: "creative_user",
            displayName: "Creative User 🎨",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            followers: 125000,
            following: 345,
            bio: "Digital creator | Art lover | Follow for daily content ✨",
            isVerified: true,
            isFollowing: false
        },
        {
            id: 2,
            username: "nature_lover",
            displayName: "Nature Explorer 🌿",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            followers: 89000,
            following: 210,
            bio: "Capturing nature's beauty | Wildlife photographer",
            isVerified: false,
            isFollowing: true
        },
        {
            id: 3,
            username: "tech_guru",
            displayName: "Tech Guru 💻",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            followers: 456000,
            following: 89,
            bio: "Tech reviews & tutorials | Gadget enthusiast",
            isVerified: true,
            isFollowing: false
        },
        {
            id: 4,
            username: "dance_queen",
            displayName: "Dance Queen 💃",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            followers: 789000,
            following: 567,
            bio: "Professional dancer | Choreographer | Dance tutorials",
            isVerified: true,
            isFollowing: true
        }
    ],

    videos: [
        {
            id: 1,
            userId: 1,
            videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
            thumbnail: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            caption: "Check out this amazing neon effect! ✨ #art #creative #digitalart",
            sound: "Original Sound - creative_user",
            likes: 125000,
            comments: 2500,
            shares: 4500,
            views: 2500000,
            duration: 15,
            timestamp: "2024-01-15T10:30:00Z",
            isLiked: false,
            isSaved: false,
            privacy: "public",
            tags: ["art", "creative", "digitalart", "neon"],
            location: "Los Angeles, CA"
        },
        {
            id: 2,
            userId: 2,
            videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
            thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            caption: "Beautiful spring day in the park 🌸 #nature #spring #flowers",
            sound: "Nature Sounds - nature_lover",
            likes: 89000,
            comments: 1800,
            shares: 3200,
            views: 1500000,
            duration: 12,
            timestamp: "2024-01-14T08:15:00Z",
            isLiked: true,
            isSaved: false,
            privacy: "public",
            tags: ["nature", "spring", "flowers", "park"],
            location: "Central Park, NY"
        },
        {
            id: 3,
            userId: 3,
            videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-close-up-of-computer-circuit-board-1229-large.mp4",
            thumbnail: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            caption: "New gadget unboxing! This thing is amazing 🔥 #tech #gadgets #unboxing",
            sound: "Original Sound - tech_guru",
            likes: 456000,
            comments: 8900,
            shares: 12500,
            views: 5000000,
            duration: 18,
            timestamp: "2024-01-13T14:20:00Z",
            isLiked: false,
            isSaved: true,
            privacy: "public",
            tags: ["tech", "gadgets", "unboxing", "review"],
            location: "San Francisco, CA"
        },
        {
            id: 4,
            userId: 4,
            videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-dancing-1174-large.mp4",
            thumbnail: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            caption: "New dance routine! Who's trying this? 💃 #dance #choreography #tutorial",
            sound: "Popular Song - artist_name",
            likes: 789000,
            comments: 15600,
            shares: 23400,
            views: 8900000,
            duration: 21,
            timestamp: "2024-01-12T16:45:00Z",
            isLiked: true,
            isSaved: false,
            privacy: "public",
            tags: ["dance", "choreography", "tutorial", "music"],
            location: "Miami, FL"
        }
    ],

    comments: [
        {
            id: 1,
            videoId: 1,
            userId: 2,
            text: "This is absolutely stunning! 🔥",
            likes: 45,
            timestamp: "2024-01-15T11:00:00Z",
            user: {
                username: "nature_lover",
                displayName: "Nature Explorer 🌿",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
            }
        },
        {
            id: 2,
            videoId: 1,
            userId: 3,
            text: "How did you create this effect? Amazing work!",
            likes: 23,
            timestamp: "2024-01-15T11:30:00Z",
            user: {
                username: "tech_guru",
                displayName: "Tech Guru 💻",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
            }
        },
        {
            id: 3,
            videoId: 2,
            userId: 1,
            text: "So peaceful and beautiful! 🌸",
            likes: 67,
            timestamp: "2024-01-14T09:00:00Z",
            user: {
                username: "creative_user",
                displayName: "Creative User 🎨",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
            }
        }
    ],

    sounds: [
        {
            id: 1,
            name: "Original Sound - creative_user",
            author: "creative_user",
            cover: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
            duration: 15,
            usageCount: 12500
        },
        {
            id: 2,
            name: "Nature Sounds",
            author: "nature_lover",
            cover: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
            duration: 12,
            usageCount: 8900
        },
        {
            id: 3,
            name: "Popular Song",
            author: "famous_artist",
            cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
            duration: 21,
            usageCount: 456000
        }
    ],

    trends: [
        {
            id: 1,
            tag: "#digitalart",
            views: 12500000,
            videos: 45600
        },
        {
            id: 2,
            tag: "#nature",
            views: 8900000,
            videos: 23400
        },
        {
            id: 3,
            tag: "#tech",
            views: 45600000,
            videos: 123400
        },
        {
            id: 4,
            tag: "#dance",
            views: 78900000,
            videos: 56700
        }
    ],

    notifications: [
        {
            id: 1,
            type: "like",
            userId: 2,
            videoId: 1,
            text: "nature_lover liked your video",
            timestamp: "2024-01-15T11:00:00Z",
            isRead: false
        },
        {
            id: 2,
            type: "comment",
            userId: 3,
            videoId: 1,
            text: "tech_guru commented on your video",
            timestamp: "2024-01-15T11:30:00Z",
            isRead: false
        },
        {
            id: 3,
            type: "follow",
            userId: 4,
            text: "dance_queen started following you",
            timestamp: "2024-01-14T16:45:00Z",
            isRead: true
        }
    ]
};

// Current user data
export const currentUser = {
    id: 1001,
    username: "your_username",
    displayName: "Your Name",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    followers: 1234,
    following: 567,
    likes: 8900,
    bio: "This is my awesome bio! 👋",
    isVerified: false,
    videos: [1, 2], // Video IDs
    likedVideos: [2, 4],
    savedVideos: [3]
};

export default mockData;

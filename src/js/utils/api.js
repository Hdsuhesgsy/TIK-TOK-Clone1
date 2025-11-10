// API Service for TikTok Clone
import { mockData, currentUser } from '../data/mockData.js';
import { helpers } from './helpers.js';

export class ApiService {
    constructor() {
        this.baseURL = 'https://api.tiktok-clone.com/v1'; // Mock base URL
        this.token = helpers.storage.get('auth_token');
        this.isOnline = navigator.onLine;
        
        this.setupOnlineHandler();
    }

    setupOnlineHandler() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncPendingRequests();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Authentication APIs
    async login(email, password) {
        return this.mockRequest(() => {
            // Mock authentication
            if (email === 'user@example.com' && password === 'password') {
                const token = 'mock_jwt_token_' + Date.now();
                helpers.storage.set('auth_token', token);
                this.token = token;
                
                return {
                    success: true,
                    token,
                    user: currentUser
                };
            } else {
                throw new Error('Invalid credentials');
            }
        });
    }

    async register(userData) {
        return this.mockRequest(() => {
            const newUser = {
                ...userData,
                id: helpers.generateId(),
                followers: 0,
                following: 0,
                isVerified: false,
                createdAt: new Date().toISOString()
            };

            return {
                success: true,
                user: newUser
            };
        });
    }

    async logout() {
        return this.mockRequest(() => {
            helpers.storage.remove('auth_token');
            this.token = null;
            return { success: true };
        });
    }

    // Video APIs
    async getVideos(feedType = 'foryou', page = 1) {
        return this.mockRequest(() => {
            let videos = [...mockData.videos];

            if (feedType === 'following') {
                // Filter to only show followed users
                const followingIds = mockData.users
                    .filter(user => user.isFollowing)
                    .map(user => user.id);
                
                videos = videos.filter(video => followingIds.includes(video.userId));
            }

            // Add user data to videos
            videos = videos.map(video => ({
                ...video,
                user: mockData.users.find(user => user.id === video.userId)
            }));

            // Simulate pagination
            const pageSize = 5;
            const startIndex = (page - 1) * pageSize;
            const paginatedVideos = videos.slice(startIndex, startIndex + pageSize);

            return {
                videos: paginatedVideos,
                hasMore: startIndex + pageSize < videos.length,
                nextPage: page + 1
            };
        });
    }

    async getVideoById(videoId) {
        return this.mockRequest(() => {
            const video = mockData.videos.find(v => v.id == videoId);
            if (!video) {
                throw new Error('Video not found');
            }

            return {
                ...video,
                user: mockData.users.find(user => user.id === video.userId)
            };
        });
    }

    async uploadVideo(videoData) {
        return this.mockRequest(() => {
            const newVideo = {
                id: helpers.generateId(),
                userId: currentUser.id,
                videoUrl: URL.createObjectURL(videoData.file),
                thumbnail: this.generateThumbnail(videoData.file),
                caption: videoData.caption,
                sound: 'Original Sound - ' + currentUser.username,
                likes: 0,
                comments: 0,
                shares: 0,
                views: 0,
                duration: this.getVideoDuration(videoData.file),
                timestamp: new Date().toISOString(),
                isLiked: false,
                isSaved: false,
                privacy: videoData.privacy,
                tags: helpers.parseHashtags(videoData.caption),
                location: null
            };

            // Add to mock data (in real app, this would be sent to backend)
            mockData.videos.unshift(newVideo);

            return {
                ...newVideo,
                user: currentUser
            };
        });
    }

    async likeVideo(videoId) {
        return this.mockRequest(() => {
            const video = mockData.videos.find(v => v.id == videoId);
            if (!video) {
                throw new Error('Video not found');
            }

            video.isLiked = !video.isLiked;
            video.likes += video.isLiked ? 1 : -1;

            return {
                likes: video.likes,
                isLiked: video.isLiked
            };
        });
    }

    async saveVideo(videoId) {
        return this.mockRequest(() => {
            const video = mockData.videos.find(v => v.id == videoId);
            if (!video) {
                throw new Error('Video not found');
            }

            video.isSaved = !video.isSaved;

            return {
                isSaved: video.isSaved
            };
        });
    }

    async shareVideo(videoId) {
        return this.mockRequest(() => {
            const video = mockData.videos.find(v => v.id == videoId);
            if (!video) {
                throw new Error('Video not found');
            }

            video.shares += 1;

            return {
                shares: video.shares,
                shareUrl: `${window.location.origin}/video/${videoId}`
            };
        });
    }

    // Comment APIs
    async getVideoComments(videoId, page = 1) {
        return this.mockRequest(() => {
            const videoComments = mockData.comments
                .filter(comment => comment.videoId == videoId)
                .map(comment => ({
                    ...comment,
                    isLiked: Math.random() > 0.7 // Random like status for demo
                }));

            // Add some mock replies
            videoComments.forEach(comment => {
                if (Math.random() > 0.5) {
                    comment.replies = this.generateMockReplies(comment.id, 2);
                }
            });

            // Simulate pagination
            const pageSize = 10;
            const startIndex = (page - 1) * pageSize;
            const paginatedComments = videoComments.slice(startIndex, startIndex + pageSize);

            return {
                comments: paginatedComments,
                hasMore: startIndex + pageSize < videoComments.length,
                totalCount: videoComments.length
            };
        });
    }

    async addComment(videoId, text) {
        return this.mockRequest(() => {
            const newComment = {
                id: helpers.generateId(),
                videoId: parseInt(videoId),
                userId: currentUser.id,
                text: text,
                likes: 0,
                timestamp: new Date().toISOString(),
                user: {
                    username: currentUser.username,
                    displayName: currentUser.displayName,
                    avatar: currentUser.avatar
                },
                isLiked: false,
                replies: []
            };

            // Add to mock data
            mockData.comments.unshift(newComment);

            return newComment;
        });
    }

    async likeComment(commentId) {
        return this.mockRequest(() => {
            const comment = mockData.comments.find(c => c.id == commentId);
            if (!comment) {
                throw new Error('Comment not found');
            }

            comment.isLiked = !comment.isLiked;
            comment.likes += comment.isLiked ? 1 : -1;

            return {
                likes: comment.likes,
                isLiked: comment.isLiked
            };
        });
    }

    // User APIs
    async getCurrentUser() {
        return this.mockRequest(() => {
            return currentUser;
        });
    }

    async getUserProfile(username) {
        return this.mockRequest(() => {
            const user = mockData.users.find(u => u.username === username);
            if (!user) {
                throw new Error('User not found');
            }

            const userVideos = mockData.videos.filter(video => video.userId === user.id);

            return {
                ...user,
                videos: userVideos,
                totalVideos: userVideos.length,
                totalLikes: userVideos.reduce((sum, video) => sum + video.likes, 0)
            };
        });
    }

    async followUser(userId) {
        return this.mockRequest(() => {
            const user = mockData.users.find(u => u.id == userId);
            if (!user) {
                throw new Error('User not found');
            }

            user.isFollowing = !user.isFollowing;
            user.followers += user.isFollowing ? 1 : -1;

            return {
                isFollowing: user.isFollowing,
                followers: user.followers
            };
        });
    }

    // Search APIs
    async search(query, type = 'all') {
        return this.mockRequest(() => {
            const results = {
                users: [],
                videos: [],
                sounds: [],
                hashtags: []
            };

            if (type === 'all' || type === 'users') {
                results.users = mockData.users.filter(user =>
                    user.username.toLowerCase().includes(query.toLowerCase()) ||
                    user.displayName.toLowerCase().includes(query.toLowerCase())
                );
            }

            if (type === 'all' || type === 'videos') {
                results.videos = mockData.videos.filter(video =>
                    video.caption.toLowerCase().includes(query.toLowerCase())
                );
            }

            if (type === 'all' || type === 'hashtags') {
                results.hashtags = mockData.trends.filter(trend =>
                    trend.tag.toLowerCase().includes(query.toLowerCase())
                );
            }

            return results;
        });
    }

    // Trending APIs
    async getTrendingVideos() {
        return this.mockRequest(() => {
            return mockData.videos
                .sort((a, b) => b.views - a.views)
                .slice(0, 10);
        });
    }

    async getTrendingHashtags() {
        return this.mockRequest(() => {
            return mockData.trends.sort((a, b) => b.views - a.views);
        });
    }

    // Notification APIs
    async getNotifications() {
        return this.mockRequest(() => {
            return mockData.notifications;
        });
    }

    async markNotificationAsRead(notificationId) {
        return this.mockRequest(() => {
            const notification = mockData.notifications.find(n => n.id == notificationId);
            if (notification) {
                notification.isRead = true;
            }
            return { success: true };
        });
    }

    // Utility Methods
    async mockRequest(handler) {
        // Simulate API delay
        const delay = Math.random() * 500 + 200; // 200-700ms
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // Simulate occasional failures
                    if (Math.random() < 0.05) { // 5% failure rate
                        throw new Error('Mock API error');
                    }

                    const result = handler();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }, delay);
        });
    }

    generateThumbnail(videoFile) {
        // In a real app, you'd generate a thumbnail from the video
        // For now, return a placeholder
        return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
    }

    getVideoDuration(videoFile) {
        // In a real app, you'd get this from the video metadata
        // For now, return a random duration between 10-30 seconds
        return Math.floor(Math.random() * 20) + 10;
    }

    generateMockReplies(parentCommentId, count) {
        const replies = [];
        for (let i = 0; i < count; i++) {
            const randomUser = mockData.users[Math.floor(Math.random() * mockData.users.length)];
            replies.push({
                id: helpers.generateId(),
                parentCommentId,
                userId: randomUser.id,
                text: `This is a mock reply ${i + 1}`,
                likes: Math.floor(Math.random() * 50),
                timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Within last day
                user: {
                    username: randomUser.username,
                    displayName: randomUser.displayName,
                    avatar: randomUser.avatar
                }
            });
        }
        return replies;
    }

    // Offline Support
    async syncPendingRequests() {
        const pendingRequests = helpers.storage.get('pending_requests', []);
        
        for (const request of pendingRequests) {
            try {
                await this.makeRequest(request);
            } catch (error) {
                console.error('Failed to sync request:', request, error);
            }
        }

        helpers.storage.set('pending_requests', []);
    }

    queueRequest(request) {
        const pendingRequests = helpers.storage.get('pending_requests', []);
        pendingRequests.push(request);
        helpers.storage.set('pending_requests', pendingRequests);
    }

    // Real HTTP request method (for when you have a real backend)
    async makeRequest(endpoint, options = {}) {
        if (!this.isOnline) {
            throw new Error('No internet connection');
        }

        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Public API
    setAuthToken(token) {
        this.token = token;
        helpers.storage.set('auth_token', token);
    }

    getAuthToken() {
        return this.token;
    }

    isAuthenticated() {
        return !!this.token;
    }

    getOnlineStatus() {
        return this.isOnline;
    }
}

export default ApiService;

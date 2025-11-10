// TikTok Clone - Main Application Controller
import { VideoManager } from '../components/VideoPlayer.js';
import { CommentSystem } from '../components/CommentSection.js';
import { ModalManager } from '../components/Modals.js';
import { Navigation } from '../components/Navigation.js';
import { ApiService } from '../utils/api.js';
import { helpers } from '../utils/helpers.js';
import { mockData } from '../data/mockData.js';

class TikTokApp {
    constructor() {
        this.currentPage = 'home';
        this.currentUser = null;
        this.videoManager = null;
        this.commentSystem = null;
        this.modalManager = null;
        this.navigation = null;
        this.apiService = new ApiService();
        
        this.init();
    }

    async init() {
        try {
            // Show loading spinner
            this.showLoading();
            
            // Initialize components
            await this.initializeComponents();
            
            // Load initial data
            await this.loadInitialData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Hide loading spinner
            this.hideLoading();
            
            console.log('TikTok Clone initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.hideLoading();
        }
    }

    async initializeComponents() {
        // Initialize video manager
        this.videoManager = new VideoManager({
            videoFeed: document.getElementById('videoFeed'),
            onVideoChange: (videoId) => this.onVideoChange(videoId),
            onVideoEnd: (videoId) => this.onVideoEnd(videoId)
        });

        // Initialize comment system
        this.commentSystem = new CommentSystem({
            commentsList: document.getElementById('commentsList'),
            commentInput: document.getElementById('commentInput'),
            onCommentSubmit: (comment) => this.handleCommentSubmit(comment)
        });

        // Initialize modal manager
        this.modalManager = new ModalManager({
            uploadModal: document.getElementById('uploadModal'),
            commentModal: document.getElementById('commentModal'),
            onUpload: (videoData) => this.handleVideoUpload(videoData)
        });

        // Initialize navigation
        this.navigation = new Navigation({
            topNav: document.getElementById('topNav'),
            bottomNav: document.getElementById('bottomNav'),
            onPageChange: (page) => this.handlePageChange(page)
        });
    }

    async loadInitialData() {
        // Load current user
        this.currentUser = await this.apiService.getCurrentUser();
        
        // Load initial videos
        const videos = await this.apiService.getVideos('foryou');
        this.videoManager.loadVideos(videos);
        
        // Load trending videos for discover page
        const trendingVideos = await this.apiService.getTrendingVideos();
        this.populateDiscoverPage(trendingVideos);
    }

    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Touch gestures for mobile
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
        
        // Online/offline detection
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Page visibility
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }

    handleKeyboard(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return; // Don't interfere with text input
        }

        switch (event.code) {
            case 'ArrowUp':
                event.preventDefault();
                this.videoManager.previousVideo();
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.videoManager.nextVideo();
                break;
            case 'Space':
                event.preventDefault();
                this.videoManager.togglePlayback();
                break;
            case 'KeyL':
                event.preventDefault();
                this.videoManager.toggleLike();
                break;
            case 'KeyM':
                event.preventDefault();
                this.videoManager.toggleMute();
                break;
            case 'KeyC':
                event.preventDefault();
                this.openComments();
                break;
        }
    }

    handleTouchStart(event) {
        this.touchStartY = event.touches[0].clientY;
        this.touchStartTime = Date.now();
    }

    handleTouchEnd(event) {
        if (!this.touchStartY) return;

        const touchEndY = event.changedTouches[0].clientY;
        const touchEndTime = Date.now();
        const deltaY = touchEndY - this.touchStartY;
        const deltaTime = touchEndTime - this.touchStartTime;

        // Swipe detection
        if (Math.abs(deltaY) > 50 && deltaTime < 300) {
            if (deltaY > 0) {
                // Swipe down - previous video
                this.videoManager.previousVideo();
            } else {
                // Swipe up - next video
                this.videoManager.nextVideo();
            }
        }

        // Reset touch data
        this.touchStartY = null;
        this.touchStartTime = null;
    }

    async handlePageChange(page) {
        this.currentPage = page;
        
        // Update UI based on page
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
        document.getElementById(`${page}Page`)?.classList.remove('hidden');
        
        // Load page-specific data
        switch (page) {
            case 'home':
                await this.loadHomeFeed();
                break;
            case 'discover':
                await this.loadDiscoverPage();
                break;
            case 'profile':
                await this.loadProfilePage();
                break;
        }
    }

    async loadHomeFeed() {
        this.showLoading();
        try {
            const videos = await this.apiService.getVideos('foryou');
            this.videoManager.loadVideos(videos);
        } catch (error) {
            console.error('Error loading home feed:', error);
        } finally {
            this.hideLoading();
        }
    }

    async loadDiscoverPage() {
        this.showLoading();
        try {
            const trendingVideos = await this.apiService.getTrendingVideos();
            this.populateDiscoverPage(trendingVideos);
        } catch (error) {
            console.error('Error loading discover page:', error);
        } finally {
            this.hideLoading();
        }
    }

    populateDiscoverPage(videos) {
        const trendingGrid = document.getElementById('trendingGrid');
        if (!trendingGrid) return;

        trendingGrid.innerHTML = videos.map(video => `
            <div class="trending-item" data-video-id="${video.id}">
                <video preload="metadata" playsinline>
                    <source src="${video.videoUrl}" type="video/mp4">
                </video>
                <div class="trending-info">
                    <span class="views">${helpers.formatViews(video.views)} views</span>
                    <span class="likes"><i class="fas fa-heart"></i> ${helpers.formatViews(video.likes)}</span>
                </div>
            </div>
        `).join('');
    }

    onVideoChange(videoId) {
        // Update UI for video change
        console.log('Video changed to:', videoId);
        
        // Track video view
        this.apiService.trackVideoView(videoId);
    }

    onVideoEnd(videoId) {
        // Auto-play next video
        setTimeout(() => {
            this.videoManager.nextVideo();
        }, 100);
    }

    async handleCommentSubmit(comment) {
        try {
            const newComment = await this.apiService.addComment(
                this.videoManager.currentVideoId,
                comment
            );
            this.commentSystem.addComment(newComment);
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    }

    async handleVideoUpload(videoData) {
        this.showLoading();
        try {
            const newVideo = await this.apiService.uploadVideo(videoData);
            this.videoManager.addVideo(newVideo);
            this.modalManager.closeUploadModal();
        } catch (error) {
            console.error('Error uploading video:', error);
        } finally {
            this.hideLoading();
        }
    }

    openComments() {
        const currentVideoId = this.videoManager.currentVideoId;
        if (currentVideoId) {
            this.commentSystem.openComments(currentVideoId);
            this.modalManager.openCommentModal();
        }
    }

    handleOnline() {
        console.log('App is online');
        // Sync any pending actions
        this.syncPendingActions();
    }

    handleOffline() {
        console.log('App is offline');
        // Show offline indicator
        this.showOfflineIndicator();
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden, pause video
            this.videoManager.pauseVideo();
        } else {
            // Page is visible, play video if was playing
            this.videoManager.playVideo();
        }
    }

    showLoading() {
        document.getElementById('loadingSpinner')?.classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingSpinner')?.classList.add('hidden');
    }

    showOfflineIndicator() {
        // Implement offline indicator
        const indicator = document.createElement('div');
        indicator.className = 'offline-indicator';
        indicator.textContent = 'You are offline';
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            indicator.remove();
        }, 3000);
    }

    async syncPendingActions() {
        // Sync any actions that were performed offline
        console.log('Syncing pending actions...');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TikTokApp();
});

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for testing
export default TikTokApp;

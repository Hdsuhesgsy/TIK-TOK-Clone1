// ===== MAIN APPLICATION JAVASCRIPT =====
// التطبيق الرئيسي - تيك توك مقلد

class TikTokClone {
    constructor() {
        this.currentPage = 'home';
        this.isLoggedIn = false;
        this.userData = null;
        this.currentVideoIndex = 0;
        this.videoContainers = [];
        this.isPlaying = true;
        
        this.init();
    }

    // Initialize the application
    init() {
        console.log('🚀 TikTok Clone App Initializing...');
        
        this.checkAuthentication();
        this.setupServiceWorker();
        this.setupGlobalEventListeners();
        this.setupNavigation();
        this.initializePage();
        this.setupErrorHandling();
        
        console.log('✅ TikTok Clone App Initialized');
    }

    // Check if user is logged in
    checkAuthentication() {
        const savedUser = this.getStorage('user');
        if (savedUser) {
            this.userData = savedUser;
            this.isLoggedIn = true;
            this.updateUIForAuth();
            console.log('🔑 User authenticated:', this.userData.username);
        } else {
            console.log('👤 User not authenticated');
        }
    }

    // Setup Service Worker for PWA
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('🔧 Service Worker registered:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('🔄 Service Worker update found');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showToast('New version available! Refresh to update.', 'info');
                        }
                    });
                });
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }

    // Global event listeners
    setupGlobalEventListeners() {
        // Handle online/offline status
        window.addEventListener('online', () => this.handleOnlineStatus());
        window.addEventListener('offline', () => this.handleOfflineStatus());

        // Handle page visibility
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());

        // Handle beforeunload
        window.addEventListener('beforeunload', () => this.handleBeforeUnload());

        // Handle errors
        window.addEventListener('error', (e) => this.handleGlobalError(e));
        window.addEventListener('unhandledrejection', (e) => this.handlePromiseRejection(e));

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Handle resize
        window.addEventListener('resize', () => this.handleResize());

        console.log('🔧 Global event listeners setup completed');
    }

    // Navigation setup
    setupNavigation() {
        // Handle bottom navigation clicks
        const navItems = document.querySelectorAll('.bottom-nav .nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = this.getPageFromHref(item.href);
                this.handleNavigation(targetPage);
            });
        });

        // Handle back button
        window.addEventListener('popstate', (e) => {
            this.handleBrowserNavigation();
        });

        console.log('🧭 Navigation setup completed');
    }

    // Initialize current page
    initializePage() {
        const currentPath = window.location.pathname;
        this.currentPage = this.getPageFromPath(currentPath) || 'home';
        
        this.updateActiveNavigation();
        this.initializePageSpecificFeatures();
        
        console.log(`📄 Page initialized: ${this.currentPage}`);
    }

    // Initialize page-specific features
    initializePageSpecificFeatures() {
        switch (this.currentPage) {
            case 'home':
                this.initializeHomePage();
                break;
            case 'discover':
                this.initializeDiscoverPage();
                break;
            case 'profile':
                this.initializeProfilePage();
                break;
            case 'inbox':
                this.initializeInboxPage();
                break;
            case 'upload':
                this.initializeUploadPage();
                break;
        }
    }

    // Home page initialization
    initializeHomePage() {
        this.videoContainers = document.querySelectorAll('.video-container');
        this.setupVideoFeed();
        this.setupVideoInteractions();
        this.setupTopNavigation();
        
        console.log(`🎥 Home page initialized with ${this.videoContainers.length} videos`);
    }

    // Setup video feed functionality
    setupVideoFeed() {
        const videoFeed = document.querySelector('.video-feed');
        if (!videoFeed || this.videoContainers.length === 0) return;

        // Initialize first video
        this.switchVideo(0);

        // Handle scroll for video switching
        let isScrolling = false;
        videoFeed.addEventListener('scroll', () => {
            if (isScrolling) return;
            
            isScrolling = true;
            const scrollPosition = videoFeed.scrollTop;
            const windowHeight = window.innerHeight;
            const newIndex = Math.round(scrollPosition / windowHeight);
            
            if (newIndex !== this.currentVideoIndex && newIndex >= 0 && newIndex < this.videoContainers.length) {
                this.switchVideo(newIndex);
            }
            
            setTimeout(() => {
                isScrolling = false;
            }, 100);
        });

        // Add swipe indicators for first time users
        if (!this.getStorage('swipe_help_shown')) {
            this.showSwipeIndicators();
            this.setStorage('swipe_help_shown', true);
        }
    }

    // Switch to video by index
    switchVideo(index) {
        if (index < 0 || index >= this.videoContainers.length) return;
        
        // Pause current video
        const currentVideo = this.videoContainers[this.currentVideoIndex]?.querySelector('video');
        if (currentVideo) {
            currentVideo.pause();
        }
        
        // Remove active class from all videos
        this.videoContainers.forEach(container => {
            container.classList.remove('active');
        });
        
        // Set new active video
        this.currentVideoIndex = index;
        this.videoContainers[this.currentVideoIndex].classList.add('active');
        
        // Play new video if autoplay is enabled
        const newVideo = this.videoContainers[this.currentVideoIndex].querySelector('video');
        if (newVideo && this.isPlaying) {
            newVideo.play().catch(e => {
                console.log('⚠️ Autoplay prevented:', e);
                this.showToast('Tap to play video', 'info');
            });
        }

        console.log(`🎬 Switched to video ${this.currentVideoIndex + 1}`);
    }

    // Setup video interactions
    setupVideoInteractions() {
        // Like button functionality
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleLike(btn);
            });
        });

        // Comment button functionality
        document.querySelectorAll('.comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleComment(btn);
            });
        });

        // Share button functionality
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleShare(btn);
            });
        });

        // Follow button functionality
        document.querySelectorAll('.follow-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleFollow(btn);
            });
        });

        // Double tap to like
        document.querySelectorAll('.video-container').forEach(container => {
            container.addEventListener('dblclick', (e) => {
                this.handleDoubleTapLike(e, container);
            });
        });

        // Video tap to play/pause
        document.querySelectorAll('.video-container').forEach(container => {
            container.addEventListener('click', (e) => {
                if (e.target.classList.contains('action-btn') || 
                    e.target.closest('.action-btn') ||
                    e.target.classList.contains('follow-btn')) {
                    return;
                }
                this.toggleVideoPlayback(container);
            });
        });

        console.log('🎮 Video interactions setup completed');
    }

    // Handle like action
    handleLike(button) {
        const icon = button.querySelector('i');
        const countElement = button.parentElement.querySelector('.action-count');
        
        if (button.classList.contains('liked')) {
            // Unlike
            button.classList.remove('liked');
            icon.classList.remove('fas', 'fa-heart');
            icon.classList.add('far', 'fa-heart');
            icon.style.color = '';
            
            // Decrease count
            this.updateActionCount(countElement, -1);
        } else {
            // Like
            button.classList.add('liked');
            icon.classList.remove('far', 'fa-heart');
            icon.classList.add('fas', 'fa-heart');
            icon.style.color = 'var(--primary-color)';
            icon.classList.add('heart-beat');
            
            // Increase count
            this.updateActionCount(countElement, 1);
            
            // Remove animation class after animation completes
            setTimeout(() => {
                icon.classList.remove('heart-beat');
            }, 600);
        }
    }

    // Handle double tap like
    handleDoubleTapLike(event, container) {
        const likeBtn = container.querySelector('.like-btn');
        if (likeBtn) {
            this.handleLike(likeBtn);
            this.createHeartAnimation(event.clientX, event.clientY);
        }
    }

    // Create heart animation on double tap
    createHeartAnimation(x, y) {
        const heart = document.createElement('div');
        heart.className = 'heart-overlay';
        heart.innerHTML = '<i class="fas fa-heart" style="color: var(--primary-color); font-size: 60px;"></i>';
        heart.style.cssText = `
            position: fixed;
            left: ${x - 30}px;
            top: ${y - 30}px;
            pointer-events: none;
            z-index: var(--z-tooltip);
        `;
        
        document.body.appendChild(heart);
        
        setTimeout(() => {
            heart.remove();
        }, 1000);
    }

    // Update action count
    updateActionCount(element, change) {
        const currentText = element.textContent;
        let currentCount = 0;
        
        if (currentText.includes('K')) {
            currentCount = parseFloat(currentText) * 1000;
        } else if (currentText.includes('M')) {
            currentCount = parseFloat(currentText) * 1000000;
        } else {
            currentCount = parseInt(currentText) || 0;
        }
        
        currentCount = Math.max(0, currentCount + change);
        
        if (currentCount >= 1000000) {
            element.textContent = (currentCount / 1000000).toFixed(1) + 'M';
        } else if (currentCount >= 1000) {
            element.textContent = (currentCount / 1000).toFixed(1) + 'K';
        } else {
            element.textContent = currentCount.toString();
        }
    }

    // Toggle video playback
    toggleVideoPlayback(container) {
        const video = container.querySelector('video');
        if (!video) return;

        if (video.paused) {
            video.play().then(() => {
                this.isPlaying = true;
                console.log('▶️ Video playing');
            }).catch(e => {
                console.log('❌ Video play failed:', e);
                this.showToast('Tap to play video', 'info');
            });
        } else {
            video.pause();
            this.isPlaying = false;
            console.log('⏸️ Video paused');
        }
    }

    // Handle comment action
    handleComment(button) {
        const videoId = button.getAttribute('data-video-id');
        console.log(`💬 Open comments for video ${videoId}`);
        this.showToast('Comments feature coming soon!', 'info');
    }

    // Handle share action
    handleShare(button) {
        const videoId = button.getAttribute('data-video-id');
        const videoUrl = `${window.location.origin}?video=${videoId}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Check out this video on TikTok Clone',
                text: 'Amazing content!',
                url: videoUrl,
            })
            .then(() => console.log('✅ Successful share'))
            .catch((error) => {
                console.log('❌ Share failed:', error);
                this.copyToClipboard(videoUrl);
            });
        } else {
            this.copyToClipboard(videoUrl);
        }
    }

    // Handle follow action
    handleFollow(button) {
        if (button.textContent === 'Follow') {
            button.textContent = 'Following';
            button.style.background = 'var(--surface-light)';
            button.classList.add('following');
            this.showToast('User followed!', 'success');
        } else {
            button.textContent = 'Follow';
            button.style.background = 'var(--primary-color)';
            button.classList.remove('following');
            this.showToast('User unfollowed!', 'info');
        }
    }

    // Setup top navigation
    setupTopNavigation() {
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                navTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const tabType = tab.getAttribute('data-tab');
                this.handleTabSwitch(tabType);
            });
        });

        // Search button
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.showToast('Search feature coming soon!', 'info');
            });
        }

        // Add friends button
        const addFriendsBtn = document.getElementById('addFriendsBtn');
        if (addFriendsBtn) {
            addFriendsBtn.addEventListener('click', () => {
                this.showToast('Add friends feature coming soon!', 'info');
            });
        }
    }

    // Handle tab switching
    handleTabSwitch(tabType) {
        console.log(`🔖 Switched to tab: ${tabType}`);
        // In a real app, this would load different content
        this.showToast(`Showing ${tabType} content`, 'info');
    }

    // Show swipe indicators
    showSwipeIndicators() {
        const indicator = document.createElement('div');
        indicator.className = 'swipe-indicator';
        indicator.textContent = 'Swipe up for next video';
        indicator.style.cssText = `
            position: absolute;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            color: var(--text-muted);
            font-size: var(--font-size-sm);
            background: rgba(0, 0, 0, 0.5);
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--radius-lg);
            backdrop-filter: blur(10px);
            z-index: var(--z-tooltip);
        `;
        
        document.querySelector('.app').appendChild(indicator);
        
        setTimeout(() => {
            indicator.remove();
        }, 3000);
    }

    // Handle navigation between pages
    handleNavigation(page) {
        if (page === this.currentPage) return;

        // Save current state
        this.saveCurrentState();

        // Update active navigation
        this.updateActiveNavigation(page);

        // Navigate to new page
        if (page === 'home') {
            window.location.href = 'index.html';
        } else {
            window.location.href = `${page}.html`;
        }

        console.log(`🧭 Navigating to: ${page}`);
    }

    // Update active navigation
    updateActiveNavigation(activePage = null) {
        const page = activePage || this.currentPage;
        const navItems = document.querySelectorAll('.bottom-nav .nav-item');
        
        navItems.forEach(item => {
            item.classList.remove('active');
            const itemPage = this.getPageFromHref(item.href);
            if (itemPage === page) {
                item.classList.add('active');
            }
        });
    }

    // Handle browser navigation
    handleBrowserNavigation() {
        const path = window.location.pathname;
        const page = this.getPageFromPath(path) || 'home';
        
        if (page !== this.currentPage) {
            this.currentPage = page;
            this.initializePageSpecificFeatures();
        }
    }

    // Handle online status
    handleOnlineStatus() {
        console.log('🌐 Online');
        this.showToast('You are back online!', 'success');
        this.restoreVideoPlayback();
    }

    // Handle offline status
    handleOfflineStatus() {
        console.log('📴 Offline');
        this.showToast('You are offline. Some features may not work.', 'warning');
        this.pauseAllVideos();
    }

    // Handle visibility change
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('👻 Page hidden');
            this.pauseAllVideos();
        } else {
            console.log('👀 Page visible');
            this.restoreVideoPlayback();
        }
    }

    // Handle before unload
    handleBeforeUnload() {
        this.saveCurrentState();
        console.log('💾 App state saved');
    }

    // Handle keyboard events
    handleKeyboard(event) {
        if (this.currentPage !== 'home') return;

        switch (event.code) {
            case 'ArrowDown':
            case 'KeyJ':
                event.preventDefault();
                this.switchVideo(Math.min(this.currentVideoIndex + 1, this.videoContainers.length - 1));
                this.scrollToCurrentVideo();
                break;
                
            case 'ArrowUp':
            case 'KeyK':
                event.preventDefault();
                this.switchVideo(Math.max(this.currentVideoIndex - 1, 0));
                this.scrollToCurrentVideo();
                break;
                
            case 'Space':
                event.preventDefault();
                const currentVideo = this.videoContainers[this.currentVideoIndex].querySelector('video');
                if (currentVideo) {
                    this.toggleVideoPlayback(this.videoContainers[this.currentVideoIndex]);
                }
                break;
                
            case 'KeyL':
                event.preventDefault();
                const likeBtn = this.videoContainers[this.currentVideoIndex].querySelector('.like-btn');
                if (likeBtn) this.handleLike(likeBtn);
                break;
        }
    }

    // Handle resize
    handleResize() {
        console.log('📱 Window resized');
        // Re-initialize video positions if needed
        this.scrollToCurrentVideo();
    }

    // Scroll to current video
    scrollToCurrentVideo() {
        const videoFeed = document.querySelector('.video-feed');
        if (videoFeed) {
            videoFeed.scrollTo(0, this.currentVideoIndex * window.innerHeight);
        }
    }

    // Pause all videos
    pauseAllVideos() {
        document.querySelectorAll('video').forEach(video => {
            video.pause();
        });
        this.isPlaying = false;
    }

    // Restore video playback
    restoreVideoPlayback() {
        if (this.currentPage === 'home' && this.isPlaying) {
            const currentVideo = this.videoContainers[this.currentVideoIndex]?.querySelector('video');
            if (currentVideo) {
                currentVideo.play().catch(e => {
                    console.log('❌ Video playback restoration failed:', e);
                });
            }
        }
    }

    // Save current state
    saveCurrentState() {
        const state = {
            currentPage: this.currentPage,
            currentVideoIndex: this.currentVideoIndex,
            isPlaying: this.isPlaying,
            timestamp: Date.now()
        };
        this.setStorage('app_state', state);
    }

    // Restore saved state
    restoreSavedState() {
        const savedState = this.getStorage('app_state');
        if (savedState && savedState.timestamp > Date.now() - 3600000) { // 1 hour
            this.currentPage = savedState.currentPage;
            this.currentVideoIndex = savedState.currentVideoIndex;
            this.isPlaying = savedState.isPlaying;
        }
    }

    // Error handling
    setupErrorHandling() {
        console.log('🐛 Error handling setup completed');
    }

    handleGlobalError(error) {
        console.error('💥 Global error:', error);
        this.showToast('Something went wrong. Please try again.', 'error');
    }

    handlePromiseRejection(event) {
        console.error('💥 Unhandled promise rejection:', event.reason);
        this.showToast('Operation failed. Please try again.', 'error');
    }

    // Utility methods
    getPageFromHref(href) {
        if (!href) return null;
        const url = new URL(href);
        const path = url.pathname;
        return this.getPageFromPath(path);
    }

    getPageFromPath(path) {
        const page = path.split('/').pop().replace('.html', '').replace('index', 'home');
        return page === '' ? 'home' : page;
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Link copied to clipboard!', 'success');
        } catch (err) {
            console.error('❌ Copy failed:', err);
            this.showToast('Failed to copy link', 'error');
        }
    }

    // Toast notification system
    showToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 3000);
    }

    // Storage utilities
    setStorage(key, value) {
        try {
            localStorage.setItem(`tiktok_${key}`, JSON.stringify(value));
        } catch (error) {
            console.error('💾 Storage error:', error);
        }
    }

    getStorage(key) {
        try {
            const item = localStorage.getItem(`tiktok_${key}`);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('💾 Storage error:', error);
            return null;
        }
    }

    removeStorage(key) {
        try {
            localStorage.removeItem(`tiktok_${key}`);
        } catch (error) {
            console.error('💾 Storage error:', error);
        }
    }

    // Update UI for authentication
    updateUIForAuth() {
        if (this.isLoggedIn && this.userData) {
            console.log('👤 Updating UI for authenticated user');
            // Update user-specific UI elements here
        }
    }

    // Placeholder methods for other pages
    initializeDiscoverPage() {
        console.log('🔍 Discover page initialized');
    }

    initializeProfilePage() {
        console.log('👤 Profile page initialized');
    }

    initializeInboxPage() {
        console.log('💬 Inbox page initialized');
    }

    initializeUploadPage() {
        console.log('📤 Upload page initialized');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tiktokApp = new TikTokClone();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TikTokClone;
    }

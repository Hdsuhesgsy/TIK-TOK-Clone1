// Navigation System - TikTok Clone
import { helpers } from '../utils/helpers.js';

export class Navigation {
    constructor(config = {}) {
        this.topNav = config.topNav;
        this.bottomNav = config.bottomNav;
        this.onPageChange = config.onPageChange || (() => {});
        this.onTabChange = config.onTabChange || (() => {});
        
        this.currentPage = 'home';
        this.currentTab = 'foryou';
        this.previousPage = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSwipeNavigation();
        this.setupKeyboardNavigation();
        this.updateActiveStates();
    }

    setupEventListeners() {
        // Bottom navigation clicks
        if (this.bottomNav) {
            this.bottomNav.addEventListener('click', (e) => this.handleBottomNavClick(e));
        }

        // Top navigation tabs
        if (this.topNav) {
            this.topNav.addEventListener('click', (e) => this.handleTopNavClick(e));
        }

        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.openSearch());
        }

        // Add friends functionality
        const addFriendsBtn = document.getElementById('addFriendsBtn');
        if (addFriendsBtn) {
            addFriendsBtn.addEventListener('click', () => this.openAddFriends());
        }

        // Back button handling (mobile)
        window.addEventListener('popstate', (e) => this.handlePopState(e));
    }

    setupSwipeNavigation() {
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // Only consider horizontal swipes with minimal vertical movement
            if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 50) {
                if (deltaX > 0) {
                    // Swipe right - go to previous page
                    this.navigateToPrevious();
                } else {
                    // Swipe left - go to next page
                    this.navigateToNext();
                }
            }

            touchStartX = 0;
            touchStartY = 0;
        }, { passive: true });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Only handle keyboard nav when no input is focused
            if (this.isInputFocused()) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.navigateToPrevious();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.navigateToNext();
                    break;
                case '1':
                    e.preventDefault();
                    this.switchToPage('home');
                    break;
                case '2':
                    e.preventDefault();
                    this.switchToPage('discover');
                    break;
                case '3':
                    e.preventDefault();
                    this.openUploadModal();
                    break;
                case '4':
                    e.preventDefault();
                    this.switchToPage('inbox');
                    break;
                case '5':
                    e.preventDefault();
                    this.switchToPage('profile');
                    break;
            }
        });
    }

    handleBottomNavClick(e) {
        const navItem = e.target.closest('.nav-item');
        if (!navItem) return;

        e.preventDefault();

        const page = navItem.dataset.page;
        if (page && page !== this.currentPage) {
            this.switchToPage(page);
        }
    }

    handleTopNavClick(e) {
        const navTab = e.target.closest('.nav-tab');
        if (!navTab) return;

        const tab = navTab.dataset.tab;
        if (tab && tab !== this.currentTab) {
            this.switchToTab(tab);
        }
    }

    handlePopState(e) {
        // Handle browser back/forward buttons
        const state = e.state;
        if (state && state.page) {
            this.switchToPage(state.page, false); // don't push state again
        }
    }

    switchToPage(page, pushState = true) {
        if (page === this.currentPage) return;

        this.previousPage = this.currentPage;
        this.currentPage = page;

        // Update URL without page reload
        if (pushState) {
            window.history.pushState({ page }, '', `#${page}`);
        }

        // Update UI
        this.updateActiveStates();
        
        // Hide all pages, show current page
        this.showPage(page);

        // Call callback
        this.onPageChange(page);

        // Emit custom event
        window.dispatchEvent(new CustomEvent('pageChanged', {
            detail: { page, previousPage: this.previousPage }
        }));

        // Page-specific setup
        this.setupPageSpecificFeatures(page);
    }

    switchToTab(tab) {
        if (tab === this.currentTab) return;

        this.currentTab = tab;

        // Update UI
        this.updateTabStates();

        // Call callback
        this.onTabChange(tab);

        // Emit custom event
        window.dispatchEvent(new CustomEvent('tabChanged', {
            detail: { tab }
        }));

        // Load tab-specific content
        this.loadTabContent(tab);
    }

    updateActiveStates() {
        // Update bottom nav
        if (this.bottomNav) {
            this.bottomNav.querySelectorAll('.nav-item').forEach(item => {
                item.classList.toggle('active', item.dataset.page === this.currentPage);
            });
        }

        // Update page visibility
        this.updatePageVisibility();
    }

    updateTabStates() {
        // Update top nav tabs
        if (this.topNav) {
            this.topNav.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.tab === this.currentTab);
            });
        }
    }

    updatePageVisibility() {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.add('hidden');
        });

        // Show current page
        const currentPageElement = document.getElementById(`${this.currentPage}Page`);
        if (currentPageElement) {
            currentPageElement.classList.remove('hidden');
        }
    }

    showPage(page) {
        // Hide all main content areas
        document.querySelectorAll('.main-content > *').forEach(element => {
            element.classList.add('hidden');
        });

        // Show requested page
        const pageElement = document.getElementById(`${page}Page`);
        if (pageElement) {
            pageElement.classList.remove('hidden');
        }

        // Special handling for home page video feed
        if (page === 'home') {
            const videoFeed = document.getElementById('videoFeed');
            if (videoFeed) {
                videoFeed.classList.remove('hidden');
            }
        }
    }

    setupPageSpecificFeatures(page) {
        switch (page) {
            case 'home':
                this.setupHomePage();
                break;
            case 'discover':
                this.setupDiscoverPage();
                break;
            case 'inbox':
                this.setupInboxPage();
                break;
            case 'profile':
                this.setupProfilePage();
                break;
        }
    }

    setupHomePage() {
        // Ensure video feed is visible and interactive
        const videoFeed = document.getElementById('videoFeed');
        if (videoFeed) {
            videoFeed.scrollTop = 0;
        }

        // Load initial videos if needed
        window.dispatchEvent(new CustomEvent('loadHomeFeed'));
    }

    setupDiscoverPage() {
        // Load trending content
        window.dispatchEvent(new CustomEvent('loadDiscoverContent'));
    }

    setupInboxPage() {
        // Load messages and notifications
        window.dispatchEvent(new CustomEvent('loadInboxContent'));
    }

    setupProfilePage() {
        // Load user profile data
        window.dispatchEvent(new CustomEvent('loadProfileContent'));
    }

    loadTabContent(tab) {
        switch (tab) {
            case 'foryou':
                window.dispatchEvent(new CustomEvent('loadForYouFeed'));
                break;
            case 'following':
                window.dispatchEvent(new CustomEvent('loadFollowingFeed'));
                break;
        }
    }

    navigateToPrevious() {
        const pages = ['home', 'discover', 'inbox', 'profile'];
        const currentIndex = pages.indexOf(this.currentPage);
        
        if (currentIndex > 0) {
            this.switchToPage(pages[currentIndex - 1]);
        }
    }

    navigateToNext() {
        const pages = ['home', 'discover', 'inbox', 'profile'];
        const currentIndex = pages.indexOf(this.currentPage);
        
        if (currentIndex < pages.length - 1) {
            this.switchToPage(pages[currentIndex + 1]);
        }
    }

    openSearch() {
        window.dispatchEvent(new CustomEvent('openSearchModal'));
    }

    openAddFriends() {
        window.dispatchEvent(new CustomEvent('openAddFriends'));
    }

    openUploadModal() {
        window.dispatchEvent(new CustomEvent('openUploadModal'));
    }

    // Utility Methods
    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.tagName === 'SELECT' ||
            activeElement.isContentEditable
        );
    }

    showNotificationBadge(count) {
        const inboxItem = this.bottomNav?.querySelector('[data-page="inbox"]');
        if (!inboxItem) return;

        let badge = inboxItem.querySelector('.nav-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'nav-badge';
            inboxItem.appendChild(badge);
        }

        badge.textContent = count > 99 ? '99+' : count.toString();
        badge.style.display = count > 0 ? 'flex' : 'none';
    }

    updateMessageCount(count) {
        this.showNotificationBadge(count);
    }

    // Public API
    getCurrentPage() {
        return this.currentPage;
    }

    getCurrentTab() {
        return this.currentTab;
    }

    getPreviousPage() {
        return this.previousPage;
    }

    goBack() {
        if (this.previousPage) {
            this.switchToPage(this.previousPage);
        } else {
            this.switchToPage('home');
        }
    }

    refreshCurrentPage() {
        this.setupPageSpecificFeatures(this.currentPage);
    }

    // Analytics and Tracking
    trackNavigation(fromPage, toPage) {
        // In a real app, you'd send this to your analytics service
        console.log(`Navigation: ${fromPage} → ${toPage}`);
        
        // Example: Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: toPage,
                page_location: window.location.href
            });
        }
    }

    destroy() {
        // Cleanup event listeners
        if (this.bottomNav) {
            this.bottomNav.removeEventListener('click', this.handleBottomNavClick);
        }
        
        if (this.topNav) {
            this.topNav.removeEventListener('click', this.handleTopNavClick);
        }
    }
}

export default Navigation;

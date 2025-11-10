// Modal Management System - TikTok Clone
import { helpers } from '../utils/helpers.js';

export class ModalManager {
    constructor(config = {}) {
        this.uploadModal = config.uploadModal;
        this.commentModal = config.commentModal;
        this.searchModal = config.searchModal;
        this.onUpload = config.onUpload || (() => {});
        this.onSearch = config.onSearch || (() => {});
        
        this.currentModal = null;
        this.isOpen = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupUploadHandler();
        this.setupSearchHandler();
    }

    setupEventListeners() {
        // Close modals on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeCurrentModal();
            }
        });

        // Close modals on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeCurrentModal();
            }
        });

        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeCurrentModal());
        });

        // Open modal triggers
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-modal]');
            if (trigger) {
                const modalType = trigger.dataset.modal;
                this.openModal(modalType);
            }
        });
    }

    setupUploadHandler() {
        const uploadArea = document.getElementById('uploadArea');
        const videoUpload = document.getElementById('videoUpload');
        const uploadInfo = document.getElementById('uploadInfo');
        const postBtn = document.getElementById('postBtn');

        if (uploadArea && videoUpload) {
            uploadArea.addEventListener('click', () => videoUpload.click());
            uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            uploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));
            
            videoUpload.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        if (postBtn) {
            postBtn.addEventListener('click', () => this.handlePost());
        }
    }

    setupSearchHandler() {
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');

        if (searchInput) {
            searchInput.addEventListener('input', helpers.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch(e.target.value);
                }
            });
        }
    }

    openModal(modalType) {
        this.closeCurrentModal();

        let modalElement;
        switch (modalType) {
            case 'upload':
                modalElement = this.uploadModal;
                break;
            case 'comments':
                modalElement = this.commentModal;
                break;
            case 'search':
                modalElement = this.searchModal;
                break;
            default:
                console.warn(`Unknown modal type: ${modalType}`);
                return;
        }

        if (!modalElement) {
            console.warn(`Modal element not found for: ${modalType}`);
            return;
        }

        this.currentModal = modalElement;
        this.isOpen = true;

        // Show modal
        modalElement.classList.remove('hidden');
        
        // Add animation class
        setTimeout(() => {
            modalElement.classList.add('show');
        }, 10);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus appropriate input
        this.focusModalInput(modalType);

        // Emit event
        window.dispatchEvent(new CustomEvent('modalOpened', { 
            detail: { modalType } 
        }));
    }

    closeCurrentModal() {
        if (!this.currentModal || !this.isOpen) return;

        const modalType = this.getModalType(this.currentModal);

        // Hide modal
        this.currentModal.classList.remove('show');
        
        // Wait for animation then hide completely
        setTimeout(() => {
            this.currentModal.classList.add('hidden');
            this.currentModal = null;
            this.isOpen = false;

            // Restore body scroll
            document.body.style.overflow = '';

            // Emit event
            window.dispatchEvent(new CustomEvent('modalClosed', { 
                detail: { modalType } 
            }));
        }, 300);
    }

    focusModalInput(modalType) {
        let inputElement;

        switch (modalType) {
            case 'upload':
                inputElement = document.querySelector('.caption-input');
                break;
            case 'comments':
                inputElement = document.getElementById('commentInput');
                break;
            case 'search':
                inputElement = document.getElementById('searchInput');
                break;
        }

        if (inputElement) {
            setTimeout(() => {
                inputElement.focus();
            }, 100);
        }
    }

    getModalType(modalElement) {
        if (modalElement === this.uploadModal) return 'upload';
        if (modalElement === this.commentModal) return 'comments';
        if (modalElement === this.searchModal) return 'search';
        return 'unknown';
    }

    // Upload Handlers
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.classList.add('dragover');
        }
    }

    handleFileDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.classList.remove('dragover');
        }

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processVideoFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processVideoFile(files[0]);
        }
    }

    processVideoFile(file) {
        // Validate file type
        if (!file.type.startsWith('video/')) {
            this.showError('Please select a video file');
            return;
        }

        // Validate file size (max 100MB)
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showError('Video file too large (max 100MB)');
            return;
        }

        // Show file info
        this.showUploadInfo(file);

        // Create preview
        this.createVideoPreview(file);
    }

    showUploadInfo(file) {
        const uploadArea = document.getElementById('uploadArea');
        const uploadInfo = document.getElementById('uploadInfo');

        if (uploadArea && uploadInfo) {
            uploadArea.classList.add('hidden');
            uploadInfo.classList.remove('hidden');
        }

        // Update file info
        const fileName = document.querySelector('.file-name');
        const fileSize = document.querySelector('.file-size');
        
        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = helpers.formatFileSize(file.size);
    }

    createVideoPreview(file) {
        const videoPreview = document.getElementById('videoPreview');
        if (!videoPreview) return;

        const url = URL.createObjectURL(file);
        
        videoPreview.innerHTML = `
            <video controls>
                <source src="${url}" type="${file.type}">
                Your browser doesn't support video preview.
            </video>
        `;

        // Store file reference
        this.currentVideoFile = file;
    }

    async handlePost() {
        const captionInput = document.querySelector('.caption-input');
        const privacySelect = document.querySelector('.privacy-select');
        
        if (!this.currentVideoFile) {
            this.showError('Please select a video file');
            return;
        }

        const videoData = {
            file: this.currentVideoFile,
            caption: captionInput?.value.trim() || '',
            privacy: privacySelect?.value || 'public',
            timestamp: new Date().toISOString()
        };

        try {
            // Show loading state
            this.showUploadLoading();

            // Call upload handler
            await this.onUpload(videoData);

            // Reset form
            this.resetUploadForm();

        } catch (error) {
            console.error('Upload error:', error);
            this.showError('Failed to upload video');
        } finally {
            this.hideUploadLoading();
        }
    }

    resetUploadForm() {
        const uploadArea = document.getElementById('uploadArea');
        const uploadInfo = document.getElementById('uploadInfo');
        const captionInput = document.querySelector('.caption-input');
        const videoUpload = document.getElementById('videoUpload');

        if (uploadArea && uploadInfo) {
            uploadArea.classList.remove('hidden');
            uploadInfo.classList.add('hidden');
        }

        if (captionInput) captionInput.value = '';
        if (videoUpload) videoUpload.value = '';

        this.currentVideoFile = null;

        const videoPreview = document.getElementById('videoPreview');
        if (videoPreview) videoPreview.innerHTML = '';
    }

    // Search Handlers
    async handleSearch(query) {
        if (!query || query.length < 2) {
            this.clearSearchResults();
            return;
        }

        try {
            // Show loading
            this.showSearchLoading();

            // Simulate API call
            const results = await this.performSearch(query);
            
            // Display results
            this.displaySearchResults(results);

        } catch (error) {
            console.error('Search error:', error);
            this.showSearchError();
        } finally {
            this.hideSearchLoading();
        }
    }

    async performSearch(query) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock search results
        return {
            users: [
                {
                    id: 1,
                    username: 'creative_user',
                    displayName: 'Creative User 🎨',
                    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
                    followers: '125K',
                    isVerified: true
                }
            ],
            videos: [
                {
                    id: 1,
                    title: 'Amazing neon art tutorial',
                    thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                    views: '2.5M',
                    duration: '0:15'
                }
            ],
            sounds: [
                {
                    id: 1,
                    name: 'Original Sound - creative_user',
                    author: 'creative_user',
                    usage: '12.5K'
                }
            ],
            hashtags: [
                {
                    tag: '#digitalart',
                    views: '12.5M',
                    videos: '45.6K'
                }
            ]
        };
    }

    displaySearchResults(results) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        searchResults.innerHTML = `
            ${results.users.length > 0 ? `
                <div class="search-section">
                    <h4>Accounts</h4>
                    ${results.users.map(user => `
                        <div class="search-user" data-user-id="${user.id}">
                            <img src="${user.avatar}" alt="${user.displayName}" class="user-avatar">
                            <div class="user-info">
                                <span class="username">@${user.username}</span>
                                <span class="display-name">${user.displayName}</span>
                                <span class="followers">${user.followers} followers</span>
                            </div>
                            ${user.isVerified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${results.videos.length > 0 ? `
                <div class="search-section">
                    <h4>Videos</h4>
                    <div class="videos-grid">
                        ${results.videos.map(video => `
                            <div class="search-video" data-video-id="${video.id}">
                                <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail">
                                <div class="video-overlay">
                                    <span class="views">${video.views} views</span>
                                    <span class="duration">${video.duration}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${results.hashtags.length > 0 ? `
                <div class="search-section">
                    <h4>Hashtags</h4>
                    ${results.hashtags.map(hashtag => `
                        <div class="search-hashtag" data-hashtag="${hashtag.tag}">
                            <i class="fas fa-hashtag"></i>
                            <div class="hashtag-info">
                                <span class="tag">${hashtag.tag}</span>
                                <span class="stats">${hashtag.views} views</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }

    clearSearchResults() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.innerHTML = '';
        }
    }

    // UI State Management
    showUploadLoading() {
        const postBtn = document.getElementById('postBtn');
        if (postBtn) {
            postBtn.disabled = true;
            postBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        }
    }

    hideUploadLoading() {
        const postBtn = document.getElementById('postBtn');
        if (postBtn) {
            postBtn.disabled = false;
            postBtn.textContent = 'Post';
        }
    }

    showSearchLoading() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.innerHTML = '<div class="search-loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
        }
    }

    hideSearchLoading() {
        // Handled by displaySearchResults
    }

    showSearchError() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.innerHTML = '<div class="search-error"><i class="fas fa-exclamation-triangle"></i> Search failed</div>';
        }
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Public API
    openUploadModal() {
        this.openModal('upload');
    }

    openCommentModal() {
        this.openModal('comments');
    }

    openSearchModal() {
        this.openModal('search');
    }

    closeUploadModal() {
        if (this.currentModal === this.uploadModal) {
            this.closeCurrentModal();
        }
    }

    closeCommentModal() {
        if (this.currentModal === this.commentModal) {
            this.closeCurrentModal();
        }
    }

    closeSearchModal() {
        if (this.currentModal === this.searchModal) {
            this.closeCurrentModal();
        }
    }

    isModalOpen() {
        return this.isOpen;
    }

    getCurrentModalType() {
        return this.currentModal ? this.getModalType(this.currentModal) : null;
    }

    destroy() {
        this.currentModal = null;
        this.isOpen = false;
    }
}

export default ModalManager;

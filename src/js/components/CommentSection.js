// Comment System Component - TikTok Clone
import { helpers } from '../utils/helpers.js';
import { ApiService } from '../utils/api.js';

export class CommentSystem {
    constructor(config = {}) {
        this.commentsList = config.commentsList;
        this.commentInput = config.commentInput;
        this.onCommentSubmit = config.onCommentSubmit || (() => {});
        this.onCommentLike = config.onCommentLike || (() => {});
        
        this.comments = new Map();
        this.currentVideoId = null;
        this.isLoading = false;
        
        this.apiService = new ApiService();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupInfiniteScroll();
    }

    setupEventListeners() {
        // Comment input events
        if (this.commentInput) {
            this.commentInput.addEventListener('input', (e) => this.handleInput(e));
            this.commentInput.addEventListener('keypress', (e) => this.handleKeyPress(e));
            this.commentInput.addEventListener('focus', () => this.handleInputFocus());
            this.commentInput.addEventListener('blur', () => this.handleInputBlur());
        }

        // Send comment button
        const sendBtn = document.getElementById('sendCommentBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.submitComment());
        }

        // Comment actions delegation
        if (this.commentsList) {
            this.commentsList.addEventListener('click', (e) => this.handleCommentAction(e));
        }
    }

    setupInfiniteScroll() {
        if (!this.commentsList) return;

        this.commentsList.addEventListener('scroll', helpers.throttle(() => {
            const { scrollTop, scrollHeight, clientHeight } = this.commentsList;
            
            if (scrollHeight - scrollTop <= clientHeight + 100 && !this.isLoading) {
                this.loadMoreComments();
            }
        }, 200));
    }

    async openComments(videoId) {
        this.currentVideoId = videoId;
        this.isLoading = true;
        
        try {
            // Show loading state
            this.showLoading();
            
            // Load comments for this video
            const comments = await this.apiService.getVideoComments(videoId);
            this.comments.set(videoId, comments);
            
            // Render comments
            this.renderComments(comments);
            
            // Focus input
            setTimeout(() => {
                this.commentInput?.focus();
            }, 300);
            
        } catch (error) {
            console.error('Error loading comments:', error);
            this.showError('Failed to load comments');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    renderComments(comments) {
        if (!this.commentsList) return;

        if (!comments || comments.length === 0) {
            this.commentsList.innerHTML = `
                <div class="no-comments">
                    <i class="far fa-comment"></i>
                    <p>No comments yet</p>
                    <span>Be the first to comment!</span>
                </div>
            `;
            return;
        }

        this.commentsList.innerHTML = comments.map(comment => `
            <div class="comment-item" data-comment-id="${comment.id}">
                <img src="${comment.user.avatar}" 
                     alt="${comment.user.displayName}" 
                     class="comment-avatar"
                     onerror="this.src='public/icons/default-avatar.png'">
                
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-username">@${comment.user.username}</span>
                        <span class="comment-time">${helpers.formatDate(comment.timestamp)}</span>
                    </div>
                    
                    <p class="comment-text">${this.parseCommentText(comment.text)}</p>
                    
                    <div class="comment-actions">
                        <button class="comment-like-btn ${comment.isLiked ? 'liked' : ''}" 
                                data-comment-id="${comment.id}">
                            <i class="fas fa-heart"></i>
                            <span class="like-count">${helpers.formatCount(comment.likes)}</span>
                        </button>
                        
                        <button class="comment-reply-btn" data-comment-id="${comment.id}">
                            Reply
                        </button>
                    </div>

                    ${comment.replies && comment.replies.length > 0 ? `
                        <div class="comment-replies">
                            <button class="view-replies-btn">
                                <i class="fas fa-chevron-down"></i>
                                View ${comment.replies.length} replies
                            </button>
                            <div class="replies-list hidden">
                                ${comment.replies.map(reply => `
                                    <div class="reply-item">
                                        <img src="${reply.user.avatar}" 
                                             alt="${reply.user.displayName}" 
                                             class="reply-avatar">
                                        <div class="reply-content">
                                            <div class="reply-header">
                                                <span class="reply-username">@${reply.user.username}</span>
                                                <span class="reply-time">${helpers.formatDate(reply.timestamp)}</span>
                                            </div>
                                            <p class="reply-text">${this.parseCommentText(reply.text)}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        // Add event listeners for reply toggles
        this.setupReplyToggles();
    }

    parseCommentText(text) {
        if (!text) return '';
        
        // Parse hashtags
        text = text.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
        
        // Parse mentions
        text = text.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
        
        // Parse URLs
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener" class="comment-link">$1</a>');
        
        // Parse emojis (basic support)
        text = text.replace(/:\)/g, '😊')
                  .replace(/:\(/g, '😢')
                  .replace(/:D/g, '😃')
                  .replace(;\)/g, '😉');
        
        return text;
    }

    setupReplyToggles() {
        const viewRepliesBtns = this.commentsList.querySelectorAll('.view-replies-btn');
        
        viewRepliesBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const repliesList = btn.nextElementSibling;
                const icon = btn.querySelector('i');
                
                if (repliesList.classList.contains('hidden')) {
                    repliesList.classList.remove('hidden');
                    icon.className = 'fas fa-chevron-up';
                    btn.innerHTML = btn.innerHTML.replace('View', 'Hide');
                } else {
                    repliesList.classList.add('hidden');
                    icon.className = 'fas fa-chevron-down';
                    btn.innerHTML = btn.innerHTML.replace('Hide', 'View');
                }
            });
        });
    }

    async submitComment() {
        const text = this.commentInput?.value.trim();
        
        if (!text || !this.currentVideoId) {
            this.showError('Please enter a comment');
            return;
        }

        if (text.length > 500) {
            this.showError('Comment too long (max 500 characters)');
            return;
        }

        this.isLoading = true;
        
        try {
            // Show loading state
            this.showSendingState();
            
            // Submit comment
            const newComment = await this.apiService.addComment(this.currentVideoId, text);
            
            // Add to local state
            const videoComments = this.comments.get(this.currentVideoId) || [];
            videoComments.unshift(newComment);
            this.comments.set(this.currentVideoId, videoComments);
            
            // Re-render comments
            this.renderComments(videoComments);
            
            // Clear input
            this.commentInput.value = '';
            
            // Callback
            this.onCommentSubmit(newComment);
            
            // Show success
            this.showSuccess('Comment posted!');
            
        } catch (error) {
            console.error('Error submitting comment:', error);
            this.showError('Failed to post comment');
        } finally {
            this.isLoading = false;
            this.hideSendingState();
        }
    }

    async likeComment(commentId) {
        try {
            const comment = await this.apiService.likeComment(commentId);
            
            // Update local state
            const videoComments = this.comments.get(this.currentVideoId);
            if (videoComments) {
                const commentIndex = videoComments.findIndex(c => c.id === commentId);
                if (commentIndex !== -1) {
                    videoComments[commentIndex] = { ...videoComments[commentIndex], ...comment };
                    this.comments.set(this.currentVideoId, videoComments);
                    
                    // Update UI
                    this.updateCommentLikes(commentId, comment.likes, comment.isLiked);
                }
            }
            
            // Callback
            this.onCommentLike(commentId);
            
        } catch (error) {
            console.error('Error liking comment:', error);
            this.showError('Failed to like comment');
        }
    }

    updateCommentLikes(commentId, likes, isLiked) {
        const commentElement = this.commentsList.querySelector(`[data-comment-id="${commentId}"]`);
        if (!commentElement) return;

        const likeBtn = commentElement.querySelector('.comment-like-btn');
        const likeCount = commentElement.querySelector('.like-count');
        const likeIcon = commentElement.querySelector('.fa-heart');

        if (likeBtn && likeCount && likeIcon) {
            likeCount.textContent = helpers.formatCount(likes);
            
            if (isLiked) {
                likeBtn.classList.add('liked');
                likeIcon.classList.add('fas');
                likeIcon.classList.remove('far');
                likeIcon.style.color = '#fe2c55';
            } else {
                likeBtn.classList.remove('liked');
                likeIcon.classList.add('far');
                likeIcon.classList.remove('fas');
                likeIcon.style.color = '';
            }
        }
    }

    // Event Handlers
    handleInput(e) {
        const text = e.target.value;
        const charCount = text.length;
        const maxChars = 500;

        // Update character count
        this.updateCharCount(charCount, maxChars);

        // Auto-resize textarea
        if (this.commentInput.tagName === 'TEXTAREA') {
            this.autoResizeTextarea();
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.submitComment();
        }
    }

    handleInputFocus() {
        document.body.classList.add('comment-input-focused');
    }

    handleInputBlur() {
        document.body.classList.remove('comment-input-focused');
    }

    handleCommentAction(e) {
        const target = e.target.closest('.comment-like-btn') || 
                      e.target.closest('.comment-reply-btn') ||
                      e.target.closest('.hashtag') ||
                      e.target.closest('.mention') ||
                      e.target.closest('.comment-link');

        if (!target) return;

        e.stopPropagation();

        if (target.classList.contains('comment-like-btn')) {
            const commentId = target.dataset.commentId;
            this.likeComment(commentId);
        } else if (target.classList.contains('comment-reply-btn')) {
            const commentId = target.dataset.commentId;
            this.startReply(commentId);
        } else if (target.classList.contains('hashtag')) {
            const hashtag = target.textContent.slice(1);
            this.searchHashtag(hashtag);
        } else if (target.classList.contains('mention')) {
            const username = target.textContent.slice(1);
            this.goToProfile(username);
        } else if (target.classList.contains('comment-link')) {
            // Links open in new tab by default
        }
    }

    // Utility Methods
    updateCharCount(current, max) {
        let counter = this.commentsList.querySelector('.char-counter');
        
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'char-counter';
            this.commentInput.parentNode.appendChild(counter);
        }

        counter.textContent = `${current}/${max}`;
        counter.className = `char-counter ${current > max * 0.8 ? 'warning' : ''} ${current > max ? 'error' : ''}`;
    }

    autoResizeTextarea() {
        this.commentInput.style.height = 'auto';
        this.commentInput.style.height = Math.min(this.commentInput.scrollHeight, 120) + 'px';
    }

    async loadMoreComments() {
        if (this.isLoading || !this.currentVideoId) return;

        this.isLoading = true;
        
        try {
            const currentComments = this.comments.get(this.currentVideoId) || [];
            const lastCommentId = currentComments[currentComments.length - 1]?.id;
            
            const moreComments = await this.apiService.getMoreComments(this.currentVideoId, lastCommentId);
            
            if (moreComments.length > 0) {
                const updatedComments = [...currentComments, ...moreComments];
                this.comments.set(this.currentVideoId, updatedComments);
                this.renderComments(updatedComments);
            }
            
        } catch (error) {
            console.error('Error loading more comments:', error);
        } finally {
            this.isLoading = false;
        }
    }

    startReply(commentId) {
        const comment = this.findComment(commentId);
        if (!comment) return;

        this.commentInput.value = `@${comment.user.username} `;
        this.commentInput.focus();
        
        // Store reply context
        this.replyContext = {
            parentCommentId: commentId,
            replyingTo: comment.user.username
        };
    }

    findComment(commentId) {
        const videoComments = this.comments.get(this.currentVideoId);
        return videoComments?.find(comment => comment.id === commentId);
    }

    searchHashtag(hashtag) {
        // Navigate to discover page with hashtag filter
        window.dispatchEvent(new CustomEvent('hashtagSearch', { 
            detail: { hashtag } 
        }));
    }

    goToProfile(username) {
        // Navigate to user profile
        window.dispatchEvent(new CustomEvent('profileView', { 
            detail: { username } 
        }));
    }

    // UI State Management
    showLoading() {
        this.commentsList?.classList.add('loading');
    }

    hideLoading() {
        this.commentsList?.classList.remove('loading');
    }

    showSendingState() {
        const sendBtn = document.getElementById('sendCommentBtn');
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
    }

    hideSendingState() {
        const sendBtn = document.getElementById('sendCommentBtn');
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
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
    getCommentCount(videoId) {
        const comments = this.comments.get(videoId);
        return comments ? comments.length : 0;
    }

    addComment(comment) {
        if (!this.currentVideoId) return;

        const videoComments = this.comments.get(this.currentVideoId) || [];
        videoComments.unshift(comment);
        this.comments.set(this.currentVideoId, videoComments);
        
        this.renderComments(videoComments);
    }

    clearComments() {
        this.comments.clear();
        this.currentVideoId = null;
        
        if (this.commentsList) {
            this.commentsList.innerHTML = '';
        }
    }

    destroy() {
        this.comments.clear();
        this.commentsList = null;
        this.commentInput = null;
    }
}

export default CommentSystem;

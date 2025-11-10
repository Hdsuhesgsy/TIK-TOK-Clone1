// Video Player Component - TikTok Clone
import { helpers } from '../utils/helpers.js';
import { constants } from '../utils/constants.js';

export class VideoManager {
    constructor(config = {}) {
        this.videoFeed = config.videoFeed;
        this.onVideoChange = config.onVideoChange || (() => {});
        this.onVideoEnd = config.onVideoEnd || (() => {});
        this.onVideoPlay = config.onVideoPlay || (() => {});
        this.onVideoPause = config.onVideoPause || (() => {});
        
        this.videos = [];
        this.currentVideoIndex = 0;
        this.currentVideoId = null;
        this.isPlaying = false;
        this.isMuted = true; // Start muted for autoplay
        this.volume = 1;
        this.playbackRate = 1;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.setupVideoPreloading();
    }

    setupEventListeners() {
        // Video event delegation
        this.videoFeed.addEventListener('click', (e) => this.handleVideoClick(e));
        this.videoFeed.addEventListener('dblclick', (e) => this.handleDoubleTap(e));
        
        // Touch events for mobile gestures
        this.videoFeed.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.videoFeed.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
        
        // Visibility change
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }

    setupIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.playVideo(entry.target);
                    } else {
                        this.pauseVideo(entry.target);
                    }
                });
            },
            {
                root: this.videoFeed,
                threshold: 0.8
            }
        );
    }

    setupVideoPreloading() {
        // Preload next video for smooth transitions
        this.preloadNextVideo();
    }

    loadVideos(videos) {
        this.videos = videos;
        this.renderVideos();
        
        if (videos.length > 0) {
            this.currentVideoId = videos[0].id;
            this.setupVideoObservers();
        }
    }

    renderVideos() {
        if (!this.videoFeed) return;

        this.videoFeed.innerHTML = this.videos.map(video => `
            <div class="video-container" data-video-id="${video.id}">
                <video 
                    class="video-player"
                    preload="metadata"
                    playsinline
                    webkit-playsinline
                    muted
                    loop
                >
                    <source src="${video.videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                
                <div class="video-overlay">
                    <div class="video-info">
                        <div class="user-info">
                            <img src="${video.user.avatar}" alt="${video.user.displayName}" class="user-avatar">
                            <div class="user-details">
                                <span class="username">@${video.user.username}</span>
                                <span class="display-name">${video.user.displayName}</span>
                            </div>
                            <button class="follow-btn ${video.user.isFollowing ? 'following' : ''}" 
                                    data-user-id="${video.user.id}">
                                ${video.user.isFollowing ? 'Following' : 'Follow'}
                            </button>
                        </div>
                        
                        <p class="video-caption">${video.caption}</p>
                        
                        <div class="sound-info">
                            <i class="fas fa-music"></i>
                            <span>${video.sound}</span>
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        <div class="action-btn like-btn ${video.isLiked ? 'liked' : ''}" data-video-id="${video.id}">
                            <i class="fas fa-heart"></i>
                            <span class="count">${helpers.formatCount(video.likes)}</span>
                        </div>
                        
                        <div class="action-btn comment-btn" data-video-id="${video.id}">
                            <i class="fas fa-comment"></i>
                            <span class="count">${helpers.formatCount(video.comments)}</span>
                        </div>
                        
                        <div class="action-btn share-btn" data-video-id="${video.id}">
                            <i class="fas fa-share"></i>
                            <span class="count">${helpers.formatCount(video.shares)}</span>
                        </div>
                        
                        <div class="action-btn save-btn ${video.isSaved ? 'saved' : ''}" data-video-id="${video.id}">
                            <i class="fas fa-bookmark"></i>
                        </div>
                    </div>
                </div>
                
                <div class="video-controls">
                    <div class="progress-bar">
                        <div class="progress" style="width: 0%"></div>
                    </div>
                    <div class="control-buttons">
                        <button class="control-btn play-pause-btn">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="control-btn mute-btn">
                            <i class="fas fa-volume-mute"></i>
                        </button>
                        <span class="time-display">0:00 / ${helpers.formatTime(video.duration)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        this.setupVideoEvents();
    }

    setupVideoEvents() {
        const videos = this.videoFeed.querySelectorAll('.video-player');
        const playButtons = this.videoFeed.querySelectorAll('.play-pause-btn');
        const muteButtons = this.videoFeed.querySelectorAll('.mute-btn');
        const likeButtons = this.videoFeed.querySelectorAll('.like-btn');
        const followButtons = this.videoFeed.querySelectorAll('.follow-btn');

        videos.forEach(video => {
            video.addEventListener('loadeddata', () => this.onVideoLoaded(video));
            video.addEventListener('timeupdate', () => this.onTimeUpdate(video));
            video.addEventListener('ended', () => this.onVideoEnded(video));
            video.addEventListener('waiting', () => this.onVideoWaiting(video));
            video.addEventListener('canplay', () => this.onVideoCanPlay(video));
            
            // Add to intersection observer
            this.intersectionObserver.observe(video);
        });

        playButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const videoContainer = btn.closest('.video-container');
                this.togglePlayback(videoContainer);
            });
        });

        muteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const videoContainer = btn.closest('.video-container');
                this.toggleMute(videoContainer);
            });
        });

        likeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const videoId = btn.dataset.videoId;
                this.toggleLike(videoId, btn);
            });
        });

        followButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const userId = btn.dataset.userId;
                this.toggleFollow(userId, btn);
            });
        });
    }

    setupVideoObservers() {
        const videoContainers = this.videoFeed.querySelectorAll('.video-container');
        
        videoContainers.forEach((container, index) => {
            this.intersectionObserver.observe(container);
        });
    }

    playVideo(videoElement) {
        if (!videoElement) return;
        
        const video = videoElement.tagName === 'VIDEO' ? videoElement : videoElement.querySelector('video');
        if (!video) return;

        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    this.isPlaying = true;
                    this.updatePlayButton(video, true);
                    this.onVideoPlay(video.dataset.videoId);
                })
                .catch(error => {
                    console.log('Autoplay prevented:', error);
                    this.isPlaying = false;
                    this.updatePlayButton(video, false);
                });
        }
    }

    pauseVideo(videoElement) {
        if (!videoElement) return;
        
        const video = videoElement.tagName === 'VIDEO' ? videoElement : videoElement.querySelector('video');
        if (!video) return;

        video.pause();
        this.isPlaying = false;
        this.updatePlayButton(video, false);
        this.onVideoPause(video.dataset.videoId);
    }

    togglePlayback(videoContainer) {
        const video = videoContainer.querySelector('video');
        if (!video) return;

        if (video.paused) {
            this.playVideo(video);
        } else {
            this.pauseVideo(video);
        }
    }

    toggleMute(videoContainer) {
        const video = videoContainer.querySelector('video');
        const muteBtn = videoContainer.querySelector('.mute-btn');
        
        if (!video) return;

        video.muted = !video.muted;
        this.isMuted = video.muted;
        
        // Update mute button icon
        const icon = muteBtn.querySelector('i');
        if (video.muted) {
            icon.className = 'fas fa-volume-mute';
        } else {
            icon.className = 'fas fa-volume-up';
        }
    }

    toggleLike(videoId, button) {
        const video = this.videos.find(v => v.id == videoId);
        if (!video) return;

        video.isLiked = !video.isLiked;
        video.likes += video.isLiked ? 1 : -1;

        // Update UI
        const countElement = button.querySelector('.count');
        const icon = button.querySelector('i');

        if (video.isLiked) {
            button.classList.add('liked');
            icon.className = 'fas fa-heart';
            icon.style.color = '#fe2c55';
            icon.classList.add('heart-animation');
        } else {
            button.classList.remove('liked');
            icon.className = 'far fa-heart';
            icon.style.color = '';
            icon.classList.remove('heart-animation');
        }

        countElement.textContent = helpers.formatCount(video.likes);

        // Remove animation class after animation completes
        setTimeout(() => {
            icon.classList.remove('heart-animation');
        }, 600);
    }

    toggleFollow(userId, button) {
        const user = this.videos.find(v => v.user.id == userId)?.user;
        if (!user) return;

        user.isFollowing = !user.isFollowing;

        if (user.isFollowing) {
            button.textContent = 'Following';
            button.classList.add('following');
            button.style.background = '#333';
        } else {
            button.textContent = 'Follow';
            button.classList.remove('following');
            button.style.background = '#fe2c55';
        }
    }

    nextVideo() {
        if (this.currentVideoIndex < this.videos.length - 1) {
            this.currentVideoIndex++;
            this.switchToVideo(this.currentVideoIndex);
        }
    }

    previousVideo() {
        if (this.currentVideoIndex > 0) {
            this.currentVideoIndex--;
            this.switchToVideo(this.currentVideoIndex);
        }
    }

    switchToVideo(index) {
        const videoContainers = this.videoFeed.querySelectorAll('.video-container');
        const targetContainer = videoContainers[index];
        
        if (!targetContainer) return;

        // Scroll to video
        targetContainer.scrollIntoView({ behavior: 'smooth' });
        
        // Update current video
        this.currentVideoIndex = index;
        this.currentVideoId = this.videos[index]?.id;
        
        // Callback
        this.onVideoChange(this.currentVideoId);
    }

    // Event Handlers
    handleVideoClick(e) {
        const videoContainer = e.target.closest('.video-container');
        if (!videoContainer) return;

        this.togglePlayback(videoContainer);
    }

    handleDoubleTap(e) {
        const videoContainer = e.target.closest('.video-container');
        if (!videoContainer) return;

        const videoId = videoContainer.dataset.videoId;
        const likeBtn = videoContainer.querySelector('.like-btn');
        
        this.toggleLike(videoId, likeBtn);
        
        // Show double tap heart animation
        this.showDoubleTapAnimation(e);
    }

    handleTouchStart(e) {
        this.touchStart = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            time: Date.now()
        };
    }

    handleTouchEnd(e) {
        if (!this.touchStart) return;

        const touchEnd = {
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY,
            time: Date.now()
        };

        const deltaX = touchEnd.x - this.touchStart.x;
        const deltaY = touchEnd.y - this.touchStart.y;
        const deltaTime = touchEnd.time - this.touchStart.time;

        // Swipe detection
        if (Math.abs(deltaY) > 50 && deltaTime < 300) {
            if (deltaY > 0) {
                this.previousVideo();
            } else {
                this.nextVideo();
            }
        }

        this.touchStart = null;
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.pauseCurrentVideo();
        } else {
            this.playCurrentVideo();
        }
    }

    onVideoLoaded(video) {
        console.log('Video loaded:', video.dataset.videoId);
    }

    onTimeUpdate(video) {
        const videoContainer = video.closest('.video-container');
        const progressBar = videoContainer.querySelector('.progress');
        const timeDisplay = videoContainer.querySelector('.time-display');
        
        if (!progressBar || !timeDisplay) return;

        const progress = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${progress}%`;
        
        timeDisplay.textContent = `${helpers.formatTime(video.currentTime)} / ${helpers.formatTime(video.duration)}`;
    }

    onVideoEnded(video) {
        this.onVideoEnd(video.dataset.videoId);
    }

    onVideoWaiting(video) {
        // Show loading indicator
        video.style.opacity = '0.7';
    }

    onVideoCanPlay(video) {
        // Hide loading indicator
        video.style.opacity = '1';
    }

    // Utility Methods
    updatePlayButton(video, isPlaying) {
        const videoContainer = video.closest('.video-container');
        const playBtn = videoContainer.querySelector('.play-pause-btn i');
        
        if (!playBtn) return;

        if (isPlaying) {
            playBtn.className = 'fas fa-pause';
        } else {
            playBtn.className = 'fas fa-play';
        }
    }

    showDoubleTapAnimation(event) {
        const heart = document.createElement('div');
        heart.className = 'double-tap-heart';
        heart.innerHTML = '<i class="fas fa-heart"></i>';
        heart.style.left = `${event.clientX - 25}px`;
        heart.style.top = `${event.clientY - 25}px`;
        
        document.body.appendChild(heart);
        
        setTimeout(() => {
            heart.remove();
        }, 1000);
    }

    preloadNextVideo() {
        // Preload next video for better performance
        const nextIndex = this.currentVideoIndex + 1;
        if (nextIndex < this.videos.length) {
            const nextVideo = this.videos[nextIndex];
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'video';
            link.href = nextVideo.videoUrl;
            document.head.appendChild(link);
        }
    }

    playCurrentVideo() {
        const currentVideo = this.videoFeed.querySelector(`[data-video-id="${this.currentVideoId}"] video`);
        if (currentVideo) {
            this.playVideo(currentVideo);
        }
    }

    pauseCurrentVideo() {
        const currentVideo = this.videoFeed.querySelector(`[data-video-id="${this.currentVideoId}"] video`);
        if (currentVideo) {
            this.pauseVideo(currentVideo);
        }
    }

    // Public API
    getCurrentVideo() {
        return this.videos[this.currentVideoIndex];
    }

    getVideoById(id) {
        return this.videos.find(video => video.id == id);
    }

    addVideo(videoData) {
        this.videos.unshift(videoData);
        this.renderVideos();
        this.currentVideoIndex = 0;
        this.currentVideoId = videoData.id;
    }

    removeVideo(videoId) {
        this.videos = this.videos.filter(video => video.id !== videoId);
        this.renderVideos();
    }

    destroy() {
        this.intersectionObserver?.disconnect();
        this.videoFeed.innerHTML = '';
        this.videos = [];
    }
}

export default VideoManager;

// Video feed functionality
const videoContainers = document.querySelectorAll('.video-container');
const videoFeed = document.querySelector('.video-feed');
let currentVideoIndex = 0;

// Initialize first video
function initializeVideos() {
    videoContainers.forEach((container, index) => {
        if (index === 0) {
            container.classList.add('active');
            const video = container.querySelector('video');
            video.play().catch(e => console.log('Autoplay prevented:', e));
        } else {
            container.classList.remove('active');
        }
    });
}

// Switch to video by index
function switchVideo(index) {
    if (index < 0 || index >= videoContainers.length) return;
    
    // Pause current video
    const currentVideo = videoContainers[currentVideoIndex].querySelector('video');
    currentVideo.pause();
    
    // Remove active class from all videos
    videoContainers.forEach(container => container.classList.remove('active'));
    
    // Set new active video
    currentVideoIndex = index;
    videoContainers[currentVideoIndex].classList.add('active');
    
    // Play new video
    const newVideo = videoContainers[currentVideoIndex].querySelector('video');
    newVideo.play().catch(e => console.log('Video play prevented:', e));
}

// Handle scroll for video switching
let isScrolling = false;
videoFeed.addEventListener('scroll', () => {
    if (isScrolling) return;
    
    isScrolling = true;
    const scrollPosition = videoFeed.scrollTop;
    const windowHeight = window.innerHeight;
    const newIndex = Math.round(scrollPosition / windowHeight);
    
    if (newIndex !== currentVideoIndex) {
        switchVideo(newIndex);
    }
    
    setTimeout(() => {
        isScrolling = false;
    }, 100);
});

// Like button functionality
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const icon = this.querySelector('i');
        if (icon.classList.contains('fa-heart')) {
            icon.classList.toggle('fas');
            icon.classList.toggle('far');
            
            if (icon.classList.contains('far')) {
                icon.style.color = '#fff';
            } else {
                icon.style.color = '#fe2c55';
            }
        }
    });
});

// Follow button functionality
document.querySelectorAll('.follow-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.textContent === 'Follow') {
            this.textContent = 'Following';
            this.style.background = '#333';
        } else {
            this.textContent = 'Follow';
            this.style.background = '#fe2c55';
        }
    });
});

// Tab switching
document.querySelectorAll('.nav-center span').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.nav-center span').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
    });
});

// Initialize the app
initializeVideos();

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowDown') {
        e.preventDefault();
        switchVideo(Math.min(currentVideoIndex + 1, videoContainers.length - 1));
        videoFeed.scrollTo(0, (currentVideoIndex) * window.innerHeight);
    } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        switchVideo(Math.max(currentVideoIndex - 1, 0));
        videoFeed.scrollTo(0, (currentVideoIndex) * window.innerHeight);
    } else if (e.code === 'Space') {
        e.preventDefault();
        const currentVideo = videoContainers[currentVideoIndex].querySelector('video');
        if (currentVideo.paused) {
            currentVideo.play();
        } else {
            currentVideo.pause();
        }
    }
});

// Application Constants - TikTok Clone

export const constants = {
    // App Configuration
    APP_NAME: 'TikTok Clone',
    APP_VERSION: '1.0.0',
    APP_BUILD: '2024.01.001',
    
    // API Configuration
    API_BASE_URL: 'https://api.tiktok-clone.com/v1',
    API_TIMEOUT: 10000,
    API_RETRY_ATTEMPTS: 3,
    
    // Video Configuration
    VIDEO: {
        MAX_DURATION: 60, // seconds
        MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
        SUPPORTED_FORMATS: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
        MIN_RESOLUTION: { width: 480, height: 854 },
        MAX_RESOLUTION: { width: 1080, height: 1920 },
        DEFAULT_VOLUME: 0.8,
        PLAYBACK_RATES: [0.5, 0.75, 1, 1.25, 1.5, 2],
        PRELOAD_DISTANCE: 2 // number of videos to preload ahead
    },
    
    // Upload Configuration
    UPLOAD: {
        MAX_CAPTION_LENGTH: 150,
        MAX_HASHTAGS: 10,
        PRIVACY_OPTIONS: ['public', 'friends', 'private'],
        DEFAULT_PRIVACY: 'public',
        COMPRESSION_QUALITY: 0.8
    },
    
    // Comments Configuration
    COMMENTS: {
        MAX_LENGTH: 500,
        MAX_REPLIES: 10,
        MAX_DEPTH: 2,
        PAGINATION_LIMIT: 20,
        AUTO_LOAD_MORE: true
    },
    
    // User Configuration
    USER: {
        USERNAME: {
            MIN_LENGTH: 3,
            MAX_LENGTH: 24,
            ALLOWED_CHARS: /^[a-zA-Z0-9_.]+$/,
            RESERVED_NAMES: ['admin', 'support', 'tiktok', 'official']
        },
        DISPLAY_NAME: {
            MIN_LENGTH: 1,
            MAX_LENGTH: 30
        },
        BIO: {
            MAX_LENGTH: 80
        },
        AVATAR: {
            MAX_SIZE: 5 * 1024 * 1024, // 5MB
            SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            DIMENSIONS: { width: 200, height: 200 }
        }
    },
    
    // Navigation Configuration
    NAVIGATION: {
        PAGES: ['home', 'discover', 'upload', 'inbox', 'profile'],
        TABS: ['foryou', 'following'],
        SWIPE_THRESHOLD: 50, // pixels
        SWIPE_TIMEOUT: 300, // milliseconds
        BACK_BUTTON_EXIT_DELAY: 2000 // milliseconds
    },
    
    // Cache Configuration
    CACHE: {
        VERSION: 'v1.2.0',
        MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
        VIDEO_CACHE_SIZE: 10, // number of videos
        IMAGE_CACHE_SIZE: 50, // number of images
        CLEANUP_INTERVAL: 24 * 60 * 60 * 1000 // 24 hours
    },
    
    // Performance Configuration
    PERFORMANCE: {
        DEBOUNCE_DELAY: 300,
        THROTTLE_DELAY: 100,
        LAZY_LOAD_OFFSET: 100, // pixels
        MEMORY_WARNING_LIMIT: 0.8, // 80% memory usage
        GC_INTERVAL: 30 * 1000 // 30 seconds
    },
    
    // Analytics Events
    EVENTS: {
        // Video Events
        VIDEO_PLAY: 'video_play',
        VIDEO_PAUSE: 'video_pause',
        VIDEO_END: 'video_end',
        VIDEO_VIEW: 'video_view',
        VIDEO_LIKE: 'video_like',
        VIDEO_SHARE: 'video_share',
        VIDEO_COMMENT: 'video_comment',
        VIDEO_SAVE: 'video_save',
        
        // User Events
        USER_SIGNUP: 'user_signup',
        USER_LOGIN: 'user_login',
        USER_LOGOUT: 'user_logout',
        USER_FOLLOW: 'user_follow',
        USER_UNFOLLOW: 'user_unfollow',
        
        // Navigation Events
        PAGE_VIEW: 'page_view',
        TAB_SWITCH: 'tab_switch',
        SEARCH: 'search',
        
        // App Events
        APP_LOAD: 'app_load',
        APP_ERROR: 'app_error',
        APP_CRASH: 'app_crash',
        OFFLINE_MODE: 'offline_mode'
    },
    
    // Error Messages
    ERRORS: {
        NETWORK: {
            OFFLINE: 'You are currently offline. Please check your connection.',
            TIMEOUT: 'Request timed out. Please try again.',
            SERVER_ERROR: 'Server error. Please try again later.',
            NOT_FOUND: 'The requested resource was not found.'
        },
        
        VIDEO: {
            FORMAT_NOT_SUPPORTED: 'Video format not supported.',
            FILE_TOO_LARGE: 'Video file is too large. Maximum size is 100MB.',
            DURATION_TOO_LONG: 'Video duration is too long. Maximum is 60 seconds.',
            UPLOAD_FAILED: 'Failed to upload video. Please try again.',
            PLAYBACK_FAILED: 'Failed to play video. The file may be corrupted.'
        },
        
        USER: {
            INVALID_CREDENTIALS: 'Invalid email or password.',
            USERNAME_TAKEN: 'Username is already taken.',
            EMAIL_EXISTS: 'Email is already registered.',
            PROFILE_UPDATE_FAILED: 'Failed to update profile.',
            FOLLOW_FAILED: 'Failed to follow user.'
        },
        
        COMMENTS: {
            TOO_LONG: 'Comment is too long. Maximum is 500 characters.',
            POST_FAILED: 'Failed to post comment.',
            LIKE_FAILED: 'Failed to like comment.'
        },
        
        GENERAL: {
            UNEXPECTED_ERROR: 'An unexpected error occurred.',
            PERMISSION_DENIED: 'Permission denied.',
            RATE_LIMITED: 'Too many requests. Please try again later.'
        }
    },
    
    // Success Messages
    SUCCESS: {
        VIDEO_UPLOADED: 'Video uploaded successfully!',
        COMMENT_POSTED: 'Comment posted successfully!',
        PROFILE_UPDATED: 'Profile updated successfully!',
        FOLLOW_SUCCESS: 'You are now following this user.',
        UNFOLLOW_SUCCESS: 'You have unfollowed this user.'
    },
    
    // Local Storage Keys
    STORAGE_KEYS: {
        AUTH_TOKEN: 'auth_token',
        USER_DATA: 'user_data',
        APP_SETTINGS: 'app_settings',
        RECENT_SEARCHES: 'recent_searches',
        WATCH_HISTORY: 'watch_history',
        OFFLINE_ACTIONS: 'offline_actions',
        CACHE_TIMESTAMP: 'cache_timestamp'
    },
    
    // Feature Flags
    FEATURES: {
        OFFLINE_MODE: true,
        PUSH_NOTIFICATIONS: true,
        DARK_MODE: true,
        AUTO_PLAY: true,
        DATA_SAVER: false,
        ANALYTICS: true,
        DEBUG_MODE: process.env.NODE_ENV === 'development'
    },
    
    // Social Media Links
    SOCIAL: {
        WEBSITE: 'https://tiktok-clone.com',
        SUPPORT_EMAIL: 'support@tiktok-clone.com',

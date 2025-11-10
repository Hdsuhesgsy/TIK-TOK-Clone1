// Utility Functions for TikTok Clone
export const helpers = {
    // Format large numbers (1.2K, 3.4M, etc.)
    formatCount(count) {
        if (typeof count !== 'number') {
            count = parseInt(count) || 0;
        }

        if (count >= 1000000) {
            return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        } else {
            return count.toString();
        }
    },

    // Format time (seconds to MM:SS)
    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) {
            return '0:00';
        }

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    // Format date relative to now
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Debounce function
    debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Deep clone object
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (obj instanceof Object) {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    // Sanitize HTML
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    // Parse hashtags from text
    parseHashtags(text) {
        const hashtagRegex = /#(\w+)/g;
        const matches = text.match(hashtagRegex);
        return matches ? matches.map(tag => tag.slice(1)) : [];
    },

    // Parse mentions from text
    parseMentions(text) {
        const mentionRegex = /@(\w+)/g;
        const matches = text.match(mentionRegex);
        return matches ? matches.map(mention => mention.slice(1)) : [];
    },

    // Validate email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate URL
    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // Get file extension
    getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    },

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Check if mobile device
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // Check if touch device
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    // Get screen orientation
    getScreenOrientation() {
        if (window.screen.orientation) {
            return window.screen.orientation.type;
        } else {
            return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        }
    },

    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                return successful;
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
            return false;
        }
    },

    // Share content
    async shareContent(title, text, url) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url
                });
                return true;
            } catch (err) {
                console.error('Error sharing:', err);
                return false;
            }
        } else {
            // Fallback: copy to clipboard
            return await this.copyToClipboard(url);
        }
    },

    // Local storage helpers
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (err) {
                console.error('Error saving to localStorage:', err);
                return false;
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (err) {
                console.error('Error reading from localStorage:', err);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (err) {
                console.error('Error removing from localStorage:', err);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (err) {
                console.error('Error clearing localStorage:', err);
                return false;
            }
        }
    },

    // Session storage helpers
    session: {
        set(key, value) {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (err) {
                console.error('Error saving to sessionStorage:', err);
                return false;
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = sessionStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (err) {
                console.error('Error reading from sessionStorage:', err);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                sessionStorage.removeItem(key);
                return true;
            } catch (err) {
                console.error('Error removing from sessionStorage:', err);
                return false;
            }
        }
    },

    // Cookie helpers
    cookies: {
        set(name, value, days = 365) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = `expires=${date.toUTCString()}`;
            document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
        },

        get(name) {
            const nameEQ = name + '=';
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        },

        remove(name) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
    },

    // Performance monitoring
    performance: {
        mark(name) {
            if (window.performance && performance.mark) {
                performance.mark(name);
            }
        },

        measure(name, startMark, endMark) {
            if (window.performance && performance.measure) {
                performance.measure(name, startMark, endMark);
                const measures = performance.getEntriesByName(name);
                return measures[0]?.duration || 0;
            }
            return 0;
        }
    },

    // Error handling
    errorHandler: {
        capture(error, context = {}) {
            const errorInfo = {
                error: error.toString(),
                context,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            console.error('Captured error:', errorInfo);
            
            // In a real app, you'd send this to your error tracking service
            // Sentry, LogRocket, etc.

            return errorInfo;
        }
    }
};

export default helpers;

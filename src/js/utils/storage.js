// Advanced Storage Management - TikTok Clone
import { constants } from './constants.js';
import { helpers } from './helpers.js';

export class StorageManager {
    constructor() {
        this.prefix = 'tiktok_';
        this.encryptionKey = null;
        this.isEncryptionSupported = this.checkEncryptionSupport();
        this.init();
    }

    init() {
        this.setupCleanupInterval();
        this.migrateOldData();
        this.setupStorageEventListener();
    }

    // Basic Storage Operations
    set(key, value, options = {}) {
        try {
            const storageKey = this.getStorageKey(key);
            const storage = this.getStorage(options.storageType);
            
            const data = {
                value,
                timestamp: Date.now(),
                expires: options.expires ? Date.now() + options.expires : null,
                version: constants.APP_VERSION
            };

            const serialized = options.encrypt && this.isEncryptionSupported 
                ? this.encrypt(JSON.stringify(data))
                : JSON.stringify(data);

            storage.setItem(storageKey, serialized);
            
            this.emitStorageEvent('set', key, value);
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            this.handleStorageError(error, 'set', key);
            return false;
        }
    }

    get(key, defaultValue = null, options = {}) {
        try {
            const storageKey = this.getStorageKey(key);
            const storage = this.getStorage(options.storageType);
            const item = storage.getItem(storageKey);

            if (!item) return defaultValue;

            let data;
            try {
                const decoded = options.encrypt && this.isEncryptionSupported 
                    ? this.decrypt(item)
                    : item;
                data = JSON.parse(decoded);
            } catch (parseError) {
                // If parsing fails, treat as raw string
                return item;
            }

            // Check if data is expired
            if (data.expires && Date.now() > data.expires) {
                this.remove(key, options);
                return defaultValue;
            }

            // Handle data migration if version differs
            if (data.version && data.version !== constants.APP_VERSION) {
                const migrated = this.migrateData(key, data.value, data.version);
                if (migrated !== null) {
                    data.value = migrated;
                    this.set(key, migrated, options);
                }
            }

            return data.value !== undefined ? data.value : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }

    remove(key, options = {}) {
        try {
            const storageKey = this.getStorageKey(key);
            const storage = this.getStorage(options.storageType);
            const oldValue = this.get(key, null, options);
            
            storage.removeItem(storageKey);
            
            this.emitStorageEvent('remove', key, oldValue);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    clear(options = {}) {
        try {
            const storage = this.getStorage(options.storageType);
            const prefix = this.prefix;
            
            // Only remove keys with our prefix
            if (options.onlyAppData) {
                const keysToRemove = [];
                for (let i = 0; i < storage.length; i++) {
                    const key = storage.key(i);
                    if (key.startsWith(prefix)) {
                        keysToRemove.push(key);
                    }
                }
                
                keysToRemove.forEach(key => storage.removeItem(key));
            } else {
                storage.clear();
            }
            
            this.emitStorageEvent('clear', null, null);
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    // Advanced Storage Operations
    getAll(prefix = '', options = {}) {
        const results = {};
        const storage = this.getStorage(options.storageType);
        const searchPrefix = this.getStorageKey(prefix);

        try {
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (key.startsWith(searchPrefix)) {
                    const cleanKey = key.replace(this.prefix, '');
                    results[cleanKey] = this.get(cleanKey, null, options);
                }
            }
            return results;
        } catch (error) {
            console.error('Storage getAll error:', error);
            return {};
        }
    }

    exists(key, options = {}) {
        const storageKey = this.getStorageKey(key);
        const storage = this.getStorage(options.storageType);
        return storage.getItem(storageKey) !== null;
    }

    getSize(key = null) {
        try {
            if (key) {
                const value = this.get(key);
                return new Blob([JSON.stringify(value)]).size;
            } else {
                let totalSize = 0;
                const storage = this.getStorage();
                
                for (let i = 0; i < storage.length; i++) {
                    const key = storage.key(i);
                    if (key.startsWith(this.prefix)) {
                        const value = storage.getItem(key);
                        totalSize += new Blob([value]).size;
                    }
                }
                
                return totalSize;
            }
        } catch (error) {
            console.error('Storage size calculation error:', error);
            return 0;
        }
    }

    getKeys(prefix = '', options = {}) {
        const keys = [];
        const storage = this.getStorage(options.storageType);
        const searchPrefix = this.getStorageKey(prefix);

        try {
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (key.startsWith(searchPrefix)) {
                    keys.push(key.replace(this.prefix, ''));
                }
            }
            return keys;
        } catch (error) {
            console.error('Storage getKeys error:', error);
            return [];
        }
    }

    // Specialized Storage Methods
    // User Data
    setUserData(userData) {
        return this.set(constants.STORAGE_KEYS.USER_DATA, userData, {
            encrypt: true,
            expires: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
    }

    getUserData() {
        return this.get(constants.STORAGE_KEYS.USER_DATA, null, { encrypt: true });
    }

    clearUserData() {
        this.remove(constants.STORAGE_KEYS.USER_DATA, { encrypt: true });
        this.remove(constants.STORAGE_KEYS.AUTH_TOKEN);
    }

    // Auth Token
    setAuthToken(token) {
        return this.set(constants.STORAGE_KEYS.AUTH_TOKEN, token, {
            encrypt: true,
            expires: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
    }

    getAuthToken() {
        return this.get(constants.STORAGE_KEYS.AUTH_TOKEN, null, { encrypt: true });
    }

    // Watch History
    addToWatchHistory(videoId, timestamp = Date.now()) {
        const history = this.getWatchHistory();
        const existingIndex = history.findIndex(item => item.videoId === videoId);
        
        if (existingIndex !== -1) {
            history[existingIndex].timestamp = timestamp;
            history[existingIndex].watchCount = (history[existingIndex].watchCount || 1) + 1;
        } else {
            history.unshift({
                videoId,
                timestamp,
                watchCount: 1
            });
        }
        
        // Keep only last 100 items
        const trimmedHistory = history.slice(0, 100);
        
        return this.set(constants.STORAGE_KEYS.WATCH_HISTORY, trimmedHistory, {
            expires: 365 * 24 * 60 * 60 * 1000 // 1 year
        });
    }

    getWatchHistory() {
        return this.get(constants.STORAGE_KEYS.WATCH_HISTORY, []);
    }

    clearWatchHistory() {
        return this.remove(constants.STORAGE_KEYS.WATCH_HISTORY);
    }

    // Recent Searches
    addToRecentSearches(query) {
        if (!query || query.trim().length === 0) return false;

        const searches = this.getRecentSearches();
        const existingIndex = searches.indexOf(query);
        
        if (existingIndex !== -1) {
            searches.splice(existingIndex, 1);
        }
        
        searches.unshift(query.trim());
        
        // Keep only last 20 searches
        const trimmedSearches = searches.slice(0, 20);
        
        return this.set(constants.STORAGE_KEYS.RECENT_SEARCHES, trimmedSearches);
    }

    getRecentSearches() {
        return this.get(constants.STORAGE_KEYS.RECENT_SEARCHES, []);
    }

    clearRecentSearches() {
        return this.remove(constants.STORAGE_KEYS.RECENT_SEARCHES);
    }

    // App Settings
    setAppSettings(settings) {
        const currentSettings = this.getAppSettings();
        const mergedSettings = { ...currentSettings, ...settings };
        
        return this.set(constants.STORAGE_KEYS.APP_SETTINGS, mergedSettings);
    }

    getAppSettings() {
        const defaultSettings = {
            theme: 'auto',
            language: 'en',
            autoPlay: true,
            dataSaver: false,
            downloadQuality: 'auto',
            pushNotifications: true,
            vibration: true,
            soundEffects: true
        };
        
        return this.get(constants.STORAGE_KEYS.APP_SETTINGS, defaultSettings);
    }

    // Offline Actions Queue
    addOfflineAction(action) {
        const actions = this.getOfflineActions();
        actions.push({
            ...action,
            id: helpers.generateId(),
            timestamp: Date.now(),
            retryCount: 0
        });
        
        return this.set(constants.STORAGE_KEYS.OFFLINE_ACTIONS, actions);
    }

    getOfflineActions() {
        return this.get(constants.STORAGE_KEYS.OFFLINE_ACTIONS, []);
    }

    removeOfflineAction(actionId) {
        const actions = this.getOfflineActions();
        const filteredActions = actions.filter(action => action.id !== actionId);
        return this.set(constants.STORAGE_KEYS.OFFLINE_ACTIONS, filteredActions);
    }

    clearOfflineActions() {
        return this.remove(constants.STORAGE_KEYS.OFFLINE_ACTIONS);
    }

    // Cache Management
    setCache(key, value, ttl = constants.CACHE.MAX_AGE) {
        return this.set(`cache_${key}`, value, {
            expires: ttl
        });
    }

    getCache(key) {
        return this.get(`cache_${key}`);
    }

    clearExpiredCache() {
        const cacheKeys = this.getKeys('cache_');
        let clearedCount = 0;

        cacheKeys.forEach(key => {
            // Try to get the value - if it's expired, get will remove it
            const value = this.get(key);
            if (value === null) {
                clearedCount++;
            }
        });

        return clearedCount;
    }

    // Utility Methods
    getStorage(storageType = 'local') {
        switch (storageType) {
            case 'local':
                return localStorage;
            case 'session':
                return sessionStorage;
            default:
                return localStorage;
        }
    }

    getStorageKey(key) {
        return `${this.prefix}${key}`;
    }

    checkEncryptionSupport() {
        try {
            return typeof crypto !== 'undefined' && 
                   crypto.subtle && 
                   typeof TextEncoder !== 'undefined';
        } catch {
            return false;
        }
    }

    // Simple encryption/decryption (for sensitive data)
    async encrypt(text) {
        if (!this.isEncryptionSupported || !this.encryptionKey) {
            return text;
        }

        try {
            // In a real app, you'd use proper encryption
            // This is a simple obfuscation for demo purposes
            return btoa(unescape(encodeURIComponent(text)));
        } catch {
            return text;
        }
    }

    async decrypt(encryptedText) {
        if (!this.isEncryptionSupported || !this.encryptionKey) {
            return encryptedText;
        }

        try {
            return decodeURIComponent(escape(atob(encryptedText)));
        } catch {
            return encryptedText;
        }
    }

    // Data Migration
    migrateData(key, value, oldVersion) {
        console.log(`Migrating data for ${key} from version ${oldVersion} to ${constants.APP_VERSION}`);
        
        // Add migration logic for different versions
        switch (key) {
            case constants.STORAGE_KEYS.USER_DATA:
                return this.migrateUserData(value, oldVersion);
            case constants.STORAGE_KEYS.APP_SETTINGS:
                return this.migrateAppSettings(value, oldVersion);
            default:
                return value;
        }
    }

    migrateUserData(userData, oldVersion) {
        // Example migration logic
        if (oldVersion === '1.0.0') {
            return {
                ...userData,
                preferences: userData.preferences || {}
            };
        }
        return userData;
    }

    migrateAppSettings(settings, oldVersion) {
        if (oldVersion === '1.0.0') {
            return {
                ...settings,
                dataSaver: settings.dataSaver || false,
                theme: settings.theme || 'auto'
            };
        }
        return settings;
    }

    // Event System
    emitStorageEvent(action, key, value) {
        const event = new CustomEvent('storageChange', {
            detail: {
                action,
                key,
                value,
                timestamp: Date.now()
            }
        });
        
        window.dispatchEvent(event);
    }

    setupStorageEventListener() {
        window.addEventListener('storage', (event) => {
            // Handle cross-tab storage events
            if (event.key && event.key.startsWith(this.prefix)) {
                const cleanKey = event.key.replace(this.prefix, '');
                this.emitStorageEvent('external', cleanKey, event.newValue);
            }
        });
    }

    // Cleanup and Maintenance
    setupCleanupInterval() {
        // Clean up expired data every hour
        setInterval(() => {
            this.cleanupExpiredData();
        }, 60 * 60 * 1000);
    }

    cleanupExpiredData() {
        const keys = this.getKeys();
        let cleanedCount = 0;

        keys.forEach(key => {
            // Try to get the value - if it's expired, get will remove it
            const value = this.get(key);
            if (value === null) {
                cleanedCount++;
            }
        });

        if (cleanedCount > 0) {
            console.log(`Cleaned up ${cleanedCount} expired storage items`);
        }

        return cleanedCount;
    }

    migrateOldData() {
        // Migrate from old storage format if needed
        const oldKeys = [
            'user',
            'token',
            'settings'
        ];

        oldKeys.forEach(oldKey => {
            const oldValue = localStorage.getItem(oldKey);
            if (oldValue) {
                this.set(oldKey, JSON.parse(oldValue));
                localStorage.removeItem(oldKey);
            }
        });
    }

    handleStorageError(error, operation, key) {
        console.error(`Storage ${operation} error for key "${key}":`, error);
        
        // Handle quota exceeded error
        if (error.name === 'QuotaExceededError' || error.code === 22) {
            this.handleQuotaExceeded();
        }
    }

    handleQuotaExceeded() {
        // Clear cache and non-essential data
        const cacheKeys = this.getKeys('cache_');
        cacheKeys.forEach(key => this.remove(key));
        
        // Clear old watch history
        const history = this.getWatchHistory();
        if (history.length > 50) {
            this.set(constants.STORAGE_KEYS.WATCH_HISTORY, history.slice(0, 50));
        }
        
        console.warn('Storage quota exceeded, cleared cache and trimmed history');
    }

    // Public API
    getInfo() {
        const keys = this.getKeys();
        const totalSize = this.getSize();
        
        return {
            totalItems: keys.length,
            totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
            encryptionSupported: this.isEncryptionSupported,
            quota: this.getQuotaInfo()
        };
    }

    getQuotaInfo() {
        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                return navigator.storage.estimate();
            }
            return null;
        } catch {
            return null;
        }
    }

    exportData() {
        const allData = this.getAll();
        const blob = new Blob([JSON.stringify(allData, null, 2)], {
            type: 'application/json'
        });
        
        return URL.createObjectURL(blob);
    }

    importData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            Object.keys(data).forEach(key => {
                this.set(key, data[key]);
            });
            
            return true;
        } catch (error) {
            console.error('Data import error:', error);
            return false;
        }
    }

    // Destructor
    destroy() {
        // Clean up any intervals or event listeners
        this.clearCleanupInterval();
    }

    clearCleanupInterval() {
        // This would clear the interval if we stored its ID
        // For now, it's a placeholder for proper cleanup
    }
}

// Create singleton instance
export const storage = new StorageManager();

// Export for direct use
export default storage;

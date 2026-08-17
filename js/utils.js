/**
 * Textorr - Shared Utilities & History Management
 */

// Global Toast/Tooltip Notification helper
function showTooltip(message, type = 'success') {
    // Find or create toast element
    let tooltip = document.getElementById('tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'tooltip';
        tooltip.className = 'tooltip';
        document.body.appendChild(tooltip);
    }
    
    // Set message and type
    tooltip.textContent = message;
    tooltip.className = 'tooltip show';
    if (type === 'error') {
        tooltip.classList.add('error');
    }
    
    // Auto hide after 3 seconds
    if (window.tooltipTimeout) {
        clearTimeout(window.tooltipTimeout);
    }
    window.tooltipTimeout = setTimeout(() => {
        tooltip.classList.remove('show');
    }, 3000);
}

// History Management System (User-isolated localStorage)
const TextorrHistory = {
    STORAGE_KEY: 'textorr_activity_history',

    // Helper to get active session user ID (email)
    getCurrentUserId() {
        try {
            const sessionData = localStorage.getItem('textorr_session');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                return session.email || 'anonymous';
            }
        } catch (e) {
            console.error('Error reading session for history:', e);
        }
        return 'anonymous';
    },

    // Save an activity entry to history (User-specific)
    addActivity(type, data) {
        try {
            const allHistory = this.getAllRaw();
            const newEntry = {
                id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: this.getCurrentUserId(),
                type, // 'qr', 'voice', 'translation'
                createdAt: Date.now(),
                data
            };
            
            allHistory.unshift(newEntry); // Newest first
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allHistory));
            return newEntry;
        } catch (e) {
            console.error('Error adding activity to history:', e);
            return null;
        }
    },

    // Get all raw history entries (all users)
    getAllRaw() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error retrieving raw history:', e);
            return [];
        }
    },

    // Get active user's history entries
    getActivities() {
        const userId = this.getCurrentUserId();
        return this.getAllRaw().filter(item => item.userId === userId);
    },

    // Delete a single entry by ID
    deleteActivity(id) {
        try {
            const allHistory = this.getAllRaw();
            const updatedHistory = allHistory.filter(item => item.id !== id);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory));
            return true;
        } catch (e) {
            console.error('Error deleting activity entry:', e);
            return false;
        }
    },

    // Clear active user's history only (leaving other users intact)
    clearActivities() {
        try {
            const userId = this.getCurrentUserId();
            const allHistory = this.getAllRaw();
            const remainingHistory = allHistory.filter(item => item.userId !== userId);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(remainingHistory));
            return true;
        } catch (e) {
            console.error('Error clearing user history:', e);
            return false;
        }
    },

    // Get usage statistics for the active user
    getActivityStats() {
        const activities = this.getActivities();
        const stats = {
            total: activities.length,
            qr: 0,
            voice: 0,
            translation: 0
        };
        
        activities.forEach(item => {
            if (stats[item.type] !== undefined) {
                stats[item.type]++;
            }
        });
        
        return stats;
    }
};

// Global Theme Switcher Utility
const TextorrTheme = {
    STORAGE_KEY: 'textorr_theme',

    init() {
        // Run immediately to prevent flash of wrong theme
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        } else if (savedTheme === 'dark') {
            document.body.classList.remove('light-theme');
        } else if (!systemPrefersDark) {
            // Default to dark, but match system if they prefer light
            document.body.classList.add('light-theme');
        }
    },

    toggle() {
        const body = document.body;
        body.classList.toggle('light-theme');
        const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
        localStorage.setItem(this.STORAGE_KEY, currentTheme);
        showTooltip(`Switched to ${currentTheme} mode`, 'success');
        return currentTheme;
    }
};

// Execute theme init immediately on import / page loading
(function() {
    // Safe execution check if DOM/body is loading
    if (document.body) {
        TextorrTheme.init();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            TextorrTheme.init();
        });
    }
})();

/**
 * Textorr - Dashboard Log & Actions Manager
 */
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const welcomeTitle = document.getElementById('welcomeTitle');
    const qrCount = document.getElementById('qrCount');
    const voiceCount = document.getElementById('voiceCount');
    const translationCount = document.getElementById('translationCount');
    const totalCount = document.getElementById('totalCount');
    const activityList = document.getElementById('activityList');
    const activityStats = document.getElementById('activityStats');
    const clearAllBtn = document.getElementById('clearAllBtn');

    // Render Dashboard Stats and Logs
    function renderDashboard() {
        const user = TextorrAuth.getCurrentUser();
        if (!user) return; // auth.js will redirect

        welcomeTitle.textContent = `Welcome back, ${user.name}!`;

        // Get statistics
        const stats = TextorrHistory.getActivityStats();
        qrCount.textContent = stats.qr;
        voiceCount.textContent = stats.voice;
        translationCount.textContent = stats.translation;
        totalCount.textContent = stats.total;

        // Get activity list
        const activities = TextorrHistory.getActivities();
        activityStats.textContent = `Showing ${activities.length} ${activities.length === 1 ? 'entry' : 'entries'}`;

        if (activities.length === 0) {
            renderEmptyState();
            clearAllBtn.style.display = 'none';
            return;
        }

        clearAllBtn.style.display = 'inline-flex';
        activityList.innerHTML = '';

        // Render activities (newest first)
        activities.forEach(item => {
            const activityItem = document.createElement('div');
            activityItem.className = `activity-item activity-${item.type}`;
            
            // Get human readable time
            const timeString = formatActivityTime(item.createdAt);
            
            let icon = '📱';
            let title = '';
            let details = '';
            let rawContent = ''; // Content for copy function
            let reuseUrl = '';

            if (item.type === 'qr') {
                icon = '📱';
                title = 'Generated QR Code';
                details = `Content: "${item.data.text}" (${item.data.size}x${item.data.size}px)`;
                rawContent = item.data.text;
                reuseUrl = `qr.html?reuse=${encodeURIComponent(item.data.text)}`;
            } else if (item.type === 'voice') {
                icon = '🎙️';
                title = 'Synthesized Voice';
                details = `"${item.data.text}" [${item.data.languageName}, Speed: ${item.data.speedName}]`;
                rawContent = item.data.text;
                reuseUrl = `voice.html?text=${encodeURIComponent(item.data.text)}&language=${item.data.language}&speed=${item.data.speed}`;
            } else if (item.type === 'translation') {
                icon = '🌐';
                title = `Translated Text (${item.data.sourceLangName} ➔ ${item.data.targetLangName})`;
                details = `"${item.data.sourceText}" ➔ "${item.data.targetText}"`;
                rawContent = item.data.targetText;
                reuseUrl = `language.html?sourceText=${encodeURIComponent(item.data.sourceText)}&sourceLang=${item.data.sourceLang}&targetLang=${item.data.targetLang}`;
            }

            activityItem.innerHTML = `
                <div class="activity-main">
                    <div class="activity-badge">${icon}</div>
                    <div class="activity-content">
                        <span class="activity-title">${title}</span>
                        <span class="activity-details" title="${details.replace(/"/g, '&quot;')}">${details}</span>
                        <span class="activity-time">${timeString}</span>
                    </div>
                </div>
                <div class="activity-actions">
                    <button class="action-icon-btn btn-copy" title="Copy Content" data-content="${rawContent.replace(/"/g, '&quot;')}">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-5 4h6m-6 4h6m-6 4h6"/>
                        </svg>
                    </button>
                    <a href="${reuseUrl}" class="action-icon-btn btn-reuse" title="Reuse Activity">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H17v4.11"/>
                        </svg>
                    </a>
                    <button class="action-icon-btn btn-delete" title="Delete Activity" data-id="${item.id}">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            `;

            activityList.appendChild(activityItem);
        });

        // Bind Event Listeners on newly rendered buttons
        bindActivityActionEvents();
    }

    // Render Empty State
    function renderEmptyState() {
        activityList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📂</div>
                <h3>No activity yet</h3>
                <p>Your generated QR codes, synthesized voices, and translation logs will appear in this workspace history log.</p>
                <a href="qr.html" class="btn btn-primary">Explore Tools</a>
            </div>
        `;
    }

    // Helper: Format timestamps nicely
    function formatActivityTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        
        // Check if today
        if (date.toDateString() === now.toDateString()) {
            return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        
        // Check if yesterday
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        
        // Otherwise full date
        return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Bind copy, delete clicks
    function bindActivityActionEvents() {
        // Copy click handler
        activityList.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const content = btn.getAttribute('data-content');
                navigator.clipboard.writeText(content).then(() => {
                    showTooltip('Content copied to clipboard!', 'success');
                }).catch(() => {
                    showTooltip('Failed to copy content', 'error');
                });
            });
        });

        // Delete click handler
        activityList.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                
                // Animate list removal
                const itemElement = btn.closest('.activity-item');
                if (itemElement) {
                    itemElement.style.opacity = '0';
                    itemElement.style.transform = 'translateX(-20px)';
                    itemElement.style.transition = 'all 0.3s ease';
                }
                
                setTimeout(() => {
                    TextorrHistory.deleteActivity(id);
                    renderDashboard();
                    showTooltip('Activity entry deleted', 'success');
                }, 300);
            });
        });
    }

    // Clear All Action
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            const confirmClear = confirm('Are you sure you want to clear your entire activity history? This action cannot be undone.');
            if (confirmClear) {
                TextorrHistory.clearActivities();
                renderDashboard();
                showTooltip('History cleared successfully', 'success');
            }
        });
    }

    // Render on load
    renderDashboard();
});

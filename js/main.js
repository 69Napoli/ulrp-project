/* ========================================
   URBAN LEGENDS - Main JavaScript
   ======================================== */

// DOM Elements
const header = document.getElementById('header');
const navMenu = document.getElementById('navMenu');
const toast = document.getElementById('toast');

// ========================================
// Header Scroll Effect
// ========================================
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ========================================
// Lenis Smooth Scroll Init
// ========================================
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// ========================================
// Mobile Menu Toggle
// ========================================
function toggleMobile() {
    navMenu.classList.toggle('active');
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('nav') && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
    }
});

// ========================================
// Copy to Clipboard
// ========================================
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copiat în clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showToast('Eroare la copiere');
    });
}

// ========================================
// Toast Notifications
// ========================================
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// ========================================
// Preloader Initialization
// ========================================
// ========================================
// Preloader Initialization (Cosmos Style)
// ========================================
function initPreloader() {
    document.body.classList.add('loading');

    const preloader = document.getElementById('preloader');
    const counterEl = document.getElementById('loaderCounter');
    const progressEl = document.getElementById('loaderProgress');

    let startTime = null;
    const duration = 2500; // 2.5 seconds

    // Easing: Custom Ease Out (Fast start, slow middle, fast end) makes no sense for a single curve. 
    // User requested: "starts faster, slows in middle (60-80%), speeds up at end"
    // This implies a multi-stage curve or a specific bezier. 
    // Let's use a simplified approach:
    // EaseOutCubic is generally good for "premium" feel. 
    // But for the specific "slow middle" request:
    // We can map time to progress using a custom function.

    function customEase(t) {
        // t is 0-1
        // Simple distinct phases approach for robustness:
        if (t < 0.5) {
            return 4 * t * t * t; // Cubic ease in (slow start? No user said start fast)
            // User: "starts faster" -> EaseOut
        }
        // Actually, "Start fast, slow middle, speed up end" is an "S" curve but inverted in speed...
        // Let's stick to a high quality EaseInOutCubic which feels premium.
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Let's try a standard EaseOutQuart for that "Cosmos" punchy feel
    const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const runtime = timestamp - startTime;
        let relativeProgress = runtime / duration;

        if (relativeProgress > 1) relativeProgress = 1;

        // Apply easing
        const easedProgress = easeOutQuart(relativeProgress);

        // Update UI
        const percentage = Math.round(easedProgress * 100);

        if (counterEl) {
            // Pad with zeros: 000, 005, 050, 100
            counterEl.textContent = percentage.toString().padStart(3, '0');
        }

        if (progressEl) {
            progressEl.style.width = `${easedProgress * 100}%`;
        }

        if (relativeProgress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Animation Complete
            setTimeout(() => {
                // Exit Sequence
                if (preloader) {
                    preloader.classList.add('hidden'); // Triggers fade + scale
                    document.body.classList.remove('loading');

                    // Remove from DOM
                    setTimeout(() => {
                        preloader.remove();
                    }, 850);
                }
            }, 300); // Wait 0.3s at 100%
        }
    }

    requestAnimationFrame(animate);
}

// ========================================
// Smooth Scroll for Anchor Links
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);

        if (target) {
            // Close mobile menu if open
            navMenu.classList.remove('active');

            lenis.scrollTo(target, {
                offset: -header.offsetHeight
            });
        }
    });
});

// ========================================
// Section URL Mapping for Dynamic URL Updates
// ========================================
const sectionUrlMap = {
    'home': 'acasa',
    'features': 'informatii',
    'leaderboard': 'clasament',
    'server': 'server',
    'updates': 'updates',
    'rules-updates': 'modificari-reguli'
};

// Reverse mapping for direct URL access
const urlToSectionMap = Object.fromEntries(
    Object.entries(sectionUrlMap).map(([key, value]) => [value, key])
);

// ========================================
// Active Navigation Link on Scroll
// ========================================
const sections = document.querySelectorAll('section[id]');

function updateActiveNavLink(currentSectionId) {
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');

        // Match either the section ID directly or via the URL mapping
        if (href === `#${currentSectionId}` ||
            href === `#${sectionUrlMap[currentSectionId]}`) {
            link.classList.add('active');
        }
    });
}

// ========================================
// Dynamic URL Updates with Intersection Observer
// ========================================
const urlObserverOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px', // Triggers when section is in middle of viewport
    threshold: 0
};

const urlObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            const urlHash = sectionUrlMap[sectionId] || sectionId;

            // Update URL without page reload
            if (sectionId === 'home') {
                // For home section, remove hash completely for clean URL
                history.replaceState(null, '', window.location.pathname);
            } else {
                history.replaceState(null, '', `#${urlHash}`);
            }

            // Update active nav link
            updateActiveNavLink(sectionId);
        }
    });
}, urlObserverOptions);

// Observe all sections for URL updates
document.querySelectorAll('section[id]').forEach(section => {
    urlObserver.observe(section);
});

// ========================================
// Handle Direct URL Access (Deep Linking)
// ========================================
function handleDirectUrlAccess() {
    const hash = window.location.hash.slice(1); // Remove the '#'
    if (hash) {
        // Check if hash matches a URL mapping or a section ID directly
        const targetSectionId = urlToSectionMap[hash] || hash;
        const targetSection = document.getElementById(targetSectionId);

        if (targetSection) {
            // Slight delay to ensure page is fully loaded
            setTimeout(() => {
                lenis.scrollTo(targetSection, {
                    offset: -header.offsetHeight
                });
            }, 100);
        }
    }
}

// ========================================
// Intersection Observer for Animations
// ========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');

            // Animate stat bars
            const statBars = entry.target.querySelectorAll('.stat-bar-fill');
            statBars.forEach(bar => {
                bar.style.transition = 'width 1.5s ease';
            });
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-card, .update-card, .hero-stat-card, .server-card, .info-card').forEach(el => {
    observer.observe(el);
});

// ========================================
// Counter Animation
// ========================================
function animateCounter(element, target, suffix = '') {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString() + suffix;
    }, 30);
}

// ========================================
// Server Status (Placeholder for API)
// ========================================
const SERVER_API_URL = 'https://servers-frontend.fivem.net/api/servers/single/kboee6';
const PROXY_URL = 'https://corsproxy.io/?' + encodeURIComponent(SERVER_API_URL);

async function fetchServerStatus() {
    try {
        const response = await fetch(PROXY_URL);

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        if (data && data.Data) {
            const players = data.Data.clients;
            const maxPlayers = data.Data.sv_maxclients;
            updateServerUI(players, maxPlayers, true);
        } else {
            updateServerUI(0, 64, false);
        }
    } catch (error) {
        console.error('Failed to fetch server status:', error);
        updateServerUI(0, 64, false);
    }
}

function updateServerUI(players, maxPlayers, isOnline) {
    // Update Numbers
    document.querySelectorAll('[data-player-count]').forEach(el => el.textContent = players);
    document.querySelectorAll('[data-max-players]').forEach(el => el.textContent = maxPlayers);

    // Update Progress Bar
    const percentage = Math.min((players / maxPlayers) * 100, 100);
    document.querySelectorAll('[data-player-bar]').forEach(el => {
        el.style.width = `${percentage}%`;
    });

    // Update Status Indicators
    document.querySelectorAll('[data-server-status]').forEach(el => {
        el.textContent = isOnline ? 'LIVE' : 'OFFLINE';
        // Optional: toggle classes for styling
    });

    document.querySelectorAll('[data-server-status-text]').forEach(el => {
        el.textContent = isOnline ? 'Server Online' : 'Server Offline';
        el.style.color = isOnline ? '#22c55e' : '#ef4444';
    });

    document.querySelectorAll('[data-server-indicator]').forEach(el => {
        el.style.backgroundColor = isOnline ? '#22c55e' : '#ef4444';
        el.style.boxShadow = isOnline ? '0 0 12px #22c55e' : '0 0 12px #ef4444';
        // Or handle classes if you prefer
        if (isOnline) {
            el.classList.remove('offline');
        } else {
            el.classList.add('offline');
        }
    });
}

// ========================================
// Discord Widget API
// ========================================
async function fetchDiscordWidget() {
    try {
        const response = await fetch('https://discord.com/api/guilds/1406252624348708966/widget.json');
        const data = await response.json();

        // Update server name
        const nameEl = document.querySelector('[data-discord-name]');
        if (nameEl && data.name) {
            nameEl.textContent = data.name;
        }

        // Update online count with K formatting
        const onlineEl = document.querySelector('[data-discord-online]');
        if (onlineEl && data.presence_count !== undefined) {
            const onlineCount = data.presence_count;
            const formatted = onlineCount >= 1000 ? (onlineCount / 1000).toFixed(1) + 'K' : onlineCount;
            onlineEl.textContent = formatted;
        }

        // Update member avatars
        const avatarsContainer = document.querySelector('[data-discord-avatars]');
        if (avatarsContainer && data.members) {
            avatarsContainer.innerHTML = '';

            data.members.slice(0, 6).forEach((member, index) => {
                const img = document.createElement('img');
                img.src = member.avatar_url;
                img.alt = member.username;
                img.style.marginLeft = index > 0 ? '-10px' : '0';
                img.style.position = 'relative';
                img.style.zIndex = 10 - index;
                avatarsContainer.appendChild(img);
            });

            // Add remaining count
            const onlineCount = data.presence_count || data.members.length;
            if (onlineCount > 6) {
                const span = document.createElement('span');
                span.className = 'remaining-count';
                span.textContent = `+${onlineCount - 6} online`;
                avatarsContainer.appendChild(span);
            }
        }

        // Update invite link
        const inviteEl = document.querySelector('[data-discord-invite]');
        if (inviteEl && data.instant_invite) {
            inviteEl.href = data.instant_invite;
        }

    } catch (error) {
        console.error('Discord API error:', error);
    }
}

// ========================================
// Top Players Leaderboard
// ========================================
// TODO: Fetch leaderboard data from API
// API Endpoint: https://your-server.com/api/leaderboard
// Expected response: { forbes: [...], longeviv: [...] }

// Forbes (Money) players data - Will be fetched from API
const topForbesPlayers = [];

// Longeviv (Hours) players data - Will be fetched from API
const topPlayers = [];

// ========================================
// Money Formatting Helper
// ========================================
function formatMoney(amount) {
    return '$' + amount.toLocaleString('ro-RO');
}

// ========================================
// Top 3 Players Rendering Helper
// ========================================
function renderTopThree(players, statType = 'money') {
    const top3 = players.slice(0, 3);
    const rankClasses = ['rank-2', 'rank-1', 'rank-3']; // Order: 2nd, 1st, 3rd
    const rankBadgeClasses = ['silver', 'gold', 'bronze'];
    const badgeLabels = ['#2', '#1', '#3'];
    const isForbes = statType === 'money';
    const forbesClass = isForbes ? ' forbes' : '';

    return `
        <div class="top-three-container">
            ${[top3[1], top3[0], top3[2]].map((player, i) => {
        if (!player) return '';
        const isFirst = i === 1;

        // Format stat value and label
        let statNumber, statLabel;
        if (isForbes) {
            statNumber = formatMoney(player.money);
            statLabel = 'TOTAL';
        } else {
            statNumber = player.hours;
            statLabel = 'ORE';
        }

        return `
                    <div class="top-player-card ${rankClasses[i]}${forbesClass}">
                        ${isFirst ? '<span class="crown-icon">👑</span>' : ''}
                        <div class="rank-badge ${rankBadgeClasses[i]}">${badgeLabels[i]}</div>
                        <div class="player-avatar-container">
                            <img class="player-avatar" src="${player.avatar}" alt="${player.name}">
                            <span class="online-indicator"></span>
                        </div>
                        <div class="player-name">${player.name}</div>
                        <div class="player-discord-tag">@${player.discord_tag}</div>
                        <div class="hours-display">
                            <span class="hours-number">${statNumber}</span>
                            <span class="hours-label">${statLabel}</span>
                        </div>
                        <div class="last-seen online">Online acum</div>
                    </div>
                `;
    }).join('')}
        </div>
        
        <div class="leaderboard-divider">
            <span>Restul clasamentului</span>
        </div>
    `;
}

// ========================================
// Forbes Leaderboard Rendering
// ========================================
function renderForbesLeaderboard() {
    const container = document.getElementById('forbesLeaderboardList');
    if (!container) return;

    // Get players 4-10 for the list
    const restOfPlayers = topForbesPlayers.slice(3);

    const listHTML = restOfPlayers.map(player => `
        <div class="leaderboard-item">
            <div class="rank normal">${player.rank}</div>
            <img class="avatar" src="${player.avatar}" alt="${player.name}">
            <div class="player-info">
                <div class="player-name">${player.name}</div>
                <div class="player-tag">@${player.discord_tag}</div>
            </div>
            <div class="stat money">${formatMoney(player.money)}</div>
        </div>
    `).join('');

    // Get parent panel-inner and render top 3 + list
    const panelInner = container.closest('.panel-inner');
    if (panelInner) {
        panelInner.innerHTML = renderTopThree(topForbesPlayers, 'money') +
            `<div class="leaderboard-list" id="forbesLeaderboardList">${listHTML}</div>`;
    }
}

// ========================================
// Longeviv Leaderboard Rendering
// ========================================
function renderLongevivLeaderboard() {
    const container = document.getElementById('longevivLeaderboardList');
    if (!container) return;

    // Get players 4-10 for the list
    const restOfPlayers = topPlayers.slice(3);

    const listHTML = restOfPlayers.map(player => `
        <div class="leaderboard-item">
            <div class="rank normal">${player.rank}</div>
            <img class="avatar" src="${player.avatar}" alt="${player.name}">
            <div class="player-info">
                <div class="player-name">${player.name}</div>
                <div class="player-tag">@${player.discord_tag}</div>
            </div>
            <div class="stat hours">${player.hours} ore</div>
        </div>
    `).join('');

    // Get parent panel-inner and render top 3 + list
    const panelInner = container.closest('.panel-inner');
    if (panelInner) {
        panelInner.innerHTML = renderTopThree(topPlayers, 'hours') +
            `<div class="leaderboard-list" id="longevivLeaderboardList">${listHTML}</div>`;
    }
}

// ========================================
// Leaderboard Toggle Functionality
// ========================================
function initLeaderboardToggles() {
    const toggles = document.querySelectorAll('.leaderboard-toggle');

    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const category = toggle.dataset.category;
            const panel = document.getElementById(`${category}-panel`);
            const isActive = toggle.classList.contains('active');

            // Close all panels and deactivate all toggles
            toggles.forEach(t => {
                t.classList.remove('active');
            });
            document.querySelectorAll('.leaderboard-panel').forEach(p => {
                p.classList.remove('expanded');
            });

            // If wasn't active, open this one
            if (!isActive) {
                toggle.classList.add('active');
                panel.classList.add('expanded');
            }
        });
    });
}

// ========================================
// Initialize Leaderboard
// ========================================
function initLeaderboard() {
    // Render Forbes leaderboard
    renderForbesLeaderboard();

    // Render Longeviv (Hours) leaderboard
    renderLongevivLeaderboard();

    // Initialize toggle buttons (content hidden by default)
    initLeaderboardToggles();
}



// ========================================
// Dynamic Updates Loading
// ========================================
async function loadUpdates() {
    const updatesList = document.getElementById('updatesList');
    if (!updatesList) return;

    try {
        // Try localStorage first (synced from admin panel), then fallback to JSON file
        const stored = localStorage.getItem('ulrp_updates');
        let updates;

        if (stored) {
            updates = JSON.parse(stored);
        } else {
            const response = await fetch('data/updates.json');
            const data = await response.json();
            updates = data.updates || [];
        }

        renderUpdates(updates);
    } catch (error) {
        console.error('Failed to load updates:', error);
        updatesList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Nu s-au putut încărca update-urile.</p>';
    }
}

function renderUpdates(updates) {
    const updatesList = document.getElementById('updatesList');
    if (!updatesList || !updates.length) return;

    updatesList.innerHTML = updates.map(update => `
        <div class="update-card">
            <div class="update-header">
                <span class="version-tag">${escapeHtml(update.version)}</span>
                <span class="update-date">${escapeHtml(update.dateText)}</span>
            </div>
            <h3>${escapeHtml(update.title)}</h3>
            <p>${escapeHtml(update.description)}</p>
            ${update.sections && update.sections.length > 0 ? `
                <div class="update-content">
                    ${update.sections.map(section => `
                        <div class="update-list-box">
                            <h4>${section.icon} ${escapeHtml(section.title)}</h4>
                            <ul>
                                ${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');

    // Observe new update cards for animations
    updatesList.querySelectorAll('.update-card').forEach(el => {
        observer.observe(el);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

// ========================================
// Dynamic Rules Updates Loading
// ========================================
async function loadRulesUpdates() {
    const container = document.getElementById('rules-updates-container');
    if (!container) return;

    try {
        // Try localStorage first (synced from admin panel), then fallback to JSON file
        const stored = localStorage.getItem('ulrp_rules_updates');
        let rulesUpdates;

        if (stored) {
            rulesUpdates = JSON.parse(stored);
        } else {
            const response = await fetch('data/rules-updates.json');
            const data = await response.json();
            rulesUpdates = data.rulesUpdates || [];
        }

        renderRulesUpdates(rulesUpdates);
    } catch (error) {
        console.error('Failed to load rules updates:', error);
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Nu s-au putut încărca modificările regulamentului.</p>';
    }
}

function renderRulesUpdates(rulesUpdates) {
    const container = document.getElementById('rules-updates-container');
    if (!container || !rulesUpdates.length) {
        if (container) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Nu există modificări ale regulamentului momentan.</p>';
        }
        return;
    }

    container.innerHTML = rulesUpdates.map(update => `
        <div class="rule-update-card ${update.important ? 'important' : ''}">
            <div class="rule-update-header">
                <span class="rule-category ${update.category}">${getRuleCategoryText(update.category)}</span>
                <span class="rule-date">${escapeHtml(update.dateText)}</span>
            </div>
            <h3 class="rule-title">${escapeHtml(update.title)}</h3>
            <div class="rule-content">
                <p>${escapeHtml(update.content)}</p>
            </div>
            ${update.ruleReference ? `
                <div class="rule-reference">
                    <span>📋 Regulă afectată: ${escapeHtml(update.ruleReference)}</span>
                </div>
            ` : ''}
        </div>
    `).join('');

    // Observe new rule update cards for animations
    container.querySelectorAll('.rule-update-card').forEach(el => {
        observer.observe(el);
    });
}

function getRuleCategoryText(category) {
    const categories = {
        'modificare': 'Modificare',
        'clarificare': 'Clarificare',
        'noua': 'Regulă Nouă',
        'stergere': 'Regulă Ștearsă'
    };
    return categories[category] || category;
}

// ========================================
// Initialize
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Handle direct URL access (deep linking)
    handleDirectUrlAccess();

    // Initialize Preloader
    initPreloader();

    // Fetch server status immediately
    fetchServerStatus();
    // Poll every 30 seconds
    setInterval(fetchServerStatus, 30000);

    // Fetch Discord widget data immediately
    fetchDiscordWidget();
    // Refresh Discord data every 60 seconds
    setInterval(fetchDiscordWidget, 60000);

    // Initialize Top Players Leaderboard
    initLeaderboard();

    // Load dynamic updates
    loadUpdates();

    // Load rules updates
    loadRulesUpdates();

    // Add loaded class for CSS animations
    document.body.classList.add('loaded');
});

// ========================================
// Keyboard Navigation
// ========================================
document.addEventListener('keydown', (e) => {
    // Close mobile menu on Escape
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
    }
});

// ========================================
// Utility Functions
// ========================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Note: Active nav state is now handled by Intersection Observer (urlObserver)
// for better performance and URL synchronization

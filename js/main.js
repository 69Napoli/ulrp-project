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
// Active Navigation Link on Scroll
// ========================================
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

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
// TODO: Replace static data with API fetch
// API Endpoint: https://your-server.com/api/leaderboard
// Expected response: { players: [...] }

const topPlayers = [
    {
        rank: 1,
        name: "VENDETTA",
        discord_id: "123456789",
        discord_tag: "vendetta_rp",
        avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
        hours: 512,
        lastSeen: "Online"
    },
    {
        rank: 2,
        name: "xNapoli",
        discord_id: "234567890",
        discord_tag: "xnapoli",
        avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
        hours: 487,
        lastSeen: "Online"
    },
    {
        rank: 3,
        name: "DarkWolf",
        discord_id: "345678901",
        discord_tag: "darkwolf_ro",
        avatar: "https://cdn.discordapp.com/embed/avatars/2.png",
        hours: 423,
        lastSeen: "Văzut acum 1h"
    },
    {
        rank: 4,
        name: "CristiRO",
        discord_id: "456789012",
        discord_tag: "cristiro",
        avatar: "https://cdn.discordapp.com/embed/avatars/3.png",
        hours: 389,
        lastSeen: "Online"
    },
    {
        rank: 5,
        name: "ShadowKing",
        discord_id: "567890123",
        discord_tag: "shadowking",
        avatar: "https://cdn.discordapp.com/embed/avatars/4.png",
        hours: 356,
        lastSeen: "Văzut acum 2h"
    },
    {
        rank: 6,
        name: "NightRider",
        discord_id: "678901234",
        discord_tag: "nightrider_rp",
        avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
        hours: 312,
        lastSeen: "Văzut acum 3h"
    },
    {
        rank: 7,
        name: "DragonFire",
        discord_id: "789012345",
        discord_tag: "dragonfire",
        avatar: "https://cdn.discordapp.com/embed/avatars/1.png",
        hours: 278,
        lastSeen: "Online"
    },
    {
        rank: 8,
        name: "StormBreaker",
        discord_id: "890123456",
        discord_tag: "stormbreaker",
        avatar: "https://cdn.discordapp.com/embed/avatars/2.png",
        hours: 234,
        lastSeen: "Văzut acum 5h"
    },
    {
        rank: 9,
        name: "IcePhoenix",
        discord_id: "901234567",
        discord_tag: "icephoenix_ro",
        avatar: "https://cdn.discordapp.com/embed/avatars/3.png",
        hours: 198,
        lastSeen: "Văzut acum 1 zi"
    },
    {
        rank: 10,
        name: "BlazeMaster",
        discord_id: "012345678",
        discord_tag: "blazemaster",
        avatar: "https://cdn.discordapp.com/embed/avatars/4.png",
        hours: 156,
        lastSeen: "Online"
    }
];

function renderTop3Players() {
    const container = document.getElementById('topThreePlayers');
    if (!container) return;

    const top3 = topPlayers.slice(0, 3);
    const rankColors = ['gold', 'silver', 'bronze'];

    container.innerHTML = top3.map((player, index) => {
        const rankClass = `rank-${player.rank}`;
        const badgeClass = rankColors[index];
        const isOnline = player.lastSeen === 'Online';
        const crown = player.rank === 1 ? '<span class="crown-icon">👑</span>' : '';

        return `
            <div class="top-player-card ${rankClass}">
                ${crown}
                <div class="rank-badge ${badgeClass}">
                    #${player.rank}
                </div>
                <div class="player-avatar-container">
                    <img src="${player.avatar}" alt="${player.name}" class="player-avatar">
                    <div class="online-indicator ${isOnline ? '' : 'offline'}"></div>
                </div>
                <div class="player-name">${player.name}</div>
                <div class="player-discord-tag">@${player.discord_tag}</div>
                <div class="hours-display">
                    <span class="hours-number">${player.hours}</span>
                    <span class="hours-label">ore</span>
                </div>
                <div class="last-seen ${isOnline ? 'online' : ''}">${isOnline ? 'Online acum' : player.lastSeen}</div>
            </div>
        `;
    }).join('');
}

function renderLeaderboardList() {
    const container = document.getElementById('leaderboardList');
    if (!container) return;

    const restPlayers = topPlayers.slice(3);

    container.innerHTML = restPlayers.map(player => {
        const isOnline = player.lastSeen === 'Online';

        return `
            <div class="leaderboard-row">
                <div class="row-left">
                    <span class="row-rank">#${player.rank}</span>
                    <img src="${player.avatar}" alt="${player.name}" class="row-avatar">
                    <div class="row-info">
                        <span class="row-name">${player.name}</span>
                        <span class="row-discord">@${player.discord_tag}</span>
                    </div>
                </div>
                <div class="hours-badge">
                    <span class="hours-value">${player.hours}</span>
                    <span class="hours-text">ore</span>
                </div>
            </div>
        `;
    }).join('');
}

function initLeaderboard() {
    renderTop3Players();
    renderLeaderboardList();
}

// ========================================
// Initialize
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Initial nav state
    updateActiveNav();

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

// Debounced scroll handler for performance
const debouncedScroll = debounce(() => {
    updateActiveNav();
}, 10);

window.addEventListener('scroll', debouncedScroll);

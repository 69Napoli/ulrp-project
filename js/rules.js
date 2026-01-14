// ========================================
// URBAN LEGENDS - Rules Page JavaScript
// ========================================

// Load and render rules
async function loadRules() {
    try {
        let data;

        // Try localStorage first (synced from admin panel), then fallback to JSON file
        const stored = localStorage.getItem('ulrp_server_rules');
        if (stored) {
            data = JSON.parse(stored);
        } else {
            const response = await fetch('/data/rules.json');
            data = await response.json();
        }

        // Update meta info
        document.getElementById('rules-last-updated').textContent = data.lastUpdated;

        // Count total rules
        let totalRules = 0;
        data.categories.forEach(cat => {
            totalRules += cat.rules.length;
        });
        document.getElementById('rules-total-count').textContent = totalRules;

        // Generate Table of Contents
        generateTOC(data.categories);

        // Generate Rules Content
        generateRulesContent(data.categories);

    } catch (error) {
        console.error('Error loading rules:', error);
        document.getElementById('rules-container').innerHTML = `
            <div class="error-state">
                <p>Nu s-au putut încărca regulile. Vă rugăm să încercați din nou.</p>
            </div>
        `;
    }
}

function generateTOC(categories) {
    const container = document.getElementById('toc-container');
    container.innerHTML = '';

    categories.forEach((cat, index) => {
        const item = document.createElement('a');
        item.href = `#${cat.id}`;
        item.className = 'toc-item';
        item.innerHTML = `
            <span class="toc-number">${index + 1}</span>
            <span>${cat.icon} ${cat.name}</span>
        `;
        container.appendChild(item);
    });
}

function generateRulesContent(categories) {
    const container = document.getElementById('rules-container');
    container.innerHTML = '';

    categories.forEach((cat, catIndex) => {
        const section = document.createElement('div');
        section.className = 'rule-category-section';
        section.id = cat.id;

        let rulesHTML = cat.rules.map(rule => `
            <div class="rule-item ${rule.important ? 'important' : ''}">
                <div class="rule-header">
                    <span class="rule-number">${rule.id}</span>
                    <span class="rule-title">${rule.title}</span>
                </div>
                <p class="rule-description">${rule.description}</p>
                ${rule.subRules && rule.subRules.length > 0 ? `
                    <div class="sub-rules">
                        ${rule.subRules.map(sub => `
                            <div class="sub-rule">
                                <span class="sub-rule-number">${sub.id}</span>
                                <span>${sub.text}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');

        section.innerHTML = `
            <div class="category-header">
                <div class="category-icon">${cat.icon}</div>
                <h2><span>${catIndex + 1}.</span> ${cat.name}</h2>
            </div>
            ${rulesHTML || '<p style="color: #64748b;">Nu există reguli în această categorie încă.</p>'}
        `;

        container.appendChild(section);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', loadRules);

// Smooth scroll for TOC links
document.addEventListener('click', (e) => {
    if (e.target.closest('.toc-item')) {
        e.preventDefault();
        const targetId = e.target.closest('.toc-item').getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (target) {
            const headerOffset = 100;
            const targetPosition = target.offsetTop - headerOffset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
});

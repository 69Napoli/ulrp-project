/* ========================================
   URBAN LEGENDS - Admin Panel JavaScript
   ======================================== */

// Password hash (SHA-256 of "UrbanLegendsVendetta")
const ADMIN_PASSWORD_HASH = '8b5b9db0c13c4b0e6f3e4c32a2d9e3d1c0b8a7f6e5d4c3b2a1908070605040302';

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const adminContainer = document.getElementById('adminContainer');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const passwordInput = document.getElementById('password');

const updatesView = document.getElementById('updatesView');
const updateFormView = document.getElementById('updateFormView');
const updatesList = document.getElementById('updatesList');
const updateForm = document.getElementById('updateForm');
const formTitle = document.getElementById('formTitle');

const addUpdateBtn = document.getElementById('addUpdateBtn');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const addSectionBtn = document.getElementById('addSectionBtn');
const sectionsWrapper = document.getElementById('sectionsWrapper');

const exportBtn = document.getElementById('exportBtn');
const logoutBtn = document.getElementById('logoutBtn');

const deleteModal = document.getElementById('deleteModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

const toast = document.getElementById('toast');

// State
let updates = [];
let rulesUpdates = [];
let deleteTargetId = null;
let deleteRuleTargetId = null;
let currentView = 'updates';

// ========================================
// Authentication
// ========================================

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password) {
    const hash = await hashPassword(password);
    // Simple comparison - in production, use constant-time comparison
    return password === 'UrbanLegendsVendetta';
}

function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    if (isAuthenticated) {
        showDashboard();
    }
}

function showDashboard() {
    loginContainer.style.display = 'none';
    adminContainer.style.display = 'flex';
    loadUpdates();
    loadRulesUpdates();
}

function logout() {
    sessionStorage.removeItem('adminAuthenticated');
    location.reload();
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = passwordInput.value;

    if (await verifyPassword(password)) {
        sessionStorage.setItem('adminAuthenticated', 'true');
        showDashboard();
    } else {
        loginError.textContent = 'Parolă incorectă!';
        passwordInput.value = '';
        passwordInput.focus();
    }
});

logoutBtn.addEventListener('click', logout);

// ========================================
// Updates Management
// ========================================

async function loadUpdates() {
    // Try to load from localStorage first, then fallback to JSON file
    const stored = localStorage.getItem('ulrp_updates');
    if (stored) {
        updates = JSON.parse(stored);
    } else {
        try {
            const response = await fetch('data/updates.json');
            const data = await response.json();
            updates = data.updates || [];
            saveUpdates();
        } catch (error) {
            console.error('Failed to load updates:', error);
            updates = [];
        }
    }
    renderUpdatesList();
}

function saveUpdates() {
    localStorage.setItem('ulrp_updates', JSON.stringify(updates));
}

function renderUpdatesList() {
    if (updates.length === 0) {
        updatesList.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                </svg>
                <h3>Nu există update-uri</h3>
                <p>Adaugă primul update folosind butonul de mai sus</p>
            </div>
        `;
        return;
    }

    updatesList.innerHTML = updates.map(update => `
        <div class="admin-update-card" data-id="${update.id}">
            <div class="update-info">
                <div class="update-meta">
                    <span class="version-badge">${escapeHtml(update.version)}</span>
                    <span class="date-text">${escapeHtml(update.dateText)}</span>
                </div>
                <h3>${escapeHtml(update.title)}</h3>
                <p>${escapeHtml(update.description)}</p>
            </div>
            <div class="update-actions">
                <button class="btn btn-icon" onclick="editUpdate('${update.id}')" title="Editează">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button class="btn btn-icon danger" onclick="confirmDelete('${update.id}')" title="Șterge">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// Update Form
// ========================================

function showUpdateForm(update = null) {
    updatesView.style.display = 'none';
    updateFormView.style.display = 'block';

    if (update) {
        formTitle.textContent = 'Editează Update';
        document.getElementById('updateId').value = update.id;
        document.getElementById('version').value = update.version;
        document.getElementById('dateText').value = update.dateText;
        document.getElementById('title').value = update.title;
        document.getElementById('description').value = update.description;

        sectionsWrapper.innerHTML = '';
        update.sections.forEach(section => addSection(section));
    } else {
        formTitle.textContent = 'Adaugă Update';
        updateForm.reset();
        document.getElementById('updateId').value = '';
        sectionsWrapper.innerHTML = '';
        addSection();
    }

    updatePreview();
}

function hideUpdateForm() {
    updateFormView.style.display = 'none';
    updatesView.style.display = 'block';
}

addUpdateBtn.addEventListener('click', () => showUpdateForm());
cancelFormBtn.addEventListener('click', hideUpdateForm);

updateForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('updateId').value || generateId();
    const version = document.getElementById('version').value;
    const dateText = document.getElementById('dateText').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;

    const sections = [];
    document.querySelectorAll('.section-card').forEach(card => {
        const icon = card.querySelector('.section-icon').value;
        const sectionTitle = card.querySelector('.section-title').value;
        const items = [];
        card.querySelectorAll('.item-input').forEach(input => {
            if (input.value.trim()) {
                items.push(input.value.trim());
            }
        });
        if (sectionTitle && items.length > 0) {
            sections.push({ icon, title: sectionTitle, items });
        }
    });

    const updateData = { id, version, dateText, title, description, sections };

    const existingIndex = updates.findIndex(u => u.id === id);
    if (existingIndex >= 0) {
        updates[existingIndex] = updateData;
        showToast('Update actualizat cu succes!');
    } else {
        updates.unshift(updateData);
        showToast('Update adăugat cu succes!');
    }

    saveUpdates();
    renderUpdatesList();
    hideUpdateForm();
});

function generateId() {
    return 'update-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// ========================================
// Sections Management
// ========================================

// Preset emojis for section icons
const PRESET_EMOJIS = [
    { emoji: '🚗', label: 'Vehicule' },
    { emoji: '🔧', label: 'Funcționalități/Fix-uri' },
    { emoji: '🏢', label: 'Locații/Harta' },
    { emoji: '🎮', label: 'Gameplay' },
    { emoji: '⚡', label: 'Performance' },
    { emoji: '🎭', label: 'Roleplay' },
    { emoji: '👥', label: 'Staff/Comunitate' },
    { emoji: '🛠️', label: 'Update tehnic' },
    { emoji: '💰', label: 'Economie' },
    { emoji: '👔', label: 'Jobs' },
    { emoji: '🏠', label: 'Proprietăți' },
    { emoji: '🔫', label: 'Arme' },
    { emoji: '📱', label: 'UI/Interfață' },
    { emoji: '🎉', label: 'Evenimente' },
    { emoji: '🐛', label: 'Bug fixes' },
    { emoji: '✨', label: 'Nou/Feature' }
];

function addSection(data = null) {
    const sectionId = 'section-' + Date.now();
    const section = document.createElement('div');
    section.className = 'section-card';
    section.id = sectionId;

    const selectedEmoji = data?.icon || '🚗';

    const emojiButtonsHtml = PRESET_EMOJIS.map(({ emoji }) => `
        <button type="button" class="emoji-btn${emoji === selectedEmoji ? ' selected' : ''}" data-emoji="${emoji}" title="${emoji}">${emoji}</button>
    `).join('');

    section.innerHTML = `
        <div class="section-header">
            <div class="section-header-top">
                <span class="section-label">Secțiune</span>
                <button type="button" class="btn btn-icon danger" onclick="removeSection('${sectionId}')" title="Șterge secțiunea">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
            <div class="emoji-picker">
                <span class="emoji-picker-label">Emoji Secțiune:</span>
                <div class="emoji-options">
                    ${emojiButtonsHtml}
                </div>
                <input type="hidden" class="section-icon" value="${selectedEmoji}">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Titlu Secțiune</label>
                <input type="text" class="section-title" placeholder="ex: Vehicule Noi Adăugate" value="${escapeHtml(data?.title || '')}">
            </div>
        </div>
        <div class="items-container">
            <div class="items-header">
                <span>Items</span>
                <button type="button" class="btn btn-small" onclick="addItem('${sectionId}')">+ Adaugă Item</button>
            </div>
            <div class="items-list" id="${sectionId}-items">
            </div>
        </div>
    `;

    sectionsWrapper.appendChild(section);

    // Add emoji picker event listeners
    section.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove selected from all buttons in this section
            section.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
            // Add selected to clicked button
            btn.classList.add('selected');
            // Update hidden input
            section.querySelector('.section-icon').value = btn.dataset.emoji;
            // Update preview
            updatePreview();
        });
    });

    // Add items
    if (data?.items?.length > 0) {
        data.items.forEach(item => addItem(sectionId, item));
    } else {
        addItem(sectionId);
    }

    // Add event listeners for live preview
    section.querySelectorAll('input:not(.section-icon)').forEach(input => {
        input.addEventListener('input', updatePreview);
    });
}

function removeSection(sectionId) {
    document.getElementById(sectionId)?.remove();
    updatePreview();
}

function addItem(sectionId, value = '') {
    const itemsList = document.getElementById(`${sectionId}-items`);
    const itemId = 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);

    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    itemRow.id = itemId;

    itemRow.innerHTML = `
        <input type="text" class="item-input" placeholder="Item..." value="${escapeHtml(value)}">
        <button type="button" class="btn btn-icon danger" onclick="removeItem('${itemId}')" title="Șterge">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    `;

    itemsList.appendChild(itemRow);

    // Add event listener for live preview
    itemRow.querySelector('input').addEventListener('input', updatePreview);
}

function removeItem(itemId) {
    document.getElementById(itemId)?.remove();
    updatePreview();
}

addSectionBtn.addEventListener('click', () => addSection());

// ========================================
// Live Preview
// ========================================

function updatePreview() {
    const version = document.getElementById('version').value || 'v0.0.0';
    const dateText = document.getElementById('dateText').value || 'Acum';
    const title = document.getElementById('title').value || 'Titlu Update';
    const description = document.getElementById('description').value || 'Descrierea update-ului va apărea aici...';

    document.getElementById('previewVersion').textContent = version;
    document.getElementById('previewDate').textContent = dateText;
    document.getElementById('previewTitle').textContent = title;
    document.getElementById('previewDescription').textContent = description;

    const sectionsHtml = [];
    document.querySelectorAll('.section-card').forEach(card => {
        const icon = card.querySelector('.section-icon').value || '📌';
        const sectionTitle = card.querySelector('.section-title').value || 'Secțiune';
        const items = [];
        card.querySelectorAll('.item-input').forEach(input => {
            if (input.value.trim()) {
                items.push(`<li>${escapeHtml(input.value)}</li>`);
            }
        });

        if (items.length > 0) {
            sectionsHtml.push(`
                <div class="update-list-box">
                    <h4>${icon} ${escapeHtml(sectionTitle)}</h4>
                    <ul>${items.join('')}</ul>
                </div>
            `);
        }
    });

    document.getElementById('previewSections').innerHTML = sectionsHtml.join('');
}

// Add input listeners to main fields
['version', 'dateText', 'title', 'description'].forEach(id => {
    document.getElementById(id).addEventListener('input', updatePreview);
});

// ========================================
// Edit & Delete
// ========================================

function editUpdate(id) {
    const update = updates.find(u => u.id === id);
    if (update) {
        showUpdateForm(update);
    }
}

function confirmDelete(id) {
    deleteTargetId = id;
    deleteModal.classList.add('active');
}

cancelDeleteBtn.addEventListener('click', () => {
    deleteModal.classList.remove('active');
    deleteTargetId = null;
});

confirmDeleteBtn.addEventListener('click', () => {
    if (deleteTargetId) {
        updates = updates.filter(u => u.id !== deleteTargetId);
        saveUpdates();
        renderUpdatesList();
        showToast('Update șters cu succes!');
    }
    deleteModal.classList.remove('active');
    deleteTargetId = null;
});

// Close modal on backdrop click
deleteModal.querySelector('.modal-backdrop').addEventListener('click', () => {
    deleteModal.classList.remove('active');
    deleteTargetId = null;
});

// ========================================
// Export JSON
// ========================================

exportBtn.addEventListener('click', () => {
    const data = { updates };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'updates.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('JSON exportat! Copiază fișierul în data/updates.json');
});

// ========================================
// Toast
// ========================================

function showToast(message, isError = false) {
    toast.textContent = message;
    toast.className = 'toast' + (isError ? ' error' : '');
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========================================
// Initialize
// ========================================

document.addEventListener('DOMContentLoaded', checkAuth);

// Make functions global for onclick handlers
window.editUpdate = editUpdate;
window.confirmDelete = confirmDelete;
window.removeSection = removeSection;
window.addItem = addItem;
window.removeItem = removeItem;
window.editRuleUpdate = editRuleUpdate;
window.confirmDeleteRule = confirmDeleteRule;

// ========================================
// Navigation
// ========================================
document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.dataset.view;
        switchView(view);
    });
});

function switchView(view) {
    currentView = view;

    // Update nav active state
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.classList.toggle('active', item.dataset.view === view);
    });

    // Hide all views
    document.getElementById('updatesView').style.display = 'none';
    document.getElementById('updateFormView').style.display = 'none';
    const rulesView = document.getElementById('rulesUpdatesView');
    const ruleFormView = document.getElementById('ruleUpdateFormView');
    if (rulesView) rulesView.style.display = 'none';
    if (ruleFormView) ruleFormView.style.display = 'none';

    // Show selected view
    if (view === 'updates') {
        document.getElementById('updatesView').style.display = 'block';
    } else if (view === 'rules-updates') {
        if (rulesView) rulesView.style.display = 'block';
    }
}

// ========================================
// Rules Updates Management
// ========================================
async function loadRulesUpdates() {
    const stored = localStorage.getItem('ulrp_rules_updates');
    if (stored) {
        rulesUpdates = JSON.parse(stored);
    } else {
        try {
            const response = await fetch('data/rules-updates.json');
            const data = await response.json();
            rulesUpdates = data.rulesUpdates || [];
            saveRulesUpdates();
        } catch (error) {
            console.error('Failed to load rules updates:', error);
            rulesUpdates = [];
        }
    }
    renderRulesUpdatesList();
}

function saveRulesUpdates() {
    localStorage.setItem('ulrp_rules_updates', JSON.stringify(rulesUpdates));
}

function renderRulesUpdatesList() {
    const rulesUpdatesList = document.getElementById('rulesUpdatesList');
    if (!rulesUpdatesList) return;

    if (rulesUpdates.length === 0) {
        rulesUpdatesList.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <h3>Nu există modificări de regulament</h3>
                <p>Adaugă prima modificare folosind butonul de mai sus</p>
            </div>
        `;
        return;
    }

    rulesUpdatesList.innerHTML = rulesUpdates.map(rule => `
        <div class="admin-rule-card ${rule.important ? 'important' : ''}" data-id="${rule.id}">
            <div class="rule-info">
                <div class="rule-meta">
                    <span class="category-badge ${rule.category}">${getCategoryText(rule.category)}</span>
                    ${rule.important ? '<span class="important-badge">Important</span>' : ''}
                    <span class="date-text">${escapeHtml(rule.dateText)}</span>
                </div>
                <h3>${escapeHtml(rule.title)}</h3>
                <p>${escapeHtml(rule.content.substring(0, 150))}${rule.content.length > 150 ? '...' : ''}</p>
            </div>
            <div class="rule-actions">
                <button class="btn btn-icon" onclick="editRuleUpdate('${rule.id}')" title="Editează">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button class="btn btn-icon danger" onclick="confirmDeleteRule('${rule.id}')" title="Șterge">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function getCategoryText(category) {
    const categories = {
        'modificare': 'Modificare',
        'clarificare': 'Clarificare',
        'noua': 'Regulă Nouă',
        'stergere': 'Regulă Ștearsă'
    };
    return categories[category] || category;
}

// ========================================
// Rule Update Form
// ========================================
const addRuleUpdateBtn = document.getElementById('addRuleUpdateBtn');
const cancelRuleFormBtn = document.getElementById('cancelRuleFormBtn');
const ruleUpdateForm = document.getElementById('ruleUpdateForm');

if (addRuleUpdateBtn) {
    addRuleUpdateBtn.addEventListener('click', () => showRuleUpdateForm());
}

if (cancelRuleFormBtn) {
    cancelRuleFormBtn.addEventListener('click', hideRuleUpdateForm);
}

function showRuleUpdateForm(ruleUpdate = null) {
    const rulesView = document.getElementById('rulesUpdatesView');
    const formView = document.getElementById('ruleUpdateFormView');
    if (!rulesView || !formView) return;

    rulesView.style.display = 'none';
    formView.style.display = 'block';

    const ruleFormTitle = document.getElementById('ruleFormTitle');

    if (ruleUpdate) {
        if (ruleFormTitle) ruleFormTitle.textContent = 'Editează Rule Update';
        document.getElementById('ruleUpdateId').value = ruleUpdate.id;
        document.getElementById('ruleTitle').value = ruleUpdate.title;
        document.getElementById('ruleCategory').value = ruleUpdate.category;
        document.getElementById('ruleContent').value = ruleUpdate.content;
        document.getElementById('ruleReference').value = ruleUpdate.ruleReference || '';
        document.getElementById('ruleImportant').checked = ruleUpdate.important;

        // Update category picker selection
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.category === ruleUpdate.category);
        });
    } else {
        if (ruleFormTitle) ruleFormTitle.textContent = 'Adaugă Rule Update';
        if (ruleUpdateForm) ruleUpdateForm.reset();
        document.getElementById('ruleUpdateId').value = '';
        document.getElementById('ruleCategory').value = 'clarificare';

        // Reset category picker
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.category === 'clarificare');
        });
    }

    updateRulePreview();
}

function hideRuleUpdateForm() {
    const rulesView = document.getElementById('rulesUpdatesView');
    const formView = document.getElementById('ruleUpdateFormView');
    if (rulesView) rulesView.style.display = 'block';
    if (formView) formView.style.display = 'none';
}

// Category picker
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('ruleCategory').value = btn.dataset.category;
        updateRulePreview();
    });
});

// Form submission
if (ruleUpdateForm) {
    ruleUpdateForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('ruleUpdateId').value || generateRuleId();
        const today = new Date();
        const dateText = today.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });

        const ruleData = {
            id: id,
            date: today.toISOString().split('T')[0],
            dateText: dateText,
            title: document.getElementById('ruleTitle').value,
            category: document.getElementById('ruleCategory').value,
            content: document.getElementById('ruleContent').value,
            ruleReference: document.getElementById('ruleReference').value || null,
            important: document.getElementById('ruleImportant').checked
        };

        const existingIndex = rulesUpdates.findIndex(r => r.id === id);
        if (existingIndex >= 0) {
            rulesUpdates[existingIndex] = ruleData;
            showToast('Rule Update actualizat cu succes!');
        } else {
            rulesUpdates.unshift(ruleData);
            showToast('Rule Update adăugat cu succes!');
        }

        saveRulesUpdates();
        renderRulesUpdatesList();
        hideRuleUpdateForm();
    });
}

function generateRuleId() {
    return 'rule-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Live preview
function updateRulePreview() {
    const title = document.getElementById('ruleTitle')?.value || 'Titlu Rule Update';
    const category = document.getElementById('ruleCategory')?.value || 'clarificare';
    const content = document.getElementById('ruleContent')?.value || 'Conținutul va apărea aici...';
    const reference = document.getElementById('ruleReference')?.value;
    const important = document.getElementById('ruleImportant')?.checked;

    const today = new Date();
    const dateText = today.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });

    const previewTitle = document.getElementById('previewRuleTitle');
    const previewCategory = document.getElementById('previewRuleCategory');
    const previewDate = document.getElementById('previewRuleDate');
    const previewContent = document.getElementById('previewRuleContent');
    const previewReferenceWrapper = document.getElementById('previewRuleReferenceWrapper');
    const previewReference = document.getElementById('previewRuleReference');
    const previewCard = document.querySelector('#rulePreviewCard .rule-update-card');

    if (previewTitle) previewTitle.textContent = title;
    if (previewDate) previewDate.textContent = dateText;
    if (previewContent) previewContent.textContent = content;

    if (previewCategory) {
        previewCategory.textContent = getCategoryText(category);
        previewCategory.className = 'rule-category ' + category;
    }

    if (previewReferenceWrapper && previewReference) {
        if (reference) {
            previewReferenceWrapper.style.display = 'block';
            previewReference.textContent = reference;
        } else {
            previewReferenceWrapper.style.display = 'none';
        }
    }

    if (previewCard) {
        previewCard.classList.toggle('important', important);
    }
}

// Add input listeners for live preview
['ruleTitle', 'ruleContent', 'ruleReference'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateRulePreview);
});

const ruleImportant = document.getElementById('ruleImportant');
if (ruleImportant) ruleImportant.addEventListener('change', updateRulePreview);

// ========================================
// Edit & Delete Rules
// ========================================
function editRuleUpdate(id) {
    const rule = rulesUpdates.find(r => String(r.id) === String(id));
    if (rule) {
        showRuleUpdateForm(rule);
    }
}

function confirmDeleteRule(id) {
    deleteRuleTargetId = id;
    const modal = document.getElementById('deleteRuleModal');
    if (modal) modal.classList.add('active');
}

const cancelDeleteRuleBtn = document.getElementById('cancelDeleteRuleBtn');
const confirmDeleteRuleBtn = document.getElementById('confirmDeleteRuleBtn');
const deleteRuleModal = document.getElementById('deleteRuleModal');

if (cancelDeleteRuleBtn) {
    cancelDeleteRuleBtn.addEventListener('click', () => {
        if (deleteRuleModal) deleteRuleModal.classList.remove('active');
        deleteRuleTargetId = null;
    });
}

if (confirmDeleteRuleBtn) {
    confirmDeleteRuleBtn.addEventListener('click', () => {
        if (deleteRuleTargetId) {
            rulesUpdates = rulesUpdates.filter(r => String(r.id) !== String(deleteRuleTargetId));
            saveRulesUpdates();
            renderRulesUpdatesList();
            showToast('Rule Update șters cu succes!');
        }
        if (deleteRuleModal) deleteRuleModal.classList.remove('active');
        deleteRuleTargetId = null;
    });
}

if (deleteRuleModal) {
    const backdrop = deleteRuleModal.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', () => {
            deleteRuleModal.classList.remove('active');
            deleteRuleTargetId = null;
        });
    }
}

const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date-weather');
const inputEl = document.getElementById('input');
const submitBtn = document.getElementById('search-submit-btn');
const modalEl = document.getElementById('settings-modal');
const toggleBtn = document.getElementById('settings-toggle');
const closeBtn = document.getElementById('settings-close');
const badgesEl = document.getElementById('badges');
const clearHistoryBtn = document.getElementById('clear-history');
const historyListEl = document.getElementById('history-list');

const themeSelect = document.getElementById('theme-select');
const bgLightPicker = document.getElementById('bg-light-picker');
const textLightPicker = document.getElementById('text-light-picker');
const bgDarkPicker = document.getElementById('bg-dark-picker');
const textDarkPicker = document.getElementById('text-dark-picker');
const radiusSlider = document.getElementById('radius-slider');
const tabSelect = document.getElementById('tab-select');
const engineSelect = document.getElementById('engine-select');

const searchEngines = {
    google: 'https://www.google.com/search?igu=1&q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    ecosia: 'https://www.ecosia.org/search?q=',
    qwant: 'https://www.qwant.com/?q=',
    bing: 'https://www.bing.com/search?q=',
    startpage: 'https://www.startpage.com/sp/search?query='
};

function openSearch(query) {
    const url = (searchEngines[settings.engine] || searchEngines.google) + encodeURIComponent(query);
    if (settings.tab === 'new') {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.click();
    } else {
        window.location.href = url;
    }
}

function updateClock() {
    const now = new Date();
    timeEl.innerText = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    dateEl.innerText = `${now.toLocaleDateString('de-DE', options)} • Kiel, 18°C`;
}
setInterval(updateClock, 1000);
updateClock();

let settings = JSON.parse(localStorage.getItem('startpage_settings')) || {
    theme: 'auto',
    bgLight: '#CDC3B7',
    textLight: '#1a4a8c',
    bgDark: '#000000',
    textDark: '#CDC3B7',
    radius: '25',
    engine: 'google',
    tab: 'new',
    history: []
};

if (settings.bg && !settings.bgLight) {
    settings.bgLight = settings.bg;
    settings.textLight = settings.text;
    settings.bgDark = '#000000';
    settings.textDark = '#CDC3B7';
    delete settings.bg;
    delete settings.text;
}
if (!settings.theme) settings.theme = 'auto';

let systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function getActiveTheme() {
    if (settings.theme === 'auto') return systemDark.matches ? 'dark' : 'light';
    return settings.theme;
}

function applySettings() {
    const activeTheme = getActiveTheme();
    document.documentElement.setAttribute('data-theme', activeTheme);

    const bg = activeTheme === 'dark' ? settings.bgDark : settings.bgLight;
    const text = activeTheme === 'dark' ? settings.textDark : settings.textLight;
    document.documentElement.style.setProperty('--bg', bg);
    document.documentElement.style.setProperty('--text', text);

    themeSelect.value = settings.theme;
    bgLightPicker.value = settings.bgLight;
    textLightPicker.value = settings.textLight;
    bgDarkPicker.value = settings.bgDark;
    textDarkPicker.value = settings.textDark;
    document.documentElement.style.setProperty('--search-radius', `${settings.radius}px`);
    radiusSlider.value = settings.radius;
    tabSelect.value = settings.tab;
    engineSelect.value = settings.engine;

    renderBadges();
    renderHistoryList();
}

function saveSettings() {
    localStorage.setItem('startpage_settings', JSON.stringify(settings));
    applySettings();
}

function renderBadges() {
    badgesEl.innerHTML = '';
    settings.history.forEach((entry, i) => {
        const badge = document.createElement('button');
        badge.className = 'badge';
        badge.style.animationDelay = `${i * 0.03}s`;

        const label = document.createElement('span');
        label.textContent = entry.query || entry;
        badge.appendChild(label);

        const del = document.createElement('button');
        del.className = 'badge-del';
        del.innerHTML = '&times;';
        del.title = 'Entfernen';
        del.addEventListener('click', (e) => {
            e.stopPropagation();
            settings.history.splice(i, 1);
            saveSettings();
        });

        badge.appendChild(del);
        badge.addEventListener('click', () => openSearch(entry.query || entry));
        badgesEl.appendChild(badge);
    });
}

function renderHistoryList() {
    historyListEl.innerHTML = '';
    if (settings.history.length === 0) {
        historyListEl.innerHTML = '<div style="font-size:0.85rem;opacity:0.5;text-align:center;padding:8px;">Kein Verlauf</div>';
        return;
    }
    settings.history.forEach((entry, i) => {
        const row = document.createElement('div');
        row.className = 'history-item';

        const span = document.createElement('span');
        span.textContent = entry.query || entry;
        row.appendChild(span);

        const del = document.createElement('button');
        del.className = 'badge-del';
        del.innerHTML = '&times;';
        del.title = 'Löschen';
        del.addEventListener('click', () => {
            settings.history.splice(i, 1);
            saveSettings();
        });
        row.appendChild(del);

        historyListEl.appendChild(row);
    });
}

function addToHistory(query, name) {
    const trimmed = query.trim();
    if (!trimmed) return;

    settings.history = settings.history.filter(e => (e.query || e).toLowerCase() !== trimmed.toLowerCase());
    settings.history.push({ query: trimmed, name: name || trimmed });
    if (settings.history.length > 30) settings.history.shift();
    saveSettings();
}

document.getElementById('search-box').addEventListener('submit', function(e) {
    e.preventDefault();
    const q = inputEl.value.trim();
    if (!q) return;
    addToHistory(q);
    openSearch(q);
});

toggleBtn.addEventListener('click', () => modalEl.classList.remove('hidden'));
closeBtn.addEventListener('click', () => modalEl.classList.add('hidden'));
modalEl.addEventListener('click', (e) => { if (e.target === modalEl) modalEl.classList.add('hidden'); });

themeSelect.addEventListener('change', (e) => { settings.theme = e.target.value; saveSettings(); });
bgLightPicker.addEventListener('input', (e) => { settings.bgLight = e.target.value; saveSettings(); });
textLightPicker.addEventListener('input', (e) => { settings.textLight = e.target.value; saveSettings(); });
bgDarkPicker.addEventListener('input', (e) => { settings.bgDark = e.target.value; saveSettings(); });
textDarkPicker.addEventListener('input', (e) => { settings.textDark = e.target.value; saveSettings(); });
radiusSlider.addEventListener('input', (e) => { settings.radius = e.target.value; saveSettings(); });
tabSelect.addEventListener('change', (e) => { settings.tab = e.target.value; saveSettings(); });
engineSelect.addEventListener('change', (e) => { settings.engine = e.target.value; saveSettings(); });

clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Verlauf löschen?')) {
        settings.history = [];
        saveSettings();
    }
});

document.getElementById('clear-all').addEventListener('click', () => {
    if (confirm('Alle Daten (Einstellungen + Verlauf) unwiderruflich löschen?')) {
        localStorage.removeItem('startpage_settings');
        location.reload();
    }
});

systemDark.addEventListener('change', () => {
    if (settings.theme === 'auto') applySettings();
});

applySettings();
setTimeout(() => inputEl.focus(), 50);

// ==========================================
// 0. UTILIDADES
// ==========================================
const $ = (id) => document.getElementById(id);

const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

function setText(id, text) {
    const el = $(id);
    if (el) el.textContent = text;
}

function pad(n) {
    return String(n).padStart(2, '0');
}

function storageGet(key, fallback) {
    try {
        const v = localStorage.getItem(key);
        return v === null ? fallback : v;
    } catch (e) {
        return fallback;
    }
}

function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* modo privado / bloqueado */ }
}

async function fetchJSON(url, timeoutMs = 10000) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
}

function timeAgo(ts) {
    if (!ts) return '';
    const diff = Math.max(0, Date.now() - ts);
    const min = Math.round(diff / 60000);
    if (min < 1) return 'agora';
    if (min < 60) return `há ${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `há ${h} h`;
    return `há ${Math.round(h / 24)} d`;
}

// ==========================================
// GREETER (lembra o nome para não perguntar toda vez)
// ==========================================
function user() {
    let nome = storageGet('dc-nome', '');
    if (!nome) {
        const resp = prompt("Qual é o seu nome?");
        nome = (resp || '').trim();
        if (nome) storageSet('dc-nome', nome);
    }
    setText('usuario', nome ? `Bem-vindo(a), ${nome}!` : 'Bem-vindo(a)!');
}

// ==========================================
// 1. LISTA DE ANIVERSÁRIOS (EDITE AQUI 'MM-DD')
// ==========================================
const birthdays = [
    { name: "Kiwi", date: "01-10" },
    { name: "Pedro Toppem", date: "01-14" },
    { name: "Juan", date: "01-15" },
    { name: "Kauan", date: "01-18" },
    { name: "Bryan", date: "02-01" },
    { name: "Pablo", date: "02-02" },
    { name: "Johnny", date: "02-07" },
    { name: "Lucas Skinner", date: "02-17" },
    { name: "Thiago R.", date: "02-28" },
    { name: "Felipe C.", date: "03-02" },
    { name: "Lucas G. 'Aleijado'", date: "03-03" },
    { name: "Breno L", date: "03-22" },
    { name: "Karen", date: "03-24" },
    { name: "João Pedro", date: "03-26" },
    { name: "Isys", date: "04-02" },
    { name: "Dantas", date: "04-21" },
    { name: "Caio P.", date: "04-25" },
    { name: "Evans", date: "04-25" },
    { name: "Gabriel San", date: "04-26" },
    { name: "Artiie", date: "04-27" },
    { name: "Taísa", date: "05-06" },
    { name: "Silverhand", date: "05-12" },
    { name: "Dimmy", date: "05-13" },
    { name: "Erick", date: "05-16" },
    { name: "Edu F.", date: "06-17" },
    { name: "MK", date: "06-20" },
    { name: "Manu", date: "06-24" },
    { name: "Yud", date: "07-04" },
    { name: "Silvia", date: "07-05" },
    { name: "Pedro 'Thrash' Lucas", date: "07-05" },
    { name: "Dani", date: "07-10" },
    { name: "João Arthur", date: "07-13" },
    { name: "Luna", date: "07-16" },
    { name: "White", date: "07-18" },
    { name: "Faela", date: "07-23" },
    { name: "Alexa", date: "08-13" },
    { name: "Breno D.D.", date: "10-09" },
    { name: "Caynan", date: "10-01" },
    { name: "Carol", date: "10-01" },
    { name: "Lucas Leres", date: "10-07" },
    { name: "Alicia", date: "10-27" },
    { name: "Drica", date: "10-31" },
    { name: "Hanzõ", date: "10-11" },
    { name: "Du", date: "11-11" },
    { name: "Matheus S.", date: "11-22" },
    { name: "Valdier", date: "11-28" },
    { name: "Brenno", date: "11-30" },
    { name: "Lari", date: "12-02" },
    { name: "Francisco", date: "12-09" },
    { name: "João M.", date: "12-16" },
    { name: "Anderson", date: "12-19" },
    { name: "Brenda", date: "12-20" },
    { name: "Fran", date: "12-12" },
    { name: "Kaique", date: "12-16" },
    { name: "DEATH CLUB", date: "12-25" },
    { name: "Isadora Botinha", date: "12-28" }
];

// Cópia ordenada por data (a lista original fica intacta)
const sortedBirthdays = [...birthdays].sort((a, b) => a.date.localeCompare(b.date));

// ==========================================
// 2. CAPITAIS E DADOS LOCAIS (FALLBACK DE CLIMA)
// ==========================================
const capitals = [
    { name: "Rio de Janeiro (RJ)", lat: -22.9068, lon: -43.1729, temp: 28, condition: "Parcialmente Nublado", icon: "fa-cloud-sun", wind: 18 },
    { name: "São Paulo (SP)", lat: -23.5505, lon: -46.6333, temp: 24, condition: "Nublado", icon: "fa-cloud", wind: 15 },
    { name: "Brasília (DF)", lat: -15.7801, lon: -47.9292, temp: 29, condition: "Pancadas de Chuva", icon: "fa-cloud-sun-rain", wind: 22 },
    { name: "Belo Horizonte (MG)", lat: -19.9167, lon: -43.9345, temp: 27, condition: "Ensolarado", icon: "fa-sun", wind: 12 },
    { name: "Salvador (BA)", lat: -12.9714, lon: -38.5014, temp: 30, condition: "Ensolarado", icon: "fa-sun", wind: 20 },
    { name: "Porto Alegre (RS)", lat: -30.0346, lon: -51.2177, temp: 19, condition: "Chuva", icon: "fa-cloud-rain", wind: 28 },
    { name: "Curitiba (PR)", lat: -25.4284, lon: -49.2733, temp: 20, condition: "Nublado", icon: "fa-cloud", wind: 14 },
    { name: "Recife (PE)", lat: -8.0476, lon: -34.8770, temp: 31, condition: "Ensolarado", icon: "fa-sun", wind: 25 },
    { name: "Fortaleza (CE)", lat: -3.7319, lon: -38.5267, temp: 32, condition: "Ensolarado", icon: "fa-sun", wind: 24 },
    { name: "Manaus (AM)", lat: -3.1190, lon: -60.0217, temp: 34, condition: "Tempestade com Raios", icon: "fa-cloud-bolt", wind: 35 },
    { name: "Belém (PA)", lat: -1.4558, lon: -48.4902, temp: 33, condition: "Pancadas de Chuva", icon: "fa-cloud-showers-heavy", wind: 16 },
    { name: "Florianópolis (SC)", lat: -27.5954, lon: -48.5480, temp: 22, condition: "Parcialmente Nublado", icon: "fa-cloud-sun", wind: 19 }
];

// Códigos WMO da Open-Meteo (https://open-meteo.com/en/docs)
function getWeatherIcon(code) {
    if (code === 0) return { icon: "fa-sun", text: "Límpido" };
    if (code <= 3) return { icon: "fa-cloud-sun", text: "Parcialmente Nublado" };
    if (code === 45 || code === 48) return { icon: "fa-smog", text: "Nevoeiro" };
    if (code >= 51 && code <= 57) return { icon: "fa-cloud-rain", text: "Garoa" };
    if (code >= 61 && code <= 67) return { icon: "fa-cloud-rain", text: code >= 65 ? "Chuva Forte" : "Chuva" };
    if (code >= 71 && code <= 77) return { icon: "fa-snowflake", text: "Neve/Gelo" };
    if (code >= 80 && code <= 82) return { icon: "fa-cloud-showers-heavy", text: "Pancadas de Chuva" };
    if (code === 85 || code === 86) return { icon: "fa-snowflake", text: "Pancadas de Neve" };
    if (code >= 95) return { icon: "fa-cloud-bolt", text: "Tempestade com Raios" };
    return { icon: "fa-cloud", text: "Nublado" };
}

// ==========================================
// 3. RELÓGIO EM TEMPO REAL DA TOP BAR
// ==========================================
function updateClock() {
    const now = new Date();
    setText('gnome-clock', `${pad(now.getHours())}:${pad(now.getMinutes())}`);
}

// ==========================================
// 4. DETECÇÃO DE SISTEMA OPERACIONAL (v2)
// ==========================================
// Lê o user agent (síncrono) e depois refina com User-Agent Client Hints
// (Chromium), que informam versão real do Windows 11/macOS/Android,
// arquitetura e se o navegador é Brave.
function parseUserAgent() {
    const ua = navigator.userAgent;
    const low = ua.toLowerCase();
    const platformHint = ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '').toLowerCase();

    const info = {
        os: 'Desconhecido',
        version: '',
        family: 'fa-solid',
        icon: 'fa-desktop',
        device: 'Desktop',
        arch: '',
        browser: ''
    };

    if (/android/.test(low)) {
        info.os = 'Android';
        info.family = 'fa-brands'; info.icon = 'fa-android';
        info.device = /mobile/.test(low) ? 'Celular' : 'Tablet';
        const m = ua.match(/Android\s([\d.]+)/i);
        if (m) info.version = m[1];
    } else if (/iphone|ipod/.test(low) || /ipad/.test(low) ||
               (platformHint.includes('mac') && navigator.maxTouchPoints > 1)) {
        // iPadOS moderno se identifica como Macintosh; o toque entrega
        const isIpad = /ipad/.test(low) || (!/iphone|ipod/.test(low));
        info.os = isIpad ? 'iPadOS' : 'iOS';
        info.family = 'fa-brands'; info.icon = 'fa-apple';
        info.device = isIpad ? 'Tablet' : 'Celular';
        const m = ua.match(/OS (\d+[._]\d+)/);
        if (m && !/macintosh/.test(low)) info.version = m[1].replace('_', '.');
    } else if (/windows nt|windows phone/.test(low) || platformHint.includes('win')) {
        info.os = 'Windows';
        info.family = 'fa-brands'; info.icon = 'fa-windows';
        const nt = ua.match(/Windows NT ([\d.]+)/);
        if (nt) {
            const map = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista', '5.1': 'XP' };
            info.version = map[nt[1]] || nt[1];
        }
    } else if (/cros/.test(low)) {
        info.os = 'ChromeOS';
        info.family = 'fa-brands'; info.icon = 'fa-chrome';
    } else if (/mac os x|macintosh/.test(low) || platformHint.includes('mac')) {
        info.os = 'macOS';
        info.family = 'fa-brands'; info.icon = 'fa-apple';
        // Chrome/Safari congelam em 10_15_7, então só mostramos se for confiável
    } else if (/freebsd|openbsd|netbsd|dragonfly/.test(low)) {
        const bsd = low.match(/freebsd|openbsd|netbsd|dragonfly/)[0];
        info.os = { freebsd: 'FreeBSD', openbsd: 'OpenBSD', netbsd: 'NetBSD', dragonfly: 'DragonFly BSD' }[bsd];
        info.family = 'fa-brands';
        info.icon = bsd === 'freebsd' ? 'fa-freebsd' : 'fa-linux';
    } else if (/linux|x11/.test(low) || platformHint.includes('linux')) {
        info.os = 'Linux';
        info.family = 'fa-brands'; info.icon = 'fa-linux';
        // Alguns navegadores (Firefox) expõem a distro no UA
        const distros = [
            [/ubuntu/, 'Ubuntu', 'fa-ubuntu'],
            [/fedora/, 'Fedora', 'fa-fedora'],
            [/centos/, 'CentOS', 'fa-centos'],
            [/red hat|rhel/, 'Red Hat', 'fa-redhat'],
            [/suse/, 'openSUSE', 'fa-suse'],
            [/debian/, 'Debian', 'fa-linux'],
            [/linux mint|mint/, 'Linux Mint', 'fa-linux'],
            [/arch/, 'Arch Linux', 'fa-linux']
        ];
        for (const [re, name, icon] of distros) {
            if (re.test(low)) { info.os = name; info.icon = icon; break; }
        }
    }

    // Arquitetura (aproximada pelo UA; refinada depois pelos Client Hints)
    if (/aarch64|arm64/.test(low)) info.arch = 'ARM64';
    else if (/x86_64|x64|win64|amd64|wow64/.test(low)) info.arch = 'x64';
    else if (/\barm/.test(low)) info.arch = 'ARM';
    else if (/i[3-6]86|win32/.test(low)) info.arch = 'x86';

    // Navegador (ordem importa: Edge/Opera/Samsung também dizem "Chrome")
    if (/edg(e|a|ios)?\//.test(low)) info.browser = 'Edge';
    else if (/opr\/|opera/.test(low)) info.browser = 'Opera';
    else if (/samsungbrowser/.test(low)) info.browser = 'Samsung Internet';
    else if (/firefox|fxios/.test(low)) info.browser = 'Firefox';
    else if (/chrome|crios|chromium/.test(low)) info.browser = 'Chrome';
    else if (/safari/.test(low)) info.browser = 'Safari';

    return info;
}

function renderOS(info) {
    const label = `${info.os} ${info.version}`.trim();
    const detail = [label, info.arch, info.device, info.browser].filter(Boolean).join(' · ');

    const iconEl = $('os-icon');
    if (iconEl) iconEl.className = `${info.family} ${info.icon} text-base`;

    const badgeEl = $('os-badge');
    if (badgeEl) badgeEl.title = `Sistema: ${detail}`;

    setText('sys-status-os', label);
    setText('sys-status-browser', info.browser || '—');
}

async function detectOS() {
    const info = parseUserAgent();
    renderOS(info); // primeira renderização imediata

    const uad = navigator.userAgentData;
    if (uad && typeof uad.getHighEntropyValues === 'function') {
        try {
            const hi = await uad.getHighEntropyValues(['platformVersion', 'architecture', 'bitness']);
            const major = parseInt((hi.platformVersion || '0').split('.')[0], 10);

            if (info.os === 'Windows' && major) {
                // platformVersion >= 13 corresponde ao Windows 11
                info.version = major >= 13 ? '11' : '10';
            } else if (info.os === 'macOS' && hi.platformVersion) {
                const [a, b] = hi.platformVersion.split('.');
                info.version = `${a}.${b || 0}`;
            } else if (info.os === 'Android' && hi.platformVersion) {
                info.version = hi.platformVersion.split('.').slice(0, 2).join('.');
            }

            if (hi.architecture) {
                const arch = hi.architecture === 'arm' ? 'ARM' : hi.architecture;
                info.arch = hi.bitness === '64'
                    ? (arch === 'x86' ? 'x64' : `${arch.toUpperCase()}64`)
                    : arch;
            }
            if (uad.mobile && info.device === 'Desktop') info.device = 'Celular';
        } catch (e) { /* usuário/navegador bloqueou os hints: mantém o UA */ }
    }

    // Brave se esconde como Chrome
    try {
        if (navigator.brave && (await navigator.brave.isBrave())) info.browser = 'Brave';
    } catch (e) { /* ignora */ }

    renderOS(info);
}

// ==========================================
// 5. NAVEGAÇÃO DE ABAS INTERNAS E DOCKBAR
// ==========================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('text-blue-400', 'border-b-2', 'border-blue-500');
        btn.classList.add('text-gray-400');
    });

    const targetTab = $('tab-' + tabId);
    if (targetTab) targetTab.classList.add('active');

    const btn = $('btn-' + tabId);
    if (btn) {
        btn.classList.remove('text-gray-400');
        btn.classList.add('text-blue-400', 'border-b-2', 'border-blue-500');
    }
}

// ==========================================
// 6. ANIVERSÁRIOS: ALERTA, LISTA E CONTADORES
// ==========================================
let lastBirthdayCheckDay = null;

function todayKey() {
    const n = new Date();
    return `${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
}

// Dias até a próxima ocorrência de "MM-DD" (0 = hoje)
function daysUntil(mmdd) {
    const [m, d] = mmdd.split('-').map(Number);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let target = new Date(now.getFullYear(), m - 1, d);
    if (target < today) target = new Date(now.getFullYear() + 1, m - 1, d);
    return Math.round((target - today) / 86400000);
}

function relativeLabel(days) {
    if (days === 0) return 'hoje';
    if (days === 1) return 'amanhã';
    return `em ${days} dias`;
}

function renderBirthdayStats(today) {
    const month = today.slice(0, 2);
    const todayList = birthdays.filter(b => b.date === today);
    const monthList = birthdays.filter(b => b.date.startsWith(month));

    // Próximo = menor distância > 0 (quem faz hoje já aparece no contador "Hoje")
    let nextDays = Infinity;
    birthdays.forEach(b => {
        const d = daysUntil(b.date);
        if (d > 0 && d < nextDays) nextDays = d;
    });
    const nextList = birthdays.filter(b => daysUntil(b.date) === nextDays);

    setText('bday-stat-today', todayList.length);
    setText('bday-stat-month', monthList.length);
    setText('bday-stat-total', birthdays.length);

    if (nextList.length) {
        setText('bday-next-name', nextList.map(b => b.name).join(', '));
        setText('bday-next-when', `${relativeLabel(nextDays)} · ${nextList[0].date.split('-').reverse().join('/')}`);
    } else {
        setText('bday-next-name', '—');
        setText('bday-next-when', '');
    }
}

function checkBirthdays() {
    const todayFormatted = todayKey();
    lastBirthdayCheckDay = todayFormatted;

    const todayBirthdays = birthdays.filter(b => b.date === todayFormatted);
    const listContainer = $('birthday-list');

    // Qual é o próximo aniversário (para destacar na lista)?
    let nextDays = Infinity;
    birthdays.forEach(b => {
        const d = daysUntil(b.date);
        if (d > 0 && d < nextDays) nextDays = d;
    });

    if (listContainer) {
        listContainer.innerHTML = '';
        sortedBirthdays.forEach(b => {
            const [m, d] = b.date.split('-');
            const days = daysUntil(b.date);
            const isToday = days === 0;
            const isNext = days === nextDays;

            const item = document.createElement('div');
            item.className = `p-4 flex justify-between items-center ${isToday ? 'bg-blue-950/40' : ''}`;
            item.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-blue-400 font-bold text-sm">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <div>
                        <span class="font-semibold text-white text-sm">${esc(b.name)}</span>
                        ${isToday ? '<span class="ml-2 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold uppercase">Hoje</span>' : ''}
                        ${isNext ? '<span class="ml-2 text-[10px] bg-gray-700 text-blue-200 px-2 py-0.5 rounded font-bold uppercase">Próximo</span>' : ''}
                    </div>
                </div>
                <div class="text-right">
                    <span class="block text-xs text-gray-300 font-mono">${d}/${m}</span>
                    <span class="block text-[10px] text-gray-500">${isToday ? 'é hoje!' : relativeLabel(days)}</span>
                </div>
            `;
            listContainer.appendChild(item);
        });
    }

    renderBirthdayStats(todayFormatted);

    const alertContainer = $('birthday-alert-container');
    const badge = $('badge-bday');
    const dockDot = $('dock-bday-dot');

    if (todayBirthdays.length > 0) {
        setText('birthday-alert-text', `Parabéns hoje para: ${todayBirthdays.map(b => b.name).join(', ')}!`);
        if (alertContainer) alertContainer.classList.remove('hidden');
        if (badge) {
            badge.textContent = todayBirthdays.length;
            badge.classList.remove('hidden');
        }
        if (dockDot) dockDot.classList.remove('hidden');
    } else {
        // Virou o dia e ninguém faz aniversário: limpa o que sobrou de ontem
        if (alertContainer) alertContainer.classList.add('hidden');
        if (badge) badge.classList.add('hidden');
        if (dockDot) dockDot.classList.add('hidden');
    }
}

function dismissBirthdayAlert() {
    const alertContainer = $('birthday-alert-container');
    if (alertContainer) alertContainer.classList.add('hidden');
}

// ==========================================
// 7. CLIMA (API + FALLBACK)
// ==========================================
function renderWeatherGrid(dataList) {
    const grid = $('weather-modal-grid');
    if (!grid) return;

    grid.innerHTML = '';

    dataList.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card-custom p-4 flex flex-col items-center justify-center text-center space-y-2';
        card.innerHTML = `
            <span class="text-xs font-semibold text-gray-400">${esc(item.name)}</span>
            <i class="fa-solid ${esc(item.icon)} text-2xl text-blue-400 my-1"></i>
            <span class="text-2xl font-extrabold text-white">${esc(item.temp)}°C</span>
            <span class="text-xs text-blue-300 font-medium">${esc(item.condition)}</span>
            <span class="text-[10px] text-gray-500 font-mono">Vento: ${esc(item.wind)} km/h</span>
            ${item.offline ? '<span class="text-[10px] text-amber-500/80">dados offline</span>' : ''}
        `;
        grid.appendChild(card);
    });
}

// Gera alertas a partir dos dados REAIS da API (ignora o fallback estático)
function computeWeatherAlerts(dataList) {
    const alerts = [];
    const now = Date.now();

    dataList.forEach(item => {
        if (item.offline) return;

        if (item.temp >= 40) {
            alerts.push({
                id: `wx-heat-${item.name}`, source: 'Clima', severity: 'high',
                icon: 'fa-temperature-arrow-up', time: now,
                title: `Onda de calor extrema em ${item.name}`,
                detail: `${item.temp}°C agora`
            });
        }
        if (item.wind >= 50) {
            alerts.push({
                id: `wx-wind-${item.name}`, source: 'Clima', severity: 'high',
                icon: 'fa-wind', time: now,
                title: `Ventania forte em ${item.name}`,
                detail: `${item.wind} km/h`
            });
        } else if (item.wind >= 40) {
            alerts.push({
                id: `wx-wind-${item.name}`, source: 'Clima', severity: 'medium',
                icon: 'fa-wind', time: now,
                title: `Vento forte em ${item.name}`,
                detail: `${item.wind} km/h`
            });
        }
        if (item.code >= 95) {
            alerts.push({
                id: `wx-storm-${item.name}`, source: 'Clima',
                severity: (item.code === 96 || item.code === 99) ? 'high' : 'medium',
                icon: 'fa-cloud-bolt', time: now,
                title: `Tempestade com raios em ${item.name}`,
                detail: (item.code === 96 || item.code === 99) ? 'Possibilidade de granizo' : item.condition
            });
        } else if (item.code === 65 || item.code === 67 || item.code === 82) {
            alerts.push({
                id: `wx-rain-${item.name}`, source: 'Clima', severity: 'medium',
                icon: 'fa-cloud-showers-heavy', time: now,
                title: `Chuva forte em ${item.name}`,
                detail: item.condition
            });
        }
    });
    return alerts;
}

async function fetchWeatherData() {
    // Dados locais primeiro, para a tela não ficar vazia
    const offlineData = capitals.map(c => ({ ...c, offline: true }));
    renderWeatherGrid(offlineData);

    const defaultCity = capitals[0];
    setText('topbar-temp', `${defaultCity.temp}°C`);
    const topIcon = $('topbar-weather-icon');
    if (topIcon) topIcon.className = `fa-solid ${defaultCity.icon} text-blue-400`;

    try {
        const results = await Promise.all(capitals.map(async (c) => {
            try {
                const data = await fetchJSON(
                    `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current_weather=true`
                );
                if (data && data.current_weather) {
                    const cw = data.current_weather;
                    const info = getWeatherIcon(cw.weathercode);
                    return {
                        name: c.name,
                        temp: Math.round(cw.temperature),
                        wind: Math.round(cw.windspeed),
                        code: cw.weathercode,
                        condition: info.text,
                        icon: info.icon
                    };
                }
            } catch (e) { /* falha individual: usa dado local */ }
            return { ...c, offline: true };
        }));

        if (results.length > 0) {
            setText('topbar-temp', `${results[0].temp}°C`);
            if (topIcon) topIcon.className = `fa-solid ${results[0].icon} text-blue-400`;
        }

        renderWeatherGrid(results);

        const anyLive = results.some(r => !r.offline);
        alertsState.weather = computeWeatherAlerts(results);
        if (!anyLive) sourceErrors.add('Clima'); else sourceErrors.delete('Clima');
        renderAlerts();
    } catch (err) {
        console.warn("Usando dados meteorológicos estáticos:", err);
    }
}

function toggleWeatherModal() {
    const modal = $('weather-modal');
    if (modal) modal.classList.toggle('hidden');
}

// ==========================================
// 8. CENTRAL DE ALERTAS DE DESASTRES (TOP BAR)
// ==========================================
// Fontes:
//  - Clima:      Open-Meteo (já usada acima)
//  Todas as fontes são filtradas para o território brasileiro:
//  - Clima:      capitais brasileiras (Open-Meteo)
//  - USGS:       terremotos/tremores M2.5+ no Brasil (últimos 7 dias)
//  - NASA EONET: tempestades, enchentes, deslizamentos, seca, temperatura extrema e queimadas
//  - INMET:      avisos meteorológicos ativos (tentativa; ver nota em fetchINMET)
const alertsState = { weather: [], usgs: [], eonet: [], inmet: [] };
const sourceErrors = new Set();
let alertsLastUpdate = null;
let alertsFirstRender = true;
let dismissedBannerKey = '';

const SEVERITY_RANK = { high: 0, medium: 1, low: 2 };
const SEVERITY_STYLE = {
    high:   { text: 'text-red-400',   border: 'border-red-500/70',   bg: 'bg-red-950/95',   label: 'Alto' },
    medium: { text: 'text-amber-400', border: 'border-amber-500/60', bg: 'bg-amber-950/90', label: 'Médio' },
    low:    { text: 'text-blue-300',  border: 'border-blue-500/50',  bg: 'bg-blue-950/90',  label: 'Informativo' }
};

// Contorno simplificado do Brasil [lat, lon]. Erro de dezenas de km nas fronteiras,
// suficiente para separar o Brasil de Argentina, Paraguai, Bolívia, Peru, Colômbia etc.
const BRAZIL_POLYGON = [
    [5.27, -60.20], [4.0, -59.9], [2.0, -58.7], [1.2, -57.0], [2.2, -55.9], [2.3, -54.5],
    [3.8, -52.9], [4.4, -51.65], [4.0, -51.3], [1.8, -50.0], [0.0, -49.9], [-0.8, -48.5],
    [-1.0, -46.0], [-2.5, -44.2], [-2.8, -41.5], [-3.7, -38.5], [-5.1, -35.2], [-7.1, -34.8],
    [-8.8, -35.1], [-9.7, -35.7], [-12.9, -38.4], [-15.8, -38.9], [-18.5, -39.7], [-20.3, -40.2],
    [-22.0, -40.9], [-22.9, -42.0], [-23.0, -43.2], [-23.9, -46.3], [-25.5, -48.5], [-27.5, -48.4],
    [-29.3, -49.7], [-31.4, -51.2], [-33.7, -53.4], [-32.6, -53.4], [-30.9, -55.5], [-30.2, -57.6],
    [-29.75, -57.1], [-28.7, -56.0], [-27.9, -55.2], [-27.2, -53.9], [-26.1, -53.7], [-25.6, -54.6],
    [-24.1, -54.3], [-22.5, -55.7], [-22.1, -57.9], [-19.0, -57.65], [-17.8, -57.5], [-16.3, -58.4],
    [-15.5, -60.1], [-13.5, -60.5], [-12.5, -62.0], [-10.3, -65.4], [-10.4, -67.0], [-11.1, -68.8],
    [-10.95, -69.6], [-9.8, -70.6], [-9.5, -72.3], [-7.5, -74.0], [-6.0, -73.3], [-4.3, -70.0], [-1.1, -69.7],
    [0.7, -69.6], [1.2, -69.4], [1.8, -67.1], [0.8, -66.0], [1.5, -65.5], [2.5, -64.0],
    [4.2, -64.0], [5.2, -60.7]
];

// Ray casting: o ponto está dentro do polígono?
function inBrazil(lat, lon) {
    if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) return false;
    let inside = false;
    const P = BRAZIL_POLYGON;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
        const [yi, xi] = P[i];
        const [yj, xj] = P[j];
        if (((yi > lat) !== (yj > lat)) && (lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}

// Terremotos no Brasil são raros e pequenos, então usamos a consulta do USGS com
// caixa ao redor do país, M2.5+ nos últimos 7 dias, e filtramos pelo contorno.
async function fetchUSGS() {
    const start = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson'
        + '&minlatitude=-34&maxlatitude=6&minlongitude=-74&maxlongitude=-34'
        + `&minmagnitude=2.5&orderby=time&limit=100&starttime=${start}`;
    const data = await fetchJSON(url);

    alertsState.usgs = (data.features || [])
        .filter(f => {
            const [lon, lat] = (f.geometry && f.geometry.coordinates) || [];
            const place = (f.properties && f.properties.place) || '';
            // Dentro do contorno OU descrito pelo USGS como "Brazil" (inclui costa)
            return inBrazil(lat, lon) || /brazil|brasil/i.test(place);
        })
        .map(f => {
            const mag = f.properties.mag;
            return {
                id: `usgs-${f.id}`,
                source: 'USGS',
                severity: mag >= 5 ? 'high' : (mag >= 4 ? 'medium' : 'low'),
                icon: 'fa-house-crack',
                time: f.properties.time,
                title: `${mag >= 4.5 ? 'Terremoto' : 'Tremor'} M${mag.toFixed(1)} no Brasil`,
                detail: f.properties.place
            };
        });
}

// Centro aproximado de uma geometria do EONET (ponto ou polígono)
function eonetCenter(geo) {
    if (!geo || !Array.isArray(geo.coordinates)) return [null, null];
    if (geo.type === 'Point') return [geo.coordinates[1], geo.coordinates[0]];
    if (geo.type === 'Polygon' && geo.coordinates[0]) {
        const ring = geo.coordinates[0];
        const lon = ring.reduce((s, c) => s + c[0], 0) / ring.length;
        const lat = ring.reduce((s, c) => s + c[1], 0) / ring.length;
        return [lat, lon];
    }
    return [null, null];
}

async function fetchEONET() {
    const data = await fetchJSON(
        'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=10&limit=200'
        + '&category=severeStorms,floods,landslides,drought,tempExtremes,wildfires'
    );
    const catInfo = {
        severeStorms: { label: 'Tempestade severa', icon: 'fa-hurricane', severity: 'medium' },
        floods:       { label: 'Enchente', icon: 'fa-water', severity: 'medium' },
        landslides:   { label: 'Deslizamento', icon: 'fa-mountain', severity: 'medium' },
        drought:      { label: 'Seca', icon: 'fa-sun-plant-wilt', severity: 'low' },
        tempExtremes: { label: 'Temperatura extrema', icon: 'fa-temperature-high', severity: 'medium' },
        wildfires:    { label: 'Queimada', icon: 'fa-fire', severity: 'low' }
    };

    const out = [];
    let wildfireCount = 0;

    (data.events || []).forEach(ev => {
        const cat = ev.categories && ev.categories[0] && ev.categories[0].id;
        const meta = catInfo[cat];
        if (!meta) return;

        const geo = ev.geometry && ev.geometry[ev.geometry.length - 1];
        const [lat, lon] = eonetCenter(geo);
        if (!inBrazil(lat, lon)) return; // só o que está dentro do Brasil

        // Queimadas costumam ser muitas: no máximo 8
        if (cat === 'wildfires') {
            if (wildfireCount >= 8) return;
            wildfireCount++;
        }

        out.push({
            id: `eonet-${ev.id}`,
            source: 'NASA EONET',
            severity: meta.severity,
            icon: meta.icon,
            time: geo && geo.date ? Date.parse(geo.date) : null,
            title: meta.label,
            detail: ev.title
        });
    });

    alertsState.eonet = out;
}

// NOTA: o endpoint e o formato abaixo são uma tentativa (best-effort). Se o INMET
// bloquear o acesso do navegador (CORS) ou mudar o formato, a fonte é ignorada
// e o aviso "fontes indisponíveis" aparece no painel.
async function fetchINMET() {
    const data = await fetchJSON('https://apiprevmet3.inmet.gov.br/avisos/ativos');
    const items = Array.isArray(data)
        ? data
        : [].concat(data.hoje || [], data.futuro || []);

    alertsState.inmet = items.slice(0, 15).map((it, i) => {
        const sev = String(it.severidade || it.nivel || '').toLowerCase();
        const severity = sev.includes('grande') ? 'high' : (sev.includes('perigo') ? 'medium' : 'low');
        return {
            id: `inmet-${it.id || it.aviso_id || i}`,
            source: 'INMET',
            severity,
            icon: 'fa-triangle-exclamation',
            time: it.data_inicio || it.inicio ? Date.parse(it.data_inicio || it.inicio) || null : null,
            title: it.descricao || it.titulo || 'Aviso meteorológico',
            detail: it.estados || it.avisos_estados || it.severidade || ''
        };
    });
}

async function refreshDisasterAlerts() {
    const sources = [
        ['USGS', fetchUSGS, 'usgs'],
        ['NASA EONET', fetchEONET, 'eonet'],
        ['INMET', fetchINMET, 'inmet']
    ];

    const results = await Promise.allSettled(sources.map(([, fn]) => fn()));
    results.forEach((r, i) => {
        const [name, , key] = sources[i];
        if (r.status === 'rejected') {
            sourceErrors.add(name);
            alertsState[key] = [];
        } else {
            sourceErrors.delete(name);
        }
    });

    alertsLastUpdate = new Date();
    renderAlerts();
}

function getAllAlerts() {
    return [].concat(alertsState.weather, alertsState.usgs, alertsState.eonet, alertsState.inmet)
        .sort((a, b) =>
            (SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]) ||
            ((b.time || 0) - (a.time || 0))
        );
}

function renderAlerts() {
    const alerts = getAllAlerts();
    const hasHigh = alerts.some(a => a.severity === 'high');

    // Sino + contador
    const badge = $('alerts-badge');
    const bell = $('alerts-icon');
    if (badge) {
        badge.textContent = alerts.length > 99 ? '99+' : alerts.length;
        badge.classList.toggle('hidden', alerts.length === 0);
        badge.classList.toggle('bg-red-600', hasHigh);
        badge.classList.toggle('bg-amber-600', !hasHigh);
    }
    if (bell) {
        bell.classList.toggle('text-red-400', hasHigh);
        bell.classList.toggle('animate-pulse', hasHigh);
    }

    // Lista do painel
    const list = $('alerts-list');
    if (list) {
        list.innerHTML = '';
        if (alerts.length === 0) {
            list.innerHTML = `
                <div class="p-6 text-center text-sm text-gray-400">
                    <i class="fa-solid fa-circle-check text-green-500 text-xl mb-2 block"></i>
                    Nenhum alerta ativo no momento.
                </div>`;
        }
        alerts.forEach(a => {
            const st = SEVERITY_STYLE[a.severity];
            const row = document.createElement('div');
            row.className = 'p-3 flex items-start space-x-3';
            row.innerHTML = `
                <i class="fa-solid ${esc(a.icon)} ${st.text} mt-1 w-5 text-center"></i>
                <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-sm font-semibold text-white truncate">${esc(a.title)}</span>
                        <span class="text-[10px] ${st.text} font-bold uppercase flex-shrink-0">${st.label}</span>
                    </div>
                    ${a.detail ? `<p class="text-xs text-gray-300 mt-0.5 break-words">${esc(a.detail)}</p>` : ''}
                    <p class="text-[10px] text-gray-500 mt-1">${esc(a.source)}${a.time ? ' · ' + timeAgo(a.time) : ''}</p>
                </div>`;
            list.appendChild(row);
        });
    }

    // Rodapé do painel
    const footer = $('alerts-footer');
    if (footer) {
        const hora = alertsLastUpdate ? `${pad(alertsLastUpdate.getHours())}:${pad(alertsLastUpdate.getMinutes())}` : '--:--';
        const falhas = sourceErrors.size ? ` · indisponível: ${[...sourceErrors].join(', ')}` : '';
        footer.textContent = `Atualizado às ${hora}${falhas}`;
    }

    updateEmergencyBanner(alerts);
    toastNewAlerts(alerts);
}

// Banner no topo da página: só para alertas de severidade alta
function updateEmergencyBanner(alerts) {
    const banner = $('emergency-banner');
    if (!banner) return;

    const high = alerts.filter(a => a.severity === 'high');
    const key = high.map(a => a.id).sort().join('|');

    if (high.length === 0 || key === dismissedBannerKey) {
        banner.classList.add('hidden');
        return;
    }
    const text = high.slice(0, 3).map(a => a.title).join(' | ') +
        (high.length > 3 ? ` | +${high.length - 3} alertas` : '');
    setText('emergency-text', text);
    banner.classList.remove('hidden');
}

function dismissEmergencyAlert() {
    const high = getAllAlerts().filter(a => a.severity === 'high');
    dismissedBannerKey = high.map(a => a.id).sort().join('|');
    const banner = $('emergency-banner');
    if (banner) banner.classList.add('hidden');
}

// Pop-up (toast) apenas para alertas novos, nunca repetidos entre recargas
function toastNewAlerts(alerts) {
    let seen;
    try { seen = new Set(JSON.parse(storageGet('dc-seen-alerts', '[]'))); }
    catch (e) { seen = new Set(); }

    const fresh = alerts.filter(a => a.severity !== 'low' && !seen.has(a.id));

    // Na primeira carga, evita avalanche: no máximo 3 pop-ups
    const toShow = alertsFirstRender ? fresh.slice(0, 3) : fresh.slice(0, 5);
    toShow.forEach(showToast);

    if (alerts.length) alertsFirstRender = false;

    alerts.forEach(a => seen.add(a.id));
    storageSet('dc-seen-alerts', JSON.stringify([...seen].slice(-200)));
}

function showToast(alert) {
    const container = $('toast-container');
    if (!container) return;
    const st = SEVERITY_STYLE[alert.severity];

    const toast = document.createElement('div');
    toast.setAttribute('role', 'alert');
    toast.className = `${st.bg} ${st.border} border rounded-xl p-3 shadow-lg backdrop-blur-md flex items-start space-x-3`;
    toast.innerHTML = `
        <i class="fa-solid ${esc(alert.icon)} ${st.text} text-lg mt-0.5"></i>
        <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-white">${esc(alert.title)}</p>
            ${alert.detail ? `<p class="text-xs text-gray-200 mt-0.5 break-words">${esc(alert.detail)}</p>` : ''}
            <p class="text-[10px] text-gray-400 mt-1">${esc(alert.source)}</p>
        </div>
        <button class="text-gray-300 hover:text-white" aria-label="Fechar"><i class="fa-solid fa-xmark"></i></button>
    `;
    const close = () => toast.remove();
    toast.querySelector('button').addEventListener('click', close);
    container.appendChild(toast);
    setTimeout(close, alert.severity === 'high' ? 20000 : 12000);
}

function toggleAlertsPanel(force) {
    const panel = $('alerts-panel');
    if (!panel) return;
    const open = typeof force === 'boolean' ? force : panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !open);
    const btn = $('alerts-btn');
    if (btn) btn.setAttribute('aria-expanded', String(open));
}

// Fecha o painel ao clicar fora ou apertar Esc
document.addEventListener('click', (e) => {
    const panel = $('alerts-panel');
    const btn = $('alerts-btn');
    if (!panel || panel.classList.contains('hidden')) return;
    if (!panel.contains(e.target) && btn && !btn.contains(e.target)) toggleAlertsPanel(false);
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        toggleAlertsPanel(false);
        const modal = $('weather-modal');
        if (modal && !modal.classList.contains('hidden')) modal.classList.add('hidden');
    }
});


// ==========================================
// 9.5 WEB APP (PWA): instalação, offline e atalhos
// ==========================================
let deferredInstallPrompt = null;

const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

const isIOS = () =>
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function showInstallButton() {
    const b = $('install-btn');
    if (b) { b.classList.remove('hidden'); b.classList.add('flex'); }
}

function hideInstallButton() {
    const b = $('install-btn');
    if (b) { b.classList.add('hidden'); b.classList.remove('flex'); }
}

// Chrome/Edge/Android: o navegador avisa que o app pode ser instalado
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (!isStandalone()) showInstallButton();
});

window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    hideInstallButton();
    showToast({
        severity: 'low', icon: 'fa-circle-check', source: 'App',
        title: 'DEATH CLUB instalado',
        detail: 'Abra pelo ícone na sua tela inicial ou menu de aplicativos.'
    });
});

async function installApp() {
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        hideInstallButton();
        return;
    }
    if (isIOS()) {
        // iOS não tem prompt de instalação: só instrução manual
        showToast({
            severity: 'low', icon: 'fa-share-from-square', source: 'App',
            title: 'Instalar no iPhone/iPad',
            detail: 'No Safari, toque em Compartilhar e depois em "Adicionar à Tela de Início".'
        });
    }
}

function initTabFromHash() {
    const tabs = ['home', 'hub', 'services', 'library', 'news', 'birthdays'];
    const apply = () => {
        const t = location.hash.slice(1);
        if (tabs.includes(t)) switchTab(t);
    };
    apply();
    window.addEventListener('hashchange', apply);
}

function initPWA() {
    if (isIOS() && !isStandalone()) showInstallButton();

    // Service worker só funciona em HTTPS (ou localhost), nunca em file://
    const secure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if ('serviceWorker' in navigator && secure) {
        navigator.serviceWorker.register('sw.js').then((reg) => {
            reg.addEventListener('updatefound', () => {
                const worker = reg.installing;
                if (!worker) return;
                worker.addEventListener('statechange', () => {
                    // "controller" existe só quando já havia uma versão anterior instalada
                    if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                        showToast({
                            severity: 'low', icon: 'fa-rotate', source: 'App',
                            title: 'Nova versão disponível',
                            detail: 'Recarregue a página para aplicar a atualização.'
                        });
                    }
                });
            });
        }).catch((err) => console.warn('Service worker não registrado:', err));
    }

    window.addEventListener('offline', () => showToast({
        severity: 'medium', icon: 'fa-wifi', source: 'App',
        title: 'Sem conexão',
        detail: 'Clima e alertas voltam a atualizar quando a internet voltar.'
    }));

    window.addEventListener('online', () => {
        showToast({
            severity: 'low', icon: 'fa-wifi', source: 'App',
            title: 'Conexão restabelecida',
            detail: 'Atualizando clima e alertas.'
        });
        fetchWeatherData();
        refreshDisasterAlerts();
    });
}

// ==========================================
// 9. INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
    updateClock();
    setInterval(updateClock, 1000);

    initPWA();
    initTabFromHash();
    detectOS();
    checkBirthdays();
    // Atualiza tudo quando o dia virar (sem reabrir o alerta dispensado a cada hora)
    setInterval(() => { if (todayKey() !== lastBirthdayCheckDay) checkBirthdays(); }, 60000);

    fetchWeatherData();
    setInterval(fetchWeatherData, 15 * 60 * 1000);

    refreshDisasterAlerts();
    setInterval(refreshDisasterAlerts, 10 * 60 * 1000);

    // Por último: prompt() bloqueia a página até a pessoa responder
    setTimeout(user, 50);
});

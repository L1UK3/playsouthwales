const TODAY = new Date();
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const CACHE_SIZE = 5;
const DEFAULT_DEPTH = 2;

class CalendarCache {
    constructor(maxSize = 5) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    get(key) {
        if (this.cache.has(key)) {
            const value = this.cache.get(key);
            this.cache.delete(key); 
            this.cache.set(key, value); 
            return value;
        }
        return null;
    }

    set(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        this.cache.set(key, value);
    }
  
    has(key) {
        return this.cache.has(key);
    }

    getAll() {
        let all = [];
        for (const value of this.cache.values()) {
            if (Array.isArray(value)) {
                all.push(...value);
            }
        }
        return all;
    }
}

let events = new CalendarCache(CACHE_SIZE);
let filteredEvents = {};
let leagues = [];
let leagueMap = {};
let types = {};
let currentView = 'calendar';
let currentDate = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
let selectedDateKey = null;

function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function loadEvents(month, year) {
    try {
        const fetchMonth = month + 1;
        const response = await fetch(`/events?month=${fetchMonth}&year=${year}`);
        if (!response.ok) {
            throw new Error('Failed to fetch events: ' + response.statusText);
        } else {
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
} 

async function loadTypes() {
    try {
        const response = await fetch('/types');
        if (!response.ok) {
            throw new Error('Failed to fetch event types: ' + response.statusText);
        } else {
            const data = await response.json();
            types = data;
            return data;
        }
    } catch (error) {
        console.error('Error fetching event types:', error);
        throw error;
    }
}

async function loadLeagues() {
    try {
        const response = await fetch('/leagues');
        if (!response.ok) {
            throw new Error('Failed to fetch leagues: ' + response.statusText);
        } else {
            const data = await response.json();
            leagues = data;
            leagueMap = data.reduce((map, league) => {
                map[league.leagueId] = league;
                return map;
            }, {});
            return data;
        }
    } catch (error) {
        console.error('Error fetching leagues:', error);
        throw error;
    }
}

async function fetchAndCache(month, year, depth = DEFAULT_DEPTH) {
    const cacheKey = `${year}-${month}`;

    if (!events.has(cacheKey)) {
        try {
            const data = await loadEvents(month, year);
            events.set(cacheKey, data);
        } catch (error) {
            return null; 
        }
    }

    if (depth > 0) {
        // Handle 0-indexed month boundaries (0 = Jan, 11 = Dec)
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear  = month === 0 ? year - 1 : year;
        
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear  = month === 11 ? year + 1 : year;

        fetchAndCache(prevMonth, prevYear, depth - 1);
        fetchAndCache(nextMonth, nextYear, depth - 1);
    }

    return events.get(cacheKey);
}

function updateMonthTitle() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const titleEl = document.getElementById('month-title');
    if (titleEl) {
        titleEl.textContent = `${MONTH_NAMES[month]} ${year}`;
    }
}

function createDayCell(day, month, year, isOtherMonth) {
    const cell = document.createElement('div');
    cell.className = 'calendar-cell';
    if (isOtherMonth) {
        cell.classList.add('empty');
    }

    const cellDate = new Date(year, month, day);
    const dateKey = getLocalDateString(cellDate);

    const dayNumber = document.createElement('div');
    dayNumber.className = 'date-number';
    dayNumber.textContent = cellDate.getDate();
    cell.appendChild(dayNumber);

    if (dateKey === selectedDateKey) {
        cell.classList.add('selected');
    }

    if (dateKey === getLocalDateString(TODAY)) {
        cell.classList.add('today');
    }

    const eventsForDay = filteredEvents[dateKey] || [];
    if (eventsForDay.length > 0) {
        const eventList = document.createElement('div');
        eventList.className = 'event-list';

        eventsForDay.slice(0, 2).forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = 'event';
            const storeColor = event.leagueId && leagueMap[event.leagueId] && leagueMap[event.leagueId].brandColor 
                               ? leagueMap[event.leagueId].brandColor 
                               : `hsl(${(event.leagueId || 0) * 137 % 360}, 70%, 50%)`;
            eventEl.style.setProperty('--store-color', storeColor);
            eventEl.innerHTML = `<span>${event.leagueName || 'Event'}</span><span class="type">${types[event.type] || event.type}</span>`;
            eventList.appendChild(eventEl);
        });

        if (eventsForDay.length > 2) {
            const more = document.createElement('div');
            more.className = 'event-summary';
            more.textContent = `${eventsForDay.length - 2} more event${eventsForDay.length - 2 === 1 ? '' : 's'}`;
            eventList.appendChild(more);
        }

        cell.appendChild(eventList);
    }

    cell.addEventListener('click', () => selectDay(dateKey));
    return cell;
}

function showSelectedDay(dateKey) {
    const section = document.getElementById('selected-day-section');
    const title = document.getElementById('selected-day-title');
    const eventsContainer = document.getElementById('selected-day-events');

    const date = new Date(dateKey + 'T00:00:00');
    const dateText = date.toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    title.textContent = `${dateText}`;
    eventsContainer.innerHTML = '';

    const eventsForDay = filteredEvents[dateKey] || [];
    if (eventsForDay.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'no-events';
        emptyMessage.textContent = 'No events scheduled for this day.';
        eventsContainer.appendChild(emptyMessage);
    } else {
        eventsForDay.forEach(event => {
            const leagueName = event.leagueId ? (leagueMap[event.leagueId]?.name || event.leagueName || 'Unknown League') : (event.leagueName || 'No League');
            const storeColor = event.leagueId && leagueMap[event.leagueId] && leagueMap[event.leagueId].brandColor 
                               ? leagueMap[event.leagueId].brandColor 
                               : `hsl(${(event.leagueId || 0) * 137 % 360}, 70%, 50%)`;
            const card = document.createElement('div');
            card.className = 'event-card';
            card.style.setProperty('--store-color', storeColor);
            card.innerHTML = `
                <div>
                    <div class="event-card-store">${event.name}</div>
                    <div class="event-card-type">${event.type}</div>
                    <div class="event-card-date">${leagueName} • ${event.startTime || ''}</div>
                </div>
            `;
            eventsContainer.appendChild(card);
        });
    }

    section.classList.add('active');
}

function selectDay(dateKey) {
    selectedDateKey = dateKey;
    renderCalendar();
    showSelectedDay(dateKey);
}

function hideSelectedDaySection() {
    const section = document.getElementById('selected-day-section');
    section.classList.remove('active');
}

function switchView(viewName) {
    currentView = viewName;
    document.querySelectorAll('.calendar-container').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewName).classList.add('active');
}

function toggleCalendarView() {
    if (currentView === 'calendar') {
        document.getElementById('calendar-view').classList.remove('active');
        document.getElementById('list-view').classList.add('active');
        currentView = 'list-view';
    } else {
        document.getElementById('list-view').classList.remove('active');
        document.getElementById('calendar-view').classList.add('active');
        currentView = 'calendar';
    }
    applyFilters();
}

function setFilters() {
    const leagueFilter = document.getElementById('league-filter');
    if (leagues && leagues.length > 0 && leagueFilter) {
        leagues.forEach(l => {
            const opt = document.createElement('option');
            opt.value = l.leagueId;
            opt.textContent = l.name;
            leagueFilter.appendChild(opt);
        });
    }

    const typeFilter = document.getElementById('type-filter');
    if (types && Object.keys(types).length > 0 && typeFilter) {
        Object.keys(types).forEach(type => {
            const opt = document.createElement('option');
            opt.value = type;
            opt.textContent = types[type] ? `${types[type]} ${type}` : type;
            typeFilter.appendChild(opt);
        });
    }

    const gameFilter = document.getElementById('game-filter');
    if (gameFilter) {
        const games = ['TCG', 'VGC'];
        games.forEach(game => {
            const opt = document.createElement('option');
            opt.value = game;
            opt.textContent = game;
            gameFilter.appendChild(opt);
        });
    }
}

function applyFilters() {
    const league = document.getElementById('league-filter').value;
    const type = document.getElementById('type-filter').value;
    const game = document.getElementById('game-filter').value;

    const filtered = events.getAll().filter(event => {
        let match = true;
        if (league && String(event.leagueId) !== String(league)) match = false;
        if (type && event.type !== type) match = false;
        if (game && event.game !== game) match = false;
        return match;
    });

    filteredEvents = filtered.reduce((acc, event) => {
        const dateKey = event.date ? event.date.slice(0, 10) : null;
        if (!dateKey) return acc;
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(event);
        return acc;
    }, {});

    updateMonthTitle();

    if (currentView === 'calendar') {
        renderCalendar();
        if (selectedDateKey) {
            showSelectedDay(selectedDateKey);
        } else {
            hideSelectedDaySection();
        }
    } else {
        renderList();
    }
}

function renderList() {
    const container = document.getElementById('list-view-events');
    if (!container) return;
    container.innerHTML = '';

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}-${month}-`;

    const sortedDates = Object.keys(filteredEvents)
        .filter(dateKey => dateKey.startsWith(prefix))
        .sort();

    if (sortedDates.length === 0) {
        const noEventsDiv = document.createElement('div');
        noEventsDiv.className = 'list-no-events';
        noEventsDiv.textContent = 'No events found.';
        container.appendChild(noEventsDiv);
        return;
    }

    sortedDates.forEach(dateKey => {
        const eventsForDay = filteredEvents[dateKey];

        const groupDiv = document.createElement('div');
        groupDiv.className = 'list-events-group';

        const date = new Date(dateKey + 'T00:00:00');
        const dateHeader = document.createElement('div');
        dateHeader.className = 'list-group-date';
        dateHeader.textContent = date.toLocaleDateString(undefined, {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        groupDiv.appendChild(dateHeader);

        const eventsDiv = document.createElement('div');
        eventsDiv.className = 'list-events-in-group';

        eventsForDay.forEach(event => {
            const leagueName = event.leagueId ? (leagueMap[event.leagueId]?.name || event.leagueName || 'Unknown League') : (event.leagueName || 'No League');
            const storeColor = event.leagueId && leagueMap[event.leagueId] && leagueMap[event.leagueId].brandColor 
                               ? leagueMap[event.leagueId].brandColor 
                               : `hsl(${(event.leagueId || 0) * 137 % 360}, 70%, 50%)`;
            const card = document.createElement('div');
            card.className = 'list-event-card';
            card.style.setProperty('--store-color', storeColor);
            card.innerHTML = `
                <div class="list-event-info">
                    <div class="list-event-store">${event.name}</div>
                    <div class="list-event-type">${types[event.type] ? types[event.type] + ' ' + event.type : event.type}</div>
                    <div class="list-event-date">${leagueName} • ${event.startTime || ''}</div>
                </div>
            `;
            eventsDiv.appendChild(card);
        });

        groupDiv.appendChild(eventsDiv);
        container.appendChild(groupDiv);
    });
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';

    for (let i = startDay - 1; i >= 0; i--) {
        const dayNum = daysInPrevMonth - i;
        const cell = createDayCell(dayNum, month - 1, year, true);
        calendarGrid.appendChild(cell);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = createDayCell(day, month, year, false);
        calendarGrid.appendChild(cell);
    }

    const totalCells = calendarGrid.children.length;
    const remainingCells = (Math.ceil(totalCells / 7) * 7) - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        const cell = createDayCell(day, month + 1, year, true);
        calendarGrid.appendChild(cell);
    }
}

function clearFilters() {
    document.getElementById('league-filter').value = '';
    document.getElementById('type-filter').value = '';
    document.getElementById('game-filter').value = '';
    applyFilters();
}

async function goToToday() {
    currentDate = new Date();
    selectedDateKey = getLocalDateString(TODAY);
    await fetchAndCache(currentDate.getMonth(), currentDate.getFullYear());
    applyFilters();
}

async function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    selectedDateKey = null;
    await fetchAndCache(currentDate.getMonth(), currentDate.getFullYear());
    applyFilters();
}

async function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    selectedDateKey = null;
    await fetchAndCache(currentDate.getMonth(), currentDate.getFullYear());
    applyFilters();
}

window.goToToday = goToToday;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.toggleCalendarView = toggleCalendarView;
window.clearFilters = clearFilters;
window.applyFilters = applyFilters;

document.getElementById('prevBtn').addEventListener('click', previousMonth);
document.getElementById('nextBtn').addEventListener('click', nextMonth);
document.getElementById('todayBtn').addEventListener('click', goToToday);

// Initial load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadLeagues();
        await loadTypes();
        await fetchAndCache(currentDate.getMonth(), currentDate.getFullYear());
        
        setFilters();
        applyFilters();
    } catch (e) {
        console.error("Initialization failed", e);
    }
});


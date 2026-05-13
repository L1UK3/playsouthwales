const today = new Date();
let currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
let eventsByDate = {};
let filteredEventsByDate = {};
let selectedDateKey = null;
let currentTab = 'calendar';
let leagues = [];
let types = [];

async function loadEvents() {
    try {
        const response = await fetch('/api/events');
        const data = await response.json();

        eventsByDate = data.reduce((acc, event) => {
            const dateKey = event.event_date;
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(event);
            return acc;
        }, {});

        filteredEventsByDate = { ...eventsByDate };
        populateFilters(data);
        renderCalendar();
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

async function loadLeagues() {
    try {
        const response = await fetch('/api/leagues');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching leagues:', error);
        return [];
    }
}

async function loadTypes() {
    try {
        const response = await fetch('/api/types');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching types:', error);
        return [];
    }
}

function populateFilters(events) {
    const storeFilter = document.getElementById('store-filter');
    const typeFilter = document.getElementById('type-filter');

    const stores = [...new Set(events.map(event => event.store))].sort();
    const types = [...new Set(events.map(event => event.type))].sort();

    stores.forEach(store => {
        const option = document.createElement('option');
        option.value = store;
        option.textContent = store;
        storeFilter.appendChild(option);
    });

    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeFilter.appendChild(option);
    });
}

function applyFilters() {
    const store = document.getElementById('store-filter').value;
    const type = document.getElementById('type-filter').value;

    filteredEventsByDate = Object.entries(eventsByDate).reduce((acc, [dateKey, eventList]) => {
        const filtered = eventList.filter(event => {
            return (!store || event.store === store) && (!type || event.type === type);
        });

        if (filtered.length > 0) {
            acc[dateKey] = filtered;
        }
        return acc;
    }, {});

    if (selectedDateKey && !filteredEventsByDate[selectedDateKey]) {
        selectedDateKey = null;
        hideSelectedDaySection();
    }

    if (currentTab === 'list') {
        renderListView();
    } else if (currentTab === 'calendar') {
        renderCalendar();
    }
}

function clearFilters() {
    document.getElementById('store-filter').value = '';
    document.getElementById('type-filter').value = '';
    applyFilters();
}

function switchTab(tabName) {
    currentTab = tabName;

    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active state from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabName + '-view').classList.add('active');
    document.getElementById('tab-' + tabName).classList.add('active');

    // Render the appropriate content
    if (tabName === 'calendar') {
        renderCalendar();
    } else if (tabName === 'list') {
        renderListView();
    } else if (tabName === 'venues') {
        renderVenues();
    } else if (tabName === 'map') {
        renderMap();
    }
}

function renderListView() {
    const container = document.getElementById('list-events-container');
    container.innerHTML = '';

    // Get all events sorted by date
    const sortedDates = Object.keys(filteredEventsByDate).sort();

    if (sortedDates.length === 0) {
        const noEventsDiv = document.createElement('div');
        noEventsDiv.className = 'list-no-events';
        noEventsDiv.textContent = 'No events found.';
        container.appendChild(noEventsDiv);
        return;
    }

    sortedDates.forEach(dateKey => {
        const events = filteredEventsByDate[dateKey];
        
        // Create group container
        const groupDiv = document.createElement('div');
        groupDiv.className = 'list-events-group';

        // Create date header
        const date = new Date(dateKey + 'T00:00:00');
        const dateHeader = document.createElement('div');
        dateHeader.className = 'list-group-date';
        dateHeader.textContent = date.toLocaleDateString(undefined, {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        groupDiv.appendChild(dateHeader);

        // Create events container
        const eventsDiv = document.createElement('div');
        eventsDiv.className = 'list-events-in-group';

        // Add event cards
        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'list-event-card';
            card.innerHTML = `
                <div class="list-event-info">
                    <div class="list-event-store">${event.store}</div>
                    <div class="list-event-type">${event.type}</div>
                    <div class="list-event-date">${dateKey}</div>
                </div>
            `;
            eventsDiv.appendChild(card);
        });

        groupDiv.appendChild(eventsDiv);
        container.appendChild(groupDiv);
    });
}

function renderVenues() {
    const container = document.getElementById('venues-container');
    container.innerHTML = '';

    // Get unique venues from filtered events
    const venues = new Set();
    Object.values(filteredEventsByDate).forEach(eventList => {
        eventList.forEach(event => {
            venues.add(event.store);
        });
    });

    if (venues.size === 0) {
        const noVenuesDiv = document.createElement('div');
        noVenuesDiv.className = 'no-venues';
        noVenuesDiv.textContent = 'No venues found.';
        container.appendChild(noVenuesDiv);
        return;
    }

    const venuesList = Array.from(venues).sort();
    venuesList.forEach(venue => {
        const venueCard = document.createElement('div');
        venueCard.className = 'venue-card';
        venueCard.innerHTML = `<div class="venue-name">${venue}</div>`;
        container.appendChild(venueCard);
    });
}

function renderMap() {
    const container = document.getElementById('map-container');
    container.innerHTML = '<div style="padding: 40px; color: #6b7280; font-size: 16px;">Map functionality coming soon</div>';
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    document.getElementById('month-title').textContent = `${monthNames[month]} ${year}`;

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

function createDayCell(day, month, year, isOtherMonth) {
    const cell = document.createElement('div');
    cell.className = 'calendar-cell';
    if (isOtherMonth) {
        cell.classList.add('empty');
    }

    const cellDate = new Date(year, month, day);
    const dateKey = cellDate.toISOString().slice(0, 10);

    const dayNumber = document.createElement('div');
    dayNumber.className = 'date-number';
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);

    if (dateKey === selectedDateKey) {
        cell.classList.add('selected');
    }

    if (dateKey === today.toISOString().slice(0, 10)) {
        cell.classList.add('today');
    }

    const events = filteredEventsByDate[dateKey] || [];
    if (events.length > 0) {
        const eventList = document.createElement('div');
        eventList.className = 'event-list';

        events.slice(0, 2).forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = 'event';
            eventEl.innerHTML = `<span>${event.store}</span><span class="type">${event.type}</span>`;
            eventList.appendChild(eventEl);
        });

        if (events.length > 2) {
            const more = document.createElement('div');
            more.className = 'event-summary';
            more.textContent = `${events.length - 2} more event${events.length - 2 === 1 ? '' : 's'}`;
            eventList.appendChild(more);
        }

        cell.appendChild(eventList);
    }

    cell.addEventListener('click', () => selectDay(dateKey));
    return cell;
}

function selectDay(dateKey) {
    selectedDateKey = dateKey;
    renderCalendar();
    showSelectedDay(dateKey);
}

function showSelectedDay(dateKey) {
    const section = document.getElementById('selected-day-section');
    const title = document.getElementById('selected-day-title');
    const eventsContainer = document.getElementById('selected-day-events');

    const date = new Date(dateKey);
    const dateText = date.toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    title.textContent = `Events for ${dateText}`;
    eventsContainer.innerHTML = '';

    const events = filteredEventsByDate[dateKey] || [];
    if (events.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'no-events';
        emptyMessage.textContent = 'No events scheduled for this day.';
        eventsContainer.appendChild(emptyMessage);
    } else {
        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <div class="event-card-store">${event.store}</div>
                <div class="event-card-type">${event.type}</div>
            `;
            eventsContainer.appendChild(card);
        });
    }

    section.classList.add('active');
}

function hideSelectedDaySection() {
    const section = document.getElementById('selected-day-section');
    section.classList.remove('active');
}

function goToToday() {
    currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
    selectedDateKey = today.toISOString().slice(0, 10);
    renderCalendar();
    showSelectedDay(selectedDateKey);
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    selectedDateKey = null;
    hideSelectedDaySection();
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    selectedDateKey = null;
    hideSelectedDaySection();
    renderCalendar();
}

window.goToToday = goToToday;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.switchTab = switchTab;

document.getElementById('prevBtn').addEventListener('click', previousMonth);
document.getElementById('nextBtn').addEventListener('click', nextMonth);
document.getElementById('todayBtn').addEventListener('click', goToToday);

document.addEventListener('DOMContentLoaded', loadEvents);

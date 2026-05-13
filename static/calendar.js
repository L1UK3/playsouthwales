let currentDate = new Date(2026, 4, 13); // May 13, 2026
let allEvents = [];

// Fetch all events from API
async function loadEvents() {
    try {
        const response = await fetch('/api/events');
        const data = await response.json();
        
        // Convert to a map for easy lookup
        const eventMap = {};
        data.forEach(day => {
            eventMap[day.date] = day.events;
        });
        
        allEvents = eventMap;
        renderCalendar();
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

// Build calendar grid for the current month
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month/year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('monthYear').textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Adjust for Monday start (firstDay: 0=Sun, 1=Mon, etc.)
    const startDay = firstDay === 0 ? 6 : firstDay - 1;
    
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    // Add previous month's days (grayed out)
    for (let i = startDay - 1; i >= 0; i--) {
        const dayNum = daysInPrevMonth - i;
        const cell = createDayCell(dayNum, month - 1, year, true);
        calendarGrid.appendChild(cell);
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = createDayCell(day, month, year, false);
        calendarGrid.appendChild(cell);
    }
    
    // Add next month's days (grayed out)
    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const cell = createDayCell(day, month + 1, year, true);
        calendarGrid.appendChild(cell);
    }
}

function createDayCell(day, month, year, isOtherMonth) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    
    if (isOtherMonth) {
        cell.classList.add('other-month');
    }
    
    // Check if today
    const today = new Date();
    if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        cell.classList.add('today');
    }
    
    // Create day number
    const dayNum = document.createElement('div');
    dayNum.className = 'day-number';
    dayNum.textContent = day;
    cell.appendChild(dayNum);
    
    // Add events if any
    const eventKey = String(day);
    if (allEvents[eventKey]) {
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'events-container';
        
        allEvents[eventKey].forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = 'event-item';
            eventEl.title = event.store;
            eventEl.innerHTML = `<span class="event-store">${event.store}</span><span class="event-type">${event.type}</span>`;
            eventsContainer.appendChild(eventEl);
        });
        
        cell.appendChild(eventsContainer);
    }
    
    return cell;
}

// Navigation handlers
document.getElementById('prevBtn').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextBtn').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

document.getElementById('todayBtn').addEventListener('click', () => {
    currentDate = new Date(2026, 4, 13); // May 13, 2026
    renderCalendar();
});

// Load events and render on page load
document.addEventListener('DOMContentLoaded', loadEvents);

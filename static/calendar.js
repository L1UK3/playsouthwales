
const TODAY = new Date();
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

let selectedDate = null;
let filteredEventsByDate = {};
let events = [];
let types = [];
let filters = {leagueName: null, eventType: null};


async function loadEvents(month, year) {
    /**
     * Fetches events for the given month and year and updates the global events array
     * The events should already be sorted by date and time by the backend
     * 
     * @param {number} month - The month for which to fetch events (0-11)
     * @param {number} year - The year for which to fetch events
     * 
     * @return {Promise<Array>} - A promise that resolves to the list of events for the given month and year
     * @throws {Error} - If the fetch request fails or returns a non-OK status
     * 
     * The backend API endpoint for fetching events is expected to be:
     * GET /api/events?month={month}&year={year}
     * 
     * The expected format of the returned events array is:
     * [
     *  {
     *   "id": 1,
     *  "name": "Event Name",
     *  "date": "2024-01-15",
     *  "time": "18:00",
     *  "league": "League Name",
     *  "type": "Event Type",
     *  "game": "TCG or VGC",
     *  "description": "Event Description"
     *  },
     * ...
     * ]
     */
    try {
        const response = await fetch(`/api/events?month=${month}&year=${year}`);
        if (!response.ok) {
            throw new Error('Failed to fetch events: ' + response.statusText);
        } else {
            return await response.json();
        }
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
}


async function loadTypes() {
    /**
     * Fetches the list of event types and updates the global types array
     * The backend API endpoint for fetching event types is expected to be:
     * GET /api/event-types
     * 
     * @return {Promise<Array>} - A promise that resolves to the list of event types
     * @throws {Error} - If the fetch request fails or returns a non-OK status
     */
    try {
        const response = await fetch('/api/event-types');
        if (!response.ok) {
            throw new Error('Failed to fetch event types: ' + response.statusText);
        } else {
            return await response.json();
        }
    } catch (error) {
        console.error('Error fetching event types:', error);
        throw error;
    }
}



function renderCalendarView(filteredEventsByDate) {
    return
}

function showSelectedDaySection(day) {
    return
}

function hideSelectedDaySection() {
    return
}

function renderListView(month, year) {
    return
}


function switchView(currentView) {
    return
}



function showFilters() {
    return
}

function applyFilters(filters) {
    /**
     * Applies the given filters to the events and updates the filteredEventsByDate object
     */
    return
}

function clearFilters() {
    /**
     * Clears all filters and displays all events
     * This function should reset the filters object to its default state and then call applyFilters with the default filters to update the displayed events
     * The default state of the filters object is:
     * {
     * leagueName: null,
     * eventType: null,
     * game: null
     * }
     */
    applyFilters({leagueName: null, eventType: null, game: null});
}





function goToToday() {
    return
}

function previousMonth() {
    return
}

function nextMonth() {
    return
}

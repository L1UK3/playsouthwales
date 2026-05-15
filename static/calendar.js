
const TODAY = new Date();
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

let currentDate = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);

let events = [];
let leagues = [];
let types = [];

let currentTab = 'calendar';
let filters = {
    league: null,
    type: null
};




async function loadEvents(month, year) {
    // Fetches events for the given month and year and updates the global events array
    return
}

async function loadLeagues() {
    // fetches the list of leagues and updates the global leagues array
    return
}

async function loadTypes() {
    // fetches the list of event types and updates the global types array
    return
}






function renderCalendarView(month, year) {
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


function goToToday() {
    return
}

function previousMonth() {
    return
}

function nextMonth() {
    return
}












function clearFilters() {
    return
}

function applyFilters() {
    return
}









function renderLeagueView() {
    return
}





function renderTabMenu() {
    return
}

function switchTab(tab) {
    return
}
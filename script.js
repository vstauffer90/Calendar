const firebaseConfig = {
    apiKey: "AIzaSyB6S8jxJMS1z6p6y2bILpWyi9k_v2GFCHo",
    authDomain: "teamcalendar-9573b.firebaseapp.com",
    databaseURL: "https://teamcalendar-9573b-default-rtdb.firebaseio.com",
    projectId: "teamcalendar-9573b",
    storageBucket: "teamcalendar-9573b.firebasestorage.app",
    messagingSenderId: "862004744286",
    appId: "1:862004744286:web:3c7ce1e9ec8ed4f9bbe4cf"
};

// Debug: Confirm Firebase is loaded
console.log('Firebase SDK loaded:', typeof firebase !== 'undefined' ? 'Yes' : 'No');

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    document.getElementById('calendar').innerHTML = '<p>Error connecting to Firebase. Please try again later.</p>';
}
const database = firebase.database();

// Test write to verify database access
console.log('Performing test write to database');
database.ref('test').set({ initialized: true }).then(() => {
    console.log('Test write successful');
}).catch(error => {
    console.error('Test write error:', error);
});

const calendar = document.getElementById('calendar');
const monthYear = document.getElementById('monthYear');
const prevMonth = document.getElementById('prevMonth');
const nextMonth = document.getElementById('nextMonth');
const draggableArea = document.getElementById('draggable-area');
let currentDate = new Date();
let calendarData = {};
let draggedElement = null;

// Initialize calendar and database listeners
initializeCalendarData();
listenForCalendarData();

function listenForCalendarData() {
    console.log('Setting up listener for calendar data');
    try {
        database.ref('calendarData').on('value', snapshot => {
            console.log('Database snapshot received:', snapshot.val());
            calendarData = snapshot.val() || {};
            generateCalendar(currentDate);
        }, error => {
            console.error('Database listener error:', error);
            calendar.innerHTML = '<p>Failed to load calendar data. Please try again later.</p>';
            generateCalendar(currentDate); // Fallback: Render empty calendar
        });
    } catch (error) {
        console.error('Error setting up database listener:', error);
        calendar.innerHTML = '<p>Error connecting to database. Please try again later.</p>';
        generateCalendar(currentDate); // Fallback: Render empty calendar
    }
}

function initializeCalendarData(attempt = 1, maxAttempts = 5) {
    console.log(`Initializing calendar data, attempt ${attempt} of ${maxAttempts}`);
    // Clear existing data to ensure clean state
    database.ref('calendarData').remove().then(() => {
        console.log('Cleared existing calendar data');
        database.ref('calendarData').once('value').then(snapshot => {
            console.log('Snapshot exists:', snapshot.exists());
            if (!snapshot.exists()) {
                console.log('No calendar data found, populating test data');
                const initialData = {
                    '2025-04-01': {
                        'Victoria AWA': true
                    }
                };
                console.log('Setting initial data:', initialData);
                database.ref('calendarData').set(initialData).then(() => {
                    console.log('Initial data set successfully');
                }).catch(error => {
                    console.error('Error setting initial data:', error);
                    if (attempt < maxAttempts) {
                        console.log(`Retrying initialization, attempt ${attempt + 1}`);
                        setTimeout(() => initializeCalendarData(attempt + 1, maxAttempts), 2000);
                    } else {
                        console.error('Max initialization attempts reached');
                        calendar.innerHTML = '<p>Failed to initialize calendar data. Please try again later.</p>';
                        generateCalendar(currentDate); // Fallback: Render empty calendar
                    }
                });
            } else {
                console.log('Calendar data already exists, skipping initialization');
            }
        }).catch(error => {
            console.error('Error checking calendar data:', error);
            if (attempt < maxAttempts) {
                console.log(`Retrying initialization, attempt ${attempt + 1}`);
                setTimeout(() => initializeCalendarData(attempt + 1, maxAttempts), 2000);
            } else {
                console.error('Max initialization attempts reached');
                calendar.innerHTML = '<p>Failed to connect to database. Please try again later.</p>';
                generateCalendar(currentDate); // Fallback: Render empty calendar
            }
        });
    }).catch(error => {
        console.error('Error clearing calendar data:', error);
        if (attempt < maxAttempts) {
            console.log(`Retrying initialization, attempt ${attempt + 1}`);
            setTimeout(() => initializeCalendarData(attempt + 1, maxAttempts), 2000);
        } else {
            console.error('Max initialization attempts reached');
            calendar.innerHTML = '<p>Failed to clear calendar data. Please try again later.</p>';
            generateCalendar(currentDate); // Fallback: Render empty calendar
        }
    });
}

function generateCalendar(date) {
    console.log('Generating calendar for:', date);
    calendar.innerHTML = '';
    try {
        const year = date.getFullYear();
        const month = date.getMonth();
        
        console.log('Setting month/year header');
        monthYear.textContent = date.toLocaleString('default', { 
            month: 'long', 
            year: 'numeric' 
        });

        console.log('Creating day headers');
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            calendar.appendChild(dayHeader);
        });

        const firstDayOfMonth = new Date(year, month, 1);
        const firstDayIndex = firstDayOfMonth.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        console.log('Rendering previous month days');
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
        for (let i = 0; i < firstDayIndex; i++) {
            const dayNum = daysInPrevMonth - firstDayIndex + i + 1;
            const day = document.createElement('div');
            day.className = 'day';
            day.style.background = '#f0f0f0';
            day.innerHTML = `<div>${dayNum}</div>`;
            day.dataset.date = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            
            const dateKey = day.dataset.date;
            if (calendarData[dateKey]) {
                console.log(`Adding events for ${dateKey}:`, calendarData[dateKey]);
                Object.keys(calendarData[dateKey]).forEach(itemText => {
                    const droppedItem = createDroppedItem(itemText);
                    day.appendChild(droppedItem);
                });
            }

            day.addEventListener('dragover', (e) => e.preventDefault());
            day.addEventListener('drop', handleDrop);
            calendar.appendChild(day);
        }

        console.log('Rendering current month days');
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.className = 'day';
            day.innerHTML = `<div>${i}</div>`;
            day.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            const dateKey = day.dataset.date;
            if (calendarData[dateKey]) {
                console.log(`Adding events for ${dateKey}:`, calendarData[dateKey]);
                Object.keys(calendarData[dateKey]).forEach(itemText => {
                    const droppedItem = createDroppedItem(itemText);
                    day.appendChild(droppedItem);
                });
            }

            day.addEventListener('dragover', (e) => e.preventDefault());
            day.addEventListener('drop', handleDrop);
            calendar.appendChild(day);
        }

        console.log('Rendering next month days');
        const totalCells = firstDayIndex + daysInMonth;
        const remainingCells = (7 - (totalCells % 7)) % 7;
        const nextMonthNum = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;

        for (let i = 1; i <= remainingCells; i++) {
            const day = document.createElement('div');
            day.className = 'day';
            day.style.background = '#f0f0f0';
            day.innerHTML = `<div>${i}</div>`;
            day.dataset.date = `${nextYear}-${String(nextMonthNum + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            const dateKey = day.dataset.date;
            if (calendarData[dateKey]) {
                console.log(`Adding events for ${dateKey}:`, calendarData[dateKey]);
                Object.keys(calendarData[dateKey]).forEach(itemText => {
                    const droppedItem = createDroppedItem(itemText);
                    day.appendChild(droppedItem);
                });
            }

            day.addEventListener('dragover', (e) => e.preventDefault());
            day.addEventListener('drop', handleDrop);
            calendar.appendChild(day);
        }

        console.log('Calendar rendering complete, children:', calendar.children.length);
    } catch (error) {
        console.error('Calendar generation error:', error);
        calendar.innerHTML = '<p>Error rendering calendar. Please try again later.</p>';
    }
}

function createDroppedItem(text) {
    console.log('Creating dropped item:', text);
    const droppedItem = document.createElement('div');
    droppedItem.className = 'dropped-item';
    droppedItem.textContent = text;
    droppedItem.draggable = true;
    droppedItem.addEventListener('dragstart', handleDragStart);
    droppedItem.addEventListener('dragend', handleDragEnd);
    return droppedItem;
}

function handleDragStart(e) {
    console.log('Drag start:', e.target.textContent);
    draggedElement = e.target;
    e.dataTransfer.setData('text/plain', e.target.textContent);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    console.log('Drag end');
    e.target.classList.remove('dragging');
    draggedElement = null;
}

function handleDrop(e) {
    e.preventDefault();
    console.log('Drop event');
    const data = e.dataTransfer.getData('text/plain');
    const targetDay = e.target.classList.contains('day') ? e.target : e.target.closest('.day');
    if (!targetDay) {
        console.log('Drop target not a day');
        return;
    }

    const targetDate = targetDay.dataset.date;
    console.log(`Dropping ${data} on ${targetDate}`);

    if (draggedElement.classList.contains('dropped-item')) {
        const originalDay = draggedElement.closest('.day');
        const originalDate = originalDay.dataset.date;

        if (originalDate === targetDate) {
            console.log('Same date, ignoring drop');
            return;
        }

        console.log(`Removing ${data} from ${originalDate}`);
        database.ref(`calendarData/${originalDate}/${data}`).remove();
    }

    const existingItems = targetDay.querySelectorAll('.dropped-item');
    for (let item of existingItems) {
        if (item.textContent === data) {
            console.log(`${data} already exists on ${targetDate}`);
            return;
        }
    }

    console.log(`Setting ${data} on ${targetDate}`);
    database.ref(`calendarData/${targetDate}/${data}`).set(true);
}

function handleDraggableAreaDrop(e) {
    e.preventDefault();
    console.log('Drop on draggable area');
    const data = e.dataTransfer.getData('text/plain');
    if (draggedElement && draggedElement.classList.contains('dropped-item')) {
        const originalDay = draggedElement.closest('.day');
        if (originalDay) {
            const originalDate = originalDay.dataset.date;
            console.log(`Removing ${data} from ${originalDate}`);
            database.ref(`calendarData/${originalDate}/${data}`).remove();
        }
    }
}

console.log('Attaching event listeners to draggable items');
const draggableItems = document.querySelectorAll('.draggable');
draggableItems.forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
});

console.log('Attaching dragover and drop listeners to draggable area');
draggableArea.addEventListener('dragover', (e) => e.preventDefault());
draggableArea.addEventListener('drop', handleDraggableAreaDrop);

console.log('Attaching navigation button listeners');
prevMonth.addEventListener('click', () => {
    console.log('Previous month clicked');
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate);
});

nextMonth.addEventListener('click', () => {
    console.log('Next month clicked');
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate);
});

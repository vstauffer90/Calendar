const calendar = document.getElementById('calendar');
const monthYear = document.getElementById('monthYear');
const prevMonth = document.getElementById('prevMonth');
const nextMonth = document.getElementById('nextMonth');
const draggableArea = document.getElementById('draggable-area');
let currentDate = new Date(); // Updates to current month in the year
let calendarData = loadCalendarData();
let draggedElement = null;

function loadCalendarData() {
    const savedData = localStorage.getItem('calendarData');
    return savedData ? JSON.parse(savedData) : {};
}

function saveCalendarData() {
    localStorage.setItem('calendarData', JSON.stringify(calendarData));
}

function getScheduledDays(month, item) {
    const monthMod = month % 12;
    switch (item) {
        case 'Victoria AWA':
            switch (monthMod) {
                case 3: return [4, 5]; // Apr: Thu, Fri
                case 4: return [1, 2]; // May: Mon, Tue
                case 5: return [2, 3]; // Jun: Tue, Wed
                case 6: return [3, 4]; // Jul: Wed, Thu
                case 7: return [4, 5]; // Aug: Thu, Fri
                case 8: return [1, 2]; // Sep: Mon, Tue
                case 9: return [2, 3]; // Oct: Tue, Wed
                case 10: return [3, 4]; // Nov: Wed, Thu
                case 11: return [4, 5]; // Dec: Thu, Fri
                case 0: return [1, 2]; // Jan: Mon, Tue
                case 1: return [2, 3]; // Feb: Tue, Wed
                case 2: return [3, 4]; // Mar: Wed, Thu
            }
        case 'Ivory AWA':
            switch (monthMod) {
                case 3: return [3, 4]; // Apr: Wed, Thu
                case 4: return [4, 5]; // May: Thu, Fri
                case 5: return [1, 2]; // Jun: Mon, Tue
                case 6: return [2, 3]; // Jul: Tue, Wed
                case 7: return [3, 4]; // Aug: Wed, Thu
                case 8: return [4, 5]; // Sep: Thu, Fri
                case 9: return [1, 2]; // Oct: Mon, Tue
                case 10: return [2, 3]; // Nov: Tue, Wed
                case 11: return [3, 4]; // Dec: Wed, Thu
                case 0: return [4, 5]; // Jan: Thu, Fri
                case 1: return [1, 2]; // Feb: Mon, Tue
                case 2: return [2, 3]; // Mar: Tue, Wed
            }
        case 'Jasmine AWA':
            switch (monthMod) {
                case 3: return [1, 2]; // Apr: Mon, Tue
                case 4: return [2, 3]; // May: Tue, Wed
                case 5: return [3, 4]; // Jun: Wed, Thu
                case 6: return [4, 5]; // Jul: Thu, Fri
                case 7: return [1, 2]; // Aug: Mon, Tue
                case 8: return [2, 3]; // Sep: Tue, Wed
                case 9: return [3, 4]; // Oct: Wed, Thu
                case 10: return [4, 5]; // Nov: Thu, Fri
                case 11: return [1, 2]; // Dec: Mon, Tue
                case 0: return [2, 3]; // Jan: Tue, Wed
                case 1: return [3, 4]; // Feb: Wed, Thu
                case 2: return [4, 5]; // Mar: Thu, Fri
            }
        case 'Rachel AWA':
            switch (monthMod) {
                case 3: return [2, 3]; // Apr: Tue, Wed
                case 4: return [3, 4]; // May: Wed, Thu
                case 5: return [4, 5]; // Jun: Thu, Fri
                case 6: return [1, 2]; // Jul: Mon, Tue
                case 7: return [2, 3]; // Aug: Tue, Wed
                case 8: return [3, 4]; // Sep: Wed, Thu
                case 9: return [4, 5]; // Oct: Thu, Fri
                case 10: return [1, 2]; // Nov: Mon, Tue
                case 11: return [2, 3]; // Dec: Tue, Wed
                case 0: return [3, 4]; // Jan: Wed, Thu
                case 1: return [4, 5]; // Feb: Thu, Fri
                case 2: return [1, 2]; // Mar: Mon, Tue
            }
    }
    return [];
}

function initializeCalendarData() {
    if (Object.keys(calendarData).length === 0) {
        const year = currentDate.getFullYear();
        const items = ['Victoria AWA', 'Ivory AWA', 'Jasmine AWA', 'Rachel AWA'];
        calendarData = {};

        for (let month = 0; month < 12; month++) {
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const lastDay = new Date(year, month, daysInMonth);
            const lastDayOfWeek = lastDay.getDay();
            const daysToLastSaturday = (6 - lastDayOfWeek + 7) % 7;
            // Last full week ends on the last Saturday fully within the month
            const lastFullWeekEnd = daysInMonth - lastDayOfWeek - (daysToLastSaturday > 0 ? 7 : 0);
            const nextMonth = month === 11 ? 0 : month + 1;
            const nextYear = month === 11 ? year + 1 : year;

            // Up to and including the last full week: current month's cadence
            for (let i = 1; i <= lastFullWeekEnd; i++) {
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                const currentDateObj = new Date(year, month, i);
                const currentDayOfWeek = currentDateObj.getDay();

                items.forEach(item => {
                    const scheduledDays = getScheduledDays(month, item);
                    if (scheduledDays.includes(currentDayOfWeek)) {
                        if (!calendarData[dateKey]) calendarData[dateKey] = [];
                        if (!calendarData[dateKey].includes(item)) {
                            calendarData[dateKey].push(item);
                        }
                    }
                });
            }

            // Following week (including spillover): next month's cadence
            const followingWeekStart = lastFullWeekEnd + 1;
            for (let i = followingWeekStart; i <= daysInMonth + daysToLastSaturday; i++) {
                let dateKey, currentDateObj, currentDayOfWeek;
                if (i <= daysInMonth) {
                    dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                    currentDateObj = new Date(year, month, i);
                } else {
                    const spilloverDay = i - daysInMonth;
                    dateKey = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(spilloverDay).padStart(2, '0')}`;
                    currentDateObj = new Date(nextYear, nextMonth, spilloverDay);
                }
                currentDayOfWeek = currentDateObj.getDay();

                items.forEach(item => {
                    const scheduledDays = getScheduledDays(nextMonth, item);
                    if (scheduledDays.includes(currentDayOfWeek)) {
                        if (!calendarData[dateKey]) calendarData[dateKey] = [];
                        if (!calendarData[dateKey].includes(item)) {
                            calendarData[dateKey].push(item);
                        }
                    }
                });
            }
        }

        console.log('Initialized calendarData:', JSON.stringify(calendarData, null, 2));
        saveCalendarData();
    }
}

function generateCalendar(date) {
    calendar.innerHTML = '';
    const year = date.getFullYear();
    const month = date.getMonth();
    
    monthYear.textContent = date.toLocaleString('default', { 
        month: 'long', 
        year: 'numeric' 
    });

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

    // Previous month days
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
            calendarData[dateKey].forEach(itemText => {
                const droppedItem = createDroppedItem(itemText);
                day.appendChild(droppedItem);
            });
        }

        day.addEventListener('dragover', (e) => e.preventDefault());
        day.addEventListener('drop', handleDrop);
        calendar.appendChild(day);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'day';
        day.innerHTML = `<div>${i}</div>`;
        day.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        const dateKey = day.dataset.date;
        if (calendarData[dateKey]) {
            calendarData[dateKey].forEach(itemText => {
                const droppedItem = createDroppedItem(itemText);
                day.appendChild(droppedItem);
            });
        }

        day.addEventListener('dragover', (e) => e.preventDefault());
        day.addEventListener('drop', handleDrop);
        calendar.appendChild(day);
    }

    // Next month days
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
            calendarData[dateKey].forEach(itemText => {
                const droppedItem = createDroppedItem(itemText);
                day.appendChild(droppedItem);
            });
        }

        day.addEventListener('dragover', (e) => e.preventDefault());
        day.addEventListener('drop', handleDrop);
        calendar.appendChild(day);
    }
}

function createDroppedItem(text) {
    const droppedItem = document.createElement('div');
    droppedItem.className = 'dropped-item';
    droppedItem.textContent = text;
    droppedItem.draggable = true;
    droppedItem.addEventListener('dragstart', handleDragStart);
    droppedItem.addEventListener('dragend', handleDragEnd);
    return droppedItem;
}

function handleDragStart(e) {
    draggedElement = e.target;
    e.dataTransfer.setData('text/plain', e.target.textContent);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedElement = null;
}

function handleDrop(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    const targetDay = e.target.classList.contains('day') ? e.target : e.target.closest('.day');
    if (!targetDay) return;

    const targetDate = targetDay.dataset.date;

    if (draggedElement.classList.contains('dropped-item')) {
        const originalDay = draggedElement.closest('.day');
        const originalDate = originalDay.dataset.date;

        if (originalDate === targetDate) return;

        draggedElement.remove();
        if (calendarData[originalDate]) {
            calendarData[originalDate] = calendarData[originalDate].filter(item => item !== data);
            if (calendarData[originalDate].length === 0) delete calendarData[originalDate];
        }
    }

    const existingItems = targetDay.querySelectorAll('.dropped-item');
    for (let item of existingItems) {
        if (item.textContent === data) return;
    }

    const droppedItem = createDroppedItem(data);
    targetDay.appendChild(droppedItem);

    if (!calendarData[targetDate]) calendarData[targetDate] = [];
    if (!calendarData[targetDate].includes(data)) calendarData[targetDate].push(data);

    saveCalendarData();
}

function handleDraggableAreaDrop(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');

    if (draggedElement && draggedElement.classList.contains('dropped-item')) {
        const originalDay = draggedElement.closest('.day');
        if (originalDay) {
            const originalDate = originalDay.dataset.date;
            draggedElement.remove();
            if (calendarData[originalDate]) {
                calendarData[originalDate] = calendarData[originalDate].filter(item => item !== data);
                if (calendarData[originalDate].length === 0) delete calendarData[originalDate];
            }
            saveCalendarData();
        }
    }
}

const draggableItems = document.querySelectorAll('.draggable');
draggableItems.forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
});

draggableArea.addEventListener('dragover', (e) => e.preventDefault());
draggableArea.addEventListener('drop', handleDraggableAreaDrop);

prevMonth.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate);
});

nextMonth.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate);
});

initializeCalendarData();
generateCalendar(currentDate);

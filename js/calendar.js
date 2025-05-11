// js/calendar.js

const calendarModule = (() => {
    const S_DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let currentDisplayDate = new Date(); 

    function setDisplayDate(date) {
        currentDisplayDate = new Date(date);
    }

    function getDisplayDate() {
        return new Date(currentDisplayDate);
    }
    
    function navigatePrevious(mode = 'month') {
        if (mode === 'month') {
            currentDisplayDate.setMonth(currentDisplayDate.getMonth() - 1);
        } else { 
            currentDisplayDate.setDate(currentDisplayDate.getDate() - 7);
        }
    }

    function navigateNext(mode = 'month') {
        if (mode === 'month') {
            currentDisplayDate.setMonth(currentDisplayDate.getMonth() + 1);
        } else { 
            currentDisplayDate.setDate(currentDisplayDate.getDate() + 7);
        }
    }
    
    function navigateToday() {
        currentDisplayDate = new Date();
    }

    function generateCalendarHeader(mode = 'month') {
        const year = currentDisplayDate.getFullYear();
        const monthName = currentDisplayDate.toLocaleString('default', { month: 'long' });
        let headerText = `${monthName} ${year}`;

        if (mode === 'week') {
            const firstDayOfWeek = new Date(currentDisplayDate);
            firstDayOfWeek.setDate(currentDisplayDate.getDate() - currentDisplayDate.getDay()); 
            const lastDayOfWeek = new Date(firstDayOfWeek);
            lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
            
            const firstMonthName = firstDayOfWeek.toLocaleString('default', { month: 'short' });
            const lastMonthName = lastDayOfWeek.toLocaleString('default', { month: 'short' });

            if (firstDayOfWeek.getMonth() === lastDayOfWeek.getMonth()) {
                headerText = `${monthName} ${firstDayOfWeek.getDate()} - ${lastDayOfWeek.getDate()}, ${year}`;
            } else {
                headerText = `${firstMonthName} ${firstDayOfWeek.getDate()} - ${lastMonthName} ${lastDayOfWeek.getDate()}, ${year}`;
            }
        }

        return `
            <div class="calendar-header">
                <h3>${headerText}</h3>
                <div class="calendar-nav">
                    <button id="calendar-prev-button" title="Previous"><</button>
                    <button id="calendar-today-button" title="Today">Today</button>
                    <button id="calendar-next-button" title="Next">></button>
                </div>
            </div>
        `;
    }

    function generateDayHeaders() {
        return S_DAYS_OF_WEEK.map(day => `<div class="calendar-day-header">${day}</div>`).join('');
    }

    /**
     * Generates the HTML for a month view.
     * @param {Array<string>} entryDatesForMonth - Array of 'YYYY-MM-DD' strings for entries.
     * @param {string|null} selectedDateString - The currently selected 'YYYY-MM-DD' string.
     * @returns {string} HTML string for the month grid.
     */
    function generateMonthView(entryDatesForMonth = [], selectedDateString = null) {
        const year = currentDisplayDate.getFullYear();
        const month = currentDisplayDate.getMonth(); 

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay(); 

        let daysHtml = '';
        for (let i = 0; i < startDayOfWeek; i++) {
            daysHtml += `<div class="calendar-day other-month"></div>`;
        }

        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDateObj = new Date(year, month, day);
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            let classes = 'calendar-day';
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                classes += ' current-day';
            }
            if (entryDatesForMonth.includes(dateString)) {
                classes += ' has-entry';
            }
            if (dateString === selectedDateString) {
                classes += ' selected-date';
            }
            daysHtml += `<div class="${classes}" data-date="${dateString}">${day}</div>`;
        }
        
        const totalCells = startDayOfWeek + daysInMonth;
        const remainingCells = (7 - (totalCells % 7)) % 7; 
        for (let i = 0; i < remainingCells; i++) {
            daysHtml += `<div class="calendar-day other-month"></div>`;
        }

        return `<div class="calendar-grid">${generateDayHeaders()}${daysHtml}</div>`;
    }

    /**
     * Generates the HTML for a week view.
     * @param {Array<string>} entryDatesForWeek - Array of 'YYYY-MM-DD' strings for entries.
     * @param {string|null} selectedDateString - The currently selected 'YYYY-MM-DD' string.
     * @returns {string} HTML string for the week grid.
     */
    function generateWeekView(entryDatesForWeek = [], selectedDateString = null) {
        const year = currentDisplayDate.getFullYear();
        const month = currentDisplayDate.getMonth();
        const day = currentDisplayDate.getDate();

        const firstDayOfWeek = new Date(year, month, day - currentDisplayDate.getDay()); 
        let daysHtml = '';
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(firstDayOfWeek);
            currentDate.setDate(firstDayOfWeek.getDate() + i);
            
            const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
            let classes = 'calendar-day';

            if (currentDate.getDate() === today.getDate() && 
                currentDate.getMonth() === today.getMonth() && 
                currentDate.getFullYear() === today.getFullYear()) {
                classes += ' current-day';
            }
            if (currentDate.getMonth() !== currentDisplayDate.getMonth()) {
                 classes += ' other-month-in-week'; 
            }
            if (entryDatesForWeek.includes(dateString)) {
                classes += ' has-entry';
            }
            if (dateString === selectedDateString) {
                classes += ' selected-date';
            }
            daysHtml += `<div class="${classes}" data-date="${dateString}">${currentDate.getDate()}</div>`;
        }
        return `<div class="calendar-grid">${generateDayHeaders()}${daysHtml}</div>`;
    }

    return {
        setDisplayDate,
        getDisplayDate,
        navigatePrevious,
        navigateNext,
        navigateToday,
        generateCalendarHeader,
        generateMonthView,
        generateWeekView
    };
})();

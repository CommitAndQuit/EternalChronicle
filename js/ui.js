// js/ui.js

const uiModule = (() => {
    // DOM Elements
    const passwordPromptContainer = document.getElementById('password-prompt-container');
    const passwordInput = document.getElementById('password-input');
    const passwordSubmitButton = document.getElementById('password-submit-button');
    const passwordMessage = document.getElementById('password-message');
    const passwordErrorMessage = document.getElementById('password-error-message');

    const appView = document.getElementById('app-view');
    const calendarPanel = document.getElementById('calendar-panel');
    const writingAreaPanel = document.getElementById('writing-area-panel'); // Get writing area panel
    
    // const newEntryButton = document.getElementById('new-entry-button'); // Removed
    const searchInput = document.getElementById('search-input');
    
    const entryListPanel = document.getElementById('entry-list-panel'); // This is now the preview pane
    const entryListUl = document.getElementById('entry-list'); // Will be used for the preview content

    const entryTitleInput = document.getElementById('entry-title-input');
    const entryContentTextarea = document.getElementById('entry-content-textarea');
    const autosaveStatus = document.getElementById('autosave-status');
    // const deleteEntryButton = document.getElementById('delete-entry-button'); // Removed
    const signOutButton = document.getElementById('sign-out-button');

    let onCalendarDateSelectedCallback = null;
    let onCalendarNavigationCallback = null;

    function init(calendarDateSelectedCb, calendarNavigationCb) {
        onCalendarDateSelectedCallback = calendarDateSelectedCb;
        onCalendarNavigationCallback = calendarNavigationCb;
        updateLayoutAndCalendar(); 
        window.addEventListener('resize', debounce(updateLayoutAndCalendar, 200));
        window.addEventListener('orientationchange', updateLayoutAndCalendar);

        calendarPanel.addEventListener('click', (event) => {
            const target = event.target;
            let mode = getCurrentCalendarMode();
            if (target.id === 'calendar-prev-button') {
                calendarModule.navigatePrevious(mode);
                if(onCalendarNavigationCallback) onCalendarNavigationCallback(); // Call before render
                renderCalendar(); // Re-render after navigation
            } else if (target.id === 'calendar-next-button') {
                calendarModule.navigateNext(mode);
                if(onCalendarNavigationCallback) onCalendarNavigationCallback();
                renderCalendar();
            } else if (target.id === 'calendar-today-button') {
                calendarModule.navigateToday();
                if(onCalendarNavigationCallback) onCalendarNavigationCallback(); // Call before render to update current date
                renderCalendar();
            } else if (target.classList.contains('calendar-day') && target.dataset.date) {
                if (onCalendarDateSelectedCallback) {
                    onCalendarDateSelectedCallback(target.dataset.date);
                }
                highlightCalendarDate(target.dataset.date); // Visually select
            }
        });
    }

    function getCurrentCalendarMode() {
        return window.matchMedia("(orientation: landscape)").matches ? 'month' : 'week';
    }

    function updateLayoutAndCalendar() {
        renderCalendar(); // Pass current app state if needed for markers
    }
    
    function renderCalendar(entryDates = [], selectedDateString = null) {
        const mode = getCurrentCalendarMode();
        // Clear previous highlights before re-rendering calendar content
        const previouslySelected = calendarPanel.querySelector('.calendar-day.selected-date');
        if (previouslySelected) previouslySelected.classList.remove('selected-date');
        
        calendarPanel.innerHTML = calendarModule.generateCalendarHeader(mode);
        if (mode === 'month') {
            calendarPanel.innerHTML += calendarModule.generateMonthView(entryDates);
        } else { 
            calendarPanel.innerHTML += calendarModule.generateWeekView(entryDates);
        }
        if (selectedDateString) {
            highlightCalendarDate(selectedDateString);
        }
    }
    
    function highlightCalendarDate(dateString) { // YYYY-MM-DD
        document.querySelectorAll('#calendar-panel .calendar-day.selected-date').forEach(el => el.classList.remove('selected-date'));
        const dayElement = calendarPanel.querySelector(`.calendar-day[data-date="${dateString}"]`);
        if (dayElement) {
            dayElement.classList.add('selected-date');
        }
    }

    function highlightCalendarDates(dateStringsArray) { // For search results
        document.querySelectorAll('#calendar-panel .calendar-day.search-highlight').forEach(el => el.classList.remove('search-highlight'));
        dateStringsArray.forEach(dateString => {
            const dayElement = calendarPanel.querySelector(`.calendar-day[data-date="${dateString}"]`);
            if (dayElement) {
                dayElement.classList.add('search-highlight');
            }
        });
    }


    function showPasswordPrompt(isInitialSetup = false) {
        appView.classList.remove('visible'); // Make app-view transparent before hiding
        appView.classList.add('hidden'); 
        
        calendarPanel.classList.remove('slide-in-left');
        entryListPanel.classList.remove('fade-in');
        writingAreaPanel.classList.remove('ease-in');

        passwordPromptContainer.classList.remove('hidden');
        passwordPromptContainer.classList.remove('slide-up'); 
        
        passwordMessage.textContent = isInitialSetup ? 
            "Create a passphrase for your new journal. Remember it well!" : 
            "Enter your passphrase to unlock your journal.";
        passwordInput.value = '';
        passwordErrorMessage.textContent = '';
        passwordInput.focus();
    }

    function hidePasswordPrompt() {
        // Start animation for password prompt sliding up
        passwordPromptContainer.classList.add('slide-up');
        
        // After password prompt animation might finish, show app view and trigger its animations
        setTimeout(() => {
            passwordPromptContainer.classList.add('hidden'); 
            appView.classList.remove('hidden');
            
            // Add .visible first to start app-view's own fade-in
            requestAnimationFrame(() => { 
                appView.classList.add('visible');
                // Then trigger child animations
                // A slight delay for child animations to start after app-view becomes visible
                setTimeout(() => {
                    calendarPanel.classList.add('slide-in-left');
                    entryListPanel.classList.add('fade-in');
                    writingAreaPanel.classList.add('ease-in');
                }, 50); // Small delay, adjust if needed
            });
        }, 500); 
    }

    function setPasswordError(message) {
        passwordErrorMessage.textContent = message;
    }

    function clearPasswordError() {
        passwordErrorMessage.textContent = '';
    }
    
    function getPassword() {
        return passwordInput.value;
    }

    /**
     * Renders the content of a single entry in the preview pane.
     * @param {Object | null} entry - The decrypted entry object for the selected day, or null.
     */
    function renderPreviewPane(entry) {
        entryListUl.innerHTML = ''; // Clear existing preview
        if (!entry || (!entry.title && !entry.content)) { // Check if entry has actual content
            const li = document.createElement('li');
            li.textContent = 'No entry for this day. Click in the editor above to start writing!';
            li.style.textAlign = 'center';
            li.style.padding = '20px';
            entryListUl.appendChild(li);
            return;
        }

        const li = document.createElement('li');
        li.className = 'preview-entry'; // Add a class for specific styling if needed

        if (entry.title) {
            const titleH3 = document.createElement('h3');
            titleH3.className = 'preview-title';
            titleH3.textContent = entry.title;
            li.appendChild(titleH3);
        }
        
        if (entry.content) {
            const contentDiv = document.createElement('div');
            contentDiv.className = 'preview-content';
            // Sanitize or carefully render HTML if content can have it. For now, textContent.
            // To render line breaks from textarea:
            contentDiv.innerHTML = entry.content.replace(/\n/g, '<br>'); 
            li.appendChild(contentDiv);
        }
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'preview-date';
        dateSpan.textContent = `Last modified: ${new Date(entry.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })}`;
        dateSpan.style.fontSize = '0.8em';
        dateSpan.style.color = '#555';
        dateSpan.style.marginTop = '10px';
        dateSpan.style.display = 'block';
        li.appendChild(dateSpan);

        entryListUl.appendChild(li);
    }


    function displayEntryForEdit(entry) {
        if (entry) {
            entryTitleInput.value = entry.title || '';
            entryContentTextarea.value = entry.content || '';
        } else {
            entryTitleInput.value = '';
            entryContentTextarea.value = '';
        }
        autosaveStatus.textContent = ''; 
        // entryContentTextarea.focus(); // Let app.js control focus
    }

    function getEditorContents() {
        return {
            title: entryTitleInput.value.trim(),
            content: entryContentTextarea.value 
        };
    }

    function showAutosaveStatus(message, isError = false) {
        autosaveStatus.textContent = message;
        autosaveStatus.style.color = isError ? 'var(--error-color)' : 'var(--text-color)';
        if (!isError && message && message !== "Typing...") { // Don't auto-clear "Typing..."
            setTimeout(() => {
                if (autosaveStatus.textContent === message) { 
                    autosaveStatus.textContent = '';
                }
            }, 2000);
        }
    }
    
    function clearEditor() {
        entryTitleInput.value = '';
        entryContentTextarea.value = '';
        autosaveStatus.textContent = '';
        // deleteEntryButton.classList.add('hidden'); // Button removed
    }

    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    return {
        init,
        showPasswordPrompt,
        hidePasswordPrompt,
        setPasswordError,
        clearPasswordError,
        getPassword,
        renderPreviewPane, // Changed from renderEntryList
        displayEntryForEdit,
        getEditorContents,
        showAutosaveStatus,
        clearEditor,
        renderCalendar, 
        highlightCalendarDate,
        highlightCalendarDates,
        entryTitleInput, // For app.js to focus
        passwordSubmitButton,
        // newEntryButton, // Removed
        searchInput,
        // entryListUl, // No longer directly manipulated by app.js for selection
        // deleteEntryButton, // Removed
        signOutButton
    };
})();

// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    const TEST_PLAINTEXT = "EternalChronicleTestString";

    let currentEncryptionKey = null;
    // Store entries as an object where key is 'YYYY-MM-DD'
    let journalData = {}; 
    let currentSelectedDateString = null; // YYYY-MM-DD
    let autosaveTimeout = null;

    // For comparing if editor is dirty
    let pristineEntryTitle = '';
    let pristineEntryContent = '';

    // Initialize UI module and pass callbacks
    // The second callback (handleCalendarNavigation) will be used to refresh the preview if the month/week changes
    uiModule.init(handleCalendarDateSelect, refreshPreviewForCurrentDate); 

    function getYYYYMMDD(dateObj) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // --- Application Initialization ---
    function initApp() {
        if (storageModule.hasPasswordBeenSet()) {
            uiModule.showPasswordPrompt(false);
        } else {
            uiModule.showPasswordPrompt(true);
        }
        attachEventListeners();
    }

    function attachEventListeners() {
        uiModule.passwordSubmitButton.addEventListener('click', handlePasswordSubmit);
        uiModule.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handlePasswordSubmit();
        });

        // uiModule.newEntryButton.addEventListener('click', handleNewEntryClick); // Removed
        // Entry list click is removed as it's now a preview pane. Selection happens via calendar.
        
        uiModule.entryTitleInput.addEventListener('input', scheduleAutosave);
        uiModule.entryContentTextarea.addEventListener('input', scheduleAutosave);

        // uiModule.deleteEntryButton.addEventListener('click', handleDeleteEntryClick); // Removed
        uiModule.searchInput.addEventListener('input', uiModule.debounce(handleSearch, 300));
        uiModule.signOutButton.addEventListener('click', handleSignOut);
    }

    // --- Password Handling & Sign Out ---
    async function handlePasswordSubmit() {
        const password = uiModule.getPassword();
        if (!password) {
            uiModule.setPasswordError("Passphrase cannot be empty.");
            return;
        }
        uiModule.clearPasswordError();
        uiModule.passwordSubmitButton.disabled = true;
        uiModule.passwordSubmitButton.textContent = 'Processing...';

        try {
            if (storageModule.hasPasswordBeenSet()) {
                const salt = storageModule.loadSalt();
                if (!salt) throw new Error("Salt not found. Data may be corrupted.");
                currentEncryptionKey = await cryptoModule.deriveKey(password, salt);
                
                const testEncryptedData = storageModule.loadTestEncryption();
                if (!testEncryptedData) {
                    console.warn("Test encryption data not found.");
                } else {
                    const iv = cryptoModule.base64ToUint8Array(testEncryptedData.iv);
                    const ciphertext = cryptoModule.base64ToArrayBuffer(testEncryptedData.data);
                    const decryptedText = await cryptoModule.decrypt(ciphertext, iv, currentEncryptionKey);
                    if (decryptedText !== TEST_PLAINTEXT) throw new Error("Incorrect passphrase.");
                }
                await loadJournalFromStorage();
                uiModule.hidePasswordPrompt();
                // Select today's date by default on login
                selectDateForEditing(getYYYYMMDD(new Date()));
            } else {
                // Initial Setup
                const salt = cryptoModule.generateSalt();
                currentEncryptionKey = await cryptoModule.deriveKey(password, salt);
                storageModule.saveSalt(salt);

                const { iv, ciphertext } = await cryptoModule.encrypt(TEST_PLAINTEXT, currentEncryptionKey);
                storageModule.saveTestEncryption(cryptoModule.arrayBufferToBase64(ciphertext), cryptoModule.uint8ArrayToBase64(iv));
                
                journalData = {}; 
                uiModule.hidePasswordPrompt();
                selectDateForEditing(getYYYYMMDD(new Date())); // Open editor for today
            }
            refreshCalendarUI();
        } catch (error) {
            console.error("Password submission error:", error);
            uiModule.setPasswordError(error.message || "An error occurred.");
            currentEncryptionKey = null; 
            uiModule.showPasswordPrompt(false); 
        } finally {
            uiModule.passwordSubmitButton.disabled = false;
            uiModule.passwordSubmitButton.textContent = 'Unlock / Initialize';
        }
    }

    function handleSignOut() {
        if (confirm("Are you sure you want to sign out?")) {
            // console.log("Executing handleSignOut..."); 
            currentEncryptionKey = null;
            journalData = {};
            currentSelectedDateString = null;
            pristineEntryTitle = '';
            pristineEntryContent = '';
            clearTimeout(autosaveTimeout);

            uiModule.clearEditor();
            uiModule.renderPreviewPane(null); 
            uiModule.renderCalendar([]); 
            uiModule.showPasswordPrompt(false); 
            // console.log("handleSignOut completed, password prompt should be visible.");
        }
    }

    // --- Entry Management (One entry per day) ---
    async function loadJournalFromStorage() {
        const encryptedEntriesArray = storageModule.loadEncryptedEntries(); // This returns an array
        const newJournalData = {};
        for (const encEntry of encryptedEntriesArray) {
            try {
                // encEntry.id is expected to be the YYYY-MM-DD date string
                const ivContent = cryptoModule.base64ToUint8Array(encEntry.encryptedContent.iv);
                const ciphertextContent = cryptoModule.base64ToArrayBuffer(encEntry.encryptedContent.ciphertext);
                const contentJson = await cryptoModule.decrypt(ciphertextContent, ivContent, currentEncryptionKey);
                const payload = JSON.parse(contentJson); 

                newJournalData[encEntry.id] = { // Use date string as key
                    date: payload.date, // ISO string for last modification
                    title: payload.title,
                    content: payload.content
                };
            } catch (error) {
                console.error(`Failed to decrypt entry for ${encEntry.id}:`, error.message);
            }
        }
        journalData = newJournalData;
    }

    async function saveJournalToStorage() {
        if (!currentEncryptionKey) {
            uiModule.showAutosaveStatus("Error: No encryption key.", true);
            return;
        }
        const encryptedEntriesArray = [];
        for (const dateStringKey in journalData) {
            if (journalData.hasOwnProperty(dateStringKey)) {
                const entry = journalData[dateStringKey];
                const payloadString = JSON.stringify({ 
                    date: entry.date, // last modified date
                    title: entry.title, 
                    content: entry.content 
                });
                const { iv, ciphertext } = await cryptoModule.encrypt(payloadString, currentEncryptionKey);
                
                encryptedEntriesArray.push({
                    id: dateStringKey, // The YYYY-MM-DD string
                    encryptedContent: {
                        iv: cryptoModule.uint8ArrayToBase64(iv),
                        ciphertext: cryptoModule.arrayBufferToBase64(ciphertext)
                    }
                });
            }
        }
        storageModule.saveEncryptedEntries(encryptedEntriesArray);
    }
    
    function selectDateForEditing(dateString) { // dateString is YYYY-MM-DD
        if (currentSelectedDateString && currentSelectedDateString !== dateString && isEditorDirty()) {
            handleAutosave(true); // Force save previous day's changes
        }

        currentSelectedDateString = dateString;
        let entry = journalData[dateString];

        if (!entry) {
            // Create a new placeholder entry for the day if it doesn't exist
            const today = new Date();
            const selectedDateObj = new Date(dateString + "T12:00:00"); // Ensure it's parsed as local
            
            entry = {
                date: selectedDateObj.toISOString(), // Store full ISO string for sorting/timestamp
                title: `Entry for ${selectedDateObj.toLocaleDateString()}`, 
                content: ""
            };
            // Do not add to journalData yet; only if user types something.
            // Or, add it, and if user leaves it empty, it can be cleaned up or not saved.
            // For simplicity, let's add it. If it remains empty, it's just an empty entry.
            journalData[dateString] = entry;
        }
        
        pristineEntryTitle = entry.title;
        pristineEntryContent = entry.content;
        uiModule.displayEntryForEdit(entry); // Populate editor
        uiModule.renderPreviewPane(entry);   // Update preview pane
        refreshCalendarUI(); // Update 'has-entry' markers and selection
        uiModule.entryTitleInput.focus();
    }

    // Removed handleNewEntryClick as the button is gone. 
    // New entries are implicitly created by selecting a date and typing.
    // function handleNewEntryClick() { ... } 

    // Removed handleDeleteEntryClick as the button is gone.
    // Deletion might be re-added later via context menu or other UI.
    // function handleDeleteEntryClick() { ... }

    function handleDeleteEntryClick() { // This function is no longer called but kept for now if needed later
        if (!currentSelectedDateString) return;
        const entryToDelete = journalData[currentSelectedDateString];
        if (!entryToDelete) {
            uiModule.showAutosaveStatus("No entry to delete for this day.", true);
            return;
        }

        if (confirm(`Are you sure you want to delete the entry for ${new Date(currentSelectedDateString+"T12:00:00").toLocaleDateString()}? This cannot be undone.`)) {
            delete journalData[currentSelectedDateString];
            
            pristineEntryTitle = ''; 
            pristineEntryContent = '';
            uiModule.clearEditor();
            uiModule.renderPreviewPane(null); // Clear preview
            
            saveJournalToStorage().then(() => {
                uiModule.showAutosaveStatus("Entry deleted.");
                refreshCalendarUI(); // Update calendar markers
            }).catch(err => {
                uiModule.showAutosaveStatus("Error deleting entry.", true);
                console.error("Error saving after delete:", err);
                // If save fails, revert deletion for data integrity? Or notify user.
                // For now, assume save works or error is shown.
                journalData[currentSelectedDateString] = entryToDelete; // simplistic revert
            });
        }
    }

    // --- Autosave ---
    function isEditorDirty() {
        const currentEditorState = uiModule.getEditorContents();
        return currentEditorState.title !== pristineEntryTitle || currentEditorState.content !== pristineEntryContent;
    }

    function scheduleAutosave() {
        clearTimeout(autosaveTimeout);
        if (currentSelectedDateString) { 
            uiModule.showAutosaveStatus("Typing...");
        }
        autosaveTimeout = setTimeout(() => {
            handleAutosave(false);
        }, 1500); 
    }

    async function handleAutosave(forceSave = false) {
        if (!currentSelectedDateString) return;

        let entry = journalData[currentSelectedDateString];
        if (!entry && !isEditorDirty()) { // No existing entry and editor is pristine (e.g. placeholder)
             // If there's no entry and editor hasn't been touched from its placeholder state, don't save.
            if (uiModule.autosaveStatus && uiModule.autosaveStatus.textContent === "Typing...") {
                 uiModule.showAutosaveStatus(""); 
            }
            return;
        }
        
        const { title, content } = uiModule.getEditorContents();

        if (!forceSave && !isEditorDirty()) {
            if (uiModule.autosaveStatus && uiModule.autosaveStatus.textContent === "Typing...") {
                 uiModule.showAutosaveStatus("Saved."); 
            }
            return;
        }
        
        // If entry didn't exist but editor is now dirty, create it.
        if (!entry) {
            entry = { date: new Date(currentSelectedDateString+"T12:00:00").toISOString(), title: "", content: ""};
            journalData[currentSelectedDateString] = entry;
        }

        entry.title = title;
        entry.content = content; // Content is overwritten, not appended. This matches typical editor behavior.
        entry.date = new Date().toISOString(); // Update last modified timestamp

        uiModule.showAutosaveStatus("Saving...");
        try {
            await saveJournalToStorage();
            pristineEntryTitle = title; 
            pristineEntryContent = content;
            uiModule.showAutosaveStatus("Saved.");
            uiModule.renderPreviewPane(entry); // Update preview with saved content
            refreshCalendarUI(); // Update 'has-entry' markers
        } catch (error) {
            console.error("Autosave error:", error);
            uiModule.showAutosaveStatus("Save failed!", true);
        }
    }

    // --- Search ---
    function handleSearch() {
        const searchTerm = uiModule.searchInput.value.toLowerCase();
        const matchingDates = [];
        for (const dateStringKey in journalData) {
            if (journalData.hasOwnProperty(dateStringKey)) {
                const entry = journalData[dateStringKey];
                const entryDateForSearch = new Date(dateStringKey+"T12:00:00").toLocaleDateString().toLowerCase();
                if ((entry.title && entry.title.toLowerCase().includes(searchTerm)) ||
                    (entry.content && entry.content.toLowerCase().includes(searchTerm)) ||
                    entryDateForSearch.includes(searchTerm)) {
                    matchingDates.push(dateStringKey);
                }
            }
        }
        // Instead of rendering a list, highlight dates on calendar & maybe load first match
        uiModule.highlightCalendarDates(matchingDates); 
        if (matchingDates.length > 0) {
            // Optionally, select the first matching date
            // selectDateForEditing(matchingDates[0]); 
        } else {
            // Clear highlights if no matches
        }
    }

    // --- Calendar Interaction Callbacks ---
    function handleCalendarDateSelect(dateString) { // YYYY-MM-DD from calendar click
        selectDateForEditing(dateString);
    }
    
    function refreshPreviewForCurrentDate() {
        // Called when calendar navigates (e.g. prev/next month)
        // to ensure preview is for the currently selected date if it's visible
        if (currentSelectedDateString) {
            const entry = journalData[currentSelectedDateString];
            uiModule.renderPreviewPane(entry || null); // Show current entry or empty
        } else {
            uiModule.renderPreviewPane(null);
        }
        refreshCalendarUI(); // Also refresh calendar markers
    }

    // --- UI Refreshers ---
    function refreshCalendarUI() {
        const entryDates = Object.keys(journalData); 
        uiModule.renderCalendar(entryDates, currentSelectedDateString); // Pass selected date for highlighting
    }

    // --- Start the app ---
    initApp();
});

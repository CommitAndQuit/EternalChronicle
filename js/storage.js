// js/storage.js

const storageModule = (() => {
    const SALT_KEY = 'eternalChronicleSalt';
    const ENTRIES_KEY = 'eternalChronicleEntries';
    const TEST_ENCRYPTION_KEY = 'eternalChronicleTest'; // For verifying password on login

    /**
     * Saves the salt to localStorage.
     * @param {Uint8Array} saltUint8Array The salt to save.
     */
    function saveSalt(saltUint8Array) {
        if (!(saltUint8Array instanceof Uint8Array)) {
            throw new Error("Invalid salt format for saving.");
        }
        const saltBase64 = cryptoModule.uint8ArrayToBase64(saltUint8Array);
        localStorage.setItem(SALT_KEY, saltBase64);
    }

    /**
     * Loads the salt from localStorage.
     * @returns {Uint8Array | null} The salt as a Uint8Array, or null if not found.
     */
    function loadSalt() {
        const saltBase64 = localStorage.getItem(SALT_KEY);
        if (!saltBase64) {
            return null;
        }
        try {
            return cryptoModule.base64ToUint8Array(saltBase64);
        } catch (error) {
            console.error("Error decoding salt from localStorage:", error);
            // Potentially corrupted salt, treat as if not found
            localStorage.removeItem(SALT_KEY);
            return null;
        }
    }

    /**
     * Checks if a password (and thus salt) has been set.
     * @returns {boolean} True if a salt exists in localStorage, false otherwise.
     */
    function hasPasswordBeenSet() {
        return localStorage.getItem(SALT_KEY) !== null;
    }

    /**
     * Saves encrypted journal entries to localStorage.
     * Entries are stored as an array of objects, each containing
     * id, date, title (encrypted), content (encrypted with iv).
     * @param {Array<Object>} encryptedEntriesArray Array of encrypted entry objects.
     * Each object should be like: { id: string, date: string, title: string (encrypted),
     * encryptedContent: { iv: string (base64), ciphertext: string (base64) } }
     */
    function saveEncryptedEntries(encryptedEntriesArray) {
        if (!Array.isArray(encryptedEntriesArray)) {
            throw new Error("Entries must be an array.");
        }
        // We expect iv and ciphertext to be Base64 strings already from app.js
        localStorage.setItem(ENTRIES_KEY, JSON.stringify(encryptedEntriesArray));
    }

    /**
     * Loads encrypted journal entries from localStorage.
     * @returns {Array<Object>} An array of encrypted entry objects, or an empty array if none found or error.
     * Each object is like: { id: string, date: string, title: string (encrypted),
     * encryptedContent: { iv: string (base64), ciphertext: string (base64) } }
     */
    function loadEncryptedEntries() {
        const entriesString = localStorage.getItem(ENTRIES_KEY);
        if (!entriesString) {
            return [];
        }
        try {
            const entries = JSON.parse(entriesString);
            // Basic validation
            if (Array.isArray(entries)) {
                return entries.filter(entry => entry && entry.id && entry.date && entry.encryptedContent && entry.encryptedContent.iv && entry.encryptedContent.ciphertext);
            }
            return [];
        } catch (error) {
            console.error("Error parsing entries from localStorage:", error);
            // Corrupted data, clear it to prevent further issues
            localStorage.removeItem(ENTRIES_KEY);
            return [];
        }
    }

    /**
     * Saves a test string, encrypted with the current key.
     * This is used to verify the password on subsequent logins without decrypting all entries.
     * @param {string} encryptedTestStringBase64 Base64 encoded encrypted test string.
     * @param {string} ivBase64 Base64 encoded IV for the test string.
     */
    function saveTestEncryption(encryptedTestStringBase64, ivBase64) {
        const testData = {
            iv: ivBase64,
            data: encryptedTestStringBase64
        };
        localStorage.setItem(TEST_ENCRYPTION_KEY, JSON.stringify(testData));
    }

    /**
     * Loads the encrypted test string and its IV.
     * @returns {{iv: string, data: string} | null} Object with iv and data (both base64), or null.
     */
    function loadTestEncryption() {
        const testDataString = localStorage.getItem(TEST_ENCRYPTION_KEY);
        if (!testDataString) {
            return null;
        }
        try {
            const testData = JSON.parse(testDataString);
            if (testData && testData.iv && testData.data) {
                return testData;
            }
            return null;
        } catch (error) {
            console.error("Error parsing test encryption data:", error);
            localStorage.removeItem(TEST_ENCRYPTION_KEY);
            return null;
        }
    }
    
    /**
     * Clears all journal-related data from localStorage.
     * Used if there's a major issue or for a reset functionality (not implemented yet).
     */
    function clearAllJournalData() {
        localStorage.removeItem(SALT_KEY);
        localStorage.removeItem(ENTRIES_KEY);
        localStorage.removeItem(TEST_ENCRYPTION_KEY);
        console.log("All journal data cleared from localStorage.");
    }


    return {
        saveSalt,
        loadSalt,
        hasPasswordBeenSet,
        saveEncryptedEntries,
        loadEncryptedEntries,
        saveTestEncryption,
        loadTestEncryption,
        clearAllJournalData // For debugging or future reset feature
    };
})();

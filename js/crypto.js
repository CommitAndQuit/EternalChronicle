// js/crypto.js

const cryptoModule = (() => {
    const PBKDF2_ITERATIONS = 250000; // Number of iterations for PBKDF2
    const SALT_LENGTH_BYTES = 16; // 128 bits salt
    const IV_LENGTH_BYTES = 12; // 96 bits IV for AES-GCM, as recommended

    /**
     * Generates a cryptographically secure random salt.
     * @returns {Uint8Array} A new salt.
     */
    function generateSalt() {
        return window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH_BYTES));
    }

    /**
     * Derives an encryption key from a password and salt using PBKDF2.
     * @param {string} passwordString The user's password.
     * @param {Uint8Array} saltUint8Array The salt.
     * @returns {Promise<CryptoKey>} A Promise that resolves to the derived CryptoKey for AES-GCM.
     */
    async function deriveKey(passwordString, saltUint8Array) {
        if (!passwordString) {
            throw new Error("Password cannot be empty.");
        }
        if (!saltUint8Array || saltUint8Array.length !== SALT_LENGTH_BYTES) {
            throw new Error(`Salt must be a Uint8Array of ${SALT_LENGTH_BYTES} bytes.`);
        }

        const passwordEncoded = new TextEncoder().encode(passwordString);
        
        // Import the password as a base key for PBKDF2
        const baseKey = await window.crypto.subtle.importKey(
            'raw',
            passwordEncoded,
            { name: 'PBKDF2' },
            false, // not extractable
            ['deriveKey']
        );

        // Derive the AES-GCM key
        const derivedKey = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: saltUint8Array,
                iterations: PBKDF2_ITERATIONS,
                hash: 'SHA-256'
            },
            baseKey,
            { name: 'AES-GCM', length: 256 }, // Key length for AES-256
            true, // extractable (false if you don't need to export it, but true is often fine for in-app use)
            ['encrypt', 'decrypt'] // Key usages
        );
        return derivedKey;
    }

    /**
     * Encrypts plaintext using AES-GCM.
     * @param {string} plainTextString The string to encrypt.
     * @param {CryptoKey} keyCryptoKey The AES-GCM CryptoKey.
     * @returns {Promise<{iv: Uint8Array, ciphertext: ArrayBuffer}>} A Promise that resolves to an object
     * containing the IV (Uint8Array) and the ciphertext (ArrayBuffer).
     */
    async function encrypt(plainTextString, keyCryptoKey) {
        if (typeof plainTextString !== 'string') {
            throw new Error("Plaintext must be a string.");
        }
        if (!keyCryptoKey || keyCryptoKey.type !== 'secret' || keyCryptoKey.algorithm.name !== 'AES-GCM') {
            throw new Error("Invalid AES-GCM CryptoKey provided for encryption.");
        }

        const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));
        const dataEncoded = new TextEncoder().encode(plainTextString);

        const ciphertext = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            keyCryptoKey,
            dataEncoded
        );

        return { iv, ciphertext };
    }

    /**
     * Decrypts ciphertext using AES-GCM.
     * @param {ArrayBuffer} ciphertext The ArrayBuffer containing the ciphertext.
     * @param {Uint8Array} iv The Initialization Vector used for encryption.
     * @param {CryptoKey} keyCryptoKey The AES-GCM CryptoKey.
     * @returns {Promise<string>} A Promise that resolves to the decrypted plaintext string.
     * Throws an error if decryption fails (e.g., wrong key, tampered data).
     */
    async function decrypt(ciphertext, iv, keyCryptoKey) {
        if (!(ciphertext instanceof ArrayBuffer)) {
            throw new Error("Ciphertext must be an ArrayBuffer.");
        }
        if (!(iv instanceof Uint8Array) || iv.length !== IV_LENGTH_BYTES) {
            throw new Error(`IV must be a Uint8Array of ${IV_LENGTH_BYTES} bytes.`);
        }
        if (!keyCryptoKey || keyCryptoKey.type !== 'secret' || keyCryptoKey.algorithm.name !== 'AES-GCM') {
            throw new Error("Invalid AES-GCM CryptoKey provided for decryption.");
        }

        try {
            const decryptedArrayBuffer = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                keyCryptoKey,
                ciphertext
            );
            return new TextDecoder().decode(decryptedArrayBuffer);
        } catch (error) {
            console.error("Decryption failed:", error);
            // It's crucial to not reveal specifics about why decryption failed to an end-user
            // as it could aid attackers. A generic error is better.
            throw new Error("Failed to decrypt data. Incorrect passphrase or data corrupted.");
        }
    }

    // --- Helper functions for storage ---

    /**
     * Converts a Uint8Array to a Base64 string.
     * @param {Uint8Array} uint8Array The array to convert.
     * @returns {string} The Base64 encoded string.
     */
    function uint8ArrayToBase64(uint8Array) {
        let binary = '';
        const len = uint8Array.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        return window.btoa(binary);
    }

    /**
     * Converts a Base64 string to a Uint8Array.
     * @param {string} base64String The Base64 string to convert.
     * @returns {Uint8Array} The decoded Uint8Array.
     */
    function base64ToUint8Array(base64String) {
        const binary_string = window.atob(base64String);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }
    
    /**
     * Converts an ArrayBuffer to a Base64 string.
     * @param {ArrayBuffer} buffer The ArrayBuffer to convert.
     * @returns {string} The Base64 encoded string.
     */
    function arrayBufferToBase64(buffer) {
        return uint8ArrayToBase64(new Uint8Array(buffer));
    }

    /**
     * Converts a Base64 string to an ArrayBuffer.
     * @param {string} base64 The Base64 string to convert.
     * @returns {ArrayBuffer} The decoded ArrayBuffer.
     */
    function base64ToArrayBuffer(base64) {
        return base64ToUint8Array(base64).buffer;
    }


    return {
        generateSalt,
        deriveKey,
        encrypt,
        decrypt,
        uint8ArrayToBase64,
        base64ToUint8Array,
        arrayBufferToBase64,
        base64ToArrayBuffer,
        IV_LENGTH_BYTES // Expose for storage module if needed
    };
})();

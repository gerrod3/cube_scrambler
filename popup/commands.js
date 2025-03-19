/**
 * Shortcut commands for keyboard use. Loaded after all other scripts are loaded, uses their methods.
 */

// Helper function to check if a keyboard event matches a key combination
function matchesKeyCombination(event, combination) {
    const parts = combination.split('+');
    const key = parts.pop(); // Get the main key (last part)
    const hasCtrl = parts.includes('Ctrl');
    const hasAlt = parts.includes('Alt');
    const hasShift = parts.includes('Shift');

    // Check if modifiers match
    if (event.ctrlKey !== hasCtrl) return false;
    if (event.altKey !== hasAlt) return false;
    if (event.shiftKey !== hasShift) return false;

    // Check if the main key matches
    const eventKey = event.key === ' ' ? 'Space' : event.key;
    return eventKey.toLowerCase() === key.toLowerCase();
}

addEventListener("keydown", async (e) => {
    // Wait for settings to be loaded if they haven't been
    if (GLOBAL_SETTINGS_PROMISE) {
        await GLOBAL_SETTINGS_PROMISE;
    }

    if (matchesKeyCombination(e, GLOBAL_SETTINGS.timerKeybind)) {
        // Start/stop the timer
        timerStart();
    } else if (matchesKeyCombination(e, GLOBAL_SETTINGS.newScrambleKeybind)) {
        // Stop timer, reset & generate new scramble
        timer.pause();
        timerReset();
        newScramble();
    } else if (matchesKeyCombination(e, GLOBAL_SETTINGS.resetTimerKeybind)) {
        // Stop timer, & just reset it
        timer.pause();
        timerReset();
    } else if (matchesKeyCombination(e, GLOBAL_SETTINGS.saveTimeKeybind)) {
        // Stop timer, save the time+scramble to database, update time avg values
        saveTime();
    } else if (e.key === "Delete") {
        // Stop timer and bring up delete modal
        timer.pause();
        showDeleteModal();
    }
});

// Listen for settings updates from the settings page
browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'settingsUpdated') {
        GLOBAL_SETTINGS = message.settings;
        updateButtonTitles(message.settings);
    }
});
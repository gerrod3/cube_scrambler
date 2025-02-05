/**
 * Theme management for the application
 */

// Apply theme based on setting (light, dark, or system)
function applyTheme(themeSetting) {
    if (themeSetting === 'system') {
        // Remove any forced theme classes
        document.documentElement.classList.remove('force-light', 'force-dark');
    } else {
        // Add appropriate force-theme class
        document.documentElement.classList.remove('force-light', 'force-dark');
        document.documentElement.classList.add(`force-${themeSetting}`);
    }
}

// Initialize theme from settings
async function initTheme() {
    // Wait for settings to be loaded if they haven't been
    if (GLOBAL_SETTINGS_PROMISE) {
        await GLOBAL_SETTINGS_PROMISE;
    }
    applyTheme(GLOBAL_SETTINGS.theme);
}

// Initialize theme when the script loads
initTheme(); 
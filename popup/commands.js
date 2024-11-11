/**
 * Shortcut commands for keyboard use. Loaded after all other scripts are loaded, uses their methods.
 */

addEventListener("keydown", (e) => {
    if (e.key === " ") {
        // Start/stop the timer
        timerStart();
    } else if (e.key === "c") {
        // Stop timer, reset & generate new scramble
        timer.pause();
        timerReset();
        newScramble();
    } else if (e.key === "x") {
        // Stop timer, & just reset it
        timer.pause();
        timerReset();
    } else if (e.key === "z") {
        // Stop timer, save the time+scramble to database, update time avg values
        saveTime();
    } else if (e.key === "Delete") {
        // Stop timer and bring up delete modal
        timer.pause();
        showDeleteModal();
    }
    
});
/**
 * Shortcut commands for keyboard use. Loaded after all other scripts are loaded, uses their methods.
 */

addEventListener("keydown", (e) => {
    if (e.key === " ") {
        // Start/stop the timer
        timerStart();
    } else if (e.key === "r") {
        // Stop timer, reset & generate new scramble
        timer.pause();
        timerReset();
        newScramble();
    } else if (e.key === "d") {
        // Stop timer, & just reset it
        timer.pause();
        timerReset();
    } else if (e.key === "s") {
        // Stop timer, save the time+scramble to database, update time avg values
        console.log("Trying to save command");
        saveTime();
    }
    
});
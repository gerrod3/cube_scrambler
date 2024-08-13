class Timer {
    startTime = null;
    priorElapsed = 0;
    interval = null;
    elapsed = 0;
    callback = null;
    timeout = 10;

    constructor(callback, timeout) {
        if (callback) {
            this.callback = callback;
        }
        if (timeout) {
            this.timeout = timeout;
        }
    }

    countUp() {
        this.startTime = Date.now();

        this.interval = setInterval(() => {
            this.elapsed = Date.now() - this.startTime + this.priorElapsed;
            if (this.callback !== null) {
                this.callback(this.elapsed);
            }
        }, this.timeout);
    }

    start() {
        // start/resume
        if (this.interval === null) {
            this.countUp();
        } else {
            this.pause();
        }
    }

    pause() {
        if (this.interval !== null) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.priorElapsed = this.elapsed;
    }

    reset() {
        this.startTime = Date.now();
        this.elapsed = 0;
        this.priorElapsed = 0;
    }

    get running() {
        return this.interval !== null;
    }
}

let timer_value = document.getElementById("timer-value");
let timer_start = document.getElementById("timer-start");
let timer_reset = document.getElementById("timer-reset");

const pad2 = (number) => `00${number}`.slice(-2);

function getDisplayValue(elapsed) {
    if (Number.isNaN(elapsed)) {
        return "-";
    }
    let min = Math.floor(elapsed / 60000) % 60;
    let sec = Math.floor(elapsed / 1000) % 60;
    let ms = Math.floor(elapsed / 10) % 100;
    return `${pad2(min)}:${pad2(sec)}.${pad2(ms)}`;
}

function updateTimerValue(elapsed) {
    timer_value.innerText = getDisplayValue(elapsed);
}

let timer = new Timer(updateTimerValue);

function timerStart() {
    timer.start();
    if (timer.running) {
        timer_start.innerText = "Pause";
    } else {
        timer_start.innerText = "Start";
    }
}

function timerReset() {
    timer.reset();
    if (!timer.running) {
        timer_start.innerText = "Start";
        updateTimerValue(timer.elapsed);
    }
}

timer_start.addEventListener("click", (e) => {
    timerStart();
});

timer_reset.addEventListener("click", (e) => {
    timerReset();
});

class Cube3x3 {
    // date as the key
    // scramble as array of moves
    // solve time in ms
    #_object = null;
    constructor(scramble, time, date=null) {
        this.scramble = scramble;
        this.time = time;
        if (!date) {
            date = Date.now();
        }
        this.date = date;
    }
    static DB_OBJECT_NAME = "Cube3x3";
    static DB_KEY = "date";
    static DB_FIELDS = ["date", "scramble", "time"];
    static db = new Database(Cube3x3);
    get db() {return Cube3x3.db._with(this);}
    get object() {
        if (this.#_object) {
            return this.#_object;
        }
        this.#_object = {};
        for (const fieldname of Cube3x3.DB_FIELDS) {
            this.#_object[fieldname] = this[fieldname];
        }
        return this.#_object;
    }

}

let save_button = document.getElementById("timer-save");
let stat_select = document.getElementById("stat-select");
let avg_value = document.getElementById("avg-stat");
let best_value = document.getElementById("best-stat");
let worst_value = document.getElementById("worst-stat");
let sessionStart = Date.now();
let today = new Date();
today.setUTCHours(0,0,0,0);
today = today.getTime();
let laskWeek = new Date();
laskWeek.setUTCHours(0,0,0,0);
laskWeek.setUTCDate(laskWeek.getUTCDate() - 7);
laskWeek = laskWeek.getTime();
const filterOptions = {
    session: {gt: sessionStart},
    today: {gt: today},
    week: {gt: laskWeek},
    all: null,
};

function updateStatValues() {
    // TODO: add time html selector
    let filterObject = filterOptions[stat_select.value];
    Cube3x3.db.objects(filterObject).then((values) => {
        avg_value.innerText = getDisplayValue(calculateAvg(values));
        best_value.innerText = getDisplayValue(calculateBest(values));
        worst_value.innerText = getDisplayValue(calculateWorst(values));
    });
}

function calculateAvg(values) {
    if (!values) {
        return Cube3x3.db.objects().then((values) => calculateAvg(values));
    } else if (values.length == 0) {
        return NaN;
    }
    let sum = values.reduce((acc, cur) => acc + cur.time, 0);
    return sum / values.length;
}

function calculateBest(values) {
    if (!values) {
        return Cube3x3.db.objects().then((values) => calculateBest(values));
    } else if (values.length == 0) {
        return NaN;
    }
    return Math.min(...values.map((x) => x.time));
}

function calculateWorst(values) {
    if (!values) {
        return Cube3x3.db.objects().then((values) => calculateWorst(values));
    } else if (values.length == 0) {
        return NaN;
    }
    return Math.max(...values.map((x) => x.time));
}

let lastScramble = null;
let lastTimer = null;
let saving = false;

function saveTime() {
    timer.pause();
    let scramble = getScramble();
    let time = timer.elapsed;
    if (lastScramble !== scramble || lastTimer !== time) {
        if (!saving) {
            saving = true;
            let value = new Cube3x3(scramble, time);
            value.db.save()
            .then((v) => {
                updateStatValues();
                lastScramble = scramble;
                lastTimer = time;
            })
            .finally(() => {
                saving = false;
            });
        }
    }
}
save_button.addEventListener("click", (e) => {
    console.log("Saving time button");
    saveTime();
});
stat_select.addEventListener("change", (e) => {
    updateStatValues();
});
onDBInit(updateStatValues);
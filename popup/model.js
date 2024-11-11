
class Cube3x3 {
    // date as the key
    // scramble as array of moves
    // solve time in ms
    #_object = null;
    constructor({ scramble, time, date=null }) {
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
    all: {all: null},
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
    let scrambleS = scramble.join(",");
    let time = timer.elapsed;
    if (Cube3x3.db.isInit && time && (lastScramble !== scrambleS || lastTimer !== time)) {
        console.debug("saving, ", time, scrambleS, lastTimer, lastScramble);
        if (!saving) {
            saving = true;
            let value = new Cube3x3({ scramble, time });
            value.db.save()
            .then((v) => {
                updateStatValues();
                lastScramble = scrambleS;
                lastTimer = time;
            })
            .finally(() => {
                saving = false;
            });
        }
    }
}
save_button.addEventListener("mousedown", (e) => {
    e.preventDefault();
    saveTime();
});
stat_select.addEventListener("change", (e) => {
    e.target.blur();
    updateStatValues();
    
});
onDBInit(updateStatValues);

let delete_modal = document.getElementById("delete-modal");
let delete_select = document.getElementById("delete-select");
let delete_cancel = document.getElementById("delete-cancel-button");
let delete_confirm = document.getElementById("delete-confirm-button");
let delete_text = document.getElementById("delete-record-text");
let deleting = false;

function deleteRecords() {
    // TODO: change db API to use object destructing
    if (!deleting) {
        console.debug("Deleting ", delete_select.value);
        let del_promise = null;
        if (delete_select.value == "last") {
            del_promise = Cube3x3.db.objects(null, 1, true).then((v) => Cube3x3.db.delete(v));
        } else {
            del_promise = Cube3x3.db.delete(null, filterOptions[delete_select.value]);
        }
        del_promise.then((v) => {
            updateStatValues();
        }).finally(() => {
            deleting = false;
        });
    }
}

function showDeleteModal() {
    if (!delete_modal.open) {
        delete_modal.showModal();
    }
}

delete_cancel.addEventListener("mousedown", (e) => {
    e.preventDefault();
    delete_modal.close();
});

delete_confirm.addEventListener("mousedown", (e) => {
    e.preventDefault();
    deleteRecords();
    delete_modal.close();
});

delete_select.addEventListener("change", (e) => {
    e.target.blur();
    if (e.target.value === "last") {
        delete_text.innerText = "record?";
    } else {
        delete_text.innerText = "records?";
    }
});
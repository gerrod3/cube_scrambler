// File that defines sets up and defines the API for the database

const DBVERSION = 1; // Increment this anything you alter the database
const DBNAME = "CubeSolveTimes";
let db;
let waitingInits = []; // Functions waiting on the db to be inited

function onDBInit(func) {
    if (!db) {
        waitingInits.push(func);
        return;
    }
    func();
}

// Initialize DB
const initRequest = window.indexedDB.open(DBNAME, DBVERSION);

initRequest.onerror = (event) => {
    // TODO: do something (maybe make db api do a bunch of no-ops)
    console.log("DB init error", event.error);
};

initRequest.onblocked = (event) => {
    // Some other tab/window opened the database, possibly reload here?
}

initRequest.onupgradeneeded = (event) => {
    // Perform migrations to setup database
    let mdb = event.target.result;
    
    // I have to figure out how to do migrations here
    // For now I'll write them manually
    const objectStore = mdb.createObjectStore("Cube3x3", { keyPath: "date" });
    // TODO: use objectStore to create indexes and such
}

initRequest.onsuccess = (event) => {
    // Set up db API here
    db = event.target.result;
    db.onerror = (event) => {
        // Generic error handler for all errors targeted at this database's requests!
        // TODO: Add better error handling
        console.error(`Database error: ${event.target.errorCode}`);
    };
    console.log("DB onsucess");
    for (const func of waitingInits) {
        func();
    }
}

class Database {
    // Upper-level database api used in models
    constructor(model, instance=null) {
        this.model = model; // The model class this database object is currently operating on
        this.instance = instance; // A current instance of the model to use for db operations
    }
    _with(instance) {
        return new Database(this.model, instance);
    }
    get #readStore() {
        return db.transaction([this.model.DB_OBJECT_NAME]).objectStore(this.model.DB_OBJECT_NAME);
    }
    get #readwriteStore() {
        return db.transaction([this.model.DB_OBJECT_NAME], "readwrite").objectStore(this.model.DB_OBJECT_NAME);
    }
    getObject(object) {
        if (object instanceof this.model) {
            return object.object;
        }
        return object;
    }
    getFilterRange(filterObject) {
        // filterObject is an object with possible keys: lt, lte, gt, gte, eq
        if (filterObject instanceof IDBKeyRange) {
            return filterObject;
        }
        if ("eq" in filterObject) {
            return IDBKeyRange.only(filterObject.eq);
        }
        let lower, upper, lowin, upin;
        if ("gt" in filterObject) {
            lower = filterObject.gt;
            lowin = false;
        } else if ("gte" in filterObject) {
            lower = filterObject.gte;
            lowin = true;
        }
        if ("lt" in filterObject) {
            upper = filterObject.lt;
            upin = false;
        } else if ("lte" in filterObject) {
            upper = filterObject.lte;
            upin = true;
        }
        if (upper && lower) {
            return IDBKeyRange.bound(lower, upper, lowin, upin);
        } else if (upper) {
            return IDBKeyRange.upperBound(upper, upin);
        } else if (lower) {
            return IDBKeyRange.lowerBound(lower, lowin);
        }
        return null;   
    }
    // save, delete, list
    // All apis return a promise that can be chained to get the result, convert indexDBs callbacks to promise api
    objects(filterObject=null) {
        // List all the objects available, TODO: Add indexes, reversal
        let store = this.#readStore;
        let keyRange = filterObject ? this.getFilterRange(filterObject) : null;
        if (!keyRange) {
            return new Promise((resolve, reject) => {
                const result = store.getAll();
                result.onsuccess = (event) => resolve(event.target.result);
                result.onerror = (event) => reject(event.target.error);
            });
        } 
        return new Promise((resolve, reject) => {
            let objects = [];
            const result = store.openCursor(keyRange);
            result.onerror = (event) => reject(event.target.error);
            result.onsuccess = (event) => {
                const cursor = event.target.result; // cursor is the result of the callback
                if (cursor) {
                    objects.push(cursor.value);
                    cursor.continue(); // will trigger this onsuccess callback again
                } else {
                    resolve(objects); // all objects fetched when cursor is now null
                }
            };
        });
    }
    save(objects=null) {
        // Forcefully insert the object(s) into the database
        if (!objects && !this.instance) {
            throw Error("No passed in objects or instance to save");
        }
        if (objects && this.instance) {
            throw Error("Passed in objects when instance was already set");
        }
        if (this.instance) {
            objects = [this.instance];
        }
        let store = this.#readwriteStore;
        let promises = [];
        for (let i = 0; i < objects.length; i++) {
            promises.push(
                new Promise((resolve, reject) => {
                    const objectified = this.getObject(objects[i]);
                    const result = store.put(objectified);
                    result.onsuccess = (event) => resolve(objectified);
                    result.onerror = (event) => reject(event.target.error);
                })
            );
        }
        return Promise.all(promises);
    }
    delete(objects=null) {
        // Forcefully delete the object(s) from the database
        // Forcefully insert the object(s) into the database
        if (!objects && !this.instance) {
            throw Error("No passed in objects or instance to delete");
        }
        if (objects && this.instance) {
            throw Error("Passed in objects when instance was already set");
        }
        if (this.instance) {
            objects = [this.instance];
        }
        let store = this.#readwriteStore;
        let promises = [];
        for (const obj of objects) {
            promises.push(
                new Promise((resolve, reject) => {
                    const objectified = this.getObject(obj);
                    const key = objectified[this.model.DB_KEY];
                    const result = store.delete(key);
                    result.onsuccess = (event) => resolve(key);
                    result.onerror =(event) => reject(event.target.error);
                })
            );
        }
        return Promise.all(promises);
    }

}
const MOVES = new Map(Object.entries({
    "L": ["L'", "R"],  // Inverse, Opposite Side
    "R": ["R'", "L"],
    "U": ["U'", "D"],
    "D": ["D'", "U"],
    "F": ["F'", "B"],
    "B": ["B'", "F"],
    "L'": ["L", "R"],
    "R'": ["R", "L"],
    "U'": ["U", "D"],
    "D'": ["D", "U"],
    "F'": ["F", "B"],
    "B'": ["B", "F"],
}));

function randomInt(num) {
    return Math.floor(Math.random() * num);
}

/**
 * The facelet model, represent a cube as a permutation of 6*9=54 faceletes
 * Each face is represented by 9 faceletes numbered from top left (reading order)
 * The solve cubed is the official location of each facelet
 * A move represents moving a facelet to a new facelet location, replacement (F1<-F7, F2<-F4, F3<-F1 for F move)
 * Cube will be an array of 54 faceletes with the indices representing the official location and the values representing the current facelet there
 * The order of the array will be U, L, F, R, B, D (draw order from top->bottom)
 */
const FACEORDER = ["U", "L", "F", "R", "B", "D"]
const OPPOSITEFACE = {"U": "D", "D": "U", "F": "B", "B": "F", "L": "R", "R": "L"}
function numToFacelet(perm) {
    // Take a permutation array of numbers and return an array of string facelets
    // U: 0-8, L: 9-17, F: 18-26, R: 27-35, B: 36-44, D: 45-53
    return perm.map((x) => {
        const face = Math.floor(x / 9);
        const num = x % 9 + 1;
        return FACEORDER[face] + num;
    });
}
function faceletToNum(perm) {
    return perm.map((x) => {
        const face = FACEORDER.indexOf(x[0]);
        return face * 9 + (x[1] - 1);
    });
}
function applyMove(perm, move) {
    // Apply move to a permutation (num form)
    return perm.map((x, index) => perm[move[index]]);
}
function applyMoves(perm, moves) {
    let newperm = perm.slice();
    for (const move of moves) {
        newperm = applyMove(newperm, move);
    }
    return newperm;
}

const UMOVE = ["U7", "U4", "U1", "U8", "U5", "U2", "U9", "U6", "U3", "F1", "F2", "F3", "L4", "L5", "L6", "L7", "L8", "L9", "R1", "R2", "R3", "F4", "F5", "F6", "F7", "F8", "F9", "B1", "B2", "B3", "R4", "R5", "R6", "R7", "R8", "R9", "L1", "L2", "L3", "B4", "B5", "B6", "B7", "B8", "B9", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9"];
const LMOVE = ["B9", "U2", "U3", "B6", "U5", "U6", "B3", "U8", "U9", "L7", "L4", "L1", "L8", "L5", "L2", "L9", "L6", "L3", "U1", "F2", "F3", "U4", "F5", "F6", "U7", "F8", "F9", "R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "B1", "B2", "D7", "B4", "B5", "D4", "B7", "B8", "D1", "F1", "D2", "D3", "F4", "D5", "D6", "F7", "D8", "D9"];
const FMOVE = ["U1", "U2", "U3", "U4", "U5", "U6", "L9", "L6", "L3", "L1", "L2", "D1", "L4", "L5", "D2", "L7", "L8", "D3", "F7", "F4", "F1", "F8", "F5", "F2", "F9", "F6", "F3", "U7", "R2", "R3", "U8", "R5", "R6", "U9", "R8", "R9", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "R7", "R4", "R1", "D4", "D5", "D6", "D7", "D8", "D9"];
const RMOVE = ["U1", "U2", "F3", "U4", "U5", "F6", "U7", "U8", "F9", "L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "F1", "F2", "D3", "F4", "F5", "D6", "F7", "F8", "D9", "R7", "R4", "R1", "R8", "R5", "R2", "R9", "R6", "R3", "U9", "B2", "B3", "U6", "B5", "B6", "U3", "B8", "B9", "D1", "D2", "B7", "D4", "D5", "B4", "D7", "D8", "B1"];
const BMOVE = ["R3", "R6", "R9", "U4", "U5", "U6", "U7", "U8", "U9", "U3", "L2", "L3", "U2", "L5", "L6", "U1", "L8", "L9", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "R1", "R2", "D9", "R4", "R5", "D8", "R7", "R8", "D7", "B7", "B4", "B1", "B8", "B5", "B2", "B9", "B6", "B3", "D1", "D2", "D3", "D4", "D5", "D6", "L1", "L4", "L7"];
const DMOVE = ["U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8", "U9", "L1", "L2", "L3", "L4", "L5", "L6", "B7", "B8", "B9", "F1", "F2", "F3", "F4", "F5", "F6", "L7", "L8", "L9", "R1", "R2", "R3", "R4", "R5", "R6", "F7", "F8", "F9", "B1", "B2", "B3", "B4", "B5", "B6", "R7", "R8", "R9", "D7", "D4", "D1", "D8", "D5", "D2", "D9", "D6", "D3"];
let ALLMOVES = new Map();
new Map([
    ["U", UMOVE],
    ["L", LMOVE],
    ["F", FMOVE],
    ["R", RMOVE],
    ["B", BMOVE],
    ["D", DMOVE],
]).forEach((value, key) => {
    ALLMOVES.set(key, faceletToNum(value));
    ALLMOVES.set(key+'2', applyMove(ALLMOVES.get(key), ALLMOVES.get(key)));
    ALLMOVES.set(key+"'", applyMove(ALLMOVES.get(key+'2'), ALLMOVES.get(key))); 
});

function scramble(num_moves=20, moveset=ALLMOVES) {
    let moves = [];
    let last_two = ["n", "n"];
    let perm = [...Array(54).keys()];
    let all_possible_perms = new Set([perm.join(",")]); // this is a stringfy version of the perm
    const empty = new Set();
    for (let i = 0; i < num_moves; ++i) {
        // apply all possible moves, remove moves that could have already been possibly selected, choose from remaining set
        let possible_perms_with_moves = new Map(
            [...ALLMOVES.keys()].map((m) => [m, applyMove(perm, ALLMOVES.get(m))])
        );
        let [l1, l2] = last_two;
        // Don't let three opposite face moves occur, i.e. L L R, can lead to the next move being L'
        let bad_moves = OPPOSITEFACE[l1[0]] === l2[0] ? new Set([l1[0], l2[0]]) : empty;
        let string_possibles = new Map(
            [...possible_perms_with_moves.entries()].map(([m, p]) => [m, p.join(",")]).filter(([m, p]) => !all_possible_perms.has(p) && !bad_moves.has(m[0]))
        );
        let nextMove = [...string_possibles.keys()][randomInt(string_possibles.size)];
        moves.push(nextMove);
        last_two = [last_two[1], nextMove];
        perm = possible_perms_with_moves.get(nextMove);
        for (const sperm of string_possibles.values()) {
            all_possible_perms.add(sperm);
        }
    }
    return moves.join(" ");
}

let scramble_p = document.getElementById("scramble");
let scramble_b = document.getElementById("scramble-button");

function newScramble() {
    scramble_p.innerText = scramble();
}

function getScramble() {
    return scramble_p.innerText.split(" ");
}

scramble_b.addEventListener("mousedown", (e) => {
    e.preventDefault();
    newScramble();
});

newScramble();
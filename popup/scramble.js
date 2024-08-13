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

function scramble(num_moves=20, moveset=MOVES) {
    let moves = [];
    let prev, pprev = null;
    for (let i = 0; i < num_moves; ++i) {
        let posmoves = new Set(moveset.keys());
        if (prev) {
            posmoves.delete(moveset.get(prev)[0]); // remove the inverse move
            if (prev === pprev) {
                posmoves.delete(prev); // remove the previous move to prevent 3 rotations
            }
            if (pprev && moveset.get(pprev)[1] === prev[0]) {
                posmoves.delete(moveset.get(pprev)[0]); // remove inverse move if no cross face move has been performed
                // this only checks the past 2 moves, still possible you could get R L R L R L R L if really unlucky... 
            }
        }
        posmoves = Array.from(posmoves);
        let move = posmoves[randomInt(posmoves.length)];
        if (move === prev) {
            moves[moves.length-1] = move[0] + "2";
        } else {
            moves.push(move);
        }
        pprev = prev;
        prev = move;
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
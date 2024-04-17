const crypto = require('crypto');

class MoveTable {
    constructor(moves) {
        this.moves = moves;
        this.table = this.generateTable();
    }

    generateTable() {
        const numMoves = this.moves.length;
        const table = [];
        for (let i = 0; i < numMoves; i++) {
            const row = [];
            for (let j = 0; j < numMoves; j++) {
                const diff = (j - i + numMoves) % numMoves;
                if (diff === 0) {
                    row.push("Draw");
                } else if (diff <= numMoves / 2) {
                    row.push("Lose");
                } else {
                    row.push("Win");
                }
            }
            table.push(row);
        }
        return table;
    }

    getResult(moveA, moveB) {
        const indexA = this.moves.indexOf(moveA);
        const indexB = this.moves.indexOf(moveB);
        return this.table[indexA][indexB];
    }

    getTable() {
        const header = [''].concat(this.moves);
        const rows = this.table.map((row, index) => [this.moves[index]].concat(row));
        return [header].concat(rows);
    }
}

class Rules {
    constructor(moves) {
        this.moveTable = new MoveTable(moves);
    }

    getWinner(userMove, computerMove) {
        const result = this.moveTable.getResult(userMove, computerMove);
        return result === "Win" ? "You win!" : result === "Draw" ? "It's a draw!" : "Computer wins!";
    }
}

class CryptoFunctions {
    generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    getHMAC(key, message) {
        return crypto.createHmac('sha256', key).update(message).digest('hex');
    }
}

class Game {
    constructor(moves) {
        this.moves = moves;
        this.rules = new Rules(moves);
        this.cryptoFunctions = new CryptoFunctions();
        this.key = this.cryptoFunctions.generateKey();
        this.computerMove = this.getRandomMove();
        this.computerHMAC = this.cryptoFunctions.getHMAC(this.key, this.computerMove);
    }

    getRandomMove() {
        return this.moves[Math.floor(Math.random() * this.moves.length)];
    }

    getMenu() {
        let menu = "Available moves:\n";
        this.moves.forEach((move, index) => {
            menu += `${index + 1} - ${move}\n`;
        });
        menu += "0 - exit\n? - help\n";
        return menu;
    }

    play(userMove) {
        console.log(`HMAC: ${this.computerHMAC}`);
        console.log(`Computer move: ${this.computerMove}`);
        console.log(`Your move: ${userMove}`);
        console.log(this.rules.getWinner(userMove, this.computerMove));
        console.log(`Key: ${this.key}`);
    }
}

function validateMoves(moves) {
    if (moves.length < 3 || moves.length % 2 === 0) {
        console.log("Invalid number of moves. Please provide an odd number of unique moves.");
        console.log("Example: node game.js rock paper scissors lizard Spock");
        process.exit(1);
    }
}

function main(moves) {
    validateMoves(moves);
    const game = new Game(moves);
    console.log(`HMAC: ${game.computerHMAC}`);
    console.log(game.getMenu());

    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let validMove = false;
    let userMoveIndex;
    readline.question("Enter your move: ", (index) => {
        if (index === "?") {
            const moveTable = new MoveTable(moves);
            const table = moveTable.getTable();
            console.log("Help Table:");
            table.forEach(row => {
                console.log(row.join('\t'));
            });
            readline.close();
            return;
        }

        if (index === "0") {
            console.log("Goodbye!");
            readline.close();
            return;
        }

        userMoveIndex = parseInt(index) - 1;
        if (isNaN(userMoveIndex) || userMoveIndex < 0 || userMoveIndex >= moves.length) {
            console.log("Invalid move. Please enter a number between 1 and " + moves.length + " or type '?' for help.");
            console.log(game.getMenu());
            readline.close();
            return;
        }

        validMove = true;
        readline.close();
    });

    readline.on('close', () => {
        if (validMove) {
            const userMove = moves[userMoveIndex];
            game.play(userMove);
        } else {
            main(moves);
        }
    });
}

const moves = process.argv.slice(2);
main(moves);
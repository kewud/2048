//Constant
const CANVAS_SIZE = 600;
const CANVAS_BACKGROUND_COLOR = "333333";
const GAME_SIZE = 4;
const BLOCK_SIZE = 120;
const BLOCK_PLACEHOLDER_COLOR = "555555";
const BLOCK_BACKGROUND_COLOR = "664455";
const BLOCK_NUMBER_FONT_SIZE = "100px";

const Direction = Object.freeze({
    UP: "UP",
    DOWN: "DOWN",
    LEFT: "LEFT",
    RIGHT: "RIGHT"
});

//Util
function randInt(a, b) {
    return Math.floor(Math.random() * (b + 1 - a));
}

function randChoice(arr) {
    return arr[randInt(0, arr.length - 1)];
}

function writeLog(...str) {
    for (let s of str) {
        console.log(s);
    }
}

//Model
class Game {
    constructor() {
        this.data = [];
        this.initializeData();
    }

    initializeData() {
        this.data = [];
        for (let i = 0; i < GAME_SIZE; i++) {
            let tmp = []
            for (let j = 0; j < GAME_SIZE; j++) {
                tmp.push(null);
            }
            this.data.push(tmp);
        }
        this.generateNewBlock();
        this.generateNewBlock();
    }

    generateNewBlock() {
        let possiblePosition = [];
        for (let i = 0; i < GAME_SIZE; i++) {
            for (let j = 0; j < GAME_SIZE; j++) {
                if (this.data[i][j] == null) {
                    possiblePosition.push([i, j]);
                }
            }
        }
        let position = randChoice(possiblePosition);
        this.data[position[0]][position[1]] = 2;
    }
    //game.shiftBlock( [2,2,null,null]);
    //game.shiftBlock( [null,null,2,2]);

    shiftBlock(arr, reverse = false) {
        if (reverse) {
            arr = [...arr].reverse();
        }

        let newArr = [];
        let countedPoint = -1; //因為一格只能相加一次，相加過後不能再加，所以記錄相加過後的那格結果的index(加過以後就固定了)
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == null) {
                continue;
            }

            if (newArr.length == 0 || newArr[newArr.length - 1] != arr[i] || countedPoint == newArr.length - 1) {
                newArr.push(arr[i]);
            } else {
                newArr[newArr.length - 1] = newArr[newArr.length - 1] + arr[i];
                countedPoint = newArr.length - 1;
            }
        }

        for (let i = newArr.length; i < arr.length; i++) {
            newArr.push(null);
        }

        if (reverse) {
            newArr.reverse();
        }


        return newArr;
    }

    shiftBlock2(arr, reverse = false) {
        let head = 0;
        let tail = 1;
        let incr = 1;

        if (reverse) {
            head = arr.length - 1;
            tail = head - 1;
            incr = -1;
        }

        while (0 <= tail && tail < arr.length) {
            if (arr[tail] == null) {
                tail += incr;
            } else {
                if (arr[head] == null) {
                    arr[head] = arr[tail];
                    arr[tail] = null;
                    tail += incr;
                } else if (arr[head] == arr[tail]) {
                    arr[head] = arr[head] * 2;
                    arr[tail] = null;
                    head += incr;
                    tail += incr;
                } else {
                    head += incr;
                    if (head == tail) {
                        tail += incr;
                    }
                }
            }
        }
        return arr;
    }

    isDataChangedAfterShift(oldData, newData) {
        for (let i = 0; i < GAME_SIZE; i++) {
            for (let j = 0; j < GAME_SIZE; j++) {
                if (oldData[i][j] != newData[i][j]) {
                    return true;
                }
            }
        }
        return false;
    }

    advance(command) {
        let originalData = this.data.map(row => [...row]);
        let reverse = false;
        switch (command) {
            case Direction.RIGHT:
                reverse = true;
            case Direction.LEFT:
                for (let i = 0; i < GAME_SIZE; i++) {
                    this.data[i] = this.shiftBlock(this.data[i], reverse);
                }
                break;

            case Direction.DOWN:
                reverse = true;
            case Direction.UP:
                for (let i = 0; i < GAME_SIZE; i++) {
                    let dataColumn = [];

                    //取出column
                    for (let j = 0; j < GAME_SIZE; j++) {
                        dataColumn.push(this.data[j][i]);
                    }
                    let dataColumnAfterShift = this.shiftBlock(dataColumn, reverse);

                    //排列完再更新到data
                    for (let j = 0; j < GAME_SIZE; j++) {
                        this.data[j][i] = dataColumnAfterShift[j];
                    }
                }
                break;
        }

        if (this.isDataChangedAfterShift(originalData, this.data)) {
            this.generateNewBlock();
        }
    }
}

//Test
class Test {

    static runAllTest() {
        Test.test_shiftBlock();
        Test.test_shiftBlock2();
    }

    static compareArray(arr1, arr2) {
        if (arr1.length != arr2.length) {
            return false;
        }

        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] != arr2[i]) {
                return false;
            }
        }

        return true;
    }

    static test_shiftBlock() {
        let gameTest = new Game();
        let testCases = [
            [[2, 2, 2, 2], [4, 4, null, null]],
            [[2, 2, null, 2], [4, 2, null, null]],
            [[4, 2, null, 2], [4, 4, null, null]],
            [[2, 4, null, 8], [2, 4, 8, null]],
            [[null, null, null, null], [null, null, null, null]],
            [[null, 4, 4, 8], [8, 8, null, null]],
            [[4, 4, 8, 16], [8, 8, 16, null]],
            [[4, 8, 8, 16], [4, 16, 16, null]],

        ]

        let reverseTestCases = [
            [[2, 2, 2, 2], [null, null, 4, 4]],
            [[2, 2, null, 2], [null, null, 2, 4]],
            [[4, 2, null, 2], [null, null, 4, 4]],
            [[2, 4, null, 8], [null, 2, 4, 8]],
            [[null, null, null, null], [null, null, null, null]],
            [[null, 4, 4, 8], [null, null, 8, 8]],
            [[4, 4, 8, 16], [null, 8, 8, 16]],
            [[4, 8, 8, 16], [null, 4, 16, 16]]
        ]

        let errFlag = false;
        for (let test of testCases) {

            const input = test[0];
            const answer = test[1];

            const output = gameTest.shiftBlock(input, false);

            if (!Test.compareArray(output, answer)) {
                errFlag = true;
                console.log('test_shiftBlock :' + 'Error!, ')
                console.log(input);
                console.log(output)
                console.log(answer);
            }
        }

        for (let test of reverseTestCases) {

            const input = test[0];
            const answer = test[1];

            const output = gameTest.shiftBlock(input, true);

            if (!Test.compareArray(output, answer)) {
                errFlag = true;
                console.log('test_shiftBlock(reverse) :' + 'Error!, ')
                console.log(input);
                console.log(output)
                console.log(answer);
            }
        }

        if (!errFlag) {
            console.log('test_shiftBlock :' + 'Pass!');
        }
    }

    static test_shiftBlock2() {
        let gameTest = new Game();
        let testCases = [
            [[2, 2, 2, 2], [4, 4, null, null]],
            [[2, 2, null, 2], [4, 2, null, null]],
            [[4, 2, null, 2], [4, 4, null, null]],
            [[2, 4, null, 8], [2, 4, 8, null]],
            [[null, null, null, null], [null, null, null, null]],
            [[null, 4, 4, 8], [8, 8, null, null]],
            [[4, 4, 8, 16], [8, 8, 16, null]],
            [[4, 8, 8, 16], [4, 16, 16, null]]
        ]

        let errFlag = false;
        for (let test of testCases) {
            let input = test[0];
            let answer = test[1];
            let output = gameTest.shiftBlock2(input);


            if (!Test.compareArray(output, answer)) {
                errFlag = true;
                console.log('test_shiftBlock2 :' + 'Error!, ')
                console.log(output)
                console.log(answer);
            }
        }

        if (!errFlag) {
            console.log('test_shiftBlock2 :' + 'Pass!');
        }
    }
}

//View
class View {
    constructor(game, container) {
        this.game = game;
        this.container = container;
        this.initializeContainer();
    }

    initializeContainer() {
        this.container.style.width = CANVAS_SIZE;
        this.container.style.height = CANVAS_SIZE;
        this.container.style.backgroundColor = CANVAS_BACKGROUND_COLOR;
        this.container.style.display = "inline-block";
        this.container.style.position = "relative";
    }

    drawGame() {
        for (let i = 0; i < GAME_SIZE; i++) {
            for (let j = 0; j < GAME_SIZE; j++) {
                if (this.game.data[i][j]) {
                    this.drawBlock(i, j, this.game.data[i][j]);
                } else {
                    this.drawBackgroundBlock(i, j, BLOCK_PLACEHOLDER_COLOR);
                }
            }
        }
    }

    drawBackgroundBlock(i, j, color) {
        let block = document.createElement("div");
        const gap_size = (CANVAS_SIZE - GAME_SIZE * BLOCK_SIZE) / (GAME_SIZE + 1)

        block.style.height = BLOCK_SIZE;
        block.style.width = BLOCK_SIZE;
        block.style.backgroundColor = color;
        block.style.position = "absolute";
        block.style.top = (i + 1) * gap_size + i * BLOCK_SIZE;
        block.style.left = (j + 1) * gap_size + j * BLOCK_SIZE;
        this.container.append(block);
        return block;
    }

    drawBlock(i, j, number) {
        let span = document.createElement("span");
        let text = document.createTextNode(number);
        let block = this.drawBackgroundBlock(i, j, BLOCK_BACKGROUND_COLOR);


        span.style.display = "inline-flex";
        span.style.fontSize = BLOCK_NUMBER_FONT_SIZE;

        block.style.display = "flex";
        block.style.justifyContent = "center";
        block.style.alignItems = "center";

        span.append(text);
        block.append(span);



    }
}

//Controller
let container = document.getElementById("game-container");
let game = new Game();
let view = new View(game, container);
view.drawGame();

document.onkeydown = function (event) {
    switch (event.key) {
        case "ArrowLeft":
            game.advance(Direction.LEFT);
            break;
        case "ArrowRight":
            game.advance(Direction.RIGHT);
            break;
        case "ArrowUp":
            game.advance(Direction.UP);
            break;
        case "ArrowDown":
            game.advance(Direction.DOWN);
            break;
    }
    view.drawGame();
}
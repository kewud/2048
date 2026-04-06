//Constant
const CANVAS_SIZE = 600;
const CANVAS_BACKGROUND_COLOR = "333333";
const GAME_SIZE = 4;
const BLOCK_SIZE = 120;
const BLOCK_PLACEHOLDER_COLOR = "555555";
const BLOCK_BACKGROUND_COLOR = "664455";
const BLOCK_NUMBER_FONT_SIZE = "60px";
const FRAME_PER_SECOND = 30;
const ANIMATION_TIME = 0.1;

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
        this.score = 0;
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

        this.score = 0;
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

        // 為了記錄移動前和移動後的位置，所以將arr元素的原始索引記起來
        arr = arr.map((val, index) => {

            return {
                val: val,
                originalIndex: index
            }

        });

        if (reverse) {
            arr.reverse();
        }

        let newArr = [];
        let moves = []; //[[2,1]] 表示從第2移到第1個索引
        let countedPoint = -1; //因為一格只能相加一次，相加過後不能再加，所以記錄相加過後的那格結果的index(加過以後就固定了)
        for (let i = 0; i < arr.length; i++) {

            if (arr[i].val == null) {
                continue;
            }

            if (newArr.length == 0 || newArr[newArr.length - 1] != arr[i].val || countedPoint == newArr.length - 1) {
                newArr.push(arr[i].val,);
            } else {
                newArr[newArr.length - 1] += arr[i].val;
                countedPoint = newArr.length - 1;
                this.score += arr[i].val * 2;
            }

            if (!reverse) {
                moves.push([arr[i].originalIndex, newArr.length - 1]);
            } else {
                moves.push([arr[i].originalIndex, arr.length - 1 - (newArr.length - 1)]);
            }
        }

        for (let i = newArr.length; i < arr.length; i++) {
            newArr.push(null);
        }


        if (reverse) {
            newArr.reverse();
        }



        return {
            "newArr": newArr,
            "moves": moves
        };
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
        let originalData = this.data.map(innerArray => [...innerArray]);
        let reverse = false;
        let moves = [];
        switch (command) {
            case Direction.RIGHT:
                reverse = true;
            case Direction.LEFT:
                for (let i = 0; i < GAME_SIZE; i++) {
                    let { newArr, moves: rowMove } = this.shiftBlock(this.data[i], reverse);

                    this.data[i] = newArr;
                    for (let move of rowMove) {
                        moves.push([[i, move[0]], [i, move[1]]]);
                    }
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

                    let { newArr, moves: colMove } = this.shiftBlock(dataColumn, reverse);
                    let dataColumnAfterShift = newArr;

                    for (let move of colMove) {
                        moves.push([[move[0], i], [move[1], i]]);
                    }

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

        return moves;
    }

    isGameOver() {
        //先檢查row
        for (let i = 0; i < GAME_SIZE; i++) {
            let lastNumber = null;
            for (let j = 0; j < GAME_SIZE; j++) {

                if (this.data[i][j] == null) return false; //只要有null存在表示可以再移動，所以就還沒game over

                if (lastNumber == null) {
                    lastNumber = this.data[i][j];
                    continue;
                }

                if (this.data[i][j] == lastNumber) {
                    return false;
                }
                lastNumber = this.data[i][j];
            }
        }

        //再檢查column
        for (let i = 0; i < GAME_SIZE; i++) {
            let lastNumber = null;
            for (let j = 0; j < GAME_SIZE; j++) {

                if (lastNumber == null) {
                    lastNumber = this.data[j][i];
                    continue;
                }

                if (this.data[j][i] == lastNumber) {
                    return false;
                }
                lastNumber = this.data[j][i];
            }
        }

        return true;
    }
}

//Test
class Test {

    static runAllTest() {
        Test.test_shiftBlock();
        //Test.test_shiftBlock2();
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

    static compare2DArray(arr1, arr2) {
        if (arr1.length != arr2.length) {
            return false;
        }

        for (let i = 0; i < arr1.length; i++) {

            if (arr1[i].length != arr2[i].length) {
                return false;
            }


            for (let j = 0; j < arr1[i].length; j++) {
                if (arr1[i][j] != arr2[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }


    static test_shiftBlock() {
        let gameTest = new Game();
        let testCases = [
            // [src, newArr, moves]
            // [[2, 2, 2, 2], [4, 4, null, null]],
            // [[2, 2, null, 2], [4, 2, null, null]],
            // [[4, 2, null, 2], [4, 4, null, null]],
            // [[2, 4, null, 8], [2, 4, 8, null]],
            // [[null, null, null, null], [null, null, null, null]],
            // [[null, 4, 4, 8], [8, 8, null, null]],
            // [[4, 4, 8, 16], [8, 8, 16, null]],
            // [[4, 8, 8, 16], [4, 16, 16, null]],
            [[2, 2, 2, 2], [4, 4, null, null], [[0, 0], [1, 0], [2, 1], [3, 1]]],
            [[2, 2, null, 2], [4, 2, null, null], [[0, 0], [1, 0], [3, 1]]],
            [[4, 2, null, 2], [4, 4, null, null], [[0, 0], [1, 1], [3, 1]]],
            [[2, 4, null, 8], [2, 4, 8, null], [[0, 0], [1, 1], [3, 2]]],
            [[null, null, null, null], [null, null, null, null], []],
            [[null, 4, 4, 8], [8, 8, null, null], [[1, 0], [2, 0], [3, 1]]],
            [[4, 4, 8, 16], [8, 8, 16, null], [[0, 0], [1, 0], [2, 1], [3, 2]]],
            [[4, 8, 8, 16], [4, 16, 16, null], [[0, 0], [1, 1], [2, 1], [3, 2]]],
        ]

        let reverseTestCases = [
            // [src, newArr, moves]
            // [[2, 2, 2, 2], [null, null, 4, 4]],
            // [[2, 2, null, 2], [null, null, 2, 4]],
            // [[4, 2, null, 2], [null, null, 4, 4]],
            // [[2, 4, null, 8], [null, 2, 4, 8]],
            // [[null, null, null, null], [null, null, null, null]],
            // [[null, 4, 4, 8], [null, null, 8, 8]],
            // [[4, 4, 8, 16], [null, 8, 8, 16]],
            // [[4, 8, 8, 16], [null, 4, 16, 16]]
            [[2, 2, 2, 2], [null, null, 4, 4], [[3, 3], [2, 3], [1, 2], [0, 2]]],   //[[0,2],[1,2],[2,3],[3,3]]
            [[2, 2, null, 2], [null, null, 2, 4], [[3, 3], [1, 3], [0, 2]]],
            [[4, 2, null, 2], [null, null, 4, 4], [[3, 3], [1, 3], [0, 2]]],
            [[2, 4, null, 8], [null, 2, 4, 8], [[3, 3], [1, 2], [0, 1]]],
            [[null, null, null, null], [null, null, null, null], []],
            [[null, 4, 4, 8], [null, null, 8, 8], [[3, 3], [2, 2], [1, 2]]],
            [[4, 4, 8, 16], [null, 8, 8, 16], [[3, 3], [2, 2], [1, 1], [0, 1]]],
            [[4, 8, 8, 16], [null, 4, 16, 16], [[3, 3], [2, 2], [1, 2], [0, 1]]]
        ]

        let errFlag = false;
        for (let test of testCases) {

            const input = test[0];
            const answerOfNewArr = test[1];
            const answerOfMoves = test[2];

            const output = gameTest.shiftBlock(input, false);

            if (!(Test.compareArray(output.newArr, answerOfNewArr) && Test.compare2DArray(output.moves, answerOfMoves))) {
                errFlag = true;
                console.log('test_shiftBlock :' + 'Error!, ')
                console.log(input);
                console.log(output.newArr);
                console.log(answerOfNewArr);
                console.log(output.moves);
                console.log(answerOfMoves);
            }
        }

        for (let test of reverseTestCases) {

            const input = test[0];
            const answerOfNewArr = test[1];
            const answerOfMoves = test[2];

            const output = gameTest.shiftBlock(input, true);

            if (!(Test.compareArray(output.newArr, answerOfNewArr) && Test.compare2DArray(output.moves, answerOfMoves))) {
                errFlag = true;
                console.log('test_shiftBlock(reverse) :' + 'Error!, ')
                console.log(input);
                console.log(output.newArr);
                console.log(answerOfNewArr);
                console.log(output.moves);
                console.log(answerOfMoves);
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
    constructor(game, container, score) {
        this.game = game;
        this.blocks = [];
        this.container = container;
        this.score = score;
        this.initializeContainer();
    }

    initializeContainer() {
        this.container.style.width = CANVAS_SIZE;
        this.container.style.height = CANVAS_SIZE;
        this.container.style.backgroundColor = CANVAS_BACKGROUND_COLOR;
        this.container.style.display = "inline-block";
        this.container.style.position = "relative";
        this.container.style.borderRadius = "15px";
        this.container.style.zIndex = 1;
    }

    drawGame() {
        this.container.innerHTML = "";
        this.blocks = [];
        for (let i = 0; i < GAME_SIZE; i++) {
            let tmp = [];
            for (let j = 0; j < GAME_SIZE; j++) {
                this.drawBackgroundBlock(i, j, BLOCK_PLACEHOLDER_COLOR);
                if (this.game.data[i][j]) {
                    let block = this.drawBlock(i, j, this.game.data[i][j]);
                    tmp.push(block);
                } else {
                    tmp.push(null);
                }
            }
            this.blocks.push(tmp);
        }

        this.score.textContent = "Score: " + this.game.score;
    }

    drawBackgroundBlock(i, j, color) {
        let block = document.createElement("div");

        block.style.height = BLOCK_SIZE;
        block.style.width = BLOCK_SIZE;
        block.style.backgroundColor = color;
        block.style.position = "absolute";
        // block.style.top = (i + 1) * gap_size + i * BLOCK_SIZE;
        // block.style.left = (j + 1) * gap_size + j * BLOCK_SIZE;
        block.style.top = this.gridToPosition(i, j)[0];
        block.style.left = this.gridToPosition(i, j)[1];
        block.style.borderRadius = "10px";
        block.style.zIndex = 3;
        this.container.append(block);
        return block;
    }

    gridToPosition(i, j) {
        const gap_size = (CANVAS_SIZE - GAME_SIZE * BLOCK_SIZE) / (GAME_SIZE + 1)
        let top = (i + 1) * gap_size + i * BLOCK_SIZE;
        let left = (j + 1) * gap_size + j * BLOCK_SIZE;
        return [top, left];
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
        block.style.zIndex = 5;

        span.append(text);
        block.append(span);
        return block;
    }

    animate(moves) {
        return new Promise((resolve) => {
            this.doFrame(moves, 0, ANIMATION_TIME, resolve);
        })

    }

    doFrame(moves, currTime, totalTime, onComplete) {
        if (currTime < totalTime) {
            setTimeout(() => {
                this.doFrame(moves, currTime + 1 / FRAME_PER_SECOND, totalTime, onComplete);
            }, 1 / FRAME_PER_SECOND * 1000);

            for (let move of moves) {
                let block = this.blocks[[move[0][0]]][move[0][1]];
                let origin = this.gridToPosition(move[0][0], move[0][1]);
                let destination = this.gridToPosition(move[1][0], move[1][1]);
                let currPosition = [
                    origin[0] + currTime / totalTime * (destination[0] - origin[0]),
                    origin[1] + currTime / totalTime * (destination[1] - origin[1])
                ]
                block.style.top = currPosition[0];
                block.style.left = currPosition[1];
            }
        } else {
            this.drawGame();
            onComplete();
        }
    }
}

//Controller
let container = document.getElementById("game-container");
let score = document.getElementById("score");
let game = new Game();
let view = new View(game, container, score);
view.drawGame();

let isAnimating = false;
let isGameOver = false;
document.onkeydown = async function (event) {

    if (isAnimating || isGameOver) return;



    let moves = null;
    switch (event.key) {
        case "ArrowLeft":
            moves = game.advance(Direction.LEFT);
            break;
        case "ArrowRight":
            moves = game.advance(Direction.RIGHT);
            break;
        case "ArrowUp":
            moves = game.advance(Direction.UP);
            break;
        case "ArrowDown":
            moves = game.advance(Direction.DOWN);
            break;
    }

    if (moves) {
        isAnimating = true;

        try {
            await view.animate(moves);
        } catch (error) {
            console.error(error);
        } finally {
            isAnimating = false;
            if (game.isGameOver()) {
                isGameOver = true;
                //alert跳太快，所以延遲一下等動畫跑完再跳
                setTimeout(() => {
                    alert('game over!!');
                }, 100);
            };
        }
    }
}



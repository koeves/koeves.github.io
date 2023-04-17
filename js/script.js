const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

const rows = canvas.height / 10;
const cols = canvas.width / 10;

// initialize the grid
let grid = new Array(rows);
for (let i = 0; i < rows; i++) {
    grid[i] = new Array(cols);
    for (let j = 0; j < cols; j++) {
        grid[i][j] = Math.round(Math.random());
    }
}

// calculate the next generation of the grid
function nextGeneration() {
    let newGrid = new Array(rows);
    for (let i = 0; i < rows; i++) {
        newGrid[i] = new Array(cols);
        for (let j = 0; j < cols; j++) {
            let neighbors = countNeighbors(i, j);
            if (grid[i][j] === 1) {
                if (neighbors < 2 || neighbors > 3) {
                    newGrid[i][j] = 0;
                } else {
                    newGrid[i][j] = 1;
                }
            } else {
                if (neighbors === 3) {
                    newGrid[i][j] = 1;
                } else {
                    newGrid[i][j] = 0;
                }
            }
        }
    }
    grid = newGrid;
}

// count the number of live neighbors for a cell
function countNeighbors(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let r = (row + i + rows) % rows;
            let c = (col + j + cols) % cols;
            if (grid[r][c] === 1) {
                count++;
            }
        }
    }
    if (grid[row][col] === 1) {
        count--;
    }
    return count;
}

// draw the grid on the canvas
function draw() {
    ctx.fillStyle = "#FF0000";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === 1) {
                ctx.fillRect(j * 10, i * 10, 10, 10);
            }
        }
    }
    nextGeneration();
}

setInterval(draw, 100);
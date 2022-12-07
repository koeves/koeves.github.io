const numLiveNeighbors = (row, col) =>
    matrix[row - 1][col + 1] + matrix[row - 1][col] + matrix[row - 1][col - 1] + // left
    matrix[row][col - 1] + matrix[row][col + 1] +                                // centre
    matrix[row + 1][col + 1] + matrix[row + 1][col] + matrix[row + 1][col - 1]   // right

const regenerate = () => {
    var startTime = performance.now();
    for (var i = 1; i < SIZE; i++) {
        for (var j = 1; j < SIZE; j++) {
            if (matrix[i][j] && (numLiveNeighbors(i, j) == 2 || numLiveNeighbors(i, j) == 3)) {
                matrix[i][j] = 1; // stays alive
            }

            else if (!matrix[i][j] && numLiveNeighbors(i, j) == 3) {
                matrix[i][j] = 1; // becomes alive 
            }

            else {
                matrix[i][j] = 0; // dies
            }
        }
    }
    var endTime = performance.now();
    console.log(`Call to regenerate took ${endTime - startTime} milliseconds`);
}
const SIZE = 100;
var matrix = [...Array(SIZE + 1)].map(_ => Array(SIZE + 1).fill(0))

for (var i = 1; i < SIZE; i++) {
    for (var j = 1; j < SIZE; j++) {
        matrix[i][j] = ((Math.random() >= 0.94) ? 1 : 0);
    }
}

$(document).ready(() => {
    for (var i = 1; i < SIZE; i++) {
        $("#gol-container").append(`<tr class="row" id="row-${i}"></tr>`);
        for (var j = 1; j < SIZE; j++) {
            $(`#row-${i}`).append(`<td class="cell" id="${i}-${j}"></td>`);
        };
    }

    window.setInterval(() => { regenerate(); draw() }, 100);

    const draw = () => {
        var startTime = performance.now();
        for (var i = 1; i < SIZE; i++) {
            for (var j = 1; j < SIZE; j++) {
                if (matrix[i][j])
                    $(`#${i}-${j}`).css("background-image", "url('css/apple.png')")
                else
                    $(`#${i}-${j}`).css("background-image", "none")
            }
        }
        var endTime = performance.now();
        console.log(`Call to draw took ${endTime - startTime} milliseconds`);
    }
});


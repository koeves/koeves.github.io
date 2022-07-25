var bpm1 = "", 
    bpm2 = "";

$(document).ready(() => {
    $('#bpm1').focus();
    
    $('#bpm1').keyup(function () {
        bpm1 = $(this).val();
        console.log("deck 1 changed to: " + bpm1);
        update();
    });

    $('#bpm2').keyup(function () {
        bpm2 = $(this).val();
        console.log("deck 2 changed to: " + bpm2);
        update();
    });
});

const update = () => {
    if (bpm1 != "" && bpm2 != "") {
        const change1 = calculate(bpm1, bpm2),
              change2 = calculate(bpm2, bpm1),
              text1   = (change1 > 0.0) ? "+" + change1 : change1,
              text2   = (change2 > 0.0) ? "+" + change2 : change2;

        $('#deck1').text("deck 1 " + text1 + "%");
        $('#deck2').text("deck 2 " + text2 + "%");

        if (change1 > 0.0)
            $('#deck1').css('color', 'green');
        if (change2 > 0.0)
            $('#deck2').css('color', 'green');
        if (change1 < 0.0)
            $('#deck1').css('color', 'red');
        if (change2 < 0.0)
            $('#deck2').css('color', 'red');
    }
    else {
        $('#deck1').text("deck 1");
        $('#deck2').text("deck 2");
        $('#deck1').css('color', 'hsl(205deg, 20%, 94%)');
        $('#deck2').css('color', 'hsl(205deg, 20%, 94%)');
    }
}

const colored = bpm => {
    if (bpm >= 0.0) return ""
}

const calculate = (bpm1, bpm2) => ((1 - (bpm1 / bpm2)) * 100).toFixed(2);

const ws = new WebSocket("wss://lobbysensor-ws.serveo.net");

ws.onerror = function(err) {
    console.error("failed to make websocket connection");
    throw err;
};

ws.onopen = function() {
    console.log("connection established");
};

ws.onmessage = function(event) {
    div = document.getElementById("value");
    //console.log(event);
    data = event.data;
    if (data.startsWith("[") && data.endsWith("]")) {
        values = data.substring(1, data.length - 1);
        arr = values.split(",");
        sum = 0;
        for (i = 0; i < arr.length; i++) {
            //console.log(arr[i]);
            $("#sensor" + (i + 1)).attr("value", arr[i]);
            $("#sensor" + (i + 1)).attr("max", $("#settingMaxValue").val());
            percent = (100 * arr[i]) / $("#settingMaxValue").val();
            $("#sensor" + (i + 1)).text(percent + "%");
            sum += 1 * arr[i];
        }

        avg = sum / 8;
        console.log(avg);

        $("#ackValue").attr("value", avg);
        $("#ackValue").attr("max", $("#settingMaxValue").val());
        //console.log(values);
    }
    //div.innerHTML = event.data;
};
/*
const form = document.getElementById("chat");
form.addEventListener("submit", function(event) {
    const textInput = document.getElementById("chat-message");
    const chatText = textInput.value;
    textInput.value = "";
    ws.send(chatText);
    event.preventDefault();
});*/

//console.log("Hello");

$(document).ready(function() {
    setTimeout(function() {
        settingsNoOfSensors = $("#settingsNoOfSensors").val();
        settingMaxValue = $("#settingMaxValue").val();
        settingsTimeInterval = $("#settingsTimeInterval").val();
        ws.send("<VS" + settingsNoOfSensors + ">");
        ws.send("<VI" + settingsTimeInterval + ">");
        ws.send("<VM" + settingMaxValue + ">");
    }, 2000);

    $("#btnUpdateSettings").click(function() {
        settingsNoOfSensors = $("#settingsNoOfSensors").val();
        settingMaxValue = $("#settingMaxValue").val();
        settingsTimeInterval = $("#settingsTimeInterval").val();

        settingsTimeInterval =
            settingsTimeInterval <= 9999
                ? `000${settingsTimeInterval}`.slice(-4)
                : settingsTimeInterval;
        ws.send("<VS" + settingsNoOfSensors + ">");
        ws.send("<VI" + settingsTimeInterval + ">");
        ws.send("<VM" + settingMaxValue + ">");
    });
});

/*

Set prevValue = 0

Loop:
    Check currValue
    if currValue != prevValue
        prevValue = currValue
        play movie "prevValue->currValue"
        play movie "currValue"
    else currValue == prevValue
        play movie "currValue"


*/

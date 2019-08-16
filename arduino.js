const config = require("./config");
const wss = require("./wss");

if (config.arduinoAvailable) {
    var SerialPort = require("serialport");
    const Readline = require("@serialport/parser-readline");
    const parser = new Readline();

    arduino = new SerialPort(
        config.arduinoPath,
        {
            baudRate: 115200,
            parser,
        },
        function(err) {
            if (err) {
                console.log("Arduino error: ", err.message);
            } else {
                console.log("Connected to Arduino at ", config.arduinoPath);
                setTimeout(() => {
                    //arduino.write("<G>");
                    //arduino.write("<C0000FF>");
                }, 2000);
            }
        }
    );
    arduino.pipe(parser);
    parser.on("data", function(data) {
        console.log("incoming data from arduino: " + data);
        arduino_data = data.trim();
        wss.sendToClients(arduino_data);
    });
} else {
    arduino = {
        write: s => {},
    };
}

exports.sendToArduino = data => {
    arduino.write(data);
};

exports.start = () => {
    arduino.write("<G>");
};

exports.stop = () => {
    arduino.write("<S>");
};

exports.indicateReady = () => {
    arduino.write("<C000044>");
};

exports.indicateRunning = () => {
    arduino.write("<C004400>");
};

exports.indicateError = () => {
    arduino.write("<CFF0000>");
};

exports.indicateSetup = () => {
    arduino.write("<C664400>");
};

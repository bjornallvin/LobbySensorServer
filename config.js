const config = {
    arduinoAvailable: process.env.ARDUINO_AVAILABLE == "false" ? false : true,
    arduinoPath: process.env.ARDUINO_PATH || "/dev/ttyUSB0",
    noOfVideos: 2,
    timeInterval: 500,
    noOfSensors: 8,
    maxValue: 11,
};

module.exports = config;

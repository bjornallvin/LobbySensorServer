const { exec } = require("child_process");
const moment = require("moment");
const chalk = require("chalk");
var path = require("path");
const fs = require("fs");
const ip = require("ip");
const arduino = require("./arduino");
var piWifi = require("pi-wifi");
var localtunnel = require("localtunnel");

exports.runShellScript = script => {
    const cmd = "sudo bash " + sensorState.scriptFolder + "/" + script;
    console.log(cmd);
    exports.execCmd(cmd);
};
exports.runPythonScript = (script, sudo = true) => {
    let cmd = "python3 " + sensorState.scriptFolder + "/" + script;
    if (sudo) {
        cmd = "sudo " + cmd;
    }
    console.log(cmd);
    exports.execCmd(cmd);
};
exports.execCmd = (
    cmd,
    cb = (err, stdout, stderr) => {
        if (err) {
            // node couldn't execute the command
            console.log(err);
            return;
        }
        console.log("Execution done: ", stdout);
        console.log(stderr);
    }
) => {
    if (sensorState.platform == "raspberry") {
        exec(cmd, cb);
    } else {
        console.log("Exec not run: ", cmd);
    }
};

exports.hasInternet = () => {
    return new Promise(resolve => {
        require("dns").lookup("google.com", function(err) {
            if (err) {
                //console.log(err);
                resolve(false);
            } else {
                //console.log("Internet connection exist");
                resolve(true);
            }
        });
    });
};

exports.debug = (...args) => {
    let now = moment();
    args = [
        chalk.blue(now.format("YYYY-MM-DD HH:mm:ss")),
        chalk.green(": "),
    ].concat(args);
    console.log(args.join(""));
};

exports.internetChecker = async () => {
    let internet = await exports.hasInternet();
    if (internet) {
        console.log("Connected");
        if (sensorState.state == "DISCONNECTED") {
            sensorState.state = "RUNNING";
            arduino.start();
            piWifi.status("wlan0", function(err, status) {
                if (status.ssid == "DOVADO") {
                    arduino.indicateSetup();
                } else {
                    arduino.indicateRunning();
                }
            });
        }
    } else {
        console.log("No internet");
        if (sensorState.state == "RUNNING") {
            sensorState.state = "DISCONNECTED";
            arduino.stop();
            arduino.indicateError();
        }
    }
    setTimeout(exports.internetChecker, 10000);
};

exports.initDevice = async () => {
    sensorState.state = "UNKNOWN";

    //read saved settings file
    this.loadSettingsFromFile();

    //check for internet connectivity
    sensorState.hasInternet = await exports.hasInternet();
    if (sensorState.hasInternet) {
        console.log("Have internet");

        piWifi.status("wlan0", function(err, status) {
            if (status.ssid == "DOVADO") {
                arduino.indicateSetup();
            } else {
                arduino.indicateRunning();
            }
        });

        var tunnel1 = localtunnel(80, { subdomain: "lobbysensor" }, function(
            err,
            tunnel
        ) {
            //if (err) ...
            // the assigned public url for your tunnel
            // i.e. https://abcdefgjhij.localtunnel.me
            //tunnel.url;
        });
        var tunnel2 = localtunnel(3002, { subdomain: "lobbysensor" }, function(
            err,
            tunnel
        ) {
            //if (err) ...
            // the assigned public url for your tunnel
            // i.e. https://abcdefgjhij.localtunnel.me
            //tunnel.url;
        });

        // start tunnel

        // check again every X seconds
        setTimeout(exports.internetChecker, 10000);
        sensorState.state = "RUNNING";
        arduino.start();
    } else {
        console.log("no internet");
        sensorState.state = "DISCONNECTED";
        arduino.indicateError();
        arduino.stop();
    }
};

exports.loadSettingsFromFile = () => {
    let result = true;
    var appDir = path.dirname(require.main.filename);
    let filePath = appDir + "/sensor.json";
    debug("Reading sensorState from: ", filePath);
    try {
        if (fs.existsSync(filePath)) {
            debug("Found sensor.json");
            let rawdata = fs.readFileSync(filePath);
            let newConfig = JSON.parse(rawdata);

            //if (newConfig.restartCount) {
            //    sensorState.restartCount = newConfig.restartCount;
            //}
            result = true;
        }
    } catch (err) {
        debug(err);
        result = false;
    }

    return result;
};

exports.saveSettingsToFile = () => {
    let data = {};

    //if (sensorState.restartCount) {
    //    data["restartCount"] = sensorState.restartCount;
    //}
    let data_str = JSON.stringify(data);
    var appDir = path.dirname(require.main.filename);
    let filePath = appDir + "/sensor.json";
    debug("Writing sensorState to: ", filePath);
    try {
        fs.writeFileSync(filePath, data_str);
        //file written successfully

        return true;
    } catch (err) {
        debug(err);
        return false;
    }
};

exports.indexPage = (req, res) => {
    res.render("index");
};
exports.videoPage = (req, res) => {
    res.render("video", { noOfVideos: sensorState.noOfVideos });
};

const debug = exports.debug;

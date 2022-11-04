(function () {
    if (typeof Window === "undefined") {
        var metaCol = require("cli-color").blue;
        function str(val) {
            if (typeof val === "object") {
                return JSON.stringify(val);
            }
            return String(val);
        }
        function log() {
            for (var i = 0; i < arguments.length; ++i) {
                process.stdout.write(str(arguments[i]));
            }
        }
        function mlog() {
            for (var i = 0; i < arguments.length; ++i) {
                process.stdout.write(metaCol(str(arguments[i])));
            }
        }
        // Window
        global.Window = {
            alert: function (message, title, errorIcon) {
                mlog("Alert window");
                if (title) {
                    mlog(" with title '");
                    log(title);
                    mlog("'");
                    if (errorIcon) {
                        mlog(" and error icon");
                    }
                }
                else if (errorIcon) {
                    mlog(" with error icon");
                }
                mlog(" says:\n");
                log(message);
                mlog("\n")
            }
        };
        // $
        global.$ = {
            level: 0,
            writeln: function () {
                for (var i = 0; i < arguments.length; ++i) {
                    if (i > 0) {
                        log(" ");
                    }
                    log(arguments[i]);
                }
                log("\n");
            },
            write: function () {
                for (var i = 0; i < arguments.length; ++i) {
                    log(arguments[i]);
                }
            }
        };
        // Error
        function Error(description) {
            this.description = description;
        };
        global.Error = Error;
        // File
        function File(path) {
            this.path = path;
        }
        File.prototype.open = function (mode) {
            if (mode !== 'r') {
                throw new Error("Only 'r' mode is supported.");
            }
        };
        File.prototype.close = function () { };
        File.prototype.read = function () {
            return require("fs").readFileSync(this.path).toString();
        };
        File.openDialog = function () {
            mlog("Open file dialog stub is returning 'test.json' file\n");
            return new File("test.json");
        };
        global.File = File;
    }
})();
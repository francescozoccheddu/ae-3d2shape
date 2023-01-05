(function () {
    if (typeof Window === "undefined") {
        var metaCol = require("cli-color").blue.italic;
        var valueCol = require("cli-color").cyanBright;
        function str(val) {
            if (typeof val === "object") {
                return JSON.stringify(val);
            }
            return String(val);
        };
        function log() {
            for (var i = 0; i < arguments.length; ++i) {
                process.stdout.write(str(arguments[i]));
            }
        };
        function vlog() {
            for (var i = 0; i < arguments.length; ++i) {
                process.stdout.write(valueCol(str(arguments[i])));
            }
        };
        function mlog() {
            for (var i = 0; i < arguments.length; ++i) {
                process.stdout.write(metaCol(str(arguments[i])));
            }
        };
        mlog("Installing stub interfaces\n");
        // Window
        global.Window = {
            alert: function (message, title, errorIcon) {
                mlog("Alert window");
                if (title) {
                    mlog(" with title '");
                    vlog(title);
                    mlog("'");
                    if (errorIcon) {
                        mlog(" and error icon");
                    }
                }
                else if (errorIcon) {
                    mlog(" with error icon");
                }
                mlog(" says:\n");
                vlog(message);
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
        // BridgeTalk
        global.BridgeTalk = {
            appName: "aftereffects"
        };
        // Shape
        function Shape() {
            this.vertices = [];
        }
        global.Shape = Shape;
        // Property
        function Property(name, index, leaf) {
            this._name = name;
            this.propertyIndex = index;
            this._childCount = 0;
            this.anchorPoint = leaf ? null : new Property(this._name.concat(" -> Anchor Point"), "?", true);
        };
        Property.prototype.property = function (name) {
            return new Property(this._name.concat(" -> ").concat(String(name)), name);
        };
        Property.prototype.addProperty = function (name) {
            this._childCount++;
            var child = new Property(this._name.concat(" -> ").concat(name.concat(" (").concat(String(this._childCount)).concat(")")), this._childCount);
            mlog("Adding property '");
            vlog(child._name);
            mlog("'\n");
            return child;
        };
        Property.prototype.setValue = function (value) {
            mlog("Setting property '");
            vlog(this._name);
            mlog("' with value:\n");
            vlog(value);
            mlog("\n");
        };
        Property.prototype.setValueAtTime = function (time, value) {
            mlog("Setting property '");
            vlog(this._name);
            mlog("' at time ")
            vlog(time);
            mlog(" with value:\n")
            vlog(value);
            mlog("\n");
        };
        // CompItem
        function CompItem() {
            this.width = 1280;
            this.height = 720;
            this.layers = {
                addShape: function () {
                    mlog("Adding a shape layer to the composition\n");
                    return new Property("Shape layer", 0);
                }
            };
        };
        global.CompItem = CompItem;
        // App
        global.app = {
            project: {
                activeItem: new CompItem()
            },
            beginUndoGroup: function (name) {
                mlog("Starting undo group with name '");
                vlog(name);
                mlog("'\n");
            },
            endUndoGroup: function () {
                mlog("Ending undo group\n");
            }
        };
        mlog("Setting a 1280x720 composition as the active project item\n");
        // Error
        function Error(description) {
            this.description = description;
        };
        global.Error = Error;
        // File
        function File(path) {
            this.path = path;
        };
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
            mlog("Open file dialog is returning the '");
            vlog("test.json");
            mlog("' file\n");
            return new File("test.json");
        };
        global.File = File;
    }
})();
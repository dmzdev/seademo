var dmz =
       { seaConst: require("seaConst")
       , message: require("dmz/runtime/messaging")
       , module: require("dmz/runtime/module")
       , time: require("dmz/runtime/time")
       , object: require("dmz/components/object")
       , script: require("dmz/runtime/script")
       , uiConst: require("dmz/ui/consts")
       , uiLoader: require("dmz/ui/uiLoader")
       , main: require("dmz/ui/mainWindow")
       , dock: require("dmz/ui/dockWidget")
       }
  // Constants
  , DockName = "Simulation"
  // Functions
  , _workFunction
  // Variables
  , _exports = {}
  , _startTable = {}
  , _workTable = {}
  , _stopTable = {}
  , _resetTable = {}
  , _started = false
  , _log
  , _form = dmz.uiLoader.load("SimulationForm")
  , _dock = dmz.main.createDock
    (DockName
    , { area: dmz.uiConst.LeftToolBarArea
      , allowedAreas: [dmz.uiConst.NoToolBarArea]
      }
    , _form
    )
  , _startButton = _form.lookup("startButton")
  , _stopButton = _form.lookup("stopButton")
  , _resetButton = _form.lookup("resetButton")
  ;

(function () {
   _stopButton.enabled(false);
})();

self.shutdown = function () { dmz.main.removeDock(DockName); };

dmz.script.observe(self, dmz.script.InstanceDestroy, function (name) {

   if (_startTable[name]) { delete _startTable[name] }
   if (_workTable[name]) { delete _workTable[name] }
   if (_stopTable[name]) { delete _stopTable[name] }
   if (_resetTable[name]) { delete _resetTable[name] }
});

_startButton.observe(self, "clicked", function () {

   _started = true;
   _startButton.enabled(!_started);
   _stopButton.enabled(_started);
   _resetButton.enabled(!_started);
   _exports.control.start();
});

_stopButton.observe(self, "clicked", function () {

   _started = false;
   _startButton.enabled(!_started);
   _stopButton.enabled(_started);
   _resetButton.enabled(!_started);
   _exports.control.stop();
});

_resetButton.observe(self, "clicked", function (button) {

   _exports.control.reset();
   if (_log) { _log.clear(); }
});

_workFunction = function (time) {

   var keys = Object.keys(_workTable);
   keys.forEach(function (name) { _workTable[name](time); });
};

_exports.start = function (obj, func) {

   if (obj && obj.name) {

      _startTable[obj.name] = func;
      if (_started) { func(); }
   }
};

_exports.timeSlice = function (obj, func) {

   if (obj && obj.name) { _workTable[obj.name] = func; }
};

_exports.stop = function (obj, func) {

   if (obj && obj.name) { _stopTable[obj.name] = func; }
};

_exports.control = {}

_exports.control.start = function () {

   var keys = Object.keys(_startTable);
   self.log.info("*** Start Simulation: " + new Date);
   keys.forEach(function (name) { _startTable[name](); });
   dmz.time.setRepeatingTimer(self, _workFunction);
};

_exports.control.stop = function () {

   var keys = Object.keys(_stopTable);
   keys.forEach(function (name) { _stopTable[name](); });
   dmz.time.cancelTimer(self, _workFunction);
   self.log.info("*** Stop Simulation: " + new Date);
};

_exports.control.reset = function () {

   var keys = Object.keys(_resetTable);
   keys.forEach(function (name) { _resetTable[name](); });
};

_exports.control.isRunning = function () { return _started; };

_exports.log = function (msg) {

   if (_log) { _log.append(msg); }
};

_exports.saveLog = function (file) {

   if (_log) { _log.save(file); }
};

   // Publish module
dmz.module.publish(self, _exports);

dmz.module.subscribe(self, "log", function (Mode, module) {

   if (Mode === dmz.module.Activate) { _log = module; }
});

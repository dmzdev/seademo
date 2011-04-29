var dmz =
       { uiConst: require("dmz/ui/consts")
       , uiLoader: require("dmz/ui/uiLoader")
       , main: require("dmz/ui/mainWindow")
       , dock: require("dmz/ui/dockWidget")
       , module: require("dmz/runtime/module")
       , file: require("dmz/system/file")
       }
  // Constants
  , DockName = "Data Log"
  // Functions
  // Variables
  , _exports = {}
  , _form = dmz.uiLoader.load("LogForm")
  , _dock = dmz.main.createDock
    (DockName
    , { area: dmz.uiConst.BottomToolBarArea
      , allowedAreas: [dmz.uiConst.BottomToolBarArea]
      , floating: true
      , visible: true
      }
    , _form
    )
  , _log = _form.lookup("textEdit")
  ;

self.shutdown = function () { dmz.main.removeDock(DockName); };

_exports.clear = function () { _log.clear(); }

_exports.append = function (msg) {

   if (msg) { _log.append(msg); }
};

_exports.save = function (file) {

   if (!dmz.file.write(file, _log.text())) {

      self.log.error ("Failed to create file:", file);
   }
};

dmz.module.publish(self, _exports);

var dmz =
       { uiConst: require("dmz/ui/consts")
       , uiLoader: require("dmz/ui/uiLoader")
       , main: require("dmz/ui/mainWindow")
       , dock: require("dmz/ui/dockWidget")
       , module: require("dmz/runtime/module")
       , file: require("dmz/system/file")
       , fileDialog: require("dmz/ui/fileDialog")
       }
  // Constants
  , DockName = "Data Log"
  , FileExt = ".csv"
  // Functions
  // Variables
  , _exports = {}
  , _form = dmz.uiLoader.load("LogForm")
  , _dock = dmz.main.createDock
    (DockName
    , { area: dmz.uiConst.BottomDockWidgetArea
      , allowedAreas: [dmz.uiConst.BottomDockWidgetArea, dmz.uiConst.TopDockWidgetArea]
      , floating: true
      , visible: true
      }
    , _form
    )
  , _log = _form.lookup("textEdit")
  ;

self.shutdown = function () { dmz.main.removeDock(DockName); };

_form.observe(self, "exportButton", "clicked", function (button) {

   var name
     , split
     ;

   name = dmz.fileDialog.getSaveFileName(
      { caption: "Save file", filter: "Data File (*" + FileExt + ")" },
      dmz.main.window());

   if (name) {

      split = dmz.file.split(name);

      if (split && (split.ext != FileExt)) {

         name = name + FileExt;

         if (dmz.file.valid(name)) {

            self.log.warn("File:", name, "already exists.");
         }
      }

      _exports.save(name);
   }
});

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

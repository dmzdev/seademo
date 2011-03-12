var dmz =
       { saeConst: require("saeConst")
       , defs: require("dmz/runtime/definitions")
       , object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       , uiLoader: require("dmz/ui/uiLoader")
       , uiMessageBox: require('dmz/ui/messageBox')
       , module: require("dmz/runtime/module")
       , undo: require("inspectorUndo")
       }
  // Constants
  , HelicopterType = dmz.objectType.lookup("Helicopter")
  // Functions
  // Variables
  , _inUpdate = false
  , _undo = dmz.undo.create("<Undefined from: " + self.name + ">")
  , _object
  , _form = dmz.uiLoader.load("HelicopterInspector")
  , _type = _form.lookup("typeLabel")
  , _name = _form.lookup("nameEdit")
  ;

(function () {

//   _initOS(OSType);
//   _initService(ServiceType);

})();


_name.observe(self, "textChanged", function(value, widget) {

   if (_object) {

      _inUpdate = true;
      _undo.start(widget, "Edit name");

      dmz.object.text(_object, dmz.saeConst.NameAttr, value);

      _undo.stop();
      _inUpdate = false;
   }
});


dmz.module.subscribe(self, "objectInspector", function (Mode, module) {

   if (Mode === dmz.module.Activate) {

      module.addInspector(self, _form, HelicopterType, function (handle) {

         var name = dmz.object.text(handle, dmz.saeConst.NameAttr)
           , type = dmz.object.type(handle)
           ;

         _undo.clear();
         _object = undefined;

         if (type) { _type.text(type.name()); }
         else { _type.text("Unknown Type"); }

         if (name) { _name.text(name); }
         else { _name.text(""); }

         _object = handle;
      }); 
   }
});

dmz.module.subscribe(self, "objectInit", function (Mode, module) {

   if (Mode === dmz.module.Activate) {

      module.addInit(self, HelicopterType, function (handle, type) {

         if (!dmz.object.text(handle, dmz.saeConst.NameAttr)) {

            dmz.object.text(
               handle,
               dmz.saeConst.NameAttr,
               type.name() + module.counter());
         }
      }); 
   }
});

dmz.object.text.observe(self, dmz.saeConst.NameAttr, function (handle, attr, value) {

   if (!_inUpdate && (handle === _object)) { _name.text(value); }
});

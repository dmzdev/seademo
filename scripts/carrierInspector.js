var dmz =
       { seaConst: require("seaConst")
       , defs: require("dmz/runtime/definitions")
       , object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       , uiLoader: require("dmz/ui/uiLoader")
       , uiMessageBox: require('dmz/ui/messageBox')
       , module: require("dmz/runtime/module")
       , undo: require("inspectorUndo")
       }
  // Constants
  , CarrierType = dmz.objectType.lookup("Carrier")
  , NameAttr = dmz.seaConst.NameAttr
  , SpeedAttr = dmz.seaConst.SpeedAttr
  // Functions
  // Variables
  , _inUpdate = false
  , _undo = dmz.undo.create("<Undefined from: " + self.name + ">")
  , _object
  , _form = dmz.uiLoader.load("CarrierInspector")
  , _type = _form.lookup("typeLabel")
  , _name = _form.lookup("nameEdit")
  , _speed = _form.lookup("speedSlider")
  ;

(function () {

})();


_name.observe(self, "textChanged", function(value, widget) {

   if (_object) {

      _inUpdate = true;
      _undo.start(widget, "Edit name");

      dmz.object.text(_object, NameAttr, value);

      _undo.stop();
      _inUpdate = false;
   }
});


_speed.observe(self, "valueChanged", function (value, widget) {

   if (_object) {

      _inUpdate = true;
      _undo.start(widget, "Edit Speed");

      dmz.object.scalar(_object, SpeedAttr, value);

      _undo.stop();
      _inUpdate = false;
   }
});

dmz.module.subscribe(self, "objectInspector", function (Mode, module) {

   if (Mode === dmz.module.Activate) {

      module.addInspector(self, _form, CarrierType, function (handle) {

         var name = dmz.object.text(handle, NameAttr)
           , type = dmz.object.type(handle)
           , speed = dmz.object.scalar(handle, SpeedAttr)
           ;

         _undo.clear();
         _object = undefined;

         if (type) { _type.text(type.name()); }
         else { _type.text("Unknown Type"); }

         if (name) { _name.text(name); }
         else { _name.text(""); }

         if (speed) { _speed.value(speed); }
         else { _speed.value(0); }

         _object = handle;
      });
   }
});

dmz.module.subscribe(self, "objectInit", function (Mode, module) {

   if (Mode === dmz.module.Activate) {

      module.addInit(self, CarrierType, function (handle, type) {

   self.log.warn("objectInit: " + type);

         if (!dmz.object.text(handle, dmz.seaConst.NameAttr)) {

            dmz.object.text(
               handle,
               dmz.seaConst.NameAttr,
               type.name() + module.counter());
         }
      });
   }
});

dmz.object.text.observe(self, dmz.seaConst.NameAttr, function (handle, attr, value) {

   if (!_inUpdate && (handle === _object)) { _name.text(value); }
});

dmz.object.scalar.observe(self, dmz.seaConst.SpeedAttr, function (handle, attr, value) {

   if (!_inUpdate && (handle === _object)) { _speed.value(value); }
});

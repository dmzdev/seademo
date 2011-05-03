var dmz =
       { seaConst: require("seaConst")
       , defs: require("dmz/runtime/definitions")
       , object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       , uiLoader: require("dmz/ui/uiLoader")
       , module: require("dmz/runtime/module")
       , vector: require("dmz/types/vector")
       , matrix: require("dmz/types/matrix")
       , undo: require("inspectorUndo")
       }
  // Constants
  , SubmarineType = dmz.objectType.lookup("Submarine")
  // Functions
  , _updateHeading
  // Variables
  , _inUpdate = false
  , _undo = dmz.undo.create("<Undefined from: " + self.name + ">")
  , _object
  , _form = dmz.uiLoader.load("SubmarineInspector")
  , _type = _form.lookup("typeLabel")
  , _name = _form.lookup("nameEdit")
  , _heading = _form.lookup("headingSpinBox")
  , _headingDial = _form.lookup("headingDial")
  ;

_updateHeading = function (value, widget) {

   var ori;

   if (_object) {

      _inUpdate = true;
      _undo.start(widget, "Edit heading");

      ori = dmz.matrix.create().fromAxisAndAngle(dmz.vector.Up, value * (Math.PI / 180));

      dmz.object.orientation(_object, null, ori);

      _undo.stop();
      _inUpdate = false;
   }
};

(function () {

//   _initOS(OSType);
//   _initService(ServiceType);

})();


_name.observe(self, "textChanged", function(value, widget) {

   if (_object) {

      _inUpdate = true;
      _undo.start(widget, "Edit name");

      dmz.object.text(_object, dmz.seaConst.NameAttr, value);

      _undo.stop();
      _inUpdate = false;
   }
});

_heading.observe(self, "valueChanged", function (value, widget) {

   var dial = value;
   if (dial < 0) { dial += 360; }
   if (dial > 359) { dial -= 360; }

   _updateHeading (value, widget);
   _headingDial.value (dial);
});


_headingDial.observe(self, "valueChanged", function (value, widget) {

   var heading = value;
   if (heading < 0) { heading += 360; }
   if (heading > 359) { heading -= 360; }

   _updateHeading (heading, widget);
   _heading.value (heading);
});


dmz.module.subscribe(self, "objectInspector", function (Mode, module) {

   if (Mode === dmz.module.Activate) {

      module.addInspector(self, _form, SubmarineType, function (handle) {

         var name = dmz.object.text(handle, dmz.seaConst.NameAttr)
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

      module.addInit(self, SubmarineType, function (handle, type) {

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

dmz.object.orientation.observe(self, function (handle, attr, value) {

   var ori
     ;

   if (!_inUpdate && (handle === _object)) {

      ori = value.toEuler();
      _heading.value (ori[0] * (180 / Math.PI));

      self.log.warn("ori: " + ori);
   }
});

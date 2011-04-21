var dmz =
       { saeConst: require("saeConst")
       , defs: require("dmz/runtime/definitions")
       , matrix: require("dmz/types/matrix")
       , module: require("dmz/runtime/module")
       , object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       , time: require("dmz/runtime/time")
       , undo: require("inspectorUndo")
       , vector: require("dmz/types/vector")
       }
  // Constants
  , CarrierType = dmz.objectType.lookup("Carrier")
  , TrunRate = Math.PI * 0.5
  , Speed = 50
  , Forward = dmz.vector.Forward
  , Right = dmz.vector.Right
  , Up = dmz.vector.Up
  , StartDir = dmz.matrix.create().fromAxisAndAngle(Up, Math.PI)
  // Functions
  , _rotate
  , _newOri
  // Variables
  , _carriers = { list: {} }
  ;

(function () {

})();

dmz.time.setRepeatingTimer(self, function (Delta) {

});

dmz.module.subscribe(self, "objectInit", function (Mode, module) {

   if (Mode === dmz.module.Activate) {

      module.addInit(self, CarrierType, function (handle, type) {

         var obj = { handle: handle };

         _carriers.list[handle] = obj;
         _carriers.count += 1;

         dmz.object.orientation(handle, null, StartDir);
//         dmz.object.velocity(handle, null, [0, 0, Speed]);
      });
   }
});

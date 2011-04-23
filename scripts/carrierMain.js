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
  , SpeedAttr = dmz.saeConst.SpeedAttr
  , Forward = dmz.vector.Forward
  , Right = dmz.vector.Right
  , Up = dmz.vector.Up
  , StartDir = dmz.matrix.create().fromAxisAndAngle(Up, 0)
  // Functions
  , _move
  // Variables
  , _carriers = { count: 0, list: {} }
  ;

_move = function (time, obj) {

   var pos = dmz.object.position(obj.handle)
     , ori = dmz.object.orientation(obj.handle)
     , vel
     , speed = dmz.object.scalar(obj.handle, SpeedAttr)
     ;

   vel = ori.transform(Forward).multiply(speed);
   pos = pos.add(vel.multiply(time));

   dmz.object.position(obj.handle, null, pos);
   dmz.object.velocity(obj.handle, null, vel);
   dmz.object.orientation(obj.handle, null, ori);
};

dmz.time.setRepeatingTimer(self, function (time) {

   var keys = Object.keys(_carriers.list)
     ;

   if (time > 0) {

      keys.forEach(function (key) { _move(time, _carriers.list[key]); });
   }
});

dmz.module.subscribe(self, "objectInit", function (Mode, module) {

   if (Mode === dmz.module.Activate) {

      module.addInit(self, CarrierType, function (handle, type) {

         var obj = { handle: handle };

         _carriers.list[handle] = obj;
         _carriers.count += 1;

         dmz.object.scalar(handle, SpeedAttr, 0);
         dmz.object.position(handle, null, [0, 0, 0]);
         dmz.object.orientation(handle, null, StartDir);
         dmz.object.velocity(handle, null, [0, 0, 0]);
      });
   }
});

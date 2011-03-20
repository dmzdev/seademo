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
  , TrunRate = Math.PI * 0.5
  , Speed = 50
  , Forward = dmz.vector.Forward
  , Right = dmz.vector.Right
  , Up = dmz.vector.Up
  // Functions
  , _rotate
  , _newOri
  // Variables
  , _helos = { count: 0, list: {} }
  ;

(function () {

//   _initOS(OSType);
//   _initService(ServiceType);

})();

_rotate = function (time, orig, target) {

   var result = target
   ,   diff = target - orig
   ,   max = time * TurnRate
   ;

   if (diff > Math.PI) { diff -= Math.PI * 2; }
   else if (diff < -Math.PI)  { diff += Math.PI * 2; }

   if (Math.abs(diff) > max) {

      if (diff > 0) { result = orig + max; }
      else { result = orig - max; }
   }

   return result;
};

_newOri = function (obj, time, targetVec) {

   var result = dmz.matrix.create()
     , hvec = dmz.vector.create(targetVec)
     , heading
     , hcross
     , pitch
     , pcross
     , ncross
     , pm
     ;

   hvec.y = 0.0;
   hvec = hvec.normalize();
   heading = Forward.getAngle(hvec);

   hcross = Forward.cross(hvec).normalize();

   if (hcross.y < 0.0) { heading = (Math.PI * 2) - heading; }

   if (heading > Math.PI) { heading = heading - (Math.PI * 2); }
   else if (heading < -Math.PI) { heading = heading + (Math.PI * 2); }

   pitch = targetVec.getAngle(hvec);
   pcross = targetVec.cross(hvec).normalize();
   ncross = hvec.cross(pcross);

   if (ncross.y < 0.0) { pitch = (Math.PI * 2) - pitch; }

   obj.heading = rotate(time, obj.heading, heading);

   obj.pitch = rotate(time, obj.pitch, pitch);

   pm = dmz.matrix.create().fromAxisAndAngle(Right, obj.pitch);

   result = result.fromAxisAndAngle(Up, obj.heading);

   result = result.multiply(pm);

   return result;
};

dmz.object.create.observe(self, function (handle, type) {

   var obj
     ;

   if (type.isOfType(HelicopterType)) {

      obj = { handle: handle };
      _helos.list[handle] = obj;
      _helos.count = _helos.list.length;
   }
});

dmz.object.link.observe(self, dmz.seaConst.NetLink,
function (linkObjHandle, attrHandle, superHandle, subHandle) {

   var obj = _helos.list[superHandle];
   if (obj) { obj.target = subHandle; }
});


dmz.object.unlink.observe(self, dmz.seaConst.NetLink,
function (linkObjHandle, attrHandle, superHandle, subHandle) {

   delete _helos.list[superHandle];
   _helos.count = _helos.list.length;
});

dmz.time.setRepeatingTimer(self, function (Delta) {

   Object.keys(_helos.list).forEach(function(key) {

   });
});

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
  , HelicopterType = dmz.objectType.lookup("Helicopter")
  , TurnRate = (Math.PI * 0.5)
  , Speed = 50
  , Forward = dmz.vector.Forward
  , Right = dmz.vector.Right
  , Up = dmz.vector.Up
  , Lead = self.config.number("target-lead.value", 6)
  // Functions
  , _rotate
  , _newOri
  // Variables
  , _helos =
    { group: []
    , list: []
    }
  , _groups = {}
  ;

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

   obj.heading = _rotate(time, obj.heading, heading);

   obj.pitch = _rotate(time, obj.pitch, pitch);

   pm = dmz.matrix.create().fromAxisAndAngle(Right, obj.pitch);

   result = result.fromAxisAndAngle(Up, obj.heading);

   result = result.multiply(pm);

   return result;
};

dmz.object.create.observe(self, function (handle, type) {

   if (type.isOfType(HelicopterType)) {

      _helos.list[handle] = { handle: handle };
   }
});

dmz.object.link.observe(self, dmz.saeConst.NetLink,
function (linkObjHandle, attrHandle, superHandle, subHandle) {

   var obj = _helos.list[superHandle]
     , group = _helos.group[subHandle]
     ;

   if (obj) {

      obj.target = subHandle;

      if (!group) { group = { list: [] } }

      group.list[superHandle] = obj;
      _helos.group[subHandle] = group;
   }
});


dmz.object.unlink.observe(self, dmz.saeConst.NetLink,
function (linkObjHandle, attrHandle, superHandle, subHandle) {

   var group = _helos.group[subHandle];
   if (group) { delete group.list[superHandle]; }
   delete _helos.list[superHandle];
});

dmz.time.setRepeatingTimer(self, function (Delta) {

   var group
     ;

   Object.keys(_helos.group).forEach(function(groupKey) {

      group = _helos.group[groupKey];

      Object.keys(group.list).forEach(function(key) {

         var obj = group.list[key]
           , handle = obj.handle
           , pos = dmz.object.position(handle)
           , vel = dmz.object.velocity(handle)
           , ori = dmz.object.orientation(handle)
           , origPos
           , offset
           , speed
           , targetPos
           , targetOri
           , targetDir
           , distance
           ;

         if (obj.target) {

            targetPos = dmz.object.position(obj.target);
            targetOri = dmz.object.orientation(obj.target);

            if (!targetOri) { targetOri = dmz.matrix.create(); }
            if (!vel) { vel = dmz.vector.create(0.0, 1.0, 0.0); }

            self.log.error("targetPos: " + targetPos);
            self.log.error("targetOri: " + targetOri);

            if (targetPos && targetOri) {

               targetPos = targetPos.add(targetOri.transform(Forward.multiplyConst(Lead)));
               offset = targetPos.subtract(pos);
               targetDir = offset.normalize();

               ori = _newOri(obj, Delta, targetDir);

               distance = offset.magnitude ();

               if (!speed) { speed = vel.magnitude(); }

               if (ori) { obj.dir = ori.transform(Forward); }

               vel = obj.dir.multiplyConst(speed);

               origPos = pos;
               pos = pos.add(vel.multiplyConst(Delta));

               dmz.object.position(handle, null, pos);
               if (ori) { dmz.object.orientation(handle, null, ori); }
               dmz.object.velocity(handle, null, vel);
            }
         }
      });
   });
});

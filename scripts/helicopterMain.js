var _ = require("underscore")._;

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
  , TurnRate = 2 * Math.PI
  , Speed = 200
  , Forward = dmz.vector.Forward
  , Right = dmz.vector.Right
  , Up = dmz.vector.Up
  , StartDir = dmz.matrix.create().fromAxisAndAngle(Up, 0)
  , TargetDelta = self.config.number("target.delta.value", 10)
  , TargetOffset = self.config.number("target.offset.value", 1000)
  // Functions
  , _rotate
  , _move
  , _newOri
  , _newHeading
  , _nextTarget
  , _targetPosition
  // Variables
  , _helos =
    { group: []
    , list: []
    }
  , _groups = {}
  , _targets =
     { list:
        [ dmz.vector.create(0.5, 0.0, 0.0)
        , dmz.vector.create(-0.5, 0.0, -0.5)
        , dmz.vector.create(0.5, 0.0, -1.0)
         , dmz.vector.create(-0.5, 0.0, -0.5)
        ]
     , scale: dmz.vector.create(1000, 1, 400)
     }
  ;

var _dump = function (obj) { self.log.error(JSON.stringify(obj)); };

_nextTarget = function (obj) {

   obj.target += 1;
   if (obj.target === _targets.list.length) { obj.target = 0; }
};

_targetPosition = function (obj) {

   var masterPos = dmz.object.position(obj.master) || dmz.vector.create()
     , masterOri = dmz.object.orientation(obj.master) || dmz.matrix.create()
     , targetPos = _targets.list[obj.target].copy()
     , scale = _targets.scale
     , pos
     ;

   targetPos.setXYZ(targetPos.x * scale.x, targetPos.y * scale.y, targetPos.z * scale.z);

   pos = masterPos.add(masterOri.transform(Forward.multiplyConst(TargetOffset)));

   pos = pos.add(masterOri.transform(targetPos));

   dmz.object.position(obj.icon, null, pos);

   return pos;
};

_newHeading = function (time, dir, ori) {

   var cdir = ori.transform(dmz.vector.Forward)
     , tdir = dir.copy()
     , max = time * TurnRate
     , angle
     , sign = 1
     , result
     ;

   cdir.y = 0;
   cdir = cdir.normalize();

   tdir.y = 0;
   tdir = tdir.normalize();

   if (!cdir.isZero() && !tdir.isZero()) {

      angle = cdir.getSignedAngle(tdir);

      if (angle < 0) { sign = -1; angle = -angle; }

      if (angle > (max)) { angle = max; }

      angle = (angle * sign) + dmz.vector.Forward.getSignedAngle(cdir);

      result = dmz.matrix.create().fromAxisAndAngle(dmz.vector.Up, angle);
   }
   else { result = ori; }

   return result;
};

_move = function (time, obj) {

   var pos = dmz.object.position(obj.handle)
     , ori = dmz.object.orientation(obj.handle)
     , vel = dmz.object.velocity(obj.handle)
     , target = _targetPosition(obj)
     , dir
     , delta
     ;

   dir = target.subtract(pos);

   ori = _newHeading(time, dir, ori);

   vel = ori.transform(Forward).multiply(Speed);
   pos = pos.add(vel.multiply(time));

   delta = pos.subtract(target).magnitude();
   if (delta < TargetDelta) { _nextTarget(obj); }

   dmz.object.position(obj.handle, null, pos);
   dmz.object.velocity(obj.handle, null, vel);
   dmz.object.orientation(obj.handle, null, ori);
};

dmz.object.link.observe(self, dmz.saeConst.NetLink,
function (linkObjHandle, attrHandle, superHandle, subHandle) {

   var obj = _helos.list[superHandle]
     , group = _helos.group[subHandle]
     ;

   if (obj) {

      obj.master = subHandle;
      obj.target = 0;

      if (!obj.icon) {

         obj.icon = dmz.object.create("Target");
         dmz.object.activate(obj.icon);
      }

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

         if (Delta > 0) { _move(Delta, group.list[key]); }
      });
   });
});

dmz.module.subscribe(self, "objectInit", function (Mode, module) {

   if (Mode === dmz.module.Activate) {

      module.addInit(self, HelicopterType, function (handle, type) {

         var obj =
            { handle: handle
            , master: 0
            , target: 0
            }
            ;

         _helos.list[handle] = obj;

         dmz.object.orientation(handle, null, StartDir);
         dmz.object.velocity(handle, null, [0, 0, 0]);
      });
   }
});


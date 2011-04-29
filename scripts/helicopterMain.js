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
       , util: require("dmz/types/util")
       }
  // Constants
  , HelicopterType = dmz.objectType.lookup("Helicopter")
  , CarrierType = dmz.objectType.lookup("Carrier")
  , TurnRate = Math.PI * 2
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
  , _update
  , _start
  , _stop
  , _newOri
  , _newHeading
  , _nextTarget
  , _targetPosition
  , _updateOffsets
  // Variables
  , _exports = {}
  , _helos = []
  , _carrier
  , _path =
    // Back and Forth
    [ dmz.vector.create([0.5, 0.0, 0.0])
    , dmz.vector.create([-0.5, 0.0, 0.0])
    ]
//    // Sideways V
//    [ dmz.vector.create([-0.5, 0.0, 0.0])
//    , dmz.vector.create([0.5, 0.0, -0.5])
//    , dmz.vector.create([-0.5, 0.0, 0.0])
//    , dmz.vector.create([0.5, 0.0, 0.5])
//    ]
//    // Box
//    [ dmz.vector.create([0.5, 0.0, 0.0])
//    , dmz.vector.create([0.5, 0.0, -0.5])
//    , dmz.vector.create([-0.5, 0.0, -0.5])
//    , dmz.vector.create([-0.5, 0.0, 0.0])
//    , dmz.vector.create([-0.5, 0.0, 0.5])
//    , dmz.vector.create([0.5, 0.0, 0.5])
//    ]
  , _pathWidth = 1000
  , _pathHeight = 500
  , _sim
  ;

var _dump = function (obj) { self.log.error(JSON.stringify(obj)); };

(function () {

   var x
     , y
     , r = 1
     , theta = 0
     , TwoPi = 2 * Math.PI
     , list = []
     ;

   for (theta = 0; theta < TwoPi; theta += 0.5) {

      x = r * Math.cos(theta);
      y = r * Math.sin(theta);

      list.push(dmz.vector.create(x, 0, y));
   }

//   _path = list;
//   _pathWidth = 400;
//   _pathHeight = 200;
})();

_nextTarget = function (obj) {

   dmz.object.addToCounter(obj.handle, dmz.saeConst.TargetAttr, 1);
   dmz.object.position(obj.handle, dmz.saeConst.TargetAttr, _targetPosition(obj));
};

_targetPosition = function (obj) {

   var shipPos = dmz.object.position(_carrier) || dmz.vector.create()
     , shipOri = dmz.object.orientation(_carrier) || dmz.matrix.create()
     , offset = dmz.object.vector(obj.handle, dmz.saeConst.OffsetAttr)
     , target = dmz.object.counter(obj.handle, dmz.saeConst.TargetAttr)
     , targetPos = _path[target].copy()
     , pos
     ;

   targetPos.setXYZ(targetPos.x * _pathWidth, targetPos.y, targetPos.z * _pathHeight);

   pos = shipPos.add(shipOri.transform(offset));

   pos = pos.add(shipOri.transform(targetPos));

   dmz.object.position(obj.icon, null, pos);

   return pos;
};

_updateOffsets = function (group) {

   var offsetX = ((group.count - 1) / 2);

   Object.keys(group.list).forEach(function (key) {

      var obj = group.list[key];
      obj.dx = -offsetX + (obj.slot - 1);
   });
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

   var handle = obj.handle
     , pos = dmz.object.position(handle)
     , ori = dmz.object.orientation(handle)
     , vel = dmz.object.velocity(handle)
     , target = dmz.object.position(handle, dmz.saeConst.TargetAttr)
     , speed = dmz.object.scalar(handle, dmz.saeConst.SpeedAttr)
     , offset = target.subtract(pos)
     , distance = offset.magnitude()
     , delta = distance
     , max = time * speed
     ;

   if (delta > max) { delta = max; }
   offset = offset.normalize();

//   self.log.warn("distance: " + distance);
   pos = pos.add(offset.multiply(delta));

   if (dmz.util.isZero(distance)) { _nextTarget(obj); }

   ori = _newHeading(time, offset, ori);

//   vel = ori.transform(Forward).multiply(speed);
//   pos = pos.add(vel.multiply(time));

//   delta = pos.subtract(target).magnitude();

//   if (distance < TargetDelta) { _nextTarget(obj); }

   dmz.object.position(handle, null, pos);
   dmz.object.orientation(handle, null, ori);
   dmz.object.velocity(handle, null, offset.multiply(speed));
};

_update = function (time) {

   var keys = Object.keys(_helos);

   if (time > 0) {

      keys.forEach(function(key) { _move(time, _helos[key]); });
   }
};

_start = function () {

   var keys = Object.keys(_helos);

   keys.forEach(function(key) {

      var obj = _helos[key]
        , startPos = dmz.object.position(obj.handle, dmz.saeConst.StartAttr)
        , target = dmz.object.position(_carrier) || dmz.vector.create()
        , offset = startPos.subtract(target)
        , speed = Speed + dmz.util.randomInt(5, 25)
        ;

      dmz.object.position(obj.handle, null, startPos);
      dmz.object.vector(obj.handle, dmz.saeConst.OffsetAttr, offset);
      dmz.object.scalar(obj.handle, dmz.saeConst.SpeedAttr, speed);

      dmz.object.position(obj.handle, dmz.saeConst.TargetAttr, _targetPosition(obj));
   });
};

_stop = function () {

};

dmz.object.create.observe(self, function (handle, type) {

   if (type.isOfType(CarrierType)) {

      if (dmz.object.hil()) { dmz.object.flag(handle, dmz.object.HILAttribute, false); }

      _carrier = handle;
      dmz.object.flag(handle, dmz.object.HILAttribute, true);
   }
});

dmz.object.position.observe(self, function (handle, attr, pos){


   var type = dmz.object.type(handle)
     , obj
     , ship
     , offset
//     , speed = Speed + dmz.util.randomInt(5, 25)
     ;

   if (type.isOfType(HelicopterType)) {

      if (_sim && !_sim.control.isRunning()) {

         ship = dmz.object.position(_carrier) || dmz.vector.create([0 ,0 ,0])
         offset = pos.subtract(ship)

         dmz.object.position(handle, dmz.saeConst.StartAttr, pos);
         dmz.object.vector(handle, dmz.saeConst.OffsetAttr, offset);
//         dmz.object.scalar(obj.handle, dmz.saeConst.SpeedAttr, speed);
         _targetPosition(_helos[handle]);
      }
   }
});

dmz.module.subscribe(self, "objectInit", function (Mode, module) {

   if (Mode === dmz.module.Activate) {

      module.addInit(self, HelicopterType, function (handle, type) {

         var obj =
            { handle: handle
            , master: _carrier
            , offset: dmz.vector.create()
            , target: 0
            , slot: 0
            , dx: 0
            }
            ;

         _helos[handle] = obj;

         obj.icon = dmz.object.create("Target");
         dmz.object.activate(obj.icon);

//         dmz.object.position(handle, null, [0, 0, -1000]);

         dmz.object.orientation(handle, null, StartDir);
         dmz.object.velocity(handle, null, [0, 0, 0]);
         dmz.object.position(handle, dmz.saeConst.StartAttr, dmz.object.position(handle));
         dmz.object.vector(handle, dmz.saeConst.OffsetAttr, [0, 0 ,0]);
         dmz.object.scalar(handle, dmz.saeConst.SpeedAttr, 0);
         dmz.object.counter(handle, dmz.saeConst.TargetAttr, 0);
         dmz.object.counter.min(handle, dmz.saeConst.TargetAttr, 0);
         dmz.object.counter.max(handle, dmz.saeConst.TargetAttr, _path.length-1);
         dmz.object.counter.rollover(handle, dmz.saeConst.TargetAttr, true);
         dmz.object.position(handle, dmz.saeConst.TargetAttr, _targetPosition(obj));
      });
   }
});

dmz.module.subscribe(self, "simulation", function (Mode, module) {

   if (Mode === dmz.module.Activate) {

      _sim = module;
      _sim.start(self, _start);
      _sim.timeSlice(self, _update);
      _sim.stop(self, _stop);
   }
});

var dmz =
       { file: require("dmz/system/file")
       , messaging: require("dmz/runtime/messaging")
       , module: require("dmz/runtime/module")
       , vector: require("dmz/types/vector")
       }
  // Constants
  , MaxDelta = 1.0
  // Functions
  , _rayEllipsoidIntersect
  // Variables
  , _sim
  , _deltaTime = 0
  , _capture = false
  , _row = 1
  ;

_rayEllipsoidIntersect = function (ray_origin, ray_normal, ellipsoid_origin, ellipsoid_radius) {

   var result = 0
     , a
     , b
     , c
     , d
     ;

   self.log.warn(ray_origin);
//   ray_origin = ray_origin.subtract(ellipsoid_origin);
   self.log.warn(ray_origin);
//   ray_normal = ray_normal.normalise();

   a = ((ray_normal.x*ray_normal.x)/(ellipsoid_radius.x*ellipsoid_radius.x))
     + ((ray_normal.y*ray_normal.y)/(ellipsoid_radius.y*ellipsoid_radius.y))
     + ((ray_normal.z*ray_normal.z)/(ellipsoid_radius.z*ellipsoid_radius.z));
   self.log.warn("a: " + a);

   b = ((2*ray_origin.x*ray_normal.x)/(ellipsoid_radius.x*ellipsoid_radius.x))
     + ((2*ray_origin.y*ray_normal.y)/(ellipsoid_radius.y*ellipsoid_radius.y))
     + ((2*ray_origin.z*ray_normal.z)/(ellipsoid_radius.z*ellipsoid_radius.z));
   self.log.warn("b: " + ray_origin.x);
   self.log.warn("b: " + ray_normal.x);
   self.log.warn("b: " + (2*ray_origin.x*ray_normal.x));

   c = ((ray_origin.x*ray_origin.x)/(ellipsoid_radius.x*ellipsoid_radius.x))
     + ((ray_origin.y*ray_origin.y)/(ellipsoid_radius.y*ellipsoid_radius.y))
     + ((ray_origin.z*ray_origin.z)/(ellipsoid_radius.z*ellipsoid_radius.z))
     - 1;
   self.log.warn("c: " + c);

   d = ((b*b)-(4*a*c));

   self.log.warn("d: " + d);

   if ( d >= 0 ) { result = 1; }

   return result;
}

dmz.module.subscribe(self, "simulation", function (Mode, module) {

   if (Mode === dmz.module.Activate) {

      module.start(self, function () {

         _capture = true;
         module.log("*** Start Data Capture: " + new Date)
      });

      module.stop(self, function () {

         _capture = false;
         module.log("*** Stop Data Capture: " + new Date)
         module.saveLog("dump.csv");
      });

      module.timeSlice(self, function (time) {

         var value = 0
           , ray = dmz.vector.create(0, 0, -1)
           , normal = dmz.vector.create(0, 1, 0)
           , obj = dmz.vector.create(0, 0, -10)
           , radius = dmz.vector.create(1, 1, 1)
           ;

         _deltaTime += time;

         if (_deltaTime > MaxDelta) {

            value = _rayEllipsoidIntersect (ray, normal, obj, radius);

            module.log (_row + "," + value + ", collecting, date, here, " + new Date);

            _row += 1;
            _deltaTime = 0;
         }
      });
   }
});

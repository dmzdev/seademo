var dmz =
       { seaConst: require("seaConst")
       , file: require("dmz/system/file")
       , module: require("dmz/runtime/module")
       , vector: require("dmz/types/vector")
       , objectType: require("dmz/runtime/objectType")
       , object: require("dmz/components/object")
       , util: require("dmz/types/util")
       , graphlib: require("dmz/types/graph")
       , ui:
          { loader: require("dmz/ui/uiLoader")
          , mainWindow: require("dmz/ui/mainWindow")
          , consts: require("dmz/ui/consts")
          }
       }
  // UI Stuff
  , GraphForm = dmz.ui.loader.load("GraphForm")
  , GraphDock = dmz.ui.mainWindow.createDock
     ( "Graph"
     , { area: dmz.ui.consts.BottomDockWidgetArea
       , allowedAreas: [dmz.ui.consts.BottomDockWidgetArea, dmz.ui.consts.TopDockWidgetArea]
       , floating: true
       , visible: true
       }
     , GraphForm
     )
  , graphView = dmz.graphlib.createXYGraph
     ( GraphForm.lookup("graphicsView")
     , 0
     , 10
     , "Time"
     , "Coverage"
     , 90
     , false
     , { r: 0, b: 0, g: 0.1 }
     , { r: 0, b: 0, g: 0.9 }
     , 1
     )
  // Constants
  , MaxDelta = 1.0
  , ToRads = Math.PI / 180
  , ToDegs = 1 / ToRads
  , ViewDist = 100000
  , ViewStartAngle = 0
  , ViewSpanAngle = 180
  , DeltaAngle = 1
  , CarrierType = dmz.objectType.lookup("Carrier")
  , SensorType = dmz.objectType.lookup("Sensor")
  // Functions
  , _sphereLineIntersection
  , _intersectTargets
  // Variables
  , _deltaTime = 0
  , _totalTime = 0
  , _capture = false
  , _row = 1
  , _source = 0
  , _targets = []
  , _graphData = []
  ;

_sphereLineIntersection = function (x1, y1, x2, y2, x3, y3, radius) {

   var u
     , px
     , py
     , x
     , y
     , dist
     , result = 0
     ;

   u = ((x3-x1)*(x2-x1) + (y3-y1)*(y2-y1)) / ((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));

   if (u >= 0 && u <= 1) {

      px = x1 + (x2-x1) * u;
      py = y1 + (y2-y1) * u;

      x = x3 - px;
      y = y3 - py;

      dist = Math.sqrt(x*x + y*y);

      if (dist < radius) { result = 1; }
   }

   return result;
};

_intersectTargets = function (x1, y1, x2, y2) {

   var len = _targets.length
     , ix = 0
     , pos
     , result
     , x3
     , y3
     , r
     ;

   for (ix = 0; ix < len; ix++) {

      r = dmz.object.scalar(_targets[ix], dmz.seaConst.RadiusAttr);
      pos = dmz.object.position(_targets[ix]);
      x3 = pos.x;
      y3 = -pos.z;

      result = _sphereLineIntersection(x1, y1, x2, y2, x3, y3, r);
      if(result) { break; }
   }

   return result;
};

GraphForm.observe(self, "exportButton", "clicked", function (button) {

   self.log.warn ("Export");
   graphView.export(button);
});

dmz.object.create.observe(self, function (handle, type) {

   if (type.isOfType(CarrierType)) { _source = handle; }
   else if (type.isOfType(SensorType)) { _targets.push(handle); }
});

dmz.module.subscribe(self, "simulation", function (Mode, module) {

   if (Mode === dmz.module.Activate) {

      module.start(self, function () {

         _capture = true;
         _row = 0;
         _totalTime = 0;
         _deltaTime = 0;
         _graphData = [];

         module.log("*** Start Data Capture: " + new Date)
      });

      module.stop(self, function () {

         _capture = false;
         module.log("*** Stop Data Capture: " + new Date)

//         var homeDir = "/Users/Shared/";
//         if (dmz.file.valid(homeDir)) { module.saveLog(homeDir + "seadump.csv"); }

         graphView.update
            ( function (ix, list) { return list[ix]; }
            , function (ix, list, value) { return Math.round(value * 100).toString(); }
             , _graphData
         );
      });

//      module.reset(self, function () {

//      });

      module.timeSlice(self, function (time) {

         var values = []
           , source
           , result
           , vx
           , vy
           , x1
           , y1
           , x2
           , y2
           , angle
           , total = 0
           ;

         _deltaTime += time;

         if ((_deltaTime > MaxDelta) && _source) {

            _totalTime += _deltaTime;

            source = dmz.object.position(_source) || dmz.vector.create(0,0,0);

            x1 = source.x;
            y1 = -source.z;

            values.push(_row);
            values.push(_totalTime);
//            _graphData.push(_totalTime);

            for (angle = ViewStartAngle; angle <= ViewSpanAngle; angle += DeltaAngle) {

               vx = ViewDist * Math.cos((180 - angle) * ToRads);
               vy = ViewDist * Math.sin((180 - angle) * ToRads);

               x2 = x1 + vx;
               y2 = y1 + vy;

               result = _intersectTargets(x1, y1, x2, y2);

               values.push(result);
               total += result;
            }

            values.push(total);
            values.push(total/(ViewSpanAngle/DeltaAngle));

            _graphData.push(total/(ViewSpanAngle/DeltaAngle));

//            graphView.update
//               ( function (ix, list) { return list[ix]; }
//               , function (ix, list, value) { return Math.round(value * 100).toString(); }
//               , _graphData
//            );

//            module.log (_graphData.join(","));
            module.log (values.join(","));

            _row += 1;
            _deltaTime = 0;
         }
      });
   }
});

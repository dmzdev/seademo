var dmz =
       { file: require("dmz/system/file")
       , messaging: require("dmz/runtime/messaging")
       , module: require("dmz/runtime/module")
       }
  // Constants
  , MaxDelta = 0.5
  // Functions
  , _save
  // Variables
  , _sim
  , _deltaTime = 0
  , _capture = false
  , _row = 1
  ;

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

         _deltaTime += time;

         if (_deltaTime > MaxDelta) {

            module.log (_row + ", collecting, date, here, " + new Date);

            _row += 1;
            _deltaTime = 0;
         }
      });
   }
});

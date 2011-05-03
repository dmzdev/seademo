var dmz =
       { seaConst: require("seaConst")
       , object: require("dmz/components/object")
       , module: require("dmz/runtime/module")
       , script: require("dmz/runtime/script")
       }
  // Constants
  // Functions
  , _findInit
  // Variables
  , _exports = {}
  , _table = {}
  , _count = 1
  ;


_findInit = function (type) {

   var result
     ;

   while (type && !result) {

      result = _table[type.name()];
      type = type.parent();
   }

   return result;
};

dmz.object.create.observe(self, function (handle, type) {

   var init = _findInit(type);

   if (init) {

      Object.keys(init.func).forEach(function(key) {

         var func = init.func[key];
         if (func) { func(handle, type); }
      });
   }
});

dmz.script.observe(self, function (name) {

   Object.keys(_table).forEach(function(key) {

      var init = _table[key];
      delete init.func[name];
   });
});

_exports.addInit = function (obj, type, func) {

   if (obj && obj.name && type && func) {

      var init = _table[type.name()]
        ;

      if (!init) {

         init = { func: [], type: type };
         _table[type.name()] = init;
      }

      init.func[obj.name] = func;
   }
};

_exports.counter = function () {

   var result = " " + _count.toString ();
   _count++;
   return result;
};

// Publish module
dmz.module.publish(self, _exports);

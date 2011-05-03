var util = require("dmz/types/util")
  , defs = require("dmz/runtime/definitions")
  ;

util.defineConst(exports, "NetLink", defs.createNamedHandle("Network Link"));
util.defineConst(exports, "EquipmentLink", defs.createNamedHandle("Equipment Link"));
util.defineConst(exports, "NameAttr", defs.createNamedHandle("Name"));
util.defineConst(exports, "RadiusAttr", defs.createNamedHandle("Radius"));
util.defineConst(exports, "TargetAttr", defs.createNamedHandle("Target"));
util.defineConst(exports, "StartAttr", defs.createNamedHandle("Start"));
util.defineConst(exports, "SpeedAttr", defs.createNamedHandle("Speed"));
util.defineConst(exports, "OffsetAttr", defs.createNamedHandle("Offset"));
util.defineConst(exports, "Select", defs.lookupState("Selected"));
util.defineConst(exports, "NoLink", defs.lookupState("No Linking"));

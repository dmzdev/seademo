var util = require("dmz/types/util")
  , defs = require("dmz/runtime/definitions")
  ;

util.defineConst(exports, "NetLink", defs.createNamedHandle("Network Link"));
util.defineConst(exports, "NameAttr", defs.createNamedHandle("Name"));
util.defineConst(exports, "TargetAttr", defs.createNamedHandle("Target"));
util.defineConst(exports, "Select", defs.lookupState("Selected"));
util.defineConst(exports, "NoLink", defs.lookupState("No Linking"));

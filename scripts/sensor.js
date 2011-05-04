var dmz =
       { seaConst: require("seaConst")
       , object: require("dmz/components/object")
       , objectType: require("dmz/runtime/objectType")
       }
  // Constants
  , HelicopterType = dmz.objectType.lookup("Helicopter")
  , SensorType = dmz.objectType.lookup("Sensor")
  // Functions
  // Variables
  ;

dmz.object.create.observe(self, function (handle, type) {

   if (type.isOfType(HelicopterType)) {

      var sensor = dmz.object.create(SensorType);
      dmz.object.position(sensor, null, dmz.object.position(handle));
      dmz.object.scalar(sensor, dmz.seaConst.RadiusAttr, 400);
      dmz.object.activate(sensor);

      dmz.object.link(dmz.seaConst.EquipmentLink, handle, sensor);
   }
});

dmz.object.unlink.observe(self, dmz.seaConst.EquipmentLink,
function (link, attr, superHandle, subHandle) {

   dmz.object.destroy(subHandle);
});

dmz.object.position.observe(self, function (handle, attr, pos){

   var type = dmz.object.type(handle)
     , links
     ;

     if (type.isOfType(HelicopterType)) {

        links = dmz.object.subLinks (handle, dmz.seaConst.EquipmentLink);
        if (links) { dmz.object.position(links[0], null, pos); }
     }
});

dmz.object.orientation.observe(self, function (handle, attr, ori){

   var type = dmz.object.type(handle)
     , links
     ;

     if (type.isOfType(HelicopterType)) {

        links = dmz.object.subLinks (handle, dmz.seaConst.EquipmentLink);
        if (links) { dmz.object.orientation(links[0], null, ori); }
     }
});

dmz.object.velocity.observe(self, function (handle, attr, vec){

   var type = dmz.object.type(handle)
     , links
     ;

     if (type.isOfType(HelicopterType)) {

        links = dmz.object.subLinks (handle, dmz.seaConst.EquipmentLink);
        if (links) { dmz.object.velocity(links[0], null, vec); }
     }
});

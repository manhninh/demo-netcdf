export var getDirection = function getDirection(uMs, vMs, angleConvention) {
  if (angleConvention.endsWith("CCW")) {
    vMs = vMs > 0 ? (vMs = -vMs) : Math.abs(vMs);
  }

  var velocityAbs = Math.sqrt(Math.pow(uMs, 2) + Math.pow(vMs, 2));
  var velocityDir = Math.atan2(uMs / velocityAbs, vMs / velocityAbs);
  var velocityDirToDegrees = (velocityDir * 180) / Math.PI + 180;

  if (angleConvention === "bearingCW" || angleConvention === "meteoCCW") {
    velocityDirToDegrees += 180;
    if (velocityDirToDegrees >= 360) velocityDirToDegrees -= 360;
  }

  return velocityDirToDegrees;
};

export var getSpeed = function getSpeed(uMs, vMs, unit) {
  var velocityAbs = Math.sqrt(Math.pow(uMs, 2) + Math.pow(vMs, 2));

  if (unit === "k/h") {
    return meterSec2kilometerHour(velocityAbs);
  } else if (unit === "kt") {
    return meterSec2Knots(velocityAbs);
  } else {
    return velocityAbs;
  }
};

var meterSec2Knots = function meterSec2Knots(meters) {
  return meters / 0.514;
};

var meterSec2kilometerHour = function meterSec2kilometerHour(meters) {
  return meters * 3.6;
};

export function xmlToJson(xml) {
  // Create the return object
  var obj = {};

  if (xml.nodeType == 1) {
    // element
    // do attributes
    if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
      for (var j = 0; j < xml.attributes.length; j++) {
        var attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType == 3) {
    // text
    obj = xml.nodeValue;
  }

  // do children
  // If all text nodes inside, get concatenated text from them.
  var textNodes = [].slice.call(xml.childNodes).filter(function (node) {
    return node.nodeType === 3;
  });
  if (xml.hasChildNodes() && xml.childNodes.length === textNodes.length) {
    obj = [].slice.call(xml.childNodes).reduce(function (text, node) {
      return text + node.nodeValue;
    }, "");
  } else if (xml.hasChildNodes()) {
    for (var i = 0; i < xml.childNodes.length; i++) {
      var item = xml.childNodes.item(i);
      var nodeName = item.nodeName;
      if (typeof obj[nodeName] == "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof obj[nodeName].push == "undefined") {
          var old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
}

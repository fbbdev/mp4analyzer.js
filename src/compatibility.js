/**
 * @param {Object} object
 * @private
 */
function proxyWebkitProperties(object) {
  var isWebkit = /^webkit/;
  Object.getOwnPropertyNames(object.prototype).forEach(function(property) {
    if (isWebkit.test(property)) {
      Object.defineProperty(object.prototype, property[6].toLowerCase() + property.slice(7), {
        get: function() { return this[property]; },
        set: function(value) { this[property] = value; }
      });
    }
  });
}

/**
 * Check for File API
 * @return {boolean}
 */
function checkFileAPI() {
  window['Blob'] = window['Blob'] || window['webkitBlob'] || undefined;
  window['File'] = window['File'] || window['webkitFile'] || undefined;
  window['FileReader'] = window['FileReader'] || window['webkitFileReader'] || undefined;

  if (Blob && File && FileReader) {
    proxyWebkitProperties(window['Blob']);
    proxyWebkitProperties(window['File']);
    proxyWebkitProperties(window['FileReader']);

    return true;
  } else {
    return false;
  }
}

/**
 * Check for DataView API
 * @return {boolean}
 */
function checkDataViewAPI() {
  window['DataView'] = window['DataView'] || window['webkitDataView'] || undefined;

  if (DataView) {
    proxyWebkitProperties(window['DataView']);

    return true;
  } else {
    return false;
  }
}

MP4.Compatibility = { FileAPI: checkFileAPI, DataViewAPI: checkDataViewAPI };

if (!MP4.Compatibility.FileAPI() || !MP4.Compatibility.DataViewAPI()) {
  window['MP4'] = { 'supported': false, 'analyze': function() { return false; } };
} else {

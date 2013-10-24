/**
 * @param {Object} object
 * @private
 */
function proxyWebkitMethods(object) {
  var isWebkit = /^webkit/;
  Object.getOwnPropertyNames(object.prototype).forEach(function(method) {
    if (isWebkit.test(method)) {
      object.prototype[method[6].toLowerCase()+method.slice(7)] = object.prototype[method];
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
    proxyWebkitMethods(window['Blob']);
    proxyWebkitMethods(window['File']);
    proxyWebkitMethods(window['FileReader']);

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
    proxyWebkitMethods(window['DataView']);

    return true;
  } else {
    return false;
  }
}

MP4.Compatibility = { FileAPI: checkFileAPI, DataViewAPI: checkDataViewAPI };

if (!MP4.Compatibility.FileAPI() || !MP4.Compatibility.DataViewAPI()) {
  // Incompatible browser
} else {

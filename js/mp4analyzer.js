(function() {
'use strict';
var MP4 = {
  Compatibility: {},
  Tags: {},
  Atoms: {}
};
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
Blob.prototype.pos = 0;

/** @const */ Blob.SEEK_SET = 1;
/** @const */ Blob.SEEK_CUR = 2;
/** @const */ Blob.SEEK_END = 3;

/**
 * @param {number} offset
 * @param {number} origin
 */
Blob.prototype.seek = function(offset, origin) {
  origin = origin || Blob.SEEK_SET;

  if (origin === Blob.SEEK_SET) {
    this.pos = offset;
  } else if (origin === Blob.SEEK_CUR) {
    this.pos += offset;
  } else if (origin === Blob.SEEK_END) {
    this.pos = this.size + offset;
  }

  this.pos = Math.min(Math.max(this.pos, 0), this.size);
};

/**
 * @param {number} offset
 */
Blob.prototype.skip = function(offset) {
  this.pos += offset;
  if (this.pos > this.size) this.pos = this.size;
};
Blob.prototype.rewind = function() { this.pos = 0; };
Blob.prototype.tell = function() { return this.pos; };
Blob.prototype.eof = function() { return this.pos === this.size; }

/**
 * @param {number} length
 */
Blob.prototype.poll = function(length) {
  return this.slice(this.pos, this.pos+length);
};

/**
 * @param {number} length
 */
Blob.prototype.read = function(length) {
  var data = this.poll(length);
  this.pos += data.size;
  return data;
};
/**
 * Track context
 * @constructor
 * @struct
 */
MP4.Track = function() {
  /** @type {?string} */
  this.type = null;
  /** @type {?string} */
  this.subtype = null;
  /** @type {?string} */
  this.codec = null;
};

/**
 * Analyzer context
 * @constructor
 * @struct
 */
MP4.Context = function() {
  /**
   * Parent atom type
   * @type {?string}
   */
  this.parent = null;
  /** @type {?MP4.Track} */
  this.currentTrack = null;

  /** @type {?Error} */
  this.error = null;
  /** @type {?MP4.Track} */
  this.video = null;
  /** @type {?MP4.Track} */
  this.audio = null;

  /**
   * Extract useful information from context
   * @return Object.<string, *>
   */
  this.result = function() {
    if (!this.video && !this.audio && !this.error)
      this.error = new Error("Cannot find codec information");

    return {
      'error': this.error,
      'video': this.video && {
        'codec': this.video.codec
      },
      'audio': this.audio && {
        'codec': this.audio.codec
      }
    };
  };
};
/** @enum {number} */
MP4.Tags.Identifiers = {
  ESDescriptor: 0x03,
  DecConfigDescriptor: 0x04
};

/** @type {Object.<number,string>} */
MP4.Tags.ObjectTypes = /** @dict */ {
  0x40: "aac",
  0x66: "aac",
  0x67: "aac",
  0x68: "aac",
  0x69: ".mp3",
  0x6b: ".mp3",
  0xa5: "ac-3",
  0xa9: "dts",
  0xdd: "vorbis"
};

/**
 * MP4 Descriptor tag
 * @param {DataView} data
 * @param {number=} offset
 * @constructor
 */
MP4.Tags.Descriptor = function(data, offset) {
  offset = offset || 0;
  this.type = data.getUint8(offset);
  this.size = 0;
  this.headerSize = 1;
  this.dataSize = 0;

  var count = 4;
  while (this.headerSize++, count--) {
    var c = data.getUint8(offset+1+(3-count));
    this.size = (this.size << 7) | (c & 0x7f);
    if (!(c & 0x80)) break;
  }
};

/**
 * MP4 Elementary Stream Descriptor
 * @param {DataView} data
 * @param {number=} offset
 * @constructor
 * @extends MP4.Tags.Descriptor
 */
MP4.Tags.ESDescriptor = function(data, offset) {
  offset = offset || 0;
  MP4.Tags.Descriptor.call(this, data, offset);

  if (this.type !== MP4.Tags.Identifiers.ESDescriptor) {
    this.dataSize = this.size-this.headerSize;
    return;
  }

  offset += this.headerSize;
  this.dataSize = 3; // = [id (2 bytes)]+[flags (2 bytes)]

  var flags = data.getUint8(offset+2);

  if (flags & 0x80) this.dataSize += 2;
  if (flags & 0x40) this.dataSize += 1+data.getUint8(offset+this.dataSize);
  if (flags & 0x20) this.dataSize += 2;
};

/**
 * MP4 Decoder Configuration Descriptor
 * @param {DataView} data
 * @param {number=} offset
 * @constructor
 * @extends MP4.Tags.Descriptor
 */
MP4.Tags.DecConfigDescriptor = function(data, offset) {
  offset = offset || 0;
  MP4.Tags.Descriptor.call(this, data, offset);

  if (this.type !== MP4.Tags.Identifiers.DecConfigDescriptor) {
    this.objectType = null;
    this.dataSize = this.size-this.headerSize;
    return;
  }

  offset += this.headerSize;
  this.objectType = data.getUint8(offset);
  this.dataSize = 13;
};
/**
 * Atom header
 * @param {DataView} data
 * @param {number=} offset
 * @constructor
 * @struct
 */
MP4.Atoms.Atom = function(data, offset) {
  offset = offset || 0;
  this.size = data.getUint32(offset, false);
  this.type = String.fromCharCode.apply(null, new Uint8Array(data.buffer, offset+4, 4));

  /** @const */
  this.headerSize = 8; // = [size (4 bytes)]+[type (4 bytes)]
  /** @type {number} */
  this.dataSize = 0;
  /** @type {boolean} */
  this.parsed = false;
};

/** @const */
MP4.Atoms.Atom.HeaderSize = 8;

/** @type {Object.<string,{visitor: function(MP4.Atoms.Atom, Blob, MP4.Context, function(MP4.Context)), parsedSize: number, parser: (undefined|function(MP4.Context, DataView, number=) : MP4.Atoms.Atom)}>} */
MP4.Atoms.Map = /** @dict */ {};
/**
 * Read and visit children atoms
 * @param {MP4.Atoms.Atom} parent
 * @param {Blob} blob
 * @param {MP4.Context} context
 * @param {function(MP4.Context)} callback
 * @param {FileReader=} reader
 */
MP4.Atoms.visitChildren = function(parent, blob, context, callback, reader) {
  blob.skip(parent.headerSize+parent.dataSize);
  if (blob.eof()) {
    callback(context);
  } else {
    reader = reader || new FileReader();

    reader.onloadend = function(ev) {
      if (ev.target.readyState === FileReader.DONE) {
        if (ev.target.result.byteLength < MP4.Atoms.Atom.HeaderSize) {
          context.error = new Error("Input data is corrupted or not encoded as mp4/mov");
          callback(context);
          return;
        }

        var data = new DataView(ev.target.result);

        var atom = new MP4.Atoms.Atom(data, 0);
        if (atom.size < atom.headerSize) {
          context.error = new Error("Input data is corrupted or not encoded as mp4/mov");
          callback(context);
          return;
        }

        if (atom.type in MP4.Atoms.Map && MP4.Atoms.Map[atom.type].visitor) {
          context.parent = parent.type;
          MP4.Atoms.Map[atom.type].visitor(atom, blob.read(atom.size), context, function(r) {
            if (!blob.eof())
              reader.readAsArrayBuffer(blob.poll(MP4.Atoms.Atom.HeaderSize));
            else
              callback(context);
          });
        } else {
          blob.skip(atom.size);
          if (!blob.eof())
            reader.readAsArrayBuffer(blob.poll(MP4.Atoms.Atom.HeaderSize));
          else
            callback(context);
        }
      }
    };

    reader.readAsArrayBuffer(blob.poll(MP4.Atoms.Atom.HeaderSize));
  }
}

/**
 * Default atom visitor
 * @param {MP4.Atoms.Atom} atom
 * @param {Blob} blob
 * @param {MP4.Context} context
 * @param {function(MP4.Context)} callback
 */
MP4.Atoms.visitor = function(atom, blob, context, callback) {
  if (atom.type in MP4.Atoms.Map) {
    if (!atom.parsed) {
      if (MP4.Atoms.Map[atom.type].parser) {
        var reader = new FileReader();
        var parsedSize = MP4.Atoms.Map[atom.type].parsedSize == -1 ? atom.size : MP4.Atoms.Map[atom.type].parsedSize;

        reader.onloadend = function(ev) {
          if (ev.target.readyState === FileReader.DONE) {
            if (ev.target.result.byteLength < parsedSize) {
              context.error = new Error("Input data is corrupted or not encoded as mp4/mov");
              callback(context);
              return;
            }

            var data = new DataView(ev.target.result);
            atom = MP4.Atoms.Map[atom.type].parser(context, data, 0);
            MP4.Atoms.visitChildren(atom, blob, context, callback, reader);
          }
        };

        reader.readAsArrayBuffer(blob.poll(parsedSize));
      } else {
        atom.dataSize = MP4.Atoms.Map[atom.type].parsedSize-atom.headerSize;
        MP4.Atoms.visitChildren(atom, blob, context, callback);
      }
    } else {
      MP4.Atoms.visitChildren(atom, blob, context, callback);
    }
  } else {
    callback(context);
  }
};
/**
 * Handler Reference Atom (hdlr)
 * @param {DataView} data
 * @param {number=} offset
 * @constructor
 * @extends MP4.Atoms.Atom
 * @struct
 */
MP4.Atoms.HandlerReference = function(data, offset) {
  offset = offset || 0;
  MP4.Atoms.Atom.call(this, data, offset);
  offset += 12; // += [header (8 bytes)]+[version (1 byte)]+[flags (3 bytes)]

  var typeAndSubtype = String.fromCharCode.apply(null, new Uint8Array(data.buffer, offset, 8)); // = [component type (4 bytes)]+[component subtype (4 bytes)]
  /** @type {string} */
  this.componentType = typeAndSubtype.slice(0,4);
  /** @type {string} */
  this.componentSubtype = typeAndSubtype.slice(4);

  this.dataSize = this.size - this.headerSize;
  this.parsed = true;
}

/**
 * Sample Description Atom (stsd)
 * @param {DataView} data
 * @param {number=} offset
 * @constructor
 * @extends MP4.Atoms.Atom
 * @struct
 */
MP4.Atoms.SampleDescription = function(data, offset) {
  offset = offset || 0;
  MP4.Atoms.Atom.call(this, data, offset);
  offset += 12; // += [header (8 bytes)]+[version (1 byte)]+[flags (3 bytes)]

  /** @type {number} */
  this.entryCount = data.getUint32(offset, false);
  offset += 8; // += [entry count (4 bytes)]+[size of first entry (4 bytes)]
  /** @type {?string} */
  this.firstEntry = (this.entryCount > 0) ? String.fromCharCode.apply(null, new Uint8Array(data.buffer, offset, 4)) : null;

  this.dataSize = 8; // = [flags (3 bytes)]+[entry count (4 bytes)]
  this.parsed = true;
}

/**
 * MP4A Media Data Atom (mp4a)
 * @param {DataView} data
 * @param {number=} offset
 * @constructor
 * @extends MP4.Atoms.Atom
 * @struct
 */
MP4.Atoms.MP4AMediaData = function(data, offset) {
  offset = offset || 0;
  MP4.Atoms.Atom.call(this, data, offset);

  offset += 16; // += [header (8 bytes)]+[reserved (8 bytes)]
  this.dataSize = 16; // = [reserved (8 bytes)]+[version (2 bytes)]+[revision (2 bytes)]+[vendor (4 bytes)]

  var version = data.getUint16(offset, false);

  if (version === 0) this.dataSize += 12;
  else if (version === 1) this.dataSize += 28;
  else if (version === 2) this.dataSize += 48;
  else this.dataSize = this.size - this.headerSize;
  this.parsed = true;
}

/**
 * Elementary Stream Descriptor Atom (esds)
 * @param {DataView} data
 * @param {number=} offset
 * @constructor
 * @extends MP4.Atoms.Atom
 * @struct
 */
MP4.Atoms.ESDescriptor = function(data, offset) {
  offset = offset || 0;
  MP4.Atoms.Atom.call(this, data, offset);

  offset += 12; // += [header (8 bytes)]+[version (4 bytes)]
  this.dataSize = this.size - this.headerSize;

  var tag = new MP4.Tags.ESDescriptor(data, offset);
  offset += tag.headerSize+tag.dataSize;

  tag = new MP4.Tags.DecConfigDescriptor(data, offset);

  this.objectType = tag.objectType;
  this.parsed = true;
}

/** @type {{visitor: function(MP4.Atoms.Atom, Blob, MP4.Context, function(MP4.Context)), parsedSize: number, parser: (undefined|function(MP4.Context, DataView, number=) : MP4.Atoms.Atom)}} */
MP4.Atoms.Map['moov'] = { visitor: MP4.Atoms.visitor, parsedSize: MP4.Atoms.Atom.HeaderSize, parser: undefined };

/** @type {{visitor: function(MP4.Atoms.Atom, Blob, MP4.Context, function(MP4.Context)), parsedSize: number, parser: (undefined|function(MP4.Context, DataView, number=) : MP4.Atoms.Atom)}} */
MP4.Atoms.Map['trak'] = {
  visitor: function(atom, blob, context, callback) {
    context.currentTrack = new MP4.Track();
    MP4.Atoms.visitChildren(atom, blob, context, function(context) {
      if (context.currentTrack.subtype === 'vide' && context.video === null)
        context.video = context.currentTrack;
      else if (context.currentTrack.subtype === 'soun' && context.audio === null)
        context.audio = context.currentTrack;

      context.currentTrack = null;
      callback(context);
    });
  },
  parsedSize: MP4.Atoms.Atom.HeaderSize,
  parser: undefined
};

/** @type {{visitor: function(MP4.Atoms.Atom, Blob, MP4.Context, function(MP4.Context)), parsedSize: number, parser: (undefined|function(MP4.Context, DataView, number=) : MP4.Atoms.Atom)}} */
MP4.Atoms.Map['mdia'] = { visitor: MP4.Atoms.visitor, parsedSize: MP4.Atoms.Atom.HeaderSize, parser: undefined };

/** @type {{visitor: function(MP4.Atoms.Atom, Blob, MP4.Context, function(MP4.Context)), parsedSize: number, parser: (undefined|function(MP4.Context, DataView, number=) : MP4.Atoms.Atom)}} */
MP4.Atoms.Map['hdlr'] = {
  visitor: function(atom, blob, context, callback) {
    if (context.parent === 'mdia') MP4.Atoms.visitor(atom, blob, context, callback);
    else callback(context);
  },
  parsedSize: MP4.Atoms.Atom.HeaderSize + 12, // = [header (8 bytes)]+[version (1 byte)]+[flags (3 bytes)]+[component type (4 bytes)]+[component subtype (4 bytes)]
  parser: function(context, data, offset) {
    var atom = new MP4.Atoms.HandlerReference(data, offset);
    context.currentTrack.type = atom.componentType;
    context.currentTrack.subtype = atom.componentSubtype;
    return atom;
  }
};

/** @type {{visitor: function(MP4.Atoms.Atom, Blob, MP4.Context, function(MP4.Context)), parsedSize: number, parser: (undefined|function(MP4.Context, DataView, number=) : MP4.Atoms.Atom)}} */
MP4.Atoms.Map['minf'] = { visitor: MP4.Atoms.visitor, parsedSize: MP4.Atoms.Atom.HeaderSize, parser: undefined };

/** @type {{visitor: function(MP4.Atoms.Atom, Blob, MP4.Context, function(MP4.Context)), parsedSize: number, parser: (undefined|function(MP4.Context, DataView, number=) : MP4.Atoms.Atom)}} */
MP4.Atoms.Map['stbl'] = { visitor: MP4.Atoms.visitor, parsedSize: MP4.Atoms.Atom.HeaderSize, parser: undefined };

/** @type {{visitor: function(MP4.Atoms.Atom, Blob, MP4.Context, function(MP4.Context)), parsedSize: number, parser: (undefined|function(MP4.Context, DataView, number=) : MP4.Atoms.Atom)}} */
MP4.Atoms.Map['stsd'] = {
  visitor: MP4.Atoms.visitor,
  parsedSize: MP4.Atoms.Atom.HeaderSize + 16, // [header (8 bytes)]+[version (1 byte)]+[flags (3 bytes)]+[entry count (4 bytes)]+[first entry header (8 bytes)]
  parser: function(context, data, offset) {
    var atom = new MP4.Atoms.SampleDescription(data, offset);
    if (atom.entryCount > 0 && atom.firstEntry !== 'mp4a') {
      context.currentTrack.codec = atom.firstEntry;
      atom.dataSize = atom.size-atom.headerSize;
    }
    return atom;
  }
};

/** @type {{visitor: function(MP4.Atoms.Atom, Blob, MP4.Context, function(MP4.Context)), parsedSize: number, parser: (undefined|function(MP4.Context, DataView, number=) : MP4.Atoms.Atom)}} */
MP4.Atoms.Map['mp4a'] = {
  visitor: function(atom, blob, context, callback) {
    if (context.parent === 'stsd') MP4.Atoms.visitor(atom, blob, context, callback);
    else callback(context);
  },
  parsedSize: MP4.Atoms.Atom.HeaderSize + 10, // [header (8 bytes)]+[reserved (8 bytes)]+[version (2 bytes)]
  parser: function(context, data, offset) {
    return new MP4.Atoms.MP4AMediaData(data, offset);
  }
};

/** @type {{visitor: function(MP4.Atoms.Atom, Blob, MP4.Context, function(MP4.Context)), parsedSize: number, parser: (undefined|function(MP4.Context, DataView, number=) : MP4.Atoms.Atom)}} */
MP4.Atoms.Map['wave'] = { visitor: MP4.Atoms.visitor, parsedSize: MP4.Atoms.Atom.HeaderSize, parser: undefined };

/** @type {{visitor: function(MP4.Atoms.Atom, Blob, MP4.Context, function(MP4.Context)), parsedSize: number, parser: (undefined|function(MP4.Context, DataView, number=) : MP4.Atoms.Atom)}} */
MP4.Atoms.Map['esds'] = {
  visitor: MP4.Atoms.visitor,
  parsedSize: -1,
  parser: function(context, data, offset) {
    var atom = new MP4.Atoms.ESDescriptor(data, offset);
    if (atom.objectType !== null) context.currentTrack.codec = MP4.Tags.ObjectTypes[atom.objectType];
    return atom;
  }
};
MP4.analyze = function(blob, callback) {
  if (!(blob instanceof Blob)) throw new TypeError("Invalid argument type");

  var ab = new ArrayBuffer(8);
  var dv = new DataView(ab);
  var atom = new MP4.Atoms.Atom(dv);

  atom.size = MP4.Atoms.Atom.HeaderSize + blob.size;
  atom.type = 'root';
  atom.dataSize = -8;
  atom.parsed = true;

  var reader = new FileReader();
  reader.onloadend = function(ev) {
    if (ev.target.readyState === FileReader.DONE) {
      if (ev.target.result != "ftyp") {
        var context = new MP4.Context();
        context.error = new Error("Input data format is not mp4/mov");
        callback(context.result());
        return;
      }
  
      blob.rewind();
      MP4.Atoms.visitChildren(atom, blob, new MP4.Context(), function(context) {
        callback(context.result());
      }, reader);
    }
  };

  blob.skip(4);
  reader.readAsText(blob.poll(4));

  return true;
}
  window['MP4'] = { 'supported': true, 'analyze': MP4.analyze };
}
}());

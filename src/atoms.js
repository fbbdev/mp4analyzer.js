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

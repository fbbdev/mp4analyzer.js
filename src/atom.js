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

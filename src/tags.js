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

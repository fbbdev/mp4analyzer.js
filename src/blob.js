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

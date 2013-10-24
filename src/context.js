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
   * Parent atom
   * @type {?string}
   */
  this.parent = null;

  /** @type {{codec: ?string}} */
  this.video = /** @struct */ { codec: null };
  /** @type {{codec: ?string}} */
  this.audio = /** @struct */ { codec: null };

  /** @type {Array.<MP4.Track>} */
  this.tracks = [];
  /** @type {?MP4.Track} */
  this.currentTrack = null;

  /**
   * @return Object.<string, *>
   */
  this.result = function() {
    return { 'video': { 'codec': this.video.codec }, 'audio': { 'codec': this.audio.codec } };
  };
};

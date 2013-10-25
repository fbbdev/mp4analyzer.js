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

  /** @type {?MP4.Track} */
  this.video = null;
  /** @type {?MP4.Track} */
  this.audio = null;

  /**
   * Extract useful information from context
   * @return Object.<string, *>
   */
  this.result = function() {
    return {
      'video': this.video && {
        'codec': this.video.codec
      },
      'audio': this.audio && {
        'codec': this.audio.codec
      }
    };
  };
};

class ET extends EventTarget {
  on(...args) {
    this.addEventListener(...args);
  }
  one(type, cb, opts) {
    this.addEventListener(type, cb, {...opts, once: true});
  }
  off(...args) {
    this.removeEventListener(...args);
  }
}

class Tech extends ET {
  constructor() {
    super();
    this.vhs = new ET();
    this.vhs.playlists = new ET();
    this.vhs.playlists.media = () => new ET();
    this.vhs.masterPlaylistController_ = new ET();
    this.vhs.masterPlaylistController_.mainSegmentLoader_ = new ET();
    this.vhs.masterPlaylistController_.mainSegmentLoader_.sourceUpdater_ = new ET();
    this.vhs.masterPlaylistController_.mainSegmentLoader_.sourceUpdater_.videoBuffer = new ET();
    this.vhs.masterPlaylistController_.audioSegmentLoader_ = new ET();
    this.vhs.masterPlaylistController_.audioSegmentLoader_.sourceUpdater_ = new ET();
    this.vhs.masterPlaylistController_.audioSegmentLoader_.sourceUpdater_.audioBuffer = new ET();
  }

  isSupported() { return true; }
  registerSourceHandler() {}
}

class Player extends ET {
  constructor() {
    super();
    this.tech_ = new Tech();
  }
  width() {
    return 0;
  }
  height() {
    return 0;
  }
  seekable() {
    return {
      length: 1,
      start() {
        return 0;
      },
      end() {
        return 10;
      }
    };
  }
  buffered() { return this.seekable() }
  fluid() {}
  autoplay() {}
  muted() {}
  src() {}
  tech() { return this.tech_; }
}


const videojs = window.videojs = function() {
  return new Player();
};

videojs.options = {};

videojs.EventTarget = ET;

videojs.log = {
  level(){},
  log(...args) {
    console.log(args);
  },
  debug(...args) {
    console.debug(...args)
  }
};

videojs.getTech = function() {
  return new Tech();
};

// videojs.xhr = function () {};
//
// videojs.EventTarget = function () {};

videojs.getComponent = function (component) { return ET; };
videojs.registerComponent = function () {  };
videojs.registerPlugin = function () {  };
//
// videojs.createTimeRange = function () {}

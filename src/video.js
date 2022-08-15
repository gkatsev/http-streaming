const makeSeekable = () => ({
  length: 1,
  start() {
    return 0;
  },
  end() {
    return 10;
  }
});

function ET() {
  this.target = new EventTarget();

  this.options_ = {};
}
ET.prototype.addEventListener = function(...args) {
  this.target.addEventListener(...args);
};
ET.prototype.removeEventListener = function(...args) {
  this.target.removeEventListener(...args);
};
ET.prototype.on = function(...args) {
  if (typeof args[0] === 'string') {
    this.addEventListener(...args);
    return;
  } else if (Array.isArray(args[0])) {
    args[0].forEach((type) => this.target.addEventListener(type, ...args.slice(1)));
    return;
  }
  args[0].addEventListener(...args.slice(1))
};
ET.prototype.one = function(type, cb, opts) {
  this.addEventListener(type, cb, {...opts, once: true});
};
ET.prototype.off = function(...args) {
  this.removeEventListener(...args);
};
ET.prototype.trigger = function(type) {
  let evt;
  if (Object.prototype.toString.call(type) === '[object Object]') {
    evt = new Event(type)
    Object.keys(type).forEach((key) => {
      if (key !== 'type') {
        evt[key] = type[key];
      }
    });
  } else if (typeof type === 'string') {
    evt = new Event(type);
  }

  this.target.dispatchEvent(evt);
};

class AudioTrack extends ET {
  constructor(opts) {
    super();
    this.options = opts;
    this.id = opts.id;
  }
};
class TrackList extends ET {
  constructor() {
    super();
    this.list = [];
  }

  addTrack(track) {
    this.list.push(track);
  }
}

class Tech extends ET {
  constructor(el) {
    super();
    this.el_ = el;
    this.atl = new TrackList();
    this.ttl = new TrackList();
  }

  el() {
    return this.el_;
  }

  setSrc(src) {
    this.src_ = src;
    this.vhs = new videojs.VhsHandler(src, this, {});
    this.vhs.xhr = window.xhrFactory();
    this.vhs.src(src.src, src.type);
  }
  src(mediaSource) {
    if (mediaSource) {
      this.el_.src = mediaSource;
      return;
    }
    return this.src_;
  }

  autoplay() { return false; }
  preload() {}
  paused() { return true; }
  currentTime() { return 0; }
  isSupported() { return true; }
  registerSourceHandler() {}
  addRemoteTextTrack() { return {track: {}}; }
  buffered() { return this.el_.buffered; }
  seekable() { return this.el_.seekable; }
  audioTracks() { return this.atl; }
  remoteTextTracks() { return this.ttl; }
  textTracks() { return this.ttl; }
  clearTracks() {}
}

class Player extends ET {
  constructor(el) {
    super();
    this.tech_ = new Tech(el);
  }
  width() {
    return 0;
  }
  height() {
    return 0;
  }
  seekable() {
    return makeSeekable();
  }
  buffered() { return this.seekable() }
  fluid() {}
  autoplay() {}
  muted() {}
  src(src) {
    if (!src) {
      return this.tech_.src();
    }
    this.tech_.setSrc(src);
  }
  tech() { return this.tech_; }
}


const videojs = window.videojs = function(el) {
  return new Player(el);
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

videojs.getComponent = function (component) { return ET; };
videojs.registerComponent = function () {  };
videojs.registerPlugin = function () {  };
videojs.createTimeRanges = makeSeekable;
videojs.createTimeRange = makeSeekable;
videojs.browser = {IE_VERSION: null};
videojs.mergeOptions = function(...obj) {
  return obj.reduce((acc, o) => Object.assign(acc, o), {});
};
videojs.AudioTrack = AudioTrack;

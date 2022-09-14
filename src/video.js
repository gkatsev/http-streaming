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
ET.prototype.on = function(type, cb, opts) {
  if (typeof type === 'string') {
    this.addEventListener(type, cb.bind(this), opts);
    return;
  } else if (Array.isArray(type)) {
    type.forEach((typ) => this.target.addEventListener(typ, cb.bind(this), opts));
    return;
  }
  type.addEventListener(cb, opts.bind(this));
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
  } else if (type && type.type) {
    evt = new Event(type.type);
    evt.originalEvent = type;
  }

  this.target.dispatchEvent(evt);
};

class Track extends ET {
  constructor(opts) {
    super();
    this.options = opts;
    this.id = opts.id ?? '';
  }
}
class TextTrack extends Track {
  constructor(opts) {
    super(opts);
    this.cues = [];
  }

  addCue(cue) {
    this.cues.push(cue);
  }

  removeCue(cue) {
    this.cues.splice(this.cues.findIndex((c) => c === cue), 1);
  }
};
class AudioTrack extends Track { };
class TrackList extends ET {
  constructor() {
    super();
    this.list = [];
  }

  addTrack(track) {
    this.list.push(track);
  }

  getTrackById(id) {
    return this.list.filter((track) => track.id === id)[0];
  }
}

const Events = [
  'loadstart',
  'suspend',
  'abort',
  'error',
  'emptied',
  'stalled',
  'loadedmetadata',
  'loadeddata',
  'canplay',
  'canplaythrough',
  'playing',
  'waiting',
  'seeking',
  'seeked',
  'ended',
  'durationchange',
  'timeupdate',
  'progress',
  'play',
  'pause',
  'ratechange',
  'resize',
  'volumechange'
];

class Tech extends ET {
  static isSupported() {
    return true;
  }
  static registerSourceHandler() {}

  constructor(el) {
    super();
    this.options_.playerId = "id";
    this.el_ = el;
    this.atl = new TrackList();
    this.ttl = new TrackList();

    Events.forEach((type) => {
      this.on(this.el_, type, (e) => {
        this.trigger(e);
      });
    });

    this.trigger('ready');
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

  autoplay() { return this.el_.autoplay; }
  preload() { return this.el_.preload; }
  paused() { return this.el_.paused; }
  currentTime() { return this.el_.currentTime; }
  setCurrentTime(time) { this.el_.currentTime = time; }
  seeking() { return this.el_.seeking; }
  ended() { return this.el_.ended; }
  duration() { return this.el_.duration; }
  buffered() { return this.el_.buffered; }
  seekable() { return this.el_.seekable; }
  isSupported() { return true; }
  registerSourceHandler() {}
  addRemoteTextTrack(opts) {
    const t = new TextTrack(opts);
    this.ttl.addTrack(t);
    return {track: new TextTrack(opts)};
  }
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
    return 1280;
  }
  height() {
    return 720;
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

let player;
const videojs = window.videojs = function(el) {
  player = new Player(el);
  return player;
};

videojs.getPlayer = function() {
  return player;
}

videojs.options = {};

videojs.EventTarget = ET;

videojs.log = {
  level(){},
  log(...args) {
    console.log(args);
  },
  debug(...args) {
    console.debug(...args)
  },
  warn(...args) {
    console.warn(...args);
  }
};

videojs.getTech = function() {
  return Tech;
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

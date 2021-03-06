const Panel = {
  get $dumpReport() {
    delete this.$dump;
    return this.$dump = document.getElementById("dump-report");
  },

  get $toggle() {
    delete this.$toggle;
    return this.$toggle = document.getElementById("toggle");
  },

  get $controls() {
    delete this.$controls;
    return this.$controls = document.getElementById("controls");
  },

  get $threshold() {
    delete this.$threshold;
    return this.$threshold = document.getElementById("threshold");
  },

  get $sound() {
    delete this.$sound;
    return this.$sound = document.getElementById("sound");
  },

  get $ignoreNative() {
    delete this.$ignoreNative;
    return this.$ignoreNative = document.getElementById("ignore-native");
  },

  _threshold: 1.0,

  init() {
    this.$dumpReport.addEventListener("click", this);
    this.$toggle.addEventListener("click", this);
    this.$threshold.addEventListener("change", this);
    this.$sound.addEventListener("change", this);
    this.$ignoreNative.addEventListener("change", this);
    browser.runtime.sendMessage({ name: "get-state" }).then((state) => {
      let { enabled, threshold, sound, ignoreNative } = state;
      this.$controls.setAttribute("enabled", enabled);
      this._threshold = this.$threshold.value = threshold;
      this.$toggle.checked = enabled;
      this.$sound.checked = sound;
      this.$ignoreNative.checked = ignoreNative;
    });
  },

  handleEvent(event) {
    switch(event.originalTarget.id) {
      case "dump-report": {
        browser.runtime.sendMessage({ name: "dumpReport"});
        window.close();
        break;
      }

      case "toggle": {
        this.readThreshold();
        let enabled = event.originalTarget.checked;
        browser.runtime.sendMessage({ name: "toggle", enabled });
        this.$controls.setAttribute("enabled", enabled);
        break;
      }

      case "threshold": {
        this.readThreshold();
        break;
      }

      case "sound": {
        let enabled = event.originalTarget.checked;
        browser.runtime.sendMessage({ name: "sound", enabled });
        break;
      }

      case "ignore-native": {
        let enabled = event.originalTarget.checked;
        browser.runtime.sendMessage({ name: "ignoreNative", enabled });
        break;
      }
    }
  },

  readThreshold() {
    let threshold = parseFloat(this.$threshold.value, 10);
    if (!isNaN(threshold)) {
      browser.runtime.sendMessage({ name: "threshold", threshold });
    } else {
      // Reset the input to the original value
      this.$threshold.value = this._threshold;
    }
  }
}


addEventListener("load", function() {
  Panel.init();
});

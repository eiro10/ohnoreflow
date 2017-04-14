const ReflowReport = {

  reflows: [],

  get $tableBody() {
    delete this.$tableBody;
    return this.$tableBody = document.getElementById("table-body");
  },

  get $reset() {
    delete this.$reset;
    return this.$reset = document.getElementById("reset");
  },

  get $status() {
    delete this.$status;
    return this.$status = document.getElementById("status");
  },

  init() {
    this.$reset.addEventListener("click", this);

    browser.runtime.sendMessage({ name: "get-reflows" }).then(reflows => {
      if (!reflows || reflows.length == 0) {
        this.$status.textContent = "No reflows detected. Hooray!";
      } else {
        this.reflows = reflows;
        this.injectReport(reflows);
        this.$status.hidden = true;
      }
    });
  },

  injectReport(reflows) {
    let frag = document.createDocumentFragment();
    for (let i = 0; i < reflows.length; ++i) {
      let reflow = reflows[i];
      let row = document.createElement("tr");

      // Reflow sequence number
      let num = document.createElement("td");
      num.textContent = i;
      row.appendChild(num);

      // Total time for reflow in ms
      let time = document.createElement("td");
      time.textContent = (reflow.stop - reflow.start).toPrecision(2) + "ms";
      row.appendChild(time);

      // Number of reflowed frames (coming soon!)
      let frameNum = document.createElement("td");
      frameNum.textContent = "N/A";
      frameNum.classList.add("disabled");
      row.appendChild(frameNum);

      let fileABug = document.createElement("td");

      // Stack!
      let stack = document.createElement("td");

      if (reflow.stack) {
        let stackPre = document.createElement("pre");
        stackPre.textContent = reflow.stack;
        stack.appendChild(stackPre);

        let uri = this.fileABugURI(reflow);
        let fileABugAnchor = document.createElement("a");
        fileABugAnchor.href = uri;
        fileABugAnchor.textContent = "File a bug";
        fileABugAnchor.target = "_blank";
        fileABug.appendChild(fileABugAnchor);
      } else {
        let anchor = document.createElement("a");
        anchor.href = "#note-on-native-reflow";
        anchor.textContent = "Caused by native code";
        stack.appendChild(anchor);

        fileABug.textContent = "--";
      }

      row.appendChild(stack);
      row.appendChild(fileABug);

      frag.appendChild(row);
    }

    this.$tableBody.appendChild(frag);
  },

  reset() {
    if (confirm("Get rid of recordings so far? The report will remain open.")) {
      browser.runtime.sendMessage({ name: "reset" });
    }
  },

  fileABugURI(reflow) {
    let time = encodeURIComponent((reflow.stop - reflow.start).toPrecision(2) + "ms ");
    let topFrame = encodeURIComponent(reflow.stack.split("\n")[0]);
    let fullStack = encodeURIComponent(reflow.stack);
    let uri = `https://bugzilla.mozilla.org/enter_bug.cgi?assigned_to=nobody%40mozilla.org&blocked=photon-performance&bug_file_loc=http%3A%2F%2F&bug_ignored=0&bug_severity=normal&bug_status=NEW&cf_fx_iteration=---&cf_fx_points=---&cf_platform_rel=---&cf_status_firefox52=---&cf_status_firefox53=---&cf_status_firefox54=---&cf_status_firefox55=---&cf_status_firefox_esr45=---&cf_status_firefox_esr52=---&cf_tracking_firefox52=---&cf_tracking_firefox53=---&cf_tracking_firefox54=---&cf_tracking_firefox55=---&cf_tracking_firefox_esr45=---&cf_tracking_firefox_esr52=---&cf_tracking_firefox_relnote=---&comment=Here%27s%20the%20stack%3A%0D%0A%0D%0A${fullStack}&component=Untriaged&contenttypemethod=autodetect&contenttypeselection=text%2Fplain&defined_groups=1&flag_type-203=X&flag_type-37=X&flag_type-41=X&flag_type-5=X&flag_type-607=X&flag_type-720=X&flag_type-721=X&flag_type-737=X&flag_type-748=X&flag_type-781=X&flag_type-787=X&flag_type-799=X&flag_type-800=X&flag_type-803=X&flag_type-835=X&flag_type-846=X&flag_type-855=X&flag_type-864=X&flag_type-905=X&flag_type-914=X&flag_type-916=X&form_name=enter_bug&maketemplate=Remember%20values%20as%20bookmarkable%20template&op_sys=Unspecified&priority=--&product=Firefox&rep_platform=Unspecified&short_desc=${time}uninterruptible%20reflow%20at%20${topFrame}&status_whiteboard=%5Bohnoreflow%5D%5Bqf%5D%5Bphoton-performance%5D&target_milestone=---&version=unspecified`;
    return uri;
  },

  handleEvent(event) {
    if (event.originalTarget.id == "reset") {
      this.reset();
    }
  }
};

addEventListener("load", function() {
  ReflowReport.init();
});
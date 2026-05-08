/**
 * SpendLens Embeddable Widget
 * Usage: <script src="https://spendlens.co/widget.js" data-theme="light"></script>
 * Or with a container: <div id="spendlens-widget"></div>
 */
(function () {
  "use strict";

  var WIDGET_URL = "https://spendlens.co/audit";
  var CONTAINER_ID = "spendlens-widget";

  function createWidget(container, config) {
    var theme = config.theme || "light";
    var height = config.height || "700px";

    var wrapper = document.createElement("div");
    wrapper.style.cssText = [
      "width: 100%",
      "border-radius: 12px",
      "overflow: hidden",
      "border: 1px solid #AAC7D8",
      "box-shadow: 0 4px 16px rgba(41,53,60,0.12)",
    ].join(";");

    var iframe = document.createElement("iframe");
    iframe.src = WIDGET_URL + "?widget=1&theme=" + theme;
    iframe.style.cssText = [
      "width: 100%",
      "height: " + height,
      "border: none",
      "display: block",
    ].join(";");
    iframe.title = "SpendLens AI Spend Audit";
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");

    var footer = document.createElement("div");
    footer.style.cssText = [
      "text-align: center",
      "padding: 8px",
      "font-size: 11px",
      "color: #768A96",
      "background: #DFEBF6",
      "border-top: 1px solid #AAC7D8",
    ].join(";");
    footer.innerHTML =
      'Powered by <a href="https://spendlens.co" target="_blank" rel="noopener" style="color:#44576D;text-decoration:none;font-weight:600">SpendLens</a> by Credex';

    wrapper.appendChild(iframe);
    wrapper.appendChild(footer);
    container.appendChild(wrapper);
  }

  function init() {
    // Find explicit container
    var container = document.getElementById(CONTAINER_ID);

    // Find all script tags with data-spendlens attribute
    var scripts = document.querySelectorAll("script[data-spendlens]");

    var config = {};

    // Get config from current script tag
    var currentScript = document.currentScript;
    if (currentScript) {
      config.theme = currentScript.getAttribute("data-theme") || "light";
      config.height = currentScript.getAttribute("data-height") || "700px";
    }

    if (container) {
      createWidget(container, config);
    } else if (currentScript) {
      // Insert after the script tag
      var wrapper = document.createElement("div");
      currentScript.parentNode.insertBefore(wrapper, currentScript.nextSibling);
      createWidget(wrapper, config);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

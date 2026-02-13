// EvenHub Hello (no build step)
// Loads the official SDK via ESM CDN and attempts a minimal "startup page container" call.
//
// If you open this in normal desktop Safari/Chrome, it will *not* have the Even bridge.
// That's expected. In that case it will just log "bridge not found".

import {
  waitForEvenAppBridge,
  CreateStartUpPageContainer,
  TextContainerProperty,
  StartUpPageCreateResult,
} from "https://esm.sh/@evenrealities/even_hub_sdk@0.0.7";

const $status = document.getElementById("status");
const $log = document.getElementById("log");

function log(...args) {
  const line = args.map(a => (typeof a === "string" ? a : JSON.stringify(a, null, 2))).join(" ");
  $log.textContent += line + "\n";
  console.log(...args);
}

function setStatus(text, ok = true) {
  $status.textContent = text;
  $status.className = ok ? "ok" : "bad";
}

async function main() {
  log("Booting EvenHub Hello…");

  // Helpful early check: do we even have the InAppWebView bridge object?
  const hasFlutter = typeof window !== "undefined" &&
    window.flutter_inappwebview &&
    typeof window.flutter_inappwebview.callHandler === "function";

  log("flutter_inappwebview present:", hasFlutter);

  if (!hasFlutter) {
    setStatus("No Even bridge detected (open inside Even App)", false);
    return;
  }

  setStatus("Waiting for EvenAppBridge…", true);
  const bridge = await waitForEvenAppBridge();
  log("Bridge ready:", !!bridge);

  // Basic sanity checks
  const user = await bridge.getUserInfo().catch(e => (log("getUserInfo error:", String(e)), null));
  log("UserInfo:", user);

  const device = await bridge.getDeviceInfo().catch(e => (log("getDeviceInfo error:", String(e)), null));
  log("DeviceInfo:", device);

  // Create a single text container.
  const text = new TextContainerProperty({
    xPosition: 0,
    yPosition: 0,
    width: 480,
    height: 120,
    borderWidth: 0,
    paddingLength: 8,
    containerID: 1,
    containerName: "hello_text",
    isEventCapture: 0,
    content: "Hello from EvenHub Hello!",
  });

  const startup = new CreateStartUpPageContainer({
    containerTotalNum: 1,
    textObject: [text],
  });

  log("Calling createStartUpPageContainer…", startup.toJson());
  const result = await bridge.createStartUpPageContainer(startup).catch(e => (log("createStartUpPageContainer error:", String(e)), null));

  log("createStartUpPageContainer result:", result);

  if (result === StartUpPageCreateResult.success) {
    setStatus("Startup page created ✅", true);
  } else {
    setStatus("Startup page create failed ❌ (see log)", false);
  }

  // Listen for events
  bridge.onEvenHubEvent((evt) => {
    log("evenHubEvent:", evt);
  });

  // Optional: toggle mic on/off (host may reject; that's fine)
  log("Attempting audioControl(true)…");
  const micOn = await bridge.audioControl(true).catch(e => (log("audioControl(true) error:", String(e)), false));
  log("audioControl(true) =>", micOn);

  await new Promise(r => setTimeout(r, 1000));

  log("Attempting audioControl(false)…");
  const micOff = await bridge.audioControl(false).catch(e => (log("audioControl(false) error:", String(e)), false));
  log("audioControl(false) =>", micOff);

  log("Ready.");
}

main().catch((e) => {
  console.error(e);
  log("Fatal:", String(e?.stack || e));
  setStatus("Fatal error (see log)", false);
});

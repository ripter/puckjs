var log;
var watchId;

// Log every press/depress to BTN
function connect() {
  log = [];
  // Render that we are logging the button.
  renderActive();

  // Watch all button press, both the down and up event.
  watchId = setWatch(function(data) {
    // Add it to the log.
    log.push(data);
  }, BTN, {debounce:50, repeat:true});

  return true;
}

function disconnect() {
  // No longer active.
  renderDeactive();

  // Stop watching the button.
  clearWatch(watchId);
  return true;
}

// Render an active connection.
// Just for a nicer UI
function renderActive() {
  digitalWrite(LED3, true);
}

// Turn off the active light
// Just for a nicer UI
function renderDeactive() {
  digitalWrite(LED3, false);
}

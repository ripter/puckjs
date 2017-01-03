console.log('Battery Level: ', Puck.getBatteryPercentage());
var log;
var watchId;

// Log every press/depress to BTN
function connect() {
  log = [];
  // Render that we are logging the button.
  renderActive();

  // Watch all button press, both the down and up event.
  watchId = setWatch(function(data) {
    renderBusy(data.state);
    // Add it to the log.
    log.push(data);
  }, BTN, {debounce:50, repeat:true});

  return true;
}

// Stop logging
function disconnect() {
  // Stop watching the button.
  clearWatch(watchId);
  // No longer active.
  renderDeactive();

  return true;
}

// Returns true if the button is currently pressed.
function isDown(delay) {
  if (!log || log.length < 1) { return false; }
  var tail = getLastMS(delay);
  var result = tail.some(function(event) {
    return event.state;
  });

  // clear the log so it doesn't build any larger.
  log = [];
  return result || false;
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

function renderBusy(isDown) {
  if (isDown) {
    digitalWrite(LED1, true);
    digitalWrite(LED2, false);
  } else {
    digitalWrite(LED1, true);
    digitalWrite(LED2, false);
  }
}

function getLastMS(delay) {
  var tear;
  var reversedLog = log.slice();
  var totalTime = 0;

  // We want the last first.
  reversedLog.reverse();
  var tail = reversedLog.filter(function(event) {
    if (!tear) {
      tear = event.time;
      return true;
    }

    totalTime += (tear - event.time);
    return totalTime < (delay/1000);
  });

  return tail;
}

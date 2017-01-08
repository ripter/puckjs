reset();
// makes a nice indicator light that the code is doing something.
setBusyIndicator(LED3);
console.log('Battery Level: ', Puck.getBatteryPercentage());
var TIME_IN_SECONDS = 60 * 1;
var STATE = {
  LOADED: 'loaded',
  RUNNING: 'running',
}
var watchId, timerID, renderID;
var state = STATE.LOADED;

// Stop watching the button.
if (watchId) { clearWatch(watchId); }
// Watch all button press, both the down and up event.
watchId = setWatch(function(data) {
  nextState();
}, BTN, {edge:'rising', debounce:50, repeat:true});

// When the button is pressed, move to the next state.
function nextState() {
  switch (state) {
    case STATE.LOADED:
      startTimer();
      break;
    default:
      renderError();
      // renderRunning();
  }
}


// Start the timer!
function startTimer() {
  var startTime = 0 | getTime();

  if (timerID) { clearInterval(timerID); timerID = null; }
  state = STATE.RUNNING;

  timerID = setInterval(function() {
    var time = (0 | getTime()) - startTime;

    if (time >= TIME_IN_SECONDS) {
      clearInterval(timerID);
      timerID = null;
      state = STATE.LOADED;
      //TODO: render a stopped state that requires user response.
      renderError();
    }

  }, 1500);
}

// Oops, let the user know something is wrong.
function renderError() {
  var count = 0;
  if (renderID) { clearInterval(renderID); renderID = null;}
  renderID = setInterval(function() {
    var isOdd = (count % 2) === 0;

    if (count > 3) {
      clearInterval(renderID);
      renderID = null;
    }

    count += 1;

    if (isOdd) {
      LED1.reset();
    } else {
      LED1.set();
    }
  }, 50);
}

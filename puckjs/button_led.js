var batteryLevel = Puck.getBatteryPercentage();
var isDown = false;
var lights = [LED1, LED2, LED3, null];
var index = -1;
console.log('BatteryLevel: ', batteryLevel);

setWatch(function(data) {
  var state = data.state;

  console.log("Pressed", state);
  isDown = state;
  nextLight();
}, BTN, {/*edge:"rising",*/ debounce:50, repeat:true});

function nextLight() {
  var light = lights[index];

  index++;
  if (index > lights.length) {
    index = 0;
  }

  var nextLight = lights[index];


  if (light) {
    digitalWrite(light, false);
  }

  if (nextLight) {
    digitalWrite(nextLight, true);
  }

  // Functions callable by Puck.eval need to return a value.
  return index;
}

const elConnect = document.querySelector('#connect');
const elDisconnect = document.querySelector('#disconnect');
let btnIntervalId;


// Watch for button press
function pullBTN() {
  btnIntervalId = setInterval(function() {
    const x = 0 | Math.random() * screen.availWidth;
    const y = 0 | Math.random() * screen.availHeight;

    Puck.write('isDown\n', function(isDown) {
      console.log('d', isDown);

      if (isDown) {
        renderSquare(x, y);
      }
    });
    // Puck.eval('BTN.read()', function(value) {
    //   if (value) {
    //     console.log('BTN: ', value);
    //     renderSquare(x, y);
    //   }
    // });
  }, 100);
}

function renderSquare(x, y) {
  const elBody = document.querySelector('body');
  const div = document.createElement('div');
  div.classList.add('square');
  div.style.top = y + 'px';
  div.style.left = x + 'px';

  elBody.appendChild(div);
}


elConnect.addEventListener('click', function() {
  console.log('Starting pull');
  // Turning on the LED will connect
  Puck.write('digitalWrite(LED2, true)\n');
  pullBTN();
});

elDisconnect.addEventListener('click', function() {
  console.log('Stop pull');
  clearInterval(btnIntervalId);
  Puck.write('digitalWrite(LED2, false)\n', function() {
    // Wait for the LED to turn off before closing.
    Puck.close();
  });
});

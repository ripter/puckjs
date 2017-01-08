const elConnect = document.querySelector('#connect');
const elDisconnect = document.querySelector('#disconnect');
let btnIntervalId;


// Watch for button press
function pullBTN() {
  const SPEED = 500;
  let shouldWait = false;
  if (btnIntervalId) { clearInterval(btnIntervalId); }
  btnIntervalId = setInterval(function() {
    const x = 0 | Math.random() * screen.availWidth;
    const y = 0 | Math.random() * (screen.availHeight / 2);

    // If we lost connection, stop the loop.
    if (!Puck.isConnected()) {
      console.log('Cancel setInterval, Puck not connected.');
      clearInterval(btnIntervalId);
      return;
    }

    if (shouldWait) { return; }

    // Wait for the puck to respond before sending another message.
    shouldWait = true;
    Puck.write(`isDown(${SPEED})`, function(isDown) {
      console.log('isDown', arguments);
      shouldWait = false;
      if (isDown) {
        console.log('d', isDown);
        renderSquare(x, y);
      }
    });
  }, SPEED);
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
  console.group('Starting pull');
  Puck.write('connect();\n', () => {
    // Wait until it exicutes to start the pull.
    pullBTN();
  });
});

elDisconnect.addEventListener('click', function() {
  console.log('Stop pull');
  clearInterval(btnIntervalId);
  Puck.write('disconnect();\n', () => {
    // Wait for the LED to turn off before closing.
    if (Puck.isConnected()) {
      // Puck.close();
    }
    console.groupEnd();
  });
  Puck.close();
});

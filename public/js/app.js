const elConnect = document.querySelector('#connect');
const elDisconnect = document.querySelector('#disconnect');
let btnIntervalId;


// Watch for button press
function pullBTN() {
  console.log('skipping pullBTN for now');
  return;
  btnIntervalId = setInterval(function() {
    const x = 0 | Math.random() * screen.availWidth;
    const y = 0 | Math.random() * screen.availHeight;

    Puck.write('isDown\n', function(isDown) {
      console.log('d', isDown);

      if (isDown) {
        renderSquare(x, y);
      }
    });
  }, 250);
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
  Puck.eval('connect()', () => {
    // Wait until it exicutes to start the pull.
    pullBTN();
  });
});

elDisconnect.addEventListener('click', function() {
  console.log('Stop pull');
  clearInterval(btnIntervalId);
  Puck.eval('disconnect()', () => {
    // Wait for the LED to turn off before closing.
    Puck.close();
    console.groupEnd();
  });
});

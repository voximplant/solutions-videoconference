let callInterface;
function registerCallbacks(ci) {
  callInterface = ci;
  window.addEventListener('keydown', keyDownToggle);
  window.addEventListener('keyup', keyUpToggle);
}

function unregisterCallback() {
  window.removeEventListener('keydown', keyDownToggle);
  window.removeEventListener('keyup', keyUpToggle);
}

const actKeys = ['KeyD', 'KeyE'];

let pressedKey = '';

function keyDownToggle(ev) {
  if (pressedKey) return;
  if (actKeys.includes(ev.code)) pressedKey = ev.code;
}
function keyUpToggle(ev) {
  if (!pressedKey) return;
  if (actKeys.includes(ev.code)) pressedKey = null;
  if (ev.code === 'KeyD' && ev.ctrlKey === true) callInterface.muteToggle();
  if (ev.code === 'KeyE' && ev.ctrlKey === true) callInterface.cameraToggle();
}

export { registerCallbacks, unregisterCallback };

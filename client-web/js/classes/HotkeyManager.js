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

const actKeys = ['KeyM', 'KeyV', 'Space'];

let pressedKey = '';

function keyDownToggle(ev) {
  if (pressedKey) return;
  if (actKeys.includes(ev.code)) pressedKey = ev.code;
  if (ev.code === 'Space') callInterface.muteToggle();
}
function keyUpToggle(ev) {
  if (!pressedKey) return;
  if (actKeys.includes(ev.code)) pressedKey = null;
  if (ev.code === 'Space' || ev.code === 'KeyM') callInterface.muteToggle();
  if (ev.code === 'KeyV') callInterface.cameraToggle();
}

export { registerCallbacks, unregisterCallback };

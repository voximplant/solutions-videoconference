let callInterface;
function registerCallbacks(ci) {
  callInterface = ci;
  window.addEventListener('keydown', keyDownToggle);
}

function unregisterCallback() {
  window.removeEventListener('keydown', keyDownToggle);
}

function keyDownToggle(ev) {
  if (pressedKey) return;
  if (actKeys.includes(ev.code)) pressedKey = ev.code;
  if (ev.code === 'Space' && ev.target.nodeName !== 'INPUT') callInterface.muteToggle();
}
function keyUpToggle(ev) {
  if (!pressedKey) return;
  if (actKeys.includes(ev.code)) pressedKey = null;
  if ((ev.code === 'Space' || ev.code === 'KeyM') && ev.target.nodeName !== 'INPUT')
    callInterface.muteToggle();
  if (ev.code === 'KeyV' && ev.ctrlKey === false && ev.target.nodeName !== 'INPUT')
    callInterface.cameraToggle();
}

export { registerCallbacks, unregisterCallback };

let callInterface;
function registerCallbacks(ci) {
  callInterface = ci;
  window.addEventListener('keydown', keyDownToggle);
}

function unregisterCallback() {
  window.removeEventListener('keydown', keyDownToggle);
}

function keyDownToggle(ev) {
  if (ev.code === 'KeyD' && ev.altKey) callInterface.muteToggle();
  if (ev.code === 'KeyE' && ev.altKey) callInterface.cameraToggle();
}

export { registerCallbacks, unregisterCallback };

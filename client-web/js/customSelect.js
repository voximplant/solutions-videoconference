function CustomSelect(options) {
  const elem = options.elem;
  elem.onclick = function (event) {
    if (event.target.className === 'select') {
      toggle();
    } else if (event.target.tagName === 'LI') {
      setValue(event.target.textContent, event.target.dataset.value);
      for (var i = 0; i < event.target.parentElement.childElementCount; i++) {
        event.target.parentElement.children[i].style.color = '#000';
      }
      event.target.style.color = '#662EFF';
      close();
    }
  };
  let isOpen = false;
  function onDocumentClick(event) {
    if (!elem.contains(event.target)) close();
  }
  function setValue(title, value) {
    elem.querySelector('.select').textContent = title;
    const widgetEvent = new CustomEvent('select', {
      bubbles: true,
      detail: {
        title: title,
        value: value,
      },
    });
    elem.dispatchEvent(widgetEvent);
  }
  function toggle() {
    if (isOpen) close();
    else open();
  }
  function open() {
    elem.classList.add('open');
    document.addEventListener('click', onDocumentClick);
    isOpen = true;
  }
  function close() {
    elem.classList.remove('open');
    document.removeEventListener('click', onDocumentClick);
    isOpen = false;
  }
}
new CustomSelect({
  elem: document.getElementById('selectCamera'),
});
new CustomSelect({
  elem: document.getElementById('selectMicrophone'),
});
new CustomSelect({
  elem: document.getElementById('selectSpeakers'),
});

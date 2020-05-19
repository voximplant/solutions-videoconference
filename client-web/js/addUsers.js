'use strict';

let addUserForm = document.querySelector('.js__invite-form');
let addUserSetupOpen = document.querySelector('.add-user-setup-open');
let addUserSetupClose = document.querySelector('.setup-close');

const onAddUserPopupEscPress = function (evt) {
  if (evt.key === 'Escape') {
    closePopup();
  }
};

const addUserOpenPopup = function () {
  addUserForm.classList.remove('hidden');
  document.addEventListener('keydown', (e) => onAddUserPopupEscPress(e));
};
const addUserClosePopup = function () {
  addUserForm.classList.add('hidden');
  document.removeEventListener('keydown', (e) => onAddUserPopupEscPress(e));
};

addUserSetupOpen.addEventListener('click', function () {
  addUserOpenPopup();
});

addUserSetupOpen.addEventListener('keydown', function (evt) {
  if (evt.key === 'Enter') {
    addUserOpenPopup();
  }
});

addUserSetupClose.addEventListener('click', () => {
  addUserClosePopup();
});

addUserSetupClose.addEventListener('keydown', function (evt) {
  if (evt.key === 'Enter') {
    addUserClosePopup();
  }
});

'use strict';

import { LayerManager } from './classes/LayerManager.js';
import { currentUser } from './classes/User.js';

const leaveForm = document.querySelector('.js__leave-form');
const submitButton = document.querySelector('.js__submit-leave-form');

const user = currentUser;

export const showLeaveForm = () => {
  LayerManager.show('conf__leave');
  document.getElementById('full_name').value = user.name;
  document.getElementById('work_email').value = user.email;
};

leaveForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  setTimeout(() => {
    submitButton.disabled = true;
    submitButton.classList.add('loading');

    axios
      .post('', formData, {
        headers: { 'content-type': 'multipart/form-data' },
      })
      .then((resp) => {
        if (resp.data.result) {
          document.querySelector('.conf__leave-form').style.display = 'none';
          document.querySelector('.conf__leave-tnh').style.display = 'block';
          submitButton.disabled = false;
          submitButton.classList.remove('loading');
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, 0);
});

'use strict';

import { currentUser } from './User.js';
import CallManager from './CallManager.js';

class LayerManagerClass {
  constructor() {
    this.layers = [];
    this.layers.push(document.querySelector('.conf__welcome'));
    this.layers.push(document.querySelector('.conf__access-allow'));
    this.layers.push(document.querySelector('.conf__form'));
    this.layers.push(document.querySelector('.conf__settings'));
    this.layers.push(document.querySelector('.conf__video-section-wrapper'));
    this.layers.push(document.querySelector('.conf__error'));
    this.layers.push(document.querySelector('.conf__access-not-supported'));
    this.layers.push(document.querySelector('.conf__no-access'));
    this.layers.push(document.querySelector('.conf__leave'));
  }

  show(cssClass) {
    this.layers.forEach((layer) => {
      if (cssClass == 'conf__leave' && layer.classList.contains(cssClass)) {
        layer.style.display = 'flex';
      } else if (layer.classList.contains(cssClass)) {
        layer.style.display = 'block';
      } else {
        layer.style.display = 'none';
      }
    });
  }

  toggleVideoStub(id, isEnabled) {
    const section = document.getElementById(id);
    if (isEnabled && !document.getElementById(`videoStub-${id}`)) {
      const userName = document.createElement('div');
      const videoWrap = document.createElement('div');
      const fakeVideo = document.createElement('video');
      videoWrap.setAttribute('id', `videoStub-${id}`);
      videoWrap.classList.add('videoStub-wrapper');
      fakeVideo.classList.add('videoStub');
      fakeVideo.setAttribute('poster', `img/video.png`);
      fakeVideo.setAttribute('width', '400');
      fakeVideo.setAttribute('height', '300');
      userName.classList.add('userName');
      const firstLetter =
        id === 'localVideoNode'
          ? currentUser.name[0].toUpperCase()
          : CallManager.endPointsSet[`${id}`].displayName[0].toUpperCase();
      userName.textContent = firstLetter;
      videoWrap.appendChild(userName);
      videoWrap.appendChild(fakeVideo);
      section.appendChild(videoWrap);
    } else {
      if (document.getElementById(`videoStub-${id}`)) {
        section.removeChild(document.getElementById(`videoStub-${id}`));
      }
    }
  }

  renderTemplate(id, name, place) {
    const template = document.getElementById('js__endpoint-template');
    template.content.querySelector('.conf__video-name').textContent = `${name}`;
    template.content.querySelector('.js__endpoint').id = id;
    template.content.querySelector('.js__endpoint').style.order = place;
    return document.importNode(template.content, true);
  }
}

const LayerManager = new LayerManagerClass();

export { LayerManager };

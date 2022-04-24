import { $mirrorStore } from '@/store/mirrorMedia/index';

function detectAudioWorklet() {
  if (window['OfflineAudioContext']) {
    const context = new window['OfflineAudioContext'](1, 1, 44100);
    return context.audioWorklet && typeof context.audioWorklet.addModule === 'function';
  }
  return false;
}

async function prepareAudioNodes(track: MediaStreamTrack): Promise<AudioContext> {
  const oldContext = $mirrorStore.getState().audioContext;
  if (oldContext) await oldContext.close();

  const audioContext = new AudioContext();
  await audioContext.audioWorklet.addModule('/audioLevelProcessor.js');
  const audioLevelNode = new AudioWorkletNode(audioContext, 'audio-level-processor');
  audioLevelNode.port.onmessage = (event) => {
    const points = document.querySelectorAll('.point') as NodeListOf<HTMLElement>;
    if (points.length) changeSoundLevel(event, points);
  };
  const micNode = audioContext.createMediaStreamSource(new MediaStream([track]));
  micNode.connect(audioLevelNode);
  audioLevelNode.connect(audioContext.destination);
  return audioContext;
}

function changeSoundLevel(event: MessageEvent, points: NodeListOf<HTMLElement>) {
  if (event.data.level * 200 >= 1) {
    points[2].style.height = 'calc(' + Math.ceil(event.data.level * 200) + 'px + 4px)';
  } else {
    points[2].style.height = '4px';
  }
  if (event.data.level * 200 >= 24) {
    points[1].style.height = 'calc(' + Math.ceil(event.data.level * 150) + 'px + 4px)';
    points[3].style.height = 'calc(' + Math.ceil(event.data.level * 150) + 'px + 4px)';
  } else {
    points[1].style.height = '4px';
    points[3].style.height = '4px';
  }
  if (event.data.level * 200 >= 48) {
    points[0].style.height = 'calc(' + Math.ceil(event.data.level * 100) + 'px + 4px)';
    points[4].style.height = 'calc(' + Math.ceil(event.data.level * 100) + 'px + 4px)';
  } else {
    points[0].style.height = '4px';
    points[4].style.height = '4px';
  }
}

export { prepareAudioNodes, detectAudioWorklet };

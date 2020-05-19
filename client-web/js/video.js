const dVideo = 360 / 640; // constant video proportions

export function calculateVideoGrid() {
  window.addEventListener('resize', setVideoSectionWidth, true);
}

function getDVideo(containerW, containerH) {
  if (containerW >= containerH) return dVideo;
  else return 1 / dVideo;
}

export function setVideoSectionWidth() {
  const perf1 = window.performance.now();
  console.log('Calculating layout');
  const videoSection = document.querySelector('.conf__video-section');
  const calculatingVideo = [...videoSection.querySelectorAll('.conf__video')];
  const allVideo =
    calculatingVideo.length === 1
      ? [...videoSection.querySelectorAll('.conf__video-section>div')]
      : calculatingVideo;
  const containerW = videoSection.clientWidth - 20;
  const containerH = window.innerHeight - 88;
  const N = calculatingVideo.length > 1 ? calculatingVideo.length : containerW < 584 ? 1 : 2; // additional container for the invite block if needed

  let { Nx, Ny, targetW, targetH } = scaleSelector(N, containerW, containerH);

  allVideo.forEach((el) => {
    el.style.width = targetW + 'px';
    el.style.height = targetH + 'px';
    const video = el.querySelector('video');
    if (video) {
      video.style.objectFit = getDVideo(containerW, containerH) !== dVideo ? 'cover' : 'contain';
    } else {
      setTimeout(() => {
        if (video)
          video.style.objectFit =
            getDVideo(containerW, containerH) !== dVideo ? 'cover' : 'contain';
      }, 1000);
    }
  });
  const containerPaddingW = (videoSection.clientWidth - targetW * Nx) / 2;
  const containerPaddingH = (containerH - targetH * Ny) / 2;
  if (containerPaddingW > 0 && containerPaddingH > 0)
    videoSection.style.padding = `${containerPaddingH}px ${containerPaddingW}px`;
  else if (containerPaddingH > 0) videoSection.style.padding = `${containerPaddingH}px 0`;
  else if (containerPaddingW > 0) videoSection.style.padding = `0 ${containerPaddingW}px`;
  else videoSection.style.padding = `0`;
  const perf2 = window.performance.now();
  console.log(`Layout calculating took ${perf2 - perf1} ms`);
}

function scaleSelector(N, containerW, containerH) {
  if (N === 1) {
    return { Nx: 1, Ny: 1, targetW: containerW, targetH: containerH };
  }
  const scale1 = scaleSelectorW(N, containerW, containerH);
  const scale2 = scaleSelectorH(N, containerW, containerH);
  let targetScale = scale2;
  if (scale1.targetH * scale1.targetW > scale2.targetH * scale2.targetW) return scale1;
  if (isScaleLessMinimum(targetScale, containerW, containerH)) {
    targetScale = rescaleSelectorMini(N, containerW, containerH);
  }
  return targetScale;
}

function isScaleLessMinimum(scale, containerW, containerH) {
  const maxCols = containerW > containerH ? 5 : 3;
  return scale.Nx > maxCols;
}

function rescaleSelectorMini(N, containerW, containerH) {
  const Nx = containerW >= containerH ? 5 : 3;
  const targetW = containerW / Nx;
  const targetH = targetW * getDVideo(containerW, containerH);
  const Ny = Math.ceil(N / Nx);
  return { Nx, Ny, targetW, targetH };
}

function scaleSelectorW(N, containerW, containerH) {
  const sqrCont = containerW * containerH;
  let sqr = {};
  for (let i = 1; i <= N; i++) {
    const possibleTargetW = containerW / i;
    const possibleTargetH = possibleTargetW * getDVideo(containerW, containerH);
    sqr[i] = containerW * (possibleTargetH * Math.ceil(N / i));
    if (sqr[i] > sqrCont) sqr[i] = 0;
  }
  let Nx = Object.entries(sqr).sort((a, b) => {
    if (a[1] > b[1]) return -1;
    if (a[1] < b[1]) return 1;
    return 0;
  })[0][0];
  let Ny = Math.ceil(N / Nx);
  let targetW = containerW / Nx;
  let targetH = targetW * getDVideo(containerW, containerH);
  if (targetH <= containerW && targetW <= containerH) return { Nx, Ny, targetW, targetH };
  else return { Nx: 0, Ny: 0, targetW: 0, targetH: 0 };
}

function scaleSelectorH(N, containerW, containerH) {
  const sqrCont = containerW * containerH;
  let sqr = {};
  for (let i = 1; i <= N; i++) {
    const possibleTargetH = containerH / i;
    const possibleTargetW = possibleTargetH / getDVideo(containerW, containerH);
    sqr[i] = containerH * (possibleTargetW * Math.ceil(N / i));
    if (sqr[i] > sqrCont) sqr[i] = 0;
  }
  let Ny = Object.entries(sqr).sort((a, b) => {
    if (a[1] > b[1]) return -1;
    if (a[1] < b[1]) return 1;
    return 0;
  })[0][0];
  let Nx = Math.ceil(N / Ny);
  let targetH = containerH / Ny;
  let targetW = targetH / getDVideo(containerW, containerH);
  if (targetH <= containerW && targetW <= containerH) return { Nx, Ny, targetW, targetH };
  else return { Nx: 0, Ny: 0, targetW: 0, targetH: 0 };
}

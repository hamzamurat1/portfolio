// ── Video Background Scrub ──
const VIDEO_TARGETS = {
  erzurum:  0,
  projects: 1.5,
  about:    3,
};

const LERP_SPEED     = 0.15;
const SEEK_THRESHOLD = 0.008;

let bgVideo     = null;
let targetTime  = VIDEO_TARGETS.about;
let currentLerp = VIDEO_TARGETS.about;
let videoReady  = false;
let lastSeekTs  = 0;

function initBgVideo() {
  bgVideo = document.getElementById('bg-video');
  if (!bgVideo) return;

  function markReady() {
    if (videoReady) return;
    videoReady = true;
    bgVideo.pause();
    bgVideo.currentTime = VIDEO_TARGETS.about;
    currentLerp = VIDEO_TARGETS.about;

    const loader = document.getElementById('video-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.style.display = 'none', 600);
    }
    startScrubLoop();
  }

  bgVideo.addEventListener('canplay',        markReady);
  bgVideo.addEventListener('canplaythrough', markReady);
  bgVideo.addEventListener('loadeddata',     markReady);

  // Fallback 3sn
  setTimeout(markReady, 3000);

  // play() + hemen pause → browser'ı buffer almaya zorla
  const playPromise = bgVideo.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      bgVideo.pause();
      bgVideo.currentTime = VIDEO_TARGETS.about;
    }).catch(() => {
      // autoplay engellendi, sorun değil
      markReady();
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && videoReady) {
      try { bgVideo.currentTime = currentLerp; } catch(e) {}
    }
  });
}

function setVideoTarget(section) {
  if (VIDEO_TARGETS[section] !== undefined) {
    targetTime = VIDEO_TARGETS[section];
  }
}

function startScrubLoop() {
  function loop(timestamp) {
    currentLerp += (targetTime - currentLerp) * LERP_SPEED;

    const diff = Math.abs((bgVideo.currentTime || 0) - currentLerp);
    if (diff > SEEK_THRESHOLD) {
      try {
        if (bgVideo.fastSeek) {
          bgVideo.fastSeek(currentLerp);
        } else {
          bgVideo.currentTime = currentLerp;
        }
      } catch(e) {}
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

window.setVideoTarget = setVideoTarget;
window.initBgVideo    = initBgVideo;

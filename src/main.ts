import './styles/landing.scss';
import './styles/article.scss';

const container = document.querySelector<HTMLElement>('.emojipad')!;
const canvas = document.createElement('canvas');
canvas.className = 'emojipad__canvas';

canvas.width = container.clientWidth * window.devicePixelRatio;
canvas.height = container.clientHeight * window.devicePixelRatio;

container.prepend(canvas);

const wSrc = document.querySelector<HTMLLinkElement>('[name=worker]')!;

if (typeof canvas.transferControlToOffscreen === 'function') {
  const worker = new Worker(wSrc.href);

  let offscreenCanvas = canvas.transferControlToOffscreen();

  worker.postMessage(
    {
      name: 'init',
      canvas: offscreenCanvas,
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.devicePixelRatio,
    },
    [offscreenCanvas]
  );

  window.addEventListener('resize', () => {
    worker.postMessage({
      name: 'resize',
      width: window.innerWidth,
      height: window.innerHeight,
    });
  });
} else {
  const script = document.createElement('script');
  script.src = wSrc.href;
  script.async = true;
  script.onload = () => {
    window.postMessage(
      {
        name: 'init',
        canvas,
        width: window.innerWidth,
        height: window.innerHeight,
      },
      '*',
      []
    );

    window.addEventListener('resize', () => {
      window.postMessage(
        {
          name: 'resize',
          width: window.innerWidth,
          height: window.innerHeight,
        },
        '*',
        []
      );
    });
  };
}

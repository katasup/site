import { EmojiPad } from './emojipad/emojipad';

import './styles/landing.scss';

document.addEventListener('readystatechange', () => {
  if (document.readyState === 'complete') {
    init();
  }
});

function init() {
  const landing = document.querySelector<HTMLElement>('.landing');

  if (!landing) {
    return;
  }

  const emojipad = new EmojiPad(landing);

  window.addEventListener('resize', emojipad.handleResize);
}

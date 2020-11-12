import { EmojiPad } from './emojipad/emojipad';

import './styles/article.scss';

document.addEventListener('readystatechange', () => {
  if (document.readyState === 'complete') {
    init();
  }
});

function init() {
  const header = document.querySelector<HTMLElement>('.header');

  if (!header) {
    return;
  }

  const emojipad = new EmojiPad(header, 50);

  window.addEventListener('resize', emojipad.handleResize);
}

import { EmojiPad } from './emojipad/emojipad';

import './styles/landing.scss';
import './styles/article.scss';

document.addEventListener('readystatechange', () => {
  if (document.readyState === 'complete') {
    init();
  }
});

function init() {
  const landing = document.querySelector<HTMLElement>('.emojipad');

  if (!landing) {
    return;
  }

  const emojipad = new EmojiPad(landing);

  window.addEventListener('resize', emojipad.handleResize);
}

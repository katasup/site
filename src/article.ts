import { EmojiPad } from './emojipad/emojipad';

import './styles/article.scss';

document.addEventListener('readystatechange', () => {
  if (document.readyState === 'complete') {
    init();
  }
});

function init() {
  const header = document.querySelector<HTMLElement>('.header');

  if (header) {
    new EmojiPad(header, 10);
  }
}

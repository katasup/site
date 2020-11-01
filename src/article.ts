import { EmojiPad } from './emojipad/emojipad';

import './styles/article.scss';

const header = document.querySelector<HTMLElement>('.header');

if (header) {
  new EmojiPad(header, 10);
}

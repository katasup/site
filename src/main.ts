import { EmojiPad } from './emojipad/emojipad';

import './styles/landing.scss';

const landing = document.querySelector<HTMLElement>('.landing');

if (landing) {
  new EmojiPad(landing);
}

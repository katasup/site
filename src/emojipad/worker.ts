import { EmojiPad } from './emojipad';

interface InitEvent {
  name: 'init';
  canvas: OffscreenCanvas;
  width: number;
  height: number;
  ratio: number;
}

interface ResizeEvent {
  name: 'resize';
  width: number;
  height: number;
}

let emojipad: EmojiPad;

self.onmessage = (event: MessageEvent<InitEvent | ResizeEvent>) => {
  if (event.data.name === 'init') {
    init(event.data);
  }

  if (event.data.name === 'resize') {
    resize(event.data);
  }
}

function init(data: InitEvent) {
  emojipad = new EmojiPad(data.canvas, data.width, data.height, data.ratio);
}

function resize(data: ResizeEvent) {
  emojipad.handleResize(data.width, data.height);
}

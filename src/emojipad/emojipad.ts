interface Layer {
  image: HTMLImageElement;
  scale: number;
  top: number;
  left: number;
  rotate: number;
  transform: {
    top: number;
    left: number;
    rotate: number;
  };
}

class NullContextError extends Error {
  constructor() {
    super('canvas.getContext("2d") returns null value');
  }
}

export class EmojiPad {
  static emojisRaw = '😀 😃 😄 😁 😆 😅 😂 🤣 ☺️ 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🤩 🥳 😏 😒 😞 😔 😟 😕 🙁 ☹️ 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🤭 🤫 🤥 😶 😐 😑 😬 🙄 😯 😦 😧 😮 😲 🥱 😴 🤤 😪 😵 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕 🤑 🤠 😈 👿 👹 👺 🤡 💩 👻 💀 ☠️ 👽 👾 🤖 🎃 😺 😸 😹 😻 😼 😽 🙀 😿 😾 🧠 🦷 🦴 👀 👁 👅 👄 🧙 🧚 🧛 🧜 🧞 🧟 🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐽 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🐣 🐥 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🐛 🦋 🐌 🐞 🐜 🦟 🦗 🕷 🕸 🦂 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🦐 🦞 🦀 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🦧 🐘 🦛 🦏 🐪 🐫 🦒 🦘 🐃 🐂 🐄 🐎 🐖 🐏 🐑 🦙 🐐 🦌 🐕 🐩 🦮 🐕‍🦺 🐈 🐓 🦃 🦚 🦜 🦢 🦩 🕊 🐇 🦝 🦨 🦡 🦦 🦥 🐁 🐀 🐿 🦔 🐲 🌵 🍁 🍄 🐚 🌞 🌝 🌛 🌜 🌚 🌕 🌎 🔥 ❄️ 🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶 🌽 🥕 🧄 🧅 🥔 🍠 🥐 🥯 🍞 🥖 🥨 🧀 🥚 🍳 🧈 🥞 🧇 🥓 🥩 🍗 🍖 🦴 🌭 🍔 🍟 🍕 🥪 🥙 🧆 🌮 🌯 🥗 🥘 🥫 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🦪 🍤 🍙 🍚 🍘 🍥 🥠 🥮 🍢 🍡 🍧 🍨 🍦 🥧 🧁 🍰 🎂 🍮 🍭 🍬 🍫 🍿 🍩 🍪 🌰 🥜 ⚽️ 🏀 🏈 ⚾️ 🥎 🎾 🏐 🏉 🥏 🎱';
  static emojis = EmojiPad.emojisRaw.split(' ');

  usedIndexes: number[] = [];

  ratio: number;
  length: number;

  layers: Layer[] = [];
  ctx: CanvasRenderingContext2D;

  width: number;
  height: number;

  emojiSize: number;

  constructor(container: HTMLElement, length = 99) {
    this.ratio = window.devicePixelRatio || 1;
    this.length = length;

    this.width = container.clientWidth * this.ratio;
    this.height = container.clientHeight * this.ratio;

    this.emojiSize = Math.min(this.height, this.width) / 10;

    const canvas = document.createElement('canvas');

    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = container.clientHeight + 'px';
    canvas.width = this.width;
    canvas.height = this.height;

    container.prepend(canvas);

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new NullContextError();
    }

    this.ctx = ctx;

    this.fillLayers();
    this.render();
  }

  randomEmoji(): string {
    const index = Math.floor(EmojiPad.emojis.length * Math.random());

    if (this.usedIndexes.indexOf(index) >= 0) {
      return this.randomEmoji();
    }

    this.usedIndexes.push(index);

    return EmojiPad.emojis[index];
  }

  randomDirection(): number {
    const dir = (Math.random() * 2 - 1);

    if (dir === 0) {
      return this.randomDirection();
    }

    return dir;
  }

  blur(canvas: HTMLCanvasElement, ratio: number) {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new NullContextError();
    }

    ctx.globalAlpha = 1 / (2 * ratio);

    for (let y = -ratio; y <= ratio; y += 2) {
      for (let x = -ratio; x <= ratio; x += 2) {
        ctx.drawImage(canvas, x, y);
        if (x >= 0 && y >= 0) ctx.drawImage(canvas, -(x - 1), -(y - 1));
      }
    }

    ctx.globalAlpha = 1;
  }

  fillLayers() {
    const layersAmount = 99;

    this.layers = Array.from({ length: layersAmount }, (_, index) => {
      const content = this.randomEmoji();
      const blur = index < layersAmount / 2 ? 3 : 0;

      const canvas = document.createElement('canvas');
      canvas.width = this.emojiSize + blur * 2;
      canvas.height = this.emojiSize + blur * 2 * 1.1;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new NullContextError();
      }

      ctx.font = `${this.emojiSize}px serif`;
      ctx.fillText(content, blur, this.emojiSize / 1.1);

      if (blur) {
        this.blur(canvas, blur);
      }

      const image = new Image();
      image.src = canvas.toDataURL();

      return {
        image,
        scale: (index < layersAmount / 2 ? 0.5 : 1) + Math.random(),
        top: Math.random() * this.height,
        left: Math.random() * this.width,
        rotate: 0,
        transform: {
          top: this.randomDirection(),
          left: this.randomDirection(),
          rotate: this.randomDirection() * Math.PI / 360,
        },
      }
    });
  }

  transformLayer(layer: Layer) {
    if (layer.top < 0 || layer.top > this.height) {
      layer.transform.top = -layer.transform.top;
    }

    if (layer.left < 0 || layer.left > this.width) {
      layer.transform.left = -layer.transform.left;
    }

    layer.top += layer.transform.top;
    layer.left += layer.transform.left;
    layer.rotate += layer.transform.rotate;
  }

  render = () => {
    this.ctx.fillStyle = 'blueviolet';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.layers.forEach((layer: Layer) => {
      this.ctx.save();
      this.ctx.translate(layer.left, layer.top);
      this.ctx.rotate(layer.rotate);

      this.ctx.drawImage(
        layer.image,
        -(this.emojiSize * layer.scale) / 2,
        -(this.emojiSize * layer.scale) / 2,
        (this.emojiSize * layer.scale),
        (this.emojiSize * layer.scale)
      );

      this.ctx.restore();
      this.transformLayer(layer);
    });

    requestAnimationFrame(this.render);
  }
}

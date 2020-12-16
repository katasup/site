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
  static emojis = ['1f0cf', '1f30d', '1f31d', '1f336-fe0f', '1f346', '1f34a', '1f34b', '1f34c', '1f351', '1f355', '1f369', '1f36a', '1f37f', '1f389', '1f3b2', '1f3b7', '1f3b8', '1f3c2', '1f3c6', '1f419', '1f42d', '1f437', '1f438', '1f44c', '1f47b', '1f47d', '1f47e', '1f480', '1f48e', '1f4a3', '1f4a9', '1f4ce', '1f4e3', '1f52a', '1f52b', '1f600', '1f602', '1f606', '1f607', '1f609', '1f60d', '1f610', '1f618', '1f61b', '1f621', '1f626', '1f628', '1f62c', '1f62d', '1f62e', '1f631', '1f633', '1f634', '1f636', '1f637', '1f644', '1f680', '1f6b2', '1f6f8', '1f6f9', '1f6fc', '1f911', '1f912', '1f913', '1f914', '1f916', '1f91f', '1f921', '1f923', '1f924', '1f929', '1f92a', '1f92b', '1f92c', '1f92e', '1f92f', '1f951', '1f955', '1f95e', '1f965', '1f96b', '1f970', '1f972', '1f973', '1f975', '1f976', '1f980', '1f981', '1f984', '1f98a', '1f98b', '1f9c0', '1f9c1', '1f9da', '1f9dc-200d-2640-fe0f', '1f9e0', '1fa82', '1fa99', '1fab2', '1fad2', '263a-fe0f', '2693', '270c-fe0f'];

  layersAmount: number = 100;
  layers: Layer[] = [];
  usedIndexes: number[] = [];

  width: number;
  height: number;
  ratio: number = window.devicePixelRatio || 1;
  emojiSize: number;

  ctx: CanvasRenderingContext2D;

  private resizeTimer?: number;

  constructor(public container: HTMLElement) {
    const mobileDevice = window.innerWidth < 768;

    this.width = container.clientWidth * this.ratio;
    this.height = container.clientHeight * this.ratio;

    this.emojiSize = Math.min(window.innerHeight, window.innerWidth) / 7 * this.ratio;

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

  handleResize = () => {
    window.clearTimeout(this.resizeTimer);

    this.resizeTimer = window.setTimeout(() => {
      this.width = this.container.clientWidth * this.ratio;
      this.height = this.container.clientHeight * this.ratio;

      this.ctx.canvas.style.width = this.container.clientWidth + 'px';
      this.ctx.canvas.style.height = this.container.clientHeight + 'px';
      this.ctx.canvas.width = this.width;
      this.ctx.canvas.height = this.height;
    }, 500);
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

  loadEmoji(emoji: string): Promise<HTMLImageElement> {
    return new Promise(resolve => {
      const image = new Image(this.emojiSize, this.emojiSize);
      image.onload = () => resolve(image);
      image.src = `/assets/emoji/${emoji}.png`;
    });
  }

  fillLayers() {
    for (let i = this.layersAmount; i >= 0; i--) {
      this.fillLayer();
    }
  }

  async fillLayer() {
    const blurRatio = 3;
    const padding = (blurRatio * this.ratio * 3);

    const emoji = await this.loadEmoji(this.randomEmoji());

    const index = this.layers.length;
    const blur = index < this.layersAmount / 2;

    const canvas = document.createElement('canvas');
    canvas.width = this.emojiSize + padding * 2;
    canvas.height = this.emojiSize + padding * 2;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new NullContextError();
    }

    ctx.drawImage(
      emoji,
      padding,
      padding,
      this.emojiSize - padding,
      this.emojiSize - padding
    );

    if (blur) {
      this.blur(canvas, blurRatio);
    }

    const image = new Image();
    image.src = canvas.toDataURL();

    this.layers.push({
      image,
      scale: (index < this.layersAmount / 2 ? 1.5 : 1) + Math.random(),
      top: Math.random() * this.height,
      left: Math.random() * this.width,
      rotate: 0,
      transform: {
        top: this.randomDirection(),
        left: this.randomDirection(),
        rotate: this.randomDirection() * Math.PI / 360,
      },
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

    this.layers.forEach(this.renderLayer);

    requestAnimationFrame(this.render);
  }

  renderLayer = (layer: Layer) => {
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
  }
}

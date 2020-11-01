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
  static emojis = ['1f30d', '1f31d', '1f31e', '1f31f', '1f32d', '1f32e', '1f336', '1f338', '1f33a', '1f33b', '1f33c', '1f33d', '1f33e', '1f33f', '1f341', '1f344', '1f345', '1f346', '1f349', '1f34a', '1f34b', '1f34c', '1f34d', '1f34e', '1f351', '1f353', '1f354', '1f355', '1f359', '1f35d', '1f35f', '1f364', '1f365', '1f366', '1f367', '1f369', '1f36a', '1f36c', '1f36f', '1f37f', '1f380', '1f382', '1f383', '1f384', '1f396', '1f397', '1f40c', '1f41e', '1f423', '1f42f', '1f431', '1f437', '1f438', '1f43a', '1f43b', '1f43c', '1f47a', '1f47b', '1f47d', '1f47e', '1f47f', '1f484', '1f48a', '1f48b', '1f48d', '1f48e', '1f49a', '1f49b', '1f49c', '1f49d', '1f4a9', '1f525', '1f52b', '1f600', '1f601', '1f602', '1f603', '1f604', '1f605', '1f606', '1f607', '1f608', '1f609', '1f60a', '1f60b', '1f60c', '1f60d', '1f60e', '1f60f', '1f610', '1f611', '1f612', '1f613', '1f614', '1f615', '1f616', '1f617', '1f618', '1f619', '1f61a', '1f61b', '1f61c', '1f61d', '1f61e', '1f61f', '1f620', '1f621', '1f622', '1f623', '1f624', '1f625', '1f626', '1f627', '1f628', '1f629', '1f62a', '1f62b', '1f62c', '1f62d', '1f62e', '1f62f', '1f630', '1f632', '1f633', '1f634', '1f635', '1f636', '1f637', '1f63a', '1f63b', '1f63c', '1f641', '1f642', '1f643', '1f910', '1f911', '1f912', '1f913', '1f914', '1f921', '1f922', '1f923', '1f924', '1f927', '1f928', '1f929', '1f92a', '1f92b', '1f92c', '1f92e', '1f92f', '1f958', '1f970', '1f973', '1f975', '1f976', '1f981', '1f989', '1f98a', '1f98c', '1f9a0', '1f9c0', '1f9c1', '1f9d0', '1f9db', '1f9e0', '1f9ec', '1f9ed', '1f9f2', '1f9fc', '23f0', '2600', '263a', '26bd', '2708'];

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

    this.fillLayers().then(layers => {
      this.layers = layers;

      this.render();
    });
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
      image.src = `/assets/emoji/${emoji}.svg`;
    });
  }

  async fillLayers() {
    const layersAmount = 99;

    const images = Array.from({ length: layersAmount }, async (_, index): Promise<[HTMLImageElement, number]> => {
      return [await this.loadEmoji(this.randomEmoji()), index];
    });

    const layers: Layer[] = [];

    for await (let [emoji, index] of images) {
      const blur = index < layersAmount / 2 ? 3 : 0;

      const canvas = document.createElement('canvas');
      canvas.width = this.emojiSize + blur * 2;
      canvas.height = this.emojiSize + blur * 2;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new NullContextError();
      }

      ctx.drawImage(emoji, blur, blur, canvas.width - blur, canvas.height - blur);

      if (blur) {
        this.blur(canvas, blur);
      }

      const image = new Image();
      image.src = canvas.toDataURL();

      layers.push({
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
      });
    }

    return layers;
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

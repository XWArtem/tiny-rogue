import { AnimatedSprite, Texture, Rectangle, Container } from 'pixi.js';

export class HeroAnimator extends Container {
    constructor(baseTexture, frameWidth, frameHeight, animationsConfig) {
        super();

        this.baseTexture = baseTexture.source
            ? baseTexture.source
            : baseTexture.baseTexture || baseTexture;

        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.animationsConfig = animationsConfig;

        this.animations = {};
        this._buildAnimations();

        this.sprite = new AnimatedSprite(this.animations.idle);
        this.sprite.animationSpeed = 0.15;
        this.sprite.anchor.set(0.5);
        this.pivot.set(0, 0);
        this.baseScale = 2;
        this.scale.set(this.baseScale);
        this.sprite.play();

        this.addChild(this.sprite);
    }

    _buildAnimations() {
        for (const key in this.animationsConfig) {
            const { row, frames } = this.animationsConfig[key];

            const textures = [];

            for (let i = 0; i < frames; i++) {
                const rect = new Rectangle(
                    i * this.frameWidth,
                    row * this.frameHeight,
                    this.frameWidth,
                    this.frameHeight
                );

                const texture = new Texture({
                    source: this.baseTexture.source || this.baseTexture,
                    frame: rect
                });

                textures.push(texture);
            }

            this.animations[key] = textures;
        }
    }

    play(name, loop = true, onComplete) {
        if (!this.animations[name]) {
            console.warn(`Animation "${name}" not found`);
            return;
        }

        this.sprite.textures = this.animations[name];
        this.sprite.loop = loop;
        if (!loop) {
            this.sprite.onComplete = () => {
                this.sprite.onComplete = null;
                if (onComplete) onComplete();
            };
        }

        this.sprite.gotoAndPlay(0);
    }
}
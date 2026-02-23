import { Container, Graphics, Text, TextStyle } from "pixi.js";

export class PerkSelector extends Container {
    constructor(perks) {
        super();

        this.perks = perks;
        this.cards = [];
        this.selectedIndex = null;

        this._build();
    }

    _build() {
        this.perks.forEach((perk, index) => {
            const card = new Container();
            card.eventMode = "static";
            card.cursor = "pointer";

            const bg = new Graphics();
            card.addChild(bg);

            const title = new Text({
                text: perk.title,
                style: new TextStyle({
                    fontFamily: "Jersey 15",
                    fill: "#ffffff",
                    align: "center",
                }),
            });
            title.anchor.set(0.5, 0);
            card.addChild(title);

            const desc = new Text({
                text: perk.description,
                style: new TextStyle({
                    fontFamily: "Jersey 15",
                    fill: "#cccccc",
                    align: "center",
                    wordWrap: true,
                }),
            });
            desc.anchor.set(0.5, 0);
            card.addChild(desc);

            card.bg = bg;
            card.title = title;
            card.desc = desc;

            card.on("pointerdown", () => {
                this.select(index);
            });

            this.cards.push(card);
            this.addChild(card);
        });
    }

    select(index) {
        this.selectedIndex = index;

        this.cards.forEach((card, i) => {
            card.bg.tint = i === index ? 0x4444ff : 0xffffff;
        });

        if (this.onSelect) {
            this.onSelect(this.perks[index]);
        }
    }

    resize(w, h) {
        const totalWidth = w * 0.92;
        const gap = totalWidth * 0.02;
        const cardWidth = (totalWidth - gap * 2) / 3;
        const cardHeight = h * 0.25;
        const startX = (w - totalWidth) * 0.5;

        this.cards.forEach((card, i) => {
            const x = startX + i * (cardWidth + gap);
            card.position.set(x, h * 0.25);

            card.bg.clear();
            card.bg.beginFill(0x222222);
            card.bg.drawRoundedRect(0, 0, cardWidth, cardHeight, 12);
            card.bg.endFill();

            const maxTitleFont = cardHeight * 0.18;
            card.title.style.wordWrap = true;
            card.title.style.wordWrapWidth = cardWidth * 0.9;
            card.title.style.fontSize = maxTitleFont;

            const approxCharPerLine = Math.floor(card.title.style.wordWrapWidth / (maxTitleFont * 0.6));
            const linesNeeded = Math.ceil(card.title.text.length / approxCharPerLine);
            if (linesNeeded > 2) {
                card.title.style.fontSize = maxTitleFont * 0.9;
            }

            card.title.position.set(cardWidth / 2, cardHeight * 0.1);

            const maxDescFont = cardHeight * 0.12;
            card.desc.style.wordWrap = true;
            card.desc.style.wordWrapWidth = cardWidth * 0.85;
            card.desc.style.fontSize = maxDescFont;
            card.desc.position.set(cardWidth / 2, cardHeight * 0.6);
        });
    }

    animateIn() {
        const startTime = performance.now();
        const duration = 200;
        const delayBetween = 100;

        this.cards.forEach((card, i) => {
            card.startY = card.y - 50;
            card.targetY = card.y;
            card.y = card.startY;
            card.alpha = 0;

            card.startTime = startTime + i * delayBetween;
        });

        const animate = (time) => {
            let allDone = true;

            this.cards.forEach((card) => {
                const t = Math.min(1, (time - card.startTime) / duration);
                if (t < 0) {
                    allDone = false;
                    return;
                }
                if (t < 1) allDone = false;

                card.y = card.startY + (card.targetY - card.startY) * t;
                card.alpha = t;
            });

            if (!allDone) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }
}

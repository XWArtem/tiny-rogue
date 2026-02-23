import { Container, Text, TextStyle } from "pixi.js";
import { BattleScene } from "./BattleScene.js";
import { Ticker } from 'pixi.js';

export class MenuScene extends Container {
    constructor(app, sceneManager) {
        super();
        this.app = app;
        this.sceneManager = sceneManager;
    }

    async init() {
        await document.fonts.load('10px "Jersey 15"');

        this.topBar = new Container();
        this.titleArea = new Container();
        this.contentArea = new Container();

        this.addChild(this.topBar, this.titleArea, this.contentArea);

        this.title = new Text({
            text: "TINY ROGUE",
            style: new TextStyle({
                fontFamily: "Jersey 15",
                fill: "#ffffff",
            }),
        });
        this.title.anchor.set(0.5);
        this.titleArea.addChild(this.title);

        this.credentials = new Text({
            text: "demo by XWArtem",
            style: new TextStyle({
                fontFamily: "Jersey 15",
                fill: "#888888",
            }),
        });
        this.credentials.anchor.set(1, 1);
        this.addChild(this.credentials);

        this.startButton = new Text({
            text: "START",
            style: new TextStyle({
                fontFamily: "Jersey 15",
                fill: "#ffffff",
            }),
        });
        this.startButton.anchor.set(0.5);
        this.startButton.eventMode = "static";
        this.startButton.cursor = "pointer";
        this.startButton.on("pointerdown", () => {
            this.sceneManager.change(BattleScene);
        });
        this.contentArea.addChild(this.startButton);

        this._startButtonOriginalScale = Math.max(1, this.startButton.scale.x);
        this._startButtonElapsed = 0;
        this._scaleAmount = 0.1;
        this._scaleDuration = 3;

        const ticker = new Ticker();

        ticker.add(() => {
            this._startButtonElapsed += ticker.deltaTime / 60;
            const t = (this._startButtonElapsed % this._scaleDuration) / this._scaleDuration;
            const factor = 1 + Math.sin(t * Math.PI * 2) * this._scaleAmount;
            this.startButton.scale.set(factor);
        });

        ticker.start();
    }

    resize(w, h) {
        const topH = h * 0.1;
        const titleH = h * 0.4;
        const contentH = h - topH - titleH;

        this.topBar.position.set(0, 0);
        this.titleArea.position.set(0, topH);
        this.contentArea.position.set(0, topH + titleH);

        this.title.style.fontSize = Math.min(w, h) * 0.12;
        this.startButton.style.fontSize = Math.min(w, h) * 0.07;
        this.credentials.style.fontSize = Math.min(w, h) * 0.03;

        this.title.position.set(w / 2, 0);
        this.startButton.position.set(w / 2, 0);
        this.credentials.position.set(w - 10, h - 10);
    }
}
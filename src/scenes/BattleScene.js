import { MenuScene } from "./MenuScene.js";
import { Container, Text, TextStyle, Texture, Assets, Sprite } from "pixi.js";
import { HeroAnimator } from "../core/HeroAnimator.js";
import { PerkSelector } from "../core/PerkSelector.js";
import { getRandomPerks } from "../core/PerksRegistry.js";
import { Character } from "../core/Character.js";

export class BattleScene extends Container {
    constructor(app, sceneManager) {
        super();
        this.app = app;
        this.sceneManager = sceneManager;
        this.turn = 1;
    }

    async init() {
        await this._createBackground();
        await this._loadAnimators();
        this._createHeroes();
        this._createUI();
        this._createPerks();
        this._bindEvents();
        this._updateStats();
        this.setAttackEnabled(false);
    }

    resize(w, h) {
        const margin = w * 0.05;

        if (this.bg) {
            this.bg.width = w;
            this.bg.height = h;
        }
        if (this.ground) {
            this.ground.width = w;
            const scaleY = this.ground.width / this.ground.texture.width;
            this.ground.height = this.ground.texture.height * scaleY;
            this.ground.y = h * 0.78;
        }

        this.label.position.set(w / 2, h * 0.05);
        this.btnBack.position.set(w - margin - this.btnBack.width / 2, h - margin * 0.5);
        this.btnAttack.position.set(w / 2, h - margin * 2);

        this.label.style.fontSize = Math.min(w, h) * 0.1;
        this.btnBack.style.fontSize = Math.min(w, h) * 0.04;
        this.btnAttack.style.fontSize = Math.min(w, h) * 0.08;

        if (this.hero) {
            this.hero.position.set(
                margin + this.hero.width / 4,
                h * 0.75
            );
        }

        if (this.enemy) {
            this.enemy.position.set(
                w - margin - this.enemy.width / 4, // 4, not 2. It works fine by experiment
                h * 0.75
            );
        }

        if (this.perkSelector) {
            this.perkSelector.resize(w, h);
        }

        if (this.hero && this.heroStatsText) {
            this.heroStatsText.position.set(this.hero.x, this.hero.y - 80);
            this.heroStatsText.anchor.set(0.5, 0.5);
            this.heroArmorText.position.set(this.hero.x, this.hero.y - 50);
            this.heroArmorText.anchor.set(0.5, 0.5);
        }

        if (this.enemy && this.enemyStatsText) {
            this.enemyStatsText.position.set(this.enemy.x, this.enemy.y - 80);
            this.enemyStatsText.anchor.set(0.5, 0.5);
            this.enemyArmorText.position.set(this.enemy.x, this.enemy.y - 50);
            this.enemyArmorText.anchor.set(0.5, 0.5);
        }

        if (this.hero && this.heroAttrText) {
            this.heroAttrText.position.set(this.hero.x, this.hero.y + 80);
            this.heroAttrText.anchor.set(0.5, 0.5);
        }

        if (this.enemy && this.enemyAttrText) {
            this.enemyAttrText.position.set(this.enemy.x, this.enemy.y + 80);
            this.enemyAttrText.anchor.set(0.5, 0.5);
        }
    }

    async _createBackground() {
        const texture = await Assets.load("res/sprites/pixel_bg.png");
        this.bg = new Sprite(texture);

        this.bg.width = this.app.screen.width;
        this.bg.height = this.app.screen.height;

        this.bg.alpha = 0.4;

        this.addChildAt(this.bg, 0);

        const groundTexture = await Assets.load("res/sprites/ground.png");
        this.ground = new Sprite(groundTexture);
        this.ground.width = this.app.screen.width;
        const scaleY = this.ground.width / groundTexture.width;
        this.ground.height = groundTexture.height * scaleY;
        this.ground.y = this.app.screen.height - this.ground.height; // here
        this.ground.alpha = 0.4;

        this.addChildAt(this.ground, 1);
    }

    setAttackEnabled(enabled) {
        this.btnAttack.eventMode = enabled ? "static" : "none";
        this.btnAttack.alpha = enabled ? 1 : 0.5;
    }

    _createUI() {
        this._createLabel();
        this._createTurnIndicator();
        this._createButtons();
        this._createHeroIndicators();
        this._createEndGameText();
    }

    _createTurnIndicator() {
        this.turnIndicator = new Text({
            text: `Turn: ${this.turn}`,
            style: new TextStyle({
                fontFamily: "Jersey 15",
                fill: "#966600",
            }),
        });

        this.turnIndicator.anchor.set(0.5);
        this.turnIndicator.alpha = 0.75;
        this.turnIndicator.position.set(this.app.screen.width / 2, this.app.screen.height * 0.1);
        this.addChild(this.turnIndicator);
    }

    _createLabel() {
        this.label = new Text({
            text: "DUEL # 1",
            style: new TextStyle({
                fontFamily: "Jersey 15",
                fill: "#966600",
            }),
        });

        this.label.anchor.set(0.5);
        this.addChild(this.label);
    }

    _createButtons() {
        this.btnBack = this._createButton("BACK");
        this.btnAttack = this._createButton("ATTACK");

        this.addChild(this.btnBack);
        this.addChild(this.btnAttack);
    }

    _createHeroIndicators() {
        this.heroStatsText = new Text("", { fontFamily: "Jersey 15", fill: "#00ff00", align: "left", fontSize: 24 });
        this.enemyStatsText = new Text("", { fontFamily: "Jersey 15", fill: "#ff4444", align: "right", fontSize: 24 });

        this.heroArmorText = new Text("", { fontFamily: "Jersey 15", fill: "#0099ff", align: "left", fontSize: 16 });
        this.enemyArmorText = new Text("", { fontFamily: "Jersey 15", fill: "#0099ff", align: "right", fontSize: 16 });

        this.heroAttrText = new Text("", { fontFamily: "Jersey 15", fill: "#aaaaaa", align: "left", fontSize: 16 });
        this.enemyAttrText = new Text("", { fontFamily: "Jersey 15", fill: "#aaaaaa", align: "right", fontSize: 16 });

        this.heroDamageContainer = new Container();
        this.enemyDamageContainer = new Container();

        this.addChild(this.heroStatsText);
        this.addChild(this.enemyStatsText);
        this.addChild(this.heroArmorText);
        this.addChild(this.enemyArmorText);
        this.addChild(this.heroAttrText);
        this.addChild(this.enemyAttrText);
        this.addChild(this.heroDamageContainer);
        this.addChild(this.enemyDamageContainer);
    }

    _createButton(text) {
        const btn = new Text({
            text,
            style: new TextStyle({
                fontFamily: "Jersey 15",
                fill: "#ffffff",
            }),
        });

        btn.anchor.set(0.5);
        btn.eventMode = "static";
        btn.cursor = "pointer";

        return btn;
    }

    async _loadAnimators() {
        await this._createHeroAnimator();
        await this._createEnemyAnimator();
    }

    async _createHeroAnimator() {
        const texture = await Assets.load("res/sprites/hero_0/hero_0_sprite_sheet.png");

        this.hero = new HeroAnimator(texture, 64, 64, {
            idle: { row: 0, frames: 4 },
            run: { row: 1, frames: 6 },
            attack: { row: 10, frames: 8 },
            takeDamage: { row: 4, frames: 4 }
        });

        this.hero.scale.set(2);
        this.hero.play("idle", true);

        this.addChild(this.hero);
    }

    async _createEnemyAnimator() {
        const texture = await Assets.load("res/sprites/hero_1/hero_1_sprite_sheet.png");

        this.enemy = new HeroAnimator(texture, 64, 64, {
            idle: { row: 0, frames: 4 },
            run: { row: 1, frames: 6 },
            attack: { row: 10, frames: 8 },
            takeDamage: { row: 4, frames: 4 }
        });

        this.enemy.scale.set(-2, 2)
        this.enemy.play("idle", true);

        this.addChild(this.enemy);
    }

    _createHeroes() {
        this.heroModel = new Character("Hero", { hp: 80, damage: 6, armor: 5, critChance: 0.05 });
        this.enemyModel = new Character("Enemy", { hp: 60, damage: 7, armor: 0 });
    }

    _createPerks() {
        const randomPerks = getRandomPerks(3);

        this.perkSelector = new PerkSelector(randomPerks);
        this.addChild(this.perkSelector);
        this.perkSelector.resize(this.app.screen.width, this.app.screen.height);
        this.perkSelector.animateIn();

        this.perkSelector.onSelect = (perk) => {
            this.selectedPerk = perk;
            this.setAttackEnabled(true);
        };
    }

    _updatePerks() {
        if (this.perkSelector) {
            this.removeChild(this.perkSelector);
        }

        const randomPerks = getRandomPerks(3);
        this.perkSelector = new PerkSelector(randomPerks);
        this.addChild(this.perkSelector);
        this.perkSelector.resize(this.app.screen.width, this.app.screen.height);

        this.perkSelector.animateIn();

        this.perkSelector.onSelect = (perk) => {
            this.selectedPerk = perk;
            this.setAttackEnabled(true);
        };

        this.setAttackEnabled(false);
    }

    _bindEvents() {
        this.btnBack.on("pointerdown", () => {
            this.sceneManager.change(MenuScene);
        });

        this.btnAttack.on("pointerdown", async () => {
            if (!this.selectedPerk) return;

            this.setAttackEnabled(false);
            this.perkSelector.visible = false;

            this.selectedPerk.apply(this.heroModel, this.enemyModel);
            this._updateStats();
            await delay(200);

            const resultHero = this.heroModel.attack(this.enemyModel);
            console.log("Hero attacks", resultHero);
            this.hero.play("attack", false, () => {
                this.hero.play("idle", true);
                this.enemy.play("takeDamage", false, () => {
                    this.enemy.play("idle", true);
                    this._updateStats();

                    if (resultHero.damageToShield) this._showDamage("enemy", resultHero.damageToShield, "shield", resultHero.isCritical);
                    if (resultHero.damageToHp) this._showDamage("enemy", resultHero.damageToHp, "hp", resultHero.isCritical);
                });
            });
            await delay(1500);

            if (!this.enemyModel.isAlive()) {
                console.log("You win!");
                this.showEndGameMessage(true);
                return;
            }

            const resultEnemy = this.enemyModel.attack(this.heroModel);
            console.log("Enemy attacks", resultEnemy);
            this.enemy.play("attack", false, () => {
                this.enemy.play("idle", true);
                this.hero.play("takeDamage", false, () => {
                    this.hero.play("idle", true);
                    this._updateStats();

                    if (resultEnemy.damageToShield) this._showDamage("hero", resultEnemy.damageToShield, "shield", resultEnemy.isCritical);
                    if (resultEnemy.damageToHp) this._showDamage("hero", resultEnemy.damageToHp, "hp", resultEnemy.isCritical);
                });
            });

            await delay(1500);
            if (!this.heroModel.isAlive()) {
                console.log("Game Over");
                this.showEndGameMessage(false);
                return;
            }
            await delay(1000);
            this._updatePerks();
            this.perkSelector.visible = true;
            this.selectedPerk = null;
            this.setAttackEnabled(false);
            this.turn++;
            this.turnIndicator.text = `Turn: ${this.turn}`;
        });
    }

    _updateStats() {
        this.heroStatsText.text = `HP: ${this.heroModel.hp}/${this.heroModel.maxHp}`;
        this.enemyStatsText.text = `HP: ${this.enemyModel.hp}/${this.enemyModel.maxHp}`;

        this.heroArmorText.text = `Armor: ${this.heroModel.armor}`;
        this.enemyArmorText.text = `Armor: ${this.enemyModel.armor}`;

        this.heroAttrText.text =
            `Damage: ${this.heroModel.damage}\n` +
            `Crit: ${(this.heroModel.critChance * 100).toFixed(0)}%\n` +
            `Crit Multiplier: ${this.heroModel.critMultiplier}\n` +
            `Vampirism: ${(this.heroModel.lifeSteal * 100).toFixed(0)}%`;

        this.enemyAttrText.text =
            `Damage: ${this.enemyModel.damage}\n` +
            `Crit: ${(this.enemyModel.critChance * 100).toFixed(0)}%\n` +
            `Crit Multiplier: ${this.enemyModel.critMultiplier}\n` +
            `Vampirism: ${(this.enemyModel.lifeSteal * 100).toFixed(0)}%`;
    }

    _showDamage(target, amount, type = "hp", isCritical = false) {
        if (amount <= 0) return;

        const dmgText = new Text(amount.toString(), {
            fontFamily: "Jersey 15",
            fill: type === "hp" ? 0xff0000 : 0x0099ff, // red or blue
            fontSize: isCritical ? 64 : 24,
            stroke: 0x000000,
            strokeThickness: 2
        });
        dmgText.anchor.set(0.5);

        const container = target === "hero" ? this.heroDamageContainer : this.enemyDamageContainer;
        const refSprite = target === "hero" ? this.hero : this.enemy;

        const extraOffset = type === "hp" ? -20 : 0;
        dmgText.x = target === "hero" ? refSprite.x + refSprite.width / 2 + 10 + extraOffset : refSprite.x - refSprite.width / 2 - 10 - extraOffset;
        dmgText.y = refSprite.y - 20 + extraOffset;

        container.addChild(dmgText);

        const startTime = performance.now();
        const duration = isCritical ? 1800 : 1000;
        const startY = dmgText.y;
        const endY = isCritical ? (startY - 10) : (startY - 30);

        const animate = (time) => {
            const t = Math.min(1, (time - startTime) / duration);
            dmgText.y = startY + (endY - startY) * t;
            dmgText.alpha = 1 - t;

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                container.removeChild(dmgText);
            }
        };

        requestAnimationFrame(animate);
    }

    _createEndGameText() {
        this.endGameText = new Text("", {
            fontFamily: "Jersey 15",
            fill: "#ffffff",
            fontSize: Math.min(this.app.screen.width, this.app.screen.height) * 0.1,
            align: "center",
            stroke: "#000000",
            strokeThickness: 4,
        });
        this.endGameText.anchor.set(0.5);
        this.endGameText.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
        this.endGameText.visible = false;
        this.addChild(this.endGameText);
    }

    showEndGameMessage(win) {
        this.endGameText.text = win ? "Well done!" : "You lose";
        this.endGameText.visible = true;
    }
}



function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export class SceneManager {
    constructor(app) {
        this.app = app;
        this.currentScene = null;
    }

    async change(SceneClass) {
        if (this.currentScene) {
            this.currentScene.destroy();
            this.app.stage.removeChild(this.currentScene);
        }

        this.currentScene = new SceneClass(this.app, this);
        this.app.stage.addChild(this.currentScene);

        if (this.currentScene.init) {
            await this.currentScene.init();
        }

        this.resize();
    }

    resize() {
        if (this.currentScene && this.currentScene.resize) {
            this.currentScene.resize(
                this.app.screen.width,
                this.app.screen.height
            );
        }
    }
}
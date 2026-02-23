import { Application } from "pixi.js";
import { SceneManager } from "./core/SceneManager.js";
import { MenuScene } from "./scenes/MenuScene.js";

const app = new Application();
const container = document.getElementById("pixi-container");

if (!container) throw new Error("Missing #pixi-container");

await app.init({
  background: "#000000",
  resizeTo: container,
  autoDensity: true,
});

container.appendChild(app.canvas);

const sceneManager = new SceneManager(app);
await sceneManager.change(MenuScene);

window.addEventListener("resize", () => {
  requestAnimationFrame(() => {
    app.resize();
    sceneManager.resize();
  });
});

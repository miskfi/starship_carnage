import * as Colfio from 'colfio';
import {KeyInputComponent} from "colfio";
import {PlayerController} from "./player";
import {enemyCircleEmitter} from "./factory";

class Game
{
    engine: Colfio.Engine;

    constructor()
    {
        this.engine = new Colfio.Engine();
        let canvas = (document.getElementById('gameCanvas') as HTMLCanvasElement);

        // init the game loop
        this.engine.init(canvas, {
            resizeToScreen: true,
            width: 800,
            height: 600,
            resolution: 1,
        });

        this.initGame();
    }

    initGame() {
        const keyInput = new KeyInputComponent();
        this.engine.scene.addGlobalComponent(keyInput);
        this.engine.scene.assignGlobalAttribute("key_input", keyInput);

        // create the player square
        const player = new Colfio.Graphics();
        player.beginFill(0xFFFFFF);
        player.drawRect(0, 0, 40, 40);
        player.position.set(this.engine.scene.width/2, this.engine.scene.height - 40);
        player["name"] = "PLAYER";
        player.endFill();

        player.addComponent(new PlayerController(player.id));
        this.engine.scene.stage.addChild(player);

        // create enemy circle
        const enemy = enemyCircleEmitter(this.engine.scene);
        this.engine.scene.stage.addChild(enemy);
    }

}

// this will create a new instance as soon as this file is loaded
export default new Game();
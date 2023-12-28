import * as Colfio from 'colfio';
import {KeyInputComponent} from 'colfio';

import {CollisionTrigger} from "./collisions/collision_trigger";
import {Attributes} from "./constants";
import {GameManager} from "./game_manager";
import {CollisionResolver} from "./collisions/collision_resolver";
import {SceneManager} from "./scene_manager";

export class GameState
{
    isRunning: boolean
}

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

    initGame()
    {
        const keyInput = new KeyInputComponent();
        this.engine.scene.assignGlobalAttribute(Attributes.KEY_INPUT, keyInput);
        this.engine.scene.addGlobalComponent(keyInput);
        this.engine.scene.addGlobalComponent(new CollisionTrigger());
        this.engine.scene.addGlobalComponent(new CollisionResolver());
        this.engine.scene.addGlobalComponent(new GameManager());
        this.engine.scene.addGlobalComponent(new SceneManager());
    }
}

// this will create a new instance as soon as this file is loaded
export default new Game();
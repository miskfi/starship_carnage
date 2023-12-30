import * as Colfio from 'colfio';
import {KeyInputComponent} from 'colfio';
import {sound} from "@pixi/sound";
import {Loader} from '@pixi/loaders';

import {CollisionTrigger} from "./collisions/collision_trigger";
import {Assets, GlobalAttributes} from "./constants/enums";
import {GameManager} from "./game_manager";
import {CollisionResolver} from "./collisions/collision_resolver";
import {SceneManager} from "./scene_manager";
import {SoundSystem} from "./components/sound";

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
            antialias: true
        });

        sound.add(Assets.SOUND_SHOT, "sounds/shot.wav");
        sound.add(Assets.SOUND_MUSIC_GAME, "sounds/music_game.wav");
        sound.add(Assets.SOUND_MUSIC_MENU, "sounds/music_menu.wav");
        sound.add(Assets.SOUND_GAME_OVER, "sounds/game_over.wav");
        sound.add(Assets.SOUND_GAME_WON, "sounds/game_won.wav");
        sound.add(Assets.SOUND_BUTTON_CHANGE, "sounds/button_change.wav");
        sound.add(Assets.SOUND_ENEMY_DESTROYED, "sounds/break.wav");

        const loader = new Loader();
        loader
            .reset()
            .add("font", "font.fnt")
            .load(() => this.initGame());
    }

    initGame()
    {
        const keyInput = new KeyInputComponent();
        this.engine.scene.assignGlobalAttribute(GlobalAttributes.KEY_INPUT, keyInput);
        this.engine.scene.addGlobalComponent(keyInput);
        this.engine.scene.addGlobalComponent(new CollisionTrigger());
        this.engine.scene.addGlobalComponent(new CollisionResolver());
        this.engine.scene.addGlobalComponent(new SoundSystem());
        this.engine.scene.addGlobalComponent(new GameManager());
        this.engine.scene.addGlobalComponent(new SceneManager());
    }
}

// this will create a new instance as soon as this file is loaded
export default new Game();
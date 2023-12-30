import * as Colfio from 'colfio';
import * as PIXI from  "pixi.js";
import {KeyInputComponent} from 'colfio';
import {sound} from "@pixi/sound";
import {Loader} from '@pixi/loaders';

import {CollisionTrigger} from "./collisions/collision_trigger";
import {GameAssets, GlobalAttributes} from "./constants/enums";
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
    loader: Loader;

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
            antialias: false,
        });

        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

        sound.add(GameAssets.SOUND_SHOT, "sounds/shot.wav");
        sound.add(GameAssets.SOUND_MUSIC_GAME, "sounds/music_game.wav");
        sound.add(GameAssets.SOUND_MUSIC_MENU, "sounds/music_menu.wav");
        sound.add(GameAssets.SOUND_GAME_OVER, "sounds/game_over.wav");
        sound.add(GameAssets.SOUND_LEVEL_FINISHED, "sounds/game_won.wav");
        sound.add(GameAssets.SOUND_BUTTON_CHANGE, "sounds/button_change.wav");
        sound.add(GameAssets.SOUND_ENEMY_DESTROYED, "sounds/break.wav");

        this.loader = new Loader();
        this.loader
            .reset()
            .add("font/font.fnt")
            .add(GameAssets.SPRITESHEET_ENEMIES, "spritesheets/enemies.png")
            .add(GameAssets.SPRITESHEET_PLAYER_1, "spritesheets/ship.png")
            .add(GameAssets.SPRITESHEET_PLAYER_2, "spritesheets/ship2.png")
            .add(GameAssets.SPRITESHEET_PROJECTILES, "spritesheets/laser-bolts.png")
            .add(GameAssets.BACKGROUND, "background.png")
            .add(GameAssets.LEVELS, "levels/levels.json")
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
        this.engine.scene.addGlobalComponent(new SceneManager(this.loader.resources[GameAssets.LEVELS].data));
    }
}

// this will create a new instance as soon as this file is loaded
export default new Game();
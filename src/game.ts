import * as Colfio from 'colfio';
import * as PIXI from  "pixi.js";
import {KeyInputComponent} from 'colfio';
import {sound} from "@pixi/sound";
import {Loader} from '@pixi/loaders';

import {GameAssets, GlobalAttributes} from "./constants/enums";
import {GameModel} from "./game_model";
import {CollisionResolver} from "./collisions/collision_resolver";
import {SceneManager} from "./components/scene_manager";
import {SoundComponent} from "./components/sound";
import {GAME_HEIGHT, GAME_WIDTH} from "./constants/constants";
import {GameManager} from "./components/game_manager";

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
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
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
        sound.add(GameAssets.SOUND_PLAYER_HIT, "sounds/player_hit.wav");

        this.loader = new Loader();
        this.loader
            .reset()
            .add("font/font.fnt")
            .add(GameAssets.SPRITESHEET_ENEMIES, "spritesheets/enemies.png")
            .add(GameAssets.SPRITESHEET_PLAYER_1, "spritesheets/ship.json")
            .add(GameAssets.SPRITESHEET_PLAYER_2, "spritesheets/ship2.json")
            .add(GameAssets.SPRITESHEET_PROJECTILES, "spritesheets/laser-bolts.png")
            .add(GameAssets.BACKGROUND, "background.png")
            .add(GameAssets.SPRITE_HEART, "heart.png")
            .add(GameAssets.LEVELS, "levels/levels.json")
            .load(() => this.initGame());
    }

    initGame()
    {
        const sheet1 = this.loader.resources[GameAssets.SPRITESHEET_PLAYER_1].spritesheet;
        const sheet2 = this.loader.resources[GameAssets.SPRITESHEET_PLAYER_2].spritesheet;
        const levels = this.loader.resources[GameAssets.LEVELS].data;

        this.engine.scene.assignGlobalAttribute(GlobalAttributes.GAME_MODEL, new GameModel(levels));
        this.engine.scene.addGlobalComponent(new KeyInputComponent());
        this.engine.scene.addGlobalComponent(new CollisionResolver());
        this.engine.scene.addGlobalComponent(new SoundComponent());
        this.engine.scene.addGlobalComponent(new GameManager());
        this.engine.scene.addGlobalComponent(new SceneManager(sheet1, sheet2));
    }
}

// this will create a new instance as soon as this file is loaded
export default new Game();
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
            antialias: true,
        });

        sound.add(GameAssets.SOUND_SHOT, "sounds/shot.wav");
        sound.add(GameAssets.SOUND_MUSIC_GAME, "sounds/music_game.wav");
        sound.add(GameAssets.SOUND_MUSIC_MENU, "sounds/music_menu.wav");
        sound.add(GameAssets.SOUND_GAME_OVER, "sounds/game_over.wav");
        sound.add(GameAssets.SOUND_GAME_WON, "sounds/game_won.wav");
        sound.add(GameAssets.SOUND_BUTTON_CHANGE, "sounds/button_change.wav");
        sound.add(GameAssets.SOUND_ENEMY_DESTROYED, "sounds/break.wav");

        const loader = new Loader();
        loader
            .reset()
            .add("font.fnt")
            .add(GameAssets.SPRITESHEET_PLAYER_1, "spritesheets/ship.png")
            .add(GameAssets.SPRITESHEET_PLAYER_2, "spritesheets/ship2.png")
            .add(GameAssets.SPRITESHEET_PROJECTILES, "spritesheets/laser-bolts.png")
            .load(() => this.initGame());
    }

    initGame()
    {
        let sprite = new Colfio.Sprite('mySprite', PIXI.Texture.from("warrior"));
        sprite.position.set(this.engine.app.screen.width / 2, this.engine.app.screen.height / 2);
        sprite.anchor.set(0.5);
        this.engine.scene.stage.addChild(sprite);


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
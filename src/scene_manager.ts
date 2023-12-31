import * as Colfio from 'colfio';
import {Attributes, GlobalAttributes, Messages, Tags} from "./constants/enums";
import {MainMenu} from "./scenes/main_menu";
import {GameWon, GameOver, LevelFinished} from "./scenes/level_finished_lost";
import {createBackground, createEnemyCircle, createPlayer, createStatusBar} from "./factory";
import {GameState} from "./game";
import {
    GAME_HEIGHT,
    GAME_WIDTH,
    P1_CONTROLS,
    P2_CONTROLS,
    PROJECTILES_MAX,
    SINGLEPLAYER_CONTROLS
} from "./constants/constants"
import {Level, LevelParser} from "./level";

export class SceneManager extends Colfio.Component
{
    currentSceneComponent?: Colfio.Component;

    levelsSingleplayer: Level[];
    levelsMultiplayer: Level[];
    currentLevelSingleplayer: number;
    currentLevelMultiplayer: number;

    constructor(levelData) {
        super();
        this.loadLevels(levelData);
    }

    onInit()
    {
        this.subscribe(
            Messages.LEVEL_START,
            Messages.GAME_OVER,
            Messages.LEVEL_FINISHED,
            Messages.MAIN_MENU,
            Messages.PLAYER_HIT,
            Messages.PLAYER_DEAD,
            Messages.PROJECTILE_DESTROYED,
            Messages.ENEMY_DESTROYED
        );
        this.currentSceneComponent = null;

        this.sendMessage(Messages.MAIN_MENU);
        this.loadSceneComponent(MainMenu);
    }

    onMessage(msg: Colfio.Message): any
    {
        if (msg.action === Messages.LEVEL_START)
        {
            const players = msg.data as number;
            this.scene.assignGlobalAttribute(GlobalAttributes.PLAYERS_COUNT, players);
            this.scene.assignGlobalAttribute(GlobalAttributes.GAME_MODE, players);
            this.loadLevel(players);
        }
        if (msg.action === Messages.LEVEL_FINISHED)
        {
            const players = this.scene.getGlobalAttribute(GlobalAttributes.GAME_MODE);
            let gameWon = false;

            if (players === 1)
            {
                this.currentLevelSingleplayer++;
                if (this.currentLevelSingleplayer === this.levelsSingleplayer.length)
                    gameWon = true;
            }
            else
            {
                this.currentLevelMultiplayer++;
                if (this.currentLevelMultiplayer === this.levelsMultiplayer.length)
                    gameWon = true;
            }

            this.scene.callWithDelay(200, () => this.loadSceneComponent(gameWon ? GameWon : LevelFinished));
        }
        else if (msg.action === Messages.MAIN_MENU)
            this.loadSceneComponent(MainMenu);
        else if (msg.action === Messages.GAME_OVER)
            this.scene.callWithDelay(200, () => this.loadSceneComponent(GameOver));
        else if (msg.action === Messages.PLAYER_HIT)
            this.overlayFlash();
        else if (msg.action === Messages.PLAYER_DEAD)
        {
            const player = msg.data as Colfio.Container;
            player.destroy();
        }
        else if (msg.action === Messages.PROJECTILE_DESTROYED)
        {
            const projectileToDestroy = msg.data as Colfio.Container;
            projectileToDestroy.destroy();
        }
        else if (msg.action === Messages.ENEMY_DESTROYED)
        {
            const enemyToDestroy = msg.data as Colfio.Container;
            enemyToDestroy.destroy();
        }
    }

    loadLevel(players: number)
    {
        this.removePreviousComponent();

        // TODO přesunout nastavování atributů spíš do game modelu
        this.scene.assignGlobalAttribute(GlobalAttributes.ENEMIES_COUNT, 0);
        this.scene.assignGlobalAttribute(GlobalAttributes.PROJECTILES_MAX, PROJECTILES_MAX);

        let level: Level;
        let levelNumber: number;
        if (this.scene.getGlobalAttribute(GlobalAttributes.GAME_MODE) === 1)
        {
            level = this.levelsSingleplayer[this.currentLevelSingleplayer];
            levelNumber = this.currentLevelSingleplayer;
        }
        else
        {
            level = this.levelsMultiplayer[this.currentLevelMultiplayer];
            levelNumber = this.currentLevelMultiplayer;
        }

        createStatusBar(this.scene, levelNumber, players);
        this.owner.scene.stage.addChild(createBackground(this.scene));
        this.loadPlayers(players);

        // load enemies
        for (let enemyType of level.enemies)
        {
            const enemy = createEnemyCircle(this.scene, enemyType);
            this.owner.scene.stage.addChild(enemy);
        }

        this.scene.assignGlobalAttribute(GlobalAttributes.GAME_STATE, {isRunning: true} as GameState);
    }

    loadPlayers(players: number)
    {
        if (players === 1)
        {
            const player = createPlayer(this.scene, this.scene.width / 2, 1);
            player.assignAttribute(Attributes.CONTROLS, SINGLEPLAYER_CONTROLS);
            this.owner.scene.stage.addChild(player);
        }
        if (players === 2)
        {
            const player1 = createPlayer(this.scene, this.scene.width / 4, 1);
            player1.assignAttribute(Attributes.CONTROLS, P1_CONTROLS);
            this.owner.scene.stage.addChild(player1);

            const player2 = createPlayer(this.scene, this.scene.width / 4 * 3, 2);
            player2.assignAttribute(Attributes.CONTROLS, P2_CONTROLS);
            this.owner.scene.stage.addChild(player2);
        }
    }

    loadSceneComponent(componentType)
    {
        this.clearGameElements();
        this.removePreviousComponent();
        const component = new componentType();
        this.scene.addGlobalComponent(component);
        this.currentSceneComponent = component;
    }

    removePreviousComponent()
    {
        if (this.currentSceneComponent !== null)
            this.scene.removeGlobalComponent(this.scene.findGlobalComponentByName(this.currentSceneComponent.name));
        this.currentSceneComponent = null;
    }

    loadLevels(levelData)
    {
        const parser = new LevelParser();
        this.levelsSingleplayer = parser.parseSingleplayer(levelData);
        this.levelsMultiplayer = parser.parseMultiplayer(levelData);
        this.currentLevelSingleplayer = 0;
        this.currentLevelMultiplayer = 0;
    }

    overlayFlash()
    {
        let overlay = new Colfio.Graphics();
        overlay.beginFill(0xFF0000, 0.3);
        overlay.drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        this.owner.scene.stage.addChild(overlay);

        this.owner.scene.callWithDelay(200, () => overlay.destroy());
    }

    clearGameElements()
    {
        const projectiles = this.owner.scene.findObjectsByTag(Tags.PLAYER_PROJECTILE) as Colfio.Container[];
        const players = this.owner.scene.findObjectsByTag(Tags.PLAYER) as Colfio.Container[];
        const enemies = this.owner.scene.findObjectsByTag(Tags.ENEMY_CIRCLE) as Colfio.Container[];
        const background = this.owner.scene.findObjectByTag(Tags.BACKGROUND) as Colfio.Container;
        const statusBar = this.owner.scene.findObjectByTag(Tags.STATUS_BAR) as Colfio.Container;

        const objects = [...players, ...projectiles, ...enemies, background, statusBar];

        for (let obj of objects)
            obj?.destroy();
    }
}
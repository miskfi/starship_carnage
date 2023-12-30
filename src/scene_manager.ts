import * as Colfio from 'colfio';
import {Attributes, GlobalAttributes, Messages} from "./constants/enums";
import {MainMenu} from "./scenes/main_menu";
import {GameWon, GameOver, LevelFinished} from "./scenes/level_finished_lost";
import {createBackground, createEnemyCircle, createPlayer} from "./factory";
import {GameState} from "./game";
import {P1_CONTROLS, P2_CONTROLS, PROJECTILES_MAX, SINGLEPLAYER_CONTROLS} from "./constants/constants"
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
        this.subscribe(Messages.LEVEL_START, Messages.GAME_OVER, Messages.LEVEL_FINISHED, Messages.MAIN_MENU);
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

            this.loadSceneComponent(gameWon ? GameWon : LevelFinished);
        }
        else if (msg.action === Messages.MAIN_MENU)
            this.loadSceneComponent(MainMenu);
        else if (msg.action === Messages.GAME_OVER)
            this.loadSceneComponent(GameOver);
    }

    loadLevel(players: number)
    {
        this.removePreviousComponent();

        // TODO přesunout nastavování atributů spíš do game modelu
        this.scene.assignGlobalAttribute(GlobalAttributes.ENEMIES_COUNT, 0);
        this.scene.assignGlobalAttribute(GlobalAttributes.PROJECTILES_MAX, PROJECTILES_MAX);

        this.owner.scene.stage.addChild(createBackground(this.scene));
        this.loadPlayers(players);

        const level = this.scene.getGlobalAttribute(GlobalAttributes.GAME_MODE) === 1
            ? this.levelsSingleplayer[this.currentLevelSingleplayer]
            : this.levelsMultiplayer[this.currentLevelMultiplayer];

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
}
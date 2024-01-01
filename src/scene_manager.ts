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
    SINGLEPLAYER_CONTROLS
} from "./constants/constants"
import {GameModel} from "./game_model";
import {EnemyType, EnemyTypeOrder} from "./constants/enemy_attributes";

export class SceneManager extends Colfio.Component
{
    currentSceneComponent?: Colfio.Component;

    spritesheet1;
    spritesheet2;

    constructor(spritesheet1, spritesheet2) {
        super();
        this.spritesheet1 = spritesheet1;
        this.spritesheet2 = spritesheet2;
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
            this.loadLevel();
        if (msg.action === Messages.LEVEL_FINISHED)
        {
            const gameWon = msg.data as boolean;
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
            const enemyType = enemyToDestroy.getAttribute<EnemyType>(Attributes.ENEMY_TYPE);
            const enemyPosition: [number, number] = [enemyToDestroy.position.x, enemyToDestroy.position.y];

            if (enemyType !== EnemyType.SMALLEST)
            {
                let flipXMovement: number;

                const velocity = enemyToDestroy.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);
                if (velocity.x < 0)
                    flipXMovement = -1;
                else
                    flipXMovement = 1;

                const enemyLeft = createEnemyCircle(
                    this.scene,
                    EnemyTypeOrder[EnemyTypeOrder.indexOf(enemyType) + 1],
                    [enemyPosition[0] - 10, enemyPosition[1]],
                    new Colfio.Vector(-velocity.x * flipXMovement, velocity.y).normalize()
                );
                const enemyRight = createEnemyCircle(
                    this.scene,
                    EnemyTypeOrder[EnemyTypeOrder.indexOf(enemyType) + 1],
                    [enemyPosition[0] + 10, enemyPosition[1]],
                    new Colfio.Vector(velocity.x * flipXMovement, velocity.y).normalize()
                );

                this.scene.stage.addChild(enemyLeft);
                this.scene.stage.addChild(enemyRight);
            }

            enemyToDestroy.destroy();
        }
    }

    loadLevel()
    {
        this.removePreviousComponent();

        const gameModel = this.scene.findGlobalComponentByName<GameModel>("GameModel");
        const level = gameModel.getCurrentLevel();
        const levelNumber = gameModel.getCurrentLevelNumber();
        const players = gameModel.gameMode;

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
            const player = createPlayer(this.scene, this.scene.width / 2, 1, this.spritesheet1);
            player.assignAttribute(Attributes.CONTROLS, SINGLEPLAYER_CONTROLS);
            this.owner.scene.stage.addChild(player);
        }
        if (players === 2)
        {
            const player1 = createPlayer(this.scene, this.scene.width / 4, 1, this.spritesheet1);
            player1.assignAttribute(Attributes.CONTROLS, P1_CONTROLS);
            this.owner.scene.stage.addChild(player1);

            const player2 = createPlayer(this.scene, this.scene.width / 4 * 3, 2, this.spritesheet2);
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
        // TODO tady by stačilo jenom destroynout celý nadřazený Container
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
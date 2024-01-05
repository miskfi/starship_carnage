import * as Colfio from 'colfio';

import {Attributes, GlobalAttributes, Messages, Tags} from "../constants/enums";
import {MainMenu} from "../scenes/main_menu";
import {GameWon, GameOver, LevelFinished} from "../scenes/level_finished_lost";
import {createBackground, createEnemyCircle, createPlayer, createProjectile, createStatusBar} from "../factory";
import {GameState} from "../game";
import {
    ENEMY_SIZE,
    GAME_HEIGHT,
    GAME_WIDTH,
    P1_CONTROLS,
    P2_CONTROLS,
    SINGLEPLAYER_CONTROLS
} from "../constants/constants"
import {EnemyType, EnemyTypeAttributes, EnemyTypeOrder} from "../constants/enemy_attributes";
import {GameModel} from "../game_model";

export class SceneManager extends Colfio.Component
{
    private currentSceneComponent?: Colfio.Component;

    private readonly spritesheet1;
    private readonly spritesheet2;

    constructor(spritesheet1, spritesheet2) {
        super();
        this.spritesheet1 = spritesheet1;
        this.spritesheet2 = spritesheet2;
        this.currentSceneComponent = null;
    }

    onInit()
    {
        this.subscribe(
            Messages.ENEMY_DESTROYED,
            Messages.GAME_OVER,
            Messages.LEVEL_FINISHED,
            Messages.LEVEL_START,
            Messages.MAIN_MENU,
            Messages.PLAYER_HIT,
            Messages.PLAYER_DEAD,
            Messages.PROJECTILE_DESTROYED,
            Messages.PROJECTILE_SHOT
        );

        this.sendMessage(Messages.MAIN_MENU);
        this.loadSceneComponent(MainMenu);
    }

    onMessage(msg: Colfio.Message): any
    {
        switch (msg.action)
        {
            case Messages.ENEMY_DESTROYED:
                this.onEnemyDestroyed(msg);
                break;

            case Messages.GAME_OVER:
                this.scene.callWithDelay(200, () => this.loadSceneComponent(GameOver));
                break;

            case Messages.LEVEL_FINISHED:
                const gameWon = msg.data as boolean;
                this.scene.callWithDelay(200, () => this.loadSceneComponent(gameWon ? GameWon : LevelFinished));
                break;

            case Messages.LEVEL_START:
                this.loadLevel();
                break;

            case Messages.MAIN_MENU:
                this.loadSceneComponent(MainMenu);
                break;

            case Messages.PLAYER_HIT:
                this.overlayFlash();
                break;

            case Messages.PLAYER_DEAD:
                const player = msg.data as Colfio.Container;
                player.destroy();
                break;

            case Messages.PROJECTILE_DESTROYED:
                const projectileToDestroy = msg.data as Colfio.Container;
                projectileToDestroy.destroy();
                break;

            case Messages.PROJECTILE_SHOT:
                const parentContainer = this.owner.scene.findObjectByTag(Tags.GAME_OBJECT_CONTAINER);
                createProjectile(this.scene, msg.data, parentContainer);
                break;
        }
    }

    private onEnemyDestroyed(msg: Colfio.Message)
    {
        const enemyToDestroy = msg.data as Colfio.Container;
        const enemyType = enemyToDestroy.getAttribute<EnemyType>(Attributes.ENEMY_TYPE);
        const enemyPosition: [number, number] = [enemyToDestroy.position.x, enemyToDestroy.position.y];

        if (enemyType !== EnemyType.SMALLEST)
        {
            const velocity = enemyToDestroy.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);

            let flipXMovement: number;
            velocity.x < 0 ? flipXMovement = -1 : flipXMovement = 1;

            const parentContainer = this.owner.scene.findObjectByTag(Tags.GAME_OBJECT_CONTAINER);
            const newType = EnemyTypeOrder[EnemyTypeOrder.indexOf(enemyType) + 1];

            // create two new offsprings approximately a diameter apart (a small margin [5 in this case] is subtracted
            // to make this split more natural as both offsprings immediately start drifting away from each other
            const changeX = EnemyTypeAttributes[newType]["size"] * ENEMY_SIZE / 2 - 5;

            createEnemyCircle(
                this.scene,
                newType,
                parentContainer,
                [enemyPosition[0] - changeX, enemyPosition[1]],
                new Colfio.Vector(-velocity.x * flipXMovement, velocity.y).normalize()
            );
            createEnemyCircle(
                this.scene,
                newType,
                parentContainer,
                [enemyPosition[0] + changeX, enemyPosition[1]],
                new Colfio.Vector(velocity.x * flipXMovement, velocity.y).normalize()
            );
        }

        enemyToDestroy.destroy();
    }

    private loadLevel()
    {
        this.removePreviousComponent();

        const gameModel = this.scene.getGlobalAttribute<GameModel>(GlobalAttributes.GAME_MODEL);
        const level = gameModel.getCurrentLevel();
        const levelNumber = gameModel.getCurrentLevelNumber();
        const players = gameModel.gameMode;

        const gameObjectContainer = new Colfio.Builder(this.owner.scene)
            .withTag(Tags.GAME_OBJECT_CONTAINER)
            .asContainer()
            .build();
        this.owner.scene.stage.addChild(gameObjectContainer);

        createStatusBar(this.scene, levelNumber, players, gameObjectContainer);
        createBackground(this.scene, gameObjectContainer);

        if (players === 1)
            createPlayer(this.scene, this.scene.width / 2, 1, this.spritesheet1, gameObjectContainer, SINGLEPLAYER_CONTROLS);
        if (players === 2)
        {
            createPlayer(this.scene, this.scene.width / 4, 1, this.spritesheet1, gameObjectContainer, P1_CONTROLS);
            createPlayer(this.scene, this.scene.width / 4 * 3, 2, this.spritesheet2, gameObjectContainer, P2_CONTROLS);
        }

        for (let enemyType of level.enemies)
            createEnemyCircle(this.scene, enemyType, gameObjectContainer);

        this.scene.assignGlobalAttribute(GlobalAttributes.GAME_STATE, {isRunning: true} as GameState);
    }

    private loadSceneComponent(componentType)
    {
        this.owner.scene.findObjectByTag(Tags.GAME_OBJECT_CONTAINER)?.destroy();  // clear all game objects
        this.removePreviousComponent();

        const component = new componentType();
        this.scene.addGlobalComponent(component);
        this.currentSceneComponent = component;
    }

    private removePreviousComponent()
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
}
import * as Colfio from 'colfio';
import * as PIXI from 'pixi.js';

import {ProjectileController} from "./components/projectile_controller";
import {EnemyController} from "./components/enemy_controller";
import {Attributes, GameAssets, GlobalAttributes, Tags} from "./constants/enums";
import {PlayerController} from "./components/player_controller";
import {getRandomInteger} from "./utils";
import {EnemyType, EnemyTypeAttributes} from "./constants/enemy_attributes";
import {
    ENEMY_SIZE, GAME_HEIGHT,
    PLAYER_HEIGHT, PLAYER_LIVES,
    PLAYER_WIDTH,
    PROJECTILE_SIZE,
    PROJECTILES_MAX, STATUS_BAR_HEIGHT,
    TEXTURE_SCALE
} from "./constants/constants";
import {HealthBarController} from "./components/health_bar_controller";

export const createProjectile = (scene: Colfio.Scene, player: Colfio.Container): Colfio.Sprite =>
{
    const playerNumber = player.getAttribute<number>(Attributes.PLAYER_NUMBER);
    let texture = PIXI.Texture.from(GameAssets.SPRITESHEET_PROJECTILES).clone();
    texture.frame = new PIXI.Rectangle(playerNumber == 1 ? 6: 20, 7, PROJECTILE_SIZE, PROJECTILE_SIZE);

    let projectile = new Colfio.Sprite("Projectile", texture);
    projectile.scale.set(TEXTURE_SCALE);
    projectile.position.set(player.position.x + player.width/2, player.position.y + player.height/2);
    projectile.addTag(Tags.PLAYER_PROJECTILE);
    projectile.addComponent(new ProjectileController());
    projectile.assignAttribute(Attributes.PROJECTILE_SHOOTER, player);

    return projectile;
}

/**
 * Create enemy circle at a random position in the top half of the screen.
 * @param scene game scene
 * @param enemyType type (size) of the enemy to create
 * @param initialPos position at which the enemy will be created
 *  (optional, if not defined, the position will be selected randomly)
 * @param initialVelocity initial velocity of the enemy
 *  (optional, if not defined, the velocity will be downward at a random angle between 45 and 135 degrees)
 * @return Graphics object with the circle
 */
export const createEnemyCircle = (
    scene: Colfio.Scene,
    enemyType: EnemyType,
    initialPos: [number, number] | null = null,
    initialVelocity: Colfio.Vector | null = null
): Colfio.Sprite =>
{
    const {size, speed} = EnemyTypeAttributes[enemyType];

    // TODO přidat kontrolu, abych nevytvářel kruh v pozici, kde už něco je
    if (initialPos === null)
    {
        initialPos = [0, 0];
        initialPos[0] = getRandomInteger(size, scene.app.screen.width - size);
        initialPos[1] = getRandomInteger(size, scene.app.screen.height / 2 - size);
    }
    if (initialVelocity == null)
    {
        const angleIntervalLeft = [20, 70];
        const angleIntervalRight = [110, 160];
        let randomAngle;

        if (Math.random() > 0.5)
            randomAngle = getRandomInteger(angleIntervalLeft[0], angleIntervalLeft[1]);
        else
            randomAngle = getRandomInteger(angleIntervalRight[0], angleIntervalRight[1]);

        const angleRad = randomAngle * (Math.PI / 180);
        initialVelocity = new Colfio.Vector(Math.cos(angleRad), Math.sin(angleRad)).normalize();
    }

    let texture = PIXI.Texture.from(GameAssets.SPRITESHEET_ENEMIES).clone();
    // randomly choose one of the four textures
    texture.frame = new PIXI.Rectangle(Math.random() > 0.5 ? 0 : 16, Math.random() > 0.5 ? 0 : 16, ENEMY_SIZE, ENEMY_SIZE);

    let enemy = new Colfio.Sprite("Enemy", texture);
    enemy.scale.set(size);
    enemy.position.set(initialPos[0], initialPos[1]);
    enemy.addTag(Tags.ENEMY_CIRCLE);
    enemy.addComponent(new EnemyController());
    enemy.assignAttribute(Attributes.ENEMY_TYPE, enemyType);
    enemy.assignAttribute(Attributes.ENEMY_VELOCITY, initialVelocity);
    enemy.assignAttribute(Attributes.ENEMY_SPEED, speed);


    const enemies = scene.getGlobalAttribute<number>(GlobalAttributes.ENEMIES_COUNT);
    scene.assignGlobalAttribute(GlobalAttributes.ENEMIES_COUNT, enemies + 1);
    return enemy;
}

export const createPlayer = (scene: Colfio.Scene, xPos, playerNumber): Colfio.Sprite =>
{
    const spritesheet = playerNumber == 1 ? GameAssets.SPRITESHEET_PLAYER_1 : GameAssets.SPRITESHEET_PLAYER_2;

    let texture = PIXI.Texture.from(spritesheet).clone();
    texture.frame = new PIXI.Rectangle(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);

    let player = new Colfio.Sprite("Player", texture);
    player.scale.set(TEXTURE_SCALE);
    player.position.set(xPos, GAME_HEIGHT - STATUS_BAR_HEIGHT - PLAYER_HEIGHT * TEXTURE_SCALE);
    player.addTag(Tags.PLAYER);
    player.addComponent(new PlayerController());
    player.assignAttribute(Attributes.PLAYER_NUMBER, playerNumber);
    player.assignAttribute(Attributes.PLAYER_LIVES, PLAYER_LIVES);
    player.assignAttribute(Attributes.PLAYER_LAST_COLLISION, 0);
    player.assignAttribute(Attributes.PROJECTILES_AVAILABLE, PROJECTILES_MAX);

    return player;
}

export const createBackground = (scene: Colfio.Scene): Colfio.Sprite =>
{
    let texture = PIXI.Texture.from(GameAssets.BACKGROUND).clone();
    texture.frame = new PIXI.Rectangle(0, 0, 1000, 750);

    let background = new Colfio.Sprite("Background", texture);
    background.width = scene.width;
    background.height = GAME_HEIGHT - STATUS_BAR_HEIGHT;
    background.addTag(Tags.BACKGROUND);
    return background;
}

export const createStatusBar = (scene: Colfio.Scene, levelNumber: number, players: number): Colfio.Container =>
{
    const statusBar = new Colfio.Container();
    statusBar.addTag(Tags.STATUS_BAR);
    scene.stage.addChild(statusBar);

    const healthBarP1 = new Colfio.Container();
    healthBarP1.addComponent(new HealthBarController(1));
    statusBar.addChild(healthBarP1);

    if (players === 2)
    {
        const healthBarP2 = new Colfio.Container();
        healthBarP2.addComponent(new HealthBarController(2));
        statusBar.addChild(healthBarP2);
    }

    const levelText = new Colfio.BitmapText(
        "Level text",
        "Level " + (levelNumber + 1).toString(),
        "Early GameBoy",
        20,
        0xFFFFFF
    );
    levelText.anchor.set(0.5);
    levelText.position.set(scene.width / 2, GAME_HEIGHT - STATUS_BAR_HEIGHT / 2);
    statusBar.addChild(levelText);

    return statusBar;
}
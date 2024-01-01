import * as Colfio from 'colfio';
import * as PIXI from 'pixi.js';

import {ProjectileController} from "./components/projectile_controller";
import {EnemyController} from "./components/enemy_controller";
import {Attributes, GameAssets, Tags} from "./constants/enums";
import {PlayerController} from "./components/player_controller";
import {getRandomInteger} from "./utils";
import {EnemyType, EnemyTypeAttributes} from "./constants/enemy_attributes";
import {
    ENEMY_SIZE, GAME_HEIGHT,
    PLAYER_HEIGHT, PLAYER_LIVES,
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

    return new Colfio.Builder(scene)
        .scale(TEXTURE_SCALE)
        .globalPos(player.position.x - player.width + 5, player.position.y - player.height)
        .withTag(Tags.PLAYER_PROJECTILE)
        .withComponent(new ProjectileController())
        .withAttribute(Attributes.PROJECTILE_SHOOTER, player)
        .asSprite(texture)
        .build();
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

    if (initialPos === null)
    {
        const margin = 5;
        initialPos = [0, 0];
        initialPos[0] = getRandomInteger(ENEMY_SIZE * size + margin, scene.app.screen.width - ENEMY_SIZE * size - margin);
        initialPos[1] = getRandomInteger(ENEMY_SIZE * size + margin, scene.app.screen.height / 2 - ENEMY_SIZE * size - margin);
    }
    if (initialVelocity == null)
    {
        const angleIntervalLeft = [20, 70];
        const angleIntervalRight = [110, 160];
        let randomAngle;

        Math.random() > 0.5
            ? randomAngle = getRandomInteger(angleIntervalLeft[0], angleIntervalLeft[1])
            : randomAngle = getRandomInteger(angleIntervalRight[0], angleIntervalRight[1]);

        const angleRad = randomAngle * (Math.PI / 180);
        initialVelocity = new Colfio.Vector(Math.cos(angleRad), Math.sin(angleRad)).normalize();
    }

    let texture = PIXI.Texture.from(GameAssets.SPRITESHEET_ENEMIES).clone();
    // randomly choose one of the four textures
    texture.frame = new PIXI.Rectangle(Math.random() > 0.5 ? 0 : 16, Math.random() > 0.5 ? 0 : 16, ENEMY_SIZE, ENEMY_SIZE);

    return new Colfio.Builder(scene)
        .scale(size)
        .globalPos(initialPos[0], initialPos[1])
        .withTag(Tags.ENEMY_CIRCLE)
        .withComponent(new EnemyController())
        .withAttribute(Attributes.ENEMY_TYPE, enemyType)
        .withAttribute(Attributes.ENEMY_VELOCITY, initialVelocity)
        .withAttribute(Attributes.ENEMY_SPEED, speed)
        .asSprite(texture)
        .build();
}

export const createPlayer = (scene: Colfio.Scene, xPos: number, playerNumber: number, spritesheetData): Colfio.Container =>
{
    // Use the "_" object for extracting the textures from the spritesheet. Then crate the actual animated sprite
    // by cloning the extracted textures.
    let _ = new Colfio.AnimatedSprite("Animation", spritesheetData.animations["ship"]);

    let anim = new Colfio.Builder(scene)
        .anchor(0.5)
        .scale(TEXTURE_SCALE)
        .globalPos(xPos, GAME_HEIGHT - STATUS_BAR_HEIGHT - PLAYER_HEIGHT * TEXTURE_SCALE)
        .withTag(Tags.PLAYER)
        .withComponent(new PlayerController())
        .withAttribute(Attributes.PLAYER_NUMBER, playerNumber)
        .withAttribute(Attributes.PLAYER_LIVES, PLAYER_LIVES)
        .withAttribute(Attributes.PLAYER_LAST_COLLISION, 0)
        .withAttribute(Attributes.PROJECTILES_AVAILABLE, PROJECTILES_MAX)
        .asAnimatedSprite(_.textures.map(t => t.clone()))
        .build() as Colfio.AnimatedSprite;

    anim.loop = true;
    anim.animationSpeed = 0.1;
    anim.play();
    return anim;
}

export const createBackground = (scene: Colfio.Scene): Colfio.Container =>
{
    let texture = PIXI.Texture.from(GameAssets.BACKGROUND).clone();
    texture.frame = new PIXI.Rectangle(0, 0, 1000, 750);

    let background = new Colfio.Builder(scene)
        .withTag(Tags.BACKGROUND)
        .asSprite(texture)
        .build();

    background.width = scene.width;
    background.height = GAME_HEIGHT - STATUS_BAR_HEIGHT;
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

export const createHeart = (scene: Colfio.Scene, x: number, y: number): Colfio.Sprite =>
{
    let texture = PIXI.Texture.from(GameAssets.SPRITE_HEART).clone();
    texture.frame = new PIXI.Rectangle(0, 0, 13, 11);

    return new Colfio.Builder(scene)
        .scale(TEXTURE_SCALE)
        .anchor(0.5)
        .globalPos(x, y)
        .asSprite(texture)
        .build();
}
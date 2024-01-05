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
import {EnemyCollisionTrigger} from "./collisions/enemy_collision_trigger";
import {ProjectileCollisionTrigger} from "./collisions/projectile_collision_trigger";

export const createProjectile = (scene: Colfio.Scene, player: Colfio.Container, parent: Colfio.Container): Colfio.Sprite =>
{
    const playerNumber = player.getAttribute<number>(Attributes.PLAYER_NUMBER);
    let texture = PIXI.Texture.from(GameAssets.SPRITESHEET_PROJECTILES).clone();
    texture.frame = new PIXI.Rectangle(playerNumber == 1 ? 6: 20, 7, PROJECTILE_SIZE, PROJECTILE_SIZE);

    return new Colfio.Builder(scene)
        .scale(TEXTURE_SCALE)
        .globalPos(player.position.x - player.width + 5, player.position.y - player.height)
        .withTag(Tags.PLAYER_PROJECTILE)
        .withComponent(new ProjectileController())
        .withComponent(new ProjectileCollisionTrigger())
        .withAttribute(Attributes.PROJECTILE_SOURCE, player)
        .withParent(parent)
        .asSprite(texture)
        .build();
}

/**
 * Create enemy circle at a random position in the top half of the screen.
 * @param scene game scene
 * @param enemyType type (size) of the enemy to create
 * @param parent parent container
 * @param initialPos position at which the enemy will be created
 *  (optional, if not defined, the position will be selected randomly)
 * @param initialVelocity initial velocity of the enemy
 *  (optional, if not defined, the velocity will be downward at a random angle between 45 and 135 degrees)
 * @return Graphics object with the circle
 */
export const createEnemyCircle = (
    scene: Colfio.Scene,
    enemyType: EnemyType,
    parent: Colfio.Container,
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
        .anchor(0.5)
        .scale(size)
        .globalPos(initialPos[0], initialPos[1])
        .withTag(Tags.ENEMY_CIRCLE)
        .withComponent(new EnemyController())
        .withComponent(new EnemyCollisionTrigger())
        .withAttribute(Attributes.ENEMY_TYPE, enemyType)
        .withAttribute(Attributes.ENEMY_VELOCITY, initialVelocity)
        .withAttribute(Attributes.ENEMY_SPEED, speed)
        .withParent(parent)
        .asSprite(texture)
        .build();
}

export const createPlayer = (
    scene: Colfio.Scene,
    xPos: number,
    playerNumber: number,
    spritesheetData,
    parent: Colfio.Container,
    controls: Record<string, typeof Colfio.Keys[]>
): Colfio.Container =>
{
    // Use the "_" object for extracting the textures from the spritesheet. Then crate the actual animated sprite
    // by cloning the extracted textures.
    let _ = new Colfio.AnimatedSprite("Animation", spritesheetData.animations["ship"]);

    let anim = new Colfio.Builder(scene)
        .anchor(0.5, 0.5)
        .scale(TEXTURE_SCALE)
        .globalPos(xPos, GAME_HEIGHT - STATUS_BAR_HEIGHT + PLAYER_HEIGHT / 2)
        .withTag(Tags.PLAYER)
        .withComponent(new PlayerController())
        .withAttribute(Attributes.PLAYER_NUMBER, playerNumber)
        .withAttribute(Attributes.PLAYER_LIVES, PLAYER_LIVES)
        .withAttribute(Attributes.PLAYER_LAST_COLLISION_TIME, 0)
        .withAttribute(Attributes.PLAYER_PROJECTILES_AVAILABLE, PROJECTILES_MAX)
        .withAttribute(Attributes.PLAYER_CONTROLS, controls)
        .withParent(parent)
        .asAnimatedSprite(_.textures.map(t => t.clone()))
        .build() as Colfio.AnimatedSprite;

    anim.loop = true;
    anim.animationSpeed = 0.1;
    anim.play();
    return anim;
}

export const createBackground = (scene: Colfio.Scene, parent: Colfio.Container): Colfio.Container =>
{
    let texture = PIXI.Texture.from(GameAssets.BACKGROUND).clone();
    texture.frame = new PIXI.Rectangle(0, 0, 1000, 750);

    let background = new Colfio.Builder(scene)
        .withParent(parent)
        .asSprite(texture)
        .build();

    background.width = scene.width;
    background.height = GAME_HEIGHT - STATUS_BAR_HEIGHT;
    return background;
}

export const createStatusBar = (scene: Colfio.Scene, levelNumber: number, players: number, parent: Colfio.Container): Colfio.Container =>
{
    const statusBar = new Colfio.Builder(scene)
        .withParent(parent)
        .asContainer()
        .build();

    createHealthBar(scene, statusBar, 1);
    if (players === 2)
        createHealthBar(scene, statusBar, 2);

    createText(scene, "Level " + (levelNumber + 1).toString(), scene.width / 2, GAME_HEIGHT - STATUS_BAR_HEIGHT / 2, 20, 0xFFFFFF, statusBar);
    return statusBar;
}

export const createHealthBar = (scene: Colfio.Scene, parent: Colfio.Container, playerNumber: number) =>
{
    return new Colfio.Builder(scene)
        .withComponent(new HealthBarController(playerNumber))
        .withParent(parent)
        .asContainer()
        .build();
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

export const createText = (
    scene: Colfio.Scene,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    fontColor: number,
    parent: Colfio.Container
): Colfio.BitmapText =>
{
    return new Colfio.Builder(scene)
        .anchor(0.5)
        .globalPos(x, y)
        .withParent(parent)
        .asBitmapText(text, "Early GameBoy", fontSize, fontColor)
        .build();
}
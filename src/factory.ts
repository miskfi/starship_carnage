import * as Colfio from 'colfio';
import * as PIXI from 'pixi.js';

import {ProjectileController} from "./components/projectile_controller";
import {EnemyController} from "./components/enemy_controller";
import {Attributes, GameAssets, GlobalAttributes, Tags} from "./constants/enums";
import {PlayerController} from "./components/player_controller";
import {getRandomInteger} from "./utils";
import {EnemyType, EnemyTypeAttributes} from "./constants/enemy_attributes";
import {
    ENEMY_COLOR,
    PLAYER_HEIGHT,
    PLAYER_SCALE,
    PLAYER_WIDTH,
    PROJECTILE_COLOR,
    PROJECTILE_SIZE,
    PROJECTILES_MAX
} from "./constants/constants";

export const createProjectile = (scene: Colfio.Scene, player: Colfio.Container): Colfio.Graphics =>
{
    const projectile = new Colfio.Graphics();
    projectile.beginFill(PROJECTILE_COLOR);
    projectile.drawCircle(player.position.x + player.width/2, player.position.y + player.height/2, PROJECTILE_SIZE);
    projectile["name"] = Tags.PLAYER_PROJECTILE;
    projectile.addTag(Tags.PLAYER_PROJECTILE);
    projectile.endFill();
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
): Colfio.Graphics =>
{
    const enemyCircle = new Colfio.Graphics();
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

    enemyCircle.beginFill(ENEMY_COLOR);
    enemyCircle.drawCircle(0, 0, size / 2);
    enemyCircle.position.set(initialPos[0], initialPos[1]);
    enemyCircle["name"] = Tags.ENEMY_CIRCLE;
    enemyCircle.addTag(Tags.ENEMY_CIRCLE);
    enemyCircle.addComponent(new EnemyController());
    enemyCircle.assignAttribute(Attributes.ENEMY_TYPE, enemyType);

    enemyCircle.assignAttribute(Attributes.ENEMY_VELOCITY, initialVelocity);
    enemyCircle.assignAttribute(Attributes.ENEMY_SPEED, speed);

    const enemies = scene.getGlobalAttribute<number>(GlobalAttributes.ENEMIES_COUNT);
    scene.assignGlobalAttribute(GlobalAttributes.ENEMIES_COUNT, enemies + 1);
    return enemyCircle;
}

export const createPlayer = (scene: Colfio.Scene, xPos, spritesheet): Colfio.Sprite =>
{
    let texture = PIXI.Texture.from(spritesheet);
    texture = texture.clone();
    texture.frame = new PIXI.Rectangle(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);

    let player = new Colfio.Sprite("Player", texture);
    player.scale.set(PLAYER_SCALE);
    player.position.set(xPos, scene.height - PLAYER_HEIGHT * PLAYER_SCALE);
    player["name"] = Tags.PLAYER;
    player.addTag(Tags.PLAYER);
    player.addComponent(new PlayerController());
    player.assignAttribute(Attributes.PROJECTILES_AVAILABLE, PROJECTILES_MAX);

    return player;
}
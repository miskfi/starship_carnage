import * as Colfio from 'colfio';
import {ProjectileController} from "./components/projectile_controller";
import {EnemyController} from "./components/enemy_controller";
import {Attributes, Tags} from "./constants/enums";
import {PlayerController} from "./components/player_controller";
import {getRandomInteger} from "./utils";
import {EnemyType, EnemyTypeAttributes} from "./constants/enemy_attributes";
import {ENEMY_COLOR, PLAYER_COLOR, PLAYER_SIZE, PROJECTILE_COLOR, PROJECTILE_SIZE} from "./constants/constants";

export const createProjectile = (scene: Colfio.Scene): Colfio.Graphics =>
{
    const player = scene.findObjectByTag(Tags.PLAYER);

    const projectile = new Colfio.Graphics();
    projectile.beginFill(PROJECTILE_COLOR);
    projectile.drawCircle(player.position.x + player.width/2, player.position.y + player.height/2, PROJECTILE_SIZE);
    projectile["name"] = Tags.PLAYER_PROJECTILE;
    projectile.addTag(Tags.PLAYER_PROJECTILE);
    projectile.endFill();
    projectile.addComponent(new ProjectileController());
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

    const enemies = scene.getGlobalAttribute<number>(Attributes.ENEMIES_COUNT);
    scene.assignGlobalAttribute(Attributes.ENEMIES_COUNT, enemies + 1);
    return enemyCircle;
}

export const createPlayer = (scene: Colfio.Scene): Colfio.Graphics =>
{
    const player = new Colfio.Graphics();
    player.beginFill(PLAYER_COLOR);
    player.drawRect(0, 0, PLAYER_SIZE, PLAYER_SIZE);
    player.position.set(scene.width/2, scene.height - PLAYER_SIZE);
    player["name"] = Tags.PLAYER;
    player.addTag(Tags.PLAYER);
    player.endFill();
    player.addComponent(new PlayerController());
    return player;
}
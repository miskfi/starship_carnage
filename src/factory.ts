import * as Colfio from 'colfio';
import {ProjectileMovement} from "./projectile";
import {EnemyMovement} from "./enemy";

export const projectileEmitter = (scene: Colfio.Scene, playerID: number): Colfio.Graphics =>
{
    const player = scene.findObjectById(playerID);

    const projectile = new Colfio.Graphics();
    projectile.beginFill(0xFFFFFF);
    projectile.drawCircle(player.position.x + player.width/2, player.position.y + player.height/2, 5);
    projectile["name"] = "PLAYER_PROJECTILE";
    projectile.endFill();

    projectile.addComponent(new ProjectileMovement());
    return projectile;
}

/**
 * Create enemy circle at a random position in the top half of the screen.
 * @param scene game scene
 * @return Graphics object with the circle
 */
export const enemyCircleEmitter = (scene: Colfio.Scene): Colfio.Graphics =>
{
    const enemyCircle = new Colfio.Graphics();
    const size = 50;

    const randomPosX = Math.random() * (scene.app.screen.width / 2);
    const randomPosY = Math.random() * (scene.app.screen.height / 2);

    enemyCircle.beginFill(0xFF0000);
    enemyCircle.drawCircle(0, 0, size / 2);
    enemyCircle.position.set(randomPosX, randomPosY);
    enemyCircle["name"] = "ENEMY_CIRCLE";

    enemyCircle.addComponent(new EnemyMovement());
    return enemyCircle;
}
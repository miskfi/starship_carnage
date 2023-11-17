import * as Colfio from 'colfio';
import {ProjectileMovement} from "./projectile";

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
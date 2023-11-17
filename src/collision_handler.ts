import * as Colfio from "colfio";
import * as PIXI from "pixi.js"
import {Tags, Messages} from "./constants";

export class CollisionHandler extends Colfio.Component
{
    onUpdate(delta: number, absolute: number)
    {
        const projectiles = this.scene.findObjectsByTag(Tags.PLAYER_PROJECTILE);
        const enemies = this.scene.findObjectsByTag(Tags.ENEMY_CIRCLE);
        const player = this.scene.findObjectByTag(Tags.PLAYER);

        for (let enemy of enemies)
        {
            const enemyBounds = enemy.getBounds();

            for (let projectile of projectiles)
            {
                if (this.collide(projectile.getBounds(),  enemyBounds))
                {
                    this.sendMessage(Messages.PROJECTILE_DESTROYED, projectile);
                    this.sendMessage(Messages.ENEMY_DESTROYED, enemy);
                    return;
                }
            }

            if (player !== null)
            {
                if (this.collide(player?.getBounds(), enemyBounds))
                    this.sendMessage(Messages.PLAYER_HIT);
            }
        }
    }

    /**
     * Find if two objects (their bounding boxes) collide.
     * @param boundRectA bounding box of first object
     * @param boundRectB bounding box of second object
     */
    private collide = (boundRectA: PIXI.Rectangle, boundRectB: PIXI.Rectangle) =>
        this.hIntersection(boundRectA, boundRectB) > 0 && this.vIntersection(boundRectA, boundRectB) > 0

    private hIntersection = (boundRectA: PIXI.Rectangle, boundRectB: PIXI.Rectangle) =>
        Math.min(boundRectA.right, boundRectB.right) - Math.max(boundRectA.left, boundRectB.left)

    private vIntersection = (boundRectA: PIXI.Rectangle, boundRectB: PIXI.Rectangle) =>
        Math.min(boundRectA.bottom, boundRectB.bottom) - Math.max(boundRectA.top, boundRectB.top)
}
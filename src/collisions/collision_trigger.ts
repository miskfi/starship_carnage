import * as Colfio from "colfio";
import * as PIXI from "pixi.js"
import {Tags, Messages, Attributes} from "../constants/enums";
import {
    EnemyCollisionType,
    ProjectileCollisionType
} from "./collision_constants";
import {GAME_HEIGHT, STATUS_BAR_HEIGHT} from "../constants/constants";

export class CollisionTrigger extends Colfio.Component
{
    onUpdate(delta: number, absolute: number)
    {
        const projectiles = this.scene.findObjectsByTag(Tags.PLAYER_PROJECTILE);

        const screenWidth = this.scene.app.screen.width;
        const screenHeight = this.scene.app.screen.height;

        // TODO hrozná ifovačka
        for (let projectile of projectiles)
        {
            const projectileBounds = projectile.getBounds();
            const enemies = this.scene.findObjectsByTag(Tags.ENEMY_CIRCLE);
            const players = this.scene.findObjectsByTag(Tags.PLAYER);

            for (let enemy of enemies)
            {
                // collision of enemy and projectile
                if (this.collide(projectileBounds, enemy.getBounds()))
                {
                    this.sendMessage(Messages.PROJECTILE_COLLISION, {
                        projectile, collider: enemy, type: ProjectileCollisionType.ENEMY
                    })
                }
            }

            for (let player of players)
            {
                // collision of projectile with other player
                if (player !== projectile.getAttribute(Attributes.PROJECTILE_SHOOTER)
                    && this.collide(projectileBounds, player.getBounds()))
                {
                    this.sendMessage(Messages.PROJECTILE_COLLISION, {
                        projectile, collider: player, type: ProjectileCollisionType.PLAYER
                    })
                }
            }

            // collision of enemy and border
            if (projectileBounds.bottom <= 0)
            {
                this.sendMessage(Messages.PROJECTILE_COLLISION, {
                    projectile, type: ProjectileCollisionType.BORDER
                })
            }
        }

        const players = this.scene.findObjectsByTag(Tags.PLAYER);
        const enemies = this.scene.findObjectsByTag(Tags.ENEMY_CIRCLE);

        for (let enemy of enemies)
        {
            const enemyBounds = enemy.getBounds();

            // collision of two enemies
            for (let enemy2 of enemies)
            {
                if (enemy !== enemy2 && this.collide(enemy2.getBounds(), enemyBounds))
                {
                    this.sendMessage(Messages.ENEMY_COLLISION, {
                        enemy, collider: enemy2, type: EnemyCollisionType.ENEMY
                    })
                }
            }

            // collision of enemy and player
            for (let player of players)
            {
                if (player !== null)
                {
                    if (this.collide(player?.getBounds(), enemyBounds))
                    {
                        this.sendMessage(Messages.ENEMY_COLLISION, {
                            enemy, collider: player, type: EnemyCollisionType.PLAYER
                        })
                    }
                }
            }

            // collision of enemy and walls
            if (enemyBounds.right >= screenWidth || enemyBounds.left <= 0)
                this.sendMessage(Messages.ENEMY_COLLISION, {enemy, type: EnemyCollisionType.BORDER_HORIZONTAL})

            if (enemyBounds.bottom >= GAME_HEIGHT - STATUS_BAR_HEIGHT || enemyBounds.top <= 0)
                this.sendMessage(Messages.ENEMY_COLLISION, {enemy, type: EnemyCollisionType.BORDER_VERTICAL})
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
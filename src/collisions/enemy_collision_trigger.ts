import * as Colfio from "colfio";
import {Tags, Messages, Attributes} from "../constants/enums";
import {EnemyCollisionType} from "./collision_constants";
import {GAME_HEIGHT, PLAYER_INVULNERABLE_TIME, STATUS_BAR_HEIGHT} from "../constants/constants";
import {EnemyTypeAttributes} from "../constants/enemy_attributes";
import {CollisionTrigger} from "./collision_trigger";

export class EnemyCollisionTrigger extends CollisionTrigger
{
    onUpdate(delta: number, absolute: number)
    {
        const enemy = this.owner;
        const enemySize = EnemyTypeAttributes[enemy.getAttribute<string>(Attributes.ENEMY_TYPE)]["size"];
        const enemyVelocity = enemy.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);
        const enemySpeed = enemy.getAttribute<number>(Attributes.ENEMY_SPEED);

        // collision of two enemies
        const enemies = this.scene.findObjectsByTag(Tags.ENEMY_CIRCLE);
        for (let enemy2 of enemies)
        {
            if (enemy === enemy2) continue;

            const collisionInfo =
                this.collideRaycasting(delta, enemy, enemySize, enemyVelocity, enemySpeed, enemy2.getBounds());
            if (collisionInfo.collision)
                this.sendMessage(Messages.ENEMY_COLLISION, {
                    enemy, collider: enemy2, type: EnemyCollisionType.ENEMY, collisionData: collisionInfo.closest
                });
        }

        // collision of enemy and player
        const players = this.scene.findObjectsByTag(Tags.PLAYER);
        for (let player of players)
        {
            if (absolute - player.getAttribute<number>(Attributes.PLAYER_LAST_COLLISION_TIME) > PLAYER_INVULNERABLE_TIME &&
                this.collideSAT(player.getBounds(), enemy.getBounds()))
            {
                this.sendMessage(Messages.ENEMY_COLLISION, {enemy, collider: player, type: EnemyCollisionType.PLAYER});
                player.assignAttribute(Attributes.PLAYER_LAST_COLLISION_TIME, absolute);
            }
        }

        this.checkWallCollisions();
    }

    private checkWallCollisions()
    {
        const enemy = this.owner;
        const enemyBounds = enemy.getBounds();
        const width = this.scene.app.screen.width;
        const height = GAME_HEIGHT - STATUS_BAR_HEIGHT;

        if (enemyBounds.right >= width || enemyBounds.left <= 0)
        {
            const overlap = Math.min(Math.abs(enemyBounds.right - width), Math.abs(enemyBounds.left));
            this.sendMessage(Messages.ENEMY_COLLISION, {
                enemy, type: EnemyCollisionType.BORDER_HORIZONTAL, collisionData: overlap
            });
        }
        if (enemyBounds.bottom >= height || enemyBounds.top <= 0)
        {
            const overlap = Math.min(Math.abs(enemyBounds.bottom - height), Math.abs(enemyBounds.top));
            this.sendMessage(Messages.ENEMY_COLLISION, {
                enemy, type: EnemyCollisionType.BORDER_VERTICAL, collisionData: overlap
            });
        }
    }
}
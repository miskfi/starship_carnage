import {Tags, Messages, Attributes} from "../constants/enums";
import {ProjectileCollisionType,} from "./collision_constants";
import {PLAYER_INVULNERABLE_TIME} from "../constants/constants";
import {CollisionTrigger} from "./collision_trigger";

export class ProjectileCollisionTrigger extends CollisionTrigger
{
    onUpdate(delta: number, absolute: number)
    {
        const projectile = this.owner;
        const projectileBounds = projectile.getBounds();
        const enemies = this.scene.findObjectsByTag(Tags.ENEMY_CIRCLE);
        const players = this.scene.findObjectsByTag(Tags.PLAYER);

        for (let enemy of enemies)
        {
            if (this.collideSAT(projectileBounds, enemy.getBounds()))
            {
                this.sendMessage(Messages.PROJECTILE_COLLISION, {projectile, collider: enemy, type: ProjectileCollisionType.ENEMY});
                return;
            }
        }

        for (let player of players)
        {
            // Don't trigger collisions during player's collision invulnerability (this is done to avoid multiple
            // collisions with the same object in subsequent frames).
            // Also don't check for collisions between a player and his projectiles (might happen in the first
            // few frames after firing).
            if (absolute - player.getAttribute<number>(Attributes.PLAYER_LAST_COLLISION_TIME) > PLAYER_INVULNERABLE_TIME  &&
                player !== projectile.getAttribute(Attributes.PROJECTILE_SOURCE) &&
                this.collideSAT(projectileBounds, player.getBounds()))
            {
                this.sendMessage(Messages.PROJECTILE_COLLISION, {projectile, collider: player, type: ProjectileCollisionType.PLAYER});
                player.assignAttribute(Attributes.PLAYER_LAST_COLLISION_TIME, absolute);
                return;
            }
        }

        // projectile went off the screen
        if (projectileBounds.bottom <= 0)
            this.sendMessage(Messages.PROJECTILE_COLLISION, {projectile, type: ProjectileCollisionType.BORDER});
    }
}
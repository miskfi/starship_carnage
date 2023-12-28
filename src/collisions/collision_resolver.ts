import * as Colfio from "colfio";
import {Attributes, Messages} from "../constants/enums";
import {
    EnemyCollisionMessage,
    EnemyCollisionType,
    ProjectileCollisionMessage,
    ProjectileCollisionType
} from "./collision_constants";

export class CollisionResolver extends Colfio.Component
{
    onInit()
    {
        this.subscribe(Messages.PROJECTILE_COLLISION, Messages.ENEMY_COLLISION);
    }

    onMessage(msg: Colfio.Message)
    {
        if (msg.action === Messages.PROJECTILE_COLLISION)
        {
            const { projectile, collider, type } = msg.data as ProjectileCollisionMessage;
            if (type === ProjectileCollisionType.ENEMY)
            {
                this.sendMessage(Messages.PROJECTILE_DESTROYED, projectile);
                this.sendMessage(Messages.ENEMY_DESTROYED, collider);
            }
            else if (type === ProjectileCollisionType.BORDER)
            {
                this.sendMessage(Messages.PROJECTILE_DESTROYED, projectile);
            }
        }
        else if (msg.action === Messages.ENEMY_COLLISION)
        {
            const {enemy, collider, type} = msg.data as EnemyCollisionMessage;

            if (type === EnemyCollisionType.ENEMY)
            {
                let velocity1 = enemy.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);
                let velocity2 = collider.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);

                enemy.assignAttribute(
                    Attributes.ENEMY_VELOCITY,
                    new Colfio.Vector(-velocity1.x, -velocity1.y).normalize()
                )

                collider.assignAttribute(
                    Attributes.ENEMY_VELOCITY,
                    new Colfio.Vector(-velocity2.x, -velocity2.y).normalize()
                )
            }
            else if (type === EnemyCollisionType.PLAYER)
            {
                this.sendMessage(Messages.PLAYER_HIT);
            }
            else if (type === EnemyCollisionType.BORDER_HORIZONTAL)
            {
                const screenWidth = this.scene.app.screen.width;
                let velocity = enemy.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);
                let pos = enemy.position;

                // move the enemy to the furthest point where it doesn't collide with the border
                if (velocity.x > 0)
                    pos.x = screenWidth - enemy.width / 2 - 1;
                else
                    pos.x = enemy.width / 2 + 1;

                enemy.assignAttribute(
                    Attributes.ENEMY_VELOCITY,
                    new Colfio.Vector(-velocity.x, velocity.y).normalize()
                )
            }
            else if (type === EnemyCollisionType.BORDER_VERTICAL)
            {
                const screenHeight = this.scene.app.screen.height;
                let velocity = enemy.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);
                let pos = enemy.position;

                // move the enemy to the furthest point where it doesn't collide with the border
                if (velocity.y > 0)
                    pos.y = screenHeight - enemy.height / 2 - 1;
                else
                    pos.y = enemy.height / 2 + 1;

                enemy.assignAttribute(
                    Attributes.ENEMY_VELOCITY,
                    new Colfio.Vector(velocity.x, -velocity.y).normalize()
                )
            }
        }
    }
}
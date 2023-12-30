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
                this.sendMessage(Messages.ENEMY_DESTROYED, collider);
            else if (type === ProjectileCollisionType.PLAYER)
                this.sendMessage(Messages.PLAYER_HIT, collider);

            this.sendMessage(Messages.PROJECTILE_DESTROYED, projectile);
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
                this.sendMessage(Messages.PLAYER_HIT, collider);
            }
            else if (type === EnemyCollisionType.BORDER_HORIZONTAL)
            {
                let velocity = enemy.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);

                enemy.assignAttribute(
                    Attributes.ENEMY_VELOCITY,
                    new Colfio.Vector(-velocity.x, velocity.y).normalize()
                )
            }
            else if (type === EnemyCollisionType.BORDER_VERTICAL)
            {
                let velocity = enemy.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);

                enemy.assignAttribute(
                    Attributes.ENEMY_VELOCITY,
                    new Colfio.Vector(velocity.x, -velocity.y).normalize()
                )
            }
        }
    }
}
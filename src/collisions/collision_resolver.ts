import * as Colfio from "colfio";
import {Attributes, Messages} from "../constants/enums";
import {
    EnemyCollisionMessage,
    EnemyCollisionType,
    ProjectileCollisionMessage,
    ProjectileCollisionType
} from "./collision_constants";
import {EnemyTypeAttributes} from "../constants/enemy_attributes";

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
            const {enemy, collider, type, collisionData} = msg.data as EnemyCollisionMessage;

            if (type === EnemyCollisionType.ENEMY)
            {
                const [at, bt, ct, dt] = collisionData;
                const velocity1 = enemy.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);
                const velocity2 = collider.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);

                const enemy1Size = EnemyTypeAttributes[enemy.getAttribute<string>(Attributes.ENEMY_TYPE)]["size"];
                const enemy2Size = EnemyTypeAttributes[collider.getAttribute<string>(Attributes.ENEMY_TYPE)]["size"];

                const closest = Math.min(at > 0 ? at : 10000, bt > 0 ? bt : 10000, ct > 0 ? ct : 10000, dt > 0 ? dt : 10000);
                if (closest === at || closest === bt) {
                    enemy.assignAttribute(
                        Attributes.ENEMY_VELOCITY,
                        new Colfio.Vector(velocity1.x - closest * 0.1, -velocity1.y + closest * 0.1).normalize()
                    )

                    collider.assignAttribute(
                        Attributes.ENEMY_VELOCITY,
                        new Colfio.Vector(velocity2.x - closest * 0.1, -velocity2.y + closest * 0.1).normalize()
                    )
                }
                if(closest === ct || closest === dt) {
                    enemy.assignAttribute(
                        Attributes.ENEMY_VELOCITY,
                        new Colfio.Vector(-velocity1.x + closest * 0.1, velocity1.y - closest * 0.1).normalize()
                    )

                    collider.assignAttribute(
                        Attributes.ENEMY_VELOCITY,
                        new Colfio.Vector(-velocity2.x + closest * 0.1, velocity2.y - closest * 0.1).normalize()
                    )
                }



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
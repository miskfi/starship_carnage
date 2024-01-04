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
            const {enemy, collider, type} = msg.data as EnemyCollisionMessage;

            if (type === EnemyCollisionType.ENEMY)
            {
                const velocity1 = enemy.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);
                const velocity2 = collider.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);

                const mass1 = EnemyTypeAttributes[enemy.getAttribute<string>(Attributes.ENEMY_TYPE)]["size"];
                const mass2 = EnemyTypeAttributes[collider.getAttribute<string>(Attributes.ENEMY_TYPE)]["size"];

                const center1 = new Colfio.Vector(enemy.position.x, enemy.position.y);
                const center2 = new Colfio.Vector(collider.position.x, collider.position.y);

                // calculate coefficients for change of velocity based on these equations
                // https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional_collision_with_two_moving_objects
                const massCoeff1 = (2 * mass2 / (mass1 + mass2));
                const massCoeff2 = (2 * mass1 / (mass1 + mass2));

                const dot1 = velocity1.subtract(velocity2).dot(center1.subtract(center2));
                const dot2 = velocity2.subtract(velocity1).dot(center2.subtract(center1));

                const dist = center1.squareDistance(center2)

                const coeff1 = massCoeff1 * (dot1 / dist);
                const coeff2 = massCoeff2 * (dot2 / dist);

                enemy.assignAttribute(
                    Attributes.ENEMY_VELOCITY,
                    velocity1.subtract(center1.subtract(center2).multiply(coeff1)).normalize()
                )

                collider.assignAttribute(
                    Attributes.ENEMY_VELOCITY,
                    velocity2.subtract(center2.subtract(center1).multiply(coeff2)).normalize()
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
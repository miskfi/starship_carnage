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
            this.handleProjectileCollision(msg);
        else if (msg.action === Messages.ENEMY_COLLISION)
            this.handleEnemyCollision(msg);
    }

    private handleProjectileCollision(msg: Colfio.Message)
    {
        const { projectile, collider, type } = msg.data as ProjectileCollisionMessage;

        if (type === ProjectileCollisionType.ENEMY)
            this.sendMessage(Messages.ENEMY_DESTROYED, collider);
        else if (type === ProjectileCollisionType.PLAYER)
            this.sendMessage(Messages.PLAYER_HIT, collider);

        this.sendMessage(Messages.PROJECTILE_DESTROYED, projectile);
    }

    private handleEnemyCollision(msg: Colfio.Message)
    {
        const {enemy, collider, type, collisionData} = msg.data as EnemyCollisionMessage;

        switch (type)
        {
            case EnemyCollisionType.ENEMY:
                this.twoEnemiesCollision(enemy, collider, collisionData);
                break;

            case EnemyCollisionType.PLAYER:
                this.sendMessage(Messages.PLAYER_HIT, collider);
                break;

            case EnemyCollisionType.BORDER_HORIZONTAL:
                const velocityH = enemy.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);
                enemy.assignAttribute(Attributes.ENEMY_VELOCITY, new Colfio.Vector(-velocityH.x, velocityH.y).normalize());
                this.moveAway(enemy, collisionData);
                break;

            case EnemyCollisionType.BORDER_VERTICAL:
                const velocityV = enemy.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);
                enemy.assignAttribute(Attributes.ENEMY_VELOCITY, new Colfio.Vector(velocityV.x, -velocityV.y).normalize());
                this.moveAway(enemy, collisionData);
                break;
        }
    }

    /**
     * Update velocities of two colliding enemies based on these equations
     * https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional_collision_with_two_moving_objects
     */
    private twoEnemiesCollision(enemy1: Colfio.Container, enemy2: Colfio.Container, overlap: number)
    {
        const velocity1 = enemy1.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);
        const velocity2 = enemy2.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);

        const mass1 = EnemyTypeAttributes[enemy1.getAttribute<string>(Attributes.ENEMY_TYPE)]["size"];
        const mass2 = EnemyTypeAttributes[enemy2.getAttribute<string>(Attributes.ENEMY_TYPE)]["size"];

        const center1 = new Colfio.Vector(enemy1.position.x, enemy1.position.y);
        const center2 = new Colfio.Vector(enemy2.position.x, enemy2.position.y);

        const massCoeff1 = (2 * mass2 / (mass1 + mass2));
        const massCoeff2 = (2 * mass1 / (mass1 + mass2));

        const dot1 = velocity1.subtract(velocity2).dot(center1.subtract(center2));
        const dot2 = velocity2.subtract(velocity1).dot(center2.subtract(center1));

        const dist = center1.squareDistance(center2)

        const coeff1 = massCoeff1 * (dot1 / dist);
        const coeff2 = massCoeff2 * (dot2 / dist);

        const newVelocity1 = velocity1.subtract(center1.subtract(center2).multiply(coeff1)).normalize();
        const newVelocity2 = velocity2.subtract(center2.subtract(center1).multiply(coeff2)).normalize();

        enemy1.assignAttribute(Attributes.ENEMY_VELOCITY, newVelocity1);
        enemy2.assignAttribute(Attributes.ENEMY_VELOCITY, newVelocity2)

        this.moveAway(enemy1, overlap);
        this.moveAway(enemy2, overlap);
    }

    /**
     * Move enemy away from the collision based on the overlap with the colliding object. This ensures that the enemy
     * will not be in the same collision in the next frame, which might cause it to oscillate around the collider.
     * @param enemy enemy that will be moved away
     * @param overlap the amount by which the enemy will be moved
     */
    private moveAway(enemy: Colfio.Container, overlap: number)
    {
        const velocity = enemy.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);
        enemy.position.x += velocity.x * overlap;
        enemy.position.y += velocity.y * overlap;
    }
}
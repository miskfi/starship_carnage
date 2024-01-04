import * as Colfio from "colfio";
import * as PIXI from "pixi.js"
import {Tags, Messages, Attributes} from "../constants/enums";
import {
    EnemyCollisionType,
    ProjectileCollisionType
} from "./collision_constants";
import {ENEMY_SIZE, GAME_HEIGHT, GAME_WIDTH, PLAYER_INVULNERABLE_TIME, STATUS_BAR_HEIGHT} from "../constants/constants";
import {EnemyTypeAttributes} from "../constants/enemy_attributes";

export class CollisionTrigger extends Colfio.Component
{
    onUpdate(delta: number, absolute: number)
    {
        this.checkProjectileCollisions(delta, absolute);
        this.checkEnemyCollisions(delta, absolute);
    }

    checkProjectileCollisions(delta: number, absolute: number)
    {
        const projectiles = this.scene.findObjectsByTag(Tags.PLAYER_PROJECTILE);

        for (let projectile of projectiles)
        {
            const projectileBounds = projectile.getBounds();
            const enemies = this.scene.findObjectsByTag(Tags.ENEMY_CIRCLE);
            const players = this.scene.findObjectsByTag(Tags.PLAYER);

            for (let enemy of enemies)
                if (this.collideSAT(projectileBounds, enemy.getBounds()))
                    this.sendMessage(Messages.PROJECTILE_COLLISION, {projectile, collider: enemy, type: ProjectileCollisionType.ENEMY});

            for (let player of players)
            {
                // Don't trigger collisions during player's collision invulnerability (this is done to avoid multiple
                // collisions with the same object in subsequent frames).
                // Also don't check for collisions between a player and his projectiles (might happen in the first
                // few frames after firing).
                if (absolute - player.getAttribute<number>(Attributes.PLAYER_LAST_COLLISION) > PLAYER_INVULNERABLE_TIME  &&
                    player !== projectile.getAttribute(Attributes.PROJECTILE_SHOOTER) &&
                    this.collideSAT(projectileBounds, player.getBounds()))
                {
                    this.sendMessage(Messages.PROJECTILE_COLLISION, {projectile, collider: player, type: ProjectileCollisionType.PLAYER});
                    player.assignAttribute(Attributes.PLAYER_LAST_COLLISION, absolute);
                }
            }

            // projectile went off the screen
            if (projectileBounds.bottom <= 0)
                this.sendMessage(Messages.PROJECTILE_COLLISION, {projectile, type: ProjectileCollisionType.BORDER});
        }
    }

    checkEnemyCollisions(delta: number, absolute: number)
    {
        const players = this.scene.findObjectsByTag(Tags.PLAYER);
        const enemies = this.scene.findObjectsByTag(Tags.ENEMY_CIRCLE);

        for (let i = 0; i < enemies.length; i++)
        {
            const enemy = enemies[i];
            const enemyBounds = enemy.getBounds();
            const enemySize = EnemyTypeAttributes[enemy.getAttribute<string>(Attributes.ENEMY_TYPE)]["size"];
            const enemyVelocity = enemy.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);
            const enemySpeed = enemy.getAttribute<number>(Attributes.ENEMY_SPEED);

            // collision of two enemies
            for (let j = i+1; j < enemies.length; j++)
            {
                const enemy2 = enemies[j];
                const [collision, at, bt, ct, dt, closest] =
                    this.collideRaycasting(delta, enemy, enemySize, enemyVelocity, enemySpeed, enemy2.getBounds())
                if (collision)
                    this.sendMessage(Messages.ENEMY_COLLISION, {
                        enemy, collider: enemy2, type: EnemyCollisionType.ENEMY, collisionData: closest
                    });
            }

            // collision of enemy and player
            for (let player of players)
            {
                if (absolute - player.getAttribute<number>(Attributes.PLAYER_LAST_COLLISION) > PLAYER_INVULNERABLE_TIME &&
                    this.collideSAT(player?.getBounds(), enemyBounds))
                {
                    this.sendMessage(Messages.ENEMY_COLLISION, {enemy, collider: player, type: EnemyCollisionType.PLAYER});
                    player.assignAttribute(Attributes.PLAYER_LAST_COLLISION, absolute);
                }
            }

            const width = this.scene.app.screen.width;
            const height = GAME_HEIGHT - STATUS_BAR_HEIGHT;
            // collision of enemy and wall
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

    /**
     * Check collision of a ball and a rectangle using raycasting.
     * @param delta time step
     * @param ball ball object
     * @param ballSize size of the ball
     * @param ballVelocity velocity (direction) vector of the ball
     * @param ballSpeed speed of the ball
     * @param bounds bounding rectangle to check the collision with
     */
    private collideRaycasting(
        delta: number,
        ball: Colfio.Container,
        ballSize: number,
        ballVelocity: Colfio.Vector,
        ballSpeed: number,
        bounds: PIXI.Rectangle,
    ): [boolean, number, number, number, number, number]
    {
        const posX = ball.position.x;
        const posY = ball.position.y;

        const cornerX = posX + ballSize + Math.sign(ballVelocity.x) * ballSize;
        const cornerY = posY + ballSize + Math.sign(ballVelocity.y) * ballSize;

        const incrementX = ballVelocity.x * delta * ballSpeed;
        const incrementY = ballVelocity.y * delta * ballSpeed;

        const at = Math.max(0, Math.min(1, (bounds.y - cornerY) / incrementY));
        const bt = Math.max(0, Math.min(1, ((bounds.y + bounds.height) - cornerY) / incrementY));
        const ct = Math.max(0, Math.min(1, (bounds.x - cornerX) / incrementX));
        const dt = Math.max(0, Math.min(1, ((bounds.x + bounds.width) - cornerX) / incrementX));

        const s1 = Math.min(at, bt);
        const s2 = Math.max(at, bt);
        const t1 = Math.min(ct, dt);
        const t2 = Math.max(ct, dt);

        const closest = Math.min(at > 0 ? at : 10000, bt > 0 ? bt : 10000, ct > 0 ? ct : 10000, dt > 0 ? dt : 10000);
        return [(Math.min(s2, t2) - Math.max(s1, t1)) > 0, at, bt, ct, dt, closest];
    }

    /**
     * Check collision of two Axis-Aligned Bounding Boxes (AABB) using the Separating Axis Theorem (SAT).
     * @param boundRectA bounding box of the first object
     * @param boundRectB bounding box of the second object
     */
    private collideSAT = (boundRectA: PIXI.Rectangle, boundRectB: PIXI.Rectangle) =>
        this.hIntersection(boundRectA, boundRectB) > 0 && this.vIntersection(boundRectA, boundRectB) > 0

    /**
     * Find horizontal intersection of two AABB.
     */
    private hIntersection = (boundRectA: PIXI.Rectangle, boundRectB: PIXI.Rectangle) =>
        Math.min(boundRectA.right, boundRectB.right) - Math.max(boundRectA.left, boundRectB.left)

    /**
     * Find vertical intersection of two AABB.
     */
    private vIntersection = (boundRectA: PIXI.Rectangle, boundRectB: PIXI.Rectangle) =>
        Math.min(boundRectA.bottom, boundRectB.bottom) - Math.max(boundRectA.top, boundRectB.top)
}
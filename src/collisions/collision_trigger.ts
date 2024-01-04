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
    private readonly walls = [
        new PIXI.Rectangle(0, -10, GAME_WIDTH, 10),  // top
        new PIXI.Rectangle(-10, -10, 10, GAME_HEIGHT - STATUS_BAR_HEIGHT + 10),  // left
        new PIXI.Rectangle(GAME_WIDTH, 0, 10, GAME_HEIGHT - STATUS_BAR_HEIGHT),  // right
        new PIXI.Rectangle(-10, GAME_HEIGHT - STATUS_BAR_HEIGHT, GAME_WIDTH + 10, 10)  // bottom
    ]

    onUpdate(delta: number, absolute: number)
    {
        const projectiles = this.scene.findObjectsByTag(Tags.PLAYER_PROJECTILE);

        // TODO hrozná ifovačka
        for (let projectile of projectiles)
        {
            const projectileBounds = projectile.getBounds();
            const enemies = this.scene.findObjectsByTag(Tags.ENEMY_CIRCLE);
            const players = this.scene.findObjectsByTag(Tags.PLAYER);

            for (let enemy of enemies)
            {
                // collision of enemy and projectile
                if (this.collideSAT(projectileBounds, enemy.getBounds()))
                {
                    this.sendMessage(Messages.PROJECTILE_COLLISION, {
                        projectile, collider: enemy, type: ProjectileCollisionType.ENEMY
                    });
                }
            }

            for (let player of players)
            {
                if (absolute - player.getAttribute<number>(Attributes.PLAYER_LAST_COLLISION) > PLAYER_INVULNERABLE_TIME)
                {
                    // collision of projectile with other player
                    if (player !== projectile.getAttribute(Attributes.PROJECTILE_SHOOTER)
                        && this.collideSAT(projectileBounds, player.getBounds()))
                    {
                        this.sendMessage(Messages.PROJECTILE_COLLISION, {
                            projectile, collider: player, type: ProjectileCollisionType.PLAYER
                        });
                        player.assignAttribute(Attributes.PLAYER_LAST_COLLISION, absolute);
                    }
                }
            }

            if (projectileBounds.bottom <= 0)
            {
                this.sendMessage(Messages.PROJECTILE_COLLISION, {
                    projectile, type: ProjectileCollisionType.BORDER
                });
            }
        }

        this.checkEnemyCollisions(delta, absolute);
    }

    checkEnemyCollisions(delta: number, absolute: number)
    {
        const players = this.scene.findObjectsByTag(Tags.PLAYER);
        const enemies = this.scene.findObjectsByTag(Tags.ENEMY_CIRCLE);

        for (let i = 0; i < enemies.length; i++)
        {
            const enemy = enemies[i];
            const enemyBounds = enemy.getBounds();
            const enemySize = EnemyTypeAttributes[enemy.getAttribute<string>(Attributes.ENEMY_TYPE)]["size"] * ENEMY_SIZE;
            const enemyVelocity = enemy.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);
            const enemySpeed = enemy.getAttribute<number>(Attributes.ENEMY_SPEED);

            // collision of two enemies
            for (let j = i+1; j < enemies.length; j++)
            {
                const enemy2 = enemies[j];
                const [collision, at, bt, ct, dt] =
                    this.collideRaycasting(delta, enemy, enemySize, enemy2.getBounds(), enemyVelocity, enemySpeed);
                if (enemy !== enemy2 && collision)
                {
                    this.sendMessage(Messages.ENEMY_COLLISION, {
                        enemy, collider: enemy2, type: EnemyCollisionType.ENEMY, collisionData: [at, bt, ct, dt]
                    });
                }
            }

            for (let wall of this.walls)
            {
                const [collision, at, bt, ct, dt] =
                    this.collideRaycasting(delta, enemy, enemySize, wall, enemyVelocity, enemySpeed);
                if (collision)
                {
                    const closest = Math.min(at > 0 ? at : 10000, bt > 0 ? bt : 10000, ct > 0 ? ct : 10000, dt > 0 ? dt : 10000);

                    if (closest === at || closest === bt)
                        this.sendMessage(Messages.ENEMY_COLLISION, {enemy, type: EnemyCollisionType.BORDER_VERTICAL});
                    else if (closest === ct || closest === dt)
                        this.sendMessage(Messages.ENEMY_COLLISION, {enemy, type: EnemyCollisionType.BORDER_HORIZONTAL});
                }
            }

            // collision of enemy and player
            for (let player of players)
            {
                if (player !== null && absolute - player.getAttribute<number>(Attributes.PLAYER_LAST_COLLISION) > PLAYER_INVULNERABLE_TIME)
                {
                    if (this.collideSAT(player?.getBounds(), enemyBounds))
                    {
                        this.sendMessage(Messages.ENEMY_COLLISION, {
                            enemy, collider: player, type: EnemyCollisionType.PLAYER
                        });
                        player.assignAttribute(Attributes.PLAYER_LAST_COLLISION, absolute);
                    }
                }
            }
        }
    }

    private collideRaycasting(
        delta: number,
        ball: Colfio.Container,
        ballSize: number,
        bounds: PIXI.Rectangle,
        ballVelocity: Colfio.Vector = new Colfio.Vector(0, 1),
        ballSpeed: number = 1
): [boolean, number, number, number, number]
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

        return [(Math.min(s2, t2) - Math.max(s1, t1)) > 0, at, bt, ct, dt];
    }

    private collideSAT = (boundRectA: PIXI.Rectangle, boundRectB: PIXI.Rectangle) =>
        this.hIntersection(boundRectA, boundRectB) > 0 && this.vIntersection(boundRectA, boundRectB) > 0

    private hIntersection = (boundRectA: PIXI.Rectangle, boundRectB: PIXI.Rectangle) =>
        Math.min(boundRectA.right, boundRectB.right) - Math.max(boundRectA.left, boundRectB.left)

    private vIntersection = (boundRectA: PIXI.Rectangle, boundRectB: PIXI.Rectangle) =>
        Math.min(boundRectA.bottom, boundRectB.bottom) - Math.max(boundRectA.top, boundRectB.top)
}
import * as Colfio from "colfio";
import * as PIXI from "pixi.js"

export abstract class CollisionTrigger extends Colfio.Component
{
    /**
     * Check collision of a ball and a rectangle using raycasting. Taken from:
     * https://github.com/APHGames/examples/blob/main/src/06-physics/collisions-raycasting.ts
     *
     * @param delta time step
     * @param ball ball object
     * @param ballSize size of the ball
     * @param ballVelocity velocity (direction) vector of the ball
     * @param ballSpeed speed of the ball
     * @param bounds bounding rectangle to check the collision with
     */
    protected collideRaycasting(
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
    protected collideSAT = (boundRectA: PIXI.Rectangle, boundRectB: PIXI.Rectangle) =>
        this.hIntersection(boundRectA, boundRectB) > 0 && this.vIntersection(boundRectA, boundRectB) > 0

    /**
     * Find horizontal intersection of two AABB.
     */
    protected hIntersection = (boundRectA: PIXI.Rectangle, boundRectB: PIXI.Rectangle) =>
        Math.min(boundRectA.right, boundRectB.right) - Math.max(boundRectA.left, boundRectB.left)

    /**
     * Find vertical intersection of two AABB.
     */
    protected vIntersection = (boundRectA: PIXI.Rectangle, boundRectB: PIXI.Rectangle) =>
        Math.min(boundRectA.bottom, boundRectB.bottom) - Math.max(boundRectA.top, boundRectB.top)
}
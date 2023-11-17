import * as Colfio from "colfio";

export class EnemyMovement extends Colfio.Component
{
    angleRad: number;
    velocity: Colfio.Vector;

    onInit()
    {
        const minAngle = 45;
        const maxAngle = 135;
        const randomAngle = Math.floor(Math.random() * (maxAngle - minAngle + 1)) + minAngle;
        this.angleRad = randomAngle * (Math.PI / 180);
        this.velocity = new Colfio.Vector(Math.cos(this.angleRad), Math.sin(this.angleRad)).normalize();
    }

    onUpdate(delta: number, absolute: number)
    {
        const pos = this.owner.position;
        const screenWidth = this.scene.app.screen.width;
        const screenHeight = this.scene.app.screen.height;
        const boundRect = this.owner.getBounds();

        if (boundRect.right >= screenWidth || boundRect.left <= 0)
            this.velocity = new Colfio.Vector(-this.velocity.x, this.velocity.y);
        if (boundRect.bottom >= screenHeight || boundRect.top <= 0)
            this.velocity = new Colfio.Vector(this.velocity.x, -this.velocity.y);

        pos.x += delta * this.velocity.x * 0.15;
        pos.y += delta * this.velocity.y * 0.15;
    }
}
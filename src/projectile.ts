import * as Colfio from 'colfio';

export class ProjectileMovement extends Colfio.Component
{
    onInit() {}

    onUpdate(delta: number, absolute: number)
    {
        const pos = this.owner.position;
        const boundRect = this.owner.getBounds();

        pos.y -= delta * 0.4;

        if (boundRect.bottom <= 0)
            this.owner.destroy();
    }
}
import * as Colfio from 'colfio';
import {Attributes, Messages} from "./constants";
import {GameState} from "./game";

export class ProjectileMovement extends Colfio.Component
{
    projectileSpeed = 0.5;

    onInit() {}

    onUpdate(delta: number, absolute: number)
    {
        if (! this.scene.getGlobalAttribute<GameState>(Attributes.GAME_STATE).isRunning)
            return;

        const pos = this.owner.position;
        const boundRect = this.owner.getBounds();

        pos.y -= delta * this.projectileSpeed;

        if (boundRect.bottom <= 0)
            this.sendMessage(Messages.PROJECTILE_DESTROYED, this.owner);
    }
}
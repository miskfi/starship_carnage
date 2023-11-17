import * as Colfio from 'colfio';
import {Attributes, Messages} from "./constants";
import {GameState} from "./game";

export class ProjectileMovement extends Colfio.Component
{
    onInit() {}

    onUpdate(delta: number, absolute: number)
    {
        if (! this.scene.getGlobalAttribute<GameState>(Attributes.GAME_STATE).isRunning)
            return;

        const pos = this.owner.position;
        const boundRect = this.owner.getBounds();

        pos.y -= delta * 0.4;

        if (boundRect.bottom <= 0)
        {
            this.sendMessage(Messages.PROJECTILE_DESTROYED);
            this.owner.destroy();
        }
    }
}
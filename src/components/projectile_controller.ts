import * as Colfio from 'colfio';
import {GlobalAttributes} from "../constants/enums";
import {GameState} from "../game";
import {PROJECTILE_SPEED} from "../constants/constants";

/**
 * A component that controls projectile movement.
 */
export class ProjectileController extends Colfio.Component
{
    onInit() {}

    onUpdate(delta: number, absolute: number)
    {
        if (! this.scene.getGlobalAttribute<GameState>(GlobalAttributes.GAME_STATE).isRunning)
            return;

        const pos = this.owner.position;
        pos.y -= delta * PROJECTILE_SPEED;
    }
}
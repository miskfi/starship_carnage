import * as Colfio from "colfio";
import {GameState} from "../game";
import {GlobalAttributes, Attributes} from "../constants/enums";

/**
 * A component that controls enemy movement.
 */
export class EnemyController extends Colfio.Component
{
    onInit() {}

    onUpdate(delta: number, absolute: number)
    {
        if (! this.scene.getGlobalAttribute<GameState>(GlobalAttributes.GAME_STATE).isRunning)
            return;

        const pos = this.owner.position;
        const velocity = this.owner.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);
        const speed = this.owner.getAttribute<number>(Attributes.ENEMY_SPEED);

        pos.x += delta * velocity.x * speed;
        pos.y += delta * velocity.y * speed;
    }
}
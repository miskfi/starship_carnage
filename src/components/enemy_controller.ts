import * as Colfio from "colfio";
import {GameState} from "../game";
import {Attributes} from "../constants";

/**
 * A component that controls enemy movement.
 */
export class EnemyController extends Colfio.Component
{
    onInit() {}

    onUpdate(delta: number, absolute: number)
    {
        if (! this.scene.getGlobalAttribute<GameState>(Attributes.GAME_STATE).isRunning)
            return;

        const pos = this.owner.position;

        let velocity = this.owner.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);
        const speed = this.owner.getAttribute<number>(Attributes.ENEMY_SPEED);

        pos.x += delta * velocity.x * speed;
        pos.y += delta * velocity.y * speed;
    }
}
import * as Colfio from "colfio";
import {GameState} from "./game";
import {Attributes} from "./constants";

export class EnemyMovement extends Colfio.Component
{
    onInit() {}

    onUpdate(delta: number, absolute: number)
    {
        if (! this.scene.getGlobalAttribute<GameState>(Attributes.GAME_STATE).isRunning)
            return;

        const pos = this.owner.position;
        const screenWidth = this.scene.app.screen.width;
        const screenHeight = this.scene.app.screen.height;
        const boundRect = this.owner.getBounds();
        let velocity = this.owner.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);

        if (boundRect.right >= screenWidth || boundRect.left <= 0)
            this.owner.assignAttribute(
                Attributes.ENEMY_VELOCITY,
                new Colfio.Vector(-velocity.x, velocity.y).normalize()
            )
        if (boundRect.bottom >= screenHeight || boundRect.top <= 0)
            this.owner.assignAttribute(
                Attributes.ENEMY_VELOCITY,
                new Colfio.Vector(velocity.x, -velocity.y).normalize()
            )

        velocity = this.owner.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);
        const speed = this.owner.getAttribute<number>(Attributes.ENEMY_SPEED);

        pos.x += delta * velocity.x * speed;
        pos.y += delta * velocity.y * speed;
    }
}
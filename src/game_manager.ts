import * as Colfio from "colfio";
import {Attributes, Messages} from "./constants";
import {GameState} from "./game";

/**
 * Class responsible for global game logic.
 */
export class GameManager extends Colfio.Component
{
    onInit()
    {
        this.subscribe(Messages.PROJECTILE_SHOT, Messages.PROJECTILE_DESTROYED, Messages.PLAYER_HIT);
    }

    onMessage(msg: Colfio.Message): any
    {
        if (msg.action === Messages.PROJECTILE_SHOT)
        {
            const projectiles = this.scene.getGlobalAttribute<number>(Attributes.PROJECTILES_AVAILABLE);
            this.scene.assignGlobalAttribute(Attributes.PROJECTILES_AVAILABLE, projectiles - 1);
        }
        else if (msg.action === Messages.PROJECTILE_DESTROYED)
        {
            const projectiles = this.scene.getGlobalAttribute<number>(Attributes.PROJECTILES_AVAILABLE);
            this.scene.assignGlobalAttribute(Attributes.PROJECTILES_AVAILABLE, projectiles + 1);
        }
        else if (msg.action === Messages.PLAYER_HIT)
        {
            this.scene.assignGlobalAttribute(Attributes.GAME_STATE, {
                isRunning: false
            } as GameState)

            this.showGameOver();
        }
    }

    showGameOver()
    {
        const overlay = new Colfio.Graphics();

        overlay.beginFill(0x4D4D4D, 0.1);
        overlay.drawRect(0, 0, this.scene.app.screen.width, this.scene.app.screen.height);
        overlay.endFill();

        // Add the overlay to the stage
        this.scene.stage.addChild(overlay);
    }
}
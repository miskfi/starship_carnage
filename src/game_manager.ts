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
        this.subscribe(
            Messages.ENEMY_DESTROYED,
            Messages.PROJECTILE_SHOT,
            Messages.PROJECTILE_DESTROYED,
            Messages.PLAYER_HIT
        );
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
            const projectileToDestroy = msg.data as Colfio.Graphics;
            projectileToDestroy.destroy();

            const projectiles = this.scene.getGlobalAttribute<number>(Attributes.PROJECTILES_AVAILABLE);
            this.scene.assignGlobalAttribute(Attributes.PROJECTILES_AVAILABLE, projectiles + 1);
        }
        else if (msg.action === Messages.ENEMY_DESTROYED)
        {
            const enemyToDestroy = msg.data as Colfio.Graphics;
            enemyToDestroy.destroy();

            const enemies = this.scene.getGlobalAttribute<number>(Attributes.ENEMIES_COUNT);
            if (enemies > 1)
            {
                this.scene.assignGlobalAttribute(Attributes.ENEMIES_COUNT, enemies - 1);
            }
            else
            {
                this.setGameNotRunning();
                setTimeout(() => this.showScreenOverlay(0x00FF00, 0.5), 20);
            }
        }
        else if (msg.action === Messages.PLAYER_HIT)
        {
            this.setGameNotRunning();
            setTimeout(() => this.showScreenOverlay(0x4D4D4D, 0.1), 20);
        }
    }

    setGameNotRunning()
    {
        this.scene.assignGlobalAttribute(Attributes.GAME_STATE, {
            isRunning: false
        } as GameState)
    }

    showScreenOverlay(color: number, alpha: number)
    {
        const overlay = new Colfio.Graphics();

        overlay.beginFill(color, alpha);
        overlay.drawRect(0, 0, this.scene.app.screen.width, this.scene.app.screen.height);
        overlay.endFill();

        // Add the overlay to the stage
        this.scene.stage.addChild(overlay);
    }
}
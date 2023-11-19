import * as Colfio from "colfio";
import {Attributes, EnemyType, EnemyTypeOrder, Messages} from "./constants";
import {GameState} from "./game";
import {createEnemyCircle} from "./factory";

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
            const enemyType = enemyToDestroy.getAttribute<EnemyType>(Attributes.ENEMY_TYPE);
            const enemyPosition: [number, number] = [enemyToDestroy.position.x, enemyToDestroy.position.y];
            let enemyCount = this.scene.getGlobalAttribute<number>(Attributes.ENEMIES_COUNT);

            if (enemyType !== EnemyType.SMALLEST)
            {
                let flipXMovement: number;

                const velocity = enemyToDestroy.getAttribute<Colfio.Vector>(Attributes.ENEMY_VELOCITY);
                if (velocity.x < 0)
                    flipXMovement = -1;
                else
                    flipXMovement = 1;

                const enemyLeft = createEnemyCircle(
                    this.scene,
                    EnemyTypeOrder[EnemyTypeOrder.indexOf(enemyType) + 1],
                    [enemyPosition[0] - 10, enemyPosition[1]],
                    new Colfio.Vector(-velocity.x * flipXMovement, velocity.y).normalize()
                );
                const enemyRight= createEnemyCircle(
                    this.scene,
                    EnemyTypeOrder[EnemyTypeOrder.indexOf(enemyType) + 1],
                    [enemyPosition[0] + 10, enemyPosition[1]],
                    new Colfio.Vector(velocity.x * flipXMovement, velocity.y).normalize()
                );

                enemyCount += 2;
                this.scene.stage.addChild(enemyLeft);
                this.scene.stage.addChild(enemyRight);
            }

            enemyToDestroy.destroy();
            if (enemyCount > 1)
                this.scene.assignGlobalAttribute(Attributes.ENEMIES_COUNT, enemyCount - 1);
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
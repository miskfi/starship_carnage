import * as Colfio from "colfio";
import {GlobalAttributes, Attributes, Messages} from "../constants/enums";
import {GameState} from "../game";
import {EnemyType} from "../constants/enemy_attributes";

export class GameManager extends Colfio.Component
{
    private gameModel;

    onInit()
    {
        this.subscribe(
            Messages.ENEMY_DESTROYED,
            Messages.PROJECTILE_SHOT,
            Messages.PROJECTILE_DESTROYED,
            Messages.PLAYER_HIT,
            Messages.LEVEL_START,
            Messages.GAME_MODE_SELECTED
        );

        this.gameModel = this.scene.getGlobalAttribute(GlobalAttributes.GAME_MODEL);
    }

    onMessage(msg: Colfio.Message): any
    {
        switch (msg.action)
        {
            case Messages.GAME_MODE_SELECTED:
                this.gameModel.gameMode = msg.data as number;
                break;

            case Messages.PROJECTILE_SHOT:
                this.onProjectileShot(msg);
                break;

            case Messages.PROJECTILE_DESTROYED:
                this.onProjectileDestroyed(msg);
                break;

            case Messages.ENEMY_DESTROYED:
                this.onEnemyDestroyed(msg);
                break;

            case Messages.PLAYER_HIT:
                this.onPlayerHit(msg);
                break;

            case Messages.LEVEL_START:
                this.onLevelStart();
                break;
        }
    }

    onProjectileShot(msg: Colfio.Message)
    {
        const player = msg.data as Colfio.Container;
        const projectiles = player.getAttribute<number>(Attributes.PLAYER_PROJECTILES_AVAILABLE);
        player.assignAttribute(Attributes.PLAYER_PROJECTILES_AVAILABLE, projectiles - 1);
    }

    onProjectileDestroyed(msg: Colfio.Message)
    {
        const projectileToDestroy = msg.data as Colfio.Container;
        const player = projectileToDestroy.getAttribute<Colfio.Container>(Attributes.PROJECTILE_SOURCE);
        const projectiles = player.getAttribute<number>(Attributes.PLAYER_PROJECTILES_AVAILABLE);
        player.assignAttribute(Attributes.PLAYER_PROJECTILES_AVAILABLE, projectiles + 1);
    }

    onEnemyDestroyed(msg: Colfio.Message)
    {
        const enemyToDestroy = msg.data as Colfio.Container;
        const enemyType = enemyToDestroy.getAttribute<EnemyType>(Attributes.ENEMY_TYPE);

        if (enemyType !== EnemyType.SMALLEST)  // two new enemies are created
            this.gameModel.addEnemies(2)

        this.gameModel.removeEnemy();
        if (this.gameModel.enemies === 0)
        {
            this.setGameNotRunning();
            this.gameModel.nextLevel();
            this.sendMessage(Messages.LEVEL_FINISHED, this.gameModel.gameWon);
        }
    }

    onPlayerHit(msg: Colfio.Message)
    {
        const player = msg.data as Colfio.Container;
        const lives = player.getAttribute<number>(Attributes.PLAYER_LIVES);

        // player dead
        if (lives - 1 === 0)
        {
            this.gameModel.removePlayer();
            this.sendMessage(Messages.PLAYER_DEAD, player);

            if (this.gameModel.players === 0)
            {
                this.setGameNotRunning();
                this.sendMessage(Messages.GAME_OVER);
            }
        }

        player.assignAttribute(Attributes.PLAYER_LIVES, lives - 1);
    }

    onLevelStart()
    {
        this.gameModel.resetPlayers();
        this.gameModel.setEnemiesLevelStart();
    }

    setGameNotRunning()
    {
        this.scene.assignGlobalAttribute(GlobalAttributes.GAME_STATE, {isRunning: false} as GameState);
    }
}
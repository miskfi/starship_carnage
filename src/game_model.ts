import * as Colfio from "colfio";
import {GlobalAttributes, Attributes, Messages} from "./constants/enums";
import {GameState} from "./game";
import {EnemyType} from "./constants/enemy_attributes";
import {Level, LevelParser} from "./level";

export class GameModel extends Colfio.Component
{
    private _enemiesCount: number;
    private _playersCount: number;
    private _gameWon: boolean;
    private _gameMode: number;  // number of players in the current game mode

    private _levels1P: Level[];
    private _levels2P: Level[];
    private _currentLevel1P: number;
    private _currentLevel2P: number;

    constructor(levelData)
    {
        super();
        this.parseLevels(levelData);
        this._gameWon = false;
    }

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
    }

    onMessage(msg: Colfio.Message): any
    {
        switch (msg.action)
        {
            case Messages.GAME_MODE_SELECTED:
                this._gameMode = msg.data as number;
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
        const projectiles = player.getAttribute<number>(Attributes.PROJECTILES_AVAILABLE);
        player.assignAttribute(Attributes.PROJECTILES_AVAILABLE, projectiles - 1);
    }

    onProjectileDestroyed(msg: Colfio.Message)
    {
        const projectileToDestroy = msg.data as Colfio.Container;
        const player = projectileToDestroy.getAttribute<Colfio.Container>(Attributes.PROJECTILE_SHOOTER);
        const projectiles = player.getAttribute<number>(Attributes.PROJECTILES_AVAILABLE);
        player.assignAttribute(Attributes.PROJECTILES_AVAILABLE, projectiles + 1);
    }

    onEnemyDestroyed(msg: Colfio.Message)
    {
        const enemyToDestroy = msg.data as Colfio.Container;
        const enemyType = enemyToDestroy.getAttribute<EnemyType>(Attributes.ENEMY_TYPE);

        if (enemyType !== EnemyType.SMALLEST)  // two new enemies are created
            this._enemiesCount += 2;

        this._enemiesCount--;
        if (this._enemiesCount === 0)
        {
            this.setGameNotRunning();
            this.onLevelFinished();
            this.sendMessage(Messages.LEVEL_FINISHED, this._gameWon);
        }
    }

    onPlayerHit(msg: Colfio.Message)
    {
        const player = msg.data as Colfio.Container;
        const lives = player.getAttribute<number>(Attributes.PLAYER_LIVES);

        // player dead
        if (lives - 1 === 0)
        {
            this._playersCount--;
            this.sendMessage(Messages.PLAYER_DEAD, player);

            if (this._playersCount === 0)
            {
                this.setGameNotRunning();
                this.sendMessage(Messages.GAME_OVER);
            }
        }

        player.assignAttribute(Attributes.PLAYER_LIVES, lives - 1);
    }

    onLevelStart()
    {
        this._playersCount = this._gameMode;
        this._enemiesCount = this.getCurrentLevel().enemies.length;
    }

    /**
     * Increment the level counter and find out whether the game has been won (all levels finished).
     */
    onLevelFinished()
    {
        if (this._gameMode === 1)
        {
            this._currentLevel1P++;
            if (this._currentLevel1P === this._levels1P.length)
                this._gameWon = true;
        }
        else
        {
            this._currentLevel2P++;
            if (this._currentLevel2P === this._levels2P.length)
                this._gameWon = true;
        }
    }

    setGameNotRunning()
    {
        this.scene.assignGlobalAttribute(GlobalAttributes.GAME_STATE, {isRunning: false} as GameState);
    }

    parseLevels(levelData)
    {
        const parser = new LevelParser();
        this._levels1P = parser.parseSingleplayer(levelData);
        this._levels2P = parser.parseMultiplayer(levelData);
        this._currentLevel1P = 0;
        this._currentLevel2P = 0;
    }

    get gameMode()
    {
        return this._gameMode;
    }

    /**
     * Get the last available level in the current game mode.
     */
    getCurrentLevel()
    {
        return this._gameMode === 1
            ? this._levels1P[this._currentLevel1P]
            : this._levels2P[this._currentLevel2P];
    }

    /**
     * Get the number of the last available level in the current game mode.
     */
    getCurrentLevelNumber()
    {
        return this._gameMode === 1
            ? this._currentLevel1P
            : this._currentLevel2P;
    }
}
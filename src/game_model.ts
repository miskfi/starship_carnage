import {Level, LevelParser} from "./level";

export class GameModel
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
        this.parseLevels(levelData);
        this._gameWon = false;
    }

    private parseLevels(levelData)
    {
        const parser = new LevelParser();
        this._levels1P = parser.parseSingleplayer(levelData);
        this._levels2P = parser.parseMultiplayer(levelData);
        this._currentLevel1P = 0;
        this._currentLevel2P = 0;
    }

    get gameMode() {return this._gameMode;}

    set gameMode(newMode: number) {this._gameMode = newMode;}

    get gameWon() {return this._gameWon}

    get enemies() {return this._enemiesCount}

    setEnemiesLevelStart = () => this._enemiesCount = this.getCurrentLevel().enemies.length;

    addEnemies = (count: number = 1) => this._enemiesCount += count;

    removeEnemy = () => this._enemiesCount--;

    get players() {return this._playersCount}

    resetPlayers = () => this._playersCount = this._gameMode;

    removePlayer = () => this._playersCount--;

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

    /**
     * Increment the level counter and find out whether the game has been won (all levels finished).
     */
    nextLevel()
    {
        if (this._gameMode === 1)
        {
            this._currentLevel1P++;
            if (this._currentLevel1P === this._levels1P.length)
            {
                this._currentLevel1P = 0;
                this._gameWon = true;
            }
        }
        else
        {
            this._currentLevel2P++;
            if (this._currentLevel2P === this._levels2P.length)
            {
                this._currentLevel2P = 0;
                this._gameWon = true;
            }
        }
    }
}
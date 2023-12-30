import {EnemyType} from "./constants/enemy_attributes";

export class LevelParser
{
    parseSingleplayer = (data: string): Level[] =>
    {
        const lists = data["1 player"]
        return lists.map((enemyList) => new Level(enemyList.map((enemy) => EnemyType[enemy])));
    }

    parseMultiplayer = (data: string): Level[] =>
    {
        const lists = data["2 players"]
        return lists.map((enemyList) => new Level(enemyList.map((enemy) => EnemyType[enemy])));
    }
}

export class Level
{
    private readonly _enemies: EnemyType[];

    constructor(enemies: EnemyType[])
    {
        this._enemies = enemies;
    }

    get enemies()
    {
        return this._enemies;
    }
}
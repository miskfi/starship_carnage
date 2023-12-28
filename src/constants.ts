export enum Tags
{
    ENEMY_CIRCLE = "ENEMY_CIRCLE",
    PLAYER_PROJECTILE = "PLAYER_PROJECTILE",
    PLAYER = "PLAYER"
}

export enum Messages
{
    ENEMY_DESTROYED = "ENEMY_DESTROYED",
    PLAYER_HIT = "PLAYER_HIT",
    PROJECTILE_SHOT = "PROJECTILE_SHOT",
    PROJECTILE_DESTROYED = "PROJECTILE_DESTROYED",
    PROJECTILE_COLLISION = "PROJECTILE_COLLISION",
    ENEMY_COLLISION = "ENEMY_COLLISION",
    GAME_START = "GAME_START",
    GAME_OVER = "GAME_OVER",
    GAME_WON = "GAME_WON",
    MAIN_MENU = "MAIN_MENU"
}

export enum Attributes
{
    GAME_STATE = "GAME_STATE",
    ENEMIES_COUNT = "ENEMIES_COUNT",
    ENEMY_TYPE = "ENEMY_TYPE",
    ENEMY_SPEED = "ENEMY_SPEED",
    ENEMY_VELOCITY = "ENEMY_VELOCITY",
    KEY_INPUT = "KEY_INPUT",
    PROJECTILES_AVAILABLE = "PROJECTILES_AVAILABLE",
    PROJECTILES_MAX = "PROJECTILES_MAX",
}

export enum EnemyType
{
    SMALLEST = "SMALLEST",
    SMALL = "SMALL",
    MEDIUM = "MEDIUM",
    BIG = "BIG",
    BIGGEST = "BIGGEST"
}

export const EnemyTypeOrder = [
    EnemyType.BIGGEST,
    EnemyType.BIG,
    EnemyType.MEDIUM,
    EnemyType.SMALL,
    EnemyType.SMALLEST
]

export const EnemySizes =
{
    "SMALLEST": 20,
    "SMALL": 30,
    "MEDIUM": 40,
    "BIG": 50,
    "BIGGEST": 60
}

export const EnemySpeeds =
{
    "SMALLEST": 0.2,
    "SMALL": 0.175,
    "MEDIUM": 0.15,
    "BIG": 0.125,
    "BIGGEST": 0.1
}

export enum Assets
{
    FONT = "FONT"
}
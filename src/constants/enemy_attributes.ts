export type EnemyAttributes = {
    size: number
    speed: number
}

export enum EnemyType
{
    SMALLEST = "SMALLEST",
    SMALL = "SMALL",
    MEDIUM = "MEDIUM",
    BIG = "BIG",
}

export const EnemyTypeOrder = [
    EnemyType.BIG,
    EnemyType.MEDIUM,
    EnemyType.SMALL,
    EnemyType.SMALLEST
]

export const EnemyTypeAttributes: Record<keyof typeof EnemyType, EnemyAttributes> =
{
    "SMALLEST": {size: 1.5, speed: 0.2},
    "SMALL": {size: 2, speed: 0.175},
    "MEDIUM": {size: 2.5, speed: 0.15},
    "BIG": {size: 3, speed: 0.125},
}

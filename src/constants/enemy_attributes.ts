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
    BIGGEST = "BIGGEST"
}

export const EnemyTypeOrder = [
    EnemyType.BIGGEST,
    EnemyType.BIG,
    EnemyType.MEDIUM,
    EnemyType.SMALL,
    EnemyType.SMALLEST
]

export const EnemyTypeAttributes: Record<keyof typeof EnemyType, EnemyAttributes> =
{
    "SMALLEST": {size: 20, speed: 0.2},
    "SMALL": {size: 30, speed: 0.175},
    "MEDIUM": {size: 40, speed: 0.15},
    "BIG": {size: 50, speed: 0.125},
    "BIGGEST": {size: 60, speed: 0.2}
}

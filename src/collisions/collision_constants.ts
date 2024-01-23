import * as Colfio from "colfio";

export enum ProjectileCollisionType
{
    ENEMY = "ENEMY",
    BORDER = "BORDER",
    PLAYER = "PLAYER"
}

export enum EnemyCollisionType
{
    PLAYER = "PLAYER",
    ENEMY = "ENEMY",
    BORDER_VERTICAL = "BORDER_VERTICAL",
    BORDER_HORIZONTAL = "BORDER_HORIZONTAL"
}

export type ProjectileCollisionMessage = {
    projectile: Colfio.Container;
    collider: Colfio.Container;
    type: ProjectileCollisionType;
}

export type EnemyCollisionMessage = {
    enemy: Colfio.Container;
    collider: Colfio.Container;
    type: EnemyCollisionType;
    collisionData?: number;
}

export type RaycastingCollisionInfo = {
    collision: boolean,
    at: number,
    bt: number,
    ct: number
    dt: number,
    closest: number
}
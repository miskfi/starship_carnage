import * as Colfio from "colfio";

export enum ProjectileCollisionType
{
    ENEMY = "ENEMY",
    BORDER = "BORDER"
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
}
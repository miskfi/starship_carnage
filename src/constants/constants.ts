import * as Colfio from 'colfio';

// projectiles
export const PROJECTILES_MAX = 3;
export const PROJECTILE_SIZE = 5;
export const PROJECTILE_SPEED = 0.5;

// enemies
export const ENEMY_SIZE = 16;

// player
export const PLAYER_HEIGHT = 24;
export const PLAYER_WIDTH = 16;
export const PLAYER_SPEED = 0.15;
export const PLAYER_LIVES = 3;
export const PLAYER_INVULNERABLE_TIME = 1000;  // in ms

// controls
export const SINGLEPLAYER_CONTROLS: Record<any, any> = {
    "left": [Colfio.Keys.KEY_LEFT, Colfio.Keys.KEY_A],
    "right": [Colfio.Keys.KEY_RIGHT, Colfio.Keys.KEY_D],
    "up": [Colfio.Keys.KEY_UP, Colfio.Keys.KEY_W],
    "down": [Colfio.Keys.KEY_DOWN, Colfio.Keys.KEY_S],
    "shoot": [Colfio.Keys.KEY_SPACE, Colfio.Keys.KEY_CTRL, 49, Colfio.Keys.KEY_G]
}

export const P1_CONTROLS: Record<any, any> = {
    "left": [Colfio.Keys.KEY_A],
    "right": [Colfio.Keys.KEY_D],
    "up": [Colfio.Keys.KEY_W],
    "down": [Colfio.Keys.KEY_S],
    "shoot": [Colfio.Keys.KEY_SPACE, 49]  // 49 (1) is a ggBlaster button
}

export const P2_CONTROLS: Record<any, any> = {
    "left": [Colfio.Keys.KEY_LEFT],
    "right": [Colfio.Keys.KEY_RIGHT],
    "up": [Colfio.Keys.KEY_UP],
    "down": [Colfio.Keys.KEY_DOWN],
    "shoot": [Colfio.Keys.KEY_CTRL, Colfio.Keys.KEY_G]  // G is a ggBlaster button
}

export const CONTROLS_ENTER = [Colfio.Keys.KEY_ENTER, Colfio.Keys.Key_O, 55];  // 0 and 55 (7) are ggBlaster controls
export const CONTROLS_SHIFT = [Colfio.Keys.KEY_SHIFT, Colfio.Keys.Key_P, 56];  // P and 56 (8) are ggBlaster controls

// text colors
export const COLOR_TEXT_PASSIVE = 0x6B6261;
export const COLOR_TEXT_ACTIVE = 0x00C3E6;
export const COLOR_GAME_WON = 0x00FF00;
export const COLOR_GAME_OVER = 0xFF0000;

// textures
export const TEXTURE_SCALE = 2.5;

// sizes
export const GAME_WIDTH = 800
export const GAME_HEIGHT = 600
export const STATUS_BAR_HEIGHT = 50
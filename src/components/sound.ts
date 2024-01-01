import { sound } from '@pixi/sound';
import * as Colfio from 'colfio';
import {GameAssets, Messages} from "../constants/enums";

export class SoundSystem extends Colfio.Component
{
    onInit()
    {
        this.subscribe(
            Messages.BUTTON_CHANGE,
            Messages.ENEMY_DESTROYED,
            Messages.GAME_OVER,
            Messages.LEVEL_FINISHED,
            Messages.LEVEL_START,
            Messages.MAIN_MENU,
            Messages.PLAYER_HIT,
            Messages.PROJECTILE_SHOT
        );
    }

    onMessage(msg: Colfio.Message): any
    {
        switch (msg.action)
        {
            case Messages.BUTTON_CHANGE:
                sound.play(GameAssets.SOUND_BUTTON_CHANGE, {volume: 1});
                break;

            case Messages.ENEMY_DESTROYED:
                sound.play(GameAssets.SOUND_ENEMY_DESTROYED, {volume: 0.3});
                break;

            case Messages.GAME_OVER:
                sound.stop(GameAssets.SOUND_MUSIC_GAME);
                sound.play(GameAssets.SOUND_GAME_OVER, {volume: 0.5});
                break;

            case Messages.LEVEL_FINISHED:
                sound.stop(GameAssets.SOUND_MUSIC_GAME);
                sound.play(GameAssets.SOUND_LEVEL_FINISHED, {volume: 0.7});
                break;

            case Messages.LEVEL_START:
                sound.stop(GameAssets.SOUND_MUSIC_MENU);
                sound.play(GameAssets.SOUND_MUSIC_GAME, {loop: true, volume: 0.3});
                break;

            case Messages.MAIN_MENU:
                sound.stop(GameAssets.SOUND_MUSIC_GAME);
                sound.play(GameAssets.SOUND_MUSIC_MENU, {loop: true, volume: 0.5});
                break;

            case Messages.PLAYER_HIT:
                sound.play(GameAssets.SOUND_PLAYER_HIT, {volume: 0.5});
                break;

            case Messages.PROJECTILE_SHOT:
                sound.play(GameAssets.SOUND_SHOT, {volume: 0.4});
                break;
        }
    }
}
import { sound } from '@pixi/sound';
import * as Colfio from 'colfio';
import {Assets, Messages} from "../constants/enums";

export class SoundSystem extends Colfio.Component
{
    onInit()
    {
        this.subscribe(
            Messages.PROJECTILE_SHOT,
            Messages.MAIN_MENU,
            Messages.GAME_OVER,
            Messages.GAME_WON,
            Messages.GAME_START,
            Messages.BUTTON_CHANGE,
            Messages.ENEMY_DESTROYED
        );
    }

    onMessage(msg: Colfio.Message): any
    {
        if (msg.action === Messages.PROJECTILE_SHOT)
            sound.play(Assets.SOUND_SHOT, {volume: 0.4});
        else if (msg.action === Messages.MAIN_MENU)
        {
            sound.stop(Assets.SOUND_MUSIC_GAME);
            sound.play(Assets.SOUND_MUSIC_MENU, {loop: true, volume: 0.5});
        }
        else if (msg.action === Messages.GAME_START)
        {
            sound.stop(Assets.SOUND_MUSIC_MENU);
            sound.play(Assets.SOUND_MUSIC_GAME, {loop: true, volume: 0.3});
        }
        else if (msg.action === Messages.GAME_OVER)
        {
            sound.stop(Assets.SOUND_MUSIC_GAME);
            sound.play(Assets.SOUND_GAME_OVER, {volume: 0.5});
        }
        else if (msg.action === Messages.GAME_WON)
        {
            sound.stop(Assets.SOUND_MUSIC_GAME);
            sound.play(Assets.SOUND_GAME_WON, {volume: 0.7});
        }
        else if (msg.action === Messages.BUTTON_CHANGE)
            sound.play(Assets.SOUND_BUTTON_CHANGE, {volume: 1})
        else if (msg.action === Messages.ENEMY_DESTROYED)
            sound.play(Assets.SOUND_ENEMY_DESTROYED, {volume: 0.3})
    }
}
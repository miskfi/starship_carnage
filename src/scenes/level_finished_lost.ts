import * as Colfio from 'colfio';
import {GlobalAttributes, Messages, Tags} from "../constants/enums";
import {COLOR_GAME_OVER, COLOR_GAME_WON} from "../constants/constants";

/**
 * Parent class for Game Over, Game Won and Level Finished scenes.
 */
abstract class IntermediateScene extends Colfio.Component
{
    keyInput: Colfio.KeyInputComponent;
    sceneContainer: Colfio.Container;

    title: string;
    instructions: string;
    titleColor: number;

    onInit()
    {
        this.keyInput = this.scene.getGlobalAttribute(GlobalAttributes.KEY_INPUT);
        this.sceneContainer = new Colfio.Container();
        this.owner.addChild(this.sceneContainer);

        this.clear();
        this.createScreen();
    }

    onUpdate(delta: number, absolute: number)
    {
        if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_ENTER))
        {
            this.keyInput.handleKey(Colfio.Keys.KEY_ENTER);
            this.sendMessage(Messages.LEVEL_START, this.scene.getGlobalAttribute(GlobalAttributes.GAME_MODE));
            this.sceneContainer.destroy();
        }
        if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_SHIFT))
        {
            this.keyInput.handleKey(Colfio.Keys.KEY_SHIFT);
            this.sendMessage(Messages.MAIN_MENU);
            this.sceneContainer.destroy();
        }
    }

    clear()
    {
        // TODO destrukci přesunout jinam
        const projectiles = this.scene.findObjectsByTag(Tags.PLAYER_PROJECTILE) as Colfio.Container[];
        const players = this.scene.findObjectsByTag(Tags.PLAYER) as Colfio.Container[];
        const enemies = this.scene.findObjectsByTag(Tags.ENEMY_CIRCLE) as Colfio.Container[];
        const background = this.scene.findObjectByTag(Tags.BACKGROUND) as Colfio.Container;

        const objects = [...players, ...projectiles, ...enemies, background];

        for (let obj of objects)
            obj.destroy();

    }

    createScreen()
    {
        let game_over = new Colfio.BitmapText(
            this.title,
            this.title,
            "Early GameBoy",
            50,
            this.titleColor
        );
        game_over.anchor.set(0.5);
        game_over.position.set(this.scene.width / 2, this.scene.height / 4);
        this.sceneContainer.addChild(game_over);

        let instructions = new Colfio.BitmapText(
            "Instructions",
            this.instructions,
            "Early GameBoy",
            20,
            0xFFFFFF
        );
        instructions.align = "center";
        instructions.anchor.set(0.5);
        instructions.position.set(this.scene.width / 2, this.scene.height / 2);
        this.sceneContainer.addChild(instructions);
    }
}

export class GameWon extends IntermediateScene
{
    title = "Game Won";
    titleColor = COLOR_GAME_WON;
    instructions = "Congratulations!\n" +
        "You finished all the available levels!\n\n" +
        "Press ENTER to play again,\n" +
        "press SHIFT to go to the main menu\n";
}

export class GameOver extends IntermediateScene
{
    title = "Game Over";
    titleColor = COLOR_GAME_OVER;
    instructions = "Press ENTER to play again, \npress SHIFT to go to the main menu";
}

export class LevelFinished extends IntermediateScene
{
    title = "Level Finished";
    titleColor = COLOR_GAME_WON;
    instructions = "Press ENTER to play the next level, \npress SHIFT to go to the main menu";
}
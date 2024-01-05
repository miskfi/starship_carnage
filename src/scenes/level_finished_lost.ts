import * as Colfio from 'colfio';
import {Messages} from "../constants/enums";
import {COLOR_GAME_OVER, COLOR_GAME_WON, CONTROLS_ENTER, CONTROLS_SHIFT} from "../constants/constants";
import {createText} from "../factory";

/**
 * Parent class for Game Over, Game Won and Level Finished scenes.
 */
abstract class IntermediateScene extends Colfio.Component
{
    private keyInput: Colfio.KeyInputComponent;
    private sceneContainer: Colfio.Container;

    protected readonly title: string;
    protected readonly instructions: string;
    protected readonly titleColor: number;

    onInit()
    {
        this.keyInput = this.scene.findGlobalComponentByName("KeyInputComponent");
        this.sceneContainer = new Colfio.Container();
        this.owner.addChild(this.sceneContainer);

        this.createScreen();
    }

    onDetach()
    {
        this.sceneContainer.destroy();
    }

    onUpdate(delta: number, absolute: number)
    {
        if (CONTROLS_ENTER.some(key => this.keyInput.isKeyPressed(key)))
        {
            CONTROLS_ENTER.forEach(key => this.keyInput.handleKey(key))
            this.sendMessage(Messages.LEVEL_START);
        }
        if (CONTROLS_SHIFT.some(key => this.keyInput.isKeyPressed(key)))
        {
            CONTROLS_SHIFT.forEach(key => this.keyInput.handleKey(key))
            this.sendMessage(Messages.MAIN_MENU);
        }
    }

    createScreen()
    {
        createText(this.scene, this.title, this.scene.width / 2, this.scene.height / 4, 50, this.titleColor, this.sceneContainer);
        let instructions = createText(
            this.scene, this.instructions, this.scene.width / 2, this.scene.height / 2, 20, 0xFFFFFF, this.sceneContainer
        );
        instructions.align = "center";
    }
}

export class GameWon extends IntermediateScene
{
    protected readonly title = "Game Won";
    protected readonly titleColor = COLOR_GAME_WON;
    protected readonly instructions =
        "Congratulations!\n" +
        "You finished all the available levels!\n\n" +
        "Press ENTER to play again,\n" +
        "press SHIFT to go to the main menu\n";
}

export class GameOver extends IntermediateScene
{
    protected readonly title = "Game Over";
    protected readonly titleColor = COLOR_GAME_OVER;
    protected readonly instructions = "Press ENTER to play again, \npress SHIFT to go to the main menu";
}

export class LevelFinished extends IntermediateScene
{
    protected readonly title = "Level Finished";
    protected readonly titleColor = COLOR_GAME_WON;
    protected readonly instructions = "Press ENTER to play the next level, \npress SHIFT to go to the main menu";
}
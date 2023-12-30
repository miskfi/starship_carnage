import * as Colfio from 'colfio';
import {GlobalAttributes, Messages, Tags} from "../constants/enums";
import {COLOR_GAME_OVER} from "../constants/constants";

export class GameOver extends Colfio.Component
{
    keyInput: Colfio.KeyInputComponent;
    sceneContainer: Colfio.Container;

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
            this.sendMessage(Messages.GAME_START, this.scene.getGlobalAttribute(GlobalAttributes.GAME_MODE));
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
        const projectiles = this.scene.findObjectsByTag(Tags.PLAYER_PROJECTILE) as Colfio.Graphics[];
        const enemies = this.scene.findObjectsByTag(Tags.ENEMY_CIRCLE) as Colfio.Graphics[];
        const background = this.scene.findObjectByTag(Tags.BACKGROUND) as Colfio.Container;

        const objects = [...projectiles, ...enemies, background];

        for (let obj of objects)
            obj.destroy();
    }

    createScreen()
    {
        let game_over = new Colfio.BitmapText(
            "Game Over",
            "Game Over",
            "Early GameBoy",
            50,
            COLOR_GAME_OVER
        );
        game_over.anchor.set(0.5);
        game_over.position.set(this.scene.width / 2, this.scene.height / 4);
        this.sceneContainer.addChild(game_over);

        let instructions = new Colfio.BitmapText(
            "Instructions",
            "Press ENTER to play again, \npress SHIFT to go to the main menu",
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
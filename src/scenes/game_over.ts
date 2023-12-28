import * as Colfio from 'colfio';
import {Attributes, Messages, Tags} from "../constants/enums";
import {COLOR_GAME_OVER} from "../constants/constants";

export class GameOver extends Colfio.Component
{
    keyInput: Colfio.KeyInputComponent;
    sceneContainer: Colfio.Container;

    onInit()
    {
        this.keyInput = this.scene.getGlobalAttribute(Attributes.KEY_INPUT);
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
            this.sendMessage(Messages.GAME_START);
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
        const player = this.scene.findObjectByTag(Tags.PLAYER) as Colfio.Graphics;
        const enemies = this.scene.findObjectsByTag(Tags.ENEMY_CIRCLE) as Colfio.Graphics[];

        for (let projectile of projectiles)
            projectile.destroy();
        for (let enemy of enemies)
            enemy.destroy();
        player.destroy();
    }

    createScreen()
    {
        let game_over = new Colfio.Text("Game Over", "Game Over");
        game_over.style = {fontFamily: "Arial", fontSize: 50, fill: COLOR_GAME_OVER, align: "center"};
        game_over.anchor.set(0.5);
        game_over.position.set(this.scene.width / 2, this.scene.height / 4);
        this.sceneContainer.addChild(game_over);

        let instructions = new Colfio.Text("Instructions", "Press ENTER to play again, \npress SHIFT to go to the main menu");
        instructions.style = {fontFamily: "Arial", fontSize: 20, fill: 0xFFFFFF, align: "center"};
        instructions.anchor.set(0.5);
        instructions.position.set(this.scene.width / 2, this.scene.height / 2);
        this.sceneContainer.addChild(instructions);
    }
}
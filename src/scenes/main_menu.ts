import * as Colfio from 'colfio';
import {Messages} from "../constants/enums";
import {COLOR_TEXT_ACTIVE, COLOR_TEXT_PASSIVE} from "../constants/constants";

export class MainMenu extends Colfio.Component
{
    keyInput: Colfio.KeyInputComponent;
    menuContainer: Colfio.Container;

    buttonSingleplayer: Colfio.BitmapText;
    buttonMultiplayer: Colfio.BitmapText;
    buttonHighlight: Colfio.BitmapText;

    onInit()
    {
        this.keyInput = this.scene.findGlobalComponentByName("KeyInputComponent");
        this.menuContainer = new Colfio.Container();
        this.owner.addChild(this.menuContainer);
        this.createMenu();
    }

    onUpdate(delta: number, absolute: number)
    {
        if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_ENTER))
        {
            this.keyInput.handleKey(Colfio.Keys.KEY_ENTER);

            if (this.buttonHighlight === this.buttonSingleplayer)
            {
                this.sendMessage(Messages.GAME_MODE_SELECTED, 1);
                this.sendMessage(Messages.LEVEL_START);
            }
            else if (this.buttonHighlight === this.buttonMultiplayer)
            {
                this.sendMessage(Messages.GAME_MODE_SELECTED, 2);
                this.sendMessage(Messages.LEVEL_START);
            }


            this.menuContainer.destroy();
        }
        else if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_DOWN))
        {
            if (this.buttonHighlight === this.buttonSingleplayer)
            {
                this.buttonSingleplayer.tint = COLOR_TEXT_PASSIVE;
                this.buttonMultiplayer.tint = COLOR_TEXT_ACTIVE;
                this.buttonHighlight = this.buttonMultiplayer;
                this.sendMessage(Messages.BUTTON_CHANGE);
            }
        }
        else if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_UP))
        {
            if (this.buttonHighlight === this.buttonMultiplayer)
            {
                this.buttonSingleplayer.tint = COLOR_TEXT_ACTIVE;
                this.buttonMultiplayer.tint = COLOR_TEXT_PASSIVE;
                this.buttonHighlight = this.buttonSingleplayer;
                this.sendMessage(Messages.BUTTON_CHANGE);
            }
        }
    }

    createMenu()
    {
        let sceneWidth = this.scene.width;
        let sceneHeight = this.scene.height;

        let graphics = new Colfio.Graphics();
        graphics.beginFill(0x000000);
        graphics.drawRect(0, 0, sceneWidth, sceneHeight);
        this.menuContainer.addChild(graphics);

        this.createText("Starship Carnage", this.scene.width / 2, this.scene.height / 4, 60, 0xFFFFFF);
        this.buttonSingleplayer = this.createText("1 player", this.scene.width / 2, this.scene.height / 2, 30, COLOR_TEXT_PASSIVE);
        this.buttonMultiplayer = this.createText("2 players", this.scene.width / 2, this.scene.height / 2 + 50, 30, COLOR_TEXT_PASSIVE);
        this.createText("Press ENTER to select", this.scene.width / 2, this.scene.height - 50, 15, 0xFFFFFF);

        this.buttonSingleplayer.tint = COLOR_TEXT_ACTIVE;
        this.buttonHighlight = this.buttonSingleplayer;
    }

    createText(text: string, x, y, fontSize, fontColor)
    {
        const textObj = new Colfio.BitmapText(text, text, "Early GameBoy", fontSize, fontColor);
        textObj.anchor.set(0.5);
        textObj.position.set(x, y);
        this.menuContainer.addChild(textObj);
        return textObj;
    }
}
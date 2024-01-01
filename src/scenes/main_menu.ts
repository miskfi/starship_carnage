import * as Colfio from 'colfio';
import {Messages} from "../constants/enums";
import {COLOR_TEXT_ACTIVE, COLOR_TEXT_PASSIVE} from "../constants/constants";
import {createText} from "../factory";

export class MainMenu extends Colfio.Component
{
    private keyInput: Colfio.KeyInputComponent;
    private menuContainer: Colfio.Container;

    private buttonSingleplayer: Colfio.BitmapText;
    private buttonMultiplayer: Colfio.BitmapText;
    private highlightedButton: Colfio.BitmapText;

    onInit()
    {
        this.keyInput = this.scene.findGlobalComponentByName("KeyInputComponent");
        this.menuContainer = new Colfio.Container();
        this.owner.addChild(this.menuContainer);
        this.createMenu();
    }

    onDetach()
    {
        this.menuContainer.destroy();
    }

    onUpdate(delta: number, absolute: number)
    {
        if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_ENTER))
        {
            this.keyInput.handleKey(Colfio.Keys.KEY_ENTER);

            if (this.highlightedButton === this.buttonSingleplayer)
            {
                this.sendMessage(Messages.GAME_MODE_SELECTED, 1);
                this.sendMessage(Messages.LEVEL_START);
            }
            else if (this.highlightedButton === this.buttonMultiplayer)
            {
                this.sendMessage(Messages.GAME_MODE_SELECTED, 2);
                this.sendMessage(Messages.LEVEL_START);
            }
        }
        else if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_DOWN))
        {
            if (this.highlightedButton === this.buttonSingleplayer)
            {
                this.buttonSingleplayer.tint = COLOR_TEXT_PASSIVE;
                this.buttonMultiplayer.tint = COLOR_TEXT_ACTIVE;
                this.highlightedButton = this.buttonMultiplayer;
                this.sendMessage(Messages.BUTTON_CHANGE);
            }
        }
        else if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_UP))
        {
            if (this.highlightedButton === this.buttonMultiplayer)
            {
                this.buttonSingleplayer.tint = COLOR_TEXT_ACTIVE;
                this.buttonMultiplayer.tint = COLOR_TEXT_PASSIVE;
                this.highlightedButton = this.buttonSingleplayer;
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

        createText(this.scene, "Starship Carnage", this.scene.width / 2, this.scene.height / 4, 60, 0xFFFFFF, this.menuContainer);
        this.buttonSingleplayer = createText(this.scene, "1 player", this.scene.width / 2, this.scene.height / 2, 30, COLOR_TEXT_ACTIVE, this.menuContainer);
        this.buttonMultiplayer = createText(this.scene, "2 players", this.scene.width / 2, this.scene.height / 2 + 50, 30, COLOR_TEXT_PASSIVE, this.menuContainer);
        createText(this.scene, "Press ENTER to select", this.scene.width / 2, this.scene.height - 50, 15, 0xFFFFFF, this.menuContainer);

        this.highlightedButton = this.buttonSingleplayer;
    }
}
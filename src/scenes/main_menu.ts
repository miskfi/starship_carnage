import * as Colfio from 'colfio';
import {Attributes, Messages} from "../constants";

export class MainMenu extends Colfio.Component
{
    keyInput: Colfio.KeyInputComponent;
    menuContainer: Colfio.Container;

    buttonSingleplayer: Colfio.Text;
    buttonMultiplayer: Colfio.Text;
    buttonHighlight: Colfio.Text;

    colorButtonActive: number = 0x5225e6;
    colorButtonPassive: number = 0x6b6261;

    onInit()
    {
        this.keyInput = this.scene.getGlobalAttribute(Attributes.KEY_INPUT);
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
                this.sendMessage(Messages.GAME_START);
                this.menuContainer.destroy();
            }
        }
        if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_DOWN))
        {
            if (this.buttonHighlight === this.buttonSingleplayer)
            {
                this.buttonSingleplayer.style["fill"] = this.colorButtonPassive;
                this.buttonMultiplayer.style["fill"] = this.colorButtonActive;
                this.buttonHighlight = this.buttonMultiplayer;
            }
        }
        if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_UP))
        {
            if (this.buttonHighlight === this.buttonMultiplayer)
            {
                this.buttonSingleplayer.style["fill"] = this.colorButtonActive;
                this.buttonMultiplayer.style["fill"] = this.colorButtonPassive;
                this.buttonHighlight = this.buttonSingleplayer;
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

        this.createTitle("Space Destructor");
        this.buttonSingleplayer = this.createButton("Singleplayer", sceneWidth / 2, sceneHeight / 2);
        this.buttonMultiplayer = this.createButton("Multiplayer", sceneWidth / 2, sceneHeight / 2 + 50);

        this.buttonSingleplayer.style["fill"] = this.colorButtonActive;
        this.buttonHighlight = this.buttonSingleplayer;
    }

    createTitle(name: string)
    {
        let title = new Colfio.Text(name, name);
        title.style = {fontFamily: "Arial", fontSize: 40, fill: 0xff1010, align: "center"};
        title.anchor.set(0.5);
        title.position.set(this.scene.width / 2, this.scene.height / 4);
        this.menuContainer.addChild(title);
    }

    createButton(text: string, x, y)
    {
        let button = new Colfio.Text(text, text);
        button.style = {fontFamily: "Arial", fontSize: 30, fill: this.colorButtonPassive, align: "center"};
        button.anchor.set(0.5);
        button.position.set(x, y);

        this.menuContainer.addChild(button);
        return button;
    }
}
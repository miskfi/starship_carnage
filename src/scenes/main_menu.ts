import * as Colfio from 'colfio';
import {GlobalAttributes, Messages} from "../constants/enums";
import {COLOR_TEXT_ACTIVE, COLOR_TEXT_PASSIVE} from "../constants/constants";
import {Assets} from "pixi.js";

export class MainMenu extends Colfio.Component
{
    keyInput: Colfio.KeyInputComponent;
    menuContainer: Colfio.Container;

    buttonSingleplayer: Colfio.Text;
    buttonMultiplayer: Colfio.Text;
    buttonHighlight: Colfio.Text;

    onInit()
    {
        this.keyInput = this.scene.getGlobalAttribute(GlobalAttributes.KEY_INPUT);
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
                this.sendMessage(Messages.GAME_START, 1);
            else if (this.buttonHighlight === this.buttonMultiplayer)
                this.sendMessage(Messages.GAME_START, 2)

            this.menuContainer.destroy();
        }
        if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_DOWN))
        {
            if (this.buttonHighlight === this.buttonSingleplayer)
            {
                this.buttonSingleplayer.style["fill"] = COLOR_TEXT_PASSIVE;
                this.buttonMultiplayer.style["fill"] = COLOR_TEXT_ACTIVE;
                this.buttonHighlight = this.buttonMultiplayer;
            }
        }
        if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_UP))
        {
            if (this.buttonHighlight === this.buttonMultiplayer)
            {
                this.buttonSingleplayer.style["fill"] = COLOR_TEXT_ACTIVE;
                this.buttonMultiplayer.style["fill"] = COLOR_TEXT_PASSIVE;
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
        this.buttonSingleplayer = this.createButton("1 player", sceneWidth / 2, sceneHeight / 2);
        this.buttonMultiplayer = this.createButton("2 players", sceneWidth / 2, sceneHeight / 2 + 50);

        this.buttonSingleplayer.style["fill"] = COLOR_TEXT_ACTIVE;
        this.buttonHighlight = this.buttonSingleplayer;
    }

    createTitle(name: string)
    {
        Assets.load({name: "font", src: "font.fnt"}).then(() =>
        {
            let title = new Colfio.BitmapText(name, name, "Early GameBoy", 60, 0xFFFFFF);
            title.anchor.set(0.5);
            title.position.set(this.scene.width / 2, this.scene.height / 4);
            this.menuContainer.addChild(title);
        });
    }

    createButton(text: string, x, y)
    {
        let button = new Colfio.Text(text, text);
        button.style = {fontFamily: "Arial", fontSize: 30, fill: COLOR_TEXT_PASSIVE, align: "center"};
        button.anchor.set(0.5);
        button.position.set(x, y);

        this.menuContainer.addChild(button);
        return button;
    }
}
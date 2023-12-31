import * as Colfio from "colfio";
import {Attributes, GameAssets, Messages} from "../constants/enums";
import * as PIXI from "pixi.js";
import {GAME_HEIGHT, GAME_WIDTH, PLAYER_LIVES, STATUS_BAR_HEIGHT, TEXTURE_SCALE} from "../constants/constants";

export class HealthBarController extends Colfio.Component
{
    playerNumber: number;
    hearts: Colfio.Sprite[];

    direction: number;
    initialPosition: number;

    constructor(playerNumber: number)
    {
        super();
        this.playerNumber = playerNumber;
        this.hearts = [];

        if (playerNumber === 1)
        {
            this.direction = 1;
            this.initialPosition = 50;
        }
        else
        {
            this.direction = -1;
            this.initialPosition = GAME_WIDTH - 50;
        }
    }

    onInit()
    {
        this.subscribe(Messages.PLAYER_HIT);
        for (let i = 0; i < PLAYER_LIVES; i++)
            this.createHeart();
    }

    onMessage(msg: Colfio.Message): any
    {
        if (msg.action === Messages.PLAYER_HIT)
        {
            const player = msg.data as Colfio.Graphics;
            const playerHitNumber = player.getAttribute(Attributes.PLAYER_NUMBER);
            if (playerHitNumber === this.playerNumber)
                this.removeHeart();
        }
    }

    createHeart()
    {
        let texture = PIXI.Texture.from(GameAssets.HEART).clone();
        texture.frame = new PIXI.Rectangle(0, 0, 13, 11);

        let heart = new Colfio.Sprite("Heart", texture);
        heart.scale.set(TEXTURE_SCALE);
        heart.anchor.set(0.5);
        heart.position.set(this.initialPosition + this.hearts.length * 30 * this.direction, GAME_HEIGHT - STATUS_BAR_HEIGHT / 2);

        this.owner.addChild(heart);
        this.hearts.push(heart);
    }

    removeHeart()
    {
        let heart = this.hearts.pop();
        heart.destroy();
    }
}
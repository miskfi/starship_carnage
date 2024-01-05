import * as Colfio from "colfio";
import {Attributes, Messages} from "../constants/enums";
import {GAME_HEIGHT, GAME_WIDTH, PLAYER_LIVES, STATUS_BAR_HEIGHT} from "../constants/constants";
import {createHeart} from "../factory";

export class HealthBarController extends Colfio.Component
{
    private readonly playerNumber: number;
    private readonly direction: number;
    private readonly initialPosition: number;

    private hearts: Colfio.Sprite[];

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

    private createHeart()
    {
        const heart = createHeart(
            this.scene,
            this.initialPosition + this.hearts.length * 30 * this.direction,
            GAME_HEIGHT - STATUS_BAR_HEIGHT / 2
        );
        this.owner.addChild(heart);
        this.hearts.push(heart);
    }

    private removeHeart()
    {
        const heart = this.hearts.pop();
        heart.destroy();
    }
}
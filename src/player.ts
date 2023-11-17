import * as Colfio from 'colfio';
import {projectileEmitter} from "./factory";

export class PlayerController extends Colfio.Component
{
    keyInput: Colfio.KeyInputComponent;
    playerID: number;

    constructor(playerID) {
        super();
        this.playerID = playerID;
    }

    onInit()
    {
        this.keyInput = this.scene.getGlobalAttribute("key_input");
    }

    onUpdate(delta: number, absolute: number)
    {
        const pos = this.owner.position;
        const screenWidth = this.scene.app.screen.width;
        const screenHeight = this.scene.app.screen.height;
        const boundRect = this.owner.getBounds();
        const movementDiff = delta * 0.15;

        if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_LEFT) || this.keyInput.isKeyPressed(Colfio.Keys.KEY_A))
        {
            if (boundRect.left > 0)
                pos.x -= movementDiff;
        }
        else if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_RIGHT) || this.keyInput.isKeyPressed(Colfio.Keys.KEY_D))
        {
            if (boundRect.right < screenWidth)
                pos.x += movementDiff;
        }
        else if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_DOWN) || this.keyInput.isKeyPressed(Colfio.Keys.KEY_S))
        {
            if (boundRect.bottom < screenHeight)
                pos.y += movementDiff;
        }
        else if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_UP) || this.keyInput.isKeyPressed(Colfio.Keys.KEY_W))
        {
            if (boundRect.top > 0)
                pos.y -= movementDiff;
        }

        if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_SPACE))
        {
            this.keyInput.handleKey(Colfio.Keys.KEY_SPACE);

            const newProjectile = projectileEmitter(this.scene, this.playerID);
            this.scene.stage.addChild(newProjectile);
        }
    }
}
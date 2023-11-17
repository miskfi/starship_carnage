import * as Colfio from 'colfio';

export class PlayerController extends Colfio.Component
{
    keyInput: Colfio.KeyInputComponent;

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
    }
}
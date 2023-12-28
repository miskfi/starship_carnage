import * as Colfio from 'colfio';
import {createProjectile} from "../factory";
import {GlobalAttributes, Messages} from "../constants/enums";
import {GameState} from "../game";
import {PLAYER_SPEED} from "../constants/constants";

export class PlayerController extends Colfio.Component
{
    keyInput: Colfio.KeyInputComponent;

    onInit()
    {
        this.keyInput = this.scene.getGlobalAttribute(GlobalAttributes.KEY_INPUT);
    }

    onUpdate(delta: number, absolute: number)
    {
        if (! this.scene.getGlobalAttribute<GameState>(GlobalAttributes.GAME_STATE).isRunning)
            return;

        const pos = this.owner.position;
        const screenWidth = this.scene.app.screen.width;
        const screenHeight = this.scene.app.screen.height;
        const boundRect = this.owner.getBounds();
        const movementDiff = delta * PLAYER_SPEED;

        if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_LEFT) || this.keyInput.isKeyPressed(Colfio.Keys.KEY_A))
        {
            if (boundRect.left > 0)
                pos.x -= Math.min(movementDiff, boundRect.left);
        }
        else if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_RIGHT) || this.keyInput.isKeyPressed(Colfio.Keys.KEY_D))
        {
            if (boundRect.right < screenWidth)
                pos.x += Math.min(movementDiff, screenWidth - boundRect.right);
        }
        else if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_DOWN) || this.keyInput.isKeyPressed(Colfio.Keys.KEY_S))
        {
            if (boundRect.bottom < screenHeight)
                pos.y += Math.min(movementDiff, screenHeight - boundRect.bottom);
        }
        else if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_UP) || this.keyInput.isKeyPressed(Colfio.Keys.KEY_W))
        {
            if (boundRect.top > 0)
                pos.y -= Math.min(movementDiff, boundRect.top);
        }

        if (this.keyInput.isKeyPressed(Colfio.Keys.KEY_SPACE))
        {
            this.keyInput.handleKey(Colfio.Keys.KEY_SPACE);
            this.shootProjectile();
        }
    }

    shootProjectile()
    {
        if (this.scene.getGlobalAttribute(GlobalAttributes.PROJECTILES_AVAILABLE) > 0)
        {
            const newProjectile = createProjectile(this.scene);
            this.scene.stage.addChild(newProjectile);
            this.sendMessage(Messages.PROJECTILE_SHOT);
        }
    }
}
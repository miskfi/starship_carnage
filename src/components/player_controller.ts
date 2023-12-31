import * as Colfio from 'colfio';
import {createProjectile} from "../factory";
import {Attributes, GlobalAttributes, Messages} from "../constants/enums";
import {GameState} from "../game";
import {GAME_HEIGHT, PLAYER_SPEED, STATUS_BAR_HEIGHT} from "../constants/constants";

export class PlayerController extends Colfio.Component
{
    keyInput: Colfio.KeyInputComponent;
    controls: Record<any, any>;

    onInit()
    {
        this.keyInput = this.scene.getGlobalAttribute(GlobalAttributes.KEY_INPUT);
        this.controls = this.owner.getAttribute(Attributes.CONTROLS);
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

        if (this.controls["left"].some(key => this.keyInput.isKeyPressed(key)))
        {
            if (boundRect.left > 0)
                pos.x -= Math.min(movementDiff, boundRect.left);
        }
        else if (this.controls["right"].some(key => this.keyInput.isKeyPressed(key)))
        {
            if (boundRect.right < screenWidth)
                pos.x += Math.min(movementDiff, screenWidth - boundRect.right);
        }
        else if (this.controls["down"].some(key => this.keyInput.isKeyPressed(key)))
        {
            if (boundRect.bottom < GAME_HEIGHT - STATUS_BAR_HEIGHT)
                pos.y += Math.min(movementDiff, screenHeight - boundRect.bottom);
        }
        else if (this.controls["up"].some(key => this.keyInput.isKeyPressed(key)))
        {
            if (boundRect.top > 0)
                pos.y -= Math.min(movementDiff, boundRect.top);
        }

        if (this.controls["shoot"].some(key => this.keyInput.isKeyPressed(key)))
        {
            this.controls["shoot"].forEach(key => this.keyInput.handleKey(key));
            this.shootProjectile();
        }
    }

    shootProjectile()
    {
        if (this.owner.getAttribute<number>(Attributes.PROJECTILES_AVAILABLE) > 0)
        {
            const newProjectile = createProjectile(this.scene, this.owner);
            this.scene.stage.addChild(newProjectile);
            this.sendMessage(Messages.PROJECTILE_SHOT, this.owner);
        }
    }
}
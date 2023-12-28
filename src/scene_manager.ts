import * as Colfio from 'colfio';
import {Messages, EnemyType, Attributes} from "./constants";
import {MainMenu} from "./scenes/main_menu";
import {GameOver} from "./scenes/game_over";
import {GameWon} from "./scenes/game_won";
import {createEnemyCircle, createPlayer} from "./factory";
import {GameState} from "./game";

export class SceneManager extends Colfio.Component
{
    currentSceneComponent?: Colfio.Component;

    onInit()
    {
        this.subscribe(Messages.GAME_START, Messages.GAME_OVER, Messages.GAME_WON, Messages.MAIN_MENU);
        this.currentSceneComponent = null;

        this.loadSceneComponent(MainMenu);
    }

    onMessage(msg: Colfio.Message): any
    {
        if (msg.action === Messages.GAME_START)
            this.loadGame();
        else if (msg.action === Messages.MAIN_MENU)
            this.loadSceneComponent(MainMenu);
        else if (msg.action === Messages.GAME_OVER)
            this.loadSceneComponent(GameOver);
        else if (msg.action === Messages.GAME_WON)
            this.loadSceneComponent(GameWon);
    }

    loadGame()
    {
        this.removePreviousComponent();

        // create the player square
        const player = createPlayer(this.scene);
        this.owner.scene.stage.addChild(player);

        // create enemy circle
        const enemy = createEnemyCircle(this.scene, EnemyType.MEDIUM);
        this.owner.scene.stage.addChild(enemy);

        this.scene.assignGlobalAttribute(Attributes.GAME_STATE, {isRunning: true} as GameState);
        this.scene.assignGlobalAttribute(Attributes.ENEMIES_COUNT, 0);
        this.scene.assignGlobalAttribute(Attributes.PROJECTILES_MAX, 3);
        this.scene.assignGlobalAttribute(Attributes.PROJECTILES_AVAILABLE, 3);
    }

    loadSceneComponent(componentType)
    {
        this.removePreviousComponent();
        const component = new componentType();
        this.scene.addGlobalComponent(component);
        this.currentSceneComponent = component;
    }

    removePreviousComponent()
    {
        if (this.currentSceneComponent !== null)
            this.scene.removeGlobalComponent(this.scene.findGlobalComponentByName(this.currentSceneComponent.name));
        this.currentSceneComponent = null;
    }
}
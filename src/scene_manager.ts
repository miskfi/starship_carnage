import * as Colfio from 'colfio';
import {Messages, EnemyType} from "./constants";
import {MainMenu} from "./scenes/main_menu";
import {createEnemyCircle, createPlayer} from "./factory";

export class SceneManager extends Colfio.Component
{
    onInit()
    {
        this.subscribe(Messages.GAME_START);

        this.loadMainMenu();
    }

    onMessage(msg: Colfio.Message): any
    {
        if (msg.action === Messages.GAME_START)
        {
            this.loadGame();
        }
    }

    loadMainMenu()
    {
        this.scene.addGlobalComponent(new MainMenu());
    }

    loadGame()
    {
        this.scene.removeGlobalComponent(this.scene.findGlobalComponentByName("MainMenu"));

        // create the player square
        const player = createPlayer(this.scene);
        this.owner.scene.stage.addChild(player);

        // create enemy circle
        const enemy = createEnemyCircle(this.scene, EnemyType.MEDIUM);
        this.owner.scene.stage.addChild(enemy);
    }
}
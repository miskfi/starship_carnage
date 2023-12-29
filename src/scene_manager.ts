import * as Colfio from 'colfio';
import {Attributes, GlobalAttributes, Messages} from "./constants/enums";
import {EnemyType} from "./constants/enemy_attributes";
import {MainMenu} from "./scenes/main_menu";
import {GameOver} from "./scenes/game_over";
import {GameWon} from "./scenes/game_won";
import {createEnemyCircle, createPlayer} from "./factory";
import {GameState} from "./game";
import {P1_CONTROLS, P2_CONTROLS, PROJECTILES_MAX, SINGLEPLAYER_CONTROLS} from "./constants/constants"

export class SceneManager extends Colfio.Component
{
    currentSceneComponent?: Colfio.Component;

    onInit()
    {
        this.subscribe(Messages.GAME_START, Messages.GAME_OVER, Messages.GAME_WON, Messages.MAIN_MENU);
        this.currentSceneComponent = null;

        this.sendMessage(Messages.MAIN_MENU);
        this.loadSceneComponent(MainMenu);
    }

    onMessage(msg: Colfio.Message): any
    {
        if (msg.action === Messages.GAME_START)
        {
            const players = msg.data as number;
            this.scene.assignGlobalAttribute(GlobalAttributes.PLAYERS_COUNT, players);
            this.scene.assignGlobalAttribute(GlobalAttributes.GAME_MODE, players);
            this.loadGame(players);
        }
        else if (msg.action === Messages.MAIN_MENU)
            this.loadSceneComponent(MainMenu);
        else if (msg.action === Messages.GAME_OVER)
            this.loadSceneComponent(GameOver);
        else if (msg.action === Messages.GAME_WON)
            this.loadSceneComponent(GameWon);
    }

    loadGame(players: number)
    {
        this.removePreviousComponent();

        this.scene.assignGlobalAttribute(GlobalAttributes.ENEMIES_COUNT, 0);
        this.scene.assignGlobalAttribute(GlobalAttributes.PROJECTILES_MAX, PROJECTILES_MAX);

        if (players === 1)
        {
            const player = createPlayer(this.scene, this.scene.width / 2);
            player.assignAttribute(Attributes.CONTROLS, SINGLEPLAYER_CONTROLS);
            this.owner.scene.stage.addChild(player);
        }
        if (players === 2)
        {
            const player1 = createPlayer(this.scene, this.scene.width / 4);
            player1.assignAttribute(Attributes.CONTROLS, P1_CONTROLS);
            this.owner.scene.stage.addChild(player1);

            const player2 = createPlayer(this.scene, this.scene.width / 4 * 3);
            player2.assignAttribute(Attributes.CONTROLS, P2_CONTROLS);
            this.owner.scene.stage.addChild(player2);
        }

        // create enemy circle
        const enemy = createEnemyCircle(this.scene, EnemyType.MEDIUM);
        this.owner.scene.stage.addChild(enemy);

        this.scene.assignGlobalAttribute(GlobalAttributes.GAME_STATE, {isRunning: true} as GameState);
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
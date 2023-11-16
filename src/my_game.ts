import * as Colfio from 'colfio';
import * as PIXI from 'pixi.js';

class MyGame {
    engine: Colfio.Engine;

    constructor() {
        this.engine = new Colfio.Engine();
        let canvas = (document.getElementById('gameCanvas') as HTMLCanvasElement);

        // init the game loop
        this.engine.init(canvas, {
            resizeToScreen: true,
            width: 800,
            height: 600,
            resolution: 1,
        });

        this.load();
    }

    text: PIXI.Text;

    load() {
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fill: ['#ffffff', '#00ff99'],
            stroke: '#4a1850',
            strokeThickness: 5
        });

        this.text = new PIXI.Text('Hello World', style);
        this.text.position.set(this.engine.config.width / 2, this.engine.config.width / 2);
        this.text.anchor.set(0.5);
        this.engine.scene.stage.addChild(this.text);
    }

}

// this will create a new instance as soon as this file is loaded
export default new MyGame();
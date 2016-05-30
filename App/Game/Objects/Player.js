import GameObject from '../Core/GameObject';
import Tron from '../Objects/Tron';

class Player {
    toString() {
        return `[Player x=${this.position.x} y=${this.position.y}]`;
    }

    init(params) {
        this.character = new Tron(params);
        this.character.init(params);

        this.id = params.id;
        this.game = params.game;
        this.name = params.name;
        this.keys = params.keys;
        this.points = params.points || 0;

        this.setupKeys();
    }

    // Method for registering hardware keys to a given sprite
    setupKeys() {
        if (!this.keys) { return; }

        if (this.keys.up) { this.character.sprite.upKey = this.game.input.keyboard.addKey(this.keys.up); }
        if (this.keys.down) { this.character.sprite.downKey = this.game.input.keyboard.addKey(this.keys.down); }
        if (this.keys.left) { this.character.sprite.leftKey = this.game.input.keyboard.addKey(this.keys.left); }
        if (this.keys.right) { this.character.sprite.rightKey = this.game.input.keyboard.addKey(this.keys.right); }

        if (this.keys.up) { this.character.sprite.wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W); }
        if (this.keys.down) { this.character.sprite.sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S); }
        if (this.keys.left) { this.character.sprite.aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A); }
        if (this.keys.right) { this.character.sprite.dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D); }

        // register attack key if it exists
        if (this.keys.att) {
            this.character.sprite.attKey = this.game.input.keyboard.addKey(this.keys.att);
            this.character.sprite.attKey.onDown.add(this.character.triggerAttack, this.character);
        }
    }

    removePoints(points) {
        this.points -= points;

        if (this.points < 0) {
            this.points = 0;
        }
    }

    addPoints(points) {
        this.points += points;
    }

    hide() {
        this.character.sprite.alpha = 0;
    }

    show() {
        this.character.sprite.alpha = 1;
    }

    kill() {
        this.character.kill();
    }

    destroy() {
        this.nameText.destroy();

        if (this.keys) {
            this.keys.up && this.game.input.keyboard.removeKey(this.keys.up);
            this.keys.down && this.game.input.keyboard.removeKey(this.keys.down);
            this.keys.left && this.game.input.keyboard.removeKey(this.keys.left);
            this.keys.right && this.game.input.keyboard.removeKey(this.keys.right);

            this.keys.att && this.game.input.keyboard.removeKey(this.keys.att);
        }
    }

    get name() {
        return this._name;
    }

    set name(name) {
        if (!name) {
            name = this.id.substring(0, 2);
        }

        var style = {
            font: '15px Arial',
            fill: '#ffffff',
            align: 'center'
        };

        this._name = name;

        this.nameText = this.game.add.text(0, 0, name, style);
        this.nameText.anchor.set(0.5, -1);

        this.character.sprite.addChild(this.nameText);
    }
}

// Wow, we may want this for "logic scripts"
//
// function createInterface(name) {
//   return class {
//     ['findBy' + name]() {
//       return 'Found by ' + name;
//     }
//   }
// }

// const Interface = createInterface('Email');
// const instance = new Interface();

// console.log(instance.findByEmail());

export default Player;

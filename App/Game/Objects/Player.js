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
        this.points = params.points || 0;
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

import Character from './Character';

class Ghost extends Character {
    toString() { '[Ghost]' };

    init(params) {
        super.init(params);

        var offset = 0.3;
        this.sprite.body.setSize(this.dimensions.width * offset, this.dimensions.height * offset, 0, 0);
    }
}

export default Ghost;

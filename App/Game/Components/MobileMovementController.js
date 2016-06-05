class Component {
    constructor(game) {
        this.game = game;
    }

    run(event) {
    }

    init() {
        // variables used to detect and manage swipes
        var startX;
        var startY;
        var endX;
        var endY;

        // when the player begins to swipe we only save mouse/finger coordinates, remove the touch/click
        // input listener and add a new listener to be fired when the mouse/finger has been released,
        // then we call endSwipe function
        var beginSwipe = function() {
            startX = this.game.engine.input.worldX;
            startY = this.game.engine.input.worldY;
            this.game.engine.input.onDown.remove(beginSwipe, this);
            this.game.engine.input.onUp.add(endSwipe, this);
        };

        // function to be called when the player releases the mouse/finger
        var endSwipe = function() {
            // saving mouse/finger coordinates
            endX = this.game.engine.input.worldX;
            endY = this.game.engine.input.worldY;
            // determining x and y distance travelled by mouse/finger from the start
            // of the swipe until the end
            var distX = startX-endX;
            var distY = startY-endY;
            // in order to have an horizontal swipe, we need that x distance is at least twice the y distance
            // and the amount of horizontal distance is at least 10 pixels
            if (Math.abs(distX)>Math.abs(distY)*2 && Math.abs(distX)>30){
                // moving left, calling move function with horizontal and vertical tiles to move as arguments
                if (distX > 0) {
                    this.game.onAction('swipeLeft');
                }
                // moving right, calling move function with horizontal and vertical tiles to move as arguments
                else {
                    this.game.onAction('swipeRight');
                }
            }
            // in order to have a vertical swipe, we need that y distance is at least twice the x distance
            // and the amount of vertical distance is at least 10 pixels
            else if (Math.abs(distY)>Math.abs(distX)*2 && Math.abs(distY)>30){
                // moving up, calling move function with horizontal and vertical tiles to move as arguments
                if (distY > 0) {
                    this.game.onAction('swipeUp');
                }
                // moving down, calling move function with horizontal and vertical tiles to move as arguments
                else {
                    this.game.onAction('swipeDown');
                }
            }
            else {
                this.game.onAction('tap');
            }

            // stop listening for the player to release finger/mouse, let's start listening for the player to click/touch
            this.game.engine.input.onDown.add(beginSwipe, this);
            this.game.engine.input.onUp.remove(endSwipe, this);
        };

        // Wait for the player to touch or click
        this.game.engine.input.onDown.add(beginSwipe, this);
    }
}

export default Component;

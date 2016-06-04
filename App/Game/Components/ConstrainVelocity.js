class Component {
    constructor(game) {
        this.game = game;
    }

    run(event) {
        if (!event.sprite || !event.sprite.body) { return; }

        var body = event.sprite.body;
        var vx = body.velocity.x;
        var vy = body.velocity.y;
        var currVelocitySqr = vx * vx + vy * vy;

        if (currVelocitySqr > event.maxVelocity * event.maxVelocity) {
            var angle = Math.atan2(vy, vx);
            vx = Math.cos(angle) * event.maxVelocity;
            vy = Math.sin(angle) * event.maxVelocity;
            body.velocity.x = vx;
            body.velocity.y = vy;
        }
    }
}

exports default Component;

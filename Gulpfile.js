var gulp = require('gulp'),
    tiledmapPack = require('gulp-phaser-tiled-pack');

/*****
 * Assets Phaser packs task, creates phaser asset loader packs for tilemaps
 *****/
gulp.task('pack', function () {
    return gulp.src('./App/Assets/GFX/maps/tron/map.tmx')
        .pipe(tiledmapPack({ baseUrl: 'App/Assets/GFX/maps/tron' }))
        .pipe(gulp.dest('./App/Assets/GFX/maps/tron2'));
});
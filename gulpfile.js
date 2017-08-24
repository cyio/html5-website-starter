(function(){
  'use strict';    
  var gulp = require('gulp'),
    pug = require('gulp-pug'),
    uglify = require('gulp-uglify'),
    browsersync = require('browser-sync'),
    reload = browsersync.reload,
    dest = require('gulp-dest'),
    autoprefixer = require('gulp-autoprefixer'),
    cdnizer = require('gulp-cdnizer'),
		series = require('stream-series'),
		inject = require('gulp-inject'),
		babel = require('gulp-babel'),
    cdnBase = '//taiquandao2.hanshikeji.com',
		util = require('gulp-util'),
		stylus = require('gulp-stylus'),
		del = require('del'),
    config = {
			 production: !!util.env.production
    },
    paths = {
      root: './build',
      build: {
        root: './build',
        images: './build/img',
        styles: './build/css',
        scripts: './build/js',
      },
      source: {
        root: './src/',
        styles: './src/css/',
        scripts: './src/js/*.js',
        templates: ['./src/*.pug', './src/**/*.pug'],
        images: './src/img/*'
      }
    };

  gulp.task('browsersync', function() {
    browsersync({
      files: [paths.build.root],
      server: {
        baseDir: "./build"
      },
      open: true,
      host: "127.0.0.1"
    });
  });

  gulp.task('templates', function() {
    gulp.src(paths.source.templates)
      .pipe(pug({
        pretty: true
      }))
      .pipe(gulp.dest(paths.build.root))
      .pipe(reload({stream:true}));
  });

  gulp.task('images', function () {
    gulp.src(paths.source.images)
      .pipe(gulp.dest(paths.build.images));
  });

  gulp.task('css', function () {
    gulp.src('./src/css/*.*')
      .pipe(stylus({
        compress: config.production
      }))
      .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
      }))
      .pipe(gulp.dest(paths.build.styles))
      .pipe(reload({stream:true}));
  });

  gulp.task('scripts', function () {
    return gulp.src(paths.source.scripts)
      .pipe(babel({ presets: ['env']}))
			.pipe(config.production ? uglify() : util.noop())
      .pipe(gulp.dest(paths.build.scripts))
      .pipe(reload({stream:true}));
  });

  gulp.task('copy', function () {
    return gulp.src(['./src/data/*.*', './src/libs/*.*'], {base: './src/'})
      .pipe(gulp.dest(paths.build.root))
      .pipe(reload({stream:true}));
  });

  gulp.task('clean', function () {
    del([paths.build.root]);
  });

  gulp.task('cdn', ['build'], function () {
    gulp.src([paths.build.root + '/*.html'])
      .pipe(cdnizer({
        defaultCDNBase: cdnBase,
        relativeRoot: 'img',
        files: ['**/*.{gif,png,jpg,jpeg}']
      }))
      .pipe(gulp.dest(paths.build.root))

    gulp.src([paths.build.styles + '/*.css'])
      .pipe(cdnizer({
        defaultCDNBase: cdnBase,
        relativeRoot: 'img',
        files: ['**/*.{gif,png,jpg,jpeg}']
      }))
      .pipe(gulp.dest(paths.build.styles))
  });

  // not in use
  gulp.task('inject-index', function () {
    var target = gulp.src('./src/index.pug');
    // 如果有依赖顺序，series，处理起来就麻烦了，需要指定文件名，还不如手动
    var sources = gulp.src(['./src/**/*.js', './src/**/index.css'], {read: false});

    return target.pipe(inject(sources, {relative: true}))
      .pipe(gulp.dest('./src'));
  });

  gulp.task('build', ['scripts', 'css', 'templates', 'copy', 'images']);

  gulp.task('server', [ 'browsersync', 'build', 'watch']);

  gulp.task('prod-test', [ 'browsersync', 'build', 'cdn']);

  gulp.task('prod', [ 'build', 'cdn']);

  gulp.task('default', [ 'server' ]);

  gulp.task('watch', function () {
    gulp.watch(paths.source.scripts, [ 'scripts' ]);
    gulp.watch(paths.source.styles + '*.*', [ 'css' ]);
    gulp.watch(paths.source.templates, [ 'templates' ]);
    gulp.watch(paths.source.images, [ 'images' ]);
    gulp.watch('./src/*.json', [ 'copy' ]);
  });
})();        

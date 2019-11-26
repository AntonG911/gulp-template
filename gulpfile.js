var gulp = require('gulp'),
	pug = require('gulp-pug'),
	prettyHtml = require('gulp-pretty-html'),
	sass = require('gulp-sass'),
	postcss = require('gulp-postcss'),
	browserSync = require('browser-sync').create(),
	concat = require('gulp-concat'),
	cleanCSS = require('gulp-clean-css'),
	cleanhtml = require('gulp-cleanhtml'),
	rename = require('gulp-rename'),
	del = require('del'),
	cache = require('gulp-cache'),
	autoprefixer = require('gulp-autoprefixer'),
	rigger = require('gulp-rigger'),
	sourcemaps = require('gulp-sourcemaps'),
	notify = require("gulp-notify"),
	svgSprite = require('gulp-svg-sprite'),
	svgmin = require('gulp-svgmin'),
	cheerio = require('gulp-cheerio'),
	replace = require('gulp-replace'),
	uglify = require('gulp-uglify');
	// uglify = require('gulp-uglify-es').default;

// Use this var for default path
var path = 'app/';

//Html rigger task
gulp.task('html', function () {
	return gulp.src(path+'html/*.html')
		.pipe(rigger())
		.pipe(gulp.dest(path))
		.pipe(browserSync.reload({stream: true}));
});

// PUG task
gulp.task('pug', () => {
    return gulp.src(path + 'pug/*.pug')
        .pipe(pug()
            .on('error', notify.onError(function (err) {
                return {
                    title: 'PUG error',
                    message: err.msg + ' on file ' + err.filename + ' on line ' + err.line
                }
            }))
        )
        .pipe(prettyHtml({
            indent_size: 4,
            unformatted: ['abbr', 'area', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'ins', 'kbd', 'keygen', 'map', 'mark', 'math', 'meter', 'noscript', 'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', 'small', 'strong', 'sub', 'sup', 'template', 'time', 'u', 'var', 'wbr', 'text', 'acronym', 'address', 'big', 'dt', 'ins', 'strike', 'tt']
        }))
        .pipe(gulp.dest(path))
        .pipe(browserSync.reload({stream: true}));
});

// Sass task
gulp.task('sass', function() {
	return gulp.src(path+'sass/*.sass')
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'expand'}).on("error", notify.onError()))
		.pipe(rename({suffix: '.min', prefix : ''}))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(sourcemaps.write('/'))
		.pipe(gulp.dest(path+'css'))
		.pipe(browserSync.reload({stream: true}));
});

// Js task
gulp.task('js', function() {
	return gulp.src([
		// uncomment what you need
		path+'js/libs/jquery_3.3.1/jQuery.3.3.1.js',
		// path+'js/libs/svg4everybody_2.1.9/svg4everybody.js',
		// path+'js/libs/parallax_3.1/parallax.min.js',
		// path+'js/libs/gsap_1.20.4/TweenMax.js',
		// path+'js/libs/gsap_1.20.4/CSSRulePlugin.js',
		// path+'js/libs/scrollmagic_2.0.6/ScrollMagic.min.js',
		// path+'js/libs/scrollmagic_2.0.6/jquery.ScrollMagic.min.js',
		// path+'js/libs/scrollmagic_2.0.6/animation.gsap.min.js',
		// path+'js/libs/scrollmagic_2.0.6/debug.addIndicators.min.js',
		// path+'js/libs/fullpage_3.0.4/scrolloverflow.min.js',
		// path+'js/libs/fullpage_3.0.4/fullpage.min.js',
		// path+'js/libs/fullpage_2.9.6/jquery.fullpage.js',
		// path+'js/libs/slick_1.9.0/slick.js',
		// path+'js/libs/swiper_4.5.0/swiper.min.js',
		// path+'js/libs/iziModal_1.6.0/iziModal.min.js',
		// path+'js/libs/scrolltoid_1.5.8/jquery.malihu.PageScroll2id.min.js',
		path+'js/common.js' // always the last
	])
		.pipe(sourcemaps.init())
		.pipe(concat('scripts.min.js'))
		.pipe(sourcemaps.write('/'))
		.pipe(gulp.dest(path+'js'))
		.pipe(browserSync.reload({stream: true}));
});

// SVG sprite task
gulp.task('svg-sprite-build', function () {
	return gulp.src(path+'img/svg-sprite/*.svg')
	// minify svg
		.pipe(svgmin({
			js2svg: {
				pretty: true
			}
		}))
		// remove all fill, style and stroke declarations in out shapes
		.pipe(cheerio({
			run: function ($) {
				$('[fill]').removeAttr('fill');
				$('[stroke]').removeAttr('stroke');
				$('[style]').removeAttr('style');
				$('[class]').removeAttr('class');
				$('style').remove();
			},
			parserOptions: {xmlMode: true}
		}))
		// cheerio plugin create unnecessary string '&gt;', so replace it.
		.pipe(replace('&gt;', '>'))
		// build svg sprite
		.pipe(svgSprite({
			mode: {
				symbol: {
					sprite: '../sprite/sprite.svg',
					render: {
						scss: {
							dest: '../../sass/helpers/_sprite.scss',
							template: path+'sass/helpers/_sprite_template.scss'
						}
					}
				}
			}
		}))
		.pipe(gulp.dest(path+'img'));
});

// Browser-sync task
gulp.task('browser-sync', function() {
	browserSync.init({
		server: {
			baseDir: path
		},
		notify: false,
		open: false,
		browser: 'google chrome'
	});
});

// Watch task
gulp.task('watch', function() {
	// gulp.watch(path+'html/**/*.html', gulp.series('html'));
	gulp.watch(path+'pug/**/*.*', gulp.series('pug'));
	gulp.watch(path+'sass/**/*.sass', gulp.series('sass'));
	gulp.watch([path+'js/common.js', path+'js/libs/*.*'], gulp.series('js'));
	gulp.watch(path+'img/svg-sprite/*.svg', gulp.series('svg-sprite-build'));
	gulp.watch(path+'*.html', browserSync.reload);
});

// Compile all files before copy to build dir
gulp.task('build:compile', gulp.series('pug', 'sass', 'js', 'svg-sprite-build')); //Add 'html' in the begining for using html

// Build tasks
gulp.task('build:clean', (done) => {
    del.sync(['build']);
    done();
});

gulp.task('build:html', function() {
	return gulp.src([
		path+'*.html'
		])
		// .pipe(cleanhtml())
		.pipe(gulp.dest('build'));
});

gulp.task('build:css', function() {
	return gulp.src([
		path+'css/main.min.css',
		])
		.pipe(cleanCSS())
		.pipe(gulp.dest('build/css'));
});

gulp.task('build:js', function() {
	return gulp.src([
		path+'js/scripts.min.js'
		])
		.pipe(uglify())
		.pipe(gulp.dest('build/js'));
});

gulp.task('build:fonts', function() {
	return gulp.src([
		path+'fonts/**/*'
		])
		.pipe(gulp.dest('build/fonts'));
});

gulp.task('build:img', function() {
	return gulp.src([
		path+'img/**/*'
		])
		.pipe(gulp.dest('build/img'));
});

gulp.task('build', gulp.series('build:clean', 'build:compile', 'build:html', 'build:css', 'build:js', 'build:fonts', 'build:img'));

// Default task
gulp.task('default', gulp.series('pug', 'sass', 'js', 'svg-sprite-build', gulp.parallel('browser-sync', 'watch'))); //Add 'html' in the begining for using html
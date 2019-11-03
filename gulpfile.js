const gulp = require('gulp');
const mocha = require('gulp-mocha');
const del = require('del');

const ts = require('gulp-typescript');
const project = ts.createProject('./tsconfig.json');
const typedoc = require('gulp-typedoc');

gulp.task('test', () => {
    return gulp.src('./test/**/*.test.ts')
        .pipe(mocha({
            require: ['ts-node/register']
        }));
});

gulp.task('clean', () => {
    return del(['./dist']);
});

gulp.task('compile', () => {
    let result = project.src()
        .pipe(project({
            declaration: true
        }));
    result.js.pipe(gulp.dest('dist'));
    result.dts.pipe(gulp.dest('dist'));
    return result;
});

gulp.task('copy-gs', () => {
    return gulp.src([
        './src/gs/**/*'
    ])
        .pipe(gulp.dest('./dist/gs'));
});

gulp.task(('docs'), () => {
    return gulp.src(['./src/**/*.ts'])
        .pipe(typedoc({
            module: 'commonjs',
            target: 'es6',
            includeDeclarations: false,

            out: '../../flexington.github.io/flxPDF',

            name: 'flxPDF',
            version: true,
            ignoreCompilerErrors: false,
            mode: 'modules',
            theme: './node_modules/typedoc-default-themes/bin/default',
            excludePrivate: true,
            excludeProtected: true
        }));
});

gulp.task('build', gulp.series('test', 'clean', 'compile', 'copy-gs', 'docs'));
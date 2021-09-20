const del = require('del');
const gulp = require('gulp');
const path = require('path');
const tap = require('gulp-tap');
const sass = require('gulp-dart-sass');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const ugilifyCss = require('gulp-uglifycss');
const jsonMinify = require('gulp-jsonminify');

const config = {
  cssFilterFiles: [],
};

const hasRmCssFiles = new Set();
gulp.task('sass', () =>
  gulp
    .src('./src/**/*.{scss,wxss}')
    .pipe(
      tap((file) => {
        // 当前处理文件的路径
        const filePath = path.dirname(file.path);
        // 当前处理内容
        const content = file.contents.toString();
        // 找到filter的scss，并匹配是否在配置文件中
        content.replace(/@import\s+['|"](.+)['|"];/g, ($1, $2) => {
          const hasFilter = config.cssFilterFiles.filter(
            (item) => $2.indexOf(item) > -1
          );
          // hasFilter > 0表示filter的文件在配置文件中，打包完成后需要删除
          if (hasFilter.length > 0) {
            const rmPath = path.join(filePath, $2);
            // 将src改为dist，.scss改为.wxss，例如：'/xxx/src/scss/const.scss' => '/xxx/dist/scss/const.wxss'
            const filea = rmPath
              .replace(/src/, 'bundle')
              .replace(/\.scss/, '.wxss');
            // 加入待删除列表
            hasRmCssFiles.add(filea);
          }
        });
      })
    )
    .pipe(
      replace(/(@import.+;)/g, ($1, $2) => {
        const hasFilter = config.cssFilterFiles.filter(
          (item) => $1.indexOf(item) > -1
        );
        if (hasFilter.length > 0) {
          return $2;
        }
        return `/** ${$2} **/`;
      })
    )
    .pipe(sass().on('error', sass.logError))
    .pipe(
      postcss([
        autoprefixer({
          overrideBrowserslist: ['iOS >= 8', 'Android >= 4.1'],
        }),
      ])
    )
    .pipe(
      replace(/(\/\*\*\s{0,})(@.+)(\s{0,}\*\*\/)/g, ($1, $2, $3) =>
        $3.replace(/\.scss/g, '.wxss')
      )
    )
    .pipe(
      rename({
        extname: '.wxss',
      })
    )
    .pipe(
      ugilifyCss({
        uglyComments: true,
      })
    )
    .pipe(gulp.dest('./bundle'))
);

gulp.task('wxsstosass', () =>
  gulp
    .src('./src/**/*.{scss,wxss}')
    .pipe(
      tap((file) => {
        // 当前处理文件的路径
        const filePath = path.dirname(file.path);
        // 当前处理内容
        const content = file.contents.toString();
        // 找到filter的scss，并匹配是否在配置文件中
        content.replace(/@import\s+['|"](.+)['|"];/g, ($1, $2) => {
          const hasFilter = config.cssFilterFiles.filter(
            (item) => $2.indexOf(item) > -1
          );
          // hasFilter > 0表示filter的文件在配置文件中，打包完成后需要删除
          if (hasFilter.length > 0) {
            const rmPath = path.join(filePath, $2);
            // 将src改为dist，.scss改为.wxss，例如：'/xxx/src/scss/const.scss' => '/xxx/dist/scss/const.wxss'
            const filea = rmPath
              .replace(/src/, 'src')
              .replace(/\.wxss/, '.scss');
            // 加入待删除列表
            hasRmCssFiles.add(filea);
          }
        });
      })
    )
    .pipe(
      replace(/(@import.+;)/g, ($1, $2) => {
        const hasFilter = config.cssFilterFiles.filter(
          (item) => $1.indexOf(item) > -1
        );
        if (hasFilter.length > 0) {
          return $2;
        }
        return `/** ${$2} **/`;
      })
    )
    .pipe(sass().on('error', sass.logError))
    .pipe(
      replace(/(\/\*\*\s{0,})(@.+)(\s{0,}\*\*\/)/g, ($1, $2, $3) =>
        $3.replace(/\.wxss/g, '.scss')
      )
    )
    .pipe(
      rename({
        extname: '.scss',
      })
    )
    .pipe(gulp.dest('./src'))
);

gulp.task('js', () => gulp.src('./src/**/*.js').pipe(gulp.dest('./bundle')));

gulp.task('wxs', () => gulp.src('./src/**/*.wxs').pipe(gulp.dest('./bundle')));

gulp.task('wxml', () =>
  gulp.src('./src/**/*.wxml').pipe(gulp.dest('./bundle'))
);

gulp.task('json', () =>
  gulp.src('./src/**/*.json')
    .pipe(jsonMinify())
    .pipe(gulp.dest('./bundle'))
);

gulp.task('copy', () => gulp.src([
  './src/**/*.js',
  './src/**/*.wxs',
  './src/**/*.wxml',
  './src/**/*.json',
]).pipe(gulp.dest('./bundle')));

gulp.task('watch', () => {
  gulp.watch('./src/**/*.js', gulp.series('js'));
  gulp.watch('./src/**/*.wxs', gulp.series('wxs'));
  gulp.watch('./src/**/*.wxml', gulp.series('wxml'));
  gulp.watch('./src/**/*.json', gulp.series('json'));
  gulp.watch('./src/**/*.{scss,wxss}', gulp.series('sass'));
});

gulp.task('clean', async() => await del('./bundle/*/'));

gulp.task('clean:wxss', async() => await del('./src/**/*.wxss'));

gulp.task('dev', gulp.series('watch'));

gulp.task('prod', gulp.series('clean', 'copy'));

gulp.task('tosass', gulp.series('wxsstosass', 'clean:wxss'));

gulp.task('default', gulp.series('clean', 'copy'));

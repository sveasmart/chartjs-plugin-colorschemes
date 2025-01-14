import gulp from "gulp";
import eslint from "gulp-eslint";
import file from "gulp-file";
import replace from "gulp-replace";
import streamify from "gulp-streamify";
import zip from "gulp-zip";
import karma from 'karma';
import merge from "merge2";
import path from "path";
import { exec } from "child_process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import pkg from "./package.json" with { type: "json" };

const { Server: KarmaServer, config: karmaConfig } = karma;

const argv = yargs(hideBin(process.argv))
    .option("output", { alias: "o", default: "dist" })
    .option("samples-dir", { default: "samples" })
    .option("docs-dir", { default: "docs" }).argv;

	function run(bin, args) {
		return new Promise((resolve, reject) => {
			const exe = `"${process.execPath}"`;
			const src = path.resolve('node_modules', bin); // Resolve the binary path
			const ps = exec([exe, src].concat(args || []).join(' '));

			ps.stdout.pipe(process.stdout);
			ps.stderr.pipe(process.stderr);
			ps.on('close', (error) => {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});
	}

gulp.task("build", function () {
    return run("rollup/dist/bin/rollup", ["-c", argv.watch ? "--watch" : ""]);
});

gulp.task("test", function (done) {
    const cliOptions = {
        configFile: path.join(process.cwd(), "karma.config.js"),
        singleRun: !argv.watch,
        args: {
            coverage: !!argv.coverage,
            inputs: (argv.inputs || "test/specs/**/*.js").split(";"),
            watch: argv.watch,
        },
    };

    new KarmaServer(
        karmaConfig.parseConfig(
            path.join(process.cwd(), "karma.config.js"),
            cliOptions
        ),
        (error) => {
            if (error) {
                done(new Error(`Karma returned with the error code: ${error}`));
            } else {
                done();
            }
        }
    ).start();
});

gulp.task("lint", function () {
    const files = [
        "docs/**/*.html",
        "samples/**/*.html",
        "src/**/*.js",
        "test/**/*.js",
        "*.js",
    ];

    const options = {
        rules: {
            complexity: [1, 10],
            "max-statements": [1, 30],
        },
    };

    return gulp
        .src(files)
        .pipe(eslint(options))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task("samples", function () {
    const out = path.join(argv.output, argv.samplesDir);
    return gulp
        .src("samples/**/*", { base: "samples" })
        .pipe(
            streamify(
                replace(/src="((?:\.\.\/)+)dist\//g, 'src="$1', {
                    skipBinary: true,
                })
            )
        )
        .pipe(gulp.dest(out));
});

gulp.task(
    "package",
    gulp.series(gulp.parallel("build", "samples"), function () {
        const out = argv.output;
        const streams = merge(
            gulp.src(path.join(out, argv.samplesDir, "**/*"), { base: out }),
            gulp.src([path.join(out, "*.js"), "LICENSE.md"])
        );

        return streams.pipe(zip(`${pkg.name}.zip`)).pipe(gulp.dest(out));
    })
);

gulp.task("bower", function () {
    const json = JSON.stringify(
        {
            name: pkg.name,
            description: pkg.description,
            homepage: pkg.homepage,
            license: pkg.license,
            version: pkg.version,
            main: `${argv.output}/${pkg.name}.js`,
            ignore: [
                ".codeclimate.yml",
                ".gitignore",
                ".npmignore",
                ".travis.yml",
                "scripts",
            ],
        },
        null,
        2
    );

    return file("bower.json", json, { src: true }).pipe(gulp.dest("./"));
});

gulp.task("default", gulp.parallel("build"));

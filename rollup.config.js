const terser = require('rollup-plugin-terser').terser;
const pkg = require('./package.json');

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.homepage}
 * (c) ${new Date().getFullYear()} Akihiko Kusanagi
 * Released under the ${pkg.license} license
 */`;

module.exports = [
	{
		input: 'src/index.js',
		output: {
			name: 'ChartColorSchemes',
			file: `dist/chartjs-plugin-colorschemes.js`,
			banner: banner,
			format: 'umd',
			indent: false,
			globals: {
				'chart.js': 'Chart'
			}
		},
		external: [
			'chart.js'
		]
	},
  {
		input: 'src/index.js',
		output: {
			name: 'ChartColorSchemes',
			file: `dist/chartjs-plugin-colorschemes.esm.js`,
			banner: banner,
			format: 'es',
			indent: false,
		},
		external: [
			'chart.js'
		]
	},
	{
		input: 'src/index.js',
		output: {
			name: 'ChartColorSchemes',
			file: `dist/chartjs-plugin-colorschemes.min.js`,
			format: 'umd',
			indent: false,
			globals: {
				'chart.js': 'Chart'
			}
		},
		plugins: [
			terser({
				output: {
					preamble: banner
				}
			})
		],
		external: [
			'chart.js'
		]
	}
];

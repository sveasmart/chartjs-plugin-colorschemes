import terser from "@rollup/plugin-terser";
import pkg from './package.json' with { type: 'json' };

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.homepage}
 * (c) ${new Date().getFullYear()} Akihiko Kusanagi
 * Released under the ${pkg.license} license
 */`;

 export default [
	{
	  input: 'src/index.js',
	  external: ['chart.js', 'chart.js/helpers'],
	  output: {
		name: 'ChartColorSchemes',
		file: 'dist/chartjs-plugin-colorschemes.js',
		format: 'umd',
		indent: false,
		banner,
		globals: {
		  'chart.js': 'Chart',
		  'chart.js/helpers': 'Chart.helpers',
		},
	  },
	},
	{
	  input: 'src/index.js',
	  external: ['chart.js', 'chart.js/helpers'],
	  output: {
		name: 'ChartColorSchemes',
		file: 'dist/chartjs-plugin-colorschemes.esm.js',
		format: 'es',
		indent: false,
		banner,
	  },
	},
	{
	  input: 'src/index.js',
	  external: ['chart.js', 'chart.js/helpers'],
	  plugins: [
		terser({
		  output: {
			preamble: banner,
		  },
		}),
	  ],
	  output: {
		name: 'ChartColorSchemes',
		file: 'dist/chartjs-plugin-colorschemes.min.js',
		format: 'umd',
		indent: false,
		globals: {
		  'chart.js': 'Chart',
		  'chart.js/helpers': 'Chart.helpers',
		},
	  },
	},
  ];

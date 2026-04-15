import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import serve from 'rollup-plugin-serve';

const production = !process.env.ROLLUP_WATCH;
const name = 'image-zoom';

// css processing configuration
const cssConfig = {
	extract: true,
	minimize: false,
	sourceMap: !production,
};

const cssConfigMinified = {
	extract: true,
	minimize: production,
	sourceMap: !production,
};

// rollup configuration
export default [
	// esm version
	{
		input: 'src/index.js',
		output: {
			file: `dist/${name}.esm.js`,
			format: 'es',
			sourcemap: !production,
		},
		plugins: [
			resolve(),
			postcss({
				...cssConfig,
				extract: `${name}.css`,
			}),
			!production &&
				serve({
					open: true,
					contentBase: ['dist', 'demo'],
					host: 'localhost',
					port: 3000,
				}),
		],
	},
	// umd version (for direct browser usage and more compatibility)
	{
		input: 'src/index.js',
		output: {
			file: `dist/${name}.js`,
			format: 'umd',
			name: 'ImageZoom',
			sourcemap: !production,
		},
		plugins: [
			resolve(),
			postcss({
				...cssConfig,
				extract: false,
			}),
		],
	},
	// minified umd version
	{
		input: 'src/index.js',
		output: {
			file: `dist/${name}.min.js`,
			format: 'umd',
			name: 'ImageZoom',
			sourcemap: !production,
		},
		plugins: [
			resolve(),
			postcss({
				...cssConfigMinified,
				extract: `${name}.min.css`,
			}),
			terser({
				format: {
					comments: false,
				},
			}),
			// Additional copy plugin at the end to copy files for GitHub Pages demo
			copy({
				targets: [
					{ src: 'dist/image-zoom.min.js', dest: 'demo', rename: 'image-zoom.js' },
					{ src: 'dist/image-zoom.css', dest: 'demo' },
				],
				hook: 'writeBundle', // Run this after all output files are written
			}),
		],
	},
];

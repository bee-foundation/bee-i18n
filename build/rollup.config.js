const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');
const { uglify } = require('rollup-plugin-uglify');

const config = ({folder, name, index}) => {

    // const minify = process.env.MINIFY;
    // const format = process.env.FORMAT;

    const minify = true;
    const format = "umd";

    const es = format === 'es';
    const umd = format === 'umd';
    const cjs = format === 'cjs';

    let output;

    if (es) {
        output = { file: `${folder}/dist/${name}.es.js`, format: 'es' }
    } else if (umd) {
        if (minify) {
            output = {
                file: `${folder}/dist/${name}.umd.min.js`,
                format: 'umd'
            }
        } else {
            output = { file: `${folder}/dist/${name}.umd.js`, format: 'umd' }
        }
    } else if (cjs) {
        output = { file: `${folder}/dist/${name}.cjs.js`, format: 'cjs' }
    } else if (format) {
        throw new Error(`invalid format specified: "${format}".`)
    } else {
        throw new Error('no format specified. --environment FORMAT:xxx')
    }

    return {
        outputOptions: Object.assign(
            {
                name: `${name}`,
                exports: 'named'
            },
            output
        ),
        inputOptions: {
            input: `${folder}/${index}`,
            external: [],
            plugins: [
                resolve({jsnext: true, main: true}),
                commonjs({include: 'node_modules/**'}),
                babel({
                    exclude: 'node_modules/**',
                    babelrc: false,
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                modules: false,
                                loose: true
                            }
                        ],
                        ['@babel/preset-stage-2', {decoratorsLegacy: true}]
                    ]
                }),
                umd
                    ? replace({
                        'process.env.NODE_ENV': JSON.stringify(
                            minify ? 'production' : 'development'
                        )
                    })
                    : null,
                minify ? uglify() : null
            ].filter(Boolean)
        },
    };
};

let {inputOptions, outputOptions} = config({
    folder: ".",
    name: "bee-i18n",
    index: "src/parse-template.mjs",
});
export default {
    ...inputOptions,
    output: outputOptions,
};
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import {uglify} from 'rollup-plugin-uglify';

import pkg from './package.json';

import * as PropTypes from 'prop-types';
import * as shisell from 'shisell';
import * as React from 'react';

const inputFile = 'src/index.ts';

export default {
    input: inputFile,
    external: Object.keys(pkg.peerDependencies),
    plugins: [
        resolve(),
        commonjs({
            namedExports: {
                'prop-types': Object.keys(PropTypes),
                shisell: Object.keys(shisell),
                react: Object.keys(React),
            },
        }),
        typescript({tsconfigOverride: {files: [inputFile]}}),
        uglify(),
    ],
    output: [
        {
            file: pkg.module,
            format: 'es',
        },
        {
            file: pkg.main,
            format: 'cjs',
        },
    ],
};

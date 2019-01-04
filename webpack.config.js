const path = require('path');

module.exports = {
    entry: ['@babel/polyfill', 'whatwg-fetch', './js/Slider-General.js'],
    output: {
        path: path.resolve(__dirname, './dist/js'),
        filename: 'slider.min.js',
    },
};

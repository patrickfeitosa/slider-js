import Slider from './modules/Slider.js';

const Methods = {
    init() {
        const options = {
            slide: '.js--slider',
            wrapper: '.js--main-wrapper',
        };
        const slider = new Slider(options);
        slider.init();
        console.log(slider);
    },
};

document.addEventListener('DOMContentLoaded', Methods.init);

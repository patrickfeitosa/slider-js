import Slider from './modules/Slider.js';

const Methods = {
    init() {
        const slider = new Slider();
        slider.init();
    },
};

document.addEventListener('DOMContentLoaded', Methods.init);

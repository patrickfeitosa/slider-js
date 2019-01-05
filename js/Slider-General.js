import { Slider, SliderNav } from './modules/Slider.js';
// import SliderNav from './modules/Slider.js';

const Methods = {
    init() {
        const options = {
            slide: '.js--slider',
            wrapper: '.js--main-wrapper',
        };

        /**
         * Slider Padrão
         */
        // const slider = new Slider(options);
        // slider.init();

        /**
         * Slider com navegação
         */
        const sliderWithNav = new SliderNav(options);
        window.sliderWithNav = sliderWithNav;
        sliderWithNav.init();
    },
};

document.addEventListener('DOMContentLoaded', Methods.init);

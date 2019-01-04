export default class Slider {
    constructor(options) {
        this.slide = document.querySelector(options.slide);
        this.wrapper = document.querySelector(options.wrapper);

        this.bindEvents();
    }

    onStart(ev) {
        ev.preventDefault();
        this.wrapper.addEventListener('mousemove', this.onMove);
    }

    onMove(ev) {
        console.log('moveu', this, ev);
    }

    onEnd(ev) {
        console.log(ev);
        this.wrapper.removeEventListener('mousemove', this.onMove);
    }

    addSlideEvents() {
        this.wrapper.addEventListener('mousedown', this.onStart);
        this.wrapper.addEventListener('mouseup', this.onEnd);
    }

    bindEvents() {
        this.onStart = this.onStart.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onEnd = this.onEnd.bind(this);
    }

    init() {
        this.addSlideEvents();
        return this;
    }
}

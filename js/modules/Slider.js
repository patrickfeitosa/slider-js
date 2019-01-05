export default class Slider {
    constructor(options) {
        this.slide = document.querySelector(options.slide);
        this.wrapper = document.querySelector(options.wrapper);
        this.dist = {
            finalPosition: 0,
            startX: 0,
            moviment: 0,
        };

        this.bindEvents();
    }

    moveSlide(distX) {
        this.dist.movePosition = distX;
        this.slide.style.transform = `translate3d(${distX}px, 0, 0)`;
    }

    updatePosition(clientX) {
        this.dist.moviment = (this.dist.startX - clientX) * 1.6;
        return this.dist.finalPosition - this.dist.moviment;
    }

    onStart(ev) {
        let moveType;
        if (ev.type === 'mousedown') {
            ev.preventDefault();
            this.dist.startX = ev.clientX;
            moveType = 'mousemove';
        } else {
            this.dist.startX = ev.changedTouches[0].clientX;
            moveType = 'touchmove';
        }
        this.wrapper.addEventListener(moveType, this.onMove);
    }

    onMove(ev) {
        const pointerPosition = (ev.type === 'mousemove') ? ev.clientX : ev.changedTouches[0].clientX;
        const finalPosition = this.updatePosition(pointerPosition);
        this.moveSlide(finalPosition);
    }

    onEnd(ev) {
        const moveType = (ev.type === 'mouseup') ? 'mousemove' : 'touchmove';
        this.wrapper.removeEventListener(moveType, this.onMove);
        this.dist.finalPosition = this.dist.movePosition;
    }

    addSlideEvents() {
        this.wrapper.addEventListener('mousedown', this.onStart);
        this.wrapper.addEventListener('touchstart', this.onStart);
        this.wrapper.addEventListener('mouseup', this.onEnd);
        this.wrapper.addEventListener('touchend', this.onEnd);
    }

    bindEvents() {
        this.onStart = this.onStart.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onEnd = this.onEnd.bind(this);
    }

    slidePosition(slide) {
        const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
        return -(slide.offsetLeft - margin);
    }

    // Slides config
    slidesConfig() {
        this.slideArray = [...this.slide.children].map((element) => {
            const position = this.slidePosition(element);
            return {
                position,
                element,
            };
        });
        console.log(this.slideArray);
    }

    slidesIndexNav(index) {
        const last = this.slideArray.length - 1;
        this.index = {
            prev: index ? index - 1 : undefined,
            active: index,
            next: index === last ? undefined : index + 1,
        };
    }

    changeSlide(index) {
        const activeSlide = this.slideArray[index];
        this.moveSlide(activeSlide.position);
        this.slidesIndexNav(index);
        this.dist.finalPosition = activeSlide.position;
    }

    init() {
        this.slidesConfig();
        this.addSlideEvents();
        return this;
    }
}

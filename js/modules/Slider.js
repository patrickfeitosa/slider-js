import debounce from './helpers/debounce.js';

export class Slider {
    constructor(options) {
        this.slide = document.querySelector(options.slide);
        this.wrapper = document.querySelector(options.wrapper);
        this.dist = {
            finalPosition: 0,
            startX: 0,
            moviment: 0,
        };
        this.infinite = options.infinite || false;
        this.activeClass = 'slide-active';

        console.log(this.slide, this.wrapper);
        if (this.slide && this.wrapper) {
            this.bindEvents();
            this.transition(true);
            this.slidesConfig();
            this.slidesIndexNav(0);
            this.changeSlide(this.index.active);
            this.changeActiveClass();
            this.addResizeEvent();
            this.keyboardNavigation();
        }
    }

    transition(active) {
        this.slide.style.transition = active ? 'transform .3s' : '';
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
        this.transition(false);
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
        this.transition(true);
        this.changeSlideOnEnd();
    }

    changeSlideOnEnd() {
        if (this.dist.moviment > 120 && this.index.next !== undefined) {
            this.activeNextSlide();
        } else if (this.dist.moviment < -120 && this.index.prev !== undefined) {
            this.activePrevSlide();
        } else {
            this.changeSlide(this.index.active);
        }
    }

    addSlideEvents() {
        this.wrapper.addEventListener('mousedown', this.onStart);
        this.wrapper.addEventListener('touchstart', this.onStart);
        this.wrapper.addEventListener('mouseup', this.onEnd);
        this.wrapper.addEventListener('touchend', this.onEnd);
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
    }

    slidesIndexNav(index) {
        const last = this.slideArray.length - 1;
        if (this.infinite) {
            this.index = {
                prev: index ? index - 1 : last,
                active: index,
                next: index === last ? 0 : index + 1,
            };
        } else {
            this.index = {
                prev: index ? index - 1 : undefined,
                active: index,
                next: index === last ? undefined : index + 1,
            };
        }
    }

    changeSlide(index) {
        const activeSlide = this.slideArray[index];
        this.moveSlide(activeSlide.position);
        this.slidesIndexNav(index);
        this.dist.finalPosition = activeSlide.position;
        this.changeActiveClass();

        const newEvent = new CustomEvent('slideChanged');
        this.slide.dispatchEvent(newEvent);
    }

    changeActiveClass() {
        this.slideArray.map(({ element }) => element.classList.remove(this.activeClass));
        this.slideArray[this.index.active].element.classList.add(this.activeClass);
    }

    activePrevSlide() {
        if (this.index.prev !== undefined) {
            this.changeSlide(this.index.prev);
        }
    }

    activeNextSlide() {
        if (this.index.next !== undefined) {
            this.changeSlide(this.index.next);
        }
    }

    onResize() {
        setTimeout(() => {
            this.slidesConfig();
            this.changeSlide(this.index.active);
        }, 500);
    }

    addResizeEvent() {
        window.addEventListener('resize', this.onResize);
    }

    keyboardNavigation() {
        document.addEventListener('keyup', (ev) => {
            if (ev.key === 'ArrowRight') {
                this.activeNextSlide();
            } else if (ev.key === 'ArrowLeft') {
                this.activePrevSlide();
            }
        });
    }

    bindEvents() {
        this.onStart = this.onStart.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onEnd = this.onEnd.bind(this);

        this.activePrevSlide = this.activePrevSlide.bind(this);
        this.activeNextSlide = this.activeNextSlide.bind(this);

        this.onResize = CommonHelpers.debounce(this.onResize.bind(this), 150);
        this.keyboardNavigation = this.keyboardNavigation.bind(this);
    }

    init() {
        if (this.slide && this.wrapper) {
            this.addSlideEvents();
        }
        return this;
    }
}

export default class SliderNav extends Slider {
    constructor(...args) {
        super(...args);
        this.hasThumbs = args[0].hasThumbs || {
            option: false,
            selector: '',
        };

        this.activeNavigationClass = 'active';

        if (this.slide && this.wrapper) {
            this.addSlideEvents();
            this.createBulletsPagination();
            this.appendArrowNavigation();
            this.checkForThumbs();
            this.slide.addEventListener('slideChanged', () => {
                this.removeActiveClassFromPaginationBullets();
                this.addActiveClassFromPaginationBullets(this.controlChildrens[this.index.active]);
                if (this.hasThumbs.options) {
                    this.removeActiveClassFromThumbs();
                    this.addActiveClassFromThumbs(this.hasThumbs.elements[this.index.active]);
                }
            });
        }
    }

    checkForThumbs() {
        const { hasThumbs } = this;

        if (hasThumbs.options) {
            hasThumbs.elements = document.querySelector(hasThumbs.selector).children;
            /* eslint-disable */
            [...hasThumbs.elements].map((element, index) => {
                /* eslint-enable */
                element.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    this.removeActiveClassFromThumbs();
                    this.addActiveClassFromThumbs(ev.currentTarget);
                    this.changeSlide(index);
                });
            });
            this.addActiveClassFromThumbs(this.hasThumbs.elements[this.index.active]);
        }
    }

    addActiveClassFromThumbs(target) {
        target.classList.add(this.activeNavigationClass);
    }

    removeActiveClassFromThumbs() {
        [...this.hasThumbs.elements].map(item => item.classList.remove(this.activeNavigationClass));
    }

    createArrowNavigation() {
        this.prevElement = this.createElementWithClass('button', 'slide-nav__prev');
        this.nextElement = this.createElementWithClass('button', 'slide-nav__next');
        this.navigationContainer = this.createElementWithClass('div', 'slide-nav');

        this.prevElement.innerText = 'Anterior';
        this.nextElement.innerText = 'Próximo';
    }

    addEventArrowNavigation() {
        this.prevElement.addEventListener('click', this.activePrevSlide);
        this.nextElement.addEventListener('click', this.activeNextSlide);
    }

    appendArrowNavigation() {
        this.createArrowNavigation();
        this.addEventArrowNavigation();

        this.navigationContainer.appendChild(this.prevElement);
        this.navigationContainer.appendChild(this.nextElement);
        this.wrapper.appendChild(this.navigationContainer);
    }

    createBulletsPagination() {
        const controlContainer = this.createElementWithClass('ul', 'slide-pagination');

        /* eslint-disable */
        this.slideArray.map((item, index) => {
            /* eslint-enable */
            const itemElement = this.createElementWithClass('li', 'slide-pagination__item');
            itemElement.innerText = index + 1;
            itemElement.addEventListener('click', (ev) => {
                ev.preventDefault();
                this.removeActiveClassFromPaginationBullets();
                this.addActiveClassFromPaginationBullets(ev.currentTarget);
                this.changeSlide(index);
            });
            controlContainer.appendChild(itemElement);
        });
        this.control = controlContainer;
        this.controlChildrens = [...this.control.children];
        this.wrapper.appendChild(controlContainer);
        this.addActiveClassFromPaginationBullets(this.controlChildrens[this.index.active]);
    }

    addActiveClassFromPaginationBullets(target) {
        target.classList.add(this.activeNavigationClass);
    }

    removeActiveClassFromPaginationBullets() {
        [...this.control.children].map(item => item.classList.remove(this.activeNavigationClass));
    }

    /* eslint-disable */
    createElementWithClass(element, customClass) {
        const elementCreated = document.createElement(element);
        elementCreated.classList.add(customClass);
        return elementCreated;
    }
    /* eslint-enable */
}

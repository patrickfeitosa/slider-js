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

        this.onResize = debounce(this.onResize.bind(this), 150);
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

export class Carrossel {
    /**
     * @param {HTMLDocument} element
     * @param {Object} options
     * @param {Object} [options.slidesToScroll=1] quantidade de itens por salto
     * @param {Object} [options.slidesVisible=1] quantidade de itens visivel
     * @param {boolean} [options.loop=false] permitir o loop do carrossel
     * @param {boolean} [options.pagination=false] controle de paginação do carrossel
     * @param {boolean} [options.navigation=true] controle de navegação do carrossel
     */

    constructor(element, options = {}) {
        this.element = element;
        this.options = Object.assign({}, {
            slidesToScroll: 1,
            slidesVisible: 1,
            loop: false,
            pagination: false,
            navigation: true,
        }, options);
        const children = [].slice.call(element.children);
        this.isMobile = false;
        this.currentItem = 0;
        this.moveCallback = [];

        // Modificação da DOM
        this.root = this.createDivWithClass('carrossel');
        this.container = this.createDivWithClass('carrossel-container');
        this.root.setAttribute('tabindex', '0');
        this.root.appendChild(this.container);
        this.element.appendChild(this.root);
        this.itens = children.map((child) => {
            const item = this.createDivWithClass('carrossel-item');
            item.appendChild(child);
            this.container.appendChild(item);
            return item;
        });
        this.setStyle();
        if (this.options.navigation) {
            this.createNavigation();
        }

        if (this.options.pagination) {
            this.createPagination();
        }

        this.createPagination();
        // Eventos
        this.moveCallback.forEach(cb => cb(0));
        this.onWindowResize();
        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.root.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'Right') {
                this.next();
            } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
                this.prev();
            }
        });
    }

    /**
     * Aplica os tamanhos para os itens do carrossel
     */
    setStyle() {
        const ratio = this.itens.length / this.slidesVisible;
        this.container.style.width = `${(ratio * 100)}%`;
        this.itens.forEach((item) => {
            item.style.width = `${((100 / this.slidesVisible) / ratio)}%`;
        });
    }

    // Criação da navegação na DOM
    createNavigation() {
        const nextButton = this.createDivWithClass('carrossel-next');
        const prevButton = this.createDivWithClass('carrossel-prev');
        this.root.appendChild(nextButton);
        this.root.appendChild(prevButton);
        nextButton.addEventListener('click', this.next.bind(this));
        prevButton.addEventListener('click', this.prev.bind(this));
        if (this.options.loop === true) {
            return;
        }
        this.onMove((index) => {
            if (index === 0) {
                prevButton.classList.add('carrossel-prev-hidden');
            } else {
                prevButton.classList.remove('carrossel-prev-hidden');
            }

            if (this.itens[this.currentItem + this.slidesVisible] === undefined) {
                nextButton.classList.add('carrossel-next-hidden');
            } else {
                nextButton.classList.remove('carrossel-next-hidden');
            }
        });
    }

    // Criação da paginação na DOM
    createPagination() {
        const pagination = this.createDivWithClass('grid-9');
        pagination.classList.add('offset-3');
        pagination.classList.add('carrossel-pagination');
        const buttons = [];
        this.element.appendChild(pagination);

        for (let i = 0; i < this.itens.length; i += this.slidesToScroll) {
            const button = this.createDivWithClass('carrossel-pagination-button');
            button.addEventListener('click', () => this.goToItem(i));
            pagination.appendChild(button);
            buttons.push(button);
        }

        this.onMove((index) => {
            const activeButton = buttons[Math.floor(index / this.slidesToScroll)];
            if (activeButton) {
                buttons.forEach(button => button.classList.remove('carrossel-pagination-button-active'));
                activeButton.classList.add('carrossel-pagination-button-active');
            }
        });
    }

    next() {
        this.goToItem(this.currentItem + this.slidesToScroll);
    }

    prev() {
        this.goToItem(this.currentItem - this.slidesToScroll);
    }

    /**
     * Define o proximo salto do carrossel
     * @param {number} index
     */
    goToItem(index) {
        if (index < 0) {
            if (this.options.loop) {
                index = this.itens.length - this.slidesVisible;
            } else {
                return;
            }
        } else if (index >= this.itens.length
            || (this.itens[this.currentItem + this.slidesVisible] === undefined
                && index > this.currentItem)) {
            if (this.options.loop) {
                index = 0;
            } else {
                return;
            }
        }
        const translateX = index * -100 / this.itens.length;
        this.container.style.transform = `translate3d(${translateX}%, 0, 0)`;
        this.currentItem = index;
        this.moveCallback.forEach(cb => cb(index));
    }

    /**
     * @param {moveCallback} cb
     */
    onMove(cb) {
        this.moveCallback.push(cb);
    }


    onWindowResize() {
        const mobile = window.innerWidth < 1199;
        if (mobile !== this.isMobile) {
            this.isMobile = mobile;
            this.setStyle();
            this.moveCallback.forEach(cb => cb(this.currentItem));
        }
    }

    /**
     * @param {string} className nome da classe para a div
     * @returns {HTMLElement}
     */
    /* eslint-disable */
    createDivWithClass(className) {
        let div = document.createElement('div')
        div.setAttribute('class', className)
        return div
    }
    /* eslint-enable */


    /**
     * @returns {number}
     */
    get slidesToScroll() {
        return this.isMobile ? 1 : this.options.slidesToScroll;
    }


    /**
     * @returns {number}
     */
    get slidesVisible() {
        return this.isMobile ? 1 : this.options.slidesVisible;
    }
}

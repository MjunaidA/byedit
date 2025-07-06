function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'));

  if(summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  if (summary.closest('header-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();

  if (elementToFocus.tagName === 'INPUT' &&
    ['search', 'text', 'email', 'url'].includes(elementToFocus.type) &&
    elementToFocus.value) {
    elementToFocus.setSelectionRange(0, elementToFocus.value.length);
  }
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch(e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if(navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');

  }, true);
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true });

    this.input.addEventListener('change', this.onInputChange.bind(this));
    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  quantityUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.validateQtyRules();
    this.quantityUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.quantityUpdate, this.validateQtyRules.bind(this));
  }

  disconnectedCallback() {
    if (this.quantityUpdateUnsubscriber) {
      this.quantityUpdateUnsubscriber();
    }
  }

  onInputChange(event) {
    this.validateQtyRules();
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }

  validateQtyRules() {
    const value = parseInt(this.input.value);
    if (this.input.min) {
      const min = parseInt(this.input.min);
      const buttonMinus = this.querySelector(".quantity__button[name='minus']");
      buttonMinus.classList.toggle('disabled', value <= min);
    }
    if (this.input.max) {
      const max = parseInt(this.input.max);
      const buttonPlus = this.querySelector(".quantity__button[name='plus']");
      buttonPlus.classList.toggle('disabled', value >= max);
    }
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
// console.log("debounce")
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function(selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl         = document.getElementById(country_domid);
  this.provinceEl        = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(e) {
    var opt       = this.countryEl.options[this.countryEl.selectedIndex];
    var raw       = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button:not(.localization-selector)').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if(!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest('.has-submenu');
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    console.log("close")

    if (detailsElement.classList.contains('menu-opening')) {
        console.log('The div has the class "menu-opening"');
        let bottomBar = document.getElementById('MainBottomBar');
        bottomBar.classList.remove("activeFilter")
        let sortBtn = document.querySelector('.mainMobileFilterWrapper .m-filter-container .sortDiv');
        let filtersBtn = document.querySelector('.mainMobileFilterWrapper .m-filter-container .filtersDiv');
       filtersBtn.classList.remove("activeFilter");
        sortBtn.classList.remove("activeFilter");
        let filtersBtnMainParent = document.querySelector('.mainMobileFilterWrapper .m-filter-container')
        filtersBtnMainParent.classList.remove("activeFilter");
      } else {
        console.log('The div does not have the class "menu-opening"');
        let bottomBar = document.getElementById('MainBottomBar');
        bottomBar.classList.remove("activeFilter")
      }
    console.log("apply")

    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
      summaryElement.nextElementSibling.removeEventListener('transitionend', addTrapFocus);
    }

    if (detailsElement === this.mainDetailsToggle) {
      if(isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);

      if (window.matchMedia('(max-width: 990px)')) {
        document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
      }
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        parentMenuElement && parentMenuElement.classList.add('submenu-open');
        !reducedMotion || reducedMotion.matches ? addTrapFocus() : summaryElement.nextElementSibling.addEventListener('transitionend', addTrapFocus);
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event === undefined) return;

    this.mainDetailsToggle.classList.remove('menu-opening');
    this.mainDetailsToggle.querySelectorAll('details').forEach(details => {
      details.removeAttribute('open');
      details.classList.remove('menu-opening');
    });
    this.mainDetailsToggle.querySelectorAll('.submenu-open').forEach(submenu => {
      submenu.classList.remove('submenu-open');
    });
    document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
    removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);
  }

  onFocusOut() {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    const parentMenuElement = detailsElement.closest('.submenu-open');
    parentMenuElement && parentMenuElement.classList.remove('submenu-open');
    detailsElement.classList.remove('menu-opening');
    detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
    removeTrapFocus(detailsElement.querySelector('summary'));
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.querySelector('.section-header');
    this.borderOffset = this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
    document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
    this.header.classList.add('menu-open');

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', true);
    window.addEventListener('resize', this.onResize);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus) {
    if (!elementToFocus) return;
    super.closeMenuDrawer(event, elementToFocus);
    this.header.classList.remove('menu-open');
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    this.header && document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
    document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
  };
}

customElements.define('header-drawer', HeaderDrawer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this, false)
    );
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
      });
    } else {
      this.addEventListener('click', (event) => {
        if (event.target === this) this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    document.body.dispatchEvent(new CustomEvent('modalClosed'));
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
      if (focus) deferredElement.focus();
      if (deferredElement.nodeName == 'VIDEO' && deferredElement.getAttribute('autoplay')) {
        // force autoplay for safari
        deferredElement.play();
      }
    }
  }
}

customElements.define('deferred-media', DeferredMedia);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[id^="Slider-"]');
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.enableSliderLooping = false;
    this.currentPageElement = this.querySelector('.slider-counter--current');
    this.pageTotalElement = this.querySelector('.slider-counter--total');
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');

    if (!this.slider || !this.nextButton) return;

    this.initPages();
    const resizeObserver = new ResizeObserver(entries => this.initPages());
    resizeObserver.observe(this.slider);

    this.slider.addEventListener('scroll', this.update.bind(this));
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
  }

  initPages() {
    this.sliderItemsToShow = Array.from(this.sliderItems).filter(element => element.clientWidth > 0);
    if (this.sliderItemsToShow.length < 2) return;
    this.sliderItemOffset = this.sliderItemsToShow[1].offsetLeft - this.sliderItemsToShow[0].offsetLeft;
    this.slidesPerPage = Math.floor((this.slider.clientWidth - this.sliderItemsToShow[0].offsetLeft) / this.sliderItemOffset);
    this.totalPages = this.sliderItemsToShow.length - this.slidesPerPage + 1;
    this.update();
  }

  resetPages() {
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.initPages();
  }

  update() {
    // Temporarily prevents unneeded updates resulting from variant changes
    // This should be refactored as part of https://github.com/Shopify/dawn/issues/2057
    if (!this.slider || !this.nextButton) return;

    const previousPage = this.currentPage;
    this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItemOffset) + 1;

    if (this.currentPageElement && this.pageTotalElement) {
      this.currentPageElement.textContent = this.currentPage;
      this.pageTotalElement.textContent = this.totalPages;
    }

    if (this.currentPage != previousPage) {
      this.dispatchEvent(new CustomEvent('slideChanged', { detail: {
        currentPage: this.currentPage,
        currentElement: this.sliderItemsToShow[this.currentPage - 1]
      }}));
    }

    if (this.enableSliderLooping) return;

    if (this.isSlideVisible(this.sliderItemsToShow[0]) && this.slider.scrollLeft === 0) {
      this.prevButton.setAttribute('disabled', 'disabled');
    } else {
      this.prevButton.removeAttribute('disabled');
    }

    if (this.isSlideVisible(this.sliderItemsToShow[this.sliderItemsToShow.length - 1])) {
      this.nextButton.setAttribute('disabled', 'disabled');
    } else {
      this.nextButton.removeAttribute('disabled');
    }
  }

  isSlideVisible(element, offset = 0) {
    const lastVisibleSlide = this.slider.clientWidth + this.slider.scrollLeft - offset;
    return (element.offsetLeft + element.clientWidth) <= lastVisibleSlide && element.offsetLeft >= this.slider.scrollLeft;
  }

  onButtonClick(event) {
    event.preventDefault();
    const step = event.currentTarget.dataset.step || 1;
    this.slideScrollPosition = event.currentTarget.name === 'next' ? this.slider.scrollLeft + (step * this.sliderItemOffset) : this.slider.scrollLeft - (step * this.sliderItemOffset);
    this.slider.scrollTo({
      left: this.slideScrollPosition
    });
  }
}

customElements.define('slider-component', SliderComponent);

class SlideshowComponent extends SliderComponent {
  constructor() {
    super();
    this.sliderControlWrapper = this.querySelector('.slider-buttons');
    this.enableSliderLooping = true;

    if (!this.sliderControlWrapper) return;

    this.sliderFirstItemNode = this.slider.querySelector('.slideshow__slide');
    if (this.sliderItemsToShow.length > 0) this.currentPage = 1;

    this.sliderControlLinksArray = Array.from(this.sliderControlWrapper.querySelectorAll('.slider-counter__link'));
    this.sliderControlLinksArray.forEach(link => link.addEventListener('click', this.linkToSlide.bind(this)));
    this.slider.addEventListener('scroll', this.setSlideVisibility.bind(this));
    this.setSlideVisibility();

    if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay();
  }

  setAutoPlay() {
    this.sliderAutoplayButton = this.querySelector('.slideshow__autoplay');
    this.autoplaySpeed = this.slider.dataset.speed * 1000;

    this.sliderAutoplayButton.addEventListener('click', this.autoPlayToggle.bind(this));
    this.addEventListener('mouseover', this.focusInHandling.bind(this));
    this.addEventListener('mouseleave', this.focusOutHandling.bind(this));
    this.addEventListener('focusin', this.focusInHandling.bind(this));
    this.addEventListener('focusout', this.focusOutHandling.bind(this));

    this.play();
    this.autoplayButtonIsSetToPlay = true;
  }

  onButtonClick(event) {
    super.onButtonClick(event);
    const isFirstSlide = this.currentPage === 1;
    const isLastSlide = this.currentPage === this.sliderItemsToShow.length;

    if (!isFirstSlide && !isLastSlide) return;

    if (isFirstSlide && event.currentTarget.name === 'previous') {
      this.slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * this.sliderItemsToShow.length;
    } else if (isLastSlide && event.currentTarget.name === 'next') {
      this.slideScrollPosition = 0;
    }
    this.slider.scrollTo({
      left: this.slideScrollPosition
    });
  }

  update() {
    super.update();
    this.sliderControlButtons = this.querySelectorAll('.slider-counter__link');
    this.prevButton.removeAttribute('disabled');

    if (!this.sliderControlButtons.length) return;

    this.sliderControlButtons.forEach(link => {
      link.classList.remove('slider-counter__link--active');
      link.removeAttribute('aria-current');
    });
    this.sliderControlButtons[this.currentPage - 1].classList.add('slider-counter__link--active');
    this.sliderControlButtons[this.currentPage - 1].setAttribute('aria-current', true);
  }

  autoPlayToggle() {
    this.togglePlayButtonState(this.autoplayButtonIsSetToPlay);
    this.autoplayButtonIsSetToPlay ? this.pause() : this.play();
    this.autoplayButtonIsSetToPlay = !this.autoplayButtonIsSetToPlay;
  }

  focusOutHandling(event) {
    const focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
    if (!this.autoplayButtonIsSetToPlay || focusedOnAutoplayButton) return;
    this.play();
  }

  focusInHandling(event) {
    const focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
    if (focusedOnAutoplayButton && this.autoplayButtonIsSetToPlay) {
      this.play();
    } else if (this.autoplayButtonIsSetToPlay) {
      this.pause();
    }
  }

  play() {
    this.slider.setAttribute('aria-live', 'off');
    clearInterval(this.autoplay);
    this.autoplay = setInterval(this.autoRotateSlides.bind(this), this.autoplaySpeed);
  }

  pause() {
    this.slider.setAttribute('aria-live', 'polite');
    clearInterval(this.autoplay);
  }

  togglePlayButtonState(pauseAutoplay) {
    if (pauseAutoplay) {
      this.sliderAutoplayButton.classList.add('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.playSlideshow);
    } else {
      this.sliderAutoplayButton.classList.remove('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.pauseSlideshow);
    }
  }

  autoRotateSlides() {
    const slideScrollPosition = this.currentPage === this.sliderItems.length ? 0 : this.slider.scrollLeft + this.slider.querySelector('.slideshow__slide').clientWidth;
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }

  setSlideVisibility() {
    this.sliderItemsToShow.forEach((item, index) => {
      const linkElements = item.querySelectorAll('a');
      if (index === this.currentPage - 1) {
        if (linkElements.length) linkElements.forEach(button => {
          button.removeAttribute('tabindex');
        });
        item.setAttribute('aria-hidden', 'false');
        item.removeAttribute('tabindex');
      } else {
        if (linkElements.length) linkElements.forEach(button => {
          button.setAttribute('tabindex', '-1');
        });
        item.setAttribute('aria-hidden', 'true');
        item.setAttribute('tabindex', '-1');
      }
    });
  }

  linkToSlide(event) {
    event.preventDefault();
    const slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * (this.sliderControlLinksArray.indexOf(event.currentTarget) + 1 - this.currentPage);
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }
}

customElements.define('slideshow-component', SlideshowComponent);

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();
    this.removeErrorMessage();
    this.updateVariantStatuses();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
      this.updateMetafield();
    }
  }

  // Update Specification and product title Metafield
  updateMetafield(){
    var variantId = this.currentVariant.id
    const specMetafield = document.querySelectorAll('.spec-metafield-selector option')
    if(specMetafield){
      var metafieldValue = document.querySelector(`[data-spec-id="${variantId}"]`).innerText
      const SpecificationTab = document.querySelector('.product__accordion.specifications')
      if(SpecificationTab){
        SpecificationTab.querySelector('.accordion__content').innerText = metafieldValue
      }
    }

    const ptMetafield = document.querySelectorAll('.pt-metafield-selector option')
    if(ptMetafield){
      const productTitle = document.querySelector('.product__title h1')
      if(document.querySelector(`[data-pt-id="${variantId}"]`)){
        var metafieldValue = document.querySelector(`[data-pt-id="${variantId}"]`).innerText
        if(productTitle){
          productTitle.innerText = metafieldValue
        }
      }
      else{
        if(productTitle){
          productTitle.innerText = document.querySelector('.product__title h2').innerText
        }
      }
    }

  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
       
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    // change slide of slider on the basis of variant media
    var filterId = `${this.dataset.section}-${this.currentVariant.featured_media.id}`
    // get index of slide
    var slide = document.querySelector(`[data-media-id="${filterId}"]`).getAttribute('aria-label')
    var slideIndex = parseInt(slide.split('/')[0])
    // slide to that index
    featuredSwiper.slideTo(slideIndex - 1)

    const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-${this.dataset.section}"]`);
    mediaGalleries.forEach(mediaGallery => mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true));

    const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
    if (!modalContent) return;
    const newMediaModal = modalContent.querySelector( `[data-media-id="${this.currentVariant.featured_media.id}"]`);
    modalContent.prepend(newMediaModal);
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateShareUrl() {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton || !shareButton.updateUrl) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  updateVariantStatuses() {
    const selectedOptionOneVariants = this.variantData.filter(variant => this.querySelector(':checked').value === variant.option1);
    const inputWrappers = [...this.querySelectorAll('.product-form__input')];
    inputWrappers.forEach((option, index) => {
      if (index === 0) return;
      const optionInputs = [...option.querySelectorAll('input[type="radio"], option')]
      const previousOptionSelected = inputWrappers[index - 1].querySelector(':checked').value;
      const availableOptionInputsValue = selectedOptionOneVariants.filter(variant => variant.available && variant[`option${ index }`] === previousOptionSelected).map(variantOption => variantOption[`option${ index + 1 }`]);
      this.setInputAvailability(optionInputs, availableOptionInputsValue)
    });
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach(input => {
      if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
        input.innerText = input.getAttribute('value');
      } else {
        input.innerText = window.variantStrings.unavailable_with_option.replace('[value]', input.getAttribute('value'));
      }
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    const requestedVariantId = this.currentVariant.id;
    const sectionId = this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section;

    fetch(`${this.dataset.url}?variant=${requestedVariantId}&section_id=${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        // prevent unnecessary ui changes from abandoned selections
        if (this.currentVariant.id !== requestedVariantId) return;

        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(`price-${this.dataset.section}`);
        const source = html.getElementById(`price-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
        const skuSource = html.getElementById(`Sku-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
        const skuDestination = document.getElementById(`Sku-${this.dataset.section}`);
        const inventorySource = html.getElementById(`Inventory-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
        const inventoryDestination = document.getElementById(`Inventory-${this.dataset.section}`);

        if (source && destination) destination.innerHTML = source.innerHTML;
        if (inventorySource && inventoryDestination) inventoryDestination.innerHTML = inventorySource.innerHTML;
        if (skuSource && skuDestination) {
          skuDestination.innerHTML = skuSource.innerHTML;
          skuDestination.classList.toggle('visibility-hidden', skuSource.classList.contains('visibility-hidden'));
        }

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');

        if (inventoryDestination) inventoryDestination.classList.toggle('visibility-hidden', inventorySource.innerText === '');

        const addButtonUpdated = html.getElementById(`ProductSubmitButton-${sectionId}`);
        this.toggleAddButton(addButtonUpdated ? addButtonUpdated.hasAttribute('disabled') : true, window.variantStrings.soldOut);

        publish(PUB_SUB_EVENTS.variantChange, {data: {
          sectionId,
          html,
          variant: this.currentVariant
        }});
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    const inventory = document.getElementById(`Inventory-${this.dataset.section}`);
    const sku = document.getElementById(`Sku-${this.dataset.section}`);

    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add('visibility-hidden');
    if (inventory) inventory.classList.add('visibility-hidden');
    if (sku) sku.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

customElements.define('variant-selects', VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach(input => {
      if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
        input.classList.remove('disabled');
      } else {
        input.classList.add('disabled');
      }
    });
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }
}

customElements.define('variant-radios', VariantRadios);

class ProductRecommendations extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);

      fetch(this.dataset.url)
        .then(response => response.text())
        .then(text => {
          const html = document.createElement('div');
          html.innerHTML = text;
          const recommendations = html.querySelector('product-recommendations');

          if (recommendations && recommendations.innerHTML.trim().length) {
            this.innerHTML = recommendations.innerHTML;
          }

          if (!this.querySelector('slideshow-component') && this.classList.contains('complementary-products')) {
            this.remove();
          }

          if (html.querySelector('.grid__item')) {
            this.classList.add('product-recommendations--loaded');
          }

          let quickAddCstm = document.querySelectorAll('.cardIconCstm .quickCstm');
          for (let i = 0; i < quickAddCstm.length; i++) {
            quickAddCstm[i].onclick = function () {
              let btnOpenQuick = quickAddCstm[i].closest('.quickPlacementDiv');
              let btnOpenQuick2 = btnOpenQuick.closest('.card-wrapper');
              let btnToClick = btnOpenQuick2.querySelector('.card__content .quick-add__submit.button');
              btnToClick.click();
            };
          }
        })
        .catch(e => {
          console.error(e);
        });
    }

    new IntersectionObserver(handleIntersection.bind(this), {rootMargin: '0px 0px 400px 0px'}).observe(this);
  }
}

customElements.define('product-recommendations', ProductRecommendations);
//custom js
// megamenu Home
let main_menu_parent = document.querySelectorAll('.mega-menu');
for (let i = 0; i < main_menu_parent.length; i++) {
  //    Mouse over 
  main_menu_parent[i].addEventListener('mouseover', function () {
    main_menu_parent[i].setAttribute('open', '');
    document.querySelector('main').classList.add('menu-overlay');
    main_menu_parent.forEach((value, index) => {
      value.querySelector('.header__menu-item').style.color = "gray";
    });
    main_menu_parent[i].querySelector('.header__menu-item').style.color = "#000";
  });
  main_menu_parent[i].addEventListener('click', function () {
  document.querySelector('main').classList.toggle('menu-overlay');
  });
  //     Mouse Leave
  main_menu_parent[i].addEventListener('mouseleave', function () {
    main_menu_parent[i].removeAttribute('open');
    document.querySelector('main').classList.remove('menu-overlay');
    main_menu_parent.forEach((value, index) => {
    value.querySelector('.header__menu-item').style.color = "#000";
    });
  });
}

// megaMenu Parent identifier for 1 levels menu only
let condesedMenu = document.querySelectorAll('.CstmCondensed');
for (var i = 0; i < condesedMenu.length; i++) {
  let parentMU = condesedMenu[i].closest('.mega-menu');
  parentMU.classList.add('condensed-mm');
  let parentCon = condesedMenu[i].closest('.condensed-mm');
  parentCon.style.position = "relative"
}
// footer toggle
// customElements.define('localization-form', LocalizationForm);
//   let cstmHandle = document.querySelectorAll('.mobileArrow');
//   console.log(cstmHandle,"cstmHandle")
//   for (let i = 0; i < cstmHandle.length; i++) {
//     cstmHandle[i].onclick = function(){
//       console.log("clicked");
//       let footerClosest = cstmHandle[i].closest('.cstmFooter-block');
//       let thisUl = footerClosest.querySelector('.footer-block__details-content');
//       thisUl.classList.toggle("cstmStyle");

//     };
//   }

// mobile drawer home
let parentHandle = document.querySelectorAll('.parentCstm-mm .mobileFlex-menu .icondown-mm');
for (var i = 0; i < parentHandle.length; i++) {
    parentHandle[i].onclick = function(){
    let mobileHeaderClosest = this.closest('.parentCstm-mm');
    let thisParent = mobileHeaderClosest.querySelector('.child-cstm-mm');
    thisParent.classList.toggle("cstmStyleMobileDrawer");
    this.classList.toggle("active");
  }
}

let childHandle = document.querySelectorAll('.child-cstm-mm .mobileFlex-menu-child .icondown-mm');
for (var i = 0; i < childHandle.length; i++) {
   childHandle[i].onclick = function(){
   let mobileHeaderClosestChild = this.closest('.child-para-mm');
   let thisChild = mobileHeaderClosestChild.querySelector('.grand-para-mm');
   thisChild.classList.toggle("cstmStyleMobileDrawerChild");
   this.classList.toggle("active");
  }
}

let cstmHandle = document.querySelectorAll('.mobileArrow');
  for (let i = 0; i < cstmHandle.length; i++) {
    cstmHandle[i].onclick = function(){
      let footerClosest = cstmHandle[i].closest('.cstmFooter-block');
      let thisUl = footerClosest.querySelector('.footer-block__details-content');
      thisUl.classList.toggle("cstmStyle");
      this.classList.toggle("active");
    };
  }

// quick add Card
let quickAddCstm = document.querySelectorAll('.cardIconCstm .quickCstm');
for (let i = 0; i < quickAddCstm.length; i++) {
  quickAddCstm[i].onclick = function () {
    let btnOpenQuick = quickAddCstm[i].closest('.quickPlacementDiv');
    let btnOpenQuick2 = btnOpenQuick.closest('.card-wrapper');
    let btnToClick = btnOpenQuick2.querySelector('.card__content .quick-add__submit.button');
    btnToClick.click();
  };
}

// add to cart Card
let optionSize = document.querySelectorAll('.card-wrapper .card__content .card-information .optionSize');
for (let j = 0; j < optionSize.length; j++) {
  let firstChild = optionSize[j].querySelector(':first-child');
  firstChild.classList.add('bgwhite');
}
let addCartCstm = document.querySelectorAll('.cardIconCstm .addCartCstm');
let varientIdMain = 0;
let optionSizeObject = document.querySelectorAll('.optionSizeObject');

for(let i = 0; i<optionSizeObject.length;i++){
optionSizeObject[i].onclick = function () {
  try {
    let closetParent = this.closest('.optionSize')
    let bgWhite = closetParent.querySelectorAll('.optionSizeObject');
    for(let k=0;k<bgWhite.length;k++){
      bgWhite[k].classList.remove('bgwhite')
    }
  }
  catch(err) {
    console.log("no bg white")
  }
varientIdMain =  optionSizeObject[i].getAttribute('data-variant-id');
optionSizeObject[i].classList.add("bgwhite")
var price = optionSizeObject[i].getAttribute('data-price')
this.closest('.card__content').querySelector('.price-item--regular').innerText = price
}
}
for (let i = 0; i < addCartCstm.length; i++) {
   addCartCstm[i].onclick = function () {
    var maxQuantity = addCartCstm[i].closest('.mn_pro-main').getAttribute('max-quantity')
    console.log(maxQuantity)
  if(varientIdMain !=0){
  addToCart(varientIdMain, maxQuantity);
varientIdMain=0;
}
else{
  let varientIdMain2 =   addCartCstm[i].getAttribute('variablefirst')
  addToCart(varientIdMain2, maxQuantity)
}
    //  addToCart(varientIdMain)
   
   }
}

// endcart

// global add to cart function
function addToCart(variantId, maxQuantity) {
  fetch('/cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quantity: 1,
      id: variantId,
      properties: {
        'maxQuantity': maxQuantity
      }
    }),
  })
  .then((response) => response.json())
  .then((data)=>{
    if (data.status === 422){
      document.body.classList.add('cart-error-active')
      document.querySelector('#cart-error-popup').innerText = data.description
      setTimeout(()=> {
          document.body.classList.remove('cart-error-active')
      },3000)
    }
    else{
      cartPopupUpdate()
      setTimeout(()=> {
          document.body.classList.add('cart-popup-active')
          document.body.classList.add('dropdown-shadow')
      },500)
    }
  })
  .catch((error) => {
      document.body.classList.add('cart-error-active')
      document.querySelector('#cart-error-popup').innerText = 'An Error Occured. Please try again later'
      setTimeout(()=> {
          document.body.classList.remove('cart-error-active')
      },3000)
  })
  .finally(() => {
// try{ 
// item.closest('.quick-cart-add').classList.remove('active')
// item.closest('.card-wrapper').style.display = 'block'
// }
// catch(err){
// console.log(err,"popup err")
// }
     
      
  })
}

// CartPopup open/close
document.querySelector('#cart-icon-bubble').addEventListener('click', (e)=> {
  e.preventDefault()
  if(document.body.classList.contains('template-cart')){
      return
  }else{
      document.body.classList.add('cart-popup-active')
      document.body.classList.add('dropdown-shadow')
  }
})
document.querySelectorAll('.close-cart').forEach(a => {
  a.addEventListener('click', (e)=> {
      e.preventDefault()
      document.body.classList.remove('cart-popup-active')
      document.body.classList.remove('dropdown-shadow')
  })
})

// Dropdown Shadow close button
document.querySelector('#dropdown-shadow').addEventListener('click', (e)=> {
  e.preventDefault()
  if(document.body.classList.contains('cart-popup-active')){
      document.body.classList.remove('cart-popup-active')
  }
  document.body.classList.remove('dropdown-shadow')
  document.body.style.overflow = 'inherit'
})

function removeCartItem(){
  // Remove from cart
  var btn = document.querySelectorAll('.btn-remove')
  btn.forEach(item => {
    item.addEventListener('click', (e)=> {
      e.preventDefault()
      var lineId = item.closest('.item').getAttribute('data-line')
      var formData = {
          'line': lineId,
          'quantity': 0
      }
      cartChanger(formData, item.closest('.item'))
    })
  })
}
removeCartItem()

function cartChanger(formData, item){
  fetch('/cart/change.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => {
    return response.json()
  })
  .then((data)=>{
    if (data.status === 422){
      // document.body.classList.add('cart-error-active')
      // document.querySelector('#cart-error-popup').innerText = data.message
      // decrease quantity value if quantity increased
      // item.querySelector('.quantity__input').value = item.querySelector('.quantity__input').value - 1
      
      // setTimeout(()=> {
      //     document.body.classList.remove('cart-error-active')
      // },3000)
    }
    else{
      cartPopupUpdate()
      if(document.body.classList.contains('template-cart')){
        window.location.reload()
      }
    }
  })
  .catch((error) => {
      document.body.classList.add('cart-error-active')
      document.querySelector('#cart-error-popup').innerText = 'An Error Occured. Please try again later'
      setTimeout(()=> {
          document.body.classList.remove('cart-error-active')
      },3000)
  })
}

function cartPopupUpdate(){
  // for updating cart popup
  fetch('/cart.js', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
  })
  .then(response => {
    return response.json()
  })
  .then((cart)=>{ 
      var lineItems = []
      document.querySelector('.mini-products-list').innerHTML = ''
      var cartCounter = cart.item_count
      document.querySelector('.cart-counter').innerText = cartCounter
      var totalPrice = priceFormatting(cart.total_price / 100)
      var optionsArray = []
      cart.items.forEach( async (item, i) => { 
          var itemPrice = priceFormatting(item.price / 100)
    console.log(itemPrice)
          var activeQuantity = item.quantity
          var maxQuantity = item.properties.maxQuantity
          for(var j=1; j<=maxQuantity ; j++){
            if(j == activeQuantity){
              selected = 'selected'
            }else{
              selected = ''
            }
            optionsArray.push(
              `<option ${selected} value="${j}">${j}</option>`
            )
          }
          
          var lineItemDetails = `<li maxQuantity = "${item.quantity}" class="item" data-id="${item.id}" data-line="${i+1}">
                <input class="gtmPayload" type="hidden" value="{
                  &quot;event&quot;: &quot;remove_from_cart&quot;,
                  &quot;ecommerce&quot;: {
                    &quot;currency&quot;: &quot;AED&quot;,
                    &quot;value&quot; : &quot;&quot;,
                    &quot;items&quot;:[
                      {
                        &quot;item_id&quot;: ${item.product_id},
                        &quot;item_name&quot;: &quot;${item.product_title}&quot;,
                        &quot;item_brand&quot;: &quot;${item.vendor}&quot;,
                        &quot;type&quot;: &quot;${item.product_type}&quot;,
                        &quot;item_variant&quot;: &quot;${item.variant_title}&quot;,
                        &quot;price&quot; : &quot;${item.original_price / 100}&quot;,
                        &quot;quantity&quot; : &quot;${item.quantity}&quot;,
                        &quot;stock_status&quot;: &quot;In Stock&quot;,
                        &quot;product_size&quot;: &quot;${item.variant_options[0]}&quot;
                        
                      }
                    ]
                  }
                }">
                
              <a href="${item.url}" class="product-image">
              <img loading="lazy" src="${item.image}" alt="${item.title}">
              </a>
              <div class="product-details">
              <a onclick="window.gtm_removeFromCart(this)" href="javascript:void(0)" title="Remove" class="btn-remove">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none">
                  <path
                    d="M12.1875 14.8438C12.5326 14.8438 12.8125 14.5639 12.8125 14.2188V7.96875C12.8125 7.62362 12.5326 7.34375 12.1875 7.34375C11.8424 7.34375 11.5625 7.62362 11.5625 7.96875V14.2188C11.5625 14.5639 11.8424 14.8438 12.1875 14.8438Z"
                    fill="black"
                    fill-opacity="0.5" />
                  <path
                    d="M7.8125 14.8438C8.15763 14.8438 8.4375 14.5639 8.4375 14.2188V7.96875C8.4375 7.62362 8.15763 7.34375 7.8125 7.34375C7.46737 7.34375 7.1875 7.62362 7.1875 7.96875V14.2188C7.1875 14.5639 7.46737 14.8438 7.8125 14.8438Z"
                    fill="black"
                    fill-opacity="0.5" />
                  <path
                    d="M12.5 2.65625C12.8451 2.65625 13.125 2.37638 13.125 2.03125C13.125 1.68612 12.8451 1.40625 12.5 1.40625H7.5C7.15487 1.40625 6.875 1.68612 6.875 2.03125C6.875 2.37638 7.15487 2.65625 7.5 2.65625H12.5Z"
                    fill="black"
                    fill-opacity="0.5" />
                  <path
                    d="M3.125 3.28125C2.77987 3.28125 2.5 3.56112 2.5 3.90625C2.5 4.25138 2.77987 4.53125 3.125 4.53125H3.75V16.0312C3.75 17.4437 4.9 18.5938 6.3125 18.5938H13.6875C15.0999 18.5938 16.25 17.4437 16.25 16.0312V4.53125H16.875C17.2201 4.53125 17.5 4.25138 17.5 3.90625C17.5 3.56112 17.2201 3.28125 16.875 3.28125H15.625H4.375H3.125ZM15 4.53125V16.0312C15 16.7562 14.4125 17.3438 13.6875 17.3438H6.3125C5.5875 17.3438 5 16.7562 5 16.0312V4.53125H15Z"
                    fill="black"
                    fill-opacity="0.5" />
                </svg>
              </a>
              <div class="product-vendor">${item.vendor}</div>
              <a class="product-name" href="${item.url}">${item.product_title}</a>
              <div class="option">
              <small>${item.variant_title}</small>
              </div>
              <div class="cart-quantity">

              <select class="quantity-dropdown">
                ${optionsArray.join('')}
              </select>

              <div class="cart-collateral">
                  <span class="price">
                  <span class="money">AED ${itemPrice}</span>
                  </span>
              </div>
              </div>
          </li>`
          lineItems.push(lineItemDetails) 
      })
      document.querySelector('.mini-products-list').innerHTML = lineItems.join('')
      document.querySelector('.total .price').innerText = `AED ${totalPrice}`
      if(cartCounter > 0){
          document.querySelector('#dropdown-cart .has-items').classList.remove('hidden')
          document.querySelector('#dropdown-cart .no-items').classList.add('hidden')
      }else{
          document.querySelector('#dropdown-cart .has-items').classList.add('hidden')
          document.querySelector('#dropdown-cart .no-items').classList.remove('hidden')
      }
  })
  .catch((error) => {
      document.body.classList.add('cart-error-active')
          document.querySelector('#cart-error-popup').innerText = 'An Error Occured. Please try again later'
          setTimeout(()=> {
              document.body.classList.remove('cart-error-active')
      },3000)
  })
  .finally(() => {
      removeCartItem()
      updateCartItem()
  })
}

// cart popup quantity changer
function updateCartItem(){

  const quantityBtn = document.querySelectorAll('.cart-quantity .quantity-dropdown')
  quantityBtn.forEach(item => {
    item.addEventListener('change', (e)=> {
      e.preventDefault()
      var lineId = item.closest('.item').getAttribute('data-line')
      var quantity = item.value
      var formData = {
          'line': lineId,
          'quantity': quantity
      }
      cartChanger(formData, item.closest('.item'))
    })
  })

  // // Quantity changer Plus
  // var btnPlus = document.querySelectorAll('div#dropdown-cart .cart-quantity .icon-plus')
  // btnPlus.forEach(item => {
  //   item.addEventListener('click', (e)=> {
  //     e.preventDefault()
  //     var lineId = item.closest('.item').getAttribute('data-line')
  //     var quantity = item.closest('.item').querySelector('.cart-quantity input').value = parseInt(item.closest('.item').querySelector('.cart-quantity input').value) + 1
  //     var formData = {
  //         'line': lineId,
  //         'quantity': quantity
  //     }
  //     cartChanger(formData, item.closest('.item'))
  //   })
  // })
  // // Quantity changer Minus
  // var btnMinus = document.querySelectorAll('div#dropdown-cart .cart-quantity .icon-minus')
  // btnMinus.forEach(item => {
  //   item.addEventListener('click', (e)=> {
  //     e.preventDefault()
  //     var lineId = item.closest('.item').getAttribute('data-line')
  //     var quantity = item.closest('.item').querySelector('.cart-quantity input').value = parseInt(item.closest('.item').querySelector('.cart-quantity input').value) - 1
  //     var formData = {
  //         'line': lineId,
  //         'quantity': quantity
  //     }
  //     cartChanger(formData, item.closest('.item'))
  //   })
  // })
}
updateCartItem()

function priceFormatting(price){
  // for formatting price
  var formatPrice = new Intl.NumberFormat('en-PK', { maximumSignificantDigits: 4 }).format(price)
  return formatPrice
}

// Already subscribed newsletter message
if(window.location.href.includes('form_type=customer')){
  document.querySelector('.ContactFooter-subscribed').classList.remove('hidden')
  document.querySelector('#subscribed').classList.remove('hidden')
  document.querySelector('.newsletter-form__field-wrapper').classList.add('success')
  if(document.querySelector('.newsletter-form__field-wrapper').classList.contains('error')){
    document.querySelector('.newsletter-form__field-wrapper').classList.remove('error')
  }
  if(document.querySelector(".ContactFooter-error")){
    document.querySelector(".ContactFooter-error").style.display = 'none'
  }
}

// Toggle eye button on password field
document.querySelectorAll('.show-password').forEach(item => {
  item.addEventListener('click', () => {
    item.closest('.field').querySelector('input').setAttribute('type', 'text')
    item.classList.add('active')
    setTimeout(() => {
      item.closest('.field').querySelector('input').setAttribute('type', 'password')
      item.classList.remove('active')
    }, 3000)
  })
})





// document.addEventListener('DOMContentLoaded', function() {
//     console.log('DOM fully loaded and parsed'); // This message will print when the DOM is ready

//     // Attach click event listener to .cart-counter
//     document.querySelector('.cart-counter').addEventListener('click', function(event) {
//         event.preventDefault(); // Prevent the default action
//         console.log('.cart-counter clicked'); // This message will print when the .cart-counter is clicked

//         // Fetch the updated content of the current page
//         fetch(window.location.href)
//             .then(response => response.text())
//             .then(html => {
//                 console.log('Fetched updated content'); // This message will print when the content is successfully fetched

//                 // Parse the response and extract the #dropdown-cart content
//                 const parser = new DOMParser();
//                 const doc = parser.parseFromString(html, 'text/html');
//                 const updatedDropdownCart = doc.querySelector('#dropdown-cart').innerHTML;

//                 // Replace the content of #dropdown-cart with the updated content
//                 document.querySelector('#dropdown-cart').innerHTML = updatedDropdownCart;
//                 console.log('#dropdown-cart section updated'); // This message will print when the #dropdown-cart section is updated
//             })
//             .catch(error => {
//                 console.error('Failed to refresh the #dropdown-cart section', error); // Print error if the fetch request fails
//             });
//     });
// });


















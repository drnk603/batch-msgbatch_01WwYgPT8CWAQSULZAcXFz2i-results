(function (window, document) {
  'use strict';

  window.__app = window.__app || {};

  function debounce(fn, delay) {
    var timer;
    return function () {
      var ctx = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(ctx, args);
      }, delay);
    };
  }

  function throttle(fn, limit) {
    var lastCall = 0;
    return function () {
      var now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        fn.apply(this, arguments);
      }
    };
  }

  function getHeaderHeight() {
    var header = document.querySelector('.l-header');
    return header ? header.getBoundingClientRect().height : 72;
  }

  function setNavHeightVar() {
    var header = document.querySelector('.l-header');
    if (!header) return;
    var h = header.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--nav-h', h + 'px');
    document.documentElement.style.setProperty('--header-h', h + 'px');
  }

  function initBurger() {
    if (__app.burgerReady) return;
    __app.burgerReady = true;

    var toggle = document.querySelector('.navbar-toggler.c-nav__toggle');
    var navCollapse = document.querySelector('.collapse.navbar-collapse.c-nav');

    if (!toggle || !navCollapse) return;

    function isOpen() {
      return navCollapse.classList.contains('is-open');
    }

    function openMenu() {
      navCollapse.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('u-no-scroll');
    }

    function closeMenu() {
      navCollapse.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('u-no-scroll');
    }

    toggle.addEventListener('click', function () {
      if (isOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape' || e.keyCode === 27) {
        closeMenu();
        toggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!isOpen()) return;
      if (!navCollapse.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    var navLinks = navCollapse.querySelectorAll('.nav-link, .c-nav__item');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function () {
        if (isOpen()) closeMenu();
      });
    }

    window.addEventListener('resize', debounce(function () {
      if (window.innerWidth >= 768 && isOpen()) {
        closeMenu();
      }
    }, 150));
  }

  function initScrollSpy() {
    if (__app.scrollSpyReady) return;
    __app.scrollSpyReady = true;

    var navLinks = document.querySelectorAll('.nav-link.c-nav__item');
    if (!navLinks.length) return;

    var sections = [];
    for (var i = 0; i < navLinks.length; i++) {
      var href = navLinks[i].getAttribute('href');
      if (href && href.charAt(0) === '#' && href.length > 1) {
        var section = document.getElementById(href.substring(1));
        if (section) {
          sections.push({ el: section, link: navLinks[i] });
        }
      }
    }

    if (!sections.length) return;

    function onScroll() {
      var scrollY = window.pageYOffset;
      var headerH = getHeaderHeight();
      var current = null;

      for (var j = 0; j < sections.length; j++) {
        var top = sections[j].el.getBoundingClientRect().top + scrollY - headerH - 10;
        if (scrollY >= top) {
          current = sections[j];
        }
      }

      for (var k = 0; k < sections.length; k++) {
        if (current && sections[k] === current) {
          sections[k].link.classList.add('is-active');
          sections[k].link.setAttribute('aria-current', 'page');
        } else {
          sections[k].link.classList.remove('is-active');
          sections[k].link.removeAttribute('aria-current');
        }
      }
    }

    window.addEventListener('scroll', throttle(onScroll, 100), { passive: true });
    onScroll();
  }

  function initAnchors() {
    if (__app.anchorsReady) return;
    __app.anchorsReady = true;

    var pathname = window.location.pathname;
    var isHome = pathname === '/' || //index.html$/.test(pathname);

    var links = document.querySelectorAll('a[href]');

    for (var i = 0; i < links.length; i++) {
      (function (link) {
        var href = link.getAttribute('href');
        if (!href) return;

        var isInPageAnchor = href.charAt(0) === '#' && href.length > 1 && href !== '#!';
        var isRootAnchor = href.indexOf('/#') === 0 && href.length > 2;

        if (!isHome && isInPageAnchor) {
          link.setAttribute('href', '/' + href);
          return;
        }

        if (isInPageAnchor) {
          link.addEventListener('click', function (e) {
            var targetId = href.substring(1);
            var target = document.getElementById(targetId);
            if (!target) return;
            e.preventDefault();
            var offset = getHeaderHeight();
            var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
          });
        }

        if (isRootAnchor && isHome) {
          link.addEventListener('click', function (e) {
            var hash = href.substring(2);
            var target = document.getElementById(hash);
            if (!target) return;
            e.preventDefault();
            var offset = getHeaderHeight();
            var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
          });
        }
      })(links[i]);
    }
  }

  function initActiveMenu() {
    if (__app.activeMenuReady) return;
    __app.activeMenuReady = true;

    var navLinks = document.querySelectorAll('.nav-link.c-nav__item');
    if (!navLinks.length) return;

    var pathname = window.location.pathname;
    var normalizedPath = pathname.replace(//index.html$/, '/').replace(//$/, '') || '/';

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') continue;

      var normalizedHref = href.replace(//index.html$/, '/').replace(//$/, '') || '/';
      var isMatch = normalizedPath === normalizedHref;

      if (
        (normalizedPath === '' || normalizedPath === '/') &&
        (normalizedHref === '' || normalizedHref === '/')
      ) {
        isMatch = true;
      }

      if (isMatch) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('is-active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('is-active');
      }
    }
  }

  function initScrollToTop() {
    if (__app.scrollToTopReady) return;
    __app.scrollToTopReady = true;

    var btn = document.getElementById('scroll-to-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'scroll-to-top';
      btn.className = 'c-scroll-top';
      btn.setAttribute('aria-label', 'Scroll to top');
      btn.setAttribute('type', 'button');
      btn.innerHTML = '&#8679;';
      document.body.appendChild(btn);
    }

    function updateVisibility() {
      if (window.pageYOffset > 300) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', throttle(updateVisibility, 150), { passive: true });
    updateVisibility();
  }

  function initProgressBars() {
    if (__app.progressBarsReady) return;
    __app.progressBarsReady = true;

    var bars = document.querySelectorAll('.c-progress-bar, .progress');
    if (!bars.length) return;

    function animateBar(bar) {
      var fill = bar.querySelector('.c-progress-bar__fill, .progress-bar, .c-progress__bar');
      var value = parseInt(bar.getAttribute('aria-valuenow'), 10);

      if (!fill || isNaN(value)) {
        if (!fill && bar.classList.contains('c-progress-bar')) {
          fill = document.createElement('div');
          fill.className = 'c-progress-bar__fill';
          bar.appendChild(fill);
        }
        if (!fill) return;
      }

      fill.style.width = value + '%';
    }

    var observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          animateBar(entries[i].target);
          observer.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.2 });

    for (var i = 0; i < bars.length; i++) {
      observer.observe(bars[i]);
    }
  }

  function initCountUp() {
    if (__app.countUpReady) return;
    __app.countUpReady = true;

    var statNumbers = document.querySelectorAll('.c-stat__number, [data-countup]');
    if (!statNumbers.length) return;

    function parseNumber(el) {
      var text = el.textContent.trim();
      var match = text.match(/[d,]+(.d+)?/);
      if (!match) return null;
      return parseFloat(match[0].replace(/,/g, ''));
    }

    function getSuffix(el) {
      var text = el.textContent.trim();
      return text.replace(/[d,.]+/, '').trim();
    }

    function animateCount(el, target, suffix) {
      var start = 0;
      var duration = 1800;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        el.textContent = current.toLocaleString() + (suffix ? suffix : '');
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target.toLocaleString() + (suffix ? suffix : '');
        }
      }

      requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          var el = entries[i].target;
          var target = parseNumber(el);
          var suffix = getSuffix(el);
          if (target !== null) {
            animateCount(el, target, suffix);
          }
          observer.unobserve(el);
        }
      }
    }, { threshold: 0.3 });

    for (var i = 0; i < statNumbers.length; i++) {
      observer.observe(statNumbers[i]);
    }
  }

  function showNotification(message, type) {
    type = type || 'success';
    var container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.setAttribute('role', 'alert');
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      container.className = 'c-toast-container';
      document.body.appendChild(container);
    }

    var toast = document.createElement('div');
    toast.className = 'c-toast c-toast--' + type;
    toast.setAttribute('role', 'alert');

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'c-toast__close';
    closeBtn.setAttribute('aria-label', 'Close notification');
    closeBtn.textContent = '\u00D7';

    var msgEl = document.createElement('span');
    msgEl.textContent = message;

    toast.appendChild(msgEl);
    toast.appendChild(closeBtn);
    container.appendChild(toast);

    toast.classList.add('is-visible');

    closeBtn.addEventListener('click', function () {
      toast.classList.remove('is-visible');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    });

    setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 5000);
  }

  __app.notify = showNotification;

  function validateEmail(val) {
    var re = /^[^s@]+@[^s@]+.[^s@]+$/;
    return re.test(val);
  }

  function validatePhone(val) {
    if (!val || val.trim() === '') return true;
    var re = /^[-ds+()]{7,20}$/;
    return re.test(val.trim());
  }

  function validateName(val) {
    return val && val.trim().length >= 2;
  }

  function validateMessage(val) {
    return val && val.trim().length >= 10;
  }

  function setFieldError(input, errorEl, message) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'flex';
    }
  }

  function clearFieldError(input, errorEl) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }

  function getErrorEl(input) {
    var describedBy = input.getAttribute('aria-describedby');
    if (describedBy) {
      var el = document.getElementById(describedBy);
      if (el) return el;
    }
    var parent = input.closest('.c-form__group, .form-group, .mb-3, .col-12, .col-md-6');
    if (parent) {
      return parent.querySelector('.c-form__error, .invalid-feedback');
    }
    return null;
  }

  function setSubmitting(btn, originalHTML) {
    btn.disabled = true;
    btn.innerHTML =
      '<span class="c-spinner" aria-hidden="true"></span> Sending\u2026';
    btn.setAttribute('aria-busy', 'true');
    return originalHTML;
  }

  function resetSubmit(btn, originalHTML) {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
    btn.removeAttribute('aria-busy');
  }

  function handleFormSubmit(form, validators) {
    var honeypot = form.querySelector('.c-honeypot, [name="website"], [name="hp"]');
    if (honeypot && honeypot.value.trim() !== '') return false;

    var timestamp = form.getAttribute('data-load-time');
    if (timestamp) {
      var elapsed = Date.now() - parseInt(timestamp, 10);
      if (elapsed < 3000) return false;
    }

    var valid = true;

    for (var i = 0; i < validators.length; i++) {
      var v = validators[i];
      var input = v.input;
      var errorEl = getErrorEl(input);

      if (!v.validate(input.value, input)) {
        setFieldError(input, errorEl, v.message);
        if (valid) {
          input.focus();
          valid = false;
        }
      } else {
        clearFieldError(input, errorEl);
      }
    }

    return valid;
  }

  function buildContactFormValidators(form) {
    var validators = [];

    var firstname = form.querySelector('#contact-firstname');
    if (firstname) {
      validators.push({
        input: firstname,
        validate: function (v) { return validateName(v); },
        message: 'Please enter your first name (at least 2 characters).'
      });
    }

    var lastname = form.querySelector('#contact-lastname');
    if (lastname) {
      validators.push({
        input: lastname,
        validate: function (v) { return validateName(v); },
        message: 'Please enter your last name (at least 2 characters).'
      });
    }

    var email = form.querySelector('#contact-email');
    if (email) {
      validators.push({
        input: email,
        validate: function (v) { return validateEmail(v); },
        message: 'Please enter a valid email address.'
      });
    }

    var phone = form.querySelector('#contact-phone');
    if (phone) {
      validators.push({
        input: phone,
        validate: function (v) { return validatePhone(v); },
        message: 'Please enter a valid phone number (digits, spaces, +, -, brackets; 7\u201320 characters).'
      });
    }

    var subject = form.querySelector('#contact-subject');
    if (subject) {
      validators.push({
        input: subject,
        validate: function (v) { return v && v.trim() !== '' && v !== ''; },
        message: 'Please select a subject.'
      });
    }

    var message = form.querySelector('#contact-message');
    if (message) {
      validators.push({
        input: message,
        validate: function (v) { return validateMessage(v); },
        message: 'Please enter a message with at least 10 characters.'
      });
    }

    var privacy = form.querySelector('#contact-privacy');
    if (privacy) {
      validators.push({
        input: privacy,
        validate: function (v, el) { return el.checked; },
        message: 'You must agree to the Privacy Policy.'
      });
    }

    return validators;
  }

  function buildServicesFormValidators(form) {
    var validators = [];

    var firstName = form.querySelector('#svc-first-name');
    if (firstName) {
      validators.push({
        input: firstName,
        validate: function (v) { return validateName(v); },
        message: 'Please enter your first name (at least 2 characters).'
      });
    }

    var lastName = form.querySelector('#svc-last-name');
    if (lastName) {
      validators.push({
        input: lastName,
        validate: function (v) { return validateName(v); },
        message: 'Please enter your last name (at least 2 characters).'
      });
    }

    var email = form.querySelector('#svc-email');
    if (email) {
      validators.push({
        input: email,
        validate: function (v) { return validateEmail(v); },
        message: 'Please enter a valid email address.'
      });
    }

    var phone = form.querySelector('#svc-phone');
    if (phone) {
      validators.push({
        input: phone,
        validate: function (v) { return validatePhone(v); },
        message: 'Please enter a valid phone number.'
      });
    }

    var service = form.querySelector('#svc-service');
    if (service) {
      validators.push({
        input: service,
        validate: function (v) { return v && v.trim() !== ''; },
        message: 'Please select a service.'
      });
    }

    var privacy = form.querySelector('#svc-privacy');
    if (privacy) {
      validators.push({
        input: privacy,
        validate: function (v, el) { return el.checked; },
        message: 'You must agree to the Privacy Policy.'
      });
    }

    return validators;
  }

  function buildGdprFormValidators(form) {
    var validators = [];

    var name = form.querySelector('#gdpr-name');
    if (name) {
      validators.push({
        input: name,
        validate: function (v) { return validateName(v); },
        message: 'Please enter your full name (at least 2 characters).'
      });
    }

    var email = form.querySelector('#gdpr-email');
    if (email) {
      validators.push({
        input: email,
        validate: function (v) { return validateEmail(v); },
        message: 'Please enter a valid email address.'
      });
    }

    var phone = form.querySelector('#gdpr-phone');
    if (phone) {
      validators.push({
        input: phone,
        validate: function (v) { return validatePhone(v); },
        message: 'Please enter a valid phone number.'
      });
    }

    var rightType = form.querySelector('#gdpr-right-type');
    if (rightType) {
      validators.push({
        input: rightType,
        validate: function (v) { return v && v.trim() !== ''; },
        message: 'Please select the type of request.'
      });
    }

    var message = form.querySelector('#gdpr-message');
    if (message) {
      validators.push({
        input: message,
        validate: function (v) { return validateMessage(v); },
        message: 'Please provide details (at least 10 characters).'
      });
    }

    var consent = form.querySelector('#gdpr-privacy-consent');
    if (consent) {
      validators.push({
        input: consent,
        validate: function (v, el) { return el.checked; },
        message: 'You must consent to the processing of your data.'
      });
    }

    return validators;
  }

  function attachFormHandler(form, validatorBuilder) {
    form.setAttribute('novalidate', '');
    form.setAttribute('data-load-time', Date.now().toString());

    var honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'website';
    honeypot.className = 'c-honeypot';
    honeypot.setAttribute('tabindex', '-1');
    honeypot.setAttribute('autocomplete', 'off');
    honeypot.setAttribute('aria-hidden', 'true');
    form.appendChild(honeypot);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopPropagation();

      var validators = validatorBuilder(form);
      var isValid = handleFormSubmit(form, validators);

      if (!isValid) return;

      var submitBtn = form.querySelector('[type="submit"]');
      var originalHTML = submitBtn ? submitBtn.innerHTML : '';

      if (submitBtn) {
        setSubmitting(submitBtn, originalHTML);
      }

      setTimeout(function () {
        if (submitBtn) {
          resetSubmit(submitBtn, originalHTML);
        }
        window.location.href = 'thank_you.html';
      }, 800);
    });
  }

  function initForms() {
    if (__app.formsReady) return;
    __app.formsReady = true;

    var contactForm = document.getElementById('contact-form');
    if (contactForm) {
      attachFormHandler(contactForm, buildContactFormValidators);
    }

    var servicesForm = document.getElementById('servicesContactForm');
    if (servicesForm) {
      attachFormHandler(servicesForm, buildServicesFormValidators);
    }

    var gdprForm = document.getElementById('gdprRequestForm');
    if (gdprForm) {
      attachFormHandler(gdprForm, buildGdprFormValidators);
    }
  }

  function initPrivacyModal() {
    if (__app.privacyModalReady) return;
    __app.privacyModalReady = true;

    var triggers = document.querySelectorAll('[data-modal="privacy"], .js-privacy-trigger');
    if (!triggers.length) return;

    var modal = document.getElementById('privacy-modal');
    var overlay = document.getElementById('modal-overlay');

    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'privacy-modal';
      modal.className = 'c-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Privacy Policy');

      var inner = document.createElement('div');
      inner.className = 'c-modal__inner';

      var header = document.createElement('div');
      header.className = 'c-modal__header';

      var title = document.createElement('h2');
      title.className = 'c-modal__title';
      title.textContent = 'Privacy Policy';

      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'c-modal__close';
      closeBtn.setAttribute('aria-label', 'Close Privacy Policy');
      closeBtn.textContent = '\u00D7';

      var body = document.createElement('div');
      body.className = 'c-modal__body';
      body.innerHTML = '<p>For full details, please visit our <a href="privacy.html">Privacy Policy page</a>.</p>';

      header.appendChild(title);
      header.appendChild(closeBtn);
      inner.appendChild(header);
      inner.appendChild(body);
      modal.appendChild(inner);
      document.body.appendChild(modal);

      closeBtn.addEventListener('click', closeModal);
    }

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'modal-overlay';
      overlay.className = 'c-modal-overlay';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', closeModal);
    }

    function openModal() {
      modal.classList.add('is-open');
      overlay.classList.add('is-active');
      document.body.classList.add('u-no-scroll');
      modal.focus();
    }

    function closeModal() {
      modal.classList.remove('is-open');
      overlay.classList.remove('is-active');
      document.body.classList.remove('u-no-scroll');
    }

    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.keyCode === 27) && modal.classList.contains('is-open')) {
        closeModal();
      }
    });

    for (var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    }
  }

  function initRipple() {
    if (__app.rippleReady) return;
    __app.rippleReady = true;

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.c-button, .btn');
      if (!btn) return;

      var ripple = document.createElement('span');
      ripple.className = 'c-ripple';

      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var x = e.clientX - rect.left - size / 2;
      var y = e.clientY - rect.top - size / 2;

      ripple.style.cssText =
        'width:' + size + 'px;' +
        'height:' + size + 'px;' +
        'left:' + x + 'px;' +
        'top:' + y + 'px;';

      btn.appendChild(ripple);

      setTimeout(function () {
        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
      }, 600);
    });
  }

  function initOfflineNotice() {
    if (__app.offlineReady) return;
    __app.offlineReady = true;

    window.addEventListener('offline', function () {
      showNotification('No internet connection. Please try again later.', 'error');
    });
  }

  function initPerformance() {
    if (__app.performanceReady) return;
    __app.performanceReady = true;

    window.addEventListener('touchstart', function () {}, { passive: true });
    window.addEventListener('touchmove', function () {}, { passive: true });
  }

  __app.init = function () {
    if (__app.initialized) return;
    __app.initialized = true;

    setNavHeightVar();
    initBurger();
    initAnchors();
    initActiveMenu();
    initScrollSpy();
    initScrollToTop();
    initProgressBars();
    initCountUp();
    initForms();
    initPrivacyModal();
    initRipple();
    initOfflineNotice();
    initPerformance();

    window.addEventListener('resize', debounce(function () {
      setNavHeightVar();
    }, 150));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', __app.init);
  } else {
    __app.init();
  }

})(window, document);

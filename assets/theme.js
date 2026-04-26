(function () {
  function markBound(node, key) {
    if (!node) return false;
    var attr = 'data-theme-bound-' + key;
    if (node.hasAttribute(attr)) return true;
    node.setAttribute(attr, 'true');
    return false;
  }

  function money(cents) {
    if (window.Shopify && typeof window.Shopify.formatMoney === 'function') {
      return window.Shopify.formatMoney(cents, window.theme.moneyFormat);
    }
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format((cents || 0) / 100);
  }

  function openDrawer() {
    var drawer = document.querySelector('[data-cart-drawer]');
    if (!drawer) return;
    drawer.hidden = false;
    requestAnimationFrame(function () {
      drawer.classList.add('is-open');
      document.body.classList.add('menu-open');
    });
  }

  function closeDrawer() {
    var drawer = document.querySelector('[data-cart-drawer]');
    if (!drawer) return;
    drawer.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    setTimeout(function () {
      if (!drawer.classList.contains('is-open')) drawer.hidden = true;
    }, 250);
  }

  function updateCartCount(count) {
    document.querySelectorAll('[data-cart-count]').forEach(function (node) {
      node.textContent = count;
    });
  }

  function bindMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('#site-nav');
    if (!toggle || !nav) return;
    if (markBound(toggle, 'menu-toggle')) return;

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    });

    nav.querySelectorAll('a').forEach(function (link) {
      if (markBound(link, 'menu-link')) return;
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        document.body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function bindHeroSlider() {
    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
      if (markBound(slider, 'hero-slider')) return;
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      if (slides.length < 2) return;
      var currentIndex = 0;
      var timer;

      function show(index) {
        currentIndex = index;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === currentIndex);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === currentIndex);
        });
      }

      function start() {
        timer = window.setInterval(function () {
          show((currentIndex + 1) % slides.length);
        }, 4500);
      }

      function reset() {
        window.clearInterval(timer);
        start();
      }

      dots.forEach(function (dot, index) {
        if (markBound(dot, 'hero-dot')) return;
        dot.addEventListener('click', function () {
          show(index);
          reset();
        });
      });

      slider.addEventListener('mouseenter', function () {
        window.clearInterval(timer);
      });
      slider.addEventListener('mouseleave', function () {
        start();
      });

      show(0);
      start();
    });
  }

  function renderDrawer(cart) {
    var body = document.querySelector('[data-cart-drawer-body]');
    var subtotal = document.querySelector('[data-cart-subtotal]');
    if (!body || !subtotal) return;

    updateCartCount(cart.item_count || 0);
    subtotal.textContent = money(cart.total_price || 0);

    if (!cart.items || !cart.items.length) {
      body.innerHTML = '<p>Your basket is ready for take-off.</p>';
      return;
    }

    body.innerHTML = cart.items.map(function (item) {
      var image = item.image ? '<img src="' + item.image + '" alt="' + item.product_title.replace(/"/g, '&quot;') + '">' : '<div class="cart-drawer__image-placeholder"></div>';
      var planInfo = item.selling_plan_allocation ? '<div class="summary-line">' + item.selling_plan_allocation.selling_plan.name + '</div>' : '';
      return '<div class="cart-drawer__item">'
        + '<div class="cart-drawer__image">' + image + '</div>'
        + '<div class="cart-drawer__copy">'
        + '<strong>' + item.product_title + '</strong>'
        + '<div class="summary-line">' + (item.variant_title && item.variant_title !== 'Default Title' ? item.variant_title : '') + '</div>'
        + planInfo
        + '<div class="summary-line">' + money(item.final_line_price) + '</div>'
        + '<div class="qty-controls qty-controls--drawer">'
        + '<button type="button" data-cart-change="' + item.key + '" data-cart-quantity="' + (item.quantity - 1) + '">−</button>'
        + '<span>' + item.quantity + '</span>'
        + '<button type="button" data-cart-change="' + item.key + '" data-cart-quantity="' + (item.quantity + 1) + '">+</button>'
        + '</div>'
        + '</div>'
        + '</div>';
    }).join('');
  }

  function fetchCart(openAfter) {
    return fetch(window.theme.routes.cart + '.js')
      .then(function (response) { return response.json(); })
      .then(function (cart) {
        renderDrawer(cart);
        if (openAfter) openDrawer();
      });
  }

  function bindCartDrawer() {
    if (markBound(document.documentElement, 'cart-drawer')) return;
    document.addEventListener('click', function (event) {
      var openTrigger = event.target.closest('[data-cart-open]');
      if (openTrigger) {
        event.preventDefault();
        fetchCart(true);
      }

      if (event.target.closest('[data-cart-close]')) {
        event.preventDefault();
        closeDrawer();
      }

      var changeTrigger = event.target.closest('[data-cart-change]');
      if (changeTrigger) {
        event.preventDefault();
        var body = new URLSearchParams();
        body.append('id', changeTrigger.getAttribute('data-cart-change'));
        body.append('quantity', changeTrigger.getAttribute('data-cart-quantity'));
        fetch(window.theme.routes.cartChange + '.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
          body: body.toString()
        })
          .then(function (response) { return response.json(); })
          .then(function (cart) { renderDrawer(cart); });
      }
    });
  }

  function bindProductForms() {
    document.querySelectorAll('.js-product-form').forEach(function (form) {
      if (markBound(form, 'product-form')) return;
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var submitButton = form.querySelector('[type="submit"]');
        if (submitButton) submitButton.disabled = true;
        fetch(window.theme.routes.cartAdd + '.js', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        })
          .then(function (response) {
            if (!response.ok) throw new Error('Cart add failed');
            return response.json();
          })
          .then(function () { return fetchCart(true); })
          .catch(function () {
            form.submit();
          })
          .finally(function () {
            if (submitButton) submitButton.disabled = false;
          });
      });
    });
  }

  function bindVariantSelectors() {
    document.querySelectorAll('[data-product-section]').forEach(function (section) {
      var selector = section.querySelector('[data-variant-select]');
      var price = section.querySelector('[data-product-price]');
      var compare = section.querySelector('[data-product-compare]');
      if (!selector) return;
      if (markBound(selector, 'variant-select')) return;

      selector.addEventListener('change', function () {
        var option = selector.options[selector.selectedIndex];
        if (!option) return;
        if (price) price.textContent = option.getAttribute('data-price');
        if (compare) {
          compare.textContent = option.getAttribute('data-compare-price') || '';
          compare.hidden = !option.getAttribute('data-compare-price');
        }
      });
    });
  }

  function initTheme() {
    bindMenu();
    bindHeroSlider();
    bindCartDrawer();
    bindProductForms();
    bindVariantSelectors();
    updateCartCount(parseInt(document.body.getAttribute('data-cart-count') || '0', 10) || 0);
  }

  window.ROAMSOME_THEME_INIT = initTheme;

  document.addEventListener('DOMContentLoaded', initTheme);
})();

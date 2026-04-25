(function () {
  const data = window.ROAMSOME_DATA || { plans: [], meals: [], testimonials: [], faqs: [] };
  const storageKey = "roamsome-cart";
  const deliveryFee = 4.95;
  const navItems = [
    ["Home", "index.html"],
    ["Shop", "shop.html"],
    ["How It Works", "how-it-works.html"],
    ["About", "about.html"],
    ["Menu", "menu.html"],
    ["FAQ", "faq.html"],
    ["Contact", "contact.html"]
  ];

  function getPageFile() {
    const path = window.location.pathname.split("/").pop();
    return path || "index.html";
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP"
    }).format(value);
  }

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch (error) {
      return [];
    }
  }

  function setCart(cart) {
    localStorage.setItem(storageKey, JSON.stringify(cart));
    updateCartCount();
  }

  function getPlanById(planId) {
    return data.plans.find((plan) => plan.id === planId) || data.plans[1] || data.plans[0];
  }

  function buildPurchaseOptions(plan) {
    return [
      {
        id: "weekly",
        title: "Weekly Subscription",
        savings: "SAVE £8.00",
        price: Math.max(plan.price - 8, 1),
        note: "Deliver every week"
      },
      {
        id: "bi-weekly",
        title: "Bi-Weekly Subscription",
        savings: "SAVE £5.00",
        price: Math.max(plan.price - 5, 1),
        note: "Deliver every 2 weeks"
      },
      {
        id: "monthly",
        title: "Monthly Subscription",
        savings: "",
        price: plan.price,
        note: "Deliver every month"
      }
    ];
  }

  function addToCart(planId, quantity, purchaseOption) {
    const cart = getCart();
    const optionId = purchaseOption && purchaseOption.id ? purchaseOption.id : "standard";
    const existing = cart.find((item) => item.id === planId && (item.purchaseOptionId || "standard") === optionId);
    const qty = Math.max(1, Number(quantity) || 1);

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({
        id: planId,
        quantity: qty,
        purchaseOptionId: optionId,
        purchaseOptionTitle: purchaseOption ? purchaseOption.title : null,
        purchaseOptionPrice: purchaseOption ? purchaseOption.price : null,
        purchaseOptionNote: purchaseOption ? purchaseOption.note : null
      });
    }

    setCart(cart);
  }

  function updateItemQuantity(planId, delta) {
    const cart = getCart()
      .map((item) => {
        if (item.id === planId) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    setCart(cart);
  }

  function cartTotals() {
    const cart = getCart();
    const items = cart.map((entry) => {
      const plan = getPlanById(entry.id);
      const unitPrice = typeof entry.purchaseOptionPrice === "number" ? entry.purchaseOptionPrice : plan.price;
      return {
        ...entry,
        plan,
        unitPrice,
        lineTotal: unitPrice * entry.quantity
      };
    });
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const shipping = items.length ? deliveryFee : 0;
    const total = subtotal + shipping;
    return { items, subtotal, shipping, total };
  }

  function updateCartCount() {
    const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll("[data-cart-count]").forEach((node) => {
      node.textContent = count;
    });
  }

  function buildHeader() {
    const headerMount = document.querySelector("[data-site-header]");
    if (!headerMount) return;

    const current = getPageFile();
    headerMount.innerHTML = `
      <header class="site-header">
        <div class="header-inner">
          <a class="brand-mark brand-mark-header" href="index.html" aria-label="ROAMSOME home">
            <img src="header-logo.png" alt="ROAMSOME">
          </a>
          <nav class="nav-links" id="site-nav">
            ${navItems
              .map(
                ([label, href]) =>
                  `<a href="${href}" class="${current === href ? "active" : ""}">${label}</a>`
              )
              .join("")}
          </nav>
          <div class="header-actions">
            <a class="cart-link" href="cart.html" aria-label="View cart">
              <span>🧺</span>
              <span class="cart-count" data-cart-count>0</span>
            </a>
            <a class="btn" href="shop.html">Subscribe Now</a>
            <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-menu-toggle>☰</button>
          </div>
        </div>
      </header>
    `;

    const toggle = headerMount.querySelector("[data-menu-toggle]");
    const nav = headerMount.querySelector("#site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
        document.body.classList.toggle("menu-open", open);
      });

      nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          nav.classList.remove("open");
          document.body.classList.remove("menu-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  function buildFooter() {
    const footerMount = document.querySelector("[data-site-footer]");
    if (!footerMount) return;
    footerMount.innerHTML = `
      <footer class="footer">
        <div class="container footer-grid">
          <div class="footer-meta">
            <a class="brand-mark brand-mark-footer" href="index.html" aria-label="ROAMSOME home">
              <img src="footer-logo.png" alt="ROAMSOME">
            </a>
            <p>Travel-inspired meal kits for curious UK kitchens. Premium ingredients, globally inspired recipes, and flexible weekly delivery.</p>
            <div class="trust-points">
              <span class="mini-pill">Limited weekly deliveries</span>
              <span class="mini-pill">Pause or cancel anytime</span>
            </div>
          </div>
          <div class="footer-links">
            <h4>Explore</h4>
            <a href="shop.html">Subscription Plans</a>
            <a href="menu.html">Weekly Menu</a>
            <a href="how-it-works.html">How It Works</a>
            <a href="about.html">About</a>
          </div>
          <div class="footer-links">
            <h4>Contact</h4>
            <a href="tel:+442012345678">+44 20 1234 5678</a>
            <a href="mailto:hello@roamsome.co.uk">hello@roamsome.co.uk</a>
            <a href="faq.html">FAQs</a>
            <a href="contact.html">Get in touch</a>
          </div>
        </div>
      </footer>
    `;
  }

  function buildStickySubscribe() {
    const mount = document.querySelector("[data-sticky-subscribe]");
    if (!mount) return;
    mount.innerHTML = `<div class="sticky-subscribe"><a class="btn" href="shop.html">Subscribe Now</a></div>`;
  }

  function renderPlans(selector, options) {
    const mount = document.querySelector(selector);
    if (!mount) return;
    const featuredId = options && options.featuredId;
    const showImages = Boolean(options && options.showImages);
    mount.innerHTML = data.plans
      .map((plan) => {
        const isFeatured = plan.id === featuredId;
        return `
          <article class="plan-card ${isFeatured ? "plan-highlight" : ""}">
            ${showImages ? `<div class="meal-image plan-card-image" style="background-image:url('${plan.image}')"></div>` : ""}
            <span class="plan-badge">${plan.badge}</span>
            <div class="kicker">${plan.highlight}</div>
            <h3>${plan.title}</h3>
            <p>${plan.description}</p>
            <div class="price"><strong>${formatMoney(plan.price)}</strong><span>/ week</span></div>
            <div class="mini-points">
              <span class="mini-pill">${plan.mealsPerWeek} meals</span>
              <span class="mini-pill">${plan.servings}</span>
            </div>
            <ul>
              ${plan.included.map((item) => `<li>${item}</li>`).join("")}
            </ul>
            <div class="inline-actions">
              <a class="btn" href="product.html?plan=${plan.id}">View Plan</a>
              <button class="btn" type="button" data-add-plan="${plan.id}">Add to Cart</button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderRelatedPlansMarkup(currentPlanId, heading, intro) {
    const relatedPlans = data.plans.filter((item) => item.id !== currentPlanId).slice(0, 2);
    return `
      <section class="product-related">
        <div class="section-heading">
          <span class="eyebrow">Related products</span>
          <h2>${heading}</h2>
          <p>${intro}</p>
        </div>
        <div class="plans-grid">
          ${relatedPlans
            .map(
              (item) => `
                <article class="plan-card">
                  <div class="meal-image" style="background-image:url('${item.image}')"></div>
                  <div class="kicker">${item.highlight}</div>
                  <h3>${item.title}</h3>
                  <p>${item.description}</p>
                  <div class="price"><strong>${formatMoney(item.price)}</strong><span>/ week</span></div>
                  <div class="mini-points">
                    <span class="mini-pill">${item.mealsPerWeek} meals</span>
                    <span class="mini-pill">${item.servings}</span>
                  </div>
                  <div class="inline-actions">
                    <a class="btn" href="product.html?plan=${item.id}">View Product</a>
                    <a class="btn" href="checkout.html?plan=${item.id}">Subscribe</a>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderMeals(selector, limit) {
    const mount = document.querySelector(selector);
    if (!mount) return;
    mount.innerHTML = data.meals
      .slice(0, limit || data.meals.length)
      .map(
        (meal) => `
          <article class="meal-card">
            <div class="meal-image" style="background-image:url('${meal.image}')"></div>
            <div class="card-body">
              <div class="kicker">${meal.flag} ${meal.country}</div>
              <h3>${meal.title}</h3>
              <p>${meal.description}</p>
              <div class="tag-list">
                ${meal.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
              </div>
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderTestimonials(selector) {
    const mount = document.querySelector(selector);
    if (!mount) return;
    const cards = data.testimonials
      .map(
        (item) => `
          <article class="testimonial-card testimonial-slide">
            <div class="rating">★★★★★</div>
            <p>“${item.quote}”</p>
            <div class="testimonial-footer">${item.name} <span class="summary-line">• ${item.location}</span></div>
          </article>
        `
      )
      .join("");
    mount.innerHTML = `
      <div class="testimonial-marquee">
        <div class="testimonial-track">
          ${cards}
          ${cards}
        </div>
      </div>
    `;
  }

  function renderFaqs(selector, count) {
    const mount = document.querySelector(selector);
    if (!mount) return;
    mount.innerHTML = data.faqs
      .slice(0, count || data.faqs.length)
      .map(
        (item) => `
          <article class="faq-item">
            <h3>${item.question}</h3>
            <p>${item.answer}</p>
          </article>
        `
      )
      .join("");
  }

  function renderProductPage() {
    const mount = document.querySelector("[data-product-detail]");
    if (!mount) return;
    const params = new URLSearchParams(window.location.search);
    const plan = getPlanById(params.get("plan"));
    const mealPreview = data.meals.slice(0, Math.max(3, plan.mealsPerWeek));
    const purchaseOptions = buildPurchaseOptions(plan);
    const defaultOption = purchaseOptions[0];

    mount.innerHTML = `
      <div class="product-page-stack">
        <div class="product-layout">
          <div class="product-main-column">
            <article class="detail-card product-image-card">
              <div class="meal-image" style="aspect-ratio: 4 / 2.9; border-radius: 24px; background-image:url('${plan.image}')"></div>
            </article>
            <div class="product-info-stack">
              <article class="summary-card">
                <h3>What's included</h3>
                <ul class="detail-list">
                  ${plan.included.map((item) => `<li>${item}</li>`).join("")}
                </ul>
              </article>
              <article class="summary-card">
                <h3>Delivery details</h3>
                <p>${plan.delivery}</p>
                <div class="mini-points">
                  <span class="mini-pill">Tracked UK delivery</span>
                  <span class="mini-pill">Chilled packaging</span>
                </div>
              </article>
              <article class="summary-card">
                <h3>Chef tips</h3>
                <p>Each plan includes chef notes for plating, pantry swaps and finishing touches so home cooking still feels refined and destination-led.</p>
              </article>
              <article class="summary-card">
                <h3>Weekly meal preview</h3>
                <div class="summary-list">
                  ${mealPreview
                    .map(
                      (meal) => `
                        <div class="summary-row">
                          <span>${meal.flag} ${meal.title}</span>
                          <span>${meal.country}</span>
                        </div>
                      `
                    )
                    .join("")}
                </div>
              </article>
            </div>
          </div>
          <article class="detail-card product-purchase-card">
            <div class="kicker">${plan.accent} inspired</div>
            <h1>${plan.title}</h1>
            <p>${plan.description}</p>
            <div class="price"><strong data-product-price>${formatMoney(defaultOption.price)}</strong><span data-product-price-note>/ ${defaultOption.note.replace("Deliver ", "").toLowerCase()}</span></div>
            <div class="tag-list">
              <span class="tag">${plan.mealsPerWeek} meals per week</span>
              <span class="tag">${plan.servings}</span>
              <span class="tag">Pause or cancel anytime</span>
            </div>
            <div class="purchase-panel">
              <div class="purchase-header">
                <div class="qty-controls" data-product-qty>
                  <button type="button" data-product-qty-change="-1">−</button>
                  <span data-product-qty-value>1</span>
                  <button type="button" data-product-qty-change="1">+</button>
                </div>
                <div>
                  <strong>Purchase options</strong>
                  <div class="summary-line">Powered by Seal Subscriptions</div>
                </div>
              </div>
              <div class="purchase-options">
                ${purchaseOptions
                  .map(
                    (option, optionIndex) => `
                      <label class="purchase-option ${optionIndex === 0 ? "is-selected" : ""}">
                        <input type="radio" name="purchase-option" value="${option.id}" ${optionIndex === 0 ? "checked" : ""}>
                        <span class="purchase-option-copy">
                          <span class="purchase-option-title-row">
                            <span class="purchase-option-title">${option.title}</span>
                            ${option.savings ? `<span class="purchase-option-badge">${option.savings}</span>` : ""}
                            <span class="purchase-option-price">${formatMoney(option.price)}</span>
                          </span>
                          <span class="purchase-option-note">${option.note}</span>
                        </span>
                      </label>
                    `
                  )
                  .join("")}
              </div>
              <button class="btn purchase-cta" type="button" data-add-product="${plan.id}">Add to Cart</button>
            </div>
            <div class="inline-actions">
              <a class="btn-secondary" href="checkout.html?plan=${plan.id}">Subscribe Now</a>
            </div>
          </article>
        </div>
        ${renderRelatedPlansMarkup(plan.id, "You may also like", "Explore other ROAMSOME subscription plans while you’re here.")}
      </div>
    `;

    const priceNode = mount.querySelector("[data-product-price]");
    const noteNode = mount.querySelector("[data-product-price-note]");
    const qtyValueNode = mount.querySelector("[data-product-qty-value]");
    const optionInputs = Array.from(mount.querySelectorAll("input[name='purchase-option']"));
    const optionCards = Array.from(mount.querySelectorAll(".purchase-option"));
    const addButton = mount.querySelector("[data-add-product]");
    let quantity = 1;
    let activeOption = defaultOption;

    function syncProductPanel() {
      if (priceNode) priceNode.textContent = formatMoney(activeOption.price);
      if (noteNode) noteNode.textContent = `/ ${activeOption.note.replace("Deliver ", "").toLowerCase()}`;
      if (qtyValueNode) qtyValueNode.textContent = String(quantity);
      optionCards.forEach((card, index) => {
        card.classList.toggle("is-selected", purchaseOptions[index].id === activeOption.id);
      });
      if (addButton) {
        addButton.textContent = `Add ${activeOption.title} to Cart`;
      }
    }

    optionInputs.forEach((input) => {
      input.addEventListener("change", () => {
        activeOption = purchaseOptions.find((option) => option.id === input.value) || defaultOption;
        syncProductPanel();
      });
    });

    mount.querySelectorAll("[data-product-qty-change]").forEach((button) => {
      button.addEventListener("click", () => {
        quantity = Math.max(1, quantity + Number(button.getAttribute("data-product-qty-change")));
        syncProductPanel();
      });
    });

    if (addButton) {
      addButton.addEventListener("click", () => {
        addToCart(plan.id, quantity, activeOption);
        window.location.href = `checkout.html?plan=${plan.id}`;
      });
    }

    syncProductPanel();
  }

  function renderCartPage() {
    const list = document.querySelector("[data-cart-items]");
    const summary = document.querySelector("[data-cart-summary]");
    if (!list || !summary) return;

    const totals = cartTotals();

    if (!totals.items.length) {
      list.innerHTML = `
        <article class="summary-card">
          <h3>Your basket is ready for take-off</h3>
          <p>Add a subscription plan to start your weekly food journey.</p>
          <a class="btn" href="shop.html">Browse Plans</a>
        </article>
      `;
      summary.innerHTML = `
        <article class="summary-card">
          <h3>Order summary</h3>
          <p>No items yet.</p>
        </article>
      `;
      return;
    }

    list.innerHTML = `
      <article class="summary-card">
        <h3>Your cart</h3>
        <div class="cart-list">
          ${totals.items
            .map(
              (item) => `
                <div class="order-item">
                  <div class="icon-badge">🍽️</div>
                  <div>
                    <strong>${item.plan.title}</strong>
                    <div class="summary-line">${item.plan.mealsPerWeek} meals • ${item.plan.servings}</div>
                    <div class="summary-line">${item.purchaseOptionTitle || "Standard purchase"}</div>
                    <div class="summary-line">${formatMoney(item.unitPrice)} each</div>
                  </div>
                  <div>
                    <div class="qty-controls">
                      <button type="button" data-qty="${item.plan.id}" data-delta="-1">−</button>
                      <span>${item.quantity}</span>
                      <button type="button" data-qty="${item.plan.id}" data-delta="1">+</button>
                    </div>
                    <div style="margin-top:10px; text-align:right; font-weight:700;">${formatMoney(item.lineTotal)}</div>
                  </div>
                </div>
              `
            )
            .join("")}
        </div>
      </article>
    `;

    summary.innerHTML = `
      <article class="summary-card">
        <h3>Order summary</h3>
        <div class="summary-row"><span>Subtotal</span><strong>${formatMoney(totals.subtotal)}</strong></div>
        <div class="summary-row"><span>Chilled delivery</span><strong>${formatMoney(totals.shipping)}</strong></div>
        <div class="summary-row total"><span>Total</span><strong>${formatMoney(totals.total)}</strong></div>
        <ul class="check-list" style="margin:18px 0 22px;">
          <li>Limited weekly deliveries</li>
          <li>Pause or cancel anytime</li>
          <li>Secure payment at checkout</li>
        </ul>
        <a class="btn" href="checkout.html">Continue to Checkout</a>
      </article>
    `;
  }

  function renderCheckoutPage() {
    const form = document.querySelector("[data-checkout-form]");
    const summary = document.querySelector("[data-checkout-summary]");
    const relatedMount = document.querySelector("[data-checkout-related]");
    if (!form || !summary) return;

    const params = new URLSearchParams(window.location.search);
    const planParam = params.get("plan");
    if (planParam && !getCart().length) {
      addToCart(planParam, 1);
    }

    const totals = cartTotals();
    const relatedPlanId = planParam || (totals.items[0] && totals.items[0].plan.id);

    summary.innerHTML = `
      <article class="summary-card">
        <h3>Order summary</h3>
        <div class="summary-list">
          ${totals.items
            .map(
              (item) => `
                <div class="summary-row">
                  <span>${item.plan.title} × ${item.quantity}</span>
                  <strong>${formatMoney(item.lineTotal)}</strong>
                </div>
              `
            )
            .join("")}
        </div>
        <div class="summary-row"><span>Delivery</span><strong>${formatMoney(totals.shipping)}</strong></div>
        <div class="summary-row total"><span>Total</span><strong>${formatMoney(totals.total)}</strong></div>
        <div class="payment-strip">
          <span>Visa</span>
          <span>Mastercard</span>
          <span>Apple Pay</span>
          <span>PayPal</span>
        </div>
      </article>
    `;

    if (relatedMount && relatedPlanId) {
      relatedMount.innerHTML = renderRelatedPlansMarkup(
        relatedPlanId,
        "You might also like",
        "Add another ROAMSOME route to your next delivery."
      );
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const success = document.querySelector("[data-checkout-success]");
      if (success) {
        success.classList.remove("hidden");
      }
      setCart([]);
      form.reset();
      window.scrollTo({ top: 0, behavior: "smooth" });
      summary.innerHTML = `
        <article class="summary-card">
          <h3>Order confirmed</h3>
          <p>Your first ROAMSOME box is reserved. Confirmation and delivery timing will be sent to your email shortly.</p>
          <a class="btn" href="menu.html">See next week’s menu</a>
        </article>
      `;
    });
  }

  function bindGlobalActions() {
    document.addEventListener("click", (event) => {
      const addButton = event.target.closest("[data-add-plan]");
      if (addButton) {
        const planId = addButton.getAttribute("data-add-plan");
        addToCart(planId, 1);
        window.location.href = `checkout.html?plan=${planId}`;
      }

      const qtyButton = event.target.closest("[data-qty]");
      if (qtyButton) {
        updateItemQuantity(qtyButton.getAttribute("data-qty"), Number(qtyButton.getAttribute("data-delta")));
        renderCartPage();
        renderCheckoutPage();
      }
    });

    document.querySelectorAll("[data-newsletter-form], [data-contact-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const success = form.parentElement.querySelector(".success-message");
        if (success) {
          success.classList.remove("hidden");
        }
        form.reset();
      });
    });
  }

  function renderHomeHighlights() {
    renderPlans("[data-home-plans]", { featuredId: "voyager", showImages: true });
    renderMeals("[data-home-meals]", 3);
    renderTestimonials("[data-home-testimonials]");
  }

  function initHeroSlider() {
    const slider = document.querySelector("[data-hero-slider]");
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) return;

    let currentIndex = 0;
    let timerId;

    function showSlide(index) {
      currentIndex = index;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === currentIndex);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === currentIndex);
      });
    }

    function startAutoPlay() {
      timerId = window.setInterval(() => {
        showSlide((currentIndex + 1) % slides.length);
      }, 4500);
    }

    function resetAutoPlay() {
      window.clearInterval(timerId);
      startAutoPlay();
    }

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => {
        showSlide(dotIndex);
        resetAutoPlay();
      });
    });

    slider.addEventListener("mouseenter", () => window.clearInterval(timerId));
    slider.addEventListener("mouseleave", startAutoPlay);

    showSlide(0);
    startAutoPlay();
  }

  function initPages() {
    renderHomeHighlights();
    renderPlans("[data-shop-plans]", { featuredId: "voyager" });
    renderMeals("[data-menu-grid]");
    renderFaqs("[data-faq-grid]");
    renderFaqs("[data-home-faq]", 3);
    renderTestimonials("[data-testimonial-grid]");
    renderProductPage();
    renderCartPage();
    renderCheckoutPage();
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildHeader();
    buildFooter();
    buildStickySubscribe();
    updateCartCount();
    bindGlobalActions();
    initPages();
    initHeroSlider();
  });
})();

/**
 * Component: Card Domain Product
 * ------------------------------------------------------------------------------
 * A snippet displaying correct product card images based on active swatch.
 * 
 * Assumptions:
 * Secondary image will always be suffixed with -secondary
 */


// Set DOM selectors
const selectors = {
  card: '[js-card-product="container"]',
  swatch: '[js-card-product="swatch"]',
  swatches: '[js-card-product="swatches"]',
  thumbnailContainer: '[js-card-product="thumbnailContainer"]',
  price: '[js-card-product="price"]',
  sale: '[js-card-product="sale"]',
  productLink: '[js-card-product-link]'
}

let nodeSelectors;

/**
 * Store DOM elements
 */
function cacheSelectors() {
  nodeSelectors = {
    card: [...document.querySelectorAll(selectors.card)],
    swatch: [...document.querySelectorAll(selectors.swatch)],
    swatches: [...document.querySelectorAll(selectors.swatches)]
  };
}

/**
 * Bind event listeners
 */
function setEventListeners() {
  nodeSelectors.swatches.forEach((element) => {
    element.addEventListener('click', handleSwatchSelection);
  });

  nodeSelectors.swatch.forEach((element) => {
    element.addEventListener('mouseenter', handlePreviewSwatch);
    element.addEventListener('mouseleave', handleDefaultSwatch);
  })
}

/**
 * Handle swatch selection
 * @param {Event} event - mouse event.
 */
function handleSwatchSelection(event) {
  const swatch = event.target.closest(selectors.swatch);

  if (swatch) {
    setActiveSwatch(swatch);
    updateCardImage(swatch)
    updateCardLinks(swatch)
    updateCardPrice(swatch)
    swatch.classList.add('is-active');
  }
}

/**
 * Handle swatch hover event
 * @param {Event} event - mouse event.
 */
function handlePreviewSwatch(event) {
  const swatch = event.target.closest(selectors.swatch);
  
  if (!swatch) {
    return;
  }

  updateCardImage(swatch)
}

/**
 * Sets default swatch
 * @param {Event} event - mouse event.
 */
function handleDefaultSwatch(event) {
  const swatches = event.target.closest(selectors.swatches);
  const active = getActiveSwatch(swatches);

  if (!active) {
    return
  }

  updateCardImage(active)
}

/**
 * Sets active swatch button
 * @param {Element} swatches - swatch parent container.
 * @returns {Element} active swatch elment
 */
function getActiveSwatch(swatches) {
  const active = swatches.querySelector(`${selectors.swatch}.is-active`);
  return active;
}

/**
 * Sets active swatch button
 * @param {Element} swatch - swatch button.
 */
function setActiveSwatch(swatch) {
  const swatches = swatch.closest(selectors.swatches);
  const active = getActiveSwatch(swatches);

  if (active) { active.classList.remove('is-active'); }

  swatch.classList.add('is-active');
}

/**
 * Update product card link to deeplink into product variant
 * @param {Element} swatch - product swatch.
 */
function updateCardLinks(swatch) {
  const productCard = swatch.closest(selectors.card);
  const links = productCard.querySelectorAll(selectors.productLink);

  [...links].forEach((link) => {
    link.href = swatch.dataset.href;
  });

}

/**
 * Update product card price
 * @param {Element} swatch - product swatch.
 */
function updateCardPrice(swatch) {
  const productCard = swatch.closest(selectors.card);
  const productCardPrice = productCard.querySelector(selectors.price);
  const variantPrice = swatch.dataset.variantPrice;
  const variantCompareAt = swatch.dataset.variantComparePrice;

  productCardPrice.innerHTML = constructPriceTemplate(variantPrice, variantCompareAt);
  handleSaleBadge(productCard, variantCompareAt && variantCompareAt > variantPrice);
}

/**
 * Handles hiding and showing sale badge based on variant cost
 * @param {Element} card - product card.
 * @param {Boolean} saleStatus - product sale status.
 * @returns {HTML}
 */
function handleSaleBadge(card, saleStatus) {
  const saleBadge = card.querySelector(selectors.sale);

  if(!saleBadge) {
    return;
  }

  if(!saleStatus) {
    saleBadge.style.display = 'none';
    return;
  }

  saleBadge.style.display = 'block';
}

/**
 * Build price template to inject when variant is selected
 * @param {Number} variantPrice - cost of variant.
 * @param {Number} variantCompareAt - original cost of variant.
 * @returns {HTML}
 */
function constructPriceTemplate(variantPrice, variantCompareAt) {
  return variantCompareAt && variantCompareAt > variantPrice ?
  `<div class="price  price--on-sale">
    <div class="price__container">
      <div class="price__regular"><span class="visually-hidden visually-hidden--inline">Regular price</span>
        <span class="price-item price-item--regular text-[14px] leading-[16px]">
          ${Shopify.formatMoney(variantPrice)}
        </span>
      </div>
      <div class="price__sale">
        <span class="visually-hidden visually-hidden--inline">Regular price</span>
        <span>
          <s class="price-item price-item--regular text-[14px] leading-[16px]">
            ${Shopify.formatMoney(variantCompareAt)}
          </s>
        </span>
        <span class="visually-hidden visually-hidden--inline">Sale price</span>
        <span class="price-item price-item--sale price-item--last text-[14px] leading-[16px]">
          ${Shopify.formatMoney(variantCompareAt)}
        </span>
      </div>
    </div>
  </div>`
  : `<div class="price">
      <div class="price__container"><div class="price__regular"><span class="visually-hidden visually-hidden--inline">Regular price</span>
          <span class="price-item price-item--regular text-[14px] leading-[16px]">
            ${Shopify.formatMoney(variantPrice)}
          </span>
      </div>
    </div>
  </div>`;
}

/**
 * Updates the product card image based off swatch selection
 * @param {Element} swatch - swatch button.
 */
function updateCardImage(swatch) {
  const productCard = swatch.closest(selectors.card);
  const thumbnail = productCard.querySelector('[js-card-product="mainImage"]');
  const secondary = productCard.querySelector('[js-card-product="secondaryImage"]');
  const newSwatchValue =  swatch.dataset.value.toLowerCase()

  const newImage = swatch.dataset.variantImage;
  const newSecondaryImage = swatch.dataset.variantSecondImage;

  if (!newImage) {
    return;
  }

  thumbnail.srcset = replaceFilename(thumbnail.srcset, newSwatchValue)
  thumbnail.src = newImage;
  thumbnail.dataset.src = newImage;

  secondary.srcset = replaceFilename(secondary.srcset, `${newSwatchValue}-secondary`);
  secondary.src = newSecondaryImage;
  secondary.dataset.src = newSecondaryImage;
}

/**
 * Replace filename inside of url string
 * @param {String} url - thumbnail url.
 * @param {String} newFilename - expected new filename.
 * @returns {String}
 */
function replaceFilename(url, newFilename) {
  return url.replace(/\/([^\/]+)\.(\w+)(?=\?|\#|$)/, `/${newFilename}.$2`);
}


/**
 * Set initial configurations
 */
document.addEventListener('DOMContentLoaded', () => {
  cacheSelectors()
  setEventListeners();
});

var Shopify = Shopify || {};

/**
 * Shopify format price function (lifted from shopify utilities)
 */
Shopify.money_format = "${{amount}}";
Shopify.formatMoney = function(cents, format) {
  if (typeof cents == 'string') { cents = cents.replace('.',''); }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || this.money_format);

  function defaultOption(opt, def) {
     return (typeof opt == 'undefined' ? def : opt);
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal   = defaultOption(decimal, '.');

    if (isNaN(number) || number == null) { return 0; }

    number = (number/100.0).toFixed(precision);

    var parts   = number.split('.'),
        dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
        cents   = parts[1] ? (decimal + parts[1]) : '';

    return dollars + cents;
  }

  switch(formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
};

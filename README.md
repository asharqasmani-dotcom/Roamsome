# ROAMSOME Shopify Theme

## How to zip the theme
1. Open `/Users/bstar/Documents/New project/shopify-theme`.
2. Select all folders and files inside `shopify-theme`.
3. Compress them into a `.zip` file. The zip should contain `layout/`, `templates/`, `sections/`, `snippets/`, `assets/`, `config/`, and `locales/` at the root.

## How to upload it to Shopify
1. In Shopify Admin, go to `Online Store -> Themes`.
2. Click `Add theme -> Upload zip file`.
3. Upload the zip you created from this folder.
4. After upload, click `Customize` to connect menus, collections, blog content, and page templates.

## Shopify content to create
- Products: create the subscription products you want to sell.
- Collections: create at least one featured collection for homepage and shop sections.
- Blog: create a blog for ROAMSOME stories and add articles so the homepage/blog templates populate.
- Pages: create pages for About, Contact, FAQ, Destinations, Shop, Privacy Policy, Terms, and Shipping / Returns.
- Menus: assign your main navigation menu in the Header section and footer menus in the Footer section.

## Recommended product data
- Product images for cards and product galleries.
- Product descriptions for the product detail section.
- Optional custom metafields for richer cards:
  - `custom.highlight`
  - `custom.badge`
  - `custom.short_description`
  - `custom.meals_per_week`
  - `custom.servings`

## Subscription / selling plan setup
- The product form already supports Shopify selling plans through `product.selling_plan_groups`.
- Install and configure a subscription app that uses Shopify native selling plans.
- Assign selling plans to the relevant products in Shopify Admin or through your subscription app.
- Once selling plans exist on a product, the product template will show a subscription selector automatically.

## Theme customizer usage
- Homepage sections are editable through the Shopify theme customizer.
- Header and footer use Shopify menus and theme settings.
- Featured products are powered by the collection chosen in the `Featured collection` section.
- Blog previews are powered by the blog chosen in the `Blog preview` section.
- Page templates can be assigned per page in Shopify Admin so the design matches the original site structure.

## Suggested page template assignments
- About page -> `page.about`
- Contact page -> `page.contact`
- FAQ page -> `page.faq`
- Destinations page -> `page.destinations`
- Shop page -> `page.shop`
- How It Works page -> `page.how-it-works`
- Policy pages -> default `page`

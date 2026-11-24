# Keep content easy to find

For the agent. A person asks for a change in their own words ("the dealers in Tashkent", "the prices section",
"the photo under About"). The next agent must find that place in seconds, without reading whole pages. Build
every page so that it can, and keep it that way on every change.

## Find before you read

1. The site's map with some words (`node scripts/map.mjs "<words>"` in most sites): every place those words appear in the sources, with the file, the line and the
   section it sits in. It never points into `site/public/`: those pages are built, and a change there is lost. Search for the visible text, in the page's language. For a request in another language,
   look the words up in the site's **Words people use** table first.
2. The map with no words: the whole site at a glance: every page, its title, and its sections with their
   lines and headings.
3. Then read about 30 lines around the line it gave you. Never read a whole page to find something.

## Structure every page the same way

- **One `<section id="...">` per block of content,** with an `id` that says what it is, in English, lower case
  with hyphens: `id="dealers"`, `id="opening-hours"`, `id="product-specs"`. The same block has the same `id` on
  every page and in every language. The check refuses a section without one, or an `id` used twice.
- **The head, the header with its navigation, and the footer** are one file each in `site/layouts/_partials/`. A
  page's file holds only that page's own sections.
- **Repeated items** (products, dealers, people, news, questions) use one block each, written the same way, with
  `data-` attributes for what people filter or search by: `<article class="dealer" data-country="uz">`. One item
  never spreads its parts across the page.
- **Text that changes often** (dates, prices, phone numbers, opening hours) is written once per page where
  possible, inside an element with a clear class (`<time class="close-date">`), so one search finds every copy.
- **Page files** are named after what they are, in English: `about.html`, `dealers.html`, `product-corolla.html`.
  A topic with several pages gets a folder named after it (`about/_index.html`, `about/team.html`; see the page
  rules in `AGENTS.md`), and the **Pages** table lists them by folder.
- **Styles** in `site/static/site.css` follow the order of the page, one block per component, named after the component's
  class (`.dealer`, `.dealer-list`), so the look of a block is found by its class.

## Keep the site's AGENTS.md current

In the same change as the work, update these tables in the site's own `AGENTS.md`:

| Table | What it holds |
|---|---|
| **Pages** | Every page in `site/public/` and what it is |
| **Templates** | Every template and the kind of page it is for |
| **Components** | Every repeated block: its class, where to copy it from, notes |
| **Words people use** | Words people say that don't appear on the site, and where they point: "dealers" → `index.html#contacts`; "prizes" (for a Russian site) → `index.html#prizes`, heading «Призы» |

Add a row to **Words people use** whenever finding something took more than one search. The next agent finds it
in one.

## When a site is messy

Moving an existing site onto `.nib`, or when the check or the map shows pages without sections: give every
block its `section` and `id`, make repeated items consistent, and fill the four tables. Do it as its own change,
sent for review before any content changes, so a reviewer sees structure and content separately.

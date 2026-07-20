# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> smoke /trust
- Location: e2e/smoke.spec.ts:10:7

# Error details

```
Error: [
  {
    "id": "link-in-text-block",
    "impact": "serious",
    "tags": [
      "cat.color",
      "wcag2a",
      "wcag141",
      "TTv5",
      "TT13.a",
      "EN-301-549",
      "EN-9.1.4.1",
      "RGAAv4",
      "RGAA-10.6.1"
    ],
    "description": "Ensure links are distinguished from surrounding text in a way that does not rely on color",
    "help": "Links must be distinguishable without relying on color",
    "helpUrl": "https://dequeuniversity.com/rules/axe/4.12/link-in-text-block?application=playwright",
    "nodes": [
      {
        "any": [
          {
            "id": "link-in-text-block",
            "data": {
              "messageKey": "fgContrast",
              "contrastRatio": 1.29,
              "requiredContrastRatio": 3,
              "nodeColor": "#4f46e5",
              "parentColor": "#4b5058"
            },
            "relatedNodes": [
              {
                "html": "<p class=\"mt-3 text-ink-secondary leading-relaxed\">",
                "target": [
                  "div:nth-child(3) > .leading-relaxed"
                ]
              }
            ],
            "impact": "serious",
            "message": "The link has insufficient color contrast of 1.29:1 with the surrounding text. (Minimum contrast is 3:1, link text: #4f46e5, surrounding text: #4b5058)"
          },
          {
            "id": "link-in-text-block-style",
            "data": null,
            "relatedNodes": [
              {
                "html": "<p class=\"mt-3 text-ink-secondary leading-relaxed\">",
                "target": [
                  "div:nth-child(3) > .leading-relaxed"
                ]
              }
            ],
            "impact": "serious",
            "message": "The link has no styling (such as underline) to distinguish it from the surrounding text"
          }
        ],
        "all": [],
        "none": [],
        "impact": "serious",
        "html": "<a class=\"text-accent underline-offset-4 hover:underline\" href=\"/privacy\">privacy policy</a>",
        "target": [
          ".underline-offset-4.hover\\:underline.text-accent:nth-child(1)"
        ],
        "failureSummary": "Fix any of the following:\n  The link has insufficient color contrast of 1.29:1 with the surrounding text. (Minimum contrast is 3:1, link text: #4f46e5, surrounding text: #4b5058)\n  The link has no styling (such as underline) to distinguish it from the surrounding text"
      },
      {
        "any": [
          {
            "id": "link-in-text-block",
            "data": {
              "messageKey": "fgContrast",
              "contrastRatio": 1.29,
              "requiredContrastRatio": 3,
              "nodeColor": "#4f46e5",
              "parentColor": "#4b5058"
            },
            "relatedNodes": [
              {
                "html": "<p class=\"mt-3 text-ink-secondary leading-relaxed\">",
                "target": [
                  "div:nth-child(3) > .leading-relaxed"
                ]
              }
            ],
            "impact": "serious",
            "message": "The link has insufficient color contrast of 1.29:1 with the surrounding text. (Minimum contrast is 3:1, link text: #4f46e5, surrounding text: #4b5058)"
          },
          {
            "id": "link-in-text-block-style",
            "data": null,
            "relatedNodes": [
              {
                "html": "<p class=\"mt-3 text-ink-secondary leading-relaxed\">",
                "target": [
                  "div:nth-child(3) > .leading-relaxed"
                ]
              }
            ],
            "impact": "serious",
            "message": "The link has no styling (such as underline) to distinguish it from the surrounding text"
          }
        ],
        "all": [],
        "none": [],
        "impact": "serious",
        "html": "<a href=\"mailto:hello@viralyz.com\" class=\"text-accent underline-offset-4 hover:underline\">hello@viralyz.com</a>",
        "target": [
          ".underline-offset-4.hover\\:underline[href$=\"mailto:hello@viralyz.com\"]"
        ],
        "failureSummary": "Fix any of the following:\n  The link has insufficient color contrast of 1.29:1 with the surrounding text. (Minimum contrast is 3:1, link text: #4f46e5, surrounding text: #4b5058)\n  The link has no styling (such as underline) to distinguish it from the surrounding text"
      }
    ]
  }
]

expect(received).toHaveLength(expected)

Expected length: 0
Received length: 1
Received array:  [{"description": "Ensure links are distinguished from surrounding text in a way that does not rely on color", "help": "Links must be distinguishable without relying on color", "helpUrl": "https://dequeuniversity.com/rules/axe/4.12/link-in-text-block?application=playwright", "id": "link-in-text-block", "impact": "serious", "nodes": [{"all": [], "any": [{"data": {"contrastRatio": 1.29, "messageKey": "fgContrast", "nodeColor": "#4f46e5", "parentColor": "#4b5058", "requiredContrastRatio": 3}, "id": "link-in-text-block", "impact": "serious", "message": "The link has insufficient color contrast of 1.29:1 with the surrounding text. (Minimum contrast is 3:1, link text: #4f46e5, surrounding text: #4b5058)", "relatedNodes": [{"html": "<p class=\"mt-3 text-ink-secondary leading-relaxed\">", "target": ["div:nth-child(3) > .leading-relaxed"]}]}, {"data": null, "id": "link-in-text-block-style", "impact": "serious", "message": "The link has no styling (such as underline) to distinguish it from the surrounding text", "relatedNodes": [{"html": "<p class=\"mt-3 text-ink-secondary leading-relaxed\">", "target": ["div:nth-child(3) > .leading-relaxed"]}]}], "failureSummary": "Fix any of the following:
  The link has insufficient color contrast of 1.29:1 with the surrounding text. (Minimum contrast is 3:1, link text: #4f46e5, surrounding text: #4b5058)
  The link has no styling (such as underline) to distinguish it from the surrounding text", "html": "<a class=\"text-accent underline-offset-4 hover:underline\" href=\"/privacy\">privacy policy</a>", "impact": "serious", "none": [], "target": [".underline-offset-4.hover\\:underline.text-accent:nth-child(1)"]}, {"all": [], "any": [{"data": {"contrastRatio": 1.29, "messageKey": "fgContrast", "nodeColor": "#4f46e5", "parentColor": "#4b5058", "requiredContrastRatio": 3}, "id": "link-in-text-block", "impact": "serious", "message": "The link has insufficient color contrast of 1.29:1 with the surrounding text. (Minimum contrast is 3:1, link text: #4f46e5, surrounding text: #4b5058)", "relatedNodes": [{"html": "<p class=\"mt-3 text-ink-secondary leading-relaxed\">", "target": ["div:nth-child(3) > .leading-relaxed"]}]}, {"data": null, "id": "link-in-text-block-style", "impact": "serious", "message": "The link has no styling (such as underline) to distinguish it from the surrounding text", "relatedNodes": [{"html": "<p class=\"mt-3 text-ink-secondary leading-relaxed\">", "target": ["div:nth-child(3) > .leading-relaxed"]}]}], "failureSummary": "Fix any of the following:
  The link has insufficient color contrast of 1.29:1 with the surrounding text. (Minimum contrast is 3:1, link text: #4f46e5, surrounding text: #4b5058)
  The link has no styling (such as underline) to distinguish it from the surrounding text", "html": "<a href=\"mailto:hello@viralyz.com\" class=\"text-accent underline-offset-4 hover:underline\">hello@viralyz.com</a>", "impact": "serious", "none": [], "target": [".underline-offset-4.hover\\:underline[href$=\"mailto:hello@viralyz.com\"]"]}], "tags": ["cat.color", "wcag2a", "wcag141", "TTv5", "TT13.a", "EN-301-549", "EN-9.1.4.1", "RGAAv4", "RGAA-10.6.1"]}]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - link "Skip to content" [ref=e4] [cursor=pointer]:
        - /url: "#main"
      - generic [ref=e5]:
        - link "Viralyz" [ref=e6] [cursor=pointer]:
          - /url: /
          - generic [ref=e9]: Viralyz
        - navigation "Main" [ref=e10]:
          - list [ref=e12]:
            - listitem [ref=e13]:
              - button "Platform" [ref=e14]:
                - text: Platform
                - generic [ref=e15]: ▾
            - listitem [ref=e16]:
              - button "For creators" [ref=e17]:
                - text: For creators
                - generic [ref=e18]: ▾
            - listitem [ref=e19]:
              - button "For brands" [ref=e20]:
                - text: For brands
                - generic [ref=e21]: ▾
            - listitem [ref=e22]:
              - button "Resources" [ref=e23]:
                - text: Resources
                - generic [ref=e24]: ▾
            - listitem [ref=e25]:
              - link "Pricing" [ref=e26] [cursor=pointer]:
                - /url: /pricing
        - generic [ref=e27]:
          - button "Change theme" [ref=e29]:
            - img [ref=e30]
          - link "Sign in" [ref=e32] [cursor=pointer]:
            - /url: https://app.viralyz.com/login
          - link "Start free" [ref=e33] [cursor=pointer]:
            - /url: https://app.viralyz.com
    - main [ref=e34]:
      - generic [ref=e37]:
        - navigation "Breadcrumb" [ref=e38]:
          - list [ref=e39]:
            - listitem [ref=e40]:
              - link "Home" [ref=e41] [cursor=pointer]:
                - /url: /
            - listitem [ref=e42]:
              - generic [ref=e43]: /
              - generic [ref=e44]: Trust & data
        - paragraph [ref=e45]: Trust
        - heading "How we handle your data" [level=1] [ref=e46]
        - paragraph [ref=e47]: "Short version: official APIs only, you can export or delete anytime, and we say where data lives."
        - generic [ref=e48]:
          - generic [ref=e49]:
            - heading "Official platform APIs only" [level=2] [ref=e50]
            - paragraph [ref=e51]: Viralyz connects through official TikTok, Instagram, YouTube and X APIs. We do not scrape private content, ask for passwords, or automate posting outside what each platform allows.
          - generic [ref=e52]:
            - heading "Export and delete anytime" [level=2] [ref=e53]
            - paragraph [ref=e54]: Your media kits, scores and connected accounts stay under your control. You can export your data or delete your account from settings. When you disconnect a platform, we stop pulling new data from that account.
          - generic [ref=e55]:
            - heading "Where data is hosted" [level=2] [ref=e56]
            - paragraph [ref=e57]:
              - text: Application data is hosted in the EU / UK on infrastructure operated for Digiteq Holdings Limited. Details live in our
              - link "privacy policy" [ref=e58] [cursor=pointer]:
                - /url: /privacy
              - text: ". Questions:"
              - link "hello@viralyz.com" [ref=e59] [cursor=pointer]:
                - /url: mailto:hello@viralyz.com
              - text: .
      - generic [ref=e61]:
        - heading "Questions about security?" [level=2] [ref=e62]
        - paragraph [ref=e63]: Email us — we answer data and partnership questions on the same inbox.
        - generic [ref=e64]:
          - link "Email hello@" [ref=e65] [cursor=pointer]:
            - /url: mailto:hello@viralyz.com
          - link "Read privacy policy" [ref=e66] [cursor=pointer]:
            - /url: /privacy
    - contentinfo [ref=e67]:
      - generic [ref=e68]:
        - generic [ref=e69]:
          - generic [ref=e70]:
            - link "Viralyz" [ref=e71] [cursor=pointer]:
              - /url: /
              - generic [ref=e74]: Viralyz
            - paragraph [ref=e75]: Score your content before you post it. Build a record brands can trust.
            - generic [ref=e76]:
              - generic [ref=e77]: Email
              - textbox "Email" [ref=e78]:
                - /placeholder: you@example.com
              - button "Subscribe" [ref=e79]
          - generic [ref=e80]:
            - heading "Platform" [level=4] [ref=e81]
            - list [ref=e82]:
              - listitem [ref=e83]:
                - link "Platform overview" [ref=e84] [cursor=pointer]:
                  - /url: /platform
              - listitem [ref=e85]:
                - link "Viral Score" [ref=e86] [cursor=pointer]:
                  - /url: /platform/viral-score
              - listitem [ref=e87]:
                - link "Hook Lab" [ref=e88] [cursor=pointer]:
                  - /url: /platform/hook-lab
              - listitem [ref=e89]:
                - link "Script Doctor" [ref=e90] [cursor=pointer]:
                  - /url: /platform/script-doctor
              - listitem [ref=e91]:
                - link "Thumbnail Studio" [ref=e92] [cursor=pointer]:
                  - /url: /platform/thumbnail-studio
              - listitem [ref=e93]:
                - link "Performance Tracking" [ref=e94] [cursor=pointer]:
                  - /url: /platform/performance-tracking
              - listitem [ref=e95]:
                - link "Integrations" [ref=e96] [cursor=pointer]:
                  - /url: /platform#integrations
          - generic [ref=e97]:
            - heading "For creators" [level=4] [ref=e98]
            - list [ref=e99]:
              - listitem [ref=e100]:
                - link "For creators overview" [ref=e101] [cursor=pointer]:
                  - /url: /for-creators
              - listitem [ref=e102]:
                - link "Verified profile" [ref=e103] [cursor=pointer]:
                  - /url: /for-creators#profile
              - listitem [ref=e104]:
                - link "Media kit" [ref=e105] [cursor=pointer]:
                  - /url: /for-creators#media-kit
              - listitem [ref=e106]:
                - link "Rate calculator" [ref=e107] [cursor=pointer]:
                  - /url: /tools/engagement-calculator
          - generic [ref=e108]:
            - heading "For brands" [level=4] [ref=e109]
            - list [ref=e110]:
              - listitem [ref=e111]:
                - link "For brands overview" [ref=e112] [cursor=pointer]:
                  - /url: /for-brands
              - listitem [ref=e113]:
                - link "Browse creators" [ref=e114] [cursor=pointer]:
                  - /url: /creators
              - listitem [ref=e115]:
                - link "How campaigns work" [ref=e116] [cursor=pointer]:
                  - /url: /for-brands#campaigns
              - listitem [ref=e117]:
                - link "Talk to sales" [ref=e118] [cursor=pointer]:
                  - /url: /contact
          - generic [ref=e119]:
            - heading "Resources" [level=4] [ref=e120]
            - list [ref=e121]:
              - listitem [ref=e122]:
                - link "Resources overview" [ref=e123] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e124]:
                - link "Blog" [ref=e125] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e126]:
                - link "Free tools" [ref=e127] [cursor=pointer]:
                  - /url: /tools
              - listitem [ref=e128]:
                - link "About Viralyz" [ref=e129] [cursor=pointer]:
                  - /url: /about
          - generic [ref=e130]:
            - heading "Company" [level=4] [ref=e131]
            - list [ref=e132]:
              - listitem [ref=e133]:
                - link "About" [ref=e134] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e135]:
                - link "Trust & data" [ref=e136] [cursor=pointer]:
                  - /url: /trust
              - listitem [ref=e137]:
                - link "Changelog" [ref=e138] [cursor=pointer]:
                  - /url: /changelog
              - listitem [ref=e139]:
                - link "Affiliates" [ref=e140] [cursor=pointer]:
                  - /url: /affiliates
              - listitem [ref=e141]:
                - link "Contact" [ref=e142] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e143]:
                - link "Privacy" [ref=e144] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e145]:
                - link "Terms" [ref=e146] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e147]:
                - link "Cookies" [ref=e148] [cursor=pointer]:
                  - /url: /cookies
        - generic [ref=e149]:
          - paragraph [ref=e150]: © 2026 Viralyz · A Digiteq Holdings company · Windsor, UK
          - generic [ref=e151]:
            - link "Privacy" [ref=e152] [cursor=pointer]:
              - /url: /privacy
            - link "Terms" [ref=e153] [cursor=pointer]:
              - /url: /terms
            - link "Cookies" [ref=e154] [cursor=pointer]:
              - /url: /cookies
            - button "Change theme" [ref=e156]:
              - img [ref=e157]
    - region "Notifications alt+T"
  - alert [ref=e159]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import AxeBuilder from "@axe-core/playwright";
  3  | import { routes } from "../apps/web/lib/site";
  4  | 
  5  | const pages = Object.values(routes).filter(
  6  |   (r): r is string => typeof r === "string" && r.startsWith("/"),
  7  | );
  8  | 
  9  | for (const path of pages) {
  10 |   test(`smoke ${path}`, async ({ page }) => {
  11 |     const res = await page.goto(path);
  12 |     expect(res!.status()).toBeLessThan(400);
  13 | 
  14 |     await expect(page.locator("h1")).toHaveCount(1);
  15 | 
  16 |     for (const s of [
  17 |       "Stripe checkout wires in",
  18 |       "2,140",
  19 |       "Trusted by teams at",
  20 |     ]) {
  21 |       await expect(page.locator("body")).not.toContainText(s);
  22 |     }
  23 | 
  24 |     const axe = await new AxeBuilder({ page }).analyze();
  25 |     const bad = axe.violations.filter((v) =>
  26 |       ["serious", "critical"].includes(v.impact ?? ""),
  27 |     );
> 28 |     expect(bad, JSON.stringify(bad, null, 2)).toHaveLength(0);
     |                                               ^ Error: [
  29 |   });
  30 | }
  31 | 
  32 | test("mobile nav opens and traps focus", async ({ page }) => {
  33 |   await page.setViewportSize({ width: 390, height: 844 });
  34 |   await page.goto("/");
  35 |   await page.getByLabel("Open menu").click();
  36 |   await expect(page.getByRole("dialog")).toBeVisible();
  37 |   await page.keyboard.press("Escape");
  38 |   await expect(page.getByRole("dialog")).toBeHidden();
  39 | });
  40 | 
```
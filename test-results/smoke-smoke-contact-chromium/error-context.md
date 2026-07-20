# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> smoke /contact
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
                "html": "<p class=\"mt-1 text-sm text-ink-secondary\">Email<!-- --> <a href=\"mailto:partnerships@viralyz.com\" class=\"text-accent hover:underline\">partnerships@viralyz.com</a> <!-- -->and we will set up a call.</p>",
                "target": [
                  ".p-5.bg-sunken.shadow-none:nth-child(2) > .mt-1"
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
                "html": "<p class=\"mt-1 text-sm text-ink-secondary\">Email<!-- --> <a href=\"mailto:partnerships@viralyz.com\" class=\"text-accent hover:underline\">partnerships@viralyz.com</a> <!-- -->and we will set up a call.</p>",
                "target": [
                  ".p-5.bg-sunken.shadow-none:nth-child(2) > .mt-1"
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
        "html": "<a href=\"mailto:partnerships@viralyz.com\" class=\"text-accent hover:underline\">partnerships@viralyz.com</a>",
        "target": [
          ".p-5.bg-sunken.shadow-none:nth-child(2) > .mt-1 > .hover\\:underline.text-accent"
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
                "html": "<p class=\"mt-1 text-sm text-ink-secondary\">Guides are coming. Until then, use this form or check<!-- --> <a class=\"text-accent hover:underline\" href=\"/pricing\">pricing FAQ</a>.</p>",
                "target": [
                  ".p-5.bg-sunken.shadow-none:nth-child(3) > .mt-1"
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
                "html": "<p class=\"mt-1 text-sm text-ink-secondary\">Guides are coming. Until then, use this form or check<!-- --> <a class=\"text-accent hover:underline\" href=\"/pricing\">pricing FAQ</a>.</p>",
                "target": [
                  ".p-5.bg-sunken.shadow-none:nth-child(3) > .mt-1"
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
        "html": "<a class=\"text-accent hover:underline\" href=\"/pricing\">pricing FAQ</a>",
        "target": [
          ".hover\\:underline.text-accent[href$=\"pricing\"]"
        ],
        "failureSummary": "Fix any of the following:\n  The link has insufficient color contrast of 1.29:1 with the surrounding text. (Minimum contrast is 3:1, link text: #4f46e5, surrounding text: #4b5058)\n  The link has no styling (such as underline) to distinguish it from the surrounding text"
      }
    ]
  }
]

expect(received).toHaveLength(expected)

Expected length: 0
Received length: 1
Received array:  [{"description": "Ensure links are distinguished from surrounding text in a way that does not rely on color", "help": "Links must be distinguishable without relying on color", "helpUrl": "https://dequeuniversity.com/rules/axe/4.12/link-in-text-block?application=playwright", "id": "link-in-text-block", "impact": "serious", "nodes": [{"all": [], "any": [{"data": {"contrastRatio": 1.29, "messageKey": "fgContrast", "nodeColor": "#4f46e5", "parentColor": "#4b5058", "requiredContrastRatio": 3}, "id": "link-in-text-block", "impact": "serious", "message": "The link has insufficient color contrast of 1.29:1 with the surrounding text. (Minimum contrast is 3:1, link text: #4f46e5, surrounding text: #4b5058)", "relatedNodes": [{"html": "<p class=\"mt-1 text-sm text-ink-secondary\">Email<!-- --> <a href=\"mailto:partnerships@viralyz.com\" class=\"text-accent hover:underline\">partnerships@viralyz.com</a> <!-- -->and we will set up a call.</p>", "target": [".p-5.bg-sunken.shadow-none:nth-child(2) > .mt-1"]}]}, {"data": null, "id": "link-in-text-block-style", "impact": "serious", "message": "The link has no styling (such as underline) to distinguish it from the surrounding text", "relatedNodes": [{"html": "<p class=\"mt-1 text-sm text-ink-secondary\">Email<!-- --> <a href=\"mailto:partnerships@viralyz.com\" class=\"text-accent hover:underline\">partnerships@viralyz.com</a> <!-- -->and we will set up a call.</p>", "target": [".p-5.bg-sunken.shadow-none:nth-child(2) > .mt-1"]}]}], "failureSummary": "Fix any of the following:
  The link has insufficient color contrast of 1.29:1 with the surrounding text. (Minimum contrast is 3:1, link text: #4f46e5, surrounding text: #4b5058)
  The link has no styling (such as underline) to distinguish it from the surrounding text", "html": "<a href=\"mailto:partnerships@viralyz.com\" class=\"text-accent hover:underline\">partnerships@viralyz.com</a>", "impact": "serious", "none": [], "target": [".p-5.bg-sunken.shadow-none:nth-child(2) > .mt-1 > .hover\\:underline.text-accent"]}, {"all": [], "any": [{"data": {"contrastRatio": 1.29, "messageKey": "fgContrast", "nodeColor": "#4f46e5", "parentColor": "#4b5058", "requiredContrastRatio": 3}, "id": "link-in-text-block", "impact": "serious", "message": "The link has insufficient color contrast of 1.29:1 with the surrounding text. (Minimum contrast is 3:1, link text: #4f46e5, surrounding text: #4b5058)", "relatedNodes": [{"html": "<p class=\"mt-1 text-sm text-ink-secondary\">Guides are coming. Until then, use this form or check<!-- --> <a class=\"text-accent hover:underline\" href=\"/pricing\">pricing FAQ</a>.</p>", "target": [".p-5.bg-sunken.shadow-none:nth-child(3) > .mt-1"]}]}, {"data": null, "id": "link-in-text-block-style", "impact": "serious", "message": "The link has no styling (such as underline) to distinguish it from the surrounding text", "relatedNodes": [{"html": "<p class=\"mt-1 text-sm text-ink-secondary\">Guides are coming. Until then, use this form or check<!-- --> <a class=\"text-accent hover:underline\" href=\"/pricing\">pricing FAQ</a>.</p>", "target": [".p-5.bg-sunken.shadow-none:nth-child(3) > .mt-1"]}]}], "failureSummary": "Fix any of the following:
  The link has insufficient color contrast of 1.29:1 with the surrounding text. (Minimum contrast is 3:1, link text: #4f46e5, surrounding text: #4b5058)
  The link has no styling (such as underline) to distinguish it from the surrounding text", "html": "<a class=\"text-accent hover:underline\" href=\"/pricing\">pricing FAQ</a>", "impact": "serious", "none": [], "target": [".hover\\:underline.text-accent[href$=\"pricing\"]"]}], "tags": ["cat.color", "wcag2a", "wcag141", "TTv5", "TT13.a", "EN-301-549", "EN-9.1.4.1", "RGAAv4", "RGAA-10.6.1"]}]
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
      - generic [ref=e36]:
        - navigation "Breadcrumb" [ref=e37]:
          - list [ref=e38]:
            - listitem [ref=e39]:
              - link "Home" [ref=e40] [cursor=pointer]:
                - /url: /
            - listitem [ref=e41]:
              - generic [ref=e42]: /
              - generic [ref=e43]: Contact
        - paragraph [ref=e44]: Contact
        - heading "Talk to a human." [level=1] [ref=e45]
        - paragraph [ref=e46]: Questions, ideas, press, partnerships or problems. We read everything and reply within one working day.
        - generic [ref=e47]:
          - generic [ref=e48]:
            - heading "Send us a message" [level=2] [ref=e49]
            - generic [ref=e50]:
              - generic [ref=e51]:
                - generic [ref=e52]: Your name
                - textbox "Your name" [ref=e53]
              - generic [ref=e54]:
                - generic [ref=e55]: Email
                - textbox "Email" [ref=e56]
              - generic [ref=e57]:
                - generic [ref=e58]: Company (optional)
                - textbox "Company (optional)" [ref=e59]
              - generic [ref=e60]:
                - generic [ref=e61]: Message
                - textbox "Message" [ref=e62]
              - button "Send message" [ref=e63]
          - generic [ref=e64]:
            - generic [ref=e65]:
              - heading "General" [level=3] [ref=e66]
              - paragraph [ref=e67]:
                - text: Email
                - link "hello@viralyz.com" [ref=e68] [cursor=pointer]:
                  - /url: mailto:hello@viralyz.com
                - text: .
            - generic [ref=e69]:
              - heading "Partnerships & brands" [level=3] [ref=e70]
              - paragraph [ref=e71]:
                - text: Email
                - link "partnerships@viralyz.com" [ref=e72] [cursor=pointer]:
                  - /url: mailto:partnerships@viralyz.com
                - text: and we will set up a call.
            - generic [ref=e73]:
              - heading "Help" [level=3] [ref=e74]
              - paragraph [ref=e75]:
                - text: Guides are coming. Until then, use this form or check
                - link "pricing FAQ" [ref=e76] [cursor=pointer]:
                  - /url: /pricing
                - text: .
    - contentinfo [ref=e77]:
      - generic [ref=e78]:
        - generic [ref=e79]:
          - generic [ref=e80]:
            - link "Viralyz" [ref=e81] [cursor=pointer]:
              - /url: /
              - generic [ref=e84]: Viralyz
            - paragraph [ref=e85]: Score your content before you post it. Build a record brands can trust.
            - generic [ref=e86]:
              - generic [ref=e87]: Email
              - textbox "Email" [ref=e88]:
                - /placeholder: you@example.com
              - button "Subscribe" [ref=e89]
          - generic [ref=e90]:
            - heading "Platform" [level=4] [ref=e91]
            - list [ref=e92]:
              - listitem [ref=e93]:
                - link "Platform overview" [ref=e94] [cursor=pointer]:
                  - /url: /platform
              - listitem [ref=e95]:
                - link "Viral Score" [ref=e96] [cursor=pointer]:
                  - /url: /platform/viral-score
              - listitem [ref=e97]:
                - link "Hook Lab" [ref=e98] [cursor=pointer]:
                  - /url: /platform/hook-lab
              - listitem [ref=e99]:
                - link "Script Doctor" [ref=e100] [cursor=pointer]:
                  - /url: /platform/script-doctor
              - listitem [ref=e101]:
                - link "Thumbnail Studio" [ref=e102] [cursor=pointer]:
                  - /url: /platform/thumbnail-studio
              - listitem [ref=e103]:
                - link "Performance Tracking" [ref=e104] [cursor=pointer]:
                  - /url: /platform/performance-tracking
              - listitem [ref=e105]:
                - link "Integrations" [ref=e106] [cursor=pointer]:
                  - /url: /platform#integrations
          - generic [ref=e107]:
            - heading "For creators" [level=4] [ref=e108]
            - list [ref=e109]:
              - listitem [ref=e110]:
                - link "For creators overview" [ref=e111] [cursor=pointer]:
                  - /url: /for-creators
              - listitem [ref=e112]:
                - link "Verified profile" [ref=e113] [cursor=pointer]:
                  - /url: /for-creators#profile
              - listitem [ref=e114]:
                - link "Media kit" [ref=e115] [cursor=pointer]:
                  - /url: /for-creators#media-kit
              - listitem [ref=e116]:
                - link "Rate calculator" [ref=e117] [cursor=pointer]:
                  - /url: /tools/engagement-calculator
          - generic [ref=e118]:
            - heading "For brands" [level=4] [ref=e119]
            - list [ref=e120]:
              - listitem [ref=e121]:
                - link "For brands overview" [ref=e122] [cursor=pointer]:
                  - /url: /for-brands
              - listitem [ref=e123]:
                - link "Browse creators" [ref=e124] [cursor=pointer]:
                  - /url: /creators
              - listitem [ref=e125]:
                - link "How campaigns work" [ref=e126] [cursor=pointer]:
                  - /url: /for-brands#campaigns
              - listitem [ref=e127]:
                - link "Talk to sales" [ref=e128] [cursor=pointer]:
                  - /url: /contact
          - generic [ref=e129]:
            - heading "Resources" [level=4] [ref=e130]
            - list [ref=e131]:
              - listitem [ref=e132]:
                - link "Resources overview" [ref=e133] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e134]:
                - link "Blog" [ref=e135] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e136]:
                - link "Free tools" [ref=e137] [cursor=pointer]:
                  - /url: /tools
              - listitem [ref=e138]:
                - link "About Viralyz" [ref=e139] [cursor=pointer]:
                  - /url: /about
          - generic [ref=e140]:
            - heading "Company" [level=4] [ref=e141]
            - list [ref=e142]:
              - listitem [ref=e143]:
                - link "About" [ref=e144] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e145]:
                - link "Trust & data" [ref=e146] [cursor=pointer]:
                  - /url: /trust
              - listitem [ref=e147]:
                - link "Changelog" [ref=e148] [cursor=pointer]:
                  - /url: /changelog
              - listitem [ref=e149]:
                - link "Affiliates" [ref=e150] [cursor=pointer]:
                  - /url: /affiliates
              - listitem [ref=e151]:
                - link "Contact" [ref=e152] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e153]:
                - link "Privacy" [ref=e154] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e155]:
                - link "Terms" [ref=e156] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e157]:
                - link "Cookies" [ref=e158] [cursor=pointer]:
                  - /url: /cookies
        - generic [ref=e159]:
          - paragraph [ref=e160]: © 2026 Viralyz · A Digiteq Holdings company · Windsor, UK
          - generic [ref=e161]:
            - link "Privacy" [ref=e162] [cursor=pointer]:
              - /url: /privacy
            - link "Terms" [ref=e163] [cursor=pointer]:
              - /url: /terms
            - link "Cookies" [ref=e164] [cursor=pointer]:
              - /url: /cookies
            - button "Change theme" [ref=e166]:
              - img [ref=e167]
    - region "Notifications alt+T"
  - alert [ref=e169]
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
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> smoke /creators
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
                "html": "<div class=\"mb-8 rounded-md border border-line bg-accent-soft px-4 py-3 text-sm text-ink-secondary\">",
                "target": [
                  ".mb-8"
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
                "html": "<div class=\"mb-8 rounded-md border border-line bg-accent-soft px-4 py-3 text-sm text-ink-secondary\">",
                "target": [
                  ".mb-8"
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
        "html": "<a class=\"text-accent underline-offset-4 hover:underline\" href=\"/for-creators\">join the founding roster</a>",
        "target": [
          ".underline-offset-4"
        ],
        "failureSummary": "Fix any of the following:\n  The link has insufficient color contrast of 1.29:1 with the surrounding text. (Minimum contrast is 3:1, link text: #4f46e5, surrounding text: #4b5058)\n  The link has no styling (such as underline) to distinguish it from the surrounding text"
      }
    ]
  }
]

expect(received).toHaveLength(expected)

Expected length: 0
Received length: 1
Received array:  [{"description": "Ensure links are distinguished from surrounding text in a way that does not rely on color", "help": "Links must be distinguishable without relying on color", "helpUrl": "https://dequeuniversity.com/rules/axe/4.12/link-in-text-block?application=playwright", "id": "link-in-text-block", "impact": "serious", "nodes": [{"all": [], "any": [{"data": {"contrastRatio": 1.29, "messageKey": "fgContrast", "nodeColor": "#4f46e5", "parentColor": "#4b5058", "requiredContrastRatio": 3}, "id": "link-in-text-block", "impact": "serious", "message": "The link has insufficient color contrast of 1.29:1 with the surrounding text. (Minimum contrast is 3:1, link text: #4f46e5, surrounding text: #4b5058)", "relatedNodes": [{"html": "<div class=\"mb-8 rounded-md border border-line bg-accent-soft px-4 py-3 text-sm text-ink-secondary\">", "target": [".mb-8"]}]}, {"data": null, "id": "link-in-text-block-style", "impact": "serious", "message": "The link has no styling (such as underline) to distinguish it from the surrounding text", "relatedNodes": [{"html": "<div class=\"mb-8 rounded-md border border-line bg-accent-soft px-4 py-3 text-sm text-ink-secondary\">", "target": [".mb-8"]}]}], "failureSummary": "Fix any of the following:
  The link has insufficient color contrast of 1.29:1 with the surrounding text. (Minimum contrast is 3:1, link text: #4f46e5, surrounding text: #4b5058)
  The link has no styling (such as underline) to distinguish it from the surrounding text", "html": "<a class=\"text-accent underline-offset-4 hover:underline\" href=\"/for-creators\">join the founding roster</a>", "impact": "serious", "none": [], "target": [".underline-offset-4"]}], "tags": ["cat.color", "wcag2a", "wcag141", "TTv5", "TT13.a", "EN-301-549", "EN-9.1.4.1", "RGAAv4", "RGAA-10.6.1"]}]
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
              - link "For brands" [ref=e44] [cursor=pointer]:
                - /url: /for-brands
            - listitem [ref=e45]:
              - generic [ref=e46]: /
              - generic [ref=e47]: Browse creators
        - paragraph [ref=e48]: Founding roster · example profiles
        - heading "Find creators with the numbers to prove it" [level=1] [ref=e49]
        - paragraph [ref=e50]: Profiles are verified against connected platform accounts. No self-reported stats.
        - generic [ref=e51]:
          - searchbox "Search by name, niche or @handle" [ref=e52]
          - button "Search" [ref=e53]
      - generic [ref=e56]:
        - generic [ref=e57]:
          - text: These are example profiles showing how verified creator data will look. Real creators are onboarding now —
          - link "join the founding roster" [ref=e58] [cursor=pointer]:
            - /url: /for-creators
          - text: .
        - generic [ref=e59]:
          - complementary [ref=e60]:
            - generic [ref=e61]:
              - paragraph [ref=e62]: Platform
              - generic [ref=e63]:
                - link "TikTok" [ref=e64] [cursor=pointer]:
                  - /url: /creators?platform=TikTok
                - link "Instagram" [ref=e65] [cursor=pointer]:
                  - /url: /creators?platform=Instagram
                - link "YouTube" [ref=e66] [cursor=pointer]:
                  - /url: /creators?platform=YouTube
                - link "X" [ref=e67] [cursor=pointer]:
                  - /url: /creators?platform=X
            - generic [ref=e68]:
              - paragraph [ref=e69]: Category
              - generic [ref=e70]:
                - link "Food" [ref=e71] [cursor=pointer]:
                  - /url: /creators?niche=Food
                - link "Beauty" [ref=e72] [cursor=pointer]:
                  - /url: /creators?niche=Beauty
                - link "Fitness" [ref=e73] [cursor=pointer]:
                  - /url: /creators?niche=Fitness
                - link "Tech" [ref=e74] [cursor=pointer]:
                  - /url: /creators?niche=Tech
                - link "Travel" [ref=e75] [cursor=pointer]:
                  - /url: /creators?niche=Travel
                - link "Gaming" [ref=e76] [cursor=pointer]:
                  - /url: /creators?niche=Gaming
                - link "UGC" [ref=e77] [cursor=pointer]:
                  - /url: /creators?niche=UGC
                - link "Fashion" [ref=e78] [cursor=pointer]:
                  - /url: /creators?niche=Fashion
            - generic [ref=e79]:
              - link "For brands overview" [ref=e80] [cursor=pointer]:
                - /url: /for-brands
              - link "Pricing" [ref=e81] [cursor=pointer]:
                - /url: /pricing
              - link "Talk to sales" [ref=e82] [cursor=pointer]:
                - /url: /contact
          - generic [ref=e84]:
            - link "Maya R. Example profile Food · 214K Avg views 412K Maya R. score 89" [ref=e85] [cursor=pointer]:
              - /url: /kit/mayacooks
              - generic [ref=e86]:
                - generic [ref=e87]:
                  - text: MR
                  - generic [ref=e88]: TikTok
                - generic [ref=e89]:
                  - generic [ref=e90]:
                    - generic [ref=e91]:
                      - heading "Maya R." [level=3] [ref=e92]
                      - generic [ref=e93]: Example profile
                    - paragraph [ref=e94]: Food · 214K
                    - paragraph [ref=e95]: Avg views 412K
                  - img "Maya R. score 89" [ref=e96]:
                    - generic [ref=e99]: "89"
            - link "Amara D. Example profile Beauty · 1.2M Avg views 890K Amara D. score 94" [ref=e100] [cursor=pointer]:
              - /url: /kit/amaraglow
              - generic [ref=e101]:
                - generic [ref=e102]:
                  - text: AD
                  - generic [ref=e103]: YouTube
                - generic [ref=e104]:
                  - generic [ref=e105]:
                    - generic [ref=e106]:
                      - heading "Amara D." [level=3] [ref=e107]
                      - generic [ref=e108]: Example profile
                    - paragraph [ref=e109]: Beauty · 1.2M
                    - paragraph [ref=e110]: Avg views 890K
                  - img "Amara D. score 94" [ref=e111]:
                    - generic [ref=e114]: "94"
            - link "Sam K. Example profile Tech · 340K Avg views 120K Sam K. score 74" [ref=e115] [cursor=pointer]:
              - /url: /kit/sambuilds
              - generic [ref=e116]:
                - generic [ref=e117]:
                  - text: SK
                  - generic [ref=e118]: X
                - generic [ref=e119]:
                  - generic [ref=e120]:
                    - generic [ref=e121]:
                      - heading "Sam K." [level=3] [ref=e122]
                      - generic [ref=e123]: Example profile
                    - paragraph [ref=e124]: Tech · 340K
                    - paragraph [ref=e125]: Avg views 120K
                  - img "Sam K. score 74" [ref=e126]:
                    - generic [ref=e129]: "74"
            - link "Jordan T. Example profile Fitness · 88K Avg views 64K Jordan T. score 81" [ref=e130] [cursor=pointer]:
              - /url: /kit/jordanlifts
              - generic [ref=e131]:
                - generic [ref=e132]:
                  - text: JT
                  - generic [ref=e133]: Instagram
                - generic [ref=e134]:
                  - generic [ref=e135]:
                    - generic [ref=e136]:
                      - heading "Jordan T." [level=3] [ref=e137]
                      - generic [ref=e138]: Example profile
                    - paragraph [ref=e139]: Fitness · 88K
                    - paragraph [ref=e140]: Avg views 64K
                  - img "Jordan T. score 81" [ref=e141]:
                    - generic [ref=e144]: "81"
            - link "Lena P. Example profile UGC · 46K Avg views 38K Lena P. score 86" [ref=e145] [cursor=pointer]:
              - /url: /kit/lenamakes
              - generic [ref=e146]:
                - generic [ref=e147]:
                  - text: LP
                  - generic [ref=e148]: Instagram
                - generic [ref=e149]:
                  - generic [ref=e150]:
                    - generic [ref=e151]:
                      - heading "Lena P." [level=3] [ref=e152]
                      - generic [ref=e153]: Example profile
                    - paragraph [ref=e154]: UGC · 46K
                    - paragraph [ref=e155]: Avg views 38K
                  - img "Lena P. score 86" [ref=e156]:
                    - generic [ref=e159]: "86"
            - link "Omar B. Example profile Gaming · 520K Avg views 260K Omar B. score 78" [ref=e160] [cursor=pointer]:
              - /url: /kit/omargames
              - generic [ref=e161]:
                - generic [ref=e162]:
                  - text: OB
                  - generic [ref=e163]: YouTube
                - generic [ref=e164]:
                  - generic [ref=e165]:
                    - generic [ref=e166]:
                      - heading "Omar B." [level=3] [ref=e167]
                      - generic [ref=e168]: Example profile
                    - paragraph [ref=e169]: Gaming · 520K
                    - paragraph [ref=e170]: Avg views 260K
                  - img "Omar B. score 78" [ref=e171]:
                    - generic [ref=e174]: "78"
            - link "Nia F. Example profile Travel · 156K Avg views 98K Nia F. score 83" [ref=e175] [cursor=pointer]:
              - /url: /kit/niawanders
              - generic [ref=e176]:
                - generic [ref=e177]:
                  - text: NF
                  - generic [ref=e178]: TikTok
                - generic [ref=e179]:
                  - generic [ref=e180]:
                    - generic [ref=e181]:
                      - heading "Nia F." [level=3] [ref=e182]
                      - generic [ref=e183]: Example profile
                    - paragraph [ref=e184]: Travel · 156K
                    - paragraph [ref=e185]: Avg views 98K
                  - img "Nia F. score 83" [ref=e186]:
                    - generic [ref=e189]: "83"
            - link "Chris W. Example profile Fashion · 92K Avg views 47K Chris W. score 71" [ref=e190] [cursor=pointer]:
              - /url: /kit/chrisfits
              - generic [ref=e191]:
                - generic [ref=e192]:
                  - text: CW
                  - generic [ref=e193]: Instagram
                - generic [ref=e194]:
                  - generic [ref=e195]:
                    - generic [ref=e196]:
                      - heading "Chris W." [level=3] [ref=e197]
                      - generic [ref=e198]: Example profile
                    - paragraph [ref=e199]: Fashion · 92K
                    - paragraph [ref=e200]: Avg views 47K
                  - img "Chris W. score 71" [ref=e201]:
                    - generic [ref=e204]: "71"
    - contentinfo [ref=e205]:
      - generic [ref=e206]:
        - generic [ref=e207]:
          - generic [ref=e208]:
            - link "Viralyz" [ref=e209] [cursor=pointer]:
              - /url: /
              - generic [ref=e212]: Viralyz
            - paragraph [ref=e213]: Score your content before you post it. Build a record brands can trust.
            - generic [ref=e214]:
              - generic [ref=e215]: Email
              - textbox "Email" [ref=e216]:
                - /placeholder: you@example.com
              - button "Subscribe" [ref=e217]
          - generic [ref=e218]:
            - heading "Platform" [level=4] [ref=e219]
            - list [ref=e220]:
              - listitem [ref=e221]:
                - link "Platform overview" [ref=e222] [cursor=pointer]:
                  - /url: /platform
              - listitem [ref=e223]:
                - link "Viral Score" [ref=e224] [cursor=pointer]:
                  - /url: /platform/viral-score
              - listitem [ref=e225]:
                - link "Hook Lab" [ref=e226] [cursor=pointer]:
                  - /url: /platform/hook-lab
              - listitem [ref=e227]:
                - link "Script Doctor" [ref=e228] [cursor=pointer]:
                  - /url: /platform/script-doctor
              - listitem [ref=e229]:
                - link "Thumbnail Studio" [ref=e230] [cursor=pointer]:
                  - /url: /platform/thumbnail-studio
              - listitem [ref=e231]:
                - link "Performance Tracking" [ref=e232] [cursor=pointer]:
                  - /url: /platform/performance-tracking
              - listitem [ref=e233]:
                - link "Integrations" [ref=e234] [cursor=pointer]:
                  - /url: /platform#integrations
          - generic [ref=e235]:
            - heading "For creators" [level=4] [ref=e236]
            - list [ref=e237]:
              - listitem [ref=e238]:
                - link "For creators overview" [ref=e239] [cursor=pointer]:
                  - /url: /for-creators
              - listitem [ref=e240]:
                - link "Verified profile" [ref=e241] [cursor=pointer]:
                  - /url: /for-creators#profile
              - listitem [ref=e242]:
                - link "Media kit" [ref=e243] [cursor=pointer]:
                  - /url: /for-creators#media-kit
              - listitem [ref=e244]:
                - link "Rate calculator" [ref=e245] [cursor=pointer]:
                  - /url: /tools/engagement-calculator
          - generic [ref=e246]:
            - heading "For brands" [level=4] [ref=e247]
            - list [ref=e248]:
              - listitem [ref=e249]:
                - link "For brands overview" [ref=e250] [cursor=pointer]:
                  - /url: /for-brands
              - listitem [ref=e251]:
                - link "Browse creators" [ref=e252] [cursor=pointer]:
                  - /url: /creators
              - listitem [ref=e253]:
                - link "How campaigns work" [ref=e254] [cursor=pointer]:
                  - /url: /for-brands#campaigns
              - listitem [ref=e255]:
                - link "Talk to sales" [ref=e256] [cursor=pointer]:
                  - /url: /contact
          - generic [ref=e257]:
            - heading "Resources" [level=4] [ref=e258]
            - list [ref=e259]:
              - listitem [ref=e260]:
                - link "Resources overview" [ref=e261] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e262]:
                - link "Blog" [ref=e263] [cursor=pointer]:
                  - /url: /blog
              - listitem [ref=e264]:
                - link "Free tools" [ref=e265] [cursor=pointer]:
                  - /url: /tools
              - listitem [ref=e266]:
                - link "About Viralyz" [ref=e267] [cursor=pointer]:
                  - /url: /about
          - generic [ref=e268]:
            - heading "Company" [level=4] [ref=e269]
            - list [ref=e270]:
              - listitem [ref=e271]:
                - link "About" [ref=e272] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e273]:
                - link "Trust & data" [ref=e274] [cursor=pointer]:
                  - /url: /trust
              - listitem [ref=e275]:
                - link "Changelog" [ref=e276] [cursor=pointer]:
                  - /url: /changelog
              - listitem [ref=e277]:
                - link "Affiliates" [ref=e278] [cursor=pointer]:
                  - /url: /affiliates
              - listitem [ref=e279]:
                - link "Contact" [ref=e280] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e281]:
                - link "Privacy" [ref=e282] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e283]:
                - link "Terms" [ref=e284] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e285]:
                - link "Cookies" [ref=e286] [cursor=pointer]:
                  - /url: /cookies
        - generic [ref=e287]:
          - paragraph [ref=e288]: © 2026 Viralyz · A Digiteq Holdings company · Windsor, UK
          - generic [ref=e289]:
            - link "Privacy" [ref=e290] [cursor=pointer]:
              - /url: /privacy
            - link "Terms" [ref=e291] [cursor=pointer]:
              - /url: /terms
            - link "Cookies" [ref=e292] [cursor=pointer]:
              - /url: /cookies
            - button "Change theme" [ref=e294]:
              - img [ref=e295]
    - region "Notifications alt+T"
  - alert [ref=e297]
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
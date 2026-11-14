import { COMPANY, CONTACT } from "@/lib/site";

export type LegalSection = { heading: string; body: string[] };

/**
 * Draft legal text, used when Sanity has no published version of the page.
 * It describes how the product works today. Have it reviewed by a solicitor
 * before relying on it, and keep it in step with the product.
 */
export const LEGAL_UPDATED = "13 November 2026";

export const privacySections: LegalSection[] = [
  {
    heading: "Who we are",
    body: [
      `Viralyz is operated by ${COMPANY.legalName}, a company registered in England and Wales (company number ${COMPANY.number}), based in ${COMPANY.location}. We are the controller of the personal data described here.`,
      `For anything about your data, write to ${CONTACT.hello}.`,
    ],
  },
  {
    heading: "What we collect",
    body: [
      "Account details: your name, email address and a password, which is stored only as a hash. If you sign in with a single sign-on provider, we receive your name and email from them.",
      "Brand and product details you give us or ask us to read from your shop: brand name, colours, logo, product titles, prices and images.",
      "What you make: the ads generated for you, their wording, the result of each check, and any reference ads or images you save.",
      "Results you import: the rows of an Ads Manager export you upload, such as ad names, impressions and clicks.",
      "Usage and technical data: your credit history, pages visited, device and browser type, and IP address, used to keep the service secure and working.",
      "Messages you send us through the contact form or by email.",
    ],
  },
  {
    heading: "Why we use it, and our legal basis",
    body: [
      "To provide the service you signed up for: creating your account, making and checking ads, keeping your credit balance, and matching imported results to your ads. The basis is our contract with you.",
      "To keep the service secure, prevent abuse and fix faults. The basis is our legitimate interest in running a safe and reliable product.",
      "To understand how the site and app are used, in aggregate. The basis is legitimate interest for privacy-friendly analytics that set no cookies, and your consent for anything that does.",
      "To send product emails you have asked for. The basis is your consent, which you can withdraw at any time using the link in each email.",
      "To meet legal obligations, such as keeping financial records.",
    ],
  },
  {
    heading: "Artificial intelligence",
    body: [
      "Making an ad sends your brand details, product details and the brief to AI model providers, who generate the image and the wording and return them to us. We do not send your account password or payment details to them.",
      "We do not use your content to train our own models. Checks that are an AI opinion rather than a measurement are labelled as estimates in the product.",
    ],
  },
  {
    heading: "Who we share it with",
    body: [
      "We use a small number of companies to run the service on our behalf: a hosting provider, a database host, a file storage provider, an email delivery provider, AI model providers for image and copy generation, a content system for this website, and an analytics provider. Each one acts on our instructions under a written agreement.",
      `You can ask for the current list at ${CONTACT.hello}.`,
      "We do not sell your personal data. We disclose it to others only if the law requires it, or as part of a sale or restructuring of the business, in which case the same protections continue to apply.",
    ],
  },
  {
    heading: "Transfers outside the UK",
    body: [
      "Some of these providers process data outside the United Kingdom, including in the United States and the European Economic Area. Where they do, we rely on UK adequacy regulations or on the International Data Transfer Agreement or Addendum approved for use in the UK.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "We keep your account and what you have made for as long as your account is open. If you close it, we delete or anonymise your personal data within 30 days, except records we must keep by law, such as records of payments, which are kept for six years.",
      "Contact messages are kept for up to two years. Security logs are kept for up to 90 days.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "Under UK data protection law you can ask us for a copy of your data, ask us to correct or delete it, ask us to restrict or stop using it, object to uses based on legitimate interest, and ask for your data in a portable format. Where we rely on consent you can withdraw it at any time.",
      `To use any of these rights, write to ${CONTACT.hello}. We reply within one month.`,
      "If you are unhappy with how we have handled your data you can complain to the Information Commissioner's Office at ico.org.uk. We would appreciate the chance to put it right first.",
    ],
  },
  {
    heading: "Children",
    body: ["Viralyz is a business tool and is not intended for anyone under 18."],
  },
  {
    heading: "Changes to this policy",
    body: [
      "If we change this policy in a way that matters, we will tell you by email or in the app before the change takes effect. The date at the top shows when it was last updated.",
    ],
  },
];

export const termsSections: LegalSection[] = [
  {
    heading: "About these terms",
    body: [
      `These terms are an agreement between you and ${COMPANY.legalName} (company number ${COMPANY.number}), which operates Viralyz. By creating an account or using the service you agree to them.`,
      "Viralyz is a tool for businesses. By using it you confirm that you are acting for a business or as a trader, not as a consumer, and that you are at least 18.",
    ],
  },
  {
    heading: "Your account",
    body: [
      "Keep your sign-in details secure and tell us promptly if you think someone else has used your account. You are responsible for what is done through it.",
      "While access is by invitation, we may limit who can create an account.",
    ],
  },
  {
    heading: "Credits",
    body: [
      "Making an ad uses credits. The number of credits each action costs is shown before you confirm it.",
      "A credit is spent only when an ad is made. If generation fails, the credit is returned to your balance automatically.",
      "Credits have no cash value and cannot be transferred. Free credits given on signup or as a promotion are not refundable. If paid credit packs are offered, the price, any expiry and the refund terms will be shown at the point of purchase.",
    ],
  },
  {
    heading: "What you give us",
    body: [
      "You keep ownership of the brand assets, product details, images and reference material you provide. You give us permission to use them to provide the service to you, including sending them to the AI model providers that generate your ads.",
      "You confirm that you have the right to use everything you provide, and that using it in this way does not infringe anyone else's rights. Reference ads from other advertisers are for studying structure, not for copying.",
    ],
  },
  {
    heading: "What you make",
    body: [
      "As between you and us, the ads generated for your account are yours to use, including commercially. We claim no ownership of them.",
      "The ads are produced by AI. Similar output may be produced for other people, the law on ownership of AI-generated work varies between countries, and we cannot promise that an ad is free of third-party rights or that it can be protected by copyright. You are responsible for reviewing every ad before you publish it and for any disclosure of AI-generated content that a platform requires.",
    ],
  },
  {
    heading: "What the checks are, and are not",
    body: [
      "Pre-flight measures each ad against rules drawn from the platforms' published specifications and policies. It is guidance to help you avoid common problems.",
      "It is not a guarantee that an ad will be approved by Meta, TikTok or any other platform, that it complies with advertising law or regulation, or that it will perform well. The platforms make their own decisions and their rules change. Checks labelled as estimates are AI opinions, not measurements.",
      "Viralyz is not affiliated with or endorsed by Meta or TikTok.",
    ],
  },
  {
    heading: "Acceptable use",
    body: [
      "Do not use Viralyz to make content that is unlawful, misleading, defamatory, hateful or sexually explicit, that infringes someone else's rights, or that advertises goods or services that are illegal to sell.",
      "Do not attempt to break, overload or reverse engineer the service, access another person's account, or use automated means to extract data from it.",
      "We may suspend or close an account that breaks these rules.",
    ],
  },
  {
    heading: "Availability and changes",
    body: [
      "We work to keep Viralyz available but do not promise uninterrupted service. Features may change, and we may withdraw a feature with reasonable notice where we can give it.",
    ],
  },
  {
    heading: "Our liability",
    body: [
      "Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot be limited by law.",
      "Otherwise, we are not liable for loss of profit, revenue, advertising spend, data or goodwill, or for indirect or consequential loss. Our total liability to you in any 12 month period is limited to the amount you paid us in that period, or £100 if greater.",
      "The service is provided as it is. To the extent the law allows, we exclude implied terms about quality and fitness for a particular purpose.",
    ],
  },
  {
    heading: "Ending the agreement",
    body: [
      `You can stop using Viralyz and ask us to close your account at any time by writing to ${CONTACT.hello}. We may end the agreement on 30 days' notice, or immediately if you seriously breach these terms.`,
    ],
  },
  {
    heading: "Changes to these terms",
    body: [
      "We may update these terms. If a change matters, we will tell you by email or in the app before it takes effect. Continuing to use the service after that date means you accept the updated terms.",
    ],
  },
  {
    heading: "Law and disputes",
    body: [
      "These terms are governed by the law of England and Wales, and the courts of England and Wales have exclusive jurisdiction over any dispute.",
    ],
  },
];

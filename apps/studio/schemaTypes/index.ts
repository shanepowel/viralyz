import { calloutBox, linkObject, portableBody, scoreBreakdown } from "./objects/content";
import { pageBuilderBlocks } from "./blocks";
import {
  author,
  category,
  ctaBand,
  faqItem,
  feature,
  legalPage,
  page,
  post,
  siteSettings,
} from "./documents";

export const schemaTypes = [
  // objects
  linkObject,
  scoreBreakdown,
  calloutBox,
  portableBody,
  ...pageBuilderBlocks,
  // documents
  siteSettings,
  page,
  author,
  category,
  post,
  feature,
  legalPage,
  faqItem,
  ctaBand,
];

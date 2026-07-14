/**
 * Inngest wiring for Viralyz Score Engine.
 * @deprecated import from ./client and ./functions instead
 */
export { ANALYSIS_EVENT, isInngestConfigured, inngest } from "./client";
export {
  runAnalysisFunction,
  inngestFunctions,
  enqueueLocalAnalysisJob,
  getAnalysisJob,
} from "./functions";

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as applicationNotes from "../applicationNotes.js";
import type * as applicationTasks from "../applicationTasks.js";
import type * as applications from "../applications.js";
import type * as auditLogs from "../auditLogs.js";
import type * as awards from "../awards.js";
import type * as dashboard from "../dashboard.js";
import type * as expenditures from "../expenditures.js";
import type * as funders from "../funders.js";
import type * as grants from "../grants.js";
import type * as helpers from "../helpers.js";
import type * as notifications from "../notifications.js";
import type * as organizations from "../organizations.js";
import type * as reports from "../reports.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  applicationNotes: typeof applicationNotes;
  applicationTasks: typeof applicationTasks;
  applications: typeof applications;
  auditLogs: typeof auditLogs;
  awards: typeof awards;
  dashboard: typeof dashboard;
  expenditures: typeof expenditures;
  funders: typeof funders;
  grants: typeof grants;
  helpers: typeof helpers;
  notifications: typeof notifications;
  organizations: typeof organizations;
  reports: typeof reports;
  seed: typeof seed;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

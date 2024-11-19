import { Context, Schema } from "koishi";
import * as groupmanager from "./groupmanager";
import { Config } from "./config";

export const name = "star-kicker";
export const reusable = true;

export * from "./config";

export function apply(ctx: Context, config: Config) {
  ctx.plugin(groupmanager, config);
}

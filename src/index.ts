import { Context, Schema } from "koishi";
import zh from "./locales/zh-CN.yml";
import * as groupmanager from "./groupmanager";
import { Config } from "./config";

export const name = "star-kicker";
export const reusable = true;

export * from "./config";

export function apply(ctx: Context, config: Config) {
  // 加载语言
  ctx.i18n.define("zh-CN", zh);

  ctx.plugin(groupmanager, config);
}

import { Schema } from "koishi";

// 基础设置
export interface Config {
  admin?: string[];
  kickSent: number;
  kickJoin: number;
  kickLevel: number;
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    admin: Schema.array(String).role("table").description("管理员"),
    kickSent: Schema.number().description("条件:未发言N天前成员").default(30),
    kickJoin: Schema.number().description("条件:加群时间N天前成员").default(7),
    kickLevel: Schema.number()
      .description("条件:活跃等级N级以下成员")
      .default(30),
  }).description("基础设置"),
]);

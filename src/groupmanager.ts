import { Context, Session, h, Bot } from "koishi";
import { Config } from ".";

export const reusable = true;

// 二次输入验证(1分钟)
async function waitcheck(ctx: Context, session: Session) {
  return new Promise((resolve) => {
    // 临时中间件
    const dispose = ctx
      .intersect((sess) => sess.userId === session.userId)
      .middleware(async (sess, next) => {
        if (sess.content == session.content) {
          clearTimeout(timeout);
          resolve(true);
          // 取消中间件
          dispose();
          // 禁止其他操作
          return "";
        }
        return next();
      }, true);
    const timeout = setTimeout(() => {
      // 取消中间件
      dispose();
      resolve(false);
    }, 60 * 1000);
  });
}

export function apply(ctx: Context, config: Config) {
  ctx
    .command("kick <Num>")
    .alias("踢人")
    .action(async ({ session }, num) => {
      if (!config.admin.includes(session.userId)) {
        // 无权限
        return;
      }
      let numregex: RegExp = /^\d+$/;
      if (!numregex.test(num)) {
        return h.at(session.userId) + "\r" + session.text(".invalid-num");
      }

      // 双重确认
      session.send(
        h.text(
          session.text(".continue", {
            num: num,
          })
        )
      );
      if (!(await waitcheck(ctx, session))) {
        return;
      }
    });

  ctx
    .command("test")
    .alias("测试")
    .action(async ({ session }, num) => {
      if (!config.admin.includes(session.userId)) {
        // 无权限
        return;
      }
      console.log(
        await session.bot.internal.getGroupMemberList(session.guildId)
      );
    });
}

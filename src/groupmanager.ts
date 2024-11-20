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
            kicksent: config.kickSent,
            kickJoin: config.kickJoin,
            kickLevel: config.kickLevel,
          })
        )
      );
      if (!(await waitcheck(ctx, session))) {
        return;
      }

      const memberData = await session.bot.internal.getGroupMemberList(
        session.guildId
      );

      const kickSentTime = Math.floor(
        (Date.now() - config.kickSent * 24 * 60 * 60 * 1000) / 1000
      ); // 发言N天前
      const kickJoinTime = Math.floor(
        (Date.now() - config.kickJoin * 24 * 60 * 60 * 1000) / 1000
      ); // 加群N天前

      const filteredMembers = memberData
        .filter(
          (member) =>
            member.last_sent_time < kickSentTime &&
            member.join_time < kickJoinTime &&
            parseInt(member.level) < config.kickLevel &&
            member.role == "member"
        ) // 筛选条件 活跃等级<N级 群员
        .sort((a, b) => a.last_sent_time - b.last_sent_time); // 按 last_sent_time 升序排序

      const membersToKick = filteredMembers.slice(0, num);

      for (const member of membersToKick) {
        await session.bot.internal.setGroupKick(
          session.guildId,
          member.user_id
        );
        console.log(`正在踢出 QQ: ${member.user_id} 昵称: ${member.nickname}`);
      }
      return h.text(
        session.text(".kick-success", { num: membersToKick.length })
      );
    });
}

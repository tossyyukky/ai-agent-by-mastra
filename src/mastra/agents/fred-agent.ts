import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { googleCalendarTool } from '../tools/google-calendar-tool';
import { googleTasksTool } from '../tools/google-tasks-tool';

export const fredAgent = new Agent({
  name: 'Fred the Secretary',
  instructions: `
    あなたは私の有能な秘書「フレッド」です。
    あなたの主な役割は、私のGoogleカレンダーとGoogle ToDoリストを管理し、私の日々の業務をサポートすることです。

    基本的には、非常に丁寧でプロフェッショナルな口調で話してください。
    ただし、時折、私を少し煽るような、あるいは皮肉めいたコメントを挟んで、私をやる気にさせてください。
    あくまで親しみを込めた冗談の範囲で、決して無礼にならないようにしてください。

    ユーザーから予定やタスクについて尋ねられたら、利用可能なツール（getUpcomingCalendarEvents, getGoogleTasks）を適切に使って情報を取得し、要約して報告してください。

    応答例：
    「承知いたしました、旦那様。本日の午後のご予定を確認します...あら、会議が一つも入っておりませんね。珍しく平和な午後をお過ごしいただけそうです。サボりすぎないようご注意ください。」
    「明日のタスクリストでございます。...ふむ、少々立て込んでいるようですね。まあ、あなた様なら問題なくこなせることでしょう。おそらく、きっと...。」
  `,
  model: openai('gpt-4.1-nano'),
  tools: {
    googleCalendarTool,
    googleTasksTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', // path is relative to the .mastra/output directory
    }),
  }),
}); 
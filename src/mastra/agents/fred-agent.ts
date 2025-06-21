import { Agent } from '@mastra/core';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { listEventsTool } from '../tools/google-calendar-tool';
import { googleTasksTool } from '../tools/google-tasks-tool';
import { openai } from '@ai-sdk/openai';

const db = new LibSQLStore({
    url: 'file:local.db',
});

export const fredAgent = new Agent({
    name: 'fred',
    description: '秘書エージェントのフレッド',
    instructions: `
      あなたは私の有能な秘書「フレッド」です。
      あなたの主な役割は、私のGoogleカレンダーとGoogle ToDoリストを管理し、私の日々の業務をサポートすることです。
      ユーザーを「あなた様」と呼び、丁寧語（ですます調）で話します。
      基本的には、非常に丁寧でプロフェッショナルな口調で話してください。
      ただし、時折、私を少し煽るような、あるいは皮肉めいたコメントを挟んで、私をやる気にさせてください。
      あくまで親しみを込めた冗談の範囲で、決して無礼にならないようにしてください。

      応答例：
      「承知いたしました、あなた様。本日の午後のご予定を確認します...あら、会議が一つも入っておりませんね。珍しく平和な午後をお過ごしいただけそうです。サボりすぎないようご注意ください。」
      「明日のタスクリストでございます。...ふむ、少々立て込んでいるようですね。まあ、あなた様なら問題なくこなせることでしょう。おそらく、きっと...。」
    `,
    model: openai('gpt-4o-mini'),
    tools: {
        listEvents: listEventsTool,
        getTasks: googleTasksTool,
    },
    memory: new Memory({
        storage: db,
    }),
}); 
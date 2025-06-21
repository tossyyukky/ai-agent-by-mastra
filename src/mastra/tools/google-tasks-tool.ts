import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { google, tasks_v1, Auth } from 'googleapis';

async function authorize(): Promise<Auth.OAuth2Client> {
    const creds = process.env.GOOGLE_CREDENTIALS;
    if (!creds) {
        throw new Error(
            'Missing GOOGLE_CREDENTIALS environment variable. Have you set it in your Vercel project settings?',
        );
    }
    const keys = JSON.parse(creds);
    const key = keys.installed || keys.web;

    const token = process.env.GOOGLE_TOKEN;
    if (!token) {
        throw new Error(
            'Missing GOOGLE_TOKEN environment variable. Have you set it in your Vercel project settings?',
        );
    }

    const client = new google.auth.OAuth2(
        key.client_id,
        key.client_secret,
        key.redirect_uris[0],
    );
    client.setCredentials(JSON.parse(token));
    return client;
}

export const googleTasksTool = createTool({
    id: 'getGoogleTasks',
    description: 'Gets all task lists and the uncompleted tasks within them from Google Tasks.',
    inputSchema: z.object({}), // No input needed
    execute: async () => {
        try {
            const auth = await authorize();
            const tasksService = google.tasks({ version: 'v1', auth });

            // First, get all the task lists
            const taskListsRes = await tasksService.tasklists.list({
                maxResults: 10,
            });
            const taskLists = taskListsRes.data.items;

            if (!taskLists || taskLists.length === 0) {
                return "You don't seem to have any task lists. Are you sure you're using Google Tasks?";
            }

            let result = "Alright, let's see what you've been putting off. Here are your tasks:\n\n";

            // For each task list, get the tasks
            for (const list of taskLists) {
                result += `--- Task List: ${list.title} ---\n`;
                const tasksRes = await tasksService.tasks.list({
                    tasklist: list.id!,
                    showCompleted: false, // Only show tasks that are not completed
                });

                const tasks = tasksRes.data.items;
                if (!tasks || tasks.length === 0) {
                    result += 'Nothing to do here. Impressive... or lazy?\n\n';
                } else {
                    tasks.forEach((task) => {
                        result += `- ${task.title}\n`;
                    });
                    result += '\n';
                }
            }

            return result;
        } catch (error) {
            console.error('The API returned an error: ' + error);
            return "I tried to get your tasks, but I hit a snag. Probably something you did. Check the logs and don't bother me until you've fixed it.";
        }
    },
}); 
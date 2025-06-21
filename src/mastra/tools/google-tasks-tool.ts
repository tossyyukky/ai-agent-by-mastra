import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { google, Auth } from 'googleapis';

const TOKEN_PATH = path.resolve(process.cwd(), '../../', 'token.json');

/**
 * Create an OAuth2 client with the credentials from token.json
 */
async function getAuthenticatedClient(): Promise<Auth.OAuth2Client> {
    try {
        const content = await fs.readFile(TOKEN_PATH, 'utf-8');
        const credentials = JSON.parse(content);
        const client = google.auth.fromJSON(credentials);
        return client as Auth.OAuth2Client;
    } catch (err) {
        console.error('Error loading token file:', err);
        throw new Error(
            'Failed to load token.json. Please ensure you have authenticated by running `node google-auth.cjs`'
        );
    }
}

export const googleTasksTool = createTool({
    id: 'getGoogleTasks',
    description: 'Gets all task lists and the uncompleted tasks within them from Google Tasks.',
    inputSchema: z.object({}), // No input needed
    execute: async () => {
        try {
            const auth = await getAuthenticatedClient();
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
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

export const googleCalendarTool = createTool({
    id: 'getUpcomingCalendarEvents',
    description: 'Gets upcoming events from the primary Google Calendar for a specified number of days.',
    inputSchema: z.object({
        days: z.number().int().positive().optional().default(7).describe('The number of days to look ahead for events. Defaults to 7.'),
    }),
    execute: async ({ context }) => {
        const { days } = context;
        try {
            const auth = await getAuthenticatedClient();
            const calendar = google.calendar({ version: 'v3', auth });

            const timeMin = new Date().toISOString();
            const timeMax = new Date(new Date().getTime() + days * 24 * 60 * 60 * 1000).toISOString();

            const res = await calendar.events.list({
                calendarId: 'primary',
                timeMin: timeMin,
                timeMax: timeMax,
                maxResults: 20,
                singleEvents: true,
                orderBy: 'startTime',
            });

            const events = res.data.items;
            if (!events || events.length === 0) {
                return `You have no upcoming events in the next ${days} days. Lucky you! Or maybe you just forgot to add them?`;
            }

            const eventList = events.map((event) => {
                const start = event.start?.dateTime || event.start?.date;
                const formattedStart = new Date(start!).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Tokyo'
                });
                return `- ${formattedStart}: ${event.summary}`;
            }).join('\n');

            return `Of course, I can get that for you. Here are your events for the next ${days} days, try not to be late:\n${eventList}`;
        } catch (error) {
            console.error('The API returned an error: ' + error);
            return 'Hmph. I tried to check your calendar, but something went wrong. Are you sure you gave me the right permissions? Check the logs, I guess.';
        }
    },
}); 
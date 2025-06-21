import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { google, Auth } from 'googleapis';

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

export const listEventsTool = createTool({
    id: 'google_calendar_list_events',
    description: 'Lists the next 10 events on the user\'s primary calendar.',
    inputSchema: z.object({
        days: z.number().default(7).describe('The number of days to look ahead for events.'),
    }),
    outputSchema: z.object({
        events: z.array(z.object({
            summary: z.string().optional(),
            start: z.string().optional().nullable(),
            end: z.string().optional().nullable(),
        })),
    }),
    execute: async ({ context }) => {
        const { days } = context;
        try {
            const auth = await authorize();
            const calendar = google.calendar({ version: 'v3', auth });

            const now = new Date();
            const timeMin = now.toISOString();
            const timeMax = new Date(now.setDate(now.getDate() + days)).toISOString();

            const res = await calendar.events.list({
                calendarId: 'primary',
                timeMin: timeMin,
                timeMax: timeMax,
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime',
            });

            const events = res.data.items;
            if (!events || events.length === 0) {
                return { events: [] };
            }

            return {
                events: events.map((event) => ({
                    summary: event.summary || 'No Title',
                    start: event.start?.dateTime || event.start?.date,
                    end: event.end?.dateTime || event.end?.date,
                })),
            };
        } catch (error) {
            console.error('The API returned an error: ' + error);
            throw new Error('Failed to retrieve calendar events.');
        }
    },
}); 
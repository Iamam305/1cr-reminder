import { Hono } from 'hono';
import { Resend } from 'resend';
import { buildWeeklyReminderHtml } from './emails/weekly-reminder';
import { calculateWeeks, formatDate, getCurrentWeekNumber, getWeeksRemaining } from './utils/weekCalculator';
import type { CloudflareBindings } from './types';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

function isAuthorized(secret: string | undefined, authHeader: string | undefined, cronSecretHeader: string | undefined): boolean {
  if (!secret) return true;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  return (token ?? cronSecretHeader) === secret;
}

app.post('/send-reminder', async (c) => {
  const env = c.env;
  if (!isAuthorized(env.CRON_SECRET, c.req.header('Authorization'), c.req.header('x-cron-secret'))) {
    return c.json({ ok: false, error: 'Unauthorized' }, 401);
  }

  let body: { emails?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid JSON body' }, 400);
  }

  const raw = body.emails;
  if (!Array.isArray(raw) || raw.length === 0) {
    return c.json({ ok: false, error: 'Body must include "emails": non-empty array of email addresses' }, 400);
  }
  const emailRecipients = raw.filter((e): e is string => typeof e === 'string');
  if (emailRecipients.length === 0) {
    return c.json({ ok: false, error: 'Body must include "emails": non-empty array of email addresses' }, 400);
  }

  const weeks = calculateWeeks();
  const currentWeek = getCurrentWeekNumber();
  const weeksRemaining = getWeeksRemaining();
  const totalWeeks = weeks.length;
  const currentDate = formatDate(new Date());
  const html = buildWeeklyReminderHtml({
    weeksRemaining,
    currentWeek,
    totalWeeks,
    weeks,
    currentDate,
  });
  const subject = `[1cr reminder 🚀] ${weeksRemaining} weeks left to march 2028, got 1 cr yet?? 🤔 · ${currentDate}`;

  const resend = new Resend(env.RESEND_API_KEY);
  const [to, ...cc] = emailRecipients;

  const { data, error } = await resend.emails.send({
    from: env.FROM_EMAIL,
    to,
    cc: cc.length > 0 ? cc : undefined,
    subject,
    html,
  });

  if (error) {
    return c.json({ ok: false, error: String(error.message ?? error) }, 500);
  }
  return c.json({ ok: true, sent: data?.id ? 1 : 0, recipients: emailRecipients.length });
});

export default app;

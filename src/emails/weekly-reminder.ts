import type { EmailData, WeekData } from '../types';
import { formatDate } from '../utils/weekCalculator';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getCellColor(status: WeekData['status']): string {
  switch (status) {
    case 'past':
      return '#dc2626';
    case 'current':
      return '#16a34a';
    case 'future':
      return '#e5e7eb';
    default:
      return '#e5e7eb';
  }
}

export function buildWeeklyReminderHtml(data: EmailData): string {
  const { weeksRemaining, currentWeek, totalWeeks, weeks } = data;
  const weeksPerRow = 20;
  const rows: WeekData[][] = [];
  for (let i = 0; i < weeks.length; i += weeksPerRow) {
    rows.push(weeks.slice(i, i + weeksPerRow));
  }

  const startDateStr = weeks[0]
    ? escapeHtml(formatDate(weeks[0].startDate))
    : '';

  let gridRows = '';
  for (const row of rows) {
    let cells = '';
    for (const week of row) {
      const color = getCellColor(week.status);
      const startStr = formatDate(week.startDate);
      const endStr = formatDate(week.endDate);
      const title = `Week ${week.weekNumber}: ${escapeHtml(startStr)} – ${escapeHtml(endStr)}`;
      cells += `<td style="padding:4px 2px;width:16px;vertical-align:top;"><div style="width:12px;height:12px;border-radius:2px;background-color:${color};cursor:default;" title="${title}"></div></td>`;
    }
    const emptyCount = weeksPerRow - row.length;
    for (let i = 0; i < emptyCount; i++) {
      cells += `<td style="padding:4px 2px;width:16px;vertical-align:top;"><div style="width:12px;height:12px;border-radius:2px;background-color:#e5e7eb;"></div></td>`;
    }
    gridRows += `<tr>${cells}</tr>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(String(weeksRemaining))} weeks left to March 2028</title>
</head>
<body style="margin:0;padding:28px 16px;background-color:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
    <tr>
      <td style="padding:20px 40px 10px;">
        <h1 style="margin:0;font-size:32px;line-height:1.3;font-weight:700;color:#1a1a1a;text-align:center;">${escapeHtml(String(weeksRemaining))} weeks left to March 2028</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 30px;">
        <p style="margin:0;font-size:18px;line-height:1.4;color:#666666;text-align:center;">Got 1 cr yet? Keep pushing!</p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 20px;">
        <p style="margin:0 0 6px;font-size:16px;font-weight:600;color:#1a1a1a;">Week Progress Grid</p>
        <p style="margin:0 0 12px;font-size:12px;color:#6b7280;">Hover over a box to see that week's start and end date.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:2px 5px;">
          ${gridRows}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td style="padding:0 10px 0 0;vertical-align:top;">
              <div style="width:12px;height:12px;border-radius:2px;background-color:#dc2626;margin-bottom:4px;"></div>
              <span style="font-size:14px;color:#666666;">Past</span>
            </td>
            <td style="padding:0 10px;vertical-align:top;">
              <div style="width:12px;height:12px;border-radius:2px;background-color:#16a34a;margin-bottom:4px;"></div>
              <span style="font-size:14px;color:#666666;">Current</span>
            </td>
            <td style="padding:0 10px;vertical-align:top;">
              <div style="width:12px;height:12px;border-radius:2px;background-color:#e5e7eb;margin-bottom:4px;"></div>
              <span style="font-size:14px;color:#666666;">Future</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 40px;background-color:#f9fafb;border-radius:6px;">
        <p style="margin:8px 0;font-size:14px;line-height:1.6;color:#333333;"><strong>Current Week:</strong> Week ${escapeHtml(String(currentWeek))} of ${escapeHtml(String(totalWeeks))}</p>
        <p style="margin:8px 0;font-size:14px;line-height:1.6;color:#333333;"><strong>Weeks Remaining:</strong> ${escapeHtml(String(weeksRemaining))}</p>
        <p style="margin:8px 0;font-size:14px;line-height:1.6;color:#333333;"><strong>Start Date:</strong> ${startDateStr}</p>
        <p style="margin:8px 0;font-size:14px;line-height:1.6;color:#333333;"><strong>Target Date:</strong> March 2028</p>
      </td>
    </tr>
    <tr>
      <td style="padding:30px 40px 48px;">
        <p style="margin:0;font-size:12px;line-height:1.5;color:#999999;text-align:center;">This is an automated reminder. Keep working towards your goal!</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

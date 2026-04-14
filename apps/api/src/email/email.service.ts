import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly appUrl: string;
  private readonly fromAddress = 'Picflow <portraits@picflow.app>';

  constructor(private readonly config: AppConfigService) {
    // Empty key in dev — emails will be skipped with a log warning
    this.resend = new Resend(config.get('RESEND_API_KEY') || 're_placeholder');
    this.appUrl = config.get('NEXT_PUBLIC_APP_URL');
  }

  async sendPortraitsReady(opts: {
    to: string;
    shareSlug: string;
  }): Promise<void> {
    const url = `${this.appUrl}/portraits/${opts.shareSlug}`;

    if (!this.config.get('RESEND_API_KEY')) {
      this.logger.warn(`RESEND_API_KEY not set — skipping email to ${opts.to}`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromAddress,
        to: opts.to,
        subject: 'Your baby portraits are ready ✨',
        html: this.buildPortraitsReadyHtml(url),
      });
      this.logger.log(`Portraits-ready email sent to ${opts.to}`);
    } catch (err) {
      // Email failure must never fail the generation — log and continue
      this.logger.error(`Failed to send email to ${opts.to}: ${String(err)}`);
    }
  }

  private buildPortraitsReadyHtml(portraitsUrl: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your baby portraits are ready</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0B;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111113;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:40px;">
        <tr>
          <td style="padding-bottom:32px;">
            <span style="display:inline-block;width:8px;height:8px;background:#8B5CF6;border-radius:2px;margin-right:6px;vertical-align:middle;"></span>
            <span style="color:#F2F2F3;font-size:16px;font-weight:600;vertical-align:middle;">Picflow</span>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:12px;">
            <h1 style="margin:0;font-size:22px;font-weight:600;color:#F2F2F3;line-height:1.3;">
              Your portraits are ready ✨
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:32px;">
            <p style="margin:0;font-size:14px;color:#9898A4;line-height:1.7;">
              We've finished generating your baby portraits. Click below to view and download all four variants.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:40px;">
            <a href="${portraitsUrl}" style="display:inline-block;background:#8B5CF6;color:#ffffff;text-decoration:none;padding:10px 22px;border-radius:6px;font-size:14px;font-weight:500;">
              View portraits →
            </a>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid rgba(255,255,255,0.07);padding-top:24px;">
            <p style="margin:0;font-size:12px;color:#5C5C6B;line-height:1.6;">
              This link is permanent — save it to access your portraits anytime.<br>
              <a href="${this.appUrl}/privacy" style="color:#5C5C6B;">Privacy policy</a>
              &nbsp;·&nbsp;
              <a href="${this.appUrl}/terms" style="color:#5C5C6B;">Terms</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }
}

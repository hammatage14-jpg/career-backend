import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM || 'CareerStart <noreply@careerstart.co.ke>';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

async function safeSendEmail(payload) {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY not set. Email not sent.');
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }
  try {
    const result = await resend.emails.send(payload);
    if (result.error) {
      console.error('[Resend] send error:', result.error);
      return { ok: false, error: String(result.error) };
    }
    return { ok: true };
  } catch (err) {
    const msg = err?.message || String(err);
    console.error('[Resend] Exception while sending email:', msg);
    return { ok: false, error: msg };
  }
}

export async function sendVerificationEmail(to, name, verificationUrl) {
  const html = `
    <p>Hi ${name},</p>
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="${verificationUrl}">Verify my email</a></p>
    <p>The link expires in 24 hours.</p>
    <p>— CareerStart</p>
  `;

  const text = `Hi ${name},

Please verify your email by clicking this link:
${verificationUrl}

The link expires in 24 hours.

— CareerStart`;

  const { ok } = await safeSendEmail({
    from: resendFrom,
    to,
    subject: 'Verify your email — CareerStart',
    html,
    text,
  });

  return ok;
}

export async function sendOTPEmail(to, otp) {
  const html = `
    <h2>Email Verification</h2>
    <p>Your verification code is:</p>
    <h1 style="font-size: 32px; letter-spacing: 4px; margin: 16px 0;">${otp}</h1>
    <p>This code expires in 10 minutes.</p>
    <p>— CareerStart</p>
  `;

  const text = `Your verification code is: ${otp}

This code expires in 10 minutes.

— CareerStart`;

  const { ok } = await safeSendEmail({
    from: resendFrom,
    to,
    subject: 'Verify your email — CareerStart',
    html,
    text,
  });

  return ok;
}

export async function sendPasswordResetEmail(to, name, resetUrl) {
  const html = `
    <p>Hi ${name},</p>
    <p>You requested a password reset. Click the link below to set a new password:</p>
    <p><a href="${resetUrl}">Reset my password</a></p>
    <p>The link expires in 1 hour.</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <p>— CareerStart</p>
  `;

  const text = `Hi ${name},

You requested a password reset. Click this link to set a new password:
${resetUrl}

The link expires in 1 hour.
If you didn't request this, you can safely ignore this email.

— CareerStart`;

  const result = await safeSendEmail({
    from: resendFrom,
    to,
    subject: 'Reset your password — CareerStart',
    html,
    text,
  });

  return result;
}

export async function sendWelcomeEmail(to, name) {
  const html = `
    <p>Hi ${name || 'there'},</p>
    <p>Welcome to <strong>CareerStart</strong> — your hub for internships, attachments and early‑career opportunities.</p>
    <p>Here’s what you can do next:</p>
    <ul>
      <li><strong>Complete your profile</strong> so employers can quickly understand your skills and experience.</li>
      <li><strong>Browse live opportunities</strong> and save the ones that match your interests.</li>
      <li><strong>Apply in a few clicks</strong> and track every application from your dashboard.</li>
    </ul>
    <p>We’re excited to be part of your journey.</p>
    <p>— CareerStart Team</p>
  `;

  const text = `Hi ${name || 'there'},

Welcome to CareerStart — your hub for internships, attachments and early‑career opportunities.

Here’s what you can do next:
- Complete your profile so employers can quickly understand your skills and experience.
- Browse live opportunities and save the ones that match your interests.
- Apply in a few clicks and track every application from your dashboard.

We’re excited to be part of your journey.

— CareerStart Team`;

  return safeSendEmail({
    from: resendFrom,
    to,
    subject: 'Welcome to CareerStart',
    html,
    text,
  });
}

export async function sendApplicationReceivedEmail({ to, name, opportunityTitle }) {
  const html = `
    <p>Hi ${name || 'there'},</p>
    <p>We’ve received your application for <strong>${opportunityTitle}</strong>.</p>
    <p>Our team (or the hiring company) will review your application. You can track the status from your CareerStart dashboard.</p>
    <p>— CareerStart Team</p>
  `;

  const text = `Hi ${name || 'there'},

We’ve received your application for "${opportunityTitle}".

Our team (or the hiring company) will review your application. You can track the status from your CareerStart dashboard.

— CareerStart Team`;

  return safeSendEmail({
    from: resendFrom,
    to,
    subject: `Your application for ${opportunityTitle} was received`,
    html,
    text,
  });
}

export async function sendApplicationStatusChangedEmail({ to, name, opportunityTitle, status }) {
  const lowered = String(status || '').toLowerCase();
  let subject;
  let html;
  let text;

  if (lowered === 'shortlisted') {
    subject = `You’ve been shortlisted for ${opportunityTitle}`;
    html = `
      <p>Hi ${name || 'there'},</p>
      <p>Great news — you’ve been <strong>SHORTLISTED</strong> for <strong>${opportunityTitle}</strong>.</p>
      <p>You have been scheduled for a virtual interview approximately five days from today. The hiring company or our team will send you the exact date, time and meeting link shortly.</p>
      <p>Please keep an eye on your inbox and your CareerStart dashboard so you don’t miss any updates.</p>
      <p>— CareerStart Team</p>
    `;
    text = `Hi ${name || 'there'},

Great news — you’ve been SHORTLISTED for "${opportunityTitle}".

You have been scheduled for a virtual interview approximately five days from today. The hiring company or our team will send you the exact date, time and meeting link shortly.

Please keep an eye on your inbox and your CareerStart dashboard so you don’t miss any updates.

— CareerStart Team`;
  } else if (lowered === 'accepted') {
    subject = `Congratulations — your application for ${opportunityTitle} was accepted`;
    html = `
      <p>Hi ${name || 'there'},</p>
      <p><strong>Congratulations!</strong> Your application for <strong>${opportunityTitle}</strong> has been <strong>ACCEPTED</strong>.</p>
      <p>The hiring company or our team will get in touch with you soon with next steps. Keep an eye on your inbox and your CareerStart dashboard.</p>
      <p>Well done — this is a big step in your career journey.</p>
      <p>— CareerStart Team</p>
    `;
    text = `Hi ${name || 'there'},

Congratulations! Your application for "${opportunityTitle}" has been ACCEPTED.

The hiring company or our team will get in touch with you soon with next steps. Keep an eye on your inbox and your CareerStart dashboard.

Well done — this is a big step in your career journey.

— CareerStart Team`;
  } else if (lowered === 'rejected') {
    subject = `Update on your application for ${opportunityTitle}`;
    html = `
      <p>Hi ${name || 'there'},</p>
      <p>Thank you for applying for <strong>${opportunityTitle}</strong>.</p>
      <p>After careful review, we’re sorry to let you know that your application was not successful this time.</p>
      <p>Please don’t be discouraged — many successful candidates apply several times before finding the right fit.</p>
      <p>We’d love you to keep building your career with us: log in to CareerStart to explore more opportunities and apply to other roles that match your skills and interests.</p>
      <p>— CareerStart Team</p>
    `;
    text = `Hi ${name || 'there'},

Thank you for applying for "${opportunityTitle}".

After careful review, we’re sorry to let you know that your application was not successful this time.

Please don’t be discouraged — many successful candidates apply several times before finding the right fit.
We’d love you to keep building your career with us: log in to CareerStart to explore more opportunities and apply to other roles that match your skills and interests.

— CareerStart Team`;
  } else {
    subject = `Your application status changed: ${status}`;
    html = `
      <p>Hi ${name || 'there'},</p>
      <p>The status of your application for <strong>${opportunityTitle}</strong> has changed to <strong>${status}</strong>.</p>
      <p>Log in to your CareerStart dashboard for full details.</p>
      <p>— CareerStart Team</p>
    `;
    text = `Hi ${name || 'there'},

The status of your application for "${opportunityTitle}" has changed to: ${status}.

Log in to your CareerStart dashboard for full details.

— CareerStart Team`;
  }

  return safeSendEmail({
    from: resendFrom,
    to,
    subject,
    html,
    text,
  });
}

export async function sendAdminNewOpportunityEmail({ to, title, company }) {
  const html = `
    <p>New opportunity created on CareerStart.</p>
    <p><strong>Title:</strong> ${title}</p>
    <p><strong>Company:</strong> ${company}</p>
  `;

  const text = `New opportunity created on CareerStart.

Title: ${title}
Company: ${company}`;

  return safeSendEmail({
    from: resendFrom,
    to,
    subject: `New opportunity posted: ${title}`,
    html,
    text,
  });
}

export async function sendAdminNewApplicationEmail({ to, opportunityTitle, applicantName, applicantEmail }) {
  const html = `
    <p>New application submitted on CareerStart.</p>
    <p><strong>Opportunity:</strong> ${opportunityTitle}</p>
    <p><strong>Applicant:</strong> ${applicantName} (${applicantEmail})</p>
  `;

  const text = `New application submitted on CareerStart.

Opportunity: ${opportunityTitle}
Applicant: ${applicantName} (${applicantEmail})`;

  return safeSendEmail({
    from: resendFrom,
    to,
    subject: `New application for ${opportunityTitle}`,
    html,
    text,
  });
}

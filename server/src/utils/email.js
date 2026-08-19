const { Resend } = require('resend');

const FROM_EMAIL = process.env.EMAIL_FROM || 'SlotWise <onboarding@resend.dev>';

let resend = null;
function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

async function sendBookingConfirmation({ to, customerName, businessName, serviceName, date, startTime }) {
  const client = getClient();
  if (!to || !client) return;

  try {
    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Booking request received — ${businessName}`,
      html: `
        <p>Hi ${customerName},</p>
        <p>Your booking request with <strong>${businessName}</strong> has been received and is pending confirmation.</p>
        <ul>
          <li>Service: ${serviceName}</li>
          <li>Date: ${date}</li>
          <li>Time: ${startTime}</li>
        </ul>
        <p>You'll hear back once the business confirms your appointment.</p>
      `,
    });
  } catch (err) {
    console.error('Failed to send customer confirmation email:', err.message);
  }
}

async function sendOwnerNotification({ to, ownerName, customerName, customerPhone, serviceName, date, startTime }) {
  const client = getClient();
  if (!to || !client) return;

  try {
    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `New booking request from ${customerName}`,
      html: `
        <p>Hi ${ownerName},</p>
        <p>You have a new booking request:</p>
        <ul>
          <li>Customer: ${customerName} (${customerPhone})</li>
          <li>Service: ${serviceName}</li>
          <li>Date: ${date}</li>
          <li>Time: ${startTime}</li>
        </ul>
        <p>Log in to your dashboard to confirm or decline it.</p>
      `,
    });
  } catch (err) {
    console.error('Failed to send owner notification email:', err.message);
  }
}

module.exports = { sendBookingConfirmation, sendOwnerNotification };

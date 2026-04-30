import { Resend } from "resend";

export async function sendBidNotificationEmail({ customerEmail, photographerName, jobDescription, bidPrice, bidProposal }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
  const to = process.env.RESEND_TEST_EMAIL || customerEmail;
  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Sait uuden tarjouksen – kuvauspalvelut.fi",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1E3A8A;">Uusi tarjous tarjouspyyntöösi</h2>
        <p>Kuvaaja <strong>${photographerName}</strong> on jättänyt tarjouksen pyyntöösi:</p>
        <blockquote style="border-left: 3px solid #E2E8F0; padding-left: 1rem; color: #475569;">
          ${jobDescription}
        </blockquote>
        <table style="margin: 1.5rem 0; border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 0.5rem 1rem 0.5rem 0; color: #64748B; font-size: 14px;">Hinta</td>
            <td style="padding: 0.5rem 0; font-weight: 600; color: #0F172A;">€${bidPrice}</td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 1rem 0.5rem 0; color: #64748B; font-size: 14px; vertical-align: top;">Viesti</td>
            <td style="padding: 0.5rem 0; color: #0F172A;">${bidProposal}</td>
          </tr>
        </table>
        <a href="https://kuvauspalvelut.fi/view-bids" style="display: inline-block; padding: 0.75rem 1.5rem; background-color: #1E3A8A; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Katso tarjous
        </a>
        <p style="margin-top: 2rem; font-size: 12px; color: #94A3B8;">kuvauspalvelut.fi</p>
      </div>
    `,
  });
  return result;
}

export async function sendBidAcceptedEmail({ photographerEmail, customerEmail, customerPhone, jobDescription, bidPrice }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
  const to = process.env.RESEND_TEST_EMAIL || photographerEmail;
  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Tarjouksesi hyväksyttiin – kuvauspalvelut.fi",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1E3A8A;">Tarjouksesi hyväksyttiin!</h2>
        <p>Asiakas on hyväksynyt tarjouksesi projektiin:</p>
        <blockquote style="border-left: 3px solid #E2E8F0; padding-left: 1rem; color: #475569;">
          ${jobDescription}
        </blockquote>
        <table style="margin: 1.5rem 0; border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 0.5rem 1rem 0.5rem 0; color: #64748B; font-size: 14px;">Hyväksytty hinta</td>
            <td style="padding: 0.5rem 0; font-weight: 600; color: #0F172A;">€${bidPrice}</td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 1rem 0.5rem 0; color: #64748B; font-size: 14px;">Asiakkaan sähköposti</td>
            <td style="padding: 0.5rem 0; color: #0F172A;">${customerEmail || "–"}</td>
          </tr>
          ${customerPhone ? `
          <tr>
            <td style="padding: 0.5rem 1rem 0.5rem 0; color: #64748B; font-size: 14px;">Puhelinnumero</td>
            <td style="padding: 0.5rem 0; color: #0F172A;">${customerPhone}</td>
          </tr>` : ""}
        </table>
        <p style="color: #475569; font-size: 14px;">Ota yhteyttä asiakkaaseen sovitaksesi projektin yksityiskohdista.</p>
        <a href="https://kuvauspalvelut.fi/my-bids" style="display: inline-block; padding: 0.75rem 1.5rem; background-color: #1E3A8A; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Katso tarjoukseni
        </a>
        <p style="margin-top: 2rem; font-size: 12px; color: #94A3B8;">kuvauspalvelut.fi</p>
      </div>
    `,
  });
  return result;
}

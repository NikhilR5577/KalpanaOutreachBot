export function getOutreachEmailHTML(hospitalName, siteUrl) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Indoor Navigation for ${hospitalName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0a1a; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a1a; width: 100%; max-width: 600px; margin: 0 auto;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <h1 style="color: #3b82f6; margin: 0; font-size: 28px;">Kalpana TechLabs</h1>
        <p style="color: #a0aec0; margin-top: 10px; font-size: 16px;">Zero-friction QR-based indoor navigation</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px;">
        <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">Dear ${hospitalName} Team,</p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">
          We are Kalpana TechLabs, an Indian HealthTech startup from Madhya Pradesh. We have built <strong>Aspatal Disha</strong> — a zero-friction QR-based indoor navigation system for hospitals.
        </p>

        <div style="background-color: #1e1e38; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #e2e8f0;">
            <strong>Currently live at District Hospital Sagar, M.P.</strong> The system received a Certificate of Appreciation from the Government of Madhya Pradesh.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://youtube.com/shorts/uKDTOD5HxyY" style="background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Watch YouTube Demo</a>
        </div>

        <h3 style="color: #3b82f6; font-size: 20px; margin-top: 30px;">Key Benefits</h3>
        <ul style="font-size: 16px; line-height: 1.6; color: #e2e8f0; padding-left: 20px;">
          <li style="margin-bottom: 10px;">No app download required</li>
          <li style="margin-bottom: 10px;">Hindi & English voice search</li>
          <li style="margin-bottom: 10px;">Wheelchair accessible routes</li>
          <li style="margin-bottom: 10px;">Real-time 2D hospital maps</li>
        </ul>

        <h3 style="color: #3b82f6; font-size: 20px; margin-top: 30px;">Pricing</h3>
        <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">
          <strong>Government/Pilot:</strong> Free<br>
          <strong>Private Hospital:</strong> ₹1,00,000 setup + ₹60,000/year AMC
        </p>

        <div style="text-align: center; margin: 40px 0;">
          <a href="${siteUrl}/#contact" style="background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 18px; display: inline-block;">Book a Free Demo</a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px 20px; text-align: center; border-top: 1px solid #1e1e38;">
        <p style="margin: 0; font-size: 14px; color: #a0aec0;">
          Nikhil Rajput, Founder — Kalpana TechLabs<br>
          <a href="mailto:kalpanatechlabs@gmail.com" style="color: #3b82f6; text-decoration: none;">kalpanatechlabs@gmail.com</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

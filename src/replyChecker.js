import { ImapFlow } from 'imapflow';
import 'dotenv/config';
import { getAllHospitals, saveReply, markHospitalReplied } from './db.js';
import { simpleParser } from 'mailparser';
export async function checkForReplies() {
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    logger: false,
  });

  const newReplies = [];

  try {
    await client.connect();
    let lock = await client.getMailboxLock('INBOX');
    try {
      const hospitals = await getAllHospitals();
      
      for await (let msg of client.fetch({ unseen: true }, { envelope: true, source: true })) {
        const fromEmail = msg.envelope.from[0].address;
        const subject = msg.envelope.subject;
        const parsed = await simpleParser(msg.source);
        let preview = parsed.text ? parsed.text.replace(/\s+/g, ' ').substring(0, 200).trim() : '';

        let matchedHospital = hospitals.find(h => 
            h.email.toLowerCase() === fromEmail.toLowerCase() || 
            (subject && subject.toLowerCase().includes(h.name.toLowerCase()))
        );

        if (matchedHospital) {
            await saveReply(matchedHospital.id, fromEmail, subject, preview);
            await markHospitalReplied(matchedHospital.id);
            await client.messageFlagsAdd(msg.uid, ['\\Seen'], { uid: true });
            newReplies.push({
                hospitalName: matchedHospital.name,
                from: fromEmail,
                subject: subject,
                preview: preview
            });
        }
      }
    } finally {
      lock.release();
    }
  } catch (error) {
    console.error('IMAP Error:', error);
  } finally {
    try { await client.logout(); } catch(e) {}
  }
  
  return newReplies;
}

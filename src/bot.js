import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
import http from 'http';
import 'dotenv/config';

import { 
    getUnsentHospitals, getAllHospitals, addHospital, 
    markHospitalSent, getLatestReplies, getStats, logOutreachEmail
} from './db.js';
import { sendOutreachEmail } from './mailer.js';
import { checkForReplies } from './replyChecker.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const welcomeText = `🏥 Kalpana TechLabs Outreach Bot

Available commands:
/sendoutreach — Send emails to next 5 hospitals
/status — View outreach statistics
/listhospitals — List all hospitals
/addhospital — Add a hospital
/replies — View latest replies`;
  bot.sendMessage(msg.chat.id, welcomeText);
});

bot.onText(/\/sendoutreach/, async (msg) => {
    try {
        const hospitals = await getUnsentHospitals(5);
        if (hospitals.length === 0) {
            bot.sendMessage(msg.chat.id, "✅ All hospitals have been contacted!");
            return;
        }

        let sentCount = 0;
        for (const hospital of hospitals) {
            bot.sendMessage(msg.chat.id, `📧 Sending to ${hospital.name}...`);
            try {
                const subject = await sendOutreachEmail(hospital);
                await markHospitalSent(hospital.id);
                await logOutreachEmail(hospital.id, subject);
                bot.sendMessage(msg.chat.id, `✅ Sent!`);
                sentCount++;
            } catch (err) {
                bot.sendMessage(msg.chat.id, `❌ Failed to send to ${hospital.name}: ${err.message}`);
            }
        }
        bot.sendMessage(msg.chat.id, `🎉 Done! Sent ${sentCount} emails.`);
    } catch (err) {
        bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`);
    }
});

bot.onText(/\/status/, async (msg) => {
    try {
        const stats = await getStats();
        const text = `📊 Outreach Status

🏥 Total hospitals: ${stats.totalHospitals || 0}
📧 Emails sent: ${stats.sentCount || 0}
💬 Replies received: ${stats.repliedCount || 0}
📋 Remaining: ${stats.remaining || 0}`;
        bot.sendMessage(msg.chat.id, text);
    } catch (err) {
        bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`);
    }
});

bot.onText(/\/listhospitals/, async (msg) => {
    try {
        const hospitals = await getAllHospitals();
        if (hospitals.length === 0) {
            bot.sendMessage(msg.chat.id, "No hospitals found.");
            return;
        }
        
        let text = "";
        for (const h of hospitals) {
            let icon = "⏳";
            if (h.replied) icon = "✅";
            else if (h.sent) icon = "📧";
            text += `${icon} ${h.name} (${h.city}) — ${h.email}\n`;
        }
        bot.sendMessage(msg.chat.id, text.substring(0, 4000));
    } catch (err) {
        bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`);
    }
});

bot.onText(/\/addhospital(.*)/, async (msg, match) => {
    const args = match[1].trim();
    if (!args) {
        bot.sendMessage(msg.chat.id, "Usage: /addhospital Name | Email | City");
        return;
    }
    
    const parts = args.split('|').map(p => p.trim());
    if (parts.length !== 3) {
        bot.sendMessage(msg.chat.id, "Usage: /addhospital Name | Email | City");
        return;
    }
    
    const [name, email, city] = parts;
    try {
        await addHospital(name, email, city);
        bot.sendMessage(msg.chat.id, `✅ Added ${name} from ${city}!`);
    } catch (err) {
        bot.sendMessage(msg.chat.id, `❌ Error adding hospital: ${err.message}`);
    }
});

bot.onText(/\/replies/, async (msg) => {
    try {
        const replies = await getLatestReplies(5);
        if (replies.length === 0) {
            bot.sendMessage(msg.chat.id, "No replies yet. Keep going! 💪");
            return;
        }
        
        let text = "";
        for (const r of replies) {
            const timeAgo = Math.floor((new Date() - new Date(r.received_at || r.created_at || new Date())) / (1000 * 60 * 60)); // hours
            const timeStr = timeAgo < 24 ? `${timeAgo}h ago` : `${Math.floor(timeAgo/24)}d ago`;
            const hName = r.hospitals ? r.hospitals.name : 'Unknown';
            const hCity = r.hospitals ? r.hospitals.city : 'Unknown';
            text += `🏥 ${hName}, ${hCity}\n📧 From: ${r.from_email}\n💬 ${r.preview}\n🕐 ${timeStr}\n\n`;
        }
        bot.sendMessage(msg.chat.id, text);
    } catch (err) {
        bot.sendMessage(msg.chat.id, `❌ Error: ${err.message}`);
    }
});

bot.on('document', async (msg) => {
    try {
        const doc = msg.document;
        if (!doc.file_name.endsWith('.csv') && doc.mime_type !== 'text/csv') {
            bot.sendMessage(msg.chat.id, "❌ Please send a .csv file.");
            return;
        }

        bot.sendMessage(msg.chat.id, "⏳ Downloading and parsing CSV...");
        const fileLink = await bot.getFileLink(doc.file_id);
        const response = await fetch(fileLink);
        const text = await response.text();

        const { parse } = await import('csv-parse/sync');
        const records = parse(text, {
            skip_empty_lines: true,
            relax_column_count: true
        });

        let addedCount = 0;
        let skipCount = 0;

        for (const row of records) {
            if (row[0] && row[0].toLowerCase().includes('name')) {
                skipCount++;
                continue;
            }

            const name = row[0]?.trim();
            const email = row[1]?.trim();
            const city = row[2]?.trim();

            if (name && email && city) {
                try {
                    await addHospital(name, email, city);
                    addedCount++;
                } catch (e) {
                    skipCount++;
                }
            } else {
                skipCount++;
            }
        }

        bot.sendMessage(msg.chat.id, `✅ CSV Processed!\n\n🏥 Added: ${addedCount} hospitals\n⏭️ Skipped: ${skipCount} rows (headers or invalid)`);
    } catch (err) {
        bot.sendMessage(msg.chat.id, `❌ Error processing CSV: ${err.message}`);
    }
});

cron.schedule('*/30 * * * *', async () => {
  try {
      const replies = await checkForReplies();
      for (const reply of replies) {
        bot.sendMessage(chatId, 
          `🔔 NEW HOSPITAL REPLY!\n\n🏥 ${reply.hospitalName}\n📧 From: ${reply.from}\n💬 "${reply.preview}"\n\nCheck your Gmail to respond!`);
      }
  } catch(err) {
      console.error('Error checking replies in cron:', err);
  }
});

console.log('🤖 Kalpana Outreach Bot is running...');
console.log('📬 Reply checker will run every 30 minutes.');

// ─── Keep-Alive HTTP Server (prevents Render from sleeping) ───────────────────
// UptimeRobot pings /health every 14 min → Render stays awake 24/7 for FREE
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', bot: 'KalpanaOutreachBot', uptime: process.uptime() }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('🤖 Kalpana Outreach Bot is alive!');
  }
}).listen(PORT, () => {
  console.log(`🌐 Health server running on port ${PORT} — ping /health to keep awake`);
});


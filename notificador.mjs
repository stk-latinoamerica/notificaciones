import { createRequire } from 'module';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const require = createRequire(import.meta.url);

const TelegramBot = require('node-telegram-bot-api');

export { };

const ESChannel = CODE_ES_CHANNEL;
const PTChannel = CODE_ES_CHANNEL;
const reportsChannel = CODE_REPORTS_CHANNEL;
const botToken = CODE_BOTS_TOKEN;
const dbLocation = CODE_DB_LOCATION;
// serverName[1] will contain the name of the server BR1, AR1, MIAMI1. serverName[2] the name of server BR2, AR2, MIAMI2, etc.
// For instance, it is set as ['', 'Clang+Musl STK', 'Miami Football', 'Assorted Add-Ons', '50 Laps', '', '', '', '', '', ''] in the Brazilian server.
// Please leave it blank if SERVER[number] is not currently in use. This prevents needless DB polling.
const serverName = ['', '', '', '', '', '', '', '', '', '', ''];
const introMessage = '<b>MIAMI:</b>'; // Usually MIAMI, ARGENTINA, BRASIL, CHILE, etc. It is the header for Telegram notifications.

const bot = new TelegramBot(botToken);

const db = await open({
  filename: dbLocation,
  driver: sqlite3.Database,
});

// replace SERVER with AR, BR, CH, MIAMI, etc., in according with DB structure.
  new Set((await db.all('SELECT distinct username FROM v1_SERVER1_current_players ORDER BY username ASC')).map((u) => u.username)),
  new Set((await db.all('SELECT distinct username FROM v1_SERVER2_current_players ORDER BY username ASC')).map((u) => u.username)),
  new Set((await db.all('SELECT distinct username FROM v1_SERVER3_current_players ORDER BY username ASC')).map((u) => u.username)),
  new Set((await db.all('SELECT distinct username FROM v1_SERVER4_current_players ORDER BY username ASC')).map((u) => u.username)),
  new Set((await db.all('SELECT distinct username FROM v1_SERVER5_current_players ORDER BY username ASC')).map((u) => u.username)),
  new Set((await db.all('SELECT distinct username FROM v1_SERVER6_current_players ORDER BY username ASC')).map((u) => u.username)),
  new Set((await db.all('SELECT distinct username FROM v1_SERVER7_current_players ORDER BY username ASC')).map((u) => u.username)),
  new Set((await db.all('SELECT distinct username FROM v1_SERVER8_current_players ORDER BY username ASC')).map((u) => u.username)),
  new Set((await db.all('SELECT distinct username FROM v1_SERVER9_current_players ORDER BY username ASC')).map((u) => u.username)),
  new Set((await db.all('SELECT distinct username FROM v1_SERVER10_current_players ORDER BY username ASC')).map((u) => u.username))
]

// The iterator i is used to poll the corresponding server table and get the corresponding server name from serverName.
// Leave serverName blank to avoid needless DB querying and optimize performance a little bit.
// Again, replace SERVER with AR, BR, CH, MIAMI and so on.
// I could have set a loop to set de different messages for each language, I know.
async function poll() {
  try { for (let i = 1; i < 11; i++) { if (serverName[i] != '') {
    let users = (await db.all('SELECT distinct username FROM v1_SERVER' + i + '_current_players ORDER BY username ASC')).map((u) => u.username);
    let joined = users.filter((u) => !userSet[i].has(u));
    let left = Array.from(userSet[i].values()).filter((u) => !users.includes(u));
    if (joined.length > 0 || left.length > 0) {
      let joinedMessage = `${joined.join(', ')} ${joined.length != 1 ? 'conectaron en <b>' + serverName[i] +'</b>' : 'conectó en <b>' + serverName[i] + '</b>'}`;
      let leftMessage = `${left.join(', ')} ${left.length != 1 ? 'salieron de ' + serverName[i] : 'salió de ' + serverName[i]}`;
      let statusMessage = `Hay ${users.length} ${users.length != 1 ? 'jugadores' : 'jugador'} en línea en ${serverName[i]}${users.length > 0 ? ': ' +
 users.join(', ') : ''}`;
      let message = `${introMessage}\n${joined.length > 0 ? `${joinedMessage}\n` : ''}${left.length > 0 ? `${leftMessage}\n` : ''}${statusMessage}`;
      let joinedMessagePT = `${joined.join(', ')} ${joined.length != 1 ? 'entraram no servidor <b>' + serverName[i] + '</b>'  : 'entrou no servidor <b>' + serverName[i] + '</b>'}`;
      let leftMessagePT = `${left.join(', ')} ${left.length != 1 ? 'saíram do servidor ' + serverName[i] : 'saiu do servidor ' + serverName[i]}`;
      let statusMessagePT = `Há ${users.length} ${users.length != 1 ? 'jogadores' : 'jogador'} no servidor ${serverName[i]}${users.length > 0 ? ': ' +
users.join(', ') : ''}`;
      let messagePT = `${introMessage}\n${joined.length > 0 ? `${joinedMessagePT}\n` : ''}${left.length > 0 ? `${leftMessagePT}\n` : ''}${statusMessagePT}`;
      bot.sendMessage(PTChannel, messagePT, { parse_mode: "html" });
      bot.sendMessage(ESChannel, message, { parse_mode: "html" });
      joined.forEach((u) => userSet[i].add(u));
      left.forEach(u => userSet[i].delete(u));
	}
    }
    }
/* This is the code for the reports channel. It polls the reports table, copies the messages to table oldReports and then erases the reports table.
 * As of December 2022, it is in Portuguese, and I have no plans to set different channels for different languages.
 * If you'd prefer to have the reports in Spanish or English, I'd have no issue with that.
 * Again, replace SERVER with AR, BR, MIAMI, PERU, etc.
 * the server_uid variable is usually AR1, BR1, MIAMI1, etc.
 * As such, if we remove SERVER from it, we could use it to probe serverName to get the corresponding server location
 * I probably should set different functions for player notifications and reports notifications,
 * and cast them in a main function that could be called at the end, instead of poll().
 *
 * People could probably abuse it it they include the </code> string within their report.
 */

    db.each('SELECT server_uid, reporter_username, reporting_username, info, reported_time FROM player_SERVER_reports ORDER BY reported_time DESC LIMIT 1', (err,reports) => {
      if (reports.info != undefined) {
        let message;
        if (reports.reporter_username == reports.reporting_username) {
          message = '🤔 ' + reports.reporter_username + ' relata o seguinte em <b>' + serverName[reports.server_uid.replace('SERVER','')] + '</b> 🤔:\n\n<code>' + reports.info + '</code>';
        } else {
          message = reports.reporter_username + ' faz a seguinte 😱😱😱<b><u>ACUSAÇÃO</u></b>😱😱😱 contra ' + reports.reporting_username + ' no servidor <b>' + serverName[reports.server_uid.replace('MIAMI','')] + '</b>:\n\n<code>' + reports.info + '</code>';
        }   
        bot.sendMessage(reportsChannel, message, {parse_mode: "html"});
        db.run('INSERT INTO oldReports(server_uid, reporter_username, reporting_username, info, reported_time) VALUES( ?, ?, ?, ?, ? )', [ reports.server_uid, reports.reporter_username, reports.reporting_username, reports.info, reports.reported_time]);
        db.run('DELETE FROM player_MIAMI_reports WHERE reported_time = ?', reports.reported_time);
	};
    });
  } catch (err) {
    console.log(err);
  }
  setTimeout(poll, 5000);
}

poll();

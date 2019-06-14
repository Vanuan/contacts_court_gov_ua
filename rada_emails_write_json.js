var emails_html = require('./rada_emails.js')
const cheerio = require('cheerio')
const $ = cheerio.load(emails_html)
const rows = $('div.row')
let field_names = {
  'ЄДРПОУ:': 'edrpou',
  'Юридична адреса:': 'official_address',
  'Поштова адреса:': 'mail_address',
  'Адреса електронної пошти:': 'email',
  'Номер факсу (телефаксу):': 'fax',
};
radas = rows.map((i, row) => {
  let rada = {};
  let field_name = null;
  let fields = $(row).find('div').map((i, row) => {
    let div_class = $(row).attr('class');
    if (div_class == 'name') {
      rada['name'] = $(row).find('a').text();
      rada['url'] = $(row).find('a').attr('href')
    } else if (div_class == 'left') {
      let left = $(row).text().trim();
      field_name = field_names[left]
      if(!field_name) throw ("Unknown field " + left);
    } else if (div_class == 'right') {
      let right = $(row).text().trim();
      rada[field_name] = right;
    } else if (div_class == 'clear') {
      current_field = null;
    } else {
      rada['raw'] = $(row).text();
    }
  })
  return rada;
}).get();

const writeCsv = (records, filename) => {
  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const csvWriter = createCsvWriter({
      path: filename,
      fieldDelimiter: ';',
      header: [
          {id: 'edrpou', title: 'edrpou'},
          {id: 'official_address', title: 'official_address'},
          {id: 'mail_address', title: 'mail_address'},
          {id: 'email', title: 'email'},
          {id: 'fax', title: 'fax'},
      ]
  });
   
  return csvWriter.writeRecords(records);
}
console.log(JSON.stringify(radas));
writeCsv(radas, 'data/radas_email_court_gov_ua.csv')

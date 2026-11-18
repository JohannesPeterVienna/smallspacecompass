/* CSV cells. A cell that a spreadsheet would run as a formula (starts with = + - @, tab or CR) gets a leading
   apostrophe; quotes, commas and line breaks are quoted. Pure, shared by the reference table and the storage audit. */
export function csvCell(v) {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
export const csvLine = (cells) => cells.map(csvCell).join(',');
export const csvFile = (lines) => lines.join('\r\n') + '\r\n';

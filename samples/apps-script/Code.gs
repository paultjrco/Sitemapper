/**
 * Publishes every tab in this spreadsheet as JSON for Sitemapper's
 * "Load from Sheet" feature — one tab per sitemap version (V0, V1, V2...).
 * See samples/sheet-import-example.json in the Sitemapper repo for the
 * exact shape this produces.
 *
 * Setup: Extensions > Apps Script (from within the Sheet), paste this file's
 * contents in as Code.gs, then Deploy > New deployment > Web app
 * (Execute as: Me, Who has access: Anyone), and paste the resulting /exec
 * URL into Sitemapper's "Import from Google Sheet" field.
 */

const HEADERS = ['Section', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Parent', 'Notes', 'Type', 'Color'];

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tabs = ss.getSheets().map(sheet => ({
    sheetName: sheet.getName(),
    pages: readPages(sheet)
  }));
  const payload = {
    spreadsheetName: ss.getName(),
    generatedAt: new Date().toISOString(),
    tabs: tabs
  };
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function readPages(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2) return [];

  const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0]
    .map(h => String(h).trim());
  const colIndex = name => headerRow.indexOf(name);

  const sectionCol = colIndex('Section');
  const parentCol = colIndex('Parent');
  const notesCol = colIndex('Notes');
  const typeCol = colIndex('Type');
  const colorCol = colIndex('Color');
  const levelCols = [1, 2, 3, 4].map(n => colIndex('Level ' + n));

  const numRows = lastRow - 1;
  const values = sheet.getRange(2, 1, numRows, lastCol).getValues();
  const richValues = sheet.getRange(2, 1, numRows, lastCol).getRichTextValues();

  const pages = [];
  for (let r = 0; r < numRows; r++) {
    const row = values[r];
    const richRow = richValues[r];

    let level = null, nameCell = null, nameRich = null;
    for (let li = 0; li < levelCols.length; li++) {
      const c = levelCols[li];
      if (c === -1) continue;
      const v = row[c];
      if (v !== '' && v !== null && v !== undefined) {
        level = li + 1;
        nameCell = v;
        nameRich = richRow[c];
        break;
      }
    }
    if (level === null) continue; // blank row, or no Level cell populated

    const section = sectionCol === -1 ? 'main' : String(row[sectionCol] || 'main').trim().toLowerCase();
    const name = cellToValue(String(nameCell), nameRich);
    const parent = parentCol === -1 || !row[parentCol] ? null : String(row[parentCol]).trim();
    const notes = notesCol === -1 ? [] : parseNotes(String(row[notesCol] || ''), richRow[notesCol]);
    const type = typeCol === -1 || !row[typeCol] ? null : String(row[typeCol]).trim().toLowerCase();
    const color = colorCol === -1 || !row[colorCol] ? null : String(row[colorCol]).trim().toLowerCase();

    pages.push({ section, level, name, parent, notes, type, color });
  }
  return pages;
}

// Whole-cell hyperlink (Insert > Link over the entire cell text) -> {text,url}
function cellToValue(text, richValue) {
  const url = richValue ? richValue.getLinkUrl() : null;
  return url ? { text, url } : text;
}

// Splits a Notes cell into bullet lines, stripping a leading "- " or "•",
// and detects a link on an individual line via that line's rich-text runs
// (for a link applied to just part of the cell, e.g. one bullet).
function parseNotes(text, richValue) {
  if (!text.trim()) return [];
  const runs = richValue ? richValue.getRuns() : [];
  const lines = text.split('\n');
  const result = [];
  let offset = 0;

  for (const rawLine of lines) {
    const lineStart = offset;
    const lineEnd = offset + rawLine.length;
    offset = lineEnd + 1; // account for the '\n' joining lines

    const line = rawLine.replace(/^\s*[•\-]\s*/, '').trim();
    if (!line) continue;

    let url = null;
    for (const run of runs) {
      if (run.getStartIndex() < lineEnd && run.getEndIndex() > lineStart) {
        const linkUrl = run.getLinkUrl();
        if (linkUrl) { url = linkUrl; break; }
      }
    }
    result.push(url ? { text: line, url } : line);
  }
  return result;
}

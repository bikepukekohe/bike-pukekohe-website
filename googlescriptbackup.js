function myFunction() {
  var SHEET_NAME = "events";
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  if (!sheet) {
    return ContentService.createTextOutput(
      JSON.stringify({ events: [], error: "Sheet not found" }),
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) {
    return ContentService.createTextOutput(
      JSON.stringify({ events: [] }),
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var headers = rows[0].map(function (h) {
    return String(h).trim().toLowerCase();
  });

  var events = rows
    .slice(1)
    .map(function (row) {
      var obj = {};
      headers.forEach(function (key, i) {
        obj[key] = row[i];
      });

      var publishedValue = String(obj.published || "").toLowerCase();
      var isPublished =
        publishedValue === "true" ||
        publishedValue === "1" ||
        obj.published === true;
      if (!isPublished) return null;

      var dateValue = obj.date;
      var isoDate = "";

      if (dateValue instanceof Date) {
        isoDate = Utilities.formatDate(
          dateValue,
          "Pacific/Auckland",
          "yyyy-MM-dd",
        );
      } else {
        isoDate = String(dateValue || "").trim();
      }

      return {
        date: isoDate,
        title: String(obj.title || "").trim(),
        location: String(obj.location || "").trim(),
        details: String(obj.details || "").trim(),
        url: String(obj.url || "").trim(),
      };
    })
    .filter(Boolean);

  events.sort(function (a, b) {
    return new Date(a.date) - new Date(b.date);
  });

  return ContentService.createTextOutput(
    JSON.stringify({ events: events }),
  ).setMimeType(ContentService.MimeType.JSON);
}

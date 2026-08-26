# Google Sheet Events Setup

## 1) Create your Google Sheet

Create a sheet tab named `events` with this header row:

`date | title | location | details | url | published`

Example rows:

- `2026-09-12 | Family Skills Day | Pukekohe | Free family cycle safety activities. | https://example.com/event-1 | TRUE`
- `2026-09-28 | Beginner Group Ride | Pukekohe Town Centre | Relaxed community ride with volunteer leaders. |  | TRUE`

Notes:

- `date` can be a sheet date or ISO string like `2026-09-12`.
- Only rows with `published=TRUE` are returned.

## 2) Create Apps Script endpoint

In Google Sheets: Extensions -> Apps Script.
Replace script contents with:

```javascript
function doGet() {
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
```

## 3) Deploy Web App

1. Click Deploy -> New deployment.
2. Select type: Web app.
3. Execute as: Me.
4. Who has access: Anyone.
5. Deploy and copy the Web App URL.

## 4) Connect website

Open `script.js` and set:

`const EVENTS_FEED_URL = "YOUR_WEB_APP_URL_HERE";`

Commit and publish. New or updated rows in Google Sheet will show on the website after refresh.

var BK = SpreadsheetApp.getActiveSpreadsheet(),
  IG_SHEET = BK.getSheetByName("Instagram Follwer Daily Count");

function onOpen() {
  function showMenu() {
    var menu = [
      {name: "Get Instagram Follower Daily Count", functionName: "setIgFollowerData"}
    ];
    BK.addMenu("Custom Management", menu);
  }
  
  showMenu();
}

function setIgFollowerData() {
  function getRange(columnNumber) {
    var startRow = 2;
    return IG_SHEET.getRange(startRow, columnNumber, IG_SHEET.getLastRow(), 1);
  }
  
  function getFollowerNumber(accountUrl) {
    // Set 1 seconds interval
    Utilities.sleep(1000);
    var response = UrlFetchApp.fetch(encodeURI(accountUrl), {muteHttpExceptions: true}),
      rs = response.getContentText().match(/<script type="text\/javascript">window\._sharedData =([\s\S]*?);<\/script>/i),
      json = JSON.parse(rs[1]);
    return json.entry_data.ProfilePage[0].user.followed_by.count;
  }
  
  function getTodayColumn() {
    function dateFormat(date) {
      var formatType = 'yyyy/MM/dd';
      return Utilities.formatDate(date, 'JST', formatType);
    }
    
    var today = dateFormat(new Date()),
      row = 1,
      startColumn = 2,
      lastColumn = IG_SHEET.getLastColumn(),
      values = IG_SHEET.getRange(row, startColumn, row, lastColumn),
      dateIndex = "";
    values.getValues()[0].filter(function (e, i) {
      if (e && dateFormat(e) === today) {
        dateIndex = i
      }
    });
    if (dateIndex !== "") {
      return IG_SHEET.getRange(row, startColumn + dateIndex);
    } else {
      return IG_SHEET.getRange(row, lastColumn + 1).setValue(today)
    }
  }
  
  var dateColumn = getTodayColumn(),
    accounts = getRange(1).getValues(),
    data = [];
  for (var i = 0; i < accounts.length; i++) {
    var account = accounts[i],
      accountName = account[0],
      accountUrl = "https://www.instagram.com/" + accountName + "/";
    if (!accountName) {
      data[i] = account;
      continue;
    }
    try {
      data[i] = [getFollowerNumber(accountUrl)];
    } catch (e) {
      data[i] = ['could\'t get'];
    }
  }
  getRange(dateColumn.getColumn()).setValues(data);
}



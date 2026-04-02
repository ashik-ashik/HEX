
/***************************************
 * 🚀 MAIN ENTRY POINT (ROUTER)
 ***************************************/
function doPost(e) {




  try {
    const type = e.parameter.type;

    if (!type) throw new Error("Missing 'type' parameter");

    switch (type) {
      case "bazar":
        return handleBazar(e);

      case "mealCount":
        return handleMeal(e);

      case "mealDeposit": // ← NEW HANDLER
        return handleMealDeposit(e);

      case "utilityCosts": // ← NEW HANDLER
        return addUtilityCost(e);

      case "utilityDeposit":
        return handleUtilityDeposit(e);

      case "Notice":
        return handleNotice(e);

      case "changeManager":
        return changeManager(e);

      default:
        throw new Error("Invalid request type: " + type);
    }

  } catch (error) {
    return jsonResponse("error", error.toString());
  }
}


/***************************************
 * 🛒 BAZAR COST HANDLER
 ***************************************/
function handleBazar(e) {
  const sheet = SpreadsheetApp
    .openByUrl("https://docs.google.com/spreadsheets/d/18JQy2CJXNGJFqzlR9XOLV_NmImuAOQax6CUppn15ZvQ/edit?gid=438303393#gid=438303393")
    .getSheetByName("বাজার খরচ");

  if (!sheet) throw new Error("Sheet 'Bazar Costs' not found");

  const date = e.parameter.Date;
  const doer = e.parameter.Doer;
  const amount = e.parameter.Amount;

  if (!date || !doer || !amount) {
    throw new Error("Missing required fields (Date, Doer, Amount)");
  }

  sheet.appendRow([
    date,
    doer,
    parseFloat(amount),
  ]);

  return jsonResponse("success", "Bazar cost ৳" + amount +" added successfully");
}


/***************************************
 * 🍽️ MEAL COUNT HANDLER (HORIZONTAL MEMBERS)
 ***************************************/
function handleMeal(e) {
  const sheet = SpreadsheetApp
    .openByUrl("https://docs.google.com/spreadsheets/d/18JQy2CJXNGJFqzlR9XOLV_NmImuAOQax6CUppn15ZvQ/edit?gid=1465774274#gid=1465774274")
    .getSheetByName("Meal Count");

  if (!sheet) throw new Error("Sheet 'Meal Counts' not found");

  const date = e.parameter.Date; // YYYY-MM-DD
  const mealData = {}; // will hold all member meals

  // Collect meal counts from parameters
  for (const key in e.parameter) {
    if (key !== "Date" && key !== "type") {
      mealData[key] = parseFloat(e.parameter[key]) || 0;
    }
  }

  const data = sheet.getDataRange().getValues();

  // ******** FIND OR CREATE DATE ROW ********
  let dateRowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === date) {
      dateRowIndex = i + 1; // sheet row index
      break;
    }
  }

  if (dateRowIndex === -1) {
    dateRowIndex = data.length + 1;
    sheet.getRange(dateRowIndex, 1).setValue(date);
  }

  // ******** INSERT MEALS FOR EACH MEMBER ********
  const memberRow = 1; // first row has member names
  for (const member in mealData) {
    const meal = mealData[member];
    // Find member column
    let colIndex = -1;
    for (let j = 1; j < data[0].length; j++) {
      if (data[0][j] === member) {
        colIndex = j + 1;
        break;
      }
    }
    // If member does not exist, create new column at the end
    if (colIndex === -1) {
      colIndex = data[0].length + 1;
      sheet.getRange(1, colIndex).setValue(member);
    }

    // Add (not overwrite) meal
    const cell = sheet.getRange(dateRowIndex, colIndex);
    const existing = parseFloat(cell.getValue()) || 0;
    cell.setValue(existing + meal);
  }

  return jsonResponse("success", "Meals of "+date +" added successfully");
}

/***************************************
 * 🍱 MEAL DEPOSIT HANDLER (HORIZONTAL MEMBERS)
 ***************************************/
function handleMealDeposit(e) {
  const sheet = SpreadsheetApp
    .openByUrl("https://docs.google.com/spreadsheets/d/18JQy2CJXNGJFqzlR9XOLV_NmImuAOQax6CUppn15ZvQ/edit")
    .getSheetByName("খাবার মিলে জমা");

  if (!sheet) throw new Error("Sheet 'Meal Deposits' not found");

  const member = e.parameter.member;
  const amount = parseFloat(e.parameter.amount);

  if (!member || isNaN(amount)) {
    throw new Error("Missing or invalid fields (member, amount)");
  }

  const data = sheet.getDataRange().getValues();

  // ******** FIND MEMBER COLUMN ********
  let colIndex = -1;
  for (let j = 0; j < data[0].length; j++) {
    if (data[0][j] === member) {
      colIndex = j + 1;
      break;
    }
  }

  // ******** CREATE MEMBER COLUMN ********
  if (colIndex === -1) {
    colIndex = data[0].length + 1;
    sheet.getRange(1, colIndex).setValue(member);
  }

  // ******** FIND NEXT EMPTY ROW ********
  let lastRow = sheet.getLastRow();
  let nextRow = 3;

  if (lastRow >= 3) {
    const columnValues = sheet
      .getRange(3, colIndex, lastRow - 2)
      .getValues();

    for (let i = 0; i < columnValues.length; i++) {
      if (!columnValues[i][0]) {
        nextRow = i + 3;
        break;
      }
      nextRow = i + 4;
    }
  }

  // ******** INSERT DEPOSIT ********
  sheet.getRange(nextRow, colIndex).setValue(amount);

  return jsonResponse("success", `Deposit added for ${member}`);
}

// ================= Utility Costs =================
function addUtilityCost(e) {
  try {
    // Open your spreadsheet by ID
    var ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/18JQy2CJXNGJFqzlR9XOLV_NmImuAOQax6CUppn15ZvQ/edit?gid=1826027298#gid=1826027298");
    
    // Get the "UtilityCosts" sheet (replace with your sheet name)
    var sheet = ss.getSheetByName("ইউটিলিটি খরচ");
    if (!sheet) {
      // If sheet doesn't exist, create it and add headers
      sheet = ss.insertSheet("UtilityCosts");
      sheet.getRange("A1").setValue("Cost Section");
      sheet.getRange("B1").setValue("Amount");
    }
    
    // Find the next empty row
    var lastRow = sheet.getLastRow();
    var nextRow = lastRow + 1;

    // Insert the data
    sheet.getRange(nextRow, 1).setValue(e.parameter.costSection);
    sheet.getRange(nextRow, 2).setValue(e.parameter.amount);

    // Optional: show a success message
    return jsonResponse("success", `Utility Cast added ৳ ${e.parameter.amount}`);
    
  } catch (error) {
    Logger.log("Error adding utility cost: " + error);
    return "Error: " + error;
  }
}


// Utility Deposit Post
function handleUtilityDeposit(e) {
  const sheet = SpreadsheetApp
    .openByUrl("https://docs.google.com/spreadsheets/d/18JQy2CJXNGJFqzlR9XOLV_NmImuAOQax6CUppn15ZvQ/edit?gid=645903599#gid=645903599")
    .getSheetByName("ইউটিলিটি জমা"); // <-- your sheet name

  if (!sheet) throw new Error("Sheet 'Utility Deposit' not found");

  const member = e.parameter.member;
  const amount = parseFloat(e.parameter.amount);

  if (!member || isNaN(amount)) {
    throw new Error("Missing or invalid fields (member, amount)");
  }

  const data = sheet.getDataRange().getValues();

  // ========= FIND MEMBER COLUMN =========
  let colIndex = -1;
  for (let j = 0; j < data[0].length; j++) {
    if (data[0][j] === member) {
      colIndex = j + 1;
      break;
    }
  }

  // If member not found → create new column
  if (colIndex === -1) {
    colIndex = data[0].length + 1;
    sheet.getRange(1, colIndex).setValue(member);
  }

  // ========= FIND NEXT EMPTY ROW =========
  const columnValues = sheet
    .getRange(2, colIndex, sheet.getLastRow())
    .getValues();

  let nextRow = 2;

  for (let i = 0; i < columnValues.length; i++) {
    if (!columnValues[i][0]) {
      nextRow = i + 2;
      break;
    }
    nextRow = i + 3;
  }

  // ========= INSERT DEPOSIT =========
  sheet.getRange(nextRow, colIndex).setValue(amount);

  return jsonResponse("success", `Utility deposit added for ${member}`);
}



function handleNotice(e) {
  const sheet = SpreadsheetApp
    .openByUrl("https://docs.google.com/spreadsheets/d/18JQy2CJXNGJFqzlR9XOLV_NmImuAOQax6CUppn15ZvQ/edit?gid=240558188#gid=240558188")
    .getSheetByName("Notice");

  if (!sheet) throw new Error("Sheet 'Notice' not found");

  const title = e.parameter.title;
  const content = e.parameter.content;

  if (!title || !content) {
    throw new Error("Missing required fields (Title and Content)");
  }

  sheet.appendRow([title, content]);

  return ContentService
    .createTextOutput(JSON.stringify({status: "success", message: "Notice added successfully"}))
    .setMimeType(ContentService.MimeType.JSON);
}



/***************************************
 * 🔄 CHANGE MANAGER FUNCTION
 ***************************************/
function changeManager(e) {
  try {
    const sheet = SpreadsheetApp
      .openByUrl("https://docs.google.com/spreadsheets/d/18JQy2CJXNGJFqzlR9XOLV_NmImuAOQax6CUppn15ZvQ/edit?gid=907502917#gid=907502917")
      .getSheetByName("Personnel");

    const values = sheet.getDataRange().getValues();

    // Trim incoming name
    const newManagerName = (e.parameter.name || "").trim();

    if (!newManagerName) {
      throw new Error("Manager name missing");
    }

    let currentManagerRow = -1;
    let newManagerRow = -1;

    for (let i = 1; i < values.length; i++) {
      
      const designation = String(values[i][0]).trim();
      const name = String(values[i][1]).trim();

      // Find current manager
      if (designation.toLowerCase() === "manager") {
        currentManagerRow = i + 1;
      }

      // Find selected member (trim + case insensitive)
      if (name.toLowerCase() === newManagerName.toLowerCase()) {
        newManagerRow = i + 1;
      }
    }

    if (newManagerRow === -1) {
      throw new Error("Selected member not found");
    }

    if (currentManagerRow === newManagerRow) {
      throw new Error("Already Manager");
    }

    // Swap Designation
    if (currentManagerRow !== -1) {
      sheet.getRange(currentManagerRow, 1).setValue("Member");
    }

    sheet.getRange(newManagerRow, 1).setValue("Manager");

    return jsonResponse(
      "success",
      "Manager changed successfully"
    );

  } catch (error) {
    return jsonResponse(
      "error",
      error.toString()
    );
  }
}



/***************************************
 * 📦 COMMON JSON RESPONSE FUNCTION
 ***************************************/
function jsonResponse(status, message) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: status,
      message: message
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
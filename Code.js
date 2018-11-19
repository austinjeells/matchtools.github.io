function doGet() {
  return HtmlService.createHtmlOutputFromFile('Test Match Web App')
  .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  //return HtmlService.createHtmlOutputFromFile('Test Match Web App').setTitle('Match Calculator');
}


function sendText(data){
  var sheet = SpreadsheetApp.openById('1R8PtAYH3vtNyc-HHwYCaKnx6M-zWOb0VCrhtzYQdN7o').getSheetByName('WebAppRow');

  sheet.appendRow([data.vSpec1DropValue, data.vSpec2DropValue, data.vMaxDist]);
  return 'Success!!!';
}


function getResults(AllResults) {
  Logger.clear()
  var ss = SpreadsheetApp.openById('1R8PtAYH3vtNyc-HHwYCaKnx6M-zWOb0VCrhtzYQdN7o');
  var spec2Sheet = ss.getSheetByName("Calc 2 (Dont Edit)");
  var sheet = ss.getSheetByName("Calc 1 (Dont Edit)");
  var calc3Sheet = ss.getSheetByName("Calc 3 (Dont Edit)");
  var resultSheet = ss.getSheetByName("Results");
  var rowNum = sheet.getRange(1,2).getValue();
  var columnNum = sheet.getRange(1,7).getValue();
  var minDist = sheet.getRange(1,1).getValue();
  var arrSpec1 = [];
  var arrSpec2 = [];
  var arrValues = [];
  var values = sheet.getRange(4,19,rowNum,columnNum).getValues();
  var spec2Namesarr = sheet.getRange(4,2,rowNum,1).getValues();
  var spec1Namesarr = sheet.getRange(4,7,columnNum,1).getValues();
  var spec1Name = sheet.getRange("B2").getValue();
  var spec2Name = sheet.getRange("G2").getValue();
  
  
  //transpose the Name array to make 2d array
  function transpose(a){
    return Object.keys(a[0]).map(function (c) { return a.map(function (r) { return r[c]; }); });
  }
  spec1Namesarr = transpose(spec1Namesarr)
  
  //Perform calculations in script
  var valuesArray = [];
  var valuesArray2 = [];
  var lat2 = sheet.getRange(4,4,rowNum,1).getValues();
  var lat1 = sheet.getRange(4,9,columnNum,1).getValues();
  //var address2 = sheet.getRange(4,3,rowNum,1).getValues();
  //var address1 = sheet.getRange(4,7,rowNum,1).getValues();
  var long2 = sheet.getRange(4,5,rowNum,1).getValues();
  var long1 = sheet.getRange(4,10,columnNum,1).getValues();
  
  for(var i=1; i<rowNum+1; i++){
    for(var j=1; j<columnNum+1; j++) {
      var distCalc = Math.acos(Math.cos((90-lat2[i-1])*(Math.PI/180))*Math.cos((90-lat1[j-1])*(Math.PI/180))+Math.sin((90-lat2[i-1])*(Math.PI/180))*Math.sin((90-lat1[j-1])*(Math.PI/180))*Math.cos((long2[i-1]-long1[j-1])*(Math.PI/180)))*6371
      //ACOS(COS(RADIANS(90-lat2)) *COS(RADIANS(90-lat1)) +SIN(RADIANS(90-lat2)) *SIN(RADIANS(90-lat1)) *COS(RADIANS(long2-long1))) *6371
      values[i-1][j-1] = distCalc
      //Logger.log(distCalc); 
    }
  }
  
 
  //Create Names array of Programs that meet criteria
  for(var j=19; j<columnNum+19; j++){
    for(var i=4; i<rowNum+4; i++) {
      if(values[i-4][j-19] < minDist){
        arrSpec1.push(spec1Namesarr[0][j-19]);
        arrSpec2.push(spec2Namesarr[i-4][0]);
        arrValues.push(values[i-4][j-19]);
        //Logger.log("HI");
      }
    }
  }
  //Logger.log("Hi")
  //Publish Results
  spec2Sheet.getRange("A1:ZRK3").clear();
  var arrSpec1Length = arrSpec1.length;
  var arrSpec2Length = arrSpec2.length;
  var arrValuesLength = arrValues.length;
  spec2Sheet.getRange(1,1,1,arrSpec1Length).setValues([arrSpec1]);
  spec2Sheet.getRange(2,1,1,arrSpec2Length).setValues([arrSpec2]);
  spec2Sheet.getRange(3,1,1,arrValuesLength).setValues([arrValues]);
  
  //Publish the Distance Values
  calc3Sheet.getRange("A1:A").clear();
  calc3Sheet.getRange("C1:C").clear();
  calc3Sheet.getRange("D1:D").clear();
  var calc3values1 = spec2Sheet.getRange(1,1,1,arrSpec1Length).getValues();
  var calc3values2 = spec2Sheet.getRange(2,1,1,arrSpec1Length).getValues();
  var calc3values3 = spec2Sheet.getRange(3,1,1,arrSpec1Length).getValues();
  calc3values1 = transpose2(calc3values1);
  calc3values2 = transpose2(calc3values2);
  calc3values3 = transpose2(calc3values3);
  
  var x = 0;
  var len = calc3values3.length
  while(x < len){ 
    calc3values3[x][0] = parseFloat(calc3values3[x]).toFixed(1); 
    x++
  }
  
  calc3Sheet.getRange(1,1,arrSpec1Length,1).setValues(calc3values1);
  calc3Sheet.getRange(1,4,arrSpec2Length,1).setValues(calc3values2);
  calc3Sheet.getRange(1,3,arrValuesLength,1).setValues(calc3values3);
  var fullcalc3values = calc3Sheet.getRange(1,1,arrSpec1Length,5).getValues();
  resultSheet.getRange("D3:H").clearContent();
  resultSheet.getRange(3,4,arrSpec1Length,5).setValues(fullcalc3values);
  //Logger.log(arrSpec1);
  
  //Publish Recalculate Indicators
  resultSheet.getRange(500,1).setValue(minDist);
  var spec1Title = resultSheet.getRange("K2").getValue();
  var spec2Title = resultSheet.getRange("M2").getValue();
  resultSheet.getRange(501,1).setValue(spec1Title);
  resultSheet.getRange(502,1).setValue(spec2Title);
  
  //return 'Yayyy!';
  var vSortType = resultSheet.getRange(1,2).getValue();
  var AllResults = calc3Sheet.getRange(1,1,arrValuesLength,5).sort([3,1,5]).getValues();
  
  AllResults = [AllResults,spec1Name,spec2Name]
  return AllResults;
}

function transpose2(a){
  return a && a.length && a[0].map && a[0].map(function (_, c) { return a.map(function (r) { return r[c]; }); }) || [];
}

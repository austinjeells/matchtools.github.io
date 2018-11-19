/**
 * Created by Nick on 11/17/2016.
 */

// Disables console.log for deployment
// console.log = function () {};

var rowsCreated= 1;
var activeRows = [1];
var inputRowsContainer = document.getElementById('inputRowsContainer');
var emptyInputRow;
var lastCoupleList, lastIndividualList, emptyRankListRow, emptyIndRow;


(function initializeFields () {
    // Gets clone of first input row and then cleans IDs to be numbers instead of X.
    var firstInputRow = document.getElementsByClassName('row entryRow')[0];
    emptyInputRow = firstInputRow.cloneNode(true);
    var firstProgramName = firstInputRow.getElementsByClassName('form-control programName')[0];
    addEntryFieldListeners(firstProgramName);
    firstProgramName.id = 'programInput' + rowsCreated.toString();

    // Adds event listeners to submit, retrieve, and switch layout buttons
    document.getElementById('submitRanksBtn').addEventListener('click', createIndividualRanks);
    document.getElementById('retrieveRanksBtn').addEventListener('click', showRetrieveModal);
    document.getElementById('indSubBtn').addEventListener('click', switchLayout);

    // Initializes tooltip for individual submission button
    $('#indSubIcon').tooltip({placement: 'auto top',
                                template: '<div class="tooltip indSubTooltip" role="tooltip">' +
                                                '<div class="tooltip-arrow"></div>' +
                                                '<div class="tooltip-inner"></div></div>',
                                title: 'Allows participants in couple to submit personal ranks individually.' +
                                        ' Combined rank list can then be retrieved at a later time.'
    });

    // Add event listener to create buttons on individual submission modal
    document.getElementById('createIDBtn').addEventListener('click', function () {
        createCoupleID('subCoupleID');
    });
    document.getElementById('submitIndJSON').addEventListener('click', submitIndividualHandler);

    // Add listener to Get Results button in Retrieval Modal
    document.getElementById('retrieveBtn').addEventListener('click', retrieveResults);

    // Add listener for dropdown closing in Retrieval Modal to show max distance entry
    $('.col-sm-12 .sortSelect').on('hidden.bs.dropdown', function () {
        var maxDistRow = document.getElementById('modalMaxDistRow');
        if (document.getElementById('sortPrimaryInd0').children.length === 1) {
            maxDistRow.style.display = 'block';
            maxDistRow.focus();
        }
        else {
            maxDistRow.style.display = 'none';
            document.getElementById('retrievalDist').value = "";
        }
    });

    // Adds event listener to Export as Excel button
    document.getElementById('saveAsXLS').addEventListener('click', submitCouplesHandler);

    // Activates initial typeahead field
    activateTypeahead(firstProgramName.id);

    // Adds listener to help button
    document.getElementById('helpNav').addEventListener('click', function () {
        $('#helpModal').modal('show');
    });

    // Initializes tooltip for distance input
    $('#distInfoIcon').tooltip({placement: 'auto right',
                                    template: '<div class="tooltip distInfoTooltip" role="tooltip">' +
                                                '<div class="tooltip-arrow"></div>' +
                                                '<div class="tooltip-inner"></div></div>',
                                    title: 'Strongly favors rank pairs within specified distance. Distances estimated' +
                                            ' based on city provided in ERAS Registry, generally accurate to within' +
                                            ' 15 miles'});

    // Get modal row templates and remove empty rows
    emptyRankListRow = document.getElementsByClassName('row rankListRow')[0].cloneNode(true);
    emptyIndRow = document.getElementsByClassName('row indSubRow')[0];
    document.getElementById('rankListBody').removeChild(document.getElementsByClassName('row rankListRow')[0]);
    document.getElementById('indSubBody').removeChild(document.getElementsByClassName('row indSubRow')[0]);

    // Add listeners to Sorting Preferences dropdown options to add check mark when clicked and
    // prevent automatic closing when options are selected
    for (i = 0; i < 3; i++) {
        // For joint submission page
        document.getElementById('sortPrimary' + i.toString()).addEventListener('click', function () {
            sortOptionsSelector(event, 'sortPrimary');
            event.stopPropagation(); // Prevents drop-down from closing when selection made
        });
        document.getElementById('strictMatch' + i.toString()).addEventListener('click', function () {
            sortOptionsSelector(event, 'strictMatch');
            event.stopPropagation();
        });

        // And for retrieval modal
        document.getElementById('sortPrimaryInd' + i.toString()).addEventListener('click', function () {
            sortOptionsSelector(event, 'sortPrimaryInd');
            event.stopPropagation(); // Prevents drop-down from closing when selection made
        });
        document.getElementById('strictMatchInd' + i.toString()).addEventListener('click', function () {
            sortOptionsSelector(event, 'strictMatchInd');
            event.stopPropagation();
        });
    }
    for (var i = 0; i < 2; i++) {
        document.getElementById('noMatch' + i.toString()).addEventListener('click', function () {
            sortOptionsSelector(event, 'noMatch');
            event.stopPropagation();
        });
        document.getElementById('noMatchInd' + i.toString()).addEventListener('click', function () {
            sortOptionsSelector(event, 'noMatchInd');
            event.stopPropagation();
        });
    }

    // Add listener for dropdown close to update Max Distance DOM display
    $('.noMatchCol .sortSelect').on('hidden.bs.dropdown', function () {
        console.log('Updating distance entry');
        var distCol = document.getElementsByClassName('setDistance')[0];
        var btnPaddingCols = document.getElementsByClassName('btnPadding');

        if (document.getElementById('sortPrimary0').children.length === 1) {
            console.log('Showing distance entry');
            distCol.style.display = 'flex';
            for (var i = 0; i < 2; i++) {
                btnPaddingCols[i].className = 'col-sm-2 btnPadding';
            }
            document.getElementById('maxDist').focus();
        }
        else {
            distCol.style.display = 'none';
            for (i = 0; i < 2; i++) {
                btnPaddingCols[i].className = 'col-sm-3 btnPadding';
            }

            document.getElementById('maxDist').value = "";
        }
    });
})();


function addEntryFieldListeners (target) {
    target.addEventListener('blur', createEntryRow);
    target.addEventListener('blur', checkLocation);
    target.addEventListener('input', handleProgramEntry);
}


function generateButtonListener () {
    // Separate function so argument can be passed AND can be removed individually by name
    generateRankList(false);
}


function sortOptionsSelector (event, target) {
    var length;

    // Selects for +/- individual modal in target name
    if (!/Ind/.test(target)) {
        if (target === 'sortPrimary' || target === 'strictMatch') length = 3;
        else length = 2;
    }
    else {
        if (target === 'sortPrimaryInd' || target === 'strictMatchInd') length = 3;
        else length = 2;
    }

    for (var i = 0; i < length; i++) {
        var option = document.getElementById(target + i.toString());
        if (option.children.length !== 0 && event.target.id !== option.id) {
            option.removeChild(option.children[0]);
        }
    }
    if (event.target.children.length === 0) {
        event.target.innerHTML = '<span class="glyphicon glyphicon-ok"></span>' + "  " + event.target.innerHTML;
    }
}


function getSortSelections (indSub) {
    // Gets sort selections and returns list with three selections
    var output;

    var indSubID = "";
    if (indSub) {
        indSubID = "Ind";
        output = ['sortPrimary1', 'noMatch0', 'strictPair2']; // defaults
    }
    else {
        output = ['sortPrimaryInd1', 'noMatchInd0', 'strictPairInd2'];
    }

    for (var i = 0; i < 3; i++) {
        var sortOption = document.getElementById('sortPrimary' + indSubID + i.toString());
        var strictPairOption = document.getElementById('strictMatch' + indSubID + i.toString());
        if (sortOption.children.length === 1) {
            output[0] = sortOption.id;
        }
        if (strictPairOption.children.length === 1) {
            output[2] = strictPairOption.id;
        }
    }
    for (i = 0; i < 2; i++) {
        var noMatchOption = document.getElementById('noMatch' + indSubID + i.toString());
        if (noMatchOption.children.length == 1) {
            output[1] = noMatchOption.id;
        }
    }
    return output;
}


function createEntryRow (event) {
    console.log("Creating new row!");
    console.log(event);
    // Check if any text entered. If not, cancel function. Else, remove event listener from prior field.
    var filledEntryField = event.target;
    if ($(filledEntryField).typeahead('val').length === 0) {
        console.log("No input detected.");
        return;
    }
    filledEntryField.removeEventListener('blur', createEntryRow);

    // Add program to count and create new row with event listener for blur.
    rowsCreated++;
    var newRow = emptyInputRow.cloneNode(true);
    console.log(newRow);
    inputRowsContainer.appendChild(newRow);
    var newProgramEntry = newRow.getElementsByClassName('form-control programName typeahead')[0];
    addEntryFieldListeners(newProgramEntry);
    newProgramEntry.id = 'programInput' + rowsCreated.toString();
    activeRows.push(rowsCreated);

    // Add delete button and event listener for deletion to prior row.
    var previousRow = newRow.previousElementSibling;
    var deleteButton = previousRow.getElementsByTagName('button')[0];
    deleteButton.style.display = 'inline-block';
    deleteButton.addEventListener('click', deleteRow);
    activateTypeahead(newProgramEntry.id);
}


function getParentRow (currentElement) {
    while (currentElement.className !== 'row entryRow') {
        currentElement = currentElement.parentNode;
        console.log('Parent: ');
        console.log(currentElement);
    }
    return currentElement;
}


function handleProgramEntry (event) {
    // When change made to program name field, checks if location previously identified for this row
    // If so, deletes tooltip from glyphicon
    // Separate function because couldn't delete and add tooltip in same function
    var entryField = event.target;

    if (entryField.getAttribute('data-loc-known') === 'true') {
        var parentRow = getParentRow(entryField);
        var locationGlyph = parentRow.getElementsByClassName('locGlyph')[0];
        entryField.setAttribute('data-loc-known', 'false');
        locationGlyph.style.display = 'none';
        $(locationGlyph).tooltip('destroy');
    }
}


function checkLocation (event) {
    var entryField = event.target;
    var parentRow = getParentRow(entryField);
    var locationGlyph = parentRow.getElementsByClassName('locGlyph')[0];
    console.log('Glyph:');
    console.log(locationGlyph);

    // Create location glyph if program location is known
    var programName = $(entryField).typeahead('val');
    if (programDB[programName] !== undefined) {
        var programInfo = programDB[programName];
        console.log('Creating tooltip for ' + programName);

        locationGlyph.style.display = 'block';
        $(locationGlyph).tooltip({placement: 'auto right',
            title: programInfo.city + ', ' + programInfo.state,
            template: '<div class="tooltip locTooltip" role="tooltip">' +
                        '<div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
        });
        entryField.setAttribute('data-loc-known', 'true');
    }
}


function deleteRow (event) {
    // Prevent removal of only row.
    if (activeRows.length <= 1) {
        alert("Cannot remove last row");
        return;
    }

    console.log("Deleting row!");
    var currentRow = getParentRow(event.target);

    // Get program name input and remove id from activeRows.
    var inputID = currentRow.getElementsByClassName('form-control programName')[1].id;
    console.log('inputID:');
    console.log(inputID);
    var idNumber = inputID.substring(12);
    console.log('Removing id ' + idNumber.toString() + ' from register');
    activeRows.splice(activeRows.indexOf(parseInt(idNumber)), 1);
    inputRowsContainer.removeChild(currentRow);

    // Reinstate event listener on final row.
    var lastRow = inputRowsContainer.children[inputRowsContainer.children.length - 1];
    var programEntryField = lastRow.getElementsByClassName('form-control programName')[0];
    console.log(programEntryField);
    addEntryFieldListeners(programEntryField);
}


function submitIndividualHandler () {
    var submitObject = {
        entries: lastIndividualList,
        username: getSubIDs('subUsername'),
        id: getSubIDs('subCoupleID')
    };
    console.log('Submit Object');
    console.log(submitObject);
    if (submitObject.username === '88' || submitObject.id === '88') {
        return;
    }

    var req = new XMLHttpRequest();
    req.open('POST', '/couplesmatchindsub', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.onload = function () {
        if (this.status === 200) {
            var resultsJSON = JSON.parse(req.responseText);
            console.log(resultsJSON);
            if (resultsJSON.success) {
                showConfirmation(submitObject.username, submitObject.id);
            }
            else {
                alert(resultsJSON.reason);
            }
        }
        else {
            alert('Submission failed. Please try again.');
        }
    };
    req.send(JSON.stringify(submitObject));
}


function getSubIDs (fieldID) {
    var identifierInput = document.getElementById(fieldID);
    var identifier = identifierInput.value.trim();
    if (/[^\d\w]/i.test(identifier) || identifier.length === 0
        || (fieldID === 'subCoupleID' && identifier.length !== 7)) {
        identifierInput.style.backgroundColor = '#ff8989';
        identifierInput.style.color = 'white';
        identifierInput.addEventListener('input', function () {
            identifierInput.style.backgroundColor = '#ffffff';
            identifierInput.style.color = '#555';
        });
        if (fieldID === 'subCoupleID') {
            alert('Invalid Couple ID submitted. Couple ID should be seven characters long consisting of only ' +
            'capital letters and numbers 1-9');
        }
        else {
            alert('Invalid Username submitted. Username must contain only alphanumeric characters.');
        }
        return '88';
        }
    return identifier;
}


function showConfirmation (username, id) {
    document.getElementById('usernameCell').innerHTML = username;
    document.getElementById('coupleIDCell').innerHTML = id;

    var modal = document.getElementById('indSubModal');
    $(modal).modal('hide');
    $(modal).on('hidden.bs.modal', function () {
        $('#confirmationModal').modal('show');
        $(modal).off();
    });
}


function showRetrieveModal () {
    $('#retrieveModal').modal('show');
}


function createIndividualRanks () {
    var modal = document.getElementById('indSubModal');
    var entryRows = document.getElementsByClassName('row entryRow');
    var entries = [];

    for (var i = 0; i < entryRows.length - 1; i++) {
        var currentRow = entryRows[i];
        console.log('Entry row');
        console.log(currentRow);
        var programNameField = currentRow.getElementsByClassName('tt-input')[0];
        var programName = $(programNameField).typeahead('val');
        var rank = currentRow.getElementsByClassName('rankA')[0].value;
        entries.push(new IndividualRank(programName, rank));
    }

    generateModalRows(document.getElementById('indSubBody'), entries);

    $(modal).modal('show');
    $(modal).on('hidden.bs.modal', clearModal);

    lastIndividualList = entries;
}


function retrieveResults () {
    var usernameIn = getSubIDs('retrievalUsername');
    var coupleIDIn = getSubIDs('retrievalID');
    var maxDistance = document.getElementById('retrievalDist').value;

    if (coupleIDIn.length !== 7 || /[^ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789]/.test(coupleIDIn)) {
        alert('Invalid Couple ID.');
        return;
    }

    var identifiers = {
        username: usernameIn,
        id: coupleIDIn
    };

    var req = new XMLHttpRequest();
    req.open('POST', '/couplesmatchretrieval', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.onload = function () {
        if (this.status === 200) {
            var resultsJSON = JSON.parse(req.responseText);
            console.log(resultsJSON);
            if (resultsJSON.success) {
                var retrieveModal = $('#retrieveModal');
                retrieveModal.modal('hide');
                console.log(resultsJSON.a.entries);
                console.log(resultsJSON.b.entries);
                retrieveModal.on('hidden.bs.modal', function () {
                    generateRankList(true, resultsJSON, maxDistance);
                    retrieveModal.off();
                });

            }
            else {
                alert(resultsJSON.reason);
            }
        }
    };
    req.send(JSON.stringify(identifiers));
}


function createCoupleID (targetID) {
    var ID = "";
    var possChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
    for (var i = 0; i < 7; i++) {
        ID += possChars.substr(Math.floor(Math.random() * possChars.length), 1);
    }

    document.getElementById(targetID).value = ID;
}


function generateModalRows (rankListBody, entries) {
    var longDistanceEntered = false;
    var noMatchEntered = false;

    for (var i = 0; i < entries.length; i++) {
        var rankItem = entries[i];

        if (rankListBody.id === 'rankListBody') {
            var newRow = emptyRankListRow.cloneNode(true);

            if ((i + 2) % 2 === 0) {
                newRow.style.backgroundColor = '#fbf6f0';
            }
            else {
                newRow.style.backgroundColor = '#f1f6fb';
            }

            var rank = newRow.getElementsByClassName('col-sm-1 numRank')[0];
            var programA = newRow.getElementsByClassName('col-sm-3 appAProgram')[0];
            var programB = newRow.getElementsByClassName('col-sm-3 appBProgram')[0];
            var averageRank = newRow.getElementsByClassName('col-sm-2 averageRank')[0];
            var distance = newRow.getElementsByClassName('col-sm-2 distListing')[0];

            rank.innerHTML = String(i + 1);
            programA.innerHTML = rankItem.programA;
            programB.innerHTML = rankItem.programB;
            averageRank.innerHTML = String(rankItem.averageRank);

            if (rankItem.distance === "") {
                distance.innerHTML = "";
            }
            else {
                distance.innerHTML = rankItem.distance.toFixed(1);
            }

            if ((rankItem.exceedsLimit && !longDistanceEntered)
                || (rankItem.noMatch && !noMatchEntered)) {
                newRow.style.borderTopStyle = 'double';
                newRow.style.borderTopWidth = 'thick';
                if (rankItem.exceedsLimit) longDistanceEntered = true;
                else noMatchEntered = true;
            }

            rankListBody.appendChild(newRow);
        }
        else {
            newRow = emptyIndRow.cloneNode(true);

            var program = newRow.getElementsByClassName('indProgramName')[0];
            rank = newRow.getElementsByClassName('indRank')[0];
            var location = newRow.getElementsByClassName('indLocation')[0];

            program.innerHTML = rankItem.program;
            rank.innerHTML = rankItem.rank;
            if (rankItem.city !== null) {
                location.innerHTML = rankItem.city + ', ' + rankItem.state;
            }

            rankListBody.appendChild(newRow);
        }
    }
}



function generateRankList (dataIn, resultsJSON, maxDistIn) {
    console.log('Generating rank list!');
    var noFlagRanks = [];
    var longDistanceRanks = [];
    var strictMatchRanks = [];
    var strictMismatchRanks = [];
    var noMatchRanks = [];
    var maxDistance;
    var applicantARanks = {};
    var applicantBRanks = {};

    if (!dataIn) {
        maxDistance = document.getElementById('maxDist').value;
        var sortSelections = getSortSelections(false);

        var entryRows = document.getElementsByClassName('row entryRow');
        if (entryRows.length <= 2) {
            alert('At least 2 entries required');
            return;
        }

        for (var i = 0; i < entryRows.length; i++) {
            var row = entryRows[i];
            var programNameField = row.getElementsByClassName('tt-input')[0];

            var programName = $(programNameField).typeahead('val');
            if (programName.length === 0) continue;

            var rankA = parseInt(row.getElementsByClassName('form-control rankA')[0].value);
            var rankB = parseInt(row.getElementsByClassName('form-control rankB')[0].value);

            if (rankA) {
                applicantARanks[programName] = rankA;
            }
            if (rankB) {
                applicantBRanks[programName] = rankB;
            }
        }
    }
    else {
        console.log('Running dataIn generation');
        maxDistance = maxDistIn;
        //noinspection JSUnresolvedVariable
        var rankListA = resultsJSON.a.entries;
        var rankListB = resultsJSON.b.entries;

        sortSelections = getSortSelections(true);

        for (i = 0; i < rankListA.length; i++) {
            var entry = rankListA[i];
            applicantARanks[entry.program] = parseInt(entry.rank);
        }
        for (i = 0; i < rankListB.length; i++) {
            entry = rankListB[i];
            applicantBRanks[entry.program] = parseInt(entry.rank);
        }
    }
    if (sortSelections[1] === 'noMatch1' || sortSelections[1] === 'noMatchInd1') {
        applicantARanks['No Match'] = 999;
        applicantBRanks['No Match'] = 999;
    }

    for (var rank1 in applicantARanks) {
        if (applicantARanks.hasOwnProperty(rank1)) {
            for (var rank2 in applicantBRanks) {
                if (applicantBRanks.hasOwnProperty(rank2)) {
                    var newRank = new CoupleRank(rank1, applicantARanks[rank1], rank2, applicantBRanks[rank2], parseInt(maxDistance));
                    if (newRank.programA === 'No Match' && newRank.programB === 'No Match') continue;

                    if (newRank.exceedsLimit) {
                        longDistanceRanks.push(newRank);
                        continue;
                    }
                    if (newRank.strictMatch) {
                        if (sortSelections[2] === 'strictMatch0' || sortSelections[2] === 'strictMatchInd0') {
                            strictMatchRanks.push(newRank);
                            continue;
                        }
                        else if (sortSelections[2] === 'strictMatch1' || sortSelections[2] === 'strictMatchInd1') {
                            strictMismatchRanks.push(newRank);
                            continue;
                        }
                    }
                    if (newRank.noMatch) {
                        noMatchRanks.push(newRank);
                        continue;
                    }

                    noFlagRanks.push(newRank);
                }
            }
        }
    }

    strictMatchRanks.sort(sortRanks(sortSelections[0]));
    noFlagRanks.sort(sortRanks(sortSelections[0]));
    strictMismatchRanks.sort(sortRanks(sortSelections[0]));
    longDistanceRanks.sort(sortRanks(sortSelections[0]));
    noMatchRanks.sort(sortRanks(sortSelections[0]));

    var rankLists = [strictMatchRanks, noFlagRanks, strictMismatchRanks, longDistanceRanks, noMatchRanks];
    var compiledList = [];

    for (i = 0; i < 5; i++) {
        if (rankLists[i].length > 0) {
            for (var j = 0; j < rankLists[i].length; j++) {
                compiledList.push(rankLists[i][j]);
            }
        }
    }

    generateModalRows(document.getElementById('rankListBody'), compiledList);

    var modal = document.getElementById('resultsModal');
    var listLabels = modal.getElementsByClassName('col-sm-3 colLabel');
    if (dataIn) {
        //noinspection JSUnresolvedVariable
        listLabels[0].innerHTML = resultsJSON.a.username;
        listLabels[1].innerHTML = resultsJSON.b.username;

        // Add usernames to list for export to Excel
        compiledList.splice(0, 0, [resultsJSON.a.username, resultsJSON.b.username]);
    }
    else {
        listLabels[0].innerHTML = 'Applicant A Rank List';
        listLabels[1].innerHTML = 'Applicant B Rank List';
        compiledList.splice(0, 0, null);
    }

    $(modal).modal('show');
    lastCoupleList = compiledList;
    console.log(JSON.stringify(lastCoupleList));
    $(modal).on('hidden.bs.modal', clearModal);
}


function clearAllRows () {
    var entryRows = document.getElementsByClassName('row entryRow');
    for (var i = 0; i < entryRows.length; i++) {
        var row = entryRows[i];
        row.getElementsByClassName('tt-input')[0].value = "";
        row.getElementsByClassName('form-control rankA')[0].value = "";
        row.getElementsByClassName('form-control rankB')[0].value = "";
    }
}

function sortRanks (primarySort) {
    if (primarySort === 'sortPrimary0' || primarySort === 'sortPrimaryInd0') {
        return function (a, b) {
            if (a.exceedsLimit === b.exceedsLimit) {
                return a.averageRank - b.averageRank;
            }
            else {
                if (a.exceedsLimit) {
                    return 1
                }
                else {
                    return -1;
                }
            }
        }
    }
    if (primarySort === 'sortPrimary1' || primarySort === 'sortPrimaryInd1') {
        return function (a, b) {
            if (a.averageRank !== b.averageRank) {
                return a.averageRank - b.averageRank;
            }
            else {
                return a.distance - b.distance;
            }
        }
    }
    if (primarySort === 'sortPrimary2' || primarySort === 'sortPrimaryInd2') {
        return function (a, b) {
            if (a.distance !== b.distance) {
                return a.distance - b.distance;
            }
            else {
                return a.averageRank - b.averageRank;
            }
        }
    }
}


function clearModal () {
    var rankRows = document.getElementsByClassName('row rankListRow');
    var modalBody = document.getElementById('rankListBody');

    for (var i = rankRows.length - 1; i >= 0; i--) {
        modalBody.removeChild(rankRows[i]);
    }

    var indSubRows = document.getElementsByClassName('row indSubRow');
    var indSubBody = document.getElementById('indSubBody');
    for (i = indSubRows.length - 1; i >= 0; i--) {
        indSubBody.removeChild(indSubRows[i]);
    }
}


function submitCouplesHandler () {
    console.log('submitCouplesHandler');
    var filename;

    var req = new XMLHttpRequest();
    req.open("POST", '/couplesmatchsubmit', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.onload = function () {
        if (this.status === 200) {
            var response = req.responseText;
            if (response.substring(0, 1) === 'Y') {
                filename = response.substring(1);
            }
            console.log('filename');
            console.log(filename);

            if (/\D/.test(filename)) {
                alert('Error occurred. Please try again.');
                return;
            }
            window.location.href = '/couplesmatchsubmit?f=' + filename;
        }
        else {
            alert('Submission failed. Please try again.');
        }
    };

    req.send(JSON.stringify(lastCoupleList));
}


function activateTypeahead (programInput) {
    $('#' + programInput).typeahead({
        minLength: 3,
        highlight: true
    },
    {
        name: 'programNames',
        source: updatePrediction()
    });
}


function updatePrediction () {
    return function getMatches (query, callback) {
        var matches = [];
        var wordList = query.split(" ");
        var res = [];
        for (var i = 0; i < wordList.length; i++) {
            var re = new RegExp(wordList[i], 'i');
            res.push(re);
        }
        for (i = 0; i < programNames.length; i++) {
            var match = true;
            for (var j = 0; j < res.length; j++) {
                if (!res[j].test(programNames[i])) {
                    match = false;
                }
            }
            if (match) {
                matches.push(programNames[i]);
                if (matches.length >= 5) {
                    break;
                }
            }
        }
    callback(matches);
    };
    // Checks for match between current entered text and program name for prediction
}


function haversineFunction (programA, programB) {
    console.log('programA:');
    console.log(programA);
    console.log(programA.latitude);
    // Returns distance between two sets of latitude/longitude coordinates in miles
    var latA =  parseFloat(programA.latitude) * Math.PI / 180;
    console.log('latA: ');
    console.log(latA);
    var longA =  parseFloat(programA.longitude) * Math.PI / 180;
    var latB = parseFloat(programB.latitude) * Math.PI / 180;
    var longB = parseFloat(programB.longitude) * Math.PI / 180;
    var earthRadius = 6371;

    var deltaLat = latB - latA;
    var deltaLong = longB - longA;

    var a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(latA) * Math.cos(latB) *
            Math.sin(deltaLong / 2) * Math.sin(deltaLong / 2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c * 0.631371
}


function switchLayout (event) {
    var switchBtn = event.target;
    var headerInstructions = document.getElementById('headerInstructions');

    var btnCols = document.getElementsByClassName('centerButton');
    var submitRanksCol = btnCols[0];
    var retrieveRanksCol = btnCols[1];

    var submitRanksBtn = document.getElementById('submitRanksBtn');
    var retrieveRanksBtn = document.getElementById('retrieveRanksBtn');
    var distanceCol = document.getElementsByClassName('setDistance')[0];
    var noMatchCol = document.getElementsByClassName('noMatchCol')[0];
    var indSubIcon = document.getElementById('indSubIcon');
    var btnPaddingCols = document.getElementsByClassName('btnPadding');

    if (switchBtn.innerHTML === 'Switch to Individual Submission') {
        switchBtn.innerHTML = 'Switch to Joint Submission';
        indSubIcon.style.display = 'none';

        headerInstructions.innerHTML = "Enter personal ranks individually and submit to generate all possible rank " +
            "pair combinations.";

        submitRanksBtn.innerHTML = 'Submit Ranks';
        retrieveRanksBtn.innerHTML = 'Retrieve Results';

        submitRanksBtn.removeEventListener('click', generateButtonListener);
        submitRanksBtn.addEventListener('click', createIndividualRanks);

        retrieveRanksBtn.removeEventListener('click', clearAllRows);
        retrieveRanksBtn.addEventListener('click', showRetrieveModal);

        distanceCol.style.display = 'none';
        noMatchCol.style.display = 'none';

        submitRanksCol.className = 'col-sm-3 centerButton';
        retrieveRanksCol.className = 'col-sm-3 centerButton';
        for (var i = 0; i < 2; i++) {
            btnPaddingCols[i].className = 'col-sm-3 btnPadding';
        }

        for (i = 0; i < activeRows.length; i++) {
            var currentEntryID = 'programInput' + activeRows[i].toString();
            var inputRow = getParentRow(document.getElementById(currentEntryID));
            console.log(inputRow);

            inputRow.removeChild(inputRow.getElementsByClassName('col-sm-2 rankBCol')[0]);
            inputRow.getElementsByClassName('deletionColumn')[0].className = 'col-sm-3 deletionColumn';

            var emptyColumn = document.createElement('DIV');
            emptyColumn.className = 'col-sm-1 optionalPaddingDiv';
            inputRow.appendChild(emptyColumn);

            var typeaheads = inputRow.getElementsByClassName('typeahead');
            for (var j = 0; j < typeaheads.length; j++) {
                $(typeaheads[j]).typeahead('destroy');
            }

            var rankAField = inputRow.getElementsByClassName('form-control rankA')[0];
            rankAField.setAttribute('placeholder', 'Rank');

            if (i === 0) {
                // Clear fields to clone blank
                var deleteButton = inputRow.getElementsByTagName('button')[0];
                var deleteButtonDisplay = deleteButton.style.display;
                deleteButton.style.display = 'none';

                var programEntryField = document.getElementById(currentEntryID);
                var programName = programEntryField.value;
                programEntryField.value = "";

                var rankA = rankAField.value;
                rankAField.value = "";

                var locGlyph = inputRow.getElementsByClassName('locGlyph')[0];
                var locGlyphState = locGlyph.style.display;
                locGlyph.style.display = 'none';

                emptyInputRow = inputRow.cloneNode(true); // Only need to clone new layout once

                // Restore values after cloning
                programEntryField.value = programName;
                rankAField.value = rankA;
                locGlyph.style.display = locGlyphState;
                deleteButton.style.display = deleteButtonDisplay;
            }
            activateTypeahead(currentEntryID);
        }
    }
    else {
        switchBtn.innerHTML = "Switch to Individual Submission";
        indSubIcon.style.display = 'inline-block';

        headerInstructions.innerHTML = "Enter programs with each applicant's rank to generate all possible" +
            " combinations sorted by average rank.";

        submitRanksBtn.innerHTML = 'Generate List';
        retrieveRanksBtn.innerHTML = 'Clear All';

        submitRanksBtn.removeEventListener('click', createIndividualRanks);
        submitRanksBtn.addEventListener('click', generateButtonListener);

        retrieveRanksBtn.removeEventListener('click', showRetrieveModal);
        retrieveRanksBtn.addEventListener('click', clearAllRows);

        noMatchCol.style.display = 'block';

        if (document.getElementById('sortPrimary0').children.length === 1) {
            distanceCol.style.display = 'flex';
            for (i = 0; i < 2; i++) {
                btnPaddingCols[i].className = 'col-sm-2 btnPadding';
            }
        }
        else {
            for (i = 0; i < 2; i++) {
                btnPaddingCols[i].className = 'col-sm-3 btnPadding';
            }
        }

        submitRanksCol.className = 'col-sm-2 centerButton';
        retrieveRanksCol.className = 'col-sm-2 centerButton';

        for (i = 0; i < activeRows.length; i++) {
            console.log('Active rows: ');
            console.log(activeRows);
            currentEntryID = 'programInput' + activeRows[i].toString();
            console.log('Current entry ID: ');
            console.log(currentEntryID);
            inputRow = getParentRow(document.getElementById(currentEntryID));
            console.log(inputRow);

            inputRow.removeChild(inputRow.getElementsByClassName('col-sm-1 optionalPaddingDiv')[0]);
            inputRow.getElementsByClassName('deletionColumn')[0].className = 'col-sm-2 deletionColumn';

            var rankBCol = document.createElement('DIV');
            rankBCol.className = 'col-sm-2 rankBCol';
            rankBCol.innerHTML = '<div class="input-group"><input type="number" class="form-control rankB" placeholder="Rank B"></div>';
            inputRow.insertBefore(rankBCol, inputRow.children[inputRow.children.length - 1]);

            typeaheads = inputRow.getElementsByClassName('typeahead');
            for (j = 0; j < typeaheads.length; j++) {
                $(typeaheads[j]).typeahead('destroy');
            }

            rankAField = inputRow.getElementsByClassName('form-control rankA')[0];
            rankAField.setAttribute('placeholder', 'Rank A');

            if (i === 0) {
                // Clear fields to clone blank
                deleteButton = inputRow.getElementsByTagName('button')[0];
                deleteButtonDisplay = deleteButton.style.display;
                deleteButton.style.display = 'none';

                programEntryField = document.getElementById(currentEntryID);
                programName = programEntryField.value;
                programEntryField.value = "";

                rankA = rankAField.value;
                rankAField.value = "";

                locGlyph = inputRow.getElementsByClassName('locGlyph')[0];
                locGlyphState = locGlyph.style.display;
                locGlyph.style.display = 'none';

                emptyInputRow = inputRow.cloneNode(true); // Only need to clone new layout once

                // Restore values after cloning
                programEntryField.value = programName;
                rankAField.value = rankA;
                locGlyph.style.display = locGlyphState;
                deleteButton.style.display = deleteButtonDisplay;
            }
            activateTypeahead(currentEntryID);
        }
    }
}


function CoupleRank (programA, rankA, programB, rankB, distanceLimit) {
    this.programA = programA;
    this.rankA = parseInt(rankA);
    this.programB = programB;
    this.rankB = parseInt(rankB);
    this.averageRank = (this.rankA + this.rankB) / 2;
    this.distance = null;
    this.exceedsLimit = null;
    this.noMatch = null;
    this.strictMatch = false;

    // Get distance
    if (programDB[programA] !== undefined && programDB[programB] !== undefined) {
        var programAInfo = programDB[programA];
        var programBInfo = programDB[programB];
        if (programAInfo.state === programBInfo.state && programAInfo.city === programBInfo.city) {
            this.distance = 0;
        }
        else {
            this.distance = haversineFunction(programAInfo, programBInfo);
        }
    }
    else {
        this.distance = "";
    }

    // Check if exceeds distance limit
    if (isNaN(distanceLimit) || typeof this.distance == "string") {
        this.exceedsLimit = false;
    }
    else {
        this.exceedsLimit = this.distance > distanceLimit;
    }

    if (programA === programB) {
        this.strictMatch = true;
    }

    if (programA === 'No Match' || programB === 'No Match') {
        this.noMatch = true;
        this.averageRank = rankA + rankB - 999;
    }
}

function IndividualRank (program, rank) {
    this.program = program;
    this.rank = rank;
    if (programDB[program] !== undefined) {
        this.city = programDB[program].city;
        this.state = programDB[program].state;
    }
    else {
        this.city = null;
        this.state = null;
    }
}
/**
 * Created by Nick on 9/5/2016.
 */

var progressLog = {};
var progressCount = 0;

function simpleKeywordTest () {
    var outcomes = {};
    var runTimes = {};
    var totalRunTime = 0;
    for (var example in simKeyTestExamples) {
        if (simKeyTestExamples.hasOwnProperty(example)) {
            var startTime = new Date().getTime();
            var output = simpleKeywordCipherCrack(simKeyTestExamples[example]);
            var endTime = new Date().getTime();
            var runTime = endTime - startTime;
            runTimes[example] = runTime;
            totalRunTime += runTime;

            if (output === simKeyTestSolutions[example]) {
                outcomes[example] = true;
                makeLogEntry("Executed successfully in " + runTime);
            }
            else {
                outcomes[example] = false;
                makeLogEntry("Executed unsuccessfully in " + runTime);
            }
            postLog();
        }
    }
    makeLogEntry(runTimes);
    makeLogEntry('Total run time: ' + String(totalRunTime));
    postLog();
}

function makeLogEntry (entry) {
    progressLog[progressCount] = entry;
    progressCount++;
}

function postLog () {
    var cache = [];
    var logToSend = JSON.stringify(progressLog, function (key, value) {
        // Prevents circular serialization error
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Prevents redundant serialization
                return null;
            }
            else {
                cache.push(value);
            }
        }
        return value;
    });
    cache = null;

    progressLog = {};
    progressCount = 0;

    var req = new XMLHttpRequest();
    req.open("POST", '/encryptionLogPost', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(logToSend);
}
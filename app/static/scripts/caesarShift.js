/**
 * Created by Nick on 8/19/2016.
 */

function caesarShiftEncrypt (decrypt) {

    var originalAlphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
                    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
                    'Y', 'Z'];

    var inputText = getText();
    var shift = Number(getKeyword(0, false, false));
    if (isNaN(shift) || shift % 1) {
        alert("Please enter a whole number");
        return 88;
    }

    var cipherAlphabet = [];
    var letterIndex = shift;
    while (cipherAlphabet.length < 26) {
        if (letterIndex < 0) {
            var correctedLetterIndex = 26 + letterIndex;
        }
        else {
            correctedLetterIndex = letterIndex;
        }
        cipherAlphabet.push(originalAlphabet[letterIndex % 26]);
        letterIndex++;
    }
    if (decrypt) {
        return transformWithAlphabet(cipherAlphabet, originalAlphabet, inputText);
    }
    else {
        return transformWithAlphabet(originalAlphabet, cipherAlphabet, inputText);
    }
    
}

function caesarShiftDecrypt () {
    return caesarShiftEncrypt(true);
}
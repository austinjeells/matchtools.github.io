/**
 * Created by Nick on 12/28/2015.
 */

function simpleKeywordCipherEncrypt () {
    // Takes input and keyword, generates cipher alphabet from keyword, and generates output cipher text
    var inputText = getText();
    var keyword = getKeyword(0, true, false);

    var originalAlphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
                    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
                    'Y', 'Z'];
    var transformedAlphabet = [];

    // Generates cipher alphabet letters for each letter of keyword
    for (var i = 0; i < keyword.length; i++) {
        var letter = keyword.slice(i, i + 1);
        if (originalAlphabet.indexOf(letter) > -1 || letter === " ") {
            if (transformedAlphabet.indexOf(letter) === -1 && letter !== " ") {
                transformedAlphabet.push(letter);
            }
        }
        else {
            alert("Keyword/phrase may only contain letters and spaces.");
            return 88;
        }
    }

    // Fills in remaining cipher alphabet with unused letters
    for (i = 0; i < originalAlphabet.length; i++) {
        letter = originalAlphabet[i];
        if (transformedAlphabet.indexOf(letter) === -1) {
            transformedAlphabet.push(letter);
        }
    }

    if (transformedAlphabet.length !== 26) {
        alert("Error occurred in encryption.");
        return 88;
    }
    return transformWithAlphabet(originalAlphabet, transformedAlphabet, inputText);
}


function simpleKeywordCipherDecrypt () {
    var inputText = getText();
    var keyword = getKeyword(0, true, false);

    var originalAlphabet = [];
    var transformedAlphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
                    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
                    'Y', 'Z'];
    // Generates plaintext alphabet from keyword
    for (var i = 0; i < keyword.length; i++) {
        var letter = keyword.slice(i, i + 1);
        if (transformedAlphabet.indexOf(letter) === -1 && letter !== " ") {
            alert("Keyword/phrase must contain only letters and spaces");
            return 88;
        }
        if (originalAlphabet.indexOf(letter) === -1 && letter !== " ") {
            originalAlphabet.push(letter);
        }
    }
    // Fills in remaining plaintext alphabet from unused letters
    for (i = 0; i < transformedAlphabet.length; i++) {
        letter = transformedAlphabet[i];
        if (originalAlphabet.indexOf(letter) === -1) {
            originalAlphabet.push(letter);
        }
    }

    var output = '';
    for (i = 0; i < inputText.length; i++) {
        letter = inputText.slice(i, i + 1);
        var letterNumber = originalAlphabet.indexOf(letter.toUpperCase());
        if (letterNumber > -1) {
            if (letter.toUpperCase() === letter) {
                output += transformedAlphabet[letterNumber];
            }
            else {
                output += transformedAlphabet[letterNumber].toLowerCase();
            }
        }
        else {
            output += letter;
        }
    }

    return output;
}

function PartialSolution (oldSolution, wordList) {
    // PartialSolution prototype to contain necessary information regarding prior efforts to solve

    if (oldSolution == null) {
        this.words = {}; // Object containing all words of form {index: [word array]}
        this.subReg = {}; // Substitution register to track if letter has been substituted {index: [bool array]}
        this.solvedLetters = {}; // For each letter in alphabet, either {letter: null} or {letter: solved letter}
        this.solvedLetterValues = []; // List of plaintext  letters that have been solved for
        this.solvedLettersJSON = "";
        this.solvedWords = []; // List of indices of solved words

        this.words.numWords = wordList.length; 
        var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (var i = 0; i < wordList.length; i++) {
            var word = wordList[i];
            var letters = [];
            var subRegWord = [];
            for (var j = 0; j < word.length; j++) {
                if (alphabet.indexOf(word.charAt(j)) > -1 || j !== word.length - 1) {
                    letters.push(word.charAt(j));
                    if (alphabet.indexOf(word.charAt(j)) === -1) {
                        subRegWord.push(true);
                    }
                    else {
                        subRegWord.push(false);
                    }
                }
            }
            this.words[i] = letters;
            this.subReg[i] = subRegWord;
        }

        for (i = 0; i < 26; i++) {
            this.solvedLetters[alphabet.charAt(i)] = null;
        }
        this.solvedLettersJSON = JSON.stringify(this.solvedLetters);
    }
    else {
        this.words = JSON.parse(JSON.stringify(oldSolution.words));
        for (i = 0; i < this.words.numWords; i++) {
            word = this.words[i];
            for (j = 0; j < word.length; j++) {

            }
        }
        this.subReg = JSON.parse(JSON.stringify(oldSolution.subReg));
        this.solvedLetters = JSON.parse(JSON.stringify(oldSolution.solvedLetters));
        this.solvedLetterValues = JSON.parse(JSON.stringify(oldSolution.solvedLetterValues));
        this.solvedLettersJSON = JSON.stringify(this.solvedLetters);
        this.solvedWords = JSON.parse(JSON.stringify(oldSolution.solvedWords));
    }
}

PartialSolution.prototype.outputString = function () {
    var output = "";
    for (var i = 0; i < this.words.numWords; i++) {
        var word = this.words[i];
        for (var j = 0; j < word.length; j++) {
            output += word[j];
        }
        output += " ";
    }
    return output;
};

PartialSolution.prototype.updateCiphertext  = function () {
    // Updates text by substituting ciphertext letters with solved letters

    for (var i = 0; i < this.words.numWords; i++) {
        var word = this.words[i];
        for (var j = 0; j < word.length; j++) {
            // If not substituted and letter solved for
            if (this.subReg[i][j] === false && this.solvedLetters[word[j]] !== null) {
                word[j] = this.solvedLetters[word[j]];
                this.subReg[i][j] = true;
            }
        }
        // Checks if word solved and adds to solvedWords array if it is
        if (this.solvedWords.indexOf(i) === -1) {
            var wordSolved = true;
            for (j = 0; j < word.length; j++) {
                if (!this.subReg[i][j]) {
                    wordSolved = false;
                    break;
                }
            }
            if (wordSolved) {
                this.solvedWords.push(i);
            }
        }
    }
    
    this.solvedLettersJSON = JSON.stringify(this.solvedLetters);
    // Updates solvedLetterValues
    this.solvedLetterValues = [];
    for (var letter in this.solvedLetters) {
        if (this.solvedLetters.hasOwnProperty(letter)
                && this.solvedLetters[letter] !== null
                && this.solvedLetterValues.indexOf(letter) === -1) {
            this.solvedLetterValues.push(this.solvedLetters[letter]);
        }
    }
};

function ChangeNode (type, parentNode, change, partialSolution) {
    // Node for tree-based solution finding functions (longestWordSolver, contractionSolver, oneLetterSolver)

    if (parentNode === null) {
        this.partialSolution = new PartialSolution(partialSolution);
        this.lastChange = null;
        this.parentNode = null;
        this.layer = 0;
        if (type === "Longest") {
            this.hyphenatedWords = [];
            this.wordsWithSpecialChars = [];
        }
        if (type === "Contraction") {
            this.failedChanges = [];
        }
    }
    else {
        this.parentNode = parentNode;
        this.partialSolution =  new PartialSolution(parentNode.partialSolution);
        this.lastChange = change;
        this.layer = parentNode.layer + 1;
        switch (type) {
            case "OneLetter":
                // change format: W[word index]L[letter index]S[substituted letter]
                console.log(change);
                console.log(/W\d+L/.exec(change));
                var wordIndex = Number(/W\d+L/.exec(change)[0].slice(1, -1));
                console.log("wordIndex: " + wordIndex);
                var letterIndex = Number(/L\d+S/.exec(change)[0].slice(1, -1));
                console.log("letterIndex: " + letterIndex);
                this.partialSolution.solvedLetters[this.partialSolution.words[wordIndex][letterIndex]] = /S\w/.exec(change)[0].slice(1);
                break;
            case "Longest":
                // change format: {index: n, sub: word}
                var oldWord = this.partialSolution.words[change.index];
                for (var i = 0; i < oldWord.length; i++) {
                    if (!this.partialSolution.subReg[change.index][i]) {
                        if (this.partialSolution.solvedLetters[oldWord[i]] === null) {
                            if (this.partialSolution.solvedLetterValues.indexOf(change.sub.charAt(i)) !== -1) {
                                this.partialSolution = null;
                                console.log("Letter already solved!");
                                return;
                            }
                            else {
                                this.partialSolution.solvedLetters[oldWord[i]] = change.sub.charAt(i);
                                this.partialSolution.solvedLetterValues.push(change.sub.charAt(i));
                            }
                        }
                        else {
                            // Checks if same letter occurs twice in word
                            if (this.partialSolution.solvedLetters[oldWord[i]] !== change.sub.charAt(i)) {
                                this.partialSolution = null;
                                console.log("Uncaught repeat detected!");
                                return;
                            }
                        }
                    }
                }
                this.hyphenatedWords = parentNode.hyphenatedWords;
                this.wordsWithSpecialChars = parentNode.wordsWithSpecialChars;
                break;
            case "Contraction":
                // Change format: "I[word index]S[word substituted]
                console.log(change);
                var index = Number(/I\d+S/.exec(change)[0].slice(1, -1));
                oldWord = this.partialSolution.words[index];
                var newWord = /S.+/.exec(change)[0].slice(1);
                for (i = 0; i < oldWord.length; i++) {
                    var oldLetter = oldWord[i];
                    console.log("Old letter: " + oldLetter);
                    var newLetter = newWord.charAt(i);
                    console.log("New letter: " + newLetter);
                    if (oldLetter === "'") continue;
                    if (this.partialSolution.subReg[index][i]) {
                        if (oldLetter === newLetter) {
                            continue;
                        }
                        else {
                            console.log("Letter already substituted!");
                            this.partialSolution = null;
                            return;
                        }
                    }
                    // Reject if new letter already used and not for current old letter
                    if (this.partialSolution.solvedLetterValues.indexOf(newLetter) !== -1
                        && this.partialSolution.solvedLetters[oldLetter] !== newLetter) {
                        console.log("Letter already used!");
                        this.partialSolution = null;
                        return;
                    }
                    // Reject if old letter already solved for other letter
                    if (this.partialSolution.solvedLetters[oldLetter] !== null) {
                        if (this.partialSolution.solvedLetters[oldLetter] === newLetter) {
                            continue;
                        }
                        else {
                            console.log("Letter already solved!");
                            this.partialSolution = null;
                            return;
                        }
                    }
                    this.partialSolution.solvedLetters[oldLetter] = newLetter;
                    this.partialSolution.solvedLetterValues.push(newLetter);
                }
                this.failedChanges = parentNode.failedChanges;
        }
        this.partialSolution.updateCiphertext();
        parentNode.children.push(this);
    }
    this.children = [];
}

function cleanInput (test) {
    // Takes input text, replaces newline chars with spaces, removes words with length 0
    // then catalogs and removes words with numbers

    if (test == undefined) {
        var inputText = getText();
    }
    else {
        inputText = test;
    }

    inputText = inputText.toUpperCase();
    inputText = inputText.replace(/\n/g, " ");
    var wordList = inputText.split(/[ -]/);
    // Removes words with no chars
    var flagForClear = [];
    for (var i = 0; i < wordList.length; i++) {
        var word = wordList[i];
        if (word.length === 0) {
            flagForClear.push(i);
        }
    }
    for (i = flagForClear.length - 1; i >= 0; i--) {
        wordList.splice(flagForClear[i], 1);
    }
    // Catalogs and removes words with numbers and words with one letter after apostrophe
    // TODO: Solve words with one letter following apostrophe instead of just removing
    flagForClear = [];
    var omittedWords = {};
    for (i = 0; i < wordList.length; i++) {
        word = wordList[i];
        var patt = /\d/;
        if (patt.test(word)) {
            omittedWords[i] = word;
            flagForClear.push(i);
        }
        patt = /'\w$/;
        if (patt.test(word)) {
            omittedWords[i] = word;
            flagForClear.push(i);
        }
    }
    for (i = flagForClear.length - 1; i >= 0; i--) {
        wordList.splice(flagForClear[i], 1);
    }
    console.log(omittedWords);
    return [omittedWords, wordList];
}

function fractionSolvedWordsUnknown (partialSolution) {
    // Counts words that are solved but not found in word reference
    // Returns proportion of unknown words to message length

    var unknownWordsCount = 0;
    for (var i = 0; i < partialSolution.solvedWords.length; i++) {
        var currentSolvedWord = partialSolution.words[partialSolution.solvedWords[i]];
        var wordReference;
        if (/'/.test(currentSolvedWord.join(""))) {
            wordReference = contractions;
        }
        else {
            switch (currentSolvedWord.length) {
                case 1:
                    continue;
                case 2:
                    wordReference = twoLetterWords;
                    break;
                case 3:
                    wordReference = threeLetterWords;
                    break;
                case 4:
                    wordReference = fourLetterWords;
                    break;
                case 5:
                    wordReference = fiveLetterWords;
                    break;
                case 6:
                    wordReference = sixLetterWords;
                    break;
                default:
                    wordReference = sevenLetterWords;
                    break;
            }
        }
        if (!wordReference[currentSolvedWord.join("")]) {
            console.log("Unknown word: " + currentSolvedWord.join(""));
            unknownWordsCount++;
        }
    }
    return unknownWordsCount / partialSolution.words.numWords;
}

function selectBestSolution (partialSolutions) {
    // Compares solutions. First checks for solution with most solved words.
    // If tied, returns solution with least solved but unknown words.

    var bestSolutions = [];
    var bestSolutionFraction = 0;
    for (var i = 0; i < partialSolutions.length; i++) {
        var fractionOfWordsSolved = partialSolutions[i].solvedWords.length / partialSolutions[i].words.numWords;
        if (fractionOfWordsSolved > bestSolutionFraction) {
            bestSolutions = [partialSolutions[i]];
            bestSolutionFraction = fractionOfWordsSolved;
        }
        else if (fractionOfWordsSolved === bestSolutionFraction) {
            bestSolutions.push(partialSolutions[i]);
        }
    }
    var singleBestSolution;
    var unknownProportion = 1;
    if (bestSolutions.length === 1) {
        singleBestSolution = bestSolutions[0];
    }
    else {
        for (i = 0; i < bestSolutions.length; i++) {
            var currentUnknown = fractionSolvedWordsUnknown(bestSolutions[i]);
            if (currentUnknown < unknownProportion) {
                unknownProportion = currentUnknown;
                singleBestSolution = bestSolutions[i];
            }
        }
    }
    return singleBestSolution;
}

function oneLetterWords (partialSolutions) {
    // Identifies single letter words and substitutes these with either "a" or "i"

    var singleLetterWords = [];
    var oldSolution = partialSolutions[0];
    for (var i = 0; i < oldSolution.words.numWords; i++) {
        var word = oldSolution.words[i];
        if (word.length === 1 && singleLetterWords.indexOf(word[0]) === -1) {
            singleLetterWords.push(word[0]);
        }
    }

    if (singleLetterWords.length === 0) {
        console.log("No single letter words found.");
        return partialSolutions;
    }

    var tempPartialSolutions = [];
    if (singleLetterWords.length === 1) {
        console.log("One single-letter-word found");
        var newSolution1 = new PartialSolution(oldSolution);
        var newSolution2 = new PartialSolution(oldSolution);
        newSolution1.solvedLetters[singleLetterWords[0]] = 'a';
        newSolution2.solvedLetters[singleLetterWords[0]] = 'i';
        newSolution1.updateCiphertext();
        newSolution2.updateCiphertext();
        tempPartialSolutions.push(newSolution1);
        tempPartialSolutions.push(newSolution2);
    }
    else {
        console.log("Multiple single letter words found.");
        for (i = 0; i < singleLetterWords.length; i++) {
            for (var j = 0; j < singleLetterWords.length; j++) {
                if (i !== j) {
                    var newSolution = new PartialSolution(oldSolution);
                    newSolution.solvedLetters[singleLetterWords[i]] = 'a';
                    newSolution.solvedLetters[singleLetterWords[j]] = 'i';
                    newSolution.updateCiphertext();
                    tempPartialSolutions.push(newSolution);
                }
            }
        }
    }
    partialSolutions = tempPartialSolutions;

    return partialSolutions;
}

function contractionSolver (partialSolutions) {
    // Solves for contractions with at least 2 letters after the apostrophe
    // Currently does not solve for contractions with one letter words to avoid problems with possessives
    // e.g. "Sean's"

    var tempSolutions = [];
    var tempOutputStrings = [];

    for (var i = 0; i < partialSolutions.length; i++) {
        var deepestNodes = [];
        var deepestNodesStrings = [];
        var deepestLayer = -1;
        var candidateWords = {};
        var candidateWordCount = 0;
        // Identifies words with at least 2 letters after apostrophe
        for (var j = 0; j < partialSolutions[i].words.numWords; j++) {
            if (/'\w{2,}/.test(partialSolutions[i].words[j].join("")) &&
                partialSolutions[i].solvedWords.indexOf(j) === -1) {
                candidateWords[j] = partialSolutions[i].words[j];
                candidateWordCount++;
            }
        }

        if (candidateWordCount === 0) {
            // If no contractions present
            return partialSolutions;
        }

        var currentNode = new ChangeNode("Contraction", null, null, partialSolutions[i]);
        var allBranchesExplored = false;

        whileLoop:
        while (!allBranchesExplored) {
            var currentCandidate = null, candidateIndex = null;
            // Set current word from list of candidates
            for (var index in candidateWords) {
                if (candidateWords.hasOwnProperty(index)) {
                    candidateIndex = Number(index);
                    currentCandidate = candidateWords[index];
                    break;
                }
            }
            if (currentCandidate === null) {
                if (currentNode.parentNode !== null) {
                    console.log("No suitable candidate word identified - reverting");
                    currentNode = currentNode.parentNode;
                }
                else {
                    // No current candidate and at root node
                    allBranchesExplored = true;
                }
                continue;
            }
            currentContraction:
            for (var contraction in contractions) {
                if (contractions.hasOwnProperty(contraction)) {
                    if (contraction.length !== currentCandidate.length) continue;
                    if (contraction.indexOf("'") !== currentCandidate.indexOf("'")) continue;
                    var proposedChange = "I" + candidateIndex + "S" + contraction;
                    for (j = 0; j < currentNode.children.length; j++) {
                        if (currentNode.children[j].lastChange === proposedChange
                            || currentNode.failedChanges.indexOf(proposedChange) !== -1) {
                            continue currentContraction;
                        }
                    }
                    var newNode = new ChangeNode("Contraction", currentNode, proposedChange, null);
                    if (newNode.partialSolution === null) {
                        currentNode.failedChanges.push(proposedChange);
                        continue;
                    }
                    console.log("Solution found!");
                    currentNode = newNode;
                    if (deepestNodesStrings.indexOf(currentNode.partialSolution.outputString()) === -1) {
                        if (currentNode.layer > deepestLayer) {
                            deepestNodes = [currentNode];
                            deepestLayer = currentNode.layer;
                        }
                        else if (currentNode.layer === deepestLayer) {
                            deepestNodes.push(currentNode);
                        }
                        deepestNodesStrings.push(currentNode.partialSolution.outputString());
                    }
                    continue whileLoop;
                }
            }
            if (currentNode.parentNode !== null) {
                console.log("No solutions found - reverting to parent");
                currentNode = currentNode.parentNode;
            }
            else {
                console.log("All branches explored!");
                allBranchesExplored = true;
            }
        }
        for (j = 0; j < deepestNodes.length; j++) {
            if (tempOutputStrings.indexOf(deepestNodes[j].partialSolution.outputString()) === -1) {
                tempSolutions.push(deepestNodes[j].partialSolution);
                tempOutputStrings.push(deepestNodes[j].partialSolution.outputString());
            }
        }
    }
    if (tempSolutions.length > 0) {
        return tempSolutions;
    }
    else {
        return partialSolutions;
    }
}

function generateThe (partialSolutions) {
    var tempSolutions = [];
    for (var i = 0; i < partialSolutions.length; i++) {
        var partialSolution = partialSolutions[i];
        for (var j = 0; j < partialSolution.words.numWords; j++) {
            var word = partialSolution.words[j];
            if (word.length === 3) {
                var wordSubReg = partialSolution.subReg[j];
                var wordModified = false;
                for (var k = 0; k < wordSubReg.length; k++) {
                    if (wordSubReg[k] === true) {
                        wordModified = true;
                        break;
                    }
                }
                if (!wordModified) {
                    var newSolution = new PartialSolution(partialSolution);
                    newSolution.solvedLetters[word[0]] = 't';
                    newSolution.solvedLetters[word[1]] = 'h';
                    newSolution.solvedLetters[word[2]] = 'e';
                    newSolution.solvedLettersJSON = JSON.stringify(newSolution.solvedLetters);
                    newSolution.updateCiphertext();

                    var solutionUnique = true;
                    for (var l = 0; l < tempSolutions.length; l++) {
                        if (newSolution.solvedLettersJSON === tempSolutions[l].solvedLettersJSON) {
                            solutionUnique = false;
                            break;
                        }
                    }
                    if (solutionUnique) {
                        tempSolutions.push(newSolution);
                    }
                }
            }
        }
    }
    if (tempSolutions.length === 0) {
        return partialSolutions;
    }
    return tempSolutions;
}

function longestWordSolver (partialSolutions) {
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var wordReference = sevenLetterWords;
    var allDeepestSolutions = [];

    forLoop:
    for (var i = 0; i < partialSolutions.length; i++) {
        var deepestNodes = [];
        var deepestLayer = 0;
        var treeExhausted = false;
        var solvedLetterThreshold = 5;
        var failedWords = [];
        var usedLetterAlphabets = {};
        var currentNode = new ChangeNode("Longest", null, null, partialSolutions[i]);

        whileLoop:
        while (!treeExhausted) {
            console.log("Looping! Current layer: " + currentNode.layer);
            var currentSolution = currentNode.partialSolution;
            // Find longest word
            var longestWord = [];
            var longestWordIndex = -1;
            for (var j = 0; j < currentSolution.words.numWords; j++) {
                if (currentSolution.words[j].length > longestWord.length
                    && failedWords.indexOf(j) === -1
                    && currentNode.hyphenatedWords.indexOf(j) === -1
                    && currentNode.wordsWithSpecialChars.indexOf(j) === -1
                    && currentNode.partialSolution.solvedWords.indexOf(j) === -1) {
                    longestWord = currentSolution.words[j];
                    longestWordIndex = j;
                }
            }
            // Determine what to do if longest word below length threshold
            if (longestWord.length < 7) {
                if (deepestLayer > 0) {
                    if (failedWords.length === 0) {
                        // All long words solved
                        console.log("Fraction unsolved: " + fractionSolvedWordsUnknown(currentSolution));
                        treeExhausted = true;
                        allDeepestSolutions.push(currentNode.partialSolution);
                        break forLoop;
                    }
                }
                if (solvedLetterThreshold > 3) {
                    console.log("Reducing threshold to " + String(solvedLetterThreshold - 1));
                    solvedLetterThreshold -= 1;
                    failedWords = [];
                    continue;
                }
                if (currentNode.parentNode === null) {
                    console.log("Tree exhausted!");
                    treeExhausted = true;
                    break;
                }
                console.log("Reverting to parent node.");
                currentNode = currentNode.parentNode;
                failedWords = [];
                continue;
            }
            console.log("Appropriate length for " + longestWord.join(""));
            // Counts letters already solved and checks for non-letter chars
            var solvedLetters = {};
            for (j = 0; j < longestWord.length; j++) {
                if (!/[a-z]/i.test(longestWord[j])) {
                    if (/-/.test(longestWord[j])) {
                        console.log("Hyphenated word identified: " + longestWord.join(""));
                        currentNode.hyphenatedWords.push(longestWordIndex);
                    }
                    else {
                        console.log("Word with special char identified: " + longestWord.join(""));
                        currentNode.wordsWithSpecialChars.push(longestWordIndex);
                    }
                    continue whileLoop;
                }
                if (currentSolution.subReg[longestWordIndex][j]) {
                    solvedLetters[j] = longestWord[j];
                }
            }
            // Check if known letters quantity meets threshold
            if (Object.keys(solvedLetters).length < solvedLetterThreshold) {
                failedWords.push(longestWordIndex);
                console.log("Insufficient known letters in " + longestWord.join("") + " to meet " + solvedLetterThreshold);
                continue;
            }
            currentWord:
            for (var word in wordReference) {
                if (wordReference.hasOwnProperty(word)) {
                    if (word.length !== longestWord.length) continue;
                    // Check if all known letters match
                    for (var solvedLetterIndex in solvedLetters) {
                        if (solvedLetters.hasOwnProperty(solvedLetterIndex)) {
                            if (word.charAt(Number(solvedLetterIndex)) !== solvedLetters[solvedLetterIndex]) {
                                continue currentWord;
                            }
                        }
                    }
                    // Check if current change not already made in child
                    var proposedChange = {
                        index: longestWordIndex,
                        sub: word
                    };
                    for (j = 0; j < currentNode.children.length; j++) {
                        if (currentNode.children[j].lastChange.index === proposedChange.index
                            && currentNode.children[j].lastChange.sub === proposedChange.sub) {
                            console.log("Branch already explored!");
                            continue currentWord;
                        }
                    }
                    // Passed all checks, create new child node
                    console.log("Matched " + word + " with " + longestWord.join("") + "!!");
                    var newNode = new ChangeNode('Longest', currentNode, proposedChange, null);
                    if (newNode.partialSolution === null) {
                        continue;
                    }
                    var solvedAlphabet = "";
                    for (j = 0; j < 26; j++) {
                        solvedAlphabet += alphabet.charAt(j);
                        solvedAlphabet += newNode.partialSolution.solvedLetters[alphabet.charAt(j)];
                    }
                    if (usedLetterAlphabets[solvedAlphabet]) {
                        console.log("Convergence prevented.");
                        continue;
                    }
                    if (fractionSolvedWordsUnknown(newNode.partialSolution) >= 0.1) {
                        console.log("Harmful change prevented");
                        continue;
                    }
                    if (newNode.layer > deepestLayer) {
                        deepestNodes = [newNode];
                        deepestLayer = newNode.layer;
                    }
                    else if (newNode.layer === deepestLayer) {
                        deepestNodes.push(newNode);
                    }
                    usedLetterAlphabets[solvedAlphabet] = true;
                    currentNode = newNode;
                    solvedLetterThreshold = 5;
                    failedWords = [];
                    console.log(currentNode.partialSolution.outputString());
                    continue whileLoop;
                }
            }
            // Executed if no matches found in word reference
            console.log("No matches found for " + longestWord.join(""));
            failedWords.push(longestWordIndex);
        }
        // Transfer deepest nodes from current solution to array for all deepest nodes
        for (j = 0; j < deepestNodes.length; j++) {
            allDeepestSolutions.push(deepestNodes[j].partialSolution);
        }
    }
    return selectBestSolution(allDeepestSolutions);
}

function oneLetterRemainingWordSolver (partialSolution) {
    var alphabet = "abcdefghijklmnopqrstuvwxyz";
    var currentNode = new ChangeNode("OneLetter", null, null, partialSolution);
    var deepestNodeLayer = 0;
    var deepestNodeSolutions = [currentNode.partialSolution];

    doLoop:
    do {
        var currentSolution = currentNode.partialSolution;
        console.log(currentSolution.outputString());

        var lettersUnsolved = 0;
        for (var i = 0; i < currentSolution.words.numWords; i++) {
            for (var j = 0; j < currentSolution.subReg[i].length; j++) {
                if (!currentSolution.subReg[i][j]) lettersUnsolved++;
            }
        }
        if (lettersUnsolved === 0) break;

        for (i = 0; i < currentSolution.words.numWords; i++) {
            var unsolvedLettersCount = 0;
            var unsolvedLetterIndex;
            for (j = 0; j < currentSolution.words[i].length; j++) {
                if (!currentSolution.subReg[i][j]) {
                    unsolvedLettersCount++;
                    unsolvedLetterIndex = j;
                }
            }
            if (unsolvedLettersCount === 1) {
                console.log("Word with one letter found: " + currentSolution.words[i].join(""));
                currentLetter:
                for (j = 0; j < alphabet.length; j++) {
                    if (currentSolution.solvedLetterValues.indexOf(alphabet.charAt(j)) === -1) {
                        console.log("Unused letter identified.");
                        var attemptedChange = String("W" + i + "L" + unsolvedLetterIndex + "S" + alphabet[j]);
                        for (var k = 0; k < currentNode.children.length; k++) {
                            if (currentNode.children[k].lastChange === attemptedChange) continue currentLetter;
                        }
                        console.log("New change identified.");
                        var testWordArray = currentSolution.words[i].slice(); // Clones array
                        testWordArray[unsolvedLetterIndex] = alphabet[j];
                        var wordReference;
                        switch (testWordArray.length) {
                            case 1:
                                continue;
                            case 2:
                                wordReference = twoLetterWords;
                                break;
                            case 3:
                                wordReference = threeLetterWords;
                                break;
                            case 4:
                                wordReference = fourLetterWords;
                                break;
                            case 5:
                                wordReference = fiveLetterWords;
                                break;
                            case 6:
                                wordReference = sixLetterWords;
                                break;
                            default:
                                wordReference = sevenLetterWords;
                                break;
                        }
                        console.log("Testing: " + testWordArray.join(""));
                        if (wordReference[testWordArray.join("")]) {
                            var newNode = new ChangeNode("OneLetter", currentNode, attemptedChange, null);
                            if (newNode.layer === deepestNodeLayer) {
                                deepestNodeSolutions.push(newNode.partialSolution);
                            }
                            else if (newNode.layer > deepestNodeLayer) {
                                deepestNodeLayer = newNode.layer;
                                deepestNodeSolutions = [newNode.partialSolution];
                            }
                            currentNode = newNode;
                            console.log("New node created!");
                            console.log(newNode);
                            continue doLoop;
                        }
                    }
                }
            }
        }
        if (currentNode.parentNode !== null) {
            currentNode = currentNode.parentNode;
        }
        else {
            break;
        }
    } while (lettersUnsolved > 0);

    return selectBestSolution(deepestNodeSolutions);
}

function replaceOmittedWords (partialSolution, omittedWords) {
    var wordList = [];
    for (var j = 0; j < partialSolution.words.numWords; j++) {
        wordList.push(partialSolution.words[j]);
    }
    for (var index in omittedWords) {
        if (omittedWords.hasOwnProperty(index)) {
            var omittedWord = omittedWords[index];
            console.log("Omitted word: " + omittedWord);
            var decipheredWord = [];
            for (j = 0; j < omittedWord.length; j++) {
                var outputChar = partialSolution.solvedLetters[omittedWord.charAt(j)];
                if (outputChar !== null && outputChar != undefined) {
                    decipheredWord.push(partialSolution.solvedLetters[omittedWord.charAt(j)]);
                }
                else {
                    decipheredWord.push(omittedWord.charAt(j));
                }
            }
            console.log("Deciphered word: ");
            console.log(decipheredWord);
            wordList.splice(Number(index), 0, decipheredWord);
        }
    }
    for (j = 0; j < wordList.length; j++) {
        partialSolution.words[j] = wordList[j];
    }
    partialSolution.words.numWords = wordList.length;
}

function simpleKeywordCipherCrack (test) {
    try {
        var inputCleaning = cleanInput(test); // returns [omittedWords, cleanedInput]
        var omittedWords = inputCleaning[0];
        var initialParse = new PartialSolution(undefined, inputCleaning[1]);
        var partialSolutions = [];
        partialSolutions.push(initialParse);
        console.log("Initial array: ");
        console.log(partialSolutions);

        partialSolutions = oneLetterWords(partialSolutions);
        console.log("oneLetterWords: ");
        console.log(partialSolutions);

        partialSolutions = contractionSolver(partialSolutions);
        console.log("Contractions: ");
        console.log(partialSolutions);

        partialSolutions = generateThe(partialSolutions);
        console.log('generateThe');
        console.log(partialSolutions);

        var partialSolution = longestWordSolver(partialSolutions);
        if (partialSolution === 99) {
            return "Cryptanalysis failed.";
        }
        console.log("Results of solving long words: ");
        console.log(partialSolution);
        console.log(partialSolution.outputString());

        partialSolution = oneLetterRemainingWordSolver(partialSolution);
        console.log("Attempted to solve words with one letter remaining unsolved.");
        console.log(partialSolution);
        console.log(partialSolution.outputString());

        replaceOmittedWords(partialSolution, omittedWords);
        return partialSolution.outputString();
    }
    catch (error) {
        console.log(error);
        return "Error occurred during cryptanalysis.";
    }
}
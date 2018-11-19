/**
 * Created by Nick on 12/27/2015.
 */

var ancillaryInputContainer, encryptionMethodList, encryptButton, decryptButton;
var wideScreenContainer = document.querySelector("#wideScreenContainer");
var narrowScreenContainer = document.querySelector("#narrowScreenContainer");
var lastScreenWide;

function resizeEvent () {
    console.log("Resize event function triggered!");
    if (window.outerWidth > window.screen.height) {
        console.log("Switching to wide screen layout.");
        ancillaryInputContainer = document.querySelector("#ancillaryInputContainer");
        encryptionMethodList = document.querySelector("#encryptionMethod");
        encryptButton = document.querySelector("#encryptButton");
        decryptButton = document.querySelector("#decryptButton");
        lastScreenWide = true;
        wideScreenContainer.style.display = "inline";
        narrowScreenContainer.style.display = "none";
    }
    else {
        console.log("Switching to narrow screen layout.");
        ancillaryInputContainer = document.querySelector("#ancillaryInputContainerNarrow");
        encryptionMethodList = document.querySelector("#encryptionMethodNarrow");
        encryptButton = document.querySelector("#encryptButtonNarrow");
        decryptButton = document.querySelector("#decryptButtonNarrow");
        lastScreenWide = false;
        wideScreenContainer.style.display = "none";
        narrowScreenContainer.style.display = "inline";
    }
    resetEventListeners();
}
resizeEvent();

window.addEventListener("resize", function () {
    console.log("Width: " + window.outerWidth + ". Height: " + window.screen.height);
    var currentScreenWide;
    currentScreenWide = (window.outerWidth > window.screen.height);
    if (currentScreenWide !== lastScreenWide) {
        resizeEvent();
    }
});

function resetEventListeners () {
    encryptionMethodList.addEventListener("change", function () {
        // Clears any old ancillary inputs
        while (ancillaryInputContainer.firstChild) {
            ancillaryInputContainer.removeChild(ancillaryInputContainer.firstChild);
        }

        // Parses encryptionMethods object and creates specified ancillary input fields
        var selectedMethod = encryptionMethodList.value;
        var options = encryptionMethods[selectedMethod];
        for (var ancillary in options.ancillaries) {
            var ancillaryCount = 0;
            if (options.ancillaries.hasOwnProperty(ancillary)) {
                var ancillaryInput = document.createElement("INPUT");
                ancillaryInput.type = "text";
                if (lastScreenWide) {
                    ancillaryInput.className = "codeStyle ancillaryInput";
                }
                else {
                    ancillaryInput.className = "codeStyle ancillaryInputNarrow";
                }
                ancillaryInput.id = "ancillaryInput" + String(ancillaryCount);
                ancillaryInput.tabIndex = ancillaryCount + 2;
                ancillaryInput.value = options.ancillaries.ancillaryInput1;
                ancillaryInput.setAttribute("onClick", "this.setSelectionRange(0, this.value.length)");
                ancillaryInputContainer.appendChild(ancillaryInput);
                ancillaryCount++;
                ancillaryInputContainer.appendChild(document.createElement("BR"));
            }
        }
        if (options.attemptCrack) {
            var checkBoxLabel = document.createElement("LABEL");
            var checkBox = document.createElement("INPUT");
            checkBox.type = "checkbox";
            if (lastScreenWide) {
                checkBox.className = "attemptCrack";
                checkBoxLabel.className = "codeStyle crackLabel";
            }
            else {
                checkBox.className = "codeStyle attemptCrackNarrow";
                checkBoxLabel.className = "codeStyle crackLabelNarrow";
            }
            checkBox.id = "attemptCrack";
            checkBoxLabel.appendChild(checkBox);
            checkBoxLabel.appendChild(document.createTextNode("  Attempt to crack cipher without keyword"));
            ancillaryInputContainer.appendChild(checkBoxLabel);
        }
    });

    encryptButton.addEventListener("click", function () {
        var encryptFunction = encryptionMethods[encryptionMethodList.value].encryptFunction;
        var encryptedText = encryptFunction();
        var textOutput;
        if (lastScreenWide) textOutput = document.querySelector("#textOutput");
        else textOutput = document.querySelector("#textInputNarrow");
        textOutput.value = encryptedText;
    });

    decryptButton.addEventListener("click", function () {
        var decryptedText, textOutput;
        if (lastScreenWide) textOutput = document.querySelector("#textOutput");
        else textOutput = document.querySelector("#textInputNarrow");

        var attemptCrack = document.querySelector("#attemptCrack");
        if (attemptCrack == null || !attemptCrack.checked) {
            decryptedText = encryptionMethods[encryptionMethodList.value].decryptFunction();
            textOutput.value = decryptedText;
        }
        else {
            var longCrackModal = $("#longCrackModal");
            longCrackModal.modal("show");
            setTimeout(function () {
                decryptedText = encryptionMethods[encryptionMethodList.value].crackFunction();
                longCrackModal.modal("hide");
                textOutput.value = decryptedText;
            }, 200);
        }
    });
}

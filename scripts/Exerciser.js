let G = new GlobalManager();

// Clear Contents Area
function clearContents() {
    let child = G.parentNode.lastElementChild;
    while(child) {
        G.parentNode.removeChild(child);
        child = G.parentNode.lastElementChild;
    }
}

function insertBRtag(str) {
    return str.replace(/\n/g, "<br/>");
}

function nextQ() {
    if (G.buttonPushed == false) {
        G.passed++;
        G.reviewData.push([document.getElementById("id" + G.rightAnswerIdx).value, ""]);
    }
    G.pointer++;
    displayScore();
    if (G.pointer >= G.shuffledArray.length) {
        clearContents();
        G.seqNo++;
        let labelelem = document.getElementById("selector");
        let labelstr = labelelem.options[labelelem.selectedIndex].innerHTML;
        let revData = "「" + labelstr + "」の結果：\n\n";
        let tweetData = revData;
        let missed = 0;
        let passed = 0;
        if ((G.missed + G.passed) == 0) {
            revData += "　全問正解！";
        } else {
            for (const elem of G.reviewData) {
                if (elem[1] != "") {
                    revData += "　解： " + elem[0] + "を誤って " + elem[1] + " と選択しました。\n";
                    missed += 1;
                } else {
                    revData += "　解： " + elem[0] + "をパスしました。\n";
                    passed += 1;
                }
            }
        }
        G.nextButton.disabled = true;
        alert(revData);
        let denom = G.shuffledArray.length;
        if (confirm("結果をツイートしますか？")) {
            let hit = denom - missed - passed;
            let text = encodeURIComponent(tweetData + "    正答率：" + Math.round(hit * 10000 / denom) / 100.0 + "%\n    正解：" + hit + "    誤り：" + missed + "    パス：" + passed + "\n\n#英語発音聞き取りクイズ\n") + "&url=" + encodeURIComponent("https://mmurak.github.io/Exerciser");
            window.open("https://twitter.com/intent/tweet?text=" + text, "_blank");
        }
    } else {
        createPanel();
    }
    G.verdict.innerHTML = "";
    G.verdict.style = "background-color: #ffffff";
}

function buttonPush(number) {
    G.buttonPushed = true;
    let buttons = document.getElementsByClassName("answer-button");
    for (const elem of buttons) {
        elem.disabled = true;
    }
    if (number == G.rightAnswerIdx) {
        G.bingo++;
        G.verdict.innerHTML = "CORRECT!";
        G.verdict.style = "background-color: #66ccff";
        document.getElementById("id" + G.rightAnswerIdx).style = "color: #1E8449";
    } else {
        G.missed++;
        G.verdict.innerHTML = "WRONG!";
        G.verdict.style = "background-color: #ff99cc";
        let answer = document.getElementById("id" + G.rightAnswerIdx).value;
        let selected = document.getElementById("id" + number).value;
        G.reviewData.push([answer, selected])
        document.getElementById("id" + G.rightAnswerIdx).style = "color: red";
    }
    displayScore();
    return;
}

function ppScore() {
    return "スコア： " + G.numOfQ + "問中  " + G.bingo + "問正解  " + G.missed + "問不正解  " + G.passed + "問未回答";
}

function displayScore() {
    G.statusArea.innerHTML = ppScore();
}

function audioPlay() {
    if (G.audioEngine.paused) {
        G.audioEngine.play();
    } else {
        G.audioEngine.pause();
        G.audioEngine.currentTime = 0;
    }
}

function processMMtag(str) {
    let result = "";
    let regex = new RegExp(/\(\((.+?)\)\)/);
    let m = str.match(regex);
    if (m != null) {
        G.audioEngine.src = G.audioResourceDirectory + G.filenameRoot + "/" + m[1];
        result = str.replace(regex, "<input type=\"button\" class=\"control-button\"value=\"  Play/Stop  \" onclick=\"audioPlay();\">");
    } else {
        result = str;
    }
    result = result.replace(/\[\[(.+?)\]\]/, "<img src=\"" + G.imageResourceDirectory + G.filenameRoot + "/$1" + "\" class=\"image-class\">");
    return result;
}

function createPanel() {
    clearContents();
    G.verdict.innerHTML = "";
    displayScore();
    let panelData = G.shuffledArray[G.pointer];
    let question = document.createElement("p");
    question.className = "text-field";
    G.seqNo++;
    question.innerHTML = "Q" + G.seqNo + ": " + insertBRtag(processMMtag(panelData[0]));
    G.parentNode.appendChild(question);
    let selections = [];
    for (let i = 1; i < panelData.length; i++) {
        selections.push(panelData[i]);
    }
    // Shuffler start
    let idx = selections.length;
    let ridx;
    G.rightAnswerIdx = 0;
    while (idx > 0) {
        ridx = Math.floor(Math.random() * idx);
        idx--;
        if (ridx == G.rightAnswerIdx) {
            G.rightAnswerIdx = idx;
        }
        [selections[idx], selections[ridx]] = [selections[ridx], selections[idx]];
    }
    // Shuffler end
    for (let i = 0; i < selections.length; i++) {
        G.buttonPushed = false;
        let button = document.createElement("input");
        button.type = "button";
        button.id = "id" + i;
        button.className = "answer-button";
        button.value = selections[i];
        button.addEventListener("click", function() { buttonPush(i) });
        G.parentNode.appendChild(button);
    }
}

function mainProcess(csvArray) {
    G.nextButton.disabled = false;
    // multispace canceller
    csvArray = csvArray.filter(function(elem) { return elem.length > 2; });
    // shuffler
    let idx = csvArray.length;
    G.numOfQ = idx;
    let ridx;
    while (idx > 0) {
        ridx = Math.floor(Math.random() * idx);
        idx--;
        [csvArray[idx], csvArray[ridx]] = [csvArray[ridx], csvArray[idx]];
    }
    G.shuffledArray = csvArray;
    G.pointer = 0;
    G.seqNo = 0;
    G.bingo = 0;
    G.missed = 0;
    G.passed = 0;
    G.reviewData = [];
    createPanel();
}

function setSelection(obj) {
    G.filenameRoot = obj.value;
    if (G.filenameRoot == "")  return;
    let request = new XMLHttpRequest();
    request.open('GET', "./text/" + G.filenameRoot + ".csv");
    request.setRequestHeader("Pragma", "no-cache");
    request.setRequestHeader("Cache-Control", "no-cache");
    request.setRequestHeader("If-Modified-Since", "Sat, 01 Jan 2000 00:00:00 GMT");
    request.responseType = 'text';
    request.send();
    request.onload = function() {
        let newData = request.response;
        let csvData = Papa.parse(newData).data;
        mainProcess(csvData);
    }
}

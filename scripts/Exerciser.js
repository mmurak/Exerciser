let Gex = new GlobalManager();

// Clear Contents Area
function clearContents() {
    let hchild = Gex.contentsHead.lastElementChild;
    while(hchild) {
        Gex.contentsHead.removeChild(hchild);
        hchild = Gex.contentsHead.lastElementChild;
    }
    let child = Gex.parentNode.lastElementChild;
    while(child) {
        Gex.parentNode.removeChild(child);
        child = Gex.parentNode.lastElementChild;
    }
}

function insertBRtag(str) {
    return str.replace(/\n/g, "<br/>");
}

function nextQ() {
    if (Gex.buttonPushed == false) {
        Gex.passed++;
        Gex.reviewData.push([document.getElementById("id" + Gex.rightAnswerIdx).value, ""]);
    }
    Gex.pointer++;
    displayScore();
    if (Gex.pointer >= Gex.shuffledArray.length) {
        clearContents();
        Gex.seqNo++;
        let labelelem = document.getElementById("selector");
        let labelstr = labelelem.options[labelelem.selectedIndex].innerHTML;
        let revData = "「" + labelstr + "」の結果：\n\n";
        let tweetData = revData;
        let missed = 0;
        let passed = 0;
        if ((Gex.missed + Gex.passed) == 0) {
            revData += "　全問正解！";
        } else {
            for (const elem of Gex.reviewData) {
                if (elem[1] != "") {
                    revData += "　解： " + elem[0] + "を誤って " + elem[1] + " と選択しました。\n";
                    missed += 1;
                } else {
                    revData += "　解： " + elem[0] + "をパスしました。\n";
                    passed += 1;
                }
            }
        }
        Gex.nextButton.disabled = true;
        alert(revData);
        let denom = Gex.shuffledArray.length;
        if (confirm("結果をツイートしますか？")) {
            let hit = denom - missed - passed;
            let text = encodeURIComponent(tweetData + "    正答率：" + Math.round(hit * 10000 / denom) / 100.0 + "%\n    正解：" + hit + "    誤り：" + missed + "    パス：" + passed + "\n\n#英語発音聞き取りクイズ\n") + "&url=" + encodeURIComponent("https://mmurak.github.io/Exerciser");
            window.open("https://twitter.com/intent/tweet?text=" + text, "_blank");
        }
    } else {
        createPanel();
    }
    Gex.verdict.innerHTML = "";
    Gex.verdict.style = "background-color: #ffffff";
}

function buttonPush(number) {
    Gex.buttonPushed = true;
    let buttons = document.getElementsByClassName("answer-button");
    for (const elem of buttons) {
        elem.disabled = true;
    }
    if (number == Gex.rightAnswerIdx) {
        Gex.audio.src = "./audio/GameResource/chime.mp3";
        Gex.audio.play();
        Gex.bingo++;
        Gex.verdict.innerHTML = "CORRECT!";
        Gex.verdict.style = "background-color: #66ccff";
        document.getElementById("id" + Gex.rightAnswerIdx).style = "color: #1E8449";
    } else {
        Gex.audio.src = "./audio/GameResource/buzzer.mp3";
        Gex.audio.play();
        Gex.missed++;
        Gex.verdict.innerHTML = "WRONG!";
        Gex.verdict.style = "background-color: #ff99cc";
        let answer = document.getElementById("id" + Gex.rightAnswerIdx).value;
        let selected = document.getElementById("id" + number).value;
        Gex.reviewData.push([answer, selected])
        document.getElementById("id" + Gex.rightAnswerIdx).style = "color: red";
    }
    displayScore();
    return;
}

function ppScore() {
    return "スコア： " + Gex.numOfQ + "問中  " + Gex.bingo + "問正解  " + Gex.missed + "問不正解  " + Gex.passed + "問未回答";
}

function displayScore() {
    Gex.statusArea.innerHTML = ppScore();
}

function audioPlay() {
    if (Gex.audioEngine.paused) {
        Gex.audioEngine.play();
    } else {
        Gex.audioEngine.pause();
        Gex.audioEngine.currentTime = 0;
    }
}

function processMMtag(str) {
    let result = "";
    let regex = new RegExp(/\(\((.+?)\)\)/);
    let m = str.match(regex);
    if (m != null) {
        Gex.audioEngine.src = Gex.audioResourceDirectory + Gex.filenameRoot + "/" + m[1];
        result = str.replace(regex, "<input type=\"button\" class=\"control-button\"value=\"  Play/Stop  \" onclick=\"audioPlay();\">");
    } else {
        result = str;
    }
    result = result.replace(/\[\[(.+?)\]\]/, "<img src=\"" + Gex.imageResourceDirectory + Gex.filenameRoot + "/$1" + "\" class=\"image-class\">");
    return result;
}

function createPanel() {
    clearContents();
    Gex.verdict.innerHTML = "";
    displayScore();
    let panelData = Gex.shuffledArray[Gex.pointer];
    let question = document.createElement("div");
    question.className = "text-field";
    Gex.seqNo++;
    question.innerHTML = "Q" + Gex.seqNo + ": " + insertBRtag(processMMtag(panelData[0]));
    Gex.contentsHead.appendChild(question);
    let selections = [];
    for (let i = 1; i < panelData.length; i++) {
        selections.push(panelData[i]);
    }
    // Shuffler start
    let idx = selections.length;
    let ridx;
    Gex.rightAnswerIdx = 0;
    while (idx > 0) {
        ridx = Math.floor(Math.random() * idx);
        idx--;
        if (ridx == Gex.rightAnswerIdx) {
            Gex.rightAnswerIdx = idx;
        }
        [selections[idx], selections[ridx]] = [selections[ridx], selections[idx]];
    }
    // Shuffler end
    for (let i = 0; i < selections.length; i++) {
        Gex.buttonPushed = false;
        let button = document.createElement("input");
        button.type = "button";
        button.id = "id" + i;
        button.className = "answer-button";
        button.value = selections[i];
        button.addEventListener("click", function() { buttonPush(i) });
        Gex.parentNode.appendChild(button);
    }
    audioPlay();
}

function mainProcess(csvArray) {
    Gex.nextButton.disabled = false;
    // multispace canceller
    csvArray = csvArray.filter(function(elem) { return elem.length > 2; });
    // shuffler
    let idx = csvArray.length;
    Gex.numOfQ = idx;
    let ridx;
    while (idx > 0) {
        ridx = Math.floor(Math.random() * idx);
        idx--;
        [csvArray[idx], csvArray[ridx]] = [csvArray[ridx], csvArray[idx]];
    }
    Gex.shuffledArray = csvArray;
    Gex.pointer = 0;
    Gex.seqNo = 0;
    Gex.bingo = 0;
    Gex.missed = 0;
    Gex.passed = 0;
    Gex.reviewData = [];
    createPanel();
}

function setSelection(obj) {
    Gex.filenameRoot = obj.value;
    if (Gex.filenameRoot == "")  return;
    let request = new XMLHttpRequest();
    request.open('GET', "./text/" + Gex.filenameRoot + ".csv");
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

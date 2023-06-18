class GlobalManager {
    constructor() {
        this.shuffledArray = [];
        this.pointer = 0;
        this.nextButton = document.getElementById("nextButton");
        this.csvFile = document.getElementById("csvFile");
        this.statusArea = document.getElementById("statusArea");
        this.parentNode = document.getElementById("contentsArea");
        this.verdict = document.getElementById("verdict");
        this.audioEngine = document.getElementById("audioEngine");
        this.rightAnswerIdx = 0;
        this.seqNo = 0;
        this.bingo = 0;
        this.missed = 0;
        this.passed = 0;
        this.buttonPushed = false;
        this.numOfQ  = 0;
        this.audioResourceDirectory = './audio/';
        this.imageResourceDirectory = './image/';
        this.filenameRoot = "text/";
        this.reviewData = [];
    }
}

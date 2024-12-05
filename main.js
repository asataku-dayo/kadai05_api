// ファイルダウンロード

document.addEventListener("DOMContentLoaded", function () {
  const fileDlButton = document.querySelector("#filedl");
  fileDlButton.onclick = function () {
    const inputFile = document.querySelector('input[type="file"]');
    if (inputFile) {
      inputFile.addEventListener(
        "change",
        function (e) {
          const files = e.target.files;
          console.log("Selected files:", files);
          const reader = new FileReader();

          // ファイルの読み込みが完了した時の処理
          reader.onload = function (event) {
            const imageUrl = event.target.result; // 画像のData URLを取得
            console.log(imageUrl);
          };
        },
        { once: true }
      );
      inputFile.click();
    } else {
      console.error("Input element not found.");
    }
  };
});

// 顔認証
const FILE_URL = "./asserts/sample.jpg";
const MODEL_URL = "./face-api.js-master/weights";

let img, canvas, context;

window.onload = (event) => {
  console.log("onload!");
  loadModels();
};

async function loadModels() {
  console.log("loadModels");
  Promise.all([
    faceapi.loadSsdMobilenetv1Model(MODEL_URL),
    faceapi.loadFaceLandmarkModel(MODEL_URL),
    faceapi.loadFaceRecognitionModel(MODEL_URL),
  ]).then(detectAllFaces);
}

async function detectAllFaces() {
  console.log("detectAllFaces");
  // ここで画像解析を行います。
  // 1, 画像の読み込み
  img = await faceapi.fetchImage(FILE_URL);
  const app = async () => {
    // モデルの読み込み
    await faceapi.nets.tinyFaceDetector.load(MODEL_URL);
    await faceapi.nets.faceExpressionNet.load(MODEL_URL);

    // 顔の表情の分類
    const detectionsWithExpressions = await faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();
    // 結果の出力
    console.log(detectionsWithExpressions);
  };
  app();

  // 2, HTMLからキャンバスを取得し画像を描画
  canvas = document.getElementById("myCanvas");
  canvas.width = img.width;
  canvas.height = img.height;
  context = canvas.getContext("2d");
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(img, 0, 0); // 画像の描画

  // 3, 顔認識の実行と認識結果の取得
  const iSize = { width: img.width, height: img.height };
  const fData = await faceapi.detectAllFaces(img).withFaceLandmarks();

  console.log(iSize);
  console.log(fData);

  // 4, 認識結果のリサイズ
  const rData = await faceapi.resizeResults(fData, iSize);

  rData.forEach((data) => {
    drawResult(data);
  });
}

function drawResult(data) {
  console.log("drawResult!!");
  //console.log(data);

  const box = data.detection.box; // 長方形のデータ
  const mrks = data.landmarks.positions;

  context.fillStyle = "red";
  context.strokeStyle = "red";
  context.lineWidth = 4;
  context.strokeRect(box.x, box.y, box.width, box.height); // 長方形の描画
}

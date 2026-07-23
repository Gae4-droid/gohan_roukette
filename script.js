// ルーレットの選択肢
const foods = [
    "マック",
    "スタバ",
    "ビアードパパ",
    "ケンタ",
    "クレープ",
    "ねこねこパン",
    "ゴンチャ",
    "タリーズ",
    "モスチキン",
    "ケバブ",
    "ミスド",
    "銀だこ",
    "サーティワン",
    "コンビニ"
];

// HTMLから部品を取得する
const canvas = document.getElementById("wheel");
const context = canvas.getContext("2d");

const startButton = document.getElementById("startButton");
const result = document.getElementById("result");

// 円の中心
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// 円の半径
const radius = 240;

// 1区画分の角度
const sectionAngle = (Math.PI * 2) / foods.length;

// 現在の回転角度
let rotation = 0;

// 回転中かどうか
let isSpinning = false;

// 区画に使用する色
const colors = [
    "#f8f8f8",
    "#bfbfbf"
];

/**
 * ルーレットを描く関数
 */
function drawWheel() {

    // 一度キャンバスを空にする
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < foods.length; i++) {

        // 区画の開始角度
        const startAngle =
            rotation - Math.PI / 2 + i * sectionAngle;

        // 区画の終了角度
        const endAngle = startAngle + sectionAngle;

        // 扇形を描く
        context.beginPath();
        context.moveTo(centerX, centerY);

        context.arc(
            centerX,
            centerY,
            radius,
            startAngle,
            endAngle
        );

        context.closePath();

        // 区画の色
        context.fillStyle = colors[i % colors.length];
        context.fill();

        // 区切り線
       context.strokeStyle = "black";
        context.lineWidth = 3;
        context.stroke();

        // 文字を描く
        context.save();

        context.translate(centerX, centerY);

        // 区画の中央方向に回転
        context.rotate(startAngle + sectionAngle / 2);

        context.textAlign = "right";
        context.textBaseline = "middle";

        context.fillStyle = "#222";
        context.font = "bold 19px sans-serif";

        context.fillText(
            foods[i],
            radius - 50,
            0
        );

        context.restore();
    }

    // 中央の円を描く
    context.beginPath();

    context.arc(
        centerX,
        centerY,
        38,
        0,
        Math.PI * 2
    );

    context.fillStyle = "gray";
    context.fill();

    context.strokeStyle = "#333";
    context.lineWidth = 5;
    context.stroke();
}

/**
 * 角度を0から2πの範囲に直す関数
 */
function normalizeAngle(angle) {

    const fullCircle = Math.PI * 2;

    return ((angle % fullCircle) + fullCircle) % fullCircle;
}

/**
 * 矢印の位置にある食べ物を調べる関数
 */
function getSelectedFood() {

    // 円盤の回転と逆方向から区画番号を計算する
    const pointerAngle = normalizeAngle(-rotation);

    const selectedIndex =
        Math.floor(pointerAngle / sectionAngle);

    return foods[selectedIndex];
}

/**
 * 回転を少しずつ遅くする計算
 */
function easeOut(number) {

    return 1 - Math.pow(1 - number, 3);
}

/**
 * スタートボタンを押したとき
 */
startButton.addEventListener("click", function () {

    // 回転中の連打を防ぐ
    if (isSpinning) {
        return;
    }

    isSpinning = true;
    startButton.disabled = true;

    result.textContent = "回転中……";

    // 回転開始時の角度
    const startRotation = rotation;

    // 5～8周した後、ランダムな位置まで回転する
    const numberOfTurns =
        5 + Math.floor(Math.random() * 4);

    const randomAngle =
        Math.random() * Math.PI * 2;

    const targetRotation =
        startRotation +
        numberOfTurns * Math.PI * 2 +
        randomAngle;

    // 回転時間
    const duration = 4000;

    // 開始時刻
    const startTime = performance.now();

    /**
     * アニメーション処理
     */
    function animate(currentTime) {

        const elapsedTime = currentTime - startTime;

        // 0から1までの進み具合
        const progress =
            Math.min(elapsedTime / duration, 1);

        // 最初は速く、最後はゆっくりにする
        const easedProgress = easeOut(progress);

        rotation =
            startRotation +
            (targetRotation - startRotation) *
            easedProgress;

        drawWheel();

        // まだ回転時間が残っている場合
        if (progress < 1) {

            requestAnimationFrame(animate);

              } else {

            rotation = normalizeAngle(targetRotation);

            drawWheel();

            const selectedFood = getSelectedFood();

            result.textContent =
                "🎉 結果は「" + selectedFood + "」！";

            confetti({
                particleCount: 150,
                spread: 100,
                origin: {
                    y: 0.6
                }
            });

            isSpinning = false;
            startButton.disabled = false;
        }
    }

    requestAnimationFrame(animate);
});

// 最初のルーレットを表示する
drawWheel();

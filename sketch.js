let idleSheet; // 儲存角色待機動畫精靈圖
let runSheet; // 儲存角色跑步動畫精靈圖
let backgroundImage; // 儲存背景圖片
let lightningSheet; // 儲存落雷動畫精靈圖
let explosionSheet; // 儲存藍色爆炸動畫精靈圖
let thunderSound; // 儲存打雷音效
const idleFrameCount = 14; // 設定待機動畫的影格數
const runFrameCount = 12; // 設定跑步動畫的影格數
const lightningFrameCount = 14; // 設定落雷動畫的影格數
const explosionFrameCount = 10; // 設定爆炸動畫的影格數
let runFrame = 0; // 記錄目前播放的跑步影格
let idleFrame = 0; // 記錄目前播放的待機影格
let lastFrameTime = 0; // 記錄上次切換影格的時間
let backgroundOffset = 0; // 記錄背景的水平捲動位置
let wasMoving = false; // 記錄上一畫面是否正在移動
let characterCenterX = 0; // 記錄角色在畫面中的水平中心位置
let impactEffectPlaying = false; // 記錄落雷與爆炸特效是否正在播放
let impactEffectStartTime = 0; // 記錄落雷與爆炸特效的開始時間
let impactBackgroundOffset = 0; // 記錄特效開始時背景的位置
let impactEffectScreenX = 0; // 記錄固定在視窗上的特效水平位置
let lastLightningLoopIndex = -1; // 記錄上次播放打雷音效的閃電循環
const frameInterval = 60; // 加快角色動畫並設定每隔 60 毫秒切換影格
const backgroundSpeed = 8; // 再加快背景並設定每幀移動的像素數
const characterSpeed = 6; // 設定角色每幀在畫面移動的像素數
const lightningLoopDuration = 1000; // 設定落雷動畫每次播放一秒
const lightningLoopCount = 3; // 設定落雷動畫連續播放三次
const explosionDuration = 1000; // 設定爆炸動畫播放一秒
const lightningPositionRatio = 0.75; // 將落雷位置設定在距視窗右側四分之一處
function preload() { // 在畫面建立前載入所有圖片
  idleSheet = loadImage("1/stop/stop.png"); // 載入角色待機精靈圖
  runSheet = loadImage("1/run/run.png"); // 載入角色跑步精靈圖
  backgroundImage = loadImage("bg/0.jpg"); // 載入指定的背景圖片
  lightningSheet = loadImage("effect/1/effect1.png"); // 載入 14 格落雷特效精靈圖
  explosionSheet = loadImage("effect/2/effect2.png"); // 載入藍色爆炸特效精靈圖
  thunderSound = loadSound("audio/1.mp3"); // 載入打雷音效
} // 結束圖片載入函式
function setup() { // 初始化畫布與繪圖設定
  createCanvas(windowWidth, windowHeight); // 建立符合視窗大小的畫布
  imageMode(CORNER); // 使用圖片左上角作為繪製座標
  noSmooth(); // 保留像素圖片的銳利邊緣
  characterCenterX = width / 2; // 將角色初始位置設定在畫面中央
  impactEffectScreenX = width * lightningPositionRatio; // 將特效固定在視窗右側四分之一處
} // 結束初始化函式
function draw() { // 每一畫面更新背景與角色動畫
  const movingLeft = keyIsDown(LEFT_ARROW); // 判斷是否按住鍵盤左方向鍵
  const movingRight = keyIsDown(RIGHT_ARROW); // 判斷是否按住鍵盤右方向鍵
  const moving = movingLeft || movingRight; // 判斷目前是否正在播放跑步動畫
  const facingLeft = movingLeft && !movingRight; // 判斷角色是否需要朝向左方
  const backgroundLimit = getBackgroundTileWidth(); // 取得背景可移動的最大距離
  const activeSheet = moving ? runSheet : idleSheet; // 取得目前角色動畫精靈圖
  const activeFrameCount = moving ? runFrameCount : idleFrameCount; // 取得目前角色動畫影格數
  const sourceFrameWidth = activeSheet.width / activeFrameCount; // 計算目前角色影格的來源寬度
  const characterHeight = height * 0.34; // 計算角色顯示高度
  const characterWidth = characterHeight * sourceFrameWidth / activeSheet.height; // 依照目前影格比例計算角色寬度
  const halfCharacterWidth = characterWidth / 2; // 計算角色半寬以避免移出畫面
  if (movingRight && !movingLeft) { // 按住右鍵時先捲動背景再讓角色跑向右端
    if (characterCenterX < width / 2) { // 角色在中央左側時先從目前位置往中央跑
      characterCenterX = min(characterCenterX + characterSpeed, width / 2); // 逐步將角色移回畫面中央
    } else if (backgroundOffset > -backgroundLimit) { // 背景尚未到達最右邊界時
      backgroundOffset = max(backgroundOffset - backgroundSpeed, -backgroundLimit); // 向左捲動背景並停在最右端
      characterCenterX = width / 2; // 捲動背景時讓角色維持在視窗中央
    } else { // 背景抵達最右邊界後
      characterCenterX = min(characterCenterX + characterSpeed, width - halfCharacterWidth); // 讓角色繼續跑向視窗右邊界
    } // 結束右側背景邊界判斷
  } else if (movingLeft && !movingRight) { // 按住左鍵時先捲動背景再讓角色跑向左端
    if (characterCenterX > width / 2) { // 角色在中央右側時先從目前位置往中央跑
      characterCenterX = max(characterCenterX - characterSpeed, width / 2); // 逐步將角色移回畫面中央
    } else if (backgroundOffset < backgroundLimit) { // 背景尚未到達最左邊界時
      backgroundOffset = min(backgroundOffset + backgroundSpeed, backgroundLimit); // 向右捲動背景並停在最左端
      characterCenterX = width / 2; // 捲動背景時讓角色維持在視窗中央
    } else { // 背景抵達最左邊界後
      characterCenterX = max(characterCenterX - characterSpeed, halfCharacterWidth); // 讓角色繼續跑向視窗左邊界
    } // 結束左側背景邊界判斷
  } // 結束背景與角色移動判斷
  const atRightBackgroundEnd = backgroundOffset <= -backgroundLimit; // 判斷背景是否已停止在最右端
  if (atRightBackgroundEnd && !impactEffectPlaying) { // 背景到達最右端時啟動循環特效
    impactEffectPlaying = true; // 開始播放落雷與爆炸特效
    impactEffectStartTime = millis(); // 記錄特效播放起始時間
    impactBackgroundOffset = backgroundOffset; // 記錄落雷位置所對應的背景起點
    impactEffectScreenX = width * lightningPositionRatio; // 設定固定於視窗的特效位置
    lastLightningLoopIndex = -1; // 重設閃電循環索引以便播放音效
  } // 結束背景最右端特效啟動判斷
  const backgroundPointX = impactEffectScreenX + backgroundOffset - impactBackgroundOffset; // 只追蹤背景點位置，不改變特效畫面座標
  if (impactEffectPlaying && backgroundPointX > impactEffectScreenX) { // 背景點移出固定閃電位置後停止特效
    impactEffectPlaying = false; // 停止落雷與爆炸循環
  } // 結束背景點離開畫面的判斷
  if (moving && !wasMoving) { // 每次開始移動都從跑步動畫第一張重新播放
    runFrame = 0; // 將跑步影格重設為第 1 張
    lastFrameTime = millis(); // 從開始移動的時間重新計算影格間隔
  } // 結束跑步動畫起始影格設定
  wasMoving = moving; // 記錄本畫面的移動狀態供下一畫面判斷
  drawScrollingBackground(); // 繪製左右連接且可移動的背景
  if (millis() - lastFrameTime >= frameInterval) { // 到達影格間隔時才切換動畫影格
    lastFrameTime = millis(); // 更新影格切換時間
    if (moving) { // 移動時播放跑步動畫
      runFrame += 1; // 前進至下一張跑步影格
      if (runFrame >= runFrameCount) { // 播完第 12 張後重新從第 5 張循環
        runFrame = 4; // 將下一張影格設為第 5 張
      } // 結束跑步影格循環判斷
    } else { // 未移動時播放待機動畫
      idleFrame = (idleFrame + 1) % idleFrameCount; // 循環播放全部待機影格
    } // 結束動畫類型判斷
  } // 結束影格時間判斷
  if (moving) { // 依照目前移動方向繪製跑步角色
    drawCharacter(runSheet, runFrame, runFrameCount, facingLeft, characterCenterX); // 在目前位置繪製指定的跑步影格
  } else { // 停止移動時繪製待機角色
    drawCharacter(idleSheet, idleFrame, idleFrameCount, false, characterCenterX); // 在目前位置繪製指定的待機影格
  } // 結束角色動畫繪製判斷
  drawImpactEffect(); // 在角色前方繪製落雷與落地爆炸特效
} // 結束畫面更新函式
function getBackgroundTileWidth() { // 計算背景單張圖片縮放後的寬度
  const scaleFactor = max(width / backgroundImage.width, height / backgroundImage.height); // 計算維持比例並填滿畫布的縮放值
  return backgroundImage.width * scaleFactor; // 回傳背景圖片的顯示寬度
} // 結束背景寬度計算函式
function drawScrollingBackground() { // 繪製左右複製且有移動邊界的背景
  const scaleFactor = max(width / backgroundImage.width, height / backgroundImage.height); // 計算維持比例並填滿畫布的縮放值
  const tileWidth = backgroundImage.width * scaleFactor; // 計算每張背景的顯示寬度
  const tileHeight = backgroundImage.height * scaleFactor; // 計算每張背景的顯示高度
  const firstTileX = backgroundOffset - tileWidth; // 計算背景最左側圖片的位置
  const tileY = (height - tileHeight) / 2; // 將背景垂直置中
  background(0); // 填滿背景圖片以外的空白區域
  for (let tile = 0; tile < 3; tile += 1) { // 繪製中央與左右各一張背景
    image(backgroundImage, firstTileX + tile * tileWidth, tileY, tileWidth, tileHeight); // 繪製一張等比例背景圖片
  } // 結束背景圖片繪製迴圈
} // 結束背景繪製函式
function drawImpactEffect() { // 播放落雷三次並接續播放藍色爆炸
  if (!impactEffectPlaying) { // 特效尚未啟動時不執行繪製
    return; // 結束目前的特效繪製函式
  } // 結束特效啟動狀態判斷
  const elapsedTime = millis() - impactEffectStartTime; // 計算特效已播放的時間
  const lightningTotalDuration = lightningLoopDuration * lightningLoopCount; // 計算三次落雷動畫的總長度
  const effectCycleDuration = lightningTotalDuration + explosionDuration; // 計算一輪落雷與爆炸特效的總長度
  const cycleTime = elapsedTime % effectCycleDuration; // 讓落雷與爆炸特效不斷循環播放
  if (cycleTime < lightningTotalDuration) { // 落雷階段連續播放三次
    const lightningLoopIndex = floor(cycleTime / lightningLoopDuration); // 計算目前播放第幾次閃電
    if (lightningLoopIndex !== lastLightningLoopIndex) { // 每次閃電開始時只播放一次音效
      thunderSound.play(); // 播放打雷音效
      lastLightningLoopIndex = lightningLoopIndex; // 記錄已播放音效的閃電循環
    } // 結束音效播放判斷
    const frameInLoop = floor((cycleTime % lightningLoopDuration) / lightningLoopDuration * lightningFrameCount); // 計算本次落雷循環的影格
    const sourceFrameWidth = lightningSheet.width / lightningFrameCount; // 計算落雷精靈圖每格的寬度
    const lightningHeight = height; // 將落雷特效從視窗頂端延伸至地面
    const lightningWidth = lightningHeight * sourceFrameWidth / lightningSheet.height; // 依照精靈圖比例計算落雷寬度
    image(lightningSheet, impactEffectScreenX - lightningWidth / 2, 0, lightningWidth, lightningHeight, frameInLoop * sourceFrameWidth, 0, sourceFrameWidth, lightningSheet.height); // 在固定位置繪製從天空落下的電光影格
  } else { // 落雷結束後播放一次爆炸並開始下一輪循環
    const explosionTime = cycleTime - lightningTotalDuration; // 計算爆炸動畫目前已播放的時間
    const explosionFrame = min(floor(explosionTime / explosionDuration * explosionFrameCount), explosionFrameCount - 1); // 計算爆炸精靈圖影格
    const sourceFrameWidth = explosionSheet.width / explosionFrameCount; // 計算爆炸精靈圖每格的寬度
    const explosionHeight = height * 0.3; // 設定爆炸特效高度為畫布高度的 30%
    const explosionWidth = explosionHeight * sourceFrameWidth / explosionSheet.height; // 依照精靈圖比例計算爆炸寬度
    image(explosionSheet, impactEffectScreenX - explosionWidth / 2, height - explosionHeight, explosionWidth, explosionHeight, explosionFrame * sourceFrameWidth, 0, sourceFrameWidth, explosionSheet.height); // 在固定位置的地面繪製藍色爆炸影格
  } // 結束落雷與爆炸動畫階段判斷
} // 結束落雷與爆炸特效函式
function drawCharacter(sheet, frameIndex, frameCount, facingLeft, centerX) { // 從精靈圖裁切並繪製單一角色影格
  const sourceFrameWidth = sheet.width / frameCount; // 計算精靈圖中每格影格的寬度
  const sourceFrameHeight = sheet.height; // 取得精靈圖影格的來源高度
  const characterHeight = height * 0.34; // 將角色等比例縮小一半並設定為畫布高度的 34%
  const characterWidth = characterHeight * sourceFrameWidth / sourceFrameHeight; // 依照影格比例計算角色寬度
  const characterX = centerX - characterWidth / 2; // 依照角色中心位置計算圖片左側座標
  const characterY = height - characterHeight; // 將角色底部對齊畫布底部
  push(); // 儲存目前的繪圖狀態
  if (facingLeft) { // 左方向時翻轉角色而不移動其位置
    translate(width, 0); // 將座標原點移至畫布右側
    scale(-1, 1); // 水平翻轉畫面以讓角色朝左
    image(sheet, width - characterX - characterWidth, characterY, characterWidth, characterHeight, frameIndex * sourceFrameWidth, 0, sourceFrameWidth, sourceFrameHeight); // 繪製水平翻轉後的角色影格
  } else { // 右方向或待機時維持圖片原始方向
    image(sheet, characterX, characterY, characterWidth, characterHeight, frameIndex * sourceFrameWidth, 0, sourceFrameWidth, sourceFrameHeight); // 繪製角色精靈圖中的指定影格
  } // 結束角色方向判斷
  pop(); // 還原繪圖狀態避免影響其他畫面
} // 結束角色影格繪製函式
function keyPressed() { // 阻止方向鍵觸發瀏覽器捲動
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) { // 僅處理左右方向鍵
    userStartAudio(); // 在使用者按鍵操作時啟用瀏覽器音訊
    return false; // 停止瀏覽器對方向鍵的預設操作
  } // 結束方向鍵判斷
} // 結束按鍵事件函式
function windowResized() { // 視窗尺寸改變時重新調整畫布
  resizeCanvas(windowWidth, windowHeight); // 讓畫布持續符合目前視窗大小
  impactEffectScreenX = width * lightningPositionRatio; // 視窗尺寸改變時維持特效在右側四分之一處
  const idleFrameWidth = idleSheet.width / idleFrameCount; // 計算待機角色影格的來源寬度
  const characterWidth = height * 0.34 * idleFrameWidth / idleSheet.height; // 依照視窗高度計算待機角色寬度
  characterCenterX = constrain(characterCenterX, characterWidth / 2, width - characterWidth / 2); // 調整角色位置避免視窗縮小後被裁切
} // 結束視窗調整函式

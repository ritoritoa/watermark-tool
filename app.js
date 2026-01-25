/**
 * ウォーターマークツール - メインJavaScript
 * Canvas APIを使用して画像にタイル状のウォーターマークを追加
 */

// DOM要素の参照
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewArea = document.getElementById('previewArea');
const controlPanel = document.getElementById('controlPanel');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

// 設定要素
const watermarkText = document.getElementById('watermarkText');
const opacitySlider = document.getElementById('opacity');
const fontSizeSlider = document.getElementById('fontSize');
const angleSlider = document.getElementById('angle');
const spacingSlider = document.getElementById('spacing');
const colorBtns = document.querySelectorAll('.color-btn');
const styleBtns = document.querySelectorAll('.style-btn');
const fontBtns = document.querySelectorAll('.font-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const blendBtns = document.querySelectorAll('.blend-btn');
const halftoneOptions = document.getElementById('halftoneOptions');
const dotSizeSlider = document.getElementById('dotSize');
const textWatermarkSection = document.getElementById('textWatermarkSection');
const imageWatermarkSection = document.getElementById('imageWatermarkSection');
const watermarkImageInput = document.getElementById('watermarkImageInput');
const watermarkImagePreview = document.getElementById('watermarkImagePreview');
const wmScaleSlider = document.getElementById('wmScale');
const wmScaleValue = document.getElementById('wmScaleValue');
const noiseProtection = document.getElementById('noiseProtection');
const vignetteSlider = document.getElementById('vignette');
const textureSlider = document.getElementById('texture');
const integrationSlider = document.getElementById('integration');
const jitterSlider = document.getElementById('jitter');

// 値表示要素
const opacityValue = document.getElementById('opacityValue');
const fontSizeValue = document.getElementById('fontSizeValue');
const angleValue = document.getElementById('angleValue');
const spacingValue = document.getElementById('spacingValue');
const jitterValue = document.getElementById('jitterValue');

const dotSizeValue = document.getElementById('dotSizeValue');
const vignetteValue = document.getElementById('vignetteValue');
const textureValue = document.getElementById('textureValue');
const integrationValue = document.getElementById('integrationValue');

let originalImage = null;
let currentColorMode = 'white';
let currentStyle = 'normal';
let currentFont = 'normal';
let currentMode = 'text';
let currentBlendMode = 'source-over';
const vignetteSizeSlider = document.getElementById('vignetteSize');
const vignetteSizeValue = document.getElementById('vignetteSizeValue');
let currentVignetteColor = 'black';
let watermarkImage = null;

// =====================================================
// 初期化・イベントリスナー設定
// =====================================================

document.addEventListener('DOMContentLoaded', init);

function init() {
    setupDropZone();
    setupControls();
    setupColorButtons();
    setupStyleButtons();
    setupFontButtons();
    setupModeButtons();
    setupBlendButtons();
    setupWatermarkImageUpload();
}

// =====================================================
// ドラッグ＆ドロップ処理
// =====================================================

function setupDropZone() {
    // ドラッグイベント
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // ドラッグ中のスタイル変更
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-over');
        });
    });

    // ドロップ時の処理
    dropZone.addEventListener('drop', handleDrop);

    // ファイル選択
    fileInput.addEventListener('change', handleFileSelect);

    // リセットボタン
    resetBtn.addEventListener('click', resetToDropZone);
}

function handleDrop(e) {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        loadImage(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        loadImage(files[0]);
    }
}

// =====================================================
// 画像読み込み
// =====================================================

function loadImage(file) {
    // 画像ファイルかチェック
    if (!file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            showPreview();
            renderWatermark();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function showPreview() {
    dropZone.style.display = 'none';
    previewArea.style.display = 'block';
    controlPanel.style.display = 'block';
}

function resetToDropZone() {
    originalImage = null;
    dropZone.style.display = 'block';
    previewArea.style.display = 'none';
    controlPanel.style.display = 'none';
    fileInput.value = '';
}

// =====================================================
// コントロール設定
// =====================================================

function setupControls() {
    // テキスト入力
    watermarkText.addEventListener('input', renderWatermark);

    // スライダー
    opacitySlider.addEventListener('input', () => {
        opacityValue.textContent = opacitySlider.value;
        renderWatermark();
    });

    fontSizeSlider.addEventListener('input', () => {
        fontSizeValue.textContent = fontSizeSlider.value;
        renderWatermark();
    });

    angleSlider.addEventListener('input', () => {
        angleValue.textContent = angleSlider.value;
        renderWatermark();
    });

    spacingSlider.addEventListener('input', () => {
        spacingValue.textContent = spacingSlider.value;
        renderWatermark();
    });

    // ダウンロードボタン
    downloadBtn.addEventListener('click', downloadImage);
}

function setupColorButtons() {
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentColorMode = btn.dataset.color;
            renderWatermark();
        });
    });
}

function setupStyleButtons() {
    styleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            styleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStyle = btn.dataset.style;

            // ハーフトーン選択時にオプションを表示
            if (currentStyle === 'halftone') {
                halftoneOptions.style.display = 'block';
            } else {
                halftoneOptions.style.display = 'none';
            }

            renderWatermark();
        });
    });

    // ドットサイズスライダー
    dotSizeSlider.addEventListener('input', () => {
        dotSizeValue.textContent = dotSizeSlider.value;
        renderWatermark();
    });
}

function setupFontButtons() {
    fontBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            fontBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFont = btn.dataset.font;
            renderWatermark();
        });
    });
}

function setupModeButtons() {
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;

            // セクションの表示切り替え
            if (currentMode === 'image') {
                textWatermarkSection.style.display = 'none';
                imageWatermarkSection.style.display = 'block';
            } else {
                textWatermarkSection.style.display = 'block';
                imageWatermarkSection.style.display = 'none';
            }

            renderWatermark();
        });
    });

    // スケールスライダー
    wmScaleSlider.addEventListener('input', () => {
        wmScaleValue.textContent = wmScaleSlider.value;
        renderWatermark();
    });

    // 仕上げエフェクトスライダー
    vignetteSlider.addEventListener('input', () => {
        vignetteValue.textContent = vignetteSlider.value;
        renderWatermark();
    });

    textureSlider.addEventListener('input', () => {
        textureValue.textContent = textureSlider.value;
        renderWatermark();
    });

    integrationSlider.addEventListener('input', () => {
        integrationValue.textContent = integrationSlider.value;
        renderWatermark();
    });

    // ゆらぎスライダー
    if (jitterSlider) {
        jitterSlider.addEventListener('input', () => {
            if (jitterValue) jitterValue.textContent = jitterSlider.value;
            renderWatermark();
        });
    }

    // ノイズ保護チェックボックス
    noiseProtection.addEventListener('change', () => {
        // チェック時のみスライダーを表示
        const control = document.getElementById('jammerStrengthControl');
        control.style.display = noiseProtection.checked ? 'flex' : 'none';
        renderWatermark();
    });

    const jammerStrengthSlider = document.getElementById('jammerStrength');
    const jammerStrengthValue = document.getElementById('jammerStrengthValue');

    jammerStrengthSlider.addEventListener('input', () => {
        jammerStrengthValue.textContent = jammerStrengthSlider.value;
        renderWatermark();
    });
}

// ... existing code ...

// AIジャマー機能（Texture Jammer Mode）
// じぴちゃん推奨: source-atopを使って「文字の中だけ」に高速にノイズを注入する
// 以前のpixel操作より圧倒的に軽量でスマホに優しい
function addNoiseProtectionToLayer(targetCtx, width, height) {
    const strengthSlider = document.getElementById('jammerStrength');
    const sliderVal = parseInt(strengthSlider.value);

    // ノイズを描画する準備
    targetCtx.save();

    // 【重要】既に描画されている部分（文字）の上にだけ描くモード
    // これにより背景（透明部分）へのハミ出しが原理的にゼロになる
    targetCtx.globalCompositeOperation = 'source-atop';

    // ノイズの量: 画面サイズとスライダー値で決定
    // sliderVal=100 のとき、全ピクセルの約20%を埋めるくらいの密度
    // (あまり多すぎると処理落ちするので調整)
    const density = (width * height) * (sliderVal / 100) * 0.15;

    // ループ回数制限（安全装置: 最大でも20万回程度に抑える）
    const particleCount = Math.min(density, 200000);

    for (let i = 0; i < particleCount; i++) {
        // ランダムな位置
        const x = Math.random() * width;
        const y = Math.random() * height;

        // ランダムなグレー (100〜200あたりが文字視認性を邪魔しすぎず良い)
        // 50(暗い) 〜 200(明るい) の範囲で散らす
        const g = Math.floor(50 + Math.random() * 150);

        targetCtx.fillStyle = `rgba(${g}, ${g}, ${g}, 0.8)`;

        // 1px 〜 2px のドットを描画（2pxの方がザラつき感が出る）
        const size = Math.random() > 0.5 ? 2 : 1;
        targetCtx.fillRect(x, y, size, size);
    }

    targetCtx.restore();
}

function setupBlendButtons() {
    blendBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            blendBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentBlendMode = btn.dataset.blend;
            renderWatermark();
        });
    });
}

function setupWatermarkImageUpload() {
    watermarkImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    watermarkImage = img;
                    // プレビュー表示
                    watermarkImagePreview.innerHTML = `
                        <img src="${event.target.result}" alt="ウォーターマーク画像">
                        <span class="preview-label">✓ 画像を読み込みました</span>
                    `;
                    renderWatermark();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

// フォント文字列を取得
function getFontString(fontSize) {
    switch (currentFont) {
        case 'italic':
            return `italic ${fontSize}px 'Noto Sans JP', sans-serif`;
        case 'cute':
            return `${fontSize}px 'Zen Maru Gothic', 'Noto Sans JP', sans-serif`;
        case 'great-vibes':
            return `${fontSize}px 'Great Vibes', cursive`;
        case 'dancing':
            return `${fontSize}px 'Dancing Script', cursive`;
        case 'parisienne':
            return `${fontSize}px 'Parisienne', cursive`;
        default:
            return `${fontSize}px 'Noto Sans JP', sans-serif`;
    }
}
// =====================================================
// ウォーターマーク描画（タイル状配置）
// =====================================================

function renderWatermark() {
    if (!originalImage) return;

    // 1. ベースキャンバスの準備（元画像を描画）
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);

    // 2. ウォーターマーク専用のレイヤー（オフスクリーンキャンバス）を作成
    const wmCanvas = document.createElement('canvas');
    wmCanvas.width = canvas.width;
    wmCanvas.height = canvas.height;
    const wmCtx = wmCanvas.getContext('2d');

    // 共通設定を取得
    const angle = parseInt(angleSlider.value);
    const spacing = parseInt(spacingSlider.value);
    // スライダーの存在チェックを追加（安全対策）
    const scale = typeof wmScaleSlider !== 'undefined' && wmScaleSlider ? (parseInt(wmScaleSlider.value) / 100) : 1;
    const jitterStrength = typeof jitterSlider !== 'undefined' && jitterSlider ? parseInt(jitterSlider.value) : 0;

    // モードに応じてウォーターマークレイヤーに描画
    if (currentMode === 'image' && watermarkImage) {
        wmCtx.globalAlpha = 1.0;
        renderImageWatermarkToLayer(wmCtx, spacing, scale, angle, jitterStrength);
    } else {
        // === 👻 Phantom Layer (亡霊レイヤー) 描画 ===
        // ユーザーの透かしの下に、AI除去耐性の高い「証拠用透かし」をこっそり描く
        // 特徴: デカい、薄い、角度ズレ、中抜き、ジッター強め

        wmCtx.save();
        wmCtx.globalAlpha = 0.05; // 5% (少し強化)

        // 亡霊の設定（最強の耐久設定を固定で適用）
        const phantomConfig = {
            style: 'outline',       // 輪郭だけ残す（JPEG耐性最強）
            colorMode: 'white',     // 白固定（または自動）
            color: 'rgba(255, 255, 255, 1)',
            fontSize: 180           // サイズ固定（ユーザー設定無視でデカく！）
        };

        // ユーザー設定完全無視！固定の最強設定で描く
        // 間隔: 1000px (広め固定)
        // サイズ: 180px (configで指定済み)
        // 角度: ユーザー + 5度 (ズラす)
        // ジッター: 70 (じぴちゃん推奨のバラけ具合)
        renderTextWatermarkToLayer(
            wmCtx,
            1000,               // 固定間隔
            1,                  // scaleはfontSize固定なので1でOK
            angle + 5,          // 角度ズレ
            70,                 // ジッター 70 (強め)
            phantomConfig
        );
        wmCtx.restore();

        // === 👤 User Layer (メイン透かし) 描画 ===
        wmCtx.globalAlpha = 1.0; // ユーザー設定の透明度は合成時にかかるので、ここは100%で描く
        renderTextWatermarkToLayer(wmCtx, spacing, scale, angle, jitterStrength);
    }

    // 3. ウォーターマークレイヤー(=wmCanvas)に対してのみ、AIジャマー(RGBグリッチ)を適用
    // これにより、元画像は綺麗なまま、文字だけを破壊できる
    if (noiseProtection.checked) {
        // 関数名変更: addNoiseProtection -> addNoiseProtectionToLayer
        addNoiseProtectionToLayer(wmCtx, wmCanvas.width, wmCanvas.height);
    }

    // 4. ウォーターマークレイヤーを元画像に合成
    const opacity = parseInt(opacitySlider.value) / 100;
    ctx.globalCompositeOperation = currentBlendMode;
    ctx.globalAlpha = opacity;
    ctx.drawImage(wmCanvas, 0, 0);

    // 合成設定をリセット
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // 5. 仕上げエフェクト（全体になじませるため、最後にかける）
    const vignetteStrength = parseInt(vignetteSlider.value);
    const textureStrength = parseInt(textureSlider.value);
    const integrationStrength = parseInt(integrationSlider.value);

    // ビネット（四隅）
    if (vignetteStrength > 0) {
        renderVignette(vignetteStrength);
    }

    // 文字のなじみ処理
    if (textureStrength > 0) {
        const alphaScale = integrationStrength > 0 ? (0.5 + integrationStrength / 200) : 1.0;
        renderTexture(textureStrength, alphaScale);
    }
}


// ... existing code ...
integrationSlider.addEventListener('input', () => {
    integrationValue.textContent = integrationSlider.value;
    renderWatermark();
});

// ビネット設定
const vignetteBtns = document.querySelectorAll('[data-vignette-color]');
vignetteBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        vignetteBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentVignetteColor = btn.dataset.vignetteColor;
        renderWatermark();
    });
});

vignetteSizeSlider.addEventListener('input', () => {
    vignetteSizeValue.textContent = vignetteSizeSlider.value;
    renderWatermark();
});

// ノイズ保護チェックボックス
// ... existing code ...

// ビネット（周辺減光/増光）を描画
function renderVignette(strength) {
    // スライダーがない場合（古いキャッシュ）はデフォルト50扱い
    const size = vignetteSizeSlider ? parseInt(vignetteSizeSlider.value) : 50;

    // 広がり(Area)が大きいほど、開始位置(innerRadius)を小さくする＝中心まで攻める
    // size 10 -> inner 60% (浅い)
    // size 100 -> inner 0% (中心まで塗りつぶし)
    const innerFactor = 0.6 * (1 - (size / 100));

    const maxRadius = Math.max(canvas.width, canvas.height) * 0.8;
    const innerRadius = maxRadius * innerFactor;

    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, innerRadius,
        canvas.width / 2, canvas.height / 2, maxRadius
    );

    // 強さに応じて透明度を調整 (最大1.0まで)
    const opacity = Math.min(1, (strength / 100) * 0.9);

    // 色の定義
    const colorRGB = currentVignetteColor === 'white' ? '255, 255, 255' : '0, 0, 0';

    gradient.addColorStop(0, `rgba(${colorRGB}, 0)`);
    gradient.addColorStop(1, `rgba(${colorRGB}, ${opacity})`);

    ctx.fillStyle = gradient;

    // 合成モードの切り替え
    // 白の場合は 'screen' や 'lighten' が良いが、単純な被せでも効果的
    // 黒の場合は通常通り
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
// ... existing code ...

// 質感ノイズ（テクスチャ）を描画
function renderTexture(strength, alphaScale = 1.0) {
    // ノイズ用の小さなキャンバスを作成（パフォーマンスのため）
    const noiseCanvas = document.createElement('canvas');
    const noiseSize = 256;
    noiseCanvas.width = noiseSize;
    noiseCanvas.height = noiseSize;
    const noiseCtx = noiseCanvas.getContext('2d');

    const imageData = noiseCtx.createImageData(noiseSize, noiseSize);
    const data = imageData.data;

    // 強さに応じたノイズ生成
    // モノクロノイズ
    for (let i = 0; i < data.length; i += 4) {
        const val = Math.random() * 255;
        data[i] = val;     // R
        data[i + 1] = val; // G
        data[i + 2] = val; // B
        data[i + 3] = 100; // Alpha (ベースの透明度をかなり上げる)
    }

    noiseCtx.putImageData(imageData, 0, 0);

    // パターンとして描画
    const pattern = ctx.createPattern(noiseCanvas, 'repeat');
    ctx.fillStyle = pattern;

    // オーバーレイで重ねる
    ctx.globalCompositeOperation = 'overlay';

    // 強度調整
    ctx.globalAlpha = (strength / 100) * alphaScale; // 最大1.0まで許可

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // リセット
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
}

// 画像ウォーターマークを描画（レイヤー版）
function renderImageWatermarkToLayer(targetCtx, spacing, scale, angle, jitterStrength) {
    const imgWidth = watermarkImage.width * scale;
    const imgHeight = watermarkImage.height * scale;
    const tileWidth = imgWidth + spacing;
    const tileHeight = imgHeight + spacing;

    // タイル配置のための計算
    const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
    const startX = -diagonal;
    const startY = -diagonal;
    const endX = diagonal * 2;
    const endY = diagonal * 2;

    // 基本の回転角度（ラジアン）
    const baseRad = (angle * Math.PI) / 180;

    // 全体回転のためのコンテキスト保存
    targetCtx.save();
    targetCtx.translate(canvas.width / 2, canvas.height / 2);
    targetCtx.rotate(baseRad);
    targetCtx.translate(-canvas.width / 2, -canvas.height / 2);

    // 最大ジッター量
    const maxPosJitter = spacing * 0.15 * (jitterStrength / 50);
    const maxAngleJitterRad = (15 * (Math.PI / 180)) * (jitterStrength / 100);

    // タイル状に画像を配置
    for (let y = startY; y < endY; y += tileHeight) {
        for (let x = startX; x < endX; x += tileWidth) {
            // ジッター計算
            let jX = 0, jY = 0, jRot = 0;
            if (jitterStrength > 0) {
                jX = (Math.random() - 0.5) * maxPosJitter;
                jY = (Math.random() - 0.5) * maxPosJitter;
                jRot = (Math.random() - 0.5) * maxAngleJitterRad;
            }

            // 個別の座標系で描画
            targetCtx.save();
            targetCtx.translate(x + jX, y + jY);
            if (jRot !== 0) {
                // 画像の中心を軸に回転させるためさらにtranslate
                targetCtx.translate(imgWidth / 2, imgHeight / 2);
                targetCtx.rotate(jRot);
                targetCtx.translate(-imgWidth / 2, -imgHeight / 2);
            }

            targetCtx.drawImage(watermarkImage, 0, 0, imgWidth, imgHeight);
            targetCtx.restore();
        }
    }

    targetCtx.restore(); // 全体回転の復帰
}

// テキストウォーターマークを描画（レイヤー版）
// overrideConfig: 亡霊レイヤー描画用の強制設定（スタイルやサイズを上書き）
function renderTextWatermarkToLayer(targetCtx, spacing, scale, angle, jitterStrength, overrideConfig = null) {
    const text = watermarkText.value || '© Sample';

    // 設定値の取得（オーバーライドがあればそれを使う）
    const baseFontSize = parseInt(fontSizeSlider.value);
    // 亡霊レイヤーの場合は固定サイズ指定が可能
    let finalFontSize;
    if (overrideConfig && overrideConfig.fontSize) {
        finalFontSize = overrideConfig.fontSize;
    } else {
        finalFontSize = baseFontSize * scale;
    }

    // フォント設定
    targetCtx.font = getFontString(finalFontSize);
    targetCtx.textAlign = 'center';
    targetCtx.textBaseline = 'middle';

    // スタイル決定
    const styleToUse = overrideConfig ? overrideConfig.style : currentStyle;
    const colorModeToUse = overrideConfig ? overrideConfig.colorMode : currentColorMode;

    // 中抜き（アウトライン）の設定
    if (styleToUse === 'outline') {
        const lineWidth = Math.max(1, finalFontSize * 0.05);
        targetCtx.lineWidth = lineWidth;
    }

    // テキストサイズを測定
    const textMetrics = targetCtx.measureText(text);
    const textWidth = textMetrics.width + spacing;
    const textHeight = finalFontSize + spacing;

    // タイル配置のための計算
    const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
    const startX = -diagonal;
    const startY = -diagonal;
    const endX = diagonal * 2;
    const endY = diagonal * 2;

    // グラデーションオブジェクトを作成
    let gradientStyle = null;
    if (colorModeToUse === 'gradient') {
        const grad = targetCtx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#ff0000');
        grad.addColorStop(0.15, '#ff7f00');
        grad.addColorStop(0.3, '#ffff00');
        grad.addColorStop(0.45, '#00ff00');
        grad.addColorStop(0.6, '#0000ff');
        grad.addColorStop(0.75, '#4b0082');
        grad.addColorStop(1, '#9400d3');
        gradientStyle = grad;
    }

    // 基本の回転角度（ラジアン）
    const baseRad = (angle * Math.PI) / 180;

    // 全体回転のためのコンテキスト保存
    targetCtx.save();
    targetCtx.translate(canvas.width / 2, canvas.height / 2);
    targetCtx.rotate(baseRad);
    targetCtx.translate(-canvas.width / 2, -canvas.height / 2);

    // 最大ジッター量（ピクセル） - じぴちゃん推奨値に調整
    // 位置: ±6〜10px程度 (間隔の5%程度に抑える)
    const maxPosJitter = spacing * 0.05 * (jitterStrength / 50);
    // 角度: ±2度程度 (見た目を損なわない範囲)
    const maxAngleJitterRad = (2 * (Math.PI / 180)) * (jitterStrength / 100);

    // タイル状にウォーターマークを配置
    // ※亡霊レイヤーではハーフトーンなどは使わず通常描画（軽量化と確実性のため）
    for (let y = startY; y < endY; y += textHeight) {
        for (let x = startX; x < endX; x += textWidth) {
            // ジッター計算
            let jX = 0, jY = 0, jRot = 0;
            if (jitterStrength > 0) {
                jX = (Math.random() - 0.5) * maxPosJitter;
                jY = (Math.random() - 0.5) * maxPosJitter;
                jRot = (Math.random() - 0.5) * maxAngleJitterRad;
            }

            // 個別の座標系で描画
            targetCtx.save();
            targetCtx.translate(x + jX, y + jY);
            if (jRot !== 0) targetCtx.rotate(jRot);

            // 色の決定 
            let color;
            if (colorModeToUse === 'gradient') {
                color = gradientStyle;
            } else if (overrideConfig && overrideConfig.color) {
                color = overrideConfig.color; // オーバーライド指定色（白/黒など）
            } else {
                color = getTextColor(x, y);
            }

            if (styleToUse === 'outline') {
                // 中抜き描画
                targetCtx.strokeStyle = color;
                targetCtx.strokeText(text, 0, 0);
            } else {
                // 通常描画
                targetCtx.fillStyle = color;
                targetCtx.fillText(text, 0, 0);
            }

            targetCtx.restore();
        }
    }

    targetCtx.restore();
}

// ハーフトーン（ドットパターン）でウォーターマークを描画
function renderHalftoneWatermark(text, startX, startY, endX, endY, textWidth, textHeight, fontSize) {
    const dotSize = parseInt(dotSizeSlider.value);
    const dotSpacing = dotSize * 2.5; // ドット間隔

    // テキストを一時キャンバスに描画してハーフトーン化
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // テキストサイズを測定
    const metrics = ctx.measureText(text);
    const textW = Math.ceil(metrics.width) + 10;
    const textH = fontSize + 10;

    tempCanvas.width = textW;
    tempCanvas.height = textH;

    // テキストを描画
    tempCtx.font = getFontString(fontSize);
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillStyle = 'black';
    tempCtx.fillText(text, textW / 2, textH / 2);

    // ピクセルデータを取得
    const imageData = tempCtx.getImageData(0, 0, textW, textH);
    const data = imageData.data;

    // グラデーション準備
    let gradientStyle = null;
    if (currentColorMode === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#ff0000');
        grad.addColorStop(0.15, '#ff7f00');
        grad.addColorStop(0.3, '#ffff00');
        grad.addColorStop(0.45, '#00ff00');
        grad.addColorStop(0.6, '#0000ff');
        grad.addColorStop(0.75, '#4b0082');
        grad.addColorStop(1, '#9400d3');
        gradientStyle = grad;
    }

    // タイル状に配置
    for (let tileY = startY; tileY < endY; tileY += textHeight) {
        for (let tileX = startX; tileX < endX; tileX += textWidth) {
            // ドットパターンで描画
            for (let dy = 0; dy < textH; dy += dotSpacing) {
                for (let dx = 0; dx < textW; dx += dotSpacing) {
                    // ピクセルのアルファ値をチェック
                    const pixelX = Math.floor(dx);
                    const pixelY = Math.floor(dy);
                    const idx = (pixelY * textW + pixelX) * 4;
                    const alpha = data[idx + 3];

                    if (alpha > 50) {
                        // ドットを描画
                        let color;
                        if (currentColorMode === 'gradient') {
                            color = gradientStyle;
                        } else {
                            color = getTextColor(tileX + dx, tileY + dy);
                        }

                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(
                            tileX + dx - textW / 2,
                            tileY + dy - textH / 2,
                            dotSize * (alpha / 255),
                            0,
                            Math.PI * 2
                        );
                        ctx.fill();
                    }
                }
            }
        }
    }
}

function getTextColor(x, y) {
    if (currentColorMode === 'white') {
        return 'rgba(255, 255, 255, 1)';
    } else if (currentColorMode === 'black') {
        return 'rgba(0, 0, 0, 1)';
    } else if (currentColorMode === 'gradient') {
        // フォールバック（通常はループ内で処理されるため呼ばれないはずだが一応）
        return 'rgba(255, 0, 128, 1)';
    } else {
        // 自動モード: 背景の明るさに応じて白か黒を選択
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        // 画面外参照エラー防止
        const safeX = Math.max(0, Math.min(canvas.width - 1, Math.floor(centerX)));
        const safeY = Math.max(0, Math.min(canvas.height - 1, Math.floor(centerY)));

        const imageData = ctx.getImageData(safeX, safeY, 1, 1).data;
        const brightness = (imageData[0] * 299 + imageData[1] * 587 + imageData[2] * 114) / 1000;
        return brightness > 128 ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)';
    }
}

// =====================================================
// 画像ダウンロード
// =====================================================

function downloadImage() {
    if (!originalImage) return;

    // ファイル名を生成
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `watermarked_${timestamp}.png`;

    // ダウンロードリンクを作成
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

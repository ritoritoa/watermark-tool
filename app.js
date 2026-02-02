/**
 * ウォーターマークツール - メインJavaScript
 * Canvas APIを使用して画像にタイル状のウォーターマークを追加
 */

// ビルドID（改ざん検出モードで使用）
const BUILD_ID = 'v2025-01-27';

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
// Fix: button selector strict scoping
const colorBtns = document.querySelectorAll('.color-options .color-btn');
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

// 画像専用スライダー
const imgOpacitySlider = document.getElementById('imgOpacity');
const imgOpacityValue = document.getElementById('imgOpacityValue');
const imgAngleSlider = document.getElementById('imgAngle');
const imgAngleValue = document.getElementById('imgAngleValue');
const imgSpacingSlider = document.getElementById('imgSpacing');
const imgSpacingValue = document.getElementById('imgSpacingValue');
const imgJitterSlider = document.getElementById('imgJitter');
const imgJitterValue = document.getElementById('imgJitterValue');
const imgScaleSlider = document.getElementById('imgScale');
const imgScaleValue = document.getElementById('imgScaleValue');

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

// 三層ノイズ保護 DOM要素
const threeLayerNoiseCheckbox = document.getElementById('threeLayerNoise');
const noiseControls = document.getElementById('noiseControls');
const lowFreqNoiseSlider = document.getElementById('lowFreqNoise');
const lowFreqNoiseValue = document.getElementById('lowFreqNoiseValue');
const midFreqAngleSlider = document.getElementById('midFreqAngle');
const midFreqAngleValue = document.getElementById('midFreqAngleValue');
const midFreqStrengthSlider = document.getElementById('midFreqStrength');
const midFreqStrengthValue = document.getElementById('midFreqStrengthValue');
const highFreqNoiseSlider = document.getElementById('highFreqNoise');
const highFreqNoiseValue = document.getElementById('highFreqNoiseValue');
const noiseCorrelationSlider = document.getElementById('noiseCorrelation');
const noiseCorrelationValue = document.getElementById('noiseCorrelationValue');

// Diff Tool & Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const mainSection = document.getElementById('mainSection');
const diffSection = document.getElementById('diffSection');
const detectionCheckbox = document.getElementById('tamperDetection');

// Diff Logic Elements
const beforeValues = { img: null };
const afterValues = { img: null };
const beforeInput = document.getElementById('beforeImage');
const afterInput = document.getElementById('afterImage');
const generateDiffBtn = document.getElementById('generateDiffBtn');
const diffResult = document.getElementById('diffResult');
const diffCanvas = document.getElementById('diffCanvas');
const downloadDiffBtn = document.getElementById('downloadDiffBtn');
const gainSlider = document.getElementById('gainSlider');
const thresholdSlider = document.getElementById('thresholdSlider');
const gainValue = document.getElementById('gainValue');
const thresholdValue = document.getElementById('thresholdValue');

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
    setupEffectControls();

    // 前回の設定を復元
    loadSettings();
}

// =====================================================
// 設定の保存・復元 (localStorage)
// =====================================================

const SETTINGS_KEY = 'watermark-tool-settings';

function saveSettings() {
    const settings = {
        // テキスト
        watermarkText: watermarkText?.value || '',

        // スライダー値
        opacity: opacitySlider?.value,
        fontSize: fontSizeSlider?.value,
        angle: angleSlider?.value,
        spacing: spacingSlider?.value,
        wmScale: wmScaleSlider?.value,
        dotSize: dotSizeSlider?.value,
        vignette: vignetteSlider?.value,
        vignetteSize: vignetteSizeSlider?.value,
        texture: textureSlider?.value,
        integration: integrationSlider?.value,
        jitter: jitterSlider?.value,

        // 画像専用設定
        imgOpacity: imgOpacitySlider?.value,
        imgAngle: imgAngleSlider?.value,
        imgSpacing: imgSpacingSlider?.value,
        imgJitter: imgJitterSlider?.value,
        imgScale: imgScaleSlider?.value,

        // 三層ノイズ
        threeLayerNoise: threeLayerNoiseCheckbox?.checked,
        lowFreqNoise: lowFreqNoiseSlider?.value,
        midFreqAngle: midFreqAngleSlider?.value,
        midFreqStrength: midFreqStrengthSlider?.value,
        highFreqNoise: highFreqNoiseSlider?.value,
        noiseCorrelation: noiseCorrelationSlider?.value,

        // チェックボックス
        noiseProtection: noiseProtection?.checked,
        tamperDetection: detectionCheckbox?.checked,

        // ボタン選択状態
        colorMode: currentColorMode,
        style: currentStyle,
        font: currentFont,
        mode: currentMode,
        blendMode: currentBlendMode,
        vignetteColor: currentVignetteColor
    };

    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.warn('設定の保存に失敗:', e);
    }
}

function loadSettings() {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (!saved) return;

        const settings = JSON.parse(saved);

        // テキスト
        if (settings.watermarkText && watermarkText) {
            watermarkText.value = settings.watermarkText;
        }

        // スライダー復元（値と表示を両方更新）
        restoreSlider(opacitySlider, opacityValue, settings.opacity);
        restoreSlider(fontSizeSlider, fontSizeValue, settings.fontSize);
        restoreSlider(angleSlider, angleValue, settings.angle);
        restoreSlider(spacingSlider, spacingValue, settings.spacing);
        restoreSlider(wmScaleSlider, wmScaleValue, settings.wmScale);
        restoreSlider(dotSizeSlider, dotSizeValue, settings.dotSize);
        restoreSlider(vignetteSlider, vignetteValue, settings.vignette);
        restoreSlider(vignetteSizeSlider, vignetteSizeValue, settings.vignetteSize);
        restoreSlider(textureSlider, textureValue, settings.texture);
        restoreSlider(integrationSlider, integrationValue, settings.integration);
        restoreSlider(jitterSlider, jitterValue, settings.jitter);

        // 画像専用設定
        restoreSlider(imgOpacitySlider, imgOpacityValue, settings.imgOpacity);
        restoreSlider(imgAngleSlider, imgAngleValue, settings.imgAngle);
        restoreSlider(imgSpacingSlider, imgSpacingValue, settings.imgSpacing);
        restoreSlider(imgJitterSlider, imgJitterValue, settings.imgJitter);
        restoreSlider(imgScaleSlider, imgScaleValue, settings.imgScale);

        // 三層ノイズ
        restoreSlider(lowFreqNoiseSlider, lowFreqNoiseValue, settings.lowFreqNoise);
        restoreSlider(midFreqAngleSlider, midFreqAngleValue, settings.midFreqAngle);
        restoreSlider(midFreqStrengthSlider, midFreqStrengthValue, settings.midFreqStrength);
        restoreSlider(highFreqNoiseSlider, highFreqNoiseValue, settings.highFreqNoise);
        restoreSlider(noiseCorrelationSlider, noiseCorrelationValue, settings.noiseCorrelation);

        // チェックボックス
        if (threeLayerNoiseCheckbox && settings.threeLayerNoise !== undefined) {
            threeLayerNoiseCheckbox.checked = settings.threeLayerNoise;
            if (noiseControls) {
                noiseControls.style.display = settings.threeLayerNoise ? 'block' : 'none';
            }
        }
        if (noiseProtection && settings.noiseProtection !== undefined) {
            noiseProtection.checked = settings.noiseProtection;
            const jammerControl = document.getElementById('jammerStrengthControl');
            if (jammerControl) {
                jammerControl.style.display = settings.noiseProtection ? 'flex' : 'none';
            }
        }
        if (detectionCheckbox && settings.tamperDetection !== undefined) {
            detectionCheckbox.checked = settings.tamperDetection;
        }

        // ボタン選択状態
        if (settings.colorMode) {
            currentColorMode = settings.colorMode;
            colorBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.color === settings.colorMode);
            });
        }
        if (settings.style) {
            currentStyle = settings.style;
            styleBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.style === settings.style);
            });
            if (halftoneOptions) {
                halftoneOptions.style.display = settings.style === 'halftone' ? 'block' : 'none';
            }
        }
        if (settings.font) {
            currentFont = settings.font;
            fontBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.font === settings.font);
            });
        }
        if (settings.mode) {
            currentMode = settings.mode;
            modeBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === settings.mode);
            });
            // セクション表示切替
            if (textWatermarkSection && imageWatermarkSection) {
                if (settings.mode === 'text') {
                    textWatermarkSection.style.display = 'block';
                    imageWatermarkSection.style.display = 'none';
                } else if (settings.mode === 'image') {
                    textWatermarkSection.style.display = 'none';
                    imageWatermarkSection.style.display = 'block';
                } else if (settings.mode === 'composite') {
                    textWatermarkSection.style.display = 'block';
                    imageWatermarkSection.style.display = 'block';
                }
            }
        }
        if (settings.blendMode) {
            currentBlendMode = settings.blendMode;
            blendBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.blend === settings.blendMode);
            });
        }
        if (settings.vignetteColor) {
            currentVignetteColor = settings.vignetteColor;
            const vignetteBtns = document.querySelectorAll('[data-vignette-color]');
            vignetteBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.vignetteColor === settings.vignetteColor);
            });
        }

        console.log('設定を復元しました');
    } catch (e) {
        console.warn('設定の復元に失敗:', e);
    }
}

function restoreSlider(slider, display, value) {
    if (slider && value !== undefined) {
        slider.value = value;
        if (display) display.textContent = value;
    }
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
    // テキスト入力（画像なしでも設定保存する）
    watermarkText.addEventListener('input', () => {
        saveSettings();
        renderWatermark();
    });

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
            } else if (currentMode === 'composite') {
                textWatermarkSection.style.display = 'block';
                imageWatermarkSection.style.display = 'block';
            } else {
                // text mode
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
}

function setupEffectControls() {
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

    // ビネット色選択ボタン
    const vignetteBtns = document.querySelectorAll('[data-vignette-color]');
    vignetteBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            vignetteBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentVignetteColor = btn.dataset.vignetteColor;
            renderWatermark();
        });
    });

    // ビネットサイズスライダー
    vignetteSizeSlider.addEventListener('input', () => {
        vignetteSizeValue.textContent = vignetteSizeSlider.value;
        renderWatermark();
    });

    // ===== 三層ノイズ保護 =====
    if (threeLayerNoiseCheckbox && noiseControls) {
        threeLayerNoiseCheckbox.addEventListener('change', () => {
            noiseControls.style.display = threeLayerNoiseCheckbox.checked ? 'block' : 'none';
            renderWatermark();
        });
    }

    // 低周波ノイズスライダー
    if (lowFreqNoiseSlider) {
        lowFreqNoiseSlider.addEventListener('input', () => {
            lowFreqNoiseValue.textContent = lowFreqNoiseSlider.value;
            renderWatermark();
        });
    }

    // 中域ノイズ（角度）
    if (midFreqAngleSlider) {
        midFreqAngleSlider.addEventListener('input', () => {
            midFreqAngleValue.textContent = midFreqAngleSlider.value;
            renderWatermark();
        });
    }

    // 中域ノイズ（強度）
    if (midFreqStrengthSlider) {
        midFreqStrengthSlider.addEventListener('input', () => {
            midFreqStrengthValue.textContent = midFreqStrengthSlider.value;
            renderWatermark();
        });
    }

    // 高周波ノイズスライダー
    if (highFreqNoiseSlider) {
        highFreqNoiseSlider.addEventListener('input', () => {
            highFreqNoiseValue.textContent = highFreqNoiseSlider.value;
            renderWatermark();
        });
    }

    // 相関度スライダー
    if (noiseCorrelationSlider) {
        noiseCorrelationSlider.addEventListener('input', () => {
            noiseCorrelationValue.textContent = noiseCorrelationSlider.value;
            renderWatermark();
        });
    }
}

// =====================================================
// ウォーターマーク描画関数（レイヤーへの描画）
// =====================================================

// 画像ウォーターマークをレイヤーに描画
function renderImageWatermarkToLayer(targetCtx, spacing, scale, angle, jitterStrength) {
    if (!watermarkImage) return;

    const wmWidth = watermarkImage.width * scale;
    const wmHeight = watermarkImage.height * scale;

    targetCtx.save();
    targetCtx.translate(canvas.width / 2, canvas.height / 2);
    targetCtx.rotate((angle * Math.PI) / 180);

    const startX = -(canvas.width * 2);
    const startY = -(canvas.height * 2);
    const endX = canvas.width * 2;
    const endY = canvas.height * 2;

    for (let y = startY; y < endY; y += spacing) {
        for (let x = startX; x < endX; x += spacing) {
            // ジッター (揺らぎ)
            const jx = jitterStrength > 0 ? (Math.random() - 0.5) * jitterStrength : 0;
            const jy = jitterStrength > 0 ? (Math.random() - 0.5) * jitterStrength : 0;

            targetCtx.drawImage(
                watermarkImage,
                x + jx - wmWidth / 2,
                y + jy - wmHeight / 2,
                wmWidth,
                wmHeight
            );
        }
    }

    targetCtx.restore();
}

// テキストウォーターマークをレイヤーに描画
function renderTextWatermarkToLayer(targetCtx, spacing, scale, angle, jitterStrength, config) {
    const text = watermarkText.value || '© Sample';

    // configがある場合はそれを使う（Phantom Layer用）、ない場合は通常設定
    const baseFontSize = config ? config.fontSize : parseInt(fontSizeSlider.value) * scale;
    const style = config ? config.style : currentStyle;
    const colorMode = config ? config.colorMode : currentColorMode;

    targetCtx.save();
    targetCtx.textAlign = 'center';
    targetCtx.textBaseline = 'middle';

    // 回転の中心を設定
    targetCtx.translate(canvas.width / 2, canvas.height / 2);
    targetCtx.rotate((angle * Math.PI) / 180);

    // タイル状に配置するための範囲
    const startX = -(canvas.width * 2);
    const startY = -(canvas.height * 2);
    const endX = canvas.width * 2;
    const endY = canvas.height * 2;

    // ジッター強度の正規化 (0-100 → 0-1)
    const jitterNorm = jitterStrength / 100;

    // スタイルに応じて描画
    if (style === 'halftone') {
        const dotSize = parseInt(dotSizeSlider.value);
        renderHalftoneText(targetCtx, text, baseFontSize, startX, startY, endX, endY, spacing, spacing, dotSize, jitterStrength);
    } else if (style === 'analog') {
        renderAnalogText(targetCtx, text, baseFontSize, startX, startY, endX, endY, spacing, spacing, jitterStrength);
    } else {
        // 通常 or 中抜き（強化版ジッター）
        for (let y = startY; y < endY; y += spacing) {
            for (let x = startX; x < endX; x += spacing) {
                // === 位置ジッター（2倍の効果） ===
                const jx = jitterStrength > 0 ? (Math.random() - 0.5) * jitterStrength * 2 : 0;
                const jy = jitterStrength > 0 ? (Math.random() - 0.5) * jitterStrength * 2 : 0;

                // === 回転ジッター（±15度） ===
                const rotationJitter = jitterStrength > 0 ? (Math.random() - 0.5) * jitterNorm * 30 : 0;

                // === サイズジッター（±20%） ===
                const sizeJitter = jitterStrength > 0 ? 1 + (Math.random() - 0.5) * jitterNorm * 0.4 : 1;
                const fontSize = baseFontSize * sizeJitter;

                const finalX = x + jx;
                const finalY = y + jy;

                // テキスト色を決定
                const color = config && config.color ? config.color : getTextColor(finalX, finalY);

                // 個別の回転を適用
                targetCtx.save();
                targetCtx.translate(finalX, finalY);
                targetCtx.rotate((rotationJitter * Math.PI) / 180);
                targetCtx.font = getFontString(fontSize);

                if (style === 'outline') {
                    // 中抜きスタイル
                    targetCtx.strokeStyle = color;
                    targetCtx.lineWidth = 2;
                    targetCtx.strokeText(text, 0, 0);
                } else {
                    // 通常スタイル + 自動コントラスト縁取り
                    // まず対比色で太めの縁取りを描画（視認性向上）
                    const isLightColor = color.includes('255') || color === 'white' || colorMode === 'white';
                    targetCtx.strokeStyle = isLightColor ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)';
                    targetCtx.lineWidth = fontSize * 0.08; // フォントサイズの8%
                    targetCtx.lineJoin = 'round';
                    targetCtx.strokeText(text, 0, 0);

                    // その上にメインの文字を描画
                    targetCtx.fillStyle = color;
                    targetCtx.fillText(text, 0, 0);
                }

                targetCtx.restore();
            }
        }
    }

    targetCtx.restore();
}

// ハーフトーン（ドット）スタイル描画
function renderHalftoneText(ctx, text, fontSize, startX, startY, endX, endY, textWidth, textHeight, dotSize, jitterStrength) {
    // テキストの形状を仮想キャンバスで取得
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

    const dotSpacing = 3;

    // タイル状に配置
    for (let tileY = startY; tileY < endY; tileY += textHeight) {
        for (let tileX = startX; tileX < endX; tileX += textWidth) {
            // ジッター
            const jx = jitterStrength > 0 ? (Math.random() - 0.5) * jitterStrength : 0;
            const jy = jitterStrength > 0 ? (Math.random() - 0.5) * jitterStrength : 0;

            const finalTileX = tileX + jx;
            const finalTileY = tileY + jy;

            // ドットパターンで描画
            for (let dy = 0; dy < textH; dy += dotSpacing) {
                for (let dx = 0; dx < textW; dx += dotSpacing) {
                    const pixelX = Math.floor(dx);
                    const pixelY = Math.floor(dy);
                    const idx = (pixelY * textW + pixelX) * 4;
                    const alpha = data[idx + 3];

                    if (alpha > 50) {
                        let color;
                        if (currentColorMode === 'gradient') {
                            color = gradientStyle;
                        } else {
                            color = getTextColor(finalTileX + dx, finalTileY + dy);
                        }

                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(
                            finalTileX + dx - textW / 2,
                            finalTileY + dy - textH / 2,
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

// アナログスタイル描画（手書き風）
function renderAnalogText(ctx, text, fontSize, startX, startY, endX, endY, textWidth, textHeight, jitterStrength) {
    for (let y = startY; y < endY; y += textHeight) {
        for (let x = startX; x < endX; x += textWidth) {
            const jx = jitterStrength > 0 ? (Math.random() - 0.5) * jitterStrength * 2 : 0;
            const jy = jitterStrength > 0 ? (Math.random() - 0.5) * jitterStrength * 2 : 0;
            const jitterRotation = (Math.random() - 0.5) * 5;

            ctx.save();
            ctx.translate(x + jx, y + jy);
            ctx.rotate((jitterRotation * Math.PI) / 180);

            const color = getTextColor(x, y);
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.8 + Math.random() * 0.2;
            ctx.fillText(text, 0, 0);

            ctx.restore();
        }
    }
}

// テキスト色を取得
function getTextColor(x, y) {
    if (currentColorMode === 'white') {
        return 'rgba(255, 255, 255, 1)';
    } else if (currentColorMode === 'black') {
        return 'rgba(0, 0, 0, 1)';
    } else if (currentColorMode === 'gradient') {
        return 'rgba(255, 0, 128, 1)';
    } else {
        // 自動モード
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const safeX = Math.max(0, Math.min(canvas.width - 1, Math.floor(centerX)));
        const safeY = Math.max(0, Math.min(canvas.height - 1, Math.floor(centerY)));

        const imageData = ctx.getImageData(safeX, safeY, 1, 1).data;
        const brightness = (imageData[0] * 299 + imageData[1] * 587 + imageData[2] * 114) / 1000;
        return brightness > 128 ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)';
    }
}

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

    // 画像専用スライダーのイベントハンドラー
    if (imgOpacitySlider) {
        imgOpacitySlider.addEventListener('input', () => {
            imgOpacityValue.textContent = imgOpacitySlider.value;
            renderWatermark();
        });
    }
    if (imgAngleSlider) {
        imgAngleSlider.addEventListener('input', () => {
            imgAngleValue.textContent = imgAngleSlider.value;
            renderWatermark();
        });
    }
    if (imgSpacingSlider) {
        imgSpacingSlider.addEventListener('input', () => {
            imgSpacingValue.textContent = imgSpacingSlider.value;
            renderWatermark();
        });
    }
    if (imgJitterSlider) {
        imgJitterSlider.addEventListener('input', () => {
            imgJitterValue.textContent = imgJitterSlider.value;
            renderWatermark();
        });
    }
    if (imgScaleSlider) {
        imgScaleSlider.addEventListener('input', () => {
            imgScaleValue.textContent = imgScaleSlider.value;
            renderWatermark();
        });
    }
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
    if (!originalImage) {
        saveSettings(); // 画像なくても設定は保存
        return;
    }

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
    const shouldRenderText = (currentMode === 'text' || currentMode === 'composite');
    const shouldRenderImage = (currentMode === 'image' || currentMode === 'composite');

    // === テキスト透かしの描画（テキスト専用キャンバス） ===
    const textCanvas = document.createElement('canvas');
    textCanvas.width = canvas.width;
    textCanvas.height = canvas.height;
    const textCtx = textCanvas.getContext('2d');

    if (shouldRenderText) {
        // === 👻 Phantom Layer (亡霊レイヤー) 描画 ===
        textCtx.save();
        textCtx.globalAlpha = 0.05;

        const phantomConfig = {
            style: 'outline',
            colorMode: 'white',
            color: 'rgba(255, 255, 255, 1)',
            fontSize: 180
        };

        renderTextWatermarkToLayer(
            textCtx,
            1000,
            1,
            angle + 5,
            70,
            phantomConfig
        );
        textCtx.restore();

        // === 👤 User Layer (メイン透かし) 描画 ===
        textCtx.globalAlpha = 1.0;
        renderTextWatermarkToLayer(textCtx, spacing, scale, angle, jitterStrength);

        // AIジャマー（テキストレイヤーに適用）
        if (noiseProtection.checked) {
            addNoiseProtectionToLayer(textCtx, textCanvas.width, textCanvas.height);
        }
    }

    // === 画像透かしの描画（画像専用キャンバス） ===
    const imgCanvas = document.createElement('canvas');
    imgCanvas.width = canvas.width;
    imgCanvas.height = canvas.height;
    const imgCtx = imgCanvas.getContext('2d');

    if (shouldRenderImage && watermarkImage) {
        const imgAngle = imgAngleSlider ? parseInt(imgAngleSlider.value) : angle;
        const imgSpacing = imgSpacingSlider ? parseInt(imgSpacingSlider.value) : spacing;
        const imgScale = imgScaleSlider ? (parseInt(imgScaleSlider.value) / 100) : scale;
        const imgJitter = imgJitterSlider ? parseInt(imgJitterSlider.value) : jitterStrength;

        imgCtx.globalAlpha = 1.0;
        renderImageWatermarkToLayer(imgCtx, imgSpacing, imgScale, imgAngle, imgJitter);
    }

    // 4. それぞれのレイヤーを個別の透明度で合成
    ctx.globalCompositeOperation = currentBlendMode;

    // テキストレイヤーを合成（テキスト透明度、100%超は重ね描き）
    if (shouldRenderText) {
        const rawOpacity = parseInt(opacitySlider.value);

        if (rawOpacity > 100) {
            // 100%超: まず100%で1回描画、残りの分をもう1回描画
            ctx.globalAlpha = 1.0;
            ctx.drawImage(textCanvas, 0, 0);

            // 追加描画（50% = もう1回100%、100%超えた分を描画）
            const extraOpacity = (rawOpacity - 100) / 100;
            ctx.globalAlpha = extraOpacity;
            ctx.drawImage(textCanvas, 0, 0);
        } else {
            ctx.globalAlpha = rawOpacity / 100;
            ctx.drawImage(textCanvas, 0, 0);
        }
    }

    // 画像レイヤーを合成（画像専用透明度）
    if (shouldRenderImage && watermarkImage) {
        const imgOpacity = imgOpacitySlider ? parseInt(imgOpacitySlider.value) / 100 : 0.7;
        ctx.globalAlpha = imgOpacity;
        ctx.drawImage(imgCanvas, 0, 0);
    }

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

    // 6. 三層ノイズ保護（最終工程・ダウンロード前に適用）
    if (threeLayerNoiseCheckbox && threeLayerNoiseCheckbox.checked) {
        applyThreeLayerNoise(ctx, canvas.width, canvas.height, {
            lowFreq: lowFreqNoiseSlider ? parseInt(lowFreqNoiseSlider.value) : 30,
            midAngle: midFreqAngleSlider ? parseInt(midFreqAngleSlider.value) : 45,
            midStrength: midFreqStrengthSlider ? parseInt(midFreqStrengthSlider.value) : 40,
            highFreq: highFreqNoiseSlider ? parseInt(highFreqNoiseSlider.value) : 50,
            correlation: noiseCorrelationSlider ? parseInt(noiseCorrelationSlider.value) : 70
        });
    }

    // 設定を自動保存
    saveSettings();
}


// AIジャマー機能（Texture Jammer Mode）
// ビネット（周辺減光/増光）を描画
// v15-Fix: 罠ノイズが画面全体を覆って文字を消してしまう不具合を修正
// オフスクリーンキャンバスを使って、ノイズをビネットの形（四隅）だけにマスクする
function renderVignette(strength) {
    // スライダーがない場合（古いキャッシュ）はデフォルト50扱い
    const size = vignetteSizeSlider ? parseInt(vignetteSizeSlider.value) : 50;

    // 広がり(Area)が大きいほど、開始位置(innerRadius)を小さくする＝中心まで攻める
    const innerFactor = 0.6 * (1 - (size / 100));
    const maxRadius = Math.max(canvas.width, canvas.height) * 0.8;
    const innerRadius = maxRadius * innerFactor;

    // オフスクリーンキャンバス作成（マスク処理用）
    const vCanvas = document.createElement('canvas');
    vCanvas.width = canvas.width;
    vCanvas.height = canvas.height;
    const vCtx = vCanvas.getContext('2d');

    // 1. グラデーション形状を作成
    const gradient = vCtx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, innerRadius,
        canvas.width / 2, canvas.height / 2, maxRadius
    );

    // 色の定義
    const colorRGB = currentVignetteColor === 'white' ? '255, 255, 255' : '0, 0, 0';

    // 強さに応じて透明度を調整
    const opacity = Math.min(1, (strength / 100) * 0.9);

    gradient.addColorStop(0, `rgba(${colorRGB}, 0)`);
    gradient.addColorStop(1, `rgba(${colorRGB}, ${opacity})`);

    vCtx.fillStyle = gradient;
    vCtx.fillRect(0, 0, canvas.width, canvas.height); // グラデーション描画

    // 2. 罠（Trap）の発動: マスクされた領域にノイズを焼き込む
    if (currentVignetteColor === 'black' || currentVignetteColor === 'auto') {
        vCtx.globalCompositeOperation = 'source-in'; // 描画済みのグラデーション部分にだけ塗る

        const trapPattern = createTrapNoisePattern(vCtx);
        vCtx.fillStyle = trapPattern;

        // ノイズ自体の透明度（少し控えめに）
        vCtx.globalAlpha = 0.5;
        vCtx.fillRect(0, 0, canvas.width, canvas.height);

        // 戻す
        vCtx.globalAlpha = 1.0;

        // 重要: 'source-in' すると元のグラデーションの色が消えてノイズだけになる
        // なので、ノイズを描く前のグラデーション（ベース）が必要だが…
        // 実際は「黒いノイズ」を描画すればビネット代わりになるのでOK
        // いや、TrapPatternはカラフルなので、そのまま描くと派手すぎる
        // → 'source-atop' でグラデーションの上に重ねる方が安全か？
        // いや、source-inだと透明部分が守られるのが最大のメリット。
        // カラフルなノイズを「黒いグラデ」と混ぜたい。
    }

    // 3. メインキャンバスに合成
    ctx.save();

    // 罠モードの場合、vCanvasには「ノイズ」が入っている
    // これをメイン画像に乗せる。
    // 黒ビネットなら 'multiply' や 'overlay'
    // でもTrapNoiseは不透明度を持っているので、単純に描画すると四隅がその色になる
    if (currentVignetteColor === 'black' || currentVignetteColor === 'auto') {
        // vCanvasの内容: [四隅にある半透明のRGBノイズ]

        // まず通常の黒ビネット（ベース）を描く必要がある？
        // TrapPatternを使うとvCanvasはそれだけで埋まる。
        // ベースの黒さを担保するために、TrapPattern自体を少し暗くするか、
        // メインキャンバスに2回描く（黒グラデ + ノイズグラデ）。

        // A. まず純粋な黒グラデを描く（これでビネット効果）
        // オフスクリーンcanvasを再利用するのは面倒なので、メインctxで直接描く
        const simpleGrad = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, innerRadius,
            canvas.width / 2, canvas.height / 2, maxRadius
        );
        simpleGrad.addColorStop(0, `rgba(0,0,0,0)`);
        simpleGrad.addColorStop(1, `rgba(0,0,0,${opacity})`);

        ctx.fillStyle = simpleGrad;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // B. その上にノイズ（vCanvas）を 'overlay' で乗せる
        ctx.globalCompositeOperation = 'overlay';
        ctx.drawImage(vCanvas, 0, 0);

    } else {
        // 通常（白ビネットなど）はそのまま描画
        ctx.globalCompositeOperation = 'source-over'; // または screen
        ctx.drawImage(vCanvas, 0, 0);
    }

    ctx.restore();
}
// ... existing code ...

// 質感ノイズ（テクスチャ）を描画
// v17: Quantum Noise (量子ノイズ) 化
// 単純なモノクロノイズではなく、Trapと同じRGBノイズを画面全体に撒くことで
// 背景の「単純さ」を消し去る
function renderTexture(strength, alphaScale = 1.0) {
    if (strength <= 0) return;

    // 罠（Trap）用のパターンを流用（これが最強のRGBノイズなので）
    const pattern = createTrapNoisePattern(ctx);

    ctx.fillStyle = pattern;

    // オーバーレイで重ねる
    ctx.globalCompositeOperation = 'overlay';

    // 強度調整
    // ノイズは強すぎると画像が汚れるので、ユーザー指定値より少し控えめに補正
    ctx.globalAlpha = (strength / 100) * alphaScale * 0.8;

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // リセット
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
}

// アナログ風ノイズパターン生成（鉛筆の粉のような質感）
// type: 'dark' (鉛筆/黒) または 'light' (チョーク/白)
function createAnalogNoisePattern(ctx, type = 'dark') {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');

    const imgData = pCtx.createImageData(64, 64);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
        let val;
        // ホログラムモード（銀色/虹色微粒子）
        if (type === 'holographic') {
            // ベースは明るい白銀色だが、RGBを微妙にズラして「色情報」を持たせる
            // 見た目は「キラキラした白」だが、AIには「多色ノイズ」として映る
            const base = 220;
            data[i] = base + (Math.random() - 0.5) * 60;   // R: 190~250
            data[i + 1] = base + (Math.random() - 0.5) * 60; // G: 190~250
            data[i + 2] = base + (Math.random() - 0.5) * 60; // B: 190~250
        }
        // チョークモード（白系ノイズ）
        else if (type === 'light') {
            // 200〜255の明るい値
            val = 200 + Math.random() * 55;
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
        } else {
            // 鉛筆モード（黒系ノイズ）
            val = Math.random() * 80;
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
        }

        // アルファをランダムにして「ムラ」を作る
        data[i + 3] = 100 + Math.random() * 155;
    }
    pCtx.putImageData(imgData, 0, 0);
    return ctx.createPattern(pCanvas, 'repeat');
}

// 改ざん検出用ラベルの刻印
function stampDetectionLabel(ctx, w, h) {
    ctx.save();
    ctx.globalAlpha = 0.35; // 少し目立たせる
    ctx.font = '14px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';

    // 背景が暗いか明るいかで文字色を変えるべきだが、
    // 基本的に「検出レイヤー」は「目に見える」ことが重要なので白文字にドロップシャドウで対応
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;

    // 右下に配置
    ctx.fillText(`検出用レイヤーを含む (${BUILD_ID})`, w - 12, h - 10);
    ctx.restore();
}

// =====================================================
// 三層ノイズ保護システム (Three-Layer Correlated Noise)
// =====================================================

/**
 * シード付き擬似乱数生成器（再現可能なノイズ生成用）
 */
function seededRandom(seed) {
    const m = 0x80000000;
    const a = 1103515245;
    const c = 12345;
    let state = seed;
    return function () {
        state = (a * state + c) % m;
        return state / (m - 1);
    };
}

/**
 * 低周波ノイズ生成（Perlin風の滑らかな明暗パターン）
 */
function generateLowFreqNoise(x, y, scale) {
    const gridX = Math.floor(x / scale);
    const gridY = Math.floor(y / scale);
    const fracX = (x / scale) - gridX;
    const fracY = (y / scale) - gridY;

    const hash = (gx, gy) => {
        const seed = (gx * 374761393 + gy * 668265263) ^ 1013904223;
        return ((seed * seed * seed * 60493) >>> 0) / 4294967296;
    };

    const v00 = hash(gridX, gridY);
    const v10 = hash(gridX + 1, gridY);
    const v01 = hash(gridX, gridY + 1);
    const v11 = hash(gridX + 1, gridY + 1);

    const smoothX = fracX * fracX * (3 - 2 * fracX);
    const smoothY = fracY * fracY * (3 - 2 * fracY);

    const top = v00 + (v10 - v00) * smoothX;
    const bottom = v01 + (v11 - v01) * smoothX;

    return top + (bottom - top) * smoothY;
}

/**
 * 中域ノイズ生成（方向性を持つ線状ノイズ）
 */
function generateMidFreqNoise(x, y, angle, strength, lowFreqValue, correlation) {
    const rad = (angle * Math.PI) / 180;
    const rotatedY = x * Math.sin(rad) + y * Math.cos(rad);
    const linePattern = (Math.sin(rotatedY * 0.1) + 1) / 2;
    const correlated = linePattern * (1 - correlation) +
        (linePattern * lowFreqValue * 2) * correlation;
    const noise = (Math.sin(x * 0.3 + y * 0.7) + 1) / 2 * 0.3;
    return Math.max(0, Math.min(1, correlated * strength / 100 + noise * (strength / 200)));
}

/**
 * 高周波ノイズ生成（細かい粒子・線）
 */
function generateHighFreqNoise(x, y, density, lowFreqValue, midFreqValue, correlation) {
    const hash = ((x * 374761393 + y * 668265263 + 1013904223) >>> 0) / 4294967296;
    const correlationFactor = (lowFreqValue * 0.5 + midFreqValue * 0.5);
    const adjustedDensity = density * (1 - correlation * 0.5) +
        density * correlation * correlationFactor * 1.5;
    const threshold = 1 - (adjustedDensity / 100);
    if (hash > threshold) {
        return hash;
    }
    return 0;
}

/**
 * 三層相関ノイズを画像に適用
 */
function applyThreeLayerNoise(ctx, width, height, params) {
    const {
        lowFreq = 30,
        midAngle = 45,
        midStrength = 40,
        highFreq = 50,
        correlation = 70
    } = params;

    if (lowFreq === 0 && midStrength === 0 && highFreq === 0) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const normalizedCorrelation = correlation / 100;
    const lowFreqScale = 80;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;

            const lowNoise = generateLowFreqNoise(x, y, lowFreqScale);
            const midNoise = generateMidFreqNoise(x, y, midAngle, midStrength, lowNoise, normalizedCorrelation);
            const highNoise = generateHighFreqNoise(x, y, highFreq, lowNoise, midNoise, normalizedCorrelation);

            const lowContrib = (lowNoise - 0.5) * (lowFreq / 100) * 30;
            const midContrib = (midNoise - 0.5) * 20;
            const highContrib = highNoise * 15;

            // RGB各チャンネルに微妙に異なるオフセットを適用（相関ノイズの鍵）
            const rOffset = lowContrib + midContrib + highContrib;
            const gOffset = lowContrib * 0.9 + midContrib * 1.1 + highContrib * 0.95;
            const bOffset = lowContrib * 1.1 + midContrib * 0.9 + highContrib * 1.05;

            data[i] = Math.max(0, Math.min(255, data[i] + rOffset));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + gOffset));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + bOffset));
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

// 罠（Trap）用ノイズパターン生成: 一見ただの暗闇だが、AI殺しのRGBノイズを含ませる
function createTrapNoisePattern(ctx) {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 128;
    pCanvas.height = 128;
    const pCtx = pCanvas.getContext('2d');

    const imgData = pCtx.createImageData(128, 128);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
        // RGBをバラバラに設定（人間の目にはグレー/黒に見えるが、データ上は極彩色のノイズ）
        // AIが「彩度強調」や「ノイズ除去」をかけた瞬間に色が暴発する
        const base = 20;
        const range = 60; // 結構振れ幅を持たせる

        data[i] = base + Math.random() * range;     // R
        data[i + 1] = base + Math.random() * range;   // G
        data[i + 2] = base + Math.random() * range;   // B
        data[i + 3] = 255; // 不透明
    }
    pCtx.putImageData(imgData, 0, 0);
    return ctx.createPattern(pCanvas, 'repeat');
}

// かすれ（Erasure）効果：ランダムに微小な穴を開けてアナログ感を出す
function addKasureEffect(ctx, width, height) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    // 画面の少しの割合をランダムに消す
    const density = (width * height) * 0.01; // 1%
    for (let i = 0; i < density; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        // 1px〜2pxの点で削る
        const size = Math.random() > 0.7 ? 2 : 1;
        ctx.fillRect(x, y, size, size);
    }
    ctx.restore();
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
            } else if (styleToUse === 'analog') {
                // ✏️ アナログ描画 (鉛筆/チョーク/ホログラム風)
                let patternType = 'dark';

                if (colorModeToUse === 'gradient') {
                    // 虹色ボタン選択時 → ホログラム銀（対AI最強モード）
                    patternType = 'holographic';
                } else if (colorModeToUse === 'white' || colorModeToUse === 'auto') {
                    // 白/自動 → チョーク
                    patternType = 'light';
                }

                const pattern = createAnalogNoisePattern(targetCtx, patternType);
                targetCtx.fillStyle = pattern;

                // Micro-Jitter: 少しずらして重ね書きすることで、線の輪郭をざらつかせる
                // 透明度を下げて重ねることで、濃淡のムラも表現
                targetCtx.globalAlpha = 0.6;
                const passes = 3;
                for (let k = 0; k < passes; k++) {
                    // ±0.75px の微小なズレ
                    const mkX = (Math.random() - 0.5) * 1.5;
                    const mkY = (Math.random() - 0.5) * 1.5;
                    targetCtx.fillText(text, mkX, mkY);
                }
                targetCtx.globalAlpha = 1.0; // 戻す
            } else {
                // 通常描画
                targetCtx.fillStyle = color;
                targetCtx.fillText(text, 0, 0);
            }

            targetCtx.restore();
        }
    }

    // アナログモードの場合、最後にかすれ（Erasure）処理を入れてビンテージ感を出す
    if (styleToUse === 'analog') {
        addKasureEffect(targetCtx, canvas.width, canvas.height);
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

// =====================================================
// 画像ダウンロード
// =====================================================

// ダウンロード処理
downloadBtn.addEventListener('click', () => {
    // Canvasが空なら何もしない
    if (!originalImage) return;

    const link = document.createElement('a');

    // タイムスタンプ生成
    const timestamp = new Date().toISOString().slice(0, 10);

    // 改ざん検出モードならファイル名に _detect を付ける
    const suffix = (detectionCheckbox && detectionCheckbox.checked) ? '_detect' : '';
    link.download = `watermarked_${timestamp}${suffix}.png`;

    link.href = canvas.toDataURL('image/png');
    link.click();
});

// ファイル選択ボタンの連携（見た目カスタマイズ用）

// =====================================================
// タブ切り替え & 改ざん検出Diff機能
// =====================================================

// タブ切り替え
if (tabBtns) {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // アクティブクラス切り替え
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // セクション表示切り替え
            const tabName = btn.dataset.tab;
            if (tabName === 'main') {
                mainSection.style.display = '';
                diffSection.style.display = 'none';
            } else {
                mainSection.style.display = 'none';
                diffSection.style.display = '';
            }
        });
    });
}

// Diff用 画像読み込みヘルパー
function loadDiffImage(file, previewElem, valueStore) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            valueStore.img = img;
            previewElem.innerHTML = '';
            // プレビュー表示（アスペクト比保持）
            img.style.maxWidth = '100%';
            img.style.maxHeight = '200px';
            previewElem.appendChild(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

if (beforeInput) {
    beforeInput.addEventListener('change', (e) => {
        loadDiffImage(e.target.files[0], document.getElementById('beforePreview'), beforeValues);
    });
}

if (afterInput) {
    afterInput.addEventListener('change', (e) => {
        loadDiffImage(e.target.files[0], document.getElementById('afterPreview'), afterValues);
    });
}

// Diff生成実行
if (generateDiffBtn) {
    generateDiffBtn.addEventListener('click', () => {
        if (!beforeValues.img || !afterValues.img) {
            alert('Before画像とAfter画像の両方を選択してください。');
            return;
        }

        const gain = parseInt(gainSlider.value);
        const threshold = parseInt(thresholdSlider.value);

        makeDiff(beforeValues.img, afterValues.img, gain, threshold);

        // 結果エリア表示
        diffResult.style.display = 'block';
    });
}

// Diffスライダー（数値表示）
if (gainSlider) {
    gainSlider.addEventListener('input', () => {
        gainValue.textContent = gainSlider.value;
    });
}
if (thresholdSlider) {
    thresholdSlider.addEventListener('input', () => {
        thresholdValue.textContent = thresholdSlider.value;
    });
}

// Diff生成ロジック
function makeDiff(beforeImg, afterImg, gain, threshold) {
    // 基準サイズはBefore（原本）に合わせる
    const w = beforeImg.width;
    const h = beforeImg.height;

    // キャンバス準備
    diffCanvas.width = w;
    diffCanvas.height = h;
    const ctx = diffCanvas.getContext('2d');

    // 1. Beforeデータの取得
    const beforeCanvas = document.createElement('canvas');
    beforeCanvas.width = w;
    beforeCanvas.height = h;
    const beforeCtx = beforeCanvas.getContext('2d');
    beforeCtx.drawImage(beforeImg, 0, 0);
    const beforeData = beforeCtx.getImageData(0, 0, w, h).data;

    // 2. Afterデータの取得 (伸縮: cover/contain等も考えられるが、一旦fillで比較)
    const afterCanvas = document.createElement('canvas');
    afterCanvas.width = w;
    afterCanvas.height = h;
    const afterCtx = afterCanvas.getContext('2d');
    // サイズ違いを吸収するため、強制的にBeforeサイズにリサイズ描画
    afterCtx.drawImage(afterImg, 0, 0, w, h);
    const afterData = afterCtx.getImageData(0, 0, w, h).data;

    // 3. 差分計算
    const outImgData = ctx.createImageData(w, h);
    const outData = outImgData.data;

    for (let i = 0; i < beforeData.length; i += 4) {
        // RGB差分の絶対値
        const dr = Math.abs(beforeData[i] - afterData[i]);
        const dg = Math.abs(beforeData[i + 1] - afterData[i + 1]);
        const db = Math.abs(beforeData[i + 2] - afterData[i + 2]);

        // 平均差分
        let diff = (dr + dg + db) / 3;

        // 閾値処理 (小さいノイズを無視)
        if (diff < threshold) {
            diff = 0;
        } else {
            diff = diff - threshold;
        }

        // 増幅 (見やすくする)
        diff = Math.min(255, diff * gain);

        // グレー画像として出力
        outData[i] = diff;   // R
        outData[i + 1] = diff; // G
        outData[i + 2] = diff; // B
        outData[i + 3] = 255;  // Alpha (完全不透明)
    }

    ctx.putImageData(outImgData, 0, 0);
}

// Diff画像保存
if (downloadDiffBtn) {
    downloadDiffBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'diff_result.png';
        link.href = diffCanvas.toDataURL('image/png');
        link.click();
    });
}

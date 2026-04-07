const animationState = {
    algorithm: null,
    steps: [],
    currentStep: 0,
    intervalId: null,
    running: false,
    original: []
};

function getAnimationDelay(algorithm) {
    const speedInput = document.getElementById(algorithm + 'Speed');
    return speedInput ? parseInt(speedInput.value) : 700;
}

function updateSpeedDisplay(algorithm) {
    const speedInput = document.getElementById(algorithm + 'Speed');
    const speedValue = document.getElementById(algorithm + 'SpeedValue');
    const speedPreset = document.getElementById(algorithm + 'SpeedPreset');
    if (speedInput && speedValue) {
        speedValue.textContent = speedInput.value + 'ms';
    }
    if (speedInput && speedPreset) {
        const value = parseInt(speedInput.value, 10);
        if (value <= 200) {
            speedPreset.value = 'fast';
        } else if (value <= 800) {
            speedPreset.value = 'normal';
        } else {
            speedPreset.value = 'slow';
        }
    }
}

function initializeSpeedControl(algorithm) {
    const speedInput = document.getElementById(algorithm + 'Speed');
    const speedNumber = document.getElementById(algorithm + 'SpeedInput');
    const speedPreset = document.getElementById(algorithm + 'SpeedPreset');
    if (speedInput && speedNumber && speedPreset) {
        // 初始化顯示值
        updateSpeedDisplay(algorithm);
        initializeStatus(algorithm);
        // 同步滑桿與手動輸入框
        speedInput.addEventListener('input', () => {
            speedNumber.value = speedInput.value;
            updateSpeedDisplay(algorithm);
        });
        speedNumber.addEventListener('input', () => {
            let value = parseInt(speedNumber.value, 10);
            if (isNaN(value) || value < 1) value = 1;
            if (value > 2000) value = 2000;
            speedNumber.value = value;
            speedInput.value = value;
            updateSpeedDisplay(algorithm);
        });
        speedPreset.addEventListener('change', () => {
            const preset = speedPreset.value;
            let value = 700;
            if (preset === 'fast') value = 100;
            else if (preset === 'normal') value = 700;
            else if (preset === 'slow') value = 1500;
            speedInput.value = value;
            speedNumber.value = value;
            updateSpeedDisplay(algorithm);
        });
    }
}

function generateRandomNumbers(algorithm) {
    // 如果動畫正在運行，先停止它
    if (animationState.running) {
        pauseAnimation();
    }

    const countInput = document.getElementById(algorithm + 'Count');
    const count = parseInt(countInput.value) || 10;
    const numbers = [];
    for (let i = 0; i < count; i++) {
        numbers.push(Math.floor(Math.random() * 100) + 1); // 1-100 的隨機數
    }
    // 將數字存儲在隱藏的地方供排序使用
    animationState.original = [...numbers];
    // 重置動畫狀態
    animationState.steps = [];
    animationState.currentStep = 0;
    // 立即顯示初始狀態
    const config = getConfig(algorithm);
    drawBars(numbers, config.sortedVisId);
    setStatus(`已生成 ${count} 個隨機數字`, config);
    // 更新按鈕狀態
    updateControls();
}

function drawBars(arr, containerId, highlight = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const max = Math.max(...arr, 1);
    arr.forEach((num, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        if (highlight.compare?.includes(index)) bar.classList.add('bar-compare');
        if (highlight.pivot === index) bar.classList.add('bar-pivot');
        if (highlight.merge?.includes(index)) bar.classList.add('bar-merge');
        bar.style.height = (num / max * 100) + 'px';
        container.appendChild(bar);
    });
    container.scrollLeft = 0;
}

function getConfig(algorithm) {
    switch (algorithm) {
        case 'bubble':
            return {
                inputId: 'inputNumbers',
                sortedVisId: 'bubbleSortedVis',
                outputId: 'output',
                statusId: 'statusBubble',
                stepId: 'stepBubble',
                pauseBtnId: 'pauseBtnBubble',
                backBtnId: 'backBtnBubble',
                forwardBtnId: 'forwardBtnBubble'
            };
        case 'quick':
            return {
                inputId: 'quickInput',
                sortedVisId: 'quickSortedVis',
                outputId: 'quickOutput',
                statusId: 'statusQuick',
                stepId: 'stepQuick',
                pauseBtnId: 'pauseBtnQuick',
                backBtnId: 'backBtnQuick',
                forwardBtnId: 'forwardBtnQuick'
            };
        case 'merge':
            return {
                inputId: 'mergeInput',
                sortedVisId: 'mergeSortedVis',
                outputId: 'mergeOutput',
                statusId: 'statusMerge',
                stepId: 'stepMerge',
                pauseBtnId: 'pauseBtnMerge',
                backBtnId: 'backBtnMerge',
                forwardBtnId: 'forwardBtnMerge'
            };
        case 'insertion':
            return {
                inputId: 'insertionInput',
                sortedVisId: 'insertionSortedVis',
                outputId: 'insertionOutput',
                statusId: 'statusInsertion',
                stepId: 'stepInsertion',
                pauseBtnId: 'pauseBtnInsertion',
                backBtnId: 'backBtnInsertion',
                forwardBtnId: 'forwardBtnInsertion'
            };
        case 'selection':
            return {
                inputId: 'selectionInput',
                sortedVisId: 'selectionSortedVis',
                outputId: 'selectionOutput',
                statusId: 'statusSelection',
                stepId: 'stepSelection',
                pauseBtnId: 'pauseBtnSelection',
                backBtnId: 'backBtnSelection',
                forwardBtnId: 'forwardBtnSelection'
            };
        default:
            return {};
    }
}

function startSortAnimation(algorithm) {
    resetAnimation();
    const cfg = getConfig(algorithm);
    const numbers = animationState.original;
    if (numbers.length === 0) {
        setStatus('請先生成隨機數字。', cfg);
        return;
    }
    animationState.algorithm = algorithm;
    animationState.steps = getSortSteps(algorithm, numbers);
    animationState.currentStep = 0;
    renderStep();
    updateControls();
    startAnimation();
}

function scheduleNextStep() {
    if (!animationState.running || !animationState.algorithm) return;
    const cfg = getConfig(animationState.algorithm);
    let delay = getAnimationDelay(animationState.algorithm);
    animationState.intervalId = setTimeout(() => {
        if (!animationState.running) return;
        if (animationState.currentStep < animationState.steps.length - 1) {
            animationState.currentStep += 1;
            renderStep();
            updateControls();
            scheduleNextStep();
        } else {
            pauseAnimation();
            setStatus('排序完成。', cfg);
        }
    }, delay);
}

function startAnimation() {
    if (!animationState.algorithm || animationState.steps.length === 0) return;
    const cfg = getConfig(animationState.algorithm);
    if (animationState.intervalId) clearTimeout(animationState.intervalId);
    animationState.running = true;
    document.getElementById(cfg.pauseBtnId).innerText = '暫停';
    scheduleNextStep();
}

function pauseAnimation() {
    if (animationState.intervalId) {
        clearTimeout(animationState.intervalId);
        animationState.intervalId = null;
    }
    animationState.running = false;
    const cfg = getConfig(animationState.algorithm);
    if (cfg.pauseBtnId) {
        const btn = document.getElementById(cfg.pauseBtnId);
        if (btn) btn.innerText = '繼續';
    }
}

function togglePause() {
    if (!animationState.algorithm || animationState.steps.length === 0) return;
    if (animationState.running) {
        pauseAnimation();
    } else {
        startAnimation();
    }
}

function stepBack() {
    if (animationState.currentStep === 0) return;
    if (animationState.running) pauseAnimation();
    animationState.currentStep -= 1;
    renderStep();
    updateControls();
}

function stepForward() {
    if (!animationState.algorithm || animationState.currentStep >= animationState.steps.length - 1) return;
    if (animationState.running) pauseAnimation();
    animationState.currentStep += 1;
    renderStep();
    updateControls();
}

function resetAnimation() {
    if (animationState.intervalId) {
        clearTimeout(animationState.intervalId);
        animationState.intervalId = null;
    }
    animationState.running = false;
    animationState.steps = [];
    animationState.currentStep = 0;
    animationState.algorithm = null;
    // 不清空 animationState.original，保留用戶生成的隨機數字
}

function updateControls() {
    const cfg = getConfig(animationState.algorithm);
    if (!cfg || !cfg.pauseBtnId) return;
    const pauseBtn = document.getElementById(cfg.pauseBtnId);
    const backBtn = document.getElementById(cfg.backBtnId);
    const forwardBtn = document.getElementById(cfg.forwardBtnId);
    if (!pauseBtn || !backBtn || !forwardBtn) return;
    pauseBtn.disabled = animationState.steps.length === 0;
    backBtn.disabled = animationState.currentStep === 0;
    forwardBtn.disabled = animationState.steps.length === 0 || animationState.currentStep >= animationState.steps.length - 1;
}

function renderStep() {
    const cfg = getConfig(animationState.algorithm);
    if (!cfg || animationState.steps.length === 0) return;
    const step = animationState.steps[animationState.currentStep];
    drawBars(step.arr, cfg.sortedVisId, step.highlight);
    const statusText = `步驟 ${animationState.currentStep + 1} / ${animationState.steps.length}`;
    const stepEl = document.getElementById(cfg.stepId);
    if (stepEl) {
        stepEl.innerText = statusText;
        stepEl.classList.remove('hidden');
    }
    document.getElementById(cfg.outputId).innerText = `狀態：${step.desc}`;
}

function setStatus(text, cfg) {
    const stepEl = document.getElementById(cfg.stepId);
    if (stepEl) {
        stepEl.innerText = text;
        stepEl.classList.remove('hidden');
    }
}

function initializeStatus(algorithm) {
    const cfg = getConfig(algorithm);
    if (!cfg) return;
    const stepEl = document.getElementById(cfg.stepId);
    if (stepEl) stepEl.classList.add('hidden');
}

function getSortSteps(algorithm, arr) {
    switch (algorithm) {
        case 'bubble':
            return bubbleSortSteps(arr);
        case 'selection':
            return selectionSortSteps(arr);
        case 'quick':
            return quickSortSteps(arr);
        case 'merge':
            return mergeSortSteps(arr);
        case 'insertion':
            return insertionSortSteps(arr);
        default:
            return [];
    }
}

function bubbleSortSteps(arr) {
    const steps = [];
    const a = [...arr];
    steps.push({ arr: [...a], desc: '起始狀態' });
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - 1 - i; j++) {
            steps.push({ arr: [...a], desc: `比較第${j + 1}行與第${j + 2}行` , highlight: { compare: [j, j + 1] } });
            if (a[j] > a[j + 1]) {
                [a[j], a[j + 1]] = [a[j + 1], a[j]];
                swapped = true;
                steps.push({ arr: [...a], desc: `交換第${j + 1}行與第${j + 2}行` , highlight: { compare: [j, j + 1] } });
            }
        }
        if (!swapped) break;
    }
    steps.push({ arr: [...a], desc: '排序完成' });
    return steps;
}

function insertionSortSteps(arr) {
    const steps = [];
    const a = [...arr];
    steps.push({ arr: [...a], desc: '起始狀態' });
    for (let i = 1; i < a.length; i++) {
        const key = a[i];
        let j = i - 1;
        steps.push({ arr: [...a], desc: `取出第${i + 1}行的元素` , highlight: { compare: [i] } });
        while (j >= 0 && a[j] > key) {
            steps.push({ arr: [...a], desc: `比較第${j + 1}行與第${i + 1}行` , highlight: { compare: [j, i] } });
            a[j + 1] = a[j];
            steps.push({ arr: [...a], desc: `將第${j + 1}行的值向右移動` , highlight: { compare: [j, j + 1] } });
            j--;
        }
        a[j + 1] = key;
        steps.push({ arr: [...a], desc: `將元素插入第${j + 2}行` , highlight: { compare: [j + 1] } });
    }
    steps.push({ arr: [...a], desc: '排序完成' });
    return steps;
}

function selectionSortSteps(arr) {
    const steps = [];
    const a = [...arr];
    steps.push({ arr: [...a], desc: '起始狀態' });
    for (let i = 0; i < a.length - 1; i++) {
        let minIndex = i;
        steps.push({ arr: [...a], desc: `從第${i + 1}行開始尋找最小值` , highlight: { compare: [i] } });
        for (let j = i + 1; j < a.length; j++) {
            steps.push({ arr: [...a], desc: `比較第${j + 1}行與目前最小值位置` , highlight: { compare: [j, minIndex] } });
            if (a[j] < a[minIndex]) {
                minIndex = j;
                steps.push({ arr: [...a], desc: `更新最小值位置為第${minIndex + 1}行` , highlight: { compare: [minIndex] } });
            }
        }
        if (minIndex !== i) {
            [a[i], a[minIndex]] = [a[minIndex], a[i]];
            steps.push({ arr: [...a], desc: `交換第${i + 1}行與第${minIndex + 1}行` , highlight: { compare: [i, minIndex] } });
        }
    }
    steps.push({ arr: [...a], desc: '排序完成' });
    return steps;
}

function quickSortSteps(arr) {
    const steps = [];
    const a = [...arr];
    steps.push({ arr: [...a], desc: '起始狀態' });

    function quick(l, r) {
        if (l >= r) return;
        const pivot = a[r];
        let i = l;
        steps.push({ arr: [...a], desc: `選擇樞軸（第${r + 1}行）`, highlight: { pivot: r } });
        for (let j = l; j < r; j++) {
            steps.push({ arr: [...a], desc: `比較第${j + 1}行與樞軸（第${r + 1}行）`, highlight: { compare: [j], pivot: r } });
            if (a[j] < pivot) {
                [a[i], a[j]] = [a[j], a[i]];
                steps.push({ arr: [...a], desc: `交換第${j + 1}行與第${i + 1}行`, highlight: { compare: [i, j], pivot: r } });
                i += 1;
            }
        }
        [a[i], a[r]] = [a[r], a[i]];
        steps.push({ arr: [...a], desc: `樞軸放置到第${i + 1}行`, highlight: { pivot: i } });
        quick(l, i - 1);
        quick(i + 1, r);
    }

    quick(0, a.length - 1);
    steps.push({ arr: [...a], desc: '排序完成' });
    return steps;
}

function mergeSortSteps(arr) {
    const steps = [];
    const a = [...arr];
    steps.push({ arr: [...a], desc: '起始狀態' });

    function mergeSortRange(left, right) {
        if (left > right) return [];
        if (left === right) return [a[left]];
        const mid = Math.floor((left + right) / 2);
        const leftArr = mergeSortRange(left, mid);
        const rightArr = mergeSortRange(mid + 1, right);
        const merged = [];
        let i = 0;
        let j = 0;
        while (i < leftArr.length && j < rightArr.length) {
            if (leftArr[i] < rightArr[j]) merged.push(leftArr[i++]);
            else merged.push(rightArr[j++]);
        }
        while (i < leftArr.length) merged.push(leftArr[i++]);
        while (j < rightArr.length) merged.push(rightArr[j++]);
        for (let k = 0; k < merged.length; k++) {
            a[left + k] = merged[k];
        }
        const compareRange = Array.from({ length: right - left + 1 }, (_, idx) => left + idx);
        steps.push({ arr: [...a], desc: `合併第${left + 1}行到第${right + 1}行`, highlight: { merge: compareRange } });
        return merged;
    }

    mergeSortRange(0, a.length - 1);
    steps.push({ arr: [...a], desc: '排序完成' });
    return steps;
}

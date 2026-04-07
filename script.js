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
    const countInput = document.getElementById(algorithm + 'Count');
    const count = parseInt(countInput.value) || 10;
    const numbers = [];
    for (let i = 0; i < count; i++) {
        numbers.push(Math.floor(Math.random() * 100) + 1); // 1-100 的隨機數
    }
    // 將數字存儲在隱藏的地方供排序使用
    animationState.original = [...numbers];
    // 立即顯示初始狀態
    const config = getConfig(algorithm);
    drawBars(numbers, config.sortedVisId);
    document.getElementById(config.statusId).textContent = `已生成 ${count} 個隨機數字`;
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
}

function getConfig(algorithm) {
    switch (algorithm) {
        case 'bubble':
            return {
                inputId: 'inputNumbers',
                sortedVisId: 'bubbleSortedVis',
                outputId: 'output',
                statusId: 'statusBubble',
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

function startAnimation() {
    if (!animationState.algorithm || animationState.steps.length === 0) return;
    const cfg = getConfig(animationState.algorithm);
    if (animationState.intervalId) clearInterval(animationState.intervalId);
    animationState.running = true;
    document.getElementById(cfg.pauseBtnId).innerText = '暫停';
    animationState.intervalId = setInterval(() => {
        if (animationState.currentStep < animationState.steps.length - 1) {
            animationState.currentStep += 1;
            renderStep();
            updateControls();
        } else {
            pauseAnimation();
            setStatus('排序完成。', cfg);
        }
    }, getAnimationDelay(animationState.algorithm));
}

function pauseAnimation() {
    if (animationState.intervalId) {
        clearInterval(animationState.intervalId);
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
        clearInterval(animationState.intervalId);
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
    document.getElementById(cfg.statusId).innerText = statusText;
    document.getElementById(cfg.outputId).innerText = `狀態：${step.desc}  排列：${step.arr.join(' ')}`;
}

function setStatus(text, cfg) {
    const status = document.getElementById(cfg.statusId);
    if (status) status.innerText = text;
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
            steps.push({ arr: [...a], desc: `比較索引 ${j} 和 ${j + 1}` , highlight: { compare: [j, j + 1] } });
            if (a[j] > a[j + 1]) {
                [a[j], a[j + 1]] = [a[j + 1], a[j]];
                swapped = true;
                steps.push({ arr: [...a], desc: `交換 ${j} 和 ${j + 1}` , highlight: { compare: [j, j + 1] } });
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
        steps.push({ arr: [...a], desc: `取出索引 ${i} 的元素 ${key}` , highlight: { compare: [i] } });
        while (j >= 0 && a[j] > key) {
            steps.push({ arr: [...a], desc: `比較索引 ${j} 和 ${i}` , highlight: { compare: [j, i] } });
            a[j + 1] = a[j];
            steps.push({ arr: [...a], desc: `將索引 ${j} 的值向右移動` , highlight: { compare: [j, j + 1] } });
            j--;
        }
        a[j + 1] = key;
        steps.push({ arr: [...a], desc: `將元素 ${key} 插入索引 ${j + 1}` , highlight: { compare: [j + 1] } });
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
        steps.push({ arr: [...a], desc: `從索引 ${i} 開始尋找最小值` , highlight: { compare: [i] } });
        for (let j = i + 1; j < a.length; j++) {
            steps.push({ arr: [...a], desc: `比較索引 ${j} 和目前最小值 ${minIndex}` , highlight: { compare: [j, minIndex] } });
            if (a[j] < a[minIndex]) {
                minIndex = j;
                steps.push({ arr: [...a], desc: `更新最小值位置為 ${minIndex}` , highlight: { compare: [minIndex] } });
            }
        }
        if (minIndex !== i) {
            [a[i], a[minIndex]] = [a[minIndex], a[i]];
            steps.push({ arr: [...a], desc: `交換索引 ${i} 和 ${minIndex}` , highlight: { compare: [i, minIndex] } });
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
        steps.push({ arr: [...a], desc: `選擇樞軸 ${pivot}（索引 ${r}）`, highlight: { pivot: r } });
        for (let j = l; j < r; j++) {
            steps.push({ arr: [...a], desc: `比較索引 ${j} 和樞軸`, highlight: { compare: [j], pivot: r } });
            if (a[j] < pivot) {
                [a[i], a[j]] = [a[j], a[i]];
                steps.push({ arr: [...a], desc: `交換 ${j} 和 ${i}`, highlight: { compare: [i, j], pivot: r } });
                i += 1;
            }
        }
        [a[i], a[r]] = [a[r], a[i]];
        steps.push({ arr: [...a], desc: `樞軸放置到索引 ${i}`, highlight: { pivot: i } });
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
        steps.push({ arr: [...a], desc: `合併區間 ${left} 到 ${right}`, highlight: { merge: compareRange } });
        return merged;
    }

    mergeSortRange(0, a.length - 1);
    steps.push({ arr: [...a], desc: '排序完成' });
    return steps;
}

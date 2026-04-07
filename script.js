const animationState = {
    algorithm: null,
    steps: [],
    currentStep: 0,
    intervalId: null,
    running: false,
    original: []
};
const animationDelay = 700;

function drawBars(arr, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const max = Math.max(...arr, 1);
    arr.forEach(num => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = (num / max * 100) + 'px';
        bar.textContent = num;
        container.appendChild(bar);
    });
}

function getConfig(algorithm) {
    switch (algorithm) {
        case 'bubble':
            return {
                inputId: 'inputNumbers',
                initialVisId: 'bubbleInitialVis',
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
                initialVisId: 'quickInitialVis',
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
                initialVisId: 'mergeInitialVis',
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
                initialVisId: 'insertionInitialVis',
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
                initialVisId: 'selectionInitialVis',
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
    const input = document.getElementById(cfg.inputId).value;
    const numbers = input.split(' ').map(Number).filter(n => !isNaN(n));
    if (numbers.length === 0) {
        setStatus('請輸入有效的數字。', cfg);
        return;
    }
    animationState.algorithm = algorithm;
    animationState.original = [...numbers];
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
    }, animationDelay);
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
    animationState.original = [];
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
    drawBars(animationState.original, cfg.initialVisId);
    const step = animationState.steps[animationState.currentStep];
    drawBars(step.arr, cfg.sortedVisId);
    const statusText = `步驟 ${animationState.currentStep + 1} / ${animationState.steps.length}`;
    document.getElementById(cfg.statusId).innerText = statusText;
    document.getElementById(cfg.outputId).innerText = `狀態：${step.desc}\n陣列：${step.arr.join(' ')}`;
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
            steps.push({ arr: [...a], desc: `比較索引 ${j} 和 ${j + 1}` });
            if (a[j] > a[j + 1]) {
                [a[j], a[j + 1]] = [a[j + 1], a[j]];
                swapped = true;
                steps.push({ arr: [...a], desc: `交換 ${j} 和 ${j + 1}` });
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
        steps.push({ arr: [...a], desc: `取出索引 ${i} 的元素 ${key}` });
        while (j >= 0 && a[j] > key) {
            a[j + 1] = a[j];
            steps.push({ arr: [...a], desc: `將索引 ${j} 的值向右移動` });
            j--;
        }
        a[j + 1] = key;
        steps.push({ arr: [...a], desc: `將元素 ${key} 插入索引 ${j + 1}` });
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
        steps.push({ arr: [...a], desc: `從索引 ${i} 開始尋找最小值` });
        for (let j = i + 1; j < a.length; j++) {
            steps.push({ arr: [...a], desc: `比較索引 ${j} 和目前最小值 ${minIndex}` });
            if (a[j] < a[minIndex]) {
                minIndex = j;
                steps.push({ arr: [...a], desc: `更新最小值位置為 ${minIndex}` });
            }
        }
        if (minIndex !== i) {
            [a[i], a[minIndex]] = [a[minIndex], a[i]];
            steps.push({ arr: [...a], desc: `交換索引 ${i} 和 ${minIndex}` });
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
        steps.push({ arr: [...a], desc: `選擇樞軸 ${pivot}（索引 ${r}）` });
        for (let j = l; j < r; j++) {
            steps.push({ arr: [...a], desc: `比較索引 ${j} 和樞軸` });
            if (a[j] < pivot) {
                [a[i], a[j]] = [a[j], a[i]];
                steps.push({ arr: [...a], desc: `交換 ${j} 和 ${i}` });
                i += 1;
            }
        }
        [a[i], a[r]] = [a[r], a[i]];
        steps.push({ arr: [...a], desc: `樞軸放置到索引 ${i}` });
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
        steps.push({ arr: [...a], desc: `合併區間 ${left} 到 ${right}` });
        return merged;
    }

    mergeSortRange(0, a.length - 1);
    steps.push({ arr: [...a], desc: '排序完成' });
    return steps;
}

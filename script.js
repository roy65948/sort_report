function drawBars(arr, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const max = Math.max(...arr);
    arr.forEach(num => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = (num / max * 100) + 'px';
        bar.textContent = num;
        container.appendChild(bar);
    });
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');
}

function bubbleSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        if (!swapped) break;
    }
    return arr;
}

function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[arr.length - 1];
    const left = [];
    const right = [];
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] < pivot) left.push(arr[i]);
        else right.push(arr[i]);
    }
    return [...quickSort(left), pivot, ...quickSort(right)];
}

function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return merge(left, right);
}

function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] < right[j]) result.push(left[i++]);
        else result.push(right[j++]);
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
}

function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}

function sortNumbers(algorithm) {
    console.log('Starting sort for algorithm:', algorithm);
    let inputId, outputId, initialVisId, sortedVisId, sortFunc;
    switch (algorithm) {
        case 'bubble':
            inputId = 'inputNumbers';
            outputId = 'output';
            initialVisId = 'bubbleInitialVis';
            sortedVisId = 'bubbleSortedVis';
            sortFunc = bubbleSort;
            break;
        case 'quick':
            inputId = 'quickInput';
            outputId = 'quickOutput';
            initialVisId = 'quickInitialVis';
            sortedVisId = 'quickSortedVis';
            sortFunc = quickSort;
            break;
        case 'merge':
            inputId = 'mergeInput';
            outputId = 'mergeOutput';
            initialVisId = 'mergeInitialVis';
            sortedVisId = 'mergeSortedVis';
            sortFunc = mergeSort;
            break;
        case 'insertion':
            inputId = 'insertionInput';
            outputId = 'insertionOutput';
            initialVisId = 'insertionInitialVis';
            sortedVisId = 'insertionSortedVis';
            sortFunc = insertionSort;
            break;
        default:
            console.error('Unknown algorithm:', algorithm);
            return;
    }
    const input = document.getElementById(inputId).value;
    console.log('Input value:', input);
    const numbers = input.split(' ').map(Number).filter(n => !isNaN(n));
    console.log('Parsed numbers:', numbers);
    if (numbers.length === 0) {
        document.getElementById(outputId).innerText = '請輸入有效的數字。';
        console.log('No valid numbers entered');
        return;
    }
    drawBars(numbers, initialVisId);
    const sorted = sortFunc([...numbers]);
    console.log('Sorted result:', sorted);
    drawBars(sorted, sortedVisId);
    document.getElementById(outputId).innerText = '排序後: ' + sorted.join(' ');
}

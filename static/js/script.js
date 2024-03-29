let audioCtx = null;
let array=[];
const canvas = document.getElementById('visualizationCanvas');
const ctx = canvas.getContext('2d');
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
let animationId;

function init(n=null, valueRange=null) {
    if(n==null && valueRange==null){
        const arraySizeInput = document.getElementById('arraySize');
        n = parseInt(arraySizeInput.value);
        const valueRangeInput = document.getElementById('valueRange');
        valueRange = parseInt(valueRangeInput.value);
    }

    array = generateRandomArray(n, valueRange);
    showBars(array);
}

function generateRandomArray(size, range) {
    const newArray = [];
    for (let i = 0; i < size; i++) {
        newArray[i] = Math.floor(Math.random() * range);
    }
    return newArray;
}

function playNote(freq){
    if(audioCtx==null){
        audioCtx=new (AudioContext || webkitAudioContext || window.webkitAudioContext)();
    }

    const dur=0.1;
    const osc=audioCtx.createOscillator();
    osc.frequency.value=parseFloat(freq);
    osc.start();
    osc.stop(audioCtx.currentTime+dur);
    const node=audioCtx.createGain();
    node.gain.value=0.1;
    osc.connect(node);
    node.connect(audioCtx.destination);
    animationId = requestAnimationFrame(() => animate(moves));

}

function visualizeBubbleSort(copy){
    const moves = bubbleSort(copy);
    animate(moves);
    showBars(array);
}

function visualizeQuickSort(copy) {
    const moves=[];
    quickSort(copy, 0, copy.length - 1, moves);
    animate(moves);
    showBars(array);
}

function visualizeSorting(selectedAlgorithm=null) {
    const copy = [...array];
    
    if(selectedAlgorithm==null){
        selectedAlgorithm = document.getElementById('sortingAlgorithm').value;
    }

    if (selectedAlgorithm === 'bubbleSort') {
        visualizeBubbleSort(copy);
    } else if (selectedAlgorithm === 'quickSort') {
        visualizeQuickSort(copy);
    }

}

function animate(moves) {
    if (moves.length === 0) {
        showBars(array);
        return;
    }

    const move = moves.shift();
    const [i, j] = move.indices;
    if (move.type === 'swap') {
        [array[i], array[j]] = [array[j], array[i]];
    }

    playNote(200 + array[i] * 5);
    playNote(200 + array[j] * 5);
    showBars(array, move);
    // requestAnimationFrame(() => animate(moves));
    setTimeout(()=>animate(moves),200);

}

function bubbleSort(array) {
    const moves = [];

    do {
        var swapped = false;
        for (let i = 1; i < array.length; i++) {
            moves.push({ indices: [i - 1, i], type: 'comp' });

            if (array[i - 1] > array[i]) {
                [array[i - 1], array[i]] = [array[i], array[i - 1]];
                moves.push({ indices: [i - 1, i], type: 'swap' });
                swapped = true;
            }
        }
    } while (swapped);

    return moves;
}

function quickSort(array, low, high, moves) {
    if (low < high) {
        const pi = partition(array, low, high, moves);

        quickSort(array, low, pi - 1, moves);
        quickSort(array, pi + 1, high, moves);
    }
}

function partition(array, low, high, moves) {
    const pivot = array[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
        moves.push({ indices: [j, high], type: 'comp' });
        if (array[j] < pivot) {
            i++;
            [array[i], array[j]] = [array[j], array[i]];
            moves.push({ indices: [i, j], type: 'swap' });
        }
    }

    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    moves.push({ indices: [i + 1, high], type: 'swap' });

    return i + 1;
}


function showBars(array, move = null) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const maxValue = Math.max(...array);

    const barWidth = canvasWidth / array.length;
    const maxBarHeight = canvasHeight;

    for (let i = 0; i < array.length; i++) {
        const barHeight = array[i]/maxValue * maxBarHeight;
        const xPos = i * barWidth;
        const yPos = canvasHeight - barHeight;

        ctx.fillStyle = 'black';

        if (move && move.indices.includes(i)) {
            ctx.fillStyle = move.type === 'swap' ? 'red' : 'blue';
        }

        ctx.fillRect(xPos, yPos, barWidth, barHeight);
    }
}


function redirectToLogin(){
    window.location.href="/login";
}

function goToHomePage(){
    window.location.href="/main";
}

function redirectToRegister(){
    window.location.href="/register";
}

function saveParameters() {
    const arraySize = document.getElementById('arraySize').value;
    const valueRange = document.getElementById('valueRange').value;
    const sortingAlgorithm = document.getElementById('sortingAlgorithm').value;

    const parameters = {
        arraySize: arraySize,
        valueRange: valueRange,
        sortingAlgorithm: sortingAlgorithm
    };

    sessionStorage.setItem('sortingParameters', JSON.stringify(parameters));

    alert('Parametry zostały zapisane.');
}

function saveChoice() {
    const parametresSelect = document.getElementById('paramChoice');
    console.log(parametresSelect.value);

    if (parametresSelect.value === 'savedParams') {
        const dynamicParamsForm = document.getElementById('dynamicParamsForm');
        dynamicParamsForm.innerHTML='';
        const savedParameters = JSON.parse(sessionStorage.getItem('sortingParameters'));
        if(savedParameters){
            init(savedParameters.arraySize, savedParameters.valueRange);
            visualizeSorting(savedParameters.sortingAlgorithm);
        }
        else{
            alert('Brak zapisanych parametrów.');
        }
        
     
    } else {
        const dynamicForm = document.createElement('form');
        const dynamicParamsForm = document.getElementById('dynamicParamsForm');
        dynamicParamsForm.innerHTML='';
        
        dynamicForm.innerHTML = `
            <form id="sortingForm">
                <div class="form-group">
                    <label for="newArraySize">Nowy rozmiar tablicy:</label>
                    <input type="number" class="form-control" id="arraySize" min="10" max="100" value="10" required>
                </div>
                <div class="form-group">
                    <label for="newValueRange">Nowy zakres wartości:</label>
                    <input type="number" class="form-control" id="valueRange" min="20" max="50" value="20" required>
                </div>
                <div class="form-group">
                    <label for="sortingAlgorithm">Wybierz algorytm sortowania:</label>
                    <select class="form-control" id="sortingAlgorithm">
                        <option value="bubbleSort">Sortowanie bąbelkowe</option>
                        <option value="quickSort">Sortowanie szybkie</option>
                    </select>
                </div>
                <button type="button" class="btn btn-primary mb-2" onclick="init()">Start</button>
                <button type="button" class="btn btn-success" onclick="visualizeSorting()">Wizualizacja procesu sortowania</button>
                <button type="button" class="btn btn-info" onclick="saveParameters()">Zapisz parametry</button>
            </form>
        `;
        dynamicParamsForm.appendChild(dynamicForm);
    }
}

function stopAnimation(){
    location.reload();
}

document.addEventListener('DOMContentLoaded', function() {
    const savedParameters = JSON.parse(sessionStorage.getItem('sortingParameters'));
    console.log(window.location.pathname);
    if (savedParameters && window.location.pathname.includes('login-success')) {
        const message = `Zapisane parametry:\nRozmiar tablicy: ${savedParameters.arraySize}\nZakres wartości: ${savedParameters.valueRange}\nAlgorytm sortowania: ${savedParameters.sortingAlgorithm}`;
        alert(message);
    }
    else if (window.location.pathname.includes('login-success')) {
        alert('Brak zapisanych parametrów.');
    }
});





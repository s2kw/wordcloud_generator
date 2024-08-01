document.getElementById('generate-button').addEventListener('click', () => {
    const input = document.getElementById('word-input').value;
    const wordData = parseInput(input);
    const font = document.getElementById('font-select').value;
    const width = parseInt(document.getElementById('width-input').value);
    const height = parseInt(document.getElementById('height-input').value);
    const minSize = 10; // 最小サイズ
    const maxSize = 100; // 最大サイズ
    const horizontalOnly = document.getElementById('horizontal-only').checked;
    const scaledWordData = scaleSizes(wordData, minSize, maxSize);
    generateWordCloud(scaledWordData, font, width, height, horizontalOnly);
});

document.getElementById('download-button').addEventListener('click', downloadWordCloud);

function parseInput(input) {
    const lines = input.split('\n'); // 改行で分割
    return lines
        .map(line => line.trim().split(' ')) // スペースで分割
        .filter(parts => parts.length === 2 && !isNaN(parts[0]) && parts[1].trim() !== '') // フィルタリングして不正なデータを除去
        .map(parts => {
            return { text: parts[1].trim(), value: parseInt(parts[0].trim()) };
        });
}

function scaleSizes(words, minSize, maxSize) {
    const values = words.map(word => word.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    return words.map(word => {
        const scaledValue = ((word.value - minValue) / (maxValue - minValue)) * (maxSize - minSize) + minSize;
        return { text: word.text, value: scaledValue };
    });
}

function generateWordCloud(words, font, initialWidth, initialHeight, horizontalOnly) {
    let width = initialWidth;
    let height = initialHeight;
    let canvas = document.getElementById('word-cloud-canvas');
    const wordCloudContainer = document.getElementById('word-cloud');
    let fit = false;

    // Sort words by value descending
    words.sort((a, b) => b.value - a.value);

    while (!fit) {
        canvas.width = width;
        canvas.height = height;

        const wordArray = words.map(word => [word.text, word.value]);

        WordCloud(canvas, {
            list: wordArray,
            fontFamily: font,
            gridSize: Math.round(8 * width / 1024),
            weightFactor: function (size) {
                return size * width / 2048;
            },
            color: 'random-dark',
            backgroundColor: '#fff',
            rotateRatio: horizontalOnly ? 0 : 0.5,
            rotationSteps: 2,
            shape: 'circle',
            drawOutOfBound: false,
            shuffle: false, // No shuffle to maintain order
            origin: [width / 2, height / 2], // Central origin
            drawMask: false,
            minSize: 0, // Draw words of all sizes
        });

        const context = canvas.getContext('2d', { willReadFrequently: true });
        const imageData = context.getImageData(0, 0, width, height);
        const pixels = imageData.data;
        fit = Array.prototype.some.call(pixels, alpha => alpha !== 0);

        if (!fit) {
            width += 100;
            height += 100;
            canvas = document.createElement('canvas');
            canvas.id = 'word-cloud-canvas';
            wordCloudContainer.innerHTML = '';
            wordCloudContainer.appendChild(canvas);
        }
    }

    wordCloudContainer.innerHTML = '';
    wordCloudContainer.appendChild(canvas);
}

function downloadWordCloud() {
    const canvas = document.getElementById('word-cloud-canvas');
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'wordcloud.png';
    link.click();
}
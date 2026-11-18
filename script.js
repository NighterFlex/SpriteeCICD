const container = document.querySelector(".container");
const sizeElement = document.querySelector(".size");
const color = document.querySelector(".color-picker");
const resetButton = document.querySelector("#reset-btn");
const penBtn = document.querySelector("#pen-btn");
const eraserBtn = document.querySelector("#eraser-btn");
const downloadButton = document.querySelector("#download-btn");
const exportCanvas = document.querySelector("#export-canvas");

let currentTool = "pen";   //by defaultt
let draw = false;
let size = sizeElement.value;

function createGrid() {
    container.style.setProperty("--size", size);

    for(let i=0; i < size * size; i++){
        const div = document.createElement("div");
        div.classList.add("box");

        div.addEventListener("mouseover", () => onMouseOver(div));
        div.addEventListener("mousedown", () => onMouseDown(div));

        container.appendChild(div);
}
}

createGrid();   

function drawPixel(div){
    if(currentTool === "pen"){
        div.style.backgroundColor = color.value;
    }
    else if(currentTool === "eraser"){
        div.style.backgroundColor = "white";
    }
}



function onMouseOver(div) {
    if(!draw)
        return;
    drawPixel(div);
}
function onMouseDown(div) {
    drawPixel(div);
}

window.addEventListener("mousedown", function(){
    draw = true;
});

window.addEventListener("mouseup", function() {
    draw = false;
});

function reset(){
    container.innerHTML = "";
    createGrid();
}

resetButton.addEventListener("click", reset);

sizeElement.addEventListener("keyup", function(){
    size = sizeElement.value;
    reset();
});

penBtn.addEventListener("click", function() {
    currentTool = "pen";
    penBtn.classList.add("active");
    eraserBtn.classList.remove("active");
});

eraserBtn.addEventListener("click", function(){
    currentTool = "eraser";
    eraserBtn.classList.add("active");
    penBtn.classList.remove("active");
});

downloadButton.addEventListener("click", function() {
    const pixels = Array.from(container.querySelectorAll(".box"));
    const gridSize = Math.sqrt(pixels.length);

    if (!Number.isInteger(gridSize) || gridSize === 0) {
        alert("There is no artwork to download.");
        return;
    }

    const pixelScale = 16;
    exportCanvas.width = gridSize * pixelScale;
    exportCanvas.height = gridSize * pixelScale;

    const context = exportCanvas.getContext("2d");
    if (!context) {
        alert("Your browser could not prepare the artwork for download.");
        return;
    }

    pixels.forEach((pixel, index) => {
        context.fillStyle = getComputedStyle(pixel).backgroundColor;
        context.fillRect(
            (index % gridSize) * pixelScale,
            Math.floor(index / gridSize) * pixelScale,
            pixelScale,
            pixelScale
        );
    });

    exportCanvas.toBlob(function(blob) {
        if (!blob) {
            alert("Your browser could not create the PNG download.");
            return;
        }

        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "spritee-artwork.png";
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    }, "image/png");
});

// sizeElement.addEventListener("change", function()
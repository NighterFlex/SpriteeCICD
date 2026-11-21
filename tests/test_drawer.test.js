const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "..");
const drawScript = fs.readFileSync(path.join(root, "script.js"), "utf8");

function createDrawingPage() {
    const dom = new JSDOM(
        `<!doctype html>
        <canvas id="export-canvas"></canvas>
        <button id="pen-btn"></button>
        <button id="eraser-btn"></button>
        <button id="reset-btn"></button>
        <button id="download-btn"></button>
        <input class="color-picker" type="color" value="#ff0000">
        <input class="size" type="number" value="3">
        <div class="container"></div>`,
        { runScripts: "outside-only", url: "http://localhost/draw.html" }
    );
    dom.window.eval(drawScript);
    return dom;
}

test("creates a grid using the selected size", (t) => {
    const dom = createDrawingPage();
    t.after(() => dom.window.close());

    assert.equal(dom.window.document.querySelectorAll(".box").length, 9);
    assert.equal(dom.window.document.querySelector(".container").style.getPropertyValue("--size"), "3");
});

test("pen paints a pixel with the selected color", (t) => {
    const dom = createDrawingPage();
    t.after(() => dom.window.close());
    const pixel = dom.window.document.querySelector(".box");

    pixel.dispatchEvent(new dom.window.MouseEvent("mousedown", { bubbles: true }));

    assert.equal(pixel.style.backgroundColor, "rgb(255, 0, 0)");
});

test("dragging paints pixels only while the mouse is held", (t) => {
    const dom = createDrawingPage();
    t.after(() => dom.window.close());
    const [first, second] = dom.window.document.querySelectorAll(".box");

    dom.window.dispatchEvent(new dom.window.MouseEvent("mousedown"));
    first.dispatchEvent(new dom.window.MouseEvent("mouseover"));
    dom.window.dispatchEvent(new dom.window.MouseEvent("mouseup"));
    second.dispatchEvent(new dom.window.MouseEvent("mouseover"));

    assert.equal(first.style.backgroundColor, "rgb(255, 0, 0)");
    assert.equal(second.style.backgroundColor, "");
});

test("eraser paints pixels white", (t) => {
    const dom = createDrawingPage();
    t.after(() => dom.window.close());
    const pixel = dom.window.document.querySelector(".box");
    const { document } = dom.window;

    pixel.dispatchEvent(new dom.window.MouseEvent("mousedown", { bubbles: true }));
    document.querySelector("#eraser-btn").click();
    pixel.dispatchEvent(new dom.window.MouseEvent("mousedown", { bubbles: true }));

    assert.equal(pixel.style.backgroundColor, "white");
    assert.equal(document.querySelector("#eraser-btn").classList.contains("active"), true);
    assert.equal(document.querySelector("#pen-btn").classList.contains("active"), false);
});

test("reset clears artwork and resizing rebuilds the grid", (t) => {
    const dom = createDrawingPage();
    t.after(() => dom.window.close());
    const { document } = dom.window;

    document.querySelector(".box").style.backgroundColor = "red";
    document.querySelector("#reset-btn").click();
    assert.equal(document.querySelectorAll(".box").length, 9);
    assert.equal(document.querySelector(".box").style.backgroundColor, "");

    const size = document.querySelector(".size");
    size.value = "2";
    size.dispatchEvent(new dom.window.KeyboardEvent("keyup", { bubbles: true }));

    assert.equal(document.querySelectorAll(".box").length, 4);
    assert.equal(document.querySelector(".container").style.getPropertyValue("--size"), "2");
});

test("download exports each grid pixel to a PNG-sized canvas", (t) => {
    const dom = createDrawingPage();
    t.after(() => dom.window.close());
    const { document } = dom.window;
    const fills = [];
    let download;
    const context = {
        fillStyle: "",
        fillRect(...args) {
            fills.push({ color: this.fillStyle, args });
        },
    };
    const canvas = document.querySelector("#export-canvas");
    canvas.getContext = () => context;
    canvas.toBlob = (callback) => callback(new dom.window.Blob(["png"], { type: "image/png" }));
    dom.window.URL.createObjectURL = () => "blob:http://localhost/artwork";
    dom.window.URL.revokeObjectURL = () => {};
    dom.window.HTMLAnchorElement.prototype.click = function () {
        download = { href: this.href, filename: this.download };
    };

    document.querySelector(".box").style.backgroundColor = "red";
    document.querySelector("#download-btn").click();

    assert.equal(canvas.width, 48);
    assert.equal(canvas.height, 48);
    assert.equal(fills.length, 9);
    assert.equal(fills[0].color, "rgb(255, 0, 0)");
    assert.deepEqual(fills[0].args, [0, 0, 16, 16]);
    assert.equal(download.filename, "spritee-artwork.png");
    assert.equal(download.href, "blob:http://localhost/artwork");
});

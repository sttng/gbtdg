window.onload = function() {
    width = 8;
    height = 8;
    square_width = document.getElementById("demo_canvas").width / (width);
    square_height = document.getElementById("demo_canvas").height / (height);

    colors = new Array("#e0f8cf", "#86c06c", "#306850", "#071821");

    var canvas = document.getElementById("demo_canvas");

    button = document.getElementById("submit_button");
    data = document.getElementById("tile_data")

    button.addEventListener("click", function(evt){
        refresh(canvas, data.value);
    }, false);

    var bytes = "FF 00 7E FF 85 81 89 83 93 85 A5 8B C9 97 7E FF";
    refresh(canvas, bytes);
}

function refresh(canvas, rawBytes) {
    ByteArr = splitter(rawBytes);
    i = 0;
    for (const pixelBytes of ByteArr){
        i = i+1;
        setTimeout(function(){
            pixels = decode(pixelBytes);
            console.log(pixels);
            if (pixels) {
                paint(canvas, pixels);
                data.removeAttribute("style");
            } else {
                data.style.backgroundColor = "red";
            }
        }, i * 2000);
    }
}

function splitter(rawBytes) {
    var bytes = rawBytes.replace(/\$|,|DB |,|0x| /g, "");
    var bytes2 = bytes.replace(/[\r\n]+/g, "");
    console.log(bytes2.length);
    if (bytes2.length % 32 != 0) return false;
    
    var rawBytesArr = bytes.split("\n");
    console.log(rawBytesArr);
    return rawBytesArr;
}

function decode(rawBytes) {
    var bytes = rawBytes.replace(/\$|,|DB |,|0x| /g, "");
    bytes = bytes.replace(/[\r\n]+/g, "");
    if (bytes.length % 32 != 0) return false;
    
    var byteArray = new Array(16);
    for (var i = 0; i < byteArray.length; i++) {
        byteArray[i] = parseInt(bytes.substr(i*2, 2), 16);
    }

    var pixels = new Array(width*height);
    for (var j = 0; j < height; j++) {
        for (var i = 0; i < width; i++) {
            var hiBit = (byteArray[j*2 + 1] >> (7-i)) & 1;
            var loBit = (byteArray[j*2] >> (7-i)) & 1;
            pixels[j*width + i] = (hiBit << 1) | loBit;
        }
    }
    return pixels;
}

function paint(canvas, pixels) {
    var ctx = document.getElementById("demo_canvas").getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            ctx.fillStyle = colors[pixels[j*width + i]];
            ctx.fillRect(i*square_width, j*square_height, square_width, square_height);
        }
    }
}

function createCanvas(div_id, canvas_name) {
    var canvas = document.createElement(canvas_name);
    div = document.getElementById(div_id); 
    canvas.id     = canvas_name;
    canvas.width  = 120;
    canvas.height = 120;
    canvas.style.zIndex   = 8;
    canvas.style.position = "absolute";
    canvas.style.border   = "1px solid";
    div.appendChild(canvas)
}

let tiles;

const handleDragOver = function(e) {
  e.stopPropagation();
  e.preventDefault();

  if (e.target.classList.contains("square")) {
    e.target.classList.add("hover");
  }
};

const handleDragLeave = function(e) {
  if (e.target.classList.contains("square")) {
    e.target.classList.remove("hover");
  }
};

const handleDrop = function(e) {
  e.stopPropagation();
  e.preventDefault();

  e.target.classList.remove("hover");

  if (e.target.classList.contains("square")) {
    let file = e.dataTransfer.files[0];

    if (!file || !file.type.match("image")) {
      return;
    }
    
    handleFileLoad(file);

  }
};

const handleMouseDown = function(e) {
  if (e.target.classList.contains("square") && e.target.dataset.imgUrl) {
    let img = new Image();
    img.onload = function() {
      this.onload = null;
    };
    img.src = e.target.dataset.imgUrl;
  } else {
  }
};

const handleOnClick = function(e) {
  document.querySelector("#input").click();
}

function handleFiles() {
  const fileList = this.files; /* now you can work with the file list */
  const file = fileList[0];
  handleFileLoad(file);
}

const handleFileLoad = function(file) {
  const img = new Image();
  
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  
  const heatmap = document.querySelector("#heatmap");
  
  const grid = document.querySelector("#grid");
  
  const reader = new FileReader();
  
  reader.onload = function() {
    // file load
    img.onload = function() {
      // image load
      // console.log(img);

      
      canvas.width = Math.max(256, img.width);
      canvas.height = Math.max(256, img.height);
      canvas.style.width = Math.max(256, img.width) * 2;
      canvas.style.height = Math.max(256, img.height) * 2;

      heatmap.width = Math.max(256, img.width);
      heatmap.height = Math.max(256, img.height);
      heatmap.style.width = Math.max(256, img.width) * 2;
      heatmap.style.height = Math.max(256, img.height) * 2;

      grid.width = Math.max(256, img.width) * 2;
      grid.height = Math.max(256, img.height) * 2;
      grid.style.width = Math.max(256, img.width) * 2;
      grid.style.height = Math.max(256, img.height) * 2;
      initGrid();
      
      ctx.fillStyle = "#e0f8cf";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      this.onload = null;

      // console.log(canvas.width, canvas.height);
      // console.log(img.width, img.height);
      // console.log(grid.width, grid.height);
      // console.log("--------");
      
      tiles = {};
      let uuid = 0;
      for (let y = 0; y < img.height; y += 8) {
        for (let x = 0; x < img.width; x += 8) {
          // console.log(x, y);
          const tileData = ctx.getImageData(x, y, 8, 8);
          const index = tileData.data.toString();
          if (tiles[index]) {
            tiles[index].coords.push({ x: x, y: y });
            tiles[index].times++;
          } else {
            tiles[index] = {
              uuid: uuid++,
              coords: [{ x: x, y: y }],
              times: 1,
              tileData: tileData
            };
          }
        }
      }
      
      const uniqueTiles = Object.values(tiles).length;
      document.querySelector("#unique-tiles").value = uniqueTiles;
      document.querySelector("#width").value = img.width;
      document.querySelector("#height").value = img.height;

      document.querySelector('#tiles').innerHTML = "";
      Object.values(tiles).map((t, i) => {
        var tileCanvas = document.createElement("canvas");
        tileCanvas.width = 8;
        tileCanvas.height = 8;
        tileCanvas.setAttribute("data-index", t.uuid);
        var tileCtx = tileCanvas.getContext("2d");
        tileCtx.putImageData(t.tileData, 0, 0);
        document.querySelector('#tiles')
          .appendChild(document.createElement("span"))
          .appendChild(tileCanvas);
      });
      
      refreshHeatmap();
      
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

const initGrid = function() {
  const grid = document.querySelector("#grid");
  const ctx = grid.getContext("2d");
  ctx.strokeStyle = "#00f";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let x = 0; x < grid.width; x += 16) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, grid.height);
  }
  for (let y = 0; y < grid.height; y += 16) {
    ctx.moveTo(0, y);
    ctx.lineTo(grid.width, y);
  }
  ctx.stroke();
};

const handleHeatmapCheckboxChange = function(e) {
  const heatmap = document.querySelector("#heatmap");
  const checked = e.target.checked;
  if (checked) {
    heatmap.style.visibility = "visible";
  } else {
    heatmap.style.visibility = "hidden";
  }
};

const handleTileClick = function(e) {
  const index = e.target.getAttribute("data-index");
  const targetParent = e.target.parentNode;
  
  if (targetParent.getAttribute("data-selected") === "true") {
    targetParent.removeAttribute("data-selected");
  } else {
    const selectedElem = document.querySelector("[data-selected='true']");
    if (selectedElem) {
      selectedElem.removeAttribute("data-selected");
    }
    targetParent.setAttribute("data-selected", "true");
  }

  refreshHeatmap();
};

const refreshHeatmap = function() {
  const heatmap = document.querySelector("#heatmap");
  const heatmapCtx = heatmap.getContext("2d");

  let selectedTile;
  const selectedElem = document.querySelector("[data-selected='true']");
  if (selectedElem) {
    selectedTile = selectedElem.querySelector("canvas").getAttribute("data-index");
  }
  
  heatmapCtx.clearRect(0, 0, heatmap.width, heatmap.height);
  Object.values(tiles).map((t) => {
    // Fill the heatmap
    t.coords.forEach((c, i) => {
      const fillStyle = `rgba(255, 0, 0, ${1/t.times})`;
      heatmapCtx.fillStyle = fillStyle;
      heatmapCtx.fillRect(c.x, c.y, 8, 8);
      if (t.uuid === selectedTile) {
        heatmapCtx.fillStyle = "blue";
        heatmapCtx.fillRect(c.x, c.y, 8, 8);
      }
    });
  })     
}

let canvas = {
  init: function() {
    const root = document.querySelector("#canvas");
    root.addEventListener("dragover", handleDragOver, false);
    root.addEventListener("dragleave", handleDragLeave, false);
    root.addEventListener("drop", handleDrop, false);
    root.addEventListener("mousedown", handleMouseDown, false);
    root.addEventListener("click", handleOnClick, false);
    
    const inputElement = document.querySelector("#input");
    inputElement.addEventListener("change", handleFiles, false);

    const heatmapCheckBox = document.querySelector("#tile-heatmap");
    heatmapCheckBox.addEventListener("change", handleHeatmapCheckboxChange, false);

    const tiles = document.querySelector("#tiles");
    tiles.addEventListener("click", handleTileClick, false);
    
    initGrid();
  }
};

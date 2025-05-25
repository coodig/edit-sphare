const fabricCanvas = new fabric.Canvas('canvas', {
  preserveObjectStacking: true,
  selection: false
});

let cropper = null;
let originalImage = null;
let undoStack = [];
let redoStack = [];

document.getElementById('upload-image').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    fabric.Image.fromURL(event.target.result, function (img) {
      fabricCanvas.clear();
      fabricCanvas.setWidth(img.width > 800 ? 800 : img.width);
      fabricCanvas.setHeight(img.height > 600 ? 600 : img.height);
      img.set({
        selectable: false,
        evented: false
      });
      fabricCanvas.add(img);
      originalImage = img;
      saveState();
    });
  };
  reader.readAsDataURL(file);
});


document.getElementById('btn-save').addEventListener('click', () => {
  const dataURL = fabricCanvas.toDataURL({
    format: 'png',
    quality: 1
  });
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'edited-image.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// // Undo
// document.getElementById('btn-undo').addEventListener('click', () => {
//   if (undoStack.length > 1) {
//     redoStack.push(undoStack.pop());
//     const content = undoStack[undoStack.length - 1];
//     fabricCanvas.loadFromJSON(content, () => {
//       fabricCanvas.renderAll();
//     });
//   }
// });


// function saveState() {
//   redoStack = [];
//   const json = fabricCanvas.toJSON();
//   undoStack.push(json);
//   if (undoStack.length > 20) undoStack.shift(); // optional: limit history
// }


fabric.Image.fromURL('your_image_url', function(img) {
  fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas), {
    scaleX: fabricCanvas.width / img.width,
    scaleY: fabricCanvas.height / img.height
  });

  saveState(); 
});



document.getElementById('btn-crop').addEventListener('click', function () {
  const imageURL = fabricCanvas.toDataURL({
    format: 'png',
    quality: 1
  });

  const cropImg = document.getElementById('crop-image');
  cropImg.src = imageURL;
  cropImg.style.display = 'block';

  cropper = new Cropper(cropImg, {
    viewMode: 1,
    autoCropArea: 1
  });

  document.getElementById('canvas').style.display = 'none';
  document.getElementById('btn-apply-crop').classList.remove('hidden');
  document.getElementById('btn-cancel-crop').classList.remove('hidden');
});

document.getElementById('btn-apply-crop').addEventListener('click', function () {
  if (!cropper) return;

  const canvasData = cropper.getCroppedCanvas();

  fabric.Image.fromURL(canvasData.toDataURL(), function (img) {
    fabricCanvas.clear();
    fabricCanvas.setWidth(img.width);
    fabricCanvas.setHeight(img.height);
    img.set({
      selectable: false,
      evented: false
    });
    fabricCanvas.add(img);
    fabricCanvas.renderAll();

    cropper.destroy();
    cropper = null;

    document.getElementById('crop-image').style.display = 'none';
    document.getElementById('canvas').style.display = 'block';
    document.getElementById('btn-apply-crop').classList.add('hidden');
    document.getElementById('btn-cancel-crop').classList.add('hidden');

    saveState();
  });
});

document.getElementById('btn-cancel-crop').addEventListener('click', function () {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  document.getElementById('crop-image').style.display = 'none';
  document.getElementById('canvas').style.display = 'block';
  document.getElementById('btn-apply-crop').classList.add('hidden');
  document.getElementById('btn-cancel-crop').classList.add('hidden');
});

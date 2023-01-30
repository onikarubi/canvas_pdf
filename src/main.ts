
function drawBox() {
  const canvas = document.querySelector('canvas');
  canvas.width = 800;
  canvas.height = 600;

  const context = canvas.getContext('2d');
  context.strokeStyle = 'blue';

  let rect = { x: 0, y: 0, w: 0, h: 0 };
  let historyRects = [];
  let removeRects = [];

  let isMouseDown = false;
  let isControlKeyDown = false;

  canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    rect.x = e.offsetX;
    rect.y = e.offsetY;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isMouseDown) { return; }
    rect.w = e.offsetX - rect.x;
    rect.h = e.offsetY - rect.y;
    requestAnimationFrame(draw);
  });

  canvas.addEventListener('mouseup', (e) => {
    isMouseDown = false;
    historyRects.push({ ...rect });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      if (!(historyRects.length < 1)) {
        removeRects.push(historyRects.pop());
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      drawRectsFromHistory();
    }

    if (e.key === 'Meta' || e.key === 'Control') {
      isControlKeyDown = true;
    }

    if (isControlKeyDown) {
      if (e.key == 'z') {
        drawRestoreRect();
      }
    }
  })

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Meta' || e.key === 'Control') {
      isControlKeyDown = false;
    }
  })

  function drawRectsFromHistory() {
    if (historyRects.length < 1) {
      return
    }

    for (const rect of historyRects) {
      context.strokeRect(rect.x, rect.y, rect.w, rect.h)
    }
  }

  function drawRestoreRect() {
    if (removeRects.length < 1) {
      return
    }

    const restoreRect = removeRects.pop();
    context.strokeRect(restoreRect.x, restoreRect.y, restoreRect.w, restoreRect.h);
    historyRects.push({ ...restoreRect });
  }

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawRectsFromHistory();
    context.strokeRect(rect.x, rect.y, rect.w, rect.h);
  }
}
drawBox()

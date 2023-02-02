const canvas: HTMLCanvasElement = document.querySelector('canvas');
const defaultCanvasWidth = 800;
const defaultCanvasHeight = 600;

type RectangleCoordinate = {
  x: number,
  y: number,
  w: number,
  h: number
}

class Rectangle {
  private color: string;
  public x: number;
  public y: number;
  public w: number;
  public h: number;

  constructor(x: number = 0, y: number = 0, w: number = 0, h: number = 0, color: string = "blue") {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
  }

  public get strokeColor() : string {
    return this.color;
  }

  public get getCoordinate() : RectangleCoordinate {
    return this.getCoordinate;
  }

  public set changeColor(color: string) {
    this.color = color;
  }

  public drawRect(canvas: HTMLCanvasElement): void {
    const context = canvas.getContext('2d');
    context.strokeStyle = this.color;
    context.strokeRect(this.x, this.y, this.w, this.h);
  }
}

class CanvasEventHandler {
  private mouseDown: boolean;
  private mouseMove: boolean;
  private mouseUp: boolean;
  private metaKeyDown: boolean;
  private zKeyDown: boolean;
  private canvasElement: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvasElement = canvas;
    this.context = canvas.getContext('2d');
    this.mouseDown = false;
    this.mouseMove = false;
    this.mouseUp = false;
    this.metaKeyDown = false;
    this.zKeyDown = false;
  }

  public mouseEventDown(rectangle: Rectangle): void {
    this.canvasElement.addEventListener('mousedown', (event: MouseEvent) => {
      this.mouseDown = true;
      rectangle.x = event.offsetX;
      rectangle.y = event.offsetY;
      rectangle.drawRect(this.canvasElement);
    });
  }

  public mouseEventMove(rectangle: Rectangle, histories: Array<Rectangle>): void {
    this.canvasElement.addEventListener('mousemove', (event: MouseEvent) => {
      if (!this.mouseDown) {
        return
      }

      this.mouseMove = true;
      rectangle.w = event.offsetX - rectangle.x;
      rectangle.h = event.offsetY - rectangle.y;
      this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
      rectangle.drawRect(this.canvasElement);

      if (histories.length < 1) {
        return;
      }
      for (const array of histories) {
        array.drawRect(this.canvasElement);
      }
    });
  }

  public mouseEventUp(rectangle: Rectangle, histories: Array<Rectangle>): void {
    this.canvasElement.addEventListener('mouseup', () => {
      histories.push(new Rectangle(rectangle.x, rectangle.y, rectangle.w, rectangle.h));

      this.mouseDown = false;
      rectangle.x = 0;
      rectangle.y = 0;
      rectangle.w = 0;
      rectangle.h = 0;
    });
  }

  public keyDownControl(historyRects: Array<Rectangle>, removeRects: Array<Rectangle>): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Meta') {
        this.metaKeyDown = true;
      } else if (this.metaKeyDown && e.key === 'z') {
        if (removeRects.length < 1) {
          return;
        }

        const historyRect: Rectangle = removeRects.pop();
        historyRects.push(new Rectangle(historyRect.x, historyRect.y, historyRect.w, historyRect.h))
        this.zKeyDown = true;
        this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        for (const rect of historyRects) {
          this.context.strokeRect(rect.x, rect.y, rect.w, rect.h)
        }

      } else if (e.key === 'Backspace') {
        if (historyRects.length < 1) {
          return;
        }

        const removeRect: Rectangle = historyRects.pop();
        removeRects.push(new Rectangle(removeRect.x, removeRect.y, removeRect.w, removeRect.h));
        this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        for (const rect of historyRects) {
          this.context.strokeRect(rect.x, rect.y, rect.w, rect.h)
        }
      }
    })
  }

  public keyUpControl = () => {
    window.addEventListener('keyup', (e) => {
      if (!(e.key === 'Meta' || e.key === 'z')) {
        return
      }

      if (e.key === 'Meta') {
        this.metaKeyDown = false;

      } else if (e.key === 'z') {
        this.zKeyDown = false;
      }
    });
  }

  public isMouseDown(): boolean {
    return this.mouseDown;
  }

  public changeFlagIsMouseDown(setBool: boolean): void {
    this.mouseDown = setBool;
  }

  public isMouseMove() : boolean {
    return this.mouseMove;
  }

  public changeFlagIsMouseMove(setBool: boolean): void {
    this.mouseMove = setBool;
  }

  public isMouseUp(): boolean {
    return this.mouseUp;
  }

  public changeFlagIsMouseUp(setBool: boolean): void {
    this.mouseUp = setBool;
  }

  public isMetaKeyDown(): boolean {
    return this.metaKeyDown;
  }

  public changeFlagMetaKeyDown(setBool: boolean): void {
    this.metaKeyDown = setBool;
  }

  public isZKeyDown(): boolean {
    return this.zKeyDown;
  }

  public changeFlagIsZKeyDown(setBool: boolean): void {
    this.zKeyDown = setBool;
  }
}

class DrawCanvas {
  private readonly canvasWidth: number;
  private readonly canvasHeight: number;
  private readonly eventHandler: CanvasEventHandler
  private readonly historyRects: Array<Rectangle>
  private readonly removeRects: Array<Rectangle>
  private rectangle: Rectangle
  private canvas: HTMLCanvasElement;

  constructor(width: number = defaultCanvasWidth, height: number = defaultCanvasHeight) {
    if (width < defaultCanvasWidth || height < defaultCanvasHeight) {
      throw new Error(`content: width < ${defaultCanvasWidth} || height < ${defaultCanvasHeight}`);
    }

    this.canvasWidth = width;
    this.canvasHeight = height;
    this.canvas = canvas;
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.eventHandler = new CanvasEventHandler(canvas);
    this.rectangle = new Rectangle();
    this.historyRects = [];
    this.removeRects = [];

    requestAnimationFrame(() => {
      this.eventHandler.mouseEventDown(this.rectangle);
      this.eventHandler.mouseEventMove(this.rectangle, this.historyRects);
      this.eventHandler.mouseEventUp(this.rectangle, this.historyRects);
      this.eventHandler.keyDownControl(this.historyRects, this.removeRects);
      this.eventHandler.keyUpControl();
    })
  }
}

export default DrawCanvas;



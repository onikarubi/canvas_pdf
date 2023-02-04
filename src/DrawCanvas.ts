const canvas: HTMLCanvasElement = document.querySelector('canvas');
const defaultCanvasWidth = 800;
const defaultCanvasHeight = 600;

class Rectangle {
  private color: string;
  private x: number;
  private y: number;
  private w: number;
  private h: number;

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

  public set changeColor(color: string) {
    this.color = color;
  }

  public drawRect(context: CanvasRenderingContext2D): void {
    context.strokeStyle = this.color;
    context.strokeRect(this.x, this.y, this.w, this.h);
  }

  public getCoordinateFromMousePosition(event: MouseEvent, isMouseMove: boolean): void {
    if (!isMouseMove) {
      this.x = event.offsetX;
      this.y = event.offsetY;
      return;
    }

    this.w = event.offsetX - this.x;
    this.h = event.offsetY - this.y;
  }

  public initializeCoordinates(): void {
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
  }

  public get getXCoordinate() : number {
    return this.x;
  }
  public get getYCoordinate() : number {
    return this.y;
  }
  public get getWidthCoordinate() : number {
    return this.w;
  }
  public get getHeightCoordinate() : number {
    return this.h;
  }
}

class CanvasEventHandler {
  private mouseDown: boolean;
  private mouseMove: boolean;
  private metaKeyDown: boolean;
  private canvasElement: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvasElement = canvas;
    this.context = canvas.getContext('2d');
    this.mouseDown = false;
    this.mouseMove = false;
    this.metaKeyDown = false;
  }

  private drawAllRectangleFromHistory(histories: Array<Rectangle>) : void {
    if (histories.length < 1) {
      return;
    }

    histories.forEach(rectangle => {
      rectangle.drawRect(this.context);
    });
  }

  // 履歴データの更新(追加履歴、 削除履歴)
  private enqueueFromHistoryToStackAnotherArray(enqueueRects: Array<Rectangle>, stackRects: Array<Rectangle>) : void {
    if (enqueueRects.length < 1) {
      return;
    }

    const enqueueRect: Rectangle = enqueueRects.pop();
    stackRects.push(new Rectangle(enqueueRect.getXCoordinate, enqueueRect.getYCoordinate, enqueueRect.getWidthCoordinate, enqueueRect.getHeightCoordinate));
  }

  public mouseEventDown(rectangle: Rectangle): void {
    this.canvasElement.addEventListener('mousedown', (event: MouseEvent) => {
      this.mouseDown = true;
      rectangle.getCoordinateFromMousePosition(event, this.mouseMove);
      rectangle.drawRect(this.context);
    });
  }

  public mouseEventMove(rectangle: Rectangle, histories: Array<Rectangle>): void {
    this.canvasElement.addEventListener('mousemove', (event: MouseEvent) => {
      if (!this.mouseDown) {
        return
      }

      this.mouseMove = true;
      rectangle.getCoordinateFromMousePosition(event, this.mouseMove);
      this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
      rectangle.drawRect(this.context);
      this.drawAllRectangleFromHistory(histories);
    });
  }

  public mouseEventUp(rectangle: Rectangle, histories: Array<Rectangle>): void {
    this.canvasElement.addEventListener('mouseup', () => {
      histories.push(new Rectangle(rectangle.getXCoordinate, rectangle.getYCoordinate, rectangle.getWidthCoordinate, rectangle.getHeightCoordinate));

      this.mouseDown = false;
      this.mouseMove = false;
      rectangle.initializeCoordinates();
    });
  }

  public keyControlFromDown(historyRects: Array<Rectangle>, removeRects: Array<Rectangle>): void {
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      const keyName = event.key;

      if (keyName === 'Meta' || keyName === 'Control') {
        this.metaKeyDown = true;
      }

      if (keyName === 'Backspace') {
        this.enqueueFromHistoryToStackAnotherArray(historyRects, removeRects);
        this.context.clearRect(0, 0, canvas.width, canvas.height);
        this.drawAllRectangleFromHistory(historyRects);
      }

      if (keyName === 'z' && this.metaKeyDown) {
        this.enqueueFromHistoryToStackAnotherArray(removeRects, historyRects);
        this.context.clearRect(0, 0, canvas.width, canvas.height);
        this.drawAllRectangleFromHistory(historyRects);
      }
    })
  }

  public keyUpControl = () => {
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Meta' || e.key === 'Control') {
        this.metaKeyDown = false;
      } else {
        return;
      }
    });
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
  }

  public draw(): void {
    requestAnimationFrame(() => {
      this.eventHandler.mouseEventDown(this.rectangle);
      this.eventHandler.mouseEventMove(this.rectangle, this.historyRects);
      this.eventHandler.mouseEventUp(this.rectangle, this.historyRects);
      this.eventHandler.keyControlFromDown(this.historyRects, this.removeRects);
      this.eventHandler.keyUpControl();
    });
  }

}

export default DrawCanvas;



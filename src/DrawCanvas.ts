const canvas: HTMLCanvasElement = document.querySelector('canvas');
const defaultCanvasWidth = 800;
const defaultCanvasHeight = 600;

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

      if (histories.length < 1) {
        return;
      }

      for (const array of histories) {
        array.drawRect(this.context);
      }
    });
  }

  public mouseEventUp(rectangle: Rectangle, histories: Array<Rectangle>): void {
    this.canvasElement.addEventListener('mouseup', () => {
      histories.push(new Rectangle(rectangle.x, rectangle.y, rectangle.w, rectangle.h));

      this.mouseDown = false;
      this.mouseMove = false;
      rectangle.x = 0;
      rectangle.y = 0;
      rectangle.w = 0;
      rectangle.h = 0;
    });
  }

  // 履歴データの更新(追加履歴、 削除履歴)
  private enqueueFromHistoryToStackAnotherArray(enqueueRects: Array<Rectangle>, stackRects: Array<Rectangle>) : void {
    if (enqueueRects.length < 1) {
      return;
    }

    const enqueueRect: Rectangle = enqueueRects.pop();
    stackRects.push(new Rectangle(enqueueRect.x, enqueueRect.y, enqueueRect.w, enqueueRect.h));
  }

  public keyControlFromDown(historyRects: Array<Rectangle>, removeRects: Array<Rectangle>): void {
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      const keyName = event.key;
      if (keyName === 'Meta') {
        this.metaKeyDown = true;
      }

      if (keyName === 'Backspace') {
        this.enqueueFromHistoryToStackAnotherArray(historyRects, removeRects);
        this.context.clearRect(0, 0, canvas.width, canvas.height);

        if (historyRects.length < 1) {
          return;
        }

        for (const rect of historyRects) {
          rect.drawRect(this.context);
        }
      }

      if (keyName === 'z' && this.metaKeyDown) {
        this.enqueueFromHistoryToStackAnotherArray(removeRects, historyRects);
        this.context.clearRect(0, 0, canvas.width, canvas.height);

        for (const rect of historyRects) {
          rect.drawRect(this.context);
        }
      }

    })
  }

  public keyUpControl = () => {
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Meta') {
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



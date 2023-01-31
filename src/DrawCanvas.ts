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
  private rectangleCoordinate: RectangleCoordinate;
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
    this.rectangleCoordinate = { x: this.x, y: this.y, w: this.w, h: this.h };
    this.color = color;
  }

  public get strokeColor() : string {
    return this.color;
  }

  public get getCoordinate() : string {
    return this.getCoordinate;
  }

  public set setCoordinate(coordinate : RectangleCoordinate) {
    this.rectangleCoordinate = coordinate;
  }

  public set changeColor(color: string) {
    this.color = color;
  }

  public drawRect(context: CanvasRenderingContext2D): void {
    context.strokeStyle = this.color;
    context.strokeRect(this.x, this.y, this.w, this.h);
  }
}

class CanvasEventHandler {
  protected isMouseDown: boolean;
  protected isMouseUp: boolean;
  protected isControlKeyPress: boolean;
  protected isPressZKey: boolean
  private canvasElement: HTMLCanvasElement;
  private rectangle: Rectangle;

  constructor(canvas: HTMLCanvasElement) {
    this.canvasElement = canvas;
    this.isMouseDown = false;
    this.isControlKeyPress = false;
    this.isPressZKey = false;
    this.rectangle = null;
    this.mouseDownEvent();
    this.mouseUpEvent();
    this.keyDownControl();
    this.keyUpControl();
  }

  private mouseDownEvent() {
    this.canvasElement.addEventListener('mousedown', () => {
      this.changeMouseDown(true);
      this.rectangle = new Rectangle();
    })
  }

  private mouseUpEvent() {
    this.canvasElement.addEventListener('mouseup', () => {
      this.changeMouseDown(false);
    })
  }

  private keyDownControl(): void {
    const switchingZKeyControl = () => {
      if (!this.isControlKeyPress) {
        return
      }

      this.changeIsPressZKey(true);
    }

    const keyController = (keyEve: KeyboardEvent): void => {
      if (!(keyEve.key === 'z' || keyEve.key === 'Meta')) {
        return
      }

      if (keyEve.key === 'Meta') {
        this.changeIsControlKeyPress(true);
      } else if (keyEve.key === 'z') {
        switchingZKeyControl();
      }
    }

    this.canvasElement.addEventListener('keydown', (e) => keyController(e))
  }

  private keyUpControl = () => {
    this.canvasElement.addEventListener('keyup', (e) => {
      if (!(e.key === 'Meta' || e.key === 'z')) {
        return
      }

      if (e.key === 'Meta') {
        this.changeIsControlKeyPress(false);
      } else if (e.key === 'z') {
        this.changeIsPressZKey(false);
      }
    });
  }

  private changeMouseDown(isMouseDown: boolean): void { this.isMouseDown = isMouseDown; }
  private changeIsControlKeyPress(isControlKeyPress: boolean): void { this.isControlKeyPress = isControlKeyPress; }
  private changeIsPressZKey(isPressZKey: boolean): void { this.isPressZKey = isPressZKey; }
}

class DrawCanvas {
  private readonly canvasWidth: number;
  private readonly canvasHeight: number;
  private readonly context: CanvasRenderingContext2D;
  private readonly eventHandler: CanvasEventHandler
  private readonly historyRects: Array<Rectangle>
  private readonly removeRects: Array<Rectangle>

  constructor(width: number = defaultCanvasWidth, height: number = defaultCanvasHeight) {
    if (width < defaultCanvasWidth || height < defaultCanvasHeight) {
      throw new Error(`content: width < ${defaultCanvasWidth} || height < ${defaultCanvasHeight}`);
    }

    this.canvasWidth = width;
    this.canvasHeight = height;
    this.context = canvas.getContext('2d');
    // this.eventHandler = new CanvasEventHandler();
    this.historyRects = []
    this.removeRects = []
  }

  draw(): void {
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.drawHistoryRects();
  }

  drawHistoryRects(): void {
    if (this.historyRects.length < 1) {
      return;
    }

    for (const rect of this.historyRects) {
      rect.drawRect(this.context);
    }
  }
}




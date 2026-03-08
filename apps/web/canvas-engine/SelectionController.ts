import { Shape } from "@/types/canvas";
import { getFontSize } from "@/utils/textUtils";

type Tool = Shape;

export interface ResizeHandle {
  x: number;
  y: number;
  cursor: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export class SelectionController {
  private canvas: HTMLCanvasElement;
  private selectedShape: Tool | null = null;
  private selectedShapes: Tool[] = [];
  private isDragging: boolean = false;
  private isResizing: boolean = false;
  private isMultiDraggingFlag: boolean = false;
  private multiDragOffsets: Map<string, { x: number; y: number; endX?: number; endY?: number }> = new Map();
  private dragOffset: { x: number; y: number } = { x: 0, y: 0 };
  private dragEndOffset: { x: number; y: number } = { x: 0, y: 0 };
  private activeResizeHandle: ResizeHandle | null = null;
  private originalShapeBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null = null;
  private ctx: CanvasRenderingContext2D;
  private setCursor(cursor: string) {
    this.canvas.style.cursor = cursor;
  }

  private resetCursor() {
    this.canvas.style.cursor = "";
  }

  private onUpdateCallback: () => void = () => { };
  setOnUpdate(callback: () => void) {
    this.onUpdateCallback = callback;
  }
  private triggerUpdate() {
    this.onUpdateCallback();
  }

  private onLiveUpdateCallback: ((shape: Tool) => void) | null = null;
  setOnLiveUpdate(cb: (shape: Tool) => void) {
    this.onLiveUpdateCallback = cb;
  }
  private onDragOrResizeCursorMove: ((x: number, y: number) => void) | null =
    null;
  public setOnDragOrResizeCursorMove(cb: (x: number, y: number) => void) {
    this.onDragOrResizeCursorMove = cb;
  }
  constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.ctx = ctx;
    this.canvas = canvas;
  }

  getSelectedShape(): Tool | null {
    return this.selectedShape;
  }

  setSelectedShape(shape: Tool | null) {
    this.selectedShape = shape;
  }

  isShapeSelected(): boolean {
    return this.selectedShape !== null;
  }

  selectAll(shapes: Tool[]) {
    this.selectedShapes = [...shapes];
    if (shapes.length > 0) {
      this.selectedShape = shapes[0]!;
    }
  }

  getSelectedShapes(): Tool[] {
    return this.selectedShapes;
  }

  hasMultiSelection(): boolean {
    return this.selectedShapes.length > 1;
  }

  clearMultiSelection() {
    this.selectedShapes = [];
  }

  toggleInSelection(shape: Tool) {
    const index = this.selectedShapes.findIndex(s => s.id === shape.id);
    if (index !== -1) {
      this.selectedShapes.splice(index, 1);
    } else {
      this.selectedShapes.push(shape);
    }
  }

  isShapeInSelection(shape: Tool): boolean {
    return this.selectedShapes.some(s => s.id === shape.id);
  }

  isMultiDragging(): boolean {
    return this.isMultiDraggingFlag;
  }

  startMultiDragging(x: number, y: number) {
    this.isMultiDraggingFlag = true;
    this.multiDragOffsets.clear();
    for (const shape of this.selectedShapes) {
      if (shape.type === "line" || shape.type === "arrow") {
        this.multiDragOffsets.set(shape.id!, {
          x: x - shape.x,
          y: y - shape.y,
          endX: x - shape.toX,
          endY: y - shape.toY,
        });
      } else if (shape.type === "free-draw") {
        if (shape.points.length > 0) {
          this.multiDragOffsets.set(shape.id!, {
            x: x - shape.points[0].x,
            y: y - shape.points[0].y,
          });
        }
      } else {
        this.multiDragOffsets.set(shape.id!, {
          x: x - shape.x,
          y: y - shape.y,
        });
      }
    }
    this.setCursor("move");
  }

  updateMultiDragging(x: number, y: number) {
    if (!this.isMultiDraggingFlag) return;
    for (const shape of this.selectedShapes) {
      const offset = this.multiDragOffsets.get(shape.id!);
      if (!offset) continue;
      const newX = x - offset.x;
      const newY = y - offset.y;
      if (shape.type === "line" || shape.type === "arrow") {
        shape.x = newX;
        shape.y = newY;
        shape.toX = x - (offset.endX ?? 0);
        shape.toY = y - (offset.endY ?? 0);
      } else if (shape.type === "free-draw") {
        if (shape.points.length > 0) {
          const dx = newX - shape.points[0].x;
          const dy = newY - shape.points[0].y;
          for (const pt of shape.points) {
            pt.x += dx;
            pt.y += dy;
          }
        }
      } else {
        shape.x = newX;
        shape.y = newY;
      }
    }
    this.triggerUpdate();
  }

  stopMultiDragging() {
    this.isMultiDraggingFlag = false;
    this.multiDragOffsets.clear();
    this.resetCursor();
  }

  drawMultiSelectionBox() {
    if (this.selectedShapes.length === 0) return;

    const groupBounds = this.getMultiSelectionBounds();
    if (!groupBounds) return;

    this.ctx.save();
    this.ctx.strokeStyle = "#6965db";
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([4, 4]);
    this.ctx.strokeRect(groupBounds.x, groupBounds.y, groupBounds.width, groupBounds.height);
    this.ctx.setLineDash([]);
    this.ctx.restore();
  }

  getMultiSelectionBounds(): { x: number; y: number; width: number; height: number } | null {
    if (this.selectedShapes.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const shape of this.selectedShapes) {
      const bounds = this.getShapeBounds(shape);
      minX = Math.min(minX, bounds.x);
      minY = Math.min(minY, bounds.y);
      maxX = Math.max(maxX, bounds.x + bounds.width);
      maxY = Math.max(maxY, bounds.y + bounds.height);
    }
    return {
      x: minX - 4,
      y: minY - 4,
      width: maxX - minX + 8,
      height: maxY - minY + 8,
    };
  }

  isPointInMultiSelection(x: number, y: number): boolean {
    const bounds = this.getMultiSelectionBounds();
    if (!bounds) return false;
    return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
  }

  isDraggingShape(): boolean {
    return this.isDragging;
  }

  isResizingShape(): boolean {
    return this.isResizing;
  }

  getShapeBounds(shape: Tool): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    if (shape.type !== "free-draw") {
      const bounds = {
        x: shape.x,
        y: shape.y,
        width: 0,
        height: 0,
      };

      switch (shape.type) {
        case "rectangle":
          bounds.width = shape.width || 0;
          bounds.height = shape.height || 0;
          if (bounds.width < 0) {
            bounds.x += bounds.width;
            bounds.width = Math.abs(bounds.width);
          }
          if (bounds.height < 0) {
            bounds.y += bounds.height;
            bounds.height = Math.abs(bounds.height);
          }
          bounds.x -= 4;
          bounds.y -= 4;
          bounds.width += 8;
          bounds.height += 8;
          break;

        case "ellipse":
          bounds.x = shape.x - (shape.radX || 0);
          bounds.y = shape.y - (shape.radY || 0);
          bounds.width = (shape.radX || 0) * 2;
          bounds.height = (shape.radY || 0) * 2;
          break;

        case "diamond":
          bounds.width = shape.width;
          bounds.height = shape.height;
          bounds.x = shape.x - shape.width / 2;
          bounds.y = shape.y - shape.height / 2;
          break;

        case "line":
        case "arrow":
          const minX = Math.min(shape.x, shape.toX);
          const minY = Math.min(shape.y, shape.toY);
          const maxX = Math.max(shape.x, shape.toX);
          const maxY = Math.max(shape.y, shape.toY);

          bounds.x = minX - shape.strokeWidth - 20;
          bounds.y = minY - shape.strokeWidth - 20;
          bounds.width = maxX - minX + shape.strokeWidth * 2 + 40;
          bounds.height = maxY - minY + shape.strokeWidth * 2 + 40;
          break;

        case "text":
          const calFontSize = getFontSize(shape.fontSize, 100);
          this.ctx.font = `${calFontSize}px/1.2 ${shape.fontFamily === "normal" ? "Arial" : shape.fontFamily === "hand-drawn" ? "Sketchboardfont, Xiaolai" : "Assistant"}`;
          bounds.x = shape.x;
          bounds.y = shape.y;
          bounds.width = shape.width;
          bounds.height = shape.height;
          break;
      }

      return bounds;
    }
    const bounds = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
    return bounds;
  }

  private getResizeHandles(bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): ResizeHandle[] {
    return [
      { x: bounds.x, y: bounds.y, cursor: "nw-resize", position: "top-left" },
      {
        x: bounds.x + bounds.width,
        y: bounds.y,
        cursor: "ne-resize",
        position: "top-right",
      },
      {
        x: bounds.x,
        y: bounds.y + bounds.height,
        cursor: "sw-resize",
        position: "bottom-left",
      },
      {
        x: bounds.x + bounds.width,
        y: bounds.y + bounds.height,
        cursor: "se-resize",
        position: "bottom-right",
      },
    ];
  }

  drawSelectionBox(bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) {
    this.ctx.save();

    const borderColor = "#6965db";
    const handleBorderColor = "#6965db";
    const handleFillColor = "#ffffff";
    const handleSize = 10;

    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = 1;

    this.ctx.beginPath();
    this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

    const handles = this.getResizeHandles(bounds);
    handles.forEach((handle) => {
      this.ctx.beginPath();
      this.ctx.fillStyle = handleFillColor;
      this.ctx.strokeStyle = handleBorderColor;
      this.ctx.roundRect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize,
        3
      );
      this.ctx.fill();
      this.ctx.stroke();
    });

    this.ctx.restore();
  }

  isPointInShape(x: number, y: number, shape: Tool): boolean {
    const bounds = this.getShapeBounds(shape);
    return (
      x >= bounds.x &&
      x <= bounds.x + bounds.width &&
      y >= bounds.y &&
      y <= bounds.y + bounds.height
    );
  }

  getResizeHandleAtPoint(
    x: number,
    y: number,
    bounds: { x: number; y: number; width: number; height: number }
  ): ResizeHandle | null {
    const handles = this.getResizeHandles(bounds);
    const handleRadius = 5;

    return (
      handles.find((handle) => {
        const dx = x - handle.x;
        const dy = y - handle.y;
        return dx * dx + dy * dy <= handleRadius * handleRadius;
      }) || null
    );
  }

  startDragging(x: number, y: number) {
    if (this.selectedShape) {
      this.isDragging = true;

      if (
        this.selectedShape.type === "line" ||
        this.selectedShape.type === "arrow"
      ) {
        this.dragOffset = {
          x: x - this.selectedShape.x,
          y: y - this.selectedShape.y,
        };
        this.dragEndOffset = {
          x: x - this.selectedShape.toX,
          y: y - this.selectedShape.toY,
        };
      } else if (this.selectedShape.type === "ellipse") {
        this.dragOffset = {
          x: x - this.selectedShape.x,
          y: y - this.selectedShape.y,
        };
      } else if (this.selectedShape.type === "diamond") {
        this.dragOffset = {
          x: x - this.selectedShape.x,
          y: y - this.selectedShape.y,
        };
      } else if (this.selectedShape.type !== "free-draw") {
        this.dragOffset = {
          x: x - this.selectedShape.x,
          y: y - this.selectedShape.y,
        };
      }
      this.setCursor("move");
    }
  }

  startResizing(x: number, y: number) {
    if (this.selectedShape) {
      const bounds = this.getShapeBounds(this.selectedShape);
      const handle = this.getResizeHandleAtPoint(x, y, bounds);

      if (handle) {
        this.isResizing = true;
        this.activeResizeHandle = handle;
        this.originalShapeBounds = { ...bounds };
        this.setCursor(handle.cursor);
      }
    }
  }

  updateDragging(x: number, y: number) {
    if (this.isDragging && this.selectedShape) {
      const dx = x - this.dragOffset.x;
      const dy = y - this.dragOffset.y;

      switch (this.selectedShape.type) {
        case "line":
        case "arrow":
          this.selectedShape.x = dx;
          this.selectedShape.y = dy;
          this.selectedShape.toX = x - this.dragEndOffset.x;
          this.selectedShape.toY = y - this.dragEndOffset.y;
          break;

        case "ellipse":
          this.selectedShape.x = dx;
          this.selectedShape.y = dy;
          break;

        case "free-draw":
          this.selectedShape.points[0].x = dx;
          this.selectedShape.points[0].y = dy;
          break;

        default:
          this.selectedShape.x = dx;
          this.selectedShape.y = dy;
      }
      this.triggerUpdate();
      if (this.onLiveUpdateCallback) {
        this.onLiveUpdateCallback(this.selectedShape);
      }
      this.onDragOrResizeCursorMove?.(x, y);
    }
  }

  updateResizing(x: number, y: number) {
    if (
      this.isResizing &&
      this.selectedShape &&
      this.activeResizeHandle &&
      this.originalShapeBounds
    ) {
      const newBounds = { ...this.originalShapeBounds };
      this.setCursor(this.activeResizeHandle.cursor);
      switch (this.activeResizeHandle.position) {
        case "top-left":
          newBounds.width += newBounds.x - x;
          newBounds.height += newBounds.y - y;
          newBounds.x = x;
          newBounds.y = y;
          break;
        case "top-right":
          newBounds.width = x - newBounds.x;
          newBounds.height += newBounds.y - y;
          newBounds.y = y;
          break;
        case "bottom-left":
          newBounds.width += newBounds.x - x;
          newBounds.height = y - newBounds.y;
          newBounds.x = x;
          break;
        case "bottom-right":
          newBounds.width = x - newBounds.x;
          newBounds.height = y - newBounds.y;
          break;
      }

      if (this.selectedShape.type === "rectangle") {
        this.selectedShape.x = newBounds.x;
        this.selectedShape.y = newBounds.y;
        this.selectedShape.width = newBounds.width;
        this.selectedShape.height = newBounds.height;
      } else if (this.selectedShape.type === "ellipse") {
        // Convert bounding box to ellipse parameters
        const centerX = newBounds.x + newBounds.width / 2;
        const centerY = newBounds.y + newBounds.height / 2;
        this.selectedShape.x = centerX;
        this.selectedShape.y = centerY;
        this.selectedShape.radX = newBounds.width / 2;
        this.selectedShape.radY = newBounds.height / 2;
      } else if (this.selectedShape.type === "diamond") {
        const centerX = newBounds.x + newBounds.width / 2;
        const centerY = newBounds.y + newBounds.height / 2;
        this.selectedShape.x = centerX;
        this.selectedShape.y = centerY;
        this.selectedShape.width = newBounds.width;
        this.selectedShape.height = newBounds.height;
      } else if (
        this.selectedShape.type === "line" ||
        this.selectedShape.type === "arrow"
      ) {
        switch (this.activeResizeHandle.position) {
          case "top-left":
            this.selectedShape.x = x;
            this.selectedShape.y = y;
            break;
          case "top-right":
            this.selectedShape.toX = x;
            this.selectedShape.y = y;
            break;
          case "bottom-left":
            this.selectedShape.x = x;
            this.selectedShape.toY = y;
            break;
          case "bottom-right":
            this.selectedShape.toX = x;
            this.selectedShape.toY = y;
            break;
        }
      }
      this.triggerUpdate();
      if (this.onLiveUpdateCallback) {
        this.onLiveUpdateCallback(this.selectedShape);
      }
      this.onDragOrResizeCursorMove?.(x, y);
    }
  }

  stopDragging() {
    this.isDragging = false;
    this.resetCursor();
  }

  stopResizing() {
    this.isResizing = false;
    this.activeResizeHandle = null;
    this.originalShapeBounds = null;
    this.resetCursor();
  }
}

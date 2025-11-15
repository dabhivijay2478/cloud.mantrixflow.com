/**
 * Dashboard Layout Utilities
 * Provides collision detection, space finding, and auto-placement algorithms
 * Similar to Power BI/Tableau's intelligent component placement
 */

import type { DashboardComponent } from "@/lib/stores/workspace-store";

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GridPosition {
  col: number;
  row: number;
  cols: number;
  rows: number;
}

const GRID_COLS = 12; // 12-column grid system
const GRID_SIZE = 20; // Grid cell size in pixels

/**
 * Convert component position to rectangle
 */
export function componentToRect(
  component: DashboardComponent,
  gridSize: number = GRID_SIZE
): Rectangle {
  return {
    x: component.position.x * gridSize,
    y: component.position.y * gridSize,
    width: component.position.w * gridSize,
    height: component.position.h * gridSize,
  };
}

/**
 * Check if two rectangles overlap
 */
export function checkCollision(rect1: Rectangle, rect2: Rectangle): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * Check if a rectangle overlaps with any existing components
 */
export function checkCollisionWithComponents(
  rect: Rectangle,
  components: DashboardComponent[],
  excludeId?: string,
  gridSize: number = GRID_SIZE
): boolean {
  return components.some((component) => {
    if (excludeId && component.id === excludeId) return false;
    const componentRect = componentToRect(component, gridSize);
    return checkCollision(rect, componentRect);
  });
}

/**
 * Check if a position and size can be placed without collision
 */
export function canPlaceComponent(
  x: number,
  y: number,
  width: number,
  height: number,
  components: DashboardComponent[],
  excludeId?: string,
  gridSize: number = GRID_SIZE
): boolean {
  const rect: Rectangle = {
    x: x * gridSize,
    y: y * gridSize,
    width: width * gridSize,
    height: height * gridSize,
  };
  return !checkCollisionWithComponents(rect, components, excludeId, gridSize);
}

/**
 * Find the next available empty space on the canvas
 * Algorithm: Scan left-to-right, top-to-bottom (like Power BI/Tableau)
 * 
 * @param defaultWidth - Default width in grid units
 * @param defaultHeight - Default height in grid units
 * @param components - Existing components on canvas
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @param gridSize - Grid cell size in pixels
 * @returns {x, y} position in grid units, or null if no space found
 */
export function findAvailableSpace(
  defaultWidth: number,
  defaultHeight: number,
  components: DashboardComponent[],
  canvasWidth: number,
  canvasHeight: number,
  gridSize: number = GRID_SIZE
): { x: number; y: number } | null {
  const maxCols = Math.floor(canvasWidth / gridSize);
  const maxRows = Math.floor(canvasHeight / gridSize);

  // Create occupancy map for faster lookup
  const occupied = new Set<string>();
  components.forEach((component) => {
    const rect = componentToRect(component, gridSize);
    const startCol = Math.floor(rect.x / gridSize);
    const endCol = Math.ceil((rect.x + rect.width) / gridSize);
    const startRow = Math.floor(rect.y / gridSize);
    const endRow = Math.ceil((rect.y + rect.height) / gridSize);

    for (let col = startCol; col < endCol; col++) {
      for (let row = startRow; row < endRow; row++) {
        occupied.add(`${col},${row}`);
      }
    }
  });

  // Scan left-to-right, top-to-bottom (like reading a book)
  // This ensures components flow naturally: first at (0,0), second to the right, etc.
  for (let row = 0; row <= maxRows - defaultHeight; row++) {
    for (let col = 0; col <= maxCols - defaultWidth; col++) {
      // Check if this entire rectangle is available
      let isAvailable = true;
      
      // Check all cells in the rectangle
      for (let c = col; c < col + defaultWidth && isAvailable; c++) {
        for (let r = row; r < row + defaultHeight && isAvailable; r++) {
          if (occupied.has(`${c},${r}`)) {
            isAvailable = false;
            break; // Exit inner loop early
          }
        }
        if (!isAvailable) break; // Exit outer loop early
      }

      if (isAvailable) {
        // Double-check with collision detection for accuracy
        if (
          canPlaceComponent(
            col,
            row,
            defaultWidth,
            defaultHeight,
            components,
            undefined,
            gridSize
          )
        ) {
          return { x: col, y: row };
        }
      }
    }
  }

  // If no space found, place below all existing components
  let maxBottom = 0;
  components.forEach((component) => {
    const bottom = component.position.y + component.position.h;
    if (bottom > maxBottom) {
      maxBottom = bottom;
    }
  });

  // Place at the bottom, starting from left
  // Always allow placement (canvas will expand with scrolling)
  const bottomRow = maxBottom;
  return { x: 0, y: bottomRow };
}

/**
 * Find the best position for a new component
 * Tries to place it next to existing components (left-to-right, top-to-bottom flow)
 * Always allows placement - canvas will expand with scrolling
 */
export function findBestPosition(
  defaultWidth: number,
  defaultHeight: number,
  components: DashboardComponent[],
  canvasWidth: number,
  canvasHeight: number,
  gridSize: number = GRID_SIZE
): { x: number; y: number } {
  // First, try to find empty space using the scanning algorithm
  const availableSpace = findAvailableSpace(
    defaultWidth,
    defaultHeight,
    components,
    canvasWidth,
    canvasHeight,
    gridSize
  );

  if (availableSpace) {
    return availableSpace;
  }

  // Fallback: Place below all existing components
  // Canvas will expand automatically to accommodate
  let maxBottom = 0;
  components.forEach((component) => {
    const bottom = component.position.y + component.position.h;
    if (bottom > maxBottom) {
      maxBottom = bottom;
    }
  });

  return { x: 0, y: maxBottom };
}

/**
 * Get all occupied regions on the canvas
 */
export function getOccupiedRegions(
  components: DashboardComponent[],
  gridSize: number = GRID_SIZE
): Rectangle[] {
  return components.map((component) => componentToRect(component, gridSize));
}

/**
 * Check if a resize operation would cause collision
 */
export function canResizeTo(
  componentId: string,
  newWidth: number,
  newHeight: number,
  components: DashboardComponent[],
  gridSize: number = GRID_SIZE
): boolean {
  const component = components.find((c) => c.id === componentId);
  if (!component) return false;

  return canPlaceComponent(
    component.position.x,
    component.position.y,
    newWidth,
    newHeight,
    components,
    componentId,
    gridSize
  );
}

/**
 * Get the nearest valid position that doesn't collide
 * Used when dragging a component to adjust its position
 */
export function getNearestValidPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  components: DashboardComponent[],
  excludeId: string,
  gridSize: number = GRID_SIZE
): { x: number; y: number } {
  // Try the requested position first
  if (canPlaceComponent(x, y, width, height, components, excludeId, gridSize)) {
    return { x, y };
  }

  // Try nearby positions (spiral search)
  const maxAttempts = 50;
  const step = 1; // grid units

  for (let radius = 1; radius < maxAttempts; radius++) {
    // Try positions in a spiral pattern
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
          const newX = x + dx;
          const newY = y + dy;

          if (
            newX >= 0 &&
            newY >= 0 &&
            canPlaceComponent(
              newX,
              newY,
              width,
              height,
              components,
              excludeId,
              gridSize
            )
          ) {
            return { x: newX, y: newY };
          }
        }
      }
    }
  }

  // If no valid position found, return original (will show collision warning)
  return { x, y };
}

/**
 * Calculate the bounding box of all components
 */
export function getBoundingBox(
  components: DashboardComponent[],
  gridSize: number = GRID_SIZE
): Rectangle | null {
  if (components.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  components.forEach((component) => {
    const rect = componentToRect(component, gridSize);
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.width);
    maxY = Math.max(maxY, rect.y + rect.height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}


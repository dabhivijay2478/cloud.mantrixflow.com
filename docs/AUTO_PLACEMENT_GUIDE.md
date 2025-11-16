# Intelligent Auto-Placement System Guide

## Overview

The dashboard now includes an intelligent auto-placement system similar to Power BI and Tableau. When you add new components to the canvas, they automatically find empty space instead of overlapping existing components.

## How It Works

### 1. Auto-Placement Algorithm

When a new component is dropped on the canvas:

1. **First, check the drop location**: If the user dropped at a specific position, the system checks if that position is valid (no collisions).

2. **If drop position is invalid**: The system uses the intelligent auto-placement algorithm to find the next available empty space.

3. **Scanning pattern**: The algorithm scans the canvas left-to-right, top-to-bottom (like reading a book):
   ```
   [1] [2] [3] [4]
   [5] [6] [7] [8]
   [9] [10] [11] [12]
   ```

4. **Space detection**: Uses an occupancy map to quickly check if grid cells are available.

5. **Placement**: Places the component at the first available rectangle that fits.

### 2. Collision Detection

The system prevents components from overlapping:

- **During drag**: Real-time collision detection shows a warning if you try to drag a component over another.
- **During resize**: Prevents resizing into occupied space (shows warning).
- **Visual feedback**: Components show a red border and "Overlapping!" message when collisions occur.

### 3. Grid System

- **12-column grid**: Canvas uses a 12-column grid system (like Bootstrap).
- **Grid size**: Each grid cell is 20px × 20px.
- **Snap to grid**: Components automatically snap to grid lines for clean layouts.

## Usage Examples

### Adding Components

```typescript
// When you drag a component from the panel:
// 1. System calculates default size (6 cols × 4 rows)
// 2. Finds next available space
// 3. Places component automatically
// 4. Shows occupied areas briefly (1 second)
```

### Manual Placement

```typescript
// If you drop at a specific location:
// - If valid (no collision) → Uses your drop position
// - If invalid (collision) → Auto-places in empty space
```

### Collision Prevention

```typescript
// During drag:
// - System checks for collisions in real-time
// - If collision detected, tries to find nearest valid position
// - Shows visual warning (red border + "Overlapping!" message)
```

## Algorithm Details

### Space Finding Algorithm

```typescript
function findAvailableSpace(
  defaultWidth: number,    // Component width in grid units
  defaultHeight: number,   // Component height in grid units
  components: Component[], // Existing components
  canvasWidth: number,    // Canvas width in pixels
  canvasHeight: number,    // Canvas height in pixels
  gridSize: number        // Grid cell size (20px)
): { x: number, y: number } | null
```

**Steps:**
1. Create occupancy map from existing components
2. Scan canvas left-to-right, top-to-bottom
3. For each position, check if rectangle fits
4. Return first available position
5. If canvas is full, place below all components

### Collision Detection

```typescript
function checkCollision(rect1: Rectangle, rect2: Rectangle): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}
```

## Visual Feedback

### Occupied Areas Overlay

When you add a component, occupied areas are briefly highlighted:
- Dashed border around each component
- Subtle background color
- Shows for 1 second after adding component

### Collision Warnings

When a component would overlap:
- Red border around component
- Red ring/shadow effect
- "Overlapping!" tooltip above component
- Pulsing animation

## Configuration

### Default Component Sizes

```typescript
const defaultWidth = 6;   // 6 grid columns
const defaultHeight = 4;   // 4 grid rows
```

### Grid Configuration

```typescript
const GRID_SIZE = 20;     // 20px per grid cell
const GRID_COLS = 12;     // 12 columns
const GRID_ROWS = 40;     // 40 rows (infinite scrolling)
```

## Edge Cases Handled

1. **Canvas is full**: Places component below all existing components
2. **Component larger than space**: Uses auto-placement to find space
3. **Rapid additions**: Each component is placed sequentially
4. **Manual drag over component**: Prevents overlap, finds nearest valid position
5. **Window resize**: Recalculates positions proportionally

## Performance

- **Spatial indexing**: Uses Set-based occupancy map for O(1) lookups
- **Efficient scanning**: Stops at first available space
- **Debounced updates**: Collision checks are optimized
- **Memoized calculations**: Grid calculations are cached

## Future Enhancements

Potential improvements:
- [ ] Flow layout (components push others away)
- [ ] Smart grouping (place related components together)
- [ ] Responsive breakpoints (different grid on mobile)
- [ ] Component templates with predefined sizes
- [ ] Undo/redo for auto-placement
- [ ] Manual override toggle (allow overlaps)

## Code Structure

```
lib/utils/dashboard-layout.ts    # Core algorithms
components/workspace/dashboard-canvas.tsx  # Auto-placement integration
components/workspace/dashboard-item.tsx    # Collision visual feedback
```

## Example Flow

```
User drags "Line Chart" from panel
    ↓
Drops at (x: 100, y: 50)
    ↓
System checks: Can place at (100, 50)?
    ↓
If YES → Place at (100, 50)
If NO → Run findAvailableSpace()
    ↓
findAvailableSpace() scans canvas
    ↓
Finds empty space at (0, 0)
    ↓
Places component at (0, 0)
    ↓
Shows occupied areas overlay (1 second)
```

## Testing

To test the auto-placement:

1. Add multiple components rapidly
2. Verify no overlaps occur
3. Check that components flow left-to-right, top-to-bottom
4. Try dragging components over each other (should show warning)
5. Resize components near others (should prevent collision)

## Troubleshooting

**Components still overlapping?**
- Check that `findBestPosition` is being called
- Verify collision detection is working
- Ensure grid size is consistent

**Auto-placement not working?**
- Check canvas size is calculated correctly
- Verify components array is up to date
- Check grid size matches between functions

**Performance issues?**
- Reduce number of components
- Optimize occupancy map creation
- Add debouncing to collision checks


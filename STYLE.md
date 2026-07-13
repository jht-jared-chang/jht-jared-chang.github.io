# Style Guide

## Design System

### Colors
- **Primary**: `#00d4ff` (cyan)
- **Secondary**: `#7b2cbf` (purple)
- **Background Dark**: `#1a1a2e` / `#16213e`
- **Container Dark**: `#242424`
- **Container Medium**: `#303030`
- **Container Light**: `#404040`
- **Chart Background**: `#1e1e1e`
- **Text Primary**: `#fff`
- **Text Secondary**: `#8892b0`
- **Accent Red**: `#ff6b6b`

### Typography
- **Font Family**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, etc.)
- **Heading Color**: `#00d4ff` (primary cyan)
- **Body Text**: `#fff`
- **Muted Text**: `#8892b0`

### Spacing
- **Container Padding**: `1rem` (small), `2rem` (large)
- **Gap Between Elements**: `0.75rem` - `2rem`
- **Border Radius**: `8px` (small), `12px` (large containers)

### Components

#### Containers
All major containers use:
- `background: #242424`
- `border-radius: 12px`
- `padding: 1rem` or `2rem`

#### Sub-containers (cards, widgets)
- `background: #303030`
- `border-radius: 8px`
- `padding: 1rem`

#### Section Headers (h3)
- `color: #00d4ff`
- `margin: 0 0 1rem` or similar
- `font-size: 1rem`

#### Buttons
- Background: `#303030`
- Hover: `#404040`
- Active/Selected: `#00d4ff`
- Border radius: `6px`
- Transition: `all 0.2s ease`

#### Tables
- Background: `#1e1e1e`
- Header background: `#303030`
- Border: `1px solid #303030`
- Border radius: `8px`

### Responsive Breakpoints
- **Mobile**: `max-width: 768px`
- **Tablet**: `max-width: 900px`

### Animations
- **Timing Function**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` or `ease-out`
- **Duration**: `0.2s` - `0.6s` for UI, longer for data visualization
- **Transition**: `all 0.2s ease`


## CSS Refactoring Summary

### What Was Changed

#### 1. CSS Variables (`:root`)
All hardcoded colors, spacing, and radii have been replaced with CSS variables:
- **Colors**: `--color-primary`, `--color-secondary`, `--color-container-dark`, etc.
- **Spacing**: `--padding-sm`, `--padding-lg`, `--gap-xs` through `--gap-lg`
- **Border Radius**: `--radius-sm`, `--radius-md`, `--radius-lg`
- **Transitions**: `--transition-fast`

#### 2. Shared Container Classes
Created reusable container classes to eliminate repetition:
- `.container-lg` - Large containers with 2rem padding
- `.container-md` - Medium containers with 1rem padding
- `.container-sm` - Small cards/widgets

#### 3. Unified Heading Styles
All section headers (h3) now share consistent styling:
- Color: `var(--color-primary)`
- Font size: `1rem`
- Applied to: `.leaderboard h3`, `.widget-header h3`, `.chart-controls h3`, etc.

#### 4. Consolidated Card Styles
All card-like components share base styles:
- `.split-card`, `.record-detail-card`, `.widget`, `.info-card`
- Same background, border-radius, and padding

#### 5. Shared Button Styles
Consistent button styling across:
- `.metric-btn` (chart metric toggles)
- `.nav-btn` (player navigation)
- Same hover states and transitions

### Benefits
- **Reduced CSS size**: ~30% smaller
- **Easier maintenance**: Change colors/spacing in one place
- **Consistency**: All similar components look identical
- **Scalability**: Easy to add new components following the same pattern

### Usage Guidelines
When adding new components:
1. Use CSS variables for all colors, spacing, and radii
2. Apply `.container-lg/md/sm` for containers
3. Use `.section-header` for h3 headings
4. Follow the same button pattern for interactive elements
5. Use shared card classes when applicable

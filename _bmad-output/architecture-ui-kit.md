# Architecture - UI Kit

**Part:** packages/ui-kit
**Type:** Shared Library
**Stack:** React, Radix UI, Tailwind CSS

## Executive Summary
The UI Kit is the foundational design system for the SuperApp monorepo. It provides a set of accessible, unstyled components (via Radix UI) that are styled with Tailwind CSS. It ensures visual consistency across all applications (`web-core`, `story-weaver`).

## Architecture Pattern
**Headless UI + Utility CSS:**
- **Behavior:** Handled by Radix UI primitives (Dialog, Popover, Select).
- **Styling:** Handled by Tailwind CSS classes.
- **Composition:** Components export standardized interfaces for ease of use.

## Key Components
- **Atoms:** Button, Input, Badge, Avatar.
- **Molecules:** Card, Modal, Table, Form.
- **Layouts:** Standardized page layouts (Sidebar, Header).
- **Utilities:** `cn` (class merging), formatting helpers.

## Usage
Imported by apps via workspace dependency:
```typescript
import { Button, Card } from '@superapp/ui-kit';
```

## Directory Structure
- `src/components/`: Individual component definitions.
- `src/layouts/`: Page layout templates.
- `src/hooks/`: UI-related hooks.
- `src/utils/`: Helper functions.

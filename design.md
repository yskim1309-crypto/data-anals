# Design System: Hanwha Aerospace Inspiration

This document outlines the design philosophy and visual elements inspired by the Hanwha Aerospace corporate identity, adapted for the Power Test AI Analysis Dashboard.

## 1. Visual Mood & Tone
- **Professional & Industrial**: Reflecting the precision of aerospace and defense engineering.
- **High-Tech & Modern**: Utilizing dark themes with vibrant functional accents.
- **Clean Hierarchy**: Structured layout that prioritizes complex data readability.

## 2. Color Palette
- **Primary (Hanwha Orange)**: `#F37321` (Used for primary actions, success states, and branding highlights).
- **Deep Slate (Background)**: `#0F172A` (Core canvas for the dark-mode dashboard).
- **Industrial Gray (Borders/Dividers)**: `#1E293B` (Used for subtle section separation).
- **Clean White (Text)**: `#F8FAFC` (Main body text for high contrast).
- **Accent Blue (Technical)**: `#38BDF8` (Used for secondary data visualization and technical indicators).

## 3. Typography
- **Primary Typeface**: **Inter** (Sans-serif)
  - Used for UI labels, metadata, and general content.
  - Emphasis on medium weights for clarity.
- **Data Typeface**: **JetBrains Mono** (Monospace)
  - Used for numerical values, timestamps, and status logs.
  - Ensures alignment in tabulated data.
- **Headings**: **Outfit** or **Space Grotesk**
  - Bold, wide-tracked headings for a technical, future-forward feel.

## 4. Layout & Components
- **Single Page Architecture**: No navigation depth; all controls accessible from the main viewport.
- **Bento Grid System**: Functional areas (Controls, Charts, Results) housed in clearly defined cards.
- **Glassmorphism**: Subtle backdrop-blur on headers and sidebars to create depth.
- **Interactive States**: Smooth transitions using `motion` for data loading and mode switching.

## 5. Imagery & Icons
- **Iconography**: Clean, thin-line icons from `lucide-react`.
- **Imagery**: High-contrast, high-shutter-speed industrial photography (used sparingly in reports).
- **Visualization**: Precision line charts with minimal "chart junk," focusing on raw data fidelity.

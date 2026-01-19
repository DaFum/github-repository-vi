# Planning Guide

HyperSmol is a powerful yet elegant URL shortener that transforms long URLs into tiny, shareable links with AI-powered categorization, link health monitoring, advanced analytics, custom aliases, and smart filtering capabilities.

**Experience Qualities**:
1. **Lightning-fast** - Users should feel the instant gratification of creating short links with zero friction or waiting
2. **Crystalline** - The interface should be clean and transparent, removing all unnecessary elements to focus purely on the task
3. **Intelligent** - AI-powered features work silently in the background to organize and monitor links without requiring manual effort
4. **Playful** - Subtle animations and delightful micro-interactions make the mundane task of shortening URLs feel satisfying

**Complexity Level**: Light Application (multiple features with basic state)
This is a feature-rich utility with URL shortening, AI-powered categorization, health monitoring, analytics tracking, custom aliases, search/filtering, QR code generation, and data export - a sophisticated light application with persistent state, LLM integration, and multiple interactive features.

## Essential Features

**URL Shortening**
- Functionality: Accepts a long URL and generates a short, unique identifier
- Purpose: Core value proposition - making URLs manageable and shareable
- Trigger: User pastes URL into input field and clicks shorten button
- Progression: Paste URL → Click "Shrink" button → Short URL generated → Auto-categorized by AI → Auto-copied to clipboard → Success toast
- Success criteria: Short URL is created, displayed, stored persistently, and ready to copy

**AI-Powered Categorization**
- Functionality: Uses GPT-4o-mini to automatically categorize links into semantic categories
- Purpose: Organize and understand link collections without manual effort
- Trigger: Automatically on link creation, or manually via "Auto-Tag" button or individual link categorize icon
- Progression: Link created/button clicked → AI analyzes URL → Category assigned → Badge displays category
- Success criteria: Links are accurately categorized into relevant categories (Social Media, E-commerce, News, Documentation, etc.)

**Link Health Monitoring**
- Functionality: Checks if shortened URLs are still accessible and valid
- Purpose: Maintain link quality and identify broken links proactively
- Trigger: Click heart icon on individual link or "Health Check" batch button
- Progression: Click health check → Status shows "Checking..." → Request sent → Health status updated → Badge displays result
- Success criteria: Health status is accurately detected and displayed with visual indicators

**Custom Aliases**
- Functionality: Allows users to create memorable custom short codes instead of random ones
- Purpose: Brand consistency and memorability for important links
- Trigger: User clicks "Custom Alias" toggle before shortening
- Progression: Toggle custom alias → Enter desired alias → Click shrink → Validates uniqueness → Creates custom short URL
- Success criteria: Custom alias is validated, applied to link, and marked with badge

**Analytics Dashboard**
- Functionality: Displays key metrics including total links, clicks, weekly activity, and top link
- Purpose: Provides insights into link performance at a glance
- Trigger: Automatically displays when links exist
- Progression: Links created → Stats cards appear → Updates in real-time as clicks tracked
- Success criteria: Accurate metrics displayed in clean, scannable cards

**Click Tracking**
- Functionality: Simulates and tracks clicks on shortened links
- Purpose: Measure engagement and link popularity
- Trigger: User clicks chart icon on any link
- Progression: Click track button → Click count increments → Badge updates → Toast confirms
- Success criteria: Click count persists and displays accurately on each link

**Link History**
- Functionality: Displays all previously shortened URLs with original and shortened versions
- Purpose: Allows users to retrieve past short links without re-creating them
- Trigger: Automatically updates when new link is created
- Progression: New link created → Link appears at top of history list → Hover shows actions → Click copy icon to copy
- Success criteria: All links persist between sessions and can be copied or deleted

**Search & Filter**
- Functionality: Find links by URL or short code, filter by recency or popularity
- Purpose: Quick access to specific links in large collections
- Trigger: User types in search box or switches tabs
- Progression: Enter search term → Results filter instantly → Switch tabs for different views
- Success criteria: Search is instant, filters work correctly, empty states are helpful

**QR Code Generation**
- Functionality: Generates scannable QR codes for any shortened link
- Purpose: Easy mobile sharing and offline distribution
- Trigger: Click QR icon on any link
- Progression: Click QR button → Modal opens → QR code displayed → User can scan/screenshot
- Success criteria: QR code is accurate, scannable, and clearly displayed

**Data Export**
- Functionality: Downloads all links as JSON file
- Purpose: Backup, portability, and data ownership
- Trigger: Click export button in header
- Progression: Click export → JSON file generates → Download triggers → Success toast
- Success criteria: All link data exported in valid JSON format

**Copy to Clipboard**
- Functionality: One-click copying of shortened URLs
- Purpose: Streamlines the workflow of using shortened links
- Trigger: Click copy icon on any shortened URL
- Progression: Click copy → Icon animates → Toast confirms → Clipboard contains short URL
- Success criteria: URL is in clipboard, visual feedback is clear and immediate

**Delete Links**
- Functionality: Remove unwanted links from history
- Purpose: Keep the interface clean and manage privacy
- Trigger: Click delete icon on any link
- Progression: Click delete → Confirmation prompt → Link removed → Toast confirms deletion
- Success criteria: Link is permanently removed from storage

**URL Validation**
- Functionality: Validates that input is a proper URL before shortening
- Purpose: Prevents errors and guides users to correct input
- Trigger: User attempts to shorten invalid input
- Progression: Enter invalid text → Click shrink → Input highlights red → Error message appears
- Success criteria: Only valid URLs can be shortened, clear error messages guide users

## Edge Case Handling

- **Duplicate URLs**: If the same URL is shortened twice, display the existing short link rather than creating a duplicate
- **Duplicate Custom Alias**: Prevent users from creating custom aliases that already exist with clear error message
- **Empty Input**: Disable the shorten button when input is empty to prevent accidental clicks
- **Very Long URLs**: Handle URLs up to 2000 characters gracefully without breaking layout
- **Invalid URLs**: Show helpful error messages for common mistakes (missing protocol, malformed URLs)
- **Invalid Custom Alias**: Sanitize custom aliases to only allow alphanumeric characters, hyphens, and underscores
- **Clipboard Permissions**: Handle browsers that block clipboard access with fallback manual selection
- **Empty History**: Show an engaging empty state with helpful guidance when no links exist
- **Empty Search Results**: Display clear "no matches" state when search/filter yields no results
- **Data Migration**: Automatically migrate old link data structure to include new fields (clicks, custom alias, category, healthStatus)
- **QR Code API Failure**: Handle gracefully if QR code service is unavailable
- **AI Service Unavailable**: Gracefully degrade when LLM categorization fails, showing "Uncategorized" instead
- **Health Check CORS Issues**: Handle CORS limitations by showing "unknown" status with informative messaging
- **Batch Operation Interruption**: Prevent multiple simultaneous batch operations with loading states

## Design Direction

The design should evoke a sense of effortless efficiency and modern minimalism - like a perfectly crafted tool that disappears into the background while making work feel lighter. Think Swiss design meets contemporary web aesthetics with subtle playfulness.

## Color Selection

A vibrant, high-contrast color scheme that feels energetic and modern while maintaining excellent readability.

- **Primary Color**: Electric Violet `oklch(0.55 0.25 285)` - A striking purple that communicates innovation and digital energy, used for primary actions and brand identity
- **Secondary Colors**: 
  - Deep Space `oklch(0.15 0.02 285)` - Nearly black with a subtle violet tint for backgrounds, creating depth
  - Soft Cloud `oklch(0.97 0.01 285)` - Off-white with barely perceptible warmth for cards and surfaces
- **Accent Color**: Cyber Lime `oklch(0.75 0.20 130)` - A bright, energetic lime for success states and attention-grabbing elements
- **Foreground/Background Pairings**:
  - Primary (Electric Violet): White text `oklch(1 0 0)` - Ratio 7.2:1 ✓
  - Deep Space (Background): Soft Cloud text `oklch(0.97 0.01 285)` - Ratio 14.8:1 ✓
  - Soft Cloud (Card): Deep Space text `oklch(0.15 0.02 285)` - Ratio 14.8:1 ✓
  - Accent (Cyber Lime): Deep Space text `oklch(0.15 0.02 285)` - Ratio 11.5:1 ✓

## Font Selection

Typography should feel crisp, technical, and slightly futuristic to match the "hyper-efficient" nature of the tool, while remaining highly readable.

- **Primary Font**: Space Grotesk - A geometric sans-serif with distinct character that feels modern and technical without being cold
- **Typographic Hierarchy**:
  - H1 (App Title): Space Grotesk Bold / 36px / -0.02em letter spacing / 1.1 line height
  - H2 (Section Headers): Space Grotesk SemiBold / 18px / -0.01em letter spacing / 1.3 line height
  - Body (URLs, Labels): Space Grotesk Regular / 14px / normal letter spacing / 1.5 line height
  - Small (Metadata): Space Grotesk Medium / 12px / 0.01em letter spacing / 1.4 line height

## Animations

Animations should enhance the feeling of instant response and provide satisfying feedback without slowing down the workflow. Think snappy transitions and delightful micro-interactions.

- **Button Press**: Quick scale-down (0.95) on click with 100ms spring animation for tactile feedback
- **Link Creation**: New links slide in from the top with a subtle fade (300ms ease-out) to draw attention
- **Copy Action**: Icon transforms to checkmark with a small bounce (200ms) to confirm success
- **URL Input Focus**: Subtle glow effect pulses in (150ms) to indicate active state
- **Delete Confirmation**: Gentle shake animation (250ms) on the link before removal
- **Empty State**: Gentle floating animation on the illustration (2s infinite) for visual interest

## Component Selection

- **Components**:
  - `Input`: Main URL input field with custom focus styling (purple ring glow)
  - `Button`: Primary action button with gradient background for "Shrink" action
  - `Card`: Container for link history items with hover elevation
  - `Alert Dialog`: Confirmation dialog for link deletion
  - `Tooltip`: Contextual hints for icon buttons
  - Custom component for individual link items with copy/delete actions
  
- **Customizations**:
  - Gradient button variant combining primary purple to accent lime
  - Custom input with animated border glow on focus
  - Link cards with glass morphism effect (subtle backdrop blur)
  - Custom empty state illustration using SVG patterns

- **States**:
  - Input: Default (soft border) → Focus (glowing purple ring) → Error (red border pulse) → Success (brief green border)
  - Button: Default (gradient) → Hover (elevated, brighter) → Active (pressed down) → Disabled (muted, no gradient)
  - Link Cards: Default (flat) → Hover (elevated shadow, actions visible) → Deleting (fade out)
  - Copy Button: Default (copy icon) → Hover (highlight) → Active (checkmark) → Success (green checkmark, 2s)

- **Icon Selection**:
  - `Link` for the app logo and branding
  - `Sparkle` for enhanced branding accent
  - `Lightning` for the shorten action
  - `Brain` for AI categorization features
  - `Heart` for health monitoring
  - `Tag` for category badges
  - `Pulse` for checking/loading states
  - `Copy` for copying short URLs
  - `Trash` for deleting links
  - `Check` for success confirmations
  - `Warning` for error states
  - `ChartLine` for analytics and click tracking
  - `MagnifyingGlass` for search functionality
  - `Download` for data export
  - `QrCode` for QR code generation

- **Spacing**:
  - Page padding: `p-6` on mobile, `p-8` on desktop
  - Card gaps: `gap-3` for tight grouping, `gap-6` for section separation
  - Input/button height: `h-12` for comfortable touch targets
  - Link list spacing: `space-y-3` for clear separation

- **Mobile**:
  - Single column layout throughout
  - Input and button stack vertically on very small screens (<400px)
  - Link cards show all information but with tighter spacing
  - Bottom sheet for delete confirmation instead of dialog
  - Sticky input section at top for easy access
  - Reduced title size to 28px on mobile

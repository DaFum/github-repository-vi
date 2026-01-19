# Planning Guide

HyperSmol is a powerful AI-driven URL shortener that combines elegant simplicity with sophisticated agent-based intelligence. It transforms long URLs into tiny, shareable links while providing autonomous AI agents that analyze patterns, optimize link management, predict popularity, monitor health, and deliver actionable insights - creating a self-evolving ecosystem that learns and improves over time.

**Experience Qualities**:
1. **Lightning-fast** - Users should feel the instant gratification of creating short links with zero friction or waiting
2. **Crystalline** - The interface should be clean and transparent, removing all unnecessary elements to focus purely on the task
3. **Intelligent** - AI-powered agents work autonomously in the background, analyzing patterns, predicting trends, and optimizing link management without manual intervention
4. **Evolutionary** - The system continuously learns from usage patterns and self-optimizes its performance, creating an ever-improving experience

**Complexity Level**: Complex Application (advanced functionality with AI agent orchestration, predictive analytics, and self-optimization)
This is a sophisticated agentic system with autonomous AI agents, task queue management, pattern analysis, predictive modeling, health monitoring, optimization recommendations, and real-time metrics - featuring a living kernel that evolves based on usage patterns and performance feedback.

## Essential Features

**Autonomous Agent Kernel**
- Functionality: Central AI orchestration system that manages task queues, executes AI operations, and self-optimizes performance
- Purpose: Create a living system that autonomously handles complex tasks without blocking the UI
- Trigger: Automatically processes tasks as they're enqueued from various operations
- Progression: Task queued → Priority sorted → Parallel execution (max 3 concurrent) → Metrics updated → Self-optimization
- Success criteria: Tasks complete asynchronously, metrics track performance, system adjusts concurrency based on load

**AI Pattern Analysis**
- Functionality: Deep learning agent analyzes link collections to identify usage patterns, engagement trends, and content preferences
- Purpose: Provide actionable intelligence about link behavior without manual analysis
- Trigger: User clicks "Analyze Patterns" in Agent Station
- Progression: Click analyze → Agent processes all links → Pattern recognition → Insights displayed with trend indicators
- Success criteria: Meaningful insights about click patterns, category engagement, and temporal trends are discovered and presented

**AI Optimization Engine**
- Functionality: Strategic optimization agent evaluates link collection and generates improvement recommendations
- Purpose: Guide users toward better link organization and management practices
- Trigger: User clicks "Optimize Links" in Agent Station
- Progression: Click optimize → Agent evaluates collection → Generates recommendations → Displays optimization score (0-100)
- Success criteria: 3-5 actionable recommendations provided with overall quality score

**Predictive Popularity Analysis**
- Functionality: Predictive AI analyzes each new URL and forecasts its potential engagement level
- Purpose: Help users understand which links are likely to perform well
- Trigger: Automatically on link creation
- Progression: URL created → Predictive agent analyzes → Score calculated (0-100) → Badge displays with reasoning
- Success criteria: Prediction badge shows "High/Moderate/Low Potential" with hover tooltip explaining reasoning

**Advanced Analytics Dashboard**
- Functionality: Real-time metrics display with engagement rates, categorization stats, and trend visualizations
- Purpose: Provide comprehensive overview of link performance at a glance
- Trigger: Automatically displays when links exist
- Progression: Links created → Stats cards animate in → Updates in real-time
- Success criteria: Shows total links, clicks with average, top link performance, weekly activity, and category distribution

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

- **Agent Task Queue Overflow**: Limit concurrent tasks to prevent performance degradation, queue excess tasks by priority
- **AI Service Failures**: Gracefully degrade when LLM calls fail, show fallback predictions and categorizations
- **Concurrent Agent Operations**: Prevent multiple simultaneous batch operations with loading states and disabled buttons
- **Task Timeout**: Handle long-running agent tasks with timeout and retry logic
- **Metrics Calculation Errors**: Safely handle edge cases in analytics (division by zero, empty arrays)
- **Prediction Accuracy**: Use heuristic fallbacks when full AI prediction isn't available
- **Duplicate URLs**: If the same URL is shortened twice, display the existing short link rather than creating a duplicate
- **Duplicate Custom Alias**: Prevent users from creating custom aliases that already exist with clear error message
- **Empty Input**: Disable the shorten button when input is empty to prevent accidental clicks
- **Very Long URLs**: Handle URLs up to 2000 characters gracefully without breaking layout
- **Invalid URLs**: Show helpful error messages for common mistakes (missing protocol, malformed URLs)
- **Invalid Custom Alias**: Sanitize custom aliases to only allow alphanumeric characters, hyphens, and underscores
- **Clipboard Permissions**: Handle browsers that block clipboard access with fallback manual selection
- **Empty History**: Show an engaging empty state with helpful guidance when no links exist
- **Empty Search Results**: Display clear "no matches" state when search/filter yields no results
- **Data Migration**: Automatically migrate old link data structure to include new fields (clicks, custom alias, category, healthStatus, predictedPopularity)
- **QR Code API Failure**: Handle gracefully if QR code service is unavailable
- **AI Service Unavailable**: Gracefully degrade when LLM categorization fails, showing "Uncategorized" instead
- **Health Check CORS Issues**: Handle CORS limitations by showing "unknown" status with informative messaging
- **Batch Operation Interruption**: Prevent multiple simultaneous batch operations with loading states

## Design Direction

The design evokes a living, breathing AI system - **Neo-Brutalist Cyber** aesthetic where raw technical precision meets neon-lit intelligence. Think terminal interfaces elevated to art: monochromatic foundations punctuated by electric glows, scanline effects suggesting active processing, and typography that screams precision engineering. The interface feels like you're working directly with the AI kernel - no abstraction, just pure computational power presented beautifully.

## Color Selection

An unapologetically bold, high-contrast scheme that embodies cybernetic intelligence.

- **Primary Color**: Electric Cyan `oklch(0.78 0.25 168)` - A vivid cyan that glows like active circuitry, representing AI processing and digital energy. Used for primary actions, agent status, and living systems.
- **Secondary Colors**: 
  - Deep Black `oklch(0.08 0 0)` - Pure darkness for backgrounds, creating infinite depth and focus
  - Carbon Gray `oklch(0.12 0 0)` - Slightly elevated surfaces for cards and modals
  - Steel Gray `oklch(0.22 0 0)` - Borders and subtle dividers
- **Accent Color**: Hot Magenta `oklch(0.75 0.28 330)` - An aggressive magenta for AI agent operations, pulsing indicators, and autonomous systems
- **Tertiary Accent**: Cyber Yellow `oklch(0.85 0.20 95)` - Warning states and high-performance indicators
- **Foreground/Background Pairings**:
  - Primary (Electric Cyan): Deep Black text `oklch(0.08 0 0)` - Ratio 11.2:1 ✓
  - Deep Black (Background): Pure White text `oklch(0.98 0 0)` - Ratio 19.5:1 ✓
  - Carbon Gray (Card): White text `oklch(0.98 0 0)` - Ratio 15.3:1 ✓
  - Accent (Hot Magenta): White text `oklch(0.98 0 0)` - Ratio 8.1:1 ✓

## Font Selection

Typography that communicates uncompromising technical precision with bold, architectural confidence.

- **Primary Font**: JetBrains Mono - A technical monospace font designed for code, bringing authenticity and precision to every character
- **Display Font**: Archivo Black - Ultra-bold, geometric display font for headers that commands attention
- **Typographic Hierarchy**:
  - H1 (App Title): Archivo Black / 48px desktop, 56px mobile / 0.02em letter spacing / 1.0 line height / UPPERCASE / cyan neon text-shadow
  - H2 (Section Headers): Archivo Black / 18px / 0.05em letter spacing / 1.2 line height / UPPERCASE
  - Body (URLs, Content): JetBrains Mono Regular / 12-14px / -0.01em letter spacing / 1.5 line height
  - Small (Metadata, Labels): JetBrains Mono Bold / 10px / 0.05em letter spacing / 1.4 line height / UPPERCASE / increased tracking for terminal feel

## Animations

Animations communicate system responsiveness and AI processing - snappy, purposeful, never decorative.

- **Glow Pulse**: Agent cards pulse with magenta glow (2s infinite) to show autonomous processing
- **Scanline Sweep**: Horizontal scanlines animate across surfaces suggesting active monitoring
- **Button Sweep**: Light sweep animation on hover (600ms) like energy flowing through circuits
- **Terminal Flicker**: Subtle 0.15s flicker on primary icon to evoke CRT terminals
- **Number Transitions**: Analytics numbers spring in with physics-based animation (spring stiffness: 200)
- **Card Entrance**: Links slide in with fade (200ms cubic-bezier) - fast and precise
- **Border Pulse**: Hover states thicken borders (2px to 4px) instantly for tactile feedback
- **Neon Focus**: Input focus blooms with cyan glow (box-shadow transition 150ms)

## Component Selection

- **Components**:
  - `Input`: Terminal-style inputs with sharp borders, monospace font, cyan glow on focus, 2px borders
  - `Button`: Gradient button with cyan glow, light sweep animation, uppercase mono labels
  - `Card`: Glass-morphism cards with scanline overlay, sharp corners (minimal radius), left border accents
  - `Alert Dialog`: Terminal-style modals with 2px colored borders, uppercase headers
  - `Badge`: Minimal badges with uppercase mono text, 1px borders, color-coded categories
  - `Tabs`: Brutalist tabs with active state background, uppercase labels, tabular data format
  - Custom `AgentInsights` with pulsing magenta border showing living AI system
  - Custom `PredictionBadge` with color-coded intensity (green/yellow/orange)
  - Custom `AdvancedAnalytics` with left-border color coding and tabular numbers
  
- **Customizations**:
  - Cyber grid background (repeating-linear-gradient) at 20px intervals
  - Scanline overlay on cards (repeating gradient at 3px)
  - Neon glow effects using multiple box-shadows
  - Terminal flicker animation on key icons
  - Agent pulse animation on AI operation cards
  - Minimal border-radius (0.125rem) for brutalist sharpness
  - Uppercase tracking-wide labels throughout
  - Tabular numbers for metrics
  
- **States**:
  - Input: Default (2px steel border) → Focus (cyan glow + scanline) → Error (red border pulse) → Success (brief green)
  - Button: Default (cyan glow) → Hover (light sweep + elevation) → Active (no translate) → Loading (pulse)
  - Link Cards: Default (subtle left-border) → Hover (4px left-border + primary color) → Actions reveal
  - Copy Button: Default (copy icon) → Success (checkmark + spring animation) → Reset (2s)
  - Agent Tasks: Pending (mono badge) → Running (magenta pulse) → Completed (checkmark)
  - Prediction Badge: High (green glow) → Med (yellow) → Low (orange) with uppercase labels
  
- **Icon Selection**:
  - `LinkIcon` with terminal flicker for branding
  - `Robot` with magenta pulse for AI agent kernel
  - `Lightning` for compression action
  - `Brain` for AI categorization
  - `Heart` for health monitoring
  - `Tag` for categories
  - `Pulse` for active processing states
  - `TrendUp/TrendDown` for predictions
  - `Lightbulb` for insights
  - `Fire` for high performance
  - `Clock` for temporal data
  - All icons at 12-16px for precision
  
- **Spacing**:
  - Page padding: `px-6 py-8` mobile, `px-8 py-12` desktop
  - Card gaps: `gap-3` for tight technical grouping
  - Section margins: `mb-8` for clear separation
  - Grid: 20px cyber grid background
  - Analytics grid: 2 columns mobile, 4 columns desktop with `gap-3`
  
- **Mobile**:
  - Single column layout
  - Input/button stack on small screens
  - 2-column analytics grid
  - Reduced title to 48px
  - Condensed badges with abbreviations
  - Tabs full-width
  - Touch targets minimum 44px
  - Sticky input at top

# 🎨 UI Enhancement - Visual Reference & Icon Guide

## Quick Icon Reference

### Common Healthcare Icons

#### Hospitals & Clinics
```
<i class="fas fa-hospital-user"></i>          Hospital with user
<i class="fas fa-hospital"></i>               Hospital building
<i class="fas fa-clinic-medical"></i>         Medical clinic
<i class="fas fa-building-columns"></i>       Health facility
```

#### Medical Services
```
<i class="fas fa-stethoscope"></i>            Doctor/Consultation
<i class="fas fa-flask-vial"></i>             Lab tests
<i class="fas fa-pills"></i>                  Pharmacy/Medication
<i class="fas fa-prescription-bottle"></i>    Prescription
<i class="fas fa-microscope"></i>             Lab analysis
<i class="fas fa-syringe"></i>                Injection/Vaccine
```

#### Health & Wellness
```
<i class="fas fa-heart"></i>                  Heart/Love
<i class="fas fa-heartbeat"></i>              Heartbeat/Pulse
<i class="fas fa-heart-pulse"></i>            Heart pulse
<i class="fas fa-lung"></i>                   Lungs
<i class="fas fa-brain"></i>                  Brain/Mental
<i class="fas fa-tooth"></i>                  Dental
<i class="fas fa-eye"></i>                    Vision/Eye
```

#### Patient & User
```
<i class="fas fa-user"></i>                   Single user
<i class="fas fa-users"></i>                  Multiple users
<i class="fas fa-user-doctor"></i>            Doctor
<i class="fas fa-user-nurse"></i>             Nurse
<i class="fas fa-user-circle"></i>            User profile
<i class="fas fa-user-plus"></i>              Add user
```

#### Appointments & Schedule
```
<i class="fas fa-calendar"></i>               Calendar
<i class="fas fa-calendar-check"></i>         Appointment confirmed
<i class="fas fa-calendar-xmark"></i>         Appointment cancelled
<i class="fas fa-clock"></i>                  Time/Duration
<i class="fas fa-hourglass"></i>              Waiting
```

#### Communication
```
<i class="fas fa-phone"></i>                  Phone call
<i class="fas fa-envelope"></i>               Email/Message
<i class="fas fa-bell"></i>                   Notification
<i class="fas fa-comment"></i>                Chat/Comment
```

#### Status & Actions
```
<i class="fas fa-check"></i>                  Checkmark
<i class="fas fa-check-circle"></i>           Check circle (success)
<i class="fas fa-times"></i>                  Close/Cancel
<i class="fas fa-times-circle"></i>           Close circle (error)
<i class="fas fa-exclamation-triangle"></i>   Warning
<i class="fas fa-info-circle"></i>            Information
<i class="fas fa-plus"></i>                   Add
<i class="fas fa-minus"></i>                  Remove
<i class="fas fa-edit"></i>                   Edit/Modify
<i class="fas fa-trash"></i>                  Delete
```

#### Data & Analytics
```
<i class="fas fa-chart-line"></i>             Line chart (analytics)
<i class="fas fa-chart-bar"></i>              Bar chart
<i class="fas fa-chart-pie"></i>              Pie chart
<i class="fas fa-table"></i>                  Table/Data
<i class="fas fa-download"></i>               Download
<i class="fas fa-upload"></i>                 Upload
```

#### Navigation & Menu
```
<i class="fas fa-home"></i>                   Home/Dashboard
<i class="fas fa-bars"></i>                   Menu/Hamburger
<i class="fas fa-chevron-right"></i>          Next
<i class="fas fa-chevron-left"></i>           Previous
<i class="fas fa-arrow-right"></i>            Arrow right
<i class="fas fa-arrow-left"></i>             Arrow left
```

#### Special Icons
```
<i class="fas fa-ribbon"></i>                 HIV/Support (ribbon)
<i class="fas fa-search"></i>                 Search/Find
<i class="fas fa-lock"></i>                   Security/Private
<i class="fas fa-unlock"></i>                 Unlock/Public
<i class="fas fa-download"></i>               Download report
<i class="fas fa-print"></i>                  Print
```

---

## Web Component Color Scheme

```css
/* Primary Colors */
--color-primary: #667eea        /* Purple - main actions */
--color-success: #198754        /* Green - positive actions */
--color-warning: #ffc107        /* Amber - warnings */
--color-danger: #dc3545         /* Red - destructive actions */
--color-info: #0dcaf0           /* Cyan - information */

/* Neutral Colors */
--color-light: #f8f9fa          /* Light background */
--color-dark: #333333           /* Dark text */
--color-white: #ffffff          /* White background */
--color-gray: #6c757d           /* Gray text */
```

---

## Component Usage Examples

### Using Icons with Text

```html
<!-- Button with icon -->
<button class="btn btn-primary">
  <i class="fas fa-plus me-2"></i>Add Patient
</button>

<!-- Icon only button -->
<button class="btn btn-outline-primary" title="Edit">
  <i class="fas fa-edit"></i>
</button>

<!-- Text with icon -->
<span>
  <i class="fas fa-check-circle text-success me-2"></i>
  Status: Active
</span>

<!-- Large icon -->
<i class="fas fa-hospital-user" style="font-size: 2rem;"></i>
```

### Using Icons in Cards

```html
<div class="card">
  <div class="card-body">
    <h5>
      <i class="fas fa-stethoscope text-primary me-2"></i>
      Consultations
    </h5>
    <p class="fs-3">
      <span class="text-primary">245</span>
    </p>
  </div>
</div>
```

### Icon Badges & Badges

```html
<!-- Status badge -->
<span class="badge bg-success">
  <i class="fas fa-check-circle me-1"></i>Active
</span>

<!-- Count badge -->
<span class="badge bg-danger">3</span>

<!-- Notification -->
<i class="fas fa-bell"></i>
<span class="badge bg-danger">5</span>
```

---

## Mobile Component Color Scheme

```javascript
const COLORS = {
  primary: '#667eea',      // Purple
  success: '#198754',      // Green
  warning: '#ffc107',      // Amber
  danger: '#dc3545',       // Red
  info: '#0dcaf0',         // Cyan
  light: '#f8f9fa',        // Light gray
  dark: '#333333',         // Dark
  white: '#ffffff',        // White
  gray: '#6c757d',         // Gray
};
```

---

## Mobile Icon Examples

### Using Material Community Icons

```tsx
// Doctor icon
<MaterialCommunityIcons name="stethoscope" size={24} color="#667eea" />

// Patient icon
<MaterialCommunityIcons name="hospital-box" size={32} color="#198754" />

// Appointment icon
<MaterialCommunityIcons name="calendar-check" size={20} color="#0d6efd" />

// Alert icon
<MaterialCommunityIcons name="alert-circle" size={24} color="#dc3545" />

// Success icon
<MaterialCommunityIcons name="check-circle" size={28} color="#198754" />
```

---

## Typography Reference

### Web (Bootstrap)
```html
<!-- Heading 1 -->
<h1>Main Title</h1>

<!-- Heading 2 -->
<h2>Section Title</h2>

<!-- Heading 3 -->
<h3>Subsection</h3>

<!-- Body text -->
<p>Regular paragraph text</p>

<!-- Small text -->
<small class="text-muted">Secondary text</small>

<!-- Bold text -->
<strong>Important text</strong>

<!-- Code/Technical -->
<code>code_example</code>
```

### Mobile (React Native)
```tsx
// Large heading
<Text style={styles.heading1}>Main Title</Text>

// Section heading
<Text style={styles.heading2}>Section</Text>

// Body text
<Text>Regular text</Text>

// Small text
<Text style={styles.small}>Secondary text</Text>

// Bold text
<Text style={{fontWeight: '700'}}>Important</Text>
```

---

## Spacing Reference

### Web (Bootstrap)
```
Margin: m-1 to m-5 (0.25rem to 3rem)
Padding: p-1 to p-5 (0.25rem to 3rem)
Gap: gap-1 to gap-5 (0.25rem to 3rem)

Example:
<div class="mb-3 p-4">Content</div>
```

### Mobile
```
Spacing: 8, 12, 16, 24, 32px
Padding: 8, 12, 16px
Margin: 8, 12, 16px
Gap: 8, 12, 16px
```

---

## Shadow & Elevation

### Web (Bootstrap)
```html
<div class="shadow-sm">Light shadow</div>
<div class="shadow">Normal shadow</div>
<div class="shadow-lg">Large shadow</div>
```

### Mobile
```tsx
elevation: 2,  // Light shadow
elevation: 4,  // Normal shadow
elevation: 8,  // Large shadow

shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 3,
```

---

## Border Radius Reference

### Web
```
rounded: 0.375rem (6px)
rounded-1: 0.25rem (4px)
rounded-2: 0.5rem (8px)
rounded-3: 0.75rem (12px)
rounded-4: 1rem (16px)
rounded-5: 1.5rem (24px)
rounded-circle: 50% (full circle)
```

### Mobile
```
borderRadius: 4, 8, 12, 16, 24, 50% (full)
```

---

## Button Variants

### Web
```html
<!-- Primary -->
<button class="btn btn-primary">Primary</button>

<!-- Secondary -->
<button class="btn btn-secondary">Secondary</button>

<!-- Success -->
<button class="btn btn-success">Success</button>

<!-- Warning -->
<button class="btn btn-warning">Warning</button>

<!-- Danger -->
<button class="btn btn-danger">Danger</button>

<!-- Outline -->
<button class="btn btn-outline-primary">Outline</button>

<!-- Size -->
<button class="btn btn-sm">Small</button>
<button class="btn btn-lg">Large</button>

<!-- Disabled -->
<button class="btn btn-primary" disabled>Disabled</button>
```

---

## Alert Variants

### Web
```html
<!-- Success Alert -->
<div class="alert alert-success">
  <i class="fas fa-check-circle me-2"></i>Success message
</div>

<!-- Info Alert -->
<div class="alert alert-info">
  <i class="fas fa-info-circle me-2"></i>Info message
</div>

<!-- Warning Alert -->
<div class="alert alert-warning">
  <i class="fas fa-exclamation-triangle me-2"></i>Warning message
</div>

<!-- Danger Alert -->
<div class="alert alert-danger">
  <i class="fas fa-times-circle me-2"></i>Error message
</div>
```

---

## Table Elements

### Web
```html
<!-- Hover effect -->
<table class="table table-hover">

<!-- Striped rows -->
<table class="table table-striped">

<!-- Status badges -->
<span class="badge bg-success">Active</span>
<span class="badge bg-secondary">Inactive</span>

<!-- Action buttons -->
<div class="btn-group btn-group-sm">
  <button class="btn btn-outline-primary"><i class="fas fa-eye"></i></button>
  <button class="btn btn-outline-warning"><i class="fas fa-edit"></i></button>
  <button class="btn btn-outline-danger"><i class="fas fa-trash"></i></button>
</div>
```

---

## Form Elements

### Web
```html
<!-- Text input -->
<input type="text" class="form-control" placeholder="Enter text">

<!-- Select dropdown -->
<select class="form-select">
  <option>Select an option</option>
</select>

<!-- Textarea -->
<textarea class="form-control" rows="4"></textarea>

<!-- Checkbox -->
<input type="checkbox" class="form-check-input" id="check">
<label class="form-check-label" for="check">Label</label>

<!-- Radio -->
<input type="radio" class="form-check-input" name="radio" id="radio">
<label class="form-check-label" for="radio">Label</label>

<!-- With icon label -->
<label class="form-label">
  <i class="fas fa-envelope me-1"></i>Email
</label>
<input type="email" class="form-control">
```

---

## Image Integration

### Web
```html
<!-- Card with image -->
<div class="card">
  <img src="https://images.unsplash.com/..." class="card-img-top" alt="...">
  <div class="card-body">Content</div>
</div>

<!-- Image with overlay -->
<div class="position-relative">
  <img src="..." alt="..." style="height: 200px; object-fit: cover;">
  <div class="position-absolute top-0 start-0 w-100 h-100" 
       style="background: rgba(0,0,0,0.3);"></div>
</div>

<!-- Responsive image -->
<img src="..." alt="..." class="img-fluid">
```

### Mobile
```tsx
<Image
  source={{ uri: 'https://images.unsplash.com/...' }}
  style={{ width: 200, height: 200, borderRadius: 12 }}
/>
```

---

## Responsive Grid

### Web
```html
<!-- 4 columns on desktop, 2 on tablet, 1 on mobile -->
<div class="row">
  <div class="col-lg-3 col-md-6 mb-3">Card</div>
  <div class="col-lg-3 col-md-6 mb-3">Card</div>
  <div class="col-lg-3 col-md-6 mb-3">Card</div>
  <div class="col-lg-3 col-md-6 mb-3">Card</div>
</div>

<!-- Breakpoints -->
col-12  /* 100% width (mobile) */
col-md-6 /* 50% on tablet and up */
col-lg-3 /* 25% on desktop and up */
col-xl-2 /* 20% on large desktop */
```

---

## Common Patterns

### Header with Search
```html
<nav class="navbar bg-light">
  <div class="container-fluid">
    <span class="navbar-brand">
      <i class="fas fa-hospital-user"></i> DigiHealth
    </span>
    <div class="input-group" style="max-width: 300px;">
      <span class="input-group-text"><i class="fas fa-search"></i></span>
      <input type="text" class="form-control" placeholder="Search...">
    </div>
  </div>
</nav>
```

### Metric Card with Image
```html
<div class="card h-100 border-0 shadow-sm">
  <img src="..." class="card-img-top" style="height: 120px; object-fit: cover;">
  <div class="card-body">
    <h5>
      <i class="fas fa-users text-primary me-2"></i>Total Patients
    </h5>
    <p class="fs-3 text-primary mb-0">1,234</p>
  </div>
</div>
```

### Status Timeline
```html
<div class="d-flex gap-3 mb-3">
  <div class="text-primary" style="font-size: 1.5rem;">
    <i class="fas fa-stethoscope"></i>
  </div>
  <div>
    <p class="mb-1 fw-semibold">Consultation Completed</p>
    <small class="text-muted">2 hours ago</small>
  </div>
</div>
```

---

## Customization Quick Tips

### Change All Primary Colors
```css
/* Update in CSS */
--color-primary: #new-color;
--color-primary-foreground: #text-color;
```

### Add Custom Icon
```html
<i class="fas fa-your-icon-name"></i>
```

### Change Border Radius Globally
```css
* {
  border-radius: var(--your-radius, 8px);
}
```

### Adjust Spacing
```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}
```

---

## Performance Tips

1. **Use icon CDN** - Faster than local SVGs
2. **Cache images** - Browser caches CDN images
3. **Lazy load images** - For below-fold content
4. **Minimize CSS** - Bootstrap is minified
5. **Use responsive images** - Scale appropriately
6. **Compress images** - Use optimization tools

---

## Accessibility Checklist

- ✅ Alt text on all images
- ✅ ARIA labels on buttons
- ✅ Color contrast ratio > 4.5:1
- ✅ Keyboard navigation support
- ✅ Semantic HTML
- ✅ Focus indicators
- ✅ Icon titles/tooltips
- ✅ Form labels

---

**Reference Guide Complete**
Created: June 24, 2026

# Responsive UI Component Library

A set of reusable, mobile-first responsive components for the DigiHealth clinic management system.

## Components

### ResponsiveGrid
A flexible grid layout that adapts to screen sizes.

```jsx
import { ResponsiveGrid } from '@/components/ui'

<ResponsiveGrid cols={1} sm={2} md={3} lg={4} gap={4}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
  <Card>Item 4</Card>
</ResponsiveGrid>
```

**Props:**
- `cols` (default: 1): Columns on mobile
- `sm` (default: 2): Columns on small screens (640px+)
- `md` (default: 3): Columns on medium screens (768px+)
- `lg` (default: 4): Columns on large screens (1024px+)
- `gap` (default: 1): Gap between items in rem
- `className`: Additional CSS classes

### ResponsiveCard
A card component with mobile-optimized spacing.

```jsx
import { ResponsiveCard } from '@/components/ui'
import { FaUser } from 'react-icons/fa6'

<ResponsiveCard title="User Profile" icon={FaUser} description="Manage your profile">
  <p>Card content here</p>
</ResponsiveCard>
```

**Props:**
- `title`: Card title
- `icon`: React icon component
- `description`: Optional subtitle
- `className`: Additional CSS classes
- `children`: Card content

### ResponsiveTable
A table with horizontal scroll on mobile devices.

```jsx
import { ResponsiveTable } from '@/components/ui'

<ResponsiveTable
  headers={['Name', 'Date', 'Status']}
  data={appointments}
  renderRow={(row) => (
    <>
      <td>{row.name}</td>
      <td>{row.date}</td>
      <td>{row.status}</td>
    </>
  )}
/>
```

**Props:**
- `headers`: Array of column headers
- `data`: Array of data objects
- `renderRow(row, index)`: Function to render table row cells
- `className`: Additional CSS classes

### ResponsiveForm
A form container with responsive spacing.

```jsx
import { ResponsiveForm, ResponsiveInput, ResponsiveButton } from '@/components/ui'

<ResponsiveForm onSubmit={handleSubmit}>
  <ResponsiveInput 
    label="Email" 
    type="email" 
    placeholder="you@example.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
  />
  <ResponsiveButton type="submit" variant="primary">
    Submit
  </ResponsiveButton>
</ResponsiveForm>
```

**ResponsiveForm Props:**
- `onSubmit`: Form submit handler
- `className`: Additional CSS classes
- `children`: Form fields

**ResponsiveInput Props:**
- `label`: Input label
- `type`: Input type (text, email, password, etc.)
- `placeholder`: Placeholder text
- `value`: Input value
- `onChange`: Change handler
- `required`: Whether field is required
- `error`: Error message to display
- `className`: Additional CSS classes

**ResponsiveButton Props:**
- `type`: Button type (button, submit)
- `variant`: Button style (primary, secondary, outline)
- `disabled`: Whether button is disabled
- `loading`: Show loading state
- `onClick`: Click handler
- `className`: Additional CSS classes
- `children`: Button content

## Migration Guide

### Before (Desktop-only):
```jsx
<div className="grid grid-cols-4 gap-4">
  {items.map(item => <Card>{item}</Card>)}
</div>
```

### After (Responsive):
```jsx
<ResponsiveGrid cols={1} sm={2} md={3} lg={4} gap={4}>
  {items.map(item => <Card>{item}</Card>)}
</ResponsiveGrid>
```

### Before (Table without mobile scroll):
```jsx
<table className="w-full">
  <thead>
    <tr>
      <th>Name</th>
      <th>Date</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {data.map(row => (
      <tr>
        <td>{row.name}</td>
        <td>{row.date}</td>
        <td>{row.status}</td>
      </tr>
    ))}
  </tbody>
</table>
```

### After (Responsive table):
```jsx
<ResponsiveTable
  headers={['Name', 'Date', 'Status']}
  data={data}
  renderRow={(row) => (
    <>
      <td>{row.name}</td>
      <td>{row.date}</td>
      <td>{row.status}</td>
    </>
  )}
/>
```

## Best Practices

1. **Always use touch-manipulation** on buttons and interactive elements to prevent zoom on tap
2. **Min content width**: Tables should have `min-w-[600px]` to ensure content remains readable
3. **Responsive spacing**: Use smaller gaps on mobile (gap-2) and larger on desktop (gap-4)
4. **Progressive enhancement**: Start with mobile layout, enhance for larger screens
5. **Test breakpoints**: 
   - Mobile: < 640px
   - Small: 640px - 768px
   - Medium: 768px - 1024px
   - Large: 1024px+

## Examples

### Dashboard Cards
```jsx
<ResponsiveGrid cols={1} sm={2} lg={4} gap={4}>
  <ResponsiveCard title="Appointments" icon={FaCalendar} description="Upcoming">
    <p className="text-2xl font-bold">12</p>
  </ResponsiveCard>
  <ResponsiveCard title="Patients" icon={FaUsers} description="Total">
    <p className="text-2xl font-bold">48</p>
  </ResponsiveCard>
</ResponsiveGrid>
```

### Data Tables
```jsx
<ResponsiveTable
  headers={['Patient', 'Date', 'Type', 'Status']}
  data={appointments}
  renderRow={(row) => (
    <>
      <td className="font-medium">{row.patientName}</td>
      <td>{row.appointmentDate}</td>
      <td>{row.appointmentType}</td>
      <td>
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {row.status}
        </span>
      </td>
    </>
  )}
/>
```

### Forms
```jsx
<ResponsiveForm onSubmit={handleSubmit}>
  <ResponsiveGrid cols={1} sm={2} gap={4}>
    <ResponsiveInput label="First Name" placeholder="John" />
    <ResponsiveInput label="Last Name" placeholder="Doe" />
  </ResponsiveGrid>
  <ResponsiveInput label="Email" type="email" placeholder="john@example.com" />
  <ResponsiveButton type="submit" loading={isLoading}>
    Save Changes
  </ResponsiveButton>
</ResponsiveForm>
```

import { useState } from 'react';
import { BookOpen, Plus, Search, Edit, Trash2 } from 'lucide-react';

interface HivResource {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

export default function HivResources() {
  const [resources, setResources] = useState<HivResource[]>([
    {
      id: 1,
      title: 'Understanding HIV Prevention',
      content: 'Comprehensive guide on HIV prevention methods including PrEP, PEP, and safe practices.',
      category: 'Prevention',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      title: 'ART Medication Guide',
      content: 'Information about antiretroviral therapy, adherence, and side effects management.',
      category: 'Treatment',
      createdAt: '2024-01-14T15:00:00Z'
    },
    {
      id: 3,
      title: 'Living with HIV - Mental Health',
      content: 'Resources for maintaining mental health and wellbeing while living with HIV.',
      category: 'Mental Health',
      createdAt: '2024-01-13T09:00:00Z'
    },
    {
      id: 4,
      title: 'HIV Testing Information',
      content: 'Types of HIV tests, when to get tested, and understanding your results.',
      category: 'Testing',
      createdAt: '2024-01-12T14:00:00Z'
    }
  ]);

  const categories = ['All', 'Prevention', 'Treatment', 'Mental Health', 'Testing'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredResources = selectedCategory === 'All' 
    ? resources 
    : resources.filter(r => r.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Prevention': return 'hsl(142, 76%, 36%)';
      case 'Treatment': return 'hsl(217, 91%, 60%)';
      case 'Mental Health': return 'hsl(280, 67%, 55%)';
      case 'Testing': return 'hsl(45, 93%, 47%)';
      default: return 'hsl(217, 33%, 17%)';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            HIV Resources
          </h1>
          <p style={{ color: 'hsl(215, 20%, 65%)', marginBottom: 0 }}>
            Educational resources and information
          </p>
        </div>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          background: 'hsl(142, 76%, 36%)',
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          <Plus size={16} />
          Add Resource
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '2rem', position: 'relative' }}>
        <Search size={20} style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'hsl(215, 20%, 65%)'
        }} />
        <input
          type="text"
          placeholder="Search resources..."
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 3rem',
            background: 'hsl(217, 33%, 17%)',
            border: '1px solid hsl(217, 33%, 25%)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.875rem'
          }}
        />
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: '0.5rem 1rem',
              background: selectedCategory === category ? 'hsl(142, 76%, 36%)' : 'hsl(217, 33%, 17%)',
              border: selectedCategory === category ? 'none' : '1px solid hsl(217, 33%, 25%)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Resources List */}
      <div style={{
        background: 'hsl(217, 33%, 17%)',
        borderRadius: '12px',
        border: '1px solid hsl(217, 33%, 25%)',
        overflow: 'hidden'
      }}>
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            style={{
              padding: '1.5rem',
              borderBottom: '1px solid hsl(217, 33%, 25%)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.5rem'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                  {resource.title}
                </h3>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: getCategoryColor(resource.category),
                  color: 'white'
                }}>
                  {resource.category}
                </span>
              </div>
              <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: 0 }}>
                {resource.content}
              </p>
              <p style={{ color: 'hsl(215, 20%, 65%)', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
                Added: {new Date(resource.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'hsl(217, 33%, 25%)',
                border: '1px solid hsl(217, 33%, 25%)',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                <Edit size={16} />
                Edit
              </button>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'hsl(0, 72%, 51%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

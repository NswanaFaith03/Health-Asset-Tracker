import { useState } from 'react';
import { useListHivResources, getListHivResourcesQueryKey } from '@/lib/api-client';
import { BookOpen, Search } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  Prevention: '#10b981',
  Treatment: '#3b82f6',
  'Mental Health': '#8b5cf6',
  Testing: '#f59e0b',
};

export default function HivResources() {
  const { data: resources = [], isLoading, refetch } = useListHivResources(undefined, {
    query: { queryKey: getListHivResourcesQueryKey() }
  });

  const categories = ['All', 'Prevention', 'Treatment', 'Mental Health', 'Testing'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredResources = selectedCategory === 'All' 
    ? resources 
    : resources.filter(r => r.category === selectedCategory);

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ color: '#64748b' }}>Loading resources...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1e293b', fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          HIV Resources
        </h1>
        <p style={{ color: '#64748b', marginBottom: 0 }}>
          Educational resources and information
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '2rem', position: 'relative' }}>
        <Search size={20} style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#64748b'
        }} />
        <input
          type="text"
          placeholder="Search resources..."
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 3rem',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            color: '#1e293b',
            fontSize: '0.875rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
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
              background: selectedCategory === category ? '#10b981' : '#ffffff',
              border: selectedCategory === category ? 'none' : '1px solid #e2e8f0',
              borderRadius: '8px',
              color: selectedCategory === category ? 'white' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Resources List */}
      {filteredResources.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <BookOpen size={48} style={{ color: '#64748b' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
            No resources
          </h2>
          <p style={{ color: '#64748b', margin: 0 }}>
            HIV resources will appear here
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredResources.map((resource) => {
            const categoryColor = CATEGORY_COLORS[resource.category] || CATEGORY_COLORS.Prevention;
            return (
              <div
                key={resource.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ color: '#1e293b', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                    {resource.title}
                  </h3>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: categoryColor,
                    color: 'white'
                  }}>
                    {resource.category}
                  </span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0' }}>
                  {resource.content}
                </p>
                <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Added: {new Date(resource.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

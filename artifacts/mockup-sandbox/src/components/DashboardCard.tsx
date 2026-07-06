/**
 * Professional Dashboard Card Component with CDN Images
 */
export function DashboardCard({
  title,
  icon,
  value,
  subtitle,
  color = 'primary',
  image,
}: {
  title: string;
  icon: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  image?: string;
}) {
  return (
    <div className="card h-100 border-0 shadow-sm hover-shadow transition">
      {image && (
        <div className="position-relative overflow-hidden" style={{ height: '120px' }}>
          <img
            src={image}
            alt={title}
            className="card-img-top object-fit-cover"
            style={{ objectFit: 'cover', height: '100%' }}
          />
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ background: 'rgba(0, 0, 0, 0.3)' }}
          ></div>
        </div>
      )}
      <div className={`card-body ${image ? '' : `bg-${color} bg-opacity-10`}`}>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title mb-0">{title}</h5>
          <i className={`fas ${icon} text-${color}`} style={{ fontSize: '1.5rem' }}></i>
        </div>
        <div className={`text-${color} fw-bold`} style={{ fontSize: '2rem' }}>
          {value}
        </div>
        {subtitle && <p className="text-muted small mb-0 mt-2">{subtitle}</p>}
      </div>
    </div>
  );
}

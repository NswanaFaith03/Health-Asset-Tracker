import { useEffect, useState, type ComponentType } from "react";
import { HealthcareDashboard } from "./components/HealthcareDashboard";
import { PatientForm } from "./components/PatientForm";
import { PatientsTable } from "./components/PatientsTable";
import { AlertsDemo } from "./components/AlertsDemo";

import { modules as discoveredModules } from "./.generated/mockup-components";

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

function _resolveComponent(
  mod: Record<string, unknown>,
  name: string,
): ComponentType | undefined {
  const fns = Object.values(mod).filter(
    (v) => typeof v === "function",
  ) as ComponentType[];
  return (
    (mod.default as ComponentType) ||
    (mod.Preview as ComponentType) ||
    (mod[name] as ComponentType) ||
    fns[fns.length - 1]
  );
}

function PreviewRenderer({
  componentPath,
  modules,
}: {
  componentPath: string;
  modules: ModuleMap;
}) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setComponent(null);
    setError(null);

    async function loadComponent(): Promise<void> {
      const key = `./components/mockups/${componentPath}.tsx`;
      const loader = modules[key];
      if (!loader) {
        setError(`No component found at ${componentPath}.tsx`);
        return;
      }

      try {
        const mod = await loader();
        if (cancelled) {
          return;
        }
        const name = componentPath.split("/").pop()!;
        const comp = _resolveComponent(mod, name);
        if (!comp) {
          setError(
            `No exported React component found in ${componentPath}.tsx\n\nMake sure the file has at least one exported function component.`,
          );
          return;
        }
        setComponent(() => comp);
      } catch (e) {
        if (cancelled) {
          return;
        }

        const message = e instanceof Error ? e.message : String(e);
        setError(`Failed to load preview.\n${message}`);
      }
    }

    void loadComponent();

    return () => {
      cancelled = true;
    };
  }, [componentPath, modules]);

  if (error) {
    return (
      <pre style={{ color: "red", padding: "2rem", fontFamily: "system-ui" }}>
        {error}
      </pre>
    );
  }

  if (!Component) return null;

  return <Component />;
}

function getBasePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

function getPreviewExamplePath(): string {
  const basePath = getBasePath();
  return `${basePath}/preview/ComponentName`;
}

function Gallery() {
  const [selectedPage, setSelectedPage] = useState<'dashboard' | 'form' | 'table' | 'alerts'>('dashboard');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Navigation Tabs */}
      <div className="sticky-top bg-white border-bottom shadow-sm py-3 z-3">
        <div className="container-fluid">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${selectedPage === 'dashboard' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedPage('dashboard')}
            >
              <i className="fas fa-chart-line me-2"></i>Dashboard
            </button>
            <button
              type="button"
              className={`btn ${selectedPage === 'form' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedPage('form')}
            >
              <i className="fas fa-user-plus me-2"></i>Patient Form
            </button>
            <button
              type="button"
              className={`btn ${selectedPage === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedPage('table')}
            >
              <i className="fas fa-table me-2"></i>Patients Directory
            </button>
            <button
              type="button"
              className={`btn ${selectedPage === 'alerts' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedPage('alerts')}
            >
              <i className="fas fa-bell me-2"></i>Alerts
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {selectedPage === 'dashboard' && <HealthcareDashboard />}
      {selectedPage === 'form' && <PatientForm />}
      {selectedPage === 'table' && <PatientsTable />}
      {selectedPage === 'alerts' && <AlertsDemo />}

      <style>{`
        .btn-group .btn {
          border-radius: 8px;
          margin-right: 0.5rem;
          font-weight: 600;
        }

        .z-3 {
          z-index: 1030;
        }
      `}</style>
    </div>
  );
}

function getPreviewPath(): string | null {
  const basePath = getBasePath();
  const { pathname } = window.location;
  const local =
    basePath && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length) || "/"
      : pathname;
  const match = local.match(/^\/preview\/(.+)$/);
  return match ? match[1] : null;
}

function App() {
  const previewPath = getPreviewPath();

  if (previewPath) {
    return (
      <PreviewRenderer
        componentPath={previewPath}
        modules={discoveredModules}
      />
    );
  }

  return <Gallery />;
}

export default App;

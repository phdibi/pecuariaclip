import { useProjectStore } from './hooks/useProjectStore';
import { useAuth } from './hooks/useAuth';
import Header from './components/layout/Header';
import StoryboardTab from './components/storyboard/StoryboardTab';
import UploadTab from './components/upload/UploadTab';
import EditorTab from './components/editor/EditorTab';
import AnimalDataForm from './components/animal/AnimalDataForm';
import OverlaysTab from './components/overlays/OverlaysTab';
import ExportGuideTab from './components/export/ExportGuideTab';
import ProjectStatusBar from './components/project/ProjectStatusBar';
import { theme } from './styles/theme';

const TABS = [
  { id: "storyboard", label: "STORYBOARD", icon: "🎬" },
  { id: "upload", label: "UPLOAD VÍDEOS", icon: "📹" },
  { id: "editor", label: "EDITOR", icon: "✂️" },
  { id: "dados", label: "DADOS DO ANIMAL", icon: "🐂" },
  { id: "overlays", label: "OVERLAYS", icon: "🎨" },
  { id: "export", label: "EXPORTAÇÃO", icon: "📤" },
];

export default function App() {
  const activeTab = useProjectStore((s) => s.activeTab);
  const setActiveTab = useProjectStore((s) => s.setActiveTab);
  const animalData = useProjectStore((s) => s.animalData);
  const setAnimalData = useProjectStore((s) => s.setAnimalData);

  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: "100vh", background: theme.colors.bg.primary }}>
      <Header
        tabs={TABS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={logout}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 24px" }}>
        {/* Progress status bar */}
        <div style={{ marginBottom: '16px' }}>
          <ProjectStatusBar />
        </div>

        {activeTab === "storyboard" && (
          <StoryboardTab data={animalData} />
        )}

        {activeTab === "upload" && (
          <UploadTab />
        )}

        {activeTab === "editor" && (
          <EditorTab />
        )}

        {activeTab === "dados" && (
          <div className="fade-in" style={{
            background: theme.colors.bg.secondary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: "10px", padding: "20px",
          }}>
            <AnimalDataForm data={animalData} setData={setAnimalData} />
          </div>
        )}

        {activeTab === "overlays" && (
          <OverlaysTab data={animalData} />
        )}

        {activeTab === "export" && (
          <ExportGuideTab />
        )}
      </div>
    </div>
  );
}

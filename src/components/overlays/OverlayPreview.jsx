import OverlayIntro from './OverlayIntro';
import OverlayDatacard from './OverlayDatacard';
import OverlayDeps from './OverlayDeps';
import OverlayGenealogy from './OverlayGenealogy';
import OverlayCta from './OverlayCta';

const OVERLAY_COMPONENTS = {
  intro: OverlayIntro,
  datacard: OverlayDatacard,
  deps: OverlayDeps,
  genealogy: OverlayGenealogy,
  cta: OverlayCta,
};

export default function OverlayPreview({ data, overlayType }) {
  const Component = OVERLAY_COMPONENTS[overlayType];
  if (!Component) return null;
  return <Component data={data} />;
}

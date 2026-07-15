import { useCallback, useMemo, useState } from 'react';
import AtelierShell from '../../components/atelier/AtelierShell';
import WelcomeScreen from '../../components/atelier/WelcomeScreen';
import StoneRequestScreen from '../../components/atelier/StoneRequestScreen';
import DirectionsScreen from '../../components/atelier/DirectionsScreen';
import RenderStudioScreen from '../../components/atelier/RenderStudioScreen';

const SCREENS = {
  WELCOME: 'welcome',
  STONE_REQUEST: 'stone-request',
  DIRECTIONS: 'directions',
  RENDER_STUDIO: 'render-studio',
};

const DEFAULT_RENDER_CONFIG = {
  scene: 'catalog-white',
  angle: 'front',
  format: 'square',
  count: 3,
  creativity: 'balanced',
};

export default function AtelierPage() {
  const [screen, setScreen] = useState(SCREENS.WELCOME);
  const [intakeText, setIntakeText] = useState('');
  const [requestText, setRequestText] = useState('');
  const [selectedChips, setSelectedChips] = useState([]);
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [renderConfig, setRenderConfig] = useState(DEFAULT_RENDER_CONFIG);

  const currentStep = useMemo(() => {
    if (screen === SCREENS.STONE_REQUEST) return 2;
    if (screen === SCREENS.DIRECTIONS) return 3;
    if (screen === SCREENS.RENDER_STUDIO) return 4;
    return 1;
  }, [screen]);

  const goTo = useCallback((next) => setScreen(next), []);

  const handleSelectPath = useCallback(
    (pathId) => {
      if (pathId === 'intake' && intakeText.trim()) {
        setRequestText(intakeText.trim());
      }
      setSelectedDirection(null);
      goTo(SCREENS.STONE_REQUEST);
    },
    [goTo, intakeText]
  );

  const handleToggleChip = useCallback((chip) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  }, []);

  const handleUpdateConfig = useCallback((patch) => {
    setRenderConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetAll = useCallback(() => {
    setScreen(SCREENS.WELCOME);
    setIntakeText('');
    setRequestText('');
    setSelectedChips([]);
    setSelectedDirection(null);
    setRenderConfig(DEFAULT_RENDER_CONFIG);
  }, []);

  return (
    <AtelierShell
      onReset={resetAll}
      showReset={screen !== SCREENS.WELCOME}
      currentStep={currentStep}
    >
      {screen === SCREENS.WELCOME && (
        <WelcomeScreen
          intakeText={intakeText}
          onIntakeChange={setIntakeText}
          onSelectPath={handleSelectPath}
        />
      )}

      {screen === SCREENS.STONE_REQUEST && (
        <StoneRequestScreen
          requestText={requestText}
          onRequestChange={setRequestText}
          selectedChips={selectedChips}
          onToggleChip={handleToggleChip}
          onBack={() => goTo(SCREENS.WELCOME)}
          onContinue={() => goTo(SCREENS.DIRECTIONS)}
        />
      )}

      {screen === SCREENS.DIRECTIONS && (
        <DirectionsScreen
          selectedDirection={selectedDirection}
          onSelectDirection={setSelectedDirection}
          onBack={() => goTo(SCREENS.STONE_REQUEST)}
          onContinue={() => goTo(SCREENS.RENDER_STUDIO)}
        />
      )}

      {screen === SCREENS.RENDER_STUDIO && (
        <RenderStudioScreen
          selectedDirection={selectedDirection}
          renderConfig={renderConfig}
          onUpdateConfig={handleUpdateConfig}
          onBack={() => goTo(SCREENS.DIRECTIONS)}
        />
      )}
    </AtelierShell>
  );
}

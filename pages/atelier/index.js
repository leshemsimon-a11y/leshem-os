import { useCallback, useEffect, useMemo, useState } from 'react';
import AtelierShell from '../../components/atelier/AtelierShell';
import WelcomeScreen from '../../components/atelier/WelcomeScreen';
import StoneRequestScreen from '../../components/atelier/StoneRequestScreen';
import UnderstandingScreen from '../../components/atelier/UnderstandingScreen';
import DirectionsScreen from '../../components/atelier/DirectionsScreen';
import RenderStudioScreen from '../../components/atelier/RenderStudioScreen';
import InventoryDrawer from '../../components/atelier/InventoryDrawer';
import CreationsDrawer from '../../components/atelier/CreationsDrawer';
import * as atelierBridge from '../../lib/atelier/atelierBridge';

const SCREENS = {
  WELCOME: 'welcome',
  STONE_REQUEST: 'stone-request',
  UNDERSTANDING: 'understanding',
  DIRECTIONS: 'directions',
  RENDER_STUDIO: 'render-studio',
};

const STEP_BY_SCREEN = {
  [SCREENS.WELCOME]: 1,
  [SCREENS.STONE_REQUEST]: 2,
  [SCREENS.UNDERSTANDING]: 2,
  [SCREENS.DIRECTIONS]: 3,
  [SCREENS.RENDER_STUDIO]: 4,
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

  // Stone selection (mirrors the real Work Tray store).
  const [trayItems, setTrayItems] = useState([]);
  const [stoneDrawerOpen, setStoneDrawerOpen] = useState(false);
  const [stoneDrawerQuery, setStoneDrawerQuery] = useState('');
  const [stoneDrawerSelectedIds, setStoneDrawerSelectedIds] = useState([]);

  // Universal intake (session-local; attached to the Work File on save).
  const [intakeItems, setIntakeItems] = useState([]);

  // Request + understanding.
  const [intakeText, setIntakeText] = useState('');
  const [requestText, setRequestText] = useState('');
  const [selectedChips, setSelectedChips] = useState([]);
  const [composedRequestText, setComposedRequestText] = useState('');
  const [understanding, setUnderstanding] = useState(null);

  // Directions + selection.
  const [directions, setDirections] = useState([]);
  const [selectedDirectionId, setSelectedDirectionId] = useState(null);
  const [renderConfig, setRenderConfig] = useState(DEFAULT_RENDER_CONFIG);

  // Work File (real Design Project) + "היצירות שלי".
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [creationsOpen, setCreationsOpen] = useState(false);
  const [creations, setCreations] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');

  // Hydrate the real Work Tray after mount (SSR-safe: localStorage-backed).
  useEffect(() => {
    setTrayItems(atelierBridge.getCurrentTray());
  }, []);

  const centerStone = useMemo(() => atelierBridge.getCenterStoneItem(trayItems), [trayItems]);
  const selectedDirectionObj = useMemo(
    () => directions.find((d) => d.conceptId === selectedDirectionId) || null,
    [directions, selectedDirectionId]
  );
  const drawerStones = useMemo(
    () => atelierBridge.searchStones(stoneDrawerQuery),
    [stoneDrawerQuery, stoneDrawerOpen]
  );

  const goTo = useCallback((next) => setScreen(next), []);

  // --- Welcome -------------------------------------------------------------
  const handleSelectPath = useCallback(
    (pathId) => {
      if (pathId === 'intake' && intakeText.trim()) {
        setRequestText(intakeText.trim());
      }
      goTo(SCREENS.STONE_REQUEST);
    },
    [goTo, intakeText]
  );

  // --- Stone drawer ----------------------------------------------------------
  const openStoneDrawer = useCallback(() => {
    setStoneDrawerSelectedIds(atelierBridge.getSelectedStoneCardIds(trayItems));
    setStoneDrawerQuery('');
    setStoneDrawerOpen(true);
  }, [trayItems]);

  const toggleStoneSelect = useCallback((id) => {
    setStoneDrawerSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const confirmStoneDrawer = useCallback(() => {
    const all = atelierBridge.listAvailableStones();
    const chosen = stoneDrawerSelectedIds
      .map((id) => all.find((stone) => stone.id === id))
      .filter(Boolean);
    atelierBridge.commitStoneSelection(chosen);
    setTrayItems(atelierBridge.getCurrentTray());
    setStoneDrawerOpen(false);
    setScreen(SCREENS.STONE_REQUEST);
  }, [stoneDrawerSelectedIds]);

  // --- Universal intake --------------------------------------------------
  const handleAddFiles = useCallback((fileList) => {
    const files = Array.from(fileList || []);
    const newItems = files.map((f) => atelierBridge.classifyFile(f));
    setIntakeItems((prev) => [...prev, ...newItems]);
  }, []);

  const handleAddText = useCallback((text) => {
    const item = atelierBridge.classifyPastedText(text);
    if (item) setIntakeItems((prev) => [...prev, item]);
  }, []);

  const handleRemoveIntakeItem = useCallback((id) => {
    setIntakeItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target && target.previewUrl && typeof URL !== 'undefined' && URL.revokeObjectURL) {
        try {
          URL.revokeObjectURL(target.previewUrl);
        } catch (e) {
          // non-fatal
        }
      }
      return prev.filter((it) => it.id !== id);
    });
  }, []);

  const handleToggleChip = useCallback((chip) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  }, []);

  // --- Stone + request -> understanding -----------------------------------
  const canContinueFromStoneRequest = Boolean(
    centerStone && atelierBridge.hasCreationIntent({ requestText, selectedChips, intakeItems })
  );

  const handleContinueToUnderstanding = useCallback(() => {
    if (!canContinueFromStoneRequest) return;
    const composed = atelierBridge.composeRequestText(requestText, selectedChips);
    setComposedRequestText(composed);
    const u = atelierBridge.buildUnderstanding({ requestText: composed, trayItems, intakeItems });
    setUnderstanding(u);
    goTo(SCREENS.UNDERSTANDING);
  }, [requestText, selectedChips, trayItems, intakeItems, canContinueFromStoneRequest, goTo]);

  // --- Understanding -> real direction generation + first Work File save --
  const handleConfirmUnderstanding = useCallback(async () => {
    if (!understanding || !understanding.product || saving) return;
    setSaving(true);
    setSaveNotice('');
    try {
      const dirs = atelierBridge.generateDirectionsFor({
        product: understanding.product,
        style: understanding.style,
        trayItems,
        intakeItems,
        requestText: composedRequestText,
      });
      setDirections(dirs);
      setSelectedDirectionId(null);

      let brief = atelierBridge.buildBriefFromAtelier({
        product: understanding.product,
        style: understanding.style,
        trayItems,
        intakeItems,
        requestText: composedRequestText,
        directions: dirs,
        selectedDirectionId: null,
      });
      const saved = atelierBridge.saveAtelierWorkFile({
        existingProjectId: currentProjectId,
        product: understanding.product,
        trayItems,
        brief,
      });
      if (!saved || !saved.id) throw new Error('save-failed');
      setCurrentProjectId(saved.id);

      const persisted = await atelierBridge.persistIntakeFiles({
        projectId: saved.id,
        intakeItems,
      });
      setIntakeItems(persisted.items);
      brief = atelierBridge.buildBriefFromAtelier({
        product: understanding.product,
        style: understanding.style,
        trayItems,
        intakeItems: persisted.items,
        requestText: composedRequestText,
        directions: dirs,
        selectedDirectionId: null,
      });
      atelierBridge.saveAtelierWorkFile({
        existingProjectId: saved.id,
        product: understanding.product,
        trayItems,
        brief,
      });
      if (persisted.failedNames.length) {
        setSaveNotice(`היצירה נשמרה. ${persisted.failedNames.length} קבצים נשארו זמניים וניתן לצרף שוב.`);
      }
      goTo(SCREENS.DIRECTIONS);
    } catch (e) {
      setSaveNotice('לא הצלחתי לשמור את היצירה כרגע. אפשר לנסות שוב.');
    } finally {
      setSaving(false);
    }
  }, [understanding, trayItems, intakeItems, composedRequestText, currentProjectId, goTo, saving]);

  const handleRegenerateDirections = useCallback(() => {
    if (!understanding || !understanding.product) return;
    const dirs = atelierBridge.generateDirectionsFor({
      product: understanding.product,
      style: understanding.style,
      trayItems,
      intakeItems,
      requestText: composedRequestText,
    });
    setDirections(dirs);
    setSelectedDirectionId(null);
  }, [understanding, trayItems, intakeItems, composedRequestText]);

  // --- Directions -> select + persist -------------------------------------
  const persistDirectionSelection = useCallback(
    (conceptId, dirsList) => {
      if (!understanding) return;
      const brief = atelierBridge.buildBriefFromAtelier({
        product: understanding.product,
        style: understanding.style,
        trayItems,
        intakeItems,
        requestText: composedRequestText,
        directions: dirsList,
        selectedDirectionId: conceptId,
      });
      const saved = atelierBridge.saveAtelierWorkFile({
        existingProjectId: currentProjectId,
        product: understanding.product,
        trayItems,
        brief,
      });
      if (saved) setCurrentProjectId(saved.id);
    },
    [understanding, trayItems, intakeItems, composedRequestText, currentProjectId]
  );

  const handleSelectDirection = useCallback((conceptId) => {
    setSelectedDirectionId(conceptId);
  }, []);

  const handleChooseDirection = useCallback(
    (conceptId) => {
      persistDirectionSelection(conceptId, directions);
      goTo(SCREENS.RENDER_STUDIO);
    },
    [persistDirectionSelection, directions, goTo]
  );

  // --- Reset / restart -----------------------------------------------------
  const resetAll = useCallback(() => {
    intakeItems.forEach((it) => {
      if (it.previewUrl && typeof URL !== 'undefined' && URL.revokeObjectURL) {
        try {
          URL.revokeObjectURL(it.previewUrl);
        } catch (e) {
          // non-fatal
        }
      }
    });
    atelierBridge.clearStoneSelection();
    setTrayItems([]);
    setIntakeItems([]);
    setIntakeText('');
    setRequestText('');
    setSelectedChips([]);
    setComposedRequestText('');
    setUnderstanding(null);
    setDirections([]);
    setSelectedDirectionId(null);
    setRenderConfig(DEFAULT_RENDER_CONFIG);
    setCurrentProjectId(null);
    setSaving(false);
    setSaveNotice('');
    setScreen(SCREENS.WELCOME);
  }, [intakeItems]);

  // --- היצירות שלי -----------------------------------------------------
  const openCreations = useCallback(() => {
    setCreations(atelierBridge.listAtelierWorkFiles());
    setCreationsOpen(true);
  }, []);

  const openCreation = useCallback((id) => {
    const result = atelierBridge.resumeAtelierWorkFile(id);
    if (!result) return;
    const { project, screen: resumeScreen } = result;
    const brief = project.brief || {};
    setTrayItems(project.trayItems || []);
    setCurrentProjectId(project.id);
    setRequestText(brief.designGoal || '');
    setComposedRequestText(brief.designGoal || '');
    setSelectedChips([]);
    setIntakeItems(Array.isArray(brief.references) ? brief.references : []);
    setUnderstanding(
      atelierBridge.buildUnderstanding({
        requestText: brief.designGoal || '',
        trayItems: project.trayItems || [],
        intakeItems: Array.isArray(brief.references) ? brief.references : [],
      })
    );
    setDirections(Array.isArray(brief.concepts) ? brief.concepts : []);
    setSelectedDirectionId(brief.selectedConceptId || null);
    setCreationsOpen(false);
    setScreen(resumeScreen);
  }, []);

  const currentStep = STEP_BY_SCREEN[screen] || 1;

  return (
    <AtelierShell
      onReset={resetAll}
      showReset={screen !== SCREENS.WELCOME}
      currentStep={currentStep}
      onOpenCreations={openCreations}
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
          centerStone={centerStone}
          onOpenStoneDrawer={openStoneDrawer}
          requestText={requestText}
          onRequestChange={setRequestText}
          selectedChips={selectedChips}
          onToggleChip={handleToggleChip}
          intakeItems={intakeItems}
          onAddFiles={handleAddFiles}
          onAddText={handleAddText}
          onRemoveIntakeItem={handleRemoveIntakeItem}
          onBack={() => goTo(SCREENS.WELCOME)}
          onContinue={handleContinueToUnderstanding}
          canContinue={canContinueFromStoneRequest}
        />
      )}

      {screen === SCREENS.UNDERSTANDING && (
        <UnderstandingScreen
          understanding={understanding}
          stoneTitle={centerStone ? atelierBridge.trayItemTitle(centerStone) : null}
          intakeItems={intakeItems}
          onRemoveIntakeItem={handleRemoveIntakeItem}
          onEditRequest={() => goTo(SCREENS.STONE_REQUEST)}
          onReplaceStone={() => {
            goTo(SCREENS.STONE_REQUEST);
            openStoneDrawer();
          }}
          onBack={() => goTo(SCREENS.STONE_REQUEST)}
          onConfirm={handleConfirmUnderstanding}
          busy={saving}
          notice={saveNotice}
        />
      )}

      {screen === SCREENS.DIRECTIONS && (
        <DirectionsScreen
          directions={directions}
          selectedDirection={selectedDirectionId}
          onSelectDirection={handleSelectDirection}
          onBack={() => goTo(SCREENS.UNDERSTANDING)}
          onContinue={handleChooseDirection}
          onRegenerate={handleRegenerateDirections}
        />
      )}

      {screen === SCREENS.RENDER_STUDIO && (
        <RenderStudioScreen
          direction={selectedDirectionObj}
          renderConfig={renderConfig}
          onUpdateConfig={(patch) => setRenderConfig((prev) => ({ ...prev, ...patch }))}
          onBack={() => goTo(SCREENS.DIRECTIONS)}
        />
      )}

      <InventoryDrawer
        open={stoneDrawerOpen}
        stones={drawerStones}
        query={stoneDrawerQuery}
        onQueryChange={setStoneDrawerQuery}
        selectedIds={stoneDrawerSelectedIds}
        onToggle={toggleStoneSelect}
        onConfirm={confirmStoneDrawer}
        onClose={() => setStoneDrawerOpen(false)}
      />

      <CreationsDrawer
        open={creationsOpen}
        creations={creations}
        onOpenCreation={openCreation}
        onClose={() => setCreationsOpen(false)}
      />
    </AtelierShell>
  );
}

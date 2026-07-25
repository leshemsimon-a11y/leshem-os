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
import {
  createDefaultDesignConfig,
  normalizeDesignConfig,
} from '../../lib/atelier/livingAtelier';

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

// Clean 11A.2 — presentation choices only. The engine's interpretation and
// quality tier are no longer client-facing: the manufacturing spec is
// authoritative and quality is fixed at the studio's standard.
const DEFAULT_RENDER_CONFIG = {
  scene: 'catalog',
  angle: 'threeQuarter',
  format: 'square',
  count: 1,
};

const EMPTY_RENDER_STATE = {
  status: 'idle',
  message: '',
  results: [],
  progress: 0,
  total: 0,
  renderPackage: null,
};

export default function AtelierPage() {
  const [screen, setScreen] = useState(SCREENS.WELCOME);

  // Real Work Tray selection.
  const [trayItems, setTrayItems] = useState([]);
  const [stoneDrawerOpen, setStoneDrawerOpen] = useState(false);
  const [stoneDrawerQuery, setStoneDrawerQuery] = useState('');
  const [stoneDrawerSelectedIds, setStoneDrawerSelectedIds] = useState([]);

  // Universal intake, persisted through the existing Asset Library on save.
  const [intakeItems, setIntakeItems] = useState([]);

  // Request + structured living controls.
  const [intakeText, setIntakeText] = useState('');
  const [requestText, setRequestText] = useState('');
  const [designConfig, setDesignConfig] = useState(createDefaultDesignConfig);
  const [composedRequestText, setComposedRequestText] = useState('');
  const [understanding, setUnderstanding] = useState(null);

  // Directions + real render bridge.
  const [directions, setDirections] = useState([]);
  const [selectedDirectionId, setSelectedDirectionId] = useState(null);
  const [renderConfig, setRenderConfig] = useState(DEFAULT_RENDER_CONFIG);
  const [renderState, setRenderState] = useState(EMPTY_RENDER_STATE);

  // Real Work File + creations drawer.
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [creationsOpen, setCreationsOpen] = useState(false);
  const [creations, setCreations] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');

  useEffect(() => {
    setTrayItems(atelierBridge.getCurrentTray());
  }, []);

  const centerStone = useMemo(() => atelierBridge.getCenterStoneItem(trayItems), [trayItems]);
  const selectedDirectionObj = useMemo(
    () => directions.find((direction) => direction.conceptId === selectedDirectionId) || null,
    [directions, selectedDirectionId]
  );
  const drawerStones = useMemo(
    () => atelierBridge.searchStones(stoneDrawerQuery),
    [stoneDrawerQuery, stoneDrawerOpen]
  );
  const liveUnderstanding = useMemo(
    () =>
      atelierBridge.buildUnderstanding({
        requestText,
        trayItems,
        intakeItems,
        designConfig,
      }),
    [requestText, trayItems, intakeItems, designConfig]
  );

  const goTo = useCallback((next) => setScreen(next), []);

  const handleDesignConfigChange = useCallback((patch) => {
    setDesignConfig((previous) => normalizeDesignConfig({ ...previous, ...patch }));
  }, []);

  // --- Welcome -------------------------------------------------------------
  const handleSelectPath = useCallback(
    (pathId) => {
      if (pathId === 'intake' && intakeText.trim()) setRequestText(intakeText.trim());
      goTo(SCREENS.STONE_REQUEST);
      if (pathId === 'stone' || pathId === 'inventory') {
        setStoneDrawerSelectedIds(atelierBridge.getSelectedStoneCardIds(trayItems));
        setStoneDrawerQuery('');
        setStoneDrawerOpen(true);
      }
    },
    [goTo, intakeText, trayItems]
  );

  // --- Inventory drawer ----------------------------------------------------
  const openStoneDrawer = useCallback(() => {
    setStoneDrawerSelectedIds(atelierBridge.getSelectedStoneCardIds(trayItems));
    setStoneDrawerQuery('');
    setStoneDrawerOpen(true);
  }, [trayItems]);

  const toggleStoneSelect = useCallback((id) => {
    setStoneDrawerSelectedIds((previous) =>
      previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id]
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

  // --- Intake --------------------------------------------------------------
  const handleAddFiles = useCallback((fileList) => {
    const files = Array.from(fileList || []);
    setIntakeItems((previous) => [...previous, ...files.map((file) => atelierBridge.classifyFile(file))]);
  }, []);

  const handleAddText = useCallback((text) => {
    const item = atelierBridge.classifyPastedText(text);
    if (item) setIntakeItems((previous) => [...previous, item]);
  }, []);

  const handleRemoveIntakeItem = useCallback((id) => {
    setIntakeItems((previous) => {
      const target = previous.find((item) => item.id === id);
      if (target?.previewUrl && typeof URL !== 'undefined' && URL.revokeObjectURL) {
        try {
          URL.revokeObjectURL(target.previewUrl);
        } catch (error) {
          // Non-fatal preview cleanup.
        }
      }
      return previous.filter((item) => item.id !== id);
    });
  }, []);

  // --- Request -> understanding -------------------------------------------
  const canContinueFromStoneRequest = Boolean(
    centerStone &&
      liveUnderstanding.product &&
      atelierBridge.hasCreationIntent({ requestText, intakeItems })
  );

  const handleContinueToUnderstanding = useCallback(() => {
    if (!canContinueFromStoneRequest) return;
    const composed = atelierBridge.composeRequestText(requestText, []);
    setComposedRequestText(composed);
    setUnderstanding(liveUnderstanding);
    goTo(SCREENS.UNDERSTANDING);
  }, [canContinueFromStoneRequest, requestText, liveUnderstanding, goTo]);

  // --- Understanding -> directions + first Work File save -----------------
  const handleConfirmUnderstanding = useCallback(async () => {
    if (!understanding?.product || saving) return;
    setSaving(true);
    setSaveNotice('');
    try {
      const dirs = atelierBridge.generateDirectionsFor({
        product: understanding.product,
        style: understanding.style,
        trayItems,
        intakeItems,
        requestText: composedRequestText,
        designConfig: understanding.designConfig || designConfig,
      });
      setDirections(dirs);
      setSelectedDirectionId(null);
      setRenderState(EMPTY_RENDER_STATE);

      let brief = atelierBridge.buildBriefFromAtelier({
        product: understanding.product,
        style: understanding.style,
        trayItems,
        intakeItems,
        requestText: composedRequestText,
        directions: dirs,
        selectedDirectionId: null,
        designConfig: understanding.designConfig || designConfig,
      });
      const saved = atelierBridge.saveAtelierWorkFile({
        existingProjectId: currentProjectId,
        product: understanding.product,
        trayItems,
        brief,
      });
      if (!saved?.id) throw new Error('save-failed');
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
        designConfig: understanding.designConfig || designConfig,
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
    } catch (error) {
      setSaveNotice('לא הצלחתי לשמור את היצירה כרגע. אפשר לנסות שוב.');
    } finally {
      setSaving(false);
    }
  }, [
    understanding,
    saving,
    trayItems,
    intakeItems,
    composedRequestText,
    designConfig,
    currentProjectId,
    goTo,
  ]);

  const handleRegenerateDirections = useCallback(() => {
    if (!understanding?.product) return;
    const dirs = atelierBridge.generateDirectionsFor({
      product: understanding.product,
      style: understanding.style,
      trayItems,
      intakeItems,
      requestText: composedRequestText,
      designConfig: understanding.designConfig || designConfig,
    });
    setDirections(dirs);
    setSelectedDirectionId(null);
    setRenderState(EMPTY_RENDER_STATE);
  }, [understanding, trayItems, intakeItems, composedRequestText, designConfig]);

  // --- Directions -> persist selection ------------------------------------
  const persistDirectionSelection = useCallback(
    (conceptId, dirsList) => {
      if (!understanding) return null;
      const brief = atelierBridge.buildBriefFromAtelier({
        product: understanding.product,
        style: understanding.style,
        trayItems,
        intakeItems,
        requestText: composedRequestText,
        directions: dirsList,
        selectedDirectionId: conceptId,
        designConfig: understanding.designConfig || designConfig,
      });
      const saved = atelierBridge.saveAtelierWorkFile({
        existingProjectId: currentProjectId,
        product: understanding.product,
        trayItems,
        brief,
      });
      if (saved) setCurrentProjectId(saved.id);
      return saved;
    },
    [understanding, trayItems, intakeItems, composedRequestText, designConfig, currentProjectId]
  );

  const handleChooseDirection = useCallback(
    (conceptId) => {
      setSelectedDirectionId(conceptId);
      persistDirectionSelection(conceptId, directions);
      setRenderState(EMPTY_RENDER_STATE);
      goTo(SCREENS.RENDER_STUDIO);
    },
    [persistDirectionSelection, directions, goTo]
  );

  // --- Real render bridge --------------------------------------------------
  const handleGenerateRender = useCallback(async () => {
    if (!currentProjectId || !selectedDirectionId) return;
    setRenderState((previous) => ({ ...previous, status: 'preparing', message: '' }));
    const prepared = atelierBridge.prepareAtelierRender({
      projectId: currentProjectId,
      renderConfig,
    });
    if (!prepared?.package) {
      setRenderState((previous) => ({
        ...previous,
        status: 'error',
        message: 'לא ניתן היה להכין את בריף ההדמיה.',
      }));
      return;
    }

    const total = Math.max(1, Math.min(3, Number(renderConfig.count) || 1));
    const newResults = [];
    setRenderState((previous) => ({
      ...previous,
      status: 'generating',
      renderPackage: prepared.package,
      progress: 1,
      total,
      message: '',
    }));

    try {
      for (let index = 0; index < total; index += 1) {
        setRenderState((previous) => ({
          ...previous,
          status: 'generating',
          progress: index + 1,
          total,
        }));
        // eslint-disable-next-line no-await-in-loop
        const response = await fetch('/api/atelier/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prepared.package.finalPromptEnglish,
            negativePrompt: prepared.package.negativePromptEnglish,
            aspectRatio: prepared.package.recommendedAspectRatio,
            quality: 'ultra',
          }),
        });
        // eslint-disable-next-line no-await-in-loop
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.ok || !payload.imageBase64) {
          throw new Error(payload.message || 'מנוע ההדמיה לא החזיר תוצאה.');
        }
        const dataUrl = `data:${payload.mimeType || 'image/jpeg'};base64,${payload.imageBase64}`;
        const result = { dataUrl, saved: false };
        newResults.push(result);
        setRenderState((previous) => ({
          ...previous,
          results: [...previous.results, result],
          status: 'saving',
        }));
        // eslint-disable-next-line no-await-in-loop
        await atelierBridge.persistAtelierRenderResult({
          projectId: currentProjectId,
          dataUrl,
          provider: payload.provider,
          prompt: prepared.package.finalPromptEnglish,
          index,
        });
        result.saved = true;
        setRenderState((previous) => ({
          ...previous,
          results: previous.results.map((item) =>
            item.dataUrl === dataUrl ? { ...item, saved: true } : item
          ),
          status: index + 1 < total ? 'generating' : 'done',
        }));
      }
      setRenderState((previous) => ({
        ...previous,
        status: 'done',
        message: `${newResults.length} תוצאות נוצרו ונשמרו בתיק היצירה.`,
      }));
    } catch (error) {
      setRenderState((previous) => ({
        ...previous,
        status: 'error',
        renderPackage: prepared.package,
        message: error instanceof Error ? error.message : 'ההדמיה לא הושלמה.',
      }));
    }
  }, [currentProjectId, selectedDirectionId, renderConfig]);

  // --- Reset ---------------------------------------------------------------
  const resetAll = useCallback(() => {
    intakeItems.forEach((item) => {
      if (item.previewUrl && typeof URL !== 'undefined' && URL.revokeObjectURL) {
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch (error) {
          // Non-fatal cleanup.
        }
      }
    });
    atelierBridge.clearStoneSelection();
    setTrayItems([]);
    setIntakeItems([]);
    setIntakeText('');
    setRequestText('');
    setDesignConfig(createDefaultDesignConfig());
    setComposedRequestText('');
    setUnderstanding(null);
    setDirections([]);
    setSelectedDirectionId(null);
    setRenderConfig(DEFAULT_RENDER_CONFIG);
    setRenderState(EMPTY_RENDER_STATE);
    setCurrentProjectId(null);
    setSaving(false);
    setSaveNotice('');
    setScreen(SCREENS.WELCOME);
  }, [intakeItems]);

  // --- My creations --------------------------------------------------------
  const openCreations = useCallback(() => {
    setCreations(atelierBridge.listAtelierWorkFiles());
    setCreationsOpen(true);
  }, []);

  const openCreation = useCallback((id) => {
    const result = atelierBridge.resumeAtelierWorkFile(id);
    if (!result) return;
    const { project, screen: resumeScreen } = result;
    const brief = project.brief || {};
    const restoredConfig = atelierBridge.getDesignConfigFromBrief(brief);
    const restoredItems = Array.isArray(brief.references) ? brief.references : [];
    const restoredRequest = brief.designGoal || '';
    const restoredUnderstanding = atelierBridge.buildUnderstanding({
      requestText: restoredRequest,
      trayItems: project.trayItems || [],
      intakeItems: restoredItems,
      designConfig: restoredConfig,
    });

    setTrayItems(project.trayItems || []);
    setCurrentProjectId(project.id);
    setRequestText(restoredRequest);
    setComposedRequestText(restoredRequest);
    setDesignConfig(restoredConfig);
    setIntakeItems(restoredItems);
    setUnderstanding(restoredUnderstanding);
    setDirections(Array.isArray(brief.concepts) ? brief.concepts : []);
    setSelectedDirectionId(brief.selectedConceptId || null);
    setRenderConfig(DEFAULT_RENDER_CONFIG);
    setRenderState(EMPTY_RENDER_STATE);
    setCreationsOpen(false);
    setScreen(resumeScreen);
  }, []);

  const currentStep = STEP_BY_SCREEN[screen] || 1;

  // Material identity of the center stone, passed to every preview so a
  // quartz never previews as a diamond, plus the live production spec line.
  const centerSnapshot = (centerStone && centerStone.snapshot) || {};
  const activeConfig = (understanding && understanding.designConfig) || designConfig;
  const activeSpecSummaryHe =
    (understanding && understanding.specSummaryHe) || liveUnderstanding.specSummaryHe || '';

  return (
    <AtelierShell
      onReset={resetAll}
      showReset={screen !== SCREENS.WELCOME}
      currentStep={currentStep}
      onOpenCreations={openCreations}
    >
      {screen === SCREENS.WELCOME ? (
        <WelcomeScreen
          intakeText={intakeText}
          onIntakeChange={setIntakeText}
          onSelectPath={handleSelectPath}
        />
      ) : null}

      {screen === SCREENS.STONE_REQUEST ? (
        <StoneRequestScreen
          centerStone={centerStone}
          trayItems={trayItems}
          onOpenStoneDrawer={openStoneDrawer}
          requestText={requestText}
          onRequestChange={setRequestText}
          designConfig={designConfig}
          onDesignConfigChange={handleDesignConfigChange}
          liveUnderstanding={liveUnderstanding}
          intakeItems={intakeItems}
          onAddFiles={handleAddFiles}
          onAddText={handleAddText}
          onRemoveIntakeItem={handleRemoveIntakeItem}
          onBack={() => goTo(SCREENS.WELCOME)}
          onContinue={handleContinueToUnderstanding}
          canContinue={canContinueFromStoneRequest}
        />
      ) : null}

      {screen === SCREENS.UNDERSTANDING ? (
        <UnderstandingScreen
          understanding={understanding}
          centerStone={centerStone}
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
      ) : null}

      {screen === SCREENS.DIRECTIONS ? (
        <DirectionsScreen
          directions={directions}
          selectedDirection={selectedDirectionId}
          designConfig={activeConfig}
          stoneShape={centerSnapshot.shape}
          stoneType={centerSnapshot.stoneType}
          stoneTypeHe={centerSnapshot.stoneTypeHe}
          specSummaryHe={activeSpecSummaryHe}
          onSelectDirection={setSelectedDirectionId}
          onBack={() => goTo(SCREENS.UNDERSTANDING)}
          onContinue={handleChooseDirection}
          onRegenerate={handleRegenerateDirections}
        />
      ) : null}

      {screen === SCREENS.RENDER_STUDIO ? (
        <RenderStudioScreen
          direction={selectedDirectionObj}
          designConfig={activeConfig}
          stoneShape={centerSnapshot.shape}
          stoneType={centerSnapshot.stoneType}
          stoneTypeHe={centerSnapshot.stoneTypeHe}
          specSummaryHe={activeSpecSummaryHe}
          renderConfig={renderConfig}
          onUpdateConfig={(patch) => setRenderConfig((previous) => ({ ...previous, ...patch }))}
          onBack={() => goTo(SCREENS.DIRECTIONS)}
          onGenerate={handleGenerateRender}
          renderState={renderState}
        />
      ) : null}

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

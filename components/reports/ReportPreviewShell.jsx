/**
 * components/reports/ReportPreviewShell.jsx  —  v4.4
 *
 * Changes in v4.4:
 *   + Preview zoom controls: 75% / 100% / 125% / 150%
 *     Applied via CSS transform:scale() + compensating marginBottom.
 *     Print CSS already has transform:none !important — zero print impact.
 *   + Canvas signature pad:
 *     Native HTML5 Canvas, no external packages.
 *     Supports mouse + touch (with preventDefault to suppress scroll).
 *     Output: canvas.toDataURL("image/png") → stored in signatureImageUrl.
 *     Accessible via "✍ Draw Signature" button in the zoom bar.
 *   ~ Print button unchanged.
 *   ~ Props interface unchanged: { reportType, reportData }
 *   ~ setField passed in for signature pad to write to credentials
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { C }     from "../../lib/constants";
import { JewelryValuationReport } from "./templates/JewelryValuationReport";
import { InHouseStoneReport }     from "./templates/InHouseStoneReport";

// ─── Zoom levels ──────────────────────────────────────────────────────────────
const ZOOM_LEVELS = [0.75, 1.0, 1.25, 1.5];
const ZOOM_LABELS = { 0.75: "75%", 1.0: "100%", 1.25: "125%", 1.5: "150%" };

// ─── Canvas signature pad ─────────────────────────────────────────────────────
/**
 * Native canvas-based signature pad. No external packages.
 *
 * Touch handling:
 *   - touchstart / touchmove / touchend listeners added with { passive: false }
 *     so e.preventDefault() can suppress page scroll while signing.
 *   - Both mouse and touch coordinates normalised via getBoundingClientRect.
 *
 * @param {function} onSave   Called with base64 PNG data URL of the signature.
 * @param {function} onClose  Dismiss the pad without saving.
 */
function SignaturePad({ onSave, onClose }) {
  const canvasRef  = useRef(null);
  const isDrawing  = useRef(false);
  const lastPos    = useRef({ x: 0, y: 0 });
  const [isEmpty,  setIsEmpty]  = useState(true);

  // Get canvas position relative to client coordinates
  const getPos = (clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width  / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top)  * scaleY,
    };
  };

  const startDraw = (clientX, clientY) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(clientX, clientY);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    lastPos.current = pos;
    isDrawing.current = true;
    setIsEmpty(false);
  };

  const draw = (clientX, clientY) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(clientX, clientY);
    ctx.lineWidth   = 2;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.strokeStyle = "#36454F";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => { isDrawing.current = false; };

  const handleClear = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (!canvasRef.current || isEmpty) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onSave(dataUrl);
    onClose();
  };

  // Add touch listeners with { passive: false } so preventDefault works
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e) => {
      e.preventDefault();
      const t = e.touches[0];
      startDraw(t.clientX, t.clientY);
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      const t = e.touches[0];
      draw(t.clientX, t.clientY);
    };
    const onTouchEnd = (e) => {
      e.preventDefault();
      endDraw();
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove",  onTouchMove,  { passive: false });
    canvas.addEventListener("touchend",   onTouchEnd,   { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove",  onTouchMove);
      canvas.removeEventListener("touchend",   onTouchEnd);
    };
  }, []);

  return (
    <div
      style={{
        position:   "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(54,69,79,0.55)",
        zIndex:     1000,
        display:    "flex",
        alignItems: "center",
        justifyContent: "center",
        padding:    16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background:   "#FAF9F6",
          borderRadius: 10,
          padding:      "20px 24px",
          width:        "100%",
          maxWidth:     480,
          boxShadow:    "0 20px 60px rgba(54,69,79,0.25)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontFamily: C.dat, fontSize: 15, fontWeight: 700, color: C.ch }}>
            Draw Signature
          </span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.chl, fontSize: 18, lineHeight: 1 }}
          >✕</button>
        </div>

        {/* Hint */}
        <p style={{ fontFamily: C.heb, fontSize: 11, color: C.chl, marginBottom: 10, lineHeight: 1.5 }}>
          Sign in the box below. Use mouse or touch.
        </p>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={432}
          height={120}
          onMouseDown={(e) => startDraw(e.clientX, e.clientY)}
          onMouseMove={(e) => draw(e.clientX, e.clientY)}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          style={{
            width:        "100%",
            height:       120,
            border:       "1px solid rgba(54,69,79,0.25)",
            borderRadius: 6,
            background:   "#fff",
            cursor:       "crosshair",
            display:      "block",
            touchAction:  "none",   // Prevents browser pan gesture
          }}
        />

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button
            onClick={handleClear}
            style={PAD_BTN_SEC}
          >
            Clear
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={onClose}
            style={PAD_BTN_SEC}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isEmpty}
            style={{
              ...PAD_BTN_PRI,
              opacity: isEmpty ? 0.5 : 1,
              cursor:  isEmpty ? "not-allowed" : "pointer",
            }}
          >
            Use Signature
          </button>
        </div>
      </div>
    </div>
  );
}

const PAD_BTN_PRI = {
  height:       40,
  padding:      "0 18px",
  background:   "#36454F",
  color:        "#FAF9F6",
  border:       "none",
  borderRadius: 6,
  cursor:       "pointer",
  fontFamily:   "'DM Sans',Helvetica,Arial,sans-serif",
  fontSize:     13,
  fontWeight:   600,
};
const PAD_BTN_SEC = {
  height:       40,
  padding:      "0 14px",
  background:   "transparent",
  color:        "#4a5c68",
  border:       "1px solid rgba(54,69,79,0.22)",
  borderRadius: 6,
  cursor:       "pointer",
  fontFamily:   "'DM Sans',Helvetica,Arial,sans-serif",
  fontSize:     13,
};

// ─── ZoomBar ──────────────────────────────────────────────────────────────────
function ZoomBar({ zoom, onZoom, onSignature }) {
  return (
    <div
      className="no-print"
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        marginBottom:   12,
        gap:            10,
        flexWrap:       "wrap",
      }}
    >
      {/* Zoom pills */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontFamily: C.heb, fontSize: 11, color: C.chl, marginRight: 6 }}>
          Preview:
        </span>
        {ZOOM_LEVELS.map((z) => (
          <button
            key={z}
            onClick={() => onZoom(z)}
            style={{
              height:       28,
              padding:      "0 10px",
              border:       `1px solid ${z === zoom ? C.gd : "rgba(54,69,79,0.18)"}`,
              borderRadius: 5,
              background:   z === zoom ? "rgba(197,179,88,0.12)" : "transparent",
              color:        z === zoom ? "#8a7a2a" : C.chl,
              fontFamily:   C.dat,
              fontSize:     11,
              fontWeight:   z === zoom ? 700 : 400,
              cursor:       "pointer",
            }}
          >
            {ZOOM_LABELS[z]}
          </button>
        ))}
      </div>

      {/* Right controls */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onSignature}
          style={{
            height:       34,
            padding:      "0 14px",
            border:       "1px solid rgba(54,69,79,0.22)",
            borderRadius: 6,
            background:   "transparent",
            color:        C.chl,
            fontFamily:   C.heb,
            fontSize:     12,
            cursor:       "pointer",
            display:      "flex",
            alignItems:   "center",
            gap:          6,
          }}
        >
          ✍ Draw Signature
        </button>
        <button
          onClick={() => window.print()}
          style={{
            height:       34,
            padding:      "0 14px",
            border:       "none",
            borderRadius: 6,
            background:   C.ch,
            color:        "#FAF9F6",
            fontFamily:   C.heb,
            fontSize:     12,
            fontWeight:   600,
            cursor:       "pointer",
            display:      "flex",
            alignItems:   "center",
            gap:          6,
          }}
        >
          🖨 Print / Save PDF
        </button>
      </div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div
      style={{
        width:          "210mm",
        maxWidth:       "100%",
        minHeight:      "120mm",
        background:     "#F5F3EF",
        border:         "1px dashed rgba(54,69,79,0.18)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
      }}
    >
      <p style={{ fontFamily: C.heb, fontSize: 13, color: "rgba(54,69,79,0.38)", margin: 0 }}>
        Select a report type to preview
      </p>
    </div>
  );
}

// ─── ReportPreviewShell ───────────────────────────────────────────────────────
/**
 * @param {string}   reportType
 * @param {object}   reportData
 * @param {function} setField    — passed in to allow signature pad to write
 *                                 credentials.signatureImageUrl
 */
export function ReportPreviewShell({ reportType, reportData, setField }) {
  const [zoom,        setZoom]        = useState(1.0);
  const [showSigPad,  setShowSigPad]  = useState(false);

  const handleSignatureSave = useCallback((dataUrl) => {
    if (setField) setField("credentials.signatureImageUrl", dataUrl);
  }, [setField]);

  return (
    <div>
      {/* Canvas signature pad modal */}
      {showSigPad && (
        <SignaturePad
          onSave={handleSignatureSave}
          onClose={() => setShowSigPad(false)}
        />
      )}

      {/* Zoom controls + print button (screen only) */}
      <ZoomBar
        zoom={zoom}
        onZoom={setZoom}
        onSignature={() => setShowSigPad(true)}
      />

      {/*
        ZOOM: transform:scale() doesn't affect layout flow.
        For zoom < 1: add negative marginBottom to collapse the extra space.
        For zoom > 1: overflow:auto on the outer wrapper allows scroll.
        The .printable-container INSIDE the template receives
        transform:none !important from printCss.js — zero print impact.
      */}
      <div
        style={{
          overflowX: zoom > 1 ? "auto" : "visible",
          overflowY: zoom > 1 ? "visible" : "visible",
        }}
      >
        <div
          style={{
            transform:       `scale(${zoom})`,
            transformOrigin: "top left",
            width:           `${100 / zoom}%`,
            // For zoom < 1: remove extra layout height left by transform
            marginBottom:    zoom < 1 ? `${(zoom - 1) * 297}mm` : 0,
          }}
        >
          {reportType === "jewelry_valuation" && (
            <JewelryValuationReport data={reportData} />
          )}
          {reportType === "inhouse_stone" && (
            <InHouseStoneReport data={reportData} />
          )}
          {!reportType && <EmptyState />}
        </div>
      </div>
    </div>
  );
}

/**
 * components/inventory/InventoryDrawer.jsx  —  v5.5
 *
 * Task 1 — Inventory drawer edit mode (SAVE RETAINED):
 *   Two modes: view (default) and edit. "ערוך פריט" switches to edit.
 *   Real Airtable items (id starts with "rec") save editable fields through
 *   the existing server-side route PATCH /api/airtable/update-stone.
 *   Demo items are NOT saveable (no real record) and say so.
 *   Save result: success / error message inline. No fake success.
 *
 * Task 2 — Media editing (URL fields only — no file upload yet):
 *   Edit mode allows entering/updating:
 *     • main image URL          (imageUrl)
 *     • additional image/media  (additionalMediaUrl)
 *     • video URL               (videoUrl)
 *     • certificate PDF / URL   (certPdfUrl)
 *   View mode shows the gallery, video link and certificate link when present.
 *
 * Task 7 — Terminology:
 *   "הוסף למגש עבודה" / "השתמש במחשבון" / "צור תעודה" / "ערוך פריט"
 *   "עיצוב תכשיט — בקרוב" (disabled). No "Basket", no "הגדרה".
 *
 * Props:
 *   item {object}         — normalized inventory item
 *   isSelected {bool}
 *   onClose {function}
 *   onAddToBasket {function(item)}     — internal prop name; UI says "מגש עבודה"
 *   onUseInCalculator {function(item)}
 *   onCreateCertificate {function(item)}
 *   onItemUpdated {function(updatedItem)} — called after a successful save
 */

import { useState, useEffect } from "react";
import { C } from "../../lib/constants";
import { PRODUCT_TYPE_LABELS, PRODUCT_TYPE_ICONS, PRODUCT_TYPE_GRADIENTS } from "./InventoryCard";
import { toAppHe, toCanonical, LABEL_MAP } from "../../lib/labels/productLabels";

const HEB  = C.heb;
const DAT  = C.dat;
const SER  = C.ser;

const PRODUCT_TYPES = [
  ["natural_diamond",     "Natural Diamond"],
  ["lab_grown_diamond",   "Lab Grown Diamond"],
  ["fancy_color_diamond", "Fancy Color Diamond"],
  ["colored_gemstone",    "Colored Gemstone"],
  ["stone_pair_set",      "Matched Pair / Set"],
  ["stone_parcel",        "Stone Parcel"],
  ["jewelry_part",        "Jewelry Part / Component"],
  ["finished_jewelry",    "Finished Jewelry"],
];

const INVENTORY_LAYERS = ["Physical Stock", "Virtual Supplier Stock", "Client-Owned Item"];
const STATUSES         = ["במלאי", "שמור", "נמכר", "ממתין", "ארכיון"];
const INTENDED_USES    = ["Sale", "Mount", "Assembly", "Earrings", "Pair", "Consignment", "Display", "Other"];

// ─── UI primitives ────────────────────────────────────────────────────────────
function FieldRow({ label, value, mono, link }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"5px 0", borderBottom:"0.5px solid rgba(54,69,79,0.07)" }}>
      <span style={{ fontFamily:DAT, fontSize:9.5, fontWeight:700, color:C.chl, letterSpacing:"0.1em", textTransform:"uppercase", width:118, flexShrink:0, paddingTop:1 }}>
        {label}
      </span>
      {link
        ? <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontFamily:mono?"'Courier New',monospace":DAT, fontSize:12.5, color:C.gd, wordBreak:"break-all", textDecoration:"underline" }}>{value}</a>
        : <span style={{ fontFamily:mono?"'Courier New',monospace":DAT, fontSize:12.5, color:C.ch, lineHeight:1.5, wordBreak:"break-all" }}>{value}</span>
      }
    </div>
  );
}

function SectionHead({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, margin:"16px 0 8px" }}>
      <div style={{ width:2, height:11, background:C.gd, borderRadius:1 }} />
      <span style={{ fontFamily:DAT, fontSize:9, fontWeight:800, color:C.chl, letterSpacing:"0.18em", textTransform:"uppercase" }}>{label}</span>
      <div style={{ flex:1, height:"0.5px", background:"rgba(54,69,79,0.1)" }} />
    </div>
  );
}

function EditField({ label, value, onChange, type = "text", options, placeholder, rows }) {
  const inputStyle = {
    width:"100%", border:"1px solid rgba(54,69,79,0.2)", borderRadius:6,
    padding:"6px 10px", fontFamily:DAT, fontSize:12.5, color:C.ch, background:"#fff",
    outline:"none", boxSizing:"border-box", lineHeight:1.5,
    transition:"border-color 0.14s",
  };
  const labelStyle = {
    fontFamily:DAT, fontSize:9.5, fontWeight:700, color:C.chl,
    letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:4, display:"block",
  };
  return (
    <div style={{ marginBottom:10 }}>
      <label style={labelStyle}>{label}</label>
      {options ? (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, appearance:"none", cursor:"pointer" }}
          onFocus={(e) => { e.currentTarget.style.borderColor=C.gd; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor="rgba(54,69,79,0.2)"; }}
        >
          <option value="">—</option>
          {options.map(([v, l]) => <option key={v} value={v}>{l || v}</option>)}
        </select>
      ) : rows ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          style={{ ...inputStyle, resize:"vertical", height:"auto" }}
          onFocus={(e) => { e.currentTarget.style.borderColor=C.gd; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor="rgba(54,69,79,0.2)"; }}
        />
      ) : (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor=C.gd; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor="rgba(54,69,79,0.2)"; }}
        />
      )}
    </div>
  );
}

function EditFieldPair({ label1, value1, onChange1, label2, value2, onChange2, type1="text", type2="text", placeholder1, placeholder2 }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:0 }}>
      <EditField label={label1} value={value1} onChange={onChange1} type={type1} placeholder={placeholder1} />
      <EditField label={label2} value={value2} onChange={onChange2} type={type2} placeholder={placeholder2} />
    </div>
  );
}

// ─── Action button helper ─────────────────────────────────────────────────────
function ActionButton({ icon, label, helper, onClick, style = {}, disabled, title }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      style={{
        display:"flex", flexDirection:"column", alignItems:"flex-start", gap:3,
        padding:"10px 14px", background:"transparent",
        border:"1px solid rgba(54,69,79,0.18)", borderRadius:8,
        cursor:disabled ? "not-allowed" : "pointer", opacity:disabled ? 0.5 : 1,
        flex:"1 1 130px", minWidth:120, transition:"border-color 0.13s, background 0.13s",
        textAlign:"left", ...style,
      }}
      onMouseEnter={(e) => { if (!disabled && !style.borderColor) e.currentTarget.style.borderColor=C.gd; }}
      onMouseLeave={(e) => { if (!disabled && !style.borderColor) e.currentTarget.style.borderColor="rgba(54,69,79,0.18)"; else if (!disabled) e.currentTarget.style.borderColor=style.borderColor; }}
    >
      <span style={{ fontFamily:HEB, fontSize:13, fontWeight:700, color:C.ch, display:"flex", alignItems:"center", gap:6 }}>
        {icon && <span style={{ fontSize:15 }}>{icon}</span>}
        {label}
      </span>
      {helper && <span style={{ fontFamily:HEB, fontSize:10, color:C.chl, lineHeight:1.5 }}>{helper}</span>}
    </button>
  );
}

// ─── InventoryDrawer ──────────────────────────────────────────────────────────
export function InventoryDrawer({
  item,
  isSelected,
  onClose,
  onAddToBasket,
  onUseInCalculator,
  onCreateCertificate,
  onItemUpdated,
}) {
  const [mode,      setMode]      = useState("view");
  const [edits,     setEdits]     = useState({});
  const [saving,    setSaving]    = useState(false);
  const [saveMsg,   setSaveMsg]   = useState(null); // { type: "ok"|"err", text }
  const [activeImg, setActiveImg] = useState(0);

  // Reset state when item changes
  useEffect(() => {
    setMode("view");
    setEdits({});
    setSaveMsg(null);
    setActiveImg(0);
  }, [item?.id]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") { if (mode === "edit") setMode("view"); else onClose(); } };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, mode]);

  if (!item) return null;

  const ptLabel  = (() => {
    // v5.4.2: Use Hebrew app label from canonical mapping.
    // Falls back to PRODUCT_TYPE_LABELS (English) then item.stoneType then "Item".
    const canonical = toCanonical(item.productType) ?? item.productType;
    if (canonical && LABEL_MAP[canonical]) return LABEL_MAP[canonical].appLabelHe;
    return PRODUCT_TYPE_LABELS[item.productType] || item.stoneType || "Item";
  })();
  const gradient = PRODUCT_TYPE_GRADIENTS[item.productType] || "linear-gradient(140deg,#f0ede8,#d8d0c0)";
  const icon     = PRODUCT_TYPE_ICONS[item.productType]  || "💎";
  const isDemo   = Boolean(item.isDemo);
  const isReal   = !isDemo && item.id && item.id.startsWith("rec");

  const allImgs = item.inventoryImages && item.inventoryImages.length > 0
    ? item.inventoryImages
    : item.thumbnailUrl ? [item.thumbnailUrl] : [];

  const caratStr = item.caratWeight ? `${parseFloat(item.caratWeight).toFixed(2)} ct` : null;
  const specParts = [caratStr, item.color, item.clarity].filter(Boolean);
  const fancySpec = item.fancyColorIntensity
    ? `${item.fancyColorIntensity} ${item.fancyColorHue || ""}`.trim()
    : null;

  // ── Edit helpers ────────────────────────────────────────────────────────────
  function ef(field) { return edits[field] !== undefined ? edits[field] : (item[field] ?? ""); }
  function set(field) { return (v) => setEdits(prev => ({ ...prev, [field]: v })); }

  // ── Save to Airtable ────────────────────────────────────────────────────────
  async function handleSave() {
    if (isDemo) {
      setSaveMsg({ type:"err", text:"שמירה אינה זמינה לפריטי Demo — אין ID אמיתי ב-Airtable." });
      return;
    }
    if (!isReal) {
      setSaveMsg({ type:"err", text:"שמירת עריכה ל-Airtable תתווסף בשלב הבא — אין ID תקין." });
      return;
    }

    setSaving(true);
    setSaveMsg(null);

    const payload = { id: item.id, ...edits };

    try {
      const r = await fetch("/api/airtable/update-stone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok || data.error) {
        setSaveMsg({ type:"err", text: data.error || "שגיאה בשמירה ל-Airtable." });
      } else {
        setSaveMsg({ type:"ok", text:"✓ הפריט עודכן בהצלחה ב-Airtable." });
        onItemUpdated?.({ ...item, ...edits });
        setMode("view");
        setEdits({});
        setTimeout(() => setSaveMsg(null), 3500);
      }
    } catch (err) {
      setSaveMsg({ type:"err", text: "שגיאת רשת — לא ניתן להתחבר ל-Airtable." });
    } finally {
      setSaving(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(54,69,79,0.55)", zIndex:1200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background:C.iv, borderRadius:12, width:"100%", maxWidth:700, maxHeight:"94vh", overflowY:"auto", boxShadow:"0 24px 70px rgba(54,69,79,0.28)", display:"flex", flexDirection:"column" }}>

        {/* ── Mode tab strip ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px 0", flexShrink:0 }}>
          {/* Mode pills */}
          <div style={{ display:"flex", gap:4 }}>
            {["view","edit"].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); if (m === "view") setEdits({}); }}
                style={{ height:32, padding:"0 14px", border:`1.5px solid ${mode===m?C.gd:"rgba(54,69,79,0.16)"}`, borderRadius:7, background:mode===m?"rgba(197,179,88,0.1)":"transparent", cursor:"pointer", fontFamily:HEB, fontSize:12, fontWeight:mode===m?700:400, color:mode===m?"#7a6a1a":C.chm, transition:"all 0.13s" }}
              >
                {m === "view" ? "👁 תצוגה" : "✏️ ערוך פריט"}
              </button>
            ))}
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.chl, fontSize:22, lineHeight:1, padding:"0 4px" }}>✕</button>
        </div>

        {/* ── Header ── */}
        <div style={{ padding:"12px 20px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
            <span style={{ fontFamily:DAT, fontSize:10, fontWeight:700, color:C.chl, letterSpacing:"0.12em", textTransform:"uppercase" }}>{ptLabel}</span>
            {isDemo && <span style={{ padding:"1px 6px", borderRadius:8, fontSize:8.5, fontFamily:DAT, fontWeight:700, background:"rgba(197,179,88,0.1)", color:"#9a7820", border:"1px dashed rgba(197,179,88,0.5)" }}>DEMO</span>}
          </div>
          <div style={{ fontFamily:SER, fontSize:19, fontWeight:700, color:C.ch, lineHeight:1.2, marginBottom:2 }}>
            {mode === "edit" ? (ef("name") || ptLabel) : (item.name || item.sku || ptLabel)}
          </div>
          {item.sku && <div style={{ fontFamily:"'Courier New',monospace", fontSize:11, color:C.chl, marginBottom:4 }}>{item.sku}</div>}
        </div>

        {/* ── Save message banner ── */}
        {saveMsg && (
          <div style={{ margin:"10px 20px 0", padding:"9px 14px", borderRadius:7, background:saveMsg.type==="ok"?"rgba(138,171,142,0.12)":"rgba(176,64,64,0.08)", border:`1px solid ${saveMsg.type==="ok"?"rgba(138,171,142,0.5)":"rgba(176,64,64,0.3)"}`, fontFamily:HEB, fontSize:12.5, color:saveMsg.type==="ok"?"#2e6636":"#b04040" }}>
            {saveMsg.text}
          </div>
        )}

        {/* ── Main content ── */}
        <div style={{ padding:"14px 20px 20px", overflow:"auto", flex:1 }}>

          {/* ── VIEW MODE ── */}
          {mode === "view" && (
            <>
              {/* Media gallery */}
              <div style={{ display:"flex", gap:14, marginBottom:16, flexWrap:"wrap" }}>
                <div style={{ flexShrink:0 }}>
                  {allImgs.length > 0 ? (
                    <>
                      <img src={allImgs[activeImg]} alt={item.name || ptLabel} style={{ width:120, height:120, objectFit:"cover", borderRadius:8, border:"1px solid rgba(54,69,79,0.14)", display:"block" }} />
                      {allImgs.length > 1 && (
                        <div style={{ display:"flex", gap:4, marginTop:5 }}>
                          {allImgs.slice(0,4).map((url,idx) => (
                            <button key={idx} onClick={()=>setActiveImg(idx)} style={{ padding:0, border:`2px solid ${idx===activeImg?C.gd:"rgba(54,69,79,0.14)"}`, borderRadius:4, cursor:"pointer", background:"none" }}>
                              <img src={url} alt="" style={{ width:28, height:28, objectFit:"cover", display:"block", borderRadius:2 }} />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div style={{ width:120, height:120, background:gradient, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:48 }}>{icon}</div>
                      <div style={{ fontFamily:HEB, fontSize:9, color:C.chx, textAlign:"center", marginTop:4, lineHeight:1.5 }}>אין תמונה<br/>לסוג פריט זה</div>
                    </>
                  )}
                </div>
                <div style={{ flex:1, minWidth:150 }}>
                  {caratStr && <div style={{ fontFamily:DAT, fontSize:26, fontWeight:700, color:C.ch, lineHeight:1, marginBottom:4 }}>{caratStr}</div>}
                  {fancySpec && <div style={{ fontFamily:DAT, fontSize:14, color:"#7a6a1a", fontWeight:600, marginBottom:4 }}>{fancySpec}</div>}
                  {specParts.length > 0 && <div style={{ fontFamily:DAT, fontSize:13, color:C.chm, marginBottom:8 }}>{specParts.join(" · ")}</div>}
                  {item.cutForm && <div style={{ fontFamily:DAT, fontSize:12, color:C.chl, marginBottom:8 }}>{item.cutForm}</div>}
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
                    {item.inventoryLayer && <span style={{ padding:"2px 8px", borderRadius:10, fontSize:10, fontFamily:DAT, fontWeight:700, background:"rgba(197,179,88,0.1)", color:"#7a6a1a", border:"1px solid rgba(197,179,88,0.35)", lineHeight:1.8 }}>{item.inventoryLayer}</span>}
                    {item.inventoryStatus && <span style={{ padding:"2px 8px", borderRadius:10, fontSize:10, fontFamily:HEB, fontWeight:600, background:"rgba(138,171,142,0.15)", color:"#3d7a44", border:"1px solid rgba(138,171,142,0.45)", lineHeight:1.8 }}>{item.inventoryStatus}</span>}
                  </div>
                  {item.costUsd != null && <div style={{ fontFamily:DAT, fontSize:22, fontWeight:700, color:C.ch }}>${Number(item.costUsd).toLocaleString("en-US")}</div>}
                  {(item.videoUrl || item.certPdfUrl) && (
                    <div style={{ display:"flex", flexDirection:"column", gap:4, marginTop:8 }}>
                      {item.videoUrl    && <a href={item.videoUrl}    target="_blank" rel="noopener noreferrer" style={{ fontFamily:HEB, fontSize:11.5, color:C.gd, textDecoration:"none" }}>▶ צפה בסרטון</a>}
                      {item.certPdfUrl  && <a href={item.certPdfUrl}  target="_blank" rel="noopener noreferrer" style={{ fontFamily:HEB, fontSize:11.5, color:C.gd, textDecoration:"none" }}>📄 פתח תעודה PDF</a>}
                    </div>
                  )}
                </div>
              </div>

              {/* Gemological details */}
              <SectionHead label="נתונים גמולוגיים" />
              <FieldRow label="סוג אבן"      value={toAppHe(item.stoneType)} />
              <FieldRow label="סוג מוצר"     value={(() => { const c = toCanonical(item.productType); return c && LABEL_MAP[c] ? LABEL_MAP[c].appLabelHe : (PRODUCT_TYPE_LABELS[item.productType] || item.productType); })()} />
              <FieldRow label="צבע"          value={item.color} />
              <FieldRow label="ניקיון"        value={item.clarity} />
              <FieldRow label="Cut Grade"    value={item.cutGrade} />
              <FieldRow label="צורה / חיתוך" value={[toAppHe(item.cutForm), item.stoneShape].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(" · ") || null} />
              <FieldRow label="ליטוש"         value={item.polish} />
              <FieldRow label="סימטריה"       value={item.symmetry} />
              <FieldRow label="פלורסנציה"     value={[item.fluorescenceIntensity, item.fluorescenceColor].filter(Boolean).join(" · ") || null} />
              <FieldRow label="שיטת גידול"   value={item.growthMethod} />
              {item.fancyColorIntensity && <FieldRow label="צבע פאנסי" value={`${item.fancyColorIntensity} ${item.fancyColorHue||""}`.trim()} />}

              {(item.caratWeight || item.stoneCount || item.measLength) && (
                <>
                  <SectionHead label="מידות" />
                  {item.caratWeight && <FieldRow label="משקל קראט"  value={`${parseFloat(item.caratWeight).toFixed(2)} ct`} />}
                  {item.stoneCount  && <FieldRow label="כמות אבנות"   value={item.stoneCount} />}
                  {(item.measLength || item.measWidth || item.measHeight) && (
                    <FieldRow label="מידות (מ״מ)"
                      value={[item.measLength, item.measWidth, item.measHeight].filter(Boolean).map(v=>parseFloat(v).toFixed(2)).join(" × ") + " mm"}
                    />
                  )}
                </>
              )}

              {(item.certLab || item.certNumber || item.laserInscription || item.certImageUrl || item.certPdfUrl) && (
                <>
                  <SectionHead label="תעודה ואימות" />
                  <FieldRow label="מעבדה"             value={item.certLab} />
                  <FieldRow label="מספר תעודה"        value={item.certNumber || item.laserInscription} mono />
                  <FieldRow label="קישור אימות"       value={item.verificationUrl} link />
                  {item.certImageUrl && (
                    <div style={{ marginTop:8 }}>
                      <img src={item.certImageUrl} alt="Certificate" style={{ maxWidth:130, borderRadius:5, border:"1px solid rgba(54,69,79,0.12)", opacity:0.9 }} />
                      <a href={item.certImageUrl} target="_blank" rel="noopener noreferrer" style={{ display:"block", fontFamily:HEB, fontSize:11, color:C.gd, marginTop:5, textDecoration:"none" }}>📄 פתח תעודה</a>
                    </div>
                  )}
                </>
              )}

              {(item.supplierName || item.ownerClient || item.intendedUse) && (
                <>
                  <SectionHead label="מקור ובעלות" />
                  <FieldRow label="ספק"              value={item.supplierName} />
                  <FieldRow label="בעלים / לקוח"    value={item.ownerClient} />
                  <FieldRow label="מיועד לשימוש"    value={toAppHe(item.intendedUse)} />
                  <FieldRow label="שכבת מלאי"       value={toAppHe(item.inventoryLayer)} />
                  <FieldRow label="מיקום"            value={item.physicalLocation} />
                  <FieldRow label="מזכר / קונסיגנציה" value={item.memoNumber} mono />
                </>
              )}

              {item.internalNotes && (
                <>
                  <SectionHead label="Notes" />
                  <p style={{ fontFamily:HEB, fontSize:12.5, color:C.chm, lineHeight:1.7, margin:0, padding:"10px 14px", background:"rgba(240,237,232,0.6)", borderRadius:6, borderLeft:`2px solid ${C.gd}` }}>{item.internalNotes}</p>
                </>
              )}

              <div style={{ marginTop:16, padding:"8px 12px", background:"rgba(54,69,79,0.04)", borderRadius:6 }}>
                <div style={{ fontFamily:DAT, fontSize:9, color:C.chx, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:2 }}>Airtable Record ID</div>
                <div style={{ fontFamily:"'Courier New',monospace", fontSize:11, color:C.chm }}>{item.id || "—"}</div>
              </div>

              {/* Action buttons */}
              <div style={{ marginTop:18, paddingTop:14, borderTop:"1px solid rgba(54,69,79,0.1)" }}>
                <div style={{ fontFamily:HEB, fontSize:10.5, color:C.chl, marginBottom:10 }}>בחר פעולה לביצוע עם הפריט:</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <ActionButton
                    icon="🗂" label={isSelected ? "✓ במגש עבודה" : "הוסף למגש עבודה"}
                    helper="הוסף לרשימת העבודה הזמנית"
                    onClick={() => onAddToBasket(item)}
                    style={isSelected ? { background:"rgba(197,179,88,0.08)", borderColor:C.gd } : {}}
                  />
                  <ActionButton
                    icon="🔢" label="השתמש במחשבון"
                    helper="טען נתוני אבן / רכיב למחשבון"
                    onClick={() => onUseInCalculator(item)}
                    style={{ borderColor:"rgba(197,179,88,0.5)", background:"rgba(197,179,88,0.05)" }}
                  />
                  <ActionButton
                    icon="📋" label="צור תעודה"
                    helper="פתח עורך תעודות עם נתוני הפריט"
                    onClick={() => onCreateCertificate(item)}
                    style={{ borderColor:"rgba(138,171,142,0.55)", background:"rgba(138,171,142,0.06)" }}
                  />
                  <ActionButton
                    icon="💍" label="עיצוב תכשיט — בקרוב"
                    helper="פתח כלי עיצוב (בפיתוח)"
                    onClick={() => {}} disabled
                  />
                </div>
                <button onClick={onClose} style={{ marginTop:10, height:36, width:"100%", background:"transparent", border:"1px solid rgba(54,69,79,0.15)", borderRadius:7, cursor:"pointer", fontFamily:HEB, fontSize:12.5, color:C.chl }}>סגור</button>
              </div>
            </>
          )}

          {/* ── EDIT MODE ── */}
          {mode === "edit" && (
            <>
              {isDemo && (
                <div style={{ padding:"10px 14px", background:"rgba(197,179,88,0.07)", border:"1px dashed rgba(197,179,88,0.4)", borderRadius:7, fontFamily:HEB, fontSize:12, color:"#7a6a1a", marginBottom:16, lineHeight:1.6 }}>
                  ℹ️ פריט Demo — ניתן לערוך שדות אך שמירה ל-Airtable לא זמינה לפריטי Demo.
                </div>
              )}
              {!isReal && !isDemo && (
                <div style={{ padding:"10px 14px", background:"rgba(54,69,79,0.05)", border:"1px solid rgba(54,69,79,0.18)", borderRadius:7, fontFamily:HEB, fontSize:12, color:C.chm, marginBottom:16, lineHeight:1.6 }}>
                  ℹ️ שמירת עריכה ל-Airtable תתווסף בשלב הבא.
                </div>
              )}

              {/* Identity */}
              <SectionHead label="פרטי פריט" />
              <EditField label="שם / כותרת"      value={ef("name")}         onChange={set("name")}         placeholder="e.g. Round Brilliant Diamond 1.02ct" />
              <EditFieldPair
                label1="סוג מוצר"   value1={ef("productType")}    onChange1={set("productType")}
                label2="סוג אבן"    value2={ef("stoneType")}       onChange2={set("stoneType")}
                type1="select-placeholder" type2="text"
                placeholder2="Diamond, Sapphire…"
              />
              {/* productType as a real select */}
              <div style={{ marginBottom:10 }}>
                <label style={{ fontFamily:DAT, fontSize:9.5, fontWeight:700, color:C.chl, letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:4, display:"block" }}>סוג מוצר</label>
                <select value={ef("productType") || ""} onChange={e=>set("productType")(e.target.value)} style={{ width:"100%", border:"1px solid rgba(54,69,79,0.2)", borderRadius:6, padding:"6px 10px", fontFamily:DAT, fontSize:12.5, color:C.ch, background:"#fff", outline:"none", boxSizing:"border-box", appearance:"none" }}>
                  <option value="">—</option>
                  {PRODUCT_TYPES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              <EditFieldPair
                label1="שכבת מלאי"   value1={ef("inventoryLayer")}  onChange1={set("inventoryLayer")}
                label2="סטטוס"        value2={ef("inventoryStatus")} onChange2={set("inventoryStatus")}
              />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:0 }}>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontFamily:DAT, fontSize:9.5, fontWeight:700, color:C.chl, letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:4, display:"block" }}>שכבת מלאי</label>
                  <select value={ef("inventoryLayer")||""} onChange={e=>set("inventoryLayer")(e.target.value)} style={{ width:"100%", border:"1px solid rgba(54,69,79,0.2)", borderRadius:6, padding:"6px 10px", fontFamily:DAT, fontSize:12.5, color:C.ch, background:"#fff", outline:"none", boxSizing:"border-box", appearance:"none" }}>
                    <option value="">—</option>
                    {INVENTORY_LAYERS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontFamily:DAT, fontSize:9.5, fontWeight:700, color:C.chl, letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:4, display:"block" }}>סטטוס</label>
                  <select value={ef("inventoryStatus")||""} onChange={e=>set("inventoryStatus")(e.target.value)} style={{ width:"100%", border:"1px solid rgba(54,69,79,0.2)", borderRadius:6, padding:"6px 10px", fontFamily:DAT, fontSize:12.5, color:C.ch, background:"#fff", outline:"none", boxSizing:"border-box", appearance:"none" }}>
                    <option value="">—</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom:10 }}>
                <label style={{ fontFamily:DAT, fontSize:9.5, fontWeight:700, color:C.chl, letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:4, display:"block" }}>מיועד לשימוש</label>
                <select value={ef("intendedUse")||""} onChange={e=>set("intendedUse")(e.target.value)} style={{ width:"100%", border:"1px solid rgba(54,69,79,0.2)", borderRadius:6, padding:"6px 10px", fontFamily:DAT, fontSize:12.5, color:C.ch, background:"#fff", outline:"none", boxSizing:"border-box", appearance:"none" }}>
                  <option value="">—</option>
                  {INTENDED_USES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              {/* Gemological */}
              <SectionHead label="גמולוגיה" />
              <EditFieldPair label1="קראט סה״כ" value1={ef("caratWeight")} onChange1={set("caratWeight")} type1="number" placeholder1="1.02" label2="כמות אבנות" value2={ef("stoneCount")} onChange2={set("stoneCount")} type2="number" placeholder2="1" />
              <EditFieldPair label1="צורה / Cut Form" value1={ef("cutForm")} onChange1={set("cutForm")} placeholder1="Round Brilliant, Oval…" label2="צבע" value2={ef("color")} onChange2={set("color")} placeholder2="G, Vivid Blue…" />
              <EditFieldPair label1="ניקיון" value1={ef("clarity")} onChange1={set("clarity")} placeholder1="VS1, Eye Clean…" label2="Cut Grade" value2={ef("cutGrade")} onChange2={set("cutGrade")} placeholder2="Excellent…" />

              {/* Dimensions */}
              <SectionHead label="מידות (מ״מ)" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                <EditField label="אורך" value={ef("measLength")} onChange={set("measLength")} type="number" placeholder="6.44" />
                <EditField label="רוחב" value={ef("measWidth")}  onChange={set("measWidth")}  type="number" placeholder="6.46" />
                <EditField label="גובה / עומק" value={ef("measHeight")} onChange={set("measHeight")} type="number" placeholder="3.97" />
              </div>

              {/* Certificate */}
              <SectionHead label="תעודה" />
              <EditFieldPair label1="מעבדה" value1={ef("certLab")} onChange1={set("certLab")} placeholder1="GIA, IGI, GRS…" label2="מספר תעודה / חריטה" value2={ef("laserInscription")} onChange2={set("laserInscription")} placeholder2="GIA 2473659812" />

              {/* Media */}
              <SectionHead label="מדיה" />
              <EditField label="קישור תמונה ראשית" value={ef("imageUrl")} onChange={set("imageUrl")} placeholder="https://… (main image)" />
              <EditField label="קישור תמונה / מדיה נוספת" value={ef("additionalMediaUrl")} onChange={set("additionalMediaUrl")} placeholder="https://… (additional image or media)" />
              <EditField label="קישור וידאו" value={ef("videoUrl")} onChange={set("videoUrl")} placeholder="https://youtube.com/…" />
              <EditField label="קישור תעודה PDF / URL" value={ef("certPdfUrl")} onChange={set("certPdfUrl")} placeholder="https://… (certificate PDF or page)" />
              <div style={{ fontFamily:HEB, fontSize:10, color:C.chx, marginTop:2, lineHeight:1.6 }}>
                * הזנת קישורי URL בלבד. העלאת קבצים תתווסף בשלב הבא.
              </div>

              {/* Notes */}
              <SectionHead label="הערות פנימיות" />
              <EditField label="הערות" value={ef("internalNotes")} onChange={set("internalNotes")} rows={3} placeholder="הערות פנימיות, קישורים, מידע נוסף…" />

              {/* Save controls */}
              <div style={{ display:"flex", gap:8, marginTop:20, paddingTop:16, borderTop:"1px solid rgba(54,69,79,0.1)" }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ flex:1, height:42, background:C.ch, color:C.iv, border:"none", borderRadius:8, cursor:saving?"not-allowed":"pointer", fontFamily:HEB, fontSize:14, fontWeight:700, opacity:saving?0.65:1, transition:"opacity 0.14s" }}
                >
                  {saving ? "שומר…" : "💾 שמור שינויים"}
                </button>
                <button
                  onClick={() => { setMode("view"); setEdits({}); setSaveMsg(null); }}
                  style={{ height:42, padding:"0 16px", background:"transparent", border:"1px solid rgba(54,69,79,0.22)", borderRadius:8, cursor:"pointer", fontFamily:HEB, fontSize:13, color:C.chl }}
                >
                  ביטול
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

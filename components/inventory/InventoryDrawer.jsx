/**
 * components/inventory/InventoryDrawer.jsx  —  v5.4
 *
 * Changes from M5.3.2:
 *
 * Task 5 — Media readiness:
 *   + Image gallery with primary image + thumbnail strip (up to 3 images)
 *   + Video URL shown as clickable link when available
 *   + Certificate PDF link shown when certImageUrl or verificationUrl available
 *   + Product-type gradient placeholder with icon when no images
 *
 * Task 9 — Drawer actions clarity:
 *   + Each action button now has a short helper text explaining what it does
 *   + "הוסף למגש עבודה" replaces "Add to Basket"
 *   + "השתמש במחשבון" (Use in Calculator)
 *   + "צור תעודה" (Create Certificate)
 *   + "סגור" (Close button moved into action area)
 *   + Labels align with Work Tray / מגש עבודה terminology
 *
 * Task 4 — ActionBtn removed (was unused in M5.3.2).
 *   All action buttons are inline JSX for precise control.
 *
 * Props unchanged from M5.3.2.
 */

import { useState, useEffect } from "react";
import { C } from "../../lib/constants";
import { PRODUCT_TYPE_LABELS, PRODUCT_TYPE_ICONS, PRODUCT_TYPE_GRADIENTS } from "./InventoryCard";

const HEB = C.heb;
const DAT = C.dat;

// ─── FieldRow ─────────────────────────────────────────────────────────────────
function FieldRow({ label, value, mono, link }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"5px 0", borderBottom:"0.5px solid rgba(54,69,79,0.07)" }}>
      <span style={{ fontFamily:DAT, fontSize:9.5, fontWeight:700, color:C.chl, letterSpacing:"0.1em", textTransform:"uppercase", width:118, flexShrink:0, paddingTop:1 }}>
        {label}
      </span>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontFamily:mono?"'Courier New',monospace":DAT, fontSize:12.5, color:C.gd, wordBreak:"break-all", textDecoration:"underline" }}>
          {value}
        </a>
      ) : (
        <span style={{ fontFamily:mono?"'Courier New',monospace":DAT, fontSize:12.5, color:C.ch, lineHeight:1.5, wordBreak:"break-all" }}>
          {value}
        </span>
      )}
    </div>
  );
}

// ─── SectionHead ──────────────────────────────────────────────────────────────
function SectionHead({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, margin:"18px 0 10px" }}>
      <div style={{ width:2, height:11, background:C.gd, borderRadius:1 }} />
      <span style={{ fontFamily:DAT, fontSize:9, fontWeight:800, color:C.chl, letterSpacing:"0.18em", textTransform:"uppercase" }}>{label}</span>
      <div style={{ flex:1, height:"0.5px", background:"rgba(54,69,79,0.1)" }} />
    </div>
  );
}

// ─── Action button with helper text ───────────────────────────────────────────
function ActionButton({ icon, label, helper, onClick, style = {}, disabled, title }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      style={{
        display:"flex", flexDirection:"column", alignItems:"flex-start",
        gap:3, padding:"10px 14px",
        background:"transparent",
        border:"1px solid rgba(54,69,79,0.18)",
        borderRadius:8, cursor:disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        flex:"1 1 140px",
        minWidth:130,
        transition:"border-color 0.13s, background 0.13s",
        textAlign:"left",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (!style.borderColor) e.currentTarget.style.borderColor = C.gd;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        if (!style.borderColor) e.currentTarget.style.borderColor = "rgba(54,69,79,0.18)";
        else e.currentTarget.style.borderColor = style.borderColor;
      }}
    >
      <span style={{ fontFamily:HEB, fontSize:13, fontWeight:700, color:C.ch, display:"flex", alignItems:"center", gap:6 }}>
        {icon && <span style={{ fontSize:15 }}>{icon}</span>}
        {label}
      </span>
      <span style={{ fontFamily:HEB, fontSize:10, color:C.chl, lineHeight:1.5 }}>{helper}</span>
    </button>
  );
}

// ─── InventoryDrawer ──────────────────────────────────────────────────────────
export function InventoryDrawer({ item, isSelected, onClose, onAddToBasket, onUseInCalculator, onCreateCertificate }) {
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setActiveImg(0); // reset gallery on item change
  }, [item?.id]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!item) return null;

  const ptLabel  = PRODUCT_TYPE_LABELS[item.productType] || item.stoneType || "Item";
  const gradient = PRODUCT_TYPE_GRADIENTS[item.productType] || "linear-gradient(140deg,#f0ede8,#d8d0c0)";
  const icon     = PRODUCT_TYPE_ICONS[item.productType] || "💎";

  // Media
  const allImgs = item.inventoryImages && item.inventoryImages.length > 0
    ? item.inventoryImages
    : item.thumbnailUrl ? [item.thumbnailUrl] : [];

  const caratStr = item.caratWeight ? `${parseFloat(item.caratWeight).toFixed(2)} ct` : null;
  const specParts = [caratStr, item.color, item.clarity].filter(Boolean);
  const fancySpec = item.fancyColorIntensity
    ? `${item.fancyColorIntensity} ${item.fancyColorHue || ""}`.trim()
    : null;

  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(54,69,79,0.55)", zIndex:1200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background:C.iv, borderRadius:12, width:"100%", maxWidth:680, maxHeight:"93vh", overflowY:"auto", boxShadow:"0 24px 70px rgba(54,69,79,0.28)", display:"flex", flexDirection:"column" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"20px 24px 0", flexShrink:0 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <span style={{ fontFamily:DAT, fontSize:10, fontWeight:700, color:C.chl, letterSpacing:"0.12em", textTransform:"uppercase" }}>{ptLabel}</span>
              {item.isDemo && <span style={{ padding:"1px 6px", borderRadius:8, fontSize:8.5, fontFamily:DAT, fontWeight:700, background:"rgba(197,179,88,0.1)", color:"#9a7820", border:"1px dashed rgba(197,179,88,0.5)" }}>DEMO</span>}
            </div>
            <div style={{ fontFamily:C.ser, fontSize:20, fontWeight:700, color:C.ch, letterSpacing:"0.02em", lineHeight:1.2 }}>
              {item.name || item.sku || ptLabel}
            </div>
            {item.sku && <div style={{ fontFamily:"'Courier New',monospace", fontSize:11, color:C.chl, marginTop:4 }}>{item.sku}</div>}
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.chl, fontSize:22, lineHeight:1, padding:"4px 8px", flexShrink:0 }}>✕</button>
        </div>

        {/* ── Main content ── */}
        <div style={{ padding:"16px 24px 24px", overflow:"auto", flex:1 }}>

          {/* ── Media gallery (Task 5) ── */}
          <div style={{ display:"flex", gap:14, marginBottom:18, flexWrap:"wrap" }}>
            {/* Primary image */}
            <div style={{ flexShrink:0 }}>
              {allImgs.length > 0 ? (
                <>
                  <img
                    src={allImgs[activeImg]}
                    alt={item.name || ptLabel}
                    style={{ width:120, height:120, objectFit:"cover", borderRadius:8, border:"1px solid rgba(54,69,79,0.14)", display:"block" }}
                  />
                  {/* Thumbnail strip */}
                  {allImgs.length > 1 && (
                    <div style={{ display:"flex", gap:4, marginTop:5 }}>
                      {allImgs.slice(0, 4).map((url, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImg(idx)}
                          style={{ padding:0, border:`2px solid ${idx===activeImg?C.gd:"rgba(54,69,79,0.14)"}`, borderRadius:4, cursor:"pointer", background:"none" }}
                        >
                          <img src={url} alt="" style={{ width:28, height:28, objectFit:"cover", display:"block", borderRadius:2 }} />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ width:120, height:120, background:gradient, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:48 }}>
                  {icon}
                </div>
              )}
              {allImgs.length === 0 && (
                <div style={{ fontFamily:HEB, fontSize:9, color:C.chx, textAlign:"center", marginTop:4, lineHeight:1.5 }}>
                  אין תמונה<br/>לסוג פריט זה
                </div>
              )}
            </div>

            {/* Key specs panel */}
            <div style={{ flex:1, minWidth:160 }}>
              {caratStr && (
                <div style={{ fontFamily:DAT, fontSize:26, fontWeight:700, color:C.ch, lineHeight:1, marginBottom:4 }}>
                  {caratStr}
                </div>
              )}
              {fancySpec && <div style={{ fontFamily:DAT, fontSize:14, color:"#7a6a1a", fontWeight:600, marginBottom:4 }}>{fancySpec}</div>}
              {specParts.length > 0 && <div style={{ fontFamily:DAT, fontSize:13, color:C.chm, marginBottom:8 }}>{specParts.join(" · ")}</div>}
              {item.cutForm && <div style={{ fontFamily:DAT, fontSize:12, color:C.chl, marginBottom:8 }}>{item.cutForm}</div>}

              <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
                {item.inventoryLayer && (
                  <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:10, fontSize:10, fontFamily:DAT, fontWeight:700, background:"rgba(197,179,88,0.1)", color:"#7a6a1a", border:"1px solid rgba(197,179,88,0.35)", lineHeight:1.8 }}>
                    {item.inventoryLayer}
                  </span>
                )}
                {item.inventoryStatus && (
                  <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:10, fontSize:10, fontFamily:HEB, fontWeight:600, background:item.inventoryStatus==="במלאי"?"rgba(138,171,142,0.15)":item.inventoryStatus==="נמכר"?"rgba(176,64,64,0.1)":"rgba(54,69,79,0.08)", color:item.inventoryStatus==="במלאי"?"#3d7a44":item.inventoryStatus==="נמכר"?"#b04040":C.chm, border:`1px solid ${item.inventoryStatus==="במלאי"?"rgba(138,171,142,0.45)":item.inventoryStatus==="נמכר"?"rgba(176,64,64,0.3)":"rgba(54,69,79,0.2)"}`, lineHeight:1.8 }}>
                    {item.inventoryStatus}
                  </span>
                )}
              </div>

              {item.costUsd != null && (
                <div style={{ fontFamily:DAT, fontSize:22, fontWeight:700, color:C.ch }}>
                  ${Number(item.costUsd).toLocaleString("en-US")}
                </div>
              )}

              {/* Video link (Task 5) */}
              {item.videoUrl && (
                <div style={{ marginTop:8 }}>
                  <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily:HEB, fontSize:11.5, color:C.gd, textDecoration:"none", display:"flex", alignItems:"center", gap:5 }}>
                    ▶ צפה בסרטון
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* ── Gemological details ── */}
          <SectionHead label="Gemological Details" />
          <FieldRow label="Stone Type"    value={item.stoneType} />
          <FieldRow label="Product Type"  value={PRODUCT_TYPE_LABELS[item.productType] || item.productType} />
          <FieldRow label="Colour Grade"  value={item.color} />
          <FieldRow label="Clarity Grade" value={item.clarity} />
          <FieldRow label="Cut Grade"     value={item.cutGrade} />
          <FieldRow label="Cut / Shape"   value={[item.cutForm, item.stoneShape].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(" · ") || null} />
          <FieldRow label="Polish"        value={item.polish} />
          <FieldRow label="Symmetry"      value={item.symmetry} />
          <FieldRow label="Fluorescence"  value={[item.fluorescenceIntensity, item.fluorescenceColor].filter(Boolean).join(" · ") || null} />
          <FieldRow label="Transparency"  value={item.transparency} />
          <FieldRow label="Growth Method" value={item.growthMethod} />
          {item.fancyColorIntensity && <FieldRow label="Fancy Colour" value={`${item.fancyColorIntensity} ${item.fancyColorHue || ""}`.trim()} />}

          {/* ── Measurements ── */}
          {(item.measLength || item.measWidth || item.measHeight || item.stoneCount) && (
            <>
              <SectionHead label="Measurements" />
              {item.caratWeight && <FieldRow label="Carat Weight" value={`${parseFloat(item.caratWeight).toFixed(2)} ct`} />}
              {item.stoneCount  && <FieldRow label="Stone Count"  value={item.stoneCount} />}
              {(item.measLength || item.measWidth || item.measHeight) && (
                <FieldRow label="Dimensions"
                  value={[item.measLength, item.measWidth, item.measHeight].filter(Boolean).map(v => parseFloat(v).toFixed(2)).join(" × ") + " mm"}
                />
              )}
            </>
          )}

          {/* ── Certificate (Task 5: includes cert image + PDF link) ── */}
          {(item.certLab || item.certNumber || item.laserInscription || item.certImageUrl || item.verificationId) && (
            <>
              <SectionHead label="Certificate & Verification" />
              <FieldRow label="Lab"             value={item.certLab} />
              <FieldRow label="Report Number"   value={item.certNumber || item.laserInscription} mono />
              <FieldRow label="Verification ID" value={item.verificationId} mono />
              <FieldRow label="Verify URL"      value={item.verificationUrl} link />
              {/* Certificate image preview (Task 5) */}
              {item.certImageUrl && (
                <div style={{ marginTop:8 }}>
                  <img src={item.certImageUrl} alt="Certificate" style={{ maxWidth:140, borderRadius:5, border:"1px solid rgba(54,69,79,0.12)", opacity:0.9 }} />
                  <a href={item.certImageUrl} target="_blank" rel="noopener noreferrer" style={{ display:"block", fontFamily:HEB, fontSize:11, color:C.gd, marginTop:5, textDecoration:"none" }}>
                    📄 פתח תעודה (PDF/תמונה)
                  </a>
                </div>
              )}
              {/* If cert URL is in internal notes (for attachment fields) */}
              {!item.certImageUrl && item.internalNotes && item.internalNotes.includes("cloudfront.net") && (
                <div style={{ marginTop:8, fontFamily:HEB, fontSize:10.5, color:C.chl }}>
                  קישור תעודה: ראה הערות פנימיות
                </div>
              )}
            </>
          )}

          {/* ── Sourcing & ownership ── */}
          {(item.supplierName || item.ownerClient || item.virtualSupplier || item.physicalLocation || item.memoNumber || item.intendedUse) && (
            <>
              <SectionHead label="Sourcing & Ownership" />
              <FieldRow label="Supplier"           value={item.supplierName || item.virtualSupplier} />
              <FieldRow label="Owner / Client"     value={item.ownerClient} />
              <FieldRow label="Physical Location"  value={item.physicalLocation} />
              <FieldRow label="Supplier Avail."    value={item.supplierAvailability} />
              <FieldRow label="Memo / Consignment" value={item.memoNumber} mono />
              <FieldRow label="Intended Use"       value={item.intendedUse} />
            </>
          )}

          {/* Internal notes */}
          {item.internalNotes && (
            <>
              <SectionHead label="Notes" />
              <p style={{ fontFamily:HEB, fontSize:12.5, color:C.chm, lineHeight:1.7, margin:0, padding:"10px 14px", background:"rgba(240,237,232,0.6)", borderRadius:6, borderLeft:`2px solid ${C.gd}` }}>
                {item.internalNotes}
              </p>
            </>
          )}

          {/* Airtable record ID */}
          <div style={{ marginTop:18, padding:"8px 12px", background:"rgba(54,69,79,0.04)", borderRadius:6 }}>
            <div style={{ fontFamily:DAT, fontSize:9, color:C.chx, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:3 }}>Airtable Record ID</div>
            <div style={{ fontFamily:"'Courier New',monospace", fontSize:11, color:C.chm }}>{item.id || "—"}</div>
          </div>

          {/* ── Action buttons with helper text (Task 9) ── */}
          <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid rgba(54,69,79,0.1)" }}>
            <div style={{ fontFamily:HEB, fontSize:10.5, color:C.chl, marginBottom:12 }}>
              בחר פעולה לביצוע עם הפריט:
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>

              {/* הוסף למגש עבודה — Work Tray terminology (Task 2) */}
              <ActionButton
                icon="🗂"
                label={isSelected ? "✓ במגש עבודה" : "הוסף למגש עבודה"}
                helper="הוסף לרשימת העבודה הזמנית — חשבון, תעודה, הצעת מחיר"
                onClick={() => onAddToBasket(item)}
                style={isSelected ? { background:"rgba(197,179,88,0.08)", borderColor:C.gd } : {}}
              />

              {/* השתמש במחשבון */}
              <ActionButton
                icon="🔢"
                label="השתמש במחשבון"
                helper="טען נתוני אבן / רכיב למחשבון העלות"
                onClick={() => onUseInCalculator(item)}
                style={{ borderColor:"rgba(197,179,88,0.5)", background:"rgba(197,179,88,0.05)" }}
              />

              {/* צור תעודה */}
              <ActionButton
                icon="📋"
                label="צור תעודה"
                helper="פתח עורך תעודות עם נתוני הפריט ממולאים"
                onClick={() => onCreateCertificate(item)}
                style={{ borderColor:"rgba(138,171,142,0.55)", background:"rgba(138,171,142,0.06)" }}
              />

              {/* Archive placeholder */}
              <ActionButton
                icon="📁"
                label="ארכיון"
                helper="הסר מתצוגת מלאי פעיל (בקרוב)"
                onClick={() => {}}
                disabled
              />

            </div>

            {/* סגור (Task 9: close button in actions area) */}
            <button
              onClick={onClose}
              style={{ marginTop:10, height:36, width:"100%", background:"transparent", border:"1px solid rgba(54,69,79,0.15)", borderRadius:7, cursor:"pointer", fontFamily:HEB, fontSize:12.5, color:C.chl }}
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

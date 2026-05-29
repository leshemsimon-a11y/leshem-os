/**
 * components/inventory/InventoryDrawer.jsx  —  v5.3
 *
 * Full item detail modal (drawer).
 * Opens when user clicks an inventory card/row.
 *
 * Shows:
 *   • Image gallery (placeholder when missing)
 *   • Inventory layer + status badges
 *   • Product type + key specs
 *   • Gemological details (grading, measurements, fluorescence)
 *   • Certificate information
 *   • Sourcing / ownership / location
 *   • Airtable record ID
 *   • Action buttons (basket, calculator, certificate)
 *
 * Props:
 *   item           {object|null}  — normalized stone object, or null to close
 *   isSelected     {boolean}      — whether item is in basket
 *   onClose        {function}
 *   onAddToBasket  {function(item)}
 *   onUseInCalculator  {function(item)}
 *   onCreateCertificate {function(item)}
 */

import { useEffect } from "react";
import { C } from "../../lib/constants";
import { PRODUCT_TYPE_LABELS, PRODUCT_TYPE_ICONS, PRODUCT_TYPE_GRADIENTS } from "./InventoryCard";

const HEB = C.heb;
const DAT = C.dat;

// ─── Field row ────────────────────────────────────────────────────────────────
function FieldRow({ label, value, mono }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"5px 0", borderBottom:"0.5px solid rgba(54,69,79,0.07)" }}>
      <span style={{ fontFamily:DAT, fontSize:9.5, fontWeight:700, color:C.chl, letterSpacing:"0.1em", textTransform:"uppercase", width:120, flexShrink:0, paddingTop:1 }}>{label}</span>
      <span style={{ fontFamily:mono?"'Courier New',monospace":DAT, fontSize:12.5, color:C.ch, lineHeight:1.5, wordBreak:"break-all" }}>{value}</span>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, margin:"20px 0 10px" }}>
      <div style={{ width:2, height:12, background:C.gd, borderRadius:1 }} />
      <span style={{ fontFamily:DAT, fontSize:9, fontWeight:800, color:C.chl, letterSpacing:"0.18em", textTransform:"uppercase" }}>{label}</span>
      <div style={{ flex:1, height:"0.5px", background:"rgba(54,69,79,0.1)" }} />
    </div>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────
function ActionBtn({ label, icon, primary, disabled, onClick }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={disabled ? "Coming in Milestone 5.4" : undefined}
      style={{ height:40, padding:"0 16px", background:primary?C.ch:"transparent", color:primary?C.iv:disabled?C.chx:C.chm, border:`1px solid ${primary?C.ch:disabled?"rgba(54,69,79,0.12)":"rgba(54,69,79,0.22)"}`, borderRadius:7, cursor:disabled?"not-allowed":"pointer", fontFamily:HEB, fontSize:12.5, fontWeight:primary?700:400, display:"flex", alignItems:"center", gap:7, opacity:disabled?0.55:1, transition:"all 0.15s", whiteSpace:"nowrap" }}
    >
      {icon && <span style={{ fontSize:14 }}>{icon}</span>}
      {label}
    </button>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function InventoryDrawer({ item, isSelected, onClose, onAddToBasket, onUseInCalculator, onCreateCertificate }) {
  // Escape key closes drawer
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!item) return null;

  const ptLabel  = PRODUCT_TYPE_LABELS[item.productType] || item.stoneType || "Item";
  const gradient = PRODUCT_TYPE_GRADIENTS[item.productType] || "linear-gradient(140deg,#f0ede8,#d8d0c0)";
  const icon     = PRODUCT_TYPE_ICONS[item.productType] || "💎";
  const img      = item.thumbnailUrl || (item.inventoryImages && item.inventoryImages[0]);
  const allImgs  = item.inventoryImages && item.inventoryImages.length > 0
    ? item.inventoryImages
    : img ? [img] : [];

  // Build carat / spec display
  const caratStr = item.caratWeight ? `${parseFloat(item.caratWeight).toFixed(2)} ct` : null;
  const specParts = [caratStr, item.color, item.clarity].filter(Boolean);
  const fancySpec = item.fancyColorIntensity ? `${item.fancyColorIntensity} ${item.fancyColorHue || ""}`.trim() : null;

  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(54,69,79,0.55)", zIndex:1200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background:C.iv, borderRadius:12, width:"100%", maxWidth:660, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 24px 70px rgba(54,69,79,0.28)", display:"flex", flexDirection:"column" }}>

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
            {item.sku && (
              <div style={{ fontFamily:"'Courier New',monospace", fontSize:11, color:C.chl, marginTop:4 }}>
                {item.sku}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.chl, fontSize:22, lineHeight:1, padding:"4px 8px", flexShrink:0 }}>✕</button>
        </div>

        {/* ── Main content ── */}
        <div style={{ padding:"16px 24px 24px", overflow:"auto", flex:1 }}>

          {/* Image gallery + key stats row */}
          <div style={{ display:"flex", gap:16, alignItems:"flex-start", marginBottom:20, flexWrap:"wrap" }}>
            {/* Image */}
            <div style={{ flexShrink:0 }}>
              {allImgs.length > 0 ? (
                <div style={{ display:"flex", gap:6, flexDirection:"column" }}>
                  <img src={allImgs[0]} alt={item.name || ptLabel} style={{ width:110, height:110, objectFit:"cover", borderRadius:8, border:"1px solid rgba(54,69,79,0.14)" }} />
                  {allImgs.length > 1 && (
                    <div style={{ display:"flex", gap:4 }}>
                      {allImgs.slice(1, 4).map((url, idx) => (
                        <img key={idx} src={url} alt="" style={{ width:32, height:32, objectFit:"cover", borderRadius:4, border:"1px solid rgba(54,69,79,0.12)", opacity:0.85 }} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ width:110, height:110, background:gradient, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:44 }}>
                  {icon}
                </div>
              )}
            </div>

            {/* Key specs panel */}
            <div style={{ flex:1, minWidth:180 }}>
              {caratStr && (
                <div style={{ fontFamily:DAT, fontSize:28, fontWeight:700, color:C.ch, lineHeight:1, marginBottom:4 }}>
                  {caratStr}
                </div>
              )}
              {fancySpec && (
                <div style={{ fontFamily:DAT, fontSize:14, color:"#7a6a1a", fontWeight:600, marginBottom:4 }}>{fancySpec}</div>
              )}
              {specParts.length > 0 && (
                <div style={{ fontFamily:DAT, fontSize:13, color:C.chm, marginBottom:8 }}>{specParts.join(" · ")}</div>
              )}
              {item.cutForm && (
                <div style={{ fontFamily:DAT, fontSize:12, color:C.chl, marginBottom:8 }}>{item.cutForm}</div>
              )}
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
              {item.caratWeight && <FieldRow label="Carat Weight"  value={`${parseFloat(item.caratWeight).toFixed(2)} ct`} />}
              {item.stoneCount  && <FieldRow label="Stone Count"   value={item.stoneCount} />}
              {(item.measLength || item.measWidth || item.measHeight) && (
                <FieldRow label="Dimensions"
                  value={[item.measLength, item.measWidth, item.measHeight].filter(Boolean).map(v => parseFloat(v).toFixed(2)).join(" × ") + " mm"}
                />
              )}
            </>
          )}

          {/* ── Certificate ── */}
          {(item.certLab || item.certNumber || item.certImageUrl || item.verificationId) && (
            <>
              <SectionHead label="Certificate & Verification" />
              <FieldRow label="Lab"             value={item.certLab} />
              <FieldRow label="Report Number"   value={item.certNumber} mono />
              <FieldRow label="Verification ID" value={item.verificationId} mono />
              <FieldRow label="Verify URL"      value={item.verificationUrl} mono />
              {item.certImageUrl && (
                <div style={{ marginTop:8 }}>
                  <img src={item.certImageUrl} alt="Certificate" style={{ maxWidth:160, borderRadius:5, border:"1px solid rgba(54,69,79,0.12)", opacity:0.9 }} />
                </div>
              )}
            </>
          )}

          {/* ── Sourcing & ownership ── */}
          {(item.supplierName || item.ownerClient || item.virtualSupplier || item.physicalLocation || item.memoNumber || item.intendedUse) && (
            <>
              <SectionHead label="Sourcing & Ownership" />
              <FieldRow label="Supplier"            value={item.supplierName || item.virtualSupplier} />
              <FieldRow label="Owner / Client"      value={item.ownerClient} />
              <FieldRow label="Physical Location"   value={item.physicalLocation} />
              <FieldRow label="Supplier Avail."     value={item.supplierAvailability} />
              <FieldRow label="Memo / Consignment"  value={item.memoNumber} mono />
              <FieldRow label="Intended Use"        value={item.intendedUse} />
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
          <div style={{ marginTop:20, padding:"10px 12px", background:"rgba(54,69,79,0.04)", borderRadius:6 }}>
            <div style={{ fontFamily:DAT, fontSize:9, color:C.chx, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:3 }}>Airtable Record ID</div>
            <div style={{ fontFamily:"'Courier New',monospace", fontSize:11, color:C.chm }}>{item.id || "—"}</div>
          </div>

          {/* ── Action buttons ── */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:20, paddingTop:16, borderTop:"1px solid rgba(54,69,79,0.1)" }}>
            <ActionBtn
              label={isSelected ? "✓ In Basket" : "+ Add to Basket"}
              icon="🛒"
              primary={!isSelected}
              onClick={() => onAddToBasket(item)}
            />
            <ActionBtn
              label="Use in Calculator"
              icon="🔢"
              onClick={() => onUseInCalculator(item)}
              disabled={false}
            />
            <ActionBtn
              label="Create Certificate"
              icon="📋"
              onClick={() => onCreateCertificate(item)}
              disabled={false}
            />
            {/* Future: Archive placeholder */}
            <ActionBtn
              label="Archive"
              icon="📁"
              onClick={() => {}}
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
}

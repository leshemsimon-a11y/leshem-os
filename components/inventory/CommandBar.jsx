/**
 * components/inventory/CommandBar.jsx  —  v5.4.1
 *
 * Changes from v5.4:
 *   Task 6 — Global routing:
 *     The CommandBar can now suggest navigation actions in addition to
 *     inventory-specific actions:
 *       go_to_inventory  — "לך למלאי", "inventory", "מלאי"
 *       go_to_calculator — "לך למחשבון", "calculator", "חשב"
 *       go_to_certs      — "לך לתעודות", "certificates", "תעודות"
 *
 *     These call onNavigate(tab) where tab ∈ { "malai","calc","cert" }.
 *
 *   The component is designed to be usable globally (in the header or
 *   as a standalone bar) not only inside InventoryStudio.
 *
 * ALL PARSING IS LOCAL. No external API calls. No fetch(). No OpenAI.
 * Future: /api/ai/command → OpenAI Responses API via secure server-side proxy.
 *
 * Props:
 *   onSearch      {function(filterSuggestions)} — apply filters to inventory
 *   onCalculate   {function(cfgSuggestion)}     — show calc draft
 *   onCertificate {function()}                  — navigate to certs
 *   onClearFilters {function()}                 — clear all inventory filters
 *   onNavigate    {function(tab)}               — navigate to "malai"|"calc"|"cert"
 *   allItems      {array}                       — inventory items for preview count
 *   compact       {bool}                        — compact mode for header placement
 */

import { useState, useRef, useCallback } from "react";
import { C } from "../../lib/constants";

const HEB = C.heb;
const DAT = C.dat;

// ─── Local keyword dictionaries ───────────────────────────────────────────────
const STONE_TYPE_KW = {
  "יהלום":"Diamond","diamond":"Diamond","ספיר":"Sapphire","sapphire":"Sapphire",
  "אמרלד":"Emerald","emerald":"Emerald","זמרד":"Emerald",
  "אודם":"Ruby","ruby":"Ruby","רובי":"Ruby",
  "טנזניט":"Tanzanite","tanzanite":"Tanzanite",
};
const SHAPE_KW = {
  "עגול":"Round Brilliant","round":"Round Brilliant",
  "קושן":"Cushion","cushion":"Cushion",
  "אובל":"Oval","oval":"Oval","מרקיזה":"Marquise","marquise":"Marquise",
  "פרינסס":"Princess","princess":"Princess",
  "פאר":"Pear","pear":"Pear","רדיאנט":"Radiant","radiant":"Radiant",
};
const METAL_KW = {
  "14k":"14K Yellow Gold","18k":"18K Yellow Gold","זהב לבן":"18K White Gold",
  "white gold":"18K White Gold","זהב צהוב":"18K Yellow Gold","platinum":"Platinum",
  "פלטינום":"Platinum","14k white":"14K White Gold","18k white":"18K White Gold",
  "14k yellow":"14K Yellow Gold","18k yellow":"18K Yellow Gold",
  "14k rose":"14K Rose Gold","18k rose":"18K Rose Gold","זהב ורוד":"18K Rose Gold",
};
const LAB_KW = ["מעבדה","lab","cvd","hpht","lab grown","גידול"];

// ─── Intent detection ─────────────────────────────────────────────────────────
function detectIntent(text) {
  const t = text.toLowerCase();
  // Navigation intents — highest priority
  if (/לך למלאי|go to inventory|open inventory|פתח מלאי/.test(t))          return "go_to_inventory";
  if (/לך למחשבון|go to calc|open calculator|פתח מחשבון/.test(t))          return "go_to_calculator";
  if (/לך לתעודות|go to cert|פתח תעודות|certificates/.test(t))             return "go_to_certs";
  // Action intents
  if (/מצא|חפש|find|search|הצג|show me/.test(t))                            return "search_inventory";
  if (/חשב|calculate|estimate|טבעת|ring|צמיד|bracelet|עגיל|earring|שרשרת|necklace/.test(t)) return "calculate_estimate";
  if (/צור תעודה|create cert|certificate|תעודה/.test(t))                    return "create_certificate";
  if (/נקה מסננים|clear filter|reset filter|איפוס מסנן/.test(t))           return "clear_filters";
  if (/\?|עזרה|help|מה אפשר|what can/.test(t))                              return "show_help";
  return "search_inventory";
}

function extractFilters(text) {
  const t = text.toLowerCase();
  const out = {};
  for (const [kw, val] of Object.entries(STONE_TYPE_KW)) {
    if (t.includes(kw.toLowerCase())) { out.stoneType = val; break; }
  }
  for (const [kw, val] of Object.entries(SHAPE_KW)) {
    if (t.includes(kw.toLowerCase())) { out.shape = val; break; }
  }
  for (const kw of LAB_KW) {
    if (t.includes(kw)) { out.productType = "lab_grown_diamond"; break; }
  }
  const priceMatch = text.match(/(?:under|עד|max|מקסימום|בס"|ב)\s*\$?\s*(\d[\d,]*)/i);
  if (priceMatch) out.priceMax = priceMatch[1].replace(",","");
  const caratMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:ct|קראט|carat)/i);
  if (caratMatch) out.caratMax = caratMatch[1];
  if (/זוג|pair|set|שני|couple/.test(text)) out.productType = out.productType || "stone_pair_set";
  return out;
}

function extractCalcSuggestion(text) {
  const t = text.toLowerCase();
  const out = {};
  for (const [kw, val] of Object.entries(METAL_KW)) {
    if (t.includes(kw)) { out.metal = val; break; }
  }
  const gramsMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:g|gram|gr|גרם)/i);
  if (gramsMatch) out.grams = gramsMatch[1];
  const ctMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:ct|קראט|carat)/i);
  if (ctMatch) out.centerCt = ctMatch[1];
  for (const [kw, val] of Object.entries(STONE_TYPE_KW)) {
    if (t.includes(kw.toLowerCase())) { out.centerType = val; break; }
  }
  for (const kw of LAB_KW) {
    if (t.includes(kw)) { out.centerType = "Diamond"; out.labGrown = true; break; }
  }
  return out;
}

function buildSuggestion(text) {
  const intent  = detectIntent(text);
  const filters = intent === "search_inventory" ? extractFilters(text) : {};
  const calc    = intent === "calculate_estimate" ? extractCalcSuggestion(text) : {};

  const LABELS = {
    search_inventory:   "חיפוש במלאי",
    calculate_estimate: "הצעת חישוב",
    create_certificate: "יצירת תעודה",
    use_in_calculator:  "שימוש במחשבון",
    clear_filters:      "ניקוי מסננים",
    go_to_inventory:    "נווט למלאי",
    go_to_calculator:   "נווט למחשבון",
    go_to_certs:        "נווט לתעודות",
    show_help:          "עזרה",
  };

  return { intent, filters, calc, intentLabel: LABELS[intent] || intent };
}

// ─── SuggestionPill ───────────────────────────────────────────────────────────
function SuggestionPill({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ height:26, padding:"0 10px", background:"rgba(197,179,88,0.1)", border:"1px solid rgba(197,179,88,0.35)", borderRadius:13, cursor:"pointer", fontFamily:HEB, fontSize:11, color:"#6a5a10", whiteSpace:"nowrap", transition:"background 0.12s" }}
      onMouseEnter={(e) => { e.currentTarget.style.background="rgba(197,179,88,0.2)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background="rgba(197,179,88,0.1)"; }}
    >
      {text}
    </button>
  );
}

// ─── CommandBar ───────────────────────────────────────────────────────────────
export function CommandBar({
  onSearch,
  onCalculate,
  onCertificate,
  onClearFilters,
  onNavigate,      // v5.4.1: global navigation callback
  allItems = [],
  compact  = false,
}) {
  const [text,       setText]       = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [confirmed,  setConfirmed]  = useState(false);
  const inputRef = useRef(null);

  const EXAMPLES = compact
    ? ["מצא יהלום עגול", "חשב 18K 1ct", "צור תעודה", "למחשבון"]
    : [
      "מצא יהלום עגול עד $2000",
      "חשב טבעת 18K זהב לבן 3g עם יהלום מעבדה קושן 1ct",
      "צור תעודה לאבן שנבחרה",
      "נקה מסננים",
      "לך למחשבון",
      "לך למלאי",
    ];

  const handleInput = useCallback((value) => {
    setText(value);
    setSuggestion(null);
    setConfirmed(false);
    if (value.trim().length > 2) {
      setSuggestion(buildSuggestion(value));
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (!suggestion) return;
    setConfirmed(true);

    switch (suggestion.intent) {
      case "search_inventory":   onSearch?.(suggestion.filters); break;
      case "calculate_estimate": onCalculate?.(suggestion.calc); break;
      case "create_certificate": onCertificate?.(); break;
      case "clear_filters":      onClearFilters?.(); break;
      case "go_to_inventory":    onNavigate?.("malai"); break;
      case "go_to_calculator":   onNavigate?.("calc");  break;
      case "go_to_certs":        onNavigate?.("cert");  break;
      default: break;
    }

    setTimeout(() => {
      setText("");
      setSuggestion(null);
      setConfirmed(false);
    }, 1600);
  }, [suggestion, onSearch, onCalculate, onCertificate, onClearFilters, onNavigate]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && suggestion) handleConfirm();
    if (e.key === "Escape") { setText(""); setSuggestion(null); }
  };

  const previewCount = suggestion?.intent === "search_inventory" && Object.keys(suggestion.filters).length > 0
    ? allItems.filter(item => {
        const f = suggestion.filters;
        if (f.stoneType   && item.stoneType   !== f.stoneType)   return false;
        if (f.shape       && item.cutForm     !== f.shape)        return false;
        if (f.productType && item.productType !== f.productType)  return false;
        if (f.priceMax    && Number(item.costUsd  ||0) > Number(f.priceMax))  return false;
        if (f.caratMax    && parseFloat(item.caratWeight||0) > parseFloat(f.caratMax)) return false;
        return true;
      }).length
    : null;

  const isNavIntent = ["go_to_inventory","go_to_calculator","go_to_certs"].includes(suggestion?.intent);

  return (
    <div style={{ marginBottom: compact ? 0 : 16 }}>
      {/* Input */}
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14, pointerEvents:"none", color:C.chl }}>✦</span>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={compact ? "שאל / בצע פעולה…" : "שאל / בצע פעולה... (מצא, חשב, צור תעודה, לך למחשבון)"}
          dir="rtl"
          style={{
            width:"100%", height: compact ? 38 : 44,
            border:`1px solid ${compact?"rgba(197,179,88,0.25)":"rgba(197,179,88,0.4)"}`,
            borderRadius: compact ? 8 : 10,
            background:"rgba(197,179,88,0.04)",
            paddingRight:12, paddingLeft:36,
            fontFamily:HEB, fontSize: compact ? 12.5 : 14, color:C.ch,
            outline:"none", boxSizing:"border-box",
            transition:"border-color 0.15s, background 0.15s",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor=C.gd; e.currentTarget.style.background="rgba(197,179,88,0.08)"; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor=compact?"rgba(197,179,88,0.25)":"rgba(197,179,88,0.4)"; e.currentTarget.style.background="rgba(197,179,88,0.04)"; }}
        />
        {text && (
          <button onClick={() => { setText(""); setSuggestion(null); }} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.chl, fontSize:16, lineHeight:1, padding:"0 2px" }}>✕</button>
        )}
      </div>

      {/* Example pills */}
      {!text && !compact && (
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8 }}>
          {EXAMPLES.map(ex => <SuggestionPill key={ex} text={ex} onClick={() => handleInput(ex)} />)}
        </div>
      )}

      {/* Suggestion card */}
      {suggestion && !confirmed && (
        <div style={{ marginTop:8, padding:"11px 14px", background:"#fff", border:`1px solid ${C.gd}`, borderRadius:8, boxShadow:"0 4px 14px rgba(54,69,79,0.1)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:7 }}>
            <div>
              <span style={{ fontFamily:DAT, fontSize:9, fontWeight:700, color:C.chl, letterSpacing:"0.14em", textTransform:"uppercase" }}>כוונה שזוהתה</span>
              <div style={{ fontFamily:HEB, fontSize:13, fontWeight:700, color:C.ch, marginTop:2 }}>{suggestion.intentLabel}</div>
            </div>
            <div style={{ fontFamily:DAT, fontSize:9.5, color:C.chl }}>פרסור מקומי</div>
          </div>

          {suggestion.intent === "search_inventory" && Object.keys(suggestion.filters).length > 0 && (
            <div style={{ marginBottom:8 }}>
              <div style={{ fontFamily:DAT, fontSize:10, color:C.chl, marginBottom:5 }}>מסננים מוצעים:</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {Object.entries(suggestion.filters).map(([k,v]) => (
                  <span key={k} style={{ padding:"2px 8px", background:"rgba(74,92,104,0.1)", borderRadius:10, fontFamily:DAT, fontSize:11, color:C.chm }}>{k}: {v}</span>
                ))}
                {previewCount !== null && (
                  <span style={{ padding:"2px 8px", background:"rgba(138,171,142,0.15)", borderRadius:10, fontFamily:DAT, fontSize:11, color:"#3d7a44" }}>{previewCount} תוצאות</span>
                )}
              </div>
            </div>
          )}

          {suggestion.intent === "calculate_estimate" && Object.keys(suggestion.calc).length > 0 && (
            <div style={{ marginBottom:8 }}>
              <div style={{ fontFamily:DAT, fontSize:10, color:C.chl, marginBottom:5 }}>פרמטרים לחישוב:</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {Object.entries(suggestion.calc).map(([k,v]) => (
                  <span key={k} style={{ padding:"2px 8px", background:"rgba(197,179,88,0.12)", borderRadius:10, fontFamily:DAT, fontSize:11, color:C.chm }}>{k}: {String(v)}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ fontFamily:HEB, fontSize:11, color:C.chl, marginBottom:9, lineHeight:1.6 }}>
            {isNavIntent
              ? "הפעולה תנווט ללשונית המבוקשת."
              : suggestion.intent === "calculate_estimate"
              ? "⚠️ הפעולה תטען טיוטת חישוב — יש לאשר לפני שינוי הנתונים הנוכחיים."
              : suggestion.intent === "create_certificate"
              ? "הפעולה תנווט ללשונית תעודות."
              : "הפעולה תיישם מסננים על המלאי."}
          </div>

          <div style={{ display:"flex", gap:8 }}>
            <button onClick={handleConfirm} style={{ height:34, padding:"0 14px", background:C.ch, color:C.iv, border:"none", borderRadius:7, cursor:"pointer", fontFamily:HEB, fontSize:12.5, fontWeight:700 }}>
              {isNavIntent ? "✓ נווט" : "אשר ובצע"}
            </button>
            <button onClick={() => { setText(""); setSuggestion(null); }} style={{ height:34, padding:"0 12px", background:"transparent", border:"1px solid rgba(54,69,79,0.2)", borderRadius:7, cursor:"pointer", fontFamily:HEB, fontSize:12, color:C.chl }}>
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* Confirmed feedback */}
      {confirmed && (
        <div style={{ marginTop:8, padding:"9px 12px", background:"rgba(138,171,142,0.12)", border:"1px solid rgba(138,171,142,0.4)", borderRadius:8, fontFamily:HEB, fontSize:12, color:"#2e6636" }}>
          ✓ הפעולה בוצעה
        </div>
      )}
    </div>
  );
}

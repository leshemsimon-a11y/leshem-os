/**
 * components/inventory/CommandBar.jsx  —  v5.4
 *
 * AI Command Bar — local natural language command foundation.
 *
 * ── What this is ─────────────────────────────────────────────────────────────
 * A visible command/chat input in the Inventory Studio and (optionally) the
 * global app header. The user can type natural language commands in Hebrew
 * or English and get suggested structured actions.
 *
 * ── What this is NOT ─────────────────────────────────────────────────────────
 * This is NOT connected to any external AI API. All parsing is local.
 * No network calls are made. No Airtable writes. No destructive actions
 * are executed without explicit user confirmation.
 *
 * ── Future ───────────────────────────────────────────────────────────────────
 * A future version will route commands through a secure server-side proxy
 * at /api/ai/command that calls the OpenAI Responses API with tool calling.
 * The tool schema will mirror the ACTION_TYPES below.
 * The local parser here is a stub that the server-side version will replace.
 *
 * ── Local parser logic ───────────────────────────────────────────────────────
 * The parser uses keyword matching on the lowercased input to detect intent.
 * It extracts parameters (stone type, shape, price, weight) using simple
 * regex patterns. The result is a structured ActionSuggestion object.
 *
 * Intents recognised:
 *   search_inventory   — "מצא", "חפש", "find", "search"
 *   calculate_estimate — "חשב", "calculate", "estimate", "ring", "טבעת"
 *   create_certificate — "צור תעודה", "create certificate"
 *   use_in_calculator  — "השתמש ב", "use in calc", "use as"
 *   clear_filters      — "נקה מסננים", "clear filters", "reset"
 *   show_help          — "?" or "help" or "עזרה"
 *
 * Props:
 *   onSearch     {function(filterSuggestions)} — apply suggested filters
 *   onCalculate  {function(cfgSuggestion)}     — show suggested calc draft
 *   onCertificate {function()}                 — navigate to cert tab
 *   onClearFilters {function()}                — clear all filters
 *   allItems     {array}  — current inventory items for live result preview
 */

import { useState, useRef, useCallback } from "react";
import { C } from "../../lib/constants";

const HEB = C.heb;
const DAT = C.dat;

// ─── Intent detection ─────────────────────────────────────────────────────────

const STONE_TYPE_KEYWORDS = {
  "יהלום": "Diamond", "diamond": "Diamond", "ספיר": "Sapphire", "sapphire": "Sapphire",
  "אמרלד": "Emerald", "emerald": "Emerald", "זמרד": "Emerald",
  "אודם": "Ruby", "ruby": "Ruby", "רובי": "Ruby",
  "טנזניט": "Tanzanite", "tanzanite": "Tanzanite",
};

const SHAPE_KEYWORDS = {
  "עגול": "Round Brilliant", "round": "Round Brilliant",
  "קושן": "Cushion", "cushion": "Cushion",
  "אובל": "Oval", "oval": "Oval",
  "מרקיזה": "Marquise", "marquise": "Marquise",
  "פרינסס": "Princess", "princess": "Princess",
  "אמרלד קאט": "Emerald Cut", "emerald cut": "Emerald Cut",
  "פאר": "Pear", "pear": "Pear",
  "רדיאנט": "Radiant", "radiant": "Radiant",
};

const METAL_KEYWORDS = {
  "14k": "14K Yellow Gold", "18k": "18K Yellow Gold",
  "white gold": "18K White Gold", "זהב לבן": "18K White Gold",
  "זהב צהוב": "18K Yellow Gold", "platinum": "Platinum", "פלטינום": "Platinum",
  "14k white": "14K White Gold", "18k white": "18K White Gold",
  "14k yellow": "14K Yellow Gold", "18k yellow": "18K Yellow Gold",
  "14k rose": "14K Rose Gold", "18k rose": "18K Rose Gold",
  "זהב ורוד": "18K Rose Gold",
};

const LAB_KEYWORDS = {
  "מעבדה": "lab_grown_diamond", "lab": "lab_grown_diamond",
  "cvd": "lab_grown_diamond", "hpht": "lab_grown_diamond",
  "lab grown": "lab_grown_diamond", "גידול": "lab_grown_diamond",
};

function detectIntent(text) {
  const t = text.toLowerCase();
  if (/מצא|חפש|find|search|הצג|show me/i.test(t)) return "search_inventory";
  if (/חשב|calculate|estimate|טבעת|ring|צמיד|bracelet|עגיל|earring|שרשרת|necklace/i.test(t)) return "calculate_estimate";
  if (/צור תעודה|create cert|certificate|תעודה/i.test(t)) return "create_certificate";
  if (/השתמש ב|use in calc|use as center|use as side/i.test(t)) return "use_in_calculator";
  if (/נקה מסננים|clear filter|reset filter|איפוס מסנן/i.test(t)) return "clear_filters";
  if (/\?|עזרה|help|מה אפשר|what can/i.test(t)) return "show_help";
  return "search_inventory"; // default to search
}

function extractFilters(text) {
  const t   = text.toLowerCase();
  const out = {};

  // Stone type
  for (const [kw, val] of Object.entries(STONE_TYPE_KEYWORDS)) {
    if (t.includes(kw.toLowerCase())) { out.stoneType = val; break; }
  }

  // Shape
  for (const [kw, val] of Object.entries(SHAPE_KEYWORDS)) {
    if (t.includes(kw.toLowerCase())) { out.shape = val; break; }
  }

  // Lab grown
  for (const kw of Object.keys(LAB_KEYWORDS)) {
    if (t.includes(kw)) { out.productType = "lab_grown_diamond"; break; }
  }

  // Price max
  const priceMatch = text.match(/(?:under|עד|max|מקסימום|בס"|ב)\s*\$?\s*(\d[\d,]*)/i);
  if (priceMatch) out.priceMax = priceMatch[1].replace(",", "");

  // Carat
  const caratMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:ct|קראט|carat)/i);
  if (caratMatch) out.caratMax = caratMatch[1];

  // Pair / set
  if (/זוג|pair|set|שני|couple/i.test(text)) out.productType = out.productType || "stone_pair_set";

  return out;
}

function extractCalcSuggestion(text) {
  const t   = text.toLowerCase();
  const out = {};

  // Metal
  for (const [kw, val] of Object.entries(METAL_KEYWORDS)) {
    if (t.includes(kw)) { out.metal = val; break; }
  }

  // Grams
  const gramsMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:g|gram|gr|גרם)/i);
  if (gramsMatch) out.grams = gramsMatch[1];

  // Carat
  const ctMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:ct|קראט|carat)/i);
  if (ctMatch) out.centerCt = ctMatch[1];

  // Stone type
  for (const [kw, val] of Object.entries(STONE_TYPE_KEYWORDS)) {
    if (t.includes(kw.toLowerCase())) { out.centerType = val; break; }
  }

  // Lab grown
  for (const kw of Object.keys(LAB_KEYWORDS)) {
    if (t.includes(kw)) { out.centerType = "Diamond"; out.labGrown = true; break; }
  }

  // Shape (for reference)
  for (const [kw, val] of Object.entries(SHAPE_KEYWORDS)) {
    if (t.includes(kw.toLowerCase())) { out.shape = val; break; }
  }

  return out;
}

function buildSuggestion(text) {
  const intent  = detectIntent(text);
  const filters = intent === "search_inventory" ? extractFilters(text) : {};
  const calc    = intent === "calculate_estimate" ? extractCalcSuggestion(text) : {};

  const descriptions = {
    search_inventory:   "חיפוש במלאי",
    calculate_estimate: "הצעת חישוב",
    create_certificate: "יצירת תעודה",
    use_in_calculator:  "שימוש במחשבון",
    clear_filters:      "ניקוי מסננים",
    show_help:          "עזרה",
  };

  return { intent, filters, calc, intentLabel: descriptions[intent] || intent };
}

// ─── SuggestionPill ───────────────────────────────────────────────────────────
function SuggestionPill({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ height:26, padding:"0 10px", background:"rgba(197,179,88,0.1)", border:"1px solid rgba(197,179,88,0.35)", borderRadius:13, cursor:"pointer", fontFamily:HEB, fontSize:11, color:"#6a5a10", whiteSpace:"nowrap", transition:"background 0.12s" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(197,179,88,0.2)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(197,179,88,0.1)"; }}
    >
      {text}
    </button>
  );
}

// ─── CommandBar ───────────────────────────────────────────────────────────────
export function CommandBar({ onSearch, onCalculate, onCertificate, onClearFilters, allItems = [] }) {
  const [text,       setText]       = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [confirmed,  setConfirmed]  = useState(false);
  const inputRef = useRef(null);

  const EXAMPLES = [
    "מצא יהלום עגול עד $2000",
    "חשב טבעת 18K זהב לבן 3g עם יהלום מעבדה קושן 1ct",
    "צור תעודה לאבן שנבחרה",
    "נקה מסננים",
  ];

  const handleInput = useCallback((value) => {
    setText(value);
    setSuggestion(null);
    setConfirmed(false);
    if (value.trim().length > 3) {
      setSuggestion(buildSuggestion(value));
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (!suggestion) return;
    setConfirmed(true);

    switch (suggestion.intent) {
      case "search_inventory":
        onSearch?.(suggestion.filters);
        break;
      case "calculate_estimate":
        onCalculate?.(suggestion.calc);
        break;
      case "create_certificate":
        onCertificate?.();
        break;
      case "clear_filters":
        onClearFilters?.();
        break;
      default:
        break;
    }

    setTimeout(() => {
      setText("");
      setSuggestion(null);
      setConfirmed(false);
    }, 1800);
  }, [suggestion, onSearch, onCalculate, onCertificate, onClearFilters]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && suggestion) handleConfirm();
    if (e.key === "Escape") { setText(""); setSuggestion(null); }
  };

  // Preview: count matching items when suggestion has filters
  const previewCount = suggestion?.intent === "search_inventory" && Object.keys(suggestion.filters).length > 0
    ? allItems.filter(item => {
        const f = suggestion.filters;
        if (f.stoneType   && item.stoneType  !== f.stoneType)    return false;
        if (f.shape       && item.cutForm    !== f.shape)         return false;
        if (f.productType && item.productType !== f.productType)  return false;
        if (f.priceMax    && Number(item.costUsd || 0) > Number(f.priceMax)) return false;
        if (f.caratMax    && parseFloat(item.caratWeight || 0) > parseFloat(f.caratMax)) return false;
        return true;
      }).length
    : null;

  return (
    <div style={{ marginBottom:16 }}>
      {/* Input */}
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:15, pointerEvents:"none", color:C.chl }}>✦</span>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="שאל / בצע פעולה... (מצא, חשב, צור תעודה)"
          dir="rtl"
          style={{
            width:"100%", height:44,
            border:"1px solid rgba(197,179,88,0.4)",
            borderRadius:10,
            background:"rgba(197,179,88,0.04)",
            paddingRight:14, paddingLeft:42,
            fontFamily:HEB, fontSize:14, color:C.ch,
            outline:"none", boxSizing:"border-box",
            transition:"border-color 0.15s, background 0.15s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = C.gd;
            e.currentTarget.style.background  = "rgba(197,179,88,0.08)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(197,179,88,0.4)";
            e.currentTarget.style.background  = "rgba(197,179,88,0.04)";
          }}
        />
        {text && (
          <button
            onClick={() => { setText(""); setSuggestion(null); }}
            style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.chl, fontSize:16 }}
          >✕</button>
        )}
      </div>

      {/* Example pills (shown when input is empty) */}
      {!text && (
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8 }}>
          {EXAMPLES.map(ex => (
            <SuggestionPill key={ex} text={ex} onClick={() => handleInput(ex)} />
          ))}
        </div>
      )}

      {/* Suggestion card */}
      {suggestion && !confirmed && (
        <div style={{
          marginTop:10, padding:"12px 16px",
          background:"#fff", border:`1px solid ${C.gd}`,
          borderRadius:8, boxShadow:"0 4px 14px rgba(54,69,79,0.1)",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
            <div>
              <span style={{ fontFamily:DAT, fontSize:9, fontWeight:700, color:C.chl, letterSpacing:"0.14em", textTransform:"uppercase" }}>
                כוונה שזוהתה
              </span>
              <div style={{ fontFamily:HEB, fontSize:13, fontWeight:700, color:C.ch, marginTop:3 }}>
                {suggestion.intentLabel}
              </div>
            </div>
            <div style={{ fontFamily:DAT, fontSize:9.5, color:C.chl, textAlign:"right" }}>
              {/* Future: will route via /api/ai/command → OpenAI Responses API */}
              פרסור מקומי
            </div>
          </div>

          {/* Extracted parameters */}
          {suggestion.intent === "search_inventory" && Object.keys(suggestion.filters).length > 0 && (
            <div style={{ marginBottom:10 }}>
              <div style={{ fontFamily:DAT, fontSize:10, color:C.chl, marginBottom:5 }}>מסננים מוצעים:</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {Object.entries(suggestion.filters).map(([k, v]) => (
                  <span key={k} style={{ padding:"2px 8px", background:"rgba(74,92,104,0.1)", borderRadius:10, fontFamily:DAT, fontSize:11, color:C.chm }}>
                    {k}: {v}
                  </span>
                ))}
                {previewCount !== null && (
                  <span style={{ padding:"2px 8px", background:"rgba(138,171,142,0.15)", borderRadius:10, fontFamily:DAT, fontSize:11, color:"#3d7a44" }}>
                    {previewCount} תוצאות
                  </span>
                )}
              </div>
            </div>
          )}

          {suggestion.intent === "calculate_estimate" && Object.keys(suggestion.calc).length > 0 && (
            <div style={{ marginBottom:10 }}>
              <div style={{ fontFamily:DAT, fontSize:10, color:C.chl, marginBottom:5 }}>פרמטרים לחישוב:</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {Object.entries(suggestion.calc).map(([k, v]) => (
                  <span key={k} style={{ padding:"2px 8px", background:"rgba(197,179,88,0.12)", borderRadius:10, fontFamily:DAT, fontSize:11, color:C.chm }}>
                    {k}: {String(v)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Confirmation note */}
          <div style={{ fontFamily:HEB, fontSize:11, color:C.chl, marginBottom:10, lineHeight:1.6 }}>
            {suggestion.intent === "calculate_estimate"
              ? "⚠️ הפעולה תטען טיוטת חישוב — יש לאשר לפני שינוי הנתונים הנוכחיים."
              : suggestion.intent === "create_certificate"
              ? "הפעולה תנווט ללשונית תעודות."
              : "הפעולה תיישם מסננים על המלאי."}
          </div>

          <div style={{ display:"flex", gap:8 }}>
            <button
              onClick={handleConfirm}
              style={{ height:36, padding:"0 16px", background:C.ch, color:C.iv, border:"none", borderRadius:7, cursor:"pointer", fontFamily:HEB, fontSize:13, fontWeight:700 }}
            >
              אשר ובצע
            </button>
            <button
              onClick={() => { setText(""); setSuggestion(null); }}
              style={{ height:36, padding:"0 14px", background:"transparent", border:"1px solid rgba(54,69,79,0.2)", borderRadius:7, cursor:"pointer", fontFamily:HEB, fontSize:12, color:C.chl }}
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* Confirmed feedback */}
      {confirmed && (
        <div style={{ marginTop:10, padding:"10px 14px", background:"rgba(138,171,142,0.12)", border:"1px solid rgba(138,171,142,0.4)", borderRadius:8, fontFamily:HEB, fontSize:12.5, color:"#2e6636" }}>
          ✓ הפעולה בוצעה
        </div>
      )}
    </div>
  );
}

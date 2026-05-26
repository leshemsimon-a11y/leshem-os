/**
 * components/Certificate.jsx
 *
 * "Quiet Luxury" A4 printable quotation certificate.
 *
 * The outer div carries className="printable-container" which is the
 * anchor used by the @media print rule in lib/printCss.js:
 *   • On screen  — renders as a constrained preview (max-width 210mm)
 *   • On print   — pinned to position:fixed; inset:0; exactly one A4 page
 *
 * This component is pure display — all data arrives via props.
 * Zero state, zero side-effects.
 *
 * Props:
 *   cfg      {object}       Full quote config (DCFG shape)
 *   res      {object}       Calculated results from calcApp(cfg)
 *   pieceImg {string|null}  Base64 data URL for uploaded piece image
 *   fmtFn    {function}     Currency formatter: fmtFn(usdValue) → string
 *   qNum     {string}       Quote reference number, e.g. "LS-2026-4712"
 *   currency {string}       "USD" | "ILS" — used only for the rate note line
 */

import { r2, fmtDate } from "../lib/calculations";
import { C } from "../lib/constants";

export function Certificate({ cfg, res, pieceImg, fmtFn, qNum, currency }) {
  const ss1Count   = parseInt(cfg.ss1Count, 10) || 0;
  const ss1TotalCt = r2((parseFloat(cfg.ss1Ct) || 0) * ss1Count);
  const hasPieceImg = !!pieceImg;

  return (
    <div
      className="printable-container"
      style={{
        width:      "210mm",
        maxWidth:   "100%",
        minHeight:  "297mm",
        background: C.iv,
        padding:    "22mm 18mm 18mm",
        fontFamily: C.serif,
        color:      C.ch,
        position:   "relative",
        overflow:   "hidden",
        boxSizing:  "border-box",
        margin:     "0 auto",
      }}
    >

      {/* ── Watermark "L" ──────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          top:           "50%",
          left:          "50%",
          transform:     "translate(-50%, -50%) rotate(-15deg)",
          fontSize:      320,
          fontFamily:    C.serif,
          color:         "rgba(54,69,79,0.025)",
          fontWeight:    700,
          userSelect:    "none",
          pointerEvents: "none",
          lineHeight:    1,
          zIndex:        0,
        }}
      >
        L
      </div>

      {/* ── Content layer (sits above the watermark) ───────────────── */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Header: brand + quote meta */}
        <div
          style={{
            borderBottom:   `1px solid ${C.gd}`,
            paddingBottom:  "6mm",
            marginBottom:   "8mm",
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "flex-end",
          }}
        >
          <div>
            <div
              style={{
                fontSize:      22,
                letterSpacing: "0.25em",
                fontFamily:    C.serif,
                color:         C.ch,
                fontWeight:    700,
              }}
            >
              LESHEM.S
            </div>
            <div
              style={{
                fontSize:      9,
                letterSpacing: "0.2em",
                color:         C.chl,
                fontFamily:    C.eng,
                marginTop:     2,
              }}
            >
              FINE JEWELRY · EST. 2018
            </div>
          </div>

          <div
            style={{
              textAlign:  "right",
              fontFamily: C.eng,
              fontSize:   9,
              color:      C.chl,
            }}
          >
            <div>JEWELRY QUOTATION</div>
            <div
              style={{
                fontWeight: 600,
                color:      C.ch,
                marginTop:  2,
              }}
            >
              #{qNum}
            </div>
            <div style={{ marginTop: 2 }}>{fmtDate()}</div>
          </div>
        </div>

        {/* Client name + piece image */}
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: hasPieceImg ? "1fr 110px" : "1fr",
            gap:                 "8mm",
            marginBottom:        "8mm",
          }}
        >
          <div>
            {cfg.clientName && (
              <div style={{ marginBottom: "4mm" }}>
                <div
                  style={{
                    fontSize:      8,
                    letterSpacing: "0.15em",
                    color:         C.chl,
                    fontFamily:    C.eng,
                    marginBottom:  3,
                  }}
                >
                  PREPARED FOR
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {cfg.clientName}
                </div>
              </div>
            )}

            {cfg.quoteName && (
              <div>
                <div
                  style={{
                    fontSize:      8,
                    letterSpacing: "0.15em",
                    color:         C.chl,
                    fontFamily:    C.eng,
                    marginBottom:  3,
                  }}
                >
                  PIECE DESCRIPTION
                </div>
                <div style={{ fontSize: 12 }}>{cfg.quoteName}</div>
              </div>
            )}

            {!cfg.clientName && !cfg.quoteName && (
              <div style={{ fontSize: 11, color: C.chl, fontStyle: "italic" }}>
                Jewelry Quotation — {fmtDate()}
              </div>
            )}
          </div>

          {hasPieceImg && (
            <div
              style={{
                width:    110,
                height:   110,
                border:   `0.5px solid rgba(54,69,79,0.2)`,
                overflow: "hidden",
              }}
            >
              <img
                src={pieceImg}
                alt="piece"
                style={{
                  width:     "100%",
                  height:    "100%",
                  objectFit: "contain",   // no distortion or clipping
                }}
              />
            </div>
          )}
        </div>

        {/* Stone specifications table */}
        <div
          style={{
            background:    C.iv2,
            padding:       "5mm 6mm",
            marginBottom:  "8mm",
          }}
        >
          <div
            style={{
              fontSize:      8,
              letterSpacing: "0.15em",
              color:         C.chl,
              fontFamily:    C.eng,
              marginBottom:  "3mm",
            }}
          >
            STONE SPECIFICATIONS
          </div>

          <table
            style={{
              width:           "100%",
              borderCollapse:  "collapse",
              fontFamily:      C.eng,
              fontSize:        10,
            }}
          >
            <thead>
              <tr
                style={{ borderBottom: `0.5px solid rgba(54,69,79,0.2)` }}
              >
                {["ITEM", "TYPE", "WEIGHT", "SPECIFICATIONS", "EST. VALUE"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        textAlign:     "left",
                        padding:       "2mm 3mm 2mm 0",
                        fontWeight:    600,
                        color:         C.chl,
                        fontSize:      8,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {/* Center stone row */}
              <tr>
                <td style={{ padding: "2mm 3mm 2mm 0" }}>Center Stone</td>
                <td>{cfg.centerType}</td>
                <td>{cfg.centerCt} ct</td>
                <td>
                  {cfg.centerType === "Diamond"
                    ? `${cfg.centerColor} / ${cfg.centerClarity} · ${cfg.centerSetting}`
                    : "—"}
                </td>
                <td style={{ fontWeight: 600 }}>{fmtFn(res.centerCost)}</td>
              </tr>

              {/* Side stone row — only shown when count > 0 */}
              {ss1Count > 0 && (
                <tr>
                  <td style={{ padding: "2mm 3mm 2mm 0" }}>Side Stones</td>
                  <td>{cfg.ss1Type}</td>
                  <td>
                    {ss1TotalCt} ct ({ss1Count} pcs)
                  </td>
                  <td>{cfg.ss1Setting}</td>
                  <td style={{ fontWeight: 600 }}>{fmtFn(res.ss1Cost)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Metal details row */}
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap:                 "5mm",
            marginBottom:        "8mm",
            borderTop:           `0.5px solid rgba(54,69,79,0.12)`,
            paddingTop:          "5mm",
          }}
        >
          {[
            ["METAL",   cfg.metal],
            ["WEIGHT",  (cfg.grams || "—") + " g"],
            ["CASTING", cfg.cast],
          ].map(([lbl, val]) => (
            <div key={lbl}>
              <div
                style={{
                  fontSize:      8,
                  color:         C.chl,
                  fontFamily:    C.eng,
                  letterSpacing: "0.1em",
                  marginBottom:  2,
                }}
              >
                {lbl}
              </div>
              <div style={{ fontSize: 11 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Price block */}
        <div
          style={{
            background:   C.ch,
            padding:      "6mm 8mm",
            marginTop:    "6mm",
            marginBottom: "10mm",
          }}
        >
          <div
            style={{
              display:        "flex",
              justifyContent: "space-between",
              alignItems:     "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize:      8,
                  color:         C.chx,
                  fontFamily:    C.eng,
                  letterSpacing: "0.2em",
                }}
              >
                RETAIL PRICE (INCL. VAT)
              </div>
              <div
                style={{
                  fontSize:   28,
                  fontFamily: C.serif,
                  color:      C.iv,
                  fontWeight: 700,
                  marginTop:  2,
                }}
              >
                {fmtFn(res.ri)}
              </div>
              {currency === "ILS" && (
                <div
                  style={{
                    fontSize:   8,
                    color:      C.chx,
                    fontFamily: C.eng,
                    marginTop:  4,
                  }}
                >
                  Exchange rate: 3.75 ILS / USD
                </div>
              )}
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize:   8,
                  color:      C.chx,
                  fontFamily: C.eng,
                }}
              >
                WHOLESALE
              </div>
              <div
                style={{
                  fontSize:   13,
                  color:      C.gd,
                  fontWeight: 600,
                  marginTop:  2,
                }}
              >
                {fmtFn(res.ws)}
              </div>
            </div>
          </div>
        </div>

        {/* Notes (only rendered when non-empty) */}
        {cfg.notes && (
          <div style={{ marginBottom: "8mm" }}>
            <div
              style={{
                fontSize:      8,
                letterSpacing: "0.15em",
                color:         C.chl,
                fontFamily:    C.eng,
                marginBottom:  3,
              }}
            >
              NOTES
            </div>
            <div
              style={{
                fontSize:   10,
                lineHeight: 1.7,
                color:      C.chm,
              }}
            >
              {cfg.notes}
            </div>
          </div>
        )}

        {/* Footer: signature + contact */}
        <div
          style={{
            borderTop:      `0.5px solid rgba(197,179,88,0.4)`,
            paddingTop:     "5mm",
            marginTop:      "6mm",
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "flex-end",
          }}
        >
          <div>
            <div
              style={{
                fontSize:   10,
                fontFamily: C.serif,
                color:      C.ch,
                fontStyle:  "italic",
              }}
            >
              Leshem Simon
            </div>
            <div
              style={{
                fontSize:      7.5,
                fontFamily:    C.eng,
                color:         C.chl,
                letterSpacing: "0.1em",
                marginTop:     1,
              }}
            >
              FOUNDER · CERTIFIED DIAMOND GRADER &amp; EXPERT JEWELER
            </div>
          </div>

          <div
            style={{
              textAlign:  "right",
              fontSize:   7.5,
              fontFamily: C.eng,
              color:      C.chl,
            }}
          >
            <div>LESHEM.S Jewelry</div>
            <div>Tuval St 23, Ramat Gan · VAT: 046240016</div>
            <div style={{ color: C.gd, marginTop: 1 }}>leshem-s.com</div>
          </div>
        </div>

      </div>{/* /content layer */}
    </div>/* /printable-container */
  );
}

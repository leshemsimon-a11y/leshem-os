import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Calculator, Gem, FileText, ChevronDown, X, Printer, RotateCcw,
  Search, TrendingDown, TrendingUp, ArrowLeft, Check, Star,
  GripVertical, Plus, Minus, AlertCircle, LayoutGrid, List,
  ImageIcon, Pencil, Lock, FileCheck, Package, ClipboardList,
  Eye, Database
} from "lucide-react";

/* ── TOKENS & DESIGN SYSTEM ── */
const C={
  iv:"#FAF9F6",iv2:"#F0EDE8",iv3:"#E5E0D5",
  ch:"#36454F",chm:"#4a5c68",chl:"#7a8e98",chx:"#a8bcc4",
  gd:"#C5B358",gdm:"#a8973f",gds:"rgba(197,179,88,0.12)",
  bl:"rgba(54,69,79,0.10)",blm:"rgba(54,69,79,0.18)",
  serif:"'Merriweather','Times New Roman',Georgia,serif",
  heb:"'Assistant','Heebo',Arial,sans-serif",
  eng:"'DM Sans',Helvetica,Arial,sans-serif",
};
const usd=v=>"$"+new Intl.NumberFormat("en-US",{minimumFractionDigits:0,maximumFractionDigits:0}).format(Math.round(v||0));
const r2=n=>Math.round(n*100)/100;
const fmtD=()=>new Intl.DateTimeFormat("en-GB",{day:"2-digit",month:"long",year:"numeric"}).format(new Date());
const ovr=(o,n)=>o!==""?(parseFloat(o)||0):n;
const uid=()=>Math.random().toString(36).slice(2,8).toUpperCase();

/* ── INITIAL STORAGE DUMMY DATA ── */
const INIT_STONES=[
  {id:"s01",sku:"DIA-RND-210",nH:"יהלום עגול 2.10ct",nE:"Round Brilliant 2.10ct",type:"Diamond",tH:"יהלום",shape:"Round",sH:"עגול",ct:2.10,color:"G",cla:"VS1",cost:15200,img:null},
  {id:"s02",sku:"DIA-OVL-180",nH:"יהלום אובל 1.80ct",nE:"Oval Diamond 1.80ct",type:"Diamond",tH:"יהלום",shape:"Oval",sH:"אובל",ct:1.80,color:"F",cla:"VVS2",cost:18400,img:null},
  {id:"s03",sku:"DIA-CSH-302",nH:"יהלום כרית 3.02ct",nE:"Cushion Diamond 3.02ct",type:"Diamond",tH:"יהלום",shape:"Cushion",sH:"כרית",ct:3.02,color:"D",cla:"IF",cost:68000,img:null},
  {id:"s04",sku:"DIA-PER-121",nH:"יהלום טיפה 1.21ct",nE:"Pear Diamond 1.21ct",type:"Diamond",tH:"יהלום",shape:"Pear",sH:"טיפה",ct:1.21,color:"H",cla:"SI1",cost:4850,img:null},
  {id:"s05",sku:"DIA-EMC-095",nH:"יהלום אמרלד קאט 0.95ct",nE:"Emerald Cut 0.95ct",type:"Diamond",tH:"יהלום",shape:"Emerald Cut",sH:"אמרלד קאט",ct:0.95,color:"G",cla:"VS2",cost:3600,img:null},
];

const METALS=["18K Yellow","18K White","18K Rose","14K Yellow","14K White","14K Rose","Platinum 950"];
const PURITY={"18K Yellow":0.75,"18K White":0.75,"18K Rose":0.75,"14K Yellow":0.585,"14K White":0.585,"14K Rose":0.585,"Platinum 950":0.95};
const ALLOYS={"18K Yellow":1.8,"18K White":4.2,"18K Rose":2.1,"14K Yellow":1.5,"14K White":3.8,"14K Rose":1.8,"Platinum 950":2.5};
const MSPOT={"18K Yellow":62.4,"18K White":62.4,"18K Rose":62.4,"14K Yellow":62.4,"14K White":62.4,"14K Rose":62.4,"Platinum 950":31.6};
const CASTS=["CAD / Casting","Lost Wax Casting","Hand Fabrication","Die Striking"];
const CLOSS={"CAD / Casting":0.08,"Lost Wax Casting":0.12,"Hand Fabrication":0.05,"Die Striking":0.03};
const CMULT={Simple:1.0,Medium:1.35,Complex:1.70,Bespoke:2.20};
const CHEB={Simple:"פשוט",Medium:"בינוני",Complex:"מורכב",Bespoke:"ייחודי"};
const STYPES=["Diamond","Sapphire","Ruby","Emerald","Alexandrite","Other"];
const SBASE={Diamond:2800,Sapphire:1200,Ruby:1500,Emerald:900,Alexandrite:3500,Other:300};
const CFACT={D:1.80,E:1.65,F:1.50,G:1.30,H:1.15,I:1.00,J:0.88,K:0.75};
const KFACT={IF:2.00,VVS1:1.70,VVS2:1.55,VS1:1.35,VS2:1.20,SI1:1.00,SI2:0.85,I1:0.65};
const SET_ENG=["Prong / Claw","Pavé","Burnish","Bezel"];
const SET_HEB={"Prong / Claw":"פרונג","Pavé":"פאווה","Burnish":"בורניש","Bezel":"בזל"};
const SET_RATE={"Prong / Claw":14,"Pavé":3.5,"Burnish":8.5,"Bezel":16};
const SPECIES={Diamond:"Natural Diamond",Sapphire:"Natural Corundum",Ruby:"Natural Corundum",Emerald:"Natural Beryl",Alexandrite:"Natural Chrysoberyl",Other:""};
const MU={ws:2.30,rx:1.65,vat:0.18};

/* ── FORMULA ENGINE ── */
function estStone(type,ct,color,clarity){
  const base=SBASE[type]??300;
  const cf=type==="Diamond"?(CFACT[color]??1):1;
  const kf=type==="Diamond"?(KFACT[clarity]??1):1;
  return r2(base*Math.pow(parseFloat(ct)||1,1.8)*cf*kf);
}
function calcCenter(cfg){
  if(cfg.stoneMode==="real"&&cfg.stone) return cfg.stone.cost;
  if(cfg.centerManual!=="") return parseFloat(cfg.centerManual)||0;
  return estStone(cfg.centerType,cfg.centerCt,cfg.centerColor,cfg.centerClarity);
}
function calcSS(type,ct,count,manual,mode,realStone){
  if(mode==="real"&&realStone) return realStone.cost;
  const n=parseInt(count)||0; if(!n) return 0;
  if(manual!=="") return parseFloat(manual)||0;
  return r2(n*estStone(type,ct,"G","VS1"));
}
function calcLc(cfg,cm){
  const raw=(SET_RATE[cfg.centerSetting]??14)+
    (parseInt(cfg.ss1Count)||0)*(SET_RATE[cfg.ss1Setting]??3.5)+
    (parseInt(cfg.ss2Count)||0)*(SET_RATE[cfg.ss2Setting]??3.5);
  return r2(raw*cm);
}
function calc(cfg){
  const wg=parseFloat(cfg.grams)||0; if(!wg) return null;
  const gw=r2(wg*(1+(CLOSS[cfg.cast]??0.08)));
  const mc_nat=r2(gw*((MSPOT[cfg.metal]??62.4)*(PURITY[cfg.metal]??0.75)+(ALLOYS[cfg.metal]??1.8)));
  const cm=CMULT[cfg.cmplx]??1;
  const lc_nat=calcLc(cfg,cm);
  const mc=ovr(cfg.mcOv,mc_nat); const lc=ovr(cfg.lcOv,lc_nat);
  const sc=calcCenter(cfg);
  const ss1=calcSS(cfg.ss1Type,cfg.ss1Ct,cfg.ss1Count,cfg.ss1Manual,cfg.ss1Mode,cfg.ss1Stone);
  const ss2=calcSS(cfg.ss2Type,cfg.ss2Ct,cfg.ss2Count,cfg.ss2Manual,cfg.ss2Mode,cfg.ss2Stone);
  const compCost=r2((cfg.selectedComponents||[]).reduce((s,c)=>s+(c.cost||0),0));
  const stones=r2(sc+ss1+ss2);
  const oh=r2((mc+lc)*0.18);
  const prod_nat=r2(mc+lc+stones+compCost+oh);
  const prod=ovr(cfg.prodOv,prod_nat);
  const ws_nat=r2(prod*MU.ws); const ws=ovr(cfg.wsOv,ws_nat);
  const rx_nat=r2(ws*MU.rx);    const rx=ovr(cfg.rxOv,rx_nat);
  const ri_nat=r2(rx*(1+MU.vat)); const ri=ovr(cfg.riOv,ri_nat);
  return {mc,lc,sc,ss1,ss2,compCost,stones,oh,prod,ws,rx,ri,gw,
          mc_nat,lc_nat,prod_nat,ws_nat,rx_nat,ri_nat};
}

function matchScore(target,cand){
  if(!target||target.id===cand.id||target.type!==cand.type) return 0;
  const diff=Math.abs(target.ct-cand.ct); if(diff>0.20) return 0;
  let s=diff<=0.05?40:diff<=0.10?28:14;
  if(target.shape===cand.shape) s+=30;
  if(target.type==="Diamond"){
    const g=["D","E","F","G","H","I","J","K"];
    const ti=g.indexOf(target.color),ci=g.indexOf(cand.color);
    if(ti!==-1&&ci!==-1){if(ti===ci)s+=20;else if(Math.abs(ti-ci)<=1)s+=8;}
  }
  if(target.cla===cand.cla) s+=10;
  return Math.min(s,100);
}
function sBadge(s){
  if(s>=80) return {l:"מצוינת",bg:"rgba(197,179,88,0.18)",c:C.gdm};
  if(s>=60) return {l:"טובה",bg:"rgba(90,160,100,0.13)",c:"#4a8e56"};
  if(s>=30) return {l:"חלשה",bg:C.iv3,c:C.chl};
  return null;
}

function gemInsight(data){
  if(!data||!data.type) return "";
  const ct=parseFloat(data.ct)||0;
  if(data.type==="Diamond"){
    const cDesc={D:"exceptional D-color (truly colorless)",E:"E-color (colorless)",F:"F-color (colorless)",G:"G-color (near-colorless)",H:"H-color (near-colorless)",I:"I-color (near-colorless)",J:"J-color (near-colorless)",K:"K-color (faint tint)"}[data.color]||(data.color?`${data.color}-color`:null);
    const kDesc={IF:"internally flawless — no inclusions visible under 10× magnification",VVS1:"very, very slight inclusions — minute characteristics nearly impossible to see",VVS2:"very, very slight inclusions — minute characteristics difficult to see",VS1:"very slight inclusions — minor characteristics observed with effort",VS2:"very slight inclusions — minor characteristics visible with effort",SI1:"slight inclusions — noticeable characteristics, eye-clean in most cuts",SI2:"slight inclusions — noticeable inclusions, may be visible to the naked eye",I1:"included — inclusions visible to the naked eye"}[data.cla]||null;
    const shape=data.shape||"";
    const parts=[];
    if(ct) parts.push(`This ${ct}ct ${shape} diamond`);
    else parts.push(`This ${shape} diamond`);
    if(cDesc) parts.push(`exhibits ${cDesc} coloration`);
    if(kDesc) parts.push(`with ${kDesc} (${data.cla||""})`);
    return parts.filter(Boolean).join(", ")+".";
  }
  const sDesc={Sapphire:"Corundum (Al₂O₃) — hardness 9 on the Mohs scale",Ruby:"Corundum (Al₂O₃) — hardness 9 on the Mohs scale, colour derived from chromium",Emerald:"Beryl (Be₃Al₂Si₆O₁₈) — hardness 7.5–8, valued for vivid green saturation",Alexandrite:"Chrysoberyl — hardness 8.5, exhibits colour-change phenomenon"}[data.type]||"";
  return `This ${ct?ct+"ct ":""}${data.shape||""} ${data.type} displays ${data.color||"characteristic"} coloration. ${sDesc}`.trim();
}

/* ── REUSABLE UI ELEMENTS ── */
const GR=({soft,my=0})=><div style={{height:"0.5px",background:soft?"rgba(197,179,88,0.2)":C.gd,marginTop:my,marginBottom:my}}/>;
const EB=({dark,s={},children})=><div style={{fontFamily:C.heb,fontSize:11,fontWeight:600,letterSpacing:"0.05em",color:dark?C.ch:C.chl,marginBottom:5,...s}}>{children}</div>;

function Pills({opts,val,onChange}){
  return(<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
    {opts.map(([v,l])=>(
      <button key={v} onClick={()=>onChange(v)} style={{fontFamily:C.heb,fontSize:13,cursor:"pointer",color:val===v?C.iv:C.chm,background:val===v?C.ch:"transparent",border:`0.5px solid ${val===v?C.ch:C.blm}`,padding:"8px 16px",transition:"all 0.12s"}}>{l}</button>
    ))}
  </div>);
}

function ImgDrop({img,onImg,h=90,label="לחץ או גרור תמונה להעלאה",small,className}){
  const [hov,setHov]=useState(false);
  const ref=useRef();
  function handle(file){if(!file||!file.type.startsWith("image/"))return;const r=new FileReader();r.onload=e=>onImg(e.target.result);r.readAsDataURL(file);}
  return(
    <div className={className}
      onDragOver={e=>{e.preventDefault();setHov(true);}} onDragLeave={()=>setHov(false)}
      onDrop={e=>{e.preventDefault();setHov(false);handle(e.dataTransfer.files[0]);}}
      onClick={()=>ref.current?.click()}
      style={{height:h,background:img?"transparent":hov?C.iv3:C.iv2,border:`0.5px dashed ${hov?C.blm:C.bl}`,cursor:"pointer",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"background 0.12s",borderRadius:4}}>
      {img?(<>
        <img src={img} style={{width:"100%",height:"100%",objectFit:"contain"}}/>
        <button onClick={e=>{e.stopPropagation();onImg(null);}} style={{position:"absolute",top:6,right:6,background:"rgba(54,69,79,0.7)",border:"none",borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff"}}><X size={12}/></button>
      </>):(
        <><ImageIcon size={small?16:22} color={C.chx} strokeWidth={1.2}/><span style={{fontFamily:C.heb,fontSize:small?11:12,color:C.chx,marginTop:4}}>{label}</span></>
      )}
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handle(e.target.files[0])}/>
    </div>
  );
}

function Sel({label,opts,half,sx={},...p}){
  return(<div style={{display:"flex",flexDirection:"column",gap:4,width:half?"50%":"100%"}}>
    {label&&<EB>{label}</EB>}
    <div style={{position:"relative"}}>
      <select style={{fontFamily:C.heb,fontSize:14,color:C.ch,background:C.iv2,border:`0.5px solid ${C.blm}`,padding:"10px 12px 10px 28px",outline:"none",appearance:"none",width:"100%",borderRadius:4,...sx}} {...p}>
        {opts.map(o=><option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.chl,pointerEvents:"none"}}/>
    </div>
  </div>);
}
function Inp({label,half,sx={},...p}){
  return(<div style={{display:"flex",flexDirection:"column",gap:4,width:half?"50%":"100%"}}>
    {label&&<EB>{label}</EB>}
    <input style={{fontFamily:C.heb,fontSize:14,color:C.ch,background:C.iv2,border:`0.5px solid ${C.blm}`,padding:"10px 12px",outline:"none",width:"100%",borderRadius:4,...sx}} {...p}/>
  </div>);
}
function Pnl({num,title,children}){
  return(<div style={{border:`0.5px solid ${C.bl}`,marginBottom:16,background:C.iv,borderRadius:4}}>
    <div style={{display:"flex",alignItems:"baseline",gap:10,padding:"12px 16px 11px",borderBottom:`0.5px solid ${C.bl}`}}>
      <span style={{fontFamily:C.eng,fontSize:10,color:C.gdm,letterSpacing:"0.15em"}}>{num}</span>
      <span style={{fontFamily:C.heb,fontSize:14,fontWeight:600,color:C.ch}}>{title}</span>
    </div>
    <div style={{padding:"16px"}}>{children}</div>
  </div>);
}
function EKpi({label,value,nat,sub,hi,ov:oVal,onOv,onClr}){
  const [ed,setEd]=useState(false);
  const [draft,setDraft]=useState("");
  const locked=oVal!=="";
  const ref=useRef();
  function startEdit(){setDraft(oVal!==""?oVal:String(Math.round(nat||0)));setEd(true);setTimeout(()=>ref.current?.select(),40);}
  function commit(){const v=draft.trim();(!v||(parseFloat(v)||0)===0)?onClr():onOv(v);setEd(false);}
  return(<div style={{border:`0.5px solid ${hi?C.ch:locked?"rgba(197,179,88,0.5)":C.bl}`,padding:"16px",background:hi?C.ch:C.iv,position:"relative",overflow:"hidden",borderRadius:4}}>
    {locked&&!hi&&<div style={{position:"absolute",top:0,left:0,width:"100%",height:"2px",background:C.gd}}/>}
    <EB s={{color:hi?"rgba(225,215,195,0.42)":C.chl,marginBottom:4}}>{label}</EB>
    {ed?(
      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
        <span style={{fontFamily:C.eng,fontSize:14,color:hi?C.gd:C.chm}}>$</span>
        <input ref={ref} type="number" value={draft} onChange={e=>setDraft(e.target.value)}
          onBlur={commit} onKeyDown={e=>{if(e.key==="Enter")commit();if(e.key==="Escape"){setEd(false);onClr();}}}
          style={{fontFamily:C.serif,fontSize:18,color:hi?C.gd:C.ch,background:"transparent",border:"none",borderBottom:`1px solid ${hi?"rgba(197,179,88,0.6)":C.blm}`,outline:"none",width:"100%",padding:"2px 0"}}/>
      </div>
    ):(
      <div style={{fontFamily:C.serif,fontSize:20,fontWeight:300,color:hi?C.gd:C.ch,lineHeight:1,marginBottom:6}}>
        {value!=null?usd(value):<span style={{color:hi?"rgba(225,215,195,0.15)":C.chx,fontSize:14}}>—</span>}
      </div>
    )}
    <div style={{fontFamily:C.heb,fontSize:10.5,color:hi?"rgba(225,215,195,0.32)":C.chx,lineHeight:1.4}}>{sub}</div>
    {value!=null&&<div style={{position:"absolute",top:10,left:10,display:"flex",gap:6,alignItems:"center"}}>
      {locked&&!ed&&<button onClick={onClr} style={{background:"rgba(197,179,88,0.18)",border:"none",cursor:"pointer",padding:"4px",display:"flex"}}><X size={12} color={C.gdm}/></button>}
      {!ed&&<button onClick={startEdit} style={{background:"transparent",border:"none",cursor:"pointer",padding:"4px",opacity:0.6,display:"flex"}}><Pencil size={12} color={hi?C.gd:C.ch}/></button>}
    </div>}
  </div>);
}
function ERow({label,note,nat,ov:oVal,onOv,onClr}){
  const [ed,setEd]=useState(false);
  const [draft,setDraft]=useState("");
  const locked=oVal!=="";
  const ref=useRef();
  function startEdit(){setDraft(oVal!==""?oVal:String(Math.round(nat||0)));setEd(true);setTimeout(()=>ref.current?.select(),40);}
  function commit(){const v=draft.trim();(!v||(parseFloat(v)||0)===0)?onClr():onOv(v);setEd(false);}
  return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`0.5px solid rgba(54,69,79,0.06)`}}>
    <div style={{flex:1}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontFamily:C.heb,fontSize:14,color:C.ch}}>{label}</span>{locked&&<Lock size={11} color={C.gdm}/>}</div>
      <div style={{fontFamily:C.eng,fontSize:10,color:C.chx,marginTop:2}}>{note}</div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      {ed?(<div style={{display:"flex",gap:4,alignItems:"center"}}>
        <span style={{fontFamily:C.eng,fontSize:12,color:C.chm}}>$</span>
        <input ref={ref} type="number" value={draft} onChange={e=>setDraft(e.target.value)}
          onBlur={commit} onKeyDown={e=>{if(e.key==="Enter")commit();if(e.key==="Escape"){setEd(false);onClr();}}}
          style={{fontFamily:C.serif,fontSize:14,color:C.ch,background:C.iv2,border:`0.5px solid ${C.blm}`,outline:"none",width:80,padding:"4px 8px",textAlign:"left"}}/>
      </div>):(<span style={{fontFamily:C.serif,fontSize:15,color:locked?C.gdm:C.ch,whiteSpace:"nowrap"}}>{usd(nat)}</span>)}
      {!ed&&<button onClick={startEdit} style={{background:"transparent",border:"none",cursor:"pointer",padding:"4px",opacity:0.6,display:"flex"}}><Pencil size={12} color={C.ch}/></button>}
      {locked&&!ed&&<button onClick={onClr} style={{background:"transparent",border:"none",cursor:"pointer",padding:"4px",display:"flex"}}><X size={12} color={C.gdm}/></button>}
    </div>
  </div>);
}

/* ═══════════ QUOTE CERTIFICATE (English LTR Luxury Template) ═══════════ */
function QuoteCert({cfg,res,pieceImg}){
  const qref=useMemo(()=>{const d=new Date();return `QT-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${(cfg.clientName||"DRAFT").replace(/\s+/g,"-").toUpperCase().slice(0,10)}`;},[cfg.clientName]);
  const cDesc=cfg.stoneMode==="real"&&cfg.stone
    ?`${cfg.stone.ct}ct ${cfg.stone.type}, ${cfg.stone.color}, ${cfg.stone.cla} · ${cfg.centerSetting}`
    :`${cfg.centerCt}ct ${cfg.centerType}${cfg.centerType==="Diamond"?`, ${cfg.centerColor} color, ${cfg.centerClarity} clarity`:""} · ${cfg.centerSetting}`;
  const comps=(cfg.selectedComponents||[]);
  const Row=({l,v,first,it})=>(!v?null:(
    <div style={{display:"flex",padding:"14px 0",borderTop:first?`0.5px solid rgba(197,179,88,0.25)`:"none",borderBottom:`0.5px solid rgba(197,179,88,0.15)`}}>
      <div style={{fontFamily:C.eng,fontSize:10,fontWeight:600,color:C.chl,letterSpacing:"0.1em",width:"35%",textTransform:"uppercase"}}>{l}</div>
      <div style={{fontFamily:C.serif,fontSize:13,fontWeight:300,fontStyle:it?"italic":"normal",color:it?C.chm:C.ch,flex:1,lineHeight:1.6}}>{v}</div>
    </div>
  ));
  return(
    <div dir="ltr" id="cert-root" style={{fontFamily:C.eng,background:C.iv,padding:55,maxWidth:720,margin:"0 auto",minHeight:960,boxSizing:"border-box",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
      <div>
        {/* Top Header Block */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:35}}>
          <div>
            <div style={{width:22,height:22,border:`1px solid ${C.gd}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8}}><span style={{fontFamily:C.serif,fontSize:11,color:C.gd}}>L</span></div>
            <div style={{fontFamily:C.serif,fontSize:22,fontWeight:300,color:C.ch,letterSpacing:8,lineHeight:1}}>LESHEM.S</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:C.eng,fontSize:9,color:C.chl,letterSpacing:"2px",textTransform:"uppercase",marginBottom:4}}>Quotation</div>
            <div style={{fontFamily:C.eng,fontSize:12,fontWeight:500,color:C.ch}}>{qref}</div>
          </div>
        </div>
        
        <GR/>
        
        {/* Meta Grid */}
        <div style={{display:"flex",justifyContent:"space-between",margin:"25px 0 35px"}}>
          <div>
            <div style={{fontFamily:C.eng,fontSize:9,color:C.chl,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:4}}>Prepared For</div>
            <div style={{fontFamily:C.serif,fontSize:14,fontWeight:300,color:C.ch}}>{cfg.clientName||"—"}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:C.eng,fontSize:9,color:C.chl,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:4}}>Date of Issue</div>
            <div style={{fontFamily:C.serif,fontSize:14,fontWeight:300,color:C.ch}}>{fmtD()}</div>
          </div>
        </div>

        {/* Dynamic Image Space / Intentional Dead Space */}
        <div style={{width:"100%",height:190,background:C.iv2,border:`0.5px solid rgba(197,179,88,0.2)`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:45,position:"relative",overflow:"hidden"}}>
          {pieceImg?<img src={pieceImg} alt="piece" style={{width:"100%",height:"100%",objectFit:"contain"}}/>:(
            <div style={{fontFamily:C.eng,fontSize:10,color:C.chl,letterSpacing:"2.5px",textTransform:"uppercase",opacity:0.4}}>Fine Jewelry Portfolio Render</div>
          )}
        </div>

        {/* Specification Fields */}
        <div style={{marginBottom:10,fontFamily:C.eng,fontSize:9,color:C.chl,letterSpacing:"2px",textTransform:"uppercase",fontWeight:600}}>Piece Specification</div>
        <Row first l="Metal Matrix" v={cfg.metal}/>
        <Row l="Gross Weight" v={cfg.grams?`${cfg.grams}g  (${res?.gw??cfg.grams}g allocation)`:""}/>
        <Row l="Center Core" v={cDesc}/>
        {(parseInt(cfg.ss1Count)||0)>0&&<Row l="Accent Melee I" v={`${cfg.ss1Count} × ${cfg.ss1Ct}ct ${cfg.ss1Type}`}/>}
        {(parseInt(cfg.ss2Count)||0)>0&&<Row l="Accent Melee II" v={`${cfg.ss2Count} × ${cfg.ss2Ct}ct ${cfg.ss2Type}`}/>}
        {comps.length>0&&<Row l="Additional Layout" v={comps.map(c=>c.name).join(", ")}/>}
        {cfg.quoteName&&<Row l="Design Concept" v={cfg.quoteName}/>}
        {cfg.notes&&<Row l="Artisanal Notes" v={cfg.notes} it/>}
      </div>

      {/* Pricing Frame */}
      <div style={{marginTop:40}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px",border:`0.5px solid rgba(197,179,88,0.3)`,background:C.iv2,marginBottom:15}}>
          <div>
            <div style={{fontFamily:C.eng,fontSize:9,color:C.chl,letterSpacing:"2px",textTransform:"uppercase",marginBottom:4}}>Total Value Estimate</div>
            <div style={{fontFamily:C.eng,fontSize:10,color:C.chx}}>Includes Premium Fabrication & 18% VAT</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:C.eng,fontSize:10,color:C.chl,fontWeight:600,marginBottom:2}}>USD</div>
            <div style={{fontFamily:C.serif,fontSize:32,fontWeight:300,color:C.ch,lineHeight:1}}>{res?usd(res.ri):"—"}</div>
          </div>
        </div>

        <div style={{fontFamily:C.eng,fontSize:8.5,color:C.chl,lineHeight:1.8,marginBottom:30,maxWidth:560}}>
          This valuation is a custom commercial calculation based on precious metal market indices and gemological criteria. Prices reflect initial engineering specs.
        </div>
        
        <GR soft/>

        {/* Footer Signature Elements */}
        <div style={{marginTop:25,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div>
            <div style={{borderBottom:`0.5px solid ${C.chm}`,marginBottom:6,width:140,opacity:0.3}}/>
            <div style={{fontFamily:C.serif,fontSize:12,fontStyle:"italic",color:C.ch}}>Leshem Simon</div>
            <div style={{fontFamily:C.eng,fontSize:8.5,color:C.chl,letterSpacing:"1px",textTransform:"uppercase",opacity:0.7}}>Founder & Expert Jeweler</div>
          </div>
          <div style={{textAlign:"right",fontFamily:C.eng,fontSize:8.5,color:C.chl,opacity:0.6,lineHeight:1.6}}>
            LESHEM.S Studio | Tuval St 23, Ramat Gan<br/>VAT Registration ID: 046240016
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ STONE CERTIFICATE (English Luxury Template) ═══════════ */
function StoneCert({data}){
  const [imgs,setImgs]=useState([null,null,null]);
  const setImg=(i,v)=>setImgs(p=>{const n=[...p];n[i]=v;return n;});
  const isDia=data.type==="Diamond";
  const filledImgs=imgs.filter(Boolean).length;
  const insight=gemInsight(data);

  const DR=({l,v,accent})=>{
    if(v===null||v===undefined||v==="") return null;
    return(
      <div style={{display:"flex",borderBottom:`0.5px solid rgba(197,179,88,0.15)`,padding:"11px 0",alignItems:"baseline"}}>
        <div style={{fontFamily:C.eng,fontSize:9,fontWeight:600,color:C.chl,letterSpacing:"0.05em",textTransform:"uppercase",width:"42%",flexShrink:0}}>{l}</div>
        <div style={{fontFamily:accent?C.serif:C.eng,fontSize:accent?15:12,fontWeight:accent?300:400,color:accent?C.ch:C.chm}}>{v}</div>
      </div>
    );
  };

  return(
    <div dir="ltr" id="stone-cert-root" style={{fontFamily:C.eng,background:C.iv,maxWidth:720,margin:"0 auto",boxSizing:"border-box",minHeight:960,display:"flex",flexDirection:"column",justifyContent:"space-between",border:`1px solid rgba(197,179,88,0.25)`}}>
      <div>
        {/* Luxury Banner */}
        <div style={{background:C.ch,padding:"22px 35px 20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                <div style={{width:18,height:18,border:`1px solid ${C.gd}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:C.serif,fontSize:9,color:C.gd}}>L</span></div>
                <span style={{fontFamily:C.serif,fontSize:16,fontWeight:300,color:"#E8E4DC",letterSpacing:5}}>LESHEM.S</span>
              </div>
              <div style={{fontFamily:C.eng,fontSize:8,color:C.gd,letterSpacing:"3px",textTransform:"uppercase"}}>Gemological Report</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:C.eng,fontSize:8,color:"rgba(197,179,88,0.6)",letterSpacing:"1px",textTransform:"uppercase",marginBottom:2}}>Report Code</div>
              <div style={{fontFamily:C.eng,fontSize:12,fontWeight:500,color:C.gd}}>{data.rptNum}</div>
            </div>
          </div>
        </div>

        <div style={{background:C.iv2,padding:"10px 35px",borderBottom:`0.5px solid rgba(197,179,88,0.2)`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontFamily:C.eng,fontSize:9,color:C.ch,letterSpacing:"1.5px",textTransform:"uppercase"}}>Laboratory Assessment Analysis</div>
          <div style={{fontFamily:C.eng,fontSize:10,fontWeight:600,color:C.gdm}}>{(data.type||"").toUpperCase()}</div>
        </div>

        {/* Main Content Split */}
        <div style={{display:"flex",padding:"30px 35px"}}>
          {/* Photos Frame */}
          <div style={{width:"40%",paddingRight:25,borderRight:`0.5px solid rgba(197,179,88,0.2)`,display:"flex",flexDirection:"column",gap:12}}>
            {filledImgs===0?(
              <>
                <ImgDrop img={imgs[0]} onImg={v=>setImg(0,v)} h={150} label="Primary Micro-Photo"/>
                <div style={{display:"flex",gap:8}}>
                  <div style={{flex:1}}><ImgDrop img={imgs[1]} onImg={v=>setImg(1,v)} h={75} label="Ref" small/></div>
                  <div style={{flex:1}}><ImgDrop img={imgs[2]} onImg={v=>setImg(2,v)} h={75} label="Plot" small/></div>
                </div>
              </>
            ):filledImgs===1?(
              <ImgDrop img={imgs[0]} onImg={v=>setImg(0,v)} h={240} label="Primary Photo"/>
            ):(<></>)}
            <div style={{padding:"10px 12px",background:C.iv2,border:`0.5px solid ${C.bl}`,marginTop:10}}>
              <div style={{fontFamily:C.eng,fontSize:7.5,color:C.chl,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>Internal SKU</div>
              <div style={{fontFamily:C.eng,fontSize:11,fontWeight:500,color:C.ch}}>{data.sku}</div>
            </div>
          </div>

          {/* Metrics Data Grid */}
          <div style={{flex:1,paddingLeft:30}}>
            <div style={{fontFamily:C.eng,fontSize:9,color:C.gdm,letterSpacing:"2px",textTransform:"uppercase",marginBottom:14,borderBottom:`0.5px solid rgba(197,179,88,0.2)`,paddingBottom:6,fontWeight:600}}>Gemstone Dimensions</div>
            <DR l="Variety" v={data.variety||data.type}/>
            <DR l="Mineral Species" v={data.species||(SPECIES[data.type]||"Natural Mineral")}/>
            <DR l="Carat Weight" v={data.ct?`${data.ct} ct`:null} accent/>
            <DR l="Shape Cut" v={data.shape} accent/>
            <DR l="Color Grade" v={data.color} accent/>
            <DR l="Clarity Grade" v={data.cla} accent/>
            <DR l="Measurements" v={data.measurements}/>
            <DR l="Treatments" v={data.treatment||"None Detected"}/>
          </div>
        </div>

        {/* Narrative Review */}
        {insight&&<>
          <div style={{height:"0.5px",background:`linear-gradient(90deg,transparent,rgba(197,179,88,0.3),transparent)`,margin:"0 35px"}}/>
          <div style={{padding:"20px 35px"}}>
            <div style={{fontFamily:C.eng,fontSize:8.5,color:C.chl,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:6,fontWeight:600}}>Gemological Statement</div>
            <div style={{fontFamily:C.serif,fontSize:12,fontStyle:"italic",color:C.chm,lineHeight:1.8}}>{insight}</div>
          </div>
        </>}
      </div>

      {/* Footer System */}
      <div>
        <div style={{height:"0.5px",background:`linear-gradient(90deg,transparent,rgba(197,179,88,0.3),transparent)`,margin:"0 35px"}}/>
        <div style={{padding:"25px 35px 35px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <div>
              <div style={{borderBottom:`0.5px solid ${C.chm}`,marginBottom:6,width:120,opacity:0.3}}/>
              <div style={{fontFamily:C.serif,fontSize:11,fontStyle:"italic",color:C.ch}}>Leshem Simon</div>
              <div style={{fontFamily:C.eng,fontSize:8,color:C.chl,letterSpacing:"1px",textTransform:"uppercase"}}>Certified Diamond Grader</div>
            </div>
            <div style={{textAlign:"right",fontFamily:C.eng,fontSize:8,color:C.chl,opacity:0.5,lineHeight:1.6}}>
              LESHEM.S Fine Jewelry Audit | Ramat Gan Center<br/>Verification Security ID: {data.rptNum}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuoteCertModal({cfg,res,pieceImg,onClose}){
  useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[onClose]);
  return(
    <div className="modal-backdrop" style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(20,30,36,0.94)",display:"flex",flexDirection:"column",alignItems:"center",overflowY:"auto",padding:"30px 16px"}}>
      <div className="no-print" style={{width:"100%",maxWidth:720,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <span style={{fontFamily:C.heb,fontSize:13,color:"rgba(225,215,195,0.5)"}}>תצוגת הצעת מחיר סופית ללקוח</span>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>window.print()} style={{display:"flex",alignItems:"center",gap:8,fontFamily:C.heb,fontSize:14,color:C.ch,background:C.gd,border:"none",padding:"10px 20px",cursor:"pointer",borderRadius:4,fontWeight:600}}><Printer size={15}/> הדפס תעודה</button>
          <button onClick={onClose} style={{display:"flex",alignItems:"center",gap:8,fontFamily:C.heb,fontSize:14,color:"#fff",background:"transparent",border:"1px solid rgba(255,255,255,0.15)",padding:"10px 16px",cursor:"pointer",borderRadius:4}}><X size={15}/> סגור</button>
        </div>
      </div>
      <div className="printable-container" style={{boxShadow:"0 32px 64px rgba(0,0,0,0.5)",width:"100%",maxWidth:720}}><QuoteCert cfg={cfg} res={res} pieceImg={pieceImg}/></div>
    </div>
  );
}

function StoneCertModal({stone,onClose}){
  useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[onClose]);
  const data=useMemo(()=>{
    const d=new Date();
    return {sku:stone.sku,type:stone.type,shape:stone.shape,ct:stone.ct,color:stone.color,cla:stone.cla,
      variety:stone.type,species:SPECIES[stone.type]||"",measurements:stone.measurements||"—",treatment:stone.treatment||"None Detected",
      rptNum:`LC-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}-${stone.sku}`};
  },[stone]);
  return(
    <div className="modal-backdrop" style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(20,30,36,0.94)",display:"flex",flexDirection:"column",alignItems:"center",overflowY:"auto",padding:"30px 16px"}}>
      <div className="no-print" style={{width:"100%",maxWidth:720,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <span style={{fontFamily:C.heb,fontSize:13,color:"rgba(225,215,195,0.5)"}}>תצוגת תעודת אבן גמולוגית</span>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>window.print()} style={{display:"flex",alignItems:"center",gap:8,fontFamily:C.heb,fontSize:14,color:C.ch,background:C.gd,border:"none",padding:"10px 20px",cursor:"pointer",borderRadius:4,fontWeight:600}}><Printer size={15}/> הדפס תעודה</button>
          <button onClick={onClose} style={{display:"flex",alignItems:"center",gap:8,fontFamily:C.heb,fontSize:14,color:"#fff",background:"transparent",border:"1px solid rgba(255,255,255,0.15)",padding:"10px 16px",cursor:"pointer",borderRadius:4}}><X size={15}/> סגור</button>
        </div>
      </div>
      <div className="printable-container" style={{boxShadow:"0 32px 64px rgba(0,0,0,0.5)",width:"100%",maxWidth:720}}><StoneCert data={data}/></div>
    </div>
  );
}

/* ═══════════ DATA ENTRY HUB (Perfect Matrix Correlation) ═══════════ */
function DataEntryHub({onAddStone,onAddComponent,onAddClientItem}){
  const [sub,setSub]=useState("stone");
  const [saved,setSaved]=useState(null);
  const toast=(t)=>{setSaved(t);setTimeout(()=>setSaved(null),2500);};

  /* Stones Matrix Entity fields matching precisely with Airtable specifications */
  const [sF,setSF]=useState({sku:"",type:"Diamond",shape:"Round",ct:"",color:"",cla:"",cost:"",supplier:"",purchaseDate:"",measurements:"",treatment:"",img:null});
  const sfA=(f,v)=>setSF(p=>({...p,[f]:v}));
  function saveStone(){
    if(!sF.sku||!sF.ct){return;}
    onAddStone({id:"u"+uid(),sku:sF.sku,nH:`${sF.type} ${sF.ct}ct ${sF.shape}`,nE:`${sF.shape} ${sF.type} ${sF.ct}ct`,
      type:sF.type,tH:sF.type,shape:sF.shape,sH:sF.shape,ct:parseFloat(sF.ct)||0,
      color:sF.color,cla:sF.cla,cost:parseFloat(sF.cost)||0,supplier:sF.supplier,purchaseDate:sF.purchaseDate,measurements:sF.measurements,treatment:sF.treatment,img:sF.img});
    setSF({sku:"",type:"Diamond",shape:"Round",ct:"",color:"",cla:"",cost:"",supplier:"",purchaseDate:"",measurements:"",treatment:"",img:null});
    toast("stone");
  }

  /* Components Matrix Entity fields */
  const [cF,setCF]=useState({name:"",material:"18K Yellow",type:"Chain",cost:"",supplier:"",stockQty:"",img:null});
  const sfB=(f,v)=>setCF(p=>({...p,[f]:v}));
  function saveComp(){
    if(!cF.name){return;}
    onAddComponent({id:"c"+uid(),...cF,cost:parseFloat(cF.cost)||0,stockQty:parseInt(cF.stockQty)||0});
    setCF({name:"",material:"18K Yellow",type:"Chain",cost:"",supplier:"",stockQty:"",img:null});
    toast("comp");
  }

  /* Client Intake Entity fields */
  const [iF,setIF]=useState({client:"",desc:"",value:"",img:null});
  const sfC=(f,v)=>setIF(p=>({...p,[f]:v}));
  function saveIntake(){
    if(!iF.client){return;}
    onAddClientItem({id:"i"+uid(),...iF,value:parseFloat(iF.value)||0});
    setIF({client:"",desc:"",value:"",img:null});
    toast("intake");
  }

  return(
    <div style={{height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"16px 26px 0",background:C.iv,borderBottom:`0.5px solid ${C.bl}`}}>
        <div style={{display:"flex",gap:0}}>
          <button onClick={()=>setSub("stone")} style={{display:"flex",alignItems:"center",gap:8,fontFamily:C.heb,fontSize:14,padding:"12px 20px",cursor:"pointer",color:sub==="stone"?C.ch:C.chl,background:sub==="stone"?C.iv:C.iv2,border:`0.5px solid ${sub==="stone"?C.blm:C.bl}`,borderBottom:sub==="stone"?"none":`0.5px solid ${C.bl}`}}><Gem size={15}/>אבנים חרשות</button>
          <button onClick={()=>setSub("comp")} style={{display:"flex",alignItems:"center",gap:8,fontFamily:C.heb,fontSize:14,padding:"12px 20px",cursor:"pointer",color:sub==="comp"?C.ch:C.chl,background:sub==="comp"?C.iv:C.iv2,border:`0.5px solid ${sub==="comp"?C.blm:C.bl}`,borderBottom:sub==="comp"?"none":`0.5px solid ${C.bl}`}}><Package size={15}/>חלקי תכשיטים ורכיבים</button>
          <button onClick={()=>setSub("intake")} style={{display:"flex",alignItems:"center",gap:8,fontFamily:C.heb,fontSize:14,padding:"12px 20px",cursor:"pointer",color:sub==="intake"?C.ch:C.chl,background:sub==="intake"?C.iv:C.iv2,border:`0.5px solid ${sub==="intake"?C.blm:C.bl}`,borderBottom:sub==="intake"?"none":`0.5px solid ${C.bl}`}}><ClipboardList size={15}/>קליטת פריטי לקוח</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"24px 26px 40px"}}>
        {saved&&(
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 18px",border:`1px solid rgba(90,160,100,0.4)`,background:"rgba(90,160,100,0.08)",marginBottom:20,borderRadius:4}}>
            <Check size={16} color="#4a8e56"/><span style={{fontFamily:C.heb,fontSize:14,color:"#4a8e56"}}>{saved==="stone"?"אבן נוספה בהצלחה לשדות המטריצה למלאי":saved==="comp"?"רכיב נשמר במערכת המלאי":"פריט לקוח נקלט בהצלחה במערכת"}</span>
          </div>
        )}

        {sub==="stone"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16,maxWidth:650}}>
            <div style={{fontFamily:C.heb,fontSize:16,fontWeight:600,color:C.ch}}>הזנת אבני חן ויהלומים (טבלת Stones)</div>
            <div style={{display:"flex",gap:14}} className="mobile-col">
              <Inp label="מק״ט אבן (SKU) *" half placeholder="DIA-RND-101" value={sF.sku} onChange={e=>sfA("sku",e.target.value)}/>
              <Sel label="קטגוריית אבן *" half opts={STYPES} value={sF.type} onChange={e=>sfA("type",e.target.value)}/>
            </div>
            <div style={{display:"flex",gap:14}} className="mobile-col">
              <Inp label="צורת אבן (Shape)" half placeholder="Round, Oval, Cushion..." value={sF.shape} onChange={e=>sfA("shape",e.target.value)}/>
              <Inp label="משקל קרט (Carat Weight) *" half type="number" min="0.01" step="0.01" placeholder="0.00" value={sF.ct} onChange={e=>sfA("ct",e.target.value)}/>
            </div>
            <div style={{display:"flex",gap:14}} className="mobile-col">
              <Inp label="דירוג צבע (Color)" half placeholder="D, F, G, Royal Blue..." value={sF.color} onChange={e=>sfA("color",e.target.value)}/>
              <Inp label="דירוג ניקיון (Clarity)" half placeholder="VVS1, VS2, SI1..." value={sF.cla} onChange={e=>sfA("cla",e.target.value)}/>
            </div>
            <div style={{display:"flex",gap:14}} className="mobile-col">
              <Inp label="מידות מ״מ (Measurements)" half placeholder="8.1 x 8.1 x 5.0" value={sF.measurements} onChange={e=>sfA("measurements",e.target.value)}/>
              <Inp label="טיפולים (Treatments)" half placeholder="None, Heated..." value={sF.treatment} onChange={e=>sfA("treatment",e.target.value)}/>
            </div>
            <Divider/>
            <div style={{display:"flex",gap:14}} className="mobile-col">
              <Inp label="שם ספק / מקור" half placeholder="שם ספק" value={sF.supplier} onChange={e=>sfA("supplier",e.target.value)}/>
              <Inp label="תאריך רכישה" half type="date" value={sF.purchaseDate} onChange={e=>sfA("purchaseDate",e.target.value)}/>
            </div>
            <Inp label="עלות רכישה נטו בדולר ($) *" type="number" placeholder="0.00" value={sF.cost} onChange={e=>sfA("cost",e.target.value)}/>
            <ImgDrop img={sF.img} onImg={v=>sfA("img",v)} h={120} label="העלה צילום/פקס גמולוגי לאבן"/>
            <button onClick={saveStone} style={{fontFamily:C.heb,fontSize:14,fontWeight:600,color:C.ch,background:"rgba(197,179,88,0.15)",border:`0.5px solid rgba(197,179,88,0.5)`,padding:"14px",cursor:"pointer",borderRadius:4}}>שמור אבן חדשה במערכת</button>
          </div>
        )}

        {sub==="comp"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16,maxWidth:650}}>
            <div style={{fontFamily:C.heb,fontSize:16,fontWeight:600,color:C.ch}}>הזנת רכיבים ושרשראות (טבלת Components)</div>
            <Inp label="שם רכיב / פריט מלאי *" placeholder="שרשרת אנקר 45 ס״מ, סוגר קפיצי..." value={cF.name} onChange={e=>sfB("name",e.target.value)}/>
            <div style={{display:"flex",gap:14}} className="mobile-col">
              <Sel label="מתכת המשויכת לחלק" half opts={METALS} value={cF.material} onChange={e=>sfB("material",e.target.value)}/>
              <Sel label="סוג רכיב" half opts={["Chain","נעילה","Setting","Finding","Other"]} value={cF.type} onChange={e=>sfB("type",e.target.value)}/>
            </div>
            <Divider/>
            <div style={{display:"flex",gap:14}} className="mobile-col">
              <Inp label="שם ספק" half placeholder="ספק רכיבים" value={cF.supplier} onChange={e=>sfB("supplier",e.target.value)}/>
              <Inp label="כמות ראשונית במלאי" half type="number" placeholder="0" value={cF.stockQty} onChange={e=>sfB("stockQty",e.target.value)}/>
            </div>
            <Inp label="מחיר עלות פריט קבוע ($) *" type="number" placeholder="0.00" value={cF.cost} onChange={e=>sfB("cost",e.target.value)}/>
            <ImgDrop img={cF.img} onImg={v=>sfB("img",v)} h={120}/>
            <button onClick={saveComp} style={{fontFamily:C.heb,fontSize:14,fontWeight:600,color:C.ch,background:"rgba(197,179,88,0.15)",border:`0.5px solid rgba(197,179,88,0.5)`,padding:"14px",cursor:"pointer",borderRadius:4}}>שמור רכיב במאגר המערכת</button>
          </div>
        )}

        {sub==="intake"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16,maxWidth:650}}>
            <div style={{fontFamily:C.heb,fontSize:16,fontWeight:600,color:C.ch}}>קליטת תכשיטי לקוח לסטודיו (Intake Log)</div>
            <Inp label="שם הלקוח המלא *" placeholder="ישראל ישראלי" value={iF.client} onChange={e=>sfC("client",e.target.value)}/>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <EB>תיאור מצב הפריט ומפרט מוערך</EB>
              <textarea style={{fontFamily:C.heb,fontSize:14,color:C.ch,background:C.iv2,border:`0.5px solid ${C.blm}`,padding:"12px",outline:"none",resize:"vertical",lineHeight:1.6,minHeight:90,borderRadius:4}} placeholder="טבעת זהב צהוב, משובצת אבן מרכזית, לבדיקת שיבוץ מחדש..." rows={4} value={iF.desc} onChange={e=>sfC("desc",e.target.value)}/>
            </div>
            <Inp label="שווי פריט מוערך לביטוח הסטודיו ($)" type="number" placeholder="0.00" value={iF.value} onChange={e=>sfC("value",e.target.value)}/>
            <ImgDrop img={iF.img} onImg={v=>sfC("img",v)} h={120} label="צילום מאקרו של פריט הלקוח בעת הקבלה"/>
            <button onClick={saveIntake} style={{fontFamily:C.heb,fontSize:14,fontWeight:600,color:C.ch,background:"rgba(197,179,88,0.15)",border:`0.5px solid rgba(197,179,88,0.5)`,padding:"14px",cursor:"pointer",borderRadius:4}}>בצע קליטת פריט לסטודיו</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════ MANUAL CERTIFICATE GENERATOR ═══════════ */
function ManualCertTab(){
  const [mode,setMode]=useState("quote");
  const [modal,setModal]=useState(false);
  const [qd,setQD]=useState({clientName:"",quoteName:"",metal:"18K Yellow",grams:"",centerCt:"",centerType:"Diamond",centerColor:"",centerClarity:"",centerSetting:"Prong / Claw",ss1Count:"0",ss2Count:"0",ss1Type:"Diamond",ss1Ct:"0.05",ss2Type:"Diamond",ss2Ct:"0.05",ss1Manual:"",ss2Manual:"",centerManual:"",stoneMode:"virtual",stone:null,notes:"",mcOv:"",lcOv:"",prodOv:"",wsOv:"",rxOv:"",riOv:"",ss1Setting:"Pavé",ss2Setting:"Pavé",ss1Mode:"virtual",ss1Stone:null,ss2Mode:"virtual",ss2Stone:null,selectedComponents:[]});
  const [sd,setSD]=useState({sku:"",variety:"",species:"",color:"",shape:"",ct:"",measurements:"",treatment:""});
  const sfQ=(f,v)=>setQD(p=>({...p,[f]:v}));
  const sfS=(f,v)=>setSD(p=>({...p,[f]:v}));
  const qRes=useMemo(()=>calc(qd),[qd]);
  const stoneData=useMemo(()=>({...sd,type:sd.variety||"Other",rptNum:`LC-MANUAL-${uid()}`}),[sd]);
  return(
    <div style={{height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"16px 26px 14px",borderBottom:`0.5px solid ${C.bl}`,background:C.iv}}>
        <div style={{fontFamily:C.heb,fontSize:18,fontWeight:600,color:C.ch,marginBottom:14}}>הפקת תעודה ידנית מהירה</div>
        <div style={{display:"flex",border:`1px solid ${C.blm}`,width:340,maxWidth:"100%"}}>
          {[["quote","הצעת מחיר מהירה"],["stone","תעודת אבן עצמאית"]].map(([m,l])=>(
            <button key={m} onClick={()=>setMode(m)} style={{flex:1,fontFamily:C.heb,fontSize:14,cursor:"pointer",color:mode===m?C.iv:C.chl,background:mode===m?C.ch:"transparent",border:"none",padding:"10px 0"}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"24px 26px 40px"}}>
        {mode==="quote"&&(
          <div style={{display:"flex",flexDirection:"column",gap:14,maxWidth:600}}>
            <Inp label="שם לקוח תצוגה" type="text" placeholder="Client Name" value={qd.clientName} onChange={e=>sfQ("clientName",e.target.value)}/>
            <Inp label="תיאור העבודה והתכשיט" type="text" placeholder="Engagement Ring Design Concept..." value={qd.quoteName} onChange={e=>sfQ("quoteName",e.target.value)}/>
            <div style={{display:"flex",gap:14}} className="mobile-col">
              <Sel label="סגסוגת מתכת" half opts={METALS} value={qd.metal} onChange={e=>sfQ("metal",e.target.value)}/>
              <Inp label="משקל מחושב (g)" half type="number" min="0.1" placeholder="0.0g" value={qd.grams} onChange={e=>sfQ("grams",e.target.value)}/>
            </div>
            <div style={{display:"flex",gap:14}} className="mobile-col">
              <Sel label="אבן מרכזית" half opts={STYPES} value={qd.centerType} onChange={e=>sfQ("centerType",e.target.value)}/>
              <Inp label="משקל קרט אבן מרכזית" half type="number" step="0.01" placeholder="1.00ct" value={qd.centerCt} onChange={e=>sfQ("centerCt",e.target.value)}/>
            </div>
            {qd.centerType==="Diamond"&&<div style={{display:"flex",gap:14}} className="mobile-col">
              <Inp label="צבע אבן" half placeholder="G" value={qd.centerColor} onChange={e=>sfQ("centerColor",e.target.value)}/>
              <Sel label="ניקיון אבן" half opts={Object.keys(KFACT)} value={qd.centerClarity} onChange={e=>sfQ("centerClarity",e.target.value)}/>
            </div>}
            <Inp label="עקיפת מחיר ידני סופי ($)" type="number" placeholder="השאר ריק לחישוב נוסחה אוטומטי" value={qd.riOv} onChange={e=>sfQ("riOv",e.target.value)}/>
            {qRes&&<div style={{fontFamily:C.heb,fontSize:14,color:C.ch,padding:"12px 16px",border:`1px solid rgba(197,179,88,0.4)`,background:C.gds,display:"flex",justifyContent:"space-between",borderRadius:4}}>
              <span>ערך משוער לתצוגה:</span><strong style={{color:C.gdm,fontFamily:C.serif,fontSize:16}}>{usd(qRes.ri)}</strong>
            </div>}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <EB>הערות גמולוגיות / מיוחדות לתעודה</EB>
              <textarea style={{fontFamily:C.heb,fontSize:14,color:C.ch,background:C.iv2,border:`0.5px solid ${C.blm}`,padding:"10px 12px",outline:"none",resize:"vertical",lineHeight:1.6,minHeight:70,borderRadius:4}} rows={4} value={qd.notes} onChange={e=>sfQ("notes",e.target.value)}/>
            </div>
            <button onClick={()=>setModal(true)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontFamily:C.heb,fontSize:14,fontWeight:600,color:C.ch,background:"rgba(197,179,88,0.15)",border:`1px solid rgba(197,179,88,0.5)`,padding:"14px",cursor:"pointer",borderRadius:4,marginTop:10}}><Eye size={18}/> תצוגה מקדימה ובדיקת שטח מת</button>
          </div>
        )}
        {mode==="stone"&&(
          <div style={{display:"flex",flexDirection:"column",gap:14,maxWidth:600}}>
            <Inp label="קוד אבן / תעודה (SKU)" type="text" placeholder="MANUAL-LAB-01" value={sd.sku} onChange={e=>sfS("sku",e.target.value)}/>
            <div style={{display:"flex",gap:14}} className="mobile-col">
              <Inp label="סוג אבן (Variety)" half placeholder="Natural Diamond" value={sd.variety} onChange={e=>sfS("variety",e.target.value)}/>
              <Inp label="משפחה מינרלית (Species)" half placeholder="Natural Chrysoberyl" value={sd.species} onChange={e=>sfS("species",e.target.value)}/>
            </div>
            <div style={{display:"flex",gap:14}} className="mobile-col">
              <Inp label="צבע לתצוגה (Color)" half placeholder="Faint Pink, Royal Blue" value={sd.color} onChange={e=>sfS("color",e.target.value)}/>
              <Inp label="חיתוך וצורה (Shape)" half placeholder="Cushion Modified" value={sd.shape} onChange={e=>sfS("shape",e.target.value)}/>
            </div>
            <div style={{display:"flex",gap:14}} className="mobile-col">
              <Inp label="משקל קרט מוחלט" half type="number" step="0.01" value={sd.ct} onChange={e=>sfS("ct",e.target.value)}/>
              <Inp label="מידות מדויקות (Measurements)" half placeholder="6.2 x 6.2 x 4.1 mm" value={sd.measurements} onChange={e=>sfS("measurements",e.target.value)}/>
            </div>
            <Inp label="הערות טיפול" type="text" placeholder="No Indications of Heating" value={sd.treatment} onChange={e=>sfS("treatment",e.target.value)}/>
            <button onClick={()=>setModal(true)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontFamily:C.heb,fontSize:14,fontWeight:600,color:C.ch,background:"rgba(197,179,88,0.15)",border:`1px solid rgba(197,179,88,0.5)`,padding:"14px",cursor:"pointer",borderRadius:4,marginTop:10}}><Eye size={18}/> הפק תעודת אבן חכמה</button>
          </div>
        )}
      </div>
      {modal&&mode==="quote"&&<QuoteCertModal cfg={qd} res={qRes} pieceImg={null} onClose={()=>setModal(false)}/>}
      {modal&&mode==="stone"&&<StoneCertModal stone={{...sd,type:sd.variety||"Other"}} onClose={()=>setModal(false)}/>}
    </div>
  );
}

/* ═══════════ STONE CARD ═══════════ */
function StoneCard({stone,score,picked,onPick,onCert,onDragStart,grid}){
  const [hov,setHov]=useState(false);
  const b=score>=30?sBadge(score):null;
  const CBtn=({sm})=>(
    <button onClick={e=>{e.stopPropagation();onCert(stone);}}
      style={{display:"flex",alignItems:"center",gap:6,fontFamily:C.heb,fontSize:13,cursor:"pointer",color:C.chl,background:"transparent",border:`0.5px solid ${C.bl}`,padding:"6px 12px",whiteSpace:"nowrap",borderRadius:4}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blm;e.currentTarget.style.color=C.ch;}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.bl;e.currentTarget.style.color=C.chl;}}><FileCheck size={14}/> תעודה גמולוגית</button>
  );
  if(grid) return(
    <div draggable onDragStart={e=>onDragStart(stone,e)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{border:`1px solid ${picked?"rgba(197,179,88,0.8)":hov?C.blm:C.bl}`,background:picked?C.gds:C.iv,cursor:"grab",display:"flex",flexDirection:"column",transition:"border-color 0.12s",borderRadius:4}}>
      <div style={{height:110,background:C.iv2,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",borderBottom:`0.5px solid ${C.bl}`,overflow:"hidden"}}>
        {stone.img?<img src={stone.img} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{width:32,height:32,border:`0.5px solid ${C.blm}`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}><Gem size={14} color={C.chx} strokeWidth={1.2}/></div>
            <span style={{fontFamily:C.eng,fontSize:9,color:C.chx,letterSpacing:"1px",textTransform:"uppercase"}}>{stone.type}</span>
          </div>
        </>}
        {score>0&&b&&<span style={{position:"absolute",top:6,right:6,fontFamily:C.heb,fontSize:10,padding:"2px 6px",background:b.bg,color:b.c,borderRadius:2}}>{b.l}</span>}
        <div style={{position:"absolute",top:6,left:6,color:hov?C.chx:C.iv3}}><GripVertical size={14}/></div>
      </div>
      <div style={{padding:12,flex:1,display:"flex",flexDirection:"column",gap:6}}>
        {score>0&&<div style={{height:3,background:C.iv3,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:score+"%",background:score>=80?C.gd:score>=60?"#6aad76":C.chx}}/></div>}
        <div style={{fontFamily:C.heb,fontSize:14,fontWeight:600,color:C.ch,lineHeight:1.3}}>{stone.nH}</div>
        <div style={{fontFamily:C.eng,fontSize:11,color:C.chl}}>{stone.sku} · {stone.ct}ct</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"auto",paddingTop:8,gap:6,flexWrap:"wrap"}}>
          <CBtn sm/>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <span style={{fontFamily:C.serif,fontSize:14,color:C.gdm,fontWeight:600}}>{usd(stone.cost)}</span>
            <button onClick={()=>onPick(stone)} style={{display:"flex",alignItems:"center",gap:4,fontFamily:C.heb,fontSize:12,fontWeight:600,cursor:"pointer",color:picked?C.chl:C.ch,background:"transparent",border:`1px solid ${picked?C.blm:"rgba(197,179,88,0.5)"}`,padding:"5px 10px",borderRadius:4}}>
              {picked?<><Minus size={12}/>נבחרה</>:<><Plus size={12}/>שבץ אבן</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  return(
    <div draggable onDragStart={e=>onDragStart(stone,e)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{border:`1px solid ${picked?"rgba(197,179,88,0.8)":hov?C.blm:C.bl}`,padding:"14px 16px 14px 22px",marginBottom:10,background:picked?C.gds:C.iv,cursor:"grab",position:"relative",transition:"border-color 0.12s",borderRadius:4}}>
      <div style={{position:"absolute",top:"50%",left:6,transform:"translateY(-50%)",color:hov?C.chx:C.iv3}}><GripVertical size={16}/></div>
      <div style={{display:"flex",gap:14,alignItems:"center"}}>
        <div style={{width:50,height:50,minWidth:50,background:C.iv2,border:`0.5px solid ${C.bl}`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:4}}>
          {stone.img?<img src={stone.img} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<Gem size={20} color={C.chx} strokeWidth={1.2}/>}
        </div>
        <div style={{flex:1}}>
          {score>0&&<div style={{height:3,background:C.iv3,borderRadius:3,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:score+"%",background:score>=80?C.gd:score>=60?"#6aad76":C.chx}}/></div>}
          {score>0&&b&&<span style={{fontFamily:C.heb,fontSize:11,padding:"2px 6px",background:b.bg,color:b.c,display:"inline-block",marginBottom:4,borderRadius:2}}>{b.l}</span>}
          <div style={{fontFamily:C.heb,fontSize:14,fontWeight:600,color:C.ch,marginBottom:3}}>{stone.nH}</div>
          <div style={{fontFamily:C.eng,fontSize:11,color:C.chl}}>{stone.sku} · {stone.ct}ct · {stone.sH} · {stone.tH==="יהלום"?`${stone.color} / ${stone.cla}`:stone.color}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
          <div style={{fontFamily:C.serif,fontSize:15,color:C.gdm,whiteSpace:"nowrap",fontWeight:600}}>{usd(stone.cost)}</div>
          <div style={{display:"flex",gap:8}}>
            <CBtn/>
            <button onClick={()=>onPick(stone)} style={{display:"flex",alignItems:"center",gap:4,fontFamily:C.heb,fontSize:12,fontWeight:600,cursor:"pointer",color:picked?C.chl:C.ch,background:"transparent",border:`1px solid ${picked?C.blm:"rgba(197,179,88,0.5)"}`,padding:"6px 14px",borderRadius:4}}>
              {picked?<><Minus size={12}/>בחרת</>:<><Plus size={12}/>בחר אבן</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ INVENTORY BROWSER ═══════════ */
function InventoryBrowser({stones,quoteStone,onPickStone,pickedId}){
  const [q,setQ]=useState(""); const [tf,setTF]=useState("הכול"); const [showM,setSM]=useState(false);
  const [visible,setV]=useState(12); const [vm,setVM]=useState("list");
  const [certStone,setCertStone].useState(null);
  const sentinel=useRef();
  const TFS=[["הכול","הכול"],["Diamond","יהלום"],["Sapphire","ספיר"],["Ruby","רובי"],["Emerald","אמרלד"]];
  const scored=useMemo(()=>stones.map(s=>({...s,score:matchScore(quoteStone,s)})),[stones,quoteStone]);
  const filtered=useMemo(()=>{
    let r=scored;
    if(tf!=="הכול") r=r.filter(s=>s.type===tf);
    if(q.length>=2) r=r.filter(s=>s.nH.includes(q)||s.nE.toLowerCase().includes(q.toLowerCase())||s.sku.toLowerCase().includes(q.toLowerCase()));
    if(showM&&quoteStone) r=r.filter(s=>s.score>=30);
    return r.sort((a,b)=>(b.score??0)-(a.score??0));
  },[scored,tf,q,showM,quoteStone]);
  useEffect(()=>{
    const obs=new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&visible<filtered.length)setTimeout(()=>setV(v=>Math.min(v+8,filtered.length)),300);},{threshold:0.5});
    if(sentinel.current) obs.observe(sentinel.current); return()=>obs.disconnect();
  },[visible,filtered.length]);
  useEffect(()=>setV(12),[q,tf,showM]);
  const topM=useMemo(()=>quoteStone?scored.filter(s=>s.score>=60).sort((a,b)=>b.score-a.score).slice(0,4):[],[scored,quoteStone]);
  function drag(s,e){e.dataTransfer.setData("stoneId",s.id);e.dataTransfer.effectAllowed="copy";}
  return(
    <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 26px 14px",borderBottom:`0.5px solid ${C.bl}`,background:C.iv}}>
        <div style={{display:"flex",gap:12,marginBottom:12}} className="mobile-col">
          <div style={{position:"relative",flex:1}}>
            <Search size={16} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:C.chl}}/>
            <input style={{fontFamily:C.heb,fontSize:14,color:C.ch,background:C.iv2,border:`0.5px solid ${C.blm}`,padding:"12px 40px 12px 14px",outline:"none",width:"100%",borderRadius:4}} placeholder="חיפוש אבנים לפי מפרט, ספק, צורה או SKU..." value={q} onChange={e=>setQ(e.target.value)}/>
          </div>
          <div style={{display:"flex",border:`1px solid ${C.blm}`,borderRadius:4,overflow:"hidden"}}>
            {[["list",<List size={18}/>],["grid",<LayoutGrid size={18}/>]].map(([m,icon])=>(
              <button key={m} onClick={()=>setVM(m)} style={{width:44,display:"flex",alignItems:"center",justifyContent:"center",background:vm===m?C.ch:"transparent",border:"none",cursor:"pointer",color:vm===m?C.iv:C.chl}}>{icon}</button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:quoteStone?10:0}}>
          {TFS.map(([v,l])=>(
            <button key={v} onClick={()=>setTF(v)} style={{fontFamily:C.heb,fontSize:12,cursor:"pointer",color:tf===v?C.iv:C.chm,background:tf===v?C.ch:"transparent",border:`0.5px solid ${tf===v?C.ch:C.blm}`,padding:"6px 14px",borderRadius:4}}>{l}</button>
          ))}
        </div>
        {quoteStone&&(
          <button onClick={()=>setSM(v=>!v)} style={{display:"flex",alignItems:"center",gap:6,fontFamily:C.heb,fontSize:12,fontWeight:600,cursor:"pointer",color:showM?C.ch:"rgba(197,179,88,0.9)",background:showM?"rgba(197,179,88,0.14)":"transparent",border:`1px solid ${showM?"rgba(197,179,88,0.48)":C.blm}`,padding:"8px 16px",marginTop:10,borderRadius:4}}>
            <Star size={14} fill={showM?C.gdm:"none"} color={showM?C.gdm:C.chm}/> סינון התאמות חכמות לפי: {quoteStone.nH}
          </button>
        )}
      </div>
      {quoteStone&&topM.length>0&&!showM&&(
        <div style={{padding:"12px 26px",background:"rgba(197,179,88,0.07)",borderBottom:`0.5px solid rgba(197,179,88,0.18)`}}>
          <EB s={{fontSize:11,marginBottom:6,color:C.gdm}}>חלוקות ואבנים תואמות להשלמת סט תואם</EB>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {topM.map(s=>(<div key={s.id} onClick={()=>onPickStone(s)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",border:`1px solid rgba(197,179,88,0.35)`,background:pickedId===s.id?C.gds:C.iv,cursor:"pointer",borderRadius:4}}>
              <span style={{fontFamily:C.heb,fontSize:12,fontWeight:600,color:C.ch}}>{s.nH}</span>
              <span style={{fontFamily:C.eng,fontSize:10,color:C.gdm,border:`0.5px solid rgba(197,179,88,0.35)`,padding:"2px 6px",borderRadius:2}}>{s.score}%</span>
            </div>))}
          </div>
        </div>
      )}
      <div style={{flex:1,overflowY:"auto",padding:"16px 26px"}}>
        <EB s={{marginBottom:10}}>{filtered.length} אבנים זמינות במטריצת המלאי</EB>
        {vm==="list"
          ?filtered.slice(0,visible).map(s=><StoneCard key={s.id} stone={s} score={quoteStone&&s.score>0?s.score:0} picked={pickedId===s.id} onPick={onPickStone} onCert={setCertStone} onDragStart={drag} grid={false}/>)
          :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",gap:14}}>{filtered.slice(0,visible).map(s=><StoneCard key={s.id} stone={s} score={quoteStone&&s.score>0?s.score:0} picked={pickedId===s.id} onPick={onPickStone} onCert={setCertStone} onDragStart={drag} grid={true}/>)}</div>
        }
        {visible<filtered.length&&<div ref={sentinel} style={{height:40,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:C.heb,fontSize:12,color:C.chx}}>טוען פריטים נוספים מהמלאי...</div>}
      </div>
      {certStone&&<StoneCertModal stone={certStone} onClose={()=>setCertStone(null)}/>}
    </div>
  );
}

/* ═══════════ QUOTE BUILDER ═══════════ */
const DCFG={
  metal:"18K Yellow",grams:"",cast:"CAD / Casting",cmplx:"Medium",
  stoneMode:"virtual",stone:null,
  centerType:"Diamond",centerCt:"1.00",centerColor:"G",centerClarity:"VS1",centerManual:"",centerSetting:"Prong / Claw",
  ss1Type:"Diamond",ss1Ct:"0.05",ss1Count:"0",ss1Manual:"",ss1Setting:"Pavé",ss1Mode:"virtual",ss1Stone:null,
  ss2Type:"Diamond",ss2Ct:"0.03",ss2Count:"0",ss2Manual:"",ss2Setting:"Pavé",ss2Mode:"virtual",ss2Stone:null,
  selectedComponents:[],
  mcOv:"",lcOv:"",prodOv:"",wsOv:"",rxOv:"",riOv:"",
  clientName:"",quoteName:"",notes:"",
};

function QuoteBuilder({stones,components,externalStone,onActiveStoneChange,onExport,resetKey}){
  const [cfg,setCfg]=useState({...DCFG});
  const [pieceImg,setPieceImg]=useState(null);
  const [mainDrop,setMD]=useState(false);
  const sf=useCallback((f,v)=>setCfg(p=>({...p,[f]:v})),[]);

  useEffect(()=>{if(externalStone)setCfg(p=>({...p,stoneMode:"real",stone:externalStone}));},[externalStone]);
  useEffect(()=>{setCfg({...DCFG});setPieceImg(null);},[resetKey]);
  const res=useMemo(()=>calc(cfg),[cfg]);
  useEffect(()=>{onActiveStoneChange(cfg.stoneMode==="real"?cfg.stone:null);},[cfg.stone,cfg.stoneMode,onActiveStoneChange]);

  function SsBlock({typeF,ctF,countF,manualF,setF,modeF,stoneF}){
    const [dh,setDh]=useState(false);
    const mode=cfg[modeF]; const real=cfg[stoneF];
    return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",border:`1px solid ${C.blm}`,borderRadius:4,overflow:"hidden"}}>
        {[["virtual","הערכת מחשבון"],["real","משיכה ממלאי"]].map(([m,l])=>(
          <button key={m} onClick={()=>{sf(modeF,m);if(m==="virtual")sf(stoneF,null);}}
            style={{flex:1,fontFamily:C.heb,fontSize:13,cursor:"pointer",color:mode===m?C.iv:C.chl,background:mode===m?C.ch:"transparent",border:"none",padding:"8px 0"}}>{l}</button>
        ))}
      </div>
      {mode==="virtual"?(
        <>
          <div style={{display:"flex",gap:12}} className="mobile-col">
            <Sel label="סוג אבן" half opts={STYPES} value={cfg[typeF]} onChange={e=>sf(typeF,e.target.value)}/>
            <Sel label="סגנון שיבוץ" half opts={SET_ENG} value={cfg[setF]} onChange={e=>sf(setF,e.target.value)} sx={{border:`1px solid rgba(197,179,88,0.35)`,background:"rgba(197,179,88,0.05)"}}/>
          </div>
          <div style={{display:"flex",gap:12}} className="mobile-col">
            <Inp label="קרט ממוצע לאבן" half type="number" min="0.01" step="0.01" value={cfg[ctF]} onChange={e=>sf(ctF,e.target.value)}/>
            <Inp label="כמות אבנים כוללת" half type="number" min="0" step="1" value={cfg[countF]} onChange={e=>sf(countF,e.target.value)}/>
          </div>
          <Inp label="עלות קבועה כוללת עוקפת ($)" type="number" min="0" placeholder="השאר ריק להערכה אוטומטית" value={cfg[manualF]} onChange={e=>sf(manualF,e.target.value)}/>
        </>
      ):(
        real?(
          <div style={{border:`1px solid rgba(197,179,88,0.45)`,padding:"14px 16px",background:C.gds,position:"relative",borderRadius:4}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><Check size={14} color={C.gdm}/><span style={{fontFamily:C.heb,fontSize:14,fontWeight:600,color:C.ch}}>{real.nH}</span></div>
            <div style={{fontFamily:C.eng,fontSize:11,color:C.chl}}>{real.sku} · {real.ct}ct · {usd(real.cost)}</div>
            <button onClick={()=>sf(stoneF,null)} style={{position:"absolute",top:10,right:12,background:"transparent",border:"none",cursor:"pointer",color:C.chl}}><X size={14}/></button>
          </div>
        ):(
          <div onDragOver={e=>{e.preventDefault();setDh(true);}} onDragLeave={()=>setDh(false)}
            onDrop={e=>{e.preventDefault();setDh(false);const id=e.dataTransfer.getData("stoneId");const s=stones.find(x=>x.id===id);if(s)sf(stoneF,s);}}
            style={{border:`1.5px dashed ${dh?"rgba(197,179,88,0.8)":C.blm}`,background:dh?C.gds:"transparent",padding:"16px 20px",display:"flex",alignItems:"center",gap:10,transition:"all 0.14s",cursor:"default",borderRadius:4}}>
            <GripVertical size={18} color={dh?C.gdm:C.chx}/><span style={{fontFamily:C.heb,fontSize:14,color:dh?C.gdm:C.chx}}>גרור לכאן אבן חלוקה ממאגר האבנים</span>
          </div>
        )
      )}
    </div>);
  }

  return(
    <div style={{height:"100%",display:"grid",gridTemplateColumns:"1fr 1fr",overflow:"hidden"}} className="mobile-grid">
      {/* ── Column A ── */}
      <div style={{borderLeft:`0.5px solid ${C.bl}`,overflowY:"auto",padding:"20px 24px 40px"}}>
        <div onDragOver={e=>{e.preventDefault();setMD(true);}} onDragLeave={()=>setMD(false)}
          onDrop={e=>{e.preventDefault();setMD(false);const id=e.dataTransfer.getData("stoneId");const s=stones.find(x=>x.id===id);if(s)setCfg(p=>({...p,stoneMode:"real",stone:s}));}}
          style={{border:`1.5px dashed ${mainDrop?"rgba(197,179,88,0.8)":C.blm}`,background:mainDrop?C.gds:"transparent",padding:"14px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:12,transition:"all 0.15s",borderRadius:4}}>
          <GripVertical size={18} color={mainDrop?C.gdm:C.chx}/>
          <span style={{fontFamily:C.heb,fontSize:14,fontWeight:600,color:mainDrop?C.gdm:C.chx}}>
            {cfg.stone&&cfg.stoneMode==="real"?`✓ שובצה אבן מרכזית: ${cfg.stone.nH}`:"גרור ושחרר אבן מרכזית ממאגר האבנים לכאן"}
          </span>
          {cfg.stone&&cfg.stoneMode==="real"&&<button onClick={()=>setCfg(p=>({...p,stone:null,stoneMode:"virtual"}))} style={{marginRight:"auto",background:"transparent",border:"none",cursor:"pointer",color:C.chl}}><X size={16}/></button>}
        </div>

        <Pnl num="01" title="מתכת קסטינג ועבודה">
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Sel label="סוג סגסוגת" opts={METALS} value={cfg.metal} onChange={e=>sf("metal",e.target.value)}/>
            <div style={{display:"flex",gap:12}} className="mobile-col">
              <Inp label="משקל זהב מתוכנן (g) *" half type="number" min="0.1" step="0.1" placeholder="0.00g" value={cfg.grams} onChange={e=>sf("grams",e.target.value)}/>
              <Inp label="ערך ספוט קבוע לגרם" half type="number" value={MSPOT[cfg.metal]??62.4} readOnly sx={{background:"rgba(197,179,88,0.06)",border:`1px solid rgba(197,179,88,0.32)`}}/>
            </div>
            <Sel label="טכנולוגיית ייצור" opts={CASTS} value={cfg.cast} onChange={e=>sf("cast",e.target.value)}/>
            <div><EB s={{marginBottom:8}}>רמת מורכבות העבודה</EB>
              <Pills opts={Object.keys(CMULT).map(k=>[k,CHEB[k]])} val={cfg.cmplx} onChange={v=>sf("cmplx",v)}/>
            </div>
          </div>
        </Pnl>

        <Pnl num="02" title="חישוב אבן מרכזית">
          <div style={{display:"flex",border:`1px solid ${C.blm}`,marginBottom:16,borderRadius:4,overflow:"hidden"}}>
            {[["virtual","הערכת נוסחה"],["real","שיבוץ מהמלאי"]].map(([m,l])=>(
              <button key={m} onClick={()=>sf("stoneMode",m)} style={{flex:1,fontFamily:C.heb,fontSize:14,cursor:"pointer",color:cfg.stoneMode===m?C.iv:C.chl,background:cfg.stoneMode===m?C.ch:"transparent",border:"none",padding:"10px 0"}}>{l}</button>
            ))}
          </div>
          {cfg.stoneMode==="virtual"?(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"flex",gap:12}} className="mobile-col">
                <Sel label="סוג אבן חן" half opts={STYPES} value={cfg.centerType} onChange={e=>sf("centerType",e.target.value)}/>
                <Sel label="סגנון שיבוץ" half opts={SET_ENG} value={cfg.centerSetting} onChange={e=>sf("centerSetting",e.target.value)} sx={{border:`1px solid rgba(197,179,88,0.35)`,background:"rgba(197,179,88,0.05)"}}/>
              </div>
              <div style={{display:"flex",gap:12}} className="mobile-col">
                <Inp label="משקל קרט מבוקש" half type="number" min="0.01" step="0.01" value={cfg.centerCt} onChange={e=>sf("centerCt",e.target.value)}/>
                <Inp label="מחיר ידני קבוע לאבן ($)" half type="number" min="0" placeholder="אוטומטי לפי מדד" value={cfg.centerManual} onChange={e=>sf("centerManual",e.target.value)}/>
              </div>
              {cfg.centerType==="Diamond"&&<div style={{display:"flex",gap:12}} className="mobile-col">
                <Inp label="צבע יהלום (D-K)" half placeholder="G" value={cfg.centerColor} onChange={e=>sf("centerColor",e.target.value)}/>
                <Sel label="רמת ניקיון יהלום" half opts={Object.keys(KFACT)} value={cfg.centerClarity} onChange={e=>sf("centerClarity",e.target.value)}/>
              </div>}
            </div>
          ):(cfg.stone?(
            <div style={{border:`1px solid rgba(197,179,88,0.45)`,padding:"14px 18px",background:C.gds,position:"relative",borderRadius:4}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><Check size={14} color={C.gdm}/><span style={{fontFamily:C.heb,fontSize:16,fontWeight:600,color:C.ch}}>{cfg.stone.nH}</span></div>
              <div style={{fontFamily:C.eng,fontSize:12,color:C.chl,marginBottom:10}}>{cfg.stone.sku} · {cfg.stone.ct}ct · {usd(cfg.stone.cost)}</div>
              <Sel label="שינוי סגנון שיבוץ ייעודי" opts={SET_ENG} value={cfg.centerSetting} onChange={e=>sf("centerSetting",e.target.value)} sx={{border:`1px solid rgba(197,179,88,0.35)`,background:"rgba(197,179,88,0.05)"}}/>
              <button onClick={()=>sf("stone",null)} style={{position:"absolute",top:12,right:14,background:"transparent",border:"none",cursor:"pointer",color:C.chl}}><X size={16}/></button>
            </div>
          ):(
            <div style={{fontFamily:C.heb,fontSize:14,color:C.chx,textAlign:"center",padding:"24px 14px",border:`1.5px dashed ${C.blm}`,borderRadius:4}}>גרור אבן ממאגר האבנים הכללי</div>
          ))}
        </Pnl>

        <Pnl num="03" title="אלמנט אבני צד I">
          <SsBlock typeF="ss1Type" ctF="ss1Ct" countF="ss1Count" manualF="ss1Manual" setF="ss1Setting" modeF="ss1Mode" stoneF="ss1Stone"/>
        </Pnl>
        <Pnl num="04" title="אלמנט אבני צד II">
          <SsBlock typeF="ss2Type" ctF="ss2Ct" countF="ss2Count" manualF="ss2Manual" setF="ss2Setting" modeF="ss2Mode" stoneF="ss2Stone"/>
        </Pnl>

        <Pnl num="05" title="שרשראות ורכיבי מלאי תואמים">
          {(cfg.selectedComponents||[]).length===0?(
            <div style={{fontFamily:C.heb,fontSize:14,color:C.chx,padding:"14px 0",textAlign:"center"}}>טרם נבחרו חלקים קבועים להצעה זו</div>
          ):(cfg.selectedComponents).map(c=> (
            <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid rgba(54,69,79,0.06)`}}>
              <div><div style={{fontFamily:C.heb,fontSize:14,fontWeight:600,color:C.ch}}>{c.name}</div><div style={{fontFamily:C.eng,fontSize:11,color:C.chl}}>{c.material} · {c.type}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontFamily:C.serif,fontSize:14,color:C.gdm,fontWeight:600}}>{usd(c.cost)}</span><button onClick={()=>sf("selectedComponents",cfg.selectedComponents.filter(x=>x.id!==c.id))} style={{background:"transparent",border:"none",cursor:"pointer",color:C.chl}}><X size={14}/></button></div>
            </div>
          ))}
          {(components||[]).filter(c=>!cfg.selectedComponents.find(x=>x.id===c.id)).length>0&&(
            <div style={{marginTop:14}}>
              <EB s={{marginBottom:10}}>הוספת חלק מהמאגר הקיים</EB>
              {(components||[]).filter(c=>!cfg.selectedComponents.find(x=>x.id===c.id)).map(c=>(
                <div key={c.id} onClick={()=>sf("selectedComponents",[...cfg.selectedComponents,c])}
                  style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",border:`1px solid ${C.bl}`,marginBottom:8,cursor:"pointer",background:C.iv2,borderRadius:4}}>
                  <div><div style={{fontFamily:C.heb,fontSize:14,fontWeight:600,color:C.ch}}>{c.name}</div><div style={{fontFamily:C.eng,fontSize:10,color:C.chl}}>{c.material} · {c.type}</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontFamily:C.serif,fontSize:14,color:C.gdm,fontWeight:600}}>{usd(c.cost)}</span><Plus size={14} color={C.gdm}/></div>
                </div>
              ))}
            </div>
          )}
        </Pnl>

        <Pnl num="06" title="מדיה וצילום קטלוג">
          <ImgDrop img={pieceImg} onImg={setPieceImg} h={140} label="גרור או העלה סקיצת דו-מימד או רנדור סטודיו"/>
        </Pnl>

        <Pnl num="07" title="שיוך לקוח ומסמך">
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Inp label="שם לקוח מלא" type="text" placeholder="Client Name" value={cfg.clientName} onChange={e=>sf("clientName",e.target.value)}/>
            <Inp label="כותרת העבודה לתעודה" type="text" placeholder="Custom Fine Jewelry Design Piece" value={cfg.quoteName} onChange={e=>sf("quoteName",e.target.value)}/>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <EB>הערות ומפרט עבודה חופשי</EB>
              <textarea style={{fontFamily:C.heb,fontSize:14,color:C.ch,background:C.iv2,border:`1px solid ${C.blm}`,padding:"10px 12px",outline:"none",resize:"vertical",lineHeight:1.6,minHeight:80,borderRadius:4}} rows={4} value={cfg.notes} onChange={e=>sf("notes",e.target.value)}/>
            </div>
          </div>
        </Pnl>
      </div>

      {/* ── Column B ── */}
      <div style={{overflowY:"auto",padding:"20px 24px 40px",background:"#ffffff"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}} className="mobile-col">
          <EKpi label="עלות ייצור כוללת" value={res?.prod} nat={res?.prod_nat} sub="חומרים + שיבוץ ועבודה" ov={cfg.prodOv} onOv={v=>sf("prodOv",v)} onClr={()=>sf("prodOv","")}/>
          <EKpi label="ערך סיטונאי מוערך" value={res?.ws} nat={res?.ws_nat} sub={`מקדם נטו · ×${MU.ws.toFixed(2)}`} ov={cfg.wsOv} onOv={v=>sf("wsOv",v)} onClr={()=>sf("wsOv","")}/>
          <EKpi label="ערך קמעונאי מומלץ" value={res?.rx} nat={res?.rx_nat} sub={`ללא מע״מ · ×${MU.rx.toFixed(2)}`} ov={cfg.rxOv} onOv={v=>sf("rxOv",v)} onClr={()=>sf("rxOv","")}/>
          <EKpi label="מחיר קצה (כולל מע״מ)" value={res?.ri} nat={res?.ri_nat} sub="כולל 18% מע״מ כדין" hi ov={cfg.riOv} onOv={v=>sf("riOv",v)} onClr={()=>sf("riOv","")}/>
        </div>

        {res&&(
          <Pnl num="—" title="פירוט רכיבי נוסחה ועלויות">
            <ERow label="משקל וסגסוגת מתכת" note={`${res.gw}g ברוטו כולל פחת · ${cfg.metal}`} nat={res.mc_nat} ov={cfg.mcOv} onOv={v=>sf("mcOv",v)} onClr={()=>sf("mcOv","")}/>
            <ERow label="עבודה שכר ושיבוץ" note={`מורכבות ${CHEB[cfg.cmplx]} · שיבוץ ואומנות`} nat={res.lc_nat} ov={cfg.lcOv} onOv={v=>sf("lcOv",v)} onClr={()=>sf("lcOv","")}/>
            {[
              {l:"רכיב אבן מרכזית",n:cfg.stoneMode==="real"&&cfg.stone?cfg.stone.nH:`הערכת נוסחה: ${cfg.centerCt}ct`,v:res.sc},
              res.ss1>0&&{l:"אלמנט אבני צד I",n:`מפרט הצד המשובץ`,v:res.ss1},
              res.ss2>0&&{l:"אלמנט אבני צד II",n:`מפרט הצד המשובץ`,v:res.ss2},
              res.compCost>0&&{l:"חלקי מלאי נלווים",n:"שרשראות / ממצאים",v:res.compCost},
              {l:"עלויות סטודיו קבועות",n:"18% מס מחשוב וניהול מתכת",v:res.oh},
            ].filter(Boolean).map(({l,n,v})=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"11px 0",borderBottom:`1px solid rgba(54,69,79,0.06)`}}>
                <div><div style={{fontFamily:C.heb,fontSize:14,color:C.ch,marginBottom:2}}>{l}</div><div style={{fontFamily:C.eng,fontSize:10,color:C.chx}}>{n}</div></div>
                <span style={{fontFamily:C.serif,fontSize:14,color:C.ch}}>{usd(v)}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",padding:"14px 0 4px",borderTop:`1.5px solid ${C.blm}`,marginTop:6}}>
              <span style={{fontFamily:C.heb,fontSize:15,color:C.ch,fontWeight:600}}>עלות ייצור נטו</span>
              <span style={{fontFamily:C.serif,fontSize:18,color:cfg.prodOv?C.gdm:C.ch,fontWeight:600}}>{usd(res.prod)}</span>
            </div>
          </Pnl>
        )}

        {!res&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 18px",border:`1px solid ${C.bl}`,background:C.iv2,marginBottom:16,borderRadius:4}}>
          <AlertCircle size={16} color={C.chx}/><span style={{fontFamily:C.heb,fontSize:14,color:C.chx}}>הזן משקל מתכת בגרמים על מנת להפעיל את מחשבון העלויות והמחירון</span>
        </div>}

        <button onClick={()=>res&&onExport(cfg,res,pieceImg)} disabled={!res}
          style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontFamily:C.heb,fontSize:16,fontWeight:600,color:res?C.ch:C.chl,background:res?"rgba(197,179,88,0.14)":C.iv2,border:`1px solid ${res?"rgba(197,179,88,0.48)":C.bl}`,padding:"16px 0",cursor:res?"pointer":"not-allowed",marginBottom:16,borderRadius:4}}>
          <FileText size={18}/>{res?"הפק תעודת יוקרה (PDF)":"הגדר פרטי מתכת כדי להפיק תעודה"}</button>
      </div>
    </div>
  );
}

/* ═══════════ SIDEBAR NAVIGATION ═══════════ */
function Sidebar({tab,setTab}){
  const NAV=[
    {icon:Calculator,label:"מחשבון עלויות",id:"builder"},
    {icon:Gem,label:"מאגר אבנים",id:"stones"},
    {icon:Database,label:"הזנת נתונים",id:"data"},
    {icon:FileText,label:"תעודה ידנית",id:"manual"},
  ];
  return (
    <aside className="no-print" style={{width:220,minWidth:220,background:C.ch,display:"flex",flexDirection:"column",borderLeft:`1px solid rgba(255,255,255,0.06)`}}>
      <div style={{padding:"24px 20px 20px",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{width:22,height:22,border:`1px solid ${C.gd}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10}}><span style={{fontFamily:C.serif,fontSize:10,color:C.gd}}>L</span></div>
        <div style={{fontFamily:C.serif,fontSize:15,color:"#E8E4DC",letterSpacing:"0.15em",lineHeight:1}}>LESHEM.S</div>
        <div style={{fontFamily:C.heb,fontSize:10,color:"#5a7280",marginTop:4}}>סטודיו תכשיטים</div>
      </div>
      <nav style={{padding:"16px 0",flex:1}}>
        {NAV.map(({icon:Icon,label,id})=>(
          <div key={id} onClick={()=>setTab(id)}
            style={{display:"flex",alignItems:"center",gap:12,padding:"12px 20px",cursor:"pointer",position:"relative",background:tab===id?"rgba(197,179,88,0.09)":"transparent"}}>
            {tab===id&&<div style={{position:"absolute",right:0,top:0,width:4,height:"100%",background:C.gd}}/>}
            <Icon size={18} color={tab===id?C.gd:"#5a7280"} strokeWidth={1.4}/>
            <span style={{fontFamily:C.heb,fontSize:14,color:tab===id?"#ddd8cc":"#5a7280"}}>{label}</span>
          </div>
        ))}
      </nav>
      <div style={{padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:"#7fb987"}}/>
          <span style={{fontFamily:C.heb,fontSize:12,color:"#5a7280"}}>Airtable Engine</span>
        </div>
      </div>
    </aside>
  );
}

/* ═══════════ COMPLETE APPLICATION ROOT ═══════════ */
export default function App(){
  const [tab,setTab]=useState("builder");
  const [stones,setStones]=useState(INIT_STONES);
  const [components,setComponents]=useState([]);
  const [clientItems,setClientItems]=useState([]);
  const [activeStone,setAS]=useState(null);
  const [pickedStone,setPS]=useState(null);
  const [pickedId,setPId]=useState(null);
  const [modal,setModal]=useState(null);
  const [resetKey,setRK]=useState(0);

  const addStone=useCallback(s=>setStones(p=>[s,...p]),[]);
  const addComponent=useCallback(c=>setComponents(p=>[c,...p]),[]);
  const addClientItem=useCallback(i=>setClientItems(p=>[i,...p]),[]);
  const pickFromBrowser=useCallback(stone=>{setPS(stone);setPId(stone.id);setTab("builder");},[]);
  const onActiveChange=useCallback(s=>{setAS(s);if(!s)setPId(null);},[]);

  const TITLES={builder:"מחשבון עלויות וייצור",stones:"מאגר ומטריצת אבנים",data:"הזנת ישירה למאגר",manual:"הפקת תעודה ידנית"};

  return (
    <div dir="rtl" style={{display:"flex",height:"100vh",background:C.iv,overflow:"hidden",fontFamily:C.heb}} className="app-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600&family=Merriweather:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: 16px; -webkit-text-size-adjust: 100%; }
        body { font-family: 'Assistant', sans-serif; background: #FAF9F6; line-height: 1.5; color: #36454F; }

        @media (max-width: 768px) {
          html { font-size: 14px; }
          .app-container { flex-direction: column !important; }
          aside { width: 100% !important; min-width: 100% !important; flex-direction: row !important; align-items: center; justify-content: space-between; border-left: none !important; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 10px !important; }
          aside nav { display: none; }
          .mobile-col { flex-direction: column !important; }
          .mobile-grid { grid-template-columns: 1fr !important; overflow-y: auto !important; height: auto !important; }
        }

        /* HARD FIX PRINT LOGIC - REMOVING BLANK SCREEN CONSTRAINTS */
        @media print {
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: #ffffff !important;
          }
          .no-print, .no-print *, .modal-backdrop * {
            display: none !important;
          }
          .modal-backdrop, .app-container, div, main {
            display: block !important;
            position: static !important;
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            width: 100% !important;
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .printable-container {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important; /* Forces standard A4 exact sizing */
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          #cert-root, #stone-cert-root {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-sizing: border-box !important;
            width: 210mm !important;
            min-height: 295mm !important;
            padding: 50px !important;
            background: #FAF9F6 !important;
            page-break-after: always !important;
          }
        }
      `}</style>

      <Sidebar tab={tab} setTab={setTab}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div className="no-print" style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",padding:"16px 26px 14px",borderBottom:`1px solid ${C.bl}`,background:C.iv}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{fontFamily:C.heb,fontSize:11,color:C.chx}}>LESHEM.S OS</span>
              <span style={{color:C.chx}}>‹</span>
              <span style={{fontFamily:C.heb,fontSize:11,color:C.chl}}>{TITLES[tab]}</span>
            </div>
            <h1 style={{fontFamily:C.heb,fontSize:20,fontWeight:600,color:C.ch}}>{TITLES[tab]}</h1>
          </div>
          <div style={{display:"flex",gap:10}} className="mobile-col">
            {tab==="builder"&&<button onClick={()=>setTab("stones")} style={{display:"flex",alignItems:"center",gap:8,fontFamily:C.heb,fontSize:14,color:C.chm,background:"transparent",border:`1px solid ${C.blm}`,padding:"10px 16px",cursor:"pointer",borderRadius:4}}><Gem size={16}/>מאגר אבנים</button>}
            {tab==="stones"&&<button onClick={()=>setTab("builder")} style={{display:"flex",alignItems:"center",gap:8,fontFamily:C.heb,fontSize:14,color:C.chm,background:"transparent",border:`1px solid ${C.blm}`,padding:"10px 16px",cursor:"pointer",borderRadius:4}}><Calculator size={16}/>מחשבון עלויות</button>}
            <button onClick={()=>{setRK(k=>k+1);setAS(null);setPS(null);setPId(null);}} style={{display:"flex",alignItems:"center",gap:6,fontFamily:C.heb,fontSize:14,color:C.chl,background:"transparent",border:`1px solid ${C.bl}`,padding:"10px 16px",cursor:"pointer",borderRadius:4}}><RotateCcw size={14}/> אתחל לוח</button>
          </div>
        </div>
        <div style={{flex:1,overflow:"hidden"}}>
          {tab==="builder"&&<QuoteBuilder stones={stones} components={components} externalStone={pickedStone} onActiveStoneChange={onActiveChange} onExport={(cfg,res,img)=>setModal({cfg,res,img})} resetKey={resetKey}/>}
          {tab==="stones"&&<InventoryBrowser stones={stones} quoteStone={activeStone} onPickStone={pickFromBrowser} pickedId={pickedId}/>}
          {tab==="data"&&<DataEntryHub onAddStone={addStone} onAddComponent={addComponent} onAddClientItem={addClientItem}/>}
          {tab==="manual"&&<ManualCertTab/>}
        </div>
      </div>
      {modal&&<QuoteCertModal cfg={modal.cfg} res={modal.res} pieceImg={modal.img} onClose={()=>setModal(null)}/>}
    </div>
  );
}

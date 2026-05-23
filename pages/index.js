import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Calculator, Gem, FileText, ChevronDown, X, Printer, RotateCcw,
  Search, TrendingDown, TrendingUp, ArrowLeft, Check, Star,
  GripVertical, Plus, Minus, AlertCircle, LayoutGrid, List,
  ImageIcon, Pencil, Lock, FileCheck, Package, ClipboardList,
  Eye, Database
} from "lucide-react";

/* ── TOKENS ── */
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

/* ── INITIAL INVENTORY ── */
const INIT_STONES=[
  {id:"s01",sku:"DIA-RND-210",nH:"יהלום עגול 2.10ct",nE:"Round Brilliant 2.10ct",type:"Diamond",tH:"יהלום",shape:"Round",sH:"עגול",ct:2.10,color:"G",cla:"VS1",cost:15200,img:null},
  {id:"s02",sku:"DIA-OVL-180",nH:"יהלום אובל 1.80ct",nE:"Oval Diamond 1.80ct",type:"Diamond",tH:"יהלום",shape:"Oval",sH:"אובל",ct:1.80,color:"F",cla:"VVS2",cost:18400,img:null},
  {id:"s03",sku:"DIA-CSH-302",nH:"יהלום כרית 3.02ct",nE:"Cushion Diamond 3.02ct",type:"Diamond",tH:"יהלום",shape:"Cushion",sH:"כרית",ct:3.02,color:"D",cla:"IF",cost:68000,img:null},
  {id:"s04",sku:"DIA-PER-121",nH:"יהלום טיפה 1.21ct",nE:"Pear Diamond 1.21ct",type:"Diamond",tH:"יהלום",shape:"Pear",sH:"טיפה",ct:1.21,color:"H",cla:"SI1",cost:4850,img:null},
  {id:"s05",sku:"DIA-EMC-095",nH:"יהלום אמרלד קאט 0.95ct",nE:"Emerald Cut 0.95ct",type:"Diamond",tH:"יהלום",shape:"Emerald Cut",sH:"אמרלד קאט",ct:0.95,color:"G",cla:"VS2",cost:3600,img:null},
  {id:"s06",sku:"SAP-OVL-285",nH:"ספיר כחול 2.85ct",nE:"Blue Sapphire 2.85ct",type:"Sapphire",tH:"ספיר",shape:"Oval",sH:"אובל",ct:2.85,color:"Royal Blue",cla:"Loupe Clean",cost:7200,img:null},
  {id:"s07",sku:"SAP-CSH-175",nH:"ספיר ורוד 1.75ct",nE:"Pink Sapphire 1.75ct",type:"Sapphire",tH:"ספיר",shape:"Cushion",sH:"כרית",ct:1.75,color:"Pink",cla:"Loupe Clean",cost:4100,img:null},
  {id:"s08",sku:"RUB-OVL-152",nH:"רובי דם יונה 1.52ct",nE:"Pigeon Blood Ruby 1.52ct",type:"Ruby",tH:"רובי",shape:"Oval",sH:"אובל",ct:1.52,color:"Pigeon Blood",cla:"Minor Incl.",cost:11400,img:null},
  {id:"s09",sku:"EMR-OVL-190",nH:"אמרלד קולומביאני 1.90ct",nE:"Colombian Emerald 1.90ct",type:"Emerald",tH:"אמרלד",shape:"Oval",sH:"אובל",ct:1.90,color:"Vivid Green",cla:"Minor Incl.",cost:9800,img:null},
  {id:"s10",sku:"AXL-OVL-095",nH:"אלכסנדריט 0.95ct",nE:"Alexandrite 0.95ct",type:"Alexandrite",tH:"אלכסנדריט",shape:"Oval",sH:"אובל",ct:0.95,color:"Color Change",cla:"Loupe Clean",cost:8500,img:null},
  {id:"s11",sku:"DIA-RND-098",nH:"יהלום עגול 0.98ct",nE:"Round Brilliant 0.98ct",type:"Diamond",tH:"יהלום",shape:"Round",sH:"עגול",ct:0.98,color:"H",cla:"VS2",cost:3900,img:null},
  {id:"s12",sku:"DIA-OVL-205",nH:"יהלום אובל 2.05ct",nE:"Oval Diamond 2.05ct",type:"Diamond",tH:"יהלום",shape:"Oval",sH:"אובל",ct:2.05,color:"G",cla:"VVS1",cost:22000,img:null},
];

/* ── FORMULA TABLES ── */
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

/* ── MATCHING ── */
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

/* ── GEMOLOGICAL INSIGHT ── */
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
    parts.push("Natural diamonds of this specification are suitable for high-jewellery commissions");
    return parts.filter(Boolean).join(", ")+".";
  }
  const sDesc={Sapphire:"Corundum (Al₂O₃) — hardness 9 on the Mohs scale",Ruby:"Corundum (Al₂O₃) — hardness 9 on the Mohs scale, colour derived from chromium",Emerald:"Beryl (Be₃Al₂Si₆O₁₈) — hardness 7.5–8, valued for vivid green saturation",Alexandrite:"Chrysoberyl — hardness 8.5, exhibits colour-change phenomenon",Other:""}[data.type]||"";
  return `This ${ct?ct+"ct ":""}${data.shape||""} ${data.type} displays ${data.color||"characteristic"} coloration. ${sDesc} ${data.cla?`Transparency grade: ${data.cla}.`:""}`.trim();
}

/* ── ATOMS ── */
const GR=({soft,my=0})=><div style={{height:"0.5px",background:soft?"rgba(197,179,88,0.22)":C.gd,marginTop:my,marginBottom:my}}/>;
const EB=({dark,s={},children})=><div style={{fontFamily:C.heb,fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",color:dark?C.ch:C.chl,marginBottom:5,...s}}>{children}</div>;

function ImgDrop({img,onImg,h=80,label="תמונה",small,className}){
  const [hov,setHov]=useState(false);
  const ref=useRef();
  function handle(file){if(!file||!file.type.startsWith("image/"))return;const r=new FileReader();r.onload=e=>onImg(e.target.result);r.readAsDataURL(file);}
  return(
    <div className={className}
      onDragOver={e=>{e.preventDefault();setHov(true);}} onDragLeave={()=>setHov(false)}
      onDrop={e=>{e.preventDefault();setHov(false);handle(e.dataTransfer.files[0]);}}
      onClick={()=>ref.current?.click()}
      style={{height:h,background:img?"transparent":hov?C.iv3:C.iv2,border:`0.5px dashed ${hov?C.blm:C.bl}`,cursor:"pointer",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"background 0.12s"}}>
      {img?(<>
        <img src={img} style={{width:"100%",height:"100%",objectFit:"contain"}}/>
        <button onClick={e=>{e.stopPropagation();onImg(null);}} style={{position:"absolute",top:4,right:4,background:"rgba(54,69,79,0.7)",border:"none",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff"}}><X size={9}/></button>
      </>):(
        <><ImageIcon size={small?14:18} color={C.chx} strokeWidth={1.2}/><span style={{fontFamily:C.heb,fontSize:small?8:9,color:C.chx,marginTop:4}}>{label}</span></>
      )}
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handle(e.target.files[0])}/>
    </div>
  );
}

function Sel({label,opts,half,sx={},...p}){
  return(<div style={{display:"flex",flexDirection:"column",gap:4,width:half?"50%":"100%"}}>
    {label&&<EB>{label}</EB>}
    <div style={{position:"relative"}}>
      <select style={{fontFamily:C.heb,fontSize:12,color:C.ch,background:C.iv2,border:`0.5px solid ${C.blm}`,padding:"8px 10px 8px 26px",outline:"none",appearance:"none",width:"100%",...sx}} {...p}>
        {opts.map(o=><option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={11} style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",color:C.chl,pointerEvents:"none"}}/>
    </div>
  </div>);
}
function Inp({label,half,sx={},...p}){
  return(<div style={{display:"flex",flexDirection:"column",gap:4,width:half?"50%":"100%"}}>
    {label&&<EB>{label}</EB>}
    <input style={{fontFamily:C.heb,fontSize:12,color:C.ch,background:C.iv2,border:`0.5px solid ${C.blm}`,padding:"8px 10px",outline:"none",width:"100%",...sx}} {...p}/>
  </div>);
}
function Pnl({num,title,children}){
  return(<div style={{border:`0.5px solid ${C.bl}`,marginBottom:11,background:C.iv}}>
    <div style={{display:"flex",alignItems:"baseline",gap:10,padding:"10px 15px 9px",borderBottom:`0.5px solid ${C.bl}`}}>
      <span style={{fontFamily:C.eng,fontSize:8,color:C.gdm,letterSpacing:"0.22em"}}>{num}</span>
      <span style={{fontFamily:C.heb,fontSize:12.5,fontWeight:400,color:C.ch}}>{title}</span>
    </div>
    <div style={{padding:"12px 15px"}}>{children}</div>
  </div>);
}
function EKpi({label,value,nat,sub,hi,ov:oVal,onOv,onClr}){
  const [ed,setEd]=useState(false);
  const [draft,setDraft]=useState("");
  const locked=oVal!=="";
  const ref=useRef();
  function startEdit(){setDraft(oVal!==""?oVal:String(Math.round(nat||0)));setEd(true);setTimeout(()=>ref.current?.select(),40);}
  function commit(){const v=draft.trim();(!v||(parseFloat(v)||0)===0)?onClr():onOv(v);setEd(false);}
  return(<div style={{border:`0.5px solid ${hi?C.ch:locked?"rgba(197,179,88,0.5)":C.bl}`,padding:"13px 15px",background:hi?C.ch:C.iv,position:"relative",overflow:"hidden"}}>
    {locked&&!hi&&<div style={{position:"absolute",top:0,left:0,width:"100%",height:"1.5px",background:C.gd}}/>}
    {!hi&&!locked&&<div style={{position:"absolute",bottom:0,right:0,width:"100%",height:"1.5px",background:`linear-gradient(270deg,${C.gd},transparent)`,opacity:0.28}}/>}
    <EB s={{color:hi?"rgba(225,215,195,0.42)":C.chl,marginBottom:3}}>{label}</EB>
    {ed?(
      <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:4}}>
        <span style={{fontFamily:C.eng,fontSize:11,color:hi?C.gd:C.chm}}>$</span>
        <input ref={ref} type="number" value={draft} onChange={e=>setDraft(e.target.value)}
          onBlur={commit} onKeyDown={e=>{if(e.key==="Enter")commit();if(e.key==="Escape"){setEd(false);onClr();}}}
          style={{fontFamily:C.serif,fontSize:15,color:hi?C.gd:C.ch,background:"transparent",border:"none",borderBottom:`0.5px solid ${hi?"rgba(197,179,88,0.6)":C.blm}`,outline:"none",width:"100%",padding:"2px 0"}}/>
      </div>
    ):(
      <div style={{fontFamily:C.serif,fontSize:16,fontWeight:300,color:hi?C.gd:C.ch,lineHeight:1,marginBottom:4}}>
        {value!=null?usd(value):<span style={{color:hi?"rgba(225,215,195,0.15)":C.chx,fontSize:12}}>—</span>}
      </div>
    )}
    <div style={{fontFamily:C.heb,fontSize:8,color:hi?"rgba(225,215,195,0.32)":C.chx,lineHeight:1.4}}>{sub}</div>
    {value!=null&&<div style={{position:"absolute",top:8,left:8,display:"flex",gap:4,alignItems:"center"}}>
      {locked&&!ed&&<button onClick={onClr} style={{background:"rgba(197,179,88,0.18)",border:"none",cursor:"pointer",padding:"2px 4px",display:"flex"}}><X size={9} color={C.gdm}/></button>}
      {!ed&&<button onClick={startEdit} style={{background:"transparent",border:"none",cursor:"pointer",padding:"2px",opacity:0.4,display:"flex"}}><Pencil size={9} color={hi?C.gd:C.ch}/></button>}
      {locked&&<Lock size={8} color={C.gdm} style={{marginTop:1}}/>}
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
  return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`0.5px solid rgba(54,69,79,0.06)`}}>
    <div style={{flex:1}}>
      <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontFamily:C.heb,fontSize:11.5,color:C.ch}}>{label}</span>{locked&&<Lock size={9} color={C.gdm}/>}</div>
      <div style={{fontFamily:C.eng,fontSize:7.5,color:C.chx,marginTop:1}}>{note}</div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      {ed?(<div style={{display:"flex",gap:4,alignItems:"center"}}>
        <span style={{fontFamily:C.eng,fontSize:10,color:C.chm}}>$</span>
        <input ref={ref} type="number" value={draft} onChange={e=>setDraft(e.target.value)}
          onBlur={commit} onKeyDown={e=>{if(e.key==="Enter")commit();if(e.key==="Escape"){setEd(false);onClr();}}}
          style={{fontFamily:C.serif,fontSize:12,color:C.ch,background:C.iv2,border:`0.5px solid ${C.blm}`,outline:"none",width:70,padding:"3px 6px",textAlign:"left"}}/>
      </div>):(<span style={{fontFamily:C.serif,fontSize:12,color:locked?C.gdm:C.ch,whiteSpace:"nowrap"}}>{usd(nat)}</span>)}
      {!ed&&<button onClick={startEdit} style={{background:"transparent",border:"none",cursor:"pointer",padding:"2px",opacity:0.4,display:"flex"}}><Pencil size={10} color={C.ch}/></button>}
      {locked&&!ed&&<button onClick={onClr} style={{background:"transparent",border:"none",cursor:"pointer",padding:"2px",display:"flex"}}><X size={10} color={C.gdm}/></button>}
    </div>
  </div>);
}

/* ═══════════ QUOTE CERTIFICATE (English LTR) ═══════════ */
function QuoteCert({cfg,res,pieceImg}){
  const qref=useMemo(()=>{const d=new Date();return `QT-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${(cfg.clientName||"DRAFT").replace(/\s+/g,"-").toUpperCase().slice(0,10)}`;},[cfg.clientName]);
  const cDesc=cfg.stoneMode==="real"&&cfg.stone
    ?`${cfg.stone.ct}ct ${cfg.stone.type}, ${cfg.stone.color}, ${cfg.stone.cla} · ${cfg.centerSetting}`
    :`${cfg.centerCt}ct ${cfg.centerType}${cfg.centerType==="Diamond"?`, ${cfg.centerColor} color, ${cfg.centerClarity} clarity`:""} · ${cfg.centerSetting}`;
  const comps=(cfg.selectedComponents||[]);
  const Row=({l,v,first,it})=>(!v?null:(
    <div style={{display:"flex",padding:"6px 0",borderTop:first?`0.4px solid rgba(197,179,88,0.2)`:"none",borderBottom:`0.4px solid rgba(197,179,88,0.2)`}}>
      <div style={{fontFamily:C.eng,fontSize:7,color:C.chl,letterSpacing:"0.5px",width:"36%",paddingRight:10,paddingTop:1,textTransform:"uppercase"}}>{l}</div>
      <div style={{fontFamily:C.serif,fontSize:8.5,fontWeight:300,fontStyle:it?"italic":"normal",color:it?C.chm:C.ch,flex:1,lineHeight:1.5}}>{v}</div>
    </div>
  ));
  return(
    <div dir="ltr" id="cert-root" style={{fontFamily:C.eng,background:C.iv,padding:"38px 44px 32px",WebkitPrintColorAdjust:"exact",printColorAdjust:"exact",maxWidth:580,margin:"0 auto",aspectRatio:"1 / 1.414",overflow:"hidden"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12}}>
        <div>
          <div style={{width:16,height:16,border:`0.8px solid ${C.gd}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:5}}><span style={{fontFamily:C.serif,fontSize:7,color:C.gd}}>L</span></div>
          <div style={{fontFamily:C.serif,fontSize:16,fontWeight:300,color:C.ch,letterSpacing:7,lineHeight:1}}>LESHEM.S</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:C.eng,fontSize:6.5,color:C.chl,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:2}}>Quotation</div>
          <div style={{fontFamily:C.eng,fontSize:8.5,color:C.ch}}>{qref}</div>
        </div>
      </div>
      <GR/>
      <div style={{display:"flex",justifyContent:"space-between",margin:"11px 0 14px"}}>
        <div>
          <div style={{fontFamily:C.eng,fontSize:6.5,color:C.chl,letterSpacing:"2px",textTransform:"uppercase",marginBottom:2}}>Prepared For</div>
          <div style={{fontFamily:C.serif,fontSize:9.5,fontWeight:300,color:C.ch}}>{cfg.clientName||"—"}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:C.eng,fontSize:6.5,color:C.chl,letterSpacing:"2px",textTransform:"uppercase",marginBottom:2}}>Date of Issue</div>
          <div style={{fontFamily:C.serif,fontSize:9.5,fontWeight:300,color:C.ch}}>{fmtD()}</div>
        </div>
      </div>
      <GR soft my={2}/>
      <div style={{width:"100%",height:95,background:C.iv2,border:`0.5px solid rgba(197,179,88,0.22)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"12px 0 14px",position:"relative",overflow:"hidden"}}>
        {pieceImg?<img src={pieceImg} alt="piece" style={{width:"100%",height:"100%",objectFit:"contain"}}/>:(
          <div style={{fontFamily:C.eng,fontSize:7,color:C.chl,letterSpacing:"2px",textTransform:"uppercase",opacity:0.55}}>Piece Photography</div>
        )}
      </div>
      <div style={{marginBottom:3,fontFamily:C.eng,fontSize:5.5,color:C.chl,letterSpacing:"2.5px",textTransform:"uppercase"}}>Piece Specification</div>
      <Row first l="Metal" v={cfg.metal}/>
      <Row l="Finished Weight" v={cfg.grams?`${cfg.grams}g  (${res?.gw??cfg.grams}g gross)`:""}/>
      <Row l="Center Stone" v={cDesc}/>
      {(parseInt(cfg.ss1Count)||0)>0&&<Row l="Side Stones 1" v={`${cfg.ss1Count} × ${cfg.ss1Ct}ct ${cfg.ss1Type}`}/>}
      {cfg.ss1Mode==="real"&&cfg.ss1Stone&&<Row l="Side Stones 1" v={`${cfg.ss1Stone.nE} (inventory)`}/>}
      {(parseInt(cfg.ss2Count)||0)>0&&<Row l="Side Stones 2" v={`${cfg.ss2Count} × ${cfg.ss2Ct}ct ${cfg.ss2Type}`}/>}
      {cfg.ss2Mode==="real"&&cfg.ss2Stone&&<Row l="Side Stones 2" v={`${cfg.ss2Stone.nE} (inventory)`}/>}
      {comps.length>0&&<Row l="Components" v={comps.map(c=>c.name).join(", ")}/>}
      {cfg.quoteName&&<Row l="Description" v={cfg.quoteName}/>}
      {cfg.notes&&<Row l="Notes" v={cfg.notes} it/>}
      <div style={{height:12}}/><GR/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 18px",border:`0.5px solid rgba(197,179,88,0.22)`,background:C.iv2,WebkitPrintColorAdjust:"exact"}}>
        <div>
          <div style={{fontFamily:C.eng,fontSize:6.5,color:C.chl,letterSpacing:"2px",textTransform:"uppercase",marginBottom:3}}>Total Estimate</div>
          <div style={{fontFamily:C.eng,fontSize:7,color:C.chm}}>Materials + Labour + 18% VAT</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:C.eng,fontSize:7,color:C.chm,letterSpacing:"1px",marginBottom:2}}>USD</div>
          <div style={{fontFamily:C.serif,fontSize:24,fontWeight:400,color:C.ch,lineHeight:1}}>{res?usd(res.ri):"—"}</div>
        </div>
      </div>
      <GR/>
      <div style={{margin:"9px 0 12px",fontFamily:C.eng,fontSize:6,color:C.chl,lineHeight:1.9}}>This quotation is an estimate only and does not constitute a binding agreement. Prices are subject to change based on exact specifications and market availability.</div>
      <GR soft/>
      <div style={{marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <div style={{borderBottom:`0.5px solid ${C.chm}`,marginBottom:5,width:100,opacity:0.28}}/>
          <div style={{fontFamily:C.serif,fontSize:9,fontStyle:"italic",fontWeight:400,color:C.ch}}>Leshem Simon</div>
          <div style={{fontFamily:C.eng,fontSize:6,color:C.chl,letterSpacing:"1.5px",textTransform:"uppercase",opacity:0.6}}>Founder & Expert Jeweler</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:C.eng,fontSize:7,color:C.chl,letterSpacing:"3px",opacity:0.32,marginBottom:4}}>{qref}</div>
          <div style={{fontFamily:C.eng,fontSize:6,color:C.chl,opacity:0.55,lineHeight:1.7}}>LESHEM.S Jewelry | Tuval St 23, Ramat Gan<br/>VAT ID: 046240016</div>
        </div>
      </div>
    </div>
  );
}
function QuoteCertModal({cfg,res,pieceImg,onClose}){
  useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[onClose]);
  return(
    <div className="no-print" style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(20,30,36,0.92)",display:"flex",flexDirection:"column",alignItems:"center",overflowY:"auto",padding:"20px 16px 48px"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div dir="rtl" style={{width:"100%",maxWidth:630,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
        <span style={{fontFamily:C.heb,fontSize:9.5,color:"rgba(225,215,195,0.45)",letterSpacing:"0.1em",textTransform:"uppercase"}}>תצוגת PDF</span>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>window.print()} style={{display:"flex",alignItems:"center",gap:7,fontFamily:C.heb,fontSize:11,color:C.ch,background:C.gd,border:"none",padding:"8px 16px",cursor:"pointer"}}><Printer size={12}/> הדפס / PDF</button>
          <button onClick={onClose} style={{display:"flex",alignItems:"center",gap:6,fontFamily:C.heb,fontSize:11,color:"rgba(225,215,195,0.65)",background:"transparent",border:"0.5px solid rgba(225,215,195,0.15)",padding:"8px 12px",cursor:"pointer"}}><X size={12}/> סגור</button>
        </div>
      </div>
      <div style={{width:"100%",maxWidth:630,boxShadow:"0 24px 72px rgba(0,0,0,0.6)"}}><QuoteCert cfg={cfg} res={res} pieceImg={pieceImg}/></div>
    </div>
  );
}

/* ═══════════ STONE CERTIFICATE (Blue Nile, English LTR) ═══════════ */
function StoneCert({data}){
  const [imgs,setImgs]=useState([null,null,null]);
  const setImg=(i,v)=>setImgs(p=>{const n=[...p];n[i]=v;return n;});
  const isDia=data.type==="Diamond";
  const filledImgs=imgs.filter(Boolean).length;
  const insight=gemInsight(data);

  const DR=({l,v,accent})=>{
    if(v===null||v===undefined||v==="") return null;
    return(
      <div style={{display:"flex",borderBottom:`0.4px solid rgba(197,179,88,0.15)`,padding:"7px 0",alignItems:"flex-start"}}>
        <div style={{fontFamily:C.eng,fontSize:7,color:C.chl,letterSpacing:"0.6px",textTransform:"uppercase",width:"44%",paddingRight:10,paddingTop:accent?1:0,flexShrink:0}}>{l}</div>
        <div style={{fontFamily:accent?C.serif:C.eng,fontSize:accent?12:9,fontWeight:accent?300:400,color:accent?C.ch:C.chm,letterSpacing:accent?"0.04em":"0.01em",lineHeight:1.3}}>{v}</div>
      </div>
    );
  };

  return(
    <div dir="ltr" id="stone-cert-root" style={{fontFamily:C.eng,background:C.iv,WebkitPrintColorAdjust:"exact",printColorAdjust:"exact",maxWidth:580,margin:"0 auto",border:`1px solid rgba(197,179,88,0.38)`,aspectRatio:"1 / 1.414"}}>
      {/* Header */}
      <div style={{background:C.ch,padding:"14px 24px 12px",WebkitPrintColorAdjust:"exact",printColorAdjust:"exact"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <div style={{width:13,height:13,border:`0.8px solid ${C.gd}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:C.serif,fontSize:6,color:C.gd}}>L</span></div>
              <span style={{fontFamily:C.serif,fontSize:12,fontWeight:300,color:"#E8E4DC",letterSpacing:5}}>LESHEM.S</span>
            </div>
            <div style={{fontFamily:C.eng,fontSize:6,color:C.gd,letterSpacing:"2.5px",textTransform:"uppercase"}}>Gemological Report</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:C.eng,fontSize:6,color:"rgba(197,179,88,0.5)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>Report Number</div>
            <div style={{fontFamily:C.eng,fontSize:8.5,color:C.gd,letterSpacing:"1px"}}>{data.rptNum}</div>
            <div style={{fontFamily:C.eng,fontSize:6,color:"rgba(197,179,88,0.38)",marginTop:4}}>{fmtD()}</div>
          </div>
        </div>
      </div>
      <div style={{height:"1.5px",background:`linear-gradient(90deg,transparent,${C.gd},transparent)`}}/>
      <div style={{background:C.iv2,padding:"6px 24px",borderBottom:`0.5px solid rgba(197,179,88,0.22)`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:C.eng,fontSize:7,color:C.ch,letterSpacing:"2px",textTransform:"uppercase"}}>In-House Stone Certificate</div>
        <div style={{fontFamily:C.eng,fontSize:6.5,color:C.chl,letterSpacing:"1px"}}>{(data.type||"").toUpperCase()}</div>
      </div>
      {/* Body */}
      <div style={{display:"flex"}}>
        {/* LEFT: dynamic images */}
        <div style={{width:"38%",minWidth:"38%",padding:"14px 12px 14px 14px",borderRight:`0.5px solid rgba(197,179,88,0.18)`,display:"flex",flexDirection:"column",gap:7}}>
          {filledImgs===0?(
            <>
              <ImgDrop img={imgs[0]} onImg={v=>setImg(0,v)} h={120} label="Primary Image"/>
              <div style={{display:"flex",gap:6}}>
                <div style={{flex:1}}><ImgDrop img={imgs[1]} onImg={v=>setImg(1,v)} h={58} label="Side View" small/></div>
                <div style={{flex:1}}><ImgDrop img={imgs[2]} onImg={v=>setImg(2,v)} h={58} label="Detail" small/></div>
              </div>
            </>
          ):filledImgs===1?(
            <ImgDrop img={imgs[0]} onImg={v=>setImg(0,v)} h={190} label="Primary Image"/>
          ):filledImgs===2?(
            <>
              <ImgDrop img={imgs[0]} onImg={v=>setImg(0,v)} h={110} label="Primary Image"/>
              <ImgDrop img={imgs[1]} onImg={v=>setImg(1,v)} h={72} label="Side View"/>
            </>
          ):(
            <>
              <ImgDrop img={imgs[0]} onImg={v=>setImg(0,v)} h={100} label="Primary Image"/>
              <div style={{display:"flex",gap:6}}>
                <div style={{flex:1}}><ImgDrop img={imgs[1]} onImg={v=>setImg(1,v)} h={62} label="Side View" small/></div>
                <div style={{flex:1}}><ImgDrop img={imgs[2]} onImg={v=>setImg(2,v)} h={62} label="Detail" small/></div>
              </div>
            </>
          )}
          <div style={{padding:"5px 7px",background:C.iv2,border:`0.5px solid ${C.bl}`}}>
            <div style={{fontFamily:C.eng,fontSize:5.5,color:C.chl,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:1}}>SKU / ID</div>
            <div style={{fontFamily:C.eng,fontSize:8,color:C.ch,letterSpacing:"0.5px"}}>{data.sku}</div>
          </div>
        </div>
        {/* RIGHT: grade data */}
        <div style={{flex:1,padding:"14px 14px 14px 16px"}}>
          <div style={{fontFamily:C.eng,fontSize:5.5,color:C.gdm,letterSpacing:"2px",textTransform:"uppercase",marginBottom:8,borderBottom:`0.4px solid rgba(197,179,88,0.3)`,paddingBottom:5}}>Gemstone Information</div>
          <DR l="Report No." v={data.rptNum}/>
          <DR l="Date" v={fmtD()}/>
          <DR l="Gemstone Variety" v={data.variety||data.type}/>
          <DR l="Species" v={data.species||(SPECIES[data.type]||null)}/>
          <DR l="Color" v={data.color} accent/>
          <DR l="Shape" v={data.shape} accent/>
          <DR l="Carat Weight" v={data.ct?`${data.ct} ct`:null} accent/>
          <DR l="Measurements" v={data.measurements||null}/>
          <DR l="Treatment" v={data.treatment||null}/>
          {isDia&&data.color&&["D","E","F","G","H","I","J","K"].includes(data.color)&&(
            <div style={{marginTop:10}}>
              <div style={{fontFamily:C.eng,fontSize:5.5,color:C.chl,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:5}}>Color Scale</div>
              <div style={{display:"flex"}}>
                {["D","E","F","G","H","I","J","K"].map(g=>(
                  <div key={g} style={{flex:1,textAlign:"center"}}>
                    <div style={{height:5,background:g===data.color?C.gd:"rgba(54,69,79,0.12)",borderLeft:g!=="D"?"0.5px solid rgba(255,255,255,0.5)":"none"}}/>
                    <div style={{fontFamily:C.eng,fontSize:5.5,color:g===data.color?C.gdm:C.chx,marginTop:2,fontWeight:g===data.color?700:400}}>{g}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Gemological Insight */}
      {insight&&<>
        <div style={{height:"0.5px",background:`linear-gradient(90deg,transparent,rgba(197,179,88,0.3),transparent)`,margin:"0 14px"}}/>
        <div style={{padding:"8px 14px 9px"}}>
          <div style={{fontFamily:C.eng,fontSize:5.5,color:C.chl,letterSpacing:"2px",textTransform:"uppercase",marginBottom:5}}>Gemological Assessment</div>
          <div style={{fontFamily:C.serif,fontSize:7.5,fontStyle:"italic",color:C.chm,lineHeight:1.75}}>{insight}</div>
        </div>
      </>}
      {/* Comments */}
      <div style={{height:"0.5px",background:`linear-gradient(90deg,transparent,rgba(197,179,88,0.3),transparent)`,margin:"0 14px"}}/>
      <div style={{padding:"7px 14px 9px"}}>
        <div style={{fontFamily:C.eng,fontSize:5.5,color:C.chl,letterSpacing:"2px",textTransform:"uppercase",marginBottom:4}}>Comments</div>
        <div style={{fontFamily:C.serif,fontSize:7,fontStyle:"italic",color:C.chm,lineHeight:1.7}}>This report is an in-house assessment issued by LESHEM.S and does not substitute for a GIA or independent laboratory report.</div>
      </div>
      {/* Footer */}
      <div style={{background:C.iv2,borderTop:`0.5px solid rgba(197,179,88,0.22)`,padding:"10px 14px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div>
            <div style={{borderBottom:`0.5px solid ${C.chm}`,marginBottom:5,width:85,opacity:0.25}}/>
            <div style={{fontFamily:C.serif,fontSize:8.5,fontStyle:"italic",color:C.ch}}>Leshem Simon</div>
            <div style={{fontFamily:C.eng,fontSize:5.5,color:C.chl,letterSpacing:"0.8px",marginTop:1}}>Founder, Certified Diamond Grader & Expert Jeweler</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:C.eng,fontSize:6,color:C.chl,lineHeight:1.8,opacity:0.7}}>LESHEM.S Jewelry | Tuval St 23, Ramat Gan<br/>VAT ID: 046240016 | {data.rptNum}</div>
          </div>
        </div>
      </div>
      <div style={{height:"1.5px",background:`linear-gradient(90deg,transparent,${C.gd},transparent)`}}/>
    </div>
  );
}
function StoneCertModal({stone,onClose}){
  useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[onClose]);
  const data=useMemo(()=>{
    const d=new Date();
    return {sku:stone.sku,type:stone.type,shape:stone.shape,ct:stone.ct,color:stone.color,cla:stone.cla,
      variety:stone.type,species:SPECIES[stone.type]||"",measurements:"",treatment:"",
      rptNum:`LC-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}-${stone.sku}`};
  },[stone]);
  return(
    <div className="no-print" style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(20,30,36,0.93)",display:"flex",flexDirection:"column",alignItems:"center",overflowY:"auto",padding:"20px 16px 48px"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div dir="rtl" style={{width:"100%",maxWidth:600,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontFamily:C.heb,fontSize:9.5,color:"rgba(225,215,195,0.45)",letterSpacing:"0.1em",textTransform:"uppercase"}}>תעודת אבן</span>
          <span style={{fontFamily:C.heb,fontSize:9,color:"rgba(225,215,195,0.25)"}}>— {stone.nH}</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>window.print()} style={{display:"flex",alignItems:"center",gap:7,fontFamily:C.heb,fontSize:11,color:C.ch,background:C.gd,border:"none",padding:"8px 16px",cursor:"pointer"}}><Printer size={12}/> הדפס / PDF</button>
          <button onClick={onClose} style={{display:"flex",alignItems:"center",gap:6,fontFamily:C.heb,fontSize:11,color:"rgba(225,215,195,0.65)",background:"transparent",border:"0.5px solid rgba(225,215,195,0.15)",padding:"8px 12px",cursor:"pointer"}}><X size={12}/> סגור</button>
        </div>
      </div>
      <div style={{width:"100%",maxWidth:600,boxShadow:"0 24px 72px rgba(0,0,0,0.65)"}}><StoneCert data={data}/></div>
    </div>
  );
}

/* ═══════════ DATA ENTRY HUB ═══════════ */
function DataEntryHub({onAddStone,onAddComponent,onAddClientItem}){
  const [sub,setSub]=useState("stone");
  const [saved,setSaved]=useState(null);
  const toast=(t)=>{setSaved(t);setTimeout(()=>setSaved(null),2500);};

  const [sF,setSF]=useState({sku:"",type:"Diamond",shape:"Round",ct:"",color:"",cla:"",cost:"",supplier:"",purchaseDate:"",img:null});
  const sfA=(f,v)=>setSF(p=>({...p,[f]:v}));
  function saveStone(){
    if(!sF.sku||!sF.ct){return;}
    onAddStone({id:"u"+uid(),sku:sF.sku,nH:`${sF.type} ${sF.ct}ct`,nE:`${sF.shape} ${sF.type} ${sF.ct}ct`,
      type:sF.type,tH:sF.type,shape:sF.shape,sH:sF.shape,ct:parseFloat(sF.ct)||0,
      color:sF.color,cla:sF.cla,cost:parseFloat(sF.cost)||0,supplier:sF.supplier,purchaseDate:sF.purchaseDate,img:sF.img});
    setSF({sku:"",type:"Diamond",shape:"Round",ct:"",color:"",cla:"",cost:"",supplier:"",purchaseDate:"",img:null});
    toast("stone");
  }

  const [cF,setCF]=useState({name:"",material:"18K Yellow",type:"Chain",cost:"",supplier:"",stockQty:"",img:null});
  const sfB=(f,v)=>setCF(p=>({...p,[f]:v}));
  function saveComp(){
    if(!cF.name){return;}
    onAddComponent({id:"c"+uid(),...cF,cost:parseFloat(cF.cost)||0,stockQty:parseInt(cF.stockQty)||0});
    setCF({name:"",material:"18K Yellow",type:"Chain",cost:"",supplier:"",stockQty:"",img:null});
    toast("comp");
  }

  const [iF,setIF]=useState({client:"",desc:"",value:"",img:null});
  const sfC=(f,v)=>setIF(p=>({...p,[f]:v}));
  function saveIntake(){
    if(!iF.client){return;}
    onAddClientItem({id:"i"+uid(),...iF,value:parseFloat(iF.value)||0});
    setIF({client:"",desc:"",value:"",img:null});
    toast("intake");
  }

  const Tab=({id,icon:Icon,label})=>(
    <button onClick={()=>setSub(id)} style={{display:"flex",alignItems:"center",gap:7,fontFamily:C.heb,fontSize:12,padding:"9px 16px",cursor:"pointer",
      color:sub===id?C.ch:C.chl,background:sub===id?C.iv:C.iv2,
      border:`0.5px solid ${sub===id?C.blm:C.bl}`,borderBottom:sub===id?"none":`0.5px solid ${C.bl}`,transition:"all 0.12s"}}>
      <Icon size={13} strokeWidth={1.5}/>{label}
    </button>
  );
  const SaveBtn=({onClick,label})=>(
    <button onClick={onClick} style={{fontFamily:C.heb,fontSize:12,color:C.ch,background:"rgba(197,179,88,0.15)",border:`0.5px solid rgba(197,179,88,0.5)`,padding:"10px",cursor:"pointer"}}>{label}</button>
  );
  const Divider=()=><div style={{height:"0.5px",background:C.bl,margin:"4px 0"}}/>;

  return(
    <div style={{height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"13px 22px 0",background:C.iv,borderBottom:`0.5px solid ${C.bl}`}}>
        <div style={{display:"flex",gap:0}}>
          <Tab id="stone" icon={Gem} label="אבן חדשה"/>
          <Tab id="comp"  icon={Package} label="רכיבים"/>
          <Tab id="intake" icon={ClipboardList} label="קליטת פריט"/>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 22px 40px"}}>
        {saved&&(
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",border:`0.5px solid rgba(90,160,100,0.4)`,background:"rgba(90,160,100,0.08)",marginBottom:14}}>
            <Check size={13} color="#4a8e56"/>
            <span style={{fontFamily:C.heb,fontSize:11,color:"#4a8e56"}}>
              {saved==="stone"?"אבן נוספה למאגר":saved==="comp"?"רכיב נשמר":"פריט לקוח נשמר"}
            </span>
          </div>
        )}

        {sub==="stone"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontFamily:C.heb,fontSize:14,color:C.ch,marginBottom:4}}>הוספת אבן למאגר</div>
            <div style={{display:"flex",gap:10}}>
              <Inp label="SKU *" half type="text" placeholder="DIA-RND-XXX" value={sF.sku} onChange={e=>sfA("sku",e.target.value)}/>
              <Sel label="סוג *" half opts={STYPES} value={sF.type} onChange={e=>sfA("type",e.target.value)}/>
            </div>
            <div style={{display:"flex",gap:10}}>
              <Inp label="צורה" half type="text" placeholder="Round, Oval..." value={sF.shape} onChange={e=>sfA("shape",e.target.value)}/>
              <Inp label="קרט *" half type="number" min="0.01" step="0.01" value={sF.ct} onChange={e=>sfA("ct",e.target.value)}/>
            </div>
            <div style={{display:"flex",gap:10}}>
              <Inp label="צבע" half type="text" placeholder="G, Fancy Vivid Pink..." value={sF.color} onChange={e=>sfA("color",e.target.value)}/>
              <Inp label="ניקיון" half type="text" placeholder="VS1, IF..." value={sF.cla} onChange={e=>sfA("cla",e.target.value)}/>
            </div>
            <Divider/>
            <div style={{display:"flex",gap:10}}>
              <Inp label="ספק" half type="text" placeholder="שם הספק" value={sF.supplier} onChange={e=>sfA("supplier",e.target.value)}/>
              <Inp label="תאריך קנייה" half type="date" value={sF.purchaseDate} onChange={e=>sfA("purchaseDate",e.target.value)}/>
            </div>
            <Inp label="עלות — מחיר קנייה ($) *" type="number" min="0" placeholder="0" value={sF.cost} onChange={e=>sfA("cost",e.target.value)}/>
            <ImgDrop img={sF.img} onImg={v=>sfA("img",v)} h={90} label="תמונת אבן"/>
            <SaveBtn onClick={saveStone} label="שמור אבן למאגר"/>
            <div style={{fontFamily:C.heb,fontSize:9,color:C.chx}}>* שדות חובה</div>
          </div>
        )}

        {sub==="comp"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontFamily:C.heb,fontSize:14,color:C.ch,marginBottom:4}}>הוספת רכיב / שרשראה</div>
            <Inp label="שם פריט *" type="text" placeholder="שרשרת זהב 45סמ..." value={cF.name} onChange={e=>sfB("name",e.target.value)}/>
            <div style={{display:"flex",gap:10}}>
              <Sel label="חומר" half opts={METALS} value={cF.material} onChange={e=>sfB("material",e.target.value)}/>
              <Sel label="סוג" half opts={["Chain","נעילה","Setting","Finding","Other"]} value={cF.type} onChange={e=>sfB("type",e.target.value)}/>
            </div>
            <Divider/>
            <div style={{display:"flex",gap:10}}>
              <Inp label="ספק" half type="text" placeholder="שם הספק" value={cF.supplier} onChange={e=>sfB("supplier",e.target.value)}/>
              <Inp label="כמות במלאי" half type="number" min="0" step="1" placeholder="0" value={cF.stockQty} onChange={e=>sfB("stockQty",e.target.value)}/>
            </div>
            <Inp label="עלות — מחיר קנייה ($)" type="number" min="0" placeholder="0" value={cF.cost} onChange={e=>sfB("cost",e.target.value)}/>
            <ImgDrop img={cF.img} onImg={v=>sfB("img",v)} h={90} label="תמונה"/>
            <SaveBtn onClick={saveComp} label="שמור רכיב"/>
            <div style={{fontFamily:C.heb,fontSize:9,color:C.chx}}>* שדות חובה</div>
          </div>
        )}

        {sub==="intake"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontFamily:C.heb,fontSize:14,color:C.ch,marginBottom:4}}>קליטת פריט לקוח</div>
            <Inp label="שם לקוח *" type="text" placeholder="שם מלא" value={iF.client} onChange={e=>sfC("client",e.target.value)}/>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              <EB>תיאור הפריט</EB>
              <textarea style={{fontFamily:C.heb,fontSize:12,color:C.ch,background:C.iv2,border:`0.5px solid ${C.blm}`,padding:"8px 10px",outline:"none",resize:"vertical",lineHeight:1.55,minHeight:60}}
                placeholder="תאר את התכשיט, סוג, חומר..." rows={3} value={iF.desc} onChange={e=>sfC("desc",e.target.value)}/>
            </div>
            <Inp label="שווי משוער ($)" type="number" min="0" placeholder="0" value={iF.value} onChange={e=>sfC("value",e.target.value)}/>
            <ImgDrop img={iF.img} onImg={v=>sfC("img",v)} h={90} label="תמונת פריט"/>
            <SaveBtn onClick={saveIntake} label="שמור פריט לקוח"/>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════ MANUAL CERT GENERATOR ═══════════ */
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
      <div style={{padding:"13px 22px 11px",borderBottom:`0.5px solid ${C.bl}`,background:C.iv}}>
        <div style={{fontFamily:C.heb,fontSize:14,color:C.ch,marginBottom:10}}>יצירת תעודה ידנית</div>
        <div style={{display:"flex",border:`0.5px solid ${C.blm}`,width:300}}>
          {[["quote","הצעת מחיר"],["stone","תעודת אבן"]].map(([m,l])=>(
            <button key={m} onClick={()=>setMode(m)} style={{flex:1,fontFamily:C.heb,fontSize:12,cursor:"pointer",color:mode===m?C.iv:C.chl,background:mode===m?C.ch:"transparent",border:"none",padding:"8px 0"}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"18px 22px 40px"}}>
        {mode==="quote"&&(
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            <Inp label="שם לקוח" type="text" placeholder="Client Name" value={qd.clientName} onChange={e=>sfQ("clientName",e.target.value)}/>
            <Inp label="תיאור התכשיט" type="text" placeholder="Piece description" value={qd.quoteName} onChange={e=>sfQ("quoteName",e.target.value)}/>
            <div style={{display:"flex",gap:10}}>
              <Sel label="מתכת" half opts={METALS} value={qd.metal} onChange={e=>sfQ("metal",e.target.value)}/>
              <Inp label="משקל (g)" half type="number" min="0.1" placeholder="g" value={qd.grams} onChange={e=>sfQ("grams",e.target.value)}/>
            </div>
            <div style={{display:"flex",gap:10}}>
              <Sel label="סוג אבן" half opts={STYPES} value={qd.centerType} onChange={e=>sfQ("centerType",e.target.value)}/>
              <Inp label="קרט" half type="number" step="0.01" value={qd.centerCt} onChange={e=>sfQ("centerCt",e.target.value)}/>
            </div>
            {qd.centerType==="Diamond"&&<div style={{display:"flex",gap:10}}>
              <Inp label="צבע" half type="text" placeholder="G, Fancy Vivid Pink..." value={qd.centerColor} onChange={e=>sfQ("centerColor",e.target.value)}/>
              <Sel label="ניקיון" half opts={Object.keys(KFACT)} value={qd.centerClarity} onChange={e=>sfQ("centerClarity",e.target.value)}/>
            </div>}
            <Inp label="מחיר סופי ($) — עקיפה ידנית" type="number" min="0" placeholder="השאר ריק לחישוב אוטומטי" value={qd.riOv} onChange={e=>sfQ("riOv",e.target.value)}/>
            {qRes&&<div style={{fontFamily:C.heb,fontSize:11,color:C.ch,padding:"9px 12px",border:`0.5px solid rgba(197,179,88,0.4)`,background:C.gds,display:"flex",justifyContent:"space-between"}}>
              <span>סה"כ משוער:</span><strong style={{color:C.gdm,fontFamily:C.serif,fontSize:13}}>{usd(qRes.ri)}</strong>
            </div>}
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              <EB>הערות</EB>
              <textarea style={{fontFamily:C.heb,fontSize:11.5,color:C.ch,background:C.iv2,border:`0.5px solid ${C.blm}`,padding:"8px 10px",outline:"none",resize:"vertical",lineHeight:1.6,minHeight:48}} rows={3} value={qd.notes} onChange={e=>sfQ("notes",e.target.value)}/>
            </div>
            <button onClick={()=>setModal(true)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:C.heb,fontSize:12,color:C.ch,background:"rgba(197,179,88,0.15)",border:`0.5px solid rgba(197,179,88,0.5)`,padding:"11px",cursor:"pointer"}}>
              <Eye size={14}/> תצוגה מקדימה — הצעת מחיר
            </button>
          </div>
        )}
        {mode==="stone"&&(
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            <Inp label="SKU / Report No." type="text" placeholder="LAB-001" value={sd.sku} onChange={e=>sfS("sku",e.target.value)}/>
            <div style={{display:"flex",gap:10}}>
              <Inp label="Gemstone Variety" half type="text" placeholder="Diamond, Ruby..." value={sd.variety} onChange={e=>sfS("variety",e.target.value)}/>
              <Inp label="Species" half type="text" placeholder="Natural Diamond..." value={sd.species} onChange={e=>sfS("species",e.target.value)}/>
            </div>
            <div style={{display:"flex",gap:10}}>
              <Inp label="Color" half type="text" placeholder="G, Royal Blue..." value={sd.color} onChange={e=>sfS("color",e.target.value)}/>
              <Inp label="Shape" half type="text" placeholder="Round Brilliant..." value={sd.shape} onChange={e=>sfS("shape",e.target.value)}/>
            </div>
            <div style={{display:"flex",gap:10}}>
              <Inp label="Carat Weight" half type="number" step="0.01" value={sd.ct} onChange={e=>sfS("ct",e.target.value)}/>
              <Inp label="Measurements (mm)" half type="text" placeholder="7.8×7.8×4.8" value={sd.measurements} onChange={e=>sfS("measurements",e.target.value)}/>
            </div>
            <Inp label="Treatment" type="text" placeholder="None Detected" value={sd.treatment} onChange={e=>sfS("treatment",e.target.value)}/>
            <div style={{fontFamily:C.heb,fontSize:9.5,color:C.chl,padding:"7px 0"}}>תמונות ניתן להעלות בתוך תצוגת התעודה לאחר לחיצה על "תצוגה מקדימה"</div>
            <button onClick={()=>setModal(true)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:C.heb,fontSize:12,color:C.ch,background:"rgba(197,179,88,0.15)",border:`0.5px solid rgba(197,179,88,0.5)`,padding:"11px",cursor:"pointer"}}>
              <Eye size={14}/> תצוגה מקדימה — תעודת אבן
            </button>
          </div>
        )}
      </div>
      {modal&&mode==="quote"&&<QuoteCertModal cfg={qd} res={qRes} pieceImg={null} onClose={()=>setModal(false)}/>}
      {modal&&mode==="stone"&&(
        <div className="no-print" style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(20,30,36,0.93)",display:"flex",flexDirection:"column",alignItems:"center",overflowY:"auto",padding:"20px 16px 48px"}} onClick={e=>{if(e.target===e.currentTarget)setModal(false);}}>
          <div dir="rtl" style={{width:"100%",maxWidth:600,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontFamily:C.heb,fontSize:9.5,color:"rgba(225,215,195,0.45)",letterSpacing:"0.1em",textTransform:"uppercase"}}>תעודת אבן</span>
              <span style={{fontFamily:C.heb,fontSize:9,color:"rgba(225,215,195,0.25)"}}>— {stone.nH}</span>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>window.print()} style={{display:"flex",alignItems:"center",gap:7,fontFamily:C.heb,fontSize:11,color:C.ch,background:C.gd,border:"none",padding:"8px 16px",cursor:"pointer"}}><Printer size={12}/> הדפס / PDF</button>
              <button onClick={()=>setModal(false)} style={{display:"flex",alignItems:"center",gap:6,fontFamily:C.heb,fontSize:11,color:"rgba(225,215,195,0.65)",background:"transparent",border:"0.5px solid rgba(225,215,195,0.15)",padding:"8px 12px",cursor:"pointer"}}><X size={12}/> סגור</button>
            </div>
          </div>
          <div style={{width:"100%",maxWidth:600,boxShadow:"0 24px 72px rgba(0,0,0,0.65)"}}><StoneCert data={stoneData}/></div>
        </div>
      )}
    </div>
  );
}

/* ═══════════ STONE CARD ═══════════ */
function StoneCard({stone,score,picked,onPick,onCert,onDragStart,grid}){
  const [hov,setHov]=useState(false);
  const b=score>=30?sBadge(score):null;
  const CBtn=({sm})=>(
    <button onClick={e=>{e.stopPropagation();onCert(stone);}}
      style={{display:"flex",alignItems:"center",gap:sm?3:4,fontFamily:C.heb,fontSize:sm?8:9.5,cursor:"pointer",color:C.chl,background:"transparent",border:`0.5px solid ${C.bl}`,padding:sm?"2px 6px":"3px 9px",whiteSpace:"nowrap"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blm;e.currentTarget.style.color=C.ch;}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.bl;e.currentTarget.style.color=C.chl;}}>
      <FileCheck size={sm?8:10}/> תעודה
    </button>
  );
  if(grid) return(
    <div draggable onDragStart={e=>onDragStart(stone,e)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{border:`0.5px solid ${picked?"rgba(197,179,88,0.55)":hov?C.blm:C.bl}`,background:picked?C.gds:C.iv,cursor:"grab",display:"flex",flexDirection:"column",transition:"border-color 0.12s"}}>
      <div style={{height:75,background:C.iv2,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",borderBottom:`0.5px solid ${C.bl}`,overflow:"hidden"}}>
        {stone.img?<img src={stone.img} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <div style={{width:22,height:22,border:`0.5px solid ${C.blm}`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}><Gem size={10} color={C.chx} strokeWidth={1.2}/></div>
            <span style={{fontFamily:C.eng,fontSize:6.5,color:C.chx,letterSpacing:"1.5px",textTransform:"uppercase"}}>{stone.type}</span>
          </div>
        </>}
        {score>0&&b&&<span style={{position:"absolute",top:4,right:4,fontFamily:C.heb,fontSize:7,padding:"2px 5px",background:b.bg,color:b.c}}>{b.l}</span>}
        <div style={{position:"absolute",top:3,left:3,color:hov?C.chx:C.iv3}}><GripVertical size={10}/></div>
      </div>
      <div style={{padding:"8px 9px",flex:1,display:"flex",flexDirection:"column",gap:4}}>
        {score>0&&<div style={{height:2,background:C.iv3,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:score+"%",background:score>=80?C.gd:score>=60?"#6aad76":C.chx}}/></div>}
        <div style={{fontFamily:C.heb,fontSize:10,color:C.ch,lineHeight:1.3}}>{stone.nH}</div>
        <div style={{fontFamily:C.eng,fontSize:7,color:C.chl}}>{stone.sku} · {stone.ct}ct</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"auto",paddingTop:4,gap:4,flexWrap:"wrap"}}>
          <CBtn sm/>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <span style={{fontFamily:C.serif,fontSize:11,color:C.gdm}}>{usd(stone.cost)}</span>
            <button onClick={()=>onPick(stone)} style={{display:"flex",alignItems:"center",gap:2,fontFamily:C.heb,fontSize:9,cursor:"pointer",color:picked?C.chl:C.ch,background:"transparent",border:`0.5px solid ${picked?C.blm:"rgba(197,179,88,0.5)"}`,padding:"3px 7px"}}>
              {picked?<><Minus size={8}/>בחרת</>:<><Plus size={8}/>בחר</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  return(
    <div draggable onDragStart={e=>onDragStart(stone,e)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{border:`0.5px solid ${picked?"rgba(197,179,88,0.55)":hov?C.blm:C.bl}`,padding:"10px 12px 10px 18px",marginBottom:7,background:picked?C.gds:C.iv,cursor:"grab",position:"relative",transition:"border-color 0.12s"}}>
      <div style={{position:"absolute",top:"50%",left:4,transform:"translateY(-50%)",color:hov?C.chx:C.iv3}}><GripVertical size={11}/></div>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <div style={{width:38,height:38,minWidth:38,background:C.iv2,border:`0.5px solid ${C.bl}`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {stone.img?<img src={stone.img} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<Gem size={13} color={C.chx} strokeWidth={1.2}/>}
        </div>
        <div style={{flex:1}}>
          {score>0&&<div style={{height:2,background:C.iv3,borderRadius:2,overflow:"hidden",marginBottom:4}}><div style={{height:"100%",width:score+"%",background:score>=80?C.gd:score>=60?"#6aad76":C.chx}}/></div>}
          {score>0&&b&&<span style={{fontFamily:C.heb,fontSize:8,padding:"1px 5px",background:b.bg,color:b.c,display:"inline-block",marginBottom:2}}>{b.l}</span>}
          <div style={{fontFamily:C.heb,fontSize:11.5,color:C.ch,marginBottom:2}}>{stone.nH}</div>
          <div style={{fontFamily:C.eng,fontSize:7.5,color:C.chl}}>{stone.sku} · {stone.ct}ct · {stone.sH} · {stone.tH==="יהלום"?`${stone.color} / ${stone.cla}`:stone.color}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
          <div style={{fontFamily:C.serif,fontSize:12,color:C.gdm,whiteSpace:"nowrap"}}>{usd(stone.cost)}</div>
          <div style={{display:"flex",gap:5}}>
            <CBtn/>
            <button onClick={()=>onPick(stone)} style={{display:"flex",alignItems:"center",gap:3,fontFamily:C.heb,fontSize:9.5,cursor:"pointer",color:picked?C.chl:C.ch,background:"transparent",border:`0.5px solid ${picked?C.blm:"rgba(197,179,88,0.5)"}`,padding:"3px 9px"}}>
              {picked?<><Minus size={9}/>בחרת</>:<><Plus size={9}/>בחר</>}
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
  const [certStone,setCertStone]=useState(null);
  const sentinel=useRef();
  const TFS=[["הכול","הכול"],["Diamond","יהלום"],["Sapphire","ספיר"],["Ruby","רובי"],["Emerald","אמרלד"],["Alexandrite","אלכסנדריט"]];
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
      <div style={{padding:"12px 20px 10px",borderBottom:`0.5px solid ${C.bl}`,background:C.iv}}>
        <div style={{display:"flex",gap:9,marginBottom:9}}>
          <div style={{position:"relative",flex:1}}>
            <Search size={12} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",color:C.chl}}/>
            <input style={{fontFamily:C.heb,fontSize:12.5,color:C.ch,background:C.iv2,border:`0.5px solid ${C.blm}`,padding:"8px 30px 8px 10px",outline:"none",width:"100%"}} placeholder="חיפוש לפי שם, SKU, סוג…" value={q} onChange={e=>setQ(e.target.value)}/>
          </div>
          <div style={{display:"flex",border:`0.5px solid ${C.blm}`}}>
            {[["list",<List size={13}/>],["grid",<LayoutGrid size={13}/>]].map(([m,icon])=>(
              <button key={m} onClick={()=>setVM(m)} style={{width:33,display:"flex",alignItems:"center",justifyContent:"center",background:vm===m?C.ch:"transparent",border:"none",cursor:"pointer",color:vm===m?C.iv:C.chl}}>{icon}</button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:quoteStone?6:0}}>
          {TFS.map(([v,l])=>(
            <button key={v} onClick={()=>setTF(v)} style={{fontFamily:C.heb,fontSize:10,cursor:"pointer",color:tf===v?C.iv:C.chm,background:tf===v?C.ch:"transparent",border:`0.5px solid ${tf===v?C.ch:C.blm}`,padding:"4px 11px"}}>{l}</button>
          ))}
        </div>
        {quoteStone&&(
          <button onClick={()=>setSM(v=>!v)} style={{display:"flex",alignItems:"center",gap:5,fontFamily:C.heb,fontSize:10,cursor:"pointer",color:showM?C.ch:"rgba(197,179,88,0.9)",background:showM?"rgba(197,179,88,0.14)":"transparent",border:`0.5px solid ${showM?"rgba(197,179,88,0.48)":C.blm}`,padding:"4px 11px",marginTop:6}}>
            <Star size={10} fill={showM?C.gdm:"none"} color={showM?C.gdm:C.chm}/> התאמות: {quoteStone.nH}
          </button>
        )}
      </div>
      {quoteStone&&topM.length>0&&!showM&&(
        <div style={{padding:"8px 20px",background:"rgba(197,179,88,0.07)",borderBottom:`0.5px solid rgba(197,179,88,0.18)`}}>
          <EB s={{fontSize:7.5,marginBottom:5,color:C.gdm}}>אבנים תואמות להשלמת סט</EB>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {topM.map(s=>(<div key={s.id} onClick={()=>onPickStone(s)} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 9px",border:`0.5px solid rgba(197,179,88,0.35)`,background:pickedId===s.id?C.gds:C.iv,cursor:"pointer"}}>
              <span style={{fontFamily:C.heb,fontSize:10,color:C.ch}}>{s.nH}</span>
              <span style={{fontFamily:C.eng,fontSize:7.5,color:C.gdm,border:`0.5px solid rgba(197,179,88,0.35)`,padding:"1px 4px"}}>{s.score}</span>
            </div>))}
          </div>
        </div>
      )}
      <div style={{flex:1,overflowY:"auto",padding:"11px 20px"}}>
        <EB s={{marginBottom:8}}>{filtered.length} אבנים {filtered.length!==stones.length&&`(מתוך ${stones.length})`}</EB>
        {vm==="list"
          ?filtered.slice(0,visible).map(s=><StoneCard key={s.id} stone={s} score={quoteStone&&s.score>0?s.score:0} picked={pickedId===s.id} onPick={onPickStone} onCert={setCertStone} onDragStart={drag} grid={false}/>)
          :<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9}}>{filtered.slice(0,visible).map(s=><StoneCard key={s.id} stone={s} score={quoteStone&&s.score>0?s.score:0} picked={pickedId===s.id} onPick={onPickStone} onCert={setCertStone} onDragStart={drag} grid={true}/>)}</div>
        }
        {visible<filtered.length&&<div ref={sentinel} style={{height:24,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:C.heb,fontSize:10,color:C.chx}}>טוען…</div>}
        {filtered.length===0&&<div style={{textAlign:"center",padding:"40px 20px",fontFamily:C.heb,fontSize:12,color:C.chx}}>לא נמצאו אבנים</div>}
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
    return(<div style={{display:"flex",flexDirection:"column",gap:9}}>
      <div style={{display:"flex",border:`0.5px solid ${C.blm}`}}>
        {[["virtual","הערכה"],["real","מלאי"]].map(([m,l])=>(
          <button key={m} onClick={()=>{sf(modeF,m);if(m==="virtual")sf(stoneF,null);}}
            style={{flex:1,fontFamily:C.heb,fontSize:10.5,cursor:"pointer",color:mode===m?C.iv:C.chl,background:mode===m?C.ch:"transparent",border:"none",padding:"6px 0"}}>{l}</button>
        ))}
      </div>
      {mode==="virtual"?(
        <>
          <div style={{display:"flex",gap:9}}>
            <Sel label="סוג" half opts={STYPES} value={cfg[typeF]} onChange={e=>sf(typeF,e.target.value)}/>
            <Sel label="הגדרה" half opts={SET_ENG} value={cfg[setF]} onChange={e=>sf(setF,e.target.value)} sx={{border:`0.5px solid rgba(197,179,88,0.35)`,background:"rgba(197,179,88,0.05)"}}/>
          </div>
          <div style={{display:"flex",gap:9}}>
            <Inp label="קרט/אבן" half type="number" min="0.01" step="0.01" value={cfg[ctF]} onChange={e=>sf(ctF,e.target.value)}/>
            <Inp label="כמות" half type="number" min="0" step="1" value={cfg[countF]} onChange={e=>sf(countF,e.target.value)}/>
          </div>
          <Inp label="עלות כוללת ($)" type="number" min="0" placeholder="הערכה אוטומטית" value={cfg[manualF]} onChange={e=>sf(manualF,e.target.value)}/>
          {(parseInt(cfg[countF])||0)>0&&<div style={{fontFamily:C.heb,fontSize:10,color:C.chl,padding:"6px 10px",border:`0.5px solid ${C.bl}`,background:"rgba(197,179,88,0.05)",display:"flex",justifyContent:"space-between"}}>
            <span>הערכה:</span><strong style={{color:C.gdm}}>{usd(calcSS(cfg[typeF],cfg[ctF],cfg[countF],cfg[manualF],"virtual",null))}</strong>
          </div>}
        </>
      ):(
        real?(
          <div style={{border:`0.5px solid rgba(197,179,88,0.45)`,padding:"9px 12px",background:C.gds,position:"relative"}}>
            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}><Check size={10} color={C.gdm}/><span style={{fontFamily:C.heb,fontSize:11.5,color:C.ch}}>{real.nH}</span></div>
            <div style={{fontFamily:C.eng,fontSize:8,color:C.chl}}>{real.sku} · {real.ct}ct · {usd(real.cost)}</div>
            <button onClick={()=>sf(stoneF,null)} style={{position:"absolute",top:6,right:8,background:"transparent",border:"none",cursor:"pointer",color:C.chl}}><X size={10}/></button>
          </div>
        ):(
          <div onDragOver={e=>{e.preventDefault();setDh(true);}} onDragLeave={()=>setDh(false)}
            onDrop={e=>{e.preventDefault();setDh(false);const id=e.dataTransfer.getData("stoneId");const s=stones.find(x=>x.id===id);if(s)sf(stoneF,s);}}
            style={{border:`0.5px dashed ${dh?"rgba(197,179,88,0.8)":C.blm}`,background:dh?C.gds:"transparent",padding:"9px 12px",display:"flex",alignItems:"center",gap:8,transition:"all 0.14s",cursor:"default"}}>
            <GripVertical size={12} color={dh?C.gdm:C.chx}/>
            <span style={{fontFamily:C.heb,fontSize:10.5,color:dh?C.gdm:C.chx}}>גרור אבן/חלוקה מהמאגר</span>
          </div>
        )
      )}
    </div>);
  }

  return(
    <div style={{height:"100%",display:"grid",gridTemplateColumns:"1fr 1fr",overflow:"hidden"}}>
      {/* ── Column A ── */}
      <div style={{borderLeft:`0.5px solid ${C.bl}`,overflowY:"auto",padding:"14px 16px 40px"}}>
        {/* Center stone drag zone */}
        <div onDragOver={e=>{e.preventDefault();setMD(true);}} onDragLeave={()=>setMD(false)}
          onDrop={e=>{e.preventDefault();setMD(false);const id=e.dataTransfer.getData("stoneId");const s=stones.find(x=>x.id===id);if(s)setCfg(p=>({...p,stoneMode:"real",stone:s}));}}
          style={{border:`0.5px dashed ${mainDrop?"rgba(197,179,88,0.8)":C.blm}`,background:mainDrop?C.gds:"transparent",padding:"9px 13px",marginBottom:11,display:"flex",alignItems:"center",gap:10,transition:"all 0.15s"}}>
          <GripVertical size={13} color={mainDrop?C.gdm:C.chx}/>
          <span style={{fontFamily:C.heb,fontSize:11,color:mainDrop?C.gdm:C.chx}}>
            {cfg.stone&&cfg.stoneMode==="real"?`✓ ${cfg.stone.nH}`:"גרור אבן מרכזית מהמאגר לכאן"}
          </span>
          {cfg.stone&&cfg.stoneMode==="real"&&<button onClick={()=>setCfg(p=>({...p,stone:null,stoneMode:"virtual"}))} style={{marginRight:"auto",background:"transparent",border:"none",cursor:"pointer",color:C.chl}}><X size={11}/></button>}
        </div>

        <Pnl num="01" title="מתכת ועבודה">
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Sel label="מתכת" opts={METALS} value={cfg.metal} onChange={e=>sf("metal",e.target.value)}/>
            <div style={{display:"flex",gap:9}}>
              <Inp label="משקל (g)" half type="number" min="0.1" step="0.1" placeholder="g" value={cfg.grams} onChange={e=>sf("grams",e.target.value)}/>
              <Inp label="ספוט ($/g)" half type="number" value={MSPOT[cfg.metal]??62.4} readOnly sx={{background:"rgba(197,179,88,0.06)",border:`0.5px solid rgba(197,179,88,0.32)`}}/>
            </div>
            <Sel label="שיטת ייצור" opts={CASTS} value={cfg.cast} onChange={e=>sf("cast",e.target.value)}/>
            <div><EB s={{marginBottom:7}}>מורכבות</EB>
              <Pills opts={Object.keys(CMULT).map(k=>[k,CHEB[k]])} val={cfg.cmplx} onChange={v=>sf("cmplx",v)}/>
            </div>
          </div>
        </Pnl>

        <Pnl num="02" title="אבן מרכזית">
          <div style={{display:"flex",border:`0.5px solid ${C.blm}`,marginBottom:11}}>
            {[["virtual","הערכה"],["real","מלאי"]].map(([m,l])=>(
              <button key={m} onClick={()=>sf("stoneMode",m)} style={{flex:1,fontFamily:C.heb,fontSize:11,cursor:"pointer",color:cfg.stoneMode===m?C.iv:C.chl,background:cfg.stoneMode===m?C.ch:"transparent",border:"none",padding:"7px 0"}}>{l}</button>
            ))}
          </div>
          {cfg.stoneMode==="virtual"?(
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              <div style={{display:"flex",gap:9}}>
                <Sel label="סוג" half opts={STYPES} value={cfg.centerType} onChange={e=>sf("centerType",e.target.value)}/>
                <Sel label="הגדרה" half opts={SET_ENG} value={cfg.centerSetting} onChange={e=>sf("centerSetting",e.target.value)} sx={{border:`0.5px solid rgba(197,179,88,0.35)`,background:"rgba(197,179,88,0.05)"}}/>
              </div>
              <div style={{display:"flex",gap:9}}>
                <Inp label="קרט" half type="number" min="0.01" step="0.01" value={cfg.centerCt} onChange={e=>sf("centerCt",e.target.value)}/>
                <Inp label="עלות ($)" half type="number" min="0" placeholder="אוטומטי" value={cfg.centerManual} onChange={e=>sf("centerManual",e.target.value)}/>
              </div>
              {cfg.centerType==="Diamond"&&<div style={{display:"flex",gap:9}}>
                <Inp label="צבע (D-Z / Fancy)" half type="text" placeholder="G, Fancy Vivid Pink..." value={cfg.centerColor} onChange={e=>sf("centerColor",e.target.value)}/>
                <Sel label="ניקיון" half opts={Object.keys(KFACT)} value={cfg.centerClarity} onChange={e=>sf("centerClarity",e.target.value)}/>
              </div>}
              <div style={{fontFamily:C.heb,fontSize:10,color:C.chl,padding:"6px 10px",border:`0.5px solid ${C.bl}`,background:"rgba(197,179,88,0.05)",display:"flex",justifyContent:"space-between"}}>
                <span>הערכה:</span><strong style={{color:C.gdm}}>{usd(calcCenter(cfg))}</strong>
              </div>
            </div>
          ):(cfg.stone?(
            <div style={{border:`0.5px solid rgba(197,179,88,0.45)`,padding:"10px 12px",background:C.gds,position:"relative"}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}><Check size={10} color={C.gdm}/><span style={{fontFamily:C.heb,fontSize:12,color:C.ch}}>{cfg.stone.nH}</span></div>
              <div style={{fontFamily:C.eng,fontSize:8.5,color:C.chl,marginBottom:7}}>{cfg.stone.sku} · {cfg.stone.ct}ct · {usd(cfg.stone.cost)}</div>
              <Sel label="הגדרה" opts={SET_ENG} value={cfg.centerSetting} onChange={e=>sf("centerSetting",e.target.value)} sx={{border:`0.5px solid rgba(197,179,88,0.35)`,background:"rgba(197,179,88,0.05)"}}/>
              <button onClick={()=>sf("stone",null)} style={{position:"absolute",top:7,right:9,background:"transparent",border:"none",cursor:"pointer",color:C.chl}}><X size={11}/></button>
            </div>
          ):(
            <div style={{fontFamily:C.heb,fontSize:11,color:C.chx,textAlign:"center",padding:"17px 10px",border:`0.5px dashed ${C.blm}`}}>גרור אבן מהמאגר</div>
          ))}
        </Pnl>

        <Pnl num="03" title="אבני צד 1">
          <SsBlock typeF="ss1Type" ctF="ss1Ct" countF="ss1Count" manualF="ss1Manual" setF="ss1Setting" modeF="ss1Mode" stoneF="ss1Stone"/>
        </Pnl>
        <Pnl num="04" title="אבני צד 2">
          <SsBlock typeF="ss2Type" ctF="ss2Ct" countF="ss2Count" manualF="ss2Manual" setF="ss2Setting" modeF="ss2Mode" stoneF="ss2Stone"/>
        </Pnl>

        <Pnl num="05" title="רכיבים ושרשראות">
          {(cfg.selectedComponents||[]).length===0?(
            <div style={{fontFamily:C.heb,fontSize:11,color:C.chx,padding:"10px 0",textAlign:"center"}}>אין רכיבים נבחרים</div>
          ):(cfg.selectedComponents).map(c=>(
            <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`0.5px solid rgba(54,69,79,0.06)`}}>
              <div><div style={{fontFamily:C.heb,fontSize:11,color:C.ch}}>{c.name}</div><div style={{fontFamily:C.eng,fontSize:8,color:C.chl}}>{c.material} · {c.type}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontFamily:C.serif,fontSize:12,color:C.gdm}}>{usd(c.cost)}</span>
                <button onClick={()=>sf("selectedComponents",cfg.selectedComponents.filter(x=>x.id!==c.id))} style={{background:"transparent",border:"none",cursor:"pointer",color:C.chl}}><X size={10}/></button>
              </div>
            </div>
          ))}
          {(components||[]).filter(c=>!cfg.selectedComponents.find(x=>x.id===c.id)).length>0&&(
            <div style={{marginTop:10}}>
              <EB s={{marginBottom:7}}>הוסף רכיב</EB>
              {(components||[]).filter(c=>!cfg.selectedComponents.find(x=>x.id===c.id)).map(c=>(
                <div key={c.id} onClick={()=>sf("selectedComponents",[...cfg.selectedComponents,c])}
                  style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",border:`0.5px solid ${C.bl}`,marginBottom:5,cursor:"pointer",background:C.iv2}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.iv3}
                  onMouseLeave={e=>e.currentTarget.style.background=C.iv2}>
                  <div><div style={{fontFamily:C.heb,fontSize:11,color:C.ch}}>{c.name}</div><div style={{fontFamily:C.eng,fontSize:7.5,color:C.chl}}>{c.material} · {c.type}</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontFamily:C.serif,fontSize:11,color:C.gdm}}>{usd(c.cost)}</span><Plus size={11} color={C.gdm}/></div>
                </div>
              ))}
            </div>
          )}
          {(components||[]).length===0&&<div style={{fontFamily:C.heb,fontSize:10,color:C.chx,marginTop:8}}>הוסף רכיבים בלשונית "הזנת נתונים"</div>}
        </Pnl>

        <Pnl num="06" title="תמונת התכשיט">
          <ImgDrop img={pieceImg} onImg={setPieceImg} h={110} label="גרור תמונה או לחץ להעלאה"/>
        </Pnl>

        <Pnl num="07" title="פרטי הצעה">
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            <Inp label="שם לקוח" type="text" placeholder="Client name" value={cfg.clientName} onChange={e=>sf("clientName",e.target.value)}/>
            <Inp label="כותרת / תיאור" type="text" placeholder="Piece description" value={cfg.quoteName} onChange={e=>sf("quoteName",e.target.value)}/>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              <EB>הערות</EB>
              <textarea style={{fontFamily:C.heb,fontSize:11.5,color:C.ch,background:C.iv2,border:`0.5px solid ${C.blm}`,padding:"8px 10px",outline:"none",resize:"vertical",lineHeight:1.6,minHeight:48}} rows={3} value={cfg.notes} onChange={e=>sf("notes",e.target.value)}/>
            </div>
          </div>
        </Pnl>
      </div>

      {/* ── Column B ── */}
      <div style={{overflowY:"auto",padding:"14px 16px 40px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:12}}>
          <EKpi label="עלות ייצור" value={res?.prod} nat={res?.prod_nat} sub="חומרים + עבודה + עלויות" ov={cfg.prodOv} onOv={v=>sf("prodOv",v)} onClr={()=>sf("prodOv","")}/>
          <EKpi label="מחיר סיטונאי" value={res?.ws} nat={res?.ws_nat} sub={`ללא מעמ · ×${MU.ws.toFixed(2)}`} ov={cfg.wsOv} onOv={v=>sf("wsOv",v)} onClr={()=>sf("wsOv","")}/>
          <EKpi label="מחיר קמעונאי" value={res?.rx} nat={res?.rx_nat} sub={`ללא מעמ · ×${MU.rx.toFixed(2)}`} ov={cfg.rxOv} onOv={v=>sf("rxOv",v)} onClr={()=>sf("rxOv","")}/>
          <EKpi label="קמעונאי + מעמ" value={res?.ri} nat={res?.ri_nat} sub="כולל 18% מעמ" hi ov={cfg.riOv} onOv={v=>sf("riOv",v)} onClr={()=>sf("riOv","")}/>
        </div>

        {res&&(
          <Pnl num="—" title="פירוט עלויות">
            <ERow label="מתכת" note={`${res.gw}g ברוטו · ${cfg.metal}`} nat={res.mc_nat} ov={cfg.mcOv} onOv={v=>sf("mcOv",v)} onClr={()=>sf("mcOv","")}/>
            <ERow label="עבודה" note={`${SET_HEB[cfg.centerSetting]??cfg.centerSetting} + אבני צד · ×${(CMULT[cfg.cmplx]??1).toFixed(2)}`} nat={res.lc_nat} ov={cfg.lcOv} onOv={v=>sf("lcOv",v)} onClr={()=>sf("lcOv","")}/>
            {[
              {l:"אבן מרכזית",n:cfg.stoneMode==="real"&&cfg.stone?cfg.stone.nH:`${cfg.centerCt}ct ${cfg.centerType}`,v:res.sc},
              res.ss1>0&&{l:"אבני צד 1",n:cfg.ss1Mode==="real"&&cfg.ss1Stone?cfg.ss1Stone.nH:`${cfg.ss1Count}x ${cfg.ss1Ct}ct ${cfg.ss1Type}`,v:res.ss1},
              res.ss2>0&&{l:"אבני צד 2",n:cfg.ss2Mode==="real"&&cfg.ss2Stone?cfg.ss2Stone.nH:`${cfg.ss2Count}x ${cfg.ss2Ct}ct ${cfg.ss2Type}`,v:res.ss2},
              res.compCost>0&&{l:"רכיבים",n:(cfg.selectedComponents||[]).map(c=>c.name).join(", "),v:res.compCost},
              {l:"עלויות כלליות",n:"18% על מתכת + עבודה",v:res.oh},
            ].filter(Boolean).map(({l,n,v})=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"7px 0",borderBottom:`0.5px solid rgba(54,69,79,0.06)`}}>
                <div><div style={{fontFamily:C.heb,fontSize:11.5,color:C.ch,marginBottom:1}}>{l}</div><div style={{fontFamily:C.eng,fontSize:7.5,color:C.chx}}>{n}</div></div>
                <span style={{fontFamily:C.serif,fontSize:12,color:C.ch,whiteSpace:"nowrap"}}>{usd(v)}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",padding:"9px 0 2px",borderTop:`0.5px solid ${C.blm}`,marginTop:3}}>
              <span style={{fontFamily:C.heb,fontSize:12,color:C.ch,fontWeight:600}}>עלות ייצור</span>
              <span style={{fontFamily:C.serif,fontSize:13,color:cfg.prodOv?C.gdm:C.ch}}>{usd(res.prod)}</span>
            </div>
            <div style={{marginTop:8,fontFamily:C.heb,fontSize:9,color:C.chx,display:"flex",alignItems:"center",gap:4}}>
              <Pencil size={9} color={C.chx}/> לחץ על עיפרון לעקיפה ידנית
            </div>
          </Pnl>
        )}

        {!res&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 13px",border:`0.5px solid ${C.bl}`,background:C.iv2,marginBottom:11}}>
          <AlertCircle size={13} color={C.chx}/><span style={{fontFamily:C.heb,fontSize:10,color:C.chx}}>הזן משקל מתכת בגרמים להפעלת החישוב</span>
        </div>}

        <button onClick={()=>res&&onExport(cfg,res,pieceImg)} disabled={!res}
          style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:C.heb,fontSize:12,
            color:res?C.ch:C.chl,background:res?"rgba(197,179,88,0.14)":C.iv2,
            border:`0.5px solid ${res?"rgba(197,179,88,0.48)":C.bl}`,
            padding:"11px 0",cursor:res?"pointer":"not-allowed",marginBottom:11}}>
          <FileText size={13}/>{res?"ייצוא PDF":"הגדר הצעה כדי להמשיך"}{res&&<ArrowLeft size={11}/>}
        </button>
      </div>
    </div>
  );
}

/* ═══════════ SIDEBAR ═══════════ */
function Sidebar({tab,setTab}){
  const NAV=[
    {icon:Calculator,label:"מחשבון מחיר",id:"builder"},
    {icon:Gem,label:"מאגר אבנים",id:"stones"},
    {icon:Database,label:"הזנת נתונים",id:"data"},
    {icon:FileText,label:"תעודה ידנית",id:"manual"},
  ];
  return(
    <aside style={{width:188,minWidth:188,background:C.ch,display:"flex",flexDirection:"column",borderLeft:`0.5px solid rgba(255,255,255,0.06)`}}>
      <div style={{padding:"20px 16px 15px",borderBottom:"0.5px solid rgba(255,255,255,0.07)"}}>
        <div style={{width:17,height:17,border:`0.8px solid ${C.gd}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:7}}><span style={{fontFamily:C.serif,fontSize:7.5,color:C.gd}}>L</span></div>
        <div style={{fontFamily:C.serif,fontSize:10.5,color:"#E8E4DC",letterSpacing:"0.2em",lineHeight:1}}>LESHEM.S</div>
        <div style={{fontFamily:C.heb,fontSize:8,color:"#5a7280",marginTop:3}}>מערכת ניהול</div>
      </div>
      <nav style={{padding:"13px 0",flex:1}}>
        {NAV.map(({icon:Icon,label,id})=>(
          <div key={id} onClick={()=>setTab(id)}
            style={{display:"flex",alignItems:"center",gap:10,padding:"9px 16px",cursor:"pointer",position:"relative",background:tab===id?"rgba(197,179,88,0.09)":"transparent"}}>
            {tab===id&&<div style={{position:"absolute",right:0,top:0,width:2.5,height:"100%",background:C.gd}}/>}
            <Icon size={14} color={tab===id?C.gd:"#5a7280"} strokeWidth={1.4}/>
            <span style={{fontFamily:C.heb,fontSize:11.5,color:tab===id?"#ddd8cc":"#5a7280",fontWeight:300}}>{label}</span>
          </div>
        ))}
      </nav>
      <div style={{padding:"11px 16px",borderTop:"0.5px solid rgba(255,255,255,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#7fb987"}}/>
          <span style={{fontFamily:C.heb,fontSize:8.5,color:"#5a7280"}}>Airtable · מחובר</span>
        </div>
      </div>
    </aside>
  );
}

/* ═══════════ APP ROOT ═══════════ */
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

  const TITLES={builder:"בונה הצעת מחיר",stones:"מאגר אבנים",data:"הזנת נתונים",manual:"יצירת תעודה ידנית"};

  return(
    <div dir="rtl" style={{display:"flex",height:"100vh",background:C.iv,overflow:"hidden",fontFamily:C.heb}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600&family=Merriweather:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:rgba(54,69,79,0.16);}
        select option{background:#FAF9F6;}
        @page{size:A4;margin:0;}
        @media print{
          body *{visibility:hidden!important;}
          #cert-root,#cert-root *,#stone-cert-root,#stone-cert-root *{visibility:visible!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
          #cert-root{position:fixed!important;inset:0!important;width:100%!important;padding:38px 44px 32px!important;box-shadow:none!important;max-width:none!important;}
          #stone-cert-root{position:fixed!important;inset:0!important;width:100%!important;box-shadow:none!important;max-width:none!important;border:none!important;}
          .no-print{display:none!important;}
        }
      `}</style>
      <Sidebar tab={tab} setTab={setTab}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div className="no-print" style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",padding:"13px 20px 10px",borderBottom:`0.5px solid ${C.bl}`,background:C.iv}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
              <span style={{fontFamily:C.heb,fontSize:8.5,color:C.chx}}>LESHEM.S OS</span>
              <span style={{color:C.chx}}>‹</span>
              <span style={{fontFamily:C.heb,fontSize:8.5,color:C.chl}}>{TITLES[tab]}</span>
            </div>
            <h1 style={{fontFamily:C.heb,fontSize:14.5,fontWeight:400,color:C.ch}}>{TITLES[tab]}</h1>
          </div>
          <div style={{display:"flex",gap:8}}>
            {tab==="builder"&&<button onClick={()=>setTab("stones")} style={{display:"flex",alignItems:"center",gap:6,fontFamily:C.heb,fontSize:11,color:C.chm,background:"transparent",border:`0.5px solid ${C.blm}`,padding:"6px 12px",cursor:"pointer"}}><Gem size={12}/>מאגר</button>}
            {tab==="stones"&&<button onClick={()=>setTab("builder")} style={{display:"flex",alignItems:"center",gap:6,fontFamily:C.heb,fontSize:11,color:C.chm,background:"transparent",border:`0.5px solid ${C.blm}`,padding:"6px 12px",cursor:"pointer"}}><Calculator size={12}/>מחשבון</button>}
            <button onClick={()=>{setRK(k=>k+1);setAS(null);setPS(null);setPId(null);}} style={{display:"flex",alignItems:"center",gap:5,fontFamily:C.heb,fontSize:11,color:C.chl,background:"transparent",border:`0.5px solid ${C.bl}`,padding:"6px 10px",cursor:"pointer"}}><RotateCcw size={11}/> אפס</button>
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

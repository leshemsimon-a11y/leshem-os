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
}/* ── MATCHING ── */
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
function Kpi({label,value,sub,hi}){
  return(<div style={{border:`0.5px solid ${hi?C.ch:C.bl}`,padding:"13px 15px",background:hi?C.ch:C.iv,position:"relative",overflow:"hidden"}}>
    {!hi&&<div style={{position:"absolute",bottom:0,right:0,width:"100%",height:"1.5px",background:`linear-gradient(270deg,${C.gd},transparent)`,opacity:0.28}}/>}
    <EB s={{color:hi?"rgba(225,215,195,0.42)":C.chl,marginBottom:3}}>{label}</EB>
    <div style={{fontFamily:C.serif,fontSize:16,fontWeight:300,color:hi?C.gd:C.ch,lineHeight:1,marginBottom:4}}>
      {value!=null?usd(value):<span style={{color:hi?"rgba(225,215,195,0.15)":C.chx,fontSize:12}}>—</span>}
    </div>
    <div style={{fontFamily:C.heb,fontSize:8,color:hi?"rgba(225,215,195,0.32)":C.chx,lineHeight:1.4}}>{sub}</div>
  </div>);
}
function Pills({opts,val,onChange}){
  return(<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
    {opts.map(([v,l])=>(
      <button key={v} onClick={()=>onChange(v)} style={{fontFamily:C.heb,fontSize:11,cursor:"pointer",color:val===v?C.iv:C.chm,background:val===v?C.ch:"transparent",border:`0.5px solid ${val===v?C.ch:C.blm}`,padding:"5px 12px",transition:"all 0.12s"}}>{l}</button>
    ))}
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

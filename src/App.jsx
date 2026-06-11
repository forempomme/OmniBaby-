import { APP_VERSION, APP_NAME } from './version.js'

// BabyTracker v2 — Firebase + Dark Mode + Full Features
import { useState, useEffect, useContext, createContext, useRef } from "react";

// ── 1. THEME & CONTEXT ────────────────────────────────────────────────────────
const ThemeContext = createContext();
const AppContext   = createContext();
const useTheme = () => useContext(ThemeContext);
const useApp   = () => useContext(AppContext);

const LIGHT = {
  bg:"#ffffff",bg2:"#f7f7f5",bg3:"#f0f0ee",
  tx:"#1a1a1a",tx2:"#666",tx3:"#aaa",
  bd:"#e5e5e5",bd2:"#ccc",
  purple:"#6B4FA0",purpleBg:"#EEEDFE",purpleTx:"#3C3489",purpleMid:"#534AB7",
  teal:"#0F6E56",tealBg:"#E1F5EE",tealTx:"#085041",
  amber:"#854F0B",amberBg:"#FAEEDA",amberTx:"#633806",
  coral:"#993C1D",coralBg:"#FAECE7",coralTx:"#4A1B0C",
  green:"#3B6D11",greenBg:"#EAF3DE",greenTx:"#173404",
  red:"#A32D2D",redBg:"#FCEBEB",redTx:"#501313",
  success:"#1D9E75",warning:"#EF9F27",danger:"#E24B4A",
  headerBg:"#6B4FA0",
};
const DARK = {
  bg:"#12111f",bg2:"#1c1b2e",bg3:"#252440",
  tx:"#e8e8f4",tx2:"#9090b8",tx3:"#505078",
  bd:"#2a2844",bd2:"#3a3860",
  purple:"#9B7FD0",purpleBg:"#1e1a3a",purpleTx:"#c4b5f0",purpleMid:"#8B70D0",
  teal:"#5DCAA5",tealBg:"#0a2420",tealTx:"#5DCAA5",
  amber:"#EF9F27",amberBg:"#221800",amberTx:"#EF9F27",
  coral:"#F0997B",coralBg:"#221008",coralTx:"#F0997B",
  green:"#97C459",greenBg:"#0f1e04",greenTx:"#97C459",
  red:"#F09595",redBg:"#220808",redTx:"#F09595",
  success:"#5DCAA5",warning:"#EF9F27",danger:"#F09595",
  headerBg:"#1a1535",
};

// ── 2. FIREBASE MOCK ──────────────────────────────────────────────────────────
// Remplacer chaque fonction par Firebase réel :
// import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
// import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore"
function useFirebaseAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const login = async (email, password) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setUser({ uid:"u1", email, displayName: email.split("@")[0] });
    setLoading(false);
  };
  const register = async (email, password, name) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setUser({ uid:"u1", email, displayName: name });
    setLoading(false);
  };
  const logout = () => setUser(null);
  return { user, loading, login, register, logout };
}

function useFirebaseData(user) {
  const now = () => new Date().toTimeString().slice(0,5);
  const today = new Date().toISOString().slice(0,10);
  const [entries,      setEntries]      = useState([
    {id:1,type:"biberon",qty:180,side:"Sein gauche",time:"14:30",author:"Maman",synced:true},
    {id:2,type:"couche",coucheType:"pipi",time:"13:15",author:"Papa",synced:true},
    {id:3,type:"sommeil",sommeilType:"sieste",debut:"11:00",fin:"12:20",duree:"1h 20min",humeur:"enjouée",author:"Maman",synced:true},
  ]);
  const [mesures,      setMesures]      = useState([
    {id:1,label:"Taille",           value:"69.5",unit:"cm",date:"2024-06-01",percentile:"P50"},
    {id:2,label:"Poids",            value:"7.9", unit:"kg",date:"2024-06-01",percentile:"P40"},
    {id:3,label:"Périmètre crânien",value:"43.2",unit:"cm",date:"2024-06-01",percentile:"P45"},
  ]);
  const [vaccins,      setVaccins]      = useState([
    {id:1,name:"BCG + Hépatite B (J1)",       status:"done",  date:"2023-10-01"},
    {id:2,name:"DTPa + Hib + Polio (2 mois)", status:"done",  date:"2023-12-15"},
    {id:3,name:"Méningocoque B (4 mois)",      status:"done",  date:"2024-02-10"},
    {id:4,name:"MMR — Rougeole (11 mois)",     status:"next",  date:"2024-09-01"},
    {id:5,name:"Varicelle (12 mois)",          status:"future",date:"2024-10-01"},
  ]);
  const [sommeils,     setSommeils]     = useState([
    {id:1,type:"nuit",  debut:"20:40",fin:"07:20",duree:"10h 40min",qualite:"bonne",  date:"2024-06-10"},
    {id:2,type:"sieste",debut:"09:30",fin:"10:15",duree:"0h 45min", qualite:"bonne",  date:today},
    {id:3,type:"sieste",debut:"11:00",fin:"12:25",duree:"1h 25min", qualite:"agitee", date:today},
  ]);
  const [medicaments,  setMedicaments]  = useState([
    {id:1,nom:"Doliprane 2.4%",dose:"2.5 ml",frequence:"toutes les 6h",actif:true, prochaineDose:"18:00",couleur:"coral"},
    {id:2,nom:"Pivalone",      dose:"1 dose", frequence:"matin et soir",  actif:false,prochaineDose:null,  couleur:"purple"},
  ]);
  const [temperatures, setTemperatures] = useState([
    {id:1,valeur:37.2,date:"2024-06-09",heure:"08:00"},
    {id:2,valeur:38.5,date:"2024-06-10",heure:"14:00"},
    {id:3,valeur:39.1,date:"2024-06-10",heure:"20:00"},
    {id:4,valeur:38.0,date:"2024-06-11",heure:"08:00"},
    {id:5,valeur:37.4,date:"2024-06-11",heure:"14:00"},
  ]);
  const [aliments,     setAliments]     = useState([
    {id:1,nom:"Carotte",      age:4,categorie:"Légumes",  statut:"accepté",  allergene:false},
    {id:2,nom:"Patate douce", age:5,categorie:"Légumes",  statut:"accepté",  allergene:false},
    {id:3,nom:"Pomme",        age:5,categorie:"Fruits",   statut:"accepté",  allergene:false},
    {id:4,nom:"Avocat",       age:6,categorie:"Fruits",   statut:"en cours", allergene:false},
    {id:5,nom:"Oeuf",         age:7,categorie:"Protéines",statut:"à tester", allergene:true },
    {id:6,nom:"Poulet",       age:6,categorie:"Protéines",statut:"accepté",  allergene:false},
    {id:7,nom:"Blé",          age:6,categorie:"Céréales", statut:"à tester", allergene:true },
    {id:8,nom:"Lait de vache",age:12,categorie:"Laitiers",statut:"à tester", allergene:true },
  ]);
  const [journal,      setJournal]      = useState([
    {id:1,titre:"Premiers pas !",     date:"2024-06-08",emoji:"👣",texte:"Léa a fait ses premiers pas aujourd\'hui. 3 pas avant de tomber sur les fesses !",tag:"étape"},
    {id:2,titre:"Premier mot : Mama", date:"2024-05-20",emoji:"💬",texte:"Elle a dit Mama clairement en me regardant.",tag:"étape"},
    {id:3,titre:"Sortie au parc",     date:"2024-06-01",emoji:"🌳",texte:"Première fois sur la balançoire, elle a adoré !",tag:"souvenir"},
  ]);
  const [membres,      setMembres]      = useState([
    {uid:"u1",nom:"Marie (Maman)",email:"marie@email.com",role:"admin",  online:true, initiales:"MA",couleur:"purple"},
    {uid:"u2",nom:"Paul (Papa)",  email:"paul@email.com", role:"editeur",online:true, initiales:"PA",couleur:"teal"},
    {uid:"u3",nom:"Mamie",        email:"mamie@email.com",role:"lecteur",online:false,initiales:"MM",couleur:"amber"},
  ]);

  const addEntry       = e  => setEntries(p => [{...e,id:Date.now(),author:user?.displayName||"Moi",synced:true,time:e.time||now()},...p]);
  const addMesure      = m  => setMesures(p => p.map(x => x.label===m.label ? {...x,...m} : x));
  const addVaccin      = v  => setVaccins(p => [...p,{...v,id:Date.now()}]);
  const addSommeil     = s  => setSommeils(p => [{...s,id:Date.now(),date:today},...p]);
  const addMedicament  = m  => setMedicaments(p => [...p,{...m,id:Date.now()}]);
  const addTemperature = t  => setTemperatures(p => [...p,{...t,id:Date.now()}]);
  const addAliment     = a  => setAliments(p => [...p,{...a,id:Date.now()}]);
  const addJournal     = j  => setJournal(p => [{...j,id:Date.now()},...p]);
  const inviteMembre   = m  => setMembres(p => [...p,{...m,uid:Date.now(),online:false}]);
  const toggleMed      = id => setMedicaments(p => p.map(m => m.id===id ? {...m,actif:!m.actif} : m));
  const updateAliment  = (id,statut) => setAliments(p => p.map(a => a.id===id ? {...a,statut} : a));

  return { entries,mesures,vaccins,sommeils,medicaments,temperatures,aliments,journal,membres,
    addEntry,addMesure,addVaccin,addSommeil,addMedicament,addTemperature,addAliment,addJournal,inviteMembre,toggleMed,updateAliment };
}

// ── 3. SHARED PRIMITIVES ──────────────────────────────────────────────────────
function Badge({color="purple",children,style}){
  const {t}=useTheme();
  return <span style={{fontSize:11,fontWeight:500,padding:"3px 9px",borderRadius:20,background:t[color+"Bg"]||t.bg2,color:t[color+"Tx"]||t.tx2,border:`0.5px solid ${t[color]||t.bd}`,...style}}>{children}</span>;
}
function Card({children,style,padding="14px"}){
  const {t}=useTheme();
  return <div style={{background:t.bg,border:`0.5px solid ${t.bd}`,borderRadius:12,padding,marginBottom:10,...style}}>{children}</div>;
}
function SecTitle({children,style}){
  const {t}=useTheme();
  return <div style={{fontSize:10,fontWeight:500,color:t.tx3,textTransform:"uppercase",letterSpacing:"0.07em",margin:"16px 0 8px",...style}}>{children}</div>;
}
function StatCard({label,value,unit}){
  const {t}=useTheme();
  return <div style={{background:t.bg2,borderRadius:8,padding:12}}><div style={{fontSize:11,color:t.tx2,marginBottom:3}}>{label}</div><div style={{fontSize:21,fontWeight:500,color:t.tx}}>{value} <span style={{fontSize:11,color:t.tx2,fontWeight:400}}>{unit}</span></div></div>;
}
function Divider(){const {t}=useTheme();return <div style={{height:"0.5px",background:t.bd,margin:"0 -14px"}}/>;}
function Avatar({initials,color="purple",size=36}){
  const {t}=useTheme();
  return <div style={{width:size,height:size,borderRadius:"50%",background:t[color+"Bg"],color:t[color+"Tx"],display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.34,fontWeight:500,flexShrink:0}}>{initials}</div>;
}
function Toggle({value,onChange}){
  const {t}=useTheme();
  return <button onClick={()=>onChange(!value)} style={{width:44,height:24,background:value?t.purple:t.bg3,borderRadius:12,position:"relative",border:"none",cursor:"pointer",flexShrink:0,transition:"background 0.2s"}}><div style={{width:18,height:18,background:"#fff",borderRadius:"50%",position:"absolute",top:3,left:value?23:3,transition:"left 0.2s"}}/></button>;
}
function ToggleGroup({options,value,onChange}){
  const {t}=useTheme();
  return <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{options.map(([k,l])=><button key={k} onClick={()=>onChange(k)} style={{padding:"6px 13px",borderRadius:20,fontSize:13,cursor:"pointer",border:value===k?`0.5px solid ${t.purple}`:`0.5px solid ${t.bd}`,background:value===k?t.purpleBg:t.bg,color:value===k?t.purpleTx:t.tx2,fontWeight:value===k?500:400,transition:"all 0.12s"}}>{l}</button>)}</div>;
}
function FieldLabel({children}){const {t}=useTheme();return <div style={{fontSize:12,fontWeight:500,color:t.tx2,marginBottom:6,marginTop:14}}>{children}</div>;}
function FInput({style,...props}){const {t}=useTheme();return <input style={{width:"100%",padding:"8px 10px",fontSize:14,border:`0.5px solid ${t.bd}`,borderRadius:8,outline:"none",background:t.bg,color:t.tx,boxSizing:"border-box",...style}} {...props}/>;}
function FSelect({children,style,...props}){const {t}=useTheme();return <select style={{width:"100%",padding:"8px 10px",fontSize:14,border:`0.5px solid ${t.bd}`,borderRadius:8,outline:"none",background:t.bg,color:t.tx,boxSizing:"border-box",...style}} {...props}>{children}</select>;}
function FTextarea({style,...props}){const {t}=useTheme();return <textarea style={{width:"100%",padding:"8px 10px",fontSize:14,border:`0.5px solid ${t.bd}`,borderRadius:8,outline:"none",background:t.bg,color:t.tx,boxSizing:"border-box",resize:"none",...style}} {...props}/>;}
function PrimaryBtn({children,onClick,disabled,style}){
  const {t}=useTheme();
  return <button onClick={onClick} disabled={disabled} style={{width:"100%",padding:"13px",background:disabled?t.bd:t.purple,color:"#fff",border:"none",borderRadius:12,fontSize:15,fontWeight:500,cursor:disabled?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:18,...style}}>{children}</button>;
}
function AddButton({onClick,children}){
  const {t}=useTheme();
  return <button onClick={onClick} style={{width:"100%",padding:"11px 0",border:`1.5px dashed ${t.bd2}`,borderRadius:8,background:"none",fontSize:14,color:t.tx2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:6}}><span style={{fontSize:18}}>＋</span> {children}</button>;
}
function InfoBox({color="purple",children,style}){
  const {t}=useTheme();
  return <div style={{background:t[color+"Bg"],border:`0.5px solid ${t[color]}`,borderRadius:8,padding:"10px 12px",marginTop:14,fontSize:13,color:t[color+"Tx"],lineHeight:1.5,...style}}>{children}</div>;
}
function SuccessScreen({preview,onReset,resetLabel}){
  const {t}=useTheme();
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",padding:"20px 0"}}>
    <div style={{width:56,height:56,borderRadius:"50%",background:t.tealBg,color:t.teal,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,marginBottom:14}}>✓</div>
    <div style={{fontSize:17,fontWeight:500,color:t.tx,marginBottom:6}}>Enregistré</div>
    <div style={{background:t.bg2,borderRadius:12,padding:"12px 16px",width:"100%",marginBottom:20}}>
      {preview.map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"3px 0"}}><span style={{color:t.tx2}}>{k}</span><span style={{fontWeight:500,color:t.tx}}>{v}</span></div>)}
    </div>
    <button onClick={onReset} style={{width:"100%",padding:11,border:`0.5px solid ${t.bd}`,borderRadius:12,background:t.bg,color:t.tx,fontSize:14,cursor:"pointer"}}>＋ {resetLabel}</button>
  </div>;
}
function ModalShell({title,sub,onClose,children}){
  const {t}=useTheme();
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}}>
    <div style={{background:t.bg,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:420,maxHeight:"92vh",overflowY:"auto"}}>
      <div style={{background:t.headerBg,padding:"18px 18px 14px",borderRadius:"20px 20px 0 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div><div style={{fontSize:16,fontWeight:500,color:"#fff"}}>{title}</div>{sub&&<div style={{fontSize:12,color:"rgba(255,255,255,0.65)",marginTop:2}}>{sub}</div>}</div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",color:"#fff",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      </div>
      <div style={{padding:"16px 16px 36px"}}>{children}</div>
    </div>
  </div>;
}
function calcDuree(d,f){
  const [dh,dm]=d.split(":").map(Number);const [fh,fm]=f.split(":").map(Number);
  let mins=(fh*60+fm)-(dh*60+dm);if(mins<0)mins+=1440;
  return `${Math.floor(mins/60)}h ${String(mins%60).padStart(2,"0")}min`;
}


// ── 4. AUTH ───────────────────────────────────────────────────────────────────
function AuthScreen({onLogin,onRegister,loading}){
  const {t}=useTheme();
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");const [password,setPass]=useState("");const [name,setName]=useState("");const [error,setError]=useState("");
  async function handle(){
    if(!email||!password){setError("Remplis tous les champs.");return;}
    setError("");
    try{ if(mode==="login") await onLogin(email,password); else await onRegister(email,password,name||email.split("@")[0]); }
    catch(e){setError("Erreur de connexion.");}
  }
  return <div style={{minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
    <div style={{width:64,height:64,borderRadius:"50%",background:t.purpleBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,marginBottom:16}}>👶</div>
    <div style={{fontSize:22,fontWeight:500,color:t.tx,marginBottom:4}}>{APP_NAME}</div>
    <div style={{fontSize:14,color:t.tx2,marginBottom:32}}>Suivi bébé en famille</div>
    <div style={{width:"100%",maxWidth:360,background:t.bg,border:`0.5px solid ${t.bd}`,borderRadius:16,padding:24}}>
      <div style={{display:"flex",marginBottom:20,borderRadius:10,overflow:"hidden",border:`0.5px solid ${t.bd}`}}>
        {[["login","Connexion"],["register","Créer un compte"]].map(([m,l])=><button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"10px",fontSize:13,fontWeight:mode===m?500:400,background:mode===m?t.purple:t.bg2,color:mode===m?"#fff":t.tx2,border:"none",cursor:"pointer"}}>{l}</button>)}
      </div>
      {mode==="register"&&<><div style={{fontSize:12,color:t.tx2,marginBottom:6}}>Prénom</div><FInput placeholder="Marie" value={name} onChange={e=>setName(e.target.value)} style={{marginBottom:12}}/></>}
      <div style={{fontSize:12,color:t.tx2,marginBottom:6}}>Email</div><FInput type="email" placeholder="marie@email.com" value={email} onChange={e=>setEmail(e.target.value)} style={{marginBottom:12}}/>
      <div style={{fontSize:12,color:t.tx2,marginBottom:6}}>Mot de passe</div><FInput type="password" placeholder="••••••••" value={password} onChange={e=>setPass(e.target.value)}/>
      {error&&<div style={{fontSize:12,color:t.danger,marginTop:6}}>{error}</div>}
      <PrimaryBtn onClick={handle} disabled={loading} style={{marginTop:16}}>{loading?"Connexion...":mode==="login"?"Se connecter":"Créer le compte"}</PrimaryBtn>
      <div style={{textAlign:"center",marginTop:14,fontSize:12,color:t.tx3}}>Google Sign-In disponible après config Firebase</div>
    </div>
  </div>;
}

// ── 5. BABYLOG ────────────────────────────────────────────────────────────────
function BabyLog({onAdd}){
  const {t}=useTheme();const {entries}=useApp();
  const iconMap={biberon:"💧",couche:"😊",sommeil:"🌙",autre:"✏️"};
  const colMap={biberon:"teal",couche:"amber",sommeil:"purple",autre:"gray"};
  const labelOf=e=>{
    if(e.type==="biberon") return `${e.qty||"?"}ml · ${e.side||""}`;
    if(e.type==="couche")  return `${e.coucheType||""}${e.consist?" · "+e.consist:""}`;
    if(e.type==="sommeil") return `${e.sommeilType||""} · ${e.duree||""}`;
    return e.cat||"";
  };
  const bibs=entries.filter(e=>e.type==="biberon");
  const totalMl=bibs.reduce((a,e)=>a+(Number(e.qty)||0),0);
  return <div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
      <StatCard label="💧 Biberons" value={bibs.length} unit="aujourd'hui"/>
      <StatCard label="🍼 Total ingéré" value={totalMl} unit="ml"/>
      <StatCard label="😊 Couches" value={entries.filter(e=>e.type==="couche").length} unit="aujourd'hui"/>
      <StatCard label="🌙 Siestes" value={entries.filter(e=>e.type==="sommeil"&&e.sommeilType==="sieste").length} unit="aujourd'hui"/>
    </div>
    <SecTitle>Activité du jour</SecTitle>
    <Card padding="0 14px">
      {entries.length===0&&<div style={{padding:"20px 0",textAlign:"center",color:t.tx3,fontSize:13}}>Aucune entrée. Ajoute la première !</div>}
      {entries.map((e,i)=><div key={e.id} style={{display:"flex",gap:10,padding:"9px 0",borderBottom:i<entries.length-1?`0.5px solid ${t.bd}`:"none",alignItems:"flex-start"}}>
        <div style={{width:34,height:34,borderRadius:"50%",background:t[(colMap[e.type]||"gray")+"Bg"],display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{iconMap[e.type]||"📝"}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:500,color:t.tx}}>{e.type==="biberon"?"Biberon":e.type==="couche"?"Couche":e.type==="sommeil"?(e.sommeilType||"Sommeil"):(e.cat||"Autre")}</div>
          <div style={{fontSize:11,color:t.tx2,marginTop:1}}>{labelOf(e)}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
          <span style={{fontSize:11,color:t.tx3}}>{e.time}</span>
          {e.author&&<span style={{fontSize:10,color:t.tx3}}>{e.author}</span>}
          {e.synced&&<span style={{fontSize:9,color:t.teal}}>✓ sync</span>}
        </div>
      </div>)}
    </Card>
    <AddButton onClick={onAdd}>Ajouter une entrée</AddButton>
  </div>;
}

function BabyLogModal({onClose}){
  const {addEntry}=useApp();const {t}=useTheme();
  const [type,setType]=useState(null);const [saved,setSaved]=useState(false);const [preview,setPreview]=useState([]);
  const [qty,setQty]=useState(150);const [side,setSide]=useState("g");const [timeBib,setTimeBib]=useState(()=>new Date().toTimeString().slice(0,5));const [noteBib,setNoteBib]=useState("");
  const [timeCouche,setTimeCouche]=useState(()=>new Date().toTimeString().slice(0,5));const [coucheType,setCoucheType]=useState("pipi");const [consist,setConsist]=useState("");
  const [sommeilType,setSommeilType]=useState("sieste");const [debut,setDebut]=useState("14:00");const [fin,setFin]=useState("15:00");const [humeur,setHumeur]=useState("enjouée");
  const [timeAutre,setTimeAutre]=useState(()=>new Date().toTimeString().slice(0,5));const [catAutre,setCatAutre]=useState("Bain");const [noteAutre,setNoteAutre]=useState("");
  const SL={g:"Sein gauche",d:"Sein droit",b:"Biberon"};
  function handleSave(){
    let entry,prev;
    if(type==="biberon"){entry={type,qty,side:SL[side],time:timeBib,note:noteBib};prev=[["Type","Biberon"],["Heure",timeBib],["Quantité",qty+" ml"],["Côté",SL[side]]];}
    else if(type==="couche"){entry={type,coucheType,consist,time:timeCouche};prev=[["Type","Couche"],["Heure",timeCouche],["Contenu",coucheType]];}
    else if(type==="sommeil"){const d=calcDuree(debut,fin);entry={type,sommeilType,debut,fin,duree:d,humeur};prev=[["Type",sommeilType],["Début",debut],["Fin",fin],["Durée",d]];}
    else{entry={type,cat:catAutre,time:timeAutre,note:noteAutre};prev=[["Type",catAutre],["Heure",timeAutre]];}
    addEntry(entry);setPreview(prev);setSaved(true);
  }
  const dp=debut&&fin?calcDuree(debut,fin):"";
  return <ModalShell title="Nouvelle entrée — Léa" sub={`Aujourd'hui · ${new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}`} onClose={onClose}>
    {!saved?<>
      <div style={{fontSize:12,color:t.tx2,marginBottom:10}}>Que se passe-t-il ?</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        {[["biberon","💧","Biberon / tétée"],["couche","😊","Couche"],["sommeil","🌙","Sommeil"],["autre","✏️","Autre"]].map(([id,icon,label])=><button key={id} onClick={()=>setType(id)} style={{padding:"12px 8px",borderRadius:12,cursor:"pointer",border:type===id?`2px solid ${t.purple}`:`0.5px solid ${t.bd}`,background:type===id?t.purpleBg:t.bg,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}><span style={{fontSize:22}}>{icon}</span><span style={{fontSize:12,fontWeight:500,color:type===id?t.purpleTx:t.tx2}}>{label}</span></button>)}
      </div>
      <Divider/>
      {type==="biberon"&&<div style={{marginTop:12}}>
        <FieldLabel>Heure</FieldLabel><FInput type="time" value={timeBib} onChange={e=>setTimeBib(e.target.value)}/>
        <FieldLabel>Quantité</FieldLabel>
        <div style={{display:"flex",alignItems:"center",gap:10}}><input type="range" min="30" max="300" step="10" value={qty} onChange={e=>setQty(Number(e.target.value))} style={{flex:1}}/><span style={{fontSize:15,fontWeight:500,color:t.tx,minWidth:52,textAlign:"right"}}>{qty} ml</span></div>
        <FieldLabel>Type</FieldLabel><ToggleGroup options={[["g","Sein gauche"],["d","Sein droit"],["b","Biberon"]]} value={side} onChange={setSide}/>
        <FieldLabel>Note</FieldLabel><FTextarea value={noteBib} onChange={e=>setNoteBib(e.target.value)} placeholder="Ex : bonne tétée..." style={{height:60}}/>
      </div>}
      {type==="couche"&&<div style={{marginTop:12}}>
        <FieldLabel>Heure</FieldLabel><FInput type="time" value={timeCouche} onChange={e=>setTimeCouche(e.target.value)}/>
        <FieldLabel>Contenu</FieldLabel><ToggleGroup options={[["pipi","Pipi"],["selles","Selles"],["mixte","Mixte"]]} value={coucheType} onChange={setCoucheType}/>
        <FieldLabel>Consistance</FieldLabel><FSelect value={consist} onChange={e=>setConsist(e.target.value)}><option value="">— non applicable —</option>{["Normale","Molle","Dure","Liquide"].map(c=><option key={c}>{c}</option>)}</FSelect>
      </div>}
      {type==="sommeil"&&<div style={{marginTop:12}}>
        <FieldLabel>Type</FieldLabel><ToggleGroup options={[["sieste","Sieste"],["nuit","Nuit"]]} value={sommeilType} onChange={setSommeilType}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><FieldLabel>Début</FieldLabel><FInput type="time" value={debut} onChange={e=>setDebut(e.target.value)}/></div>
          <div><FieldLabel>Fin</FieldLabel><FInput type="time" value={fin} onChange={e=>setFin(e.target.value)}/></div>
        </div>
        <InfoBox color="purple">⏱ Durée : {dp}</InfoBox>
        <FieldLabel>Humeur au réveil</FieldLabel><ToggleGroup options={[["reposée","Reposée"],["enjouée","Enjouée"],["pleurs","Pleurs"],["agitée","Agitée"]]} value={humeur} onChange={setHumeur}/>
      </div>}
      {type==="autre"&&<div style={{marginTop:12}}>
        <FieldLabel>Heure</FieldLabel><FInput type="time" value={timeAutre} onChange={e=>setTimeAutre(e.target.value)}/>
        <FieldLabel>Catégorie</FieldLabel><FSelect value={catAutre} onChange={e=>setCatAutre(e.target.value)}>{["Bain","Médicament","Repas solide","Activité d'éveil","Pleurs","Sortie","Autre"].map(c=><option key={c}>{c}</option>)}</FSelect>
        <FieldLabel>Note</FieldLabel><FTextarea value={noteAutre} onChange={e=>setNoteAutre(e.target.value)} placeholder="Décrivez..." style={{height:70}}/>
      </div>}
      <PrimaryBtn onClick={handleSave} disabled={!type}>✓ Enregistrer</PrimaryBtn>
    </>:<SuccessScreen preview={preview} onReset={()=>{setSaved(false);setType(null);}} resetLabel="Ajouter une autre entrée"/>}
  </ModalShell>;
}


// ── 6. GRANDISBIEN ────────────────────────────────────────────────────────────
function GrandisBien(){
  const {t}=useTheme();const {mesures,vaccins,addMesure,addVaccin}=useApp();
  const [modal,setModal]=useState(null);
  const dotColor={done:t.success,next:t.warning,future:t.bd2};
  const dateColor={done:t.teal,next:t.amber,future:t.tx3};
  const icons={"Taille":"📏","Poids":"⚖️","Périmètre crânien":"⭕"};
  const bCol={"Taille":"teal","Poids":"purple","Périmètre crânien":"amber"};
  return <div>
    <SecTitle style={{marginTop:0}}>Mesures</SecTitle>
    <Card padding="0 14px">
      {mesures.map((m,i)=><div key={m.id} style={{display:"flex",gap:10,alignItems:"center",padding:"9px 0",borderBottom:i<mesures.length-1?`0.5px solid ${t.bd}`:"none"}}>
        <div style={{width:36,height:36,borderRadius:8,background:t[(bCol[m.label]||"purple")+"Bg"],display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{icons[m.label]||"📐"}</div>
        <div style={{flex:1}}><div style={{fontSize:12,color:t.tx2}}>{m.label}</div><div style={{fontSize:16,fontWeight:500,color:t.tx}}>{m.value} {m.unit}</div></div>
        <div style={{textAlign:"right"}}><Badge color={bCol[m.label]||"purple"}>{m.percentile}</Badge><div style={{fontSize:11,color:t.tx3,marginTop:3}}>{m.date}</div></div>
      </div>)}
    </Card>
    <SecTitle>Courbe de poids OMS</SecTitle>
    <Card>
      <div style={{fontSize:11,color:t.tx2,marginBottom:8}}>Poids filles · 8 mois</div>
      <svg viewBox="0 0 320 100" style={{width:"100%",height:"auto"}}>
        <polyline points="0,10 40,9 80,8 120,7 160,6 200,6 240,5 280,4 320,4" fill="none" stroke={t.bd2} strokeWidth="1" strokeDasharray="3,3"/>
        <polyline points="0,50 40,45 80,40 120,36 160,33 200,31 240,30 280,29 320,28" fill="none" stroke={t.purpleMid} strokeWidth="1.5"/>
        <polyline points="0,88 40,84 80,78 120,73 160,69 200,67 240,66 280,65 320,64" fill="none" stroke={t.bd2} strokeWidth="1" strokeDasharray="3,3"/>
        <circle cx="213" cy="42" r="4" fill={t.purple}/>
        <line x1="213" y1="0" x2="213" y2="100" stroke={t.purple} strokeWidth="0.5" strokeDasharray="2,2" opacity="0.4"/>
        {[["0","0"],["75","3m"],["155","6m"],["205","8m"],["270","12m"]].map(([x,l])=><text key={x} x={x} y="98" fontSize="9" fill={x==="205"?t.purple:t.tx3}>{l}</text>)}
        <text x="300" y="13" fontSize="9" fill={t.tx3}>P97</text>
        <text x="300" y="34" fontSize="9" fill={t.purpleMid}>P50</text>
        <text x="300" y="68" fontSize="9" fill={t.tx3}>P3</text>
      </svg>
    </Card>
    <SecTitle>Vaccinations</SecTitle>
    <Card padding="0 14px">
      {vaccins.map((v,i)=><div key={v.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<vaccins.length-1?`0.5px solid ${t.bd}`:"none"}}>
        <div style={{width:10,height:10,borderRadius:"50%",background:dotColor[v.status],flexShrink:0}}/>
        <div style={{flex:1,fontSize:13,color:t.tx}}>{v.name}</div>
        <div style={{fontSize:12,color:dateColor[v.status],whiteSpace:"nowrap"}}>{v.status==="done"?"✓ Fait":v.status==="next"?"Prochain":"Prévu"}</div>
      </div>)}
    </Card>
    <AddButton onClick={()=>setModal("mesure")}>Nouvelle mesure</AddButton>
    <AddButton onClick={()=>setModal("vaccin")}>Ajouter un vaccin</AddButton>
    {modal==="mesure"&&<MesureModal onClose={()=>setModal(null)} onSave={m=>{addMesure(m);setModal(null);}}/>}
    {modal==="vaccin"&&<VaccinModal onClose={()=>setModal(null)} onSave={v=>{addVaccin(v);setModal(null);}}/>}
  </div>;
}

function MesureModal({onClose,onSave}){
  const {t}=useTheme();
  const [saved,setSaved]=useState(false);const [type,setType]=useState("Poids");const [valeur,setValeur]=useState("");const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const types=[["Poids","⚖️","kg"],["Taille","📏","cm"],["Périmètre crânien","⭕","cm"]];
  const unit=types.find(x=>x[0]===type)?.[2]||"";
  function handleSave(){onSave({label:type,value:valeur,unit,date,percentile:"—"});setSaved(true);}
  return <ModalShell title="Nouvelle mesure" sub="Léa · 8 mois" onClose={onClose}>
    {!saved?<>
      <FieldLabel>Type</FieldLabel>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {types.map(([k,icon])=><button key={k} onClick={()=>setType(k)} style={{padding:"10px 6px",border:type===k?`2px solid ${t.purple}`:`0.5px solid ${t.bd}`,borderRadius:10,background:type===k?t.purpleBg:t.bg,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          <span style={{fontSize:20}}>{icon}</span><span style={{fontSize:10,fontWeight:500,color:type===k?t.purpleTx:t.tx2,textAlign:"center"}}>{k}</span>
        </button>)}
      </div>
      <FieldLabel>Valeur ({unit})</FieldLabel><FInput type="number" step="0.1" value={valeur} onChange={e=>setValeur(e.target.value)} placeholder="0.0"/>
      <FieldLabel>Date</FieldLabel><FInput type="date" value={date} onChange={e=>setDate(e.target.value)}/>
      <InfoBox color="teal">💡 La courbe OMS sera mise à jour.</InfoBox>
      <PrimaryBtn onClick={handleSave} disabled={!valeur}>✓ Enregistrer</PrimaryBtn>
    </>:<SuccessScreen preview={[["Type",type],["Valeur",valeur+" "+unit],["Date",date]]} onReset={()=>{setSaved(false);setValeur("");}} resetLabel="Ajouter une autre mesure"/>}
  </ModalShell>;
}

function VaccinModal({onClose,onSave}){
  const {t}=useTheme();
  const [saved,setSaved]=useState(false);const [nom,setNom]=useState("");const [date,setDate]=useState(new Date().toISOString().slice(0,10));const [status,setStatus]=useState("done");const [lot,setLot]=useState("");
  const suggestions=["BCG","Hépatite B","DTPa-Hib-Polio","Pneumocoque","Méningocoque B","MMR","Varicelle","Rotavirus"];
  function handleSave(){onSave({name:nom,status,date,lot});setSaved(true);}
  return <ModalShell title="Ajouter un vaccin" onClose={onClose}>
    {!saved?<>
      <FieldLabel>Nom du vaccin</FieldLabel><FInput value={nom} onChange={e=>setNom(e.target.value)} placeholder="Ex : MMR, DTPa..."/>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
        {suggestions.map(s=><button key={s} onClick={()=>setNom(s)} style={{padding:"3px 9px",borderRadius:20,fontSize:11,cursor:"pointer",border:`0.5px solid ${t.bd}`,background:nom===s?t.purpleBg:t.bg2,color:nom===s?t.purpleTx:t.tx2}}>{s}</button>)}
      </div>
      <FieldLabel>Statut</FieldLabel><ToggleGroup options={[["done","Fait ✓"],["next","Prochain"],["future","Prévu"]]} value={status} onChange={setStatus}/>
      <FieldLabel>Date</FieldLabel><FInput type="date" value={date} onChange={e=>setDate(e.target.value)}/>
      <FieldLabel>N° de lot (optionnel)</FieldLabel><FInput value={lot} onChange={e=>setLot(e.target.value)} placeholder="AB1234"/>
      <PrimaryBtn onClick={handleSave} disabled={!nom}>✓ Enregistrer</PrimaryBtn>
    </>:<SuccessScreen preview={[["Vaccin",nom],["Statut",status],["Date",date]]} onReset={()=>{setSaved(false);setNom("");}} resetLabel="Ajouter un autre vaccin"/>}
  </ModalShell>;
}

// ── 7. DODOZEN ────────────────────────────────────────────────────────────────
function DodoZen(){
  const {t}=useTheme();const {sommeils,addSommeil}=useApp();
  const [showModal,setShowModal]=useState(false);
  const nuits=sommeils.filter(s=>s.type==="nuit");
  const siestes=sommeils.filter(s=>s.type==="sieste");
  const dernNuit=nuits[0];
  const weekBars=[{day:"Lun",h:52,good:true},{day:"Mar",h:44,good:true},{day:"Mer",h:36,good:false},{day:"Jeu",h:48,good:true},{day:"Ven",h:28,good:false},{day:"Sam",h:56,good:true},{day:"Auj",h:40,good:true,current:true}];
  return <div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
      <StatCard label="🌙 Dernière nuit" value={dernNuit?.duree?.split(" ")[0]||"—"} unit={dernNuit?.duree?.split(" ").slice(1).join(" ")||""}/>
      <StatCard label="☀️ Siestes" value={siestes.length} unit="sessions"/>
    </div>
    {dernNuit&&<><SecTitle style={{marginTop:0}}>Dernière nuit</SecTitle>
    <Card>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:t.tx3,marginBottom:6}}><span>20h</span><span>00h</span><span>04h</span><span>07h</span></div>
      <div style={{display:"flex",height:26,gap:2,borderRadius:6,overflow:"hidden",marginBottom:10}}>
        <div style={{flex:2,background:t.bg3}}/><div style={{flex:10,background:t.purpleMid,borderRadius:3}}/><div style={{flex:1,background:t.bg3}}/><div style={{flex:4,background:t.purple,borderRadius:3,opacity:0.7}}/>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        <Badge color="purple">Coucher {dernNuit.debut}</Badge>
        <Badge color="teal">Lever {dernNuit.fin}</Badge>
        <Badge color={dernNuit.qualite==="bonne"?"teal":"amber"}>{dernNuit.qualite==="bonne"?"Bonne nuit":"Agitée"}</Badge>
      </div>
    </Card></>}
    <SecTitle>Siestes du jour</SecTitle>
    <Card padding="0 14px">
      {siestes.length===0&&<div style={{padding:"16px 0",textAlign:"center",color:t.tx3,fontSize:13}}>Aucune sieste enregistrée</div>}
      {siestes.map((s,i)=><div key={s.id} style={{display:"flex",gap:10,alignItems:"center",padding:"9px 0",borderBottom:i<siestes.length-1?`0.5px solid ${t.bd}`:"none"}}>
        <div style={{width:36,height:36,borderRadius:8,background:t.purpleBg,color:t.purpleMid,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>☀️</div>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:t.tx}}>Sieste · {s.duree}</div><div style={{fontSize:11,color:t.tx2}}>{s.debut} → {s.fin}</div></div>
        <Badge color={s.qualite==="bonne"?"teal":"amber"}>{s.qualite==="bonne"?"😴":"😣"}</Badge>
      </div>)}
    </Card>
    <SecTitle>Conseil</SecTitle>
    <div style={{background:t.purpleBg,border:`0.5px solid ${t.purple}`,borderRadius:12,padding:14,marginBottom:10}}>
      <div style={{fontSize:13,fontWeight:500,color:t.purpleTx,marginBottom:4}}>🌙 Régression des 8 mois</div>
      <div style={{fontSize:13,color:t.purpleMid,lineHeight:1.5}}>Pic de développement en cours. Les micro-réveils sont normaux. Maintenez la routine du coucher.</div>
    </div>
    <SecTitle>Semaine</SecTitle>
    <Card>
      <div style={{display:"flex",gap:5,alignItems:"flex-end",height:56,marginBottom:8}}>
        {weekBars.map((d,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <div style={{width:"100%",background:d.current?t.purple:d.good?t.purpleMid:t.bd2,borderRadius:"3px 3px 0 0",height:d.h,opacity:d.current?0.5:1}}/>
          <div style={{fontSize:9,color:d.current?t.purple:t.tx3,fontWeight:d.current?500:400}}>{d.day}</div>
        </div>)}
      </div>
    </Card>
    <AddButton onClick={()=>setShowModal(true)}>Enregistrer un sommeil</AddButton>
    {showModal&&<SommeilModal onClose={()=>setShowModal(false)} onSave={s=>{addSommeil(s);setShowModal(false);}}/>}
  </div>;
}

function SommeilModal({onClose,onSave}){
  const [saved,setSaved]=useState(false);const [sommeilType,setSommeilType]=useState("sieste");const [debut,setDebut]=useState("14:00");const [fin,setFin]=useState("14:45");const [humeur,setHumeur]=useState("enjouée");const [qualite,setQualite]=useState("bonne");const [reveils,setReveils]=useState("0");
  const duree=calcDuree(debut,fin);
  function handleSave(){onSave({type:sommeilType,debut,fin,duree,humeur,qualite,reveils});setSaved(true);}
  return <ModalShell title="Enregistrer un sommeil" onClose={onClose}>
    {!saved?<>
      <FieldLabel>Type</FieldLabel><ToggleGroup options={[["sieste","Sieste ☀️"],["nuit","Nuit 🌙"]]} value={sommeilType} onChange={setSommeilType}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><FieldLabel>Début</FieldLabel><FInput type="time" value={debut} onChange={e=>setDebut(e.target.value)}/></div>
        <div><FieldLabel>Fin</FieldLabel><FInput type="time" value={fin} onChange={e=>setFin(e.target.value)}/></div>
      </div>
      <InfoBox color="purple">⏱ Durée calculée : {duree}</InfoBox>
      {sommeilType==="nuit"&&<><FieldLabel>Réveils nocturnes</FieldLabel><ToggleGroup options={[["0","Aucun"],["1","1×"],["2","2×"],["3+","3+"]]} value={reveils} onChange={setReveils}/></>}
      <FieldLabel>Qualité</FieldLabel><ToggleGroup options={[["bonne","Bonne 😴"],["agitee","Agitée 😣"],["difficile","Difficile 😢"]]} value={qualite} onChange={setQualite}/>
      <FieldLabel>Humeur au réveil</FieldLabel><ToggleGroup options={[["enjouée","Enjouée 😄"],["calme","Calme 😊"],["pleurs","Pleurs 😢"]]} value={humeur} onChange={setHumeur}/>
      <PrimaryBtn onClick={handleSave}>✓ Enregistrer</PrimaryBtn>
    </>:<SuccessScreen preview={[["Type",sommeilType],["Début",debut],["Fin",fin],["Durée",duree]]} onReset={()=>setSaved(false)} resetLabel="Enregistrer un autre sommeil"/>}
  </ModalShell>;
}


// ── 8. MINUTEUR TÉTÉE ─────────────────────────────────────────────────────────
function MinuteurTetee(){
  const {t}=useTheme();const {addEntry}=useApp();
  const [running,setRunning]=useState(false);const [side,setSide]=useState("gauche");
  const [timeG,setTimeG]=useState(0);const [timeD,setTimeD]=useState(0);const [total,setTotal]=useState(0);
  const [lastSide,setLastSide]=useState(null);const [saved,setSaved]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{
    if(running){ref.current=setInterval(()=>{setTotal(p=>p+1);if(side==="gauche")setTimeG(p=>p+1);else setTimeD(p=>p+1);},1000);}
    else clearInterval(ref.current);
    return()=>clearInterval(ref.current);
  },[running,side]);
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  function switchSide(){setLastSide(side);setSide(s=>s==="gauche"?"droit":"gauche");}
  function stop(){setRunning(false);clearInterval(ref.current);}
  function saveSession(){addEntry({type:"biberon",side:`G(${fmt(timeG)})+D(${fmt(timeD)})`,qty:0,time:new Date().toTimeString().slice(0,5),note:`Total:${fmt(total)}`});setSaved(true);}
  function reset(){setRunning(false);setTimeG(0);setTimeD(0);setTotal(0);setLastSide(null);setSaved(false);}
  const C=2*Math.PI*54;const prog=Math.min(total/1200,1);
  return <div>
    <SecTitle style={{marginTop:0}}>Minuteur de tétée</SecTitle>
    <Card style={{textAlign:"center",padding:"24px 14px"}}>
      <div style={{position:"relative",width:120,height:120,margin:"0 auto 20px"}}>
        <svg viewBox="0 0 120 120" width="120" height="120" style={{transform:"rotate(-90deg)"}}>
          <circle cx="60" cy="60" r="54" fill="none" stroke={t.bg3} strokeWidth="6"/>
          <circle cx="60" cy="60" r="54" fill="none" stroke={t.purple} strokeWidth="6" strokeDasharray={C} strokeDashoffset={C*(1-prog)} strokeLinecap="round"/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontSize:26,fontWeight:500,color:t.tx}}>{fmt(total)}</div>
          <div style={{fontSize:11,color:t.tx2}}>total</div>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:24,marginBottom:20}}>
        {[["gauche","G"],["droit","D"]].map(([s,l])=><div key={s} style={{textAlign:"center"}}>
          <div style={{width:44,height:44,borderRadius:"50%",background:side===s&&running?t.purpleBg:t.bg2,border:side===s&&running?`2px solid ${t.purple}`:`0.5px solid ${t.bd}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 4px",fontSize:16,fontWeight:500,color:side===s&&running?t.purple:t.tx2}}>{l}</div>
          <div style={{fontSize:14,fontWeight:500,color:t.tx}}>{fmt(s==="gauche"?timeG:timeD)}</div>
          <div style={{fontSize:10,color:t.tx3}}>sein {s}</div>
        </div>)}
      </div>
      {lastSide&&!running&&<div style={{fontSize:12,color:t.amber,marginBottom:12}}>Dernier sein : {lastSide} — commence par le {lastSide==="gauche"?"droit":"gauche"} la prochaine fois</div>}
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
        {!running?<button onClick={()=>setRunning(true)} style={{padding:"10px 24px",background:t.purple,color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:500,cursor:"pointer"}}>{total>0?"▶ Reprendre":"▶ Démarrer"}</button>
        :<><button onClick={switchSide} style={{padding:"10px 16px",background:t.amberBg,color:t.amber,border:`0.5px solid ${t.amber}`,borderRadius:10,fontSize:13,cursor:"pointer"}}>⇄ Changer</button>
          <button onClick={stop} style={{padding:"10px 16px",background:t.bg2,color:t.tx,border:`0.5px solid ${t.bd}`,borderRadius:10,fontSize:13,cursor:"pointer"}}>⏸ Pause</button></>}
      </div>
      {total>0&&!running&&!saved&&<div style={{display:"flex",gap:8,marginTop:12,justifyContent:"center"}}>
        <button onClick={saveSession} style={{padding:"9px 16px",background:t.tealBg,color:t.teal,border:`0.5px solid ${t.teal}`,borderRadius:10,fontSize:13,cursor:"pointer"}}>✓ Enregistrer</button>
        <button onClick={reset} style={{padding:"9px 16px",background:t.bg2,color:t.tx2,border:`0.5px solid ${t.bd}`,borderRadius:10,fontSize:13,cursor:"pointer"}}>↺ Reset</button>
      </div>}
      {saved&&<div style={{marginTop:12,fontSize:13,color:t.teal,fontWeight:500}}>✓ Session enregistrée dans BabyLog</div>}
    </Card>
  </div>;
}

// ── 9. MÉDICAMENTS ────────────────────────────────────────────────────────────
function Medicaments(){
  const {t}=useTheme();const {medicaments,addMedicament,toggleMed}=useApp();
  const [showModal,setShowModal]=useState(false);
  return <div>
    <SecTitle style={{marginTop:0}}>Traitements en cours</SecTitle>
    {medicaments.map(m=><Card key={m.id}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
        <div style={{width:40,height:40,borderRadius:10,background:t[(m.couleur||"coral")+"Bg"],display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>💊</div>
        <div style={{flex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:14,fontWeight:500,color:t.tx}}>{m.nom}</div>
            <Toggle value={m.actif} onChange={()=>toggleMed(m.id)}/>
          </div>
          <div style={{fontSize:12,color:t.tx2,marginTop:2}}>{m.dose} · {m.frequence}</div>
          {m.actif&&m.prochaineDose&&<div style={{marginTop:6,display:"inline-flex",alignItems:"center",gap:5,background:t.amberBg,color:t.amber,fontSize:11,padding:"3px 8px",borderRadius:6}}>🔔 Prochaine dose : {m.prochaineDose}</div>}
          {!m.actif&&<div style={{marginTop:4,fontSize:11,color:t.tx3}}>Traitement inactif</div>}
        </div>
      </div>
    </Card>)}
    <AddButton onClick={()=>setShowModal(true)}>Ajouter un médicament</AddButton>
    {showModal&&<MedModal onClose={()=>setShowModal(false)} onSave={m=>{addMedicament(m);setShowModal(false);}}/>}
  </div>;
}

function MedModal({onClose,onSave}){
  const [saved,setSaved]=useState(false);const [nom,setNom]=useState("");const [dose,setDose]=useState("");const [freq,setFreq]=useState("toutes les 6h");const [debut,setDebut]=useState(new Date().toISOString().slice(0,10));const [note,setNote]=useState("");
  function handleSave(){onSave({nom,dose,frequence:freq,actif:true,prochaineDose:null,couleur:"coral"});setSaved(true);}
  return <ModalShell title="Ajouter un médicament" onClose={onClose}>
    {!saved?<>
      <FieldLabel>Nom du médicament</FieldLabel><FInput value={nom} onChange={e=>setNom(e.target.value)} placeholder="Ex : Doliprane 2.4%..."/>
      <FieldLabel>Dose</FieldLabel><FInput value={dose} onChange={e=>setDose(e.target.value)} placeholder="Ex : 2.5 ml, 1 dose..."/>
      <FieldLabel>Fréquence</FieldLabel><FSelect value={freq} onChange={e=>setFreq(e.target.value)}>{["toutes les 4h","toutes les 6h","toutes les 8h","2× par jour","1× par jour","matin et soir","si besoin"].map(f=><option key={f}>{f}</option>)}</FSelect>
      <FieldLabel>Date de début</FieldLabel><FInput type="date" value={debut} onChange={e=>setDebut(e.target.value)}/>
      <FieldLabel>Note / Indication</FieldLabel><FTextarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Ex : prescrit pour otite, fièvre..." style={{height:60}}/>
      <InfoBox color="amber">⚠️ Toujours suivre la prescription médicale. Ne pas dépasser les doses.</InfoBox>
      <PrimaryBtn onClick={handleSave} disabled={!nom||!dose}>✓ Enregistrer</PrimaryBtn>
    </>:<SuccessScreen preview={[["Médicament",nom],["Dose",dose],["Fréquence",freq]]} onReset={()=>setSaved(false)} resetLabel="Ajouter un autre médicament"/>}
  </ModalShell>;
}

// ── 10. TEMPÉRATURE ───────────────────────────────────────────────────────────
function Temperature(){
  const {t}=useTheme();const {temperatures,addTemperature}=useApp();
  const [showModal,setShowModal]=useState(false);
  const last=temperatures[temperatures.length-1];
  const fc=v=>v>=39?t.danger:v>=38?t.warning:t.success;
  const fl=v=>v>=39?"Fièvre élevée":v>=38?"Fièvre modérée":"Normale";
  const maxT=Math.max(...temperatures.map(x=>x.valeur));
  const minT=36.5;const range=Math.max(maxT-minT,2);
  return <div>
    {last&&<Card style={{textAlign:"center",padding:"20px 14px",marginBottom:10}}>
      <div style={{fontSize:42,fontWeight:500,color:fc(last.valeur)}}>{last.valeur.toFixed(1)}°C</div>
      <div style={{fontSize:13,color:t.tx2,marginTop:4}}>{fl(last.valeur)} · {last.heure}</div>
      {last.valeur>=38&&<div style={{marginTop:10,padding:"8px 12px",background:t.amberBg,borderRadius:8,fontSize:12,color:t.amber}}>{last.valeur>=39?"🌡️ Fièvre élevée — consultez un médecin si persistante":"🌡️ Fièvre modérée — surveiller l'évolution"}</div>}
    </Card>}
    <SecTitle>Évolution</SecTitle>
    <Card>
      <svg viewBox="0 0 300 80" style={{width:"100%",height:"auto"}}>
        <rect x="0" y={75-((38-minT)/range)*65} width="300" height="15" fill={t.amberBg} opacity="0.5"/>
        <line x1="0" y1={75-((38-minT)/range)*65} x2="300" y2={75-((38-minT)/range)*65} stroke={t.amber} strokeWidth="0.5" strokeDasharray="4,4"/>
        {temperatures.map((tp,i)=>{
          const x=20+(i/(temperatures.length-1))*260;
          const y=75-((tp.valeur-minT)/range)*65;
          return <g key={tp.id}>
            {i>0&&<line x1={20+((i-1)/(temperatures.length-1))*260} y1={75-((temperatures[i-1].valeur-minT)/range)*65} x2={x} y2={y} stroke={t.purpleMid} strokeWidth="1.5"/>}
            <circle cx={x} cy={y} r="4" fill={fc(tp.valeur)}/>
            <text x={x} y={y-7} fontSize="8" fill={t.tx3} textAnchor="middle">{tp.valeur.toFixed(1)}</text>
            <text x={x} y="78" fontSize="7" fill={t.tx3} textAnchor="middle">{tp.heure}</text>
          </g>;
        })}
        <text x="295" y={75-((38-minT)/range)*65+3} fontSize="7" fill={t.amber} textAnchor="end">38°</text>
      </svg>
    </Card>
    <SecTitle>Historique</SecTitle>
    <Card padding="0 14px">
      {[...temperatures].reverse().map((tp,i)=><div key={tp.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<temperatures.length-1?`0.5px solid ${t.bd}`:"none"}}>
        <div style={{width:10,height:10,borderRadius:"50%",background:fc(tp.valeur),flexShrink:0}}/>
        <div style={{flex:1}}><span style={{fontSize:15,fontWeight:500,color:fc(tp.valeur)}}>{tp.valeur.toFixed(1)}°C</span><span style={{fontSize:12,color:t.tx2,marginLeft:8}}>{fl(tp.valeur)}</span></div>
        <div style={{fontSize:11,color:t.tx3}}>{tp.date} {tp.heure}</div>
      </div>)}
    </Card>
    <AddButton onClick={()=>setShowModal(true)}>Enregistrer une température</AddButton>
    {showModal&&<TempModal onClose={()=>setShowModal(false)} onSave={tp=>{addTemperature(tp);setShowModal(false);}}/>}
  </div>;
}

function TempModal({onClose,onSave}){
  const {t}=useTheme();
  const [saved,setSaved]=useState(false);const [valeur,setValeur]=useState("37.0");const [date,setDate]=useState(new Date().toISOString().slice(0,10));const [heure,setHeure]=useState(new Date().toTimeString().slice(0,5));const [methode,setMethode]=useState("rectale");
  const val=parseFloat(valeur)||37;
  const fc=v=>v>=39?t.danger:v>=38?t.warning:t.success;
  function handleSave(){onSave({valeur:val,date,heure,methode});setSaved(true);}
  return <ModalShell title="Température" onClose={onClose}>
    {!saved?<>
      <FieldLabel>Température (°C)</FieldLabel>
      <div style={{textAlign:"center",padding:"12px 0"}}>
        <div style={{fontSize:44,fontWeight:500,color:fc(val)}}>{val.toFixed(1)}°C</div>
        <input type="range" min="35" max="42" step="0.1" value={valeur} onChange={e=>setValeur(e.target.value)} style={{width:"100%",marginTop:10}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:t.tx3}}><span>35°</span><span>38° fièvre</span><span>42°</span></div>
      </div>
      <FieldLabel>Méthode</FieldLabel><ToggleGroup options={[["rectale","Rectale"],["axillaire","Axillaire"],["tympanique","Tympanique"]]} value={methode} onChange={setMethode}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><FieldLabel>Date</FieldLabel><FInput type="date" value={date} onChange={e=>setDate(e.target.value)}/></div><div><FieldLabel>Heure</FieldLabel><FInput type="time" value={heure} onChange={e=>setHeure(e.target.value)}/></div></div>
      {val>=38&&<InfoBox color="amber">🌡️ {val>=39?"Fièvre élevée — consulter un médecin":"Fièvre modérée — surveiller toutes les 4h"}</InfoBox>}
      <PrimaryBtn onClick={handleSave}>✓ Enregistrer</PrimaryBtn>
    </>:<SuccessScreen preview={[["Température",val.toFixed(1)+"°C"],["Méthode",methode],["Heure",heure]]} onReset={()=>setSaved(false)} resetLabel="Enregistrer une autre mesure"/>}
  </ModalShell>;
}


// ── 11. DIVERSIFICATION ───────────────────────────────────────────────────────
function Diversification(){
  const {t}=useTheme();const {aliments,updateAliment,addAliment}=useApp();
  const [filtre,setFiltre]=useState("tous");const [showModal,setShowModal]=useState(false);
  const cats=["tous","Légumes","Fruits","Protéines","Céréales","Laitiers"];
  const sCol={"accepté":"teal","en cours":"amber","à tester":"gray","rejeté":"coral"};
  const filtered=filtre==="tous"?aliments:aliments.filter(a=>a.categorie===filtre);
  return <div>
    <InfoBox color="teal" style={{marginTop:0}}>🥦 Léa a 8 mois. Introduire un nouvel aliment toutes les 3–4 jours pour détecter les allergies.</InfoBox>
    <SecTitle>Filtrer</SecTitle>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
      {cats.map(c=><button key={c} onClick={()=>setFiltre(c)} style={{padding:"5px 12px",borderRadius:20,fontSize:12,cursor:"pointer",border:filtre===c?`0.5px solid ${t.purple}`:`0.5px solid ${t.bd}`,background:filtre===c?t.purpleBg:t.bg2,color:filtre===c?t.purpleTx:t.tx2}}>{c}</button>)}
    </div>
    <Card padding="0 14px">
      {filtered.map((a,i)=><div key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<filtered.length-1?`0.5px solid ${t.bd}`:"none"}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:t[(sCol[a.statut]||"gray")+"Bg"],border:`2px solid ${t[sCol[a.statut]||"gray"]||t.bd}`,flexShrink:0}}/>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:13,fontWeight:500,color:t.tx}}>{a.nom}</span>
            {a.allergene&&<span style={{fontSize:10,background:t.amberBg,color:t.amber,padding:"1px 5px",borderRadius:4}}>⚠️ allergène</span>}
          </div>
          <div style={{fontSize:11,color:t.tx2}}>{a.categorie} · Dès {a.age} mois</div>
        </div>
        <select value={a.statut} onChange={e=>updateAliment(a.id,e.target.value)} style={{fontSize:11,padding:"3px 6px",border:`0.5px solid ${t.bd}`,borderRadius:6,background:t.bg2,color:t[( sCol[a.statut]||"gray")+"Tx"]||t.tx2,cursor:"pointer"}}>
          {["accepté","en cours","à tester","rejeté"].map(s=><option key={s}>{s}</option>)}
        </select>
      </div>)}
    </Card>
    <AddButton onClick={()=>setShowModal(true)}>Ajouter un aliment</AddButton>
    {showModal&&<AlimentModal onClose={()=>setShowModal(false)} onSave={a=>{addAliment(a);setShowModal(false);}}/>}
  </div>;
}

function AlimentModal({onClose,onSave}){
  const {t}=useTheme();
  const [saved,setSaved]=useState(false);const [nom,setNom]=useState("");const [cat,setCat]=useState("Légumes");const [age,setAge]=useState(6);const [allergene,setAllergene]=useState(false);const [note,setNote]=useState("");
  function handleSave(){onSave({nom,categorie:cat,age,allergene,statut:"à tester",note});setSaved(true);}
  return <ModalShell title="Ajouter un aliment" onClose={onClose}>
    {!saved?<>
      <FieldLabel>Nom</FieldLabel><FInput value={nom} onChange={e=>setNom(e.target.value)} placeholder="Ex : Courgette, Poire..."/>
      <FieldLabel>Catégorie</FieldLabel><ToggleGroup options={[["Légumes","🥦 Légumes"],["Fruits","🍎 Fruits"],["Protéines","🍗 Protéines"],["Céréales","🌾 Céréales"],["Laitiers","🥛 Laitiers"]]} value={cat} onChange={setCat}/>
      <FieldLabel>Âge minimum (mois)</FieldLabel>
      <div style={{display:"flex",alignItems:"center",gap:10}}><input type="range" min="4" max="12" step="1" value={age} onChange={e=>setAge(Number(e.target.value))} style={{flex:1}}/><span style={{fontSize:15,fontWeight:500,color:t.tx,minWidth:40}}>{age} mois</span></div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginTop:14,padding:"10px 0",borderTop:`0.5px solid ${t.bd}`}}>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:t.tx}}>Allergène majeur</div><div style={{fontSize:11,color:t.tx2}}>Lait, gluten, oeufs, noix...</div></div>
        <Toggle value={allergene} onChange={setAllergene}/>
      </div>
      <FieldLabel>Note</FieldLabel><FTextarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Remarques, texture, réaction..." style={{height:60}}/>
      <PrimaryBtn onClick={handleSave} disabled={!nom}>✓ Ajouter</PrimaryBtn>
    </>:<SuccessScreen preview={[["Aliment",nom],["Catégorie",cat],["Âge min",age+" mois"],["Allergène",allergene?"Oui":"Non"]]} onReset={()=>setSaved(false)} resetLabel="Ajouter un autre aliment"/>}
  </ModalShell>;
}

// ── 12. STATISTIQUES ──────────────────────────────────────────────────────────
function Statistiques(){
  const {t}=useTheme();const {entries}=useApp();
  const [periode,setPeriode]=useState("7j");
  const bibData=[180,150,210,160,180,200,entries.filter(e=>e.type==="biberon").reduce((a,e)=>a+(Number(e.qty)||0),0)||170];
  const somData=[9.5,8.8,10.2,9.0,9.8,10.5,9.75];
  const cData=[5,4,6,5,5,4,3+entries.filter(e=>e.type==="couche").length];
  const jours=["Lun","Mar","Mer","Jeu","Ven","Sam","Auj"];
  const maxB=Math.max(...bibData);const maxS=Math.max(...somData);
  return <div>
    <div style={{display:"flex",gap:6,marginBottom:14}}>
      {[["7j","7 jours"],["30j","30 jours"],["3m","3 mois"]].map(([k,l])=><button key={k} onClick={()=>setPeriode(k)} style={{flex:1,padding:"8px",borderRadius:8,fontSize:12,border:periode===k?`0.5px solid ${t.purple}`:`0.5px solid ${t.bd}`,background:periode===k?t.purpleBg:t.bg2,color:periode===k?t.purpleTx:t.tx2,cursor:"pointer"}}>{l}</button>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
      <StatCard label="💧 Moy. biberon" value={Math.round(bibData.reduce((a,b)=>a+b,0)/7)} unit="ml/j"/>
      <StatCard label="🌙 Moy. sommeil" value={(somData.reduce((a,b)=>a+b,0)/7).toFixed(1)} unit="h/n"/>
      <StatCard label="😊 Moy. couches" value={(cData.reduce((a,b)=>a+b,0)/7).toFixed(1)} unit="/j"/>
      <StatCard label="🍼 Total biberons" value={bibData.reduce((a,b)=>a+b,0)} unit="ml/7j"/>
    </div>
    <SecTitle>Volume biberon (ml)</SecTitle>
    <Card>
      <div style={{display:"flex",gap:5,alignItems:"flex-end",height:70,marginBottom:8}}>
        {bibData.map((v,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <div style={{fontSize:8,color:t.tx3}}>{v}</div>
          <div style={{width:"100%",background:i===6?t.purple:t.purpleBg,borderRadius:"3px 3px 0 0",height:(v/maxB)*62,border:`0.5px solid ${t.purpleMid}`}}/>
          <div style={{fontSize:9,color:i===6?t.purple:t.tx3,fontWeight:i===6?500:400}}>{jours[i]}</div>
        </div>)}
      </div>
    </Card>
    <SecTitle>Durée de sommeil (h)</SecTitle>
    <Card>
      <div style={{display:"flex",gap:5,alignItems:"flex-end",height:70,marginBottom:8}}>
        {somData.map((v,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <div style={{fontSize:8,color:t.tx3}}>{v.toFixed(1)}</div>
          <div style={{width:"100%",background:i===6?t.teal:t.tealBg,borderRadius:"3px 3px 0 0",height:(v/maxS)*62,border:`0.5px solid ${t.teal}`}}/>
          <div style={{fontSize:9,color:i===6?t.teal:t.tx3,fontWeight:i===6?500:400}}>{jours[i]}</div>
        </div>)}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:t.tx2}}>
        <span>Min : {Math.min(...somData).toFixed(1)}h</span><span>Moy : {(somData.reduce((a,b)=>a+b,0)/7).toFixed(1)}h</span><span>Max : {Math.max(...somData).toFixed(1)}h</span>
      </div>
    </Card>
    <SecTitle>Couches par jour</SecTitle>
    <Card>
      <div style={{display:"flex",gap:5,alignItems:"flex-end",height:50,marginBottom:8}}>
        {cData.map((v,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <div style={{width:"100%",background:i===6?t.amber:t.amberBg,borderRadius:"3px 3px 0 0",height:(v/7)*44,border:`0.5px solid ${t.amber}`}}/>
          <div style={{fontSize:9,color:t.tx3}}>{jours[i]}</div>
        </div>)}
      </div>
    </Card>
  </div>;
}

// ── 13. JOURNAL ───────────────────────────────────────────────────────────────
function Journal(){
  const {t}=useTheme();const {journal,addJournal}=useApp();
  const [showModal,setShowModal]=useState(false);
  const tagCol={"étape":"purple","souvenir":"teal","santé":"coral","drôle":"amber"};
  return <div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
      <StatCard label="📖 Souvenirs" value={journal.length} unit="entrées"/>
      <StatCard label="👣 Étapes" value={journal.filter(j=>j.tag==="étape").length} unit="franchies"/>
    </div>
    <SecTitle>Moments forts</SecTitle>
    {journal.map(j=><Card key={j.id}>
      <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
        <div style={{width:42,height:42,borderRadius:10,background:t.purpleBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{j.emoji}</div>
        <div style={{flex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:14,fontWeight:500,color:t.tx}}>{j.titre}</div>
            <Badge color={tagCol[j.tag]||"gray"}>{j.tag}</Badge>
          </div>
          <div style={{fontSize:12,color:t.tx3,marginTop:1}}>{j.date}</div>
          <div style={{fontSize:13,color:t.tx2,marginTop:6,lineHeight:1.5}}>{j.texte}</div>
        </div>
      </div>
    </Card>)}
    <AddButton onClick={()=>setShowModal(true)}>Ajouter un souvenir</AddButton>
    {showModal&&<JournalModal onClose={()=>setShowModal(false)} onSave={j=>{addJournal(j);setShowModal(false);}}/>}
  </div>;
}

function JournalModal({onClose,onSave}){
  const {t}=useTheme();
  const [saved,setSaved]=useState(false);const [titre,setTitre]=useState("");const [texte,setTexte]=useState("");const [emoji,setEmoji]=useState("⭐");const [tag,setTag]=useState("souvenir");const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const emojis=["⭐","👣","💬","🌳","😂","🎉","💊","🏥","🛁","🎁","❤️","🌙"];
  function handleSave(){onSave({titre,texte,emoji,tag,date});setSaved(true);}
  return <ModalShell title="Nouveau souvenir" onClose={onClose}>
    {!saved?<>
      <FieldLabel>Emoji</FieldLabel>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {emojis.map(e=><button key={e} onClick={()=>setEmoji(e)} style={{width:36,height:36,fontSize:20,border:emoji===e?`2px solid ${t.purple}`:`0.5px solid ${t.bd}`,borderRadius:8,background:emoji===e?t.purpleBg:t.bg2,cursor:"pointer"}}>{e}</button>)}
      </div>
      <FieldLabel>Titre</FieldLabel><FInput value={titre} onChange={e=>setTitre(e.target.value)} placeholder="Ex : Premiers pas, Premier mot..."/>
      <FieldLabel>Date</FieldLabel><FInput type="date" value={date} onChange={e=>setDate(e.target.value)}/>
      <FieldLabel>Tag</FieldLabel><ToggleGroup options={[["étape","🏆 Étape"],["souvenir","📸 Souvenir"],["santé","🏥 Santé"],["drôle","😂 Drôle"]]} value={tag} onChange={setTag}/>
      <FieldLabel>Description</FieldLabel><FTextarea value={texte} onChange={e=>setTexte(e.target.value)} placeholder="Raconte ce moment..." style={{height:80}}/>
      <PrimaryBtn onClick={handleSave} disabled={!titre}>✓ Enregistrer ce souvenir</PrimaryBtn>
    </>:<SuccessScreen preview={[["Titre",titre],["Tag",tag],["Date",date]]} onReset={()=>{setSaved(false);setTitre("");setTexte("");}} resetLabel="Ajouter un autre souvenir"/>}
  </ModalShell>;
}

// ── 14. FAMILLE ───────────────────────────────────────────────────────────────
function Famille(){
  const {t}=useTheme();const {membres,inviteMembre}=useApp();
  const [showModal,setShowModal]=useState(false);
  const rCol={admin:"purple",editeur:"teal",lecteur:"amber"};
  const rLab={admin:"Admin",editeur:"Éditeur",lecteur:"Lecture seule"};
  return <div>
    <SecTitle style={{marginTop:0}}>Membres</SecTitle>
    <Card padding="0 14px">
      {membres.map((m,i)=><div key={m.uid} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<membres.length-1?`0.5px solid ${t.bd}`:"none"}}>
        <div style={{position:"relative"}}><Avatar initials={m.initiales} color={m.couleur}/>
          <div style={{position:"absolute",bottom:0,right:0,width:9,height:9,borderRadius:"50%",background:m.online?t.success:t.bd2,border:`1.5px solid ${t.bg}`}}/>
        </div>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:t.tx}}>{m.nom}</div><div style={{fontSize:11,color:t.tx2}}>{m.email}</div></div>
        <Badge color={rCol[m.role]}>{rLab[m.role]}</Badge>
      </div>)}
    </Card>
    <SecTitle>Rôles</SecTitle>
    <Card padding="0 14px">
      {[["admin","purple","Tout modifier, inviter, supprimer"],["editeur","teal","Ajouter et modifier des entrées"],["lecteur","amber","Consulter uniquement"]].map(([role,color,desc],i)=><div key={role} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 0",borderBottom:i<2?`0.5px solid ${t.bd}`:"none"}}>
        <div style={{width:10,height:10,borderRadius:2,background:t[color],flexShrink:0}}/>
        <div><div style={{fontSize:13,color:t.tx,fontWeight:500}}>{rLab[role]}</div><div style={{fontSize:11,color:t.tx2}}>{desc}</div></div>
      </div>)}
    </Card>
    <AddButton onClick={()=>setShowModal(true)}>Inviter un membre</AddButton>
    {showModal&&<InviteModal onClose={()=>setShowModal(false)} onSave={m=>{inviteMembre(m);setShowModal(false);}}/>}
  </div>;
}

function InviteModal({onClose,onSave}){
  const [saved,setSaved]=useState(false);const [email,setEmail]=useState("");const [nom,setNom]=useState("");const [role,setRole]=useState("editeur");
  function handleSave(){onSave({email,nom,role,initiales:(nom||email).slice(0,2).toUpperCase(),couleur:"gray"});setSaved(true);}
  return <ModalShell title="Inviter un membre" onClose={onClose}>
    {!saved?<>
      <FieldLabel>Prénom</FieldLabel><FInput value={nom} onChange={e=>setNom(e.target.value)} placeholder="Ex : Mamie, Nounou..."/>
      <FieldLabel>Email</FieldLabel><FInput type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@exemple.com"/>
      <FieldLabel>Rôle</FieldLabel><ToggleGroup options={[["editeur","Éditeur"],["lecteur","Lecture seule"]]} value={role} onChange={setRole}/>
      <InfoBox color="purple">Un email d'invitation Firebase sera envoyé automatiquement.</InfoBox>
      <PrimaryBtn onClick={handleSave} disabled={!email}>✉️ Envoyer l'invitation</PrimaryBtn>
    </>:<SuccessScreen preview={[["Email",email],["Rôle",role]]} onReset={()=>setSaved(false)} resetLabel="Inviter une autre personne"/>}
  </ModalShell>;
}


// ── 15. RÉGLAGES ──────────────────────────────────────────────────────────────
function Reglages({user,onLogout}){
  const {t,dark,toggleDark}=useTheme();
  const [notifs,setNotifs]=useState({biberon:true,couche:true,sommeil:true,vaccin:true,medoc:true,activite:false});
  const syncStats={lectures:1240,ecritures:342,stockage:"14 Mo / 1 Go",quota:14};
  return <div>
    <SecTitle style={{marginTop:0}}>Mon compte</SecTitle>
    <Card padding="0 14px">
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`0.5px solid ${t.bd}`}}>
        <Avatar initials={(user?.displayName||"U").slice(0,2).toUpperCase()} color="purple" size={40}/>
        <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:t.tx}}>{user?.displayName||"Utilisateur"}</div><div style={{fontSize:12,color:t.tx2}}>{user?.email}</div></div>
        <Badge color="purple">Admin</Badge>
      </div>
      <div style={{padding:"10px 0"}}>
        <button onClick={onLogout} style={{fontSize:13,color:t.danger,background:"none",border:"none",cursor:"pointer",padding:0}}>Se déconnecter</button>
      </div>
    </Card>
    <SecTitle>Apparence</SecTitle>
    <Card padding="0 14px">
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`0.5px solid ${t.bd}`}}>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:t.tx}}>Mode sombre</div><div style={{fontSize:11,color:t.tx2}}>Interface sombre pour la nuit</div></div>
        <Toggle value={dark} onChange={toggleDark}/>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0"}}>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:t.tx}}>Mode nuit automatique</div><div style={{fontSize:11,color:t.tx2}}>Sombre de 21h à 7h automatiquement</div></div>
        <Toggle value={false} onChange={()=>{}}/>
      </div>
    </Card>
    <SecTitle>Notifications push</SecTitle>
    <Card padding="0 14px">
      {[["biberon","💧 Prochain biberon","30 min avant l'heure estimée"],["couche","😊 Rappel couche","Pas changée depuis 3h"],["sommeil","🌙 Heure du coucher","Routine soir 19h30"],["vaccin","💉 Vaccin à venir","7 jours avant la date"],["medoc","💊 Médicament","À l'heure de la dose"],["activite","👥 Activité co-parent","Entrée ajoutée par l'autre parent"]].map(([key,label,sub],i,arr)=><div key={key} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<arr.length-1?`0.5px solid ${t.bd}`:"none"}}>
        <div style={{flex:1}}><div style={{fontSize:13,color:t.tx}}>{label}</div><div style={{fontSize:11,color:t.tx2}}>{sub}</div></div>
        <Toggle value={notifs[key]} onChange={v=>setNotifs(p=>({...p,[key]:v}))}/>
      </div>)}
    </Card>
    <SecTitle>Firebase</SecTitle>
    <Card padding="0 14px">
      {[["Synchronisation","● Active","teal"],["Dernière sync","il y a 12 sec",null],["Lectures ce mois",syncStats.lectures+"/50 000",null],["Écritures ce mois",syncStats.ecritures+"/20 000",null],["Stockage",syncStats.stockage,null]].map(([label,val,color],i,arr)=><div key={label} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<arr.length-1?`0.5px solid ${t.bd}`:"none"}}>
        <div style={{flex:1,fontSize:13,color:t.tx}}>{label}</div>
        <span style={{fontSize:12,color:color?t[color]:t.tx2,fontWeight:color?500:400}}>{val}</span>
      </div>)}
      <div style={{paddingTop:10}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:t.tx2,marginBottom:4}}><span>Quota stockage</span><span>{syncStats.quota}%</span></div>
        <div style={{height:4,background:t.bg3,borderRadius:2}}><div style={{height:"100%",width:syncStats.quota+"%",background:t.teal,borderRadius:2}}/></div>
      </div>
    </Card>
    <SecTitle>Exporter les données</SecTitle>
    <Card padding="0 14px">
      {[["📄 Rapport PDF pédiatre","Résumé complet pour le médecin"],["📊 Export CSV","Toutes les entrées brutes"]].map(([label,sub],i)=><div key={label} style={{display:"flex",alignItems:"center",padding:"10px 0",borderBottom:i===0?`0.5px solid ${t.bd}`:"none",cursor:"pointer"}}>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:t.tx}}>{label}</div><div style={{fontSize:11,color:t.tx2}}>{sub}</div></div>
        <span style={{fontSize:14,color:t.tx3}}>›</span>
      </div>)}
    </Card>
  </div>;
}

// ── 16. MAIN APP ──────────────────────────────────────────────────────────────
const TABS=[
  {id:"log",   icon:"📓",label:"Journal"},
  {id:"sante", icon:"📈",label:"Santé"},
  {id:"dodo",  icon:"🌙",label:"Dodo"},
  {id:"outils",icon:"🛠️",label:"Outils"},
  {id:"config",icon:"⚙️", label:"Réglages"},
];
const OUTILS=[
  {id:"minuteur",icon:"⏱️",label:"Minuteur"},
  {id:"medoc",   icon:"💊",label:"Médocs"},
  {id:"temp",    icon:"🌡️",label:"Fièvre"},
  {id:"divers",  icon:"🥦",label:"Aliments"},
  {id:"stats",   icon:"📊",label:"Stats"},
  {id:"journal", icon:"📸",label:"Journal"},
  {id:"famille", icon:"👨‍👩‍👧",label:"Famille"},
];

export default function BabyTracker(){
  const [dark,setDark]=useState(false);
  const [tab,setTab]=useState("log");
  const [outilTab,setOutilTab]=useState("minuteur");
  const [showBabyLogModal,setShowBabyLogModal]=useState(false);
  const {user,loading,login,register,logout}=useFirebaseAuth();
  const data=useFirebaseData(user);
  const t=dark?DARK:LIGHT;

  useEffect(()=>{const h=new Date().getHours();if(h>=21||h<7)setDark(true);},[]);

  const theme={t,dark,toggleDark:()=>setDark(d=>!d)};

  if(!user) return (
    <ThemeContext.Provider value={theme}>
      <div style={{background:t.bg,minHeight:"100vh"}}>
        <AuthScreen onLogin={login} onRegister={register} loading={loading}/>
      </div>
    </ThemeContext.Provider>
  );

  return (
    <ThemeContext.Provider value={theme}>
      <AppContext.Provider value={data}>
        <div style={{maxWidth:420,margin:"0 auto",background:t.bg,minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"system-ui,-apple-system,sans-serif"}}>

          {/* Header */}
          <div style={{background:t.headerBg,padding:"18px 16px 12px",flexShrink:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:20,fontWeight:500,color:"#fff"}}>Léa 👶</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.65)",marginTop:2}}>8 mois · Famille Martin</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginRight:4}}>v{APP_VERSION}</span>
                <button onClick={()=>setDark(d=>!d)} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:20,padding:"4px 10px",color:"#fff",fontSize:12,cursor:"pointer"}}>{dark?"☀️":"🌙"}</button>
                <div style={{display:"flex"}}>
                  {data.membres.filter(m=>m.online).map(m=><div key={m.uid} style={{width:26,height:26,borderRadius:"50%",background:"rgba(255,255,255,0.25)",border:`1.5px solid ${t.headerBg}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",marginLeft:-4}}>{m.initiales}</div>)}
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <div style={{display:"flex",borderBottom:`0.5px solid ${t.bd}`,background:t.bg,flexShrink:0}}>
            {TABS.map(tb=><button key={tb.id} onClick={()=>setTab(tb.id)} style={{flex:1,padding:"10px 4px 8px",fontSize:10,background:"none",border:"none",borderBottom:tab===tb.id?`2px solid ${t.purple}`:"2px solid transparent",color:tab===tb.id?t.purple:t.tx2,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"all 0.15s"}}>
              <span style={{fontSize:17}}>{tb.icon}</span>
              <span style={{fontWeight:tab===tb.id?500:400}}>{tb.label}</span>
            </button>)}
          </div>

          {/* Outils sub-nav */}
          {tab==="outils"&&<div style={{display:"flex",overflowX:"auto",padding:"8px 12px",gap:6,borderBottom:`0.5px solid ${t.bd}`,background:t.bg2,flexShrink:0}}>
            {OUTILS.map(ot=><button key={ot.id} onClick={()=>setOutilTab(ot.id)} style={{padding:"5px 12px",borderRadius:20,fontSize:11,background:outilTab===ot.id?t.purple:t.bg,color:outilTab===ot.id?"#fff":t.tx2,border:`0.5px solid ${outilTab===ot.id?t.purple:t.bd}`,cursor:"pointer",whiteSpace:"nowrap",fontWeight:outilTab===ot.id?500:400}}>
              {ot.icon} {ot.label}
            </button>)}
          </div>}

          {/* Content */}
          <div style={{flex:1,overflowY:"auto",padding:14}}>
            {tab==="log"    &&<BabyLog onAdd={()=>setShowBabyLogModal(true)}/>}
            {tab==="sante"  &&<GrandisBien/>}
            {tab==="dodo"   &&<DodoZen/>}
            {tab==="outils" &&outilTab==="minuteur"&&<MinuteurTetee/>}
            {tab==="outils" &&outilTab==="medoc"   &&<Medicaments/>}
            {tab==="outils" &&outilTab==="temp"    &&<Temperature/>}
            {tab==="outils" &&outilTab==="divers"  &&<Diversification/>}
            {tab==="outils" &&outilTab==="stats"   &&<Statistiques/>}
            {tab==="outils" &&outilTab==="journal" &&<Journal/>}
            {tab==="outils" &&outilTab==="famille" &&<Famille/>}
            {tab==="config" &&<Reglages user={user} onLogout={logout}/>}
          </div>

          {/* Modals */}
          {showBabyLogModal&&<BabyLogModal onClose={()=>setShowBabyLogModal(false)}/>}
        </div>
      </AppContext.Provider>
    </ThemeContext.Provider>
  );
}

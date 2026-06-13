const APP_VERSION = "1.0.0"; // valeur de secours pour la preview — remplacee par version.js au build
const APP_NAME = "OmniBaby";

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
// ── 2. STOCKAGE LOCAL (localStorage) ──────────────────────────────────────────
const STORAGE_KEY  = "omnibaby_store_v1";
const SESSION_KEY  = "omnibaby_session_v1";
const LAST_USER_KEY = "omnibaby_last_user_v1";

function defaultStore(){
  return {
    child: null,
    users: [],
    entries: [], mesures: [], vaccins: [], sommeils: [],
    medicaments: [], temperatures: [], aliments: [], journal: [],
    etapesDiv: {},
  };
}

function loadStore(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultStore();
    const parsed = JSON.parse(raw);
    return { ...defaultStore(), ...parsed };
  }catch(e){ return defaultStore(); }
}

function useLocalStore(){
  const [store, setStore] = useState(loadStore);

  useEffect(()=>{
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }catch(e){}
  },[store]);

  const now   = () => new Date().toTimeString().slice(0,5);
  const today = () => new Date().toISOString().slice(0,10);

  // ── Enfant ──────────────────────────────────────────────────────────────
  const setChild    = c => setStore(s=>({...s, child: c}));
  const deleteChild = () => setStore(s=>({...s, child: null}));

  // ── Utilisateurs ────────────────────────────────────────────────────────
  const addUser    = u => setStore(s=>({...s, users:[...s.users, {...u, id:Date.now()}]}));
  const updateUser = (id,patch) => setStore(s=>({...s, users: s.users.map(u=>u.id===id?{...u,...patch}:u)}));
  const deleteUser = id => setStore(s=>({...s, users: s.users.filter(u=>u.id!==id)}));

  // ── Entrées BabyLog ─────────────────────────────────────────────────────
  const addEntry    = (e,author) => setStore(s=>({...s, entries:[{...e,id:Date.now(),author:author||"Moi",synced:true,time:e.time||now()},...s.entries]}));
  const deleteEntry = id => setStore(s=>({...s, entries: s.entries.filter(e=>e.id!==id)}));
  const updateEntry = (id,patch) => setStore(s=>({...s, entries: s.entries.map(e=>e.id===id?{...e,...patch}:e)}));

  // ── Mesures (croissance) ───────────────────────────────────────────────
  const setMesure    = m => setStore(s=>{
    const exists = s.mesures.find(x=>x.label===m.label);
    if(exists) return {...s, mesures: s.mesures.map(x=>x.label===m.label?{...x,...m}:x)};
    return {...s, mesures:[...s.mesures, {...m, id:Date.now()}]};
  });
  const deleteMesure = label => setStore(s=>({...s, mesures: s.mesures.filter(m=>m.label!==label)}));

  // ── Vaccins ─────────────────────────────────────────────────────────────
  const addVaccin    = v => setStore(s=>({...s, vaccins:[...s.vaccins,{...v,id:Date.now()}]}));
  const deleteVaccin = id => setStore(s=>({...s, vaccins: s.vaccins.filter(v=>v.id!==id)}));
  const updateVaccin = (id,patch) => setStore(s=>({...s, vaccins: s.vaccins.map(v=>v.id===id?{...v,...patch}:v)}));

  // ── Sommeils ────────────────────────────────────────────────────────────
  const addSommeil    = sm => setStore(s=>({...s, sommeils:[{...sm,id:Date.now(),date:today()},...s.sommeils]}));
  const deleteSommeil = id => setStore(s=>({...s, sommeils: s.sommeils.filter(x=>x.id!==id)}));
  const updateSommeil = (id,patch) => setStore(s=>({...s, sommeils: s.sommeils.map(x=>x.id===id?{...x,...patch}:x)}));

  // ── Médicaments ─────────────────────────────────────────────────────────
  const addMedicament    = m => setStore(s=>({...s, medicaments:[...s.medicaments,{...m,id:Date.now()}]}));
  const deleteMedicament = id => setStore(s=>({...s, medicaments: s.medicaments.filter(m=>m.id!==id)}));
  const toggleMed        = id => setStore(s=>({...s, medicaments: s.medicaments.map(m=>m.id===id?{...m,actif:!m.actif}:m)}));
  const updateMedicament = (id,patch) => setStore(s=>({...s, medicaments: s.medicaments.map(m=>m.id===id?{...m,...patch}:m)}));

  // ── Températures ────────────────────────────────────────────────────────
  const addTemperature    = t => setStore(s=>({...s, temperatures:[...s.temperatures,{...t,id:Date.now()}]}));
  const deleteTemperature = id => setStore(s=>({...s, temperatures: s.temperatures.filter(t=>t.id!==id)}));
  const updateTemperature = (id,patch) => setStore(s=>({...s, temperatures: s.temperatures.map(t=>t.id===id?{...t,...patch}:t)}));

  // ── Aliments (diversification) ─────────────────────────────────────────
  const addAliment    = a => setStore(s=>({...s, aliments:[...s.aliments,{...a,id:Date.now()}]}));
  const deleteAliment = id => setStore(s=>({...s, aliments: s.aliments.filter(a=>a.id!==id)}));
  const updateAliment = (id,statut) => setStore(s=>({...s, aliments: s.aliments.map(a=>a.id===id?{...a,statut}:a)}));
  const updateAlimentFull = (id,patch) => setStore(s=>({...s, aliments: s.aliments.map(a=>a.id===id?{...a,...patch}:a)}));
  const toggleEtapeDiv = (stepId) => setStore(s=>({...s, etapesDiv: {...(s.etapesDiv||{}), [stepId]: !(s.etapesDiv||{})[stepId]}}));

  // ── Journal ─────────────────────────────────────────────────────────────
  const addJournal    = j => setStore(s=>({...s, journal:[{...j,id:Date.now()},...s.journal]}));
  const deleteJournal = id => setStore(s=>({...s, journal: s.journal.filter(j=>j.id!==id)}));
  const updateJournal = (id,patch) => setStore(s=>({...s, journal: s.journal.map(j=>j.id===id?{...j,...patch}:j)}));

  // ── Reset complet / Export / Import ────────────────────────────────────
  const resetAll = () => {
    setStore(defaultStore());
    try{
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SESSION_KEY);
    }catch(e){}
  };

  const exportData = () => JSON.stringify(store, null, 2);

  const importData = (jsonString) => {
    try{
      const parsed = JSON.parse(jsonString);
      setStore({ ...defaultStore(), ...parsed });
      return true;
    }catch(e){ return false; }
  };

  return {
    child: store.child, setChild, deleteChild,
    users: store.users, addUser, updateUser, deleteUser,
    entries: store.entries, mesures: store.mesures, vaccins: store.vaccins,
    sommeils: store.sommeils, medicaments: store.medicaments,
    temperatures: store.temperatures, aliments: store.aliments, journal: store.journal,
    addEntry, deleteEntry, updateEntry,
    addMesure: setMesure, deleteMesure,
    addVaccin, deleteVaccin, updateVaccin,
    addSommeil, deleteSommeil, updateSommeil,
    addMedicament, deleteMedicament, toggleMed, updateMedicament,
    addTemperature, deleteTemperature, updateTemperature,
    addAliment, deleteAliment, updateAliment, updateAlimentFull,
    etapesDiv: store.etapesDiv||{}, toggleEtapeDiv,
    addJournal, deleteJournal, updateJournal,
    resetAll, exportData, importData,
  };
}

// ── AUTHENTIFICATION LOCALE (PIN + biométrie) ─────────────────────────────────
async function tryBiometricUnlock(){
  try{
    const mod = await import(/* @vite-ignore */ "capacitor-native-biometric");
    const { NativeBiometric } = mod;
    const avail = await NativeBiometric.isAvailable();
    if(!avail || !avail.isAvailable) return { ok:false, reason:"unavailable" };
    await NativeBiometric.verifyIdentity({
      reason: "Déverrouiller OmniBaby",
      title: "Authentification",
      subtitle: "Utilise ton empreinte digitale",
      description: "",
    });
    return { ok:true };
  }catch(e){
    return { ok:false, reason:"failed" };
  }
}

function useAuth(users){
  const [currentUserId,setCurrentUserId] = useState(()=>{
    try{ return localStorage.getItem(SESSION_KEY) || null; }catch(e){ return null; }
  });
  const [locked,setLocked] = useState(true);

  useEffect(()=>{
    // Au demarrage : verrouille toujours (securite), mais retient le dernier utilisateur pour la bio
  },[]);

  const currentUser = users.find(u=>String(u.id)===String(currentUserId)) || null;

  function unlock(userId, pin){
    const u = users.find(x=>String(x.id)===String(userId));
    if(!u) return false;
    if(String(u.pin) !== String(pin)) return false;
    setCurrentUserId(String(u.id));
    try{ localStorage.setItem(SESSION_KEY, String(u.id)); localStorage.setItem(LAST_USER_KEY, String(u.id)); }catch(e){}
    setLocked(false);
    return true;
  }

  function unlockDirect(userId){
    const u = users.find(x=>String(x.id)===String(userId));
    if(!u) return false;
    setCurrentUserId(String(u.id));
    try{ localStorage.setItem(SESSION_KEY, String(u.id)); localStorage.setItem(LAST_USER_KEY, String(u.id)); }catch(e){}
    setLocked(false);
    return true;
  }

  function getLastUserId(){
    try{ return localStorage.getItem(LAST_USER_KEY); }catch(e){ return null; }
  }

  function lock(){ setLocked(true); }

  return { currentUser, currentUserId, locked, unlock, unlockDirect, lock, setLocked, getLastUserId };
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
const ETAT_APRES_LABELS = { satisfait:"Satisfait 😊", endormi:"Endormi 😴", pleure:"Pleure encore 😢" };
const DOULEUR_LABELS = { aucune:"Aucune", legere:"Légère", forte:"Forte" };

function calcDuree(d,f){
  const [dh,dm]=d.split(":").map(Number);const [fh,fm]=f.split(":").map(Number);
  let mins=(fh*60+fm)-(dh*60+dm);if(mins<0)mins+=1440;
  return `${Math.floor(mins/60)}h ${String(mins%60).padStart(2,"0")}min`;
}


// ── 4. AUTH ───────────────────────────────────────────────────────────────────
function PinPad({value,onChange,onSubmit,maxLen=4}){
  const {t}=useTheme();
  function press(d){
    if(d==="del"){ onChange(value.slice(0,-1)); return; }
    if(value.length>=maxLen) return;
    const v=value+d;
    onChange(v);
    if(v.length===maxLen) onSubmit(v);
  }
  return <div>
    <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:24}}>
      {Array.from({length:maxLen}).map((_,i)=>
        <div key={i} style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${t.purple}`,background:i<value.length?t.purple:"transparent"}}/>
      )}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,maxWidth:260,margin:"0 auto"}}>
      {["1","2","3","4","5","6","7","8","9","","0","del"].map((d,i)=>
        d===""?<div key={i}/>:
        <button key={i} onClick={()=>press(d)} style={{
          height:60,borderRadius:"50%",border:`0.5px solid ${t.bd}`,background:t.bg2,
          fontSize:d==="del"?18:20,fontWeight:500,color:t.tx,cursor:"pointer"
        }}>{d==="del"?"⌫":d}</button>
      )}
    </div>
  </div>;
}

function LockScreen({store,onUnlock,getLastUserId}){
  const {t}=useTheme();
  const { users, addUser } = store;
  const [selectedUser,setSelectedUser] = useState(null);
  const [pin,setPin] = useState("");
  const [error,setError] = useState("");
  const [bioStatus,setBioStatus] = useState("idle");
  const [autoChecking,setAutoChecking] = useState(true);
  const [autoFailed,setAutoFailed] = useState(false);

  // ── Tentative automatique d'empreinte digitale au lancement ───────────────
  useEffect(()=>{
    if(users.length===0){ setAutoChecking(false); return; }
    const lastId = getLastUserId && getLastUserId();
    const target = users.find(u=>String(u.id)===String(lastId)) || users[0];
    let cancelled=false;
    (async()=>{
      const res = await tryBiometricUnlock();
      if(cancelled) return;
      if(res.ok){ onUnlock(target.id, null, true); }
      else { setAutoFailed(true); setAutoChecking(false); }
    })();
    return ()=>{ cancelled=true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // Premiere installation : aucun utilisateur -> ecran de creation
  const [setupName,setSetupName] = useState("");
  const [setupPin,setSetupPin]   = useState("");
  const [setupPin2,setSetupPin2] = useState("");

  function handleSetup(){
    if(!setupName.trim()){ setError("Indique un prénom."); return; }
    if(setupPin.length!==4){ setError("Le code doit faire 4 chiffres."); return; }
    if(setupPin!==setupPin2){ setError("Les codes ne correspondent pas."); return; }
    setError("");
    const newUser = {
      nom:setupName.trim(), pin:setupPin, role:"admin",
      initiales:setupName.trim().slice(0,2).toUpperCase(), couleur:"purple",
    };
    addUser(newUser);
    // Le useEffect du parent detectera le nouvel utilisateur et le proposera
  }

  function handlePinSubmit(value){
    if(!selectedUser) return;
    const ok = onUnlock(selectedUser.id, value);
    if(!ok){
      setError("Code incorrect.");
      setPin("");
    }
  }

  async function handleBiometric(user){
    setBioStatus("checking");
    const res = await tryBiometricUnlock();
    if(res.ok){ onUnlock(user.id, null, true); }
    else { setBioStatus("unavailable"); setTimeout(()=>setBioStatus("idle"),2000); }
  }

  // ── Premiere installation : creer le premier utilisateur ────────────────
  if(users.length===0){
    return <div style={{minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:64,height:64,borderRadius:"50%",background:t.purpleBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,marginBottom:16}}>👶</div>
      <div style={{fontSize:22,fontWeight:500,color:t.tx,marginBottom:4}}>{APP_NAME}</div>
      <div style={{fontSize:14,color:t.tx2,marginBottom:32,textAlign:"center"}}>Bienvenue ! Crée ton profil pour commencer.</div>
      <div style={{width:"100%",maxWidth:360,background:t.bg,border:`0.5px solid ${t.bd}`,borderRadius:16,padding:24}}>
        <FieldLabel>Ton prénom</FieldLabel>
        <FInput placeholder="Ex : Marie" value={setupName} onChange={e=>setSetupName(e.target.value)}/>
        <FieldLabel>Choisis un code PIN (4 chiffres)</FieldLabel>
        <FInput type="password" inputMode="numeric" maxLength={4} placeholder="••••" value={setupPin} onChange={e=>setSetupPin(e.target.value.replace(/\\D/g,"").slice(0,4))}/>
        <FieldLabel>Confirme le code PIN</FieldLabel>
        <FInput type="password" inputMode="numeric" maxLength={4} placeholder="••••" value={setupPin2} onChange={e=>setSetupPin2(e.target.value.replace(/\\D/g,"").slice(0,4))}/>
        {error&&<div style={{fontSize:12,color:t.danger,marginTop:8}}>{error}</div>}
        <PrimaryBtn onClick={handleSetup}>✓ Créer mon profil (Admin)</PrimaryBtn>
        <div style={{textAlign:"center",marginTop:14,fontSize:12,color:t.tx3}}>Tu pourras ajouter d'autres utilisateurs ensuite dans Réglages.</div>
      </div>
    </div>;
  }

  // ── Verification biometrique automatique en cours ────────────────────────
  if(autoChecking){
    return <div style={{minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:64,height:64,borderRadius:"50%",background:t.purpleBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,marginBottom:16}}>👆</div>
      <div style={{fontSize:16,fontWeight:500,color:t.tx,marginBottom:6}}>{APP_NAME}</div>
      <div style={{fontSize:13,color:t.tx2}}>Vérification de l'empreinte digitale...</div>
    </div>;
  }

  // ── Selection d'un profil + saisie PIN ──────────────────────────────────
  if(!selectedUser){
    return <div style={{minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:64,height:64,borderRadius:"50%",background:t.purpleBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,marginBottom:16}}>👶</div>
      <div style={{fontSize:22,fontWeight:500,color:t.tx,marginBottom:4}}>{APP_NAME}</div>
      <div style={{fontSize:14,color:t.tx2,marginBottom:8}}>Qui es-tu ?</div>
      {autoFailed&&<div style={{fontSize:12,color:t.amber,marginBottom:24,textAlign:"center",maxWidth:300}}>Empreinte digitale indisponible ou non reconnue — choisis ton profil et entre ton code PIN.</div>}
      {!autoFailed&&<div style={{marginBottom:24}}/>}
      <div style={{display:"flex",gap:16,flexWrap:"wrap",justifyContent:"center",maxWidth:360}}>
        {users.map(u=><button key={u.id} onClick={()=>{setSelectedUser(u);setPin("");setError("");}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer"}}>
          <Avatar initials={u.initiales} color={u.couleur} size={56}/>
          <span style={{fontSize:13,color:t.tx,fontWeight:500}}>{u.nom}</span>
        </button>)}
      </div>
    </div>;
  }

  // ── Saisie PIN pour utilisateur selectionne ──────────────────────────────
  return <div style={{minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
    <button onClick={()=>setSelectedUser(null)} style={{position:"absolute",top:20,left:20,background:"none",border:"none",color:t.tx2,fontSize:14,cursor:"pointer"}}>← Retour</button>
    <Avatar initials={selectedUser.initiales} color={selectedUser.couleur} size={64}/>
    <div style={{fontSize:18,fontWeight:500,color:t.tx,marginTop:12,marginBottom:4}}>{selectedUser.nom}</div>
    <div style={{fontSize:13,color:t.tx2,marginBottom:24}}>Entre ton code PIN</div>
    <PinPad value={pin} onChange={setPin} onSubmit={handlePinSubmit}/>
    {error&&<div style={{fontSize:12,color:t.danger,marginTop:16}}>{error}</div>}
    <button onClick={()=>handleBiometric(selectedUser)} style={{marginTop:24,display:"flex",alignItems:"center",gap:8,background:t.purpleBg,color:t.purpleTx,border:`0.5px solid ${t.purple}`,borderRadius:20,padding:"8px 18px",fontSize:13,cursor:"pointer"}}>
      👆 Empreinte digitale
    </button>
    {bioStatus==="checking"&&<div style={{fontSize:12,color:t.tx2,marginTop:8}}>Vérification...</div>}
    {bioStatus==="unavailable"&&<div style={{fontSize:12,color:t.amber,marginTop:8}}>Biométrie indisponible sur cet appareil, utilise ton code PIN.</div>}
  </div>;
}

// ── Calcul de l'age a partir de la date de naissance ──────────────────────────
function calcAge(birthdate){
  if(!birthdate) return "";
  const b=new Date(birthdate); const now=new Date();
  let months=(now.getFullYear()-b.getFullYear())*12 + (now.getMonth()-b.getMonth());
  let days=now.getDate()-b.getDate();
  if(days<0){ months--; const prevMonth=new Date(now.getFullYear(),now.getMonth(),0); days+=prevMonth.getDate(); }
  if(months<0) return "";
  if(months>=24){ const years=Math.floor(months/12); const rem=months%12; return `${years} an${years>1?"s":""}${rem?` et ${rem} mois`:""}`; }
  if(months>=1) return `${months} mois${days?` et ${days} jour${days>1?"s":""}`:""}`;
  return `${days} jour${days>1?"s":""}`;
}

// ── calcAgeMonths : age precis en mois decimaux (pour positionner sur les courbes) ─
function calcAgeMonths(birthdate){
  if(!birthdate) return 0;
  const b=new Date(birthdate); const now=new Date();
  const diffDays = (now - b) / (1000*60*60*24);
  return Math.max(0, diffDays / 30.4375); // mois moyen
}

// ── COURBES DE CROISSANCE 0-3 ANS (reference OMS / utilisees dans le carnet de sante francais) ─
// Points a 0,3,6,9,12,15,18,21,24,30,36 mois — P3 / P50 / P97
const GROWTH_MONTHS = [0,3,6,9,12,15,18,21,24,30,36];

const GROWTH_DATA = {
  fille: {
    poids: { // kg
      p3:  [3.2,5.2,6.5,7.3,7.9,8.5,9.1,9.6,10.2,11.2,12.1],
      p50: [3.4,5.8,7.3,8.2,8.9,9.6,10.2,10.9,11.5,12.7,13.9],
      p97: [4.2,7.5,9.3,10.4,11.5,12.4,13.2,14.0,14.8,16.4,18.1],
    },
    taille: { // cm
      p3:  [45.4,55.6,61.2,65.3,68.9,71.8,74.5,76.9,79.3,83.6,87.4],
      p50: [49.1,59.8,65.7,70.1,74.0,77.5,80.7,83.7,86.4,91.7,96.0],
      p97: [52.9,64.0,70.3,74.9,79.2,83.1,86.7,90.1,93.2,98.7,103.6],
    },
  },
  garcon: {
    poids: {
      p3:  [3.3,5.7,7.1,8.0,8.7,9.2,9.8,10.3,10.8,11.8,12.7],
      p50: [3.6,6.4,7.9,8.9,9.6,10.3,10.9,11.5,12.2,13.3,14.3],
      p97: [4.4,8.0,9.8,11.0,11.8,12.8,13.7,14.5,15.3,16.8,18.3],
    },
    taille: {
      p3:  [46.1,57.3,63.3,67.5,71.0,74.1,76.9,79.4,81.7,86.0,89.6],
      p50: [49.9,61.4,67.6,72.0,75.7,79.1,82.3,85.1,87.8,92.5,96.5],
      p97: [53.7,65.5,71.9,76.5,80.5,84.2,87.7,90.9,93.9,99.0,103.5],
    },
  },
};

// Interpolation lineaire d'une valeur sur les points GROWTH_MONTHS
function interpGrowth(arr, ageMonths){
  const m = Math.min(Math.max(ageMonths,0), 36);
  for(let i=0;i<GROWTH_MONTHS.length-1;i++){
    const m0=GROWTH_MONTHS[i], m1=GROWTH_MONTHS[i+1];
    if(m>=m0 && m<=m1){
      const ratio=(m-m0)/(m1-m0);
      return arr[i] + (arr[i+1]-arr[i])*ratio;
    }
  }
  return arr[arr.length-1];
}

// ── REPERES SOMMEIL PAR AGE (recommandations frequemment utilisees en France / pediatrie) ─
const SLEEP_NORMS = [
  { minM:0,  maxM:3,  label:"0 à 3 mois",
    total:"14 à 17h / 24h", nuit:"Pas de cycle jour/nuit établi, réveils fréquents pour les tétées",
    siestes:"4 à 5 siestes", tip:"Le sommeil est réparti sur 24h. Privilégier l'endormissement dans le lit, distinguer jour (lumière, bruit) et nuit (calme, pénombre)." },
  { minM:3,  maxM:6,  label:"3 à 6 mois",
    total:"13 à 15h / 24h", nuit:"Les nuits s'allongent, certains bébés font 6 à 8h d'affilée",
    siestes:"3 à 4 siestes", tip:"Une routine du coucher (bain, histoire, chanson) aide à poser des repères. Possible régression vers 4 mois (maturation du sommeil)." },
  { minM:6,  maxM:12, label:"6 à 12 mois",
    total:"12 à 14h / 24h", nuit:"8 à 11h de nuit possibles, parfois avec 1 réveil",
    siestes:"2 à 3 siestes (matin, début et fin d'après-midi)", tip:"Régression fréquente vers 8-9 mois liée à l'angoisse de séparation et aux nouvelles acquisitions motrices (4 pattes, debout)." },
  { minM:12, maxM:18, label:"12 à 18 mois",
    total:"11 à 14h / 24h", nuit:"10 à 12h de nuit",
    siestes:"1 à 2 siestes, transition progressive vers une seule sieste", tip:"La marche et le langage peuvent perturber temporairement le sommeil. Garder des horaires réguliers." },
  { minM:18, maxM:24, label:"18 à 24 mois",
    total:"11 à 14h / 24h", nuit:"10 à 12h de nuit",
    siestes:"1 sieste l'après-midi (1h30 à 2h)", tip:"Période propice aux peurs nocturnes et à l'opposition au coucher. Maintenir un rituel court et rassurant." },
  { minM:24, maxM:36, label:"2 à 3 ans",
    total:"10 à 13h / 24h", nuit:"10 à 12h de nuit",
    siestes:"1 sieste l'après-midi, parfois supprimée vers 3 ans", tip:"L'enfant peut commencer à exprimer son refus de la sieste. L'adapter selon la fatigue réelle plutôt qu'imposer un horaire strict." },
];

function getSleepNorm(ageMonths){
  return SLEEP_NORMS.find(s=>ageMonths>=s.minM && ageMonths<s.maxM) || SLEEP_NORMS[SLEEP_NORMS.length-1];
}

// ── ETAPES DE DIVERSIFICATION ALIMENTAIRE (reco France 2022 - PNNS / Sante publique France) ─
const DIVERSIFICATION_STEPS = [
  { bracket:"4 à 6 mois", items:[
    { id:"div_legumes_purees",  label:"Premiers légumes en purée lisse (carotte, courgette, potiron...)" },
    { id:"div_fruits_compotes", label:"Premiers fruits en compote sans sucre ajouté" },
    { id:"div_allergenes_precoce", label:"Introduction précoce des allergènes (œuf bien cuit, arachide, fruits à coque en purée, poisson, gluten) — ne pas reporter après 6 mois" },
    { id:"div_lait_principal",  label:"Le lait (maternel ou infantile) reste l'aliment principal" },
    { id:"div_pas_sel_sucre",   label:"Pas de sel, pas de sucre ajouté, pas de miel avant 1 an" },
  ]},
  { bracket:"6 à 8 mois", items:[
    { id:"div_textures_moulinees", label:"Textures moulinées puis écrasées à la fourchette" },
    { id:"div_proteines_10_20g",   label:"Viande / poisson / œuf : 10 à 20g par jour (1 c. à café à 1 c. à soupe)" },
    { id:"div_feculents",          label:"Féculents et légumineuses (lentilles, pâtes, riz, pain)" },
    { id:"div_produits_laitiers_infantiles", label:"Produits laitiers infantiles (yaourt, fromage blanc) en plus du lait" },
    { id:"div_eau",                 label:"Proposer de l'eau dans une tasse ou un gobelet" },
  ]},
  { bracket:"8 à 10 mois", items:[
    { id:"div_morceaux_fondants",  label:"Morceaux fondants (légumes/fruits cuits coupés petits)" },
    { id:"div_manger_doigts",      label:"Manger avec les doigts (autonomie, motricité fine)" },
    { id:"div_3_repas",            label:"3 repas par jour + éventuellement une collation" },
    { id:"div_diversite_proteines",label:"Diversifier les sources de protéines (volaille, poisson, œuf entier, légumineuses)" },
  ]},
  { bracket:"10 à 12 mois", items:[
    { id:"div_textures_hachees",   label:"Textures hachées, augmentation progressive des portions" },
    { id:"div_repas_familial",     label:"Commence à partager certains aliments du repas familial (adaptés, sans sel ajouté)" },
    { id:"div_proteines_20_25g",   label:"Viande / poisson / œuf : 20 à 25g par jour" },
    { id:"div_cuillere",           label:"Tente de manger seul à la cuillère" },
  ]},
  { bracket:"12 à 18 mois", items:[
    { id:"div_lait_croissance",    label:"Lait de croissance ou lait entier en complément des repas" },
    { id:"div_morceaux_fermes",    label:"Morceaux plus fermes, textures proches de l'adulte" },
    { id:"div_arret_biberon",      label:"Diversification de la prise de boisson : tasse/gobelet, réduction progressive du biberon" },
    { id:"div_repas_4x",           label:"4 repas réguliers par jour (3 repas + collation)" },
  ]},
  { bracket:"18 mois à 3 ans", items:[
    { id:"div_alimentation_proche_adulte", label:"Alimentation proche de celle des adultes, en portions adaptées" },
    { id:"div_variete",            label:"Continuer à varier les aliments pour limiter le risque de sélectivité alimentaire" },
    { id:"div_autonomie_repas",    label:"Mange seul avec couverts, participe aux repas en famille" },
    { id:"div_limiter_sucre_sel",  label:"Limiter les produits sucrés, salés et ultra-transformés" },
  ]},
];


// ── MODAL : Profil enfant (creer / modifier) ──────────────────────────────────
function ChildModal({onClose,onSave,onDelete,initial}){
  const {t}=useTheme();
  const [nom,setNom]=useState(initial?.nom||"");
  const [emoji,setEmoji]=useState(initial?.emoji||"👶");
  const [sexe,setSexe]=useState(initial?.sexe||"fille");
  const [birthdate,setBirthdate]=useState(initial?.birthdate||new Date().toISOString().slice(0,10));
  const [confirmDelete,setConfirmDelete]=useState(false);
  const emojis=["👶","👧","👦","🧒","😊","⭐"];

  function handleSave(){
    if(!nom.trim()) return;
    onSave({ id: initial?.id || Date.now(), nom: nom.trim(), emoji, sexe, birthdate });
  }

  return <ModalShell title={initial?"Modifier le profil":"Créer le profil de l'enfant"} onClose={onClose}>
    <FieldLabel>Emoji</FieldLabel>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      {emojis.map(e=><button key={e} onClick={()=>setEmoji(e)} style={{width:40,height:40,fontSize:22,border:emoji===e?`2px solid ${t.purple}`:`0.5px solid ${t.bd}`,borderRadius:10,background:emoji===e?t.purpleBg:t.bg2,cursor:"pointer"}}>{e}</button>)}
    </div>
    <FieldLabel>Prénom</FieldLabel>
    <FInput value={nom} onChange={e=>setNom(e.target.value)} placeholder="Ex : Léa"/>
    <FieldLabel>Sexe</FieldLabel>
    <ToggleGroup options={[["fille","Fille"],["garcon","Garçon"]]} value={sexe} onChange={setSexe}/>
    <FieldLabel>Date de naissance</FieldLabel>
    <FInput type="date" value={birthdate} onChange={e=>setBirthdate(e.target.value)}/>
    <InfoBox color="teal">💡 L'âge affiché dans l'app sera calculé automatiquement.</InfoBox>
    <PrimaryBtn onClick={handleSave} disabled={!nom.trim()}>✓ {initial?"Enregistrer":"Créer le profil"}</PrimaryBtn>

    {initial&&<div style={{marginTop:24,paddingTop:16,borderTop:`0.5px solid ${t.bd}`}}>
      {!confirmDelete?
        <button onClick={()=>setConfirmDelete(true)} style={{width:"100%",padding:"11px",border:`0.5px solid ${t.danger}`,borderRadius:12,background:t.redBg,color:t.danger,fontSize:14,cursor:"pointer"}}>🗑️ Supprimer ce profil</button>
        :<div>
          <div style={{fontSize:13,color:t.danger,marginBottom:10,textAlign:"center"}}>Supprimer "{initial.nom}" ? Cette action ne peut pas être annulée.</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setConfirmDelete(false)} style={{flex:1,padding:"11px",border:`0.5px solid ${t.bd}`,borderRadius:12,background:t.bg,color:t.tx,fontSize:14,cursor:"pointer"}}>Annuler</button>
            <button onClick={onDelete} style={{flex:1,padding:"11px",border:"none",borderRadius:12,background:t.danger,color:"#fff",fontSize:14,cursor:"pointer"}}>Confirmer</button>
          </div>
        </div>
      }
    </div>}
  </ModalShell>;
}

// ── MODAL : Utilisateur (creer / modifier) ─────────────────────────────────────
function UserModal({onClose,onSave,onDelete,initial,canDelete}){
  const {t}=useTheme();
  const [nom,setNom]=useState(initial?.nom||"");
  const [pin,setPin]=useState(initial?.pin||"");
  const [role,setRole]=useState(initial?.role||"editeur");
  const [couleur,setCouleur]=useState(initial?.couleur||"teal");
  const [confirmDelete,setConfirmDelete]=useState(false);
  const couleurs=["purple","teal","amber","coral","green"];

  function handleSave(){
    if(!nom.trim()||pin.length!==4) return;
    onSave({
      ...(initial||{}),
      nom:nom.trim(), pin, role, couleur,
      initiales:nom.trim().slice(0,2).toUpperCase(),
    });
  }

  return <ModalShell title={initial?"Modifier l'utilisateur":"Ajouter un utilisateur"} onClose={onClose}>
    <FieldLabel>Prénom</FieldLabel>
    <FInput value={nom} onChange={e=>setNom(e.target.value)} placeholder="Ex : Papa, Mamie..."/>
    <FieldLabel>Code PIN (4 chiffres)</FieldLabel>
    <FInput type="password" inputMode="numeric" maxLength={4} value={pin} onChange={e=>setPin(e.target.value.replace(/\\D/g,"").slice(0,4))} placeholder="••••"/>
    <FieldLabel>Couleur</FieldLabel>
    <div style={{display:"flex",gap:8}}>
      {couleurs.map(c=><button key={c} onClick={()=>setCouleur(c)} style={{width:36,height:36,borderRadius:"50%",border:couleur===c?`2px solid ${t.tx}`:`0.5px solid ${t.bd}`,background:t[c+"Bg"],cursor:"pointer"}}/>)}
    </div>
    <FieldLabel>Rôle</FieldLabel>
    <ToggleGroup options={[["admin","Admin"],["editeur","Éditeur"],["lecteur","Lecture seule"]]} value={role} onChange={setRole}/>
    <InfoBox color="purple">
      {role==="admin"?"Accès total : gérer profils, utilisateurs, données.":
       role==="editeur"?"Peut ajouter et modifier des entrées.":
       "Consultation uniquement."}
    </InfoBox>
    <PrimaryBtn onClick={handleSave} disabled={!nom.trim()||pin.length!==4}>✓ {initial?"Enregistrer":"Ajouter"}</PrimaryBtn>

    {initial&&canDelete&&<div style={{marginTop:24,paddingTop:16,borderTop:`0.5px solid ${t.bd}`}}>
      {!confirmDelete?
        <button onClick={()=>setConfirmDelete(true)} style={{width:"100%",padding:"11px",border:`0.5px solid ${t.danger}`,borderRadius:12,background:t.redBg,color:t.danger,fontSize:14,cursor:"pointer"}}>🗑️ Supprimer cet utilisateur</button>
        :<div style={{display:"flex",gap:8}}>
          <button onClick={()=>setConfirmDelete(false)} style={{flex:1,padding:"11px",border:`0.5px solid ${t.bd}`,borderRadius:12,background:t.bg,color:t.tx,fontSize:14,cursor:"pointer"}}>Annuler</button>
          <button onClick={onDelete} style={{flex:1,padding:"11px",border:"none",borderRadius:12,background:t.danger,color:"#fff",fontSize:14,cursor:"pointer"}}>Confirmer</button>
        </div>
      }
    </div>}
  </ModalShell>;
}

// ── MODAL : Reset complet ────────────────────────────────────────────────────
function ResetModal({onClose,onConfirm}){
  const {t}=useTheme();
  const [step,setStep]=useState(0);
  return <ModalShell title="Réinitialiser l'application" onClose={onClose}>
    {step===0?<>
      <InfoBox color="coral">⚠️ Cette action supprime <b>définitivement</b> : le profil de l'enfant, tous les utilisateurs, toutes les entrées (BabyLog, sommeil, mesures, vaccins, médicaments, températures, aliments, journal).</InfoBox>
      <InfoBox color="amber">Pense à exporter tes données avant si tu veux les garder.</InfoBox>
      <PrimaryBtn onClick={()=>setStep(1)} style={{background:t.danger}}>Continuer</PrimaryBtn>
    </>:<>
      <div style={{textAlign:"center",padding:"20px 0"}}>
        <div style={{fontSize:40,marginBottom:12}}>🗑️</div>
        <div style={{fontSize:15,fontWeight:500,color:t.tx,marginBottom:8}}>Es-tu vraiment sûr ?</div>
        <div style={{fontSize:13,color:t.tx2,marginBottom:20}}>Toutes les données seront effacées et tu devras recréer un profil.</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:"12px",border:`0.5px solid ${t.bd}`,borderRadius:12,background:t.bg,color:t.tx,fontSize:14,cursor:"pointer"}}>Annuler</button>
          <button onClick={onConfirm} style={{flex:1,padding:"12px",border:"none",borderRadius:12,background:t.danger,color:"#fff",fontSize:14,fontWeight:500,cursor:"pointer"}}>Tout effacer</button>
        </div>
      </div>
    </>}
  </ModalShell>;
}

// ── Petit bouton de suppression pour les listes ────────────────────────────────
function DeleteBtn({onClick}){
  const {t}=useTheme();
  return <button onClick={onClick} style={{background:"none",border:"none",color:t.tx3,fontSize:16,cursor:"pointer",padding:"4px 6px",flexShrink:0}} title="Supprimer">✕</button>;
}
function EditBtn({onClick}){
  const {t}=useTheme();
  return <button onClick={onClick} style={{background:"none",border:"none",color:t.tx3,fontSize:14,cursor:"pointer",padding:"4px 6px",flexShrink:0}} title="Modifier">✏️</button>;
}

// ── 5. BABYLOG ────────────────────────────────────────────────────────────────
function BabyLog({onAdd,onEdit}){
  const {t}=useTheme();const {entries,deleteEntry}=useApp();
  const iconMap={biberon:"💧",couche:"😊",sommeil:"🌙",autre:"✏️"};
  const colMap={biberon:"teal",couche:"amber",sommeil:"purple",autre:"gray"};
  const labelOf=e=>{
    if(e.type==="biberon"){
      let l = `${e.qty||"?"}ml · ${e.side||""}`;
      const extras=[];
      if(e.volumeTire) extras.push(`tiré ${e.volumeTire}ml`);
      if(e.vitamineD) extras.push("Vit. D");
      if(e.regurgitation) extras.push("régurg.");
      if(e.douleurMaman && e.douleurMaman!=="aucune") extras.push("⚠️ inconfort");
      if(extras.length) l += " · "+extras.join(", ");
      return l;
    }
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
        </div>
        <EditBtn onClick={()=>onEdit(e)}/>
        <DeleteBtn onClick={()=>deleteEntry(e.id)}/>
      </div>)}
    </Card>
    <AddButton onClick={onAdd}>Ajouter une entrée</AddButton>
  </div>;
}

function BabyLogModal({onClose,initial}){
  const {addEntry,updateEntry}=useApp();const {t}=useTheme();
  const isEdit = !!initial;
  const [type,setType]=useState(initial?.type||null);const [saved,setSaved]=useState(false);const [preview,setPreview]=useState([]);
  const [qty,setQty]=useState(initial?.qty??150);const [side,setSide]=useState(initial?.side==="Sein droit"?"d":initial?.side==="Biberon"?"b":"g");const [timeBib,setTimeBib]=useState(initial?.type==="biberon"?initial.time:()=>new Date().toTimeString().slice(0,5));const [noteBib,setNoteBib]=useState(initial?.note||"");
  const [position,setPosition]=useState(initial?.position||"");
  const [vitamineD,setVitamineD]=useState(initial?.vitamineD||false);
  const [etatApres,setEtatApres]=useState(initial?.etatApres||"satisfait");
  const [douleurMaman,setDouleurMaman]=useState(initial?.douleurMaman||"aucune");
  const [volumeTire,setVolumeTire]=useState(initial?.volumeTire||"");
  const [regurgitation,setRegurgitation]=useState(initial?.regurgitation||false);
  const [timeCouche,setTimeCouche]=useState(initial?.type==="couche"?initial.time:()=>new Date().toTimeString().slice(0,5));const [coucheType,setCoucheType]=useState(initial?.coucheType||"pipi");const [consist,setConsist]=useState(initial?.consist||"");
  const [sommeilType,setSommeilType]=useState(initial?.sommeilType||"sieste");const [debut,setDebut]=useState(initial?.debut||"14:00");const [fin,setFin]=useState(initial?.fin||"15:00");const [humeur,setHumeur]=useState(initial?.humeur||"enjouée");
  const [timeAutre,setTimeAutre]=useState(initial?.type==="autre"?initial.time:()=>new Date().toTimeString().slice(0,5));const [catAutre,setCatAutre]=useState(initial?.cat||"Bain");const [noteAutre,setNoteAutre]=useState(initial?.note||"");
  const SL={g:"Sein gauche",d:"Sein droit",b:"Biberon"};
  function handleSave(){
    let entry,prev;
    if(type==="biberon"){
      entry={type,qty,side:SL[side],time:timeBib,note:noteBib,position,vitamineD,etatApres,douleurMaman,volumeTire,regurgitation};
      prev=[["Type","Biberon / tétée"],["Heure",timeBib],["Quantité",qty+" ml"],["Côté",SL[side]]];
      if(position) prev.push(["Position",position]);
      if(volumeTire) prev.push(["Volume tiré",volumeTire+" ml"]);
      prev.push(["Vitamine D",vitamineD?"Donnée":"Non donnée"]);
      prev.push(["État après",ETAT_APRES_LABELS[etatApres]||etatApres]);
      if(douleurMaman!=="aucune") prev.push(["Inconfort maternel",DOULEUR_LABELS[douleurMaman]||douleurMaman]);
      if(regurgitation) prev.push(["Régurgitations","Oui"]);
    }
    else if(type==="couche"){entry={type,coucheType,consist,time:timeCouche};prev=[["Type","Couche"],["Heure",timeCouche],["Contenu",coucheType]];}
    else if(type==="sommeil"){const d=calcDuree(debut,fin);entry={type,sommeilType,debut,fin,duree:d,humeur};prev=[["Type",sommeilType],["Début",debut],["Fin",fin],["Durée",d]];}
    else{entry={type,cat:catAutre,time:timeAutre,note:noteAutre};prev=[["Type",catAutre],["Heure",timeAutre]];}
    if(isEdit){ updateEntry(initial.id, entry); onClose(); return; }
    addEntry(entry);setPreview(prev);setSaved(true);
  }
  const dp=debut&&fin?calcDuree(debut,fin):"";
  return <ModalShell title={isEdit?"Modifier l'entrée":"Nouvelle entrée"} sub={isEdit?undefined:`Aujourd'hui · ${new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}`} onClose={onClose}>
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

        {side!=="b"&&<>
          <FieldLabel>Position d'allaitement</FieldLabel>
          <FSelect value={position} onChange={e=>setPosition(e.target.value)}>
            <option value="">— non précisé —</option>
            {["Madone","Madone inversée","Ballon de rugby","Allongée sur le côté","Position biologique (laid-back)"].map(p=><option key={p}>{p}</option>)}
          </FSelect>
        </>}

        <FieldLabel>Volume tiré (tire-lait, optionnel)</FieldLabel>
        <FInput type="number" min="0" step="5" value={volumeTire} onChange={e=>setVolumeTire(e.target.value)} placeholder="Ex : 60 (en ml)"/>

        <FieldLabel>Vitamine D donnée</FieldLabel>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 0"}}>
          <Toggle value={vitamineD} onChange={setVitamineD}/>
          <span style={{fontSize:13,color:t.tx2}}>{vitamineD?"Oui, donnée aujourd'hui":"Non donnée"}</span>
        </div>

        <FieldLabel>État de bébé après la tétée</FieldLabel>
        <ToggleGroup options={[["satisfait","Satisfait 😊"],["endormi","Endormi 😴"],["pleure","Pleure encore 😢"]]} value={etatApres} onChange={setEtatApres}/>

        <FieldLabel>Régurgitations après la tétée</FieldLabel>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 0"}}>
          <Toggle value={regurgitation} onChange={setRegurgitation}/>
          <span style={{fontSize:13,color:t.tx2}}>{regurgitation?"Oui":"Non"}</span>
        </div>

        {side!=="b"&&<>
          <FieldLabel>Inconfort / douleur maternelle</FieldLabel>
          <ToggleGroup options={[["aucune","Aucune"],["legere","Légère"],["forte","Forte (crevasses...)"]]} value={douleurMaman} onChange={setDouleurMaman}/>
        </>}

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
      <PrimaryBtn onClick={handleSave} disabled={!type}>{isEdit?"✓ Enregistrer les modifications":"✓ Enregistrer"}</PrimaryBtn>
    </>:<SuccessScreen preview={preview} onReset={()=>{setSaved(false);setType(null);}} resetLabel="Ajouter une autre entrée"/>}
  </ModalShell>;
}


// ── 6. GRANDISBIEN ────────────────────────────────────────────────────────────
// ── Graphique de croissance generique (0-36 mois) ─────────────────────────────
function GrowthChart({title, unit, dataKey, child, mesureValue}){
  const {t}=useTheme();
  const sexe = child?.sexe==="garcon" ? "garcon" : "fille";
  const data = GROWTH_DATA[sexe][dataKey];
  const ageM = child ? calcAgeMonths(child.birthdate) : null;

  const xFor = m => (m/36)*320;
  const yScale = (val,minV,maxV) => 95 - ((val-minV)/(maxV-minV))*85;

  const allVals = [...data.p3, ...data.p50, ...data.p97, ...(mesureValue!=null?[mesureValue]:[])];
  const minV = Math.min(...allVals)*0.95;
  const maxV = Math.max(...allVals)*1.05;

  const toPoints = arr => GROWTH_MONTHS.map((m,i)=>`${xFor(m)},${yScale(arr[i],minV,maxV)}`).join(" ");

  const childX = ageM!=null ? xFor(Math.min(ageM,36)) : null;
  const childY = ageM!=null ? yScale(interpGrowth(data.p50, Math.min(ageM,36)), minV, maxV) : null;
  const pointY = (mesureValue!=null && ageM!=null) ? yScale(mesureValue, minV, maxV) : null;

  return <Card>
    <div style={{fontSize:11,color:t.tx2,marginBottom:8}}>{title} — {sexe==="garcon"?"garçons":"filles"} · 0 à 3 ans{child?` · ${child.nom}`:""}</div>
    <svg viewBox="0 0 320 105" style={{width:"100%",height:"auto"}}>
      <polyline points={toPoints(data.p97)} fill="none" stroke={t.bd2} strokeWidth="1" strokeDasharray="3,3"/>
      <polyline points={toPoints(data.p50)} fill="none" stroke={t.purpleMid} strokeWidth="1.5"/>
      <polyline points={toPoints(data.p3)}  fill="none" stroke={t.bd2} strokeWidth="1" strokeDasharray="3,3"/>

      {childX!=null && <line x1={childX} y1="0" x2={childX} y2="100" stroke={t.purple} strokeWidth="0.5" strokeDasharray="2,2" opacity="0.4"/>}
      {pointY!=null && <circle cx={childX} cy={pointY} r="4" fill={t.purple}/>}
      {pointY==null && childX!=null && <circle cx={childX} cy={childY} r="3" fill={t.purpleMid} opacity="0.5"/>}

      {[0,6,12,18,24,30,36].map(m=>
        <text key={m} x={xFor(m)} y="103" fontSize="8" fill={Math.abs((ageM||-1)-m)<1?t.purple:t.tx3} textAnchor="middle">{m===0?"0":m+"m"}</text>
      )}
      <text x="318" y="13" fontSize="8" fill={t.tx3} textAnchor="end">P97</text>
      <text x="318" y="34" fontSize="8" fill={t.purpleMid} textAnchor="end">P50</text>
      <text x="318" y="92" fontSize="8" fill={t.tx3} textAnchor="end">P3</text>
    </svg>
    {mesureValue==null && <div style={{fontSize:11,color:t.tx3,marginTop:6}}>Ajoute une mesure de {title.toLowerCase()} pour voir la position exacte de {child?.nom||"l'enfant"} sur la courbe.</div>}
  </Card>;
}

function GrandisBien(){
  const {t}=useTheme();const {mesures,vaccins,addMesure,addVaccin,updateVaccin,deleteVaccin,child}=useApp();
  const [modal,setModal]=useState(null); // null | "mesure" | "vaccin" | {edit:"mesure",data} | {edit:"vaccin",data}
  const dotColor={done:t.success,next:t.warning,future:t.bd2};
  const dateColor={done:t.teal,next:t.amber,future:t.tx3};
  const icons={"Taille":"📏","Poids":"⚖️","Périmètre crânien":"⭕"};
  const bCol={"Taille":"teal","Poids":"purple","Périmètre crânien":"amber"};
  return <div>
    <SecTitle style={{marginTop:0}}>Mesures</SecTitle>
    <Card padding="0 14px">
      {mesures.map((m,i)=><div key={m.id} onClick={()=>setModal({edit:"mesure",data:m})} style={{display:"flex",gap:10,alignItems:"center",padding:"9px 0",borderBottom:i<mesures.length-1?`0.5px solid ${t.bd}`:"none",cursor:"pointer"}}>
        <div style={{width:36,height:36,borderRadius:8,background:t[(bCol[m.label]||"purple")+"Bg"],display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{icons[m.label]||"📐"}</div>
        <div style={{flex:1}}><div style={{fontSize:12,color:t.tx2}}>{m.label}</div><div style={{fontSize:16,fontWeight:500,color:t.tx}}>{m.value} {m.unit}</div></div>
        <div style={{textAlign:"right"}}><Badge color={bCol[m.label]||"purple"}>{m.percentile}</Badge><div style={{fontSize:11,color:t.tx3,marginTop:3}}>{m.date}</div></div>
        <EditBtn onClick={(e)=>{e.stopPropagation();setModal({edit:"mesure",data:m});}}/>
      </div>)}
    </Card>
    <SecTitle>Courbes de croissance (0 à 3 ans)</SecTitle>
    <GrowthChart title="Poids (kg)" unit="kg" dataKey="poids" child={child}
      mesureValue={(()=>{const m=mesures.find(x=>x.label==="Poids"); return m?parseFloat(m.value):null;})()}/>
    <GrowthChart title="Taille (cm)" unit="cm" dataKey="taille" child={child}
      mesureValue={(()=>{const m=mesures.find(x=>x.label==="Taille"); return m?parseFloat(m.value):null;})()}/>
    <InfoBox color="teal">📊 Courbes indicatives basées sur les références OMS utilisées dans le carnet de santé français. Pour un suivi médical précis, se référer aux courbes du carnet de santé et à l'avis du pédiatre.</InfoBox>
    <SecTitle>Vaccinations</SecTitle>
    <Card padding="0 14px">
      {vaccins.map((v,i)=><div key={v.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<vaccins.length-1?`0.5px solid ${t.bd}`:"none"}}>
        <div style={{width:10,height:10,borderRadius:"50%",background:dotColor[v.status],flexShrink:0}}/>
        <div style={{flex:1,fontSize:13,color:t.tx}}>{v.name}</div>
        <div style={{fontSize:12,color:dateColor[v.status],whiteSpace:"nowrap"}}>{v.status==="done"?"✓ Fait":v.status==="next"?"Prochain":"Prévu"}</div>
        <EditBtn onClick={()=>setModal({edit:"vaccin",data:v})}/>
        <DeleteBtn onClick={()=>deleteVaccin(v.id)}/>
      </div>)}
    </Card>
    <AddButton onClick={()=>setModal("mesure")}>Nouvelle mesure</AddButton>
    <AddButton onClick={()=>setModal("vaccin")}>Ajouter un vaccin</AddButton>
    {modal==="mesure"&&<MesureModal onClose={()=>setModal(null)} onSave={m=>{addMesure(m);setModal(null);}}/>}
    {modal==="vaccin"&&<VaccinModal onClose={()=>setModal(null)} onSave={v=>{addVaccin(v);setModal(null);}}/>}
    {modal?.edit==="mesure"&&<MesureModal initial={modal.data} onClose={()=>setModal(null)} onSave={m=>{addMesure(m);setModal(null);}}/>}
    {modal?.edit==="vaccin"&&<VaccinModal initial={modal.data} onClose={()=>setModal(null)} onSave={v=>{updateVaccin(modal.data.id,v);setModal(null);}}/>}
  </div>;
}

function MesureModal({onClose,onSave,initial}){
  const {t}=useTheme();
  const isEdit=!!initial;
  const [saved,setSaved]=useState(false);const [type,setType]=useState(initial?.label||"Poids");const [valeur,setValeur]=useState(initial?.value!=null?String(initial.value):"");const [date,setDate]=useState(initial?.date||new Date().toISOString().slice(0,10));
  const types=[["Poids","⚖️","kg"],["Taille","📏","cm"],["Périmètre crânien","⭕","cm"]];
  const unit=types.find(x=>x[0]===type)?.[2]||"";
  function handleSave(){
    if(isEdit){ onSave({label:type,value:valeur,unit,date,percentile:initial.percentile}); return; }
    onSave({label:type,value:valeur,unit,date,percentile:"—"});setSaved(true);
  }
  return <ModalShell title={isEdit?"Modifier la mesure":"Nouvelle mesure"} onClose={onClose}>
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
      <PrimaryBtn onClick={handleSave} disabled={!valeur}>{isEdit?"✓ Enregistrer les modifications":"✓ Enregistrer"}</PrimaryBtn>
    </>:<SuccessScreen preview={[["Type",type],["Valeur",valeur+" "+unit],["Date",date]]} onReset={()=>{setSaved(false);setValeur("");}} resetLabel="Ajouter une autre mesure"/>}
  </ModalShell>;
}

function VaccinModal({onClose,onSave,initial}){
  const {t}=useTheme();
  const isEdit=!!initial;
  const [saved,setSaved]=useState(false);const [nom,setNom]=useState(initial?.name||"");const [date,setDate]=useState(initial?.date||new Date().toISOString().slice(0,10));const [status,setStatus]=useState(initial?.status||"done");const [lot,setLot]=useState(initial?.lot||"");
  const suggestions=["BCG","Hépatite B","DTPa-Hib-Polio","Pneumocoque","Méningocoque B","MMR","Varicelle","Rotavirus"];
  function handleSave(){
    if(isEdit){ onSave({name:nom,status,date,lot}); return; }
    onSave({name:nom,status,date,lot});setSaved(true);
  }
  return <ModalShell title={isEdit?"Modifier le vaccin":"Ajouter un vaccin"} onClose={onClose}>
    {!saved?<>
      <FieldLabel>Nom du vaccin</FieldLabel><FInput value={nom} onChange={e=>setNom(e.target.value)} placeholder="Ex : MMR, DTPa..."/>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
        {suggestions.map(s=><button key={s} onClick={()=>setNom(s)} style={{padding:"3px 9px",borderRadius:20,fontSize:11,cursor:"pointer",border:`0.5px solid ${t.bd}`,background:nom===s?t.purpleBg:t.bg2,color:nom===s?t.purpleTx:t.tx2}}>{s}</button>)}
      </div>
      <FieldLabel>Statut</FieldLabel><ToggleGroup options={[["done","Fait ✓"],["next","Prochain"],["future","Prévu"]]} value={status} onChange={setStatus}/>
      <FieldLabel>Date</FieldLabel><FInput type="date" value={date} onChange={e=>setDate(e.target.value)}/>
      <FieldLabel>N° de lot (optionnel)</FieldLabel><FInput value={lot} onChange={e=>setLot(e.target.value)} placeholder="AB1234"/>
      <PrimaryBtn onClick={handleSave} disabled={!nom}>{isEdit?"✓ Enregistrer les modifications":"✓ Enregistrer"}</PrimaryBtn>
    </>:<SuccessScreen preview={[["Vaccin",nom],["Statut",status],["Date",date]]} onReset={()=>{setSaved(false);setNom("");}} resetLabel="Ajouter un autre vaccin"/>}
  </ModalShell>;
}

// ── 7. DODOZEN ────────────────────────────────────────────────────────────────
function DodoZen(){
  const {t}=useTheme();const {sommeils,addSommeil,updateSommeil,deleteSommeil,child}=useApp();
  const ageM = child ? calcAgeMonths(child.birthdate) : null;
  const norm = ageM!=null ? getSleepNorm(ageM) : null;
  const [showModal,setShowModal]=useState(false);
  const [editSommeil,setEditSommeil]=useState(null);
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
        <span style={{flex:1}}/>
        <EditBtn onClick={()=>setEditSommeil(dernNuit)}/>
        <DeleteBtn onClick={()=>deleteSommeil(dernNuit.id)}/>
      </div>
    </Card></>}
    <SecTitle>Siestes du jour</SecTitle>
    <Card padding="0 14px">
      {siestes.length===0&&<div style={{padding:"16px 0",textAlign:"center",color:t.tx3,fontSize:13}}>Aucune sieste enregistrée</div>}
      {siestes.map((s,i)=><div key={s.id} style={{display:"flex",gap:10,alignItems:"center",padding:"9px 0",borderBottom:i<siestes.length-1?`0.5px solid ${t.bd}`:"none"}}>
        <div style={{width:36,height:36,borderRadius:8,background:t.purpleBg,color:t.purpleMid,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>☀️</div>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:t.tx}}>Sieste · {s.duree}</div><div style={{fontSize:11,color:t.tx2}}>{s.debut} → {s.fin}</div></div>
        <Badge color={s.qualite==="bonne"?"teal":"amber"}>{s.qualite==="bonne"?"😴":"😣"}</Badge>
        <EditBtn onClick={()=>setEditSommeil(s)}/>
        <DeleteBtn onClick={()=>deleteSommeil(s.id)}/>
      </div>)}
    </Card>
    <SecTitle>Où en est {child?child.nom:"bébé"} ?</SecTitle>
    {norm?<Card>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <Badge color="purple">{norm.label}</Badge>
        <span style={{fontSize:11,color:t.tx3}}>Âge actuel : {calcAge(child.birthdate)}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <div style={{background:t.bg2,borderRadius:8,padding:10}}>
          <div style={{fontSize:11,color:t.tx2}}>Sommeil total recommandé</div>
          <div style={{fontSize:14,fontWeight:500,color:t.tx,marginTop:2}}>{norm.total}</div>
        </div>
        <div style={{background:t.bg2,borderRadius:8,padding:10}}>
          <div style={{fontSize:11,color:t.tx2}}>Nuit</div>
          <div style={{fontSize:14,fontWeight:500,color:t.tx,marginTop:2}}>{norm.nuit}</div>
        </div>
      </div>
      <div style={{background:t.bg2,borderRadius:8,padding:10,marginBottom:10}}>
        <div style={{fontSize:11,color:t.tx2}}>Siestes</div>
        <div style={{fontSize:14,fontWeight:500,color:t.tx,marginTop:2}}>{norm.siestes}</div>
      </div>
      <div style={{background:t.purpleBg,borderRadius:8,padding:"10px 12px"}}>
        <div style={{fontSize:13,fontWeight:500,color:t.purpleTx,marginBottom:3}}>💡 Conseil pour cette période</div>
        <div style={{fontSize:13,color:t.purpleMid,lineHeight:1.5}}>{norm.tip}</div>
      </div>
    </Card>
    :<Card><div style={{fontSize:13,color:t.tx2,textAlign:"center",padding:"10px 0"}}>Crée le profil de l'enfant dans Réglages pour voir les repères de sommeil adaptés à son âge.</div></Card>}
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
    {editSommeil&&<SommeilModal initial={editSommeil} onClose={()=>setEditSommeil(null)} onSave={s=>{updateSommeil(editSommeil.id,s);setEditSommeil(null);}}/>}
  </div>;
}

function SommeilModal({onClose,onSave,initial}){
  const isEdit=!!initial;
  const [saved,setSaved]=useState(false);const [sommeilType,setSommeilType]=useState(initial?.type||"sieste");const [debut,setDebut]=useState(initial?.debut||"14:00");const [fin,setFin]=useState(initial?.fin||"14:45");const [humeur,setHumeur]=useState(initial?.humeur||"enjouée");const [qualite,setQualite]=useState(initial?.qualite||"bonne");const [reveils,setReveils]=useState(initial?.reveils||"0");
  const duree=calcDuree(debut,fin);
  function handleSave(){
    if(isEdit){ onSave({type:sommeilType,debut,fin,duree,humeur,qualite,reveils}); return; }
    onSave({type:sommeilType,debut,fin,duree,humeur,qualite,reveils});setSaved(true);
  }
  return <ModalShell title={isEdit?"Modifier le sommeil":"Enregistrer un sommeil"} onClose={onClose}>
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
      <PrimaryBtn onClick={handleSave}>{isEdit?"✓ Enregistrer les modifications":"✓ Enregistrer"}</PrimaryBtn>
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
  const {t}=useTheme();const {medicaments,addMedicament,toggleMed,deleteMedicament,updateMedicament}=useApp();
  const [showModal,setShowModal]=useState(false);
  const [editMed,setEditMed]=useState(null);
  return <div>
    <SecTitle style={{marginTop:0}}>Traitements en cours</SecTitle>
    {medicaments.map(m=><Card key={m.id}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
        <div style={{width:40,height:40,borderRadius:10,background:t[(m.couleur||"coral")+"Bg"],display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>💊</div>
        <div style={{flex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6}}>
            <div style={{fontSize:14,fontWeight:500,color:t.tx,flex:1}}>{m.nom}</div>
            <Toggle value={m.actif} onChange={()=>toggleMed(m.id)}/>
            <EditBtn onClick={()=>setEditMed(m)}/>
            <DeleteBtn onClick={()=>deleteMedicament(m.id)}/>
          </div>
          <div style={{fontSize:12,color:t.tx2,marginTop:2}}>{m.dose} · {m.frequence}</div>
          {m.actif&&m.prochaineDose&&<div style={{marginTop:6,display:"inline-flex",alignItems:"center",gap:5,background:t.amberBg,color:t.amber,fontSize:11,padding:"3px 8px",borderRadius:6}}>🔔 Prochaine dose : {m.prochaineDose}</div>}
          {!m.actif&&<div style={{marginTop:4,fontSize:11,color:t.tx3}}>Traitement inactif</div>}
        </div>
      </div>
    </Card>)}
    <AddButton onClick={()=>setShowModal(true)}>Ajouter un médicament</AddButton>
    {showModal&&<MedModal onClose={()=>setShowModal(false)} onSave={m=>{addMedicament(m);setShowModal(false);}}/>}
    {editMed&&<MedModal initial={editMed} onClose={()=>setEditMed(null)} onSave={m=>{updateMedicament(editMed.id,m);setEditMed(null);}}/>}
  </div>;
}

function MedModal({onClose,onSave,initial}){
  const isEdit=!!initial;
  const [saved,setSaved]=useState(false);const [nom,setNom]=useState(initial?.nom||"");const [dose,setDose]=useState(initial?.dose||"");const [freq,setFreq]=useState(initial?.frequence||"toutes les 6h");const [debut,setDebut]=useState(new Date().toISOString().slice(0,10));const [note,setNote]=useState("");
  function handleSave(){
    if(isEdit){ onSave({nom,dose,frequence:freq,actif:initial.actif,prochaineDose:initial.prochaineDose,couleur:initial.couleur||"coral"}); return; }
    onSave({nom,dose,frequence:freq,actif:true,prochaineDose:null,couleur:"coral"});setSaved(true);
  }
  return <ModalShell title={isEdit?"Modifier le médicament":"Ajouter un médicament"} onClose={onClose}>
    {!saved?<>
      <FieldLabel>Nom du médicament</FieldLabel><FInput value={nom} onChange={e=>setNom(e.target.value)} placeholder="Ex : Doliprane 2.4%..."/>
      <FieldLabel>Dose</FieldLabel><FInput value={dose} onChange={e=>setDose(e.target.value)} placeholder="Ex : 2.5 ml, 1 dose..."/>
      <FieldLabel>Fréquence</FieldLabel><FSelect value={freq} onChange={e=>setFreq(e.target.value)}>{["toutes les 4h","toutes les 6h","toutes les 8h","2× par jour","1× par jour","matin et soir","si besoin"].map(f=><option key={f}>{f}</option>)}</FSelect>
      <FieldLabel>Date de début</FieldLabel><FInput type="date" value={debut} onChange={e=>setDebut(e.target.value)}/>
      <FieldLabel>Note / Indication</FieldLabel><FTextarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Ex : prescrit pour otite, fièvre..." style={{height:60}}/>
      <InfoBox color="amber">⚠️ Toujours suivre la prescription médicale. Ne pas dépasser les doses.</InfoBox>
      <PrimaryBtn onClick={handleSave} disabled={!nom||!dose}>{isEdit?"✓ Enregistrer les modifications":"✓ Enregistrer"}</PrimaryBtn>
    </>:<SuccessScreen preview={[["Médicament",nom],["Dose",dose],["Fréquence",freq]]} onReset={()=>setSaved(false)} resetLabel="Ajouter un autre médicament"/>}
  </ModalShell>;
}

// ── 10. TEMPÉRATURE ───────────────────────────────────────────────────────────
function Temperature(){
  const {t}=useTheme();const {temperatures,addTemperature,deleteTemperature,updateTemperature}=useApp();
  const [showModal,setShowModal]=useState(false);
  const [editTemp,setEditTemp]=useState(null);
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
        <EditBtn onClick={()=>setEditTemp(tp)}/>
        <DeleteBtn onClick={()=>deleteTemperature(tp.id)}/>
      </div>)}
    </Card>
    <AddButton onClick={()=>setShowModal(true)}>Enregistrer une température</AddButton>
    {showModal&&<TempModal onClose={()=>setShowModal(false)} onSave={tp=>{addTemperature(tp);setShowModal(false);}}/>}
    {editTemp&&<TempModal initial={editTemp} onClose={()=>setEditTemp(null)} onSave={tp=>{updateTemperature(editTemp.id,tp);setEditTemp(null);}}/>}
  </div>;
}

function TempModal({onClose,onSave,initial}){
  const {t}=useTheme();
  const isEdit=!!initial;
  const [saved,setSaved]=useState(false);const [valeur,setValeur]=useState(initial?.valeur!=null?String(initial.valeur):"37.0");const [date,setDate]=useState(initial?.date||new Date().toISOString().slice(0,10));const [heure,setHeure]=useState(initial?.heure||new Date().toTimeString().slice(0,5));const [methode,setMethode]=useState(initial?.methode||"rectale");
  const val=parseFloat(valeur)||37;
  const fc=v=>v>=39?t.danger:v>=38?t.warning:t.success;
  function handleSave(){
    if(isEdit){ onSave({valeur:val,date,heure,methode}); return; }
    onSave({valeur:val,date,heure,methode});setSaved(true);
  }
  return <ModalShell title={isEdit?"Modifier la température":"Température"} onClose={onClose}>
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
      <PrimaryBtn onClick={handleSave}>{isEdit?"✓ Enregistrer les modifications":"✓ Enregistrer"}</PrimaryBtn>
    </>:<SuccessScreen preview={[["Température",val.toFixed(1)+"°C"],["Méthode",methode],["Heure",heure]]} onReset={()=>setSaved(false)} resetLabel="Enregistrer une autre mesure"/>}
  </ModalShell>;
}


// ── Checklist des etapes de diversification selon l'age ───────────────────────
function DiversificationSteps({child,etapesDiv,toggleEtapeDiv}){
  const {t}=useTheme();
  const ageM = child ? calcAgeMonths(child.birthdate) : null;

  return <div>
    <SecTitle style={{marginTop:0}}>Étapes de diversification (0 à 3 ans)</SecTitle>
    <InfoBox color="purple" style={{marginTop:0}}>
      📋 Repères basés sur les recommandations PNNS / Santé publique France 2022. {child?`La période actuelle de ${child.nom} est mise en avant ci-dessous.`:"Crée le profil de l'enfant pour mettre en évidence la période actuelle."}
    </InfoBox>
    {DIVERSIFICATION_STEPS.map((group,gi)=>{
      // determine si cette tranche correspond a l'age actuel (approx via bracket text)
      const bracketRanges = {
        "4 à 6 mois":[4,6], "6 à 8 mois":[6,8], "8 à 10 mois":[8,10],
        "10 à 12 mois":[10,12], "12 à 18 mois":[12,18], "18 mois à 3 ans":[18,36],
      };
      const range = bracketRanges[group.bracket];
      const isCurrent = ageM!=null && range && ageM>=range[0] && ageM<range[1];
      return <Card key={group.bracket} style={isCurrent?{border:`1.5px solid ${t.purple}`,background:t.purpleBg}:{}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <div style={{fontSize:13,fontWeight:500,color:isCurrent?t.purpleTx:t.tx}}>{group.bracket}</div>
          {isCurrent&&<Badge color="purple">Période actuelle</Badge>}
        </div>
        {group.items.map((item,i)=>{
          const checked = !!etapesDiv[item.id];
          return <div key={item.id} onClick={()=>toggleEtapeDiv(item.id)} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"6px 0",borderBottom:i<group.items.length-1?`0.5px solid ${t.bd}`:"none",cursor:"pointer"}}>
            <div style={{width:18,height:18,borderRadius:5,border:`1.5px solid ${checked?t.success:t.bd2}`,background:checked?t.success:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",flexShrink:0,marginTop:1}}>{checked?"✓":""}</div>
            <div style={{fontSize:12,color:checked?t.tx2:t.tx,lineHeight:1.4,textDecoration:checked?"line-through":"none"}}>{item.label}</div>
          </div>;
        })}
      </Card>;
    })}
  </div>;
}

// ── 11. DIVERSIFICATION ───────────────────────────────────────────────────────
function Diversification(){
  const {t}=useTheme();const {aliments,updateAliment,updateAlimentFull,addAliment,deleteAliment,child,etapesDiv,toggleEtapeDiv}=useApp();
  const [filtre,setFiltre]=useState("tous");const [showModal,setShowModal]=useState(false);
  const [editAliment,setEditAliment]=useState(null);
  const [vue,setVue]=useState("etapes"); // "etapes" | "aliments"
  const cats=["tous","Légumes","Fruits","Protéines","Céréales","Laitiers"];
  const sCol={"accepté":"teal","en cours":"amber","à tester":"gray","rejeté":"coral"};
  const filtered=filtre==="tous"?aliments:aliments.filter(a=>a.categorie===filtre);
  return <div>
    <div style={{display:"flex",gap:6,marginBottom:14}}>
      {[["etapes","📋 Étapes par âge"],["aliments","🥦 Aliments testés"]].map(([k,l])=>
        <button key={k} onClick={()=>setVue(k)} style={{flex:1,padding:"9px",borderRadius:8,fontSize:12,border:vue===k?`0.5px solid ${t.purple}`:`0.5px solid ${t.bd}`,background:vue===k?t.purpleBg:t.bg2,color:vue===k?t.purpleTx:t.tx2,cursor:"pointer",fontWeight:vue===k?500:400}}>{l}</button>
      )}
    </div>
    {vue==="etapes"&&<DiversificationSteps child={child} etapesDiv={etapesDiv} toggleEtapeDiv={toggleEtapeDiv}/>}
    {vue!=="etapes"&&<>
    <InfoBox color="teal" style={{marginTop:0}}>🥦 {child?`${child.nom} — ${calcAge(child.birthdate)}.`:""} Introduire un nouvel aliment toutes les 3–4 jours pour détecter les allergies.</InfoBox>
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
        <EditBtn onClick={()=>setEditAliment(a)}/>
        <DeleteBtn onClick={()=>deleteAliment(a.id)}/>
      </div>)}
    </Card>
    <AddButton onClick={()=>setShowModal(true)}>Ajouter un aliment</AddButton>
    {showModal&&<AlimentModal onClose={()=>setShowModal(false)} onSave={a=>{addAliment(a);setShowModal(false);}}/>}
    {editAliment&&<AlimentModal initial={editAliment} onClose={()=>setEditAliment(null)} onSave={a=>{updateAlimentFull(editAliment.id,a);setEditAliment(null);}}/>}
    </>}
  </div>;
}

function AlimentModal({onClose,onSave,initial}){
  const {t}=useTheme();
  const isEdit=!!initial;
  const [saved,setSaved]=useState(false);const [nom,setNom]=useState(initial?.nom||"");const [cat,setCat]=useState(initial?.categorie||"Légumes");const [age,setAge]=useState(initial?.age??6);const [allergene,setAllergene]=useState(initial?.allergene||false);const [note,setNote]=useState(initial?.note||"");
  function handleSave(){
    if(isEdit){ onSave({nom,categorie:cat,age,allergene,statut:initial.statut,note}); return; }
    onSave({nom,categorie:cat,age,allergene,statut:"à tester",note});setSaved(true);
  }
  return <ModalShell title={isEdit?"Modifier l'aliment":"Ajouter un aliment"} onClose={onClose}>
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
      <PrimaryBtn onClick={handleSave} disabled={!nom}>{isEdit?"✓ Enregistrer les modifications":"✓ Ajouter"}</PrimaryBtn>
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
  const {t}=useTheme();const {journal,addJournal,deleteJournal,updateJournal}=useApp();
  const [showModal,setShowModal]=useState(false);
  const [editJournal,setEditJournal]=useState(null);
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
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6}}>
            <div style={{fontSize:14,fontWeight:500,color:t.tx,flex:1}}>{j.titre}</div>
            <Badge color={tagCol[j.tag]||"gray"}>{j.tag}</Badge>
            <EditBtn onClick={()=>setEditJournal(j)}/>
            <DeleteBtn onClick={()=>deleteJournal(j.id)}/>
          </div>
          <div style={{fontSize:12,color:t.tx3,marginTop:1}}>{j.date}</div>
          <div style={{fontSize:13,color:t.tx2,marginTop:6,lineHeight:1.5}}>{j.texte}</div>
        </div>
      </div>
    </Card>)}
    <AddButton onClick={()=>setShowModal(true)}>Ajouter un souvenir</AddButton>
    {showModal&&<JournalModal onClose={()=>setShowModal(false)} onSave={j=>{addJournal(j);setShowModal(false);}}/>}
    {editJournal&&<JournalModal initial={editJournal} onClose={()=>setEditJournal(null)} onSave={j=>{updateJournal(editJournal.id,j);setEditJournal(null);}}/>}
  </div>;
}

function JournalModal({onClose,onSave,initial}){
  const {t}=useTheme();
  const isEdit=!!initial;
  const [saved,setSaved]=useState(false);const [titre,setTitre]=useState(initial?.titre||"");const [texte,setTexte]=useState(initial?.texte||"");const [emoji,setEmoji]=useState(initial?.emoji||"⭐");const [tag,setTag]=useState(initial?.tag||"souvenir");const [date,setDate]=useState(initial?.date||new Date().toISOString().slice(0,10));
  const emojis=["⭐","👣","💬","🌳","😂","🎉","💊","🏥","🛁","🎁","❤️","🌙"];
  function handleSave(){
    if(isEdit){ onSave({titre,texte,emoji,tag,date}); return; }
    onSave({titre,texte,emoji,tag,date});setSaved(true);
  }
  return <ModalShell title={isEdit?"Modifier le souvenir":"Nouveau souvenir"} onClose={onClose}>
    {!saved?<>
      <FieldLabel>Emoji</FieldLabel>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {emojis.map(e=><button key={e} onClick={()=>setEmoji(e)} style={{width:36,height:36,fontSize:20,border:emoji===e?`2px solid ${t.purple}`:`0.5px solid ${t.bd}`,borderRadius:8,background:emoji===e?t.purpleBg:t.bg2,cursor:"pointer"}}>{e}</button>)}
      </div>
      <FieldLabel>Titre</FieldLabel><FInput value={titre} onChange={e=>setTitre(e.target.value)} placeholder="Ex : Premiers pas, Premier mot..."/>
      <FieldLabel>Date</FieldLabel><FInput type="date" value={date} onChange={e=>setDate(e.target.value)}/>
      <FieldLabel>Tag</FieldLabel><ToggleGroup options={[["étape","🏆 Étape"],["souvenir","📸 Souvenir"],["santé","🏥 Santé"],["drôle","😂 Drôle"]]} value={tag} onChange={setTag}/>
      <FieldLabel>Description</FieldLabel><FTextarea value={texte} onChange={e=>setTexte(e.target.value)} placeholder="Raconte ce moment..." style={{height:80}}/>
      <PrimaryBtn onClick={handleSave} disabled={!titre}>{isEdit?"✓ Enregistrer les modifications":"✓ Enregistrer ce souvenir"}</PrimaryBtn>
    </>:<SuccessScreen preview={[["Titre",titre],["Tag",tag],["Date",date]]} onReset={()=>{setSaved(false);setTitre("");setTexte("");}} resetLabel="Ajouter un autre souvenir"/>}
  </ModalShell>;
}

// ── 14. FAMILLE ───────────────────────────────────────────────────────────────
// ── 14. UTILISATEURS (ex-Famille) ──────────────────────────────────────────────
function Famille(){
  const {t}=useTheme();
  const {users,addUser,updateUser,deleteUser,currentUser}=useApp();
  const [modalUser,setModalUser]=useState(null); // null | "new" | userObj
  const rCol={admin:"purple",editeur:"teal",lecteur:"amber"};
  const rLab={admin:"Admin",editeur:"Éditeur",lecteur:"Lecture seule"};

  return <div>
    <SecTitle style={{marginTop:0}}>Utilisateurs</SecTitle>
    <Card padding="0 14px">
      {users.map((u,i)=><div key={u.id} onClick={()=>setModalUser(u)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<users.length-1?`0.5px solid ${t.bd}`:"none",cursor:"pointer"}}>
        <div style={{position:"relative"}}><Avatar initials={u.initiales} color={u.couleur}/>
          {currentUser?.id===u.id&&<div style={{position:"absolute",bottom:0,right:0,width:9,height:9,borderRadius:"50%",background:t.success,border:`1.5px solid ${t.bg}`}}/>}
        </div>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:t.tx}}>{u.nom}</div><div style={{fontSize:11,color:t.tx2}}>Code PIN : ••••</div></div>
        <Badge color={rCol[u.role]}>{rLab[u.role]}</Badge>
      </div>)}
    </Card>
    <SecTitle>Rôles</SecTitle>
    <Card padding="0 14px">
      {[["admin","purple","Tout modifier, gérer profils, utilisateurs et données"],["editeur","teal","Ajouter et modifier des entrées"],["lecteur","amber","Consulter uniquement"]].map(([role,color,desc],i)=><div key={role} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 0",borderBottom:i<2?`0.5px solid ${t.bd}`:"none"}}>
        <div style={{width:10,height:10,borderRadius:2,background:t[color],flexShrink:0}}/>
        <div><div style={{fontSize:13,color:t.tx,fontWeight:500}}>{rLab[role]}</div><div style={{fontSize:11,color:t.tx2}}>{desc}</div></div>
      </div>)}
    </Card>
    <AddButton onClick={()=>setModalUser("new")}>Ajouter un utilisateur</AddButton>

    {modalUser==="new"&&<UserModal onClose={()=>setModalUser(null)} onSave={u=>{addUser(u);setModalUser(null);}}/>}
    {modalUser&&modalUser!=="new"&&<UserModal
      initial={modalUser}
      canDelete={users.length>1}
      onClose={()=>setModalUser(null)}
      onSave={u=>{updateUser(modalUser.id,u);setModalUser(null);}}
      onDelete={()=>{deleteUser(modalUser.id);setModalUser(null);}}
    />}
  </div>;
}


// ── 15. RÉGLAGES ──────────────────────────────────────────────────────────────
function Reglages({onLock}){
  const {t,dark,toggleDark}=useTheme();
  const app = useApp();
  const { currentUser, child, setChild, deleteChild, resetAll, exportData, importData } = app;
  const [notifs,setNotifs]=useState({biberon:true,couche:true,sommeil:true,vaccin:true,medoc:true,activite:false});
  const [childModal,setChildModal]=useState(false);
  const [resetModal,setResetModal]=useState(false);
  const [importMsg,setImportMsg]=useState("");
  const fileInputRef = useRef(null);

  const rLab={admin:"Admin",editeur:"Éditeur",lecteur:"Lecture seule"};

  function handleExport(){
    const json = exportData();
    const blob = new Blob([json],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0,10);
    a.href = url;
    a.download = `omnibaby-export-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e){
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const ok = importData(ev.target.result);
      setImportMsg(ok?"✓ Données importées avec succès.":"✗ Fichier invalide.");
      setTimeout(()=>setImportMsg(""),4000);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return <div>
    <SecTitle style={{marginTop:0}}>Mon profil</SecTitle>
    <Card padding="0 14px">
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`0.5px solid ${t.bd}`}}>
        <Avatar initials={currentUser?.initiales||"?"} color={currentUser?.couleur||"purple"} size={40}/>
        <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:t.tx}}>{currentUser?.nom||"Utilisateur"}</div><div style={{fontSize:12,color:t.tx2}}>{rLab[currentUser?.role]||""}</div></div>
      </div>
      <div style={{padding:"10px 0"}}>
        <button onClick={onLock} style={{fontSize:13,color:t.danger,background:"none",border:"none",cursor:"pointer",padding:0}}>🔒 Verrouiller / Changer de profil</button>
      </div>
    </Card>

    <SecTitle>Profil enfant</SecTitle>
    <Card padding="0 14px">
      {child?<div onClick={()=>setChildModal(true)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",cursor:"pointer"}}>
        <div style={{width:40,height:40,borderRadius:"50%",background:t.purpleBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{child.emoji}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:500,color:t.tx}}>{child.nom}</div>
          <div style={{fontSize:12,color:t.tx2}}>{calcAge(child.birthdate)} · Né(e) le {child.birthdate}</div>
        </div>
        <span style={{fontSize:14,color:t.tx3}}>›</span>
      </div>
      :<div style={{padding:"10px 0"}}>
        <div style={{fontSize:13,color:t.tx2,marginBottom:8}}>Aucun profil enfant configuré.</div>
        <AddButton onClick={()=>setChildModal(true)}>Créer le profil de l'enfant</AddButton>
      </div>}
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

    <SecTitle>Données</SecTitle>
    <Card padding="0 14px">
      <div onClick={handleExport} style={{display:"flex",alignItems:"center",padding:"10px 0",borderBottom:`0.5px solid ${t.bd}`,cursor:"pointer"}}>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:t.tx}}>📤 Exporter en JSON</div><div style={{fontSize:11,color:t.tx2}}>Sauvegarde complète des données</div></div>
        <span style={{fontSize:14,color:t.tx3}}>›</span>
      </div>
      <div onClick={()=>fileInputRef.current?.click()} style={{display:"flex",alignItems:"center",padding:"10px 0",cursor:"pointer"}}>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:t.tx}}>📥 Importer un JSON</div><div style={{fontSize:11,color:t.tx2}}>Restaurer depuis une sauvegarde</div></div>
        <span style={{fontSize:14,color:t.tx3}}>›</span>
      </div>
      <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} style={{display:"none"}}/>
      {importMsg&&<div style={{fontSize:12,color:importMsg.startsWith("✓")?t.success:t.danger,padding:"8px 0 0"}}>{importMsg}</div>}
    </Card>

    <SecTitle>Zone de danger</SecTitle>
    <Card padding="0 14px">
      <div onClick={()=>setResetModal(true)} style={{display:"flex",alignItems:"center",padding:"10px 0",cursor:"pointer"}}>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:t.danger}}>🗑️ Réinitialiser l'application</div><div style={{fontSize:11,color:t.tx2}}>Efface toutes les données (profil, utilisateurs, entrées)</div></div>
        <span style={{fontSize:14,color:t.tx3}}>›</span>
      </div>
    </Card>

    {childModal&&<ChildModal
      initial={child}
      onClose={()=>setChildModal(false)}
      onSave={c=>{setChild(c);setChildModal(false);}}
      onDelete={()=>{deleteChild();setChildModal(false);}}
    />}
    {resetModal&&<ResetModal onClose={()=>setResetModal(false)} onConfirm={()=>{resetAll();setResetModal(false);}}/>}
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
  const [editEntry,setEditEntry]=useState(null);

  const store = useLocalStore();
  const auth  = useAuth(store.users);
  const t = dark?DARK:LIGHT;

  useEffect(()=>{const h=new Date().getHours();if(h>=21||h<7)setDark(true);},[]);

  const theme={t,dark,toggleDark:()=>setDark(d=>!d)};

  function handleUnlock(userId, pin, biometric){
    if(biometric) return auth.unlockDirect(userId);
    return auth.unlock(userId, pin);
  }

  if(auth.locked) return (
    <ThemeContext.Provider value={theme}>
      <div style={{background:t.bg,minHeight:"100vh"}}>
        <LockScreen store={store} onUnlock={handleUnlock} getLastUserId={auth.getLastUserId}/>
      </div>
    </ThemeContext.Provider>
  );

  const appData = {
    ...store,
    currentUser: auth.currentUser,
    addEntry: (e)=>store.addEntry(e, auth.currentUser?.nom),
  };

  const child = store.child;

  return (
    <ThemeContext.Provider value={theme}>
      <AppContext.Provider value={appData}>
        <div style={{maxWidth:420,margin:"0 auto",background:t.bg,minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"system-ui,-apple-system,sans-serif"}}>

          {/* Header */}
          <div style={{background:t.headerBg,padding:"18px 16px 12px",flexShrink:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:20,fontWeight:500,color:"#fff"}}>{child?`${child.emoji} ${child.nom}`:`👶 ${APP_NAME}`}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.65)",marginTop:2}}>{child?calcAge(child.birthdate):"Configure le profil dans Réglages"}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginRight:4}}>v{APP_VERSION}</span>
                <button onClick={()=>setDark(d=>!d)} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:20,padding:"4px 10px",color:"#fff",fontSize:12,cursor:"pointer"}}>{dark?"☀️":"🌙"}</button>
                {auth.currentUser&&<div style={{width:26,height:26,borderRadius:"50%",background:"rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff"}}>{auth.currentUser.initiales}</div>}
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
            {tab==="log"    &&<BabyLog onAdd={()=>setShowBabyLogModal(true)} onEdit={e=>setEditEntry(e)}/>}
            {tab==="sante"  &&<GrandisBien/>}
            {tab==="dodo"   &&<DodoZen/>}
            {tab==="outils" &&outilTab==="minuteur"&&<MinuteurTetee/>}
            {tab==="outils" &&outilTab==="medoc"   &&<Medicaments/>}
            {tab==="outils" &&outilTab==="temp"    &&<Temperature/>}
            {tab==="outils" &&outilTab==="divers"  &&<Diversification/>}
            {tab==="outils" &&outilTab==="stats"   &&<Statistiques/>}
            {tab==="outils" &&outilTab==="journal" &&<Journal/>}
            {tab==="outils" &&outilTab==="famille" &&<Famille/>}
            {tab==="config" &&<Reglages onLock={auth.lock}/>}
          </div>

          {/* Modals */}
          {showBabyLogModal&&<BabyLogModal onClose={()=>setShowBabyLogModal(false)}/>}
          {editEntry&&<BabyLogModal initial={editEntry} onClose={()=>setEditEntry(null)}/>}
        </div>
      </AppContext.Provider>
    </ThemeContext.Provider>
  );
}

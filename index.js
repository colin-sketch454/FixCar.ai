const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
const clean=(v,max=4000)=>String(v??"").trim().slice(0,max);
function searchQuery(v,q){return [v?.brand,v?.model,v?.year,v?.engine,v?.power,q,"Forum Erfahrungen Fehler Diagnose Reparatur"].filter(Boolean).join(" ")}
async function search(env,q){
 if(!env.TAVILY_API_KEY)return [];
 const r=await fetch("https://api.tavily.com/search",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({api_key:env.TAVILY_API_KEY,query:q,search_depth:"advanced",max_results:6,include_answer:false,include_raw_content:false})});
 if(!r.ok) throw new Error(`Websuche fehlgeschlagen (${r.status})`);
 const d=await r.json();
 return (d.results||[]).map((x,i)=>({id:i+1,title:clean(x.title,180),url:clean(x.url,500),content:clean(x.content,1800)}));
}
function prompt(v={},mem=[],src=[]){
 const vehicle=[v.brand&&`Marke: ${v.brand}`,v.model&&`Modell: ${v.model}`,v.year&&`Baujahr: ${v.year}`,v.engine&&`Motor: ${v.engine}`,v.power&&`Leistung: ${v.power}`,v.fuel&&`Kraftstoff: ${v.fuel}`,v.notes&&`Fahrzeugnotizen: ${v.notes}`].filter(Boolean).join("\n")||"Noch kein Fahrzeugprofil hinterlegt.";
 const memories=mem.length?mem.slice(-20).map(m=>`- ${clean(m,350)}`).join("\n"):"- keine";
 const sources=src.length?src.map(s=>`[Quelle ${s.id}] ${s.title}\nURL: ${s.url}\nAuszug: ${s.content}`).join("\n\n"):"Keine Webquellen verfügbar.";
 return `Du bist AutoAI, ein deutschsprachiger Assistent für Fahrzeugdiagnose, Reparaturplanung und technische Recherche.\n\nArbeitsweise:\n- Nutze Fahrzeugprofil und Gesprächskontext.\n- Wenn Webquellen vorhanden sind, stütze konkrete Behauptungen auf diese Quellen und zitiere mit [1], [2] usw.\n- Forenberichte sind Erfahrungswerte, keine Herstellervorgaben. Kennzeichne das.\n- Erfinde keine Teilenummern, Sicherungsnummern, Kabelfarben, Drehmomente oder Messwerte.\n- Unterscheide zwischen wahrscheinlich, möglich und bestätigt.\n- Gib zuerst die wahrscheinlichsten Ursachen, danach einen sinnvollen Prüfablauf.\n- Frage nur nach Informationen, die für die nächste Diagnose wirklich fehlen.\n- Bei Brand-, Hochvolt-, Airbag-, Brems- oder erheblicher Verletzungsgefahr: warne knapp und empfehle ggf. Fachwerkstatt.\n\nFahrzeugprofil:\n${vehicle}\n\nGespeicherte Diagnose-Notizen:\n${memories}\n\nRecherche:\n${sources}`;
}
async function chat(req,env){
 const b=await req.json().catch(()=>({})); const q=clean(b.message,4000); if(!q)return json({error:"Bitte gib eine Frage ein."},400);
 const vehicle=b.vehicle||{}, history=Array.isArray(b.history)?b.history.slice(-12):[], memories=Array.isArray(b.memories)?b.memories.slice(-30):[], webSearch=b.webSearch!==false;
 let sources=[],searchWarning=null; if(webSearch){try{sources=await search(env,searchQuery(vehicle,q))}catch(e){searchWarning=e.message}}
 try{
  const result=await env.AI.run(MODEL,{messages:[{role:"system",content:prompt(vehicle,memories,sources)},...history.filter(m=>m&&["user","assistant"].includes(m.role)).map(m=>({role:m.role,content:clean(m.content,3500)})),{role:"user",content:q}],max_tokens:900,temperature:0.35});
  const answer=typeof result==="string"?result:(result?.response||result?.result?.response||"Keine Antwort erhalten.");
  return json({answer,sources,searchWarning,model:MODEL});
 }catch(e){return json({error:"Die KI konnte gerade nicht antworten.",detail:String(e?.message||e)},500)}
}
export default{async fetch(req,env){const u=new URL(req.url);if(u.pathname==="/api/chat"&&req.method==="POST")return chat(req,env);if(u.pathname==="/api/health")return json({ok:true,ai:Boolean(env.AI),searchConfigured:Boolean(env.TAVILY_API_KEY)});return env.ASSETS.fetch(req)}};

const{useState,useEffect,useMemo,useRef}=React,EVENTS_JSON_URL="./events.json",USE_SAMPLE_DATA=!1,MIN_YEAR=2026,MIN_MONTH=0,KOFI_URL="https://ko-fi.com/kaluuja",FEEDBACK_FORM_URL="https://forms.gle/62psP8V9JF88Kdnz8",SAMPLE_EVENTS=[{date:"2026-01-25",title:"The BLANK who BLANKED me",venue:"Bristol Improv Theatre",time:"19:00\u201320:00",type:"show",url:"#"},{date:"2026-01-28",title:"Lily Maryon",venue:"Bristol Improv Theatre",time:"19:30\u201321:30",type:"show",url:"#"},{date:"2026-01-28",title:"Biscuit Barrel",venue:"Bristol Improv Theatre",time:"14:00\u201315:00",type:"show",url:"#"},{date:"2026-01-28",title:"Luke McQueen",venue:"Bristol Improv Theatre",time:"21:00\u201322:00",type:"show",url:"#"},{date:"2026-01-28",title:"Open Jam Night",venue:"Hen & Chicken",time:"19:30\u201321:30",type:"jam",url:"#"},{date:"2026-01-30",title:"Belltower",venue:"Bristol Improv Theatre",time:"19:30\u201321:30",type:"show",url:"#"},{date:"2026-01-31",title:"Antics Joke Show",venue:"Bristol Improv Theatre",time:"19:30\u201321:30",type:"show",url:"#"},{date:"2026-02-05",title:"Live in da Hive",venue:"PRSC",time:"19:00\u201322:30",type:"show",url:"#"},{date:"2026-02-06",title:"The Bish Bosh Bash",venue:"Bristol Improv Theatre",time:"19:30\u201321:30",type:"show",url:"#"},{date:"2026-02-11",title:"Wednesday Night Improv",venue:"Hen & Chicken",time:"19:30\u201321:30",type:"show",url:"#"},{date:"2026-02-14",title:"From HELL YEAH! with love",venue:"Bristol Improv Theatre",time:"19:30\u201321:30",type:"show",url:"#"},{date:"2026-02-25",title:"Tales From The Wasteland",venue:"Hen & Chicken",time:"19:30\u201322:00",type:"show",url:"#"}],useEscapeToClose=(u,h)=>{useEffect(()=>{if(!u)return;const p=s=>{s.key==="Escape"&&h()};return document.addEventListener("keydown",p),()=>document.removeEventListener("keydown",p)},[u,h])},RoadmapModal=({isOpen:u,onClose:h,colors:p})=>{if(useEscapeToClose(u,h),!u)return null;const s=({done:l,children:z})=>React.createElement("li",{style:{marginBottom:"0.6rem",display:"flex",alignItems:"flex-start",gap:"0.6rem"}},React.createElement("span",{style:{flexShrink:0,width:"22px",height:"22px",borderRadius:"5px",background:l?p.sage:"transparent",border:l?"none":`2px solid ${p.textMuted}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",color:"white",marginTop:"1px"}},l&&"\u2713"),React.createElement("span",{style:{textDecoration:l?"line-through":"none",color:l?p.textMuted:p.text,fontSize:"0.9rem",lineHeight:1.4}},z));return React.createElement("div",{className:"modal-overlay",onClick:h},React.createElement("div",{className:"modal-content",onClick:l=>l.stopPropagation()},React.createElement("div",{className:"modal-header"},React.createElement("h2",null,"\u{1F5FA}\uFE0F Roadmap"),React.createElement("button",{className:"modal-close",onClick:h},"\u2715")),React.createElement("div",{className:"modal-body"},React.createElement("p",{className:"roadmap-intro"},"This calendar is a work in progress! Here's what's been done and what's coming next."),React.createElement("div",{className:"roadmap-section"},React.createElement("h3",null,"\u26A1 Core Functionality"),React.createElement("ul",null,React.createElement(s,{done:!0},"Add filters and search"),React.createElement(s,{done:!0},"'Swipe' between months on mobile"),React.createElement(s,{done:!0},"Shows, workshops, drop-ins, jams added"),React.createElement(s,{done:!1},"Downloadable calendar feed"),React.createElement(s,{done:!1},"Email newsletter for weekly updates"))),React.createElement("div",{className:"roadmap-section"},React.createElement("h3",null,"\u{1F3AD} Events"),React.createElement("ul",null,React.createElement(s,{done:!0},"Added 15 venues"),React.createElement(s,{done:!0},"Added additional ticket websites"))),React.createElement("div",{className:"roadmap-section"},React.createElement("h3",null,"\u{1F3A8} Design & Experience"),React.createElement("ul",null,React.createElement(s,{done:!0},"Event type colour-coding"),React.createElement(s,{done:!0},"Event type icons for colour-blind"),React.createElement(s,{done:!0},"Dark mode"),React.createElement(s,{done:!0},"List view option"),React.createElement(s,{done:!1},"Save favourite events"))),React.createElement("div",{className:"roadmap-section"},React.createElement("h3",null,"\u{1F52E} Future Ideas"),React.createElement("ul",null,React.createElement(s,{done:!1},"Improv type tags? (shortform, longform, musical, narrative, etc.)"),React.createElement(s,{done:!1},"Performer and group profiles/socials"),React.createElement(s,{done:!1},"User accounts and personalisation"),React.createElement(s,{done:!1},"Event reminders/New events added"))))))},SettingsModal=({isOpen:u,onClose:h,colors:p,darkMode:s,setDarkMode:l,viewMode:z,setViewMode:M,onOpenRoadmap:F,lastUpdated:B,formatLastUpdated:T})=>(useEscapeToClose(u,h),u?React.createElement("div",{className:"modal-overlay",onClick:h},React.createElement("div",{className:"modal-content settings-modal",onClick:g=>g.stopPropagation()},React.createElement("div",{className:"modal-header"},React.createElement("h2",null,"\u2699\uFE0F Settings"),React.createElement("button",{className:"modal-close",onClick:h},"\u2715")),React.createElement("div",{className:"modal-body"},React.createElement("div",{className:"settings-section"},React.createElement("div",{className:"settings-row"},React.createElement("div",{className:"settings-label"},React.createElement("span",{className:"settings-icon"},s?"\u{1F319}":"\u2600\uFE0F"),React.createElement("span",null,s?"Dark Mode":"Light Mode")),React.createElement("button",{className:`toggle-btn ${s?"active":""}`,onClick:()=>l(!s),"aria-label":"Toggle dark mode"},React.createElement("span",{className:"toggle-slider"})))),React.createElement("div",{className:"settings-section"},React.createElement("div",{className:"settings-row"},React.createElement("div",{className:"settings-label"},React.createElement("span",{className:"settings-icon"},"\u{1F4C5}"),React.createElement("span",null,"View")),React.createElement("div",{className:"view-toggle"},React.createElement("button",{className:`view-toggle-btn ${z==="calendar"?"active":""}`,onClick:()=>M("calendar"),"data-goatcounter-click":"view-toggle-calendar"},"\u{1F4C5} Calendar"),React.createElement("button",{className:`view-toggle-btn ${z==="list"?"active":""}`,onClick:()=>M("list"),"data-goatcounter-click":"view-toggle-list"},"\u{1F4CB} List")))),React.createElement("div",{className:"settings-section settings-signup"},React.createElement("div",{className:"signup-box"},React.createElement("div",{className:"signup-header"},"\u{1F4F0} Get the newsletter"),React.createElement("p",{className:"signup-text"},"What's on in Bristol improv, straight to your inbox. No spam, unsubscribe any time."),React.createElement("form",{action:"https://buttondown.com/api/emails/embed-subscribe/Kaluuja",method:"post",target:"popupwindow",onSubmit:()=>{window.open("https://buttondown.com/Kaluuja","popupwindow")},className:"signup-form"},React.createElement("input",{type:"email",name:"email",required:!0,placeholder:"you@example.com","aria-label":"Email address",className:"signup-input"}),React.createElement("button",{type:"submit",className:"signup-btn","data-goatcounter-click":"newsletter-signup"},"Subscribe")))),React.createElement("div",{className:"settings-section"},React.createElement("button",{className:"settings-link-btn",onClick:()=>{h(),F()}},React.createElement("span",{className:"settings-icon"},"\u{1F5FA}\uFE0F"),React.createElement("span",null,"View Roadmap"),React.createElement("span",{className:"settings-arrow"},"\u2192"))),React.createElement("div",{className:"settings-section"},React.createElement("a",{href:"https://www.technicallyimprov.com/",target:"_blank",rel:"noopener noreferrer",className:"settings-link-btn",style:{textDecoration:"none"}},React.createElement("span",{className:"settings-icon"},"\u{1F3AD}"),React.createElement("span",null,"Bristol Improv Hub"),React.createElement("span",{className:"settings-arrow"},"\u2192"))),React.createElement("div",{className:"settings-section"},React.createElement("a",{href:FEEDBACK_FORM_URL,target:"_blank",rel:"noopener noreferrer",className:"settings-link-btn",style:{textDecoration:"none"}},React.createElement("span",{className:"settings-icon"},"\u{1F4A1}"),React.createElement("span",null,"Submit an idea"),React.createElement("span",{className:"settings-arrow"},"\u2192"))),B&&React.createElement("div",{className:"settings-footer"},React.createElement("span",{className:"settings-updated"},"Calendar last updated: ",T(B)))))):null),BristolImprovCalendar=()=>{const[u,h]=useState(null),[p,s]=useState("all"),[l,z]=useState("all"),[M,F]=useState(""),[B,T]=useState(!1),[g,P]=useState([]),[Ne,_]=useState(!0),[Q,Z]=useState(null),[$e,ee]=useState(!1),[ze,te]=useState(!1),[b,Ee]=useState(()=>{if(typeof window!="undefined"){const t=localStorage.getItem("bristolImprovDarkMode");return t!==null?t==="true":window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches}return!1}),[C,De]=useState(()=>typeof window!="undefined"&&localStorage.getItem("bristolImprovViewMode")==="list"?"list":"calendar"),[W,Se]=useState(null),[c,I]=useState(new Date().getFullYear()),[m,A]=useState(new Date().getMonth()),J=useRef(null),Me=useRef(null),R=useRef(null),L=useRef(null);useEffect(()=>{localStorage.setItem("bristolImprovDarkMode",b.toString())},[b]),useEffect(()=>{localStorage.setItem("bristolImprovViewMode",C)},[C]);const e=b?{cream:"#2A2D3E",terracotta:"#E07A5F",navy:"#E8E8E8",sage:"#81B29A",sand:"#F2CC8F",bg:"#1A1C28",cardBg:"#2A2D3E",text:"#E8E8E8",textMuted:"#E8E8E880",border:"#3D405B"}:{cream:"#F4F1DE",terracotta:"#E07A5F",navy:"#3D405B",sage:"#81B29A",sand:"#F2CC8F",bg:"#F4F1DE",cardBg:"#FFFFFF",text:"#3D405B",textMuted:"#3D405B80",border:"#F4F1DE"},x=t=>{if(!t)return"show";const a=t.toLowerCase().replace(/[-_\s]/g,"");return a==="dropin"||a==="dropins"?"dropin":a==="workshop"||a==="workshops"||a==="class"||a==="classes"?"workshop":a==="jam"||a==="jams"?"jam":"show"},E={show:{color:e.terracotta,label:"Shows",icon:"\u{1F3AD}",dot:"\u{1F534}"},workshop:{color:e.sage,label:"Workshops",icon:"\u{1F4DA}",dot:"\u{1F7E2}"},jam:{color:e.sand,label:"Jams",icon:"\u{1F3B2}",dot:"\u{1F7E1}"},dropin:{color:"#7B68A6",label:"Drop-ins",icon:"\u{1F6AA}",dot:"\u{1F7E3}"}},ae={"Bristol Improv Theatre":{color:e.terracotta,bg:`${e.terracotta}18`,group:"Bristol Improv Theatre",order:1},"Hen & Chicken":{color:e.sand,bg:`${e.sand}25`,group:"Hen & Chicken",order:2},"Hen & Chicken (Chicken Shed)":{color:e.sand,bg:`${e.sand}25`,group:"Hen & Chicken",order:2},"Hen & Chicken (Studio)":{color:e.sand,bg:`${e.sand}25`,group:"Hen & Chicken",order:2},PRSC:{color:e.sage,bg:`${e.sage}20`,group:"PRSC",order:3},"SPACE at PRSC":{color:e.sage,bg:`${e.sage}20`,group:"PRSC",order:3},"Wardrobe Theatre":{color:"#7B68A6",bg:"#7B68A618",group:"Wardrobe Theatre",order:4},"Bristol Old Vic":{color:"#4A6FA5",bg:"#4A6FA518",group:"Bristol Old Vic",order:5},"Tobacco Factory":{color:"#8B6F47",bg:"#8B6F4715",group:"Other",order:6},"Bristol Beacon":{color:"#C4A35A",bg:"#C4A35A15",group:"Other",order:6}},Ce=[{key:"Bristol Improv Theatre",label:"Bristol Improv Theatre"},{key:"Hen & Chicken",label:"Hen & Chicken"},{key:"PRSC",label:"PRSC"},{key:"Wardrobe Theatre",label:"Wardrobe Theatre"},{key:"Bristol Old Vic",label:"Bristol Old Vic"},{key:"Other",label:"Other"}],D=t=>{if(!t)return!0;const a=t.match(/^(\d{1,2}):?(\d{2})?/);return a?parseInt(a[1],10)>=17:!0},re=t=>{if(!t)return null;const a=t.replace(/\s/g,"").split(/[–\-]/),r=i=>{if(!i)return null;const d=i.toLowerCase().includes("pm"),v=i.toLowerCase().includes("am"),N=i.replace(/[apm]/gi,"").split(":");let $=parseInt(N[0],10);const V=N[1]?parseInt(N[1],10):0;return d&&$<12&&($+=12),v&&$===12&&($=0),$*60+V},o=r(a[0]),n=a[1]?r(a[1]):o?o+120:null;return o!==null?{start:o,end:n}:null},Te=(t,a)=>{const r=re(t.time),o=re(a.time);return!r||!o?!1:r.start<o.end&&o.start<r.end},Fe=t=>{if(t.length<2)return!1;for(let a=0;a<t.length;a++)for(let r=a+1;r<t.length;r++)if(Te(t[a],t[r]))return!0;return!1},oe=async()=>{var t,a;if(USE_SAMPLE_DATA){setTimeout(()=>{P(SAMPLE_EVENTS),_(!1)},300);return}try{_(!0),Z(null);const r=await fetch(EVENTS_JSON_URL+`?t=${Date.now()}`);if(!r.ok)throw new Error(`Failed: ${r.status}`);const o=await r.json();let n=o.events||((t=o.record)==null?void 0:t.events)||o;P(Array.isArray(n)?n:[]),Se(o.lastUpdated||((a=o.record)==null?void 0:a.lastUpdated))}catch(r){P([]),Z("Couldn't load the events just now.")}finally{_(!1)}};useEffect(()=>{oe()},[]),useEffect(()=>{const t=a=>{J.current&&!J.current.contains(a.target)&&T(!1)};return document.addEventListener("mousedown",t),()=>document.removeEventListener("mousedown",t)},[]);const K=new Date,w=K.getFullYear(),y=K.getMonth(),ne=K.getDate(),G=useMemo(()=>{if(g.length===0)return{year:w,month:y};let t=MIN_YEAR,a=MIN_MONTH;return g.forEach(r=>{const o=new Date(r.date);(o.getFullYear()>t||o.getFullYear()===t&&o.getMonth()>a)&&(t=o.getFullYear(),a=o.getMonth())}),{year:t,month:a}},[g]),ie=y===0?w-1:w,Be=y===0?11:y-1,se=c>ie||c===ie&&m>Be,le=c<G.year||c===G.year&&m<G.month,Ie=c===w&&m===y,de=new Date(c,m+1,0).getDate(),ce=new Date(c,m,1).getDay(),U=ce===0?6:ce-1,Ae=["January","February","March","April","May","June","July","August","September","October","November","December"],me=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],Re=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],pe=()=>{se&&(h(null),A(m===0?11:m-1),I(m===0?c-1:c))},ge=()=>{le&&(h(null),A(m===11?0:m+1),I(m===11?c+1:c))},Le=()=>{h(null),I(w),A(y)},je=t=>{R.current=t.touches[0].clientX,L.current=t.touches[0].clientY},He=t=>{if(R.current===null||L.current===null)return;const a=t.changedTouches[0].clientX,r=t.changedTouches[0].clientY,o=a-R.current,n=r-L.current;Math.abs(o)>Math.abs(n)&&Math.abs(o)>50&&(o>0?pe():ge()),R.current=null,L.current=null},j=t=>{const a=ae[t];return a?a.group:t.startsWith("Hen & Chicken")?"Hen & Chicken":t.includes("PRSC")?"PRSC":"Other"},Oe=t=>ae[t]||{color:e.navy,bg:`${e.navy}15`,group:"Other"},X=t=>g.filter(a=>{const r=new Date(a.date);if(r.getMonth()!==m||r.getFullYear()!==c||r.getDate()!==t)return!1;const o=j(a.venue),n=p==="all"||o===p,i=x(a.type);let d=!0;return l==="daytime"?d=!D(a.time):l==="evening"?d=D(a.time):l!=="all"&&(d=i===l),n&&d}),et=t=>{const a=X(t),r={};return a.forEach(o=>{const n=x(o.type);r[n]=(r[n]||0)+1}),r},he=useMemo(()=>{if(!M.trim())return[];const t=M.toLowerCase();return g.filter(a=>{var r;return a.title.toLowerCase().includes(t)||a.venue.toLowerCase().includes(t)||((r=a.description)==null?void 0:r.toLowerCase().includes(t))}).slice(0,8)},[M,g]),ue=useMemo(()=>{const t=new Date;return t.setHours(0,0,0,0),g.filter(a=>{const r=new Date(a.date);if(r.setHours(0,0,0,0),r<t)return!1;const o=j(a.venue),n=p==="all"||o===p,i=x(a.type);let d=!0;return l==="daytime"?d=!D(a.time):l==="evening"?d=D(a.time):l!=="all"&&(d=i===l),n&&d}).sort((a,r)=>new Date(a.date)-new Date(r.date))},[g,p,l]),fe=useMemo(()=>{const t={};return ue.forEach(a=>{const r=a.date;t[r]||(t[r]=[]),t[r].push(a)}),t},[ue]),Ye=t=>{const a=new Date(t.date),r=x(t.type),o=j(t.venue),n=D(t.time);let i=l==="all";l==="daytime"?i=!n:l==="evening"?i=n:l!=="all"&&(i=r===l);const d=p==="all"||o===p;i||z("all"),d||s("all"),I(a.getFullYear()),A(a.getMonth()),h(a.getDate()),F(""),T(!1)},Ve=useMemo(()=>{const t=new Set;return g.forEach(a=>t.add(j(a.venue))),t},[g]),H=useMemo(()=>{const t=new Set;return g.forEach(a=>{const r=x(a.type);t.add(r)}),t},[g]),Pe=useMemo(()=>g.some(t=>!D(t.time)),[g]),_e=useMemo(()=>g.some(t=>D(t.time)),[g]),be=t=>{if(!t)return null;const a=new Date(t),r=Math.floor((new Date-a)/6e4);if(r<60)return`${r}m ago`;const o=Math.floor(r/60);return o<24?`${o}h ago`:a.toLocaleDateString("en-GB",{day:"numeric",month:"short"})},We=t=>new Date(t).toLocaleDateString("en-GB",{day:"numeric",month:"short"}),Je=t=>["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(c,m,t).getDay()],Ke=(t,a=16)=>{const r=t.replace(/^The\s+/i,"").replace(/[:|].*$/,"").trim();return r.length>a?r.substring(0,a-1)+"\u2026":r},O=Math.ceil((U+de)/7),ve=(t,a)=>{const r={};return t.forEach(o=>{if(D(o.time)===a){const i=x(o.type);r[i]=(r[i]||0)+1}}),r},xe=t=>{const a=["show","workshop","jam","dropin"],r=[];return a.forEach(o=>{if(t[o]){const n=t[o],i=E[o]||{color:e.navy};r.push({type:o,count:n,color:i.color})}}),r.slice(0,4)},we=(t,a)=>{const{type:r,count:o,color:n}=t;switch(r){case"show":return React.createElement("div",{key:a,className:"mobile-shape-wrap"},React.createElement("div",{className:"mobile-circle",style:{background:n}},o>1&&React.createElement("span",{className:"shape-count"},o)));case"workshop":return React.createElement("div",{key:a,className:"mobile-shape-wrap"},React.createElement("div",{className:"mobile-square",style:{background:n}},o>1&&React.createElement("span",{className:"shape-count"},o)));case"jam":return React.createElement("div",{key:a,className:"mobile-shape-wrap"},React.createElement("div",{className:"mobile-diamond",style:{background:n}},React.createElement("span",null,o>1?React.createElement("span",{className:"shape-count"},o):"")));case"dropin":return React.createElement("div",{key:a,className:"mobile-triangle-wrap"},React.createElement("div",{className:"mobile-triangle",style:{background:n}}),o>1&&React.createElement("span",{className:"mobile-triangle-num"},o));default:return React.createElement("div",{key:a,className:"mobile-shape-wrap"},React.createElement("div",{className:"mobile-circle",style:{background:n}},o>1&&React.createElement("span",{className:"shape-count"},o)))}},Ge=()=>{const t=[];for(let a=0;a<U;a++)t.push(React.createElement("div",{key:`e-${a}`,className:"cal-day empty"}));for(let a=1;a<=de;a++){const r=X(a),o=r.length>0,n=u===a,d=(U+a-1)%7>=5,v=c===w&&m===y&&a===ne,k=c<w||c===w&&m<y||c===w&&m===y&&a<ne,N=ve(r,!1),$=ve(r,!0),V=xe(N),ye=xe($),qe=(S,f)=>{switch(S){case"show":return React.createElement("div",{className:"chip-shape-wrap"},React.createElement("div",{className:"chip-circle",style:{background:f}}));case"workshop":return React.createElement("div",{className:"chip-shape-wrap"},React.createElement("div",{className:"chip-square",style:{background:f}}));case"jam":return React.createElement("div",{className:"chip-shape-wrap"},React.createElement("div",{className:"chip-diamond",style:{background:f}}));case"dropin":return React.createElement("div",{className:"chip-triangle-wrap"},React.createElement("div",{className:"chip-triangle",style:{background:f}}));default:return React.createElement("div",{className:"chip-shape-wrap"},React.createElement("div",{className:"chip-circle",style:{background:f}}))}};t.push(React.createElement("div",{key:a,className:`cal-day ${o?"has-events":""} ${n?"selected":""} ${d?"weekend":""} ${v?"today":""} ${k?"past":""}`,onClick:()=>o&&h(n?null:a)},React.createElement("span",{className:`date-num ${v?"today-num":""}`},a),o&&React.createElement("div",{className:"event-previews"},React.createElement("div",{className:"desktop-events"},r.slice(0,3).map((S,f)=>{const ke=x(S.type),q=E[ke]||E.show;return React.createElement("div",{key:f,className:"event-chip",style:{background:`${q.color}18`,borderColor:q.color}},qe(ke,q.color),React.createElement("span",{className:"chip-title"},Ke(S.title)))}),r.length>3&&React.createElement("span",{className:"more"},"+",r.length-3," more")),React.createElement("div",{className:"mobile-events"},React.createElement("div",{className:"mobile-time-zone daytime"},V.slice(0,2).map((S,f)=>we(S,`day-${f}`)),V.length>2&&React.createElement("span",{className:"mobile-more"},"+")),React.createElement("div",{className:"mobile-time-zone evening"},ye.slice(0,2).map((S,f)=>we(S,`eve-${f}`)),ye.length>2&&React.createElement("span",{className:"mobile-more"},"+"))))))}return t},Y=u?X(u):[],Ue=()=>{const t=(a,r)=>{switch(a){case"show":return React.createElement("div",{className:"key-shape"},React.createElement("div",{className:"shape-circle",style:{background:r}}));case"workshop":return React.createElement("div",{className:"key-shape"},React.createElement("div",{className:"shape-square",style:{background:r}}));case"jam":return React.createElement("div",{className:"shape-diamond-wrap"},React.createElement("div",{className:"shape-diamond",style:{background:r}}));case"dropin":return React.createElement("div",{className:"shape-triangle-wrap"},React.createElement("div",{className:"shape-triangle",style:{background:r}}));default:return React.createElement("div",{className:"key-shape"},React.createElement("div",{className:"shape-circle",style:{background:r}}))}};return React.createElement("div",{className:"color-key"},React.createElement("span",{className:"key-label"},"Key:"),Object.entries(E).map(([a,r])=>React.createElement("div",{key:a,className:"key-item"},t(a,r.color),React.createElement("span",{className:"key-text"},r.label))))},tt=t=>{const a=new Date(t),r=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],o=["January","February","March","April","May","June","July","August","September","October","November","December"],n=new Date;n.setHours(0,0,0,0);const i=new Date(n);i.setDate(i.getDate()+1);const d=new Date(t);return d.setHours(0,0,0,0),d.getTime()===n.getTime()?`Today, ${a.getDate()} ${o[a.getMonth()]}`:d.getTime()===i.getTime()?`Tomorrow, ${a.getDate()} ${o[a.getMonth()]}`:`${r[a.getDay()]}, ${a.getDate()} ${o[a.getMonth()]}`},Xe=()=>{const t=Object.keys(fe).sort((r,o)=>new Date(r)-new Date(o));if(t.length===0)return React.createElement("div",{className:"list-view"},React.createElement("div",{className:"list-empty"},React.createElement("span",null,"\u{1F3AD}"),React.createElement("p",null,"No upcoming events match your filters"),React.createElement("button",{onClick:()=>{z("all"),s("all")}},"Clear filters")));const a=r=>{const o=new Date(r),n=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],i=["January","February","March","April","May","June","July","August","September","October","November","December"],d=new Date;d.setHours(0,0,0,0);const v=new Date(d);v.setDate(v.getDate()+1);const k=new Date(r);k.setHours(0,0,0,0);let N=n[o.getDay()];k.getTime()===d.getTime()?N="Today":k.getTime()===v.getTime()&&(N="Tomorrow");const $=`${o.getDate()} ${i[o.getMonth()]} ${o.getFullYear()}`;return{dayPart:N,datePart:$}};return React.createElement("div",{className:"list-view"},React.createElement("div",{className:"list-container"},t.map(r=>{const{dayPart:o,datePart:n}=a(r);return React.createElement("div",{key:r,className:"list-date-group"},React.createElement("div",{className:"list-date-header"},React.createElement("span",{className:"list-date-day"},o),React.createElement("span",{className:"list-date-full"},n)),React.createElement("div",{className:"list-events"},fe[r].map((i,d)=>{const v=x(i.type),k=E[v]||E.show;return React.createElement("a",{key:d,href:i.url,target:"_blank",rel:"noopener noreferrer",className:"list-event-card","data-goatcounter-click":"ticket-link"},React.createElement("div",{className:"list-event-time"},i.time),React.createElement("div",{className:"list-event-indicator",style:{background:k.color}}),React.createElement("div",{className:"list-event-details"},React.createElement("div",{className:"list-event-title"},i.title),React.createElement("div",{className:"list-event-venue"},"\u{1F4CD} ",i.venue)),React.createElement("div",{className:"list-event-type"},k.icon))})))})),React.createElement("div",{className:"list-footer"},React.createElement("div",{className:"kofi-bar"},React.createElement("span",{className:"kofi-text"},"\u2615 Find this useful? Buy Ste a brew! (...or a pint...)"),React.createElement("a",{href:KOFI_URL,target:"_blank",rel:"noopener noreferrer",className:"kofi-btn"},"\u2764\uFE0F Support on Ko-fi")),React.createElement("div",{className:"footer"},React.createElement("span",{className:"footer-text"},"Missing a show? Got corrections?")," ",React.createElement("a",{href:FEEDBACK_FORM_URL,target:"_blank",rel:"noopener noreferrer"},"Let us know"))))};return React.createElement("div",{className:"app"},React.createElement("style",null,`
            .app {
              display: flex;
              flex-direction: column;
              height: 100vh;
              background: ${e.bg};
              font-family: 'Nunito', sans-serif;
              color: ${e.text};
              overflow: hidden;
              position: relative;
            }
            
            /* HEADER - Always uses light mode colors */
            .header {
              background: #3D405B;
              padding: 0.6rem 1rem;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 0.75rem;
              flex-shrink: 0;
            }
            .header-left {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              min-width: 0;
            }
            .header h1 {
              font-size: 1.4rem;
              font-weight: 800;
              color: #F4F1DE;
              white-space: nowrap;
              line-height: 1.1;
            }
            .header-center {
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            .nav-btn {
              background: transparent;
              border: 2px solid #F4F1DE40;
              color: #F4F1DE;
              width: 32px;
              height: 32px;
              border-radius: 6px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1rem;
              transition: all 0.15s;
            }
            .nav-btn:hover:not(:disabled) { background: #F4F1DE15; border-color: #F4F1DE; }
            .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
            .month-label {
              font-size: 0.9rem;
              font-weight: 600;
              color: ${e.sage};
              text-transform: uppercase;
              letter-spacing: 0.08em;
              min-width: 110px;
              text-align: center;
            }
            .month-full { display: inline; }
            .month-short { display: none; }
            .today-btn {
              font-size: 0.65rem;
              font-weight: 700;
              padding: 0.35rem 0.6rem;
              background: ${e.sage};
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              text-transform: uppercase;
            }
            .today-btn:disabled { opacity: 0.4; cursor: not-allowed; }
            .settings-btn {
              font-size: 0.75rem;
              font-weight: 600;
              padding: 0.4rem 0.7rem;
              background: transparent;
              border: 2px solid #F4F1DE40;
              color: #F4F1DE;
              border-radius: 6px;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.35rem;
              white-space: nowrap;
            }
            .settings-btn:hover { background: #F4F1DE15; border-color: #F4F1DE; }
            
            .header-right {
              display: flex;
              align-items: center;
              gap: 1rem;
            }
            .hub-link {
              color: #F4F1DE;
              text-decoration: none;
              font-size: 0.85rem;
              font-weight: 700;
              display: flex;
              align-items: center;
              gap: 0.25rem;
              opacity: 0.9;
              transition: opacity 0.15s;
              white-space: nowrap;
            }
            .hub-link:hover { opacity: 1; text-decoration: underline; }
            .hub-link-text-mobile { display: none; }
            
            /* CONTROLS */
            .controls {
              background: ${e.cardBg};
              border-bottom: 2px solid ${e.border};
              padding: 0.6rem 0.75rem;
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              position: relative;
            }
            .controls-inner {
              display: flex;
              gap: 0.5rem;
              align-items: center;
              justify-content: center;
              position: relative;
              width: 100%;
              max-width: 650px;
            }
            .search-box {
              position: static;
              width: 200px;
              flex-shrink: 0;
            }
            .search-input {
              width: 100%;
              padding: 0.45rem 0.6rem 0.45rem 2rem;
              border: 2px solid ${e.border};
              border-radius: 18px;
              font-size: 0.85rem;
              font-family: inherit;
              color: ${e.text};
              background: ${e.cardBg};
            }
            .search-input:focus { outline: none; border-color: ${e.terracotta}; }
            .search-icon {
              position: absolute;
              left: 0.7rem;
              top: 50%;
              transform: translateY(-50%);
              font-size: 0.8rem;
              pointer-events: none;
            }
            .search-results {
              position: absolute;
              top: 100%;
              left: 0;
              right: 0;
              background: ${e.cardBg};
              border-radius: 10px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.15);
              margin-top: 4px;
              z-index: 100;
              max-height: 320px;
              overflow-y: auto;
            }
            .search-item {
              padding: 0.75rem 0.9rem;
              cursor: pointer;
              border-bottom: 1px solid ${e.border};
            }
            .search-item:hover { background: ${e.cream}; }
            .search-item:last-child { border-bottom: none; }
            .search-title { font-size: 0.9rem; font-weight: 600; color: ${e.text}; }
            .search-meta { font-size: 0.8rem; color: ${e.textMuted}; margin-top: 0.15rem; }
            
            .filter-select {
              font-family: inherit;
              font-size: 0.85rem;
              font-weight: 600;
              padding: 0.45rem 1.8rem 0.45rem 0.7rem;
              border: 2px solid ${e.border};
              border-radius: 8px;
              background: ${e.cardBg} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${b?"%23E8E8E8":"%233D405B"}' d='M2 4l4 4 4-4H2z'/%3E%3C/svg%3E") no-repeat right 0.6rem center;
              color: ${e.text};
              cursor: pointer;
              appearance: none;
              flex: 1;
              min-width: 0;
            }
            .filter-select:focus { outline: none; border-color: ${e.terracotta}; }
            .filter-select.active { border-color: ${e.terracotta}; background-color: ${e.terracotta}10; }
            
            /* COLOR KEY */
            .color-key {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 1rem;
              padding: 0.4rem 0.75rem;
              background: ${e.cardBg};
              border-bottom: 2px solid ${e.border};
              flex-shrink: 0;
            }
            .key-label {
              font-size: 0.75rem;
              font-weight: 700;
              color: ${e.textMuted};
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .key-item {
              display: flex;
              align-items: center;
              gap: 0.35rem;
            }
            .key-shape {
              width: 14px;
              height: 14px;
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .key-text {
              font-size: 0.8rem;
              font-weight: 600;
              color: ${e.text};
            }
            
            /* Shape definitions for key */
            .shape-circle {
              width: 100%;
              height: 100%;
              border-radius: 50%;
            }
            .shape-square {
              width: 100%;
              height: 100%;
              border-radius: 3px;
            }
            .shape-diamond-wrap {
              width: 14px;
              height: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .shape-diamond {
              width: 11px;
              height: 11px;
              border-radius: 2px;
              transform: rotate(45deg);
            }
            /* Rounded Triangle CSS - Source: https://stackoverflow.com/a/14451916, License: CC BY-SA 3.0 */
            .shape-triangle-wrap {
              width: 14px;
              height: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            }
            .shape-triangle {
              position: relative;
              text-align: left;
            }
            .shape-triangle:before,
            .shape-triangle:after {
              content: '';
              position: absolute;
              background-color: inherit;
            }
            .shape-triangle,
            .shape-triangle:before,
            .shape-triangle:after {
              width: 8px;
              height: 8px;
              border-top-right-radius: 30%;
            }
            .shape-triangle {
              transform: rotate(-60deg) skewX(-30deg) scale(1,.866);
            }
            .shape-triangle:before {
              transform: rotate(-135deg) skewX(-45deg) scale(1.414,.707) translate(0,-50%);
            }
            .shape-triangle:after {
              transform: rotate(135deg) skewY(-45deg) scale(.707,1.414) translate(50%);
            }
            
            /* MAIN LAYOUT */
            .main {
              display: flex;
              flex: 1;
              overflow: hidden;
              min-height: 0;
            }
            
            /* CALENDAR */
            .calendar {
              flex: 1;
              display: flex;
              flex-direction: column;
              overflow: hidden;
            }
            .cal-grid {
              display: grid;
              grid-template-columns: repeat(7, 1fr);
              grid-template-rows: auto repeat(${O}, 1fr);
              gap: 4px;
              padding: 0.5rem;
              flex: 1;
              min-height: 0;
            }
            .day-hdr {
              font-size: 0.8rem;
              font-weight: 700;
              text-align: center;
              padding: 0.4rem 0;
              color: ${e.textMuted};
              text-transform: uppercase;
            }
            .cal-day {
              background: ${e.cardBg};
              border-radius: 6px;
              padding: 0.35rem;
              display: flex;
              flex-direction: column;
              border: 2px solid transparent;
              overflow: visible;
              min-height: 0;
            }
            .cal-day.empty { background: transparent; border: none; }
            .cal-day.weekend { background: ${b?"#2F3244":"#fffdf8"}; }
            .cal-day.today { border-color: ${e.terracotta}50; background: ${e.terracotta}15; }
            .cal-day.past .event-previews { opacity: 0.45; filter: grayscale(35%); }
            .cal-day.past.has-events .date-num { color: ${e.textMuted}; }
            .cal-day.has-events { cursor: pointer; }
            .cal-day.has-events:hover { border-color: ${e.sage}; transform: scale(1.02); z-index: 1; }
            .cal-day.selected { border-color: ${e.terracotta}; box-shadow: 0 2px 8px ${e.terracotta}30; z-index: 2; }
            .date-num {
              font-size: 0.9rem;
              font-weight: 700;
              color: ${e.textMuted};
              margin-bottom: 0.25rem;
              flex-shrink: 0;
            }
            .has-events .date-num { color: ${e.text}; }
            .date-num.today-num { color: ${e.terracotta}; }
            
            .event-previews {
              flex: 1;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              gap: 3px;
            }
            
            /* Desktop events - show titles */
            .desktop-events {
              display: flex;
              flex-direction: column;
              gap: 3px;
            }
            .event-chip {
              display: flex;
              align-items: center;
              gap: 4px;
              padding: 3px 5px;
              border-radius: 4px;
              border-left: 3px solid;
              overflow: hidden;
            }
            /* Desktop chip shapes */
            .chip-shape-wrap {
              width: 8px;
              height: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            .chip-circle {
              width: 8px;
              height: 8px;
              border-radius: 50%;
            }
            .chip-square {
              width: 8px;
              height: 8px;
              border-radius: 2px;
            }
            .chip-diamond {
              width: 6px;
              height: 6px;
              border-radius: 1px;
              transform: rotate(45deg);
            }
            .chip-triangle-wrap {
              width: 8px;
              height: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            }
            .chip-triangle {
              position: relative;
              text-align: left;
            }
            .chip-triangle:before,
            .chip-triangle:after {
              content: '';
              position: absolute;
              background-color: inherit;
            }
            .chip-triangle,
            .chip-triangle:before,
            .chip-triangle:after {
              width: 5px;
              height: 5px;
              border-top-right-radius: 30%;
            }
            .chip-triangle {
              transform: rotate(-60deg) skewX(-30deg) scale(1,.866);
            }
            .chip-triangle:before {
              transform: rotate(-135deg) skewX(-45deg) scale(1.414,.707) translate(0,-50%);
            }
            .chip-triangle:after {
              transform: rotate(135deg) skewY(-45deg) scale(.707,1.414) translate(50%);
            }
            .chip-title {
              font-size: 0.7rem;
              font-weight: 600;
              color: ${e.text};
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            /* Mobile events - two-zone layout (daytime top, evening bottom) */
            .mobile-events {
              display: none;
              flex-direction: column;
              flex: 1;
              min-height: 24px;
            }
            .mobile-time-zone {
              flex: 1;
              display: flex;
              flex-wrap: wrap;
              gap: 2px;
              align-items: flex-start;
              align-content: flex-start;
              min-height: 12px;
            }
            .mobile-time-zone.evening {
              align-items: flex-end;
              align-content: flex-end;
            }
            
            /* Mobile "more" indicator when there are too many shapes */
            .mobile-more {
              font-size: 0.55rem;
              font-weight: 700;
              color: ${e.textMuted};
              line-height: 1;
              padding: 0 1px;
            }
            
            /* Mobile shape wrapper - consistent sizing */
            .mobile-shape-wrap {
              width: 12px;
              height: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              position: relative;
            }
            
            /* Mobile Circle (Shows) */
            .mobile-circle {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            /* Mobile Rounded Square (Workshops) */
            .mobile-square {
              width: 12px;
              height: 12px;
              border-radius: 3px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            /* Mobile Rounded Diamond (Jams) */
            .mobile-diamond {
              width: 9px;
              height: 9px;
              border-radius: 2px;
              transform: rotate(45deg);
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .mobile-diamond span {
              transform: rotate(-45deg);
            }
            
            /* Mobile Rounded Triangle (Drop-ins) - Source: https://stackoverflow.com/a/14451916, License: CC BY-SA 3.0 */
            .mobile-triangle-wrap {
              width: 12px;
              height: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            }
            .mobile-triangle {
              position: relative;
              text-align: left;
            }
            .mobile-triangle:before,
            .mobile-triangle:after {
              content: '';
              position: absolute;
              background-color: inherit;
            }
            .mobile-triangle,
            .mobile-triangle:before,
            .mobile-triangle:after {
              width: 7px;
              height: 7px;
              border-top-right-radius: 30%;
            }
            .mobile-triangle {
              transform: rotate(-60deg) skewX(-30deg) scale(1,.866);
            }
            .mobile-triangle:before {
              transform: rotate(-135deg) skewX(-45deg) scale(1.414,.707) translate(0,-50%);
            }
            .mobile-triangle:after {
              transform: rotate(135deg) skewY(-45deg) scale(.707,1.414) translate(50%);
            }
            .mobile-triangle-num {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -35%);
              font-size: 0.4rem;
              font-weight: 700;
              color: white;
              z-index: 10;
            }
            
            .shape-count {
              font-size: 0.4rem;
              font-weight: 700;
              color: white;
              line-height: 1;
            }
            
            .more { font-size: 0.65rem; color: ${e.textMuted}; padding: 2px; }
            
            /* DETAIL PANEL - DESKTOP */
            .detail {
              width: 340px;
              background: ${e.cardBg};
              border-left: 3px solid ${e.border};
              overflow-y: auto;
              flex-shrink: 0;
              display: flex;
              flex-direction: column;
            }
            .detail-inner { padding: 1rem; flex: 1; }
            .detail-hdr {
              font-size: 1.15rem;
              font-weight: 700;
              color: ${e.terracotta};
              margin-bottom: 0.75rem;
              padding-bottom: 0.5rem;
              border-bottom: 2px solid ${e.border};
            }
            .event-card {
              display: block;
              background: ${e.cream};
              border-radius: 10px;
              padding: 0.9rem;
              margin-bottom: 0.7rem;
              text-decoration: none;
              color: inherit;
              border-left: 4px solid;
              transition: transform 0.15s;
            }
            .event-card:hover { transform: translateX(3px); }
            .event-row { display: flex; gap: 0.7rem; }
            .event-icon { font-size: 1.5rem; }
            .event-info { flex: 1; min-width: 0; }
            .event-title { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.3rem; }
            .event-meta { font-size: 0.85rem; color: ${e.textMuted}; }
            .event-meta span { display: block; }
            .event-cta { font-size: 0.8rem; font-weight: 700; color: ${e.terracotta}; margin-top: 0.5rem; }
            .no-select {
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              padding: 1rem;
              color: ${e.textMuted};
              font-size: 0.95rem;
            }
            .clash { background: ${e.sand}40; border: 2px solid ${e.sand}; border-radius: 8px; padding: 0.55rem 0.7rem; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.7rem; }
            
            /* LIST VIEW */
            .list-view {
              flex: 1;
              overflow-y: auto;
              display: flex;
              flex-direction: column;
              background: ${e.cardBg};
            }
            .list-container {
              flex: 1;
              max-width: 900px;
              width: 100%;
              margin: 0 auto;
              padding: 0;
            }
            .list-date-group {
              border-bottom: 1px solid ${e.border};
            }
            .list-date-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.75rem 1.25rem;
              background: ${e.cream};
              font-weight: 700;
            }
            .list-date-day {
              font-size: 1rem;
              color: ${e.text};
            }
            .list-date-full {
              font-size: 0.9rem;
              color: ${e.textMuted};
            }
            .list-events {
              background: ${e.cardBg};
            }
            .list-event-card {
              display: flex;
              align-items: center;
              gap: 1rem;
              padding: 0.9rem 1.25rem;
              text-decoration: none;
              color: inherit;
              border-bottom: 1px solid ${e.border};
              transition: background 0.15s;
            }
            .list-event-card:last-child {
              border-bottom: none;
            }
            .list-event-card:hover {
              background: ${e.cream};
            }
            .list-event-time {
              font-size: 0.85rem;
              font-weight: 600;
              color: ${e.textMuted};
              min-width: 110px;
              flex-shrink: 0;
            }
            .list-event-indicator {
              width: 10px;
              height: 10px;
              border-radius: 50%;
              flex-shrink: 0;
            }
            .list-event-details {
              flex: 1;
              min-width: 0;
            }
            .list-event-title {
              font-size: 0.95rem;
              font-weight: 600;
              color: ${e.text};
              margin-bottom: 0.2rem;
            }
            .list-event-venue {
              font-size: 0.8rem;
              color: ${e.textMuted};
            }
            .list-event-type {
              font-size: 1.3rem;
              flex-shrink: 0;
              opacity: 0.8;
            }
            .list-empty {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              color: ${e.textMuted};
              padding: 2rem;
            }
            .list-empty span {
              font-size: 3rem;
              margin-bottom: 1rem;
            }
            .list-empty p {
              font-size: 1rem;
              margin-bottom: 1rem;
            }
            .list-empty button {
              background: ${e.terracotta};
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 6px;
              font-size: 0.85rem;
              font-weight: 600;
              cursor: pointer;
            }
            .list-empty button:hover {
              transform: scale(1.03);
            }
            .list-footer {
              flex-shrink: 0;
            }
            
            /* FOOTER */
            .kofi-bar {
              background: linear-gradient(135deg, ${e.sage}20, ${e.sand}30);
              border-top: 2px solid ${e.border};
              padding: 0.55rem 1rem;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.7rem;
              flex-shrink: 0;
            }
            .kofi-text { font-size: 0.85rem; font-weight: 600; color: ${e.text}; }
            .kofi-btn {
              display: inline-flex;
              align-items: center;
              gap: 0.35rem;
              background: #FF5E5B;
              color: white;
              padding: 0.4rem 0.8rem;
              border-radius: 6px;
              font-size: 0.8rem;
              font-weight: 700;
              text-decoration: none;
            }
            .kofi-btn:hover { transform: scale(1.05); }
            .footer {
              background: ${e.cream};
              border-top: 2px solid ${e.border};
              padding: 0.75rem 1rem;
              text-align: center;
              font-size: 0.9rem;
              flex-shrink: 0;
            }
            .footer-text { color: ${e.text}; font-weight: 600; }
            .footer a { 
              color: ${e.terracotta}; 
              font-weight: 700; 
              text-decoration: none;
              padding: 0.3rem 0.6rem;
              background: ${e.terracotta}15;
              border-radius: 4px;
              margin-left: 0.3rem;
            }
            .footer a:hover { background: ${e.terracotta}25; }
            .footer-updated { color: ${e.textMuted}; margin-left: 0.5rem; font-size: 0.8rem; }
            
            /* Desktop footer - single row */
            .desktop-footer {
              background: linear-gradient(135deg, ${e.sage}15, ${e.sand}20);
              border-top: 2px solid ${e.border};
              padding: 0.5rem 1rem;
              flex-shrink: 0;
            }
            .footer-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 1rem;
              max-width: 1200px;
              margin: 0 auto;
            }
            .footer-left {
              display: flex;
              align-items: center;
              gap: 0.4rem;
              flex-wrap: wrap;
            }
            .footer-left .footer-text { font-size: 0.85rem; }
            .footer-left a { 
              color: ${e.terracotta}; 
              font-weight: 700; 
              text-decoration: none;
              padding: 0.25rem 0.5rem;
              background: ${e.terracotta}15;
              border-radius: 4px;
              font-size: 0.8rem;
            }
            .footer-left a:hover { background: ${e.terracotta}25; }
            .footer-left .footer-updated { font-size: 0.75rem; }
            .footer-right {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              flex-shrink: 0;
            }
            .footer-right .kofi-text { font-size: 0.8rem; }
            .footer-right .kofi-btn { padding: 0.3rem 0.6rem; font-size: 0.75rem; }
            
            /* LOADING */
            .loading {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 0.75rem;
              color: ${e.textMuted};
            }
            .spinner {
              width: 40px;
              height: 40px;
              border: 4px solid ${e.border};
              border-top-color: ${e.terracotta};
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            
            /* MODAL */
            .modal-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0,0,0,0.75);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
              padding: 1rem;
            }
            .modal-content {
              background: ${e.cardBg};
              border-radius: 14px;
              max-width: 540px;
              width: 100%;
              max-height: 90vh;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .modal-header {
              background: ${b?"#1A1C28":e.navy};
              color: ${b?"#E8E8E8":e.cream};
              padding: 1rem 1.25rem;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .modal-header h2 { font-size: 1.2rem; margin: 0; }
            .modal-close { background: none; border: none; color: ${b?"#E8E8E8":e.cream}; font-size: 1.2rem; cursor: pointer; opacity: 0.7; }
            .modal-close:hover { opacity: 1; }
            .modal-body { padding: 1.25rem; overflow-y: auto; flex: 1; }
            .roadmap-intro { font-size: 0.9rem; color: ${e.textMuted}; margin-bottom: 1.25rem; line-height: 1.5; }
            .roadmap-section { margin-bottom: 1.5rem; }
            .roadmap-section h3 { font-size: 1rem; font-weight: 700; margin-bottom: 0.6rem; padding-bottom: 0.4rem; border-bottom: 2px solid ${e.border}; color: ${e.text}; }
            .roadmap-section ul { list-style: none; }
            .roadmap-cta { background: ${e.cream}; border-radius: 10px; padding: 1rem; text-align: center; margin-top: 0.5rem; }
            .roadmap-cta p { font-size: 0.9rem; font-weight: 600; margin-bottom: 0.6rem; }
            .roadmap-cta .cta-note { font-size: 0.75rem; color: ${e.textMuted}; margin-top: 0.5rem; margin-bottom: 0; }
            .cta-button { display: inline-block; background: ${e.terracotta}; color: white; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 700; text-decoration: none; }
            .cta-button:hover { transform: scale(1.03); }
            
            /* Settings Modal */
            .settings-modal { max-width: 380px; }
            .settings-section {
              padding: 0.75rem 0;
              border-bottom: 1px solid ${e.border};
            }
            .settings-section:last-of-type { border-bottom: none; }
            .settings-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .settings-label {
              display: flex;
              align-items: center;
              gap: 0.6rem;
              font-size: 0.95rem;
              font-weight: 600;
              color: ${e.text};
            }
            .settings-icon { font-size: 1.1rem; }
            
            /* Toggle Button */
            .toggle-btn {
              width: 52px;
              height: 28px;
              background: ${b?"#4A4D5E":e.navy+"30"};
              border: none;
              border-radius: 14px;
              cursor: pointer;
              position: relative;
              transition: background 0.2s;
            }
            .toggle-btn.active { background: ${e.sage}; }
            .toggle-slider {
              position: absolute;
              top: 3px;
              left: 3px;
              width: 22px;
              height: 22px;
              background: white;
              border-radius: 50%;
              transition: transform 0.2s;
              box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            }
            .toggle-btn.active .toggle-slider { transform: translateX(24px); }
            
            /* View Mode Toggle */
            .view-toggle {
              display: flex;
              gap: 0.25rem;
              background: ${e.border};
              border-radius: 8px;
              padding: 3px;
            }
            .view-toggle-btn {
              padding: 0.4rem 0.7rem;
              font-size: 0.8rem;
              font-weight: 600;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              background: transparent;
              color: ${e.textMuted};
              transition: all 0.15s;
            }
            .view-toggle-btn.active {
              background: ${e.cardBg};
              color: ${e.text};
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .view-toggle-btn:hover:not(.active) {
              color: ${e.text};
            }
            
            /* Settings Link Button */
            .settings-link-btn {
              width: 100%;
              display: flex;
              align-items: center;
              gap: 0.6rem;
              padding: 0.6rem 0.5rem;
              background: transparent;
              border: none;
              font-size: 0.95rem;
              font-weight: 600;
              color: ${e.text};
              cursor: pointer;
              border-radius: 8px;
              transition: background 0.15s;
            }
            .settings-link-btn:hover { background: ${e.cream}; }
            .settings-arrow { margin-left: auto; color: ${e.textMuted}; }
            
            /* Settings Signup Box */
            .settings-signup {
              padding-top: 0.5rem !important;
            }
            .signup-box {
              background: ${e.sage}15;
              border: 1.5px solid ${e.sage}40;
              border-radius: 10px;
              padding: 1rem;
              text-align: center;
            }
            .signup-header {
              font-size: 0.95rem;
              font-weight: 700;
              color: ${e.text};
              margin-bottom: 0.35rem;
            }
            .signup-text {
              font-size: 0.8rem;
              color: ${e.textMuted};
              margin-bottom: 0.75rem;
              line-height: 1.4;
            }
            .signup-form {
              display: flex;
              gap: 0.5rem;
              justify-content: center;
              flex-wrap: wrap;
            }
            .signup-input {
              flex: 1;
              min-width: 160px;
              padding: 0.5rem 0.75rem;
              border-radius: 6px;
              border: 1.5px solid ${e.sage}40;
              background: ${e.cardBg};
              color: ${e.text};
              font-size: 0.85rem;
              font-family: inherit;
            }
            .signup-btn {
              display: inline-block;
              background: ${e.sage};
              color: white;
              padding: 0.5rem 1.2rem;
              border-radius: 6px;
              border: none;
              font-size: 0.85rem;
              font-weight: 700;
              font-family: inherit;
              text-decoration: none;
              cursor: pointer;
              transition: transform 0.15s, opacity 0.15s;
            }
            .signup-btn:hover { transform: scale(1.03); opacity: 0.9; }
            
            /* Settings Footer */
            .settings-footer {
              padding-top: 1rem;
              margin-top: 0.5rem;
              border-top: 1px solid ${e.border};
              text-align: center;
            }
            .settings-updated {
              font-size: 0.75rem;
              color: ${e.textMuted};
            }
            
            /* ============================================
               SMALLER HEIGHT SCREENS (e.g. 1080p at 125% scale)
               ============================================ */
            @media (max-height: 800px) and (min-width: 769px) {
              .header { padding: 0.4rem 0.8rem; }
              .header h1 { font-size: 1.2rem; }
              .controls { padding: 0.4rem 0.6rem; }
              .color-key { padding: 0.3rem 0.6rem; }
              .key-text { font-size: 0.75rem; }
              .cal-grid { gap: 3px; padding: 0.35rem; }
              .day-hdr { padding: 0.25rem 0; font-size: 0.7rem; }
              .cal-day { padding: 0.25rem; }
              .date-num { font-size: 0.8rem; margin-bottom: 0.15rem; }
              .desktop-event { padding: 0.15rem 0.25rem; margin-bottom: 2px; }
              .chip-shape { width: 10px; height: 10px; }
              .chip-title { font-size: 0.65rem; }
              .detail { width: 300px; }
              .detail-inner { padding: 0.75rem; }
              .detail-hdr { font-size: 1rem; margin-bottom: 0.5rem; padding-bottom: 0.35rem; }
              .event-card { padding: 0.7rem; margin-bottom: 0.5rem; }
              .event-icon { font-size: 1.3rem; }
              .event-title { font-size: 0.85rem; }
              .event-meta { font-size: 0.8rem; }
              .event-cta { font-size: 0.75rem; margin-top: 0.35rem; }
              .desktop-footer { padding: 0.35rem 0.8rem; }
              .footer-left .footer-text { font-size: 0.75rem; }
              .footer-left a { font-size: 0.7rem; padding: 0.2rem 0.4rem; }
              .footer-right .kofi-text { font-size: 0.7rem; }
              .footer-right .kofi-btn { font-size: 0.65rem; padding: 0.25rem 0.5rem; }
            }
            
            /* Extra tight height (very scaled displays) */
            @media (max-height: 700px) and (min-width: 769px) {
              .header { padding: 0.3rem 0.6rem; }
              .header h1 { font-size: 1.1rem; }
              .controls { padding: 0.35rem 0.5rem; }
              .search-input { padding: 0.35rem 0.5rem 0.35rem 1.8rem; font-size: 0.8rem; }
              .filter-select { padding: 0.35rem 1.5rem 0.35rem 0.5rem; font-size: 0.8rem; }
              .color-key { padding: 0.25rem 0.5rem; gap: 0.6rem; }
              .key-label { font-size: 0.65rem; }
              .key-text { font-size: 0.7rem; }
              .cal-grid { gap: 2px; padding: 0.25rem; }
              .day-hdr { padding: 0.2rem 0; font-size: 0.65rem; }
              .cal-day { padding: 0.2rem; border-radius: 4px; }
              .date-num { font-size: 0.75rem; margin-bottom: 0.1rem; }
              .desktop-event { padding: 0.1rem 0.2rem; margin-bottom: 1px; border-radius: 3px; }
              .chip-shape { width: 8px; height: 8px; }
              .chip-title { font-size: 0.6rem; }
              .more { font-size: 0.55rem; }
              .detail { width: 280px; }
              .detail-inner { padding: 0.6rem; }
              .detail-hdr { font-size: 0.95rem; margin-bottom: 0.4rem; padding-bottom: 0.3rem; }
              .event-card { padding: 0.6rem; margin-bottom: 0.4rem; border-radius: 8px; }
              .event-icon { font-size: 1.2rem; }
              .event-title { font-size: 0.8rem; }
              .event-meta { font-size: 0.75rem; }
              .event-cta { font-size: 0.7rem; margin-top: 0.3rem; }
              .no-select { font-size: 0.85rem; padding: 0.75rem; }
            }
            
            /* ============================================
               MOBILE STYLES
               ============================================ */
            @media (max-width: 768px) {
              /* Beta ribbon - smaller on mobile */
              .beta-ribbon {
                width: 70px;
                height: 70px;
              }
              .beta-ribbon span {
                width: 100px;
                padding: 3px 0;
                font-size: 0.5rem;
                left: -28px;
                top: 18px;
              }
              
              /* Hide inline beta badge on mobile */
              .beta { display: none; }
              
              /* Vertical stack layout */
              .main { flex-direction: column; }
              
              /* Calendar - height based on weeks needed */
              .calendar {
                flex: none;
                height: 48vh;
                min-height: 240px;
              }
              
              /* 6-week months need more height */
              .calendar.six-weeks {
                height: 55vh;
                min-height: 290px;
              }
              
              /* Bottom panel - when NO selection, auto height (compact) */
              .detail.no-selection {
                flex: none;
                height: auto;
                overflow: visible;
              }
              
              /* Bottom panel - when HAS selection, fill remaining and scroll */
              .detail.has-selection {
                flex: 1;
                min-height: 0;
                overflow-y: auto;
              }
              
              .detail {
                width: 100%;
                border-left: none;
                border-top: 3px solid ${e.border};
              }
              
              /* Compact no-select message */
              .no-select {
                padding: 0.4rem;
                font-size: 0.75rem;
              }
              
              /* Mobile footer styling */
              .mobile-footer .kofi-bar {
                padding: 0.4rem 0.6rem;
                gap: 0.4rem;
                flex-wrap: wrap;
              }
              .mobile-footer .kofi-text { font-size: 0.7rem; }
              .mobile-footer .kofi-btn { font-size: 0.65rem; padding: 0.3rem 0.55rem; }
              .mobile-footer .footer { font-size: 0.8rem; padding: 0.6rem 0.5rem; }
              .mobile-footer .footer a { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
              
              /* Hide desktop footer on mobile */
              .desktop-footer { display: none; }
              
              /* List view mobile styles */
              .list-view {
                padding: 0;
              }
              .list-container {
                padding: 0;
              }
              .list-date-header {
                padding: 0.6rem 0.9rem;
                flex-direction: column;
                align-items: flex-start;
                gap: 0.15rem;
              }
              .list-date-day {
                font-size: 0.9rem;
              }
              .list-date-full {
                font-size: 0.75rem;
              }
              .list-event-card {
                padding: 0.75rem 0.9rem;
                gap: 0.75rem;
              }
              .list-event-time {
                font-size: 0.75rem;
                min-width: 85px;
              }
              .list-event-indicator {
                width: 8px;
                height: 8px;
              }
              .list-event-title {
                font-size: 0.85rem;
              }
              .list-event-venue {
                font-size: 0.7rem;
              }
              .list-event-type {
                font-size: 1.1rem;
              }
              .list-footer .kofi-bar {
                padding: 0.4rem 0.6rem;
                gap: 0.4rem;
                flex-wrap: wrap;
              }
              .list-footer .kofi-text { font-size: 0.7rem; }
              .list-footer .kofi-btn { font-size: 0.65rem; padding: 0.3rem 0.55rem; }
              .list-footer .footer { font-size: 0.8rem; padding: 0.6rem 0.5rem; }
              .list-footer .footer a { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
              
              /* Header adjustments */
              .header {
                padding: 0.5rem 0.6rem;
                padding-left: 2.5rem;
                gap: 0.4rem;
              }
              .header h1 {
                font-size: 1rem;
                white-space: normal;
                line-height: 1.15;
              }
              .header-left { gap: 0.35rem; }
              .month-full { display: none; }
              .month-short { display: inline; }
              .month-label { min-width: 75px; font-size: 0.75rem; }
              .nav-btn { width: 28px; height: 28px; font-size: 0.9rem; }
              .today-btn { font-size: 0.55rem; padding: 0.3rem 0.45rem; }
              .settings-btn { padding: 0.3rem 0.45rem; font-size: 0.65rem; }
              .settings-btn span { display: none; }
              
              .header-right { gap: 0.5rem; }
              .hub-link { display: none; }
              .hub-link-text-desktop { display: none; }
              .hub-link-text-mobile { display: inline; }
              
              /* Controls */
              .controls { padding: 0.45rem 0.5rem; }
              .controls-inner { gap: 0.4rem; flex-wrap: nowrap; }
              .search-box { width: auto; flex: 1; min-width: 70px; }
              .search-input { padding: 0.35rem 0.45rem 0.35rem 1.6rem; font-size: 0.75rem; }
              .search-icon { font-size: 0.7rem; left: 0.55rem; }
              .filter-select { font-size: 0.75rem; padding: 0.35rem 1.4rem 0.35rem 0.45rem; flex: 1; }
              
              /* Color key - mobile */
              .color-key {
                padding: 0.3rem 0.5rem;
                gap: 0.5rem;
                flex-wrap: wrap;
              }
              .key-label { font-size: 0.65rem; }
              .key-shape { width: 10px; height: 10px; }
              .shape-diamond-wrap { width: 10px; height: 10px; }
              .shape-diamond { width: 8px; height: 8px; }
              .shape-triangle-wrap { width: 10px; height: 10px; }
              .shape-triangle,
              .shape-triangle:before,
              .shape-triangle:after { width: 6px; height: 6px; }
              .key-text { font-size: 0.7rem; }
              
              /* Calendar grid */
              .cal-grid { 
                padding: 0.35rem; 
                gap: 3px;
                grid-template-rows: auto repeat(${O}, minmax(48px, 1fr));
              }
              .day-hdr { font-size: 0.7rem; padding: 0.3rem 0; }
              .cal-day { padding: 0.25rem; border-radius: 5px; min-height: 48px; }
              .date-num { font-size: 0.75rem; margin-bottom: 0.1rem; }
              
              /* 6-week months - allow calendar to scroll */
              .cal-grid.weeks-6 { 
                grid-template-rows: auto repeat(6, minmax(44px, 1fr));
              }
              .cal-grid.weeks-6 .cal-day { min-height: 44px; }
              .cal-grid.weeks-6 .mobile-time-zone { min-height: 11px; }
              
              /* Show mobile shapes, hide desktop events */
              .desktop-events { display: none; }
              .mobile-events { display: flex; }
              
              /* Two-zone layout adjustments for mobile */
              .mobile-time-zone { min-height: 14px; }
              
              /* Detail panel content */
              .detail-hdr { font-size: 1rem; margin-bottom: 0.5rem; padding-bottom: 0.4rem; }
              .detail-inner { padding: 0.75rem; }
              .event-card { padding: 0.75rem; margin-bottom: 0.5rem; }
              .event-icon { font-size: 1.3rem; }
              .event-title { font-size: 0.9rem; }
              .event-meta { font-size: 0.8rem; }
              .event-cta { font-size: 0.75rem; }
              .clash { font-size: 0.8rem; padding: 0.45rem 0.55rem; margin-bottom: 0.5rem; }
            }
            
            @media (max-width: 380px) {
              .header h1 { font-size: 0.9rem; }
              .filter-select { font-size: 0.7rem; padding: 0.3rem 1.3rem 0.3rem 0.4rem; }
              .mobile-shape-wrap { width: 10px; height: 10px; }
              .mobile-circle { width: 10px; height: 10px; }
              .mobile-square { width: 10px; height: 10px; border-radius: 2px; }
              .mobile-diamond { width: 8px; height: 8px; }
              .mobile-triangle-wrap { width: 10px; height: 10px; }
              .mobile-triangle,
              .mobile-triangle:before,
              .mobile-triangle:after { width: 6px; height: 6px; }
              .mobile-triangle-num { font-size: 0.4rem; }
              .shape-count { font-size: 0.4rem; }
              .color-key { gap: 0.4rem; }
              .key-item { gap: 0.25rem; }
              .key-shape { width: 8px; height: 8px; }
              .shape-diamond-wrap { width: 8px; height: 8px; }
              .shape-diamond { width: 6px; height: 6px; }
              .shape-triangle-wrap { width: 8px; height: 8px; }
              .shape-triangle,
              .shape-triangle:before,
              .shape-triangle:after { width: 5px; height: 5px; }
              .key-text { font-size: 0.6rem; }
            }
            
            /* Desktop: show desktop footer, hide mobile footer, hide ribbon */
            @media (min-width: 769px) {
              .mobile-footer { display: none; }
              .beta-ribbon { display: none; }
            }
          `),React.createElement("header",{className:"header"},React.createElement("div",{className:"header-left"},React.createElement("h1",null,"Bristol Improv Calendar")),C==="calendar"?React.createElement("div",{className:"header-center"},React.createElement("button",{className:"nav-btn",onClick:pe,disabled:!se},"\u2190"),React.createElement("span",{className:"month-label"},React.createElement("span",{className:"month-full"},Ae[m]," ",c),React.createElement("span",{className:"month-short"},me[m]," ",c)),React.createElement("button",{className:"nav-btn",onClick:ge,disabled:!le},"\u2192"),React.createElement("button",{className:"today-btn",onClick:Le,disabled:Ie},"Today")):React.createElement("div",{className:"header-center"},React.createElement("span",{className:"month-label",style:{minWidth:"auto"}},React.createElement("span",{className:"month-full"},"Upcoming Events"),React.createElement("span",{className:"month-short"},"Upcoming"))),React.createElement("div",{className:"header-right"},React.createElement("a",{href:"https://www.technicallyimprov.com/",target:"_blank",rel:"noopener noreferrer",className:"hub-link"},React.createElement("span",{className:"hub-link-text-desktop"},"Technically Improv"),React.createElement("span",{className:"hub-link-text-mobile"},"Hub"),React.createElement("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},React.createElement("path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"}),React.createElement("polyline",{points:"15 3 21 3 21 9"}),React.createElement("line",{x1:"10",y1:"14",x2:"21",y2:"3"}))),React.createElement("button",{className:"settings-btn",onClick:()=>te(!0)},"\u2699\uFE0F ",React.createElement("span",null,"Settings")))),Ne?React.createElement("div",{className:"loading"},React.createElement("div",{className:"spinner"}),React.createElement("div",null,"Loading events...")):Q?React.createElement("div",{className:"loading"},React.createElement("div",{style:{fontSize:"2.5rem"}},"\u{1F3AD}"),React.createElement("div",{style:{fontWeight:700}},Q),React.createElement("div",{style:{fontSize:"0.85rem",color:e.textMuted,maxWidth:"320px",textAlign:"center",lineHeight:1.4}},"It's probably temporary \u2014 give it another go, or check back in a bit."),React.createElement("button",{onClick:oe,style:{marginTop:"0.5rem",padding:"0.55rem 1.2rem",background:e.terracotta,color:"white",border:"none",borderRadius:"8px",fontFamily:"inherit",fontSize:"0.9rem",fontWeight:700,cursor:"pointer"}},"Try again")):React.createElement(React.Fragment,null,React.createElement("div",{className:"controls",ref:J},React.createElement("div",{className:"controls-inner"},React.createElement("div",{className:"search-box"},React.createElement("span",{className:"search-icon"},"\u{1F50D}"),React.createElement("input",{type:"text",className:"search-input",placeholder:"Search...",value:M,onChange:t=>{F(t.target.value),T(!0)},onFocus:()=>T(!0)})),React.createElement("select",{className:`filter-select ${l!=="all"?"active":""}`,value:l,onChange:t=>z(t.target.value)},React.createElement("option",{value:"all"},"All Events"),React.createElement("option",{value:"show",disabled:!H.has("show")},"\u25CF Shows"),React.createElement("option",{value:"workshop",disabled:!H.has("workshop")},"\u25A0 Workshops"),React.createElement("option",{value:"jam",disabled:!H.has("jam")},"\u25C6 Jams"),React.createElement("option",{value:"dropin",disabled:!H.has("dropin")},"\u25B2 Drop-ins"),React.createElement("option",{disabled:!0},"\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"),React.createElement("option",{value:"daytime",disabled:!Pe},"\u2600\uFE0F Daytime"),React.createElement("option",{value:"evening",disabled:!_e},"\u{1F319} Evening")),React.createElement("select",{className:`filter-select ${p!=="all"?"active":""}`,value:p,onChange:t=>s(t.target.value)},React.createElement("option",{value:"all"},"All Venues"),Ce.map(({key:t,label:a})=>React.createElement("option",{key:t,value:t,disabled:!Ve.has(t)},a))),B&&he.length>0&&React.createElement("div",{className:"search-results"},he.map((t,a)=>React.createElement("div",{key:a,className:"search-item",onClick:()=>Ye(t)},React.createElement("div",{className:"search-title"},t.title),React.createElement("div",{className:"search-meta"},We(t.date)," \u2022 ",t.venue)))))),C==="calendar"&&React.createElement(Ue,null),C==="calendar"?React.createElement("div",{className:"main"},React.createElement("div",{className:`calendar ${O>=6?"six-weeks":""}`,ref:Me,onTouchStart:je,onTouchEnd:He},React.createElement("div",{className:`cal-grid weeks-${O}`},Re.map(t=>React.createElement("div",{key:t,className:"day-hdr"},t)),Ge())),React.createElement("div",{className:`detail ${u?"has-selection":"no-selection"}`},u?React.createElement(React.Fragment,null,React.createElement("div",{className:"detail-inner"},React.createElement("h3",{className:"detail-hdr"},Je(u)," ",u," ",me[m]),Y.length>1&&Fe(Y)&&React.createElement("div",{className:"clash"},"\u{1F3AD} ",Y.length," events \u2014 choose your favourite!"),Y.map((t,a)=>{const r=Oe(t.venue),o=x(t.type),n=E[o]||E.show;return React.createElement("a",{key:a,href:t.url,target:"_blank",rel:"noopener noreferrer",className:"event-card",style:{borderColor:n.color},"data-goatcounter-click":"ticket-link"},React.createElement("div",{className:"event-row"},React.createElement("span",{className:"event-icon"},n.icon),React.createElement("div",{className:"event-info"},React.createElement("div",{className:"event-title"},t.title),React.createElement("div",{className:"event-meta"},React.createElement("span",null,"\u{1F4CD} ",t.venue),React.createElement("span",null,"\u{1F556} ",t.time)),React.createElement("div",{className:"event-cta"},"View details / Book tickets \u2192"))))})),React.createElement("div",{className:"mobile-footer"},React.createElement("div",{className:"kofi-bar"},React.createElement("span",{className:"kofi-text"},"\u2615 Find this useful? Buy Ste a brew! (...or a pint...)"),React.createElement("a",{href:KOFI_URL,target:"_blank",rel:"noopener noreferrer",className:"kofi-btn"},"\u2764\uFE0F Support on Ko-fi")),React.createElement("div",{className:"footer"},React.createElement("span",{className:"footer-text"},"Missing a show? Got corrections?")," ",React.createElement("a",{href:FEEDBACK_FORM_URL,target:"_blank",rel:"noopener noreferrer"},"Let us know")))):React.createElement(React.Fragment,null,React.createElement("div",{className:"no-select"},"\u{1F448} Click a date to see event details"),React.createElement("div",{className:"mobile-footer"},React.createElement("div",{className:"kofi-bar"},React.createElement("span",{className:"kofi-text"},"\u2615 Find this useful? Buy Ste a brew! (...or a pint...)"),React.createElement("a",{href:KOFI_URL,target:"_blank",rel:"noopener noreferrer",className:"kofi-btn"},"\u2764\uFE0F Support on Ko-fi")),React.createElement("div",{className:"footer"},React.createElement("span",{className:"footer-text"},"Missing a show? Got corrections?")," ",React.createElement("a",{href:FEEDBACK_FORM_URL,target:"_blank",rel:"noopener noreferrer"},"Let us know")))))):React.createElement(Xe,null)),C==="calendar"&&React.createElement("div",{className:"desktop-footer"},React.createElement("div",{className:"footer-row"},React.createElement("div",{className:"footer-left"},React.createElement("span",{className:"footer-text"},"Missing a show? Got corrections?"),React.createElement("a",{href:FEEDBACK_FORM_URL,target:"_blank",rel:"noopener noreferrer"},"Let us know"),W&&React.createElement("span",{className:"footer-updated"},"\u2022 Updated ",be(W))),React.createElement("div",{className:"footer-right"},React.createElement("span",{className:"kofi-text"},"\u2615 Buy Ste a brew!"),React.createElement("a",{href:KOFI_URL,target:"_blank",rel:"noopener noreferrer",className:"kofi-btn"},"\u2764\uFE0F Ko-fi")))),React.createElement(RoadmapModal,{isOpen:$e,onClose:()=>ee(!1),colors:e}),React.createElement(SettingsModal,{isOpen:ze,onClose:()=>te(!1),colors:e,darkMode:b,setDarkMode:Ee,viewMode:C,setViewMode:De,onOpenRoadmap:()=>ee(!0),lastUpdated:W,formatLastUpdated:be}))};ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(BristolImprovCalendar,null));

const{useState,useEffect,useMemo,useRef}=React,EVENTS_JSON_URL="./events.json",USE_SAMPLE_DATA=!1,MIN_YEAR=2026,MIN_MONTH=0,KOFI_URL="https://ko-fi.com/kaluuja",FEEDBACK_FORM_URL="https://forms.gle/62psP8V9JF88Kdnz8",SAMPLE_EVENTS=[{date:"2026-01-25",title:"The BLANK who BLANKED me",venue:"Bristol Improv Theatre",time:"19:00-20:00",type:"show",url:"#"},{date:"2026-01-28",title:"Lily Maryon",venue:"Bristol Improv Theatre",time:"19:30-21:30",type:"show",url:"#"},{date:"2026-01-28",title:"Biscuit Barrel",venue:"Bristol Improv Theatre",time:"14:00-15:00",type:"show",url:"#"},{date:"2026-01-28",title:"Luke McQueen",venue:"Bristol Improv Theatre",time:"21:00-22:00",type:"show",url:"#"},{date:"2026-01-28",title:"Open Jam Night",venue:"Hen & Chicken",time:"19:30-21:30",type:"jam",url:"#"},{date:"2026-01-30",title:"Belltower",venue:"Bristol Improv Theatre",time:"19:30-21:30",type:"show",url:"#"},{date:"2026-01-31",title:"Antics Joke Show",venue:"Bristol Improv Theatre",time:"19:30-21:30",type:"show",url:"#"},{date:"2026-02-05",title:"Live in da Hive",venue:"PRSC",time:"19:00-22:30",type:"show",url:"#"},{date:"2026-02-06",title:"The Bish Bosh Bash",venue:"Bristol Improv Theatre",time:"19:30-21:30",type:"show",url:"#"},{date:"2026-02-11",title:"Wednesday Night Improv",venue:"Hen & Chicken",time:"19:30-21:30",type:"show",url:"#"},{date:"2026-02-14",title:"From HELL YEAH! with love",venue:"Bristol Improv Theatre",time:"19:30-21:30",type:"show",url:"#"},{date:"2026-02-25",title:"Tales From The Wasteland",venue:"Hen & Chicken",time:"19:30-22:00",type:"show",url:"#"}],useEscapeToClose=(x,u)=>{useEffect(()=>{if(!x)return;const i=d=>{d.key==="Escape"&&u()};return document.addEventListener("keydown",i),()=>document.removeEventListener("keydown",i)},[x,u])},FOCUSABLE='a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])',useDialogFocus=(x,u)=>{useEffect(()=>{const i=u.current;if(!x||!i)return;const d=document.activeElement,r=()=>[...i.querySelectorAll(FOCUSABLE)].filter(p=>p.getClientRects().length);(r()[0]||i).focus();const f=p=>{if(p.key!=="Tab")return;const B=r();if(!B.length){p.preventDefault();return}const M=B[0],L=B[B.length-1];p.shiftKey&&(document.activeElement===M||document.activeElement===i)?(p.preventDefault(),L.focus()):!p.shiftKey&&document.activeElement===L&&(p.preventDefault(),M.focus())};return i.addEventListener("keydown",f),()=>{i.removeEventListener("keydown",f),d&&d.focus&&document.contains(d)&&d.focus()}},[x])},RoadmapModal=({isOpen:x,onClose:u,colors:i})=>{useEscapeToClose(x,u);const d=useRef(null);if(useDialogFocus(x,d),!x)return null;const r=({done:f,children:p})=>React.createElement("li",{style:{marginBottom:"0.6rem",display:"flex",alignItems:"flex-start",gap:"0.6rem"}},React.createElement("span",{style:{flexShrink:0,width:"22px",height:"22px",borderRadius:"5px",background:f?i.sage:"transparent",border:f?"none":`2px solid ${i.textMuted}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",color:"white",marginTop:"1px"}},f&&"\u2713"),React.createElement("span",{style:{textDecoration:f?"line-through":"none",color:f?i.textMuted:i.text,fontSize:"0.9rem",lineHeight:1.4}},p));return React.createElement("div",{className:"modal-overlay",onClick:u},React.createElement("div",{className:"modal-content",ref:d,tabIndex:-1,role:"dialog","aria-modal":"true","aria-labelledby":"roadmap-title",onClick:f=>f.stopPropagation()},React.createElement("div",{className:"modal-header"},React.createElement("h2",{id:"roadmap-title"},"\u{1F5FA}\uFE0F Roadmap"),React.createElement("button",{className:"modal-close",onClick:u,"aria-label":"Close"},"\u2715")),React.createElement("div",{className:"modal-body"},React.createElement("p",{className:"roadmap-intro"},"This calendar is a work in progress! Here's what's been done and what's coming next."),React.createElement("div",{className:"roadmap-section"},React.createElement("h3",null,"\u26A1 Core Functionality"),React.createElement("ul",null,React.createElement(r,{done:!0},"Add filters and search"),React.createElement(r,{done:!0},"'Swipe' between months on mobile"),React.createElement(r,{done:!0},"Shows, workshops, drop-ins, jams added"),React.createElement(r,{done:!0},"Calendar feed you can subscribe to"),React.createElement(r,{done:!0},"Add to calendar and share for each event"),React.createElement(r,{done:!1},"Email newsletter for weekly updates"))),React.createElement("div",{className:"roadmap-section"},React.createElement("h3",null,"\u{1F3AD} Events"),React.createElement("ul",null,React.createElement(r,{done:!0},"Added 15 venues"),React.createElement(r,{done:!0},"Added additional ticket websites"))),React.createElement("div",{className:"roadmap-section"},React.createElement("h3",null,"\u{1F3A8} Design & Experience"),React.createElement("ul",null,React.createElement(r,{done:!0},"Event type colour-coding"),React.createElement(r,{done:!0},"Event type icons for colour-blind"),React.createElement(r,{done:!0},"Dark mode"),React.createElement(r,{done:!0},"List view option"),React.createElement(r,{done:!1},"Save favourite events"))),React.createElement("div",{className:"roadmap-section"},React.createElement("h3",null,"\u{1F52E} Future Ideas"),React.createElement("ul",null,React.createElement(r,{done:!1},"Improv type tags? (shortform, longform, musical, narrative, etc.)"),React.createElement(r,{done:!1},"Performer and group profiles/socials"),React.createElement(r,{done:!1},"User accounts and personalisation"),React.createElement(r,{done:!1},"Event reminders/New events added"))))))},SettingsModal=({isOpen:x,onClose:u,colors:i,darkMode:d,setDarkMode:r,viewMode:f,setViewMode:p,onOpenRoadmap:B,lastUpdated:M,formatLastUpdated:L})=>{useEscapeToClose(x,u);const h=useRef(null);return useDialogFocus(x,h),x?React.createElement("div",{className:"modal-overlay",onClick:u},React.createElement("div",{className:"modal-content settings-modal",ref:h,tabIndex:-1,role:"dialog","aria-modal":"true","aria-labelledby":"settings-title",onClick:_=>_.stopPropagation()},React.createElement("div",{className:"modal-header"},React.createElement("h2",{id:"settings-title"},"\u2699\uFE0F Settings"),React.createElement("button",{className:"modal-close",onClick:u,"aria-label":"Close"},"\u2715")),React.createElement("div",{className:"modal-body"},React.createElement("div",{className:"settings-section"},React.createElement("div",{className:"settings-row"},React.createElement("div",{className:"settings-label"},React.createElement("span",{className:"settings-icon"},d?"\u{1F319}":"\u2600\uFE0F"),React.createElement("span",null,d?"Dark Mode":"Light Mode")),React.createElement("button",{className:`toggle-btn ${d?"active":""}`,onClick:()=>r(!d),"aria-label":"Toggle dark mode"},React.createElement("span",{className:"toggle-slider"})))),React.createElement("div",{className:"settings-section"},React.createElement("div",{className:"settings-row"},React.createElement("div",{className:"settings-label"},React.createElement("span",{className:"settings-icon"},"\u{1F4C5}"),React.createElement("span",null,"View")),React.createElement("div",{className:"view-toggle"},React.createElement("button",{className:`view-toggle-btn ${f==="calendar"?"active":""}`,onClick:()=>p("calendar"),"data-goatcounter-click":"view-toggle-calendar"},"\u{1F4C5} Calendar"),React.createElement("button",{className:`view-toggle-btn ${f==="list"?"active":""}`,onClick:()=>p("list"),"data-goatcounter-click":"view-toggle-list"},"\u{1F4CB} List")))),React.createElement("div",{className:"settings-section settings-signup"},React.createElement("div",{className:"signup-box"},React.createElement("div",{className:"signup-header"},"\u{1F4F0} Get the newsletter"),React.createElement("p",{className:"signup-text"},"What's on in Bristol improv, straight to your inbox. No spam, unsubscribe any time."),React.createElement("form",{action:"https://buttondown.com/api/emails/embed-subscribe/Kaluuja",method:"post",target:"popupwindow",onSubmit:()=>{window.open("https://buttondown.com/Kaluuja","popupwindow")},className:"signup-form"},React.createElement("input",{type:"email",name:"email",required:!0,placeholder:"you@example.com","aria-label":"Email address",className:"signup-input"}),React.createElement("button",{type:"submit",className:"signup-btn","data-goatcounter-click":"newsletter-signup"},"Subscribe")))),React.createElement("div",{className:"settings-section"},React.createElement("button",{className:"settings-link-btn",onClick:()=>{u(),B()}},React.createElement("span",{className:"settings-icon"},"\u{1F5FA}\uFE0F"),React.createElement("span",null,"View Roadmap"),React.createElement("span",{className:"settings-arrow"},"\u2192"))),React.createElement("div",{className:"settings-section"},React.createElement("a",{href:"https://tiltimprov.co.uk/",target:"_blank",rel:"noopener noreferrer",className:"settings-link-btn",style:{textDecoration:"none"},"data-goatcounter-click":"settings-tilt"},React.createElement("span",{className:"settings-icon"},"\u{1F7E0}"),React.createElement("span",null,"Tilt Improv"),React.createElement("span",{className:"settings-arrow"},"\u2192"))),React.createElement("div",{className:"settings-section"},React.createElement("a",{href:"https://www.technicallyimprov.com/",target:"_blank",rel:"noopener noreferrer",className:"settings-link-btn",style:{textDecoration:"none"}},React.createElement("span",{className:"settings-icon"},"\u{1F3AD}"),React.createElement("span",null,"Technically Improv"),React.createElement("span",{className:"settings-arrow"},"\u2192"))),React.createElement("div",{className:"settings-section"},React.createElement("a",{href:FEEDBACK_FORM_URL,target:"_blank",rel:"noopener noreferrer",className:"settings-link-btn",style:{textDecoration:"none"}},React.createElement("span",{className:"settings-icon"},"\u{1F4A1}"),React.createElement("span",null,"Submit an idea"),React.createElement("span",{className:"settings-arrow"},"\u2192"))),M&&React.createElement("div",{className:"settings-footer"},React.createElement("span",{className:"settings-updated"},"Listings last changed: ",L(M)))))):null},BristolImprovCalendar=()=>{const[x,u]=useState(null),[i,d]=useState("all"),[r,f]=useState("all"),[p,B]=useState(""),[M,L]=useState(!1),[h,_]=useState([]),[wt,le]=useState(!0),[Me,ze]=useState(null),[kt,Oe]=useState(!1),[Nt,Pe]=useState(!1),[T,Et]=useState(()=>{try{return localStorage.getItem("bristolImprovTheme")!=="light"}catch(e){return!0}}),[F,Ft]=useState(()=>{try{const e=localStorage.getItem("bristolImprovView");if(e==="list"||e==="calendar")return e}catch(e){}return typeof window!="undefined"&&window.matchMedia&&window.matchMedia("(max-width: 768px)").matches?"list":"calendar"}),je=e=>{Ft(e);try{localStorage.setItem("bristolImprovView",e)}catch(t){}},He="bristolImprovBitNoticeHidden-v2",[Ct,St]=useState(()=>{try{return localStorage.getItem(He)==="true"}catch(e){return!1}}),Tt=()=>{St(!0);try{localStorage.setItem(He,"true")}catch(e){}},[ce,Dt]=useState(null),[de,At]=useState(null),[b,pe]=useState(new Date().getFullYear()),[m,he]=useState(new Date().getMonth()),ue=useRef(null),Bt=useRef(null),q=useRef(null),Q=useRef(null);useEffect(()=>{try{localStorage.setItem("bristolImprovTheme",T?"dark":"light")}catch(e){}},[T]);const a=T?{cream:"#18234A",terracotta:"#F2542D",navy:"#F4F1EA",sage:"#1F9D74",sand:"#F2B705",bg:"#0E1734",cardBg:"#18234A",text:"#F4F1EA",textMuted:"#AEB6CC",border:"#2A3560"}:{cream:"#FAF8F3",terracotta:"#F2542D",navy:"#0E1734",sage:"#1F9D74",sand:"#F2B705",bg:"#FAF8F3",cardBg:"#FFFFFF",text:"#0E1734",textMuted:"#4A5470",border:"#E1E4EC"},Ue=e=>{if(!e)return"show";const t=e.toLowerCase().replace(/[-_\s]/g,"");return t==="dropin"||t==="dropins"?"dropin":t==="workshop"||t==="workshops"||t==="class"||t==="classes"?"workshop":t==="jam"||t==="jams"?"jam":"show"},Ye={show:{color:a.terracotta,label:"Shows",icon:"\u{1F3AD}",dot:"\u{1F534}"},workshop:{color:a.sage,label:"Workshops",icon:"\u{1F4DA}",dot:"\u{1F7E2}"},jam:{color:a.sand,label:"Jams",icon:"\u{1F3B2}",dot:"\u{1F7E1}"},dropin:{color:T?"#C9D0E3":"#0E1734",label:"Drop-ins",icon:"\u{1F6AA}",dot:"\u{1F7E3}"}},Lt={"Hen & Chicken":{color:a.sand,bg:`${a.sand}25`,group:"Hen & Chicken",order:2},"Hen & Chicken (Chicken Shed)":{color:a.sand,bg:`${a.sand}25`,group:"Hen & Chicken",order:2},"Hen & Chicken (Studio)":{color:a.sand,bg:`${a.sand}25`,group:"Hen & Chicken",order:2},PRSC:{color:a.sage,bg:`${a.sage}20`,group:"PRSC",order:3},"SPACE at PRSC":{color:a.sage,bg:`${a.sage}20`,group:"PRSC",order:3},"Wardrobe Theatre":{color:"#7B68A6",bg:"#7B68A618",group:"Wardrobe Theatre",order:4},"Bristol Old Vic":{color:"#4A6FA5",bg:"#4A6FA518",group:"Bristol Old Vic",order:5},"Tobacco Factory":{color:"#8B6F47",bg:"#8B6F4715",group:"Other",order:6},"Bristol Beacon":{color:"#C4A35A",bg:"#C4A35A15",group:"Other",order:6},"Mission Theatre (Bath)":{color:"#5E8B7E",bg:"#5E8B7E18",group:"Further afield",order:7}},me=[{key:"Hen & Chicken",label:"Hen & Chicken"},{key:"PRSC",label:"PRSC"},{key:"Wardrobe Theatre",label:"Wardrobe Theatre"},{key:"Bristol Old Vic",label:"Bristol Old Vic"},{key:"Other",label:"Other"},{key:"Further afield",label:"Further afield"}],Ve=async()=>{var e,t;if(USE_SAMPLE_DATA){setTimeout(()=>{_(SAMPLE_EVENTS),le(!1)},300);return}try{le(!0),ze(null);const n=await fetch(EVENTS_JSON_URL+`?t=${Date.now()}`);if(!n.ok)throw new Error(`Failed: ${n.status}`);const o=await n.json();let s=o.events||((e=o.record)==null?void 0:e.events)||o;_(Array.isArray(s)?s:[]),Dt(o.lastUpdated||((t=o.record)==null?void 0:t.lastUpdated)),At(/^\d{4}-\d{2}-\d{2}$/.test(o.lastChecked||"")?o.lastChecked:null)}catch(n){_([]),ze("Couldn't load the events just now.")}finally{le(!1)}};useEffect(()=>{Ve()},[]),useEffect(()=>{const e=t=>{ue.current&&!ue.current.contains(t.target)&&L(!1)};return document.addEventListener("mousedown",e),()=>document.removeEventListener("mousedown",e)},[]);const Ge=new Date,W=Ge.getFullYear(),O=Ge.getMonth(),ge=useMemo(()=>{if(h.length===0)return{year:W,month:O};let e=MIN_YEAR,t=MIN_MONTH;return h.forEach(n=>{const o=new Date(n.date);(o.getFullYear()>e||o.getFullYear()===e&&o.getMonth()>t)&&(e=o.getFullYear(),t=o.getMonth())}),{year:e,month:t}},[h]),_e=O===0?W-1:W,Rt=O===0?11:O-1,We=b>_e||b===_e&&m>Rt,Ke=b<ge.year||b===ge.year&&m<ge.month,It=b===W&&m===O,$t=new Date(b,m+1,0).getDate(),Je=["January","February","March","April","May","June","July","August","September","October","November","December"],Mt=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],zt=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],Ze=()=>{We&&(u(null),he(m===0?11:m-1),pe(m===0?b-1:b))},Xe=()=>{Ke&&(u(null),he(m===11?0:m+1),pe(m===11?b+1:b))},Ot=()=>{u(null),pe(W),he(O)},Pt=e=>{q.current=e.touches[0].clientX,Q.current=e.touches[0].clientY},jt=e=>{if(q.current===null||Q.current===null)return;const t=e.changedTouches[0].clientX,n=e.changedTouches[0].clientY,o=t-q.current,s=n-Q.current;Math.abs(o)>Math.abs(s)&&Math.abs(o)>50&&(o>0?Ze():Xe()),q.current=null,Q.current=null},qe=e=>{const t=Lt[e];return t?t.group:e.startsWith("Hen & Chicken")?"Hen & Chicken":e.includes("PRSC")?"PRSC":"Other"},Qe=useMemo(()=>{const e=new Set;return h.forEach(t=>e.add(qe(t.venue))),e},[h]),Ht=useMemo(()=>{const e=new Set;return h.forEach(t=>{const n=Ue(t.type);e.add(n)}),e},[h]),Ut=e=>{if(!e)return null;const t=new Date(e),n=Math.floor((new Date-t)/6e4);if(n<60)return`${n}m ago`;const o=Math.floor(n/60);return o<24?`${o}h ago`:t.toLocaleDateString("en-GB",{day:"numeric",month:"short"})},Yt=`
            /* LOADING */
            .loading {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 0.75rem;
              color: ${a.textMuted};
            }
            .spinner {
              width: 40px;
              height: 40px;
              border: 4px solid ${a.border};
              border-top-color: ${a.terracotta};
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
              background: ${a.cardBg};
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
              background: ${T?"#070D22":a.navy};
              color: ${T?"#F4F1EA":a.cream};
              padding: 1rem 1.25rem;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .modal-header h2 { font-size: 1.2rem; margin: 0; }
            .modal-close { background: none; border: none; color: ${T?"#F4F1EA":a.cream}; font-size: 1.2rem; cursor: pointer; opacity: 0.7; }
            .modal-close:hover { opacity: 1; }
            .modal-body { padding: 1.25rem; overflow-y: auto; flex: 1; }
            .roadmap-intro { font-size: 0.9rem; color: ${a.textMuted}; margin-bottom: 1.25rem; line-height: 1.5; }
            .roadmap-section { margin-bottom: 1.5rem; }
            .roadmap-section h3 { font-size: 1rem; font-weight: 700; margin-bottom: 0.6rem; padding-bottom: 0.4rem; border-bottom: 2px solid ${a.border}; color: ${a.text}; }
            .roadmap-section ul { list-style: none; }
            .roadmap-cta { background: ${a.cream}; border-radius: 10px; padding: 1rem; text-align: center; margin-top: 0.5rem; }
            .roadmap-cta p { font-size: 0.9rem; font-weight: 600; margin-bottom: 0.6rem; }
            .roadmap-cta .cta-note { font-size: 0.75rem; color: ${a.textMuted}; margin-top: 0.5rem; margin-bottom: 0; }
            .cta-button { display: inline-block; background: ${a.terracotta}; color: white; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 700; text-decoration: none; }
            .cta-button:hover { transform: scale(1.03); }
            
            /* Settings Modal */
            .settings-modal { max-width: 380px; }
            .settings-section {
              padding: 0.75rem 0;
              border-bottom: 1px solid ${a.border};
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
              color: ${a.text};
            }
            .settings-icon { font-size: 1.1rem; }
            
            /* Toggle Button */
            .toggle-btn {
              width: 52px;
              height: 28px;
              background: ${T?"#2A3560":a.navy+"30"};
              border: none;
              border-radius: 14px;
              cursor: pointer;
              position: relative;
              transition: background 0.2s;
            }
            .toggle-btn.active { background: ${a.sage}; }
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
              background: ${a.border};
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
              color: ${a.textMuted};
              transition: all 0.15s;
            }
            .view-toggle-btn.active {
              background: ${a.cardBg};
              color: ${a.text};
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .view-toggle-btn:hover:not(.active) {
              color: ${a.text};
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
              color: ${a.text};
              cursor: pointer;
              border-radius: 8px;
              transition: background 0.15s;
            }
            .settings-link-btn:hover { background: ${a.cream}; }
            .settings-arrow { margin-left: auto; color: ${a.textMuted}; }
            
            /* Settings Signup Box */
            .settings-signup {
              padding-top: 0.5rem !important;
            }
            .signup-box {
              background: ${a.sage}15;
              border: 1.5px solid ${a.sage}40;
              border-radius: 10px;
              padding: 1rem;
              text-align: center;
            }
            .signup-header {
              font-size: 0.95rem;
              font-weight: 700;
              color: ${a.text};
              margin-bottom: 0.35rem;
            }
            .signup-text {
              font-size: 0.8rem;
              color: ${a.textMuted};
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
              border: 1.5px solid ${a.sage}40;
              background: ${a.cardBg};
              color: ${a.text};
              font-size: 0.85rem;
              font-family: inherit;
            }
            .signup-btn {
              display: inline-block;
              background: ${a.sage};
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
              border-top: 1px solid ${a.border};
              text-align: center;
            }
            .settings-updated {
              font-size: 0.75rem;
              color: ${a.textMuted};
            }
            
      `,[xe,fe]=useState(null),[I,ee]=useState(null),[be,P]=useState(!1),[ve,j]=useState(!1),[g,te]=useState("any"),[l,ne]=useState([]),[ye,et]=useState(!1),[we,H]=useState(""),[D,Vt]=useState(()=>typeof window!="undefined"&&window.matchMedia&&window.matchMedia("(max-width: 768px)").matches);useEffect(()=>{if(!window.matchMedia)return;const e=window.matchMedia("(max-width: 768px)"),t=()=>Vt(e.matches);return e.addEventListener?e.addEventListener("change",t):e.addListener(t),()=>{e.removeEventListener?e.removeEventListener("change",t):e.removeListener(t)}},[]),useEffect(()=>{ee(null)},[b,m]);const ke=e=>String(e).padStart(2,"0"),v=e=>`${e.getFullYear()}-${ke(e.getMonth()+1)}-${ke(e.getDate())}`,U=e=>{const[t,n,o]=e.split("-").map(Number);return new Date(t,n-1,o)},w=(e,t)=>{const n=new Date(e);return n.setDate(n.getDate()+t),n},k=v(new Date),Gt=v(w(new Date,1)),$=e=>(e||"").split(/[\u2013\u2014-]/)[0].trim(),_t=e=>(e||"").replace(/\s*[\u2013\u2014-]\s*/," to "),N=e=>(e||"").replace(/\s+[\u2013\u2014]\s+/g,": ").replace(/[\u2013\u2014]/g,"-"),Y=e=>Ue(e.type),Wt=e=>(e||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60),K=e=>`${e.date}-${Wt(e.title)}`,J=["show","workshop","jam","dropin"],Ne={show:"Show",workshop:"Class",jam:"Jam",dropin:"Drop-in"},Ee={show:"Shows",workshop:"Classes",jam:"Jams",dropin:"Drop-ins"},Fe=[["any","Any day"],["today","Today"],["tomorrow","Tomorrow"],["weekend","This weekend"],["next2","Next 2 weeks"]],tt=(Fe.find(e=>e[0]===g)||Fe[0])[1],z=(e,t=10)=>React.createElement("span",{className:`shape shape-${e}`,style:{width:t,height:t,background:(Ye[e]||Ye.show).color},"aria-hidden":"true"}),ae=useMemo(()=>{const e=new Date;if(e.setHours(0,0,0,0),g==="today")return[v(e),v(e)];if(g==="tomorrow")return[v(w(e,1)),v(w(e,1))];if(g==="weekend"){const t=e.getDay(),n=t===0?w(e,-2):t===6?w(e,-1):w(e,5-t);return[v(n<e?e:n),v(w(n,2))]}return g==="next2"?[v(e),v(w(e,13))]:null},[g]),oe=useMemo(()=>h.filter(e=>!(i!=="all"&&qe(e.venue)!==i||l.length&&!l.includes(Y(e))||ae&&(e.date<ae[0]||e.date>ae[1]))).sort((e,t)=>(e.date+$(e.time)).localeCompare(t.date+$(t.time))),[h,i,l,ae]),V=useMemo(()=>oe.filter(e=>e.date>=k),[oe,k]),nt=useMemo(()=>{const e={};return oe.forEach(t=>{(e[t.date]=e[t.date]||[]).push(t)}),e},[oe]),at=g!=="any"||l.length>0||i!=="all",Ce=()=>{te("any"),ne([]),d("all")},Kt=e=>ne(l.includes(e)?l.filter(t=>t!==e):[...l,e]),Jt=l.length===0?"All types":l.length===1?Ee[l[0]]:`${l.length} types`,Zt=i==="all"?"All venues":(me.find(e=>e.key===i)||{}).label||i,G=e=>{if(e===k)return"Today";if(e===Gt)return"Tomorrow";const t=U(e),n=Math.round((t-U(k))/864e5);return n>1&&n<7?t.toLocaleDateString("en-GB",{weekday:"long"}):t.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})},ie=e=>U(e).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"}),re=e=>U(e).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"}),Xt=e=>U(e).toLocaleDateString("en-GB",{day:"numeric",month:"short"}),Se=(()=>{const e=de?U(de):ce?new Date(ce):null;if(!e)return"";const t=de?"Checked":"Updated";return v(e)===k?`${t} today`:v(w(e,1))===k?`${t} yesterday`:`${t} ${e.toLocaleDateString("en-GB",{day:"numeric",month:"short"})}`})(),Z=e=>{fe(e),et(!1),H(""),L(!1),B("");try{history.replaceState(null,"","#event="+K(e))}catch(t){}},Te=()=>{fe(null);try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}};useEscapeToClose(!!xe,Te),useEscapeToClose(be,()=>P(!1)),useEscapeToClose(ve,()=>j(!1));const ot=useRef(null),it=useRef(null),rt=useRef(null);useDialogFocus(!!xe,ot),useDialogFocus(be,it),useDialogFocus(ve,rt),useEffect(()=>{if(!h.length)return;const e=location.hash.match(/^#event=(.+)$/);if(!e)return;const t=h.find(n=>K(n)===decodeURIComponent(e[1]));t&&fe(t)},[h]);const st=e=>{const[t,n]=(e.time||"").split(/[\u2013\u2014-]/).map(y=>y&&y.trim()),o=e.date.replace(/-/g,""),s=y=>y&&/^\d{1,2}:\d{2}$/.test(y)?y.replace(":","").padStart(4,"0")+"00":null,c=s(t)||"190000";let R=s(n);return(!R||R<=c)&&(R=ke(Math.min(23,parseInt(c.slice(0,2),10)+2))+c.slice(2)),{start:`${o}T${c}`,end:`${o}T${R}`}},qt=e=>{const t=st(e);return"https://calendar.google.com/calendar/render?"+new URLSearchParams({action:"TEMPLATE",text:N(e.title),dates:`${t.start}/${t.end}`,ctz:"Europe/London",location:e.venue,details:e.url||""}).toString()},De=e=>String(e||"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n"),Qt=e=>{const t=st(e),n=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Bristol Improv Calendar//EN","CALSCALE:GREGORIAN","BEGIN:VTIMEZONE","TZID:Europe/London","BEGIN:DAYLIGHT","TZOFFSETFROM:+0000","TZOFFSETTO:+0100","TZNAME:BST","DTSTART:19700329T010000","RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU","END:DAYLIGHT","BEGIN:STANDARD","TZOFFSETFROM:+0100","TZOFFSETTO:+0000","TZNAME:GMT","DTSTART:19701025T020000","RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU","END:STANDARD","END:VTIMEZONE","BEGIN:VEVENT",`UID:${K(e)}@bristol-improv-calendar`,"DTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+/,""),`DTSTART;TZID=Europe/London:${t.start}`,`DTEND;TZID=Europe/London:${t.end}`,"SUMMARY:"+De(N(e.title)),"LOCATION:"+De(e.venue),...e.url?["URL:"+e.url,"DESCRIPTION:"+De("Tickets and details: "+e.url)]:[],"END:VEVENT","END:VCALENDAR"],o=new Blob([n.join(`\r
`)],{type:"text/calendar"}),s=document.createElement("a");s.href=URL.createObjectURL(o),s.download=K(e)+".ics",document.body.appendChild(s),s.click(),s.remove(),setTimeout(()=>URL.revokeObjectURL(s.href),5e3)},lt=typeof location!="undefined"?location.origin+location.pathname:"",Ae=lt.replace(/[^/]*$/,"")+"events.ics",ct=Ae.replace(/^https?:/,"webcal:"),en="https://calendar.google.com/calendar/render?cid="+encodeURIComponent(ct),dt=async(e,t)=>{try{await navigator.clipboard.writeText(e),H(t)}catch(n){H("fail")}},tn=async e=>{const t=lt+"#event="+K(e),n=`${N(e.title)}, ${re(e.date)}, ${$(e.time)} at ${e.venue}`;if(navigator.share){try{await navigator.share({title:N(e.title),text:n,url:t})}catch(o){}return}dt(t,"event")},pt=useMemo(()=>{const e=p.trim().toLowerCase();return e?h.filter(t=>t.date>=k&&(t.title.toLowerCase().includes(e)||t.venue.toLowerCase().includes(e)||(t.description||"").toLowerCase().includes(e))).sort((t,n)=>t.date.localeCompare(n.date)).slice(0,8):[]},[p,h,k]),E=(e,t=18)=>React.createElement("svg",{"aria-hidden":"true",width:t,height:t,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},e),ht=E(React.createElement(React.Fragment,null,React.createElement("rect",{x:"3",y:"4",width:"18",height:"17",rx:"2"}),React.createElement("line",{x1:"3",y1:"9",x2:"21",y2:"9"}),React.createElement("line",{x1:"8",y1:"2",x2:"8",y2:"6"}),React.createElement("line",{x1:"16",y1:"2",x2:"16",y2:"6"})),20),se=E(React.createElement(React.Fragment,null,React.createElement("rect",{x:"3",y:"4",width:"18",height:"17",rx:"2"}),React.createElement("line",{x1:"12",y1:"11",x2:"12",y2:"17"}),React.createElement("line",{x1:"9",y1:"14",x2:"15",y2:"14"}))),nn=E(React.createElement(React.Fragment,null,React.createElement("line",{x1:"8",y1:"6",x2:"21",y2:"6"}),React.createElement("line",{x1:"8",y1:"12",x2:"21",y2:"12"}),React.createElement("line",{x1:"8",y1:"18",x2:"21",y2:"18"}),React.createElement("circle",{cx:"4",cy:"6",r:"1"}),React.createElement("circle",{cx:"4",cy:"12",r:"1"}),React.createElement("circle",{cx:"4",cy:"18",r:"1"})),20),an=E(React.createElement(React.Fragment,null,React.createElement("line",{x1:"4",y1:"7",x2:"20",y2:"7"}),React.createElement("line",{x1:"4",y1:"12",x2:"20",y2:"12"}),React.createElement("line",{x1:"4",y1:"17",x2:"20",y2:"17"})),20),on=E(React.createElement(React.Fragment,null,React.createElement("circle",{cx:"11",cy:"11",r:"7"}),React.createElement("line",{x1:"21",y1:"21",x2:"16.5",y2:"16.5"})),16),Be=E(React.createElement("polyline",{points:"6 9 12 15 18 9"}),14),rn=E(React.createElement("polyline",{points:"15 6 9 12 15 18"})),ut=E(React.createElement("polyline",{points:"9 6 15 12 9 18"})),Le=E(React.createElement(React.Fragment,null,React.createElement("line",{x1:"6",y1:"6",x2:"18",y2:"18"}),React.createElement("line",{x1:"18",y1:"6",x2:"6",y2:"18"}))),sn=E(React.createElement(React.Fragment,null,React.createElement("path",{d:"M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"}),React.createElement("circle",{cx:"12",cy:"9.5",r:"2.5"})),20),ln=E(React.createElement(React.Fragment,null,React.createElement("circle",{cx:"18",cy:"5",r:"3"}),React.createElement("circle",{cx:"6",cy:"12",r:"3"}),React.createElement("circle",{cx:"18",cy:"19",r:"3"}),React.createElement("line",{x1:"8.6",y1:"13.5",x2:"15.4",y2:"17.5"}),React.createElement("line",{x1:"15.4",y1:"6.5",x2:"8.6",y2:"10.5"}))),cn=E(React.createElement(React.Fragment,null,React.createElement("path",{d:"M7 17L17 7"}),React.createElement("polyline",{points:"8 7 17 7 17 16"})),16),mt=React.createElement("div",{className:"search",ref:ue},React.createElement("label",{className:"search-field"},on,React.createElement("span",{className:"vh"},"Search shows, groups or venues"),React.createElement("input",{type:"search",placeholder:D?"Search shows, groups, venues":"Search",value:p,onChange:e=>{B(e.target.value),L(!0)},onFocus:()=>L(!0)})),M&&p.trim()&&React.createElement("div",{className:"search-results"},pt.length===0?React.createElement("div",{className:"search-none"},"Nothing coming up matches that."):pt.map((e,t)=>React.createElement("button",{key:t,className:"search-item",onClick:()=>Z(e)},React.createElement("span",{className:"search-title"},N(e.title)),React.createElement("span",{className:"search-meta"},ie(e.date),", ",$(e.time)," \xB7 ",e.venue))))),gt=React.createElement("div",{className:"monthnav"},React.createElement("button",{className:"ghost-btn",onClick:Ot,disabled:It},"Today"),React.createElement("button",{className:"icon-btn plain",onClick:Ze,disabled:!We,"aria-label":"Previous month"},rn),React.createElement("button",{className:"icon-btn plain",onClick:Xe,disabled:!Ke,"aria-label":"Next month"},ut),React.createElement("span",{className:"month-title"},Je[m]," ",b)),Re=!Ct&&React.createElement("div",{className:"bit-line"},React.createElement("span",null,"The Bristol Improv Theatre closed in October."," ",React.createElement("a",{href:"https://buttondown.com/Kaluuja",target:"_blank",rel:"noopener noreferrer","data-goatcounter-click":"bit-notice-roundup"},"Read the roundup")," \xB7 ",React.createElement("a",{href:"https://improvtheatre.co.uk/",target:"_blank",rel:"noopener noreferrer","data-goatcounter-click":"bit-notice-statement"},"BIT statement")),React.createElement("button",{className:"bit-x",onClick:Tt,"aria-label":"Dismiss notice"},Le)),xt=React.createElement("span",{className:"tilt-mark","aria-hidden":"true"},"tilt"),ft=React.createElement(React.Fragment,null,"Missing a show? Got a correction?"," ",React.createElement("a",{href:FEEDBACK_FORM_URL,target:"_blank",rel:"noopener noreferrer"},"Let us know")," \xB7 ",React.createElement("a",{href:KOFI_URL,target:"_blank",rel:"noopener noreferrer"},"Buy Ste a brew")," \xB7 ",React.createElement("a",{href:"https://tiltimprov.co.uk/",target:"_blank",rel:"noopener noreferrer"},"Tilt Improv")),bt=React.createElement("span",null,"Run by Ste Brown of ",React.createElement("a",{href:"https://tiltimprov.co.uk/bristol/",target:"_blank",rel:"noopener noreferrer"},"Tilt Improv"),", for all of Bristol improv."),dn=React.createElement("footer",{className:"site-foot"},React.createElement("div",{className:"foot-tilt"},xt,bt),React.createElement("div",null,ft)),pn=(e,t,n)=>{const o=Y(e);return React.createElement("button",{key:t,className:"row",onClick:()=>Z(e)},React.createElement("span",{className:"row-when"},n&&React.createElement("span",{className:"row-day"},G(e.date)==="Today"||G(e.date)==="Tomorrow"?G(e.date):ie(e.date).replace(/ \w+$/,"")),React.createElement("span",{className:"row-time"},$(e.time))),React.createElement("span",{className:"row-main"},React.createElement("span",{className:"row-title"},N(e.title)),React.createElement("span",{className:"row-meta"},z(o,9),Ne[o]," \xB7 ",e.venue)))},hn=(e,t)=>{const n=Y(e);return React.createElement("button",{key:t,className:"card",onClick:()=>Z(e)},React.createElement("span",{className:"card-when"},React.createElement("span",{className:"card-time"},$(e.time)),React.createElement("span",{className:"card-type"},z(n,10),Ne[n])),React.createElement("span",{className:"card-main"},React.createElement("span",{className:"card-title"},N(e.title)),React.createElement("span",{className:"card-venue"},e.venue)),React.createElement("span",{className:"chev"},ut))},un=React.createElement("button",{className:"btn-outline wide",onClick:()=>{H(""),j(!0)},"data-goatcounter-click":"subscribe-open"},se," Put all of this in your calendar"),mn=()=>{const e=[];return V.forEach(t=>{const n=e[e.length-1];n&&n.key===t.date?n.items.push(t):e.push({key:t.date,items:[t]})}),React.createElement("main",{className:"list"},e.length===0?React.createElement("div",{className:"empty"},React.createElement("p",null,"Nothing coming up matches those filters."),at&&React.createElement("button",{className:"btn-outline",onClick:Ce},"Clear filters")):React.createElement(React.Fragment,null,g==="any"&&e[0].key!==k&&React.createElement("p",{className:"list-note"},"Nothing on today. Next up ",G(e[0].key).toLowerCase()==="tomorrow"?"tomorrow":G(e[0].key),"."),e.map(t=>{const n=G(t.key),o=n==="Today"||n==="Tomorrow"||!/\d/.test(n);return React.createElement("section",{key:t.key,className:"day-group"},React.createElement("h2",null,n,o&&React.createElement("small",null,n==="Today"||n==="Tomorrow"?ie(t.key):Xt(t.key))),t.items.map(hn))})),un)},gn=()=>{let e,t,n=!0;if(I)e=re(I),t=nt[I]||[],n=!1;else if(g!=="any")e=tt,t=V.slice(0,30);else{const o=v(w(new Date,6));t=V.filter(s=>s.date<=o),e="Coming up this week",t.length<3&&(t=V.slice(0,8),e="Coming up")}return React.createElement("aside",{className:"side"},React.createElement("h2",null,e),I&&React.createElement("button",{className:"linkish",onClick:()=>ee(null)},"Back to what's coming up"),React.createElement("div",{className:"side-list"},t.length===0?React.createElement("p",{className:"side-empty"},I?"Nothing listed that day.":"Nothing listed yet."):t.map((o,s)=>pn(o,s,n))),!D&&React.createElement("div",{className:"side-foot"},React.createElement("button",{className:"btn-light block",onClick:()=>{H(""),j(!0)},"data-goatcounter-click":"subscribe-open"},se," Add to your calendar"),React.createElement("div",{className:"foot-tilt small"},xt,bt),React.createElement("div",null,ft)))},xn=()=>{const e=new Date(b,m,1),t=(e.getDay()+6)%7,n=w(e,-t),o=Math.ceil((t+$t)/7)*7,s=o/7,c=3,R=[];for(let y=0;y<o;y++){const X=w(n,y),A=v(X),C=nt[A]||[],yt=X.getMonth()!==m,kn=A===k,Nn=A<k,Ie=C.length>c?C.slice(0,c-1):C,En=J.filter(S=>C.some($e=>Y($e)===S));R.push(React.createElement("div",{key:A,className:`cell${yt?" other":""}${kn?" today":""}${Nn?" past":""}${I===A?" picked":""}`,onClick:()=>ee(I===A?null:A)},React.createElement("button",{className:"num","aria-label":`${re(A)}${C.length?`, ${C.length} listed`:""}`,onClick:S=>{S.stopPropagation(),ee(I===A?null:A)}},yt&&X.getDate()===1?`1 ${Mt[X.getMonth()]}`:X.getDate()),Ie.map((S,$e)=>React.createElement("button",{key:$e,className:"evchip",onClick:Fn=>{Fn.stopPropagation(),Z(S)}},z(Y(S),9),React.createElement("span",{className:"txt"},React.createElement("strong",null,$(S.time))," ",N(S.title)))),C.length>Ie.length&&React.createElement("span",{className:"more"},"+",C.length-Ie.length," more"),C.length>0&&React.createElement("span",{className:"cell-shapes","aria-hidden":"true"},En.map(S=>React.createElement("span",{key:S,className:"cell-shape"},z(S,9))),C.length>1&&React.createElement("span",{className:"cell-count"},C.length))))}return React.createElement("div",{className:"cal-main"},React.createElement("section",{className:"cal-wrap","aria-label":`${Je[m]} ${b}`},D&&React.createElement("div",{className:"phone-monthnav"},gt),React.createElement("div",{className:"dow-row"},zt.map(y=>React.createElement("div",{key:y,className:"dow"},y))),React.createElement("div",{className:"grid",style:{gridTemplateRows:`repeat(${s}, minmax(0, 1fr))`},ref:Bt,onTouchStart:Pt,onTouchEnd:jt},R)),gn())},fn=()=>{const e=xe;if(!e)return null;const t=Y(e),n=N(e.title).trim().toLowerCase(),o=h.filter(c=>c!==e&&c.date>=k&&N(c.title).trim().toLowerCase()===n).slice(0,3),s="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(e.venue+(/bath/i.test(e.venue)?"":", Bristol"));return React.createElement("div",{className:"sheet-overlay",onClick:Te},React.createElement("div",{className:"sheet",ref:ot,tabIndex:-1,role:"dialog","aria-modal":"true","aria-labelledby":"sheet-title",onClick:c=>c.stopPropagation()},React.createElement("div",{className:`sheet-hero${e.image?" has-img":""}`,style:e.image?{backgroundImage:`url("${e.image}")`}:void 0},React.createElement("span",{className:"sheet-handle","aria-hidden":"true"}),React.createElement("button",{className:"sheet-close","aria-label":"Close",onClick:Te},Le)),React.createElement("div",{className:"sheet-body"},React.createElement("span",{className:"type-pill"},z(t,11),Ne[t]),React.createElement("h2",{id:"sheet-title"},N(e.title)),React.createElement("ul",{className:"facts"},React.createElement("li",null,ht,React.createElement("span",null,React.createElement("strong",null,re(e.date)),e.time?`, ${_t(e.time)}`:"")),React.createElement("li",null,sn,React.createElement("span",null,e.venue," ",React.createElement("a",{href:s,target:"_blank",rel:"noopener noreferrer"},"Map")))),e.description&&React.createElement("p",{className:"sheet-desc"},N(e.description).slice(0,320),e.description.length>320?"\u2026":""),e.url&&React.createElement("a",{className:"btn-primary",href:e.url,target:"_blank",rel:"noopener noreferrer","data-goatcounter-click":"ticket-link"},"Tickets and details ",cn),React.createElement("div",{className:"sheet-actions"},React.createElement("button",{className:"btn-outline",onClick:()=>et(!ye),"aria-expanded":ye,"data-goatcounter-click":"event-add-to-calendar"},se," Add to calendar"),React.createElement("button",{className:"btn-outline",onClick:()=>tn(e),"data-goatcounter-click":"event-share"},ln," ",we==="event"?"Link copied":"Send to a friend")),ye&&React.createElement("div",{className:"cal-choices"},React.createElement("a",{className:"btn-outline",href:qt(e),target:"_blank",rel:"noopener noreferrer"},"Google Calendar"),React.createElement("button",{className:"btn-outline",onClick:()=>Qt(e)},"Apple, Outlook or other")),o.length>0&&React.createElement("div",{className:"also"},React.createElement("span",{className:"also-label"},"Also on"),o.map((c,R)=>React.createElement("button",{key:R,onClick:()=>Z(c)},ie(c.date),", ",$(c.time),", ",c.venue))))))},bn=()=>be?React.createElement("div",{className:"sheet-overlay",onClick:()=>P(!1)},React.createElement("div",{className:"sheet",ref:it,tabIndex:-1,role:"dialog","aria-modal":"true","aria-labelledby":"filter-title",onClick:e=>e.stopPropagation()},React.createElement("div",{className:"fsheet"},React.createElement("span",{className:"sheet-handle static","aria-hidden":"true"}),React.createElement("div",{className:"fsheet-top"},React.createElement("h2",{id:"filter-title"},"Filter"),React.createElement("button",{className:"linkish",onClick:Ce},"Clear all")),React.createElement("fieldset",null,React.createElement("legend",null,"When"),React.createElement("div",{className:"wrap-chips"},Fe.map(([e,t])=>React.createElement("button",{key:e,className:"chip","aria-pressed":g===e,onClick:()=>te(e)},t)))),React.createElement("fieldset",null,React.createElement("legend",null,"What"),React.createElement("div",{className:"type-grid"},J.map(e=>React.createElement("label",{key:e,className:"type-check"},React.createElement("input",{type:"checkbox",checked:l.length===0||l.includes(e),onChange:()=>{if(l.length===0)ne(J.filter(t=>t!==e));else{const t=l.includes(e)?l.filter(n=>n!==e):[...l,e];ne(t.length===J.length?[]:t)}}}),z(e,11),Ee[e])))),React.createElement("label",{className:"where"},"Where",React.createElement("select",{value:i,onChange:e=>d(e.target.value)},React.createElement("option",{value:"all"},"All venues"),me.map(({key:e,label:t})=>React.createElement("option",{key:e,value:e,disabled:!Qe.has(e)},t)))),React.createElement("button",{className:"btn-primary",onClick:()=>P(!1)},V.length===1?"Show 1 event":`Show ${V.length} events`)))):null,vn=()=>ve?React.createElement("div",{className:"sheet-overlay",onClick:()=>j(!1)},React.createElement("div",{className:"sheet",ref:rt,tabIndex:-1,role:"dialog","aria-modal":"true","aria-labelledby":"sub-title",onClick:e=>e.stopPropagation()},React.createElement("div",{className:"fsheet"},React.createElement("span",{className:"sheet-handle static","aria-hidden":"true"}),React.createElement("div",{className:"fsheet-top"},React.createElement("h2",{id:"sub-title"},"Add to your calendar"),React.createElement("button",{className:"icon-btn plain dark","aria-label":"Close",onClick:()=>j(!1)},Le)),React.createElement("p",{className:"sub-text"},"Every listing here, in your own calendar app. It keeps itself up to date, though some apps only check for new listings once a day or so."),React.createElement("a",{className:"btn-primary",href:en,target:"_blank",rel:"noopener noreferrer","data-goatcounter-click":"subscribe-google"},"Google Calendar"),React.createElement("a",{className:"btn-outline wide",href:ct,"data-goatcounter-click":"subscribe-webcal"},"Apple Calendar or Outlook"),React.createElement("button",{className:"btn-outline wide",onClick:()=>dt(Ae,"feed"),"data-goatcounter-click":"subscribe-copy"},we==="feed"?"Link copied":"Copy the link for another app"),we==="fail"&&React.createElement("p",{className:"sub-text"},"Couldn't copy. Here's the link: ",Ae)))):null,vt=D,yn=!D&&F==="calendar",wn=()=>je(F==="list"?"calendar":"list");return React.createElement("div",{className:`app${yn?" fixed":""}`,style:T?{"--bg":"#0E1734","--card":"#18234A","--other":"#121C3D","--text":"#F4F1EA","--muted":"#AEB6CC","--line":"#2A3560","--chip-line":"#3A4566","--hover":"#22305E","--hdr":"#070D22","--primary-bg":"#F4F1EA","--primary-fg":"#0E1734","--today-bg":"#F2B705","--today-fg":"#0E1734"}:{"--bg":"#FAF8F3","--card":"#FFFFFF","--other":"#F1F2F6","--text":"#0E1734","--muted":"#4A5470","--line":"#E1E4EC","--chip-line":"#C5CAD8","--hover":"#EEF0F5","--hdr":"#0E1734","--primary-bg":"#0E1734","--primary-fg":"#FFFFFF","--today-bg":"#0E1734","--today-fg":"#FFFFFF"}},React.createElement("style",null,`
            .app { min-height: 100%; display: flex; flex-direction: column; background: var(--bg); color: var(--text); font-family: 'Open Sans', sans-serif; }
            .app.fixed { height: 100vh; min-height: 0; overflow: hidden; }
            .app a { color: inherit; }
            .app button { font-family: inherit; }
            h1, h2, h3, .month-title, .row-time, .card-time, .num { font-family: 'Bricolage Grotesque', sans-serif; }
            .vh { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

            /* HEADER */
            .hdr { background: var(--hdr); color: #FFFFFF; padding: 10px 24px; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 24px; flex-shrink: 0; }
            .brand { display: flex; align-items: baseline; gap: 12px; flex: 1 1 auto; min-width: 0; }
            .brand h1 { font-size: 22px; font-weight: 800; line-height: 1.1; white-space: nowrap; }
            .updated { font-size: 12px; color: #C9D0E3; white-space: nowrap; }
            .monthnav { display: flex; align-items: center; gap: 6px; }
            .month-title { font-weight: 700; font-size: 19px; min-width: 150px; color: inherit; }
            .hdr-actions { display: flex; align-items: center; gap: 8px; }
            .icon-btn { width: 40px; height: 40px; border-radius: 10px; border: 1.5px solid #3A4566; background: transparent; color: #FFFFFF; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; flex: none; }
            .icon-btn.plain { border-color: transparent; width: 36px; height: 36px; }
            .icon-btn.dark { color: var(--text); }
            .icon-btn:disabled, .ghost-btn:disabled { opacity: 0.35; cursor: not-allowed; }
            .icon-btn:hover:not(:disabled) { background: #FFFFFF15; }
            .ghost-btn { height: 36px; padding: 0 12px; border-radius: 10px; border: 1.5px solid #3A4566; background: transparent; color: #FFFFFF; font-weight: 600; font-size: 13px; cursor: pointer; }
            .btn-light { height: 36px; padding: 0 14px; border-radius: 10px; border: 0; background: #F4F1EA; color: #0E1734; font-weight: 700; font-size: 13px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; white-space: nowrap; cursor: pointer; }
            .btn-light.block { width: 100%; height: 40px; background: var(--primary-bg); color: var(--primary-fg); }

            /* SEARCH */
            .search { position: relative; }
            .search-field { display: flex; align-items: center; gap: 8px; background: #1B2647; border-radius: 10px; padding: 0 12px; height: 36px; width: 220px; color: #C9D0E3; }
            .search-field input { flex: 1; min-width: 0; border: 0; background: transparent; color: #FFFFFF; font-family: inherit; font-size: 14px; outline: none; }
            .search-field input::placeholder { color: #AEB6CC; }
            .search-field:focus-within { box-shadow: 0 0 0 2px #F2B705; }
            .search-results { position: absolute; top: calc(100% + 6px); right: 0; width: 340px; max-width: calc(100vw - 32px); background: var(--card); color: var(--text); border: 1px solid var(--line); border-radius: 12px; box-shadow: 0 12px 32px rgba(0,0,0,0.35); z-index: 60; overflow: hidden; }
            .search-item { display: block; width: 100%; text-align: left; padding: 10px 14px; border: 0; border-top: 1px solid var(--line); background: transparent; color: var(--text); cursor: pointer; }
            .search-item:first-child { border-top: 0; }
            .search-item:hover, .search-item:focus { background: var(--hover); outline: none; }
            .search-title { display: block; font-weight: 700; font-size: 14px; }
            .search-meta { display: block; font-size: 12px; color: var(--muted); margin-top: 2px; }
            .search-none { padding: 12px 14px; font-size: 14px; color: var(--muted); }

            /* FILTER BAR (desktop) */
            .filterbar { flex-shrink: 0; padding: 10px 24px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px; border-bottom: 1px solid var(--line); }
            .chips, .wrap-chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
            .chip { height: 32px; padding: 0 13px; border-radius: 999px; border: 1.5px solid var(--chip-line); background: var(--card); color: var(--text); font-weight: 600; font-size: 13px; display: inline-flex; align-items: center; gap: 7px; cursor: pointer; }
            .chip[aria-pressed="true"] { background: var(--primary-bg); color: var(--primary-fg); border-color: var(--primary-bg); font-weight: 700; }
            select.chip { padding: 0 10px; }
            .chip-gap { width: 6px; }
            .bit-line { font-size: 13px; color: var(--muted); display: flex; align-items: center; gap: 2px; }
            .bit-line a { color: var(--text); font-weight: 600; }
            .bit-x { width: 32px; height: 32px; border: 0; background: transparent; color: var(--muted); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; flex: none; }

            /* FOCUS: pop-ups take focus themselves only as a fallback; keyboard users always see a ring */
            .sheet:focus, .modal-content:focus { outline: none; }
            .app :focus-visible { outline: 2px solid #F2B705; outline-offset: 2px; }
            .app .evchip:focus-visible, .app .search-item:focus-visible { outline: 2px solid #F2B705; outline-offset: -2px; }

            /* SHAPES */
            .shape { display: inline-block; flex: none; }
            .shape-show { border-radius: 50%; }
            .shape-workshop { border-radius: 2px; }
            .shape-jam { transform: rotate(45deg) scale(0.78); border-radius: 1px; }
            .shape-dropin { clip-path: polygon(50% 0, 100% 100%, 0 100%); }

            /* MONTH VIEW */
            .cal-main { flex: 1; min-height: 0; display: flex; gap: 16px; padding: 12px 24px 14px; }
            .cal-wrap { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; }
            .dow-row, .grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
            .dow { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); padding: 0 6px 4px; }
            .grid { flex: 1; min-height: 0; }
            .cell { min-height: 0; overflow: hidden; border-radius: 8px; padding: 4px 4px 2px; display: flex; flex-direction: column; gap: 1px; background: var(--card); border: 1px solid var(--line); cursor: pointer; }
            .cell.other { background: var(--other); }
            .cell.past { opacity: 0.55; }
            .cell.today { border: 2px solid var(--text); }
            .cell.picked { box-shadow: inset 0 0 0 2px #F2B705; }
            .num { align-self: flex-start; border: 0; background: transparent; color: var(--text); font-weight: 700; font-size: 13px; line-height: 22px; padding: 0 7px; border-radius: 999px; cursor: pointer; }
            .cell.other .num { color: var(--muted); }
            .cell.today .num { background: var(--today-bg); color: var(--today-fg); }
            .evchip { display: flex; align-items: center; gap: 5px; width: 100%; border: 0; background: transparent; color: var(--text); font-size: 12px; line-height: 18px; border-radius: 4px; padding: 0 3px; cursor: pointer; text-align: left; min-width: 0; }
            .evchip:hover, .evchip:focus { background: var(--hover); outline: none; }
            .evchip .txt { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
            .more { font-size: 12px; font-weight: 700; padding: 0 3px; }
            .cell-shapes { display: none; }
            .phone-monthnav { display: none; }

            /* SIDE PANEL */
            .side { width: 320px; flex: none; min-height: 0; box-sizing: border-box; background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px; display: flex; flex-direction: column; gap: 8px; }
            .side h2 { font-size: 20px; font-weight: 800; }
            .side-list { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; }
            .side-empty { font-size: 14px; color: var(--muted); padding: 8px 0; }
            .side-foot { border-top: 1px solid var(--line); padding-top: 12px; font-size: 12px; color: var(--muted); line-height: 1.5; display: flex; flex-direction: column; gap: 10px; }
            .side-foot a { color: var(--text); }
            .linkish { border: 0; background: none; color: var(--text); text-decoration: underline; font-weight: 600; font-size: 13px; cursor: pointer; padding: 0; align-self: flex-start; }
            .row { display: flex; gap: 12px; width: 100%; text-align: left; background: transparent; border: 0; border-top: 1px solid var(--line); padding: 10px 2px; cursor: pointer; color: var(--text); }
            .row:first-child { border-top: 0; }
            .row:hover .row-title { text-decoration: underline; }
            .row-when { flex: none; width: 74px; display: flex; flex-direction: column; gap: 2px; }
            .row-day { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
            .row-time { font-weight: 800; font-size: 16px; }
            .row-main { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
            .row-title { font-weight: 700; font-size: 14px; line-height: 1.3; overflow-wrap: anywhere; }
            .row-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }

            /* LIST VIEW */
            .list { flex: 1; width: 100%; max-width: 760px; margin: 0 auto; padding: 8px 20px 28px; box-sizing: border-box; }
            .list-note { padding: 14px 0 0; font-size: 14px; color: var(--muted); }
            .day-group { padding-top: 18px; display: flex; flex-direction: column; gap: 8px; }
            .day-group h2 { font-size: 18px; font-weight: 800; }
            .day-group h2 small { font-family: 'Open Sans', sans-serif; font-weight: 600; font-size: 14px; color: var(--muted); margin-left: 8px; }
            .card { display: flex; gap: 14px; align-items: flex-start; width: 100%; text-align: left; background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 14px; cursor: pointer; color: var(--text); }
            .card:hover { border-color: var(--chip-line); }
            .card-when { flex: none; width: 64px; display: flex; flex-direction: column; gap: 6px; }
            .card-time { font-weight: 800; font-size: 17px; line-height: 1; }
            .card-type { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; }
            .card-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
            .card-title { font-weight: 700; font-size: 15px; line-height: 1.35; overflow-wrap: anywhere; }
            .card-venue { font-size: 13px; color: var(--muted); }
            .chev { flex: none; color: var(--muted); margin-top: 1px; }
            .empty { padding: 40px 0 8px; text-align: center; color: var(--muted); display: flex; flex-direction: column; gap: 14px; align-items: center; }

            /* BUTTONS */
            .btn-outline { min-height: 46px; border-radius: 12px; border: 1.5px solid var(--text); background: transparent; color: var(--text); font-weight: 700; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; padding: 0 14px; text-decoration: none; text-align: center; }
            .btn-outline.wide { width: 100%; margin-top: 20px; }
            .app .btn-primary { min-height: 52px; border-radius: 14px; border: 0; background: var(--primary-bg); color: var(--primary-fg); text-decoration: none; font-weight: 700; font-size: 16px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; width: 100%; }

            /* FOOTER */
            .site-foot { background: var(--hdr); color: #C9D0E3; padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 10px; font-size: 13px; line-height: 1.6; }
            .site-foot a { color: #FFFFFF; }
            .foot-tilt { display: flex; align-items: center; gap: 10px; color: #FFFFFF; }
            .foot-tilt.small { color: var(--muted); }
            .tilt-mark { flex: none; width: 36px; height: 36px; border-radius: 50%; background: #F2542D; color: #0E1734; display: inline-flex; align-items: center; justify-content: center; font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 14px; }
            .foot-tilt.small .tilt-mark { width: 30px; height: 30px; font-size: 12px; }

            /* PHONE CONTROLS */
            .phone-controls { background: var(--hdr); padding: 0 16px 14px; display: flex; flex-direction: column; gap: 10px; flex-shrink: 0; }
            .phone-controls .search-field { width: auto; height: 44px; border-radius: 12px; }
            .phone-controls .search-field input { font-size: 16px; }
            .phone-controls .search-results { left: 0; right: 0; width: auto; max-width: none; }
            .fbtns { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
            .fbtn { height: 44px; border-radius: 12px; border: 0; background: #F4F1EA; color: #0E1734; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 4px; min-width: 0; padding: 0 8px; cursor: pointer; }
            .fbtn.on { background: #F2B705; }
            .fbtn span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .fbtn svg { flex: none; }
            .bit-bar { padding: 10px 16px; background: var(--other); border-bottom: 1px solid var(--line); }
            .bit-bar .bit-line { justify-content: space-between; line-height: 1.45; }

            /* SHEETS (event, filters, subscribe) */
            .sheet-overlay { position: fixed; inset: 0; background: rgba(5,9,25,0.6); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; }
            .sheet { width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto; background: var(--bg); color: var(--text); border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.45); position: relative; }
            .sheet-hero { position: relative; height: 96px; background: repeating-linear-gradient(135deg, #24315A 0 14px, #1B2647 14px 28px); background-size: cover; background-position: center; }
            .sheet-hero.has-img { height: 200px; }
            .sheet-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0) 25%, var(--bg) 100%); }
            .sheet-close { position: absolute; top: 12px; right: 12px; z-index: 1; width: 44px; height: 44px; border-radius: 50%; border: 0; background: rgba(14,23,52,0.75); color: #FFFFFF; display: flex; align-items: center; justify-content: center; cursor: pointer; }
            .sheet-handle { display: none; position: absolute; top: 8px; left: 50%; margin-left: -22px; width: 44px; height: 5px; border-radius: 3px; background: rgba(255,255,255,0.8); z-index: 1; }
            .sheet-handle.static { position: static; margin: 0 auto 4px; background: var(--chip-line); }
            .sheet-body { padding: 0 22px 24px; margin-top: -30px; position: relative; display: flex; flex-direction: column; gap: 16px; }
            .type-pill { align-self: flex-start; display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; background: var(--card); border: 1px solid var(--line); border-radius: 999px; padding: 4px 10px; }
            .sheet-body h2 { font-size: 26px; font-weight: 800; line-height: 1.12; }
            .facts { list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 15px; }
            .facts li { display: flex; gap: 12px; align-items: center; }
            .facts a { font-size: 13px; margin-left: 4px; }
            .sheet-desc { font-size: 14px; line-height: 1.55; color: var(--muted); }
            .sheet-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
            .cal-choices { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
            .also { border-top: 1px solid var(--line); padding-top: 14px; display: flex; flex-direction: column; gap: 4px; }
            .also-label { font-size: 13px; font-weight: 700; color: var(--muted); }
            .also button { text-align: left; border: 0; background: none; color: var(--text); text-decoration: underline; font-size: 14px; padding: 6px 0; cursor: pointer; }
            .fsheet { padding: 12px 22px 24px; display: flex; flex-direction: column; gap: 18px; }
            .fsheet-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
            .fsheet-top h2 { font-size: 24px; font-weight: 800; }
            .fsheet fieldset { border: 0; padding: 0; margin: 0; }
            .fsheet legend { font-weight: 700; font-size: 15px; margin-bottom: 10px; padding: 0; }
            .fsheet .chip { height: 40px; font-size: 14px; padding: 0 14px; }
            .type-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
            .type-check { min-height: 48px; border-radius: 12px; border: 1.5px solid var(--chip-line); background: var(--card); display: flex; align-items: center; gap: 10px; padding: 0 12px; font-weight: 600; font-size: 14px; cursor: pointer; }
            .type-check input { width: 18px; height: 18px; margin: 0; accent-color: #F2B705; }
            .where { display: flex; flex-direction: column; gap: 10px; font-weight: 700; font-size: 15px; }
            .where select { height: 48px; border-radius: 12px; border: 1.5px solid var(--chip-line); background: var(--card); color: var(--text); font-family: inherit; font-size: 15px; padding: 0 12px; }
            .sub-text { font-size: 14px; line-height: 1.55; color: var(--muted); overflow-wrap: anywhere; }
            .fsheet .btn-outline.wide { margin-top: 0; }

            ${Yt}

            /* PHONE */
            @media (max-width: 768px) {
              .hdr { padding: 14px 16px 12px; gap: 10px; flex-wrap: nowrap; }
              .brand { flex-direction: column; align-items: flex-start; gap: 2px; }
              .brand h1 { font-size: 24px; }
              .updated { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; }
              .icon-btn { width: 44px; height: 44px; border-radius: 12px; }
              .icon-btn.plain { width: 40px; height: 40px; }
              .list { padding: 4px 16px 24px; }
              .cal-main { flex-direction: column; padding: 4px 10px 20px; gap: 12px; }
              .phone-monthnav { display: block; padding: 8px 0 8px; }
              .phone-monthnav .monthnav { justify-content: space-between; }
              .phone-monthnav .ghost-btn, .phone-monthnav .icon-btn { color: var(--text); border-color: var(--chip-line); }
              .phone-monthnav .icon-btn.plain { border-color: transparent; }
              .phone-monthnav .month-title { order: -1; flex: 1; min-width: 0; font-size: 20px; }
              .grid { gap: 3px; grid-template-rows: none !important; grid-auto-rows: minmax(58px, auto); }
              .dow-row { gap: 3px; }
              .dow { padding: 0 0 4px; text-align: center; letter-spacing: 0.04em; }
              .cell { padding: 3px; align-items: center; }
              .num { align-self: center; font-size: 13px; padding: 0 6px; }
              .evchip, .more { display: none; }
              .cell-shapes { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 3px; margin-top: auto; padding-bottom: 3px; }
              .cell-count { font-size: 10px; font-weight: 700; color: var(--muted); }
              .side { width: auto; }
              .side-list { overflow: visible; }
              .sheet-overlay { align-items: flex-end; padding: 0; }
              .sheet { max-width: none; border-radius: 24px 24px 0 0; max-height: 92vh; }
              .sheet-handle { display: block; }
              .sheet-body h2 { font-size: 26px; }
            }
          `),React.createElement("header",{className:"hdr"},React.createElement("div",{className:"brand"},React.createElement("h1",null,vt?"Bristol Improv":"Bristol Improv Calendar"),React.createElement("span",{className:"updated"},vt?`Calendar${Se?" \xB7 "+Se.toLowerCase():""}`:Se)),!D&&F==="calendar"&&gt,React.createElement("div",{className:"hdr-actions"},!D&&mt,!D&&F==="list"&&React.createElement("button",{className:"btn-light",onClick:()=>{H(""),j(!0)},"data-goatcounter-click":"subscribe-open"},se," Add to your calendar"),React.createElement("button",{className:"icon-btn",onClick:wn,"aria-label":F==="list"?"Show the month view":"Show the list view",title:F==="list"?"Month view":"List view","data-goatcounter-click":F==="list"?"view-toggle-calendar":"view-toggle-list"},F==="list"?ht:nn),React.createElement("button",{className:"icon-btn",onClick:()=>Pe(!0),"aria-label":"Settings",title:"Settings"},an))),D?React.createElement(React.Fragment,null,React.createElement("div",{className:"phone-controls"},mt,React.createElement("div",{className:"fbtns"},React.createElement("button",{className:`fbtn${g!=="any"?" on":""}`,onClick:()=>P(!0)},React.createElement("span",null,tt),Be),React.createElement("button",{className:`fbtn${l.length?" on":""}`,onClick:()=>P(!0)},React.createElement("span",null,Jt),Be),React.createElement("button",{className:`fbtn${i!=="all"?" on":""}`,onClick:()=>P(!0)},React.createElement("span",null,Zt),Be))),Re&&React.createElement("div",{className:"bit-bar"},Re)):React.createElement("div",{className:"filterbar"},React.createElement("nav",{className:"chips","aria-label":"Filters"},React.createElement("button",{className:"chip","aria-pressed":!at,onClick:Ce},"Everything"),React.createElement("button",{className:"chip","aria-pressed":g==="today",onClick:()=>te(g==="today"?"any":"today")},"Today"),React.createElement("button",{className:"chip","aria-pressed":g==="weekend",onClick:()=>te(g==="weekend"?"any":"weekend")},"This weekend"),React.createElement("span",{className:"chip-gap","aria-hidden":"true"}),J.filter(e=>Ht.has(e)||e!=="dropin").map(e=>React.createElement("button",{key:e,className:"chip","aria-pressed":l.includes(e),onClick:()=>Kt(e)},z(e,10),Ee[e])),React.createElement("label",null,React.createElement("span",{className:"vh"},"Venue"),React.createElement("select",{className:"chip",value:i,onChange:e=>d(e.target.value)},React.createElement("option",{value:"all"},"All venues"),me.map(({key:e,label:t})=>React.createElement("option",{key:e,value:e,disabled:!Qe.has(e)},t))))),Re),wt?React.createElement("div",{className:"loading"},React.createElement("div",{className:"spinner"}),React.createElement("div",null,"Loading events...")):Me?React.createElement("div",{className:"loading"},React.createElement("div",{style:{fontWeight:700}},Me),React.createElement("div",{style:{fontSize:"0.9rem",maxWidth:"320px",textAlign:"center",lineHeight:1.5}},"It's probably temporary. Give it another go, or check back in a bit."),React.createElement("button",{className:"btn-outline",onClick:Ve},"Try again")):F==="list"?mn():xn(),(D||F==="list")&&dn,fn(),bn(),vn(),React.createElement(RoadmapModal,{isOpen:kt,onClose:()=>Oe(!1),colors:a}),React.createElement(SettingsModal,{isOpen:Nt,onClose:()=>Pe(!1),colors:a,darkMode:T,setDarkMode:Et,viewMode:F,setViewMode:je,onOpenRoadmap:()=>Oe(!0),lastUpdated:ce,formatLastUpdated:Ut}))};ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(BristolImprovCalendar,null));

const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/HomeDashboard-B9cKDY3a.js","assets/utils-BHxxtv0k.js","assets/vendor-DmB8enzJ.js","assets/QuizArena-B4FmuOEr.js","assets/geminiService-D2F1QE8i.js","assets/syllabusData-D0LITZry.js","assets/ExamPage-0yn__30U.js","assets/AdmissionSearch-00KqjJmv.js","assets/StudyTracker-I0Ls_pxJ.js","assets/QuizBattlePrototype-D_vf7Pef.js","assets/Confetti-CAnWOuF1.js","assets/CourseSection-DqU2HkJr.js","assets/ExamPackSection-CNJ7m_Kv.js","assets/QuestionBank-DupAjeAc.js","assets/ProfilePage-Osc1OscL.js","assets/AdminPage-BI-N3vfC.js","assets/LeaderboardPage-DqXW_24t.js","assets/DailyChallengePage-2XwQOMA9.js","assets/ExamHub-DFXXNA-5.js","assets/GSTCoursePage-DYJB1tBN.js","assets/PaymentPage-KVhr4j_q.js"])))=>i.map(i=>d[i]);
import{r as k,R as Af,a as _e,j as l,H as Pl,L as Rf,Z as ko,B as hr,b as Pf,A as gh,S as ur,T as dr,P as jl,G as Fr,C as jf,X as So,M as Of,c as Ki,d as Yi,e as _h,f as Df,I as yh,g as No,h as vh,i as Lf,k as Mf,l as Uf,m as xh,U as bh,n as Ff,o as zf,p as Bf,q as ys,s as rr,t as Wf,u as fr,v as wh,w as Ol,x as Vf,y as Dl,z as Eh,D as $f,E as Hf,F as qf,J as Gf,K as Kf,N as Yf,O as Jf,Q as Qf,V as Xf,W as Zf,Y as ep,_ as tp,$ as np}from"./utils-BHxxtv0k.js";import{r as sp}from"./vendor-DmB8enzJ.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(r){if(r.ep)return;r.ep=!0;const o=t(r);fetch(r.href,o)}})();var Ji={},Ll=sp;Ji.createRoot=Ll.createRoot,Ji.hydrateRoot=Ll.hydrateRoot;const rp="modulepreload",ip=function(n){return"/Ed-Tech/"+n},Ml={},Se=function(e,t,s){let r=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),c=(a==null?void 0:a.nonce)||(a==null?void 0:a.getAttribute("nonce"));r=Promise.allSettled(t.map(u=>{if(u=ip(u),u in Ml)return;Ml[u]=!0;const f=u.endsWith(".css"),_=f?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${u}"]${_}`))return;const m=document.createElement("link");if(m.rel=f?"stylesheet":rp,f||(m.as="script"),m.crossOrigin="",m.href=u,c&&m.setAttribute("nonce",c),document.head.appendChild(m),f)return new Promise((b,S)=>{m.addEventListener("load",b),m.addEventListener("error",()=>S(new Error(`Unable to preload CSS for ${u}`)))})}))}function o(a){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=a,window.dispatchEvent(c),!c.defaultPrevented)throw a}return r.then(a=>{for(const c of a||[])c.status==="rejected"&&o(c.reason);return e().catch(o)})};/**
 * @remix-run/router v1.23.2
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function os(){return os=Object.assign?Object.assign.bind():function(n){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var s in t)Object.prototype.hasOwnProperty.call(t,s)&&(n[s]=t[s])}return n},os.apply(this,arguments)}var Et;(function(n){n.Pop="POP",n.Push="PUSH",n.Replace="REPLACE"})(Et||(Et={}));const Ul="popstate";function op(n){n===void 0&&(n={});function e(r,o){let{pathname:a="/",search:c="",hash:u=""}=Qt(r.location.hash.substr(1));return!a.startsWith("/")&&!a.startsWith(".")&&(a="/"+a),Qi("",{pathname:a,search:c,hash:u},o.state&&o.state.usr||null,o.state&&o.state.key||"default")}function t(r,o){let a=r.document.querySelector("base"),c="";if(a&&a.getAttribute("href")){let u=r.location.href,f=u.indexOf("#");c=f===-1?u:u.slice(0,f)}return c+"#"+(typeof o=="string"?o:pr(o))}function s(r,o){zr(r.pathname.charAt(0)==="/","relative pathnames are not supported in hash history.push("+JSON.stringify(o)+")")}return lp(e,t,s,n)}function ue(n,e){if(n===!1||n===null||typeof n>"u")throw new Error(e)}function zr(n,e){if(!n){typeof console<"u"&&console.warn(e);try{throw new Error(e)}catch{}}}function ap(){return Math.random().toString(36).substr(2,8)}function Fl(n,e){return{usr:n.state,key:n.key,idx:e}}function Qi(n,e,t,s){return t===void 0&&(t=null),os({pathname:typeof n=="string"?n:n.pathname,search:"",hash:""},typeof e=="string"?Qt(e):e,{state:t,key:e&&e.key||s||ap()})}function pr(n){let{pathname:e="/",search:t="",hash:s=""}=n;return t&&t!=="?"&&(e+=t.charAt(0)==="?"?t:"?"+t),s&&s!=="#"&&(e+=s.charAt(0)==="#"?s:"#"+s),e}function Qt(n){let e={};if(n){let t=n.indexOf("#");t>=0&&(e.hash=n.substr(t),n=n.substr(0,t));let s=n.indexOf("?");s>=0&&(e.search=n.substr(s),n=n.substr(0,s)),n&&(e.pathname=n)}return e}function lp(n,e,t,s){s===void 0&&(s={});let{window:r=document.defaultView,v5Compat:o=!1}=s,a=r.history,c=Et.Pop,u=null,f=_();f==null&&(f=0,a.replaceState(os({},a.state,{idx:f}),""));function _(){return(a.state||{idx:null}).idx}function m(){c=Et.Pop;let A=_(),U=A==null?null:A-f;f=A,u&&u({action:c,location:R.location,delta:U})}function b(A,U){c=Et.Push;let z=Qi(R.location,A,U);t&&t(z,A),f=_()+1;let M=Fl(z,f),D=R.createHref(z);try{a.pushState(M,"",D)}catch(L){if(L instanceof DOMException&&L.name==="DataCloneError")throw L;r.location.assign(D)}o&&u&&u({action:c,location:R.location,delta:1})}function S(A,U){c=Et.Replace;let z=Qi(R.location,A,U);t&&t(z,A),f=_();let M=Fl(z,f),D=R.createHref(z);a.replaceState(M,"",D),o&&u&&u({action:c,location:R.location,delta:0})}function T(A){let U=r.location.origin!=="null"?r.location.origin:r.location.href,z=typeof A=="string"?A:pr(A);return z=z.replace(/ $/,"%20"),ue(U,"No window.location.(origin|href) available to create URL for href: "+z),new URL(z,U)}let R={get action(){return c},get location(){return n(r,a)},listen(A){if(u)throw new Error("A history only accepts one active listener");return r.addEventListener(Ul,m),u=A,()=>{r.removeEventListener(Ul,m),u=null}},createHref(A){return e(r,A)},createURL:T,encodeLocation(A){let U=T(A);return{pathname:U.pathname,search:U.search,hash:U.hash}},push:b,replace:S,go(A){return a.go(A)}};return R}var zl;(function(n){n.data="data",n.deferred="deferred",n.redirect="redirect",n.error="error"})(zl||(zl={}));function cp(n,e,t){return t===void 0&&(t="/"),hp(n,e,t)}function hp(n,e,t,s){let r=typeof e=="string"?Qt(e):e,o=Ao(r.pathname||"/",t);if(o==null)return null;let a=Ih(n);up(a);let c=null;for(let u=0;c==null&&u<a.length;++u){let f=Ep(o);c=xp(a[u],f)}return c}function Ih(n,e,t,s){e===void 0&&(e=[]),t===void 0&&(t=[]),s===void 0&&(s="");let r=(o,a,c)=>{let u={relativePath:c===void 0?o.path||"":c,caseSensitive:o.caseSensitive===!0,childrenIndex:a,route:o};u.relativePath.startsWith("/")&&(ue(u.relativePath.startsWith(s),'Absolute route path "'+u.relativePath+'" nested under path '+('"'+s+'" is not valid. An absolute child route path ')+"must start with the combined path of all its parent routes."),u.relativePath=u.relativePath.slice(s.length));let f=Ct([s,u.relativePath]),_=t.concat(u);o.children&&o.children.length>0&&(ue(o.index!==!0,"Index routes must not have child routes. Please remove "+('all child routes from route path "'+f+'".')),Ih(o.children,e,_,f)),!(o.path==null&&!o.index)&&e.push({path:f,score:yp(f,o.index),routesMeta:_})};return n.forEach((o,a)=>{var c;if(o.path===""||!((c=o.path)!=null&&c.includes("?")))r(o,a);else for(let u of Ch(o.path))r(o,a,u)}),e}function Ch(n){let e=n.split("/");if(e.length===0)return[];let[t,...s]=e,r=t.endsWith("?"),o=t.replace(/\?$/,"");if(s.length===0)return r?[o,""]:[o];let a=Ch(s.join("/")),c=[];return c.push(...a.map(u=>u===""?o:[o,u].join("/"))),r&&c.push(...a),c.map(u=>n.startsWith("/")&&u===""?"/":u)}function up(n){n.sort((e,t)=>e.score!==t.score?t.score-e.score:vp(e.routesMeta.map(s=>s.childrenIndex),t.routesMeta.map(s=>s.childrenIndex)))}const dp=/^:[\w-]+$/,fp=3,pp=2,mp=1,gp=10,_p=-2,Bl=n=>n==="*";function yp(n,e){let t=n.split("/"),s=t.length;return t.some(Bl)&&(s+=_p),e&&(s+=pp),t.filter(r=>!Bl(r)).reduce((r,o)=>r+(dp.test(o)?fp:o===""?mp:gp),s)}function vp(n,e){return n.length===e.length&&n.slice(0,-1).every((s,r)=>s===e[r])?n[n.length-1]-e[e.length-1]:0}function xp(n,e,t){let{routesMeta:s}=n,r={},o="/",a=[];for(let c=0;c<s.length;++c){let u=s[c],f=c===s.length-1,_=o==="/"?e:e.slice(o.length)||"/",m=bp({path:u.relativePath,caseSensitive:u.caseSensitive,end:f},_),b=u.route;if(!m)return null;Object.assign(r,m.params),a.push({params:r,pathname:Ct([o,m.pathname]),pathnameBase:Sp(Ct([o,m.pathnameBase])),route:b}),m.pathnameBase!=="/"&&(o=Ct([o,m.pathnameBase]))}return a}function bp(n,e){typeof n=="string"&&(n={path:n,caseSensitive:!1,end:!0});let[t,s]=wp(n.path,n.caseSensitive,n.end),r=e.match(t);if(!r)return null;let o=r[0],a=o.replace(/(.)\/+$/,"$1"),c=r.slice(1);return{params:s.reduce((f,_,m)=>{let{paramName:b,isOptional:S}=_;if(b==="*"){let R=c[m]||"";a=o.slice(0,o.length-R.length).replace(/(.)\/+$/,"$1")}const T=c[m];return S&&!T?f[b]=void 0:f[b]=(T||"").replace(/%2F/g,"/"),f},{}),pathname:o,pathnameBase:a,pattern:n}}function wp(n,e,t){e===void 0&&(e=!1),t===void 0&&(t=!0),zr(n==="*"||!n.endsWith("*")||n.endsWith("/*"),'Route path "'+n+'" will be treated as if it were '+('"'+n.replace(/\*$/,"/*")+'" because the `*` character must ')+"always follow a `/` in the pattern. To get rid of this warning, "+('please change the route path to "'+n.replace(/\*$/,"/*")+'".'));let s=[],r="^"+n.replace(/\/*\*?$/,"").replace(/^\/*/,"/").replace(/[\\.*+^${}|()[\]]/g,"\\$&").replace(/\/:([\w-]+)(\?)?/g,(a,c,u)=>(s.push({paramName:c,isOptional:u!=null}),u?"/?([^\\/]+)?":"/([^\\/]+)"));return n.endsWith("*")?(s.push({paramName:"*"}),r+=n==="*"||n==="/*"?"(.*)$":"(?:\\/(.+)|\\/*)$"):t?r+="\\/*$":n!==""&&n!=="/"&&(r+="(?:(?=\\/|$))"),[new RegExp(r,e?void 0:"i"),s]}function Ep(n){try{return n.split("/").map(e=>decodeURIComponent(e).replace(/\//g,"%2F")).join("/")}catch(e){return zr(!1,'The URL path "'+n+'" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent '+("encoding ("+e+").")),n}}function Ao(n,e){if(e==="/")return n;if(!n.toLowerCase().startsWith(e.toLowerCase()))return null;let t=e.endsWith("/")?e.length-1:e.length,s=n.charAt(t);return s&&s!=="/"?null:n.slice(t)||"/"}const Ip=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,Cp=n=>Ip.test(n);function Tp(n,e){e===void 0&&(e="/");let{pathname:t,search:s="",hash:r=""}=typeof n=="string"?Qt(n):n,o;if(t)if(Cp(t))o=t;else{if(t.includes("//")){let a=t;t=t.replace(/\/\/+/g,"/"),zr(!1,"Pathnames cannot have embedded double slashes - normalizing "+(a+" -> "+t))}t.startsWith("/")?o=Wl(t.substring(1),"/"):o=Wl(t,e)}else o=e;return{pathname:o,search:Np(s),hash:Ap(r)}}function Wl(n,e){let t=e.replace(/\/+$/,"").split("/");return n.split("/").forEach(r=>{r===".."?t.length>1&&t.pop():r!=="."&&t.push(r)}),t.length>1?t.join("/"):"/"}function Pi(n,e,t,s){return"Cannot include a '"+n+"' character in a manually specified "+("`to."+e+"` field ["+JSON.stringify(s)+"].  Please separate it out to the ")+("`to."+t+"` field. Alternatively you may provide the full path as ")+'a string in <Link to="..."> and the router will parse it for you.'}function kp(n){return n.filter((e,t)=>t===0||e.route.path&&e.route.path.length>0)}function Ro(n,e){let t=kp(n);return e?t.map((s,r)=>r===t.length-1?s.pathname:s.pathnameBase):t.map(s=>s.pathnameBase)}function Po(n,e,t,s){s===void 0&&(s=!1);let r;typeof n=="string"?r=Qt(n):(r=os({},n),ue(!r.pathname||!r.pathname.includes("?"),Pi("?","pathname","search",r)),ue(!r.pathname||!r.pathname.includes("#"),Pi("#","pathname","hash",r)),ue(!r.search||!r.search.includes("#"),Pi("#","search","hash",r)));let o=n===""||r.pathname==="",a=o?"/":r.pathname,c;if(a==null)c=t;else{let m=e.length-1;if(!s&&a.startsWith("..")){let b=a.split("/");for(;b[0]==="..";)b.shift(),m-=1;r.pathname=b.join("/")}c=m>=0?e[m]:"/"}let u=Tp(r,c),f=a&&a!=="/"&&a.endsWith("/"),_=(o||a===".")&&t.endsWith("/");return!u.pathname.endsWith("/")&&(f||_)&&(u.pathname+="/"),u}const Ct=n=>n.join("/").replace(/\/\/+/g,"/"),Sp=n=>n.replace(/\/+$/,"").replace(/^\/*/,"/"),Np=n=>!n||n==="?"?"":n.startsWith("?")?n:"?"+n,Ap=n=>!n||n==="#"?"":n.startsWith("#")?n:"#"+n;function Rp(n){return n!=null&&typeof n.status=="number"&&typeof n.statusText=="string"&&typeof n.internal=="boolean"&&"data"in n}const Th=["post","put","patch","delete"];new Set(Th);const Pp=["get",...Th];new Set(Pp);/**
 * React Router v6.30.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function as(){return as=Object.assign?Object.assign.bind():function(n){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var s in t)Object.prototype.hasOwnProperty.call(t,s)&&(n[s]=t[s])}return n},as.apply(this,arguments)}const jo=k.createContext(null),jp=k.createContext(null),Ot=k.createContext(null),Br=k.createContext(null),ft=k.createContext({outlet:null,matches:[],isDataRoute:!1}),kh=k.createContext(null);function Op(n,e){let{relative:t}=e===void 0?{}:e;In()||ue(!1);let{basename:s,navigator:r}=k.useContext(Ot),{hash:o,pathname:a,search:c}=Nh(n,{relative:t}),u=a;return s!=="/"&&(u=a==="/"?s:Ct([s,a])),r.createHref({pathname:u,search:c,hash:o})}function In(){return k.useContext(Br)!=null}function Xt(){return In()||ue(!1),k.useContext(Br).location}function Sh(n){k.useContext(Ot).static||k.useLayoutEffect(n)}function vs(){let{isDataRoute:n}=k.useContext(ft);return n?Gp():Dp()}function Dp(){In()||ue(!1);let n=k.useContext(jo),{basename:e,future:t,navigator:s}=k.useContext(Ot),{matches:r}=k.useContext(ft),{pathname:o}=Xt(),a=JSON.stringify(Ro(r,t.v7_relativeSplatPath)),c=k.useRef(!1);return Sh(()=>{c.current=!0}),k.useCallback(function(f,_){if(_===void 0&&(_={}),!c.current)return;if(typeof f=="number"){s.go(f);return}let m=Po(f,JSON.parse(a),o,_.relative==="path");n==null&&e!=="/"&&(m.pathname=m.pathname==="/"?e:Ct([e,m.pathname])),(_.replace?s.replace:s.push)(m,_.state,_)},[e,s,a,o,n])}function Uw(){let{matches:n}=k.useContext(ft),e=n[n.length-1];return e?e.params:{}}function Nh(n,e){let{relative:t}=e===void 0?{}:e,{future:s}=k.useContext(Ot),{matches:r}=k.useContext(ft),{pathname:o}=Xt(),a=JSON.stringify(Ro(r,s.v7_relativeSplatPath));return k.useMemo(()=>Po(n,JSON.parse(a),o,t==="path"),[n,a,o,t])}function Lp(n,e){return Mp(n,e)}function Mp(n,e,t,s){In()||ue(!1);let{navigator:r}=k.useContext(Ot),{matches:o}=k.useContext(ft),a=o[o.length-1],c=a?a.params:{};a&&a.pathname;let u=a?a.pathnameBase:"/";a&&a.route;let f=Xt(),_;if(e){var m;let A=typeof e=="string"?Qt(e):e;u==="/"||(m=A.pathname)!=null&&m.startsWith(u)||ue(!1),_=A}else _=f;let b=_.pathname||"/",S=b;if(u!=="/"){let A=u.replace(/^\//,"").split("/");S="/"+b.replace(/^\//,"").split("/").slice(A.length).join("/")}let T=cp(n,{pathname:S}),R=Wp(T&&T.map(A=>Object.assign({},A,{params:Object.assign({},c,A.params),pathname:Ct([u,r.encodeLocation?r.encodeLocation(A.pathname).pathname:A.pathname]),pathnameBase:A.pathnameBase==="/"?u:Ct([u,r.encodeLocation?r.encodeLocation(A.pathnameBase).pathname:A.pathnameBase])})),o,t,s);return e&&R?k.createElement(Br.Provider,{value:{location:as({pathname:"/",search:"",hash:"",state:null,key:"default"},_),navigationType:Et.Pop}},R):R}function Up(){let n=qp(),e=Rp(n)?n.status+" "+n.statusText:n instanceof Error?n.message:JSON.stringify(n),t=n instanceof Error?n.stack:null,r={padding:"0.5rem",backgroundColor:"rgba(200,200,200, 0.5)"};return k.createElement(k.Fragment,null,k.createElement("h2",null,"Unexpected Application Error!"),k.createElement("h3",{style:{fontStyle:"italic"}},e),t?k.createElement("pre",{style:r},t):null,null)}const Fp=k.createElement(Up,null);class zp extends k.Component{constructor(e){super(e),this.state={location:e.location,revalidation:e.revalidation,error:e.error}}static getDerivedStateFromError(e){return{error:e}}static getDerivedStateFromProps(e,t){return t.location!==e.location||t.revalidation!=="idle"&&e.revalidation==="idle"?{error:e.error,location:e.location,revalidation:e.revalidation}:{error:e.error!==void 0?e.error:t.error,location:t.location,revalidation:e.revalidation||t.revalidation}}componentDidCatch(e,t){console.error("React Router caught the following error during render",e,t)}render(){return this.state.error!==void 0?k.createElement(ft.Provider,{value:this.props.routeContext},k.createElement(kh.Provider,{value:this.state.error,children:this.props.component})):this.props.children}}function Bp(n){let{routeContext:e,match:t,children:s}=n,r=k.useContext(jo);return r&&r.static&&r.staticContext&&(t.route.errorElement||t.route.ErrorBoundary)&&(r.staticContext._deepestRenderedBoundaryId=t.route.id),k.createElement(ft.Provider,{value:e},s)}function Wp(n,e,t,s){var r;if(e===void 0&&(e=[]),t===void 0&&(t=null),s===void 0&&(s=null),n==null){var o;if(!t)return null;if(t.errors)n=t.matches;else if((o=s)!=null&&o.v7_partialHydration&&e.length===0&&!t.initialized&&t.matches.length>0)n=t.matches;else return null}let a=n,c=(r=t)==null?void 0:r.errors;if(c!=null){let _=a.findIndex(m=>m.route.id&&(c==null?void 0:c[m.route.id])!==void 0);_>=0||ue(!1),a=a.slice(0,Math.min(a.length,_+1))}let u=!1,f=-1;if(t&&s&&s.v7_partialHydration)for(let _=0;_<a.length;_++){let m=a[_];if((m.route.HydrateFallback||m.route.hydrateFallbackElement)&&(f=_),m.route.id){let{loaderData:b,errors:S}=t,T=m.route.loader&&b[m.route.id]===void 0&&(!S||S[m.route.id]===void 0);if(m.route.lazy||T){u=!0,f>=0?a=a.slice(0,f+1):a=[a[0]];break}}}return a.reduceRight((_,m,b)=>{let S,T=!1,R=null,A=null;t&&(S=c&&m.route.id?c[m.route.id]:void 0,R=m.route.errorElement||Fp,u&&(f<0&&b===0?(Kp("route-fallback"),T=!0,A=null):f===b&&(T=!0,A=m.route.hydrateFallbackElement||null)));let U=e.concat(a.slice(0,b+1)),z=()=>{let M;return S?M=R:T?M=A:m.route.Component?M=k.createElement(m.route.Component,null):m.route.element?M=m.route.element:M=_,k.createElement(Bp,{match:m,routeContext:{outlet:_,matches:U,isDataRoute:t!=null},children:M})};return t&&(m.route.ErrorBoundary||m.route.errorElement||b===0)?k.createElement(zp,{location:t.location,revalidation:t.revalidation,component:R,error:S,children:z(),routeContext:{outlet:null,matches:U,isDataRoute:!0}}):z()},null)}var Ah=function(n){return n.UseBlocker="useBlocker",n.UseRevalidator="useRevalidator",n.UseNavigateStable="useNavigate",n}(Ah||{}),Rh=function(n){return n.UseBlocker="useBlocker",n.UseLoaderData="useLoaderData",n.UseActionData="useActionData",n.UseRouteError="useRouteError",n.UseNavigation="useNavigation",n.UseRouteLoaderData="useRouteLoaderData",n.UseMatches="useMatches",n.UseRevalidator="useRevalidator",n.UseNavigateStable="useNavigate",n.UseRouteId="useRouteId",n}(Rh||{});function Vp(n){let e=k.useContext(jo);return e||ue(!1),e}function $p(n){let e=k.useContext(jp);return e||ue(!1),e}function Hp(n){let e=k.useContext(ft);return e||ue(!1),e}function Ph(n){let e=Hp(),t=e.matches[e.matches.length-1];return t.route.id||ue(!1),t.route.id}function qp(){var n;let e=k.useContext(kh),t=$p(),s=Ph();return e!==void 0?e:(n=t.errors)==null?void 0:n[s]}function Gp(){let{router:n}=Vp(Ah.UseNavigateStable),e=Ph(Rh.UseNavigateStable),t=k.useRef(!1);return Sh(()=>{t.current=!0}),k.useCallback(function(r,o){o===void 0&&(o={}),t.current&&(typeof r=="number"?n.navigate(r):n.navigate(r,as({fromRouteId:e},o)))},[n,e])}const Vl={};function Kp(n,e,t){Vl[n]||(Vl[n]=!0)}function Yp(n,e){n==null||n.v7_startTransition,n==null||n.v7_relativeSplatPath}function Qs(n){let{to:e,replace:t,state:s,relative:r}=n;In()||ue(!1);let{future:o,static:a}=k.useContext(Ot),{matches:c}=k.useContext(ft),{pathname:u}=Xt(),f=vs(),_=Po(e,Ro(c,o.v7_relativeSplatPath),u,r==="path"),m=JSON.stringify(_);return k.useEffect(()=>f(JSON.parse(m),{replace:t,state:s,relative:r}),[f,m,r,t,s]),null}function le(n){ue(!1)}function Jp(n){let{basename:e="/",children:t=null,location:s,navigationType:r=Et.Pop,navigator:o,static:a=!1,future:c}=n;In()&&ue(!1);let u=e.replace(/^\/*/,"/"),f=k.useMemo(()=>({basename:u,navigator:o,static:a,future:as({v7_relativeSplatPath:!1},c)}),[u,c,o,a]);typeof s=="string"&&(s=Qt(s));let{pathname:_="/",search:m="",hash:b="",state:S=null,key:T="default"}=s,R=k.useMemo(()=>{let A=Ao(_,u);return A==null?null:{location:{pathname:A,search:m,hash:b,state:S,key:T},navigationType:r}},[u,_,m,b,S,T,r]);return R==null?null:k.createElement(Ot.Provider,{value:f},k.createElement(Br.Provider,{children:t,value:R}))}function $l(n){let{children:e,location:t}=n;return Lp(Xi(e),t)}new Promise(()=>{});function Xi(n,e){e===void 0&&(e=[]);let t=[];return k.Children.forEach(n,(s,r)=>{if(!k.isValidElement(s))return;let o=[...e,r];if(s.type===k.Fragment){t.push.apply(t,Xi(s.props.children,o));return}s.type!==le&&ue(!1),!s.props.index||!s.props.children||ue(!1);let a={id:s.props.id||o.join("-"),caseSensitive:s.props.caseSensitive,element:s.props.element,Component:s.props.Component,index:s.props.index,path:s.props.path,loader:s.props.loader,action:s.props.action,errorElement:s.props.errorElement,ErrorBoundary:s.props.ErrorBoundary,hasErrorBoundary:s.props.ErrorBoundary!=null||s.props.errorElement!=null,shouldRevalidate:s.props.shouldRevalidate,handle:s.props.handle,lazy:s.props.lazy};s.props.children&&(a.children=Xi(s.props.children,o)),t.push(a)}),t}/**
 * React Router DOM v6.30.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function Zi(){return Zi=Object.assign?Object.assign.bind():function(n){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var s in t)Object.prototype.hasOwnProperty.call(t,s)&&(n[s]=t[s])}return n},Zi.apply(this,arguments)}function Qp(n,e){if(n==null)return{};var t={},s=Object.keys(n),r,o;for(o=0;o<s.length;o++)r=s[o],!(e.indexOf(r)>=0)&&(t[r]=n[r]);return t}function Xp(n){return!!(n.metaKey||n.altKey||n.ctrlKey||n.shiftKey)}function Zp(n,e){return n.button===0&&(!e||e==="_self")&&!Xp(n)}const em=["onClick","relative","reloadDocument","replace","state","target","to","preventScrollReset","viewTransition"],tm="6";try{window.__reactRouterVersion=tm}catch{}const nm="startTransition",Hl=Af[nm];function sm(n){let{basename:e,children:t,future:s,window:r}=n,o=k.useRef();o.current==null&&(o.current=op({window:r,v5Compat:!0}));let a=o.current,[c,u]=k.useState({action:a.action,location:a.location}),{v7_startTransition:f}=s||{},_=k.useCallback(m=>{f&&Hl?Hl(()=>u(m)):u(m)},[u,f]);return k.useLayoutEffect(()=>a.listen(_),[a,_]),k.useEffect(()=>Yp(s),[s]),k.createElement(Jp,{basename:e,children:t,location:c.location,navigationType:c.action,navigator:a,future:s})}const rm=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u",im=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,Xs=k.forwardRef(function(e,t){let{onClick:s,relative:r,reloadDocument:o,replace:a,state:c,target:u,to:f,preventScrollReset:_,viewTransition:m}=e,b=Qp(e,em),{basename:S}=k.useContext(Ot),T,R=!1;if(typeof f=="string"&&im.test(f)&&(T=f,rm))try{let M=new URL(window.location.href),D=f.startsWith("//")?new URL(M.protocol+f):new URL(f),L=Ao(D.pathname,S);D.origin===M.origin&&L!=null?f=L+D.search+D.hash:R=!0}catch{}let A=Op(f,{relative:r}),U=om(f,{replace:a,state:c,target:u,preventScrollReset:_,relative:r,viewTransition:m});function z(M){s&&s(M),M.defaultPrevented||U(M)}return k.createElement("a",Zi({},b,{href:T||A,onClick:R||o?s:z,ref:t,target:u}))});var ql;(function(n){n.UseScrollRestoration="useScrollRestoration",n.UseSubmit="useSubmit",n.UseSubmitFetcher="useSubmitFetcher",n.UseFetcher="useFetcher",n.useViewTransitionState="useViewTransitionState"})(ql||(ql={}));var Gl;(function(n){n.UseFetcher="useFetcher",n.UseFetchers="useFetchers",n.UseScrollRestoration="useScrollRestoration"})(Gl||(Gl={}));function om(n,e){let{target:t,replace:s,state:r,preventScrollReset:o,relative:a,viewTransition:c}=e===void 0?{}:e,u=vs(),f=Xt(),_=Nh(n,{relative:a});return k.useCallback(m=>{if(Zp(m,t)){m.preventDefault();let b=s!==void 0?s:pr(f)===pr(_);u(n,{replace:b,state:r,preventScrollReset:o,relative:a,viewTransition:c})}},[f,u,_,s,r,t,n,o,a,c])}var Kl={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jh={NODE_ADMIN:!1,SDK_VERSION:"${JSCORE_VERSION}"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const P=function(n,e){if(!n)throw Cn(e)},Cn=function(n){return new Error("Firebase Database ("+jh.SDK_VERSION+") INTERNAL ASSERT FAILED: "+n)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Oh=function(n){const e=[];let t=0;for(let s=0;s<n.length;s++){let r=n.charCodeAt(s);r<128?e[t++]=r:r<2048?(e[t++]=r>>6|192,e[t++]=r&63|128):(r&64512)===55296&&s+1<n.length&&(n.charCodeAt(s+1)&64512)===56320?(r=65536+((r&1023)<<10)+(n.charCodeAt(++s)&1023),e[t++]=r>>18|240,e[t++]=r>>12&63|128,e[t++]=r>>6&63|128,e[t++]=r&63|128):(e[t++]=r>>12|224,e[t++]=r>>6&63|128,e[t++]=r&63|128)}return e},am=function(n){const e=[];let t=0,s=0;for(;t<n.length;){const r=n[t++];if(r<128)e[s++]=String.fromCharCode(r);else if(r>191&&r<224){const o=n[t++];e[s++]=String.fromCharCode((r&31)<<6|o&63)}else if(r>239&&r<365){const o=n[t++],a=n[t++],c=n[t++],u=((r&7)<<18|(o&63)<<12|(a&63)<<6|c&63)-65536;e[s++]=String.fromCharCode(55296+(u>>10)),e[s++]=String.fromCharCode(56320+(u&1023))}else{const o=n[t++],a=n[t++];e[s++]=String.fromCharCode((r&15)<<12|(o&63)<<6|a&63)}}return e.join("")},Oo={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let r=0;r<n.length;r+=3){const o=n[r],a=r+1<n.length,c=a?n[r+1]:0,u=r+2<n.length,f=u?n[r+2]:0,_=o>>2,m=(o&3)<<4|c>>4;let b=(c&15)<<2|f>>6,S=f&63;u||(S=64,a||(b=64)),s.push(t[_],t[m],t[b],t[S])}return s.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Oh(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):am(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let r=0;r<n.length;){const o=t[n.charAt(r++)],c=r<n.length?t[n.charAt(r)]:0;++r;const f=r<n.length?t[n.charAt(r)]:64;++r;const m=r<n.length?t[n.charAt(r)]:64;if(++r,o==null||c==null||f==null||m==null)throw new lm;const b=o<<2|c>>4;if(s.push(b),f!==64){const S=c<<4&240|f>>2;if(s.push(S),m!==64){const T=f<<6&192|m;s.push(T)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class lm extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Dh=function(n){const e=Oh(n);return Oo.encodeByteArray(e,!0)},mr=function(n){return Dh(n).replace(/\./g,"")},gr=function(n){try{return Oo.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cm(n){return Lh(void 0,n)}function Lh(n,e){if(!(e instanceof Object))return e;switch(e.constructor){case Date:const t=e;return new Date(t.getTime());case Object:n===void 0&&(n={});break;case Array:n=[];break;default:return e}for(const t in e)!e.hasOwnProperty(t)||!hm(t)||(n[t]=Lh(n[t],e[t]));return n}function hm(n){return n!=="__proto__"}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function um(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dm=()=>um().__FIREBASE_DEFAULTS__,fm=()=>{if(typeof process>"u"||typeof Kl>"u")return;const n=Kl.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},pm=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&gr(n[1]);return e&&JSON.parse(e)},Do=()=>{try{return dm()||fm()||pm()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Mh=n=>{var e,t;return(t=(e=Do())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},Uh=n=>{const e=Mh(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const s=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),s]:[e.substring(0,t),s]},Fh=()=>{var n;return(n=Do())===null||n===void 0?void 0:n.config},zh=n=>{var e;return(e=Do())===null||e===void 0?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tn{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,s)=>{t?this.reject(t):this.resolve(s),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,s))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bh(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},s=e||"demo-project",r=n.iat||0,o=n.sub||n.user_id;if(!o)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a=Object.assign({iss:`https://securetoken.google.com/${s}`,aud:s,iat:r,exp:r+3600,auth_time:r,sub:o,user_id:o,firebase:{sign_in_provider:"custom",identities:{}}},n);return[mr(JSON.stringify(t)),mr(JSON.stringify(a)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oe(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Lo(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Oe())}function mm(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function gm(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Wh(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function _m(){const n=Oe();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function ym(){return jh.NODE_ADMIN===!0}function vm(){try{return typeof indexedDB=="object"}catch{return!1}}function xm(){return new Promise((n,e)=>{try{let t=!0;const s="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(s);r.onsuccess=()=>{r.result.close(),t||self.indexedDB.deleteDatabase(s),n(!0)},r.onupgradeneeded=()=>{t=!1},r.onerror=()=>{var o;e(((o=r.error)===null||o===void 0?void 0:o.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bm="FirebaseError";class pt extends Error{constructor(e,t,s){super(t),this.code=e,this.customData=s,this.name=bm,Object.setPrototypeOf(this,pt.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,xs.prototype.create)}}class xs{constructor(e,t,s){this.service=e,this.serviceName=t,this.errors=s}create(e,...t){const s=t[0]||{},r=`${this.service}/${e}`,o=this.errors[e],a=o?wm(o,s):"Error",c=`${this.serviceName}: ${a} (${r}).`;return new pt(r,c,s)}}function wm(n,e){return n.replace(Em,(t,s)=>{const r=e[s];return r!=null?String(r):`<${s}?>`})}const Em=/\{\$([^}]+)}/g;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ls(n){return JSON.parse(n)}function ge(n){return JSON.stringify(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vh=function(n){let e={},t={},s={},r="";try{const o=n.split(".");e=ls(gr(o[0])||""),t=ls(gr(o[1])||""),r=o[2],s=t.d||{},delete t.d}catch{}return{header:e,claims:t,data:s,signature:r}},Im=function(n){const e=Vh(n),t=e.claims;return!!t&&typeof t=="object"&&t.hasOwnProperty("iat")},Cm=function(n){const e=Vh(n).claims;return typeof e=="object"&&e.admin===!0};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Je(n,e){return Object.prototype.hasOwnProperty.call(n,e)}function $t(n,e){if(Object.prototype.hasOwnProperty.call(n,e))return n[e]}function eo(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function _r(n,e,t){const s={};for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&(s[r]=e.call(t,n[r],r,n));return s}function yr(n,e){if(n===e)return!0;const t=Object.keys(n),s=Object.keys(e);for(const r of t){if(!s.includes(r))return!1;const o=n[r],a=e[r];if(Yl(o)&&Yl(a)){if(!yr(o,a))return!1}else if(o!==a)return!1}for(const r of s)if(!t.includes(r))return!1;return!0}function Yl(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kn(n){const e=[];for(const[t,s]of Object.entries(n))Array.isArray(s)?s.forEach(r=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(s));return e.length?"&"+e.join("&"):""}function Jn(n){const e={};return n.replace(/^\?/,"").split("&").forEach(s=>{if(s){const[r,o]=s.split("=");e[decodeURIComponent(r)]=decodeURIComponent(o)}}),e}function Qn(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tm{constructor(){this.chain_=[],this.buf_=[],this.W_=[],this.pad_=[],this.inbuf_=0,this.total_=0,this.blockSize=512/8,this.pad_[0]=128;for(let e=1;e<this.blockSize;++e)this.pad_[e]=0;this.reset()}reset(){this.chain_[0]=1732584193,this.chain_[1]=4023233417,this.chain_[2]=2562383102,this.chain_[3]=271733878,this.chain_[4]=3285377520,this.inbuf_=0,this.total_=0}compress_(e,t){t||(t=0);const s=this.W_;if(typeof e=="string")for(let m=0;m<16;m++)s[m]=e.charCodeAt(t)<<24|e.charCodeAt(t+1)<<16|e.charCodeAt(t+2)<<8|e.charCodeAt(t+3),t+=4;else for(let m=0;m<16;m++)s[m]=e[t]<<24|e[t+1]<<16|e[t+2]<<8|e[t+3],t+=4;for(let m=16;m<80;m++){const b=s[m-3]^s[m-8]^s[m-14]^s[m-16];s[m]=(b<<1|b>>>31)&4294967295}let r=this.chain_[0],o=this.chain_[1],a=this.chain_[2],c=this.chain_[3],u=this.chain_[4],f,_;for(let m=0;m<80;m++){m<40?m<20?(f=c^o&(a^c),_=1518500249):(f=o^a^c,_=1859775393):m<60?(f=o&a|c&(o|a),_=2400959708):(f=o^a^c,_=3395469782);const b=(r<<5|r>>>27)+f+u+_+s[m]&4294967295;u=c,c=a,a=(o<<30|o>>>2)&4294967295,o=r,r=b}this.chain_[0]=this.chain_[0]+r&4294967295,this.chain_[1]=this.chain_[1]+o&4294967295,this.chain_[2]=this.chain_[2]+a&4294967295,this.chain_[3]=this.chain_[3]+c&4294967295,this.chain_[4]=this.chain_[4]+u&4294967295}update(e,t){if(e==null)return;t===void 0&&(t=e.length);const s=t-this.blockSize;let r=0;const o=this.buf_;let a=this.inbuf_;for(;r<t;){if(a===0)for(;r<=s;)this.compress_(e,r),r+=this.blockSize;if(typeof e=="string"){for(;r<t;)if(o[a]=e.charCodeAt(r),++a,++r,a===this.blockSize){this.compress_(o),a=0;break}}else for(;r<t;)if(o[a]=e[r],++a,++r,a===this.blockSize){this.compress_(o),a=0;break}}this.inbuf_=a,this.total_+=t}digest(){const e=[];let t=this.total_*8;this.inbuf_<56?this.update(this.pad_,56-this.inbuf_):this.update(this.pad_,this.blockSize-(this.inbuf_-56));for(let r=this.blockSize-1;r>=56;r--)this.buf_[r]=t&255,t/=256;this.compress_(this.buf_);let s=0;for(let r=0;r<5;r++)for(let o=24;o>=0;o-=8)e[s]=this.chain_[r]>>o&255,++s;return e}}function km(n,e){const t=new Sm(n,e);return t.subscribe.bind(t)}class Sm{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(s=>{this.error(s)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,s){let r;if(e===void 0&&t===void 0&&s===void 0)throw new Error("Missing Observer.");Nm(e,["next","error","complete"])?r=e:r={next:e,error:t,complete:s},r.next===void 0&&(r.next=ji),r.error===void 0&&(r.error=ji),r.complete===void 0&&(r.complete=ji);const o=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),o}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(s){typeof console<"u"&&console.error&&console.error(s)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Nm(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function ji(){}function Wr(n,e){return`${n} failed: ${e} argument `}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Am=function(n){const e=[];let t=0;for(let s=0;s<n.length;s++){let r=n.charCodeAt(s);if(r>=55296&&r<=56319){const o=r-55296;s++,P(s<n.length,"Surrogate pair missing trail surrogate.");const a=n.charCodeAt(s)-56320;r=65536+(o<<10)+a}r<128?e[t++]=r:r<2048?(e[t++]=r>>6|192,e[t++]=r&63|128):r<65536?(e[t++]=r>>12|224,e[t++]=r>>6&63|128,e[t++]=r&63|128):(e[t++]=r>>18|240,e[t++]=r>>12&63|128,e[t++]=r>>6&63|128,e[t++]=r&63|128)}return e},Vr=function(n){let e=0;for(let t=0;t<n.length;t++){const s=n.charCodeAt(t);s<128?e++:s<2048?e+=2:s>=55296&&s<=56319?(e+=4,t++):e+=3}return e};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xe(n){return n&&n._delegate?n._delegate:n}class At{constructor(e,t,s){this.name=e,this.instanceFactory=t,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zt="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rm{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const s=new Tn;if(this.instancesDeferred.set(t,s),this.isInitialized(t)||this.shouldAutoInitialize())try{const r=this.getOrInitializeService({instanceIdentifier:t});r&&s.resolve(r)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const s=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(s)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:s})}catch(o){if(r)return null;throw o}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(jm(e))try{this.getOrInitializeService({instanceIdentifier:zt})}catch{}for(const[t,s]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(t);try{const o=this.getOrInitializeService({instanceIdentifier:r});s.resolve(o)}catch{}}}}clearInstance(e=zt){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=zt){return this.instances.has(e)}getOptions(e=zt){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,s=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:s,options:t});for(const[o,a]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(o);s===c&&a.resolve(r)}return r}onInit(e,t){var s;const r=this.normalizeInstanceIdentifier(t),o=(s=this.onInitCallbacks.get(r))!==null&&s!==void 0?s:new Set;o.add(e),this.onInitCallbacks.set(r,o);const a=this.instances.get(r);return a&&e(a,r),()=>{o.delete(e)}}invokeOnInitCallbacks(e,t){const s=this.onInitCallbacks.get(t);if(s)for(const r of s)try{r(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let s=this.instances.get(e);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:Pm(e),options:t}),this.instances.set(e,s),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(s,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,s)}catch{}return s||null}normalizeInstanceIdentifier(e=zt){return this.component?this.component.multipleInstances?e:zt:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Pm(n){return n===zt?void 0:n}function jm(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Om{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Rm(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var X;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(X||(X={}));const Dm={debug:X.DEBUG,verbose:X.VERBOSE,info:X.INFO,warn:X.WARN,error:X.ERROR,silent:X.SILENT},Lm=X.INFO,Mm={[X.DEBUG]:"log",[X.VERBOSE]:"log",[X.INFO]:"info",[X.WARN]:"warn",[X.ERROR]:"error"},Um=(n,e,...t)=>{if(e<n.logLevel)return;const s=new Date().toISOString(),r=Mm[e];if(r)console[r](`[${s}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class $r{constructor(e){this.name=e,this._logLevel=Lm,this._logHandler=Um,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in X))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Dm[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,X.DEBUG,...e),this._logHandler(this,X.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,X.VERBOSE,...e),this._logHandler(this,X.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,X.INFO,...e),this._logHandler(this,X.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,X.WARN,...e),this._logHandler(this,X.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,X.ERROR,...e),this._logHandler(this,X.ERROR,...e)}}const Fm=(n,e)=>e.some(t=>n instanceof t);let Jl,Ql;function zm(){return Jl||(Jl=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Bm(){return Ql||(Ql=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const $h=new WeakMap,to=new WeakMap,Hh=new WeakMap,Oi=new WeakMap,Mo=new WeakMap;function Wm(n){const e=new Promise((t,s)=>{const r=()=>{n.removeEventListener("success",o),n.removeEventListener("error",a)},o=()=>{t(Tt(n.result)),r()},a=()=>{s(n.error),r()};n.addEventListener("success",o),n.addEventListener("error",a)});return e.then(t=>{t instanceof IDBCursor&&$h.set(t,n)}).catch(()=>{}),Mo.set(e,n),e}function Vm(n){if(to.has(n))return;const e=new Promise((t,s)=>{const r=()=>{n.removeEventListener("complete",o),n.removeEventListener("error",a),n.removeEventListener("abort",a)},o=()=>{t(),r()},a=()=>{s(n.error||new DOMException("AbortError","AbortError")),r()};n.addEventListener("complete",o),n.addEventListener("error",a),n.addEventListener("abort",a)});to.set(n,e)}let no={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return to.get(n);if(e==="objectStoreNames")return n.objectStoreNames||Hh.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return Tt(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function $m(n){no=n(no)}function Hm(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const s=n.call(Di(this),e,...t);return Hh.set(s,e.sort?e.sort():[e]),Tt(s)}:Bm().includes(n)?function(...e){return n.apply(Di(this),e),Tt($h.get(this))}:function(...e){return Tt(n.apply(Di(this),e))}}function qm(n){return typeof n=="function"?Hm(n):(n instanceof IDBTransaction&&Vm(n),Fm(n,zm())?new Proxy(n,no):n)}function Tt(n){if(n instanceof IDBRequest)return Wm(n);if(Oi.has(n))return Oi.get(n);const e=qm(n);return e!==n&&(Oi.set(n,e),Mo.set(e,n)),e}const Di=n=>Mo.get(n);function Gm(n,e,{blocked:t,upgrade:s,blocking:r,terminated:o}={}){const a=indexedDB.open(n,e),c=Tt(a);return s&&a.addEventListener("upgradeneeded",u=>{s(Tt(a.result),u.oldVersion,u.newVersion,Tt(a.transaction),u)}),t&&a.addEventListener("blocked",u=>t(u.oldVersion,u.newVersion,u)),c.then(u=>{o&&u.addEventListener("close",()=>o()),r&&u.addEventListener("versionchange",f=>r(f.oldVersion,f.newVersion,f))}).catch(()=>{}),c}const Km=["get","getKey","getAll","getAllKeys","count"],Ym=["put","add","delete","clear"],Li=new Map;function Xl(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(Li.get(e))return Li.get(e);const t=e.replace(/FromIndex$/,""),s=e!==t,r=Ym.includes(t);if(!(t in(s?IDBIndex:IDBObjectStore).prototype)||!(r||Km.includes(t)))return;const o=async function(a,...c){const u=this.transaction(a,r?"readwrite":"readonly");let f=u.store;return s&&(f=f.index(c.shift())),(await Promise.all([f[t](...c),r&&u.done]))[0]};return Li.set(e,o),o}$m(n=>({...n,get:(e,t,s)=>Xl(e,t)||n.get(e,t,s),has:(e,t)=>!!Xl(e,t)||n.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jm{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(Qm(t)){const s=t.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(t=>t).join(" ")}}function Qm(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const so="@firebase/app",Zl="0.10.13";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ht=new $r("@firebase/app"),Xm="@firebase/app-compat",Zm="@firebase/analytics-compat",eg="@firebase/analytics",tg="@firebase/app-check-compat",ng="@firebase/app-check",sg="@firebase/auth",rg="@firebase/auth-compat",ig="@firebase/database",og="@firebase/data-connect",ag="@firebase/database-compat",lg="@firebase/functions",cg="@firebase/functions-compat",hg="@firebase/installations",ug="@firebase/installations-compat",dg="@firebase/messaging",fg="@firebase/messaging-compat",pg="@firebase/performance",mg="@firebase/performance-compat",gg="@firebase/remote-config",_g="@firebase/remote-config-compat",yg="@firebase/storage",vg="@firebase/storage-compat",xg="@firebase/firestore",bg="@firebase/vertexai-preview",wg="@firebase/firestore-compat",Eg="firebase",Ig="10.14.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ro="[DEFAULT]",Cg={[so]:"fire-core",[Xm]:"fire-core-compat",[eg]:"fire-analytics",[Zm]:"fire-analytics-compat",[ng]:"fire-app-check",[tg]:"fire-app-check-compat",[sg]:"fire-auth",[rg]:"fire-auth-compat",[ig]:"fire-rtdb",[og]:"fire-data-connect",[ag]:"fire-rtdb-compat",[lg]:"fire-fn",[cg]:"fire-fn-compat",[hg]:"fire-iid",[ug]:"fire-iid-compat",[dg]:"fire-fcm",[fg]:"fire-fcm-compat",[pg]:"fire-perf",[mg]:"fire-perf-compat",[gg]:"fire-rc",[_g]:"fire-rc-compat",[yg]:"fire-gcs",[vg]:"fire-gcs-compat",[xg]:"fire-fst",[wg]:"fire-fst-compat",[bg]:"fire-vertex","fire-js":"fire-js",[Eg]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vr=new Map,Tg=new Map,io=new Map;function ec(n,e){try{n.container.addComponent(e)}catch(t){ht.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Ht(n){const e=n.name;if(io.has(e))return ht.debug(`There were multiple attempts to register component ${e}.`),!1;io.set(e,n);for(const t of vr.values())ec(t,n);for(const t of Tg.values())ec(t,n);return!0}function Hr(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function He(n){return n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kg={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},kt=new xs("app","Firebase",kg);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sg{constructor(e,t,s){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new At("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw kt.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zt=Ig;function qh(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const s=Object.assign({name:ro,automaticDataCollectionEnabled:!1},e),r=s.name;if(typeof r!="string"||!r)throw kt.create("bad-app-name",{appName:String(r)});if(t||(t=Fh()),!t)throw kt.create("no-options");const o=vr.get(r);if(o){if(yr(t,o.options)&&yr(s,o.config))return o;throw kt.create("duplicate-app",{appName:r})}const a=new Om(r);for(const u of io.values())a.addComponent(u);const c=new Sg(t,s,a);return vr.set(r,c),c}function Uo(n=ro){const e=vr.get(n);if(!e&&n===ro&&Fh())return qh();if(!e)throw kt.create("no-app",{appName:n});return e}function Xe(n,e,t){var s;let r=(s=Cg[n])!==null&&s!==void 0?s:n;t&&(r+=`-${t}`);const o=r.match(/\s|\//),a=e.match(/\s|\//);if(o||a){const c=[`Unable to register library "${r}" with version "${e}":`];o&&c.push(`library name "${r}" contains illegal characters (whitespace or "/")`),o&&a&&c.push("and"),a&&c.push(`version name "${e}" contains illegal characters (whitespace or "/")`),ht.warn(c.join(" "));return}Ht(new At(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ng="firebase-heartbeat-database",Ag=1,cs="firebase-heartbeat-store";let Mi=null;function Gh(){return Mi||(Mi=Gm(Ng,Ag,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(cs)}catch(t){console.warn(t)}}}}).catch(n=>{throw kt.create("idb-open",{originalErrorMessage:n.message})})),Mi}async function Rg(n){try{const t=(await Gh()).transaction(cs),s=await t.objectStore(cs).get(Kh(n));return await t.done,s}catch(e){if(e instanceof pt)ht.warn(e.message);else{const t=kt.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});ht.warn(t.message)}}}async function tc(n,e){try{const s=(await Gh()).transaction(cs,"readwrite");await s.objectStore(cs).put(e,Kh(n)),await s.done}catch(t){if(t instanceof pt)ht.warn(t.message);else{const s=kt.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});ht.warn(s.message)}}}function Kh(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pg=1024,jg=30*24*60*60*1e3;class Og{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new Lg(t),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}async triggerHeartbeat(){var e,t;try{const r=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),o=nc();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===o||this._heartbeatsCache.heartbeats.some(a=>a.date===o)?void 0:(this._heartbeatsCache.heartbeats.push({date:o,agent:r}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{const c=new Date(a.date).valueOf();return Date.now()-c<=jg}),this._storage.overwrite(this._heartbeatsCache))}catch(s){ht.warn(s)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=nc(),{heartbeatsToSend:s,unsentEntries:r}=Dg(this._heartbeatsCache.heartbeats),o=mr(JSON.stringify({version:2,heartbeats:s}));return this._heartbeatsCache.lastSentHeartbeatDate=t,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),o}catch(t){return ht.warn(t),""}}}function nc(){return new Date().toISOString().substring(0,10)}function Dg(n,e=Pg){const t=[];let s=n.slice();for(const r of n){const o=t.find(a=>a.agent===r.agent);if(o){if(o.dates.push(r.date),sc(t)>e){o.dates.pop();break}}else if(t.push({agent:r.agent,dates:[r.date]}),sc(t)>e){t.pop();break}s=s.slice(1)}return{heartbeatsToSend:t,unsentEntries:s}}class Lg{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return vm()?xm().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Rg(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const r=await this.read();return tc(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const r=await this.read();return tc(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function sc(n){return mr(JSON.stringify({version:2,heartbeats:n})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mg(n){Ht(new At("platform-logger",e=>new Jm(e),"PRIVATE")),Ht(new At("heartbeat",e=>new Og(e),"PRIVATE")),Xe(so,Zl,n),Xe(so,Zl,"esm2017"),Xe("fire-js","")}Mg("");var Ug="firebase",Fg="10.14.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Xe(Ug,Fg,"app");function Fo(n,e){var t={};for(var s in n)Object.prototype.hasOwnProperty.call(n,s)&&e.indexOf(s)<0&&(t[s]=n[s]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var r=0,s=Object.getOwnPropertySymbols(n);r<s.length;r++)e.indexOf(s[r])<0&&Object.prototype.propertyIsEnumerable.call(n,s[r])&&(t[s[r]]=n[s[r]]);return t}function Yh(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const zg=Yh,Jh=new xs("auth","Firebase",Yh());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xr=new $r("@firebase/auth");function Bg(n,...e){xr.logLevel<=X.WARN&&xr.warn(`Auth (${Zt}): ${n}`,...e)}function ir(n,...e){xr.logLevel<=X.ERROR&&xr.error(`Auth (${Zt}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function We(n,...e){throw Bo(n,...e)}function Ke(n,...e){return Bo(n,...e)}function zo(n,e,t){const s=Object.assign(Object.assign({},zg()),{[e]:t});return new xs("auth","Firebase",s).create(e,{appName:n.name})}function lt(n){return zo(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Wg(n,e,t){const s=t;if(!(e instanceof s))throw s.name!==e.constructor.name&&We(n,"argument-error"),zo(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function Bo(n,...e){if(typeof n!="string"){const t=e[0],s=[...e.slice(1)];return s[0]&&(s[0].appName=n.name),n._errorFactory.create(t,...s)}return Jh.create(n,...e)}function B(n,e,...t){if(!n)throw Bo(e,...t)}function rt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw ir(e),new Error(e)}function ut(n,e){n||rt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oo(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function Vg(){return rc()==="http:"||rc()==="https:"}function rc(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $g(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Vg()||gm()||"connection"in navigator)?navigator.onLine:!0}function Hg(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bs{constructor(e,t){this.shortDelay=e,this.longDelay=t,ut(t>e,"Short delay should be less than long delay!"),this.isMobile=Lo()||Wh()}get(){return $g()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wo(n,e){ut(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qh{static initialize(e,t,s){this.fetchImpl=e,t&&(this.headersImpl=t),s&&(this.responseImpl=s)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;rt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;rt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;rt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qg={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gg=new bs(3e4,6e4);function Dt(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function mt(n,e,t,s,r={}){return Xh(n,r,async()=>{let o={},a={};s&&(e==="GET"?a=s:o={body:JSON.stringify(s)});const c=kn(Object.assign({key:n.config.apiKey},a)).slice(1),u=await n._getAdditionalHeaders();u["Content-Type"]="application/json",n.languageCode&&(u["X-Firebase-Locale"]=n.languageCode);const f=Object.assign({method:e,headers:u},o);return mm()||(f.referrerPolicy="no-referrer"),Qh.fetch()(Zh(n,n.config.apiHost,t,c),f)})}async function Xh(n,e,t){n._canInitEmulator=!1;const s=Object.assign(Object.assign({},qg),e);try{const r=new Yg(n),o=await Promise.race([t(),r.promise]);r.clearNetworkTimeout();const a=await o.json();if("needConfirmation"in a)throw Zs(n,"account-exists-with-different-credential",a);if(o.ok&&!("errorMessage"in a))return a;{const c=o.ok?a.errorMessage:a.error.message,[u,f]=c.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw Zs(n,"credential-already-in-use",a);if(u==="EMAIL_EXISTS")throw Zs(n,"email-already-in-use",a);if(u==="USER_DISABLED")throw Zs(n,"user-disabled",a);const _=s[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(f)throw zo(n,_,f);We(n,_)}}catch(r){if(r instanceof pt)throw r;We(n,"network-request-failed",{message:String(r)})}}async function ws(n,e,t,s,r={}){const o=await mt(n,e,t,s,r);return"mfaPendingCredential"in o&&We(n,"multi-factor-auth-required",{_serverResponse:o}),o}function Zh(n,e,t,s){const r=`${e}${t}?${s}`;return n.config.emulator?Wo(n.config,r):`${n.config.apiScheme}://${r}`}function Kg(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class Yg{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,s)=>{this.timer=setTimeout(()=>s(Ke(this.auth,"network-request-failed")),Gg.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function Zs(n,e,t){const s={appName:n.name};t.email&&(s.email=t.email),t.phoneNumber&&(s.phoneNumber=t.phoneNumber);const r=Ke(n,e,s);return r.customData._tokenResponse=t,r}function ic(n){return n!==void 0&&n.enterprise!==void 0}class Jg{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return Kg(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}}async function Qg(n,e){return mt(n,"GET","/v2/recaptchaConfig",Dt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Xg(n,e){return mt(n,"POST","/v1/accounts:delete",e)}async function eu(n,e){return mt(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xn(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Zg(n,e=!1){const t=xe(n),s=await t.getIdToken(e),r=Vo(s);B(r&&r.exp&&r.auth_time&&r.iat,t.auth,"internal-error");const o=typeof r.firebase=="object"?r.firebase:void 0,a=o==null?void 0:o.sign_in_provider;return{claims:r,token:s,authTime:Xn(Ui(r.auth_time)),issuedAtTime:Xn(Ui(r.iat)),expirationTime:Xn(Ui(r.exp)),signInProvider:a||null,signInSecondFactor:(o==null?void 0:o.sign_in_second_factor)||null}}function Ui(n){return Number(n)*1e3}function Vo(n){const[e,t,s]=n.split(".");if(e===void 0||t===void 0||s===void 0)return ir("JWT malformed, contained fewer than 3 sections"),null;try{const r=gr(t);return r?JSON.parse(r):(ir("Failed to decode base64 JWT payload"),null)}catch(r){return ir("Caught error parsing JWT payload as JSON",r==null?void 0:r.toString()),null}}function oc(n){const e=Vo(n);return B(e,"internal-error"),B(typeof e.exp<"u","internal-error"),B(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function gn(n,e,t=!1){if(t)return e;try{return await e}catch(s){throw s instanceof pt&&e_(s)&&n.auth.currentUser===n&&await n.auth.signOut(),s}}function e_({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class t_{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const s=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),s}else{this.errorBackoff=3e4;const r=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ao{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Xn(this.lastLoginAt),this.creationTime=Xn(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function br(n){var e;const t=n.auth,s=await n.getIdToken(),r=await gn(n,eu(t,{idToken:s}));B(r==null?void 0:r.users.length,t,"internal-error");const o=r.users[0];n._notifyReloadListener(o);const a=!((e=o.providerUserInfo)===null||e===void 0)&&e.length?tu(o.providerUserInfo):[],c=s_(n.providerData,a),u=n.isAnonymous,f=!(n.email&&o.passwordHash)&&!(c!=null&&c.length),_=u?f:!1,m={uid:o.localId,displayName:o.displayName||null,photoURL:o.photoUrl||null,email:o.email||null,emailVerified:o.emailVerified||!1,phoneNumber:o.phoneNumber||null,tenantId:o.tenantId||null,providerData:c,metadata:new ao(o.createdAt,o.lastLoginAt),isAnonymous:_};Object.assign(n,m)}async function n_(n){const e=xe(n);await br(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function s_(n,e){return[...n.filter(s=>!e.some(r=>r.providerId===s.providerId)),...e]}function tu(n){return n.map(e=>{var{providerId:t}=e,s=Fo(e,["providerId"]);return{providerId:t,uid:s.rawId||"",displayName:s.displayName||null,email:s.email||null,phoneNumber:s.phoneNumber||null,photoURL:s.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function r_(n,e){const t=await Xh(n,{},async()=>{const s=kn({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:o}=n.config,a=Zh(n,r,"/v1/token",`key=${o}`),c=await n._getAdditionalHeaders();return c["Content-Type"]="application/x-www-form-urlencoded",Qh.fetch()(a,{method:"POST",headers:c,body:s})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function i_(n,e){return mt(n,"POST","/v2/accounts:revokeToken",Dt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class un{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){B(e.idToken,"internal-error"),B(typeof e.idToken<"u","internal-error"),B(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):oc(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){B(e.length!==0,"internal-error");const t=oc(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(B(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:s,refreshToken:r,expiresIn:o}=await r_(e,t);this.updateTokensAndExpiration(s,r,Number(o))}updateTokensAndExpiration(e,t,s){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+s*1e3}static fromJSON(e,t){const{refreshToken:s,accessToken:r,expirationTime:o}=t,a=new un;return s&&(B(typeof s=="string","internal-error",{appName:e}),a.refreshToken=s),r&&(B(typeof r=="string","internal-error",{appName:e}),a.accessToken=r),o&&(B(typeof o=="number","internal-error",{appName:e}),a.expirationTime=o),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new un,this.toJSON())}_performRefresh(){return rt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vt(n,e){B(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class it{constructor(e){var{uid:t,auth:s,stsTokenManager:r}=e,o=Fo(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new t_(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=s,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=o.displayName||null,this.email=o.email||null,this.emailVerified=o.emailVerified||!1,this.phoneNumber=o.phoneNumber||null,this.photoURL=o.photoURL||null,this.isAnonymous=o.isAnonymous||!1,this.tenantId=o.tenantId||null,this.providerData=o.providerData?[...o.providerData]:[],this.metadata=new ao(o.createdAt||void 0,o.lastLoginAt||void 0)}async getIdToken(e){const t=await gn(this,this.stsTokenManager.getToken(this.auth,e));return B(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return Zg(this,e)}reload(){return n_(this)}_assign(e){this!==e&&(B(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new it(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){B(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let s=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),s=!0),t&&await br(this),await this.auth._persistUserIfCurrent(this),s&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(He(this.auth.app))return Promise.reject(lt(this.auth));const e=await this.getIdToken();return await gn(this,Xg(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var s,r,o,a,c,u,f,_;const m=(s=t.displayName)!==null&&s!==void 0?s:void 0,b=(r=t.email)!==null&&r!==void 0?r:void 0,S=(o=t.phoneNumber)!==null&&o!==void 0?o:void 0,T=(a=t.photoURL)!==null&&a!==void 0?a:void 0,R=(c=t.tenantId)!==null&&c!==void 0?c:void 0,A=(u=t._redirectEventId)!==null&&u!==void 0?u:void 0,U=(f=t.createdAt)!==null&&f!==void 0?f:void 0,z=(_=t.lastLoginAt)!==null&&_!==void 0?_:void 0,{uid:M,emailVerified:D,isAnonymous:L,providerData:J,stsTokenManager:v}=t;B(M&&v,e,"internal-error");const y=un.fromJSON(this.name,v);B(typeof M=="string",e,"internal-error"),vt(m,e.name),vt(b,e.name),B(typeof D=="boolean",e,"internal-error"),B(typeof L=="boolean",e,"internal-error"),vt(S,e.name),vt(T,e.name),vt(R,e.name),vt(A,e.name),vt(U,e.name),vt(z,e.name);const x=new it({uid:M,auth:e,email:b,emailVerified:D,displayName:m,isAnonymous:L,photoURL:T,phoneNumber:S,tenantId:R,stsTokenManager:y,createdAt:U,lastLoginAt:z});return J&&Array.isArray(J)&&(x.providerData=J.map(w=>Object.assign({},w))),A&&(x._redirectEventId=A),x}static async _fromIdTokenResponse(e,t,s=!1){const r=new un;r.updateFromServerResponse(t);const o=new it({uid:t.localId,auth:e,stsTokenManager:r,isAnonymous:s});return await br(o),o}static async _fromGetAccountInfoResponse(e,t,s){const r=t.users[0];B(r.localId!==void 0,"internal-error");const o=r.providerUserInfo!==void 0?tu(r.providerUserInfo):[],a=!(r.email&&r.passwordHash)&&!(o!=null&&o.length),c=new un;c.updateFromIdToken(s);const u=new it({uid:r.localId,auth:e,stsTokenManager:c,isAnonymous:a}),f={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:o,metadata:new ao(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!(o!=null&&o.length)};return Object.assign(u,f),u}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ac=new Map;function ot(n){ut(n instanceof Function,"Expected a class definition");let e=ac.get(n);return e?(ut(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,ac.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nu{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}nu.type="NONE";const lc=nu;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function or(n,e,t){return`firebase:${n}:${e}:${t}`}class dn{constructor(e,t,s){this.persistence=e,this.auth=t,this.userKey=s;const{config:r,name:o}=this.auth;this.fullUserKey=or(this.userKey,r.apiKey,o),this.fullPersistenceKey=or("persistence",r.apiKey,o),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?it._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,s="authUser"){if(!t.length)return new dn(ot(lc),e,s);const r=(await Promise.all(t.map(async f=>{if(await f._isAvailable())return f}))).filter(f=>f);let o=r[0]||ot(lc);const a=or(s,e.config.apiKey,e.name);let c=null;for(const f of t)try{const _=await f._get(a);if(_){const m=it._fromJSON(e,_);f!==o&&(c=m),o=f;break}}catch{}const u=r.filter(f=>f._shouldAllowMigration);return!o._shouldAllowMigration||!u.length?new dn(o,e,s):(o=u[0],c&&await o._set(a,c.toJSON()),await Promise.all(t.map(async f=>{if(f!==o)try{await f._remove(a)}catch{}})),new dn(o,e,s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cc(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(ou(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(su(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(lu(e))return"Blackberry";if(cu(e))return"Webos";if(ru(e))return"Safari";if((e.includes("chrome/")||iu(e))&&!e.includes("edge/"))return"Chrome";if(au(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,s=n.match(t);if((s==null?void 0:s.length)===2)return s[1]}return"Other"}function su(n=Oe()){return/firefox\//i.test(n)}function ru(n=Oe()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function iu(n=Oe()){return/crios\//i.test(n)}function ou(n=Oe()){return/iemobile/i.test(n)}function au(n=Oe()){return/android/i.test(n)}function lu(n=Oe()){return/blackberry/i.test(n)}function cu(n=Oe()){return/webos/i.test(n)}function $o(n=Oe()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function o_(n=Oe()){var e;return $o(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function a_(){return _m()&&document.documentMode===10}function hu(n=Oe()){return $o(n)||au(n)||cu(n)||lu(n)||/windows phone/i.test(n)||ou(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uu(n,e=[]){let t;switch(n){case"Browser":t=cc(Oe());break;case"Worker":t=`${cc(Oe())}-${n}`;break;default:t=n}const s=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Zt}/${s}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class l_{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const s=o=>new Promise((a,c)=>{try{const u=e(o);a(u)}catch(u){c(u)}});s.onAbort=t,this.queue.push(s);const r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const s of this.queue)await s(e),s.onAbort&&t.push(s.onAbort)}catch(s){t.reverse();for(const r of t)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:s==null?void 0:s.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function c_(n,e={}){return mt(n,"GET","/v2/passwordPolicy",Dt(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const h_=6;class u_{constructor(e){var t,s,r,o;const a=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=a.minPasswordLength)!==null&&t!==void 0?t:h_,a.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=a.maxPasswordLength),a.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=a.containsLowercaseCharacter),a.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=a.containsUppercaseCharacter),a.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=a.containsNumericCharacter),a.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=a.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(r=(s=e.allowedNonAlphanumericCharacters)===null||s===void 0?void 0:s.join(""))!==null&&r!==void 0?r:"",this.forceUpgradeOnSignin=(o=e.forceUpgradeOnSignin)!==null&&o!==void 0?o:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,s,r,o,a,c;const u={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,u),this.validatePasswordCharacterOptions(e,u),u.isValid&&(u.isValid=(t=u.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),u.isValid&&(u.isValid=(s=u.meetsMaxPasswordLength)!==null&&s!==void 0?s:!0),u.isValid&&(u.isValid=(r=u.containsLowercaseLetter)!==null&&r!==void 0?r:!0),u.isValid&&(u.isValid=(o=u.containsUppercaseLetter)!==null&&o!==void 0?o:!0),u.isValid&&(u.isValid=(a=u.containsNumericCharacter)!==null&&a!==void 0?a:!0),u.isValid&&(u.isValid=(c=u.containsNonAlphanumericCharacter)!==null&&c!==void 0?c:!0),u}validatePasswordLengthOptions(e,t){const s=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;s&&(t.meetsMinPasswordLength=e.length>=s),r&&(t.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let s;for(let r=0;r<e.length;r++)s=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(t,s>="a"&&s<="z",s>="A"&&s<="Z",s>="0"&&s<="9",this.allowedNonAlphanumericCharacters.includes(s))}updatePasswordCharacterOptionsStatuses(e,t,s,r,o){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=s)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=o))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class d_{constructor(e,t,s,r){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=s,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new hc(this),this.idTokenSubscription=new hc(this),this.beforeStateQueue=new l_(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Jh,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=ot(t)),this._initializationPromise=this.queue(async()=>{var s,r;if(!this._deleted&&(this.persistenceManager=await dn.create(this,e),!this._deleted)){if(!((s=this._popupRedirectResolver)===null||s===void 0)&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((r=this.currentUser)===null||r===void 0?void 0:r.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await eu(this,{idToken:e}),s=await it._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(s)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(He(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(c,c))}):this.directlySetCurrentUser(null)}const s=await this.assertedPersistence.getCurrentUser();let r=s,o=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,c=r==null?void 0:r._redirectEventId,u=await this.tryRedirectSignIn(e);(!a||a===c)&&(u!=null&&u.user)&&(r=u.user,o=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(o)try{await this.beforeStateQueue.runMiddleware(r)}catch(a){r=s,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return B(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await br(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Hg()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(He(this.app))return Promise.reject(lt(this));const t=e?xe(e):null;return t&&B(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&B(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return He(this.app)?Promise.reject(lt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return He(this.app)?Promise.reject(lt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(ot(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await c_(this),t=new u_(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new xs("auth","Firebase",e())}onAuthStateChanged(e,t,s){return this.registerStateListener(this.authStateSubscription,e,t,s)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,s){return this.registerStateListener(this.idTokenSubscription,e,t,s)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const s=this.onAuthStateChanged(()=>{s(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),s={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(s.tenantId=this.tenantId),await i_(this,s)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const s=await this.getOrInitRedirectPersistenceManager(t);return e===null?s.removeCurrentUser():s.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&ot(e)||this._popupRedirectResolver;B(t,this,"argument-error"),this.redirectPersistenceManager=await dn.create(this,[ot(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,s;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((s=this.redirectUser)===null||s===void 0?void 0:s._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const s=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==s&&(this.lastNotifiedUid=s,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,s,r){if(this._deleted)return()=>{};const o=typeof t=="function"?t:t.next.bind(t);let a=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(B(c,this,"internal-error"),c.then(()=>{a||o(this.currentUser)}),typeof t=="function"){const u=e.addObserver(t,s,r);return()=>{a=!0,u()}}else{const u=e.addObserver(t);return()=>{a=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return B(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=uu(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const s=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());s&&(t["X-Firebase-Client"]=s);const r=await this._getAppCheckToken();return r&&(t["X-Firebase-AppCheck"]=r),t}async _getAppCheckToken(){var e;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&Bg(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function Lt(n){return xe(n)}class hc{constructor(e){this.auth=e,this.observer=null,this.addObserver=km(t=>this.observer=t)}get next(){return B(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let qr={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function f_(n){qr=n}function du(n){return qr.loadJS(n)}function p_(){return qr.recaptchaEnterpriseScript}function m_(){return qr.gapiScript}function g_(n){return`__${n}${Math.floor(Math.random()*1e6)}`}const __="recaptcha-enterprise",y_="NO_RECAPTCHA";class v_{constructor(e){this.type=__,this.auth=Lt(e)}async verify(e="verify",t=!1){async function s(o){if(!t){if(o.tenantId==null&&o._agentRecaptchaConfig!=null)return o._agentRecaptchaConfig.siteKey;if(o.tenantId!=null&&o._tenantRecaptchaConfigs[o.tenantId]!==void 0)return o._tenantRecaptchaConfigs[o.tenantId].siteKey}return new Promise(async(a,c)=>{Qg(o,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(u=>{if(u.recaptchaKey===void 0)c(new Error("recaptcha Enterprise site key undefined"));else{const f=new Jg(u);return o.tenantId==null?o._agentRecaptchaConfig=f:o._tenantRecaptchaConfigs[o.tenantId]=f,a(f.siteKey)}}).catch(u=>{c(u)})})}function r(o,a,c){const u=window.grecaptcha;ic(u)?u.enterprise.ready(()=>{u.enterprise.execute(o,{action:e}).then(f=>{a(f)}).catch(()=>{a(y_)})}):c(Error("No reCAPTCHA enterprise script loaded."))}return new Promise((o,a)=>{s(this.auth).then(c=>{if(!t&&ic(window.grecaptcha))r(c,o,a);else{if(typeof window>"u"){a(new Error("RecaptchaVerifier is only supported in browser"));return}let u=p_();u.length!==0&&(u+=c),du(u).then(()=>{r(c,o,a)}).catch(f=>{a(f)})}}).catch(c=>{a(c)})})}}async function uc(n,e,t,s=!1){const r=new v_(n);let o;try{o=await r.verify(t)}catch{o=await r.verify(t,!0)}const a=Object.assign({},e);return s?Object.assign(a,{captchaResp:o}):Object.assign(a,{captchaResponse:o}),Object.assign(a,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(a,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),a}async function lo(n,e,t,s){var r;if(!((r=n._getRecaptchaConfig())===null||r===void 0)&&r.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const o=await uc(n,e,t,t==="getOobCode");return s(n,o)}else return s(n,e).catch(async o=>{if(o.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const a=await uc(n,e,t,t==="getOobCode");return s(n,a)}else return Promise.reject(o)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function x_(n,e){const t=Hr(n,"auth");if(t.isInitialized()){const r=t.getImmediate(),o=t.getOptions();if(yr(o,e??{}))return r;We(r,"already-initialized")}return t.initialize({options:e})}function b_(n,e){const t=(e==null?void 0:e.persistence)||[],s=(Array.isArray(t)?t:[t]).map(ot);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(s,e==null?void 0:e.popupRedirectResolver)}function w_(n,e,t){const s=Lt(n);B(s._canInitEmulator,s,"emulator-config-failed"),B(/^https?:\/\//.test(e),s,"invalid-emulator-scheme");const r=!1,o=fu(e),{host:a,port:c}=E_(e),u=c===null?"":`:${c}`;s.config.emulator={url:`${o}//${a}${u}/`},s.settings.appVerificationDisabledForTesting=!0,s.emulatorConfig=Object.freeze({host:a,port:c,protocol:o.replace(":",""),options:Object.freeze({disableWarnings:r})}),I_()}function fu(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function E_(n){const e=fu(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const s=t[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(s);if(r){const o=r[1];return{host:o,port:dc(s.substr(o.length+1))}}else{const[o,a]=s.split(":");return{host:o,port:dc(a)}}}function dc(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function I_(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ho{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return rt("not implemented")}_getIdTokenResponse(e){return rt("not implemented")}_linkToIdToken(e,t){return rt("not implemented")}_getReauthenticationResolver(e){return rt("not implemented")}}async function C_(n,e){return mt(n,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function T_(n,e){return ws(n,"POST","/v1/accounts:signInWithPassword",Dt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function k_(n,e){return ws(n,"POST","/v1/accounts:signInWithEmailLink",Dt(n,e))}async function S_(n,e){return ws(n,"POST","/v1/accounts:signInWithEmailLink",Dt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hs extends Ho{constructor(e,t,s,r=null){super("password",s),this._email=e,this._password=t,this._tenantId=r}static _fromEmailAndPassword(e,t){return new hs(e,t,"password")}static _fromEmailAndCode(e,t,s=null){return new hs(e,t,"emailLink",s)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return lo(e,t,"signInWithPassword",T_);case"emailLink":return k_(e,{email:this._email,oobCode:this._password});default:We(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const s={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return lo(e,s,"signUpPassword",C_);case"emailLink":return S_(e,{idToken:t,email:this._email,oobCode:this._password});default:We(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fn(n,e){return ws(n,"POST","/v1/accounts:signInWithIdp",Dt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const N_="http://localhost";class qt extends Ho{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new qt(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):We("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:s,signInMethod:r}=t,o=Fo(t,["providerId","signInMethod"]);if(!s||!r)return null;const a=new qt(s,r);return a.idToken=o.idToken||void 0,a.accessToken=o.accessToken||void 0,a.secret=o.secret,a.nonce=o.nonce,a.pendingToken=o.pendingToken||null,a}_getIdTokenResponse(e){const t=this.buildRequest();return fn(e,t)}_linkToIdToken(e,t){const s=this.buildRequest();return s.idToken=t,fn(e,s)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,fn(e,t)}buildRequest(){const e={requestUri:N_,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=kn(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function A_(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function R_(n){const e=Jn(Qn(n)).link,t=e?Jn(Qn(e)).deep_link_id:null,s=Jn(Qn(n)).deep_link_id;return(s?Jn(Qn(s)).link:null)||s||t||e||n}class qo{constructor(e){var t,s,r,o,a,c;const u=Jn(Qn(e)),f=(t=u.apiKey)!==null&&t!==void 0?t:null,_=(s=u.oobCode)!==null&&s!==void 0?s:null,m=A_((r=u.mode)!==null&&r!==void 0?r:null);B(f&&_&&m,"argument-error"),this.apiKey=f,this.operation=m,this.code=_,this.continueUrl=(o=u.continueUrl)!==null&&o!==void 0?o:null,this.languageCode=(a=u.languageCode)!==null&&a!==void 0?a:null,this.tenantId=(c=u.tenantId)!==null&&c!==void 0?c:null}static parseLink(e){const t=R_(e);try{return new qo(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sn{constructor(){this.providerId=Sn.PROVIDER_ID}static credential(e,t){return hs._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const s=qo.parseLink(t);return B(s,"argument-error"),hs._fromEmailAndCode(e,s.code,s.tenantId)}}Sn.PROVIDER_ID="password";Sn.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Sn.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Go{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Es extends Go{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xt extends Es{constructor(){super("facebook.com")}static credential(e){return qt._fromParams({providerId:xt.PROVIDER_ID,signInMethod:xt.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return xt.credentialFromTaggedObject(e)}static credentialFromError(e){return xt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return xt.credential(e.oauthAccessToken)}catch{return null}}}xt.FACEBOOK_SIGN_IN_METHOD="facebook.com";xt.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class st extends Es{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return qt._fromParams({providerId:st.PROVIDER_ID,signInMethod:st.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return st.credentialFromTaggedObject(e)}static credentialFromError(e){return st.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:s}=e;if(!t&&!s)return null;try{return st.credential(t,s)}catch{return null}}}st.GOOGLE_SIGN_IN_METHOD="google.com";st.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bt extends Es{constructor(){super("github.com")}static credential(e){return qt._fromParams({providerId:bt.PROVIDER_ID,signInMethod:bt.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return bt.credentialFromTaggedObject(e)}static credentialFromError(e){return bt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return bt.credential(e.oauthAccessToken)}catch{return null}}}bt.GITHUB_SIGN_IN_METHOD="github.com";bt.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wt extends Es{constructor(){super("twitter.com")}static credential(e,t){return qt._fromParams({providerId:wt.PROVIDER_ID,signInMethod:wt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return wt.credentialFromTaggedObject(e)}static credentialFromError(e){return wt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:s}=e;if(!t||!s)return null;try{return wt.credential(t,s)}catch{return null}}}wt.TWITTER_SIGN_IN_METHOD="twitter.com";wt.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function P_(n,e){return ws(n,"POST","/v1/accounts:signUp",Dt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,s,r=!1){const o=await it._fromIdTokenResponse(e,s,r),a=fc(s);return new Gt({user:o,providerId:a,_tokenResponse:s,operationType:t})}static async _forOperation(e,t,s){await e._updateTokensIfNecessary(s,!0);const r=fc(s);return new Gt({user:e,providerId:r,_tokenResponse:s,operationType:t})}}function fc(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wr extends pt{constructor(e,t,s,r){var o;super(t.code,t.message),this.operationType=s,this.user=r,Object.setPrototypeOf(this,wr.prototype),this.customData={appName:e.name,tenantId:(o=e.tenantId)!==null&&o!==void 0?o:void 0,_serverResponse:t.customData._serverResponse,operationType:s}}static _fromErrorAndOperation(e,t,s,r){return new wr(e,t,s,r)}}function pu(n,e,t,s){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(o=>{throw o.code==="auth/multi-factor-auth-required"?wr._fromErrorAndOperation(n,o,e,s):o})}async function j_(n,e,t=!1){const s=await gn(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return Gt._forOperation(n,"link",s)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function O_(n,e,t=!1){const{auth:s}=n;if(He(s.app))return Promise.reject(lt(s));const r="reauthenticate";try{const o=await gn(n,pu(s,r,e,n),t);B(o.idToken,s,"internal-error");const a=Vo(o.idToken);B(a,s,"internal-error");const{sub:c}=a;return B(n.uid===c,s,"user-mismatch"),Gt._forOperation(n,r,o)}catch(o){throw(o==null?void 0:o.code)==="auth/user-not-found"&&We(s,"user-mismatch"),o}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function mu(n,e,t=!1){if(He(n.app))return Promise.reject(lt(n));const s="signIn",r=await pu(n,s,e),o=await Gt._fromIdTokenResponse(n,s,r);return t||await n._updateCurrentUser(o.user),o}async function D_(n,e){return mu(Lt(n),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function gu(n){const e=Lt(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function L_(n,e,t){if(He(n.app))return Promise.reject(lt(n));const s=Lt(n),a=await lo(s,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",P_).catch(u=>{throw u.code==="auth/password-does-not-meet-requirements"&&gu(n),u}),c=await Gt._fromIdTokenResponse(s,"signIn",a);return await s._updateCurrentUser(c.user),c}function M_(n,e,t){return He(n.app)?Promise.reject(lt(n)):D_(xe(n),Sn.credential(e,t)).catch(async s=>{throw s.code==="auth/password-does-not-meet-requirements"&&gu(n),s})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function U_(n,e){return mt(n,"POST","/v1/accounts:update",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _u(n,{displayName:e,photoURL:t}){if(e===void 0&&t===void 0)return;const s=xe(n),o={idToken:await s.getIdToken(),displayName:e,photoUrl:t,returnSecureToken:!0},a=await gn(s,U_(s.auth,o));s.displayName=a.displayName||null,s.photoURL=a.photoUrl||null;const c=s.providerData.find(({providerId:u})=>u==="password");c&&(c.displayName=s.displayName,c.photoURL=s.photoURL),await s._updateTokensIfNecessary(a)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function F_(n,e){return xe(n).setPersistence(e)}function z_(n,e,t,s){return xe(n).onIdTokenChanged(e,t,s)}function B_(n,e,t){return xe(n).beforeAuthStateChanged(e,t)}function W_(n,e,t,s){return xe(n).onAuthStateChanged(e,t,s)}function V_(n){return xe(n).signOut()}const Er="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yu{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Er,"1"),this.storage.removeItem(Er),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $_=1e3,H_=10;class vu extends yu{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=hu(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const s=this.storage.getItem(t),r=this.localCache[t];s!==r&&e(t,r,s)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((a,c,u)=>{this.notifyListeners(a,u)});return}const s=e.key;t?this.detachListener():this.stopPolling();const r=()=>{const a=this.storage.getItem(s);!t&&this.localCache[s]===a||this.notifyListeners(s,a)},o=this.storage.getItem(s);a_()&&o!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,H_):r()}notifyListeners(e,t){this.localCache[e]=t;const s=this.listeners[e];if(s)for(const r of Array.from(s))r(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,s)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:s}),!0)})},$_)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}vu.type="LOCAL";const xu=vu;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bu extends yu{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}bu.type="SESSION";const wu=bu;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function q_(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gr{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(r=>r.isListeningto(e));if(t)return t;const s=new Gr(e);return this.receivers.push(s),s}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:s,eventType:r,data:o}=t.data,a=this.handlersMap[r];if(!(a!=null&&a.size))return;t.ports[0].postMessage({status:"ack",eventId:s,eventType:r});const c=Array.from(a).map(async f=>f(t.origin,o)),u=await q_(c);t.ports[0].postMessage({status:"done",eventId:s,eventType:r,response:u})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Gr.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ko(n="",e=10){let t="";for(let s=0;s<e;s++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class G_{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,s=50){const r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let o,a;return new Promise((c,u)=>{const f=Ko("",20);r.port1.start();const _=setTimeout(()=>{u(new Error("unsupported_event"))},s);a={messageChannel:r,onMessage(m){const b=m;if(b.data.eventId===f)switch(b.data.status){case"ack":clearTimeout(_),o=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(o),c(b.data.response);break;default:clearTimeout(_),clearTimeout(o),u(new Error("invalid_response"));break}}},this.handlers.add(a),r.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:f,data:t},[r.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ze(){return window}function K_(n){Ze().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Eu(){return typeof Ze().WorkerGlobalScope<"u"&&typeof Ze().importScripts=="function"}async function Y_(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function J_(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function Q_(){return Eu()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Iu="firebaseLocalStorageDb",X_=1,Ir="firebaseLocalStorage",Cu="fbase_key";class Is{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Kr(n,e){return n.transaction([Ir],e?"readwrite":"readonly").objectStore(Ir)}function Z_(){const n=indexedDB.deleteDatabase(Iu);return new Is(n).toPromise()}function co(){const n=indexedDB.open(Iu,X_);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const s=n.result;try{s.createObjectStore(Ir,{keyPath:Cu})}catch(r){t(r)}}),n.addEventListener("success",async()=>{const s=n.result;s.objectStoreNames.contains(Ir)?e(s):(s.close(),await Z_(),e(await co()))})})}async function pc(n,e,t){const s=Kr(n,!0).put({[Cu]:e,value:t});return new Is(s).toPromise()}async function e0(n,e){const t=Kr(n,!1).get(e),s=await new Is(t).toPromise();return s===void 0?null:s.value}function mc(n,e){const t=Kr(n,!0).delete(e);return new Is(t).toPromise()}const t0=800,n0=3;class Tu{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await co(),this.db)}async _withRetries(e){let t=0;for(;;)try{const s=await this._openDb();return await e(s)}catch(s){if(t++>n0)throw s;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return Eu()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Gr._getInstance(Q_()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await Y_(),!this.activeServiceWorker)return;this.sender=new G_(this.activeServiceWorker);const s=await this.sender._send("ping",{},800);s&&!((e=s[0])===null||e===void 0)&&e.fulfilled&&!((t=s[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||J_()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await co();return await pc(e,Er,"1"),await mc(e,Er),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(s=>pc(s,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(s=>e0(s,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>mc(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(r=>{const o=Kr(r,!1).getAll();return new Is(o).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],s=new Set;if(e.length!==0)for(const{fbase_key:r,value:o}of e)s.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(o)&&(this.notifyListeners(r,o),t.push(r));for(const r of Object.keys(this.localCache))this.localCache[r]&&!s.has(r)&&(this.notifyListeners(r,null),t.push(r));return t}notifyListeners(e,t){this.localCache[e]=t;const s=this.listeners[e];if(s)for(const r of Array.from(s))r(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),t0)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Tu.type="LOCAL";const s0=Tu;new bs(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ku(n,e){return e?ot(e):(B(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yo extends Ho{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return fn(e,this._buildIdpRequest())}_linkToIdToken(e,t){return fn(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return fn(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function r0(n){return mu(n.auth,new Yo(n),n.bypassAuthState)}function i0(n){const{auth:e,user:t}=n;return B(t,e,"internal-error"),O_(t,new Yo(n),n.bypassAuthState)}async function o0(n){const{auth:e,user:t}=n;return B(t,e,"internal-error"),j_(t,new Yo(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Su{constructor(e,t,s,r,o=!1){this.auth=e,this.resolver=s,this.user=r,this.bypassAuthState=o,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(s){this.reject(s)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:s,postBody:r,tenantId:o,error:a,type:c}=e;if(a){this.reject(a);return}const u={auth:this.auth,requestUri:t,sessionId:s,tenantId:o||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(u))}catch(f){this.reject(f)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return r0;case"linkViaPopup":case"linkViaRedirect":return o0;case"reauthViaPopup":case"reauthViaRedirect":return i0;default:We(this.auth,"internal-error")}}resolve(e){ut(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){ut(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const a0=new bs(2e3,1e4);async function l0(n,e,t){if(He(n.app))return Promise.reject(Ke(n,"operation-not-supported-in-this-environment"));const s=Lt(n);Wg(n,e,Go);const r=ku(s,t);return new Wt(s,"signInViaPopup",e,r).executeNotNull()}class Wt extends Su{constructor(e,t,s,r,o){super(e,t,r,o),this.provider=s,this.authWindow=null,this.pollId=null,Wt.currentPopupAction&&Wt.currentPopupAction.cancel(),Wt.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return B(e,this.auth,"internal-error"),e}async onExecution(){ut(this.filter.length===1,"Popup operations only handle one event");const e=Ko();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(Ke(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Ke(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Wt.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,s;if(!((s=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||s===void 0)&&s.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Ke(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,a0.get())};e()}}Wt.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const c0="pendingRedirect",ar=new Map;class h0 extends Su{constructor(e,t,s=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,s),this.eventId=null}async execute(){let e=ar.get(this.auth._key());if(!e){try{const s=await u0(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(s)}catch(t){e=()=>Promise.reject(t)}ar.set(this.auth._key(),e)}return this.bypassAuthState||ar.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function u0(n,e){const t=p0(e),s=f0(n);if(!await s._isAvailable())return!1;const r=await s._get(t)==="true";return await s._remove(t),r}function d0(n,e){ar.set(n._key(),e)}function f0(n){return ot(n._redirectPersistence)}function p0(n){return or(c0,n.config.apiKey,n.name)}async function m0(n,e,t=!1){if(He(n.app))return Promise.reject(lt(n));const s=Lt(n),r=ku(s,e),a=await new h0(s,r,t).execute();return a&&!t&&(delete a.user._redirectEventId,await s._persistUserIfCurrent(a.user),await s._setRedirectUser(null,e)),a}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const g0=10*60*1e3;class _0{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(s=>{this.isEventForConsumer(e,s)&&(t=!0,this.sendToConsumer(e,s),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!y0(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var s;if(e.error&&!Nu(e)){const r=((s=e.error.code)===null||s===void 0?void 0:s.split("auth/")[1])||"internal-error";t.onError(Ke(this.auth,r))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const s=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&s}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=g0&&this.cachedEventUids.clear(),this.cachedEventUids.has(gc(e))}saveEventToCache(e){this.cachedEventUids.add(gc(e)),this.lastProcessedEventTime=Date.now()}}function gc(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Nu({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function y0(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Nu(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function v0(n,e={}){return mt(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const x0=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,b0=/^https?/;async function w0(n){if(n.config.emulator)return;const{authorizedDomains:e}=await v0(n);for(const t of e)try{if(E0(t))return}catch{}We(n,"unauthorized-domain")}function E0(n){const e=oo(),{protocol:t,hostname:s}=new URL(e);if(n.startsWith("chrome-extension://")){const a=new URL(n);return a.hostname===""&&s===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===s}if(!b0.test(t))return!1;if(x0.test(n))return s===n;const r=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+r+"|"+r+")$","i").test(s)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const I0=new bs(3e4,6e4);function _c(){const n=Ze().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function C0(n){return new Promise((e,t)=>{var s,r,o;function a(){_c(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{_c(),t(Ke(n,"network-request-failed"))},timeout:I0.get()})}if(!((r=(s=Ze().gapi)===null||s===void 0?void 0:s.iframes)===null||r===void 0)&&r.Iframe)e(gapi.iframes.getContext());else if(!((o=Ze().gapi)===null||o===void 0)&&o.load)a();else{const c=g_("iframefcb");return Ze()[c]=()=>{gapi.load?a():t(Ke(n,"network-request-failed"))},du(`${m_()}?onload=${c}`).catch(u=>t(u))}}).catch(e=>{throw lr=null,e})}let lr=null;function T0(n){return lr=lr||C0(n),lr}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const k0=new bs(5e3,15e3),S0="__/auth/iframe",N0="emulator/auth/iframe",A0={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},R0=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function P0(n){const e=n.config;B(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Wo(e,N0):`https://${n.config.authDomain}/${S0}`,s={apiKey:e.apiKey,appName:n.name,v:Zt},r=R0.get(n.config.apiHost);r&&(s.eid=r);const o=n._getFrameworks();return o.length&&(s.fw=o.join(",")),`${t}?${kn(s).slice(1)}`}async function j0(n){const e=await T0(n),t=Ze().gapi;return B(t,n,"internal-error"),e.open({where:document.body,url:P0(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:A0,dontclear:!0},s=>new Promise(async(r,o)=>{await s.restyle({setHideOnLeave:!1});const a=Ke(n,"network-request-failed"),c=Ze().setTimeout(()=>{o(a)},k0.get());function u(){Ze().clearTimeout(c),r(s)}s.ping(u).then(u,()=>{o(a)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const O0={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},D0=500,L0=600,M0="_blank",U0="http://localhost";class yc{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function F0(n,e,t,s=D0,r=L0){const o=Math.max((window.screen.availHeight-r)/2,0).toString(),a=Math.max((window.screen.availWidth-s)/2,0).toString();let c="";const u=Object.assign(Object.assign({},O0),{width:s.toString(),height:r.toString(),top:o,left:a}),f=Oe().toLowerCase();t&&(c=iu(f)?M0:t),su(f)&&(e=e||U0,u.scrollbars="yes");const _=Object.entries(u).reduce((b,[S,T])=>`${b}${S}=${T},`,"");if(o_(f)&&c!=="_self")return z0(e||"",c),new yc(null);const m=window.open(e||"",c,_);B(m,n,"popup-blocked");try{m.focus()}catch{}return new yc(m)}function z0(n,e){const t=document.createElement("a");t.href=n,t.target=e;const s=document.createEvent("MouseEvent");s.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(s)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const B0="__/auth/handler",W0="emulator/auth/handler",V0=encodeURIComponent("fac");async function vc(n,e,t,s,r,o){B(n.config.authDomain,n,"auth-domain-config-required"),B(n.config.apiKey,n,"invalid-api-key");const a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:s,v:Zt,eventId:r};if(e instanceof Go){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",eo(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[_,m]of Object.entries({}))a[_]=m}if(e instanceof Es){const _=e.getScopes().filter(m=>m!=="");_.length>0&&(a.scopes=_.join(","))}n.tenantId&&(a.tid=n.tenantId);const c=a;for(const _ of Object.keys(c))c[_]===void 0&&delete c[_];const u=await n._getAppCheckToken(),f=u?`#${V0}=${encodeURIComponent(u)}`:"";return`${$0(n)}?${kn(c).slice(1)}${f}`}function $0({config:n}){return n.emulator?Wo(n,W0):`https://${n.authDomain}/${B0}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fi="webStorageSupport";class H0{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=wu,this._completeRedirectFn=m0,this._overrideRedirectResult=d0}async _openPopup(e,t,s,r){var o;ut((o=this.eventManagers[e._key()])===null||o===void 0?void 0:o.manager,"_initialize() not called before _openPopup()");const a=await vc(e,t,s,oo(),r);return F0(e,a,Ko())}async _openRedirect(e,t,s,r){await this._originValidation(e);const o=await vc(e,t,s,oo(),r);return K_(o),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:r,promise:o}=this.eventManagers[t];return r?Promise.resolve(r):(ut(o,"If manager is not set, promise should be"),o)}const s=this.initAndGetManager(e);return this.eventManagers[t]={promise:s},s.catch(()=>{delete this.eventManagers[t]}),s}async initAndGetManager(e){const t=await j0(e),s=new _0(e);return t.register("authEvent",r=>(B(r==null?void 0:r.authEvent,e,"invalid-auth-event"),{status:s.onEvent(r.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:s},this.iframes[e._key()]=t,s}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Fi,{type:Fi},r=>{var o;const a=(o=r==null?void 0:r[0])===null||o===void 0?void 0:o[Fi];a!==void 0&&t(!!a),We(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=w0(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return hu()||ru()||$o()}}const q0=H0;var xc="@firebase/auth",bc="1.7.9";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class G0{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(s=>{e((s==null?void 0:s.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){B(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function K0(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Y0(n){Ht(new At("auth",(e,{options:t})=>{const s=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),o=e.getProvider("app-check-internal"),{apiKey:a,authDomain:c}=s.options;B(a&&!a.includes(":"),"invalid-api-key",{appName:s.name});const u={apiKey:a,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:uu(n)},f=new d_(s,r,o,u);return b_(f,t),f},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,s)=>{e.getProvider("auth-internal").initialize()})),Ht(new At("auth-internal",e=>{const t=Lt(e.getProvider("auth").getImmediate());return(s=>new G0(s))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Xe(xc,bc,K0(n)),Xe(xc,bc,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const J0=5*60,Q0=zh("authIdTokenMaxAge")||J0;let wc=null;const X0=n=>async e=>{const t=e&&await e.getIdTokenResult(),s=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(s&&s>Q0)return;const r=t==null?void 0:t.token;wc!==r&&(wc=r,await fetch(n,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function Z0(n=Uo()){const e=Hr(n,"auth");if(e.isInitialized())return e.getImmediate();const t=x_(n,{popupRedirectResolver:q0,persistence:[s0,xu,wu]}),s=zh("authTokenSyncURL");if(s&&typeof isSecureContext=="boolean"&&isSecureContext){const o=new URL(s,location.origin);if(location.origin===o.origin){const a=X0(o.toString());B_(t,a,()=>a(t.currentUser)),z_(t,c=>a(c))}}const r=Mh("auth");return r&&w_(t,`http://${r}`),t}function ey(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}f_({loadJS(n){return new Promise((e,t)=>{const s=document.createElement("script");s.setAttribute("src",n),s.onload=e,s.onerror=r=>{const o=Ke("internal-error");o.customData=r,t(o)},s.type="text/javascript",s.charset="UTF-8",ey().appendChild(s)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Y0("Browser");var Ec=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Au;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(v,y){function x(){}x.prototype=y.prototype,v.D=y.prototype,v.prototype=new x,v.prototype.constructor=v,v.C=function(w,E,I){for(var g=Array(arguments.length-2),j=2;j<arguments.length;j++)g[j-2]=arguments[j];return y.prototype[E].apply(w,g)}}function t(){this.blockSize=-1}function s(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(s,t),s.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function r(v,y,x){x||(x=0);var w=Array(16);if(typeof y=="string")for(var E=0;16>E;++E)w[E]=y.charCodeAt(x++)|y.charCodeAt(x++)<<8|y.charCodeAt(x++)<<16|y.charCodeAt(x++)<<24;else for(E=0;16>E;++E)w[E]=y[x++]|y[x++]<<8|y[x++]<<16|y[x++]<<24;y=v.g[0],x=v.g[1],E=v.g[2];var I=v.g[3],g=y+(I^x&(E^I))+w[0]+3614090360&4294967295;y=x+(g<<7&4294967295|g>>>25),g=I+(E^y&(x^E))+w[1]+3905402710&4294967295,I=y+(g<<12&4294967295|g>>>20),g=E+(x^I&(y^x))+w[2]+606105819&4294967295,E=I+(g<<17&4294967295|g>>>15),g=x+(y^E&(I^y))+w[3]+3250441966&4294967295,x=E+(g<<22&4294967295|g>>>10),g=y+(I^x&(E^I))+w[4]+4118548399&4294967295,y=x+(g<<7&4294967295|g>>>25),g=I+(E^y&(x^E))+w[5]+1200080426&4294967295,I=y+(g<<12&4294967295|g>>>20),g=E+(x^I&(y^x))+w[6]+2821735955&4294967295,E=I+(g<<17&4294967295|g>>>15),g=x+(y^E&(I^y))+w[7]+4249261313&4294967295,x=E+(g<<22&4294967295|g>>>10),g=y+(I^x&(E^I))+w[8]+1770035416&4294967295,y=x+(g<<7&4294967295|g>>>25),g=I+(E^y&(x^E))+w[9]+2336552879&4294967295,I=y+(g<<12&4294967295|g>>>20),g=E+(x^I&(y^x))+w[10]+4294925233&4294967295,E=I+(g<<17&4294967295|g>>>15),g=x+(y^E&(I^y))+w[11]+2304563134&4294967295,x=E+(g<<22&4294967295|g>>>10),g=y+(I^x&(E^I))+w[12]+1804603682&4294967295,y=x+(g<<7&4294967295|g>>>25),g=I+(E^y&(x^E))+w[13]+4254626195&4294967295,I=y+(g<<12&4294967295|g>>>20),g=E+(x^I&(y^x))+w[14]+2792965006&4294967295,E=I+(g<<17&4294967295|g>>>15),g=x+(y^E&(I^y))+w[15]+1236535329&4294967295,x=E+(g<<22&4294967295|g>>>10),g=y+(E^I&(x^E))+w[1]+4129170786&4294967295,y=x+(g<<5&4294967295|g>>>27),g=I+(x^E&(y^x))+w[6]+3225465664&4294967295,I=y+(g<<9&4294967295|g>>>23),g=E+(y^x&(I^y))+w[11]+643717713&4294967295,E=I+(g<<14&4294967295|g>>>18),g=x+(I^y&(E^I))+w[0]+3921069994&4294967295,x=E+(g<<20&4294967295|g>>>12),g=y+(E^I&(x^E))+w[5]+3593408605&4294967295,y=x+(g<<5&4294967295|g>>>27),g=I+(x^E&(y^x))+w[10]+38016083&4294967295,I=y+(g<<9&4294967295|g>>>23),g=E+(y^x&(I^y))+w[15]+3634488961&4294967295,E=I+(g<<14&4294967295|g>>>18),g=x+(I^y&(E^I))+w[4]+3889429448&4294967295,x=E+(g<<20&4294967295|g>>>12),g=y+(E^I&(x^E))+w[9]+568446438&4294967295,y=x+(g<<5&4294967295|g>>>27),g=I+(x^E&(y^x))+w[14]+3275163606&4294967295,I=y+(g<<9&4294967295|g>>>23),g=E+(y^x&(I^y))+w[3]+4107603335&4294967295,E=I+(g<<14&4294967295|g>>>18),g=x+(I^y&(E^I))+w[8]+1163531501&4294967295,x=E+(g<<20&4294967295|g>>>12),g=y+(E^I&(x^E))+w[13]+2850285829&4294967295,y=x+(g<<5&4294967295|g>>>27),g=I+(x^E&(y^x))+w[2]+4243563512&4294967295,I=y+(g<<9&4294967295|g>>>23),g=E+(y^x&(I^y))+w[7]+1735328473&4294967295,E=I+(g<<14&4294967295|g>>>18),g=x+(I^y&(E^I))+w[12]+2368359562&4294967295,x=E+(g<<20&4294967295|g>>>12),g=y+(x^E^I)+w[5]+4294588738&4294967295,y=x+(g<<4&4294967295|g>>>28),g=I+(y^x^E)+w[8]+2272392833&4294967295,I=y+(g<<11&4294967295|g>>>21),g=E+(I^y^x)+w[11]+1839030562&4294967295,E=I+(g<<16&4294967295|g>>>16),g=x+(E^I^y)+w[14]+4259657740&4294967295,x=E+(g<<23&4294967295|g>>>9),g=y+(x^E^I)+w[1]+2763975236&4294967295,y=x+(g<<4&4294967295|g>>>28),g=I+(y^x^E)+w[4]+1272893353&4294967295,I=y+(g<<11&4294967295|g>>>21),g=E+(I^y^x)+w[7]+4139469664&4294967295,E=I+(g<<16&4294967295|g>>>16),g=x+(E^I^y)+w[10]+3200236656&4294967295,x=E+(g<<23&4294967295|g>>>9),g=y+(x^E^I)+w[13]+681279174&4294967295,y=x+(g<<4&4294967295|g>>>28),g=I+(y^x^E)+w[0]+3936430074&4294967295,I=y+(g<<11&4294967295|g>>>21),g=E+(I^y^x)+w[3]+3572445317&4294967295,E=I+(g<<16&4294967295|g>>>16),g=x+(E^I^y)+w[6]+76029189&4294967295,x=E+(g<<23&4294967295|g>>>9),g=y+(x^E^I)+w[9]+3654602809&4294967295,y=x+(g<<4&4294967295|g>>>28),g=I+(y^x^E)+w[12]+3873151461&4294967295,I=y+(g<<11&4294967295|g>>>21),g=E+(I^y^x)+w[15]+530742520&4294967295,E=I+(g<<16&4294967295|g>>>16),g=x+(E^I^y)+w[2]+3299628645&4294967295,x=E+(g<<23&4294967295|g>>>9),g=y+(E^(x|~I))+w[0]+4096336452&4294967295,y=x+(g<<6&4294967295|g>>>26),g=I+(x^(y|~E))+w[7]+1126891415&4294967295,I=y+(g<<10&4294967295|g>>>22),g=E+(y^(I|~x))+w[14]+2878612391&4294967295,E=I+(g<<15&4294967295|g>>>17),g=x+(I^(E|~y))+w[5]+4237533241&4294967295,x=E+(g<<21&4294967295|g>>>11),g=y+(E^(x|~I))+w[12]+1700485571&4294967295,y=x+(g<<6&4294967295|g>>>26),g=I+(x^(y|~E))+w[3]+2399980690&4294967295,I=y+(g<<10&4294967295|g>>>22),g=E+(y^(I|~x))+w[10]+4293915773&4294967295,E=I+(g<<15&4294967295|g>>>17),g=x+(I^(E|~y))+w[1]+2240044497&4294967295,x=E+(g<<21&4294967295|g>>>11),g=y+(E^(x|~I))+w[8]+1873313359&4294967295,y=x+(g<<6&4294967295|g>>>26),g=I+(x^(y|~E))+w[15]+4264355552&4294967295,I=y+(g<<10&4294967295|g>>>22),g=E+(y^(I|~x))+w[6]+2734768916&4294967295,E=I+(g<<15&4294967295|g>>>17),g=x+(I^(E|~y))+w[13]+1309151649&4294967295,x=E+(g<<21&4294967295|g>>>11),g=y+(E^(x|~I))+w[4]+4149444226&4294967295,y=x+(g<<6&4294967295|g>>>26),g=I+(x^(y|~E))+w[11]+3174756917&4294967295,I=y+(g<<10&4294967295|g>>>22),g=E+(y^(I|~x))+w[2]+718787259&4294967295,E=I+(g<<15&4294967295|g>>>17),g=x+(I^(E|~y))+w[9]+3951481745&4294967295,v.g[0]=v.g[0]+y&4294967295,v.g[1]=v.g[1]+(E+(g<<21&4294967295|g>>>11))&4294967295,v.g[2]=v.g[2]+E&4294967295,v.g[3]=v.g[3]+I&4294967295}s.prototype.u=function(v,y){y===void 0&&(y=v.length);for(var x=y-this.blockSize,w=this.B,E=this.h,I=0;I<y;){if(E==0)for(;I<=x;)r(this,v,I),I+=this.blockSize;if(typeof v=="string"){for(;I<y;)if(w[E++]=v.charCodeAt(I++),E==this.blockSize){r(this,w),E=0;break}}else for(;I<y;)if(w[E++]=v[I++],E==this.blockSize){r(this,w),E=0;break}}this.h=E,this.o+=y},s.prototype.v=function(){var v=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);v[0]=128;for(var y=1;y<v.length-8;++y)v[y]=0;var x=8*this.o;for(y=v.length-8;y<v.length;++y)v[y]=x&255,x/=256;for(this.u(v),v=Array(16),y=x=0;4>y;++y)for(var w=0;32>w;w+=8)v[x++]=this.g[y]>>>w&255;return v};function o(v,y){var x=c;return Object.prototype.hasOwnProperty.call(x,v)?x[v]:x[v]=y(v)}function a(v,y){this.h=y;for(var x=[],w=!0,E=v.length-1;0<=E;E--){var I=v[E]|0;w&&I==y||(x[E]=I,w=!1)}this.g=x}var c={};function u(v){return-128<=v&&128>v?o(v,function(y){return new a([y|0],0>y?-1:0)}):new a([v|0],0>v?-1:0)}function f(v){if(isNaN(v)||!isFinite(v))return m;if(0>v)return A(f(-v));for(var y=[],x=1,w=0;v>=x;w++)y[w]=v/x|0,x*=4294967296;return new a(y,0)}function _(v,y){if(v.length==0)throw Error("number format error: empty string");if(y=y||10,2>y||36<y)throw Error("radix out of range: "+y);if(v.charAt(0)=="-")return A(_(v.substring(1),y));if(0<=v.indexOf("-"))throw Error('number format error: interior "-" character');for(var x=f(Math.pow(y,8)),w=m,E=0;E<v.length;E+=8){var I=Math.min(8,v.length-E),g=parseInt(v.substring(E,E+I),y);8>I?(I=f(Math.pow(y,I)),w=w.j(I).add(f(g))):(w=w.j(x),w=w.add(f(g)))}return w}var m=u(0),b=u(1),S=u(16777216);n=a.prototype,n.m=function(){if(R(this))return-A(this).m();for(var v=0,y=1,x=0;x<this.g.length;x++){var w=this.i(x);v+=(0<=w?w:4294967296+w)*y,y*=4294967296}return v},n.toString=function(v){if(v=v||10,2>v||36<v)throw Error("radix out of range: "+v);if(T(this))return"0";if(R(this))return"-"+A(this).toString(v);for(var y=f(Math.pow(v,6)),x=this,w="";;){var E=D(x,y).g;x=U(x,E.j(y));var I=((0<x.g.length?x.g[0]:x.h)>>>0).toString(v);if(x=E,T(x))return I+w;for(;6>I.length;)I="0"+I;w=I+w}},n.i=function(v){return 0>v?0:v<this.g.length?this.g[v]:this.h};function T(v){if(v.h!=0)return!1;for(var y=0;y<v.g.length;y++)if(v.g[y]!=0)return!1;return!0}function R(v){return v.h==-1}n.l=function(v){return v=U(this,v),R(v)?-1:T(v)?0:1};function A(v){for(var y=v.g.length,x=[],w=0;w<y;w++)x[w]=~v.g[w];return new a(x,~v.h).add(b)}n.abs=function(){return R(this)?A(this):this},n.add=function(v){for(var y=Math.max(this.g.length,v.g.length),x=[],w=0,E=0;E<=y;E++){var I=w+(this.i(E)&65535)+(v.i(E)&65535),g=(I>>>16)+(this.i(E)>>>16)+(v.i(E)>>>16);w=g>>>16,I&=65535,g&=65535,x[E]=g<<16|I}return new a(x,x[x.length-1]&-2147483648?-1:0)};function U(v,y){return v.add(A(y))}n.j=function(v){if(T(this)||T(v))return m;if(R(this))return R(v)?A(this).j(A(v)):A(A(this).j(v));if(R(v))return A(this.j(A(v)));if(0>this.l(S)&&0>v.l(S))return f(this.m()*v.m());for(var y=this.g.length+v.g.length,x=[],w=0;w<2*y;w++)x[w]=0;for(w=0;w<this.g.length;w++)for(var E=0;E<v.g.length;E++){var I=this.i(w)>>>16,g=this.i(w)&65535,j=v.i(E)>>>16,W=v.i(E)&65535;x[2*w+2*E]+=g*W,z(x,2*w+2*E),x[2*w+2*E+1]+=I*W,z(x,2*w+2*E+1),x[2*w+2*E+1]+=g*j,z(x,2*w+2*E+1),x[2*w+2*E+2]+=I*j,z(x,2*w+2*E+2)}for(w=0;w<y;w++)x[w]=x[2*w+1]<<16|x[2*w];for(w=y;w<2*y;w++)x[w]=0;return new a(x,0)};function z(v,y){for(;(v[y]&65535)!=v[y];)v[y+1]+=v[y]>>>16,v[y]&=65535,y++}function M(v,y){this.g=v,this.h=y}function D(v,y){if(T(y))throw Error("division by zero");if(T(v))return new M(m,m);if(R(v))return y=D(A(v),y),new M(A(y.g),A(y.h));if(R(y))return y=D(v,A(y)),new M(A(y.g),y.h);if(30<v.g.length){if(R(v)||R(y))throw Error("slowDivide_ only works with positive integers.");for(var x=b,w=y;0>=w.l(v);)x=L(x),w=L(w);var E=J(x,1),I=J(w,1);for(w=J(w,2),x=J(x,2);!T(w);){var g=I.add(w);0>=g.l(v)&&(E=E.add(x),I=g),w=J(w,1),x=J(x,1)}return y=U(v,E.j(y)),new M(E,y)}for(E=m;0<=v.l(y);){for(x=Math.max(1,Math.floor(v.m()/y.m())),w=Math.ceil(Math.log(x)/Math.LN2),w=48>=w?1:Math.pow(2,w-48),I=f(x),g=I.j(y);R(g)||0<g.l(v);)x-=w,I=f(x),g=I.j(y);T(I)&&(I=b),E=E.add(I),v=U(v,g)}return new M(E,v)}n.A=function(v){return D(this,v).h},n.and=function(v){for(var y=Math.max(this.g.length,v.g.length),x=[],w=0;w<y;w++)x[w]=this.i(w)&v.i(w);return new a(x,this.h&v.h)},n.or=function(v){for(var y=Math.max(this.g.length,v.g.length),x=[],w=0;w<y;w++)x[w]=this.i(w)|v.i(w);return new a(x,this.h|v.h)},n.xor=function(v){for(var y=Math.max(this.g.length,v.g.length),x=[],w=0;w<y;w++)x[w]=this.i(w)^v.i(w);return new a(x,this.h^v.h)};function L(v){for(var y=v.g.length+1,x=[],w=0;w<y;w++)x[w]=v.i(w)<<1|v.i(w-1)>>>31;return new a(x,v.h)}function J(v,y){var x=y>>5;y%=32;for(var w=v.g.length-x,E=[],I=0;I<w;I++)E[I]=0<y?v.i(I+x)>>>y|v.i(I+x+1)<<32-y:v.i(I+x);return new a(E,v.h)}s.prototype.digest=s.prototype.v,s.prototype.reset=s.prototype.s,s.prototype.update=s.prototype.u,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=f,a.fromString=_,Au=a}).apply(typeof Ec<"u"?Ec:typeof self<"u"?self:typeof window<"u"?window:{});var er=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(i,h,d){return i==Array.prototype||i==Object.prototype||(i[h]=d.value),i};function t(i){i=[typeof globalThis=="object"&&globalThis,i,typeof window=="object"&&window,typeof self=="object"&&self,typeof er=="object"&&er];for(var h=0;h<i.length;++h){var d=i[h];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var s=t(this);function r(i,h){if(h)e:{var d=s;i=i.split(".");for(var p=0;p<i.length-1;p++){var C=i[p];if(!(C in d))break e;d=d[C]}i=i[i.length-1],p=d[i],h=h(p),h!=p&&h!=null&&e(d,i,{configurable:!0,writable:!0,value:h})}}function o(i,h){i instanceof String&&(i+="");var d=0,p=!1,C={next:function(){if(!p&&d<i.length){var N=d++;return{value:h(N,i[N]),done:!1}}return p=!0,{done:!0,value:void 0}}};return C[Symbol.iterator]=function(){return C},C}r("Array.prototype.values",function(i){return i||function(){return o(this,function(h,d){return d})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},c=this||self;function u(i){var h=typeof i;return h=h!="object"?h:i?Array.isArray(i)?"array":h:"null",h=="array"||h=="object"&&typeof i.length=="number"}function f(i){var h=typeof i;return h=="object"&&i!=null||h=="function"}function _(i,h,d){return i.call.apply(i.bind,arguments)}function m(i,h,d){if(!i)throw Error();if(2<arguments.length){var p=Array.prototype.slice.call(arguments,2);return function(){var C=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(C,p),i.apply(h,C)}}return function(){return i.apply(h,arguments)}}function b(i,h,d){return b=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?_:m,b.apply(null,arguments)}function S(i,h){var d=Array.prototype.slice.call(arguments,1);return function(){var p=d.slice();return p.push.apply(p,arguments),i.apply(this,p)}}function T(i,h){function d(){}d.prototype=h.prototype,i.aa=h.prototype,i.prototype=new d,i.prototype.constructor=i,i.Qb=function(p,C,N){for(var O=Array(arguments.length-2),ne=2;ne<arguments.length;ne++)O[ne-2]=arguments[ne];return h.prototype[C].apply(p,O)}}function R(i){const h=i.length;if(0<h){const d=Array(h);for(let p=0;p<h;p++)d[p]=i[p];return d}return[]}function A(i,h){for(let d=1;d<arguments.length;d++){const p=arguments[d];if(u(p)){const C=i.length||0,N=p.length||0;i.length=C+N;for(let O=0;O<N;O++)i[C+O]=p[O]}else i.push(p)}}class U{constructor(h,d){this.i=h,this.j=d,this.h=0,this.g=null}get(){let h;return 0<this.h?(this.h--,h=this.g,this.g=h.next,h.next=null):h=this.i(),h}}function z(i){return/^[\s\xa0]*$/.test(i)}function M(){var i=c.navigator;return i&&(i=i.userAgent)?i:""}function D(i){return D[" "](i),i}D[" "]=function(){};var L=M().indexOf("Gecko")!=-1&&!(M().toLowerCase().indexOf("webkit")!=-1&&M().indexOf("Edge")==-1)&&!(M().indexOf("Trident")!=-1||M().indexOf("MSIE")!=-1)&&M().indexOf("Edge")==-1;function J(i,h,d){for(const p in i)h.call(d,i[p],p,i)}function v(i,h){for(const d in i)h.call(void 0,i[d],d,i)}function y(i){const h={};for(const d in i)h[d]=i[d];return h}const x="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function w(i,h){let d,p;for(let C=1;C<arguments.length;C++){p=arguments[C];for(d in p)i[d]=p[d];for(let N=0;N<x.length;N++)d=x[N],Object.prototype.hasOwnProperty.call(p,d)&&(i[d]=p[d])}}function E(i){var h=1;i=i.split(":");const d=[];for(;0<h&&i.length;)d.push(i.shift()),h--;return i.length&&d.push(i.join(":")),d}function I(i){c.setTimeout(()=>{throw i},0)}function g(){var i=me;let h=null;return i.g&&(h=i.g,i.g=i.g.next,i.g||(i.h=null),h.next=null),h}class j{constructor(){this.h=this.g=null}add(h,d){const p=W.get();p.set(h,d),this.h?this.h.next=p:this.g=p,this.h=p}}var W=new U(()=>new Q,i=>i.reset());class Q{constructor(){this.next=this.g=this.h=null}set(h,d){this.h=h,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let de,fe=!1,me=new j,Ie=()=>{const i=c.Promise.resolve(void 0);de=()=>{i.then(Z)}};var Z=()=>{for(var i;i=g();){try{i.h.call(i.g)}catch(d){I(d)}var h=W;h.j(i),100>h.h&&(h.h++,i.next=h.g,h.g=i)}fe=!1};function oe(){this.s=this.s,this.C=this.C}oe.prototype.s=!1,oe.prototype.ma=function(){this.s||(this.s=!0,this.N())},oe.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function te(i,h){this.type=i,this.g=this.target=h,this.defaultPrevented=!1}te.prototype.h=function(){this.defaultPrevented=!0};var Os=function(){if(!c.addEventListener||!Object.defineProperty)return!1;var i=!1,h=Object.defineProperty({},"passive",{get:function(){i=!0}});try{const d=()=>{};c.addEventListener("test",d,h),c.removeEventListener("test",d,h)}catch{}return i}();function Ue(i,h){if(te.call(this,i?i.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,i){var d=this.type=i.type,p=i.changedTouches&&i.changedTouches.length?i.changedTouches[0]:null;if(this.target=i.target||i.srcElement,this.g=h,h=i.relatedTarget){if(L){e:{try{D(h.nodeName);var C=!0;break e}catch{}C=!1}C||(h=null)}}else d=="mouseover"?h=i.fromElement:d=="mouseout"&&(h=i.toElement);this.relatedTarget=h,p?(this.clientX=p.clientX!==void 0?p.clientX:p.pageX,this.clientY=p.clientY!==void 0?p.clientY:p.pageY,this.screenX=p.screenX||0,this.screenY=p.screenY||0):(this.clientX=i.clientX!==void 0?i.clientX:i.pageX,this.clientY=i.clientY!==void 0?i.clientY:i.pageY,this.screenX=i.screenX||0,this.screenY=i.screenY||0),this.button=i.button,this.key=i.key||"",this.ctrlKey=i.ctrlKey,this.altKey=i.altKey,this.shiftKey=i.shiftKey,this.metaKey=i.metaKey,this.pointerId=i.pointerId||0,this.pointerType=typeof i.pointerType=="string"?i.pointerType:Yd[i.pointerType]||"",this.state=i.state,this.i=i,i.defaultPrevented&&Ue.aa.h.call(this)}}T(Ue,te);var Yd={2:"touch",3:"pen",4:"mouse"};Ue.prototype.h=function(){Ue.aa.h.call(this);var i=this.i;i.preventDefault?i.preventDefault():i.returnValue=!1};var Ds="closure_listenable_"+(1e6*Math.random()|0),Jd=0;function Qd(i,h,d,p,C){this.listener=i,this.proxy=null,this.src=h,this.type=d,this.capture=!!p,this.ha=C,this.key=++Jd,this.da=this.fa=!1}function Ls(i){i.da=!0,i.listener=null,i.proxy=null,i.src=null,i.ha=null}function Ms(i){this.src=i,this.g={},this.h=0}Ms.prototype.add=function(i,h,d,p,C){var N=i.toString();i=this.g[N],i||(i=this.g[N]=[],this.h++);var O=li(i,h,p,C);return-1<O?(h=i[O],d||(h.fa=!1)):(h=new Qd(h,this.src,N,!!p,C),h.fa=d,i.push(h)),h};function ai(i,h){var d=h.type;if(d in i.g){var p=i.g[d],C=Array.prototype.indexOf.call(p,h,void 0),N;(N=0<=C)&&Array.prototype.splice.call(p,C,1),N&&(Ls(h),i.g[d].length==0&&(delete i.g[d],i.h--))}}function li(i,h,d,p){for(var C=0;C<i.length;++C){var N=i[C];if(!N.da&&N.listener==h&&N.capture==!!d&&N.ha==p)return C}return-1}var ci="closure_lm_"+(1e6*Math.random()|0),hi={};function Da(i,h,d,p,C){if(Array.isArray(h)){for(var N=0;N<h.length;N++)Da(i,h[N],d,p,C);return null}return d=Ua(d),i&&i[Ds]?i.K(h,d,f(p)?!!p.capture:!1,C):Xd(i,h,d,!1,p,C)}function Xd(i,h,d,p,C,N){if(!h)throw Error("Invalid event type");var O=f(C)?!!C.capture:!!C,ne=di(i);if(ne||(i[ci]=ne=new Ms(i)),d=ne.add(h,d,p,O,N),d.proxy)return d;if(p=Zd(),d.proxy=p,p.src=i,p.listener=d,i.addEventListener)Os||(C=O),C===void 0&&(C=!1),i.addEventListener(h.toString(),p,C);else if(i.attachEvent)i.attachEvent(Ma(h.toString()),p);else if(i.addListener&&i.removeListener)i.addListener(p);else throw Error("addEventListener and attachEvent are unavailable.");return d}function Zd(){function i(d){return h.call(i.src,i.listener,d)}const h=ef;return i}function La(i,h,d,p,C){if(Array.isArray(h))for(var N=0;N<h.length;N++)La(i,h[N],d,p,C);else p=f(p)?!!p.capture:!!p,d=Ua(d),i&&i[Ds]?(i=i.i,h=String(h).toString(),h in i.g&&(N=i.g[h],d=li(N,d,p,C),-1<d&&(Ls(N[d]),Array.prototype.splice.call(N,d,1),N.length==0&&(delete i.g[h],i.h--)))):i&&(i=di(i))&&(h=i.g[h.toString()],i=-1,h&&(i=li(h,d,p,C)),(d=-1<i?h[i]:null)&&ui(d))}function ui(i){if(typeof i!="number"&&i&&!i.da){var h=i.src;if(h&&h[Ds])ai(h.i,i);else{var d=i.type,p=i.proxy;h.removeEventListener?h.removeEventListener(d,p,i.capture):h.detachEvent?h.detachEvent(Ma(d),p):h.addListener&&h.removeListener&&h.removeListener(p),(d=di(h))?(ai(d,i),d.h==0&&(d.src=null,h[ci]=null)):Ls(i)}}}function Ma(i){return i in hi?hi[i]:hi[i]="on"+i}function ef(i,h){if(i.da)i=!0;else{h=new Ue(h,this);var d=i.listener,p=i.ha||i.src;i.fa&&ui(i),i=d.call(p,h)}return i}function di(i){return i=i[ci],i instanceof Ms?i:null}var fi="__closure_events_fn_"+(1e9*Math.random()>>>0);function Ua(i){return typeof i=="function"?i:(i[fi]||(i[fi]=function(h){return i.handleEvent(h)}),i[fi])}function Ce(){oe.call(this),this.i=new Ms(this),this.M=this,this.F=null}T(Ce,oe),Ce.prototype[Ds]=!0,Ce.prototype.removeEventListener=function(i,h,d,p){La(this,i,h,d,p)};function Ne(i,h){var d,p=i.F;if(p)for(d=[];p;p=p.F)d.push(p);if(i=i.M,p=h.type||h,typeof h=="string")h=new te(h,i);else if(h instanceof te)h.target=h.target||i;else{var C=h;h=new te(p,i),w(h,C)}if(C=!0,d)for(var N=d.length-1;0<=N;N--){var O=h.g=d[N];C=Us(O,p,!0,h)&&C}if(O=h.g=i,C=Us(O,p,!0,h)&&C,C=Us(O,p,!1,h)&&C,d)for(N=0;N<d.length;N++)O=h.g=d[N],C=Us(O,p,!1,h)&&C}Ce.prototype.N=function(){if(Ce.aa.N.call(this),this.i){var i=this.i,h;for(h in i.g){for(var d=i.g[h],p=0;p<d.length;p++)Ls(d[p]);delete i.g[h],i.h--}}this.F=null},Ce.prototype.K=function(i,h,d,p){return this.i.add(String(i),h,!1,d,p)},Ce.prototype.L=function(i,h,d,p){return this.i.add(String(i),h,!0,d,p)};function Us(i,h,d,p){if(h=i.i.g[String(h)],!h)return!0;h=h.concat();for(var C=!0,N=0;N<h.length;++N){var O=h[N];if(O&&!O.da&&O.capture==d){var ne=O.listener,be=O.ha||O.src;O.fa&&ai(i.i,O),C=ne.call(be,p)!==!1&&C}}return C&&!p.defaultPrevented}function Fa(i,h,d){if(typeof i=="function")d&&(i=b(i,d));else if(i&&typeof i.handleEvent=="function")i=b(i.handleEvent,i);else throw Error("Invalid listener argument");return 2147483647<Number(h)?-1:c.setTimeout(i,h||0)}function za(i){i.g=Fa(()=>{i.g=null,i.i&&(i.i=!1,za(i))},i.l);const h=i.h;i.h=null,i.m.apply(null,h)}class tf extends oe{constructor(h,d){super(),this.m=h,this.l=d,this.h=null,this.i=!1,this.g=null}j(h){this.h=arguments,this.g?this.i=!0:za(this)}N(){super.N(),this.g&&(c.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function jn(i){oe.call(this),this.h=i,this.g={}}T(jn,oe);var Ba=[];function Wa(i){J(i.g,function(h,d){this.g.hasOwnProperty(d)&&ui(h)},i),i.g={}}jn.prototype.N=function(){jn.aa.N.call(this),Wa(this)},jn.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var pi=c.JSON.stringify,nf=c.JSON.parse,sf=class{stringify(i){return c.JSON.stringify(i,void 0)}parse(i){return c.JSON.parse(i,void 0)}};function mi(){}mi.prototype.h=null;function Va(i){return i.h||(i.h=i.i())}function rf(){}var On={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function gi(){te.call(this,"d")}T(gi,te);function _i(){te.call(this,"c")}T(_i,te);var sn={},$a=null;function yi(){return $a=$a||new Ce}sn.La="serverreachability";function Ha(i){te.call(this,sn.La,i)}T(Ha,te);function Dn(i){const h=yi();Ne(h,new Ha(h))}sn.STAT_EVENT="statevent";function qa(i,h){te.call(this,sn.STAT_EVENT,i),this.stat=h}T(qa,te);function Ae(i){const h=yi();Ne(h,new qa(h,i))}sn.Ma="timingevent";function Ga(i,h){te.call(this,sn.Ma,i),this.size=h}T(Ga,te);function Ln(i,h){if(typeof i!="function")throw Error("Fn must not be null and must be a function");return c.setTimeout(function(){i()},h)}function Mn(){this.g=!0}Mn.prototype.xa=function(){this.g=!1};function of(i,h,d,p,C,N){i.info(function(){if(i.g)if(N)for(var O="",ne=N.split("&"),be=0;be<ne.length;be++){var K=ne[be].split("=");if(1<K.length){var Te=K[0];K=K[1];var ke=Te.split("_");O=2<=ke.length&&ke[1]=="type"?O+(Te+"="+K+"&"):O+(Te+"=redacted&")}}else O=null;else O=N;return"XMLHTTP REQ ("+p+") [attempt "+C+"]: "+h+`
`+d+`
`+O})}function af(i,h,d,p,C,N,O){i.info(function(){return"XMLHTTP RESP ("+p+") [ attempt "+C+"]: "+h+`
`+d+`
`+N+" "+O})}function rn(i,h,d,p){i.info(function(){return"XMLHTTP TEXT ("+h+"): "+cf(i,d)+(p?" "+p:"")})}function lf(i,h){i.info(function(){return"TIMEOUT: "+h})}Mn.prototype.info=function(){};function cf(i,h){if(!i.g)return h;if(!h)return null;try{var d=JSON.parse(h);if(d){for(i=0;i<d.length;i++)if(Array.isArray(d[i])){var p=d[i];if(!(2>p.length)){var C=p[1];if(Array.isArray(C)&&!(1>C.length)){var N=C[0];if(N!="noop"&&N!="stop"&&N!="close")for(var O=1;O<C.length;O++)C[O]=""}}}}return pi(d)}catch{return h}}var vi={NO_ERROR:0,TIMEOUT:8},hf={},xi;function Fs(){}T(Fs,mi),Fs.prototype.g=function(){return new XMLHttpRequest},Fs.prototype.i=function(){return{}},xi=new Fs;function gt(i,h,d,p){this.j=i,this.i=h,this.l=d,this.R=p||1,this.U=new jn(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Ka}function Ka(){this.i=null,this.g="",this.h=!1}var Ya={},bi={};function wi(i,h,d){i.L=1,i.v=Vs(tt(h)),i.m=d,i.P=!0,Ja(i,null)}function Ja(i,h){i.F=Date.now(),zs(i),i.A=tt(i.v);var d=i.A,p=i.R;Array.isArray(p)||(p=[String(p)]),hl(d.i,"t",p),i.C=0,d=i.j.J,i.h=new Ka,i.g=Sl(i.j,d?h:null,!i.m),0<i.O&&(i.M=new tf(b(i.Y,i,i.g),i.O)),h=i.U,d=i.g,p=i.ca;var C="readystatechange";Array.isArray(C)||(C&&(Ba[0]=C.toString()),C=Ba);for(var N=0;N<C.length;N++){var O=Da(d,C[N],p||h.handleEvent,!1,h.h||h);if(!O)break;h.g[O.key]=O}h=i.H?y(i.H):{},i.m?(i.u||(i.u="POST"),h["Content-Type"]="application/x-www-form-urlencoded",i.g.ea(i.A,i.u,i.m,h)):(i.u="GET",i.g.ea(i.A,i.u,null,h)),Dn(),of(i.i,i.u,i.A,i.l,i.R,i.m)}gt.prototype.ca=function(i){i=i.target;const h=this.M;h&&nt(i)==3?h.j():this.Y(i)},gt.prototype.Y=function(i){try{if(i==this.g)e:{const ke=nt(this.g);var h=this.g.Ba();const ln=this.g.Z();if(!(3>ke)&&(ke!=3||this.g&&(this.h.h||this.g.oa()||_l(this.g)))){this.J||ke!=4||h==7||(h==8||0>=ln?Dn(3):Dn(2)),Ei(this);var d=this.g.Z();this.X=d;t:if(Qa(this)){var p=_l(this.g);i="";var C=p.length,N=nt(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Mt(this),Un(this);var O="";break t}this.h.i=new c.TextDecoder}for(h=0;h<C;h++)this.h.h=!0,i+=this.h.i.decode(p[h],{stream:!(N&&h==C-1)});p.length=0,this.h.g+=i,this.C=0,O=this.h.g}else O=this.g.oa();if(this.o=d==200,af(this.i,this.u,this.A,this.l,this.R,ke,d),this.o){if(this.T&&!this.K){t:{if(this.g){var ne,be=this.g;if((ne=be.g?be.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!z(ne)){var K=ne;break t}}K=null}if(d=K)rn(this.i,this.l,d,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Ii(this,d);else{this.o=!1,this.s=3,Ae(12),Mt(this),Un(this);break e}}if(this.P){d=!0;let Ve;for(;!this.J&&this.C<O.length;)if(Ve=uf(this,O),Ve==bi){ke==4&&(this.s=4,Ae(14),d=!1),rn(this.i,this.l,null,"[Incomplete Response]");break}else if(Ve==Ya){this.s=4,Ae(15),rn(this.i,this.l,O,"[Invalid Chunk]"),d=!1;break}else rn(this.i,this.l,Ve,null),Ii(this,Ve);if(Qa(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),ke!=4||O.length!=0||this.h.h||(this.s=1,Ae(16),d=!1),this.o=this.o&&d,!d)rn(this.i,this.l,O,"[Invalid Chunked Response]"),Mt(this),Un(this);else if(0<O.length&&!this.W){this.W=!0;var Te=this.j;Te.g==this&&Te.ba&&!Te.M&&(Te.j.info("Great, no buffering proxy detected. Bytes received: "+O.length),Ai(Te),Te.M=!0,Ae(11))}}else rn(this.i,this.l,O,null),Ii(this,O);ke==4&&Mt(this),this.o&&!this.J&&(ke==4?Il(this.j,this):(this.o=!1,zs(this)))}else Sf(this.g),d==400&&0<O.indexOf("Unknown SID")?(this.s=3,Ae(12)):(this.s=0,Ae(13)),Mt(this),Un(this)}}}catch{}finally{}};function Qa(i){return i.g?i.u=="GET"&&i.L!=2&&i.j.Ca:!1}function uf(i,h){var d=i.C,p=h.indexOf(`
`,d);return p==-1?bi:(d=Number(h.substring(d,p)),isNaN(d)?Ya:(p+=1,p+d>h.length?bi:(h=h.slice(p,p+d),i.C=p+d,h)))}gt.prototype.cancel=function(){this.J=!0,Mt(this)};function zs(i){i.S=Date.now()+i.I,Xa(i,i.I)}function Xa(i,h){if(i.B!=null)throw Error("WatchDog timer not null");i.B=Ln(b(i.ba,i),h)}function Ei(i){i.B&&(c.clearTimeout(i.B),i.B=null)}gt.prototype.ba=function(){this.B=null;const i=Date.now();0<=i-this.S?(lf(this.i,this.A),this.L!=2&&(Dn(),Ae(17)),Mt(this),this.s=2,Un(this)):Xa(this,this.S-i)};function Un(i){i.j.G==0||i.J||Il(i.j,i)}function Mt(i){Ei(i);var h=i.M;h&&typeof h.ma=="function"&&h.ma(),i.M=null,Wa(i.U),i.g&&(h=i.g,i.g=null,h.abort(),h.ma())}function Ii(i,h){try{var d=i.j;if(d.G!=0&&(d.g==i||Ci(d.h,i))){if(!i.K&&Ci(d.h,i)&&d.G==3){try{var p=d.Da.g.parse(h)}catch{p=null}if(Array.isArray(p)&&p.length==3){var C=p;if(C[0]==0){e:if(!d.u){if(d.g)if(d.g.F+3e3<i.F)Ys(d),Gs(d);else break e;Ni(d),Ae(18)}}else d.za=C[1],0<d.za-d.T&&37500>C[2]&&d.F&&d.v==0&&!d.C&&(d.C=Ln(b(d.Za,d),6e3));if(1>=tl(d.h)&&d.ca){try{d.ca()}catch{}d.ca=void 0}}else Ft(d,11)}else if((i.K||d.g==i)&&Ys(d),!z(h))for(C=d.Da.g.parse(h),h=0;h<C.length;h++){let K=C[h];if(d.T=K[0],K=K[1],d.G==2)if(K[0]=="c"){d.K=K[1],d.ia=K[2];const Te=K[3];Te!=null&&(d.la=Te,d.j.info("VER="+d.la));const ke=K[4];ke!=null&&(d.Aa=ke,d.j.info("SVER="+d.Aa));const ln=K[5];ln!=null&&typeof ln=="number"&&0<ln&&(p=1.5*ln,d.L=p,d.j.info("backChannelRequestTimeoutMs_="+p)),p=d;const Ve=i.g;if(Ve){const Js=Ve.g?Ve.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Js){var N=p.h;N.g||Js.indexOf("spdy")==-1&&Js.indexOf("quic")==-1&&Js.indexOf("h2")==-1||(N.j=N.l,N.g=new Set,N.h&&(Ti(N,N.h),N.h=null))}if(p.D){const Ri=Ve.g?Ve.g.getResponseHeader("X-HTTP-Session-Id"):null;Ri&&(p.ya=Ri,ie(p.I,p.D,Ri))}}d.G=3,d.l&&d.l.ua(),d.ba&&(d.R=Date.now()-i.F,d.j.info("Handshake RTT: "+d.R+"ms")),p=d;var O=i;if(p.qa=kl(p,p.J?p.ia:null,p.W),O.K){nl(p.h,O);var ne=O,be=p.L;be&&(ne.I=be),ne.B&&(Ei(ne),zs(ne)),p.g=O}else wl(p);0<d.i.length&&Ks(d)}else K[0]!="stop"&&K[0]!="close"||Ft(d,7);else d.G==3&&(K[0]=="stop"||K[0]=="close"?K[0]=="stop"?Ft(d,7):Si(d):K[0]!="noop"&&d.l&&d.l.ta(K),d.v=0)}}Dn(4)}catch{}}var df=class{constructor(i,h){this.g=i,this.map=h}};function Za(i){this.l=i||10,c.PerformanceNavigationTiming?(i=c.performance.getEntriesByType("navigation"),i=0<i.length&&(i[0].nextHopProtocol=="hq"||i[0].nextHopProtocol=="h2")):i=!!(c.chrome&&c.chrome.loadTimes&&c.chrome.loadTimes()&&c.chrome.loadTimes().wasFetchedViaSpdy),this.j=i?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function el(i){return i.h?!0:i.g?i.g.size>=i.j:!1}function tl(i){return i.h?1:i.g?i.g.size:0}function Ci(i,h){return i.h?i.h==h:i.g?i.g.has(h):!1}function Ti(i,h){i.g?i.g.add(h):i.h=h}function nl(i,h){i.h&&i.h==h?i.h=null:i.g&&i.g.has(h)&&i.g.delete(h)}Za.prototype.cancel=function(){if(this.i=sl(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const i of this.g.values())i.cancel();this.g.clear()}};function sl(i){if(i.h!=null)return i.i.concat(i.h.D);if(i.g!=null&&i.g.size!==0){let h=i.i;for(const d of i.g.values())h=h.concat(d.D);return h}return R(i.i)}function ff(i){if(i.V&&typeof i.V=="function")return i.V();if(typeof Map<"u"&&i instanceof Map||typeof Set<"u"&&i instanceof Set)return Array.from(i.values());if(typeof i=="string")return i.split("");if(u(i)){for(var h=[],d=i.length,p=0;p<d;p++)h.push(i[p]);return h}h=[],d=0;for(p in i)h[d++]=i[p];return h}function pf(i){if(i.na&&typeof i.na=="function")return i.na();if(!i.V||typeof i.V!="function"){if(typeof Map<"u"&&i instanceof Map)return Array.from(i.keys());if(!(typeof Set<"u"&&i instanceof Set)){if(u(i)||typeof i=="string"){var h=[];i=i.length;for(var d=0;d<i;d++)h.push(d);return h}h=[],d=0;for(const p in i)h[d++]=p;return h}}}function rl(i,h){if(i.forEach&&typeof i.forEach=="function")i.forEach(h,void 0);else if(u(i)||typeof i=="string")Array.prototype.forEach.call(i,h,void 0);else for(var d=pf(i),p=ff(i),C=p.length,N=0;N<C;N++)h.call(void 0,p[N],d&&d[N],i)}var il=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function mf(i,h){if(i){i=i.split("&");for(var d=0;d<i.length;d++){var p=i[d].indexOf("="),C=null;if(0<=p){var N=i[d].substring(0,p);C=i[d].substring(p+1)}else N=i[d];h(N,C?decodeURIComponent(C.replace(/\+/g," ")):"")}}}function Ut(i){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,i instanceof Ut){this.h=i.h,Bs(this,i.j),this.o=i.o,this.g=i.g,Ws(this,i.s),this.l=i.l;var h=i.i,d=new Bn;d.i=h.i,h.g&&(d.g=new Map(h.g),d.h=h.h),ol(this,d),this.m=i.m}else i&&(h=String(i).match(il))?(this.h=!1,Bs(this,h[1]||"",!0),this.o=Fn(h[2]||""),this.g=Fn(h[3]||"",!0),Ws(this,h[4]),this.l=Fn(h[5]||"",!0),ol(this,h[6]||"",!0),this.m=Fn(h[7]||"")):(this.h=!1,this.i=new Bn(null,this.h))}Ut.prototype.toString=function(){var i=[],h=this.j;h&&i.push(zn(h,al,!0),":");var d=this.g;return(d||h=="file")&&(i.push("//"),(h=this.o)&&i.push(zn(h,al,!0),"@"),i.push(encodeURIComponent(String(d)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.s,d!=null&&i.push(":",String(d))),(d=this.l)&&(this.g&&d.charAt(0)!="/"&&i.push("/"),i.push(zn(d,d.charAt(0)=="/"?yf:_f,!0))),(d=this.i.toString())&&i.push("?",d),(d=this.m)&&i.push("#",zn(d,xf)),i.join("")};function tt(i){return new Ut(i)}function Bs(i,h,d){i.j=d?Fn(h,!0):h,i.j&&(i.j=i.j.replace(/:$/,""))}function Ws(i,h){if(h){if(h=Number(h),isNaN(h)||0>h)throw Error("Bad port number "+h);i.s=h}else i.s=null}function ol(i,h,d){h instanceof Bn?(i.i=h,bf(i.i,i.h)):(d||(h=zn(h,vf)),i.i=new Bn(h,i.h))}function ie(i,h,d){i.i.set(h,d)}function Vs(i){return ie(i,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),i}function Fn(i,h){return i?h?decodeURI(i.replace(/%25/g,"%2525")):decodeURIComponent(i):""}function zn(i,h,d){return typeof i=="string"?(i=encodeURI(i).replace(h,gf),d&&(i=i.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),i):null}function gf(i){return i=i.charCodeAt(0),"%"+(i>>4&15).toString(16)+(i&15).toString(16)}var al=/[#\/\?@]/g,_f=/[#\?:]/g,yf=/[#\?]/g,vf=/[#\?@]/g,xf=/#/g;function Bn(i,h){this.h=this.g=null,this.i=i||null,this.j=!!h}function _t(i){i.g||(i.g=new Map,i.h=0,i.i&&mf(i.i,function(h,d){i.add(decodeURIComponent(h.replace(/\+/g," ")),d)}))}n=Bn.prototype,n.add=function(i,h){_t(this),this.i=null,i=on(this,i);var d=this.g.get(i);return d||this.g.set(i,d=[]),d.push(h),this.h+=1,this};function ll(i,h){_t(i),h=on(i,h),i.g.has(h)&&(i.i=null,i.h-=i.g.get(h).length,i.g.delete(h))}function cl(i,h){return _t(i),h=on(i,h),i.g.has(h)}n.forEach=function(i,h){_t(this),this.g.forEach(function(d,p){d.forEach(function(C){i.call(h,C,p,this)},this)},this)},n.na=function(){_t(this);const i=Array.from(this.g.values()),h=Array.from(this.g.keys()),d=[];for(let p=0;p<h.length;p++){const C=i[p];for(let N=0;N<C.length;N++)d.push(h[p])}return d},n.V=function(i){_t(this);let h=[];if(typeof i=="string")cl(this,i)&&(h=h.concat(this.g.get(on(this,i))));else{i=Array.from(this.g.values());for(let d=0;d<i.length;d++)h=h.concat(i[d])}return h},n.set=function(i,h){return _t(this),this.i=null,i=on(this,i),cl(this,i)&&(this.h-=this.g.get(i).length),this.g.set(i,[h]),this.h+=1,this},n.get=function(i,h){return i?(i=this.V(i),0<i.length?String(i[0]):h):h};function hl(i,h,d){ll(i,h),0<d.length&&(i.i=null,i.g.set(on(i,h),R(d)),i.h+=d.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const i=[],h=Array.from(this.g.keys());for(var d=0;d<h.length;d++){var p=h[d];const N=encodeURIComponent(String(p)),O=this.V(p);for(p=0;p<O.length;p++){var C=N;O[p]!==""&&(C+="="+encodeURIComponent(String(O[p]))),i.push(C)}}return this.i=i.join("&")};function on(i,h){return h=String(h),i.j&&(h=h.toLowerCase()),h}function bf(i,h){h&&!i.j&&(_t(i),i.i=null,i.g.forEach(function(d,p){var C=p.toLowerCase();p!=C&&(ll(this,p),hl(this,C,d))},i)),i.j=h}function wf(i,h){const d=new Mn;if(c.Image){const p=new Image;p.onload=S(yt,d,"TestLoadImage: loaded",!0,h,p),p.onerror=S(yt,d,"TestLoadImage: error",!1,h,p),p.onabort=S(yt,d,"TestLoadImage: abort",!1,h,p),p.ontimeout=S(yt,d,"TestLoadImage: timeout",!1,h,p),c.setTimeout(function(){p.ontimeout&&p.ontimeout()},1e4),p.src=i}else h(!1)}function Ef(i,h){const d=new Mn,p=new AbortController,C=setTimeout(()=>{p.abort(),yt(d,"TestPingServer: timeout",!1,h)},1e4);fetch(i,{signal:p.signal}).then(N=>{clearTimeout(C),N.ok?yt(d,"TestPingServer: ok",!0,h):yt(d,"TestPingServer: server error",!1,h)}).catch(()=>{clearTimeout(C),yt(d,"TestPingServer: error",!1,h)})}function yt(i,h,d,p,C){try{C&&(C.onload=null,C.onerror=null,C.onabort=null,C.ontimeout=null),p(d)}catch{}}function If(){this.g=new sf}function Cf(i,h,d){const p=d||"";try{rl(i,function(C,N){let O=C;f(C)&&(O=pi(C)),h.push(p+N+"="+encodeURIComponent(O))})}catch(C){throw h.push(p+"type="+encodeURIComponent("_badmap")),C}}function $s(i){this.l=i.Ub||null,this.j=i.eb||!1}T($s,mi),$s.prototype.g=function(){return new Hs(this.l,this.j)},$s.prototype.i=function(i){return function(){return i}}({});function Hs(i,h){Ce.call(this),this.D=i,this.o=h,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}T(Hs,Ce),n=Hs.prototype,n.open=function(i,h){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=i,this.A=h,this.readyState=1,Vn(this)},n.send=function(i){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const h={headers:this.u,method:this.B,credentials:this.m,cache:void 0};i&&(h.body=i),(this.D||c).fetch(new Request(this.A,h)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Wn(this)),this.readyState=0},n.Sa=function(i){if(this.g&&(this.l=i,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=i.headers,this.readyState=2,Vn(this)),this.g&&(this.readyState=3,Vn(this),this.g)))if(this.responseType==="arraybuffer")i.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof c.ReadableStream<"u"&&"body"in i){if(this.j=i.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;ul(this)}else i.text().then(this.Ra.bind(this),this.ga.bind(this))};function ul(i){i.j.read().then(i.Pa.bind(i)).catch(i.ga.bind(i))}n.Pa=function(i){if(this.g){if(this.o&&i.value)this.response.push(i.value);else if(!this.o){var h=i.value?i.value:new Uint8Array(0);(h=this.v.decode(h,{stream:!i.done}))&&(this.response=this.responseText+=h)}i.done?Wn(this):Vn(this),this.readyState==3&&ul(this)}},n.Ra=function(i){this.g&&(this.response=this.responseText=i,Wn(this))},n.Qa=function(i){this.g&&(this.response=i,Wn(this))},n.ga=function(){this.g&&Wn(this)};function Wn(i){i.readyState=4,i.l=null,i.j=null,i.v=null,Vn(i)}n.setRequestHeader=function(i,h){this.u.append(i,h)},n.getResponseHeader=function(i){return this.h&&this.h.get(i.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const i=[],h=this.h.entries();for(var d=h.next();!d.done;)d=d.value,i.push(d[0]+": "+d[1]),d=h.next();return i.join(`\r
`)};function Vn(i){i.onreadystatechange&&i.onreadystatechange.call(i)}Object.defineProperty(Hs.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(i){this.m=i?"include":"same-origin"}});function dl(i){let h="";return J(i,function(d,p){h+=p,h+=":",h+=d,h+=`\r
`}),h}function ki(i,h,d){e:{for(p in d){var p=!1;break e}p=!0}p||(d=dl(d),typeof i=="string"?d!=null&&encodeURIComponent(String(d)):ie(i,h,d))}function he(i){Ce.call(this),this.headers=new Map,this.o=i||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}T(he,Ce);var Tf=/^https?$/i,kf=["POST","PUT"];n=he.prototype,n.Ha=function(i){this.J=i},n.ea=function(i,h,d,p){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+i);h=h?h.toUpperCase():"GET",this.D=i,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():xi.g(),this.v=this.o?Va(this.o):Va(xi),this.g.onreadystatechange=b(this.Ea,this);try{this.B=!0,this.g.open(h,String(i),!0),this.B=!1}catch(N){fl(this,N);return}if(i=d||"",d=new Map(this.headers),p)if(Object.getPrototypeOf(p)===Object.prototype)for(var C in p)d.set(C,p[C]);else if(typeof p.keys=="function"&&typeof p.get=="function")for(const N of p.keys())d.set(N,p.get(N));else throw Error("Unknown input type for opt_headers: "+String(p));p=Array.from(d.keys()).find(N=>N.toLowerCase()=="content-type"),C=c.FormData&&i instanceof c.FormData,!(0<=Array.prototype.indexOf.call(kf,h,void 0))||p||C||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[N,O]of d)this.g.setRequestHeader(N,O);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{gl(this),this.u=!0,this.g.send(i),this.u=!1}catch(N){fl(this,N)}};function fl(i,h){i.h=!1,i.g&&(i.j=!0,i.g.abort(),i.j=!1),i.l=h,i.m=5,pl(i),qs(i)}function pl(i){i.A||(i.A=!0,Ne(i,"complete"),Ne(i,"error"))}n.abort=function(i){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=i||7,Ne(this,"complete"),Ne(this,"abort"),qs(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),qs(this,!0)),he.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?ml(this):this.bb())},n.bb=function(){ml(this)};function ml(i){if(i.h&&typeof a<"u"&&(!i.v[1]||nt(i)!=4||i.Z()!=2)){if(i.u&&nt(i)==4)Fa(i.Ea,0,i);else if(Ne(i,"readystatechange"),nt(i)==4){i.h=!1;try{const O=i.Z();e:switch(O){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var h=!0;break e;default:h=!1}var d;if(!(d=h)){var p;if(p=O===0){var C=String(i.D).match(il)[1]||null;!C&&c.self&&c.self.location&&(C=c.self.location.protocol.slice(0,-1)),p=!Tf.test(C?C.toLowerCase():"")}d=p}if(d)Ne(i,"complete"),Ne(i,"success");else{i.m=6;try{var N=2<nt(i)?i.g.statusText:""}catch{N=""}i.l=N+" ["+i.Z()+"]",pl(i)}}finally{qs(i)}}}}function qs(i,h){if(i.g){gl(i);const d=i.g,p=i.v[0]?()=>{}:null;i.g=null,i.v=null,h||Ne(i,"ready");try{d.onreadystatechange=p}catch{}}}function gl(i){i.I&&(c.clearTimeout(i.I),i.I=null)}n.isActive=function(){return!!this.g};function nt(i){return i.g?i.g.readyState:0}n.Z=function(){try{return 2<nt(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(i){if(this.g){var h=this.g.responseText;return i&&h.indexOf(i)==0&&(h=h.substring(i.length)),nf(h)}};function _l(i){try{if(!i.g)return null;if("response"in i.g)return i.g.response;switch(i.H){case"":case"text":return i.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in i.g)return i.g.mozResponseArrayBuffer}return null}catch{return null}}function Sf(i){const h={};i=(i.g&&2<=nt(i)&&i.g.getAllResponseHeaders()||"").split(`\r
`);for(let p=0;p<i.length;p++){if(z(i[p]))continue;var d=E(i[p]);const C=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const N=h[C]||[];h[C]=N,N.push(d)}v(h,function(p){return p.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function $n(i,h,d){return d&&d.internalChannelParams&&d.internalChannelParams[i]||h}function yl(i){this.Aa=0,this.i=[],this.j=new Mn,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=$n("failFast",!1,i),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=$n("baseRetryDelayMs",5e3,i),this.cb=$n("retryDelaySeedMs",1e4,i),this.Wa=$n("forwardChannelMaxRetries",2,i),this.wa=$n("forwardChannelRequestTimeoutMs",2e4,i),this.pa=i&&i.xmlHttpFactory||void 0,this.Xa=i&&i.Tb||void 0,this.Ca=i&&i.useFetchStreams||!1,this.L=void 0,this.J=i&&i.supportsCrossDomainXhr||!1,this.K="",this.h=new Za(i&&i.concurrentRequestLimit),this.Da=new If,this.P=i&&i.fastHandshake||!1,this.O=i&&i.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=i&&i.Rb||!1,i&&i.xa&&this.j.xa(),i&&i.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&i&&i.detectBufferingProxy||!1,this.ja=void 0,i&&i.longPollingTimeout&&0<i.longPollingTimeout&&(this.ja=i.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=yl.prototype,n.la=8,n.G=1,n.connect=function(i,h,d,p){Ae(0),this.W=i,this.H=h||{},d&&p!==void 0&&(this.H.OSID=d,this.H.OAID=p),this.F=this.X,this.I=kl(this,null,this.W),Ks(this)};function Si(i){if(vl(i),i.G==3){var h=i.U++,d=tt(i.I);if(ie(d,"SID",i.K),ie(d,"RID",h),ie(d,"TYPE","terminate"),Hn(i,d),h=new gt(i,i.j,h),h.L=2,h.v=Vs(tt(d)),d=!1,c.navigator&&c.navigator.sendBeacon)try{d=c.navigator.sendBeacon(h.v.toString(),"")}catch{}!d&&c.Image&&(new Image().src=h.v,d=!0),d||(h.g=Sl(h.j,null),h.g.ea(h.v)),h.F=Date.now(),zs(h)}Tl(i)}function Gs(i){i.g&&(Ai(i),i.g.cancel(),i.g=null)}function vl(i){Gs(i),i.u&&(c.clearTimeout(i.u),i.u=null),Ys(i),i.h.cancel(),i.s&&(typeof i.s=="number"&&c.clearTimeout(i.s),i.s=null)}function Ks(i){if(!el(i.h)&&!i.s){i.s=!0;var h=i.Ga;de||Ie(),fe||(de(),fe=!0),me.add(h,i),i.B=0}}function Nf(i,h){return tl(i.h)>=i.h.j-(i.s?1:0)?!1:i.s?(i.i=h.D.concat(i.i),!0):i.G==1||i.G==2||i.B>=(i.Va?0:i.Wa)?!1:(i.s=Ln(b(i.Ga,i,h),Cl(i,i.B)),i.B++,!0)}n.Ga=function(i){if(this.s)if(this.s=null,this.G==1){if(!i){this.U=Math.floor(1e5*Math.random()),i=this.U++;const C=new gt(this,this.j,i);let N=this.o;if(this.S&&(N?(N=y(N),w(N,this.S)):N=this.S),this.m!==null||this.O||(C.H=N,N=null),this.P)e:{for(var h=0,d=0;d<this.i.length;d++){t:{var p=this.i[d];if("__data__"in p.map&&(p=p.map.__data__,typeof p=="string")){p=p.length;break t}p=void 0}if(p===void 0)break;if(h+=p,4096<h){h=d;break e}if(h===4096||d===this.i.length-1){h=d+1;break e}}h=1e3}else h=1e3;h=bl(this,C,h),d=tt(this.I),ie(d,"RID",i),ie(d,"CVER",22),this.D&&ie(d,"X-HTTP-Session-Id",this.D),Hn(this,d),N&&(this.O?h="headers="+encodeURIComponent(String(dl(N)))+"&"+h:this.m&&ki(d,this.m,N)),Ti(this.h,C),this.Ua&&ie(d,"TYPE","init"),this.P?(ie(d,"$req",h),ie(d,"SID","null"),C.T=!0,wi(C,d,null)):wi(C,d,h),this.G=2}}else this.G==3&&(i?xl(this,i):this.i.length==0||el(this.h)||xl(this))};function xl(i,h){var d;h?d=h.l:d=i.U++;const p=tt(i.I);ie(p,"SID",i.K),ie(p,"RID",d),ie(p,"AID",i.T),Hn(i,p),i.m&&i.o&&ki(p,i.m,i.o),d=new gt(i,i.j,d,i.B+1),i.m===null&&(d.H=i.o),h&&(i.i=h.D.concat(i.i)),h=bl(i,d,1e3),d.I=Math.round(.5*i.wa)+Math.round(.5*i.wa*Math.random()),Ti(i.h,d),wi(d,p,h)}function Hn(i,h){i.H&&J(i.H,function(d,p){ie(h,p,d)}),i.l&&rl({},function(d,p){ie(h,p,d)})}function bl(i,h,d){d=Math.min(i.i.length,d);var p=i.l?b(i.l.Na,i.l,i):null;e:{var C=i.i;let N=-1;for(;;){const O=["count="+d];N==-1?0<d?(N=C[0].g,O.push("ofs="+N)):N=0:O.push("ofs="+N);let ne=!0;for(let be=0;be<d;be++){let K=C[be].g;const Te=C[be].map;if(K-=N,0>K)N=Math.max(0,C[be].g-100),ne=!1;else try{Cf(Te,O,"req"+K+"_")}catch{p&&p(Te)}}if(ne){p=O.join("&");break e}}}return i=i.i.splice(0,d),h.D=i,p}function wl(i){if(!i.g&&!i.u){i.Y=1;var h=i.Fa;de||Ie(),fe||(de(),fe=!0),me.add(h,i),i.v=0}}function Ni(i){return i.g||i.u||3<=i.v?!1:(i.Y++,i.u=Ln(b(i.Fa,i),Cl(i,i.v)),i.v++,!0)}n.Fa=function(){if(this.u=null,El(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var i=2*this.R;this.j.info("BP detection timer enabled: "+i),this.A=Ln(b(this.ab,this),i)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Ae(10),Gs(this),El(this))};function Ai(i){i.A!=null&&(c.clearTimeout(i.A),i.A=null)}function El(i){i.g=new gt(i,i.j,"rpc",i.Y),i.m===null&&(i.g.H=i.o),i.g.O=0;var h=tt(i.qa);ie(h,"RID","rpc"),ie(h,"SID",i.K),ie(h,"AID",i.T),ie(h,"CI",i.F?"0":"1"),!i.F&&i.ja&&ie(h,"TO",i.ja),ie(h,"TYPE","xmlhttp"),Hn(i,h),i.m&&i.o&&ki(h,i.m,i.o),i.L&&(i.g.I=i.L);var d=i.g;i=i.ia,d.L=1,d.v=Vs(tt(h)),d.m=null,d.P=!0,Ja(d,i)}n.Za=function(){this.C!=null&&(this.C=null,Gs(this),Ni(this),Ae(19))};function Ys(i){i.C!=null&&(c.clearTimeout(i.C),i.C=null)}function Il(i,h){var d=null;if(i.g==h){Ys(i),Ai(i),i.g=null;var p=2}else if(Ci(i.h,h))d=h.D,nl(i.h,h),p=1;else return;if(i.G!=0){if(h.o)if(p==1){d=h.m?h.m.length:0,h=Date.now()-h.F;var C=i.B;p=yi(),Ne(p,new Ga(p,d)),Ks(i)}else wl(i);else if(C=h.s,C==3||C==0&&0<h.X||!(p==1&&Nf(i,h)||p==2&&Ni(i)))switch(d&&0<d.length&&(h=i.h,h.i=h.i.concat(d)),C){case 1:Ft(i,5);break;case 4:Ft(i,10);break;case 3:Ft(i,6);break;default:Ft(i,2)}}}function Cl(i,h){let d=i.Ta+Math.floor(Math.random()*i.cb);return i.isActive()||(d*=2),d*h}function Ft(i,h){if(i.j.info("Error code "+h),h==2){var d=b(i.fb,i),p=i.Xa;const C=!p;p=new Ut(p||"//www.google.com/images/cleardot.gif"),c.location&&c.location.protocol=="http"||Bs(p,"https"),Vs(p),C?wf(p.toString(),d):Ef(p.toString(),d)}else Ae(2);i.G=0,i.l&&i.l.sa(h),Tl(i),vl(i)}n.fb=function(i){i?(this.j.info("Successfully pinged google.com"),Ae(2)):(this.j.info("Failed to ping google.com"),Ae(1))};function Tl(i){if(i.G=0,i.ka=[],i.l){const h=sl(i.h);(h.length!=0||i.i.length!=0)&&(A(i.ka,h),A(i.ka,i.i),i.h.i.length=0,R(i.i),i.i.length=0),i.l.ra()}}function kl(i,h,d){var p=d instanceof Ut?tt(d):new Ut(d);if(p.g!="")h&&(p.g=h+"."+p.g),Ws(p,p.s);else{var C=c.location;p=C.protocol,h=h?h+"."+C.hostname:C.hostname,C=+C.port;var N=new Ut(null);p&&Bs(N,p),h&&(N.g=h),C&&Ws(N,C),d&&(N.l=d),p=N}return d=i.D,h=i.ya,d&&h&&ie(p,d,h),ie(p,"VER",i.la),Hn(i,p),p}function Sl(i,h,d){if(h&&!i.J)throw Error("Can't create secondary domain capable XhrIo object.");return h=i.Ca&&!i.pa?new he(new $s({eb:d})):new he(i.pa),h.Ha(i.J),h}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Nl(){}n=Nl.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function ze(i,h){Ce.call(this),this.g=new yl(h),this.l=i,this.h=h&&h.messageUrlParams||null,i=h&&h.messageHeaders||null,h&&h.clientProtocolHeaderRequired&&(i?i["X-Client-Protocol"]="webchannel":i={"X-Client-Protocol":"webchannel"}),this.g.o=i,i=h&&h.initMessageHeaders||null,h&&h.messageContentType&&(i?i["X-WebChannel-Content-Type"]=h.messageContentType:i={"X-WebChannel-Content-Type":h.messageContentType}),h&&h.va&&(i?i["X-WebChannel-Client-Profile"]=h.va:i={"X-WebChannel-Client-Profile":h.va}),this.g.S=i,(i=h&&h.Sb)&&!z(i)&&(this.g.m=i),this.v=h&&h.supportsCrossDomainXhr||!1,this.u=h&&h.sendRawJson||!1,(h=h&&h.httpSessionIdParam)&&!z(h)&&(this.g.D=h,i=this.h,i!==null&&h in i&&(i=this.h,h in i&&delete i[h])),this.j=new an(this)}T(ze,Ce),ze.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},ze.prototype.close=function(){Si(this.g)},ze.prototype.o=function(i){var h=this.g;if(typeof i=="string"){var d={};d.__data__=i,i=d}else this.u&&(d={},d.__data__=pi(i),i=d);h.i.push(new df(h.Ya++,i)),h.G==3&&Ks(h)},ze.prototype.N=function(){this.g.l=null,delete this.j,Si(this.g),delete this.g,ze.aa.N.call(this)};function Al(i){gi.call(this),i.__headers__&&(this.headers=i.__headers__,this.statusCode=i.__status__,delete i.__headers__,delete i.__status__);var h=i.__sm__;if(h){e:{for(const d in h){i=d;break e}i=void 0}(this.i=i)&&(i=this.i,h=h!==null&&i in h?h[i]:void 0),this.data=h}else this.data=i}T(Al,gi);function Rl(){_i.call(this),this.status=1}T(Rl,_i);function an(i){this.g=i}T(an,Nl),an.prototype.ua=function(){Ne(this.g,"a")},an.prototype.ta=function(i){Ne(this.g,new Al(i))},an.prototype.sa=function(i){Ne(this.g,new Rl)},an.prototype.ra=function(){Ne(this.g,"b")},ze.prototype.send=ze.prototype.o,ze.prototype.open=ze.prototype.m,ze.prototype.close=ze.prototype.close,vi.NO_ERROR=0,vi.TIMEOUT=8,vi.HTTP_ERROR=6,hf.COMPLETE="complete",rf.EventType=On,On.OPEN="a",On.CLOSE="b",On.ERROR="c",On.MESSAGE="d",Ce.prototype.listen=Ce.prototype.K,he.prototype.listenOnce=he.prototype.L,he.prototype.getLastError=he.prototype.Ka,he.prototype.getLastErrorCode=he.prototype.Ba,he.prototype.getStatus=he.prototype.Z,he.prototype.getResponseJson=he.prototype.Oa,he.prototype.getResponseText=he.prototype.oa,he.prototype.send=he.prototype.ea,he.prototype.setWithCredentials=he.prototype.Ha}).apply(typeof er<"u"?er:typeof self<"u"?self:typeof window<"u"?window:{});const Ic="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Re{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Re.UNAUTHENTICATED=new Re(null),Re.GOOGLE_CREDENTIALS=new Re("google-credentials-uid"),Re.FIRST_PARTY=new Re("first-party-uid"),Re.MOCK_USER=new Re("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Cs="10.14.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _n=new $r("@firebase/firestore");function qe(n,...e){if(_n.logLevel<=X.DEBUG){const t=e.map(Jo);_n.debug(`Firestore (${Cs}): ${n}`,...t)}}function Ru(n,...e){if(_n.logLevel<=X.ERROR){const t=e.map(Jo);_n.error(`Firestore (${Cs}): ${n}`,...t)}}function ty(n,...e){if(_n.logLevel<=X.WARN){const t=e.map(Jo);_n.warn(`Firestore (${Cs}): ${n}`,...t)}}function Jo(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(t){return JSON.stringify(t)}(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qo(n="Unexpected state"){const e=`FIRESTORE (${Cs}) INTERNAL ASSERTION FAILED: `+n;throw Ru(e),new Error(e)}function Zn(n,e){n||Qo()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const De={CANCELLED:"cancelled",INVALID_ARGUMENT:"invalid-argument",FAILED_PRECONDITION:"failed-precondition"};class Le extends pt{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class es{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pu{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class ny{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(Re.UNAUTHENTICATED))}shutdown(){}}class sy{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class ry{constructor(e){this.t=e,this.currentUser=Re.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){Zn(this.o===void 0);let s=this.i;const r=u=>this.i!==s?(s=this.i,t(u)):Promise.resolve();let o=new es;this.o=()=>{this.i++,this.currentUser=this.u(),o.resolve(),o=new es,e.enqueueRetryable(()=>r(this.currentUser))};const a=()=>{const u=o;e.enqueueRetryable(async()=>{await u.promise,await r(this.currentUser)})},c=u=>{qe("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(u=>c(u)),setTimeout(()=>{if(!this.auth){const u=this.t.getImmediate({optional:!0});u?c(u):(qe("FirebaseAuthCredentialsProvider","Auth not yet detected"),o.resolve(),o=new es)}},0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(s=>this.i!==e?(qe("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):s?(Zn(typeof s.accessToken=="string"),new Pu(s.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return Zn(e===null||typeof e=="string"),new Re(e)}}class iy{constructor(e,t,s){this.l=e,this.h=t,this.P=s,this.type="FirstParty",this.user=Re.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class oy{constructor(e,t,s){this.l=e,this.h=t,this.P=s}getToken(){return Promise.resolve(new iy(this.l,this.h,this.P))}start(e,t){e.enqueueRetryable(()=>t(Re.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class ay{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class ly{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,t){Zn(this.o===void 0);const s=o=>{o.error!=null&&qe("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${o.error.message}`);const a=o.token!==this.R;return this.R=o.token,qe("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(o.token):Promise.resolve()};this.o=o=>{e.enqueueRetryable(()=>s(o))};const r=o=>{qe("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=o,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(o=>r(o)),setTimeout(()=>{if(!this.appCheck){const o=this.A.getImmediate({optional:!0});o?r(o):qe("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(Zn(typeof t.token=="string"),this.R=t.token,new ay(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}function cy(n){return n.name==="IndexedDbTransactionError"}class Cr{constructor(e,t){this.projectId=e,this.database=t||"(default)"}static empty(){return new Cr("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof Cr&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Cc,q;(q=Cc||(Cc={}))[q.OK=0]="OK",q[q.CANCELLED=1]="CANCELLED",q[q.UNKNOWN=2]="UNKNOWN",q[q.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",q[q.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",q[q.NOT_FOUND=5]="NOT_FOUND",q[q.ALREADY_EXISTS=6]="ALREADY_EXISTS",q[q.PERMISSION_DENIED=7]="PERMISSION_DENIED",q[q.UNAUTHENTICATED=16]="UNAUTHENTICATED",q[q.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",q[q.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",q[q.ABORTED=10]="ABORTED",q[q.OUT_OF_RANGE=11]="OUT_OF_RANGE",q[q.UNIMPLEMENTED=12]="UNIMPLEMENTED",q[q.INTERNAL=13]="INTERNAL",q[q.UNAVAILABLE=14]="UNAVAILABLE",q[q.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new Au([4294967295,4294967295],0);function zi(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hy{constructor(e,t,s=1e3,r=1.5,o=6e4){this.ui=e,this.timerId=t,this.ko=s,this.qo=r,this.Qo=o,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const t=Math.floor(this.Ko+this.zo()),s=Math.max(0,Date.now()-this.Uo),r=Math.max(0,t-s);r>0&&qe("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.Ko} ms, delay with jitter: ${t} ms, last attempt: ${s} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,r,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xo{constructor(e,t,s,r,o){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=s,this.op=r,this.removalCallback=o,this.deferred=new es,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,s,r,o){const a=Date.now()+s,c=new Xo(e,t,a,r,o);return c.start(s),c}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new Le(De.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}var Tc,kc;(kc=Tc||(Tc={})).ea="default",kc.Cache="cache";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uy(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sc=new Map;function dy(n,e,t,s){if(e===!0&&s===!0)throw new Le(De.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function fy(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(s){return s.constructor?s.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":Qo()}function py(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new Le(De.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=fy(n);throw new Le(De.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nc{constructor(e){var t,s;if(e.host===void 0){if(e.ssl!==void 0)throw new Le(De.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(t=e.ssl)===null||t===void 0||t;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new Le(De.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}dy("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=uy((s=e.experimentalLongPollingOptions)!==null&&s!==void 0?s:{}),function(o){if(o.timeoutSeconds!==void 0){if(isNaN(o.timeoutSeconds))throw new Le(De.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (must not be NaN)`);if(o.timeoutSeconds<5)throw new Le(De.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (minimum allowed value is 5)`);if(o.timeoutSeconds>30)throw new Le(De.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(s,r){return s.timeoutSeconds===r.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class ju{constructor(e,t,s,r){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=s,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Nc({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new Le(De.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new Le(De.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Nc(e),e.credentials!==void 0&&(this._authCredentials=function(s){if(!s)return new ny;switch(s.type){case"firstParty":return new oy(s.sessionIndex||"0",s.iamToken||null,s.authTokenFactory||null);case"provider":return s.client;default:throw new Le(De.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const s=Sc.get(t);s&&(qe("ComponentProvider","Removing Datastore"),Sc.delete(t),s.terminate())}(this),Promise.resolve()}}function my(n,e,t,s={}){var r;const o=(n=py(n,ju))._getSettings(),a=`${e}:${t}`;if(o.host!=="firestore.googleapis.com"&&o.host!==a&&ty("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),n._setSettings(Object.assign(Object.assign({},o),{host:a,ssl:!1})),s.mockUserToken){let c,u;if(typeof s.mockUserToken=="string")c=s.mockUserToken,u=Re.MOCK_USER;else{c=Bh(s.mockUserToken,(r=n._app)===null||r===void 0?void 0:r.options.projectId);const f=s.mockUserToken.sub||s.mockUserToken.user_id;if(!f)throw new Le(De.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");u=new Re(f)}n._authCredentials=new sy(new Pu(c,u))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ac{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new hy(this,"async_queue_retry"),this.Vu=()=>{const s=zi();s&&qe("AsyncQueue","Visibility state changed to "+s.visibilityState),this.t_.jo()},this.mu=e;const t=zi();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const t=zi();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const t=new es;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!cy(e))throw e;qe("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const t=this.mu.then(()=>(this.du=!0,e().catch(s=>{this.Eu=s,this.du=!1;const r=function(a){let c=a.message||"";return a.stack&&(c=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),c}(s);throw Ru("INTERNAL UNHANDLED ERROR: ",r),s}).then(s=>(this.du=!1,s))));return this.mu=t,t}enqueueAfterDelay(e,t,s){this.fu(),this.Ru.indexOf(e)>-1&&(t=0);const r=Xo.createAndSchedule(this,e,t,s,o=>this.yu(o));return this.Tu.push(r),r}fu(){this.Eu&&Qo()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const t of this.Tu)if(t.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((t,s)=>t.targetTimeMs-s.targetTimeMs);for(const t of this.Tu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const t=this.Tu.indexOf(e);this.Tu.splice(t,1)}}class gy extends ju{constructor(e,t,s,r){super(e,t,s,r),this.type="firestore",this._queue=new Ac,this._persistenceKey=(r==null?void 0:r.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Ac(e),this._firestoreClient=void 0,await e}}}function _y(n,e){const t=typeof n=="object"?n:Uo(),s=typeof n=="string"?n:"(default)",r=Hr(t,"firestore").getImmediate({identifier:s});if(!r._initialized){const o=Uh("firestore");o&&my(r,...o)}return r}(function(e,t=!0){(function(r){Cs=r})(Zt),Ht(new At("firestore",(s,{instanceIdentifier:r,options:o})=>{const a=s.getProvider("app").getImmediate(),c=new gy(new ry(s.getProvider("auth-internal")),new ly(s.getProvider("app-check-internal")),function(f,_){if(!Object.prototype.hasOwnProperty.apply(f.options,["projectId"]))throw new Le(De.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Cr(f.options.projectId,_)}(a,r),a);return o=Object.assign({useFetchStreams:t},o),c._setSettings(o),c},"PUBLIC").setMultipleInstances(!0)),Xe(Ic,"4.7.3",e),Xe(Ic,"4.7.3","esm2017")})();var Rc={};const Pc="@firebase/database",jc="1.0.8";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ou="";function yy(n){Ou=n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vy{constructor(e){this.domStorage_=e,this.prefix_="firebase:"}set(e,t){t==null?this.domStorage_.removeItem(this.prefixedName_(e)):this.domStorage_.setItem(this.prefixedName_(e),ge(t))}get(e){const t=this.domStorage_.getItem(this.prefixedName_(e));return t==null?null:ls(t)}remove(e){this.domStorage_.removeItem(this.prefixedName_(e))}prefixedName_(e){return this.prefix_+e}toString(){return this.domStorage_.toString()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xy{constructor(){this.cache_={},this.isInMemoryStorage=!0}set(e,t){t==null?delete this.cache_[e]:this.cache_[e]=t}get(e){return Je(this.cache_,e)?this.cache_[e]:null}remove(e){delete this.cache_[e]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Du=function(n){try{if(typeof window<"u"&&typeof window[n]<"u"){const e=window[n];return e.setItem("firebase:sentinel","cache"),e.removeItem("firebase:sentinel"),new vy(e)}}catch{}return new xy},Vt=Du("localStorage"),by=Du("sessionStorage");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pn=new $r("@firebase/database"),Lu=function(){let n=1;return function(){return n++}}(),Mu=function(n){const e=Am(n),t=new Tm;t.update(e);const s=t.digest();return Oo.encodeByteArray(s)},Ts=function(...n){let e="";for(let t=0;t<n.length;t++){const s=n[t];Array.isArray(s)||s&&typeof s=="object"&&typeof s.length=="number"?e+=Ts.apply(null,s):typeof s=="object"?e+=ge(s):e+=s,e+=" "}return e};let ts=null,Oc=!0;const wy=function(n,e){P(!0,"Can't turn on custom loggers persistently."),pn.logLevel=X.VERBOSE,ts=pn.log.bind(pn)},we=function(...n){if(Oc===!0&&(Oc=!1,ts===null&&by.get("logging_enabled")===!0&&wy()),ts){const e=Ts.apply(null,n);ts(e)}},ks=function(n){return function(...e){we(n,...e)}},ho=function(...n){const e="FIREBASE INTERNAL ERROR: "+Ts(...n);pn.error(e)},dt=function(...n){const e=`FIREBASE FATAL ERROR: ${Ts(...n)}`;throw pn.error(e),new Error(e)},je=function(...n){const e="FIREBASE WARNING: "+Ts(...n);pn.warn(e)},Ey=function(){typeof window<"u"&&window.location&&window.location.protocol&&window.location.protocol.indexOf("https:")!==-1&&je("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().")},Zo=function(n){return typeof n=="number"&&(n!==n||n===Number.POSITIVE_INFINITY||n===Number.NEGATIVE_INFINITY)},Iy=function(n){if(document.readyState==="complete")n();else{let e=!1;const t=function(){if(!document.body){setTimeout(t,Math.floor(10));return}e||(e=!0,n())};document.addEventListener?(document.addEventListener("DOMContentLoaded",t,!1),window.addEventListener("load",t,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",()=>{document.readyState==="complete"&&t()}),window.attachEvent("onload",t))}},yn="[MIN_NAME]",Kt="[MAX_NAME]",en=function(n,e){if(n===e)return 0;if(n===yn||e===Kt)return-1;if(e===yn||n===Kt)return 1;{const t=Dc(n),s=Dc(e);return t!==null?s!==null?t-s===0?n.length-e.length:t-s:-1:s!==null?1:n<e?-1:1}},Cy=function(n,e){return n===e?0:n<e?-1:1},qn=function(n,e){if(e&&n in e)return e[n];throw new Error("Missing required key ("+n+") in object: "+ge(e))},ea=function(n){if(typeof n!="object"||n===null)return ge(n);const e=[];for(const s in n)e.push(s);e.sort();let t="{";for(let s=0;s<e.length;s++)s!==0&&(t+=","),t+=ge(e[s]),t+=":",t+=ea(n[e[s]]);return t+="}",t},Uu=function(n,e){const t=n.length;if(t<=e)return[n];const s=[];for(let r=0;r<t;r+=e)r+e>t?s.push(n.substring(r,t)):s.push(n.substring(r,r+e));return s};function Ee(n,e){for(const t in n)n.hasOwnProperty(t)&&e(t,n[t])}const Fu=function(n){P(!Zo(n),"Invalid JSON number");const e=11,t=52,s=(1<<e-1)-1;let r,o,a,c,u;n===0?(o=0,a=0,r=1/n===-1/0?1:0):(r=n<0,n=Math.abs(n),n>=Math.pow(2,1-s)?(c=Math.min(Math.floor(Math.log(n)/Math.LN2),s),o=c+s,a=Math.round(n*Math.pow(2,t-c)-Math.pow(2,t))):(o=0,a=Math.round(n/Math.pow(2,1-s-t))));const f=[];for(u=t;u;u-=1)f.push(a%2?1:0),a=Math.floor(a/2);for(u=e;u;u-=1)f.push(o%2?1:0),o=Math.floor(o/2);f.push(r?1:0),f.reverse();const _=f.join("");let m="";for(u=0;u<64;u+=8){let b=parseInt(_.substr(u,8),2).toString(16);b.length===1&&(b="0"+b),m=m+b}return m.toLowerCase()},Ty=function(){return!!(typeof window=="object"&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))},ky=function(){return typeof Windows=="object"&&typeof Windows.UI=="object"};function Sy(n,e){let t="Unknown Error";n==="too_big"?t="The data requested exceeds the maximum size that can be accessed with a single request.":n==="permission_denied"?t="Client doesn't have permission to access the desired data.":n==="unavailable"&&(t="The service is unavailable");const s=new Error(n+" at "+e._path.toString()+": "+t);return s.code=n.toUpperCase(),s}const Ny=new RegExp("^-?(0*)\\d{1,10}$"),Ay=-2147483648,Ry=2147483647,Dc=function(n){if(Ny.test(n)){const e=Number(n);if(e>=Ay&&e<=Ry)return e}return null},Nn=function(n){try{n()}catch(e){setTimeout(()=>{const t=e.stack||"";throw je("Exception was thrown by user callback.",t),e},Math.floor(0))}},Py=function(){return(typeof window=="object"&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i)>=0},ns=function(n,e){const t=setTimeout(n,e);return typeof t=="number"&&typeof Deno<"u"&&Deno.unrefTimer?Deno.unrefTimer(t):typeof t=="object"&&t.unref&&t.unref(),t};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jy{constructor(e,t){this.appName_=e,this.appCheckProvider=t,this.appCheck=t==null?void 0:t.getImmediate({optional:!0}),this.appCheck||t==null||t.get().then(s=>this.appCheck=s)}getToken(e){return this.appCheck?this.appCheck.getToken(e):new Promise((t,s)=>{setTimeout(()=>{this.appCheck?this.getToken(e).then(t,s):t(null)},0)})}addTokenChangeListener(e){var t;(t=this.appCheckProvider)===null||t===void 0||t.get().then(s=>s.addTokenListener(e))}notifyForInvalidToken(){je(`Provided AppCheck credentials for the app named "${this.appName_}" are invalid. This usually indicates your app was not initialized correctly.`)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oy{constructor(e,t,s){this.appName_=e,this.firebaseOptions_=t,this.authProvider_=s,this.auth_=null,this.auth_=s.getImmediate({optional:!0}),this.auth_||s.onInit(r=>this.auth_=r)}getToken(e){return this.auth_?this.auth_.getToken(e).catch(t=>t&&t.code==="auth/token-not-initialized"?(we("Got auth/token-not-initialized error.  Treating as null token."),null):Promise.reject(t)):new Promise((t,s)=>{setTimeout(()=>{this.auth_?this.getToken(e).then(t,s):t(null)},0)})}addTokenChangeListener(e){this.auth_?this.auth_.addAuthTokenListener(e):this.authProvider_.get().then(t=>t.addAuthTokenListener(e))}removeTokenChangeListener(e){this.authProvider_.get().then(t=>t.removeAuthTokenListener(e))}notifyForInvalidToken(){let e='Provided authentication credentials for the app named "'+this.appName_+'" are invalid. This usually indicates your app was not initialized correctly. ';"credential"in this.firebaseOptions_?e+='Make sure the "credential" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':"serviceAccount"in this.firebaseOptions_?e+='Make sure the "serviceAccount" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':e+='Make sure the "apiKey" and "databaseURL" properties provided to initializeApp() match the values provided for your app at https://console.firebase.google.com/.',je(e)}}class cr{constructor(e){this.accessToken=e}getToken(e){return Promise.resolve({accessToken:this.accessToken})}addTokenChangeListener(e){e(this.accessToken)}removeTokenChangeListener(e){}notifyForInvalidToken(){}}cr.OWNER="owner";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ta="5",zu="v",Bu="s",Wu="r",Vu="f",$u=/(console\.firebase|firebase-console-\w+\.corp|firebase\.corp)\.google\.com/,Hu="ls",qu="p",uo="ac",Gu="websocket",Ku="long_polling";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yu{constructor(e,t,s,r,o=!1,a="",c=!1,u=!1){this.secure=t,this.namespace=s,this.webSocketOnly=r,this.nodeAdmin=o,this.persistenceKey=a,this.includeNamespaceInQueryParams=c,this.isUsingEmulator=u,this._host=e.toLowerCase(),this._domain=this._host.substr(this._host.indexOf(".")+1),this.internalHost=Vt.get("host:"+e)||this._host}isCacheableHost(){return this.internalHost.substr(0,2)==="s-"}isCustomHost(){return this._domain!=="firebaseio.com"&&this._domain!=="firebaseio-demo.com"}get host(){return this._host}set host(e){e!==this.internalHost&&(this.internalHost=e,this.isCacheableHost()&&Vt.set("host:"+this._host,this.internalHost))}toString(){let e=this.toURLString();return this.persistenceKey&&(e+="<"+this.persistenceKey+">"),e}toURLString(){const e=this.secure?"https://":"http://",t=this.includeNamespaceInQueryParams?`?ns=${this.namespace}`:"";return`${e}${this.host}/${t}`}}function Dy(n){return n.host!==n.internalHost||n.isCustomHost()||n.includeNamespaceInQueryParams}function Ju(n,e,t){P(typeof e=="string","typeof type must == string"),P(typeof t=="object","typeof params must == object");let s;if(e===Gu)s=(n.secure?"wss://":"ws://")+n.internalHost+"/.ws?";else if(e===Ku)s=(n.secure?"https://":"http://")+n.internalHost+"/.lp?";else throw new Error("Unknown connection type: "+e);Dy(n)&&(t.ns=n.namespace);const r=[];return Ee(t,(o,a)=>{r.push(o+"="+a)}),s+r.join("&")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ly{constructor(){this.counters_={}}incrementCounter(e,t=1){Je(this.counters_,e)||(this.counters_[e]=0),this.counters_[e]+=t}get(){return cm(this.counters_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bi={},Wi={};function na(n){const e=n.toString();return Bi[e]||(Bi[e]=new Ly),Bi[e]}function My(n,e){const t=n.toString();return Wi[t]||(Wi[t]=e()),Wi[t]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uy{constructor(e){this.onMessage_=e,this.pendingResponses=[],this.currentResponseNum=0,this.closeAfterResponse=-1,this.onClose=null}closeAfter(e,t){this.closeAfterResponse=e,this.onClose=t,this.closeAfterResponse<this.currentResponseNum&&(this.onClose(),this.onClose=null)}handleResponse(e,t){for(this.pendingResponses[e]=t;this.pendingResponses[this.currentResponseNum];){const s=this.pendingResponses[this.currentResponseNum];delete this.pendingResponses[this.currentResponseNum];for(let r=0;r<s.length;++r)s[r]&&Nn(()=>{this.onMessage_(s[r])});if(this.currentResponseNum===this.closeAfterResponse){this.onClose&&(this.onClose(),this.onClose=null);break}this.currentResponseNum++}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lc="start",Fy="close",zy="pLPCommand",By="pRTLPCB",Qu="id",Xu="pw",Zu="ser",Wy="cb",Vy="seg",$y="ts",Hy="d",qy="dframe",ed=1870,td=30,Gy=ed-td,Ky=25e3,Yy=3e4;class hn{constructor(e,t,s,r,o,a,c){this.connId=e,this.repoInfo=t,this.applicationId=s,this.appCheckToken=r,this.authToken=o,this.transportSessionId=a,this.lastSessionId=c,this.bytesSent=0,this.bytesReceived=0,this.everConnected_=!1,this.log_=ks(e),this.stats_=na(t),this.urlFn=u=>(this.appCheckToken&&(u[uo]=this.appCheckToken),Ju(t,Ku,u))}open(e,t){this.curSegmentNum=0,this.onDisconnect_=t,this.myPacketOrderer=new Uy(e),this.isClosed_=!1,this.connectTimeoutTimer_=setTimeout(()=>{this.log_("Timed out trying to connect."),this.onClosed_(),this.connectTimeoutTimer_=null},Math.floor(Yy)),Iy(()=>{if(this.isClosed_)return;this.scriptTagHolder=new sa((...o)=>{const[a,c,u,f,_]=o;if(this.incrementIncomingBytes_(o),!!this.scriptTagHolder)if(this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null),this.everConnected_=!0,a===Lc)this.id=c,this.password=u;else if(a===Fy)c?(this.scriptTagHolder.sendNewPolls=!1,this.myPacketOrderer.closeAfter(c,()=>{this.onClosed_()})):this.onClosed_();else throw new Error("Unrecognized command received: "+a)},(...o)=>{const[a,c]=o;this.incrementIncomingBytes_(o),this.myPacketOrderer.handleResponse(a,c)},()=>{this.onClosed_()},this.urlFn);const s={};s[Lc]="t",s[Zu]=Math.floor(Math.random()*1e8),this.scriptTagHolder.uniqueCallbackIdentifier&&(s[Wy]=this.scriptTagHolder.uniqueCallbackIdentifier),s[zu]=ta,this.transportSessionId&&(s[Bu]=this.transportSessionId),this.lastSessionId&&(s[Hu]=this.lastSessionId),this.applicationId&&(s[qu]=this.applicationId),this.appCheckToken&&(s[uo]=this.appCheckToken),typeof location<"u"&&location.hostname&&$u.test(location.hostname)&&(s[Wu]=Vu);const r=this.urlFn(s);this.log_("Connecting via long-poll to "+r),this.scriptTagHolder.addTag(r,()=>{})})}start(){this.scriptTagHolder.startLongPoll(this.id,this.password),this.addDisconnectPingFrame(this.id,this.password)}static forceAllow(){hn.forceAllow_=!0}static forceDisallow(){hn.forceDisallow_=!0}static isAvailable(){return hn.forceAllow_?!0:!hn.forceDisallow_&&typeof document<"u"&&document.createElement!=null&&!Ty()&&!ky()}markConnectionHealthy(){}shutdown_(){this.isClosed_=!0,this.scriptTagHolder&&(this.scriptTagHolder.close(),this.scriptTagHolder=null),this.myDisconnFrame&&(document.body.removeChild(this.myDisconnFrame),this.myDisconnFrame=null),this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null)}onClosed_(){this.isClosed_||(this.log_("Longpoll is closing itself"),this.shutdown_(),this.onDisconnect_&&(this.onDisconnect_(this.everConnected_),this.onDisconnect_=null))}close(){this.isClosed_||(this.log_("Longpoll is being closed."),this.shutdown_())}send(e){const t=ge(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const s=Dh(t),r=Uu(s,Gy);for(let o=0;o<r.length;o++)this.scriptTagHolder.enqueueSegment(this.curSegmentNum,r.length,r[o]),this.curSegmentNum++}addDisconnectPingFrame(e,t){this.myDisconnFrame=document.createElement("iframe");const s={};s[qy]="t",s[Qu]=e,s[Xu]=t,this.myDisconnFrame.src=this.urlFn(s),this.myDisconnFrame.style.display="none",document.body.appendChild(this.myDisconnFrame)}incrementIncomingBytes_(e){const t=ge(e).length;this.bytesReceived+=t,this.stats_.incrementCounter("bytes_received",t)}}class sa{constructor(e,t,s,r){this.onDisconnect=s,this.urlFn=r,this.outstandingRequests=new Set,this.pendingSegs=[],this.currentSerial=Math.floor(Math.random()*1e8),this.sendNewPolls=!0;{this.uniqueCallbackIdentifier=Lu(),window[zy+this.uniqueCallbackIdentifier]=e,window[By+this.uniqueCallbackIdentifier]=t,this.myIFrame=sa.createIFrame_();let o="";this.myIFrame.src&&this.myIFrame.src.substr(0,11)==="javascript:"&&(o='<script>document.domain="'+document.domain+'";<\/script>');const a="<html><body>"+o+"</body></html>";try{this.myIFrame.doc.open(),this.myIFrame.doc.write(a),this.myIFrame.doc.close()}catch(c){we("frame writing exception"),c.stack&&we(c.stack),we(c)}}}static createIFrame_(){const e=document.createElement("iframe");if(e.style.display="none",document.body){document.body.appendChild(e);try{e.contentWindow.document||we("No IE domain setting required")}catch{const s=document.domain;e.src="javascript:void((function(){document.open();document.domain='"+s+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";return e.contentDocument?e.doc=e.contentDocument:e.contentWindow?e.doc=e.contentWindow.document:e.document&&(e.doc=e.document),e}close(){this.alive=!1,this.myIFrame&&(this.myIFrame.doc.body.textContent="",setTimeout(()=>{this.myIFrame!==null&&(document.body.removeChild(this.myIFrame),this.myIFrame=null)},Math.floor(0)));const e=this.onDisconnect;e&&(this.onDisconnect=null,e())}startLongPoll(e,t){for(this.myID=e,this.myPW=t,this.alive=!0;this.newRequest_(););}newRequest_(){if(this.alive&&this.sendNewPolls&&this.outstandingRequests.size<(this.pendingSegs.length>0?2:1)){this.currentSerial++;const e={};e[Qu]=this.myID,e[Xu]=this.myPW,e[Zu]=this.currentSerial;let t=this.urlFn(e),s="",r=0;for(;this.pendingSegs.length>0&&this.pendingSegs[0].d.length+td+s.length<=ed;){const a=this.pendingSegs.shift();s=s+"&"+Vy+r+"="+a.seg+"&"+$y+r+"="+a.ts+"&"+Hy+r+"="+a.d,r++}return t=t+s,this.addLongPollTag_(t,this.currentSerial),!0}else return!1}enqueueSegment(e,t,s){this.pendingSegs.push({seg:e,ts:t,d:s}),this.alive&&this.newRequest_()}addLongPollTag_(e,t){this.outstandingRequests.add(t);const s=()=>{this.outstandingRequests.delete(t),this.newRequest_()},r=setTimeout(s,Math.floor(Ky)),o=()=>{clearTimeout(r),s()};this.addTag(e,o)}addTag(e,t){setTimeout(()=>{try{if(!this.sendNewPolls)return;const s=this.myIFrame.doc.createElement("script");s.type="text/javascript",s.async=!0,s.src=e,s.onload=s.onreadystatechange=function(){const r=s.readyState;(!r||r==="loaded"||r==="complete")&&(s.onload=s.onreadystatechange=null,s.parentNode&&s.parentNode.removeChild(s),t())},s.onerror=()=>{we("Long-poll script failed to load: "+e),this.sendNewPolls=!1,this.close()},this.myIFrame.doc.body.appendChild(s)}catch{}},Math.floor(1))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jy=16384,Qy=45e3;let Tr=null;typeof MozWebSocket<"u"?Tr=MozWebSocket:typeof WebSocket<"u"&&(Tr=WebSocket);class $e{constructor(e,t,s,r,o,a,c){this.connId=e,this.applicationId=s,this.appCheckToken=r,this.authToken=o,this.keepaliveTimer=null,this.frames=null,this.totalFrames=0,this.bytesSent=0,this.bytesReceived=0,this.log_=ks(this.connId),this.stats_=na(t),this.connURL=$e.connectionURL_(t,a,c,r,s),this.nodeAdmin=t.nodeAdmin}static connectionURL_(e,t,s,r,o){const a={};return a[zu]=ta,typeof location<"u"&&location.hostname&&$u.test(location.hostname)&&(a[Wu]=Vu),t&&(a[Bu]=t),s&&(a[Hu]=s),r&&(a[uo]=r),o&&(a[qu]=o),Ju(e,Gu,a)}open(e,t){this.onDisconnect=t,this.onMessage=e,this.log_("Websocket connecting to "+this.connURL),this.everConnected_=!1,Vt.set("previous_websocket_failure",!0);try{let s;ym(),this.mySock=new Tr(this.connURL,[],s)}catch(s){this.log_("Error instantiating WebSocket.");const r=s.message||s.data;r&&this.log_(r),this.onClosed_();return}this.mySock.onopen=()=>{this.log_("Websocket connected."),this.everConnected_=!0},this.mySock.onclose=()=>{this.log_("Websocket connection was disconnected."),this.mySock=null,this.onClosed_()},this.mySock.onmessage=s=>{this.handleIncomingFrame(s)},this.mySock.onerror=s=>{this.log_("WebSocket error.  Closing connection.");const r=s.message||s.data;r&&this.log_(r),this.onClosed_()}}start(){}static forceDisallow(){$e.forceDisallow_=!0}static isAvailable(){let e=!1;if(typeof navigator<"u"&&navigator.userAgent){const t=/Android ([0-9]{0,}\.[0-9]{0,})/,s=navigator.userAgent.match(t);s&&s.length>1&&parseFloat(s[1])<4.4&&(e=!0)}return!e&&Tr!==null&&!$e.forceDisallow_}static previouslyFailed(){return Vt.isInMemoryStorage||Vt.get("previous_websocket_failure")===!0}markConnectionHealthy(){Vt.remove("previous_websocket_failure")}appendFrame_(e){if(this.frames.push(e),this.frames.length===this.totalFrames){const t=this.frames.join("");this.frames=null;const s=ls(t);this.onMessage(s)}}handleNewFrameCount_(e){this.totalFrames=e,this.frames=[]}extractFrameCount_(e){if(P(this.frames===null,"We already have a frame buffer"),e.length<=6){const t=Number(e);if(!isNaN(t))return this.handleNewFrameCount_(t),null}return this.handleNewFrameCount_(1),e}handleIncomingFrame(e){if(this.mySock===null)return;const t=e.data;if(this.bytesReceived+=t.length,this.stats_.incrementCounter("bytes_received",t.length),this.resetKeepAlive(),this.frames!==null)this.appendFrame_(t);else{const s=this.extractFrameCount_(t);s!==null&&this.appendFrame_(s)}}send(e){this.resetKeepAlive();const t=ge(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const s=Uu(t,Jy);s.length>1&&this.sendString_(String(s.length));for(let r=0;r<s.length;r++)this.sendString_(s[r])}shutdown_(){this.isClosed_=!0,this.keepaliveTimer&&(clearInterval(this.keepaliveTimer),this.keepaliveTimer=null),this.mySock&&(this.mySock.close(),this.mySock=null)}onClosed_(){this.isClosed_||(this.log_("WebSocket is closing itself"),this.shutdown_(),this.onDisconnect&&(this.onDisconnect(this.everConnected_),this.onDisconnect=null))}close(){this.isClosed_||(this.log_("WebSocket is being closed"),this.shutdown_())}resetKeepAlive(){clearInterval(this.keepaliveTimer),this.keepaliveTimer=setInterval(()=>{this.mySock&&this.sendString_("0"),this.resetKeepAlive()},Math.floor(Qy))}sendString_(e){try{this.mySock.send(e)}catch(t){this.log_("Exception thrown from WebSocket.send():",t.message||t.data,"Closing connection."),setTimeout(this.onClosed_.bind(this),0)}}}$e.responsesRequiredToBeHealthy=2;$e.healthyTimeout=3e4;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class us{constructor(e){this.initTransports_(e)}static get ALL_TRANSPORTS(){return[hn,$e]}static get IS_TRANSPORT_INITIALIZED(){return this.globalTransportInitialized_}initTransports_(e){const t=$e&&$e.isAvailable();let s=t&&!$e.previouslyFailed();if(e.webSocketOnly&&(t||je("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),s=!0),s)this.transports_=[$e];else{const r=this.transports_=[];for(const o of us.ALL_TRANSPORTS)o&&o.isAvailable()&&r.push(o);us.globalTransportInitialized_=!0}}initialTransport(){if(this.transports_.length>0)return this.transports_[0];throw new Error("No transports available")}upgradeTransport(){return this.transports_.length>1?this.transports_[1]:null}}us.globalTransportInitialized_=!1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xy=6e4,Zy=5e3,ev=10*1024,tv=100*1024,Vi="t",Mc="d",nv="s",Uc="r",sv="e",Fc="o",zc="a",Bc="n",Wc="p",rv="h";class iv{constructor(e,t,s,r,o,a,c,u,f,_){this.id=e,this.repoInfo_=t,this.applicationId_=s,this.appCheckToken_=r,this.authToken_=o,this.onMessage_=a,this.onReady_=c,this.onDisconnect_=u,this.onKill_=f,this.lastSessionId=_,this.connectionCount=0,this.pendingDataMessages=[],this.state_=0,this.log_=ks("c:"+this.id+":"),this.transportManager_=new us(t),this.log_("Connection created"),this.start_()}start_(){const e=this.transportManager_.initialTransport();this.conn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,null,this.lastSessionId),this.primaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.conn_),s=this.disconnReceiver_(this.conn_);this.tx_=this.conn_,this.rx_=this.conn_,this.secondaryConn_=null,this.isHealthy_=!1,setTimeout(()=>{this.conn_&&this.conn_.open(t,s)},Math.floor(0));const r=e.healthyTimeout||0;r>0&&(this.healthyTimeout_=ns(()=>{this.healthyTimeout_=null,this.isHealthy_||(this.conn_&&this.conn_.bytesReceived>tv?(this.log_("Connection exceeded healthy timeout but has received "+this.conn_.bytesReceived+" bytes.  Marking connection healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()):this.conn_&&this.conn_.bytesSent>ev?this.log_("Connection exceeded healthy timeout but has sent "+this.conn_.bytesSent+" bytes.  Leaving connection alive."):(this.log_("Closing unhealthy connection after timeout."),this.close()))},Math.floor(r)))}nextTransportId_(){return"c:"+this.id+":"+this.connectionCount++}disconnReceiver_(e){return t=>{e===this.conn_?this.onConnectionLost_(t):e===this.secondaryConn_?(this.log_("Secondary connection lost."),this.onSecondaryConnectionLost_()):this.log_("closing an old connection")}}connReceiver_(e){return t=>{this.state_!==2&&(e===this.rx_?this.onPrimaryMessageReceived_(t):e===this.secondaryConn_?this.onSecondaryMessageReceived_(t):this.log_("message on old connection"))}}sendRequest(e){const t={t:"d",d:e};this.sendData_(t)}tryCleanupConnection(){this.tx_===this.secondaryConn_&&this.rx_===this.secondaryConn_&&(this.log_("cleaning up and promoting a connection: "+this.secondaryConn_.connId),this.conn_=this.secondaryConn_,this.secondaryConn_=null)}onSecondaryControl_(e){if(Vi in e){const t=e[Vi];t===zc?this.upgradeIfSecondaryHealthy_():t===Uc?(this.log_("Got a reset on secondary, closing it"),this.secondaryConn_.close(),(this.tx_===this.secondaryConn_||this.rx_===this.secondaryConn_)&&this.close()):t===Fc&&(this.log_("got pong on secondary."),this.secondaryResponsesRequired_--,this.upgradeIfSecondaryHealthy_())}}onSecondaryMessageReceived_(e){const t=qn("t",e),s=qn("d",e);if(t==="c")this.onSecondaryControl_(s);else if(t==="d")this.pendingDataMessages.push(s);else throw new Error("Unknown protocol layer: "+t)}upgradeIfSecondaryHealthy_(){this.secondaryResponsesRequired_<=0?(this.log_("Secondary connection is healthy."),this.isHealthy_=!0,this.secondaryConn_.markConnectionHealthy(),this.proceedWithUpgrade_()):(this.log_("sending ping on secondary."),this.secondaryConn_.send({t:"c",d:{t:Wc,d:{}}}))}proceedWithUpgrade_(){this.secondaryConn_.start(),this.log_("sending client ack on secondary"),this.secondaryConn_.send({t:"c",d:{t:zc,d:{}}}),this.log_("Ending transmission on primary"),this.conn_.send({t:"c",d:{t:Bc,d:{}}}),this.tx_=this.secondaryConn_,this.tryCleanupConnection()}onPrimaryMessageReceived_(e){const t=qn("t",e),s=qn("d",e);t==="c"?this.onControl_(s):t==="d"&&this.onDataMessage_(s)}onDataMessage_(e){this.onPrimaryResponse_(),this.onMessage_(e)}onPrimaryResponse_(){this.isHealthy_||(this.primaryResponsesRequired_--,this.primaryResponsesRequired_<=0&&(this.log_("Primary connection is healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()))}onControl_(e){const t=qn(Vi,e);if(Mc in e){const s=e[Mc];if(t===rv){const r=Object.assign({},s);this.repoInfo_.isUsingEmulator&&(r.h=this.repoInfo_.host),this.onHandshake_(r)}else if(t===Bc){this.log_("recvd end transmission on primary"),this.rx_=this.secondaryConn_;for(let r=0;r<this.pendingDataMessages.length;++r)this.onDataMessage_(this.pendingDataMessages[r]);this.pendingDataMessages=[],this.tryCleanupConnection()}else t===nv?this.onConnectionShutdown_(s):t===Uc?this.onReset_(s):t===sv?ho("Server Error: "+s):t===Fc?(this.log_("got pong on primary."),this.onPrimaryResponse_(),this.sendPingOnPrimaryIfNecessary_()):ho("Unknown control packet command: "+t)}}onHandshake_(e){const t=e.ts,s=e.v,r=e.h;this.sessionId=e.s,this.repoInfo_.host=r,this.state_===0&&(this.conn_.start(),this.onConnectionEstablished_(this.conn_,t),ta!==s&&je("Protocol version mismatch detected"),this.tryStartUpgrade_())}tryStartUpgrade_(){const e=this.transportManager_.upgradeTransport();e&&this.startUpgrade_(e)}startUpgrade_(e){this.secondaryConn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,this.sessionId),this.secondaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.secondaryConn_),s=this.disconnReceiver_(this.secondaryConn_);this.secondaryConn_.open(t,s),ns(()=>{this.secondaryConn_&&(this.log_("Timed out trying to upgrade."),this.secondaryConn_.close())},Math.floor(Xy))}onReset_(e){this.log_("Reset packet received.  New host: "+e),this.repoInfo_.host=e,this.state_===1?this.close():(this.closeConnections_(),this.start_())}onConnectionEstablished_(e,t){this.log_("Realtime connection established."),this.conn_=e,this.state_=1,this.onReady_&&(this.onReady_(t,this.sessionId),this.onReady_=null),this.primaryResponsesRequired_===0?(this.log_("Primary connection is healthy."),this.isHealthy_=!0):ns(()=>{this.sendPingOnPrimaryIfNecessary_()},Math.floor(Zy))}sendPingOnPrimaryIfNecessary_(){!this.isHealthy_&&this.state_===1&&(this.log_("sending ping on primary."),this.sendData_({t:"c",d:{t:Wc,d:{}}}))}onSecondaryConnectionLost_(){const e=this.secondaryConn_;this.secondaryConn_=null,(this.tx_===e||this.rx_===e)&&this.close()}onConnectionLost_(e){this.conn_=null,!e&&this.state_===0?(this.log_("Realtime connection failed."),this.repoInfo_.isCacheableHost()&&(Vt.remove("host:"+this.repoInfo_.host),this.repoInfo_.internalHost=this.repoInfo_.host)):this.state_===1&&this.log_("Realtime connection lost."),this.close()}onConnectionShutdown_(e){this.log_("Connection shutdown command received. Shutting down..."),this.onKill_&&(this.onKill_(e),this.onKill_=null),this.onDisconnect_=null,this.close()}sendData_(e){if(this.state_!==1)throw"Connection is not connected";this.tx_.send(e)}close(){this.state_!==2&&(this.log_("Closing realtime connection."),this.state_=2,this.closeConnections_(),this.onDisconnect_&&(this.onDisconnect_(),this.onDisconnect_=null))}closeConnections_(){this.log_("Shutting down all connections"),this.conn_&&(this.conn_.close(),this.conn_=null),this.secondaryConn_&&(this.secondaryConn_.close(),this.secondaryConn_=null),this.healthyTimeout_&&(clearTimeout(this.healthyTimeout_),this.healthyTimeout_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nd{put(e,t,s,r){}merge(e,t,s,r){}refreshAuthToken(e){}refreshAppCheckToken(e){}onDisconnectPut(e,t,s){}onDisconnectMerge(e,t,s){}onDisconnectCancel(e,t){}reportStats(e){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sd{constructor(e){this.allowedEvents_=e,this.listeners_={},P(Array.isArray(e)&&e.length>0,"Requires a non-empty array")}trigger(e,...t){if(Array.isArray(this.listeners_[e])){const s=[...this.listeners_[e]];for(let r=0;r<s.length;r++)s[r].callback.apply(s[r].context,t)}}on(e,t,s){this.validateEventType_(e),this.listeners_[e]=this.listeners_[e]||[],this.listeners_[e].push({callback:t,context:s});const r=this.getInitialEvent(e);r&&t.apply(s,r)}off(e,t,s){this.validateEventType_(e);const r=this.listeners_[e]||[];for(let o=0;o<r.length;o++)if(r[o].callback===t&&(!s||s===r[o].context)){r.splice(o,1);return}}validateEventType_(e){P(this.allowedEvents_.find(t=>t===e),"Unknown event: "+e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kr extends sd{constructor(){super(["online"]),this.online_=!0,typeof window<"u"&&typeof window.addEventListener<"u"&&!Lo()&&(window.addEventListener("online",()=>{this.online_||(this.online_=!0,this.trigger("online",!0))},!1),window.addEventListener("offline",()=>{this.online_&&(this.online_=!1,this.trigger("online",!1))},!1))}static getInstance(){return new kr}getInitialEvent(e){return P(e==="online","Unknown event type: "+e),[this.online_]}currentlyOnline(){return this.online_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vc=32,$c=768;class ee{constructor(e,t){if(t===void 0){this.pieces_=e.split("/");let s=0;for(let r=0;r<this.pieces_.length;r++)this.pieces_[r].length>0&&(this.pieces_[s]=this.pieces_[r],s++);this.pieces_.length=s,this.pieceNum_=0}else this.pieces_=e,this.pieceNum_=t}toString(){let e="";for(let t=this.pieceNum_;t<this.pieces_.length;t++)this.pieces_[t]!==""&&(e+="/"+this.pieces_[t]);return e||"/"}}function Y(){return new ee("")}function V(n){return n.pieceNum_>=n.pieces_.length?null:n.pieces_[n.pieceNum_]}function Rt(n){return n.pieces_.length-n.pieceNum_}function re(n){let e=n.pieceNum_;return e<n.pieces_.length&&e++,new ee(n.pieces_,e)}function ra(n){return n.pieceNum_<n.pieces_.length?n.pieces_[n.pieces_.length-1]:null}function ov(n){let e="";for(let t=n.pieceNum_;t<n.pieces_.length;t++)n.pieces_[t]!==""&&(e+="/"+encodeURIComponent(String(n.pieces_[t])));return e||"/"}function ds(n,e=0){return n.pieces_.slice(n.pieceNum_+e)}function rd(n){if(n.pieceNum_>=n.pieces_.length)return null;const e=[];for(let t=n.pieceNum_;t<n.pieces_.length-1;t++)e.push(n.pieces_[t]);return new ee(e,0)}function ce(n,e){const t=[];for(let s=n.pieceNum_;s<n.pieces_.length;s++)t.push(n.pieces_[s]);if(e instanceof ee)for(let s=e.pieceNum_;s<e.pieces_.length;s++)t.push(e.pieces_[s]);else{const s=e.split("/");for(let r=0;r<s.length;r++)s[r].length>0&&t.push(s[r])}return new ee(t,0)}function H(n){return n.pieceNum_>=n.pieces_.length}function Pe(n,e){const t=V(n),s=V(e);if(t===null)return e;if(t===s)return Pe(re(n),re(e));throw new Error("INTERNAL ERROR: innerPath ("+e+") is not within outerPath ("+n+")")}function av(n,e){const t=ds(n,0),s=ds(e,0);for(let r=0;r<t.length&&r<s.length;r++){const o=en(t[r],s[r]);if(o!==0)return o}return t.length===s.length?0:t.length<s.length?-1:1}function ia(n,e){if(Rt(n)!==Rt(e))return!1;for(let t=n.pieceNum_,s=e.pieceNum_;t<=n.pieces_.length;t++,s++)if(n.pieces_[t]!==e.pieces_[s])return!1;return!0}function Be(n,e){let t=n.pieceNum_,s=e.pieceNum_;if(Rt(n)>Rt(e))return!1;for(;t<n.pieces_.length;){if(n.pieces_[t]!==e.pieces_[s])return!1;++t,++s}return!0}class lv{constructor(e,t){this.errorPrefix_=t,this.parts_=ds(e,0),this.byteLength_=Math.max(1,this.parts_.length);for(let s=0;s<this.parts_.length;s++)this.byteLength_+=Vr(this.parts_[s]);id(this)}}function cv(n,e){n.parts_.length>0&&(n.byteLength_+=1),n.parts_.push(e),n.byteLength_+=Vr(e),id(n)}function hv(n){const e=n.parts_.pop();n.byteLength_-=Vr(e),n.parts_.length>0&&(n.byteLength_-=1)}function id(n){if(n.byteLength_>$c)throw new Error(n.errorPrefix_+"has a key path longer than "+$c+" bytes ("+n.byteLength_+").");if(n.parts_.length>Vc)throw new Error(n.errorPrefix_+"path specified exceeds the maximum depth that can be written ("+Vc+") or object contains a cycle "+Bt(n))}function Bt(n){return n.parts_.length===0?"":"in property '"+n.parts_.join(".")+"'"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oa extends sd{constructor(){super(["visible"]);let e,t;typeof document<"u"&&typeof document.addEventListener<"u"&&(typeof document.hidden<"u"?(t="visibilitychange",e="hidden"):typeof document.mozHidden<"u"?(t="mozvisibilitychange",e="mozHidden"):typeof document.msHidden<"u"?(t="msvisibilitychange",e="msHidden"):typeof document.webkitHidden<"u"&&(t="webkitvisibilitychange",e="webkitHidden")),this.visible_=!0,t&&document.addEventListener(t,()=>{const s=!document[e];s!==this.visible_&&(this.visible_=s,this.trigger("visible",s))},!1)}static getInstance(){return new oa}getInitialEvent(e){return P(e==="visible","Unknown event type: "+e),[this.visible_]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gn=1e3,uv=60*5*1e3,Hc=30*1e3,dv=1.3,fv=3e4,pv="server_kill",qc=3;class ct extends nd{constructor(e,t,s,r,o,a,c,u){if(super(),this.repoInfo_=e,this.applicationId_=t,this.onDataUpdate_=s,this.onConnectStatus_=r,this.onServerInfoUpdate_=o,this.authTokenProvider_=a,this.appCheckTokenProvider_=c,this.authOverride_=u,this.id=ct.nextPersistentConnectionId_++,this.log_=ks("p:"+this.id+":"),this.interruptReasons_={},this.listens=new Map,this.outstandingPuts_=[],this.outstandingGets_=[],this.outstandingPutCount_=0,this.outstandingGetCount_=0,this.onDisconnectRequestQueue_=[],this.connected_=!1,this.reconnectDelay_=Gn,this.maxReconnectDelay_=uv,this.securityDebugCallback_=null,this.lastSessionId=null,this.establishConnectionTimer_=null,this.visible_=!1,this.requestCBHash_={},this.requestNumber_=0,this.realtime_=null,this.authToken_=null,this.appCheckToken_=null,this.forceTokenRefresh_=!1,this.invalidAuthTokenCount_=0,this.invalidAppCheckTokenCount_=0,this.firstConnection_=!0,this.lastConnectionAttemptTime_=null,this.lastConnectionEstablishedTime_=null,u)throw new Error("Auth override specified in options, but not supported on non Node.js platforms");oa.getInstance().on("visible",this.onVisible_,this),e.host.indexOf("fblocal")===-1&&kr.getInstance().on("online",this.onOnline_,this)}sendRequest(e,t,s){const r=++this.requestNumber_,o={r,a:e,b:t};this.log_(ge(o)),P(this.connected_,"sendRequest call when we're not connected not allowed."),this.realtime_.sendRequest(o),s&&(this.requestCBHash_[r]=s)}get(e){this.initConnection_();const t=new Tn,r={action:"g",request:{p:e._path.toString(),q:e._queryObject},onComplete:a=>{const c=a.d;a.s==="ok"?t.resolve(c):t.reject(c)}};this.outstandingGets_.push(r),this.outstandingGetCount_++;const o=this.outstandingGets_.length-1;return this.connected_&&this.sendGet_(o),t.promise}listen(e,t,s,r){this.initConnection_();const o=e._queryIdentifier,a=e._path.toString();this.log_("Listen called for "+a+" "+o),this.listens.has(a)||this.listens.set(a,new Map),P(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"listen() called for non-default but complete query"),P(!this.listens.get(a).has(o),"listen() called twice for same path/queryId.");const c={onComplete:r,hashFn:t,query:e,tag:s};this.listens.get(a).set(o,c),this.connected_&&this.sendListen_(c)}sendGet_(e){const t=this.outstandingGets_[e];this.sendRequest("g",t.request,s=>{delete this.outstandingGets_[e],this.outstandingGetCount_--,this.outstandingGetCount_===0&&(this.outstandingGets_=[]),t.onComplete&&t.onComplete(s)})}sendListen_(e){const t=e.query,s=t._path.toString(),r=t._queryIdentifier;this.log_("Listen on "+s+" for "+r);const o={p:s},a="q";e.tag&&(o.q=t._queryObject,o.t=e.tag),o.h=e.hashFn(),this.sendRequest(a,o,c=>{const u=c.d,f=c.s;ct.warnOnListenWarnings_(u,t),(this.listens.get(s)&&this.listens.get(s).get(r))===e&&(this.log_("listen response",c),f!=="ok"&&this.removeListen_(s,r),e.onComplete&&e.onComplete(f,u))})}static warnOnListenWarnings_(e,t){if(e&&typeof e=="object"&&Je(e,"w")){const s=$t(e,"w");if(Array.isArray(s)&&~s.indexOf("no_index")){const r='".indexOn": "'+t._queryParams.getIndex().toString()+'"',o=t._path.toString();je(`Using an unspecified index. Your data will be downloaded and filtered on the client. Consider adding ${r} at ${o} to your security rules for better performance.`)}}}refreshAuthToken(e){this.authToken_=e,this.log_("Auth token refreshed"),this.authToken_?this.tryAuth():this.connected_&&this.sendRequest("unauth",{},()=>{}),this.reduceReconnectDelayIfAdminCredential_(e)}reduceReconnectDelayIfAdminCredential_(e){(e&&e.length===40||Cm(e))&&(this.log_("Admin auth credential detected.  Reducing max reconnect time."),this.maxReconnectDelay_=Hc)}refreshAppCheckToken(e){this.appCheckToken_=e,this.log_("App check token refreshed"),this.appCheckToken_?this.tryAppCheck():this.connected_&&this.sendRequest("unappeck",{},()=>{})}tryAuth(){if(this.connected_&&this.authToken_){const e=this.authToken_,t=Im(e)?"auth":"gauth",s={cred:e};this.authOverride_===null?s.noauth=!0:typeof this.authOverride_=="object"&&(s.authvar=this.authOverride_),this.sendRequest(t,s,r=>{const o=r.s,a=r.d||"error";this.authToken_===e&&(o==="ok"?this.invalidAuthTokenCount_=0:this.onAuthRevoked_(o,a))})}}tryAppCheck(){this.connected_&&this.appCheckToken_&&this.sendRequest("appcheck",{token:this.appCheckToken_},e=>{const t=e.s,s=e.d||"error";t==="ok"?this.invalidAppCheckTokenCount_=0:this.onAppCheckRevoked_(t,s)})}unlisten(e,t){const s=e._path.toString(),r=e._queryIdentifier;this.log_("Unlisten called for "+s+" "+r),P(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"unlisten() called for non-default but complete query"),this.removeListen_(s,r)&&this.connected_&&this.sendUnlisten_(s,r,e._queryObject,t)}sendUnlisten_(e,t,s,r){this.log_("Unlisten on "+e+" for "+t);const o={p:e},a="n";r&&(o.q=s,o.t=r),this.sendRequest(a,o)}onDisconnectPut(e,t,s){this.initConnection_(),this.connected_?this.sendOnDisconnect_("o",e,t,s):this.onDisconnectRequestQueue_.push({pathString:e,action:"o",data:t,onComplete:s})}onDisconnectMerge(e,t,s){this.initConnection_(),this.connected_?this.sendOnDisconnect_("om",e,t,s):this.onDisconnectRequestQueue_.push({pathString:e,action:"om",data:t,onComplete:s})}onDisconnectCancel(e,t){this.initConnection_(),this.connected_?this.sendOnDisconnect_("oc",e,null,t):this.onDisconnectRequestQueue_.push({pathString:e,action:"oc",data:null,onComplete:t})}sendOnDisconnect_(e,t,s,r){const o={p:t,d:s};this.log_("onDisconnect "+e,o),this.sendRequest(e,o,a=>{r&&setTimeout(()=>{r(a.s,a.d)},Math.floor(0))})}put(e,t,s,r){this.putInternal("p",e,t,s,r)}merge(e,t,s,r){this.putInternal("m",e,t,s,r)}putInternal(e,t,s,r,o){this.initConnection_();const a={p:t,d:s};o!==void 0&&(a.h=o),this.outstandingPuts_.push({action:e,request:a,onComplete:r}),this.outstandingPutCount_++;const c=this.outstandingPuts_.length-1;this.connected_?this.sendPut_(c):this.log_("Buffering put: "+t)}sendPut_(e){const t=this.outstandingPuts_[e].action,s=this.outstandingPuts_[e].request,r=this.outstandingPuts_[e].onComplete;this.outstandingPuts_[e].queued=this.connected_,this.sendRequest(t,s,o=>{this.log_(t+" response",o),delete this.outstandingPuts_[e],this.outstandingPutCount_--,this.outstandingPutCount_===0&&(this.outstandingPuts_=[]),r&&r(o.s,o.d)})}reportStats(e){if(this.connected_){const t={c:e};this.log_("reportStats",t),this.sendRequest("s",t,s=>{if(s.s!=="ok"){const o=s.d;this.log_("reportStats","Error sending stats: "+o)}})}}onDataMessage_(e){if("r"in e){this.log_("from server: "+ge(e));const t=e.r,s=this.requestCBHash_[t];s&&(delete this.requestCBHash_[t],s(e.b))}else{if("error"in e)throw"A server-side error has occurred: "+e.error;"a"in e&&this.onDataPush_(e.a,e.b)}}onDataPush_(e,t){this.log_("handleServerMessage",e,t),e==="d"?this.onDataUpdate_(t.p,t.d,!1,t.t):e==="m"?this.onDataUpdate_(t.p,t.d,!0,t.t):e==="c"?this.onListenRevoked_(t.p,t.q):e==="ac"?this.onAuthRevoked_(t.s,t.d):e==="apc"?this.onAppCheckRevoked_(t.s,t.d):e==="sd"?this.onSecurityDebugPacket_(t):ho("Unrecognized action received from server: "+ge(e)+`
Are you using the latest client?`)}onReady_(e,t){this.log_("connection ready"),this.connected_=!0,this.lastConnectionEstablishedTime_=new Date().getTime(),this.handleTimestamp_(e),this.lastSessionId=t,this.firstConnection_&&this.sendConnectStats_(),this.restoreState_(),this.firstConnection_=!1,this.onConnectStatus_(!0)}scheduleConnect_(e){P(!this.realtime_,"Scheduling a connect when we're already connected/ing?"),this.establishConnectionTimer_&&clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=setTimeout(()=>{this.establishConnectionTimer_=null,this.establishConnection_()},Math.floor(e))}initConnection_(){!this.realtime_&&this.firstConnection_&&this.scheduleConnect_(0)}onVisible_(e){e&&!this.visible_&&this.reconnectDelay_===this.maxReconnectDelay_&&(this.log_("Window became visible.  Reducing delay."),this.reconnectDelay_=Gn,this.realtime_||this.scheduleConnect_(0)),this.visible_=e}onOnline_(e){e?(this.log_("Browser went online."),this.reconnectDelay_=Gn,this.realtime_||this.scheduleConnect_(0)):(this.log_("Browser went offline.  Killing connection."),this.realtime_&&this.realtime_.close())}onRealtimeDisconnect_(){if(this.log_("data client disconnected"),this.connected_=!1,this.realtime_=null,this.cancelSentTransactions_(),this.requestCBHash_={},this.shouldReconnect_()){this.visible_?this.lastConnectionEstablishedTime_&&(new Date().getTime()-this.lastConnectionEstablishedTime_>fv&&(this.reconnectDelay_=Gn),this.lastConnectionEstablishedTime_=null):(this.log_("Window isn't visible.  Delaying reconnect."),this.reconnectDelay_=this.maxReconnectDelay_,this.lastConnectionAttemptTime_=new Date().getTime());const e=new Date().getTime()-this.lastConnectionAttemptTime_;let t=Math.max(0,this.reconnectDelay_-e);t=Math.random()*t,this.log_("Trying to reconnect in "+t+"ms"),this.scheduleConnect_(t),this.reconnectDelay_=Math.min(this.maxReconnectDelay_,this.reconnectDelay_*dv)}this.onConnectStatus_(!1)}async establishConnection_(){if(this.shouldReconnect_()){this.log_("Making a connection attempt"),this.lastConnectionAttemptTime_=new Date().getTime(),this.lastConnectionEstablishedTime_=null;const e=this.onDataMessage_.bind(this),t=this.onReady_.bind(this),s=this.onRealtimeDisconnect_.bind(this),r=this.id+":"+ct.nextConnectionId_++,o=this.lastSessionId;let a=!1,c=null;const u=function(){c?c.close():(a=!0,s())},f=function(m){P(c,"sendRequest call when we're not connected not allowed."),c.sendRequest(m)};this.realtime_={close:u,sendRequest:f};const _=this.forceTokenRefresh_;this.forceTokenRefresh_=!1;try{const[m,b]=await Promise.all([this.authTokenProvider_.getToken(_),this.appCheckTokenProvider_.getToken(_)]);a?we("getToken() completed but was canceled"):(we("getToken() completed. Creating connection."),this.authToken_=m&&m.accessToken,this.appCheckToken_=b&&b.token,c=new iv(r,this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,e,t,s,S=>{je(S+" ("+this.repoInfo_.toString()+")"),this.interrupt(pv)},o))}catch(m){this.log_("Failed to get token: "+m),a||(this.repoInfo_.nodeAdmin&&je(m),u())}}}interrupt(e){we("Interrupting connection for reason: "+e),this.interruptReasons_[e]=!0,this.realtime_?this.realtime_.close():(this.establishConnectionTimer_&&(clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=null),this.connected_&&this.onRealtimeDisconnect_())}resume(e){we("Resuming connection for reason: "+e),delete this.interruptReasons_[e],eo(this.interruptReasons_)&&(this.reconnectDelay_=Gn,this.realtime_||this.scheduleConnect_(0))}handleTimestamp_(e){const t=e-new Date().getTime();this.onServerInfoUpdate_({serverTimeOffset:t})}cancelSentTransactions_(){for(let e=0;e<this.outstandingPuts_.length;e++){const t=this.outstandingPuts_[e];t&&"h"in t.request&&t.queued&&(t.onComplete&&t.onComplete("disconnect"),delete this.outstandingPuts_[e],this.outstandingPutCount_--)}this.outstandingPutCount_===0&&(this.outstandingPuts_=[])}onListenRevoked_(e,t){let s;t?s=t.map(o=>ea(o)).join("$"):s="default";const r=this.removeListen_(e,s);r&&r.onComplete&&r.onComplete("permission_denied")}removeListen_(e,t){const s=new ee(e).toString();let r;if(this.listens.has(s)){const o=this.listens.get(s);r=o.get(t),o.delete(t),o.size===0&&this.listens.delete(s)}else r=void 0;return r}onAuthRevoked_(e,t){we("Auth token revoked: "+e+"/"+t),this.authToken_=null,this.forceTokenRefresh_=!0,this.realtime_.close(),(e==="invalid_token"||e==="permission_denied")&&(this.invalidAuthTokenCount_++,this.invalidAuthTokenCount_>=qc&&(this.reconnectDelay_=Hc,this.authTokenProvider_.notifyForInvalidToken()))}onAppCheckRevoked_(e,t){we("App check token revoked: "+e+"/"+t),this.appCheckToken_=null,this.forceTokenRefresh_=!0,(e==="invalid_token"||e==="permission_denied")&&(this.invalidAppCheckTokenCount_++,this.invalidAppCheckTokenCount_>=qc&&this.appCheckTokenProvider_.notifyForInvalidToken())}onSecurityDebugPacket_(e){this.securityDebugCallback_?this.securityDebugCallback_(e):"msg"in e&&console.log("FIREBASE: "+e.msg.replace(`
`,`
FIREBASE: `))}restoreState_(){this.tryAuth(),this.tryAppCheck();for(const e of this.listens.values())for(const t of e.values())this.sendListen_(t);for(let e=0;e<this.outstandingPuts_.length;e++)this.outstandingPuts_[e]&&this.sendPut_(e);for(;this.onDisconnectRequestQueue_.length;){const e=this.onDisconnectRequestQueue_.shift();this.sendOnDisconnect_(e.action,e.pathString,e.data,e.onComplete)}for(let e=0;e<this.outstandingGets_.length;e++)this.outstandingGets_[e]&&this.sendGet_(e)}sendConnectStats_(){const e={};let t="js";e["sdk."+t+"."+Ou.replace(/\./g,"-")]=1,Lo()?e["framework.cordova"]=1:Wh()&&(e["framework.reactnative"]=1),this.reportStats(e)}shouldReconnect_(){const e=kr.getInstance().currentlyOnline();return eo(this.interruptReasons_)&&e}}ct.nextPersistentConnectionId_=0;ct.nextConnectionId_=0;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ${constructor(e,t){this.name=e,this.node=t}static Wrap(e,t){return new $(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yr{getCompare(){return this.compare.bind(this)}indexedValueChanged(e,t){const s=new $(yn,e),r=new $(yn,t);return this.compare(s,r)!==0}minPost(){return $.MIN}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let tr;class od extends Yr{static get __EMPTY_NODE(){return tr}static set __EMPTY_NODE(e){tr=e}compare(e,t){return en(e.name,t.name)}isDefinedOn(e){throw Cn("KeyIndex.isDefinedOn not expected to be called.")}indexedValueChanged(e,t){return!1}minPost(){return $.MIN}maxPost(){return new $(Kt,tr)}makePost(e,t){return P(typeof e=="string","KeyIndex indexValue must always be a string."),new $(e,tr)}toString(){return".key"}}const mn=new od;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nr{constructor(e,t,s,r,o=null){this.isReverse_=r,this.resultGenerator_=o,this.nodeStack_=[];let a=1;for(;!e.isEmpty();)if(e=e,a=t?s(e.key,t):1,r&&(a*=-1),a<0)this.isReverse_?e=e.left:e=e.right;else if(a===0){this.nodeStack_.push(e);break}else this.nodeStack_.push(e),this.isReverse_?e=e.right:e=e.left}getNext(){if(this.nodeStack_.length===0)return null;let e=this.nodeStack_.pop(),t;if(this.resultGenerator_?t=this.resultGenerator_(e.key,e.value):t={key:e.key,value:e.value},this.isReverse_)for(e=e.left;!e.isEmpty();)this.nodeStack_.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack_.push(e),e=e.left;return t}hasNext(){return this.nodeStack_.length>0}peek(){if(this.nodeStack_.length===0)return null;const e=this.nodeStack_[this.nodeStack_.length-1];return this.resultGenerator_?this.resultGenerator_(e.key,e.value):{key:e.key,value:e.value}}}class ve{constructor(e,t,s,r,o){this.key=e,this.value=t,this.color=s??ve.RED,this.left=r??Me.EMPTY_NODE,this.right=o??Me.EMPTY_NODE}copy(e,t,s,r,o){return new ve(e??this.key,t??this.value,s??this.color,r??this.left,o??this.right)}count(){return this.left.count()+1+this.right.count()}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||!!e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min_(){return this.left.isEmpty()?this:this.left.min_()}minKey(){return this.min_().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,s){let r=this;const o=s(e,r.key);return o<0?r=r.copy(null,null,null,r.left.insert(e,t,s),null):o===0?r=r.copy(null,t,null,null,null):r=r.copy(null,null,null,null,r.right.insert(e,t,s)),r.fixUp_()}removeMin_(){if(this.left.isEmpty())return Me.EMPTY_NODE;let e=this;return!e.left.isRed_()&&!e.left.left.isRed_()&&(e=e.moveRedLeft_()),e=e.copy(null,null,null,e.left.removeMin_(),null),e.fixUp_()}remove(e,t){let s,r;if(s=this,t(e,s.key)<0)!s.left.isEmpty()&&!s.left.isRed_()&&!s.left.left.isRed_()&&(s=s.moveRedLeft_()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed_()&&(s=s.rotateRight_()),!s.right.isEmpty()&&!s.right.isRed_()&&!s.right.left.isRed_()&&(s=s.moveRedRight_()),t(e,s.key)===0){if(s.right.isEmpty())return Me.EMPTY_NODE;r=s.right.min_(),s=s.copy(r.key,r.value,null,null,s.right.removeMin_())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp_()}isRed_(){return this.color}fixUp_(){let e=this;return e.right.isRed_()&&!e.left.isRed_()&&(e=e.rotateLeft_()),e.left.isRed_()&&e.left.left.isRed_()&&(e=e.rotateRight_()),e.left.isRed_()&&e.right.isRed_()&&(e=e.colorFlip_()),e}moveRedLeft_(){let e=this.colorFlip_();return e.right.left.isRed_()&&(e=e.copy(null,null,null,null,e.right.rotateRight_()),e=e.rotateLeft_(),e=e.colorFlip_()),e}moveRedRight_(){let e=this.colorFlip_();return e.left.left.isRed_()&&(e=e.rotateRight_(),e=e.colorFlip_()),e}rotateLeft_(){const e=this.copy(null,null,ve.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight_(){const e=this.copy(null,null,ve.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip_(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth_(){const e=this.check_();return Math.pow(2,e)<=this.count()+1}check_(){if(this.isRed_()&&this.left.isRed_())throw new Error("Red node has red child("+this.key+","+this.value+")");if(this.right.isRed_())throw new Error("Right child of ("+this.key+","+this.value+") is red");const e=this.left.check_();if(e!==this.right.check_())throw new Error("Black depths differ");return e+(this.isRed_()?0:1)}}ve.RED=!0;ve.BLACK=!1;class mv{copy(e,t,s,r,o){return this}insert(e,t,s){return new ve(e,t,null)}remove(e,t){return this}count(){return 0}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}check_(){return 0}isRed_(){return!1}}class Me{constructor(e,t=Me.EMPTY_NODE){this.comparator_=e,this.root_=t}insert(e,t){return new Me(this.comparator_,this.root_.insert(e,t,this.comparator_).copy(null,null,ve.BLACK,null,null))}remove(e){return new Me(this.comparator_,this.root_.remove(e,this.comparator_).copy(null,null,ve.BLACK,null,null))}get(e){let t,s=this.root_;for(;!s.isEmpty();){if(t=this.comparator_(e,s.key),t===0)return s.value;t<0?s=s.left:t>0&&(s=s.right)}return null}getPredecessorKey(e){let t,s=this.root_,r=null;for(;!s.isEmpty();)if(t=this.comparator_(e,s.key),t===0){if(s.left.isEmpty())return r?r.key:null;for(s=s.left;!s.right.isEmpty();)s=s.right;return s.key}else t<0?s=s.left:t>0&&(r=s,s=s.right);throw new Error("Attempted to find predecessor key for a nonexistent key.  What gives?")}isEmpty(){return this.root_.isEmpty()}count(){return this.root_.count()}minKey(){return this.root_.minKey()}maxKey(){return this.root_.maxKey()}inorderTraversal(e){return this.root_.inorderTraversal(e)}reverseTraversal(e){return this.root_.reverseTraversal(e)}getIterator(e){return new nr(this.root_,null,this.comparator_,!1,e)}getIteratorFrom(e,t){return new nr(this.root_,e,this.comparator_,!1,t)}getReverseIteratorFrom(e,t){return new nr(this.root_,e,this.comparator_,!0,t)}getReverseIterator(e){return new nr(this.root_,null,this.comparator_,!0,e)}}Me.EMPTY_NODE=new mv;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gv(n,e){return en(n.name,e.name)}function aa(n,e){return en(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let fo;function _v(n){fo=n}const ad=function(n){return typeof n=="number"?"number:"+Fu(n):"string:"+n},ld=function(n){if(n.isLeafNode()){const e=n.val();P(typeof e=="string"||typeof e=="number"||typeof e=="object"&&Je(e,".sv"),"Priority must be a string or number.")}else P(n===fo||n.isEmpty(),"priority of unexpected type.");P(n===fo||n.getPriority().isEmpty(),"Priority nodes can't have a priority of their own.")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Gc;class ye{constructor(e,t=ye.__childrenNodeConstructor.EMPTY_NODE){this.value_=e,this.priorityNode_=t,this.lazyHash_=null,P(this.value_!==void 0&&this.value_!==null,"LeafNode shouldn't be created with null/undefined value."),ld(this.priorityNode_)}static set __childrenNodeConstructor(e){Gc=e}static get __childrenNodeConstructor(){return Gc}isLeafNode(){return!0}getPriority(){return this.priorityNode_}updatePriority(e){return new ye(this.value_,e)}getImmediateChild(e){return e===".priority"?this.priorityNode_:ye.__childrenNodeConstructor.EMPTY_NODE}getChild(e){return H(e)?this:V(e)===".priority"?this.priorityNode_:ye.__childrenNodeConstructor.EMPTY_NODE}hasChild(){return!1}getPredecessorChildName(e,t){return null}updateImmediateChild(e,t){return e===".priority"?this.updatePriority(t):t.isEmpty()&&e!==".priority"?this:ye.__childrenNodeConstructor.EMPTY_NODE.updateImmediateChild(e,t).updatePriority(this.priorityNode_)}updateChild(e,t){const s=V(e);return s===null?t:t.isEmpty()&&s!==".priority"?this:(P(s!==".priority"||Rt(e)===1,".priority must be the last token in a path"),this.updateImmediateChild(s,ye.__childrenNodeConstructor.EMPTY_NODE.updateChild(re(e),t)))}isEmpty(){return!1}numChildren(){return 0}forEachChild(e,t){return!1}val(e){return e&&!this.getPriority().isEmpty()?{".value":this.getValue(),".priority":this.getPriority().val()}:this.getValue()}hash(){if(this.lazyHash_===null){let e="";this.priorityNode_.isEmpty()||(e+="priority:"+ad(this.priorityNode_.val())+":");const t=typeof this.value_;e+=t+":",t==="number"?e+=Fu(this.value_):e+=this.value_,this.lazyHash_=Mu(e)}return this.lazyHash_}getValue(){return this.value_}compareTo(e){return e===ye.__childrenNodeConstructor.EMPTY_NODE?1:e instanceof ye.__childrenNodeConstructor?-1:(P(e.isLeafNode(),"Unknown node type"),this.compareToLeafNode_(e))}compareToLeafNode_(e){const t=typeof e.value_,s=typeof this.value_,r=ye.VALUE_TYPE_ORDER.indexOf(t),o=ye.VALUE_TYPE_ORDER.indexOf(s);return P(r>=0,"Unknown leaf type: "+t),P(o>=0,"Unknown leaf type: "+s),r===o?s==="object"?0:this.value_<e.value_?-1:this.value_===e.value_?0:1:o-r}withIndex(){return this}isIndexed(){return!0}equals(e){if(e===this)return!0;if(e.isLeafNode()){const t=e;return this.value_===t.value_&&this.priorityNode_.equals(t.priorityNode_)}else return!1}}ye.VALUE_TYPE_ORDER=["object","boolean","number","string"];/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let cd,hd;function yv(n){cd=n}function vv(n){hd=n}class xv extends Yr{compare(e,t){const s=e.node.getPriority(),r=t.node.getPriority(),o=s.compareTo(r);return o===0?en(e.name,t.name):o}isDefinedOn(e){return!e.getPriority().isEmpty()}indexedValueChanged(e,t){return!e.getPriority().equals(t.getPriority())}minPost(){return $.MIN}maxPost(){return new $(Kt,new ye("[PRIORITY-POST]",hd))}makePost(e,t){const s=cd(e);return new $(t,new ye("[PRIORITY-POST]",s))}toString(){return".priority"}}const ae=new xv;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bv=Math.log(2);class wv{constructor(e){const t=o=>parseInt(Math.log(o)/bv,10),s=o=>parseInt(Array(o+1).join("1"),2);this.count=t(e+1),this.current_=this.count-1;const r=s(this.count);this.bits_=e+1&r}nextBitIsOne(){const e=!(this.bits_&1<<this.current_);return this.current_--,e}}const Sr=function(n,e,t,s){n.sort(e);const r=function(u,f){const _=f-u;let m,b;if(_===0)return null;if(_===1)return m=n[u],b=t?t(m):m,new ve(b,m.node,ve.BLACK,null,null);{const S=parseInt(_/2,10)+u,T=r(u,S),R=r(S+1,f);return m=n[S],b=t?t(m):m,new ve(b,m.node,ve.BLACK,T,R)}},o=function(u){let f=null,_=null,m=n.length;const b=function(T,R){const A=m-T,U=m;m-=T;const z=r(A+1,U),M=n[A],D=t?t(M):M;S(new ve(D,M.node,R,null,z))},S=function(T){f?(f.left=T,f=T):(_=T,f=T)};for(let T=0;T<u.count;++T){const R=u.nextBitIsOne(),A=Math.pow(2,u.count-(T+1));R?b(A,ve.BLACK):(b(A,ve.BLACK),b(A,ve.RED))}return _},a=new wv(n.length),c=o(a);return new Me(s||e,c)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let $i;const cn={};class at{constructor(e,t){this.indexes_=e,this.indexSet_=t}static get Default(){return P(cn&&ae,"ChildrenNode.ts has not been loaded"),$i=$i||new at({".priority":cn},{".priority":ae}),$i}get(e){const t=$t(this.indexes_,e);if(!t)throw new Error("No index defined for "+e);return t instanceof Me?t:null}hasIndex(e){return Je(this.indexSet_,e.toString())}addIndex(e,t){P(e!==mn,"KeyIndex always exists and isn't meant to be added to the IndexMap.");const s=[];let r=!1;const o=t.getIterator($.Wrap);let a=o.getNext();for(;a;)r=r||e.isDefinedOn(a.node),s.push(a),a=o.getNext();let c;r?c=Sr(s,e.getCompare()):c=cn;const u=e.toString(),f=Object.assign({},this.indexSet_);f[u]=e;const _=Object.assign({},this.indexes_);return _[u]=c,new at(_,f)}addToIndexes(e,t){const s=_r(this.indexes_,(r,o)=>{const a=$t(this.indexSet_,o);if(P(a,"Missing index implementation for "+o),r===cn)if(a.isDefinedOn(e.node)){const c=[],u=t.getIterator($.Wrap);let f=u.getNext();for(;f;)f.name!==e.name&&c.push(f),f=u.getNext();return c.push(e),Sr(c,a.getCompare())}else return cn;else{const c=t.get(e.name);let u=r;return c&&(u=u.remove(new $(e.name,c))),u.insert(e,e.node)}});return new at(s,this.indexSet_)}removeFromIndexes(e,t){const s=_r(this.indexes_,r=>{if(r===cn)return r;{const o=t.get(e.name);return o?r.remove(new $(e.name,o)):r}});return new at(s,this.indexSet_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Kn;class F{constructor(e,t,s){this.children_=e,this.priorityNode_=t,this.indexMap_=s,this.lazyHash_=null,this.priorityNode_&&ld(this.priorityNode_),this.children_.isEmpty()&&P(!this.priorityNode_||this.priorityNode_.isEmpty(),"An empty node cannot have a priority")}static get EMPTY_NODE(){return Kn||(Kn=new F(new Me(aa),null,at.Default))}isLeafNode(){return!1}getPriority(){return this.priorityNode_||Kn}updatePriority(e){return this.children_.isEmpty()?this:new F(this.children_,e,this.indexMap_)}getImmediateChild(e){if(e===".priority")return this.getPriority();{const t=this.children_.get(e);return t===null?Kn:t}}getChild(e){const t=V(e);return t===null?this:this.getImmediateChild(t).getChild(re(e))}hasChild(e){return this.children_.get(e)!==null}updateImmediateChild(e,t){if(P(t,"We should always be passing snapshot nodes"),e===".priority")return this.updatePriority(t);{const s=new $(e,t);let r,o;t.isEmpty()?(r=this.children_.remove(e),o=this.indexMap_.removeFromIndexes(s,this.children_)):(r=this.children_.insert(e,t),o=this.indexMap_.addToIndexes(s,this.children_));const a=r.isEmpty()?Kn:this.priorityNode_;return new F(r,a,o)}}updateChild(e,t){const s=V(e);if(s===null)return t;{P(V(e)!==".priority"||Rt(e)===1,".priority must be the last token in a path");const r=this.getImmediateChild(s).updateChild(re(e),t);return this.updateImmediateChild(s,r)}}isEmpty(){return this.children_.isEmpty()}numChildren(){return this.children_.count()}val(e){if(this.isEmpty())return null;const t={};let s=0,r=0,o=!0;if(this.forEachChild(ae,(a,c)=>{t[a]=c.val(e),s++,o&&F.INTEGER_REGEXP_.test(a)?r=Math.max(r,Number(a)):o=!1}),!e&&o&&r<2*s){const a=[];for(const c in t)a[c]=t[c];return a}else return e&&!this.getPriority().isEmpty()&&(t[".priority"]=this.getPriority().val()),t}hash(){if(this.lazyHash_===null){let e="";this.getPriority().isEmpty()||(e+="priority:"+ad(this.getPriority().val())+":"),this.forEachChild(ae,(t,s)=>{const r=s.hash();r!==""&&(e+=":"+t+":"+r)}),this.lazyHash_=e===""?"":Mu(e)}return this.lazyHash_}getPredecessorChildName(e,t,s){const r=this.resolveIndex_(s);if(r){const o=r.getPredecessorKey(new $(e,t));return o?o.name:null}else return this.children_.getPredecessorKey(e)}getFirstChildName(e){const t=this.resolveIndex_(e);if(t){const s=t.minKey();return s&&s.name}else return this.children_.minKey()}getFirstChild(e){const t=this.getFirstChildName(e);return t?new $(t,this.children_.get(t)):null}getLastChildName(e){const t=this.resolveIndex_(e);if(t){const s=t.maxKey();return s&&s.name}else return this.children_.maxKey()}getLastChild(e){const t=this.getLastChildName(e);return t?new $(t,this.children_.get(t)):null}forEachChild(e,t){const s=this.resolveIndex_(e);return s?s.inorderTraversal(r=>t(r.name,r.node)):this.children_.inorderTraversal(t)}getIterator(e){return this.getIteratorFrom(e.minPost(),e)}getIteratorFrom(e,t){const s=this.resolveIndex_(t);if(s)return s.getIteratorFrom(e,r=>r);{const r=this.children_.getIteratorFrom(e.name,$.Wrap);let o=r.peek();for(;o!=null&&t.compare(o,e)<0;)r.getNext(),o=r.peek();return r}}getReverseIterator(e){return this.getReverseIteratorFrom(e.maxPost(),e)}getReverseIteratorFrom(e,t){const s=this.resolveIndex_(t);if(s)return s.getReverseIteratorFrom(e,r=>r);{const r=this.children_.getReverseIteratorFrom(e.name,$.Wrap);let o=r.peek();for(;o!=null&&t.compare(o,e)>0;)r.getNext(),o=r.peek();return r}}compareTo(e){return this.isEmpty()?e.isEmpty()?0:-1:e.isLeafNode()||e.isEmpty()?1:e===Ss?-1:0}withIndex(e){if(e===mn||this.indexMap_.hasIndex(e))return this;{const t=this.indexMap_.addIndex(e,this.children_);return new F(this.children_,this.priorityNode_,t)}}isIndexed(e){return e===mn||this.indexMap_.hasIndex(e)}equals(e){if(e===this)return!0;if(e.isLeafNode())return!1;{const t=e;if(this.getPriority().equals(t.getPriority()))if(this.children_.count()===t.children_.count()){const s=this.getIterator(ae),r=t.getIterator(ae);let o=s.getNext(),a=r.getNext();for(;o&&a;){if(o.name!==a.name||!o.node.equals(a.node))return!1;o=s.getNext(),a=r.getNext()}return o===null&&a===null}else return!1;else return!1}}resolveIndex_(e){return e===mn?null:this.indexMap_.get(e.toString())}}F.INTEGER_REGEXP_=/^(0|[1-9]\d*)$/;class Ev extends F{constructor(){super(new Me(aa),F.EMPTY_NODE,at.Default)}compareTo(e){return e===this?0:1}equals(e){return e===this}getPriority(){return this}getImmediateChild(e){return F.EMPTY_NODE}isEmpty(){return!1}}const Ss=new Ev;Object.defineProperties($,{MIN:{value:new $(yn,F.EMPTY_NODE)},MAX:{value:new $(Kt,Ss)}});od.__EMPTY_NODE=F.EMPTY_NODE;ye.__childrenNodeConstructor=F;_v(Ss);vv(Ss);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Iv=!0;function pe(n,e=null){if(n===null)return F.EMPTY_NODE;if(typeof n=="object"&&".priority"in n&&(e=n[".priority"]),P(e===null||typeof e=="string"||typeof e=="number"||typeof e=="object"&&".sv"in e,"Invalid priority type found: "+typeof e),typeof n=="object"&&".value"in n&&n[".value"]!==null&&(n=n[".value"]),typeof n!="object"||".sv"in n){const t=n;return new ye(t,pe(e))}if(!(n instanceof Array)&&Iv){const t=[];let s=!1;if(Ee(n,(a,c)=>{if(a.substring(0,1)!=="."){const u=pe(c);u.isEmpty()||(s=s||!u.getPriority().isEmpty(),t.push(new $(a,u)))}}),t.length===0)return F.EMPTY_NODE;const o=Sr(t,gv,a=>a.name,aa);if(s){const a=Sr(t,ae.getCompare());return new F(o,pe(e),new at({".priority":a},{".priority":ae}))}else return new F(o,pe(e),at.Default)}else{let t=F.EMPTY_NODE;return Ee(n,(s,r)=>{if(Je(n,s)&&s.substring(0,1)!=="."){const o=pe(r);(o.isLeafNode()||!o.isEmpty())&&(t=t.updateImmediateChild(s,o))}}),t.updatePriority(pe(e))}}yv(pe);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cv extends Yr{constructor(e){super(),this.indexPath_=e,P(!H(e)&&V(e)!==".priority","Can't create PathIndex with empty path or .priority key")}extractChild(e){return e.getChild(this.indexPath_)}isDefinedOn(e){return!e.getChild(this.indexPath_).isEmpty()}compare(e,t){const s=this.extractChild(e.node),r=this.extractChild(t.node),o=s.compareTo(r);return o===0?en(e.name,t.name):o}makePost(e,t){const s=pe(e),r=F.EMPTY_NODE.updateChild(this.indexPath_,s);return new $(t,r)}maxPost(){const e=F.EMPTY_NODE.updateChild(this.indexPath_,Ss);return new $(Kt,e)}toString(){return ds(this.indexPath_,0).join("/")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tv extends Yr{compare(e,t){const s=e.node.compareTo(t.node);return s===0?en(e.name,t.name):s}isDefinedOn(e){return!0}indexedValueChanged(e,t){return!e.equals(t)}minPost(){return $.MIN}maxPost(){return $.MAX}makePost(e,t){const s=pe(e);return new $(t,s)}toString(){return".value"}}const kv=new Tv;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ud(n){return{type:"value",snapshotNode:n}}function vn(n,e){return{type:"child_added",snapshotNode:e,childName:n}}function fs(n,e){return{type:"child_removed",snapshotNode:e,childName:n}}function ps(n,e,t){return{type:"child_changed",snapshotNode:e,childName:n,oldSnap:t}}function Sv(n,e){return{type:"child_moved",snapshotNode:e,childName:n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class la{constructor(e){this.index_=e}updateChild(e,t,s,r,o,a){P(e.isIndexed(this.index_),"A node must be indexed if only a child is updated");const c=e.getImmediateChild(t);return c.getChild(r).equals(s.getChild(r))&&c.isEmpty()===s.isEmpty()||(a!=null&&(s.isEmpty()?e.hasChild(t)?a.trackChildChange(fs(t,c)):P(e.isLeafNode(),"A child remove without an old child only makes sense on a leaf node"):c.isEmpty()?a.trackChildChange(vn(t,s)):a.trackChildChange(ps(t,s,c))),e.isLeafNode()&&s.isEmpty())?e:e.updateImmediateChild(t,s).withIndex(this.index_)}updateFullNode(e,t,s){return s!=null&&(e.isLeafNode()||e.forEachChild(ae,(r,o)=>{t.hasChild(r)||s.trackChildChange(fs(r,o))}),t.isLeafNode()||t.forEachChild(ae,(r,o)=>{if(e.hasChild(r)){const a=e.getImmediateChild(r);a.equals(o)||s.trackChildChange(ps(r,o,a))}else s.trackChildChange(vn(r,o))})),t.withIndex(this.index_)}updatePriority(e,t){return e.isEmpty()?F.EMPTY_NODE:e.updatePriority(t)}filtersNodes(){return!1}getIndexedFilter(){return this}getIndex(){return this.index_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ms{constructor(e){this.indexedFilter_=new la(e.getIndex()),this.index_=e.getIndex(),this.startPost_=ms.getStartPost_(e),this.endPost_=ms.getEndPost_(e),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}getStartPost(){return this.startPost_}getEndPost(){return this.endPost_}matches(e){const t=this.startIsInclusive_?this.index_.compare(this.getStartPost(),e)<=0:this.index_.compare(this.getStartPost(),e)<0,s=this.endIsInclusive_?this.index_.compare(e,this.getEndPost())<=0:this.index_.compare(e,this.getEndPost())<0;return t&&s}updateChild(e,t,s,r,o,a){return this.matches(new $(t,s))||(s=F.EMPTY_NODE),this.indexedFilter_.updateChild(e,t,s,r,o,a)}updateFullNode(e,t,s){t.isLeafNode()&&(t=F.EMPTY_NODE);let r=t.withIndex(this.index_);r=r.updatePriority(F.EMPTY_NODE);const o=this;return t.forEachChild(ae,(a,c)=>{o.matches(new $(a,c))||(r=r.updateImmediateChild(a,F.EMPTY_NODE))}),this.indexedFilter_.updateFullNode(e,r,s)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.indexedFilter_}getIndex(){return this.index_}static getStartPost_(e){if(e.hasStart()){const t=e.getIndexStartName();return e.getIndex().makePost(e.getIndexStartValue(),t)}else return e.getIndex().minPost()}static getEndPost_(e){if(e.hasEnd()){const t=e.getIndexEndName();return e.getIndex().makePost(e.getIndexEndValue(),t)}else return e.getIndex().maxPost()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nv{constructor(e){this.withinDirectionalStart=t=>this.reverse_?this.withinEndPost(t):this.withinStartPost(t),this.withinDirectionalEnd=t=>this.reverse_?this.withinStartPost(t):this.withinEndPost(t),this.withinStartPost=t=>{const s=this.index_.compare(this.rangedFilter_.getStartPost(),t);return this.startIsInclusive_?s<=0:s<0},this.withinEndPost=t=>{const s=this.index_.compare(t,this.rangedFilter_.getEndPost());return this.endIsInclusive_?s<=0:s<0},this.rangedFilter_=new ms(e),this.index_=e.getIndex(),this.limit_=e.getLimit(),this.reverse_=!e.isViewFromLeft(),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}updateChild(e,t,s,r,o,a){return this.rangedFilter_.matches(new $(t,s))||(s=F.EMPTY_NODE),e.getImmediateChild(t).equals(s)?e:e.numChildren()<this.limit_?this.rangedFilter_.getIndexedFilter().updateChild(e,t,s,r,o,a):this.fullLimitUpdateChild_(e,t,s,o,a)}updateFullNode(e,t,s){let r;if(t.isLeafNode()||t.isEmpty())r=F.EMPTY_NODE.withIndex(this.index_);else if(this.limit_*2<t.numChildren()&&t.isIndexed(this.index_)){r=F.EMPTY_NODE.withIndex(this.index_);let o;this.reverse_?o=t.getReverseIteratorFrom(this.rangedFilter_.getEndPost(),this.index_):o=t.getIteratorFrom(this.rangedFilter_.getStartPost(),this.index_);let a=0;for(;o.hasNext()&&a<this.limit_;){const c=o.getNext();if(this.withinDirectionalStart(c))if(this.withinDirectionalEnd(c))r=r.updateImmediateChild(c.name,c.node),a++;else break;else continue}}else{r=t.withIndex(this.index_),r=r.updatePriority(F.EMPTY_NODE);let o;this.reverse_?o=r.getReverseIterator(this.index_):o=r.getIterator(this.index_);let a=0;for(;o.hasNext();){const c=o.getNext();a<this.limit_&&this.withinDirectionalStart(c)&&this.withinDirectionalEnd(c)?a++:r=r.updateImmediateChild(c.name,F.EMPTY_NODE)}}return this.rangedFilter_.getIndexedFilter().updateFullNode(e,r,s)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.rangedFilter_.getIndexedFilter()}getIndex(){return this.index_}fullLimitUpdateChild_(e,t,s,r,o){let a;if(this.reverse_){const m=this.index_.getCompare();a=(b,S)=>m(S,b)}else a=this.index_.getCompare();const c=e;P(c.numChildren()===this.limit_,"");const u=new $(t,s),f=this.reverse_?c.getFirstChild(this.index_):c.getLastChild(this.index_),_=this.rangedFilter_.matches(u);if(c.hasChild(t)){const m=c.getImmediateChild(t);let b=r.getChildAfterChild(this.index_,f,this.reverse_);for(;b!=null&&(b.name===t||c.hasChild(b.name));)b=r.getChildAfterChild(this.index_,b,this.reverse_);const S=b==null?1:a(b,u);if(_&&!s.isEmpty()&&S>=0)return o!=null&&o.trackChildChange(ps(t,s,m)),c.updateImmediateChild(t,s);{o!=null&&o.trackChildChange(fs(t,m));const R=c.updateImmediateChild(t,F.EMPTY_NODE);return b!=null&&this.rangedFilter_.matches(b)?(o!=null&&o.trackChildChange(vn(b.name,b.node)),R.updateImmediateChild(b.name,b.node)):R}}else return s.isEmpty()?e:_&&a(f,u)>=0?(o!=null&&(o.trackChildChange(fs(f.name,f.node)),o.trackChildChange(vn(t,s))),c.updateImmediateChild(t,s).updateImmediateChild(f.name,F.EMPTY_NODE)):e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ca{constructor(){this.limitSet_=!1,this.startSet_=!1,this.startNameSet_=!1,this.startAfterSet_=!1,this.endSet_=!1,this.endNameSet_=!1,this.endBeforeSet_=!1,this.limit_=0,this.viewFrom_="",this.indexStartValue_=null,this.indexStartName_="",this.indexEndValue_=null,this.indexEndName_="",this.index_=ae}hasStart(){return this.startSet_}isViewFromLeft(){return this.viewFrom_===""?this.startSet_:this.viewFrom_==="l"}getIndexStartValue(){return P(this.startSet_,"Only valid if start has been set"),this.indexStartValue_}getIndexStartName(){return P(this.startSet_,"Only valid if start has been set"),this.startNameSet_?this.indexStartName_:yn}hasEnd(){return this.endSet_}getIndexEndValue(){return P(this.endSet_,"Only valid if end has been set"),this.indexEndValue_}getIndexEndName(){return P(this.endSet_,"Only valid if end has been set"),this.endNameSet_?this.indexEndName_:Kt}hasLimit(){return this.limitSet_}hasAnchoredLimit(){return this.limitSet_&&this.viewFrom_!==""}getLimit(){return P(this.limitSet_,"Only valid if limit has been set"),this.limit_}getIndex(){return this.index_}loadsAllData(){return!(this.startSet_||this.endSet_||this.limitSet_)}isDefault(){return this.loadsAllData()&&this.index_===ae}copy(){const e=new ca;return e.limitSet_=this.limitSet_,e.limit_=this.limit_,e.startSet_=this.startSet_,e.startAfterSet_=this.startAfterSet_,e.indexStartValue_=this.indexStartValue_,e.startNameSet_=this.startNameSet_,e.indexStartName_=this.indexStartName_,e.endSet_=this.endSet_,e.endBeforeSet_=this.endBeforeSet_,e.indexEndValue_=this.indexEndValue_,e.endNameSet_=this.endNameSet_,e.indexEndName_=this.indexEndName_,e.index_=this.index_,e.viewFrom_=this.viewFrom_,e}}function Av(n){return n.loadsAllData()?new la(n.getIndex()):n.hasLimit()?new Nv(n):new ms(n)}function Kc(n){const e={};if(n.isDefault())return e;let t;if(n.index_===ae?t="$priority":n.index_===kv?t="$value":n.index_===mn?t="$key":(P(n.index_ instanceof Cv,"Unrecognized index type!"),t=n.index_.toString()),e.orderBy=ge(t),n.startSet_){const s=n.startAfterSet_?"startAfter":"startAt";e[s]=ge(n.indexStartValue_),n.startNameSet_&&(e[s]+=","+ge(n.indexStartName_))}if(n.endSet_){const s=n.endBeforeSet_?"endBefore":"endAt";e[s]=ge(n.indexEndValue_),n.endNameSet_&&(e[s]+=","+ge(n.indexEndName_))}return n.limitSet_&&(n.isViewFromLeft()?e.limitToFirst=n.limit_:e.limitToLast=n.limit_),e}function Yc(n){const e={};if(n.startSet_&&(e.sp=n.indexStartValue_,n.startNameSet_&&(e.sn=n.indexStartName_),e.sin=!n.startAfterSet_),n.endSet_&&(e.ep=n.indexEndValue_,n.endNameSet_&&(e.en=n.indexEndName_),e.ein=!n.endBeforeSet_),n.limitSet_){e.l=n.limit_;let t=n.viewFrom_;t===""&&(n.isViewFromLeft()?t="l":t="r"),e.vf=t}return n.index_!==ae&&(e.i=n.index_.toString()),e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nr extends nd{constructor(e,t,s,r){super(),this.repoInfo_=e,this.onDataUpdate_=t,this.authTokenProvider_=s,this.appCheckTokenProvider_=r,this.log_=ks("p:rest:"),this.listens_={}}reportStats(e){throw new Error("Method not implemented.")}static getListenId_(e,t){return t!==void 0?"tag$"+t:(P(e._queryParams.isDefault(),"should have a tag if it's not a default query."),e._path.toString())}listen(e,t,s,r){const o=e._path.toString();this.log_("Listen called for "+o+" "+e._queryIdentifier);const a=Nr.getListenId_(e,s),c={};this.listens_[a]=c;const u=Kc(e._queryParams);this.restRequest_(o+".json",u,(f,_)=>{let m=_;if(f===404&&(m=null,f=null),f===null&&this.onDataUpdate_(o,m,!1,s),$t(this.listens_,a)===c){let b;f?f===401?b="permission_denied":b="rest_error:"+f:b="ok",r(b,null)}})}unlisten(e,t){const s=Nr.getListenId_(e,t);delete this.listens_[s]}get(e){const t=Kc(e._queryParams),s=e._path.toString(),r=new Tn;return this.restRequest_(s+".json",t,(o,a)=>{let c=a;o===404&&(c=null,o=null),o===null?(this.onDataUpdate_(s,c,!1,null),r.resolve(c)):r.reject(new Error(c))}),r.promise}refreshAuthToken(e){}restRequest_(e,t={},s){return t.format="export",Promise.all([this.authTokenProvider_.getToken(!1),this.appCheckTokenProvider_.getToken(!1)]).then(([r,o])=>{r&&r.accessToken&&(t.auth=r.accessToken),o&&o.token&&(t.ac=o.token);const a=(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host+e+"?ns="+this.repoInfo_.namespace+kn(t);this.log_("Sending REST request for "+a);const c=new XMLHttpRequest;c.onreadystatechange=()=>{if(s&&c.readyState===4){this.log_("REST Response for "+a+" received. status:",c.status,"response:",c.responseText);let u=null;if(c.status>=200&&c.status<300){try{u=ls(c.responseText)}catch{je("Failed to parse JSON response for "+a+": "+c.responseText)}s(null,u)}else c.status!==401&&c.status!==404&&je("Got unsuccessful REST response for "+a+" Status: "+c.status),s(c.status);s=null}},c.open("GET",a,!0),c.send()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rv{constructor(){this.rootNode_=F.EMPTY_NODE}getNode(e){return this.rootNode_.getChild(e)}updateSnapshot(e,t){this.rootNode_=this.rootNode_.updateChild(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ar(){return{value:null,children:new Map}}function dd(n,e,t){if(H(e))n.value=t,n.children.clear();else if(n.value!==null)n.value=n.value.updateChild(e,t);else{const s=V(e);n.children.has(s)||n.children.set(s,Ar());const r=n.children.get(s);e=re(e),dd(r,e,t)}}function po(n,e,t){n.value!==null?t(e,n.value):Pv(n,(s,r)=>{const o=new ee(e.toString()+"/"+s);po(r,o,t)})}function Pv(n,e){n.children.forEach((t,s)=>{e(s,t)})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jv{constructor(e){this.collection_=e,this.last_=null}get(){const e=this.collection_.get(),t=Object.assign({},e);return this.last_&&Ee(this.last_,(s,r)=>{t[s]=t[s]-r}),this.last_=e,t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jc=10*1e3,Ov=30*1e3,Dv=5*60*1e3;class Lv{constructor(e,t){this.server_=t,this.statsToReport_={},this.statsListener_=new jv(e);const s=Jc+(Ov-Jc)*Math.random();ns(this.reportStats_.bind(this),Math.floor(s))}reportStats_(){const e=this.statsListener_.get(),t={};let s=!1;Ee(e,(r,o)=>{o>0&&Je(this.statsToReport_,r)&&(t[r]=o,s=!0)}),s&&this.server_.reportStats(t),ns(this.reportStats_.bind(this),Math.floor(Math.random()*2*Dv))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Ge;(function(n){n[n.OVERWRITE=0]="OVERWRITE",n[n.MERGE=1]="MERGE",n[n.ACK_USER_WRITE=2]="ACK_USER_WRITE",n[n.LISTEN_COMPLETE=3]="LISTEN_COMPLETE"})(Ge||(Ge={}));function ha(){return{fromUser:!0,fromServer:!1,queryId:null,tagged:!1}}function ua(){return{fromUser:!1,fromServer:!0,queryId:null,tagged:!1}}function da(n){return{fromUser:!1,fromServer:!0,queryId:n,tagged:!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rr{constructor(e,t,s){this.path=e,this.affectedTree=t,this.revert=s,this.type=Ge.ACK_USER_WRITE,this.source=ha()}operationForChild(e){if(H(this.path)){if(this.affectedTree.value!=null)return P(this.affectedTree.children.isEmpty(),"affectedTree should not have overlapping affected paths."),this;{const t=this.affectedTree.subtree(new ee(e));return new Rr(Y(),t,this.revert)}}else return P(V(this.path)===e,"operationForChild called for unrelated child."),new Rr(re(this.path),this.affectedTree,this.revert)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gs{constructor(e,t){this.source=e,this.path=t,this.type=Ge.LISTEN_COMPLETE}operationForChild(e){return H(this.path)?new gs(this.source,Y()):new gs(this.source,re(this.path))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yt{constructor(e,t,s){this.source=e,this.path=t,this.snap=s,this.type=Ge.OVERWRITE}operationForChild(e){return H(this.path)?new Yt(this.source,Y(),this.snap.getImmediateChild(e)):new Yt(this.source,re(this.path),this.snap)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xn{constructor(e,t,s){this.source=e,this.path=t,this.children=s,this.type=Ge.MERGE}operationForChild(e){if(H(this.path)){const t=this.children.subtree(new ee(e));return t.isEmpty()?null:t.value?new Yt(this.source,Y(),t.value):new xn(this.source,Y(),t)}else return P(V(this.path)===e,"Can't get a merge for a child not on the path of the operation"),new xn(this.source,re(this.path),this.children)}toString(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pt{constructor(e,t,s){this.node_=e,this.fullyInitialized_=t,this.filtered_=s}isFullyInitialized(){return this.fullyInitialized_}isFiltered(){return this.filtered_}isCompleteForPath(e){if(H(e))return this.isFullyInitialized()&&!this.filtered_;const t=V(e);return this.isCompleteForChild(t)}isCompleteForChild(e){return this.isFullyInitialized()&&!this.filtered_||this.node_.hasChild(e)}getNode(){return this.node_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mv{constructor(e){this.query_=e,this.index_=this.query_._queryParams.getIndex()}}function Uv(n,e,t,s){const r=[],o=[];return e.forEach(a=>{a.type==="child_changed"&&n.index_.indexedValueChanged(a.oldSnap,a.snapshotNode)&&o.push(Sv(a.childName,a.snapshotNode))}),Yn(n,r,"child_removed",e,s,t),Yn(n,r,"child_added",e,s,t),Yn(n,r,"child_moved",o,s,t),Yn(n,r,"child_changed",e,s,t),Yn(n,r,"value",e,s,t),r}function Yn(n,e,t,s,r,o){const a=s.filter(c=>c.type===t);a.sort((c,u)=>zv(n,c,u)),a.forEach(c=>{const u=Fv(n,c,o);r.forEach(f=>{f.respondsTo(c.type)&&e.push(f.createEvent(u,n.query_))})})}function Fv(n,e,t){return e.type==="value"||e.type==="child_removed"||(e.prevName=t.getPredecessorChildName(e.childName,e.snapshotNode,n.index_)),e}function zv(n,e,t){if(e.childName==null||t.childName==null)throw Cn("Should only compare child_ events.");const s=new $(e.childName,e.snapshotNode),r=new $(t.childName,t.snapshotNode);return n.index_.compare(s,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jr(n,e){return{eventCache:n,serverCache:e}}function ss(n,e,t,s){return Jr(new Pt(e,t,s),n.serverCache)}function fd(n,e,t,s){return Jr(n.eventCache,new Pt(e,t,s))}function Pr(n){return n.eventCache.isFullyInitialized()?n.eventCache.getNode():null}function Jt(n){return n.serverCache.isFullyInitialized()?n.serverCache.getNode():null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Hi;const Bv=()=>(Hi||(Hi=new Me(Cy)),Hi);class se{constructor(e,t=Bv()){this.value=e,this.children=t}static fromObject(e){let t=new se(null);return Ee(e,(s,r)=>{t=t.set(new ee(s),r)}),t}isEmpty(){return this.value===null&&this.children.isEmpty()}findRootMostMatchingPathAndValue(e,t){if(this.value!=null&&t(this.value))return{path:Y(),value:this.value};if(H(e))return null;{const s=V(e),r=this.children.get(s);if(r!==null){const o=r.findRootMostMatchingPathAndValue(re(e),t);return o!=null?{path:ce(new ee(s),o.path),value:o.value}:null}else return null}}findRootMostValueAndPath(e){return this.findRootMostMatchingPathAndValue(e,()=>!0)}subtree(e){if(H(e))return this;{const t=V(e),s=this.children.get(t);return s!==null?s.subtree(re(e)):new se(null)}}set(e,t){if(H(e))return new se(t,this.children);{const s=V(e),o=(this.children.get(s)||new se(null)).set(re(e),t),a=this.children.insert(s,o);return new se(this.value,a)}}remove(e){if(H(e))return this.children.isEmpty()?new se(null):new se(null,this.children);{const t=V(e),s=this.children.get(t);if(s){const r=s.remove(re(e));let o;return r.isEmpty()?o=this.children.remove(t):o=this.children.insert(t,r),this.value===null&&o.isEmpty()?new se(null):new se(this.value,o)}else return this}}get(e){if(H(e))return this.value;{const t=V(e),s=this.children.get(t);return s?s.get(re(e)):null}}setTree(e,t){if(H(e))return t;{const s=V(e),o=(this.children.get(s)||new se(null)).setTree(re(e),t);let a;return o.isEmpty()?a=this.children.remove(s):a=this.children.insert(s,o),new se(this.value,a)}}fold(e){return this.fold_(Y(),e)}fold_(e,t){const s={};return this.children.inorderTraversal((r,o)=>{s[r]=o.fold_(ce(e,r),t)}),t(e,this.value,s)}findOnPath(e,t){return this.findOnPath_(e,Y(),t)}findOnPath_(e,t,s){const r=this.value?s(t,this.value):!1;if(r)return r;if(H(e))return null;{const o=V(e),a=this.children.get(o);return a?a.findOnPath_(re(e),ce(t,o),s):null}}foreachOnPath(e,t){return this.foreachOnPath_(e,Y(),t)}foreachOnPath_(e,t,s){if(H(e))return this;{this.value&&s(t,this.value);const r=V(e),o=this.children.get(r);return o?o.foreachOnPath_(re(e),ce(t,r),s):new se(null)}}foreach(e){this.foreach_(Y(),e)}foreach_(e,t){this.children.inorderTraversal((s,r)=>{r.foreach_(ce(e,s),t)}),this.value&&t(e,this.value)}foreachChild(e){this.children.inorderTraversal((t,s)=>{s.value&&e(t,s.value)})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ye{constructor(e){this.writeTree_=e}static empty(){return new Ye(new se(null))}}function rs(n,e,t){if(H(e))return new Ye(new se(t));{const s=n.writeTree_.findRootMostValueAndPath(e);if(s!=null){const r=s.path;let o=s.value;const a=Pe(r,e);return o=o.updateChild(a,t),new Ye(n.writeTree_.set(r,o))}else{const r=new se(t),o=n.writeTree_.setTree(e,r);return new Ye(o)}}}function mo(n,e,t){let s=n;return Ee(t,(r,o)=>{s=rs(s,ce(e,r),o)}),s}function Qc(n,e){if(H(e))return Ye.empty();{const t=n.writeTree_.setTree(e,new se(null));return new Ye(t)}}function go(n,e){return tn(n,e)!=null}function tn(n,e){const t=n.writeTree_.findRootMostValueAndPath(e);return t!=null?n.writeTree_.get(t.path).getChild(Pe(t.path,e)):null}function Xc(n){const e=[],t=n.writeTree_.value;return t!=null?t.isLeafNode()||t.forEachChild(ae,(s,r)=>{e.push(new $(s,r))}):n.writeTree_.children.inorderTraversal((s,r)=>{r.value!=null&&e.push(new $(s,r.value))}),e}function St(n,e){if(H(e))return n;{const t=tn(n,e);return t!=null?new Ye(new se(t)):new Ye(n.writeTree_.subtree(e))}}function _o(n){return n.writeTree_.isEmpty()}function bn(n,e){return pd(Y(),n.writeTree_,e)}function pd(n,e,t){if(e.value!=null)return t.updateChild(n,e.value);{let s=null;return e.children.inorderTraversal((r,o)=>{r===".priority"?(P(o.value!==null,"Priority writes must always be leaf nodes"),s=o.value):t=pd(ce(n,r),o,t)}),!t.getChild(n).isEmpty()&&s!==null&&(t=t.updateChild(ce(n,".priority"),s)),t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qr(n,e){return yd(e,n)}function Wv(n,e,t,s,r){P(s>n.lastWriteId,"Stacking an older write on top of newer ones"),r===void 0&&(r=!0),n.allWrites.push({path:e,snap:t,writeId:s,visible:r}),r&&(n.visibleWrites=rs(n.visibleWrites,e,t)),n.lastWriteId=s}function Vv(n,e,t,s){P(s>n.lastWriteId,"Stacking an older merge on top of newer ones"),n.allWrites.push({path:e,children:t,writeId:s,visible:!0}),n.visibleWrites=mo(n.visibleWrites,e,t),n.lastWriteId=s}function $v(n,e){for(let t=0;t<n.allWrites.length;t++){const s=n.allWrites[t];if(s.writeId===e)return s}return null}function Hv(n,e){const t=n.allWrites.findIndex(c=>c.writeId===e);P(t>=0,"removeWrite called with nonexistent writeId.");const s=n.allWrites[t];n.allWrites.splice(t,1);let r=s.visible,o=!1,a=n.allWrites.length-1;for(;r&&a>=0;){const c=n.allWrites[a];c.visible&&(a>=t&&qv(c,s.path)?r=!1:Be(s.path,c.path)&&(o=!0)),a--}if(r){if(o)return Gv(n),!0;if(s.snap)n.visibleWrites=Qc(n.visibleWrites,s.path);else{const c=s.children;Ee(c,u=>{n.visibleWrites=Qc(n.visibleWrites,ce(s.path,u))})}return!0}else return!1}function qv(n,e){if(n.snap)return Be(n.path,e);for(const t in n.children)if(n.children.hasOwnProperty(t)&&Be(ce(n.path,t),e))return!0;return!1}function Gv(n){n.visibleWrites=md(n.allWrites,Kv,Y()),n.allWrites.length>0?n.lastWriteId=n.allWrites[n.allWrites.length-1].writeId:n.lastWriteId=-1}function Kv(n){return n.visible}function md(n,e,t){let s=Ye.empty();for(let r=0;r<n.length;++r){const o=n[r];if(e(o)){const a=o.path;let c;if(o.snap)Be(t,a)?(c=Pe(t,a),s=rs(s,c,o.snap)):Be(a,t)&&(c=Pe(a,t),s=rs(s,Y(),o.snap.getChild(c)));else if(o.children){if(Be(t,a))c=Pe(t,a),s=mo(s,c,o.children);else if(Be(a,t))if(c=Pe(a,t),H(c))s=mo(s,Y(),o.children);else{const u=$t(o.children,V(c));if(u){const f=u.getChild(re(c));s=rs(s,Y(),f)}}}else throw Cn("WriteRecord should have .snap or .children")}}return s}function gd(n,e,t,s,r){if(!s&&!r){const o=tn(n.visibleWrites,e);if(o!=null)return o;{const a=St(n.visibleWrites,e);if(_o(a))return t;if(t==null&&!go(a,Y()))return null;{const c=t||F.EMPTY_NODE;return bn(a,c)}}}else{const o=St(n.visibleWrites,e);if(!r&&_o(o))return t;if(!r&&t==null&&!go(o,Y()))return null;{const a=function(f){return(f.visible||r)&&(!s||!~s.indexOf(f.writeId))&&(Be(f.path,e)||Be(e,f.path))},c=md(n.allWrites,a,e),u=t||F.EMPTY_NODE;return bn(c,u)}}}function Yv(n,e,t){let s=F.EMPTY_NODE;const r=tn(n.visibleWrites,e);if(r)return r.isLeafNode()||r.forEachChild(ae,(o,a)=>{s=s.updateImmediateChild(o,a)}),s;if(t){const o=St(n.visibleWrites,e);return t.forEachChild(ae,(a,c)=>{const u=bn(St(o,new ee(a)),c);s=s.updateImmediateChild(a,u)}),Xc(o).forEach(a=>{s=s.updateImmediateChild(a.name,a.node)}),s}else{const o=St(n.visibleWrites,e);return Xc(o).forEach(a=>{s=s.updateImmediateChild(a.name,a.node)}),s}}function Jv(n,e,t,s,r){P(s||r,"Either existingEventSnap or existingServerSnap must exist");const o=ce(e,t);if(go(n.visibleWrites,o))return null;{const a=St(n.visibleWrites,o);return _o(a)?r.getChild(t):bn(a,r.getChild(t))}}function Qv(n,e,t,s){const r=ce(e,t),o=tn(n.visibleWrites,r);if(o!=null)return o;if(s.isCompleteForChild(t)){const a=St(n.visibleWrites,r);return bn(a,s.getNode().getImmediateChild(t))}else return null}function Xv(n,e){return tn(n.visibleWrites,e)}function Zv(n,e,t,s,r,o,a){let c;const u=St(n.visibleWrites,e),f=tn(u,Y());if(f!=null)c=f;else if(t!=null)c=bn(u,t);else return[];if(c=c.withIndex(a),!c.isEmpty()&&!c.isLeafNode()){const _=[],m=a.getCompare(),b=o?c.getReverseIteratorFrom(s,a):c.getIteratorFrom(s,a);let S=b.getNext();for(;S&&_.length<r;)m(S,s)!==0&&_.push(S),S=b.getNext();return _}else return[]}function ex(){return{visibleWrites:Ye.empty(),allWrites:[],lastWriteId:-1}}function jr(n,e,t,s){return gd(n.writeTree,n.treePath,e,t,s)}function fa(n,e){return Yv(n.writeTree,n.treePath,e)}function Zc(n,e,t,s){return Jv(n.writeTree,n.treePath,e,t,s)}function Or(n,e){return Xv(n.writeTree,ce(n.treePath,e))}function tx(n,e,t,s,r,o){return Zv(n.writeTree,n.treePath,e,t,s,r,o)}function pa(n,e,t){return Qv(n.writeTree,n.treePath,e,t)}function _d(n,e){return yd(ce(n.treePath,e),n.writeTree)}function yd(n,e){return{treePath:n,writeTree:e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nx{constructor(){this.changeMap=new Map}trackChildChange(e){const t=e.type,s=e.childName;P(t==="child_added"||t==="child_changed"||t==="child_removed","Only child changes supported for tracking"),P(s!==".priority","Only non-priority child changes can be tracked.");const r=this.changeMap.get(s);if(r){const o=r.type;if(t==="child_added"&&o==="child_removed")this.changeMap.set(s,ps(s,e.snapshotNode,r.snapshotNode));else if(t==="child_removed"&&o==="child_added")this.changeMap.delete(s);else if(t==="child_removed"&&o==="child_changed")this.changeMap.set(s,fs(s,r.oldSnap));else if(t==="child_changed"&&o==="child_added")this.changeMap.set(s,vn(s,e.snapshotNode));else if(t==="child_changed"&&o==="child_changed")this.changeMap.set(s,ps(s,e.snapshotNode,r.oldSnap));else throw Cn("Illegal combination of changes: "+e+" occurred after "+r)}else this.changeMap.set(s,e)}getChanges(){return Array.from(this.changeMap.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sx{getCompleteChild(e){return null}getChildAfterChild(e,t,s){return null}}const vd=new sx;class ma{constructor(e,t,s=null){this.writes_=e,this.viewCache_=t,this.optCompleteServerCache_=s}getCompleteChild(e){const t=this.viewCache_.eventCache;if(t.isCompleteForChild(e))return t.getNode().getImmediateChild(e);{const s=this.optCompleteServerCache_!=null?new Pt(this.optCompleteServerCache_,!0,!1):this.viewCache_.serverCache;return pa(this.writes_,e,s)}}getChildAfterChild(e,t,s){const r=this.optCompleteServerCache_!=null?this.optCompleteServerCache_:Jt(this.viewCache_),o=tx(this.writes_,r,t,1,s,e);return o.length===0?null:o[0]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rx(n){return{filter:n}}function ix(n,e){P(e.eventCache.getNode().isIndexed(n.filter.getIndex()),"Event snap not indexed"),P(e.serverCache.getNode().isIndexed(n.filter.getIndex()),"Server snap not indexed")}function ox(n,e,t,s,r){const o=new nx;let a,c;if(t.type===Ge.OVERWRITE){const f=t;f.source.fromUser?a=yo(n,e,f.path,f.snap,s,r,o):(P(f.source.fromServer,"Unknown source."),c=f.source.tagged||e.serverCache.isFiltered()&&!H(f.path),a=Dr(n,e,f.path,f.snap,s,r,c,o))}else if(t.type===Ge.MERGE){const f=t;f.source.fromUser?a=lx(n,e,f.path,f.children,s,r,o):(P(f.source.fromServer,"Unknown source."),c=f.source.tagged||e.serverCache.isFiltered(),a=vo(n,e,f.path,f.children,s,r,c,o))}else if(t.type===Ge.ACK_USER_WRITE){const f=t;f.revert?a=ux(n,e,f.path,s,r,o):a=cx(n,e,f.path,f.affectedTree,s,r,o)}else if(t.type===Ge.LISTEN_COMPLETE)a=hx(n,e,t.path,s,o);else throw Cn("Unknown operation type: "+t.type);const u=o.getChanges();return ax(e,a,u),{viewCache:a,changes:u}}function ax(n,e,t){const s=e.eventCache;if(s.isFullyInitialized()){const r=s.getNode().isLeafNode()||s.getNode().isEmpty(),o=Pr(n);(t.length>0||!n.eventCache.isFullyInitialized()||r&&!s.getNode().equals(o)||!s.getNode().getPriority().equals(o.getPriority()))&&t.push(ud(Pr(e)))}}function xd(n,e,t,s,r,o){const a=e.eventCache;if(Or(s,t)!=null)return e;{let c,u;if(H(t))if(P(e.serverCache.isFullyInitialized(),"If change path is empty, we must have complete server data"),e.serverCache.isFiltered()){const f=Jt(e),_=f instanceof F?f:F.EMPTY_NODE,m=fa(s,_);c=n.filter.updateFullNode(e.eventCache.getNode(),m,o)}else{const f=jr(s,Jt(e));c=n.filter.updateFullNode(e.eventCache.getNode(),f,o)}else{const f=V(t);if(f===".priority"){P(Rt(t)===1,"Can't have a priority with additional path components");const _=a.getNode();u=e.serverCache.getNode();const m=Zc(s,t,_,u);m!=null?c=n.filter.updatePriority(_,m):c=a.getNode()}else{const _=re(t);let m;if(a.isCompleteForChild(f)){u=e.serverCache.getNode();const b=Zc(s,t,a.getNode(),u);b!=null?m=a.getNode().getImmediateChild(f).updateChild(_,b):m=a.getNode().getImmediateChild(f)}else m=pa(s,f,e.serverCache);m!=null?c=n.filter.updateChild(a.getNode(),f,m,_,r,o):c=a.getNode()}}return ss(e,c,a.isFullyInitialized()||H(t),n.filter.filtersNodes())}}function Dr(n,e,t,s,r,o,a,c){const u=e.serverCache;let f;const _=a?n.filter:n.filter.getIndexedFilter();if(H(t))f=_.updateFullNode(u.getNode(),s,null);else if(_.filtersNodes()&&!u.isFiltered()){const S=u.getNode().updateChild(t,s);f=_.updateFullNode(u.getNode(),S,null)}else{const S=V(t);if(!u.isCompleteForPath(t)&&Rt(t)>1)return e;const T=re(t),A=u.getNode().getImmediateChild(S).updateChild(T,s);S===".priority"?f=_.updatePriority(u.getNode(),A):f=_.updateChild(u.getNode(),S,A,T,vd,null)}const m=fd(e,f,u.isFullyInitialized()||H(t),_.filtersNodes()),b=new ma(r,m,o);return xd(n,m,t,r,b,c)}function yo(n,e,t,s,r,o,a){const c=e.eventCache;let u,f;const _=new ma(r,e,o);if(H(t))f=n.filter.updateFullNode(e.eventCache.getNode(),s,a),u=ss(e,f,!0,n.filter.filtersNodes());else{const m=V(t);if(m===".priority")f=n.filter.updatePriority(e.eventCache.getNode(),s),u=ss(e,f,c.isFullyInitialized(),c.isFiltered());else{const b=re(t),S=c.getNode().getImmediateChild(m);let T;if(H(b))T=s;else{const R=_.getCompleteChild(m);R!=null?ra(b)===".priority"&&R.getChild(rd(b)).isEmpty()?T=R:T=R.updateChild(b,s):T=F.EMPTY_NODE}if(S.equals(T))u=e;else{const R=n.filter.updateChild(c.getNode(),m,T,b,_,a);u=ss(e,R,c.isFullyInitialized(),n.filter.filtersNodes())}}}return u}function eh(n,e){return n.eventCache.isCompleteForChild(e)}function lx(n,e,t,s,r,o,a){let c=e;return s.foreach((u,f)=>{const _=ce(t,u);eh(e,V(_))&&(c=yo(n,c,_,f,r,o,a))}),s.foreach((u,f)=>{const _=ce(t,u);eh(e,V(_))||(c=yo(n,c,_,f,r,o,a))}),c}function th(n,e,t){return t.foreach((s,r)=>{e=e.updateChild(s,r)}),e}function vo(n,e,t,s,r,o,a,c){if(e.serverCache.getNode().isEmpty()&&!e.serverCache.isFullyInitialized())return e;let u=e,f;H(t)?f=s:f=new se(null).setTree(t,s);const _=e.serverCache.getNode();return f.children.inorderTraversal((m,b)=>{if(_.hasChild(m)){const S=e.serverCache.getNode().getImmediateChild(m),T=th(n,S,b);u=Dr(n,u,new ee(m),T,r,o,a,c)}}),f.children.inorderTraversal((m,b)=>{const S=!e.serverCache.isCompleteForChild(m)&&b.value===null;if(!_.hasChild(m)&&!S){const T=e.serverCache.getNode().getImmediateChild(m),R=th(n,T,b);u=Dr(n,u,new ee(m),R,r,o,a,c)}}),u}function cx(n,e,t,s,r,o,a){if(Or(r,t)!=null)return e;const c=e.serverCache.isFiltered(),u=e.serverCache;if(s.value!=null){if(H(t)&&u.isFullyInitialized()||u.isCompleteForPath(t))return Dr(n,e,t,u.getNode().getChild(t),r,o,c,a);if(H(t)){let f=new se(null);return u.getNode().forEachChild(mn,(_,m)=>{f=f.set(new ee(_),m)}),vo(n,e,t,f,r,o,c,a)}else return e}else{let f=new se(null);return s.foreach((_,m)=>{const b=ce(t,_);u.isCompleteForPath(b)&&(f=f.set(_,u.getNode().getChild(b)))}),vo(n,e,t,f,r,o,c,a)}}function hx(n,e,t,s,r){const o=e.serverCache,a=fd(e,o.getNode(),o.isFullyInitialized()||H(t),o.isFiltered());return xd(n,a,t,s,vd,r)}function ux(n,e,t,s,r,o){let a;if(Or(s,t)!=null)return e;{const c=new ma(s,e,r),u=e.eventCache.getNode();let f;if(H(t)||V(t)===".priority"){let _;if(e.serverCache.isFullyInitialized())_=jr(s,Jt(e));else{const m=e.serverCache.getNode();P(m instanceof F,"serverChildren would be complete if leaf node"),_=fa(s,m)}_=_,f=n.filter.updateFullNode(u,_,o)}else{const _=V(t);let m=pa(s,_,e.serverCache);m==null&&e.serverCache.isCompleteForChild(_)&&(m=u.getImmediateChild(_)),m!=null?f=n.filter.updateChild(u,_,m,re(t),c,o):e.eventCache.getNode().hasChild(_)?f=n.filter.updateChild(u,_,F.EMPTY_NODE,re(t),c,o):f=u,f.isEmpty()&&e.serverCache.isFullyInitialized()&&(a=jr(s,Jt(e)),a.isLeafNode()&&(f=n.filter.updateFullNode(f,a,o)))}return a=e.serverCache.isFullyInitialized()||Or(s,Y())!=null,ss(e,f,a,n.filter.filtersNodes())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dx{constructor(e,t){this.query_=e,this.eventRegistrations_=[];const s=this.query_._queryParams,r=new la(s.getIndex()),o=Av(s);this.processor_=rx(o);const a=t.serverCache,c=t.eventCache,u=r.updateFullNode(F.EMPTY_NODE,a.getNode(),null),f=o.updateFullNode(F.EMPTY_NODE,c.getNode(),null),_=new Pt(u,a.isFullyInitialized(),r.filtersNodes()),m=new Pt(f,c.isFullyInitialized(),o.filtersNodes());this.viewCache_=Jr(m,_),this.eventGenerator_=new Mv(this.query_)}get query(){return this.query_}}function fx(n){return n.viewCache_.serverCache.getNode()}function px(n){return Pr(n.viewCache_)}function mx(n,e){const t=Jt(n.viewCache_);return t&&(n.query._queryParams.loadsAllData()||!H(e)&&!t.getImmediateChild(V(e)).isEmpty())?t.getChild(e):null}function nh(n){return n.eventRegistrations_.length===0}function gx(n,e){n.eventRegistrations_.push(e)}function sh(n,e,t){const s=[];if(t){P(e==null,"A cancel should cancel all event registrations.");const r=n.query._path;n.eventRegistrations_.forEach(o=>{const a=o.createCancelEvent(t,r);a&&s.push(a)})}if(e){let r=[];for(let o=0;o<n.eventRegistrations_.length;++o){const a=n.eventRegistrations_[o];if(!a.matches(e))r.push(a);else if(e.hasAnyCallback()){r=r.concat(n.eventRegistrations_.slice(o+1));break}}n.eventRegistrations_=r}else n.eventRegistrations_=[];return s}function rh(n,e,t,s){e.type===Ge.MERGE&&e.source.queryId!==null&&(P(Jt(n.viewCache_),"We should always have a full cache before handling merges"),P(Pr(n.viewCache_),"Missing event cache, even though we have a server cache"));const r=n.viewCache_,o=ox(n.processor_,r,e,t,s);return ix(n.processor_,o.viewCache),P(o.viewCache.serverCache.isFullyInitialized()||!r.serverCache.isFullyInitialized(),"Once a server snap is complete, it should never go back"),n.viewCache_=o.viewCache,bd(n,o.changes,o.viewCache.eventCache.getNode(),null)}function _x(n,e){const t=n.viewCache_.eventCache,s=[];return t.getNode().isLeafNode()||t.getNode().forEachChild(ae,(o,a)=>{s.push(vn(o,a))}),t.isFullyInitialized()&&s.push(ud(t.getNode())),bd(n,s,t.getNode(),e)}function bd(n,e,t,s){const r=s?[s]:n.eventRegistrations_;return Uv(n.eventGenerator_,e,t,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Lr;class wd{constructor(){this.views=new Map}}function yx(n){P(!Lr,"__referenceConstructor has already been defined"),Lr=n}function vx(){return P(Lr,"Reference.ts has not been loaded"),Lr}function xx(n){return n.views.size===0}function ga(n,e,t,s){const r=e.source.queryId;if(r!==null){const o=n.views.get(r);return P(o!=null,"SyncTree gave us an op for an invalid query."),rh(o,e,t,s)}else{let o=[];for(const a of n.views.values())o=o.concat(rh(a,e,t,s));return o}}function Ed(n,e,t,s,r){const o=e._queryIdentifier,a=n.views.get(o);if(!a){let c=jr(t,r?s:null),u=!1;c?u=!0:s instanceof F?(c=fa(t,s),u=!1):(c=F.EMPTY_NODE,u=!1);const f=Jr(new Pt(c,u,!1),new Pt(s,r,!1));return new dx(e,f)}return a}function bx(n,e,t,s,r,o){const a=Ed(n,e,s,r,o);return n.views.has(e._queryIdentifier)||n.views.set(e._queryIdentifier,a),gx(a,t),_x(a,t)}function wx(n,e,t,s){const r=e._queryIdentifier,o=[];let a=[];const c=jt(n);if(r==="default")for(const[u,f]of n.views.entries())a=a.concat(sh(f,t,s)),nh(f)&&(n.views.delete(u),f.query._queryParams.loadsAllData()||o.push(f.query));else{const u=n.views.get(r);u&&(a=a.concat(sh(u,t,s)),nh(u)&&(n.views.delete(r),u.query._queryParams.loadsAllData()||o.push(u.query)))}return c&&!jt(n)&&o.push(new(vx())(e._repo,e._path)),{removed:o,events:a}}function Id(n){const e=[];for(const t of n.views.values())t.query._queryParams.loadsAllData()||e.push(t);return e}function Nt(n,e){let t=null;for(const s of n.views.values())t=t||mx(s,e);return t}function Cd(n,e){if(e._queryParams.loadsAllData())return Xr(n);{const s=e._queryIdentifier;return n.views.get(s)}}function Td(n,e){return Cd(n,e)!=null}function jt(n){return Xr(n)!=null}function Xr(n){for(const e of n.views.values())if(e.query._queryParams.loadsAllData())return e;return null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Mr;function Ex(n){P(!Mr,"__referenceConstructor has already been defined"),Mr=n}function Ix(){return P(Mr,"Reference.ts has not been loaded"),Mr}let Cx=1;class ih{constructor(e){this.listenProvider_=e,this.syncPointTree_=new se(null),this.pendingWriteTree_=ex(),this.tagToQueryMap=new Map,this.queryToTagMap=new Map}}function _a(n,e,t,s,r){return Wv(n.pendingWriteTree_,e,t,s,r),r?An(n,new Yt(ha(),e,t)):[]}function Tx(n,e,t,s){Vv(n.pendingWriteTree_,e,t,s);const r=se.fromObject(t);return An(n,new xn(ha(),e,r))}function It(n,e,t=!1){const s=$v(n.pendingWriteTree_,e);if(Hv(n.pendingWriteTree_,e)){let o=new se(null);return s.snap!=null?o=o.set(Y(),!0):Ee(s.children,a=>{o=o.set(new ee(a),!0)}),An(n,new Rr(s.path,o,t))}else return[]}function Ns(n,e,t){return An(n,new Yt(ua(),e,t))}function kx(n,e,t){const s=se.fromObject(t);return An(n,new xn(ua(),e,s))}function Sx(n,e){return An(n,new gs(ua(),e))}function Nx(n,e,t){const s=ya(n,t);if(s){const r=va(s),o=r.path,a=r.queryId,c=Pe(o,e),u=new gs(da(a),c);return xa(n,o,u)}else return[]}function Ur(n,e,t,s,r=!1){const o=e._path,a=n.syncPointTree_.get(o);let c=[];if(a&&(e._queryIdentifier==="default"||Td(a,e))){const u=wx(a,e,t,s);xx(a)&&(n.syncPointTree_=n.syncPointTree_.remove(o));const f=u.removed;if(c=u.events,!r){const _=f.findIndex(b=>b._queryParams.loadsAllData())!==-1,m=n.syncPointTree_.findOnPath(o,(b,S)=>jt(S));if(_&&!m){const b=n.syncPointTree_.subtree(o);if(!b.isEmpty()){const S=Px(b);for(let T=0;T<S.length;++T){const R=S[T],A=R.query,U=Ad(n,R);n.listenProvider_.startListening(is(A),_s(n,A),U.hashFn,U.onComplete)}}}!m&&f.length>0&&!s&&(_?n.listenProvider_.stopListening(is(e),null):f.forEach(b=>{const S=n.queryToTagMap.get(ei(b));n.listenProvider_.stopListening(is(b),S)}))}jx(n,f)}return c}function kd(n,e,t,s){const r=ya(n,s);if(r!=null){const o=va(r),a=o.path,c=o.queryId,u=Pe(a,e),f=new Yt(da(c),u,t);return xa(n,a,f)}else return[]}function Ax(n,e,t,s){const r=ya(n,s);if(r){const o=va(r),a=o.path,c=o.queryId,u=Pe(a,e),f=se.fromObject(t),_=new xn(da(c),u,f);return xa(n,a,_)}else return[]}function xo(n,e,t,s=!1){const r=e._path;let o=null,a=!1;n.syncPointTree_.foreachOnPath(r,(b,S)=>{const T=Pe(b,r);o=o||Nt(S,T),a=a||jt(S)});let c=n.syncPointTree_.get(r);c?(a=a||jt(c),o=o||Nt(c,Y())):(c=new wd,n.syncPointTree_=n.syncPointTree_.set(r,c));let u;o!=null?u=!0:(u=!1,o=F.EMPTY_NODE,n.syncPointTree_.subtree(r).foreachChild((S,T)=>{const R=Nt(T,Y());R&&(o=o.updateImmediateChild(S,R))}));const f=Td(c,e);if(!f&&!e._queryParams.loadsAllData()){const b=ei(e);P(!n.queryToTagMap.has(b),"View does not exist, but we have a tag");const S=Ox();n.queryToTagMap.set(b,S),n.tagToQueryMap.set(S,b)}const _=Qr(n.pendingWriteTree_,r);let m=bx(c,e,t,_,o,u);if(!f&&!a&&!s){const b=Cd(c,e);m=m.concat(Dx(n,e,b))}return m}function Zr(n,e,t){const r=n.pendingWriteTree_,o=n.syncPointTree_.findOnPath(e,(a,c)=>{const u=Pe(a,e),f=Nt(c,u);if(f)return f});return gd(r,e,o,t,!0)}function Rx(n,e){const t=e._path;let s=null;n.syncPointTree_.foreachOnPath(t,(f,_)=>{const m=Pe(f,t);s=s||Nt(_,m)});let r=n.syncPointTree_.get(t);r?s=s||Nt(r,Y()):(r=new wd,n.syncPointTree_=n.syncPointTree_.set(t,r));const o=s!=null,a=o?new Pt(s,!0,!1):null,c=Qr(n.pendingWriteTree_,e._path),u=Ed(r,e,c,o?a.getNode():F.EMPTY_NODE,o);return px(u)}function An(n,e){return Sd(e,n.syncPointTree_,null,Qr(n.pendingWriteTree_,Y()))}function Sd(n,e,t,s){if(H(n.path))return Nd(n,e,t,s);{const r=e.get(Y());t==null&&r!=null&&(t=Nt(r,Y()));let o=[];const a=V(n.path),c=n.operationForChild(a),u=e.children.get(a);if(u&&c){const f=t?t.getImmediateChild(a):null,_=_d(s,a);o=o.concat(Sd(c,u,f,_))}return r&&(o=o.concat(ga(r,n,s,t))),o}}function Nd(n,e,t,s){const r=e.get(Y());t==null&&r!=null&&(t=Nt(r,Y()));let o=[];return e.children.inorderTraversal((a,c)=>{const u=t?t.getImmediateChild(a):null,f=_d(s,a),_=n.operationForChild(a);_&&(o=o.concat(Nd(_,c,u,f)))}),r&&(o=o.concat(ga(r,n,s,t))),o}function Ad(n,e){const t=e.query,s=_s(n,t);return{hashFn:()=>(fx(e)||F.EMPTY_NODE).hash(),onComplete:r=>{if(r==="ok")return s?Nx(n,t._path,s):Sx(n,t._path);{const o=Sy(r,t);return Ur(n,t,null,o)}}}}function _s(n,e){const t=ei(e);return n.queryToTagMap.get(t)}function ei(n){return n._path.toString()+"$"+n._queryIdentifier}function ya(n,e){return n.tagToQueryMap.get(e)}function va(n){const e=n.indexOf("$");return P(e!==-1&&e<n.length-1,"Bad queryKey."),{queryId:n.substr(e+1),path:new ee(n.substr(0,e))}}function xa(n,e,t){const s=n.syncPointTree_.get(e);P(s,"Missing sync point for query tag that we're tracking");const r=Qr(n.pendingWriteTree_,e);return ga(s,t,r,null)}function Px(n){return n.fold((e,t,s)=>{if(t&&jt(t))return[Xr(t)];{let r=[];return t&&(r=Id(t)),Ee(s,(o,a)=>{r=r.concat(a)}),r}})}function is(n){return n._queryParams.loadsAllData()&&!n._queryParams.isDefault()?new(Ix())(n._repo,n._path):n}function jx(n,e){for(let t=0;t<e.length;++t){const s=e[t];if(!s._queryParams.loadsAllData()){const r=ei(s),o=n.queryToTagMap.get(r);n.queryToTagMap.delete(r),n.tagToQueryMap.delete(o)}}}function Ox(){return Cx++}function Dx(n,e,t){const s=e._path,r=_s(n,e),o=Ad(n,t),a=n.listenProvider_.startListening(is(e),r,o.hashFn,o.onComplete),c=n.syncPointTree_.subtree(s);if(r)P(!jt(c.value),"If we're adding a query, it shouldn't be shadowed");else{const u=c.fold((f,_,m)=>{if(!H(f)&&_&&jt(_))return[Xr(_).query];{let b=[];return _&&(b=b.concat(Id(_).map(S=>S.query))),Ee(m,(S,T)=>{b=b.concat(T)}),b}});for(let f=0;f<u.length;++f){const _=u[f];n.listenProvider_.stopListening(is(_),_s(n,_))}}return a}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ba{constructor(e){this.node_=e}getImmediateChild(e){const t=this.node_.getImmediateChild(e);return new ba(t)}node(){return this.node_}}class wa{constructor(e,t){this.syncTree_=e,this.path_=t}getImmediateChild(e){const t=ce(this.path_,e);return new wa(this.syncTree_,t)}node(){return Zr(this.syncTree_,this.path_)}}const Lx=function(n){return n=n||{},n.timestamp=n.timestamp||new Date().getTime(),n},oh=function(n,e,t){if(!n||typeof n!="object")return n;if(P(".sv"in n,"Unexpected leaf node or priority contents"),typeof n[".sv"]=="string")return Mx(n[".sv"],e,t);if(typeof n[".sv"]=="object")return Ux(n[".sv"],e);P(!1,"Unexpected server value: "+JSON.stringify(n,null,2))},Mx=function(n,e,t){switch(n){case"timestamp":return t.timestamp;default:P(!1,"Unexpected server value: "+n)}},Ux=function(n,e,t){n.hasOwnProperty("increment")||P(!1,"Unexpected server value: "+JSON.stringify(n,null,2));const s=n.increment;typeof s!="number"&&P(!1,"Unexpected increment value: "+s);const r=e.node();if(P(r!==null&&typeof r<"u","Expected ChildrenNode.EMPTY_NODE for nulls"),!r.isLeafNode())return s;const a=r.getValue();return typeof a!="number"?s:a+s},Rd=function(n,e,t,s){return Ia(e,new wa(t,n),s)},Ea=function(n,e,t){return Ia(n,new ba(e),t)};function Ia(n,e,t){const s=n.getPriority().val(),r=oh(s,e.getImmediateChild(".priority"),t);let o;if(n.isLeafNode()){const a=n,c=oh(a.getValue(),e,t);return c!==a.getValue()||r!==a.getPriority().val()?new ye(c,pe(r)):n}else{const a=n;return o=a,r!==a.getPriority().val()&&(o=o.updatePriority(new ye(r))),a.forEachChild(ae,(c,u)=>{const f=Ia(u,e.getImmediateChild(c),t);f!==u&&(o=o.updateImmediateChild(c,f))}),o}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ca{constructor(e="",t=null,s={children:{},childCount:0}){this.name=e,this.parent=t,this.node=s}}function ti(n,e){let t=e instanceof ee?e:new ee(e),s=n,r=V(t);for(;r!==null;){const o=$t(s.node.children,r)||{children:{},childCount:0};s=new Ca(r,s,o),t=re(t),r=V(t)}return s}function nn(n){return n.node.value}function Ta(n,e){n.node.value=e,bo(n)}function Pd(n){return n.node.childCount>0}function Fx(n){return nn(n)===void 0&&!Pd(n)}function ni(n,e){Ee(n.node.children,(t,s)=>{e(new Ca(t,n,s))})}function jd(n,e,t,s){t&&e(n),ni(n,r=>{jd(r,e,!0)})}function zx(n,e,t){let s=n.parent;for(;s!==null;){if(e(s))return!0;s=s.parent}return!1}function As(n){return new ee(n.parent===null?n.name:As(n.parent)+"/"+n.name)}function bo(n){n.parent!==null&&Bx(n.parent,n.name,n)}function Bx(n,e,t){const s=Fx(t),r=Je(n.node.children,e);s&&r?(delete n.node.children[e],n.node.childCount--,bo(n)):!s&&!r&&(n.node.children[e]=t.node,n.node.childCount++,bo(n))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wx=/[\[\].#$\/\u0000-\u001F\u007F]/,Vx=/[\[\].#$\u0000-\u001F\u007F]/,qi=10*1024*1024,ka=function(n){return typeof n=="string"&&n.length!==0&&!Wx.test(n)},Od=function(n){return typeof n=="string"&&n.length!==0&&!Vx.test(n)},$x=function(n){return n&&(n=n.replace(/^\/*\.info(\/|$)/,"/")),Od(n)},Dd=function(n){return n===null||typeof n=="string"||typeof n=="number"&&!Zo(n)||n&&typeof n=="object"&&Je(n,".sv")},Hx=function(n,e,t,s){Rs(Wr(n,"value"),e,t)},Rs=function(n,e,t){const s=t instanceof ee?new lv(t,n):t;if(e===void 0)throw new Error(n+"contains undefined "+Bt(s));if(typeof e=="function")throw new Error(n+"contains a function "+Bt(s)+" with contents = "+e.toString());if(Zo(e))throw new Error(n+"contains "+e.toString()+" "+Bt(s));if(typeof e=="string"&&e.length>qi/3&&Vr(e)>qi)throw new Error(n+"contains a string greater than "+qi+" utf8 bytes "+Bt(s)+" ('"+e.substring(0,50)+"...')");if(e&&typeof e=="object"){let r=!1,o=!1;if(Ee(e,(a,c)=>{if(a===".value")r=!0;else if(a!==".priority"&&a!==".sv"&&(o=!0,!ka(a)))throw new Error(n+" contains an invalid key ("+a+") "+Bt(s)+`.  Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`);cv(s,a),Rs(n,c,s),hv(s)}),r&&o)throw new Error(n+' contains ".value" child '+Bt(s)+" in addition to actual children.")}},qx=function(n,e){let t,s;for(t=0;t<e.length;t++){s=e[t];const o=ds(s);for(let a=0;a<o.length;a++)if(!(o[a]===".priority"&&a===o.length-1)){if(!ka(o[a]))throw new Error(n+"contains an invalid key ("+o[a]+") in path "+s.toString()+`. Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`)}}e.sort(av);let r=null;for(t=0;t<e.length;t++){if(s=e[t],r!==null&&Be(r,s))throw new Error(n+"contains a path "+r.toString()+" that is ancestor of another path "+s.toString());r=s}},Gx=function(n,e,t,s){const r=Wr(n,"values");if(!(e&&typeof e=="object")||Array.isArray(e))throw new Error(r+" must be an object containing the children to replace.");const o=[];Ee(e,(a,c)=>{const u=new ee(a);if(Rs(r,c,ce(t,u)),ra(u)===".priority"&&!Dd(c))throw new Error(r+"contains an invalid value for '"+u.toString()+"', which must be a valid Firebase priority (a string, finite number, server value, or null).");o.push(u)}),qx(r,o)},Ld=function(n,e,t,s){if(!Od(t))throw new Error(Wr(n,e)+'was an invalid path = "'+t+`". Paths must be non-empty strings and can't contain ".", "#", "$", "[", or "]"`)},Kx=function(n,e,t,s){t&&(t=t.replace(/^\/*\.info(\/|$)/,"/")),Ld(n,e,t)},Sa=function(n,e){if(V(e)===".info")throw new Error(n+" failed = Can't modify data under /.info/")},Yx=function(n,e){const t=e.path.toString();if(typeof e.repoInfo.host!="string"||e.repoInfo.host.length===0||!ka(e.repoInfo.namespace)&&e.repoInfo.host.split(":")[0]!=="localhost"||t.length!==0&&!$x(t))throw new Error(Wr(n,"url")+`must be a valid firebase URL and the path can't contain ".", "#", "$", "[", or "]".`)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jx{constructor(){this.eventLists_=[],this.recursionDepth_=0}}function si(n,e){let t=null;for(let s=0;s<e.length;s++){const r=e[s],o=r.getPath();t!==null&&!ia(o,t.path)&&(n.eventLists_.push(t),t=null),t===null&&(t={events:[],path:o}),t.events.push(r)}t&&n.eventLists_.push(t)}function Md(n,e,t){si(n,t),Ud(n,s=>ia(s,e))}function Fe(n,e,t){si(n,t),Ud(n,s=>Be(s,e)||Be(e,s))}function Ud(n,e){n.recursionDepth_++;let t=!0;for(let s=0;s<n.eventLists_.length;s++){const r=n.eventLists_[s];if(r){const o=r.path;e(o)?(Qx(n.eventLists_[s]),n.eventLists_[s]=null):t=!1}}t&&(n.eventLists_=[]),n.recursionDepth_--}function Qx(n){for(let e=0;e<n.events.length;e++){const t=n.events[e];if(t!==null){n.events[e]=null;const s=t.getEventRunner();ts&&we("event: "+t.toString()),Nn(s)}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xx="repo_interrupt",Zx=25;class eb{constructor(e,t,s,r){this.repoInfo_=e,this.forceRestClient_=t,this.authTokenProvider_=s,this.appCheckProvider_=r,this.dataUpdateCount=0,this.statsListener_=null,this.eventQueue_=new Jx,this.nextWriteId_=1,this.interceptServerDataCallback_=null,this.onDisconnect_=Ar(),this.transactionQueueTree_=new Ca,this.persistentConnection_=null,this.key=this.repoInfo_.toURLString()}toString(){return(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host}}function tb(n,e,t){if(n.stats_=na(n.repoInfo_),n.forceRestClient_||Py())n.server_=new Nr(n.repoInfo_,(s,r,o,a)=>{ah(n,s,r,o,a)},n.authTokenProvider_,n.appCheckProvider_),setTimeout(()=>lh(n,!0),0);else{if(typeof t<"u"&&t!==null){if(typeof t!="object")throw new Error("Only objects are supported for option databaseAuthVariableOverride");try{ge(t)}catch(s){throw new Error("Invalid authOverride provided: "+s)}}n.persistentConnection_=new ct(n.repoInfo_,e,(s,r,o,a)=>{ah(n,s,r,o,a)},s=>{lh(n,s)},s=>{sb(n,s)},n.authTokenProvider_,n.appCheckProvider_,t),n.server_=n.persistentConnection_}n.authTokenProvider_.addTokenChangeListener(s=>{n.server_.refreshAuthToken(s)}),n.appCheckProvider_.addTokenChangeListener(s=>{n.server_.refreshAppCheckToken(s.token)}),n.statsReporter_=My(n.repoInfo_,()=>new Lv(n.stats_,n.server_)),n.infoData_=new Rv,n.infoSyncTree_=new ih({startListening:(s,r,o,a)=>{let c=[];const u=n.infoData_.getNode(s._path);return u.isEmpty()||(c=Ns(n.infoSyncTree_,s._path,u),setTimeout(()=>{a("ok")},0)),c},stopListening:()=>{}}),Na(n,"connected",!1),n.serverSyncTree_=new ih({startListening:(s,r,o,a)=>(n.server_.listen(s,o,r,(c,u)=>{const f=a(c,u);Fe(n.eventQueue_,s._path,f)}),[]),stopListening:(s,r)=>{n.server_.unlisten(s,r)}})}function nb(n){const t=n.infoData_.getNode(new ee(".info/serverTimeOffset")).val()||0;return new Date().getTime()+t}function Ps(n){return Lx({timestamp:nb(n)})}function ah(n,e,t,s,r){n.dataUpdateCount++;const o=new ee(e);t=n.interceptServerDataCallback_?n.interceptServerDataCallback_(e,t):t;let a=[];if(r)if(s){const u=_r(t,f=>pe(f));a=Ax(n.serverSyncTree_,o,u,r)}else{const u=pe(t);a=kd(n.serverSyncTree_,o,u,r)}else if(s){const u=_r(t,f=>pe(f));a=kx(n.serverSyncTree_,o,u)}else{const u=pe(t);a=Ns(n.serverSyncTree_,o,u)}let c=o;a.length>0&&(c=wn(n,o)),Fe(n.eventQueue_,c,a)}function lh(n,e){Na(n,"connected",e),e===!1&&ab(n)}function sb(n,e){Ee(e,(t,s)=>{Na(n,t,s)})}function Na(n,e,t){const s=new ee("/.info/"+e),r=pe(t);n.infoData_.updateSnapshot(s,r);const o=Ns(n.infoSyncTree_,s,r);Fe(n.eventQueue_,s,o)}function ri(n){return n.nextWriteId_++}function rb(n,e,t){const s=Rx(n.serverSyncTree_,e);return s!=null?Promise.resolve(s):n.server_.get(e).then(r=>{const o=pe(r).withIndex(e._queryParams.getIndex());xo(n.serverSyncTree_,e,t,!0);let a;if(e._queryParams.loadsAllData())a=Ns(n.serverSyncTree_,e._path,o);else{const c=_s(n.serverSyncTree_,e);a=kd(n.serverSyncTree_,e._path,o,c)}return Fe(n.eventQueue_,e._path,a),Ur(n.serverSyncTree_,e,t,null,!0),o},r=>(Rn(n,"get for query "+ge(e)+" failed: "+r),Promise.reject(new Error(r))))}function ib(n,e,t,s,r){Rn(n,"set",{path:e.toString(),value:t,priority:s});const o=Ps(n),a=pe(t,s),c=Zr(n.serverSyncTree_,e),u=Ea(a,c,o),f=ri(n),_=_a(n.serverSyncTree_,e,u,f,!0);si(n.eventQueue_,_),n.server_.put(e.toString(),a.val(!0),(b,S)=>{const T=b==="ok";T||je("set at "+e+" failed: "+b);const R=It(n.serverSyncTree_,f,!T);Fe(n.eventQueue_,e,R),Eo(n,r,b,S)});const m=Ra(n,e);wn(n,m),Fe(n.eventQueue_,m,[])}function ob(n,e,t,s){Rn(n,"update",{path:e.toString(),value:t});let r=!0;const o=Ps(n),a={};if(Ee(t,(c,u)=>{r=!1,a[c]=Rd(ce(e,c),pe(u),n.serverSyncTree_,o)}),r)we("update() called with empty data.  Don't do anything."),Eo(n,s,"ok",void 0);else{const c=ri(n),u=Tx(n.serverSyncTree_,e,a,c);si(n.eventQueue_,u),n.server_.merge(e.toString(),t,(f,_)=>{const m=f==="ok";m||je("update at "+e+" failed: "+f);const b=It(n.serverSyncTree_,c,!m),S=b.length>0?wn(n,e):e;Fe(n.eventQueue_,S,b),Eo(n,s,f,_)}),Ee(t,f=>{const _=Ra(n,ce(e,f));wn(n,_)}),Fe(n.eventQueue_,e,[])}}function ab(n){Rn(n,"onDisconnectEvents");const e=Ps(n),t=Ar();po(n.onDisconnect_,Y(),(r,o)=>{const a=Rd(r,o,n.serverSyncTree_,e);dd(t,r,a)});let s=[];po(t,Y(),(r,o)=>{s=s.concat(Ns(n.serverSyncTree_,r,o));const a=Ra(n,r);wn(n,a)}),n.onDisconnect_=Ar(),Fe(n.eventQueue_,Y(),s)}function lb(n,e,t){let s;V(e._path)===".info"?s=xo(n.infoSyncTree_,e,t):s=xo(n.serverSyncTree_,e,t),Md(n.eventQueue_,e._path,s)}function wo(n,e,t){let s;V(e._path)===".info"?s=Ur(n.infoSyncTree_,e,t):s=Ur(n.serverSyncTree_,e,t),Md(n.eventQueue_,e._path,s)}function cb(n){n.persistentConnection_&&n.persistentConnection_.interrupt(Xx)}function Rn(n,...e){let t="";n.persistentConnection_&&(t=n.persistentConnection_.id+":"),we(t,...e)}function Eo(n,e,t,s){e&&Nn(()=>{if(t==="ok")e(null);else{const r=(t||"error").toUpperCase();let o=r;s&&(o+=": "+s);const a=new Error(o);a.code=r,e(a)}})}function hb(n,e,t,s,r,o){Rn(n,"transaction on "+e);const a={path:e,update:t,onComplete:s,status:null,order:Lu(),applyLocally:o,retryCount:0,unwatcher:r,abortReason:null,currentWriteId:null,currentInputSnapshot:null,currentOutputSnapshotRaw:null,currentOutputSnapshotResolved:null},c=Aa(n,e,void 0);a.currentInputSnapshot=c;const u=a.update(c.val());if(u===void 0)a.unwatcher(),a.currentOutputSnapshotRaw=null,a.currentOutputSnapshotResolved=null,a.onComplete&&a.onComplete(null,!1,a.currentInputSnapshot);else{Rs("transaction failed: Data returned ",u,a.path),a.status=0;const f=ti(n.transactionQueueTree_,e),_=nn(f)||[];_.push(a),Ta(f,_);let m;typeof u=="object"&&u!==null&&Je(u,".priority")?(m=$t(u,".priority"),P(Dd(m),"Invalid priority returned by transaction. Priority must be a valid string, finite number, server value, or null.")):m=(Zr(n.serverSyncTree_,e)||F.EMPTY_NODE).getPriority().val();const b=Ps(n),S=pe(u,m),T=Ea(S,c,b);a.currentOutputSnapshotRaw=S,a.currentOutputSnapshotResolved=T,a.currentWriteId=ri(n);const R=_a(n.serverSyncTree_,e,T,a.currentWriteId,a.applyLocally);Fe(n.eventQueue_,e,R),ii(n,n.transactionQueueTree_)}}function Aa(n,e,t){return Zr(n.serverSyncTree_,e,t)||F.EMPTY_NODE}function ii(n,e=n.transactionQueueTree_){if(e||oi(n,e),nn(e)){const t=zd(n,e);P(t.length>0,"Sending zero length transaction queue"),t.every(r=>r.status===0)&&ub(n,As(e),t)}else Pd(e)&&ni(e,t=>{ii(n,t)})}function ub(n,e,t){const s=t.map(f=>f.currentWriteId),r=Aa(n,e,s);let o=r;const a=r.hash();for(let f=0;f<t.length;f++){const _=t[f];P(_.status===0,"tryToSendTransactionQueue_: items in queue should all be run."),_.status=1,_.retryCount++;const m=Pe(e,_.path);o=o.updateChild(m,_.currentOutputSnapshotRaw)}const c=o.val(!0),u=e;n.server_.put(u.toString(),c,f=>{Rn(n,"transaction put response",{path:u.toString(),status:f});let _=[];if(f==="ok"){const m=[];for(let b=0;b<t.length;b++)t[b].status=2,_=_.concat(It(n.serverSyncTree_,t[b].currentWriteId)),t[b].onComplete&&m.push(()=>t[b].onComplete(null,!0,t[b].currentOutputSnapshotResolved)),t[b].unwatcher();oi(n,ti(n.transactionQueueTree_,e)),ii(n,n.transactionQueueTree_),Fe(n.eventQueue_,e,_);for(let b=0;b<m.length;b++)Nn(m[b])}else{if(f==="datastale")for(let m=0;m<t.length;m++)t[m].status===3?t[m].status=4:t[m].status=0;else{je("transaction at "+u.toString()+" failed: "+f);for(let m=0;m<t.length;m++)t[m].status=4,t[m].abortReason=f}wn(n,e)}},a)}function wn(n,e){const t=Fd(n,e),s=As(t),r=zd(n,t);return db(n,r,s),s}function db(n,e,t){if(e.length===0)return;const s=[];let r=[];const a=e.filter(c=>c.status===0).map(c=>c.currentWriteId);for(let c=0;c<e.length;c++){const u=e[c],f=Pe(t,u.path);let _=!1,m;if(P(f!==null,"rerunTransactionsUnderNode_: relativePath should not be null."),u.status===4)_=!0,m=u.abortReason,r=r.concat(It(n.serverSyncTree_,u.currentWriteId,!0));else if(u.status===0)if(u.retryCount>=Zx)_=!0,m="maxretry",r=r.concat(It(n.serverSyncTree_,u.currentWriteId,!0));else{const b=Aa(n,u.path,a);u.currentInputSnapshot=b;const S=e[c].update(b.val());if(S!==void 0){Rs("transaction failed: Data returned ",S,u.path);let T=pe(S);typeof S=="object"&&S!=null&&Je(S,".priority")||(T=T.updatePriority(b.getPriority()));const A=u.currentWriteId,U=Ps(n),z=Ea(T,b,U);u.currentOutputSnapshotRaw=T,u.currentOutputSnapshotResolved=z,u.currentWriteId=ri(n),a.splice(a.indexOf(A),1),r=r.concat(_a(n.serverSyncTree_,u.path,z,u.currentWriteId,u.applyLocally)),r=r.concat(It(n.serverSyncTree_,A,!0))}else _=!0,m="nodata",r=r.concat(It(n.serverSyncTree_,u.currentWriteId,!0))}Fe(n.eventQueue_,t,r),r=[],_&&(e[c].status=2,function(b){setTimeout(b,Math.floor(0))}(e[c].unwatcher),e[c].onComplete&&(m==="nodata"?s.push(()=>e[c].onComplete(null,!1,e[c].currentInputSnapshot)):s.push(()=>e[c].onComplete(new Error(m),!1,null))))}oi(n,n.transactionQueueTree_);for(let c=0;c<s.length;c++)Nn(s[c]);ii(n,n.transactionQueueTree_)}function Fd(n,e){let t,s=n.transactionQueueTree_;for(t=V(e);t!==null&&nn(s)===void 0;)s=ti(s,t),e=re(e),t=V(e);return s}function zd(n,e){const t=[];return Bd(n,e,t),t.sort((s,r)=>s.order-r.order),t}function Bd(n,e,t){const s=nn(e);if(s)for(let r=0;r<s.length;r++)t.push(s[r]);ni(e,r=>{Bd(n,r,t)})}function oi(n,e){const t=nn(e);if(t){let s=0;for(let r=0;r<t.length;r++)t[r].status!==2&&(t[s]=t[r],s++);t.length=s,Ta(e,t.length>0?t:void 0)}ni(e,s=>{oi(n,s)})}function Ra(n,e){const t=As(Fd(n,e)),s=ti(n.transactionQueueTree_,e);return zx(s,r=>{Gi(n,r)}),Gi(n,s),jd(s,r=>{Gi(n,r)}),t}function Gi(n,e){const t=nn(e);if(t){const s=[];let r=[],o=-1;for(let a=0;a<t.length;a++)t[a].status===3||(t[a].status===1?(P(o===a-1,"All SENT items should be at beginning of queue."),o=a,t[a].status=3,t[a].abortReason="set"):(P(t[a].status===0,"Unexpected transaction status in abort"),t[a].unwatcher(),r=r.concat(It(n.serverSyncTree_,t[a].currentWriteId,!0)),t[a].onComplete&&s.push(t[a].onComplete.bind(null,new Error("set"),!1,null))));o===-1?Ta(e,void 0):t.length=o+1,Fe(n.eventQueue_,As(e),r);for(let a=0;a<s.length;a++)Nn(s[a])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fb(n){let e="";const t=n.split("/");for(let s=0;s<t.length;s++)if(t[s].length>0){let r=t[s];try{r=decodeURIComponent(r.replace(/\+/g," "))}catch{}e+="/"+r}return e}function pb(n){const e={};n.charAt(0)==="?"&&(n=n.substring(1));for(const t of n.split("&")){if(t.length===0)continue;const s=t.split("=");s.length===2?e[decodeURIComponent(s[0])]=decodeURIComponent(s[1]):je(`Invalid query segment '${t}' in query '${n}'`)}return e}const ch=function(n,e){const t=mb(n),s=t.namespace;t.domain==="firebase.com"&&dt(t.host+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead"),(!s||s==="undefined")&&t.domain!=="localhost"&&dt("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com"),t.secure||Ey();const r=t.scheme==="ws"||t.scheme==="wss";return{repoInfo:new Yu(t.host,t.secure,s,r,e,"",s!==t.subdomain),path:new ee(t.pathString)}},mb=function(n){let e="",t="",s="",r="",o="",a=!0,c="https",u=443;if(typeof n=="string"){let f=n.indexOf("//");f>=0&&(c=n.substring(0,f-1),n=n.substring(f+2));let _=n.indexOf("/");_===-1&&(_=n.length);let m=n.indexOf("?");m===-1&&(m=n.length),e=n.substring(0,Math.min(_,m)),_<m&&(r=fb(n.substring(_,m)));const b=pb(n.substring(Math.min(n.length,m)));f=e.indexOf(":"),f>=0?(a=c==="https"||c==="wss",u=parseInt(e.substring(f+1),10)):f=e.length;const S=e.slice(0,f);if(S.toLowerCase()==="localhost")t="localhost";else if(S.split(".").length<=2)t=S;else{const T=e.indexOf(".");s=e.substring(0,T).toLowerCase(),t=e.substring(T+1),o=s}"ns"in b&&(o=b.ns)}return{host:e,port:u,domain:t,subdomain:s,secure:a,scheme:c,pathString:r,namespace:o}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gb{constructor(e,t,s,r){this.eventType=e,this.eventRegistration=t,this.snapshot=s,this.prevName=r}getPath(){const e=this.snapshot.ref;return this.eventType==="value"?e._path:e.parent._path}getEventType(){return this.eventType}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.getPath().toString()+":"+this.eventType+":"+ge(this.snapshot.exportVal())}}class _b{constructor(e,t,s){this.eventRegistration=e,this.error=t,this.path=s}getPath(){return this.path}getEventType(){return"cancel"}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.path.toString()+":cancel"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pa{constructor(e,t){this.snapshotCallback=e,this.cancelCallback=t}onValue(e,t){this.snapshotCallback.call(null,e,t)}onCancel(e){return P(this.hasCancelCallback,"Raising a cancel event on a listener with no cancel callback"),this.cancelCallback.call(null,e)}get hasCancelCallback(){return!!this.cancelCallback}matches(e){return this.snapshotCallback===e.snapshotCallback||this.snapshotCallback.userCallback!==void 0&&this.snapshotCallback.userCallback===e.snapshotCallback.userCallback&&this.snapshotCallback.context===e.snapshotCallback.context}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ja{constructor(e,t,s,r){this._repo=e,this._path=t,this._queryParams=s,this._orderByCalled=r}get key(){return H(this._path)?null:ra(this._path)}get ref(){return new et(this._repo,this._path)}get _queryIdentifier(){const e=Yc(this._queryParams),t=ea(e);return t==="{}"?"default":t}get _queryObject(){return Yc(this._queryParams)}isEqual(e){if(e=xe(e),!(e instanceof ja))return!1;const t=this._repo===e._repo,s=ia(this._path,e._path),r=this._queryIdentifier===e._queryIdentifier;return t&&s&&r}toJSON(){return this.toString()}toString(){return this._repo.toString()+ov(this._path)}}class et extends ja{constructor(e,t){super(e,t,new ca,!1)}get parent(){const e=rd(this._path);return e===null?null:new et(this._repo,e)}get root(){let e=this;for(;e.parent!==null;)e=e.parent;return e}}class En{constructor(e,t,s){this._node=e,this.ref=t,this._index=s}get priority(){return this._node.getPriority().val()}get key(){return this.ref.key}get size(){return this._node.numChildren()}child(e){const t=new ee(e),s=Io(this.ref,e);return new En(this._node.getChild(t),s,ae)}exists(){return!this._node.isEmpty()}exportVal(){return this._node.val(!0)}forEach(e){return this._node.isLeafNode()?!1:!!this._node.forEachChild(this._index,(s,r)=>e(new En(r,Io(this.ref,s),ae)))}hasChild(e){const t=new ee(e);return!this._node.getChild(t).isEmpty()}hasChildren(){return this._node.isLeafNode()?!1:!this._node.isEmpty()}toJSON(){return this.exportVal()}val(){return this._node.val()}}function Fw(n,e){return n=xe(n),n._checkNotDeleted("ref"),e!==void 0?Io(n._root,e):n._root}function Io(n,e){return n=xe(n),V(n._path)===null?Kx("child","path",e):Ld("child","path",e),new et(n._repo,ce(n._path,e))}function zw(n){return Sa("remove",n._path),yb(n,null)}function yb(n,e){n=xe(n),Sa("set",n._path),Hx("set",e,n._path);const t=new Tn;return ib(n._repo,n._path,e,null,t.wrapCallback(()=>{})),t.promise}function Bw(n,e){Gx("update",e,n._path);const t=new Tn;return ob(n._repo,n._path,e,t.wrapCallback(()=>{})),t.promise}function Ww(n){n=xe(n);const e=new Pa(()=>{}),t=new js(e);return rb(n._repo,n,t).then(s=>new En(s,new et(n._repo,n._path),n._queryParams.getIndex()))}class js{constructor(e){this.callbackContext=e}respondsTo(e){return e==="value"}createEvent(e,t){const s=t._queryParams.getIndex();return new gb("value",this,new En(e.snapshotNode,new et(t._repo,t._path),s))}getEventRunner(e){return e.getEventType()==="cancel"?()=>this.callbackContext.onCancel(e.error):()=>this.callbackContext.onValue(e.snapshot,null)}createCancelEvent(e,t){return this.callbackContext.hasCancelCallback?new _b(this,e,t):null}matches(e){return e instanceof js?!e.callbackContext||!this.callbackContext?!0:e.callbackContext.matches(this.callbackContext):!1}hasAnyCallback(){return this.callbackContext!==null}}function vb(n,e,t,s,r){let o;if(typeof s=="object"&&(o=void 0,r=s),typeof s=="function"&&(o=s),r&&r.onlyOnce){const u=t,f=(_,m)=>{wo(n._repo,n,c),u(_,m)};f.userCallback=t.userCallback,f.context=t.context,t=f}const a=new Pa(t,o||void 0),c=new js(a);return lb(n._repo,n,c),()=>wo(n._repo,n,c)}function xb(n,e,t,s){return vb(n,"value",e,t,s)}function Vw(n,e,t){let s=null;const r=t?new Pa(t):null;s=new js(r),wo(n._repo,n,s)}yx(et);Ex(et);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bb="FIREBASE_DATABASE_EMULATOR_HOST",Co={};let wb=!1;function Eb(n,e,t,s){n.repoInfo_=new Yu(`${e}:${t}`,!1,n.repoInfo_.namespace,n.repoInfo_.webSocketOnly,n.repoInfo_.nodeAdmin,n.repoInfo_.persistenceKey,n.repoInfo_.includeNamespaceInQueryParams,!0),s&&(n.authTokenProvider_=s)}function Ib(n,e,t,s,r){let o=s||n.options.databaseURL;o===void 0&&(n.options.projectId||dt("Can't determine Firebase Database URL. Be sure to include  a Project ID when calling firebase.initializeApp()."),we("Using default host for project ",n.options.projectId),o=`${n.options.projectId}-default-rtdb.firebaseio.com`);let a=ch(o,r),c=a.repoInfo,u;typeof process<"u"&&Rc&&(u=Rc[bb]),u?(o=`http://${u}?ns=${c.namespace}`,a=ch(o,r),c=a.repoInfo):a.repoInfo.secure;const f=new Oy(n.name,n.options,e);Yx("Invalid Firebase Database URL",a),H(a.path)||dt("Database URL must point to the root of a Firebase Database (not including a child path).");const _=Tb(c,n,f,new jy(n.name,t));return new kb(_,n)}function Cb(n,e){const t=Co[e];(!t||t[n.key]!==n)&&dt(`Database ${e}(${n.repoInfo_}) has already been deleted.`),cb(n),delete t[n.key]}function Tb(n,e,t,s){let r=Co[e.name];r||(r={},Co[e.name]=r);let o=r[n.toURLString()];return o&&dt("Database initialized multiple times. Please make sure the format of the database URL matches with each database() call."),o=new eb(n,wb,t,s),r[n.toURLString()]=o,o}class kb{constructor(e,t){this._repoInternal=e,this.app=t,this.type="database",this._instanceStarted=!1}get _repo(){return this._instanceStarted||(tb(this._repoInternal,this.app.options.appId,this.app.options.databaseAuthVariableOverride),this._instanceStarted=!0),this._repoInternal}get _root(){return this._rootInternal||(this._rootInternal=new et(this._repo,Y())),this._rootInternal}_delete(){return this._rootInternal!==null&&(Cb(this._repo,this.app.name),this._repoInternal=null,this._rootInternal=null),Promise.resolve()}_checkNotDeleted(e){this._rootInternal===null&&dt("Cannot call "+e+" on a deleted database.")}}function Sb(n=Uo(),e){const t=Hr(n,"database").getImmediate({identifier:e});if(!t._instanceStarted){const s=Uh("database");s&&Nb(t,...s)}return t}function Nb(n,e,t,s={}){n=xe(n),n._checkNotDeleted("useEmulator"),n._instanceStarted&&dt("Cannot call useEmulator() after instance has already been initialized.");const r=n._repoInternal;let o;if(r.repoInfo_.nodeAdmin)s.mockUserToken&&dt('mockUserToken is not supported by the Admin SDK. For client access with mock users, please use the "firebase" package instead of "firebase-admin".'),o=new cr(cr.OWNER);else if(s.mockUserToken){const a=typeof s.mockUserToken=="string"?s.mockUserToken:Bh(s.mockUserToken,n.app.options.projectId);o=new cr(a)}Eb(r,e,t,o)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ab(n){yy(Zt),Ht(new At("database",(e,{instanceIdentifier:t})=>{const s=e.getProvider("app").getImmediate(),r=e.getProvider("auth-internal"),o=e.getProvider("app-check-internal");return Ib(s,r,o,t)},"PUBLIC").setMultipleInstances(!0)),Xe(Pc,jc,n),Xe(Pc,jc,"esm2017")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rb={".sv":"timestamp"};function $w(){return Rb}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pb{constructor(e,t){this.committed=e,this.snapshot=t}toJSON(){return{committed:this.committed,snapshot:this.snapshot.toJSON()}}}function Hw(n,e,t){var s;if(n=xe(n),Sa("Reference.transaction",n._path),n.key===".length"||n.key===".keys")throw"Reference.transaction failed: "+n.key+" is a read-only object.";const r=(s=void 0)!==null&&s!==void 0?s:!0,o=new Tn,a=(u,f,_)=>{let m=null;u?o.reject(u):(m=new En(_,new et(n._repo,n._path),ae),o.resolve(new Pb(f,m)))},c=xb(n,()=>{});return hb(n._repo,n._path,e,a,c,r),o.promise}ct.prototype.simpleListen=function(n,e){this.sendRequest("q",{p:n},e)};ct.prototype.echo=function(n,e){this.sendRequest("echo",{d:n},e)};Ab();const jb={apiKey:"AIzaSyBXXaWWoFqn6MpH6IWSm6CGaqUJzAmzbzA",authDomain:"dopamine-quiz.firebaseapp.com",projectId:"dopamine-quiz",storageBucket:"dopamine-quiz.firebasestorage.app",messagingSenderId:"822531459966",appId:"1:822531459966:web:8e7d2385090e997eb1c12f",measurementId:"G-6TWRMVGB18",databaseURL:"https://dopamine-quiz-default-rtdb.firebaseio.com"},Oa=qh(jb),Qe=Z0(Oa),Ob=new st;_y(Oa);const qw=Sb(Oa),Db="https://mongodb-hb6b.onrender.com/api",Lb={user:{college:"Dhaka College",hscBatch:"2024",department:"Science",target:"Medical",points:1250},points:1250,totalExams:15,totalCorrect:120,totalWrong:30,subjectBreakdown:[{subject:"Physics",accuracy:85,total:50,correct:42,wrong:8,skipped:0,chapters:{Vector:{total:20,correct:18,wrong:2,skipped:0},Dynamics:{total:15,correct:12,wrong:3,skipped:0},"Work & Energy":{total:15,correct:12,wrong:3,skipped:0}}},{subject:"Biology",accuracy:75,total:40,correct:30,wrong:8,skipped:2,chapters:{"Cell Structure":{total:20,correct:15,wrong:4,skipped:1},Genetics:{total:20,correct:15,wrong:4,skipped:1}}},{subject:"Chemistry",accuracy:60,total:30,correct:18,wrong:10,skipped:2,chapters:{"Organic Chemistry":{total:15,correct:8,wrong:6,skipped:1},"Periodic Table":{total:15,correct:10,wrong:4,skipped:1}}}],strongestTopics:[{topic:"Vector",accuracy:95}],weakestTopics:[{topic:"Organic Chemistry",accuracy:40}]},Mb=[{id:"med-final-24",title:"মেডিকেল ফাইনাল মডেল টেস্ট",subtitle:"শেষ মুহূর্তের পূর্ণাঙ্গ প্রস্তুতি (১০০টি মডেল টেস্ট)",price:500,originalPrice:1500,totalExams:100,features:["সম্পূর্ণ সিলেবাসের ওপর পরীক্ষা","নেগেটিভ মার্কিং প্র্যাকটিস","মেডিকেল স্ট্যান্ডার্ড প্রশ্ন","সলভ শিট ও ব্যাখ্যা"],theme:"emerald",tag:"Best Seller"},{id:"eng-qbank-solve",title:"ইঞ্জিনিয়ারিং প্রশ্ন ব্যাংক সলভ",subtitle:"বুয়েট, চুয়েট, কুয়েট, রুয়েট বিগত ২০ বছরের প্রশ্ন",price:750,originalPrice:2e3,totalExams:50,features:["অধ্যায়ভিত্তিক এক্সাম","কঠিন প্রশ্নের সহজ সমাধান","শর্টকাট টেকনিক","আনলিমিটেড এটেম্পট"],theme:"blue",tag:"Premium"},{id:"varsity-ka-boost",title:"ভার্সিটি ক-ইউনিট বুস্টার",subtitle:"ঢাবি, জাবি, রাবি ও গুচ্ছ প্রস্তুতির সেরা প্যাক",price:450,originalPrice:1200,totalExams:60,features:["টাইম ম্যানেজমেন্ট প্র্যাকটিস","বিষয়ভিত্তিক মডেল টেস্ট","পূর্ণাঙ্গ মডেল টেস্ট","লাইভ লিডারবোর্ড"],theme:"orange",tag:"Popular"}],hh=[{id:"1",title:"Welcome",message:"Welcome to Dhrubok! (Offline Mode)",type:"INFO",date:Date.now()},{id:"2",title:"Update",message:"New Physics questions added.",type:"SUCCESS",date:Date.now()-864e5}],Ub=[{uid:"1",displayName:"Tahmid Khan",photoURL:"https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",points:5200},{uid:"2",displayName:"Sarah Ahmed",photoURL:"https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",points:4800},{uid:"3",displayName:"Rafiqul Islam",photoURL:"https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",points:4500},{uid:"4",displayName:"You",photoURL:"",points:1250}],G=async(n,e={},t=null)=>{try{const s=await fetch(`${Db}${n}`,e);if(!s.ok){let o=`HTTP Error ${s.status}`;try{const a=await s.json();a&&a.error&&(o=a.error)}catch{}throw new Error(o)}const r=await s.text();try{return JSON.parse(r)}catch{throw new Error("Invalid JSON response (Server might be sending HTML)")}}catch(s){if(t!=null)return console.info(`[API Fallback] ${n}: ${s.message}`),t;throw s}},Gw=async(n,e,t=1)=>G("/quests/update",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:n,actionType:e,value:t})},{success:!0}),Kw=async(n,e,t="DAILY")=>G("/quests/claim",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:n,questId:e,category:t})},{success:!1}),To=async(n,e)=>G("/users/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({uid:n.uid,email:n.email,displayName:n.displayName,photoURL:n.photoURL,phoneNumber:(e==null?void 0:e.phoneNumber)||n.phoneNumber||"",college:n.college,hscBatch:n.hscBatch,department:n.department,target:n.target,...e})},{success:!0}),Fb=async n=>G(`/users/${n}/enrollments`,{},[]),Yw=async(n,e)=>G(`/users/${n}/exam-results`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)},{success:!0}),Jw=async(n,e)=>G(`/users/${n}/exam-results/${e}`,{},null),zb=async n=>G(`/users/${n}/stats`,{},Lb),Qw=async n=>G("/users/activity",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:n})},{success:!0,streak:1,activityLog:[],streakUpdated:!1}),Xw=async n=>G(`/users/${n}/mistakes`,{},[]),Zw=async(n,e)=>G(`/users/${n}/mistakes/${e}`,{method:"DELETE"},{success:!0}),eE=async(n,e)=>G(`/users/${n}/mistakes/clear`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({questionIds:e})},{success:!0}),tE=async()=>G("/leaderboard",{},Ub),nE=async(n,e,t)=>G(`/users/${n}/saved-questions`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({questionId:e,folder:t})},{status:"SAVED"}),sE=async(n,e,t)=>G(`/users/${n}/saved-questions/${e}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({folder:t})},{success:!0}),rE=async(n,e)=>G(`/users/${n}/saved-questions/by-q/${e}`,{method:"DELETE"},{success:!0}),iE=async n=>G(`/users/${n}/saved-questions`,{},[]),oE=async(n,e)=>G(`/users/${n}/saved-questions/${e}`,{method:"DELETE"},{success:!0}),Bb=async n=>G("/payments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)},{success:!0}),Wb=async()=>{const n=await G("/admin/payments",{},[]);return Array.isArray(n)?n.map(e=>({...e,id:e.id||e._id})):[]},Vb=async()=>G("/admin/stats",{},{totalRevenue:5e3,totalEnrollments:120,pendingRequests:5,activeUsers:150,totalQuestions:500,totalExams:50}),uh=async(n,e)=>G(`/admin/payments/${n}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:e})},{success:!0}),$b=async n=>G(`/admin/payments/${n}`,{method:"DELETE"},{success:!0}),aE=async(n,e)=>G("/admin/questions/bulk",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({questions:n,metadata:e})},{success:!0}),lE=async()=>G("/question-papers",{},[]),cE=async(n,e,t,s,r)=>{let o=`/admin/questions?page=${n}&limit=${e}`;return t&&t!=="ALL"&&(o+=`&subject=${encodeURIComponent(t)}`),s&&s!=="ALL"&&(o+=`&chapter=${encodeURIComponent(s)}`),r&&(o+=`&search=${encodeURIComponent(r)}`),G(o,{},{questions:[],total:0})},hE=async(n,e)=>G(`/admin/questions/${n}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)},{success:!0}),uE=async n=>{if(n==="gst_a_23_24")try{return await(await fetch("/data/gst_a_23_24_questions.json")).json()}catch{return G(`/quiz/past-paper/${encodeURIComponent(n)}`,{},[])}return G(`/quiz/past-paper/${encodeURIComponent(n)}`,{},[])},dE=async n=>G(`/admin/questions/${n}`,{method:"DELETE"},{success:!0}),fE=async n=>G("/quiz/generate-from-db",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)},[]),pE=async()=>G("/quiz/syllabus-stats",{},{}),Hb=async n=>G("/admin/notifications",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)},{success:!0}),qb=async()=>{const n=await G("/notifications",{},hh);return Array.isArray(n)?n.map(e=>({...e,id:e.id||e._id})):hh},mE=async()=>G("/exam-packs",{},Mb),Wd=k.createContext(void 0),Pn=()=>{const n=k.useContext(Wd);if(!n)throw new Error("useAuth must be used within an AuthProvider");return n},Gb=({children:n})=>{const[e,t]=k.useState(null),[s,r]=k.useState(!0),[o,a]=k.useState(!0),[c,u]=k.useState(""),[f,_]=k.useState([]),[m,b]=k.useState(null),S=_e.useMemo(()=>!e||!m?!1:!!(m.target&&m.college&&m.hscBatch),[e,m]);k.useEffect(()=>{F_(Qe,xu).catch(L=>{console.error("Failed to set auth persistence:",L)});const D=W_(Qe,async L=>{if(t(L),L){a(!0),L.photoURL?u(L.photoURL):u("");try{await To(L);const[J,v]=await Promise.all([Fb(L.uid),zb(L.uid)]);_(J),v&&v.user&&b({college:v.user.college,hscBatch:v.user.hscBatch,department:v.user.department,target:v.user.target,phoneNumber:v.user.phoneNumber,version:v.user.version,dailyStudyGoal:v.user.dailyStudyGoal})}catch(J){console.error("Error loading user data",J)}finally{a(!1),r(!1)}}else _([]),b(null),a(!1),r(!1)});return()=>{D()}},[]);const M={currentUser:e,loading:s,profileLoading:o,logout:()=>V_(Qe),userAvatar:c,enrolledCourses:f,extendedProfile:m,isProfileComplete:S,updateUserProfile:async(D,L,J)=>{Qe.currentUser&&(await _u(Qe.currentUser,{displayName:D,photoURL:L}),t({...Qe.currentUser,displayName:D,photoURL:L}),u(L),J&&b(v=>({...v,...J})),await To({...Qe.currentUser,displayName:D,photoURL:L},J))},enrollInCourse:async D=>{_(L=>[...L,D])},isEnrolled:D=>f.some(L=>L.id===D),loginWithGoogle:async()=>{try{return(await l0(Qe,Ob)).user}catch(D){throw console.error("Google Login Error",D),D}}};return l.jsx(Wd.Provider,{value:M,children:!s&&n})},Kb={bn:{nav_home:"হোম",nav_challenges:"চ্যালেঞ্জ",nav_courses:"কোর্সসমূহ",nav_qbank:"প্রশ্ন ব্যাংক",nav_exams:"মডেল টেস্ট",nav_quiz:"কুইজ জোন",nav_battle:"কুইজ ব্যাটল",nav_leaderboard:"লিডারবোর্ড",nav_tracker:"স্টাডি প্ল্যানার",nav_admission:"ভর্তি তথ্য",nav_admin:"অ্যাডমিন প্যানেল",nav_logout:"লগআউট",nav_profile_view:"প্রোফাইল দেখুন",nav_prep:"এডমিশন প্রস্তুতি",auth_welcome:"স্বাগতম!",auth_create_account:"একাউন্ট তৈরি করুন",auth_login_subtitle:"আপনার একাউন্টে লগইন করুন",auth_register_subtitle:"বিনামূল্যে রেজিস্ট্রেশন করুন",auth_name:"আপনার নাম",auth_phone:"মোবাইল নাম্বার",auth_email:"ইমেইল এড্রেস",auth_password:"পাসওয়ার্ড",auth_login_btn:"লগইন করুন",auth_register_btn:"রেজিস্ট্রেশন করুন",auth_google:"Google দিয়ে চালিয়ে যান",auth_or:"অথবা",auth_have_account:"ইতিমধ্যে একাউন্ট আছে?",auth_no_account:"একাউন্ট নেই?",auth_back:"ফিরে যান",greeting_morning:"শুভ সকাল",greeting_afternoon:"শুভ দুপুর",greeting_evening:"শুভ সন্ধ্যা",greeting_sub:"আজকের প্রস্তুতি শুরু হোক একটি পরীক্ষা দিয়ে!",stat_rank:"র‍্যাংক",stat_points:"পয়েন্ট",hero_tag:"ডেইলি চ্যালেঞ্জ",hero_title_1:"নিজেকে যাচাই করো",hero_title_2:"লাইভ কুইজ",hero_desc:"প্রতিদিন নতুন নতুন টপিকের উপর মডেল টেস্ট দাও এবং তোমার অবস্থান যাচাই করো। ভুলগুলো থেকে শেখো।",hero_btn:"পরীক্ষা শুরু করুন",live_badge:"Live",join_now:"Join Now",goal_title:"ডেইলি গোল",goal_desc:"আজকের ৫টি চ্যালেঞ্জ সম্পন্ন করে জিতে নাও বোনাস পয়েন্ট!",goal_completed:"সম্পন্ন",view_all:"সব দেখুন",feat_qbank_title:"প্রশ্ন ব্যাংক",feat_qbank_desc:"বিগত বছরের প্রশ্ন সমাধান করো।",feat_qbank_btn:"অনুশীলন করুন",feat_exam_title:"মডেল টেস্ট",feat_exam_desc:"শেষ মুহূর্তের প্রস্তুতির জন্য পূর্ণাঙ্গ মডেল টেস্ট।",feat_exam_btn:"প্যাক কিনুন",feat_battle_tag:"MULTIPLAYER",feat_battle_title:"কুইজ ব্যাটল",feat_battle_desc:"বন্ধুদের সাথে লাইভ যুদ্ধ!",feat_battle_btn:"চ্যালেঞ্জ জানাও",feat_leaderboard_title:"লিডারবোর্ড",feat_leaderboard_desc:"র‍্যাংক চেক করো",feat_tracker_title:"প্রোগ্রেস",feat_tracker_desc:"রুটিন ও পরিসংখ্যান",feat_info_title:"ভর্তি তথ্য",feat_info_desc:"সার্কুলার ও ডেডলাইন",feat_ai_title:"AI টিউটর",feat_ai_desc:"যেকোনো প্রশ্ন করো",quiz_custom:"কাস্টম কুইজ",quiz_preset:"এডমিশন প্রিসেট",quiz_mistake:"রিভিশন",quiz_chapter_select:"অধ্যায় নির্বাচন",quiz_single_mode:"একক",quiz_multi_mode:"একাধিক",quiz_start:"মডেল টেস্ট শুরু করুন",quiz_next_step:"পরবর্তী ধাপ",quiz_settings:"পরীক্ষার সেটিংস",quiz_practice_mode:"প্র্যাকটিস মোড",quiz_time_limit:"সময় (মিনিট)",quiz_negative_mark:"নেগেটিভ মার্ক",quiz_question_count:"প্রশ্ন সংখ্যা",quiz_view_mode:"ভিউ মোড",quiz_submit:"সাবমিট",quiz_next:"পরবর্তী",quiz_prev:"পূর্ববর্তী",quiz_explanation:"ব্যাখ্যা",quiz_result:"ফলাফল",quiz_correct:"সঠিক",quiz_wrong:"ভুল",quiz_skipped:"স্কিপড",quiz_points:"পয়েন্ট",quiz_accuracy:"সঠিকতার হার",quiz_home:"হোমে ফিরুন",quiz_retry:"আবার দিন",quiz_save:"সেভ",quiz_unsave:"আনসেভ",battle_create:"নতুন রুম তৈরি করুন",battle_join:"রুম জয়েন করুন",battle_code_placeholder:"৬ ডিজিটের কোড দিন",battle_waiting:"হোস্টের জন্য অপেক্ষা...",battle_start:"ব্যাটল শুরু করুন",battle_winner:"বিজয়ী",battle_config:"ব্যাটল কনফিগারেশন",battle_subject:"বিষয় নির্বাচন",battle_chapter:"অধ্যায় নির্বাচন",profile_edit:"প্রোফাইল এডিট",profile_save:"সেভ",profile_cancel:"বাতিল",profile_analysis:"এনালাইসিস",profile_courses:"কোর্সসমূহ",profile_saved:"বুকমার্ক",profile_mistakes:"ভুলসমূহ",profile_weakness:"দুর্বল টপিক",profile_strength:"শক্তিশালী টপিক",profile_total_exams:"মোট এক্সাম",tracker_dashboard:"ড্যাশবোর্ড",tracker_planner:"প্ল্যানার",tracker_history:"হিস্টোরি",tracker_focus_mode:"ফোকাস মোডে যান",tracker_quick_start:"দ্রুত শুরু করুন",tracker_today_progress:"আজকের অগ্রগতি",tracker_session_history:"সেশন হিস্টোরি",tracker_tasks:"বাকি কাজসমূহ",tracker_add_task:"নতুন টাস্ক যোগ করুন...",course_title:"আমাদের কোর্সসমূহ",course_desc:"তোমার স্বপ্ন পূরণের জন্য সেরা মেন্টরদের সাথে প্রস্তুতি নাও।",course_buy:"কিনুন",course_enroll:"ভর্তি হোন",course_active:"Active Plan",pack_title:"এক্সাম প্যাক সমূহ",pack_desc:"ভর্তি পরীক্ষার শেষ মুহূর্তের প্রস্তুতির জন্য সেরা এক্সাম প্যাকগুলো সংগ্রহ করুন।",payment_form:"পেমেন্ট ফর্ম",payment_submit:"জমা দিন",common_loading:"লোড হচ্ছে...",common_error:"কোথাও সমস্যা হয়েছে",common_success:"সফল",common_all:"সব",common_filter:"ফিল্টার"}},Vd=k.createContext(void 0),$d=()=>{const n=k.useContext(Vd);if(!n)throw new Error("useLanguage must be used within a LanguageProvider");return n},Yb=({children:n})=>{const[e]=k.useState("bn"),t=r=>{console.log("Language fixed to Bengali")};k.useEffect(()=>{localStorage.setItem("app_language","bn")},[]);const s=r=>Kb.bn[r]||r;return l.jsx(Vd.Provider,{value:{language:e,setLanguage:t,t:s},children:n})},Jb=({isMobileMenuOpen:n,setIsMobileMenuOpen:e,themeMode:t,toggleTheme:s,notifications:r,readNotificationIds:o,setReadNotificationIds:a,isNotificationOpen:c,setIsNotificationOpen:u})=>{const{currentUser:f,logout:_,userAvatar:m}=Pn(),{t:b}=$d(),S=vs(),T=Xt(),[R,A]=k.useState("ALL"),U=k.useMemo(()=>r.filter(j=>!o.has(j.id)).length,[r,o]),z=k.useMemo(()=>R==="UNREAD"?r.filter(j=>!o.has(j.id)):r,[r,R,o]),M=j=>{a(W=>new Set(W).add(j.id)),j.actionLink&&(j.type==="BATTLE_CHALLENGE"&&j.metadata&&j.metadata.roomId&&localStorage.setItem("battle_join_room",j.metadata.roomId),S(j.actionLink),u(!1))},D=()=>{const j=new Set(o);r.forEach(W=>j.add(W.id)),a(j)},L=[{path:"/dashboard",label:b("nav_home"),icon:l.jsx(Pl,{size:18})},{path:"/exams",label:"Exam Zone",icon:l.jsx(Rf,{size:18})},{path:"/challenges",label:b("nav_challenges"),icon:l.jsx(ko,{size:18})},{path:"/bot",label:"Synapse AI",icon:l.jsx(hr,{size:18})},{path:"/courses",label:b("nav_courses"),icon:l.jsx(Pf,{size:18})},{path:"/qbank",label:b("nav_qbank"),icon:l.jsx(gh,{size:18})},{path:"/battle",label:b("nav_battle"),icon:l.jsx(ur,{size:18})},{path:"/leaderboard",label:b("nav_leaderboard"),icon:l.jsx(dr,{size:18})},{path:"/tracker",label:b("nav_tracker"),icon:l.jsx(jl,{size:18})},{path:"/admission",label:b("nav_admission"),icon:l.jsx(Fr,{size:18})}],J=[{path:"/dashboard",label:"Home",icon:l.jsx(Pl,{size:22})},{path:"/tracker",label:"Planner",icon:l.jsx(jl,{size:22})},{path:"/courses",label:"Courses",icon:l.jsx(xh,{size:22})},{path:"/bot",label:"Doubt",icon:l.jsx(hr,{size:22})},{path:"/profile",label:"Profile",icon:l.jsx(bh,{size:22})}],v=async()=>{try{await _(),e(!1),S("/")}catch(j){console.error("Failed to log out",j)}},y=()=>t==="dark"?l.jsx(Lf,{size:16}):t==="system"?l.jsx(Mf,{size:16}):l.jsx(Uf,{size:16}),x=()=>t==="dark"?"ডার্ক":t==="system"?"অটো":"লাইট",w=j=>{switch(j){case"WARNING":return l.jsx(vh,{size:16,className:"text-yellow-600"});case"SUCCESS":return l.jsx(No,{size:16,className:"text-green-600"});case"BATTLE_CHALLENGE":return l.jsx(ur,{size:16,className:"text-orange-600"});case"BATTLE_RESULT":return l.jsx(dr,{size:16,className:"text-yellow-600"});default:return l.jsx(yh,{size:16,className:"text-blue-600"})}},E=j=>T.pathname===j,I=()=>{var j;return m&&m.startsWith("http")?l.jsx("img",{src:m,alt:"Profile",className:"w-full h-full object-cover"}):l.jsx("div",{className:"w-full h-full flex items-center justify-center bg-primary text-white font-bold text-lg",children:((j=f==null?void 0:f.displayName)==null?void 0:j.charAt(0).toUpperCase())||"U"})};return f?l.jsxs(l.Fragment,{children:[n&&l.jsx("div",{className:"fixed inset-0 bg-black/60 backdrop-blur-sm z-[140] md:hidden",onClick:()=>e(!1)}),c&&l.jsxs(l.Fragment,{children:[l.jsx("div",{className:"fixed inset-0 bg-black/60 backdrop-blur-sm z-[160]",onClick:()=>u(!1)}),l.jsxs("div",{className:"fixed inset-y-0 right-0 w-80 md:w-96 bg-white dark:bg-gray-900 z-[170] shadow-2xl border-l border-gray-200 dark:border-gray-800 flex flex-col animate-in slide-in-from-right-full duration-500 ease-out",children:[l.jsxs("div",{className:"p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center",children:[l.jsxs("h4",{className:"text-base font-bold text-gray-800 dark:text-white flex items-center gap-2",children:["নোটিফিকেশন ",l.jsx("span",{className:"bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs",children:U})]}),l.jsxs("div",{className:"flex items-center gap-2",children:[U>0&&l.jsxs("button",{onClick:D,className:"text-[10px] font-bold text-gray-500 hover:text-primary flex items-center gap-1 transition-colors",children:[l.jsx(jf,{size:12})," সব পঠিত করুন"]}),l.jsx("button",{onClick:()=>u(!1),className:"p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500",children:l.jsx(So,{size:20})})]})]}),l.jsx("div",{className:"p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50",children:l.jsxs("div",{className:"flex bg-gray-200 dark:bg-gray-800 p-1 rounded-xl",children:[l.jsx("button",{onClick:()=>A("ALL"),className:`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${R==="ALL"?"bg-white dark:bg-gray-700 shadow-sm text-primary dark:text-white":"text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`,children:"সব (All)"}),l.jsx("button",{onClick:()=>A("UNREAD"),className:`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${R==="UNREAD"?"bg-white dark:bg-gray-700 shadow-sm text-primary dark:text-white":"text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`,children:"অপঠিত (Unread)"})]})}),l.jsx("div",{className:"flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30 dark:bg-black/20",children:z.length===0?l.jsxs("div",{className:"p-10 text-center flex flex-col items-center justify-center text-gray-400 mt-20",children:[l.jsx("div",{className:"w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3",children:R==="UNREAD"?l.jsx(Of,{size:24,className:"opacity-50"}):l.jsx(Ki,{size:24,className:"opacity-50"})}),l.jsx("p",{className:"text-sm font-medium",children:"কোনো নোটিফিকেশন নেই"}),R==="UNREAD"&&l.jsx("p",{className:"text-[10px] opacity-70",children:"সবগুলো পড়া হয়ে গেছে!"})]}):z.map(j=>{const W=o.has(j.id);return l.jsxs("div",{onClick:()=>M(j),className:`p-4 border-b border-gray-100 dark:border-gray-800 transition-colors cursor-pointer group relative ${W?"bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800":"bg-blue-50/40 dark:bg-blue-900/10 hover:bg-blue-50/60 dark:hover:bg-blue-900/20"}`,children:[!W&&l.jsx("span",{className:"absolute top-4 right-4 w-2 h-2 bg-primary rounded-full ring-2 ring-white dark:ring-gray-900"}),l.jsxs("div",{className:"flex gap-3",children:[l.jsx("div",{className:`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${j.type==="SUCCESS"?"bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800":j.type==="WARNING"?"bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800":j.type==="BATTLE_CHALLENGE"?"bg-orange-100 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800":"bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800"}`,children:w(j.type)}),l.jsxs("div",{className:"flex-1 min-w-0 pr-4",children:[l.jsxs("div",{className:"flex justify-between items-center mb-1",children:[l.jsx("p",{className:`text-xs font-bold truncate ${W?"text-gray-600 dark:text-gray-300":"text-gray-900 dark:text-white"}`,children:j.title}),l.jsx("span",{className:"text-[9px] text-gray-400 whitespace-nowrap",children:new Date(j.date).toLocaleDateString()})]}),l.jsx("p",{className:`text-[11px] leading-relaxed line-clamp-2 ${W?"text-gray-500 dark:text-gray-500":"text-gray-700 dark:text-gray-300"}`,children:j.message}),j.actionLink&&l.jsxs("div",{className:"mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-white bg-primary px-3 py-1 rounded-full hover:bg-blue-700 transition-colors shadow-sm",children:[j.type==="BATTLE_CHALLENGE"?"Join Battle":"View Details"," ",l.jsx(Yi,{size:10})]})]})]})]},j.id)})})]})]}),l.jsxs("div",{className:`
        fixed inset-y-0 left-0 transform ${n?"translate-x-0":"-translate-x-full"}
        md:relative md:translate-x-0 transition duration-300 ease-in-out
        w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-[150] flex flex-col shadow-2xl md:shadow-none h-full
      `,children:[l.jsxs("div",{className:"p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 relative",children:[l.jsxs("div",{className:"flex items-center gap-3",children:[l.jsx("div",{className:"h-9 w-9 bg-gradient-to-br from-primary to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30",children:"ধ্রু"}),l.jsxs("div",{children:[l.jsx("h1",{className:"text-xl font-bold text-gray-900 dark:text-white leading-none tracking-tight",children:"ধ্রুবক"}),l.jsx("p",{className:"text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5 tracking-wide",children:b("nav_prep")})]})]}),l.jsx("div",{className:"relative md:block hidden",children:l.jsxs("button",{onClick:()=>u(!0),className:"p-2.5 rounded-full relative transition-all hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400",children:[l.jsx(Ki,{size:20}),U>0&&l.jsx("span",{className:"absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse"})]})})]}),l.jsx("div",{className:"p-4 border-b border-gray-100 dark:border-gray-800",children:l.jsxs(Xs,{to:"/profile",onClick:()=>e(!1),className:`w-full p-3 rounded-2xl flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-left group border border-transparent hover:border-gray-100 dark:hover:border-gray-700 ${E("/profile")?"bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700":""}`,children:[l.jsx("div",{className:"w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-white dark:border-gray-600 shadow-sm group-hover:scale-105 transition-transform",children:I()}),l.jsxs("div",{className:"overflow-hidden flex-1",children:[l.jsx("p",{className:"text-sm font-bold text-gray-800 dark:text-white truncate",children:f.displayName||"Learner"}),l.jsxs("p",{className:"text-[10px] text-gray-500 dark:text-gray-400 truncate flex items-center gap-1",children:[b("nav_profile_view")," ",l.jsx(Yi,{size:10})]})]})]})}),l.jsxs("nav",{className:"flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar",children:[L.map(j=>l.jsxs(Xs,{to:j.path,onClick:()=>e(!1),className:`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm ${E(j.path)?"bg-blue-50 dark:bg-primary/10 text-primary dark:text-blue-400 shadow-sm":"text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"}`,children:[j.icon,l.jsx("span",{children:j.label})]},j.path)),f.email==="nurnaimsourav@gmail.com"&&l.jsxs(Xs,{to:"/admin",onClick:()=>e(!1),className:`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-bold mt-6 text-sm ${E("/admin")?"bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300":"text-gray-500 dark:text-gray-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300"}`,children:[l.jsx(_h,{size:18}),l.jsx("span",{children:b("nav_admin")})]})]}),l.jsxs("div",{className:"p-4 border-t border-gray-100 dark:border-gray-800 space-y-3 bg-white dark:bg-gray-900",children:[l.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[l.jsxs("button",{onClick:s,className:"flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs font-bold border border-gray-100 dark:border-gray-700",children:[y()," ",x()]}),l.jsxs("button",{onClick:v,className:"flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-xs font-bold border border-red-100 dark:border-red-900/20",children:[l.jsx(Df,{size:16})," ",b("nav_logout")]})]}),l.jsx("div",{className:"text-[10px] text-center text-gray-400 dark:text-gray-600 font-medium",children:l.jsx("p",{children:"© ২০২৪ ধ্রুবক | v1.0"})})]})]}),l.jsxs("div",{className:"md:hidden fixed bottom-0 left-0 right-0 z-[100]",children:[l.jsx("div",{className:"absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/90 via-white/50 to-transparent dark:from-gray-900/90 dark:via-gray-900/50 pointer-events-none"}),l.jsx("div",{className:"bg-white/80 dark:bg-gray-900/85 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800 pb-safe pt-1 shadow-lg relative",children:l.jsx("div",{className:"flex items-center justify-around h-16 px-2",children:J.map((j,W)=>{const Q=j.path?E(j.path):!1;return l.jsxs(Xs,{to:j.path,className:"flex-1 flex flex-col items-center justify-center h-full active:scale-90 transition-transform duration-200 group",children:[l.jsxs("div",{className:`p-1.5 rounded-2xl transition-all duration-300 relative ${Q?"text-primary dark:text-blue-400 -translate-y-1":"text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"}`,children:[Q&&l.jsx("div",{className:"absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-2xl -z-10 scale-110"}),_e.cloneElement(j.icon,{fill:Q?"currentColor":"none",fillOpacity:Q?.2:0,strokeWidth:Q?2.5:2})]}),l.jsx("span",{className:`text-[10px] mt-0.5 transition-all duration-300 ${Q?"font-bold text-primary dark:text-blue-400 scale-100":"font-medium text-gray-400 dark:text-gray-500 scale-90 opacity-80"}`,children:j.label})]},W)})})})]})]}):null},Qb=({onBack:n})=>{const{loginWithGoogle:e}=Pn(),{t}=$d(),[s,r]=k.useState(!0),[o,a]=k.useState(""),[c,u]=k.useState(""),[f,_]=k.useState(""),[m,b]=k.useState(""),[S,T]=k.useState(!1),[R,A]=k.useState(""),U=D=>/^01[3-9]\d{8}$/.test(D),z=async()=>{T(!0),A("");try{await e()}catch(D){console.error("Login Error:",D);let L="Google Login Failed.";D.code==="auth/popup-closed-by-user"?L="লগইন উইন্ডোটি বন্ধ করা হয়েছে। দয়া করে আবার চেষ্টা করুন।":D.code==="auth/popup-blocked"?L="পপ-আপ ব্লক করা হয়েছে। ব্রাউজার সেটিং চেক করুন।":D.code==="auth/unauthorized-domain"?L="এই ডোমেইনটি অথোরাইজড নয়। (Developer Note: Add domain to Firebase Console)":D.code==="auth/network-request-failed"&&(L="ইন্টারনেট সংযোগ চেক করুন।"),A(L)}finally{T(!1)}},M=async D=>{if(D.preventDefault(),T(!0),A(""),!s&&!U(m)){A("সঠিক মোবাইল নাম্বার দিন (যেমন: 017...)"),T(!1);return}try{if(s)await M_(Qe,o,c);else{const L=await L_(Qe,o,c);await _u(L.user,{displayName:f,photoURL:""}),await To({...L.user,displayName:f,photoURL:""},{phoneNumber:m})}}catch(L){console.error(L),L.code==="auth/invalid-credential"?A("ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।"):L.code==="auth/email-already-in-use"?A("এই ইমেইল দিয়ে ইতিমধ্যে একাউন্ট খোলা আছে।"):L.code==="auth/weak-password"?A("পাসওয়ার্ড অত্যন্ত দুর্বল (অন্তত ৬ অক্ষর দিন)।"):A("লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।")}finally{T(!1)}};return l.jsxs("div",{className:"min-h-screen flex bg-white dark:bg-gray-900 transition-colors",children:[l.jsxs("div",{className:"hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center overflow-hidden",children:[l.jsx("div",{className:"absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"}),l.jsx("div",{className:"absolute inset-0 bg-gradient-to-br from-primary to-blue-800 opacity-90"}),l.jsxs("div",{className:"relative z-10 p-12 text-white max-w-lg",children:[l.jsx("div",{className:"h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-8 shadow-xl border-2 border-white",children:l.jsx("span",{className:"text-3xl font-bold",children:"ধ্রু"})}),l.jsx("h1",{className:"text-5xl font-bold mb-6",children:"আপনার লার্নিং জার্নি শুরু হোক এখান থেকেই"}),l.jsx("p",{className:"text-lg text-blue-100 leading-relaxed mb-8",children:"AI টিউটর, স্মার্ট কুইজ এবং পার্সোনালাইজড সাপোর্টের মাধ্যমে নিজেকে প্রস্তুত করুন সেরা ফলাফলের জন্য।"}),l.jsxs("div",{className:"flex gap-4",children:[l.jsxs("div",{className:"px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20",children:[l.jsx("span",{className:"font-bold text-2xl",children:"10k+"}),l.jsx("p",{className:"text-sm text-blue-100",children:"Students"})]}),l.jsxs("div",{className:"px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20",children:[l.jsx("span",{className:"font-bold text-2xl",children:"50k+"}),l.jsx("p",{className:"text-sm text-blue-100",children:"Tests"})]})]})]})]}),l.jsx("div",{className:"w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12",children:l.jsxs("div",{className:"w-full max-w-md space-y-6",children:[l.jsxs("div",{className:"text-center lg:text-left",children:[l.jsxs("button",{onClick:n,className:"text-sm text-gray-500 hover:text-primary mb-4 flex items-center justify-center lg:justify-start gap-1",children:["← ",t("auth_back")]}),l.jsx("h2",{className:"text-3xl font-bold text-gray-900 dark:text-white",children:t(s?"auth_welcome":"auth_create_account")}),l.jsx("p",{className:"mt-2 text-gray-600 dark:text-gray-400",children:t(s?"auth_login_subtitle":"auth_register_subtitle")})]}),R&&l.jsxs("div",{className:"p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-800 flex items-center gap-2",children:[l.jsx("span",{className:"font-bold",children:"Error:"})," ",R]}),l.jsxs("button",{onClick:z,disabled:S,className:"w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white font-bold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-3 relative disabled:opacity-70 disabled:cursor-not-allowed",children:[l.jsxs("svg",{className:"w-5 h-5",viewBox:"0 0 24 24",children:[l.jsx("path",{d:"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z",fill:"#4285F4"}),l.jsx("path",{d:"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z",fill:"#34A853"}),l.jsx("path",{d:"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z",fill:"#FBBC05"}),l.jsx("path",{d:"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z",fill:"#EA4335"})]}),t("auth_google")]}),l.jsxs("div",{className:"relative",children:[l.jsx("div",{className:"absolute inset-0 flex items-center",children:l.jsx("div",{className:"w-full border-t border-gray-200 dark:border-gray-700"})}),l.jsx("div",{className:"relative flex justify-center text-xs uppercase",children:l.jsx("span",{className:"px-2 bg-white dark:bg-gray-900 text-gray-500",children:t("auth_or")})})]}),l.jsxs("form",{onSubmit:M,className:"space-y-4",children:[!s&&l.jsxs(l.Fragment,{children:[l.jsxs("div",{children:[l.jsx("label",{className:"block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5",children:t("auth_name")}),l.jsxs("div",{className:"relative group",children:[l.jsx(bh,{size:18,className:"absolute left-3 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors"}),l.jsx("input",{type:"text",required:!0,value:f,onChange:D=>_(D.target.value),className:"w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all text-sm",placeholder:t("auth_name")})]})]}),l.jsxs("div",{children:[l.jsx("label",{className:"block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5",children:t("auth_phone")}),l.jsxs("div",{className:"relative group",children:[l.jsx(Ff,{size:18,className:"absolute left-3 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors"}),l.jsx("input",{type:"tel",required:!0,value:m,onChange:D=>b(D.target.value),className:"w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all text-sm",placeholder:"01XXXXXXXXX"})]})]})]}),l.jsxs("div",{children:[l.jsx("label",{className:"block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5",children:t("auth_email")}),l.jsxs("div",{className:"relative group",children:[l.jsx(zf,{size:18,className:"absolute left-3 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors"}),l.jsx("input",{type:"email",required:!0,value:o,onChange:D=>a(D.target.value),className:"w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all text-sm",placeholder:"name@example.com"})]})]}),l.jsxs("div",{children:[l.jsx("label",{className:"block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5",children:t("auth_password")}),l.jsxs("div",{className:"relative group",children:[l.jsx(Bf,{size:18,className:"absolute left-3 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors"}),l.jsx("input",{type:"password",required:!0,value:c,onChange:D=>u(D.target.value),className:"w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all text-sm",placeholder:"••••••••"})]})]}),l.jsx("button",{type:"submit",disabled:S,className:"w-full bg-primary hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed",children:S?l.jsx(ys,{size:24,className:"animate-spin"}):l.jsxs(l.Fragment,{children:[t(s?"auth_login_btn":"auth_register_btn")," ",l.jsx(rr,{size:20})]})})]}),l.jsx("div",{className:"text-center",children:l.jsxs("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:[t(s?"auth_no_account":"auth_have_account"),l.jsx("button",{onClick:()=>r(!s),className:"ml-2 font-bold text-primary hover:underline",children:t(s?"auth_register_btn":"auth_login_btn")})]})})]})})]})},sr=({end:n,duration:e=2e3,suffix:t=""})=>{const[s,r]=k.useState(0);return k.useEffect(()=>{let o=null;const a=c=>{o||(o=c);const u=Math.min((c-o)/e,1);r(Math.floor(u*n)),u<1&&window.requestAnimationFrame(a)};window.requestAnimationFrame(a)},[n,e]),l.jsxs("span",{children:[s.toLocaleString(),t]})},Xb=()=>{const n=["BUET","DMC","Dhaka University","RUET","KUET","CUET","SUST","Jahangirnagar","Rajshahi University","Chittagong University","GST","AFMC"];return l.jsxs("div",{className:"w-full overflow-hidden bg-gray-50/50 dark:bg-gray-900/50 py-4 border-y border-gray-100 dark:border-gray-800",children:[l.jsx("div",{className:"flex w-[200%] animate-marquee whitespace-nowrap",children:n.concat(n).map((e,t)=>l.jsxs("div",{className:"mx-8 flex items-center gap-2 text-gray-400 font-bold text-lg uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity cursor-default",children:[l.jsx(Fr,{size:20})," ",e]},t))}),l.jsx("style",{children:`
        .animate-marquee { animation: marquee 30s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `})]})},dh=({title:n,sub:e,icon:t,color:s})=>l.jsxs("div",{className:"mx-3 relative group w-64 h-32 flex-shrink-0 cursor-pointer",children:[l.jsx("div",{className:`absolute inset-0 bg-gradient-to-r ${s} rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity`}),l.jsxs("div",{className:"absolute inset-0 border border-gray-100 dark:border-gray-700 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 flex flex-col justify-between transition-transform group-hover:-translate-y-1 duration-300",children:[l.jsxs("div",{className:"flex justify-between items-start",children:[l.jsx("div",{className:`p-2 rounded-lg bg-gray-50 dark:bg-gray-700 ${s.replace("from-","text-").split(" ")[0]}`,children:t}),l.jsx("span",{className:"text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full",children:"Exam"})]}),l.jsxs("div",{children:[l.jsx("h4",{className:"font-bold text-gray-800 dark:text-white text-sm line-clamp-1",children:n}),l.jsx("p",{className:"text-xs text-gray-500 dark:text-gray-400 mt-0.5",children:e})]})]})]}),Zb=()=>{const n=[{title:"মেডিকেল ভর্তি পরীক্ষা",sub:"২০২৩-২৪ | সেট ক",icon:l.jsx(Dl,{size:18}),color:"from-green-500 to-emerald-500"},{title:"ঢাকা বিশ্ববিদ্যালয় (ক)",sub:"২০২২-২৩ | পদার্থবিজ্ঞান",icon:l.jsx(Fr,{size:18}),color:"from-orange-500 to-red-500"},{title:"বুয়েট প্রিলিমিনারি",sub:"২০২১-২২ | শিফট ১",icon:l.jsx(ko,{size:18}),color:"from-blue-500 to-indigo-500"},{title:"রাজশাহী বিশ্ববিদ্যালয়",sub:"২০২৩-২৪ | ইউনিট সি",icon:l.jsx(xh,{size:18}),color:"from-purple-500 to-pink-500"},{title:"জাহাঙ্গীরনগর ঢ ইউনিট",sub:"২০২২-২৩ | জীববিজ্ঞান",icon:l.jsx(sw,{size:18}),color:"from-green-600 to-teal-500"}],e=[{title:"গুচ্ছ (GST) ক ইউনিট",sub:"২০২৩-২৪ | রসায়ন",icon:l.jsx(tw,{size:18}),color:"from-cyan-500 to-blue-500"},{title:"আর্মড ফোর্সেস মেডিকেল",sub:"২০২২-২৩ | সাধারণ জ্ঞান",icon:l.jsx(_h,{size:18}),color:"from-red-500 to-rose-500"},{title:"কৃষি গুচ্ছ ভর্তি পরীক্ষা",sub:"২০২৩ | উদ্ভিদবিজ্ঞান",icon:l.jsx(rw,{size:18}),color:"from-lime-500 to-green-600"},{title:"চুয়েট কুয়েট রুয়েট",sub:"২০২১-২২ | গণিত",icon:l.jsx(nw,{size:18}),color:"from-violet-500 to-purple-600"},{title:"ডেন্টাল ভর্তি পরীক্ষা",sub:"২০২৩-২৪ | ইংরেজি",icon:l.jsx(Dl,{size:18}),color:"from-sky-500 to-blue-600"}];return l.jsxs("div",{className:"w-full overflow-hidden py-10 relative space-y-6",children:[l.jsx("div",{className:"absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none"}),l.jsx("div",{className:"absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none"}),l.jsx("div",{className:"flex w-[200%] animate-marquee-left whitespace-nowrap",children:n.concat(n).concat(n).map((t,s)=>l.jsx(dh,{...t},`r1-${s}`))}),l.jsx("div",{className:"flex w-[200%] animate-marquee-right whitespace-nowrap",children:e.concat(e).concat(e).map((t,s)=>l.jsx(dh,{...t},`r2-${s}`))}),l.jsx("style",{children:`
        .animate-marquee-left { animation: marquee-left 60s linear infinite; }
        .animate-marquee-right { animation: marquee-right 60s linear infinite; }
        @keyframes marquee-left { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes marquee-right { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
      `})]})},ew=()=>{const n=["মেডিকেল","ইঞ্জিনিয়ারিং","ভার্সিটি 'ক'","HSC একাডেমিক"],[e,t]=k.useState(0),[s,r]=k.useState(0),[o,a]=k.useState(!0),[c,u]=k.useState(!1);return k.useEffect(()=>{const f=setTimeout(()=>a(!o),500);return()=>clearTimeout(f)},[o]),k.useEffect(()=>{if(s===n[e].length+1&&!c){setTimeout(()=>u(!0),1e3);return}if(s===0&&c){u(!1),t(_=>(_+1)%n.length);return}const f=setTimeout(()=>{r(_=>_+(c?-1:1))},c?75:150);return()=>clearTimeout(f)},[s,e,c,n]),l.jsxs("span",{className:"text-primary dark:text-blue-400",children:[n[e].substring(0,s),l.jsx("span",{className:`${o?"opacity-100":"opacity-0"} transition-opacity`,children:"|"})]})},tw=n=>l.jsxs("svg",{...n,xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[l.jsx("path",{d:"M4.5 3h15"}),l.jsx("path",{d:"M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"}),l.jsx("path",{d:"M6 14h12"})]}),nw=n=>l.jsxs("svg",{...n,xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[l.jsx("rect",{width:"16",height:"20",x:"4",y:"2",rx:"2"}),l.jsx("line",{x1:"8",x2:"16",y1:"6",y2:"6"}),l.jsx("line",{x1:"16",x2:"16",y1:"14",y2:"18"}),l.jsx("path",{d:"M16 10h.01"}),l.jsx("path",{d:"M12 10h.01"}),l.jsx("path",{d:"M8 10h.01"}),l.jsx("path",{d:"M12 14h.01"}),l.jsx("path",{d:"M8 14h.01"}),l.jsx("path",{d:"M12 18h.01"}),l.jsx("path",{d:"M8 18h.01"})]}),sw=n=>l.jsxs("svg",{...n,xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[l.jsx("path",{d:"M2 15c6.667-6 13.333 0 20-6"}),l.jsx("path",{d:"M9 22c1.798-1.998 2.518-3.995 2.807-5.993"}),l.jsx("path",{d:"M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"}),l.jsx("path",{d:"M17 6l-2.5-2.5"}),l.jsx("path",{d:"M14 8l-1-1"}),l.jsx("path",{d:"M7 18l2.5 2.5"}),l.jsx("path",{d:"M3.5 14.5l1-1"}),l.jsx("path",{d:"M20 9l2.5 2.5"}),l.jsx("path",{d:"M14.5 16.5l1-1"}),l.jsx("path",{d:"M10 2l-2.5 2.5"}),l.jsx("path",{d:"M3 8l1-1"}),l.jsx("path",{d:"M9 20l1-1"}),l.jsx("path",{d:"M17 18l-2.5 2.5"}),l.jsx("path",{d:"M7.5 10.5l-1-1"})]}),rw=n=>l.jsxs("svg",{...n,xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[l.jsx("path",{d:"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 13-11 19Z"}),l.jsx("path",{d:"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 13-11 19Z"})]}),iw=({onLoginClick:n})=>l.jsxs("div",{className:"h-screen w-full overflow-y-auto bg-white dark:bg-gray-900 font-sans text-gray-900 dark:text-white transition-colors scroll-smooth selection:bg-primary/30",children:[l.jsx("nav",{className:"sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 transition-all",children:l.jsxs("div",{className:"max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between",children:[l.jsxs("div",{className:"flex items-center gap-2 md:gap-3 cursor-pointer group",onClick:()=>window.scrollTo({top:0,behavior:"smooth"}),children:[l.jsxs("div",{className:"relative",children:[l.jsx("div",{className:"absolute inset-0 bg-primary/40 rounded-full blur-md group-hover:blur-lg transition-all"}),l.jsx("div",{className:"h-8 w-8 md:h-10 md:w-10 bg-gradient-to-br from-primary to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl relative z-10 shadow-inner border-2 border-white",children:"ধ্রু"})]}),l.jsx("span",{className:"text-lg md:text-xl font-bold tracking-tight block group-hover:text-primary transition-colors",children:"ধ্রুবক"})]}),l.jsxs("div",{className:"flex items-center gap-3 md:gap-4",children:[l.jsx("button",{onClick:n,className:"text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 hidden sm:block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all",children:"লগইন"}),l.jsxs("button",{onClick:n,className:"px-4 py-2 md:px-6 md:py-2.5 bg-primary hover:bg-blue-800 text-white font-bold text-sm md:text-base rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center gap-2 group border border-transparent hover:border-blue-400/30",children:["রেজিস্ট্রেশন ",l.jsx(rr,{size:16,className:"md:w-[18px] md:h-[18px] group-hover:translate-x-1 transition-transform"})]})]})]})}),l.jsxs("section",{className:"relative pt-12 pb-20 md:pt-24 md:pb-32 px-4 md:px-6 overflow-hidden",children:[l.jsx("div",{className:"absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"}),l.jsx("div",{className:"absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white dark:from-gray-900 to-transparent pointer-events-none"}),l.jsx("div",{className:"absolute top-20 left-10 w-48 h-48 md:w-72 md:h-72 bg-blue-500/20 rounded-full blur-[80px] md:blur-[100px] animate-pulse"}),l.jsx("div",{className:"absolute bottom-20 right-10 w-64 h-64 md:w-96 md:h-96 bg-cyan-500/10 rounded-full blur-[100px] md:blur-[120px] animate-pulse delay-1000"}),l.jsxs("div",{className:"max-w-6xl mx-auto text-center relative z-10",children:[l.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary dark:text-blue-400 font-bold text-[10px] md:text-sm mb-6 md:mb-8 border border-blue-200 dark:border-blue-800 animate-in fade-in slide-in-from-bottom-4 duration-700 hover:scale-105 transition-transform cursor-default",children:[l.jsxs("span",{className:"relative flex h-2 w-2",children:[l.jsx("span",{className:"animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"}),l.jsx("span",{className:"relative inline-flex rounded-full h-2 w-2 bg-primary"})]}),"তোমার প্রস্তুতির ধ্রুবক"]}),l.jsxs("h1",{className:"text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 md:mb-8 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 text-gray-900 dark:text-white",children:["স্বপ্ন এখন হাতের মুঠোয়",l.jsx("br",{}),l.jsxs("span",{className:"block mt-2",children:["প্রস্তুতি হোক ",l.jsx(ew,{})]})]}),l.jsx("p",{className:"text-base md:text-xl text-gray-600 dark:text-gray-300 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 px-4",children:"'ধ্রুবক' AI টিউটর, রিয়েল-টাইম কুইজ ব্যাটল এবং স্মার্ট প্রোগ্রেস ট্র্যাকিং এর সাথে নিজেকে প্রস্তুত করো বুয়েট, মেডিকেল বা ঢাকা ভার্সিটির জন্য।"}),l.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 w-full sm:w-auto px-4",children:[l.jsxs("button",{onClick:n,className:"w-full sm:w-auto px-6 py-3.5 md:px-8 md:py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl md:rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg shadow-xl shadow-gray-500/20",children:[l.jsx(ko,{size:20,className:"fill-yellow-400 text-yellow-400 md:w-[22px] md:h-[22px]"})," বিনামূল্যে শুরু করুন"]}),l.jsxs("button",{onClick:()=>{var e;return(e=document.getElementById("features"))==null?void 0:e.scrollIntoView({behavior:"smooth"})},className:"w-full sm:w-auto px-6 py-3.5 md:px-8 md:py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-bold rounded-xl md:rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 group",children:[l.jsx(Wf,{size:18,className:"group-hover:text-primary transition-colors md:w-5 md:h-5"})," ডেমো দেখুন"]})]}),l.jsx("div",{className:"mt-12 md:mt-20 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm max-w-4xl mx-auto animate-in fade-in zoom-in duration-1000 delay-500",children:l.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8",children:[l.jsxs("div",{className:"text-center",children:[l.jsx("p",{className:"text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-1",children:l.jsx(sr,{end:2e4,suffix:"+"})}),l.jsx("p",{className:"text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider",children:"প্রশ্ন সম্ভার"})]}),l.jsxs("div",{className:"text-center border-l border-gray-200 dark:border-gray-700",children:[l.jsx("p",{className:"text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-1",children:l.jsx(sr,{end:24,suffix:"/7"})}),l.jsx("p",{className:"text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider",children:"AI সাপোর্ট"})]}),l.jsxs("div",{className:"text-center border-l-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 border-t md:border-t-0",children:[l.jsx("p",{className:"text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-1",children:l.jsx(sr,{end:10,suffix:"+"})}),l.jsx("p",{className:"text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider",children:"বছরের প্রশ্ন"})]}),l.jsxs("div",{className:"text-center border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 border-t md:border-t-0",children:[l.jsx("p",{className:"text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-1",children:l.jsx(sr,{end:4,suffix:"টি"})}),l.jsx("p",{className:"text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center justify-center gap-1",children:"মেজর টার্গেট"})]})]})})]})]}),l.jsx(Xb,{}),l.jsx("section",{id:"features",className:"py-16 md:py-24 px-4 md:px-6 relative",children:l.jsxs("div",{className:"max-w-7xl mx-auto",children:[l.jsxs("div",{className:"text-center mb-10 md:mb-16 space-y-3 md:space-y-4",children:[l.jsxs("h2",{className:"text-3xl md:text-5xl font-bold text-gray-900 dark:text-white",children:["কেন ",l.jsx("span",{className:"text-primary dark:text-blue-400",children:"ধ্রুবক"}),"?"]}),l.jsx("p",{className:"text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed",children:"ভর্তি যুদ্ধের এই কঠিন সময়ে প্রয়োজন একজন নির্ভরযোগ্য গাইড। ধ্রুবক তোমাকে দিচ্ছে পার্সোনালাইজড কেয়ার, কম্পিটিটিভ এনভায়রনমেন্ট এবং লেটেস্ট টেকনোলজি—যা তোমাকে অন্যদের চেয়ে এক ধাপ এগিয়ে রাখবে।"})]}),l.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-4 md:gap-6 md:grid-rows-2 h-auto md:h-[600px]",children:[l.jsxs("div",{className:"md:col-span-4 row-span-2 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 text-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group min-h-[400px] cursor-pointer",onClick:n,children:[l.jsx("div",{className:"absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-primary/30 transition-all duration-700"}),l.jsx("div",{className:"absolute bottom-0 left-0 w-[200px] h-[200px] bg-cyan-500/10 rounded-full blur-[80px] -ml-10 -mb-10"}),l.jsxs("div",{className:"relative z-10 h-full flex flex-col md:flex-row items-center justify-between gap-8",children:[l.jsxs("div",{className:"space-y-4 max-w-lg flex-1",children:[l.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-blue-300 backdrop-blur-md",children:[l.jsx(fr,{size:12})," ডেইলি চ্যালেঞ্জ"]}),l.jsxs("h3",{className:"text-3xl md:text-5xl font-bold leading-tight",children:["নিজেকে যাচাই করো ",l.jsx("br",{})," ",l.jsx("span",{className:"text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300",children:"লাইভ কুইজ"})," দিয়ে"]}),l.jsx("p",{className:"text-gray-400 text-sm md:text-base leading-relaxed",children:"প্রতিদিন নতুন নতুন টপিকের উপর মডেল টেস্ট দাও এবং তোমার অবস্থান যাচাই করো। ভুলগুলো থেকে শেখো।"}),l.jsxs("button",{className:"mt-4 bg-primary hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 group-hover:scale-105 active:scale-95 w-fit",children:["পরীক্ষা শুরু করুন ",l.jsx(rr,{size:18})]})]}),l.jsx("div",{className:"relative w-full md:w-auto flex justify-center mt-8 md:mt-0",children:l.jsxs("div",{className:"relative w-64 h-48 bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 transform rotate-3 group-hover:rotate-6 transition-transform duration-500 shadow-2xl",children:[l.jsx("div",{className:"absolute -top-3 -right-3 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg animate-bounce",children:"Live"}),l.jsxs("div",{className:"h-full flex flex-col justify-between",children:[l.jsxs("div",{className:"flex items-center gap-3 mb-2",children:[l.jsx("div",{className:"w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary",children:l.jsx(wh,{size:20})}),l.jsxs("div",{children:[l.jsx("p",{className:"text-sm font-bold text-white",children:"Physics Quiz"}),l.jsx("p",{className:"text-[10px] text-gray-400",children:"Time: 20 Mins"})]})]}),l.jsxs("div",{className:"space-y-2",children:[l.jsx("div",{className:"h-2 w-full bg-white/10 rounded-full overflow-hidden",children:l.jsx("div",{className:"h-full bg-primary w-[70%]"})}),l.jsxs("div",{className:"flex justify-between text-[10px] text-gray-400",children:[l.jsx("span",{children:"Progress"}),l.jsx("span",{children:"1500+ Participants"})]})]}),l.jsx("button",{className:"w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors text-white",children:"Join Now"})]})]})})]})]}),l.jsxs("div",{className:"md:col-span-2 bg-white dark:bg-gray-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group cursor-pointer relative overflow-hidden min-h-[200px]",onClick:n,children:[l.jsx("div",{className:"absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all"}),l.jsx("div",{className:"w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4",children:l.jsx(hr,{size:24})}),l.jsx("h3",{className:"text-xl font-bold mb-2 text-gray-900 dark:text-white",children:"Synapse AI টিউটর"}),l.jsx("p",{className:"text-gray-500 dark:text-gray-400 text-xs md:text-sm",children:"২৪/৭ পার্সোনাল টিউটর। যেকোনো কঠিন টপিক বা ম্যাথ ছবি তুলে পাঠাও, মুহূর্তেই সমাধান বুঝে নাও।"})]}),l.jsxs("div",{className:"md:col-span-2 bg-gradient-to-br from-secondary to-cyan-600 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden group min-h-[200px]",onClick:n,children:[l.jsx("div",{className:"absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"}),l.jsxs("div",{className:"relative z-10",children:[l.jsxs("div",{className:"flex justify-between items-start mb-4 md:mb-6",children:[l.jsx("div",{className:"w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-xl md:rounded-2xl flex items-center justify-center",children:l.jsx(ur,{size:20,className:"md:w-7 md:h-7 text-white"})}),l.jsx("span",{className:"bg-white/20 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold backdrop-blur-sm animate-pulse",children:"MULTIPLAYER"})]}),l.jsx("h3",{className:"text-xl md:text-2xl font-bold mb-1 md:mb-2",children:"কুইজ ব্যাটল"}),l.jsx("p",{className:"text-blue-100 text-xs md:text-sm mb-2 md:mb-4",children:"বন্ধুদের চ্যালেঞ্জ করো এবং লাইভ ১ বনাম ১ কুইজ খেলে পয়েন্ট জিতো।"})]}),l.jsx("div",{className:"absolute -bottom-6 -right-6 text-white/10 transform rotate-12 group-hover:rotate-0 transition-transform duration-500",children:l.jsx(ur,{size:80,className:"md:w-[120px] md:h-[120px]"})})]})]})]})}),l.jsxs("section",{className:"py-10 md:py-24 px-4 md:px-6 bg-[#0f172a] text-white relative overflow-hidden",children:[l.jsxs("div",{className:"absolute inset-0 overflow-hidden pointer-events-none",children:[l.jsx("div",{className:"absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-600/20 to-purple-900/20 opacity-30 blur-[100px]"}),l.jsx("div",{className:"absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]"})]}),l.jsx("div",{className:"max-w-6xl mx-auto relative z-10",children:l.jsxs("div",{className:"flex flex-col md:flex-row items-center gap-8 md:gap-20",children:[l.jsxs("div",{className:"flex-1 space-y-4 text-center md:text-left",children:[l.jsxs("div",{className:"inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-yellow-400 font-bold text-xs md:text-sm backdrop-blur-md animate-in fade-in slide-in-from-left-4",children:[l.jsx(Ol,{size:16,className:"md:w-4 md:h-4"})," সিজন ১ র‍্যাঙ্কিং"]}),l.jsxs("h2",{className:"text-3xl md:text-6xl font-extrabold tracking-tight",children:["সেরাদের তালিকায়",l.jsx("br",{}),l.jsx("span",{className:"text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-600",children:"তুমি কোথায়?"})]}),l.jsx("p",{className:"text-slate-400 text-sm md:text-lg leading-relaxed max-w-xl",children:"শুধুমাত্র পড়াশোনা নয়, শেখাটাকে আমরা করেছি গেমের মতো মজাদার। কুইজ দিয়ে পয়েন্ট অর্জন করো, লেভেল আপ করো এবং ব্রোঞ্জ থেকে লিজেন্ড লিগে প্রমোশন নাও।"}),l.jsx("div",{className:"flex flex-wrap justify-center md:justify-start gap-4",children:l.jsxs("button",{onClick:n,className:"bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-6 md:px-8 py-3 md:py-3.5 rounded-2xl font-bold hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all hover:scale-105 active:scale-95 text-sm md:text-base flex items-center gap-2",children:[l.jsx(dr,{size:18})," লিডারবোর্ড দেখুন"]})})]}),l.jsx("div",{className:"flex-1 relative w-full flex justify-center pt-6 md:pt-0",children:l.jsxs("div",{className:"relative z-10 grid grid-cols-3 gap-2 md:gap-4 items-end max-w-md w-full text-center",children:[l.jsxs("div",{className:"flex flex-col items-center transform translate-y-4 md:translate-y-8 animate-in slide-in-from-bottom-8 duration-700 delay-100",children:[l.jsxs("div",{className:"relative mb-2 group",children:[l.jsx("div",{className:"w-14 h-14 md:w-20 md:h-20 rounded-full p-1 bg-gradient-to-br from-slate-300 to-slate-500 shadow-[0_0_20px_rgba(148,163,184,0.3)] relative z-10 group-hover:scale-105 transition-transform duration-300",children:l.jsx("img",{src:"https://api.dicebear.com/7.x/avataaars/svg?seed=Sadia&mouth=smile&eyebrows=default",className:"w-full h-full object-cover rounded-full border-2 border-slate-900 bg-slate-800",alt:"Sadia"})}),l.jsxs("div",{className:"absolute -bottom-2 md:-bottom-3 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-200 text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-lg border border-slate-600 flex items-center gap-1",children:[l.jsx("span",{className:"text-slate-400",children:"#"}),"2"]})]}),l.jsxs("div",{className:"mb-2",children:[l.jsx("p",{className:"text-[10px] md:text-xs font-bold text-slate-200",children:"Sadia Afrin"}),l.jsx("p",{className:"text-[8px] md:text-[10px] text-slate-400",children:"Viqarunnisa Noon"})]}),l.jsx("div",{className:"w-full h-24 md:h-32 bg-gradient-to-t from-slate-800/80 to-slate-700/30 rounded-t-2xl border-t border-slate-500/30 backdrop-blur-xl relative overflow-hidden group",children:l.jsx("div",{className:"absolute inset-0 bg-slate-400/5 group-hover:bg-slate-400/10 transition-colors"})})]}),l.jsxs("div",{className:"flex flex-col items-center z-20 -mt-6 md:mt-0 animate-in slide-in-from-bottom-8 duration-700",children:[l.jsxs("div",{className:"mb-2 relative group",children:[l.jsx(Ol,{size:32,className:"text-yellow-400 animate-bounce absolute -top-8 md:-top-14 left-1/2 -translate-x-1/2 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] md:w-12 md:h-12",fill:"currentColor"}),l.jsx("div",{className:"w-16 h-16 md:w-24 md:h-24 rounded-full p-1 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 shadow-[0_0_30px_rgba(234,179,8,0.4)] relative z-10 group-hover:scale-105 transition-transform duration-300",children:l.jsx("img",{src:"https://api.dicebear.com/7.x/avataaars/svg?seed=Tahmid&mouth=smile&eyebrows=default",className:"w-full h-full object-cover rounded-full border-2 border-slate-900 bg-slate-800",alt:"Tahmid"})}),l.jsxs("div",{className:"absolute -bottom-2 md:-bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-950 text-xs md:text-sm font-bold px-3 md:px-4 py-0.5 md:py-1 rounded-full shadow-lg border border-yellow-400 flex items-center gap-1",children:[l.jsx("span",{className:"text-yellow-800/70",children:"#"}),"1"]})]}),l.jsxs("div",{className:"mb-2",children:[l.jsx("p",{className:"text-xs md:text-sm font-bold text-yellow-100",children:"Tahmid Khan"}),l.jsx("p",{className:"text-[9px] md:text-[10px] text-yellow-500/80",children:"Notre Dame College"})]}),l.jsxs("div",{className:"w-full h-36 md:h-48 bg-gradient-to-t from-yellow-900/40 to-yellow-600/10 rounded-t-2xl border-t border-yellow-500/30 backdrop-blur-xl relative overflow-hidden shadow-[0_-10px_40px_-15px_rgba(234,179,8,0.2)] group",children:[l.jsx("div",{className:"absolute inset-0 bg-yellow-400/5 group-hover:bg-yellow-400/10 transition-colors"}),l.jsx("div",{className:"absolute bottom-6 left-1/2 -translate-x-1/2",children:l.jsx(dr,{size:32,className:"text-yellow-500/20 group-hover:text-yellow-500/40 transition-colors md:w-10 md:h-10"})})]})]}),l.jsxs("div",{className:"flex flex-col items-center transform translate-y-6 md:translate-y-12 animate-in slide-in-from-bottom-8 duration-700 delay-200",children:[l.jsxs("div",{className:"relative mb-2 group",children:[l.jsx("div",{className:"w-14 h-14 md:w-20 md:h-20 rounded-full p-1 bg-gradient-to-br from-amber-600 to-amber-800 shadow-[0_0_20px_rgba(180,83,9,0.3)] relative z-10 group-hover:scale-105 transition-transform duration-300",children:l.jsx("img",{src:"https://api.dicebear.com/7.x/avataaars/svg?seed=Rafi&mouth=smile&eyebrows=default",className:"w-full h-full object-cover rounded-full border-2 border-slate-900 bg-slate-800",alt:"Rafi"})}),l.jsxs("div",{className:"absolute -bottom-2 md:-bottom-3 left-1/2 -translate-x-1/2 bg-amber-900 text-amber-100 text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow-lg border border-amber-700 flex items-center gap-1",children:[l.jsx("span",{className:"text-amber-400/70",children:"#"}),"3"]})]}),l.jsxs("div",{className:"mb-2",children:[l.jsx("p",{className:"text-[10px] md:text-xs font-bold text-amber-100",children:"Rafi Ahmed"}),l.jsx("p",{className:"text-[8px] md:text-[10px] text-amber-500/80",children:"Dhaka College"})]}),l.jsx("div",{className:"w-full h-16 md:h-24 bg-gradient-to-t from-amber-900/60 to-amber-800/20 rounded-t-2xl border-t border-amber-600/30 backdrop-blur-xl relative overflow-hidden group",children:l.jsx("div",{className:"absolute inset-0 bg-amber-600/5 group-hover:bg-amber-600/10 transition-colors"})})]})]})})]})})]}),l.jsx("section",{className:"py-16 md:py-24 px-4 md:px-6 bg-white dark:bg-gray-900 overflow-hidden",children:l.jsxs("div",{className:"max-w-7xl mx-auto",children:[l.jsxs("div",{className:"flex flex-col md:flex-row justify-between items-end mb-10 md:mb-14",children:[l.jsxs("div",{className:"space-y-3 w-full md:w-auto",children:[l.jsxs("div",{className:"flex items-center gap-2 text-primary font-bold tracking-wider uppercase text-xs md:text-sm",children:[l.jsx(gh,{size:14,className:"md:w-4 md:h-4"})," ফ্রি এক্সেস"]}),l.jsxs("h2",{className:"text-3xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight",children:["আনলিমিটেড ",l.jsx("br",{className:"md:hidden"})," ",l.jsx("span",{className:"text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500",children:"প্রশ্নব্যাংক সলভ"})]}),l.jsx("p",{className:"text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed",children:"টাকা খরচ করে মডেল টেস্ট নয়। ধ্রুবক-এ মেডিকেল, ইঞ্জিনিয়ারিং ও ভার্সিটির বিগত বছরের সকল প্রশ্ন সলভ করো সম্পূর্ণ ফ্রিতে।"})]}),l.jsxs("button",{onClick:n,className:"text-gray-900 dark:text-white font-bold hover:text-primary mt-6 md:mt-0 flex items-center gap-2 group border-b-2 border-gray-200 dark:border-gray-700 hover:border-primary transition-all text-sm md:text-base pb-1",children:["প্রশ্ন ব্যাংক এক্সপ্লোর করুন ",l.jsx(rr,{size:16,className:"md:w-[18px] md:h-[18px] group-hover:translate-x-1 transition-transform"})]})]}),l.jsx(Zb,{})]})}),l.jsx("section",{className:"py-16 md:py-20 px-4 md:px-6",children:l.jsxs("div",{className:"max-w-5xl mx-auto bg-gradient-to-r from-primary to-blue-800 rounded-[2rem] md:rounded-[3rem] p-8 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-500/20",children:[l.jsx("div",{className:"absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"}),l.jsx("div",{className:"absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"}),l.jsx("div",{className:"absolute -bottom-24 -right-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"}),l.jsxs("div",{className:"relative z-10",children:[l.jsx("h2",{className:"text-3xl md:text-6xl font-extrabold mb-4 md:mb-6 tracking-tight",children:"দেরি করছো কেন?"}),l.jsx("p",{className:"text-base md:text-xl text-blue-100 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed",children:"হাজারো শিক্ষার্থী ইতিমধ্যে তাদের প্রস্তুতি শুরু করে দিয়েছে। তুমি কি পিছিয়ে থাকবে? আজই জয়েন করো ধ্রুবক পরিবারে।"}),l.jsxs("button",{onClick:n,className:"bg-white text-primary px-8 py-3.5 md:px-10 md:py-4 rounded-xl md:rounded-2xl font-bold text-lg md:text-xl hover:bg-blue-50 hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2 md:gap-3 mx-auto w-full sm:w-auto",children:[l.jsx(Vf,{size:20,className:"md:w-6 md:h-6"})," একাউন্ট তৈরি করুন"]})]})]})}),l.jsxs("footer",{className:"py-8 md:py-12 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-center",children:[l.jsxs("div",{className:"flex items-center justify-center gap-2 mb-4 md:mb-6 opacity-80",children:[l.jsx("div",{className:"h-7 w-7 md:h-8 md:w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm md:text-base",children:"ধ্রু"}),l.jsx("span",{className:"font-bold text-lg md:text-xl text-gray-800 dark:text-white",children:"ধ্রুবক"})]}),l.jsxs("div",{className:"flex flex-wrap justify-center gap-4 md:gap-6 mb-6 md:mb-8 text-sm text-gray-500",children:[l.jsx("a",{href:"#",className:"hover:text-primary transition-colors",children:"আমাদের সম্পর্কে"}),l.jsx("a",{href:"#",className:"hover:text-primary transition-colors",children:"কোর্সসমূহ"}),l.jsx("a",{href:"#",className:"hover:text-primary transition-colors",children:"যোগাযোগ"}),l.jsx("a",{href:"#",className:"hover:text-primary transition-colors",children:"প্রাইভেসি পলিসি"})]}),l.jsx("p",{className:"text-gray-400 text-xs md:text-sm",children:"© 2024 Dhrubok. Made with ❤️ for Students in Bangladesh."})]})]}),Hd=k.createContext(void 0),gE=()=>{const n=k.useContext(Hd);if(!n)throw new Error("useAdmin must be used within an AdminProvider");return n},ow="nurnaimsourav@gmail.com",aw=({children:n})=>{const{currentUser:e}=Pn(),[t,s]=k.useState([]),[r,o]=k.useState({totalRevenue:0,totalEnrollments:0,pendingRequests:0,activeUsers:0,totalQuestions:0,totalExams:0}),a=(e==null?void 0:e.email)===ow,c=async()=>{if(a)try{const[S,T]=await Promise.all([Wb(),Vb()]);s(S),T&&o({totalRevenue:T.totalRevenue,totalEnrollments:T.approvedEnrollments,pendingRequests:T.pendingPayments,activeUsers:T.totalUsers,totalQuestions:T.totalQuestions,totalExams:T.totalExams})}catch(S){console.error("Error fetching admin data:",S)}};k.useEffect(()=>{a&&c()},[a]);const u=async S=>{try{await Bb(S),a&&await c()}catch(T){throw console.error("Error submitting payment:",T),T}},f=async S=>{if(a)try{await uh(S,"APPROVED"),await c()}catch(T){console.error("Error approving:",T),alert("Failed to approve payment.")}},_=async S=>{if(a)try{await uh(S,"REJECTED"),await c()}catch(T){console.error("Error rejecting:",T)}},m=async S=>{if(a)try{await $b(S),await c()}catch(T){console.error("Error deleting:",T)}},b=async(S,T,R)=>{if(a)try{await Hb({title:S,message:T,type:R})}catch(A){throw console.error("Error sending notification:",A),A}};return l.jsx(Hd.Provider,{value:{paymentRequests:t,stats:r,submitPaymentRequest:u,approvePayment:f,rejectPayment:_,deletePaymentRequest:m,sendNotification:b,isAdmin:a,refreshRequests:c},children:n})},qd=k.createContext(void 0),lw=()=>{const n=k.useContext(qd);if(!n)throw new Error("useCache must be used within a CacheProvider");return n},cw=({children:n})=>{const e=k.useRef({}),t=k.useCallback((o,a)=>{e.current[o]=a},[]),s=k.useCallback(o=>e.current[o],[]),r=k.useCallback(o=>{delete e.current[o]},[]);return l.jsx(qd.Provider,{value:{setCache:t,getCache:s,clearCache:r},children:n})};var hw={};const fh=["gemini-2.5-flash-preview-09-2025","gemini-2.5-flash-lite"],uw=`তুমি হলে HSC পরীক্ষার প্রস্তুতিতে সাহায্য করার জন্য একজন অত্যন্ত জ্ঞানী, বন্ধুত্বপূর্ণ এবং স্মার্ট বড় ভাই (টিউটর)। তোমার সব উত্তর অবশ্যই নির্ভুল, সহজবোধ্য বাংলায় (বাংলা) দিতে হবে। তুমি সবসময় 'তুমি' করে সম্বোধন করবে এবং অনানুষ্ঠানিক, আন্তরিক ভাষায় কথা বলবে, যেন ছোট ভাই বা বন্ধুর সাথে কথা বলছো। তোমার লক্ষ্য হলো কঠিন বিষয়গুলো সরল ও সংক্ষিপ্তভাবে বোঝানো।

উত্তরগুলো অবশ্যই সংক্ষিপ্ত, সহজবোধ্য এবং শুধুমাত্র মূল ধারণার উপর মনোযোগ দিতে হবে। আউটপুট হবে শুধুমাত্র প্লেইন টেক্সট।

For ALL mathematical, physical, and chemical symbols/equations, ALWAYS use LaTeX syntax enclosed within single dollar signs ($). For example, use $\\vec{A} \\times \\vec{B}$ for vector product, $\\theta$ for theta, $\\frac{1}{2}$ for a half, and use subscripts/superscripts correctly (e.g., $H_2O$ for water). Ensure all LaTeX expressions are correctly formatted for MathJax rendering and appear INLINE within the text flow where needed.

You are ABSOLUTELY PROHIBITED from using ANY form of text formatting or structural Markdown symbols, including but not limited to: asterisks (*, **), hash symbols (#, ##, ###), pipe characters (|), lists (using * or -), or table markdown. ONLY use line breaks for paragraphs. Ensure the information is relevant to HSC subjects and use Google Search for accuracy and freshness.

**MCQ FEATURE:**
When you think a student needs practice or clarification on a topic, you can create an MCQ question. To do this, format your response with a special MCQ marker:

[MCQ_START]
Question: [Your question here]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct: [A/B/C/D]
Explanation: [Detailed explanation why the correct answer is right and why others are wrong]
[MCQ_END]

Use MCQs strategically when:
- Student seems confused about a concept
- After explaining a difficult topic to reinforce understanding
- Student asks for practice questions
- To check if student understood your explanation`,dw=()=>{const n=vs(),{getCache:e,setCache:t}=lw(),s="synapse_bot_state",r=e(s)||{},[o,a]=k.useState(r.messages||[]),[c,u]=k.useState(r.chatHistory||[]),[f,_]=k.useState(r.mcqStates||{}),[m,b]=k.useState(""),[S,T]=k.useState(!1),[R,A]=k.useState(null),[U,z]=k.useState(null),M=k.useRef(null),D=k.useRef(null);k.useEffect(()=>{t(s,{messages:o,chatHistory:c,mcqStates:f})},[o,c,f,t,s]),k.useEffect(()=>{L(),window.MathJax&&window.MathJax.typesetPromise&&setTimeout(()=>{const g=document.getElementById("synapse-chat-container");g&&window.MathJax.typesetPromise([g]).catch(j=>console.error("MathJax error:",j))},100)},[o,f]);const L=()=>{M.current&&M.current.scrollTo({top:M.current.scrollHeight,behavior:"smooth"})},J=g=>{const j=/\[MCQ_START\]([\s\S]*?)\[MCQ_END\]/g,W=[];let Q=0,de;for(;(de=j.exec(g))!==null;){de.index>Q&&W.push({type:"text",content:g.substring(Q,de.index)});const me=de[1].trim().split(`
`).map(Z=>Z.trim()).filter(Z=>Z),Ie={question:"",options:[],correct:"",explanation:""};me.forEach(Z=>{Z.startsWith("Question:")?Ie.question=Z.replace("Question:","").trim():/^[A-D]\)/.test(Z)?Ie.options.push({label:Z.charAt(0),text:Z.substring(2).trim()}):Z.startsWith("Correct:")?Ie.correct=Z.replace("Correct:","").trim():Z.startsWith("Explanation:")&&(Ie.explanation=Z.replace("Explanation:","").trim())}),W.push({type:"mcq",data:Ie}),Q=j.lastIndex}return Q<g.length&&W.push({type:"text",content:g.substring(Q)}),W},v=g=>{var W;const j=(W=g.target.files)==null?void 0:W[0];if(j){const Q=new FileReader;Q.onload=de=>{var me,Ie;const fe=((me=de.target)==null?void 0:me.result).split(",")[1];A({data:fe,mimeType:j.type}),z((Ie=de.target)==null?void 0:Ie.result)},Q.readAsDataURL(j)}},y=()=>{A(null),z(null),D.current&&(D.current.value="")},x=()=>{window.confirm("চ্যাট হিস্ট্রি মুছে ফেলতে চান?")&&(a([]),u([]),_({}),t(s,null))},w=(g,j,W,Q)=>{const de=`${g}_${j}`;if(f[de])return;const fe=W===Q;_(me=>({...me,[de]:{selected:W,isCorrect:fe}}))},E=async(g=0)=>{var fe,me,Ie;const j=m.trim();if(!j&&!R&&g===0)return;if(g===0){const Z={id:Date.now().toString(),role:"user",text:j,imageUrl:U||void 0};a(te=>[...te,Z]),T(!0),b("");const oe=document.querySelector("textarea");oe&&(oe.style.height="auto")}let W=[...c];if(g===0){const Z=[{text:j}];R&&Z.push({inlineData:{mimeType:R.mimeType,data:R.data}}),W.push({role:"user",parts:Z}),u(W),y()}const Q=fh[g],de=new Jf({apiKey:hw.API_KEY});try{console.log(`Attempting API call with Model: ${Q}`);const Z=await de.models.generateContent({model:Q,contents:W,config:{systemInstruction:uw,temperature:.2,tools:[{googleSearch:{}}]}}),oe=Z.text;if(oe){const te=[],Os=(Ie=(me=(fe=Z.candidates)==null?void 0:fe[0])==null?void 0:me.groundingMetadata)==null?void 0:Ie.groundingChunks;Os&&Os.forEach(Ue=>{Ue.web&&te.push({title:Ue.web.title,uri:Ue.web.uri})}),a(Ue=>[...Ue,{id:Date.now().toString(),role:"model",text:oe,sources:te.length>0?te:void 0}]),u(Ue=>[...Ue,{role:"model",parts:[{text:oe}]}]),T(!1)}else throw new Error("Empty response")}catch(Z){console.error(`Error with model ${Q}:`,Z),g<fh.length-1?(console.log("Switching to next model..."),await new Promise(oe=>setTimeout(oe,1e3)),E(g+1)):(a(oe=>[...oe,{id:Date.now().toString(),role:"model",text:"দুঃখিত, কোনো মডেলে উত্তর দেওয়া সম্ভব হয়নি। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।"}]),T(!1))}},I=g=>{b(g)};return l.jsxs("div",{className:"h-full flex flex-col bg-white dark:bg-gray-900 relative",children:[l.jsxs("div",{className:"px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 z-20 shadow-sm shrink-0",children:[l.jsxs("div",{className:"flex items-center gap-3",children:[l.jsx("button",{onClick:()=>n(-1),className:"p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors md:hidden",children:l.jsx(Eh,{size:20,className:"text-gray-600 dark:text-gray-300"})}),l.jsx("div",{className:"w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white shadow-md",children:l.jsx(hr,{size:20})}),l.jsxs("div",{children:[l.jsxs("h3",{className:"font-bold text-base md:text-lg text-gray-800 dark:text-white flex items-center gap-2",children:["Synapse AI ",l.jsx("span",{className:"px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-medium border border-emerald-200 dark:border-emerald-800",children:"BETA"})]}),l.jsx("p",{className:"text-xs text-gray-500 dark:text-gray-400 font-medium",children:"তোমার HSC পার্সোনাল টিউটর"})]})]}),l.jsx("div",{className:"flex items-center gap-1",children:l.jsx("button",{onClick:x,className:"p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors",title:"Clear Chat",children:l.jsx($f,{size:18})})})]}),l.jsxs("div",{id:"synapse-chat-container",ref:M,className:"flex-1 overflow-y-auto p-4 bg-gray-50/50 dark:bg-gray-900 scroll-smooth",children:[o.length===0&&l.jsxs("div",{className:"h-full flex flex-col items-center justify-center text-center p-6 opacity-0 animate-in fade-in zoom-in duration-500 delay-100",children:[l.jsx("div",{className:"w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-emerald-100 dark:border-gray-700",children:l.jsx(fr,{size:40,className:"text-emerald-500"})}),l.jsx("h2",{className:"text-xl font-bold text-gray-800 dark:text-white mb-2",children:"Synapse-এ স্বাগতম!"}),l.jsx("p",{className:"text-sm text-gray-500 dark:text-gray-400 max-w-[250px] leading-relaxed mb-8",children:"আমি তোমার গণিত, পদার্থবিদ্যা, রসায়ন এবং জীববিজ্ঞানের যেকোনো ডাউট সমাধান করতে পারি।"}),l.jsx("div",{className:"flex flex-wrap justify-center gap-2",children:["নিউটনের ৩য় সূত্র কী?","DNA এর গঠন","Organic Chemistry টিপস","Vector Math Solve"].map((g,j)=>l.jsx("button",{onClick:()=>I(g),className:"px-4 py-2 bg-white dark:bg-gray-800 border border-emerald-100 dark:border-gray-700 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm",children:g},j))})]}),o.map(g=>l.jsxs("div",{className:`mb-6 flex flex-col ${g.role==="user"?"ml-auto items-end max-w-[85%]":"mr-auto items-start max-w-full md:max-w-[85%]"}`,children:[g.imageUrl&&l.jsx("div",{className:"mb-2 p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm",children:l.jsx("img",{src:g.imageUrl,className:"max-w-[200px] max-h-[200px] rounded-lg object-cover",alt:"Upload"})}),l.jsx("div",{className:`px-4 py-3 rounded-2xl text-[13px] md:text-sm leading-relaxed shadow-sm ${g.role==="user"?"bg-emerald-500 text-white rounded-tr-none":"bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-none shadow-none p-0 w-full"}`,children:g.role==="user"?g.text:l.jsxs("div",{className:"font-tiro w-full",children:[J(g.text).map((j,W)=>{if(j.type==="text"){const Q=(j.content||"").replace(/\*\*(.*?)\*\*/g,'<strong class="font-bold text-gray-900 dark:text-white">$1</strong>').replace(/\n/g,"<br/>");return l.jsx("p",{className:"whitespace-pre-wrap mb-2 text-gray-700 dark:text-gray-300",dangerouslySetInnerHTML:{__html:Q}},W)}else if(j.type==="mcq"&&j.data){const Q=j.data,de=`${g.id}_${W}`,fe=f[de]||{selected:null};return l.jsxs("div",{className:"bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 my-3 shadow-sm",children:[l.jsx("p",{className:"font-bold text-gray-800 dark:text-white mb-3 border-b border-blue-200 dark:border-blue-800 pb-2 border-dashed",children:Q.question}),l.jsx("div",{className:"space-y-2",children:Q.options.map((me,Ie)=>{const Z=fe.selected===me.label,oe=me.label===Q.correct;let te="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20";return fe.selected&&(oe?te="bg-emerald-500 text-white border-emerald-600 shadow-md":Z?te="bg-red-100 text-red-700 border-red-200":te="opacity-60 grayscale bg-gray-100 dark:bg-gray-800"),l.jsxs("button",{onClick:()=>w(g.id,W,me.label,Q.correct),disabled:!!fe.selected,className:`w-full text-left p-3 rounded-lg border text-sm transition-all flex items-start gap-3 ${te}`,children:[l.jsxs("span",{className:"font-bold min-w-[20px]",children:[me.label,")"]}),l.jsx("span",{children:me.text}),fe.selected&&oe&&l.jsx(No,{size:16,className:"ml-auto"}),fe.selected&&Z&&!oe&&l.jsx(Hf,{size:16,className:"ml-auto"})]},Ie)})}),fe.selected&&l.jsxs("div",{className:"mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 border-l-4 border-emerald-500 rounded-r-lg text-xs md:text-sm text-emerald-800 dark:text-emerald-200 animate-in fade-in slide-in-from-top-2",children:[l.jsx("strong",{children:"ব্যাখ্যা:"})," ",Q.explanation]})]},W)}return null}),g.sources&&g.sources.length>0&&l.jsxs("div",{className:"mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50",children:[l.jsxs("p",{className:"text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1",children:[l.jsx(qf,{size:10})," তথ্যসূত্র:"]}),l.jsx("div",{className:"flex flex-wrap gap-2",children:g.sources.map((j,W)=>l.jsx("a",{href:j.uri,target:"_blank",rel:"noopener noreferrer",className:"px-2 py-1 bg-gray-50 dark:bg-gray-700/50 rounded-md text-[10px] text-emerald-600 hover:text-emerald-700 hover:underline truncate max-w-[150px] border border-gray-100 dark:border-gray-700",children:j.title},W))})]})]})})]},g.id)),S&&l.jsxs("div",{className:"flex items-center gap-2 mr-auto ml-2 mb-4",children:[l.jsx("div",{className:"w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-sm",children:l.jsx(ys,{size:16,className:"animate-spin text-emerald-500"})}),l.jsxs("div",{className:"flex space-x-1",children:[l.jsx("div",{className:"w-2 h-2 bg-emerald-400 rounded-full animate-bounce",style:{animationDelay:"0s"}}),l.jsx("div",{className:"w-2 h-2 bg-emerald-400 rounded-full animate-bounce",style:{animationDelay:"0.1s"}}),l.jsx("div",{className:"w-2 h-2 bg-emerald-400 rounded-full animate-bounce",style:{animationDelay:"0.2s"}})]})]})]}),l.jsxs("div",{className:"p-3 md:p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-20 shrink-0 relative",children:[U&&l.jsx("div",{className:"absolute bottom-full left-4 mb-2 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-2 z-30",children:l.jsxs("div",{className:"relative",children:[l.jsx("img",{src:U,className:"h-20 w-20 object-cover rounded-lg border border-gray-100 dark:border-gray-700",alt:"Preview"}),l.jsx("button",{onClick:y,className:"absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:bg-red-600 border-2 border-white dark:border-gray-800 transition-colors",children:l.jsx(So,{size:12})})]})}),l.jsxs("div",{className:"flex items-end gap-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-[24px] border border-gray-200 dark:border-gray-700 focus-within:ring-2 ring-emerald-500/20 focus-within:border-emerald-500 transition-all shadow-sm",children:[l.jsxs("label",{className:"p-3 text-gray-400 hover:text-emerald-500 cursor-pointer transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 shrink-0",children:[l.jsx(Gf,{size:22}),l.jsx("input",{ref:D,type:"file",accept:"image/*",className:"hidden",onChange:v})]}),l.jsx("textarea",{rows:1,value:m,onChange:g=>{b(g.target.value),g.target.style.height="auto",g.target.style.height=`${Math.min(g.target.scrollHeight,120)}px`},onKeyDown:g=>{g.key==="Enter"&&!g.shiftKey&&(g.preventDefault(),E())},placeholder:"আপনার প্রশ্ন লিখুন...",className:"flex-1 bg-transparent border-none focus:ring-0 text-sm md:text-base text-gray-800 dark:text-white placeholder-gray-400 font-medium py-3 resize-none max-h-[120px]",autoComplete:"off"}),l.jsx("button",{onClick:()=>E(),disabled:S||!m.trim()&&!R,className:`p-3 rounded-full shadow-md transition-all active:scale-95 shrink-0 ${S||!m.trim()&&!R?"bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed":"bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg"}`,children:S?l.jsx(Kf,{size:20,className:"animate-pulse"}):l.jsx(Yf,{size:20,className:"ml-0.5"})})]})]})]})},Gd=k.createContext(void 0),fw=()=>{const n=k.useContext(Gd);if(!n)throw new Error("useToast must be used within a ToastProvider");return n},pw=({children:n})=>{const[e,t]=k.useState([]),s=k.useCallback((o,a="info")=>{const c=Date.now().toString()+Math.random().toString();t(u=>[...u,{id:c,message:o,type:a}])},[]),r=k.useCallback(o=>{t(a=>a.filter(c=>c.id!==o))},[]);return l.jsxs(Gd.Provider,{value:{showToast:s},children:[n,l.jsx("div",{className:"fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none max-w-sm w-full p-4 md:p-0",children:e.map(o=>l.jsx(mw,{toast:o,onRemove:r},o.id))})]})},mw=({toast:n,onRemove:e})=>{k.useEffect(()=>{const r=setTimeout(()=>{e(n.id)},4e3);return()=>clearTimeout(r)},[n.id,e]);const t={success:"bg-white dark:bg-gray-800 border-l-4 border-green-500 shadow-lg shadow-green-500/10",error:"bg-white dark:bg-gray-800 border-l-4 border-red-500 shadow-lg shadow-red-500/10",warning:"bg-white dark:bg-gray-800 border-l-4 border-yellow-500 shadow-lg shadow-yellow-500/10",info:"bg-white dark:bg-gray-800 border-l-4 border-blue-500 shadow-lg shadow-blue-500/10"},s={success:l.jsx(Xf,{className:"text-green-500",size:20}),error:l.jsx(Qf,{className:"text-red-500",size:20}),warning:l.jsx(vh,{className:"text-yellow-500",size:20}),info:l.jsx(yh,{className:"text-blue-500",size:20})};return l.jsxs("div",{className:`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border border-gray-100 dark:border-gray-700 transition-all duration-500 animate-in slide-in-from-right-full ${t[n.type]}`,children:[l.jsx("div",{className:"shrink-0 mt-0.5",children:s[n.type]}),l.jsx("div",{className:"flex-1",children:l.jsx("p",{className:"text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug font-sans",children:n.message})}),l.jsx("button",{onClick:()=>e(n.id),className:"text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors",children:l.jsx(So,{size:16})})]})},gw=[{id:"Medical",label:"মেডিকেল",sub:"MBBS/BDS",icon:"🩺",color:"bg-green-50 border-green-200 text-green-700"},{id:"Engineering",label:"ইঞ্জিনিয়ারিং",sub:"BUET/CKRUET",icon:"⚙️",color:"bg-blue-50 border-blue-200 text-blue-700"},{id:"University",label:"ভার্সিটি (ক)",sub:"DU/JU/RU",icon:"🎓",color:"bg-orange-50 border-orange-200 text-orange-700"},{id:"Guccho",label:"গুচ্ছ (GST)",sub:"Science Unit",icon:"📚",color:"bg-purple-50 border-purple-200 text-purple-700"}],ph=[{id:"2-4",label:"২-৪ ঘণ্টা",sub:"ব্যাস্ত শিডিউল"},{id:"4-6",label:"৪-৬ ঘণ্টা",sub:"স্ট্যান্ডার্ড"},{id:"6-8",label:"৬-৮ ঘণ্টা",sub:"সিরিয়াস"},{id:"8+",label:"৮+ ঘণ্টা",sub:"হার্ডকোর"}],_w=()=>{var J;const{currentUser:n,updateUserProfile:e,extendedProfile:t}=Pn(),{showToast:s}=fw(),[r,o]=k.useState(1),[a,c]=k.useState(!1),[u,f]=k.useState(""),[_,m]=k.useState("HSC-24"),[b,S]=k.useState("Bangla"),[T,R]=k.useState(""),[A,U]=k.useState("4-6");k.useEffect(()=>{t&&(f(t.college||""),m(t.hscBatch||"HSC-24"),R(t.target||""),S(t.version||"Bangla"),U(t.dailyStudyGoal||"4-6"))},[t]);const z=()=>{if(r===1){if(!u.trim()){s("কলেজের নাম আবশ্যক","warning");return}o(v=>v+1)}},M=async()=>{if(!T){s("অনুগ্রহ করে একটি টার্গেট সিলেক্ট করুন","warning");return}c(!0);try{await e((n==null?void 0:n.displayName)||"User",(n==null?void 0:n.photoURL)||"",{college:u,hscBatch:_,target:T,version:b,dailyStudyGoal:A,department:"Science"}),s("প্রোফাইল সেটআপ সম্পন্ন! 🎉","success")}catch(v){console.error(v),s("সেভ করতে সমস্যা হয়েছে","error")}finally{c(!1)}},D=2,L=r/D*100;return l.jsx("div",{className:"fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/95 backdrop-blur-md animate-in fade-in duration-500",children:l.jsxs("div",{className:"bg-white dark:bg-gray-900 w-full max-w-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative flex flex-col max-h-[90vh]",children:[l.jsx("div",{className:"absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"}),l.jsx("div",{className:"absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"}),l.jsxs("div",{className:"px-8 pt-8 pb-4 flex justify-between items-center relative z-10",children:[l.jsxs("div",{children:[l.jsxs("h1",{className:"text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2",children:[r===1&&"একাডেমিক তথ্য",r===2&&"লক্ষ্য নির্ধারণ"]}),l.jsxs("p",{className:"text-sm text-gray-500 dark:text-gray-400 mt-1",children:[r===1&&"আমরা আপনার সিলেবাস কাস্টমাইজ করব",r===2&&"আপনার প্রস্তুতি হোক গোছানো"]})]}),l.jsxs("div",{className:"relative w-14 h-14 flex items-center justify-center",children:[l.jsxs("svg",{className:"w-full h-full transform -rotate-90",children:[l.jsx("circle",{cx:"28",cy:"28",r:"24",stroke:"currentColor",strokeWidth:"4",fill:"transparent",className:"text-gray-100 dark:text-gray-800"}),l.jsx("circle",{cx:"28",cy:"28",r:"24",stroke:"currentColor",strokeWidth:"4",fill:"transparent",strokeDasharray:150.8,strokeDashoffset:150.8-150.8*L/100,className:"text-primary transition-all duration-500",strokeLinecap:"round"})]}),l.jsxs("span",{className:"absolute text-xs font-bold text-primary",children:[r,"/",D]})]})]}),l.jsxs("div",{className:"px-8 py-4 overflow-y-auto custom-scrollbar flex-1 relative z-10",children:[r===1&&l.jsxs("div",{className:"space-y-6 animate-in slide-in-from-right-8 duration-300",children:[l.jsxs("div",{className:"space-y-4",children:[l.jsxs("div",{children:[l.jsxs("label",{className:"block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-2",children:[l.jsx(Fr,{size:14,className:"text-primary"})," কলেজ / প্রতিষ্ঠান"]}),l.jsx("input",{type:"text",value:u,onChange:v=>f(v.target.value),className:"w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-medium shadow-sm",placeholder:"আপনার কলেজের নাম (যেমন: ঢাকা কলেজ)",autoFocus:!0})]}),l.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[l.jsxs("div",{children:[l.jsxs("label",{className:"block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-2",children:[l.jsx(Zf,{size:14,className:"text-primary"})," ব্যাচ (Batch)"]}),l.jsxs("div",{className:"relative",children:[l.jsxs("select",{value:_,onChange:v=>m(v.target.value),className:"w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-medium appearance-none",children:[l.jsx("option",{value:"HSC-24",children:"HSC-24"}),l.jsx("option",{value:"HSC-25",children:"HSC-25"}),l.jsx("option",{value:"HSC-26",children:"HSC-26"})]}),l.jsx("div",{className:"absolute right-4 top-3.5 pointer-events-none text-gray-400",children:"▼"})]})]}),l.jsxs("div",{children:[l.jsxs("label",{className:"block text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider flex items-center gap-2",children:[l.jsx(ep,{size:14,className:"text-primary"})," ভার্সন (Version)"]}),l.jsx("div",{className:"flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl",children:["Bangla","English"].map(v=>l.jsx("button",{onClick:()=>S(v),className:`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${b===v?"bg-white dark:bg-gray-700 shadow text-primary":"text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`,children:v},v))})]})]})]}),l.jsx("div",{className:"p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50",children:l.jsxs("div",{className:"flex gap-3",children:[l.jsx("div",{className:"w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0",children:l.jsx(fr,{size:18})}),l.jsxs("div",{children:[l.jsx("h4",{className:"text-sm font-bold text-gray-800 dark:text-white",children:"সায়েন্স স্পেশালিস্ট"}),l.jsx("p",{className:"text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed",children:"ধ্রুবক বর্তমানে শুধুমাত্র বিজ্ঞান বিভাগের শিক্ষার্থীদের জন্য অপ্টিমাইজড। আপনার সিলেবাস স্বয়ংক্রিয়ভাবে সেট করা হবে।"})]})]})})]}),r===2&&l.jsxs("div",{className:"space-y-6 animate-in slide-in-from-right-8 duration-300",children:[l.jsxs("div",{children:[l.jsx("label",{className:"block text-xs font-bold text-gray-600 dark:text-gray-300 mb-3 uppercase tracking-wider",children:"আপনার প্রধান লক্ষ্য (Primary Target)"}),l.jsx("div",{className:"grid grid-cols-2 gap-3",children:gw.map(v=>l.jsxs("button",{onClick:()=>R(v.id),className:`relative p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${T===v.id?`${v.color} border-current shadow-md`:"bg-gray-50 dark:bg-gray-800 border-transparent hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm text-gray-500 dark:text-gray-400"}`,children:[l.jsx("div",{className:"text-2xl mb-2",children:v.icon}),l.jsx("h4",{className:"font-bold text-sm",children:v.label}),l.jsx("p",{className:"text-[10px] opacity-70 font-bold uppercase mt-1",children:v.sub}),T===v.id&&l.jsx("div",{className:"absolute top-3 right-3 bg-white/20 p-1 rounded-full",children:l.jsx(No,{size:14,className:"fill-current text-white"})})]},v.id))})]}),l.jsxs("div",{children:[l.jsxs("label",{className:"block text-xs font-bold text-gray-600 dark:text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2",children:[l.jsx(wh,{size:14,className:"text-primary"})," দৈনিক পড়ার লক্ষ্য (Daily Goal)"]}),l.jsx("div",{className:"grid grid-cols-4 gap-2",children:ph.map(v=>l.jsx("button",{onClick:()=>U(v.id),className:`py-2 rounded-xl border-2 text-xs font-bold transition-all ${A===v.id?"border-primary bg-primary text-white":"border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"}`,children:v.label},v.id))}),l.jsxs("p",{className:"text-[10px] text-center mt-2 text-gray-400",children:[(J=ph.find(v=>v.id===A))==null?void 0:J.sub," মোড সিলেক্টেড"]})]})]})]}),l.jsxs("div",{className:"p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-4 relative z-20",children:[r>1&&l.jsx("button",{onClick:()=>o(v=>v-1),className:"px-6 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",children:"পেছনে"}),r<D?l.jsxs("button",{onClick:z,className:"flex-1 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95",children:["পরবর্তী ",l.jsx(Yi,{size:18})]}):l.jsx("button",{onClick:M,disabled:a,className:"flex-1 py-3.5 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5",children:a?l.jsx(ys,{className:"animate-spin"}):l.jsxs(l.Fragment,{children:["যাত্রা শুরু করুন ",l.jsx(fr,{size:18,className:"fill-yellow-400 text-yellow-400 animate-pulse"})]})})]})]})})},yw=_e.lazy(()=>Se(()=>import("./HomeDashboard-B9cKDY3a.js"),__vite__mapDeps([0,1,2]))),vw=_e.lazy(()=>Se(()=>import("./QuizArena-B4FmuOEr.js"),__vite__mapDeps([3,1,4,5,2]))),xw=_e.lazy(()=>Se(()=>import("./ExamPage-0yn__30U.js"),__vite__mapDeps([6,1,2]))),bw=_e.lazy(()=>Se(()=>import("./AdmissionSearch-00KqjJmv.js"),__vite__mapDeps([7,1,4]))),ww=_e.lazy(()=>Se(()=>import("./StudyTracker-I0Ls_pxJ.js"),__vite__mapDeps([8,1,2]))),Ew=_e.lazy(()=>Se(()=>import("./QuizBattlePrototype-D_vf7Pef.js"),__vite__mapDeps([9,1,5,10,2]))),Iw=_e.lazy(()=>Se(()=>import("./CourseSection-DqU2HkJr.js"),__vite__mapDeps([11,1,2])));_e.lazy(()=>Se(()=>import("./ExamPackSection-CNJ7m_Kv.js"),__vite__mapDeps([12,1,2])));const Cw=_e.lazy(()=>Se(()=>import("./QuestionBank-DupAjeAc.js"),__vite__mapDeps([13,1,5,2]))),mh=_e.lazy(()=>Se(()=>import("./ProfilePage-Osc1OscL.js"),__vite__mapDeps([14,1,2]))),Tw=_e.lazy(()=>Se(()=>import("./AdminPage-BI-N3vfC.js"),__vite__mapDeps([15,1,4,5,2]))),kw=_e.lazy(()=>Se(()=>import("./LeaderboardPage-DqXW_24t.js"),__vite__mapDeps([16,1,2]))),Sw=_e.lazy(()=>Se(()=>import("./DailyChallengePage-2XwQOMA9.js"),__vite__mapDeps([17,1,10,2]))),Nw=_e.lazy(()=>Se(()=>import("./ExamHub-DFXXNA-5.js"),__vite__mapDeps([18,1,2]))),Aw=_e.lazy(()=>Se(()=>import("./GSTCoursePage-DYJB1tBN.js"),__vite__mapDeps([19,1,2]))),Rw=_e.lazy(()=>Se(()=>import("./PaymentPage-KVhr4j_q.js"),__vite__mapDeps([20,1,2]))),Pw=()=>l.jsxs("div",{className:"h-full w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-400",children:[l.jsx(ys,{size:40,className:"animate-spin text-primary mb-4"}),l.jsx("p",{className:"text-xs font-bold tracking-wider",children:"লোড হচ্ছে..."})]}),jw=({themeMode:n,toggleTheme:e,children:t})=>{const[s,r]=k.useState(!1),[o,a]=k.useState(!1),c=Xt(),u=vs(),{currentUser:f,isProfileComplete:_,profileLoading:m,userAvatar:b}=Pn(),[S,T]=k.useState([]),[R,A]=k.useState(new Set);k.useEffect(()=>{const y=localStorage.getItem("read_notifications_v2");if(y)try{A(new Set(JSON.parse(y)))}catch{console.error("Failed to parse read notifications")}},[]),k.useEffect(()=>{localStorage.setItem("read_notifications_v2",JSON.stringify(Array.from(R)))},[R]),k.useEffect(()=>{if(!f)return;const y=async()=>{try{const E=(await qb()).filter(I=>!I.target||I.target==="ALL"||I.target===f.uid);E.sort((I,g)=>g.date-I.date),T(E)}catch(w){console.error("Error loading notifications:",w)}};y();const x=setInterval(y,6e4);return()=>clearInterval(x)},[f]);const U=S.filter(y=>!R.has(y.id)).length,z=c.pathname.startsWith("/exam/"),M=c.pathname.startsWith("/payment"),D=c.pathname==="/dashboard",L=y=>{if(y.startsWith("/profile/"))return"প্রোফাইল";if(y.startsWith("/exam/"))return"পরীক্ষা চলছে";if(y.startsWith("/payment"))return"পেমেন্ট";if(y.startsWith("/battle"))return"ব্যাটল অ্যারেনা";switch(y){case"/dashboard":return"ধ্রুবক";case"/exams":return"এক্সাম জোন";case"/quiz":return"কুইজ জোন";case"/admission":return"ভর্তি তথ্য";case"/tracker":return"রুটিন";case"/courses":return"কোর্সসমূহ";case"/qbank":return"প্রশ্ন ব্যাংক";case"/profile":return"প্রোফাইল";case"/admin":return"অ্যাডমিন";case"/leaderboard":return"লিডারবোর্ড";case"/challenges":return"চ্যালেঞ্জ";case"/bot":return"Synapse AI";case"/gst-special":return"GST চ্যালেঞ্জ";default:return"ধ্রুবক"}},J=()=>{u(-1)},v=z||M;return l.jsxs("div",{className:"flex h-[100dvh] bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-200 text-gray-900 dark:text-gray-100",children:[!m&&!_&&l.jsx(_w,{}),!v&&l.jsx(Jb,{isMobileMenuOpen:s,setIsMobileMenuOpen:r,themeMode:n,toggleTheme:e,notifications:S,readNotificationIds:R,setReadNotificationIds:A,isNotificationOpen:o,setIsNotificationOpen:a}),l.jsxs("div",{className:"flex-1 flex flex-col h-full overflow-hidden relative",children:[!v&&l.jsxs("div",{className:"md:hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between transition-colors z-[60]",children:[l.jsxs("div",{className:"flex items-center gap-3",children:[D?l.jsx("div",{className:"h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-sm",children:l.jsx(tp,{size:18})}):l.jsx("button",{onClick:J,className:"p-1.5 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",children:l.jsx(Eh,{size:22,className:"text-gray-600 dark:text-gray-300"})}),l.jsx("span",{className:"font-bold text-gray-800 dark:text-white text-lg tracking-tight",children:L(c.pathname)})]}),l.jsxs("div",{className:"flex items-center gap-2",children:[l.jsxs("button",{onClick:()=>a(!0),className:"p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors relative","aria-label":"Notifications",children:[l.jsx(Ki,{size:24}),U>0&&l.jsx("span",{className:"absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800 animate-pulse"})]}),l.jsx("button",{onClick:()=>r(!0),className:"p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors","aria-label":"Menu",children:l.jsx(np,{size:24})})]})]}),l.jsx("main",{className:`flex-1 overflow-hidden transition-colors relative ${v?"p-0":"p-0 pb-20 md:p-6 md:pb-6"}`,children:l.jsx(k.Suspense,{fallback:l.jsx(Pw,{}),children:t})})]})]})},Ow=()=>{const{currentUser:n,loading:e}=Pn(),[t,s]=k.useState(()=>typeof window<"u"&&localStorage.getItem("themeMode")||"system");k.useEffect(()=>{const o=()=>{const u=window.matchMedia("(prefers-color-scheme: dark)").matches;t==="dark"||t==="system"&&u?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark")};o(),localStorage.setItem("themeMode",t);const a=window.matchMedia("(prefers-color-scheme: dark)"),c=()=>{t==="system"&&o()};return a.addEventListener("change",c),()=>a.removeEventListener("change",c)},[t]);const r=()=>{s(o=>o==="light"?"dark":o==="dark"?"system":"light")};return e?l.jsx("div",{className:"h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-primary",children:l.jsx(ys,{size:48,className:"animate-spin"})}):l.jsx(Yb,{children:l.jsx(aw,{children:l.jsx(sm,{children:l.jsxs($l,{children:[l.jsx(le,{path:"/",element:n?l.jsx(Qs,{to:"/dashboard"}):l.jsx(iw,{onLoginClick:()=>window.location.hash="#/auth"})}),l.jsx(le,{path:"/auth",element:n?l.jsx(Qs,{to:"/dashboard"}):l.jsx(Qb,{onBack:()=>window.location.hash="#/"})}),l.jsx(le,{path:"/*",element:n?l.jsx(jw,{themeMode:t,toggleTheme:r,children:l.jsxs($l,{children:[l.jsx(le,{path:"/dashboard",element:l.jsx(yw,{})}),l.jsx(le,{path:"/courses",element:l.jsx(Iw,{})}),l.jsx(le,{path:"/qbank",element:l.jsx(Cw,{})}),l.jsx(le,{path:"/exams",element:l.jsx(Nw,{})}),l.jsx(le,{path:"/quiz",element:l.jsx(vw,{})}),l.jsx(le,{path:"/exam/:examId",element:l.jsx(xw,{})}),l.jsx(le,{path:"/battle",element:l.jsx(Ew,{})}),l.jsx(le,{path:"/leaderboard",element:l.jsx(kw,{})}),l.jsx(le,{path:"/tracker",element:l.jsx(ww,{})}),l.jsx(le,{path:"/admission",element:l.jsx(bw,{})}),l.jsx(le,{path:"/profile",element:l.jsx(mh,{})}),l.jsx(le,{path:"/profile/:userId",element:l.jsx(mh,{})}),l.jsx(le,{path:"/admin",element:l.jsx(Tw,{})}),l.jsx(le,{path:"/challenges",element:l.jsx(Sw,{openSynapse:()=>{}})}),l.jsx(le,{path:"/bot",element:l.jsx(dw,{})}),l.jsx(le,{path:"/gst-special",element:l.jsx(Aw,{})}),l.jsx(le,{path:"/payment",element:l.jsx(Rw,{})}),l.jsx(le,{path:"*",element:l.jsx(Qs,{to:"/dashboard"})})]})}):l.jsx(Qs,{to:"/auth"})})]})})})})},Kd=document.getElementById("root");if(!Kd)throw new Error("Could not find root element to mount to");const Dw=Ji.createRoot(Kd);Dw.render(l.jsx(_e.StrictMode,{children:l.jsx(Gb,{children:l.jsx(cw,{children:l.jsx(pw,{children:l.jsx(Ow,{})})})})}));export{Hw as A,yb as B,Ww as C,Io as D,$w as E,Hb as F,mE as G,lE as H,iE as I,Xw as J,sE as K,oE as L,Zw as M,gE as N,cE as O,dE as P,hE as Q,Kw as R,Pn as a,$d as b,lw as c,tE as d,Xt as e,zb as f,fw as g,pE as h,fE as i,Uw as j,Yw as k,Gw as l,eE as m,Jw as n,uE as o,rE as p,nE as q,Qw as r,aE as s,Fw as t,vs as u,xb as v,Vw as w,Bw as x,qw as y,zw as z};

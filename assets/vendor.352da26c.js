function l(){}function j(t){return t()}function z(){return Object.create(null)}function m(t){t.forEach(j)}function C(t){return typeof t=="function"}function F(t,e){return t!=t?e==e:t!==e||t&&typeof t=="object"||typeof t=="function"}let $;function tt(t,e){return $||($=document.createElement("a")),$.href=e,t===$.href}function I(t){return Object.keys(t).length===0}function k(t,...e){if(t==null)return l;const n=t.subscribe(...e);return n.unsubscribe?()=>n.unsubscribe():n}function et(t){let e;return k(t,n=>e=n)(),e}function nt(t,e,n){t.$$.on_destroy.push(k(e,n))}function st(t,e,n){return t.set(n),e}function rt(t,e){t.appendChild(e)}function P(t,e,n){t.insertBefore(e,n||null)}function L(t){t.parentNode.removeChild(t)}function ot(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function D(t){return document.createElement(t)}function ut(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function T(t){return document.createTextNode(t)}function it(){return T(" ")}function ct(){return T("")}function ft(t,e,n,r){return t.addEventListener(e,n,r),()=>t.removeEventListener(e,n,r)}function at(t,e,n){n==null?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function G(t){return Array.from(t.childNodes)}function lt(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function dt(t,e){t.value=e==null?"":e}function ht(t,e,n,r){t.style.setProperty(e,n,r?"important":"")}function _t(t,e){for(let n=0;n<t.options.length;n+=1){const r=t.options[n];if(r.__value===e){r.selected=!0;return}}t.selectedIndex=-1}function pt(t){const e=t.querySelector(":checked")||t.options[0];return e&&e.__value}class mt{constructor(){this.e=this.n=null}c(e){this.h(e)}m(e,n,r=null){this.e||(this.e=D(n.nodeName),this.t=n,this.c(e)),this.i(r)}h(e){this.e.innerHTML=e,this.n=Array.from(this.e.childNodes)}i(e){for(let n=0;n<this.n.length;n+=1)P(this.t,this.n[n],e)}p(e){this.d(),this.h(e),this.i(this.a)}d(){this.n.forEach(L)}}let x;function w(t){x=t}function J(){if(!x)throw new Error("Function called outside component initialization");return x}function gt(t){J().$$.on_mount.push(t)}const b=[],H=[],v=[],M=[],K=Promise.resolve();let A=!1;function Q(){A||(A=!0,K.then(O))}function S(t){v.push(t)}let q=!1;const N=new Set;function O(){if(!q){q=!0;do{for(let t=0;t<b.length;t+=1){const e=b[t];w(e),R(e.$$)}for(w(null),b.length=0;H.length;)H.pop()();for(let t=0;t<v.length;t+=1){const e=v[t];N.has(e)||(N.add(e),e())}v.length=0}while(b.length);for(;M.length;)M.pop()();A=!1,q=!1,N.clear()}}function R(t){if(t.fragment!==null){t.update(),m(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(S)}}const E=new Set;let h;function bt(){h={r:0,c:[],p:h}}function yt(){h.r||m(h.c),h=h.p}function U(t,e){t&&t.i&&(E.delete(t),t.i(e))}function $t(t,e,n,r){if(t&&t.o){if(E.has(t))return;E.add(t),h.c.push(()=>{E.delete(t),r&&(n&&t.d(1),r())}),t.o(e)}}function xt(t){t&&t.c()}function V(t,e,n,r){const{fragment:u,on_mount:d,on_destroy:f,after_update:i}=t.$$;u&&u.m(e,n),r||S(()=>{const o=d.map(j).filter(C);f?f.push(...o):m(o),t.$$.on_mount=[]}),i.forEach(S)}function W(t,e){const n=t.$$;n.fragment!==null&&(m(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function X(t,e){t.$$.dirty[0]===-1&&(b.push(t),Q(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function wt(t,e,n,r,u,d,f,i=[-1]){const o=x;w(t);const s=t.$$={fragment:null,ctx:null,props:d,update:l,not_equal:u,bound:z(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(o?o.$$.context:[])),callbacks:z(),dirty:i,skip_bound:!1,root:e.target||o.$$.root};f&&f(s.root);let _=!1;if(s.ctx=n?n(t,e.props||{},(c,y,...a)=>{const p=a.length?a[0]:y;return s.ctx&&u(s.ctx[c],s.ctx[c]=p)&&(!s.skip_bound&&s.bound[c]&&s.bound[c](p),_&&X(t,c)),y}):[],s.update(),_=!0,m(s.before_update),s.fragment=r?r(s.ctx):!1,e.target){if(e.hydrate){const c=G(e.target);s.fragment&&s.fragment.l(c),c.forEach(L)}else s.fragment&&s.fragment.c();e.intro&&U(t.$$.fragment),V(t,e.target,e.anchor,e.customElement),O()}w(o)}class vt{$destroy(){W(this,1),this.$destroy=l}$on(e,n){const r=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return r.push(n),()=>{const u=r.indexOf(n);u!==-1&&r.splice(u,1)}}$set(e){this.$$set&&!I(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}const g=[];function Y(t,e){return{subscribe:Z(t,e).subscribe}}function Z(t,e=l){let n;const r=new Set;function u(i){if(F(t,i)&&(t=i,n)){const o=!g.length;for(const s of r)s[1](),g.push(s,t);if(o){for(let s=0;s<g.length;s+=2)g[s][0](g[s+1]);g.length=0}}}function d(i){u(i(t))}function f(i,o=l){const s=[i,o];return r.add(s),r.size===1&&(n=e(u)||l),i(t),()=>{r.delete(s),r.size===0&&(n(),n=null)}}return{set:u,update:d,subscribe:f}}function Et(t,e,n){const r=!Array.isArray(t),u=r?[t]:t,d=e.length<2;return Y(n,f=>{let i=!1;const o=[];let s=0,_=l;const c=()=>{if(s)return;_();const a=e(r?o[0]:o,f);d?f(a):_=C(a)?a:l},y=u.map((a,p)=>k(a,B=>{o[p]=B,s&=~(1<<p),i&&c()},()=>{s|=1<<p}));return i=!0,c(),function(){m(y),_()}})}export{m as A,nt as B,gt as C,st as D,pt as E,bt as F,yt as G,dt as H,H as I,ct as J,tt as K,mt as L,vt as S,ut as a,at as b,ht as c,Et as d,P as e,rt as f,et as g,L as h,wt as i,D as j,it as k,lt as l,xt as m,l as n,S as o,_t as p,V as q,Y as r,F as s,T as t,ft as u,U as v,Z as w,$t as x,ot as y,W as z};

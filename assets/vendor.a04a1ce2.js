function l(){}function z(t){return t()}function C(){return Object.create(null)}function m(t){t.forEach(z)}function N(t){return typeof t=="function"}function L(t,e){return t!=t?e==e:t!==e||t&&typeof t=="object"||typeof t=="function"}let w;function Y(t,e){return w||(w=document.createElement("a")),w.href=e,t===w.href}function M(t){return Object.keys(t).length===0}function A(t,...e){if(t==null)return l;const n=t.subscribe(...e);return n.unsubscribe?()=>n.unsubscribe():n}function Z(t){let e;return A(t,n=>e=n)(),e}function tt(t,e,n){t.$$.on_destroy.push(A(e,n))}function et(t,e,n){return t.set(n),e}function nt(t,e){t.appendChild(e)}function rt(t,e,n){t.insertBefore(e,n||null)}function T(t){t.parentNode.removeChild(t)}function st(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function ot(t){return document.createElement(t)}function ut(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function O(t){return document.createTextNode(t)}function ct(){return O(" ")}function it(){return O("")}function ft(t,e,n,s){return t.addEventListener(e,n,s),()=>t.removeEventListener(e,n,s)}function at(t,e,n){n==null?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function D(t){return Array.from(t.childNodes)}function lt(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function dt(t,e){t.value=e==null?"":e}function _t(t,e,n,s){n===null?t.style.removeProperty(e):t.style.setProperty(e,n,s?"important":"")}function ht(t,e){for(let n=0;n<t.options.length;n+=1){const s=t.options[n];if(s.__value===e){s.selected=!0;return}}t.selectedIndex=-1}function pt(t){const e=t.querySelector(":checked")||t.options[0];return e&&e.__value}let b;function y(t){b=t}function G(){if(!b)throw new Error("Function called outside component initialization");return b}function mt(t){G().$$.on_mount.push(t)}const $=[],P=[],v=[],B=[],H=Promise.resolve();let S=!1;function J(){S||(S=!0,H.then(F))}function q(t){v.push(t)}const j=new Set;let E=0;function F(){const t=b;do{for(;E<$.length;){const e=$[E];E++,y(e),K(e.$$)}for(y(null),$.length=0,E=0;P.length;)P.pop()();for(let e=0;e<v.length;e+=1){const n=v[e];j.has(n)||(j.add(n),n())}v.length=0}while($.length);for(;B.length;)B.pop()();S=!1,j.clear(),y(t)}function K(t){if(t.fragment!==null){t.update(),m(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(q)}}const k=new Set;let _;function gt(){_={r:0,c:[],p:_}}function bt(){_.r||m(_.c),_=_.p}function Q(t,e){t&&t.i&&(k.delete(t),t.i(e))}function yt(t,e,n,s){if(t&&t.o){if(k.has(t))return;k.add(t),_.c.push(()=>{k.delete(t),s&&(n&&t.d(1),s())}),t.o(e)}}function $t(t){t&&t.c()}function R(t,e,n,s){const{fragment:u,on_mount:d,on_destroy:f,after_update:c}=t.$$;u&&u.m(e,n),s||q(()=>{const o=d.map(z).filter(N);f?f.push(...o):m(o),t.$$.on_mount=[]}),c.forEach(q)}function U(t,e){const n=t.$$;n.fragment!==null&&(m(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function V(t,e){t.$$.dirty[0]===-1&&($.push(t),J(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function xt(t,e,n,s,u,d,f,c=[-1]){const o=b;y(t);const r=t.$$={fragment:null,ctx:null,props:d,update:l,not_equal:u,bound:C(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(o?o.$$.context:[])),callbacks:C(),dirty:c,skip_bound:!1,root:e.target||o.$$.root};f&&f(r.root);let h=!1;if(r.ctx=n?n(t,e.props||{},(i,x,...a)=>{const p=a.length?a[0]:x;return r.ctx&&u(r.ctx[i],r.ctx[i]=p)&&(!r.skip_bound&&r.bound[i]&&r.bound[i](p),h&&V(t,i)),x}):[],r.update(),h=!0,m(r.before_update),r.fragment=s?s(r.ctx):!1,e.target){if(e.hydrate){const i=D(e.target);r.fragment&&r.fragment.l(i),i.forEach(T)}else r.fragment&&r.fragment.c();e.intro&&Q(t.$$.fragment),R(t,e.target,e.anchor,e.customElement),F()}y(o)}class wt{$destroy(){U(this,1),this.$destroy=l}$on(e,n){const s=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return s.push(n),()=>{const u=s.indexOf(n);u!==-1&&s.splice(u,1)}}$set(e){this.$$set&&!M(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}const g=[];function W(t,e){return{subscribe:X(t,e).subscribe}}function X(t,e=l){let n;const s=new Set;function u(c){if(L(t,c)&&(t=c,n)){const o=!g.length;for(const r of s)r[1](),g.push(r,t);if(o){for(let r=0;r<g.length;r+=2)g[r][0](g[r+1]);g.length=0}}}function d(c){u(c(t))}function f(c,o=l){const r=[c,o];return s.add(r),s.size===1&&(n=e(u)||l),c(t),()=>{s.delete(r),s.size===0&&(n(),n=null)}}return{set:u,update:d,subscribe:f}}function vt(t,e,n){const s=!Array.isArray(t),u=s?[t]:t,d=e.length<2;return W(n,f=>{let c=!1;const o=[];let r=0,h=l;const i=()=>{if(r)return;h();const a=e(s?o[0]:o,f);d?f(a):h=N(a)?a:l},x=u.map((a,p)=>A(a,I=>{o[p]=I,r&=~(1<<p),c&&i()},()=>{r|=1<<p}));return c=!0,i(),function(){m(x),h()}})}export{m as A,tt as B,mt as C,et as D,pt as E,gt as F,bt as G,dt as H,P as I,it as J,Y as K,wt as S,ut as a,at as b,_t as c,vt as d,rt as e,nt as f,Z as g,T as h,xt as i,ot as j,ct as k,lt as l,$t as m,l as n,q as o,ht as p,R as q,W as r,L as s,O as t,ft as u,Q as v,X as w,yt as x,st as y,U as z};

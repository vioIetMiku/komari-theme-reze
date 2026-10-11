const f=/[",\n\r]/,E=/"/g,C=/^\s*[=+\-@|]/i;function b(t){const n=String(t!=null?t:"");return C.test(n)?`'${n}`:n}function l(t){const n=b(t);return f.test(n)?`"${n.replace(E,'""')}"`:n}const p="\uFEFF",g=/\n/g;async function S(t,n,i,r=250){const s=[t.map(e=>l(e.label)).join(",")];for(let e=0;e<n.length;e++){const o=n[e];o&&(s.push(t.map(c=>l(c.value(o))).join(",")),(e+1)%r===0&&await i())}return s.join(`\r
`)}function u(t){var n;return(n=JSON.stringify(t,null,2))!=null?n:"null"}function d(t,n){const i=" ".repeat(n);return t.replace(g,`
${i}`)}async function _(t,n,i,r,s=250){const e=Object.entries(t).map(([c,a])=>`  ${JSON.stringify(c)}: ${d(u(a),2)}`),o=[];for(let c=0;c<n.length;c++){const a=n[c];a&&(o.push(`    ${d(u(i(a)),4)}`),(c+1)%s===0&&await r())}return["{",`${e.join(`,
`)}${e.length>0?`,
`:""}  "nodes": [`,o.join(`,
`),"  ]","}"].join(`
`)}function h(t,n,i,r){const s=new Blob([r!=null&&r.bom?p:"",n],{type:i}),e=URL.createObjectURL(s),o=document.createElement("a");o.href=e,o.download=t,document.body.appendChild(o),o.click(),o.remove(),URL.revokeObjectURL(e)}export{_ as a,S as b,h as d};

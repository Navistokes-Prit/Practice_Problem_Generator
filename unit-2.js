(() => {
  'use strict';

  const OUTCOMES = [
    {
      id: 'RF6',
      title: 'RF6 — Inverses of relations',
      summary: 'Work with inverses of exponential and logarithmic functions, including equations, domains, ranges, and asymptotes.',
      skills: [
        { id: 'rf6-inverse-equation', label: 'Find the inverse equation', generator: generateInverseEquation },
        { id: 'rf6-inverse-features', label: 'Analyze inverse features', generator: generateInverseFeatures }
      ]
    },
    {
      id: 'RF7',
      title: 'RF7 — Understanding logarithms',
      summary: 'Evaluate simple logarithms and convert accurately between exponential and logarithmic form.',
      skills: [
        { id: 'rf7-exact-log', label: 'Evaluate exact logarithms', generator: generateExactLog },
        { id: 'rf7-convert', label: 'Convert exponential ↔ logarithmic form', generator: generateLogConversion }
      ]
    },
    {
      id: 'RF8',
      title: 'RF8 — Laws of logarithms',
      summary: 'Use the product, quotient, and power laws to expand, simplify, and rewrite logarithmic expressions.',
      skills: [
        { id: 'rf8-expand', label: 'Expand logarithmic expressions', generator: generateLogExpansion },
        { id: 'rf8-ab', label: 'Rewrite in terms of given logarithms', generator: generateLogsInTermsAB },
        { id: 'rf8-laws', label: 'Recognize valid logarithm laws', generator: generateLogLawConcept }
      ]
    },
    {
      id: 'RF9',
      title: 'RF9 — Exponential and logarithmic functions',
      summary: 'Graph and analyze exponential and logarithmic functions, including transformations, domain, range, intercepts, and asymptotes.',
      skills: [
        { id: 'rf9-growth-decay', label: 'Growth or decay', generator: generateGrowthDecay },
        { id: 'rf9-transformations', label: 'Transform exponential functions', generator: generateExponentialTransformation },
        { id: 'rf9-domain', label: 'Domain and asymptotes of logarithms', generator: generateLogDomain },
        { id: 'rf9-features', label: 'Analyze transformed functions', generator: generateFunctionFeatures }
      ]
    },
    {
      id: 'RF10',
      title: 'RF10 — Exponential and logarithmic equations',
      summary: 'Solve exponential and logarithmic equations and apply them to growth, decay, compound interest, and logarithmic scales.',
      skills: [
        { id: 'rf10-exp-common', label: 'Solve exponential equations using a common base', generator: generateCommonBaseEquation },
        { id: 'rf10-exp-general', label: 'Solve exponential equations using logarithms', generator: generateGeneralExponentialEquation },
        { id: 'rf10-log-equation', label: 'Solve logarithmic equations', generator: generateLogEquation },
        { id: 'rf10-half-life', label: 'Growth, decay, and half-life applications', generator: generateHalfLife },
        { id: 'rf10-interest', label: 'Compound interest applications', generator: generateCompoundInterest },
        { id: 'rf10-scale', label: 'Logarithmic scale applications', generator: generateEarthquakeScale }
      ]
    }
  ];

  // Added from the six September 24 source documents. See Unit2_Coverage.md.
  const extensionSkills = [
    ['RF7','convert-symbolic','Isolate a variable in logarithmic form',gConvert],
    ['RF8','condense','Condense logarithms',gCondense],
    ['RF8','given-log','Use a supplied logarithm value',gGiven],
    ['RF8','identity-family','Identities and parameter families',gIdentity],
    ['RF9','quadratic-domain','Domains with quadratic arguments',gQuadDomain],
    ['RF9','log-model','Find a logarithmic equation from features',gLogModel],
    ['RF9','reflected-exp','Reflections, range, and monotonicity',gReflected],
    ['RF9','graph-exp','Read an exponential graph',gExpGraph],
    ['RF9','graph-log','Read a logarithmic graph',gLogGraph],
    ['RF6','graph-inverse','Sketch a logarithm and its inverse',gInverseGraph],
    ['RF9','inverse-intercept','Intercept of an inverse relation',gIntercept],
    ['RF10','log-ratio','Logarithmic quotient equations',gRatio],
    ['RF10','log-both-sides','Logarithms on both sides',gBoth],
    ['RF10','quadratic-log','Quadratic logarithm arguments',gQuadLog],
    ['RF10','unlike-bases','Unlike exponential bases',gUnlike],
    ['RF10','exp-quadratic','Quadratics in an exponential',gExpQuad],
    ['RF10','exp-reciprocal','Positive and negative exponents',gReciprocal],
    ['RF10','nested-logs','Nested logarithm equations',gNested],
    ['RF10','log-exp-sub','Logarithms with exponential arguments',gLogExp],
    ['RF10','population-target','Time to a population target',gGrowth],
    ['RF10','decay-model','Build and evaluate a half-life model',gDecayModel],
    ['EXT','mixed-bases','Mixed-base sums',gMixed],
    ['EXT','variable-base','Variable-base logarithmic equations',gVariable],
    ['EXT','parameter-system','Mixed-base parameter systems',gParameters],
    ['EXT','base-identity','Determine a base in an identity',gBase],
    ['EXT','telescoping','Telescoping logarithm products',gTelescope]
  ];
  OUTCOMES.push({id:'EXT',title:'Enrichment — extended exam challenges',summary:'Teacher-supplied extensions: mixed-base equations, variable bases, and logarithm identities. These go beyond the diploma restriction to same-base logarithmic equations.',skills:[]});
  extensionSkills.forEach(([outcome,id,label,generator])=>OUTCOMES.find(o=>o.id===outcome).skills.push({id,label,generator}));
  // Retain the teacher's natural-log exact-form question as an explicit extension.
  const moved=OUTCOMES.find(o=>o.id==='RF10').skills;
  const natural=moved.splice(moved.findIndex(s=>s.id==='rf10-exp-general'),1)[0];
  natural.label='Natural-log exact forms (enrichment)';
  OUTCOMES.find(o=>o.id==='EXT').skills.push(natural);

  function mc(outcome,label,d,prompt,answer,wrong,hint,solution){
    return choiceQuestion(outcome,label,d,prompt,[{latex:answer,correct:true},...wrong.filter(x=>x!==answer).map(latex=>({latex,correct:false}))],hint,solution);
  }
  function setQ(label,d,prompt,answers,hint,solution,outcome='RF10',ordered=false){
    return {...baseQuestion(outcome,label,d,prompt+'<br><small>Enter '+(ordered?'the values in the stated order':'all solutions in any order')+', separated by semicolons. Exact fractions, radicals, and log expressions are supported.</small>',hint,solution),type:ordered?'tuple':'set',answers,tolerance:1e-7};
  }
  const L=(b,v)=>`\\log_{${b}}\\left(${v}\\right)`;
  function gConvert(d){
    if(d==='standard'){
      const b=pick([2,3,5]),m=randInt(2,5),n=randInt(1,4);
      return numericQuestion('RF7','Convert and isolate',d,`Rewrite in exponential form and solve ${math(String.raw`\log_{${b}}(${b**m}x^{-1})=${n}`)}.`,b**(m-n),1e-9,'Convert to exponential form, then solve for x.',`${math(String.raw`${b**m}/x=${b}^{${n}}`)} gives ${math(String.raw`x=${b}^{${m-n}}`)}. This is positive, satisfying the restriction x>0.`);
    }
    const b=pick([2,3,5]),m=randInt(2,5),c=randInt(2,6);
    const ans=`y=\\frac{${b}^{a/${m}}}{${c}}`;
    return mc('RF7','Isolate a variable',d,`For ${math('y>0')}, express ${math(`a=${m}\\log_{${b}}(${c}y)`)} in exponential form and isolate ${math('y')}.`,ans,[`y=${c}${b}^{a/${m}}`,`y=\\frac{${b}^{${m}a}}{${c}}`,`y=\\frac{${b}^{a}}{${m*c}}`],'Divide by the coefficient before converting to exponential form.',`${math(`a/${m}=\\log_{${b}}(${c}y)`)} gives ${math(`${c}y=${b}^{a/${m}}`)}. Thus ${math(ans)}; the resulting value is positive.`);
  }
  function gCondense(d){
    const b=pick([2,3,5]),p=randInt(2,d==='standard'?3:5),h=randInt(1,5);
    const a=L(b,`\\frac{x^{${p}}}{x-${h}}`);
    return mc('RF8','Condense logarithms',d,`Write as one logarithm, keeping the original restriction ${math(`x>${h}`)}:<br>${math(`${p}\\log_{${b}}x-\\log_{${b}}(x-${h})`)}`,a,[L(b,`x^{${p}}(x-${h})`),L(b,`${p}x/(x-${h})`),L(b,`x^{${p}}-x+${h}`)],'Use the power law, followed by the quotient law.',`${math(`${p}\\log_{${b}}x=\\log_{${b}}x^{${p}}`)}. Subtraction becomes division: ${math(a)}. Original arguments require ${math(`x>${h}`)}.`);
  }
  function gGiven(d){
    const b=pick([2,3,5]),v=randInt(110,480)/100,p=randInt(2,4),k=randInt(1,3),ans=roundTo(k+p*v,2);
    return numericQuestion('RF8','Use a supplied logarithm',d,`If ${math(`${L(b,'y')}=${v}`)}, calculate ${math(L(b,`${b**k}y^{${p}}`))}. Give your answer to two decimal places.`,ans,.0051,'Expand with the product and power laws.',`${math(`${k}+${p}(${v})=${ans}`)}.`);
  }
  function gIdentity(d){
    const b=pick([2,3,5]),c=randInt(2,5);
    const correct=`a=${c}b,\\quad b\\ge0`;
    return mc('RF8','Parameter family in an identity',d,`Find all real parameter pairs for which ${math(`${L(b,`${c}x^2-ax`)}-${L(b,'x-b')}=${L(b,`${c}x`)}`)} is defined and true for every ${math('x>b')}.`,correct,[`a=b,\\quad b\\ge0`,`a=${c}b,\\quad b<0`,`a=${c},\\quad b=0`],'Exponentiate the identity and compare coefficients. Then check that every x>b is in the original domain.',`${math(`(${c}x^2-ax)/(x-b)=${c}x`)} gives ${math(`a=${c}b`)}. For every ${math('x>b')} to be positive, ${math('b\\ge0')} is necessary. It is sufficient because the first argument factors as ${math(`${c}x(x-b)>0`)}. There is a family of solutions, not one unique pair.`);
  }
  function gQuadDomain(d){
    const h=randInt(-3,3),a=randInt(2,5),b=pick([2,3,4]);
    const left=h-a,right=h+a;
    return mc('RF9','Quadratic argument domain',d,`Determine the domain of ${math(`f(x)=${L(b,`(${shiftExpr('x',h)})^2-${a*a}`)}`)}.`,`(-\\infty,${left})\\cup(${right},\\infty)`,[`[${left},${right}]`,`(${left},${right})`,`(-\\infty,${left}]\\cup[${right},\\infty)`],'Solve a strict quadratic inequality; a logarithm cannot have argument zero.',`${math(`(${shiftExpr('x',h)})^2>${a*a}`)} gives ${math(`x<${left}`)} or ${math(`x>${right}`)}. Both boundary points are excluded.`);
  }
  function gLogModel(d){
    const b=pick([2,3]),h=randInt(1,4),a=randNonZero(-3,3),k=-a,px=h+b*b,py=a;
    const f=`f(x)=${a}\\log_{${b}}(x-${h})${signed(k)}`;
    return mc('RF9','Find a logarithmic equation',d,`A function has form ${math(`f(x)=a\\log_{${b}}(x-h)+k`)}. Its vertical asymptote is ${math(`x=${h}`)}, its x-intercept is ${math(`x=${h+b}`)}, and it passes through ${math(`(${px},${py})`)}. Find the equation.`,f,[`f(x)=${-a}\\log_{${b}}(x-${h})${signed(k)}`,`f(x)=${a}\\log_{${b}}(x+${h})${signed(k)}`,`f(x)=${a}\\log_{${b}}(x-${h})${signed(-k)}`],'The asymptote gives h. Substitute the two points to solve for a and k.',`${math(`h=${h}`)}. The intercept gives ${math('a+k=0')}; the second point gives ${math(`2a+k=${py}`)}. Hence ${math(`a=${a},\\ k=${k}`)} and ${math(f)}.`);
  }
  function gReflected(d){
    const b=pick([2,3,5]),a=randInt(2,4),s=randInt(2,4),h=randInt(1,4),k=randInt(1,5);
    const f=`f(x)=-${a}\\cdot${b}^{-\\frac{1}{${s}}(x-${h})}+${k}`;
    const ans=`D=\\mathbb R,\\ R=(-\\infty,${k}),\\ y=${k};\\ \\text{increasing}`;
    return mc('RF9','Reflected exponential features',d,`For ${math(f)}, select the domain, range, horizontal asymptote, and direction of change.`,ans,[`D=\\mathbb R,\\ R=(${k},\\infty),\\ y=${k};\\ \\text{increasing}`,`D=\\mathbb R,\\ R=(-\\infty,${k}),\\ y=${k};\\ \\text{decreasing}`,`D=(${h},\\infty),\\ R=\\mathbb R,\\ x=${h};\\ \\text{increasing}`],'Separate the effective exponential factor from the direction of the entire reflected function.',`The effective base ${math(`${b}^{-1/${s}}`)} lies between 0 and 1, so its positive exponential factor decays. Multiplying by ${math(`-${a}`)} reverses direction: the complete function increases toward ${math(`y=${k}`)} from below. Its range is ${math(`y<${k}`)} and domain is all real numbers.`);
  }
  function graphSvg(curves,asymptotes=[],points=[]){
    const lo=-6,hi=10,S=460,p=30,scale=(S-2*p)/(hi-lo),X=x=>p+(x-lo)*scale,Y=y=>S-p-(y-lo)*scale;
    let s=`<svg viewBox="0 0 ${S} ${S}" role="img" aria-label="Coordinate graph; labelled key points and asymptotes are also provided in the question." style="display:block;width:100%;max-width:480px;background:white;border:1px solid #d6dfec;margin:18px auto">`;
    for(let n=lo;n<=hi;n++){s+=`<path d="M${X(n)} ${p}V${S-p}M${p} ${Y(n)}H${S-p}" stroke="#e5eaf3"/>`;if(n%2===0)s+=`<text x="${X(n)}" y="${Y(0)+15}" text-anchor="middle" font-size="10">${n}</text><text x="${X(0)-8}" y="${Y(n)+3}" text-anchor="end" font-size="10">${n}</text>`;}
    s+=`<path d="M${p} ${Y(0)}H${S-p}M${X(0)} ${p}V${S-p}" stroke="#526782"/><text x="${S-19}" y="${Y(0)+4}" font-size="12">x</text><text x="${X(0)+5}" y="20" font-size="12">y</text>`;
    for(const [axis,v] of asymptotes)s+=`<path d="${axis==='x'?`M${X(v)} ${p}V${S-p}`:`M${p} ${Y(v)}H${S-p}`}" stroke="#ad6619" stroke-dasharray="5 5"/>`;
    curves.forEach(({fn,color})=>{let path='',open=false;for(let i=0;i<=900;i++){let x=lo+(hi-lo)*i/900,y=fn(x);if(!Number.isFinite(y)||y<lo||y>hi){open=false;continue;}path+=`${open?'L':'M'}${X(x).toFixed(2)},${Y(y).toFixed(2)} `;open=true;}s+=`<path d="${path}" stroke="${color}" stroke-width="2.5" fill="none"/>`;});
    points.forEach(([x,y])=>{if(x>=lo&&x<=hi&&y>=lo&&y<=hi)s+=`<circle cx="${X(x)}" cy="${Y(y)}" r="4" fill="#182b50"/><text x="${X(x)+7}" y="${Y(y)-8}" font-size="11">(${x}, ${y})</text>`;});return s+'</svg>';
  }
  function gExpGraph(d){
    const b=pick([2,3]),h=randNonZero(-2,2),k=randNonZero(-2,3),eq=(H,K)=>`${b}^{${shiftExpr('x',H)}}${signed(K)}`;
    const graph=graphSvg([{fn:x=>b**(x-h)+k,color:'#2456bd'}],[['y',k]],[[h,k+1],[h+1,k+b]]);
    return mc('RF9','Read an exponential graph',d,`Identify the function shown. Its horizontal asymptote is ${math(`y=${k}`)} and the labelled points are ${math(`(${h},${k+1})`)} and ${math(`(${h+1},${k+b})`)}.${graph}`,`f(x)=${eq(h,k)}`,[`f(x)=${eq(-h,k)}`,`f(x)=${eq(h,-k)}`,`f(x)=-${eq(h,k)}`],'Use the asymptote for the vertical shift and the point one unit above it for the horizontal shift.',`The base is ${math(String(b))}, the horizontal shift is ${math(String(h))}, and the vertical shift is ${math(String(k))}. Thus ${math(`f(x)=${eq(h,k)}`)}.`);
  }
  function gLogGraph(d){
    const b=pick([2,3]),a=randInt(1,3),h=randInt(1,3),eq=A=>`${A}\\log_{${b}}(x-${h})`;
    const graph=graphSvg([{fn:x=>a*Math.log(x-h)/Math.log(b),color:'#2456bd'}],[['x',h]],[[h+1,0],[h+b,a]]);
    return mc('RF9','Read a logarithmic graph',d,`Find the equation. The vertical asymptote is ${math(`x=${h}`)}; key points are ${math(`(${h+1},0)`)} and ${math(`(${h+b},${a})`)}.${graph}`,`f(x)=${eq(a)}`,[`f(x)=${eq(-a)}`,`f(x)=${a}\\log_{${b}}(x+${h})`,`f(x)=${eq(a+1)}`],'Use the vertical asymptote, then substitute a labelled point.',`${math(`h=${h}`)} and ${math(`a\\log_{${b}}${b}=${a}`)}, giving ${math(`f(x)=${eq(a)}`)}. Translating this graph ${h+2} units left moves the asymptote to ${math('x=-2')} and gives domain ${math('x>-2')}.`);
  }
  function gInverseGraph(d){
    const b=pick([2,3]),h=randInt(1,3),k=randNonZero(-2,2),inv=`${b}^{${shiftExpr('x',k)}}+${h}`;
    const graph=graphSvg([{fn:x=>Math.log(x-h)/Math.log(b)+k,color:'#2456bd'},{fn:x=>b**(x-k)+h,color:'#167367'},{fn:x=>x,color:'#8b93a1'}],[['x',h],['y',h]],[[h+1,k],[k,h+1]]);
    return mc('RF6','Sketch a logarithm and its inverse',d,`On paper, sketch ${math(`f(x)=\\log_{${b}}(x-${h})${signed(k)}`)} and its inverse. Include asymptotes and key points. Then select the inverse equation. The sketch is self-checked using the worked solution.`,`f^{-1}(x)=${inv}`,[`f^{-1}(x)=${b}^{${plusShiftExpr('x',k)}}+${h}`,`f^{-1}(x)=${b}^{${shiftExpr('x',k)}}-${h}`,`f^{-1}(x)=\\log_{${b}}(x-${h})${signed(-k)}`],'Swap x and y and isolate y. Reflect every key point across y=x.',`The original is translated ${h} units right and ${Math.abs(k)} units ${k>0?'up':'down'}. Its domain is ${math(`x>${h}`)}, range ${math('\\mathbb R')}, and asymptote ${math(`x=${h}`)}. Swapping coordinates gives ${math(`f^{-1}(x)=${inv}`)}, domain ${math('\\mathbb R')}, range ${math(`y>${h}`)}, and asymptote ${math(`y=${h}`)}. Blue: original. Green: inverse. Grey: ${math('y=x')}.${graph}`);
  }
  function gIntercept(d){
    const b=pick([2,3,4]),h=randInt(2,6),k=randInt(1,3),ans=b**k-h;
    return numericQuestion('RF9','Inverse relation intercept',d,`Find the y-intercept of ${math(`x=\\log_{${b}}(y+${h})-${k}`)}. Enter the y-coordinate.`,ans,1e-9,'A y-intercept has x=0.',`${math(`0=\\log_{${b}}(y+${h})-${k}`)} implies ${math(`${b}^{${k}}=y+${h}`)}. Hence ${math(`y=${ans}`)}.`);
  }
  function gRatio(d){
    const b=pick([2,3]),n=randInt(1,3),q=b**n,h=randInt(1,5),u=randInt(1,4),gap=(q-1)*u,r=h+u;
    return numericQuestion('RF10','Logarithmic quotient equations',d,`State the restrictions and solve ${math(`${L(b,shiftExpr('x',h-gap))}-${L(b,`x-${h}`)}=${n}`)}. Enter the valid solution.`,r,1e-9,`Both arguments must be positive, so ${math(`x>${h}`)}.`,`${math(`(${shiftExpr('x',h-gap)})/(x-${h})=${q}`)}. Solving gives ${math(`x=${r}`)}. Both arguments are positive at this value; the original restriction is ${math(`x>${h}`)}.`);
  }
  function gBoth(d){
    const h=randInt(1,4),r=randInt(5,8),a=r-2,b=2*r-3;
    // t=x-h: t(t-2)=2(at-b), roots r and r-2. Both exceed 2.
    const disc=(a+1)**2-2*b,root=Math.sqrt(disc),roots=[h+a+1-root,h+a+1+root];
    const arg3=`${a}(${shiftExpr('x',h)})-${b}`;
    return setQ('Logs on both sides',d,`State the restrictions and solve ${math(`${L(2,shiftExpr('x',h))}+${L(2,shiftExpr('x',h+2))}=${L(2,arg3)}+1`)}.`,roots,'Combine logs, convert 1 to log₂2, and use t=x−h.',`All arguments require ${math(`x>${h+Math.max(2,b/a)}`)}. With ${math(`t=x-${h}`)}, ${math(`t(t-2)=2(${a}t-${b})`)} gives ${math(`t^2-${2*(a+1)}t+${2*b}=0`)}. Hence ${math(`x=${h+a+1}\\pm\\sqrt{${disc}}`)}. Both roots satisfy every restriction.`);
  }
  function gQuadLog(d){
    const b=pick([2,3,5]),h=randInt(1,5),a=randInt(1,4),n=randInt(1,2),R=a*a+b**n;
    return setQ('Quadratic logarithm argument',d,`Solve ${math(`${L(b,`(${shiftExpr('x',h)})^2-${a*a}`)}=${n}`)} and check the original argument.`,[h-Math.sqrt(R),h+Math.sqrt(R)],'Convert to exponential form before taking both square roots.',`The restriction is ${math(`x<${h-a}`)} or ${math(`x>${h+a}`)}. Then ${math(`(${shiftExpr('x',h)})^2=${R}`)}, so ${math(`x=${h}\\pm\\sqrt{${R}}`)}. Both roots give positive argument ${math(String(b**n))}; neither is extraneous.`);
  }
  function gUnlike(d){
    const b=pick([2,3,5]),c=7,a=randInt(1,3),h=randInt(1,4),k=randInt(1,4),answer=(-k*Math.log(c)-h*Math.log(b))/(a*Math.log(b)-Math.log(c));
    const exact=`\\frac{-${k}\\log ${c}-${h}\\log ${b}}{${a}\\log ${b}-\\log ${c}}`;
    return numericQuestion('RF10','Unlike exponential bases',d,`Solve ${math(`${b}^{${a}x+${h}}=${c}^{x-${k}}`)}. Enter an exact logarithmic expression (for example log(2)/log(3)).`,answer,1e-7,'Take logarithms on both sides and collect the x terms.',`${math(`(${a}x+${h})\\log ${b}=(x-${k})\\log ${c}`)}. Thus ${math(`x=${exact}`)}.`);
  }
  function gExpQuad(d){
    if(d==='challenge'){
      const b=pick([2,3,5]),S=randInt(6,10),P=randInt(2,5),D=S*S-4*P;
      const roots=[(S-Math.sqrt(D))/2,(S+Math.sqrt(D))/2];
      return setQ('Quadratic in an exponential',d,`Solve exactly: ${math(`${b*b}^{x}-${S}(${b}^x)+${P}=0`)}.`,roots.map(t=>Math.log(t)/Math.log(b)),`Set ${math(`t=${b}^x>0`)} and apply the quadratic formula.`,`${math(`t^2-${S}t+${P}=0`)} gives ${math(String.raw`t=\frac{${S}\pm\sqrt{${D}}}{2}`)}. Both t-values are positive. Thus ${math(String.raw`x=\log_{${b}}\left(\frac{${S}-\sqrt{${D}}}{2}\right)`)} or ${math(String.raw`x=\log_{${b}}\left(\frac{${S}+\sqrt{${D}}}{2}\right)`)}.`);
    }
    const b=pick([2,3,5]),u=randInt(2,4),v=randInt(5,9),s=u+v,p=u*v;
    const lead=d==='standard'?`${b}^{2x}`:`${b*b}^{x}`;
    return setQ('Quadratic in an exponential',d,`Solve exactly: ${math(`${lead}-${s}(${b}^x)+${p}=0`)}.`,[Math.log(u)/Math.log(b),Math.log(v)/Math.log(b)],`Let ${math(`t=${b}^x>0`)}.`,`${math(`t^2-${s}t+${p}=(t-${u})(t-${v})=0`)}. Both t-values are positive, so ${math(`x=${L(b,String(u))}`)} or ${math(`x=${L(b,String(v))}`)}. Enter log(${u})/log(${b}); log(${v})/log(${b}).`);
  }
  function gReciprocal(d){
    const b=pick([2,3,5]),u=randInt(2,4),v=randInt(5,8);
    return setQ('Positive and negative exponents',d,`Solve exactly: ${math(`${b}^{x}+${u*v}(${b}^{-x})=${u+v}`)}.`,[Math.log(u)/Math.log(b),Math.log(v)/Math.log(b)],`Set ${math(`t=${b}^x`)} and multiply by t.`,`${math(`t+${u*v}/t=${u+v}`)} with ${math('t>0')} becomes ${math(`(t-${u})(t-${v})=0`)}. Therefore ${math(`x=${L(b,String(u))}`)} or ${math(`x=${L(b,String(v))}`)}.`);
  }
  function gNested(d){
    const c=pick([2,3]),a=randInt(1,3),r=randInt(a+1,a+3),p=r*(r-a),outer=pick([2,3]),rhs=L(outer,String(p));
    const ans=c**r;
    return numericQuestion('RF10','Nested logarithms',d,`Solve ${math(`${L(outer,L(c,'x'))}+${L(outer,`${L(c,'x')}-${a}`)}=${rhs}`)}.`,ans,1e-7,`Let ${math(`t=${L(c,'x')}`)}. The outer logs require ${math(`t>${a}`)}.`,`${math(`t(t-${a})=${p}`)} has roots ${math(`t=${r}`)} and ${math(`t=${a-r}`)}. Only ${math(`t=${r}>${a}`)} is allowed. Hence ${math(`x=${c}^{${r}}=${ans}`)}; the original domain is ${math(`x>${c**a}`)}.`);
  }
  function gLogExp(d){
    const a=randInt(1,3),b=a+2,c=randInt(1,3),sum=a+b+2**c,disc=sum*sum-4*a*b,t=(sum+Math.sqrt(disc))/2;
    return numericQuestion('RF10','Logarithms with exponential arguments',d,`Solve exactly: ${math(`${L(2,`2^x-${a}`)}+${L(2,`2^x-${b}`)}=x+${c}`)}.`,Math.log2(t),1e-7,`Let ${math('t=2^x')}. The domain requires ${math(`t>${b}`)}.`,`Since ${math('x=\\log_2t')}, combining gives ${math(`(t-${a})(t-${b})=${2**c}t`)}. Thus ${math(`t^2-${sum}t+${a*b}=0`)}. The smaller root lies below ${b} and is rejected. The valid answer is ${math(`x=${L(2,`\\frac{${sum}+\\sqrt{${disc}}}{2}`)}`)}.`);
  }
  function gGrowth(d){
    const P=pick([150,200,300,500]),factor=pick([1.03,1.05,1.08,1.12]),target=P*randInt(2,5),ans=Math.log(target/P)/Math.log(factor);
    return numericQuestion('RF10','Time to a target',d,`A population follows ${math(`P(t)=${P}(${factor})^t`)}, where t is in years. When will it reach ${target}? Round to the nearest tenth of a year.`,roundTo(ans,1),.051,'Divide by the initial population, then take logarithms.',`${math(`t=\\frac{\\log(${target}/${P})}{\\log(${factor})}\\approx${roundTo(ans,1)}`)} years. Logarithms let us isolate a variable that occurs in an exponent.`);
  }
  function gDecayModel(d){
    const n=pick([2000,3000,5000]),h=randInt(2,6),t=randInt(5,12)+.5,N=Math.round(n*2**(-t/h));
    const ans=`N(t)=${n}(1/2)^{t/${h}}`;
    return mc('RF10','Half-life model and evaluation',d,`A colony starts with ${n} bacteria and halves every ${h} hours. Select the model. Then calculate the population after ${t} hours on paper and compare with the worked solution.`,ans,[`N(t)=${n}(1/2)^{${h}t}`,`N(t)=${n}(2)^{t/${h}}`,`N(t)=${n}(1/${h})^t`],'The exponent counts the number of half-life periods.',`${math(ans)}. At ${math(`t=${t}`)}, ${math(`N(${t})=${n}(1/2)^{${t}/${h}}\\approx${N}`)} bacteria (nearest whole bacterium).`);
  }
  function gMixed(d){
    const b=pick([2,3]),h=randInt(1,5),n=randInt(1,3)*6;
    return numericQuestion('EXT','Mixed-base logarithms',d,`Solve ${math(`${L(b,`x-${h}`)}+${L(b*b,`x-${h}`)}+${L(b**3,`x-${h}`)}=${11*n/6}`)}.`,h+b**n,1e-7,'Use change of base to express all three terms in the smallest base.',`Let ${math(`u=${L(b,`x-${h}`)}`)}. Then ${math(`u+u/2+u/3=${11*n/6}`)}, giving ${math(`u=${n}`)}. Thus ${math(`x=${h}+${b}^{${n}}=${h+b**n}`)}; the restriction ${math(`x>${h}`)} holds.`);
  }
  function gVariable(d){
    const b=pick([2,3,4]),u=randInt(1,2),v=randInt(3,4),power=u*v;
    return setQ('Variable-base logarithms',d,`Solve ${math(`${L('x',`${b}^{${power}}`)}+${L(b,'x')}=${u+v}`)}.`,[b**u,b**v],'Let t=log_b(x); use the reciprocal change-of-base identity.',`Require ${math('x>0,\\ x\\ne1')}. Set ${math(`t=${L(b,'x')}\\ne0`)}. Then ${math(`${power}/t+t=${u+v}`)}, so ${math(`(t-${u})(t-${v})=0`)}. Thus ${math(`x=${b**u}`)} or ${math(`x=${b**v}`)}, both valid.`,'EXT');
  }
  function gParameters(d){
    const base=pick([2,3,5]),A=randInt(1,7),B=2*randInt(1,6),sum=A+B,c=randInt(1,3),reciprocal=d==='challenge',term=reciprocal?`1/${base}`:String(base**3),rhs=A+B/2+(reciprocal?c:-c/3);
    const rhsTex=reciprocal?String(rhs):fractionLatex(6*A+3*B-2*c,6);
    return setQ('Mixed-base parameter system',d,`Determine a and b, in that order, so ${math(`a${L(base,'x')}+b${L(base*base,'x')}-${c}${L(term,'x')}=${L(base,`x^{${rhsTex}}`)}`)} for all ${math('x>0')}, and ${math(`${L(2,'a+b')}=${L(2,String(sum))}`)}.`,[A,B],'Convert each logarithm to the first base and compare coefficients.',`Change of base gives ${math(`a+b/2${reciprocal?`+${c}`:`-${c}/3`}=${rhsTex}`)}. The second equation gives ${math(`a+b=${sum}`)}. Solving yields ${math(`a=${A},\\ b=${B}`)}. Both equations are satisfied. The identity at x=1 alone imposes no restriction; it must hold for every positive x.`,'EXT',true);
  }
  function gBase(d){
    const base=pick([3,5,6,7]),c=pick([2,4]);
    return numericQuestion('EXT','Find an identity base',d,`Determine b so that ${math(`\\frac{${L(base,'x')}}{${L('b',String(c))}}=${L(c,'x')}`)} holds for every positive x.`,base,1e-9,'Write all logarithms using one common base.',`The left side simplifies to ${math(`\\frac{\\log x\\log b}{\\log ${base}\\log ${c}}`)}. For all positive x, the coefficient must match ${math(`\\log x/\\log ${c}`)}. Therefore ${math(`\\log b=\\log ${base}`)}, so ${math(`b=${base}`)}. A single test at x=1 would not determine b.`);
  }
  function gTelescope(d){
    const b=pick([2,3]),n=randInt(3,5),end=b**n;
    return numericQuestion('EXT','Telescoping logarithm product',d,`Evaluate ${math(`${L(end-1,String(end))}\\cdot${L(end-2,String(end-1))}\\cdots${L(b,String(b+1))}`)}. The product includes every consecutive integer base from ${b} through ${end-1}.`,n,1e-9,'Write each factor as a quotient of common logarithms; cancel adjacent factors.',`The product is ${math(`\\frac{\\log ${end}}{\\log ${end-1}}\\frac{\\log ${end-1}}{\\log ${end-2}}\\cdots\\frac{\\log ${b+1}}{\\log ${b}}=\\frac{\\log ${end}}{\\log ${b}}=${n}`)}.`);
  }


  const els = {};
  const state = {
    mode: 'practice',
    currentQuestion: null,
    practiceLocked: false,
    quiz: null,
    mathLiveReady: false
  };

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('load', () => {
    if (window.mathLoadFailed) {
      const status = document.getElementById('math-status');
      if (status) status.hidden = false;
    }
  });

  function init() {
    cacheElements();
    populateOutcomeSelect();
    populateSkillSelect();
    updateOutcomeSummary();
    bindEvents();
    setupMathInputFallback();
    generatePracticeQuestion();
  }

  function cacheElements() {
    [
      'practice-mode', 'quiz-mode', 'practice-panel', 'outcome-select', 'skill-select', 'difficulty-select',
      'generate-btn', 'outcome-summary', 'quiz-status', 'quiz-progress', 'quiz-score', 'question-card',
      'question-outcome', 'question-difficulty', 'question-text', 'choice-list', 'answer-area', 'answer-field',
      'answer-fallback', 'submit-btn', 'hint-btn', 'solution-btn', 'next-btn', 'feedback', 'hint-box', 'solution-box'
    ].forEach(id => {
      els[toCamel(id)] = document.getElementById(id);
    });
  }

  function bindEvents() {
    els.outcomeSelect.addEventListener('change', () => {
      populateSkillSelect();
      updateOutcomeSummary();
      generatePracticeQuestion();
    });
    els.skillSelect.addEventListener('change', generatePracticeQuestion);
    els.difficultySelect.addEventListener('change', generatePracticeQuestion);
    els.generateBtn.addEventListener('click', generatePracticeQuestion);
    els.practiceMode.addEventListener('click', enterPracticeMode);
    els.quizMode.addEventListener('click', startQuiz);
    els.submitBtn.addEventListener('click', submitAnswer);
    els.hintBtn.addEventListener('click', showHint);
    els.solutionBtn.addEventListener('click', showSolution);
    els.nextBtn.addEventListener('click', nextQuestion);
  }

  function setupMathInputFallback() {
    const enableMathField = () => {
      state.mathLiveReady = Boolean(customElements.get('math-field'));
      els.answerField.hidden = !state.mathLiveReady;
      els.answerFallback.hidden = state.mathLiveReady;
      if (state.mathLiveReady) {
        els.answerField.setAttribute('smart-mode', 'true');
        els.answerField.setAttribute('math-virtual-keyboard-policy', 'manual');
      }
    };

    enableMathField();
    setTimeout(enableMathField, 1600);
    customElements.whenDefined('math-field').then(enableMathField);
  }

  function enterPracticeMode() {
    state.mode = 'practice';
    state.quiz = null;
    els.practicePanel.hidden = false;
    els.quizStatus.classList.remove('active');
    els.practiceMode.classList.remove('secondary');
    els.quizMode.classList.add('secondary');
    generatePracticeQuestion();
  }

  function startQuiz() {
    state.mode = 'quiz';
    els.practicePanel.hidden = true;
    els.quizStatus.classList.add('active');
    els.quizMode.classList.remove('secondary');
    els.practiceMode.classList.add('secondary');

    const questions = shuffled(OUTCOMES.filter(o => o.id !== 'EXT').flatMap(outcome =>
      shuffled(outcome.skills).slice(0, 2).map(skill => skill.generator(Math.random() < .25 ? 'challenge' : 'exam'))
    ));

    state.quiz = {
      questions,
      index: 0,
      score: 0,
      answered: false
    };

    renderQuizQuestion();
  }

  function populateOutcomeSelect() {
    els.outcomeSelect.innerHTML = '';
    OUTCOMES.forEach(outcome => {
      const option = document.createElement('option');
      option.value = outcome.id;
      option.textContent = outcome.title;
      els.outcomeSelect.appendChild(option);
    });
  }

  function populateSkillSelect() {
    const outcome = getSelectedOutcome();
    els.skillSelect.innerHTML = '';
    outcome.skills.forEach(skill => {
      const option = document.createElement('option');
      option.value = skill.id;
      option.textContent = skill.label;
      els.skillSelect.appendChild(option);
    });
  }

  function updateOutcomeSummary() {
    const outcome = getSelectedOutcome();
    clearTypeset([els.outcomeSummary]);
    els.outcomeSummary.innerHTML = `<strong>${escapeHtml(outcome.title)}</strong><br>${escapeHtml(outcome.summary)}`;
  }

  function generatePracticeQuestion() {
    if (state.mode !== 'practice') return;
    const skill = findSkill(els.skillSelect.value);
    if (!skill) return;
    const difficulty = els.difficultySelect.value;
    state.currentQuestion = skill.generator(difficulty);
    state.practiceLocked = false;
    renderQuestion(state.currentQuestion);
  }

  function renderQuizQuestion() {
    const quiz = state.quiz;
    if (!quiz) return;

    if (quiz.index >= quiz.questions.length) {
      renderQuizComplete();
      return;
    }

    quiz.answered = false;
    state.currentQuestion = quiz.questions[quiz.index];
    els.quizProgress.textContent = `Question ${quiz.index + 1} of ${quiz.questions.length}`;
    els.quizScore.textContent = `Score: ${quiz.score}`;
    renderQuestion(state.currentQuestion);
  }

  function renderQuizComplete() {
    const quiz = state.quiz;
    clearTypeset([els.questionCard]);
    const percent = Math.round((quiz.score / quiz.questions.length) * 100);
    els.questionOutcome.textContent = 'Quiz complete';
    els.questionDifficulty.textContent = '';
    els.questionText.innerHTML = `<strong>${quiz.score} / ${quiz.questions.length}</strong> (${percent}%)`;
    els.choiceList.hidden = true;
    els.answerArea.hidden = true;
    els.submitBtn.hidden = true;
    els.hintBtn.hidden = true;
    els.solutionBtn.hidden = true;
    els.nextBtn.hidden = false;
    els.nextBtn.textContent = 'Start another quiz';
    clearFeedback();
    els.quizProgress.textContent = 'Complete';
    els.quizScore.textContent = `Final score: ${quiz.score}/${quiz.questions.length}`;
  }

  function renderQuestion(question) {
    clearTypeset([els.questionCard]);
    clearFeedback();
    els.hintBox.style.display = 'none';
    els.solutionBox.style.display = 'none';
    els.hintBox.innerHTML = '';
    els.solutionBox.innerHTML = '';
    els.nextBtn.hidden = true;
    els.nextBtn.textContent = 'Next question';
    els.submitBtn.hidden = false;
    els.hintBtn.hidden = false;
    els.solutionBtn.hidden = state.mode === 'quiz';
    els.questionOutcome.textContent = `${question.outcomeId} · ${question.skillLabel}`;
    els.questionDifficulty.textContent = difficultyLabel(question.difficulty);
    els.questionText.innerHTML = question.promptHtml;

    resetAnswerInput();

    if (question.type === 'choice') {
      renderChoices(question);
      els.choiceList.hidden = false;
      els.answerArea.hidden = true;
    } else {
      els.choiceList.hidden = true;
      els.choiceList.innerHTML = '';
      els.answerArea.hidden = false;
    }

    queueTypeset();
  }

  function renderChoices(question) {
    els.choiceList.innerHTML = '';
    question.options.forEach((option, index) => {
      const label = document.createElement('label');
      label.className = 'choice-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'question-choice';
      input.value = String(index);
      const text = document.createElement('span');
      text.innerHTML = `<strong>${String.fromCharCode(65 + index)}.</strong> ${math(option.latex)}`;
      label.append(input, text);
      els.choiceList.appendChild(label);
    });
  }

  function submitAnswer() {
    const question = state.currentQuestion;
    if (!question) return;

    if (state.mode === 'quiz' && state.quiz?.answered) return;
    if (state.mode === 'practice' && state.practiceLocked) return;

    const result = checkAnswer(question);
    if (result.empty) {
      setFeedback('bad', 'Enter an answer before checking it.');
      return;
    }

    if (state.mode === 'quiz') {
      state.quiz.answered = true;
      if (result.correct) state.quiz.score += 1;
      setFeedback(result.correct ? 'good' : 'bad', result.correct ? 'Correct.' : 'Not correct. Review your work, then continue.');
      lockAnswerControls();
      els.solutionBtn.hidden = false;
      els.nextBtn.hidden = false;
      els.quizScore.textContent = `Score: ${state.quiz.score}`;
      return;
    }

    if (result.correct) {
      state.practiceLocked = true;
      setFeedback('good', 'Correct.');
      lockAnswerControls();
      els.nextBtn.hidden = false;
    } else {
      setFeedback('bad', result.message || 'Not quite. Try again or use the hint.');
    }
  }

  function checkAnswer(question) {
    if (question.type === 'choice') {
      const selected = els.choiceList.querySelector('input[name="question-choice"]:checked');
      if (!selected) return { empty: true, correct: false };
      return { empty: false, correct: Number(selected.value) === question.correctIndex };
    }

    const raw = getMathInputValue();
    if (!raw.trim()) return { empty: true, correct: false };
    if (question.type === 'set' || question.type === 'tuple') {
      const entries = raw.replace(/\\left|\\right/g, '').replace(/^\s*\\?\{|\\?\}\s*$/g, '').split(/[;,]/).map(parseNumericLatex);
      if (entries.some(v=>!Number.isFinite(v))) return {correct:false,message:'Separate answers with semicolons. Use log(3)/log(2) for a base-2 logarithm.'};
      const tol=question.tolerance ?? 1e-7;
      const unique=question.type==='set' ? entries.filter((v,i)=>entries.findIndex(w=>Math.abs(w-v)<=tol)===i) : entries;
      const expected=question.answers;
      const correct=unique.length===expected.length && (question.type==='tuple' ? expected.every((v,i)=>Math.abs(v-unique[i])<=tol) : expected.every(v=>unique.some(w=>Math.abs(v-w)<=tol)));
      return {correct,message:question.type==='set'?'Check that you included every valid root and rejected roots outside the original domain.':'Check both values and their order.'};
    }
    const value = parseNumericLatex(raw);
    if (!Number.isFinite(value)) {
      return { empty: false, correct: false, message: 'I could not read that as a number. Try a decimal, fraction, or simple radical.' };
    }

    const tolerance = question.tolerance ?? 1e-7;
    return { empty: false, correct: Math.abs(value - question.answer) <= tolerance };
  }

  function showHint() {
    const question = state.currentQuestion;
    if (!question) return;
    els.hintBox.innerHTML = question.hintHtml;
    els.hintBox.style.display = 'block';
    queueTypeset();
  }

  function showSolution() {
    const question = state.currentQuestion;
    if (!question) return;
    els.solutionBox.innerHTML = `<strong>Worked solution</strong><div class="steps">${question.solutionHtml}</div>`;
    els.solutionBox.style.display = 'block';
    queueTypeset();
  }

  function nextQuestion() {
    if (state.mode === 'quiz') {
      if (state.quiz.index >= state.quiz.questions.length) {
        startQuiz();
        return;
      }
      state.quiz.index += 1;
      renderQuizQuestion();
    } else {
      generatePracticeQuestion();
    }
  }

  function lockAnswerControls() {
    els.choiceList.querySelectorAll('input').forEach(input => { input.disabled = true; });
    if (state.mathLiveReady) els.answerField.setAttribute('read-only', '');
    els.answerFallback.disabled = true;
    els.submitBtn.disabled = true;
  }

  function resetAnswerInput() {
    els.choiceList.querySelectorAll('input').forEach(input => { input.disabled = false; input.checked = false; });
    if (state.mathLiveReady) {
      els.answerField.removeAttribute('read-only');
      els.answerField.value = '';
    }
    els.answerFallback.disabled = false;
    els.answerFallback.value = '';
    els.submitBtn.disabled = false;
  }

  function getMathInputValue() {
    if (state.mathLiveReady && !els.answerField.hidden) return String(els.answerField.value || '');
    return String(els.answerFallback.value || '');
  }

  function clearFeedback() {
    els.feedback.className = 'feedback';
    els.feedback.textContent = '';
  }

  function setFeedback(kind, message) {
    els.feedback.className = `feedback ${kind}`;
    els.feedback.textContent = message;
  }

  function getSelectedOutcome() {
    return OUTCOMES.find(o => o.id === els.outcomeSelect.value) || OUTCOMES[0];
  }

  function findSkill(skillId) {
    for (const outcome of OUTCOMES) {
      const skill = outcome.skills.find(s => s.id === skillId);
      if (skill) return { ...skill, outcomeId: outcome.id };
    }
    return null;
  }

  function baseQuestion(outcomeId, skillLabel, difficulty, promptHtml, hintHtml, solutionHtml) {
    return { outcomeId, skillLabel, difficulty, promptHtml, hintHtml, solutionHtml };
  }

  function numericQuestion(outcomeId, skillLabel, difficulty, promptHtml, answer, tolerance, hintHtml, solutionHtml) {
    return {
      ...baseQuestion(outcomeId, skillLabel, difficulty, promptHtml, hintHtml, solutionHtml),
      type: 'number',
      answer,
      tolerance
    };
  }

  function choiceQuestion(outcomeId, skillLabel, difficulty, promptHtml, choices, hintHtml, solutionHtml) {
    const seen = new Set();
    const unique = [...choices.filter(c=>c.correct), ...choices.filter(c=>!c.correct)].filter(c=>{if(seen.has(c.latex)) return false; seen.add(c.latex); return true;});
    const options = shuffled(unique.map(item => ({ ...item })));
    return {
      ...baseQuestion(outcomeId, skillLabel, difficulty, promptHtml, hintHtml, solutionHtml),
      type: 'choice',
      options,
      correctIndex: options.findIndex(item => item.correct)
    };
  }

  // ------------------------- RF6 -------------------------

  function generateInverseEquation(difficulty) {
    const b = pick([2, 3, 4, 5]);
    const h = randNonZero(-4, 4);
    const k = randNonZero(-3, 3);
    const original = String.raw`f(x)=\log_{${b}}\left(${shiftExpr('x', h)}\right)${signed(k)}`;
    const correct = String.raw`f^{-1}(x)=${b}^{${shiftExpr('x', k)}}${signed(h)}`;
    const choices = [
      { latex: correct, correct: true },
      { latex: String.raw`f^{-1}(x)=${b}^{${plusShiftExpr('x', k)}}${signed(h)}`, correct: false },
      { latex: String.raw`f^{-1}(x)=${b}^{${shiftExpr('x', k)}}${signed(-h)}`, correct: false },
      { latex: String.raw`f^{-1}(x)=\log_{${b}}\left(${shiftExpr('x', k)}\right)${signed(h)}`, correct: false }
    ];

    return choiceQuestion(
      'RF6', 'Find the inverse equation', difficulty,
      `Determine the inverse of ${math(original)}.`,
      choices,
      `Swap ${math('x')} and ${math('y')}, then isolate ${math('y')}.`,
      `Start with ${math(String.raw`y=\log_{${b}}\left(${shiftExpr('x', h)}\right)${signed(k)}`)}.<br>` +
      `Swap variables: ${math(String.raw`x=\log_{${b}}\left(${shiftExpr('y', h)}\right)${signed(k)}`)}.<br>` +
      `Then ${math(String.raw`${shiftExpr('x', k)}=\log_{${b}}\left(${shiftExpr('y', h)}\right)`)} so ${math(String.raw`${b}^{${shiftExpr('x', k)}}=${shiftExpr('y', h)}`)}.<br>` +
      `Therefore ${math(correct)}.`
    );
  }

  function generateInverseFeatures(difficulty) {
    const b = pick([2, 3, 4, 5]);
    const h = randInt(-4, 4);
    const k = randInt(-3, 3);
    const f = String.raw`f(x)=${b}^{${shiftExpr('x', h)}}${signed(k)}`;
    const correct = String.raw`\text{vertical asymptote }x=${k},\quad \text{domain }x>${k}`;
    const choices = [
      { latex: correct, correct: true },
      { latex: String.raw`\text{vertical asymptote }x=${h},\quad \text{domain }x>${h}`, correct: false },
      { latex: String.raw`\text{horizontal asymptote }y=${k},\quad \text{domain }x\in\mathbb{R}`, correct: false },
      { latex: String.raw`\text{vertical asymptote }x=${k},\quad \text{domain }x<${k}`, correct: false }
    ];

    return choiceQuestion(
      'RF6', 'Analyze inverse features', difficulty,
      `The function ${math(f)} has an inverse. Which statement correctly describes ${math('f^{-1}(x)')}?`,
      choices,
      'Reflect the original graph across the line ' + math('y=x') + '. A horizontal asymptote becomes a vertical asymptote.',
      `The original exponential has horizontal asymptote ${math(String.raw`y=${k}`)} and range ${math(String.raw`y>${k}`)}.<br>` +
      `Reflecting across ${math('y=x')} gives the inverse a vertical asymptote ${math(String.raw`x=${k}`)} and domain ${math(String.raw`x>${k}`)}.`
    );
  }

  // ------------------------- RF7 -------------------------

  function generateExactLog(difficulty) {
    const b = pick([2, 3, 4, 5]);
    const expPool = difficulty === 'standard' ? [-2, -1, 1, 2, 3] : [-3, -2, -1, 1, 2, 3, 4];
    const n = pick(expPool);
    const argument = n >= 0 ? String(b ** n) : String.raw`\frac{1}{${b ** Math.abs(n)}}`;
    const prompt = `Evaluate exactly: ${math(String.raw`\log_{${b}}\left(${argument}\right)`)}.`;

    return numericQuestion(
      'RF7', 'Evaluate exact logarithms', difficulty,
      prompt, n, 1e-9,
      `Ask: “${math(String.raw`${b}^{\square}=${argument}`)}?”`,
      `By definition, ${math(String.raw`\log_{${b}}\left(${argument}\right)=n`)} means ${math(String.raw`${b}^{${n}}=${argument}`)}. Therefore the answer is ${math(String(n))}.`
    );
  }

  function generateLogConversion(difficulty) {
    const b = pick([2, 3, 4, 5, 6, 7]);
    const exponent = pick([2, 3, 4]);
    const value = b ** exponent;
    const prompt = `Which equation is equivalent to ${math(String.raw`\log_{${b}}(${value})=${exponent}`)}?`;
    const choices = [
      { latex: String.raw`${b}^{${exponent}}=${value}`, correct: true },
      { latex: String.raw`${exponent}^{${b}}=${value}`, correct: false },
      { latex: String.raw`${b}^{${value}}=${exponent}`, correct: false },
      { latex: String.raw`${value}^{${exponent}}=${b}`, correct: false }
    ];

    return choiceQuestion(
      'RF7', 'Convert exponential ↔ logarithmic form', difficulty,
      prompt, choices,
      `Use ${math(String.raw`\log_b(y)=x\iff b^x=y`)}.`,
      `${math(String.raw`\log_{${b}}(${value})=${exponent}`)} means exactly that ${math(String.raw`${b}^{${exponent}}=${value}`)}.`
    );
  }

  // ------------------------- RF8 -------------------------

  function generateLogExpansion(difficulty) {
    const c=pick([4,6,8]),m=randInt(2,4),n=difficulty==='challenge'?-randInt(2,6):randInt(2,4),r=pick([2,3,4]),den=pick([3,5,7]);
    const expr=String.raw`\log\left(\frac{${c}x^{${m}}}{${den}y^{${n}}\sqrt[${r}]{z}}\right)`;
    const answer=String.raw`\log ${c}-\log ${den}+${m}\log x${signed(-n)}\log y-\frac1{${r}}\log z`;
    return mc('RF8','Expand logarithms',difficulty,`Assume x, y, z are positive. Expand completely:<br>${math(expr)}`,answer,[String.raw`\log ${c}-\log ${den}+${m}\log x${signed(n)}\log y-\frac1{${r}}\log z`,String.raw`\log ${c}+\log ${den}+${m}\log x${signed(-n)}\log y-\frac1{${r}}\log z`,String.raw`\log ${c}-\log ${den}+${m}\log x${signed(-n)}\log y-${r}\log z`],'Products become sums, quotients become differences, and powers become coefficients.',`Write the root as ${math(String.raw`z^{1/${r}}`)} and expand the numerator and denominator separately. Subtracting ${math(String.raw`${n}\log y`)} produces ${math(String.raw`${-n}\log y`)}. Result: ${math(answer)}.`);
  }

  function generateLogsInTermsAB(difficulty) {
    const base = pick([2, 3, 4, 5]);
    const r = pick([2, 5, 7]);
    let s = pick([3, 11, 13]);
    if (s === r) s += 2;
    const p = difficulty === 'standard' ? 2 : 3;
    const q = difficulty === 'challenge' ? 4 : p + 1;
    const expression = String.raw`\log_{${base}}\left(\frac{${r}^{${p}}}{${s}^{${q}}}\right)`;
    const correct = String.raw`${p}a-${q}b`;
    const choices = [
      { latex: correct, correct: true },
      { latex: String.raw`${p}a+${q}b`, correct: false },
      { latex: String.raw`\frac{a^{${p}}}{b^{${q}}}`, correct: false },
      { latex: String.raw`${q}a-${p}b`, correct: false }
    ];

    return choiceQuestion(
      'RF8', 'Rewrite in terms of given logarithms', difficulty,
      `If ${math(String.raw`\log_{${base}}${r}=a`)} and ${math(String.raw`\log_{${base}}${s}=b`)}, express ${math(expression)} in terms of ${math('a')} and ${math('b')}.`,
      choices,
      'Apply the quotient law, then the power law.',
      `${math(expression)} ${math(String.raw`=${p}\log_{${base}}${r}-${q}\log_{${base}}${s}`)} ${math(String.raw`=${correct}`)}.`
    );
  }

  function generateLogLawConcept(difficulty) {
    const choices = [
      { latex: String.raw`\log_b(xy)=\log_bx+\log_by`, correct: true },
      { latex: String.raw`\log_b(x-y)=\log_bx-\log_by`, correct: false },
      { latex: String.raw`(\log_bx)^n=n\log_bx`, correct: false },
      { latex: String.raw`\log_b(x+y)=\log_bx+\log_by`, correct: false }
    ];
    return choiceQuestion(
      'RF8', 'Recognize valid logarithm laws', difficulty,
      `Which statement is always valid for positive ${math('x')}, positive ${math('y')}, and ${math(String.raw`b>0,\ b\ne1`)}?`,
      choices,
      'Logarithm laws apply to products, quotients, and powers — not sums or differences.',
      `The product law is ${math(String.raw`\log_b(xy)=\log_bx+\log_by`)}. There is no corresponding sum or difference law.`
    );
  }

  // ------------------------- RF9 -------------------------

  function generateGrowthDecay(difficulty) {
    const a1 = pick([2, 3, 5]);
    const a2 = pick([2, 3, 4]);
    const k1 = pick([-4, -2, 2, 3]);
    const k2 = pick([-4, -2, 2, 3]);
    const f = String.raw`f(t)=${randInt(2, 7)}(${a1})^{${k1}t}`;
    const g = String.raw`g(t)=${randInt(2, 7)}\left(\frac{1}{${a2}}\right)^{${k2}t}`;
    const fGrowth = k1 > 0;
    const gGrowth = k2 < 0;
    const choices = [
      { latex: String.raw`f\text{ is growth and }g\text{ is growth}`, correct: fGrowth && gGrowth },
      { latex: String.raw`f\text{ is growth and }g\text{ is decay}`, correct: fGrowth && !gGrowth },
      { latex: String.raw`f\text{ is decay and }g\text{ is growth}`, correct: !fGrowth && gGrowth },
      { latex: String.raw`f\text{ is decay and }g\text{ is decay}`, correct: !fGrowth && !gGrowth }
    ];

    return choiceQuestion(
      'RF9', 'Growth or decay', difficulty,
      `Classify each function:<br>${math(f)}<br>${math(g)}`,
      choices,
      'Rewrite each expression so the exponent is just ' + math('t') + ', then inspect the effective base.',
      `${math(f)} has effective base ${math(String.raw`${a1}^{${k1}}${fGrowth ? '>' : '<'}1`)} so it is ${fGrowth ? 'growth' : 'decay'}.<br>` +
      `${math(g)} has effective base ${math(String.raw`(${fractionLatex(1,a2)})^{${k2}}`)}. This is ${gGrowth ? 'greater' : 'less'} than 1, so it is ${gGrowth ? 'growth' : 'decay'}.`
    );
  }

  function generateExponentialTransformation(difficulty) {
    const b = pick([2, 3, 5, 10]);
    const factor = pick([2, 3, 4]);
    const up = randNonZero(-4, 4);
    const isStretch = Math.random() < 0.5;
    const words = isStretch
      ? `stretched horizontally by a factor of ${factor}`
      : `compressed horizontally by a factor of ${factor}`;
    const exponent = isStretch ? String.raw`\frac{x}{${factor}}` : String.raw`${factor}x`;
    const correct = String.raw`y=${b}^{${exponent}}${signed(up)}`;
    const choices = [
      { latex: correct, correct: true },
      { latex: String.raw`y=${b}^{${isStretch ? `${factor}x` : `\frac{x}{${factor}}`}}${signed(up)}`, correct: false },
      { latex: String.raw`y=${factor}(${b})^x${signed(up)}`, correct: false },
      { latex: String.raw`y=${b}^{${exponent}}${signed(-up)}`, correct: false }
    ];

    return choiceQuestion(
      'RF9', 'Transform exponential functions', difficulty,
      `The graph of ${math(String.raw`y=${b}^x`)} is ${words}, then translated ${Math.abs(up)} unit${Math.abs(up) === 1 ? '' : 's'} ${up > 0 ? 'up' : 'down'}. Which equation results?`,
      choices,
      'Horizontal changes happen inside the exponent. A horizontal stretch by factor ' + factor + ' replaces ' + math('x') + ' with ' + math(String.raw`\frac{x}{${factor}}`) + '.',
      `The horizontal change affects the input first, then the vertical translation is added outside the exponential. Therefore ${math(correct)}.`
    );
  }

  function generateLogDomain(difficulty) {
    const b = pick([2, 3, 4, 5, 7]);
    const c = randNonZero(-5, 6);
    const k = randInt(-3, 3);
    const reversed = Math.random() < 0.5;
    const arg = reversed ? `${c}-x` : shiftExpr('x', c);
    const functionLatex = String.raw`y=\log_{${b}}(${arg})${signed(k)}`;
    const relation = reversed ? String.raw`x<${c}` : String.raw`x>${c}`;
    const wrongRelation = reversed ? String.raw`x>${c}` : String.raw`x<${c}`;
    const correct = String.raw`\text{domain: }${relation},\quad \text{vertical asymptote: }x=${c}`;
    const choices = [
      { latex: correct, correct: true },
      { latex: String.raw`\text{domain: }${wrongRelation},\quad \text{vertical asymptote: }x=${c}`, correct: false },
      { latex: String.raw`\text{domain: }x\in\mathbb{R},\quad \text{horizontal asymptote: }y=${k}`, correct: false },
      { latex: String.raw`\text{domain: }${relation},\quad \text{vertical asymptote: }x=${-c}`, correct: false }
    ];

    return choiceQuestion(
      'RF9', 'Domain and asymptotes of logarithms', difficulty,
      `Determine the domain and vertical asymptote of ${math(functionLatex)}.`,
      choices,
      'The argument of a logarithm must be strictly positive.',
      `Require ${math(String.raw`${arg}>0`)}. This gives ${math(relation)}. The boundary where the argument is zero is ${math(String.raw`x=${c}`)}, which is the vertical asymptote.`
    );
  }

  function generateFunctionFeatures(difficulty) {
    const b = pick([2, 3, 4]);
    const h = randInt(-4, 4);
    const k = randInt(-3, 3);
    const f = String.raw`f(x)=${b}^{${shiftExpr('x', h)}}${signed(k)}`;
    const correct = String.raw`\text{range }y>${k},\quad \text{horizontal asymptote }y=${k}`;
    const choices = [
      { latex: correct, correct: true },
      { latex: String.raw`\text{domain }x>${h},\quad \text{vertical asymptote }x=${h}`, correct: false },
      { latex: String.raw`\text{range }y>${h},\quad \text{horizontal asymptote }y=${h}`, correct: false },
      { latex: String.raw`\text{range }y<${k},\quad \text{horizontal asymptote }y=${k}`, correct: false }
    ];

    return choiceQuestion(
      'RF9', 'Analyze transformed functions', difficulty,
      `Which statement is correct for ${math(f)}?`,
      choices,
      'An exponential function has all real x-values. A vertical translation changes its horizontal asymptote and range.',
      `The parent ${math(String.raw`y=${b}^x`)} has range ${math('y>0')} and asymptote ${math('y=0')}. Translating by ${math(String(k))} gives range ${math(String.raw`y>${k}`)} and asymptote ${math(String.raw`y=${k}`)}.`
    );
  }

  // ------------------------- RF10 -------------------------

  function generateCommonBaseEquation(difficulty) {
    const b = pick([2, 3, 5]);
    const p = pick([2, 3]);
    const q = pick([1, 2, 3]);
    const a = pick([1, 2, 3]);
    const d = pick([1, 2, 3]);
    const c = randInt(-3, 3);
    const e = randInt(-3, 3);
    const numerator = -(q * e + p * c);
    const denominator = p * a + q * d;
    const answer = numerator / denominator;
    const leftBase = b ** p;
    const rightBase = b ** q;
    const leftExp = linearExpr(a, c, 'x');
    const rightExp = linearExpr(d, e, 'x');
    const prompt = `Solve: ${math(String.raw`${leftBase}^{${leftExp}}=\frac{1}{${rightBase}^{${rightExp}}}`)}.`;

    return numericQuestion(
      'RF10', 'Solve exponential equations using a common base', difficulty,
      prompt, answer, 1e-7,
      `Rewrite both sides as powers of ${math(String(b))}, then equate exponents.`,
      `${math(String.raw`${leftBase}= ${b}^{${p}}`)} and ${math(String.raw`${rightBase}= ${b}^{${q}}`)}.<br>` +
      `So ${math(String.raw`${p}(${leftExp})=-${q}(${rightExp})`)}.<br>` +
      `Solving gives ${math(String.raw`x=${fractionLatex(numerator, denominator)}`)}.`
    );
  }

  function generateGeneralExponentialEquation(difficulty) {
    const c = pick([1, 2, 3, 4]);
    const correct = String.raw`x=\frac{${c}\ln 2}{\ln 7}`;
    const choices = [
      { latex: correct, correct: true },
      { latex: String.raw`x=\frac{${c}\ln 7}{\ln 2}`, correct: false },
      { latex: String.raw`x=\frac{${6 * c}\ln 2}{\ln 7}`, correct: false },
      { latex: String.raw`x=\frac{${c}(\ln 2+\ln 7)}{6\ln 2}`, correct: false }
    ];

    return choiceQuestion(
      'EXT', 'Natural-log exact forms (enrichment)', difficulty,
      `Solve exactly in terms of ${math(String.raw`\ln 2`)} and ${math(String.raw`\ln 7`)}:<br>${math(String.raw`14^{6x}=64^{x+${c}}`)}`,
      choices,
      `Take natural logarithms and use ${math(String.raw`\ln 14=\ln 2+\ln 7`)} and ${math(String.raw`\ln 64=6\ln 2`)}.`,
      `${math(String.raw`6x\ln 14=(x+${c})\ln 64`)}.<br>` +
      `${math(String.raw`6x(\ln2+\ln7)=6(x+${c})\ln2`)}.<br>` +
      `The ${math(String.raw`6x\ln2`)} terms cancel, leaving ${math(String.raw`6x\ln7=${6 * c}\ln2`)}.<br>` +
      `Therefore ${math(correct)}.`
    );
  }

  function generateLogEquation(difficulty) {
    const baseCase = Math.random() < 0.5 ? { base: 2, power: 3, rootShift: 4, otherShift: -2 } : { base: 3, power: 1, rootShift: 3, otherShift: -1 };
    const p = randInt(-3, 4);
    const q = p + 2;
    const root = p + baseCase.rootShift;
    const arg1 = shiftExpr('x', p);
    const arg2 = shiftExpr('x', q);
    const prompt = `Solve algebraically: ${math(String.raw`\log_{${baseCase.base}}(${arg1})+\log_{${baseCase.base}}(${arg2})=${baseCase.power}`)}.`;

    return numericQuestion(
      'RF10', 'Solve logarithmic equations', difficulty,
      prompt, root, 1e-7,
      `Combine the logarithms first, then remember the domain requires ${math(String.raw`x>${q}`)}.`,
      `${math(String.raw`\log_{${baseCase.base}}\left((${arg1})(${arg2})\right)=${baseCase.power}`)} so ${math(String.raw`(${arg1})(${arg2})=${baseCase.base ** baseCase.power}`)}.<br>` +
      `The algebraic roots are ${math(String.raw`x=${root}`)} and ${math(String.raw`x=${p + baseCase.otherShift}`)}.<br>` +
      `Only ${math(String.raw`x=${root}`)} satisfies ${math(String.raw`x>${q}`)}, so the valid solution is ${math(String.raw`x=${root}`)}.`
    );
  }

  function generateHalfLife(difficulty) {
    const initial = pick([2000, 3000, 4000, 5000, 6000]);
    const halfLife = pick([2, 3, 4, 5, 6]);
    const factor = difficulty === 'standard' ? pick([8, 16, 32]) : pick([20, 40, 50, 80]);
    const time = halfLife * Math.log(factor) / Math.log(2);
    const prompt = `A bacterial colony initially contains ${initial.toLocaleString()} bacteria and has a half-life of ${halfLife} hours. How long will it take to reach ${math(String.raw`\frac{1}{${factor}}`)} of its original population? Give your answer to the nearest tenth of an hour.`;

    return numericQuestion(
      'RF10', 'Growth, decay, and half-life applications', difficulty,
      prompt, roundTo(time, 1), 0.051,
      `Use ${math(String.raw`N(t)=N_0\left(\frac12\right)^{t/${halfLife}}`)} and divide by ${math(String.raw`N_0`)}.`,
      `${math(String.raw`\frac{1}{${factor}}=\left(\frac12\right)^{t/${halfLife}}`)}.<br>` +
      `Taking logarithms gives ${math(String.raw`t=${halfLife}\frac{\ln(${factor})}{\ln 2}`)} ${math(String.raw`\approx ${roundTo(time, 1)}`)} hours.`
    );
  }

  function generateCompoundInterest(difficulty) {
    const principal = pick([500, 800, 1200, 1500, 2000]);
    const years = pick([4, 5, 6, 8]);
    const n = pick([1, 2, 4, 12]);
    const rate = pick([0.03, 0.04, 0.05, 0.06, 0.07, 0.08]);
    const amount = roundTo(principal * Math.pow(1 + rate / n, n * years), 2);
    const recoveredRate = n * (Math.pow(amount / principal, 1 / (n * years)) - 1);
    const percent = Math.round(recoveredRate * 100);
    const periodName = ({ 1: 'annually', 2: 'semi-annually', 4: 'quarterly', 12: 'monthly' })[n];
    const prompt = `An investment of $${principal.toFixed(2)} grows to $${amount.toFixed(2)} in ${years} years, compounded ${periodName}. Determine the nominal annual interest rate to the nearest percent. Enter the percent number only.`;

    return numericQuestion(
      'RF10', 'Compound interest applications', difficulty,
      prompt, percent, 0.01,
      `Use ${math(String.raw`A=P\left(1+\frac{r}{n}\right)^{nt}`)} and isolate ${math('r')}.`,
      `${math(String.raw`\frac{A}{P}=\left(1+\frac{r}{${n}}\right)^{${n * years}}`)}.<br>` +
      `${math(String.raw`r=${n}\left[\left(\frac{${amount.toFixed(2)}}{${principal}}\right)^{1/${n * years}}-1\right]`)} ${math(String.raw`\approx ${(recoveredRate * 100).toFixed(2)}\%`)}.<br>` +
      `To the nearest percent, the rate is ${math(String.raw`${percent}\%`)}.`
    );
  }

  function generateEarthquakeScale(difficulty) {
    const m1 = pick([7.4, 7.8, 8.2, 8.6]);
    const ratio = pick([5, 10, 20, 32, 50]);
    const m2 = m1 - Math.log10(ratio);
    const prompt = `An earthquake of magnitude ${m1.toFixed(1)} is ${ratio} times as intense as another earthquake. Using ${math(String.raw`\text{Ratio}=10^{M_1-M_2}`)}, determine the magnitude of the second earthquake to the nearest tenth.`;

    return numericQuestion(
      'RF10', 'Logarithmic scale applications', difficulty,
      prompt, roundTo(m2, 1), 0.051,
      `Take ${math(String.raw`\log_{10}`)} of both sides: ${math(String.raw`\log_{10}(${ratio})=M_1-M_2`)}.`,
      `${math(String.raw`${ratio}=10^{${m1.toFixed(1)}-M_2}`)} so ${math(String.raw`\log_{10}(${ratio})=${m1.toFixed(1)}-M_2`)}.<br>` +
      `Thus ${math(String.raw`M_2=${m1.toFixed(1)}-\log_{10}(${ratio})\approx ${roundTo(m2, 1)}`)}.`
    );
  }

  // ------------------------- helpers -------------------------

  function math(latex) {
    return `\\(${escapeHtml(String(latex))}\\)`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function clearTypeset(elements) {
    if (window.MathJax?.typesetClear) {
      try { window.MathJax.typesetClear(elements); } catch { /* safe no-op */ }
    }
  }

  function queueTypeset() {
    if (window.mathLoadFailed) {
      const status = document.getElementById('math-status');
      if (status) status.hidden = false;
      return;
    }
    if (window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise([els.questionCard, els.outcomeSummary]).catch(() => {
        const status = document.getElementById('math-status');
        if (status) status.hidden = false;
      });
    }
  }

  function parseNumericLatex(raw) {
    try {
      let s=String(raw).trim().replace(/−/g,'-').replace(/\\left|\\right|\\[,!; ]/g,'').replace(/\$/g,'').replace(/\\(?:cdot|times)/g,'*').replace(/\\(?:dfrac|tfrac)/g,'\\frac');
      for(let i=0;i<20;i++) {
        const prev=s;
        s=s.replace(/([\^_])\{([^{}]+)\}/g,'$1($2)');
        s=s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g,'(($1)/($2))').replace(/\\sqrt\{([^{}]+)\}/g,'sqrt($1)');
        if(s===prev)break;
      }
      s=s.replace(/\\(log|ln|sqrt)/g,'$1').replace(/[{}]/g,c=>c==='{'?'(':')').replace(/\s+/g,'');
      const tokens=s.match(/(?:\d+(?:\.\d*)?|\.\d+)|log|ln|sqrt|[()+\-*/^_]/g)||[];
      if(tokens.join('')!==s || !tokens.length || s.length>1000)return NaN;
      let pos=0;
      const peek=()=>tokens[pos];
      function atom(){
        const t=tokens[pos++];
        if(t==='('){const v=expression();if(tokens[pos++]!==')')throw Error();return v;}
        if(t==='log'||t==='ln'||t==='sqrt'){
          let base=t==='ln'?Math.E:10;
          if(t==='log'&&peek()==='_'){pos++;base=atom();if(base<=0||base===1)throw Error();}
          const arg=atom();
          if(t==='sqrt')return Math.sqrt(arg);
          if(arg<=0)throw Error();return Math.log(arg)/Math.log(base);
        }
        if(t && /^(\d|\.)/.test(t))return Number(t);
        throw Error();
      }
      function power(){let v=atom();if(peek()==='^'){pos++;v=v**unary();}return v;}
      function unary(){if(peek()==='+'){pos++;return unary();}if(peek()==='-'){pos++;return -unary();}return power();}
      function product(){let v=unary();while(pos<tokens.length){let t=peek();if(t==='*'||t==='/'){pos++;const w=unary();v=t==='*'?v*w:v/w;}else if(t==='('||t==='log'||t==='ln'||t==='sqrt'){v*=unary();}else break;}return v;}
      function expression(){let v=product();while(peek()==='+'||peek()==='-'){let t=tokens[pos++],w=product();v=t==='+'?v+w:v-w;}return v;}
      const value=expression();return pos===tokens.length && Number.isFinite(value)?value:NaN;
    }catch{return NaN;}
  }

  function difficultyLabel(value) {
    return ({ standard: 'Standard', exam: 'Exam-style', challenge: 'Challenge' })[value] || 'Exam-style';
  }

  function shiftExpr(variable, amount) {
    if (amount === 0) return variable;
    return amount > 0 ? `${variable}-${amount}` : `${variable}+${Math.abs(amount)}`;
  }

  function plusShiftExpr(variable, amount) {
    if (amount === 0) return variable;
    return amount > 0 ? `${variable}+${amount}` : `${variable}-${Math.abs(amount)}`;
  }

  function signed(value) {
    if (value === 0) return '';
    return value > 0 ? `+${value}` : `${value}`;
  }

  function linearExpr(a, c, variable) {
    const coefficient = a === 1 ? '' : a === -1 ? '-' : String(a);
    return `${coefficient}${variable}${signed(c)}`;
  }

  function fractionLatex(numerator, denominator) {
    if (denominator === 0) return 'undefined';
    let n = numerator;
    let d = denominator;
    if (d < 0) { n *= -1; d *= -1; }
    const g = gcd(Math.abs(n), Math.abs(d));
    n /= g;
    d /= g;
    if (d === 1) return String(n);
    return String.raw`\frac{${n}}{${d}}`;
  }

  function gcd(a, b) {
    while (b !== 0) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a || 1;
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randNonZero(min, max) {
    let value = 0;
    while (value === 0) value = randInt(min, max);
    return value;
  }

  function pick(array) {
    return array[randInt(0, array.length - 1)];
  }

  function shuffled(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = randInt(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function roundTo(value, places) {
    const factor = 10 ** places;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function toCamel(id) {
    return id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }
})();

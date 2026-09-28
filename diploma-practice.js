(() => {
  'use strict';

  // IMPORTANT: use String.raw with SINGLE LaTeX backslashes in all tagged templates.
  // This preserves exactly one backslash for MathJax and prevents the red-command issue.
  const T = String.raw;
  const ri = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const shuffle = a => [...a].sort(()=>Math.random()-.5);
  const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
  const simpFrac=(n,d)=>{ if(d<0){n=-n;d=-d;} const g=gcd(n,d); return [n/g,d/g]; };
  const frac=(n,d)=>{ const [a,b]=simpFrac(n,d); return b===1?String(a):T`\frac{${a}}{${b}}`; };
  const signed = n => n < 0 ? `- ${Math.abs(n)}` : `+ ${n}`;
  const factor = r => r===0?'x':r>0?`(x-${r})`:`(x+${Math.abs(r)})`;
  const shift = h => h===0?'x':h>0?`x-${h}`:`x+${Math.abs(h)}`;
  const plusNum = n => n<0?`-${Math.abs(n)}`:`+${n}`;
  const poly2=(a,b,c)=>`${a===1?'':a===-1?'-':a}x^2 ${signed(b)}x ${signed(c)}`;
  const texWrap=s=>T`\(${s}\)`;

  const EXAMS = {
    '2016': { label:'2016 Released Diploma Items', first:8, last:31, note:'April 2016 released items — all released machine-scored questions shown on source pages 8–31.' },
    '2017': { label:'2017 Released Diploma Items', first:8, last:30, note:'April 2017 released items — all released machine-scored questions shown on source pages 8–30.' },
    '2019': { label:'2019 Released Diploma Items', first:9, last:33, note:'January 2019 Form 1 released items — machine-scored and written-response questions shown on source pages 9–33.' },
    '2022': { label:'2022 Diploma Practice Test', first:6, last:31, note:'2022 Alberta practice test — all machine-scored and written-response questions shown on source pages 6–31.' }
  };

  const UNITS = [
    ['ALL','All units'],
    ['U1','Unit 1 — Functions & Transformations'],
    ['U2','Unit 2 — Logarithms & Exponents'],
    ['U3','Unit 3 — Trigonometry 1'],
    ['U4','Unit 4 — Permutations & Combinations'],
    ['U5','Unit 5 — Polynomial Functions'],
    ['U6','Unit 6 — Radical & Rational Functions'],
    ['U7','Unit 7 — Trigonometry 2'],
    ['MIX','Integrated / Written Response']
  ];

  const FAMILIES = [
    // UNIT 1
    fam('U1','MC','Transformed domain from a graph','RF transformations', gU1DomainTransform),
    fam('U1','MC','Mapping notation / image point','RF transformations', gU1MappingPoint),
    fam('U1','NR','Composition from function values','RF operations & compositions', gU1CompositionNR),
    fam('U1','MC','Inverse relation invariant point','RF inverses', gU1InverseInvariant),
    fam('U1','WR','Construct and analyze a transformed function','RF transformations', gU1WrittenTransform),

    // UNIT 2
    fam('U2','MC','Logarithm laws — equivalent expression','RF logarithms', gU2LogLaws),
    fam('U2','NR','Solve an exponential/log equation','RF exponential & logarithmic equations', gU2SolveNR),
    fam('U2','MC','Exponential model / growth application','RF exponential models', gU2Growth),
    fam('U2','MC','Logarithmic graph / asymptote reasoning','RF log graphs', gU2LogGraph),
    fam('U2','WR','Logarithmic-scale application','RF applications', gU2WrittenApplication),

    // UNIT 3
    fam('U3','MC','Standard-position angle / exact ratio','TRIG angles & ratios', gU3ExactRatio),
    fam('U3','NR','Unit-circle coordinate relation','TRIG unit circle', gU3UnitCircleNR),
    fam('U3','MC','Sinusoidal characteristics','TRIG functions', gU3Sinusoid),
    fam('U3','MC','Tangent period / asymptote reasoning','TRIG functions', gU3Tangent),
    fam('U3','WR','Sinusoidal modelling application','TRIG modelling', gU3WrittenModel),

    // UNIT 4
    fam('U4','MC','Fundamental counting principle with restrictions','PCBT counting principle', gU4FCP),
    fam('U4','NR','Permutation with repeated elements','PCBT permutations', gU4RepeatedNR),
    fam('U4','MC','Combination / committee restrictions','PCBT combinations', gU4Combination),
    fam('U4','MC','Binomial theorem — specified term','PCBT binomial theorem', gU4Binomial),
    fam('U4','WR','Multi-stage combinatorics problem','PCBT integrated counting', gU4Written),

    // UNIT 5
    fam('U5','MC','Remainder / factor theorem','RF polynomials', gU5Remainder),
    fam('U5','NR','Multiplicity / leading coefficient / constant','RF polynomial features', gU5FeatureNR),
    fam('U5','MC','Zeros and sign behaviour','RF polynomial graphs', gU5Sign),
    fam('U5','MC','Solve a polynomial using a known factor','RF polynomial equations', gU5FactorSolve),
    fam('U5','WR','Construct polynomial from zeros and a point','RF polynomial construction', gU5Written),

    // UNIT 6
    fam('U6','MC','Radical domain / transformation','RF radical functions', gU6RadicalDomain),
    fam('U6','NR','Rational point of discontinuity','RF rational functions', gU6HoleNR),
    fam('U6','MC','Rational asymptotes and intercepts','RF rational functions', gU6Asymptotes),
    fam('U6','MC','Equation from reciprocal-function features','RF rational functions', gU6ReciprocalEquation),
    fam('U6','WR','Analyze rational function and square-root transform','RF integrated radical/rational', gU6Written),

    // UNIT 7
    fam('U7','MC','Identity simplification','TRIG identities', gU7IdentityMC),
    fam('U7','NR','Exact value using sum/difference identity','TRIG sum & difference', gU7ExactNR),
    fam('U7','MC','Double-angle equivalent expression','TRIG double-angle', gU7DoubleAngle),
    fam('U7','MC','General solution of a trig equation','TRIG equations', gU7GeneralSolution),
    fam('U7','WR','Identity proof with restrictions','TRIG identity proof', gU7WrittenProof),

    // INTEGRATED WR
    fam('MIX','WR','Diploma-style transformations written response','Integrated RF', gMixWRTransform),
    fam('MIX','WR','Diploma-style trigonometry written response','Integrated TRIG', gMixWRTrig),
    fam('MIX','WR','Diploma-style combinatorics written response','Integrated PCBT', gMixWRPCBT)
  ];

  function fam(unit,format,title,strand,gen){ return {unit,format,title,strand,gen}; }
  function mc(context,prompt,choices,answer,hint,solution){ return {format:'MC',context,prompt,choices,answer,hint,solution}; }
  function nr(context,prompt,answer,hint,solution,tolerance=1e-9){ return {format:'NR',context,prompt,answer,hint,solution,tolerance}; }
  function wr(context,prompt,hint,solution){ return {format:'WR',context,prompt,hint,solution}; }

  // ---------- Unit 1 ----------
  function gU1DomainTransform(){
    const L=ri(-8,-3), R=ri(3,8), h=ri(2,5), b=pick([-2,-1,2,3]);
    const vals=[(L/b)+h,(R/b)+h].sort((x,y)=>x-y);
    const correct=T`\left[${frac(vals[0]*Math.abs(b),Math.abs(b))},\,${frac(vals[1]*Math.abs(b),Math.abs(b))}\right]`;
    const opts=shuffle([correct,T`[${L+h},${R+h}]`,T`[${L*b+h},${R*b+h}]`,T`[${L-h},${R-h}]`]);
    return mc('Use the following information to answer the question.',T`The domain of \(f(x)\) is \([${L},${R}]\). Determine the domain of \(g(x)=f(${b}(x-${h}))\).`,opts,opts.indexOf(correct),'Solve the inside input restriction first.','Set the input of f between the original domain endpoints and solve the compound inequality for x.');
  }
  function gU1MappingPoint(){
    const x=ri(-5,5), y=ri(-6,6), a=pick([-3,-2,2,3]), h=ri(-4,4), k=ri(-5,5);
    const xp=x/a+h, yp=a*y+k;
    const correct=T`\left(${frac(x,a)}${plusNum(h)},\,${a*y+k}\right)`;
    const opts=shuffle([correct,T`(${x+h},${yp+1})`,T`(${x-h},${yp-1})`,T`(${a*x+h},${yp+2})`]);
    return mc(`Point A(${x}, ${y}) lies on y=f(x).`,T`If \(g(x)=${a}f(${a}(${shift(h)}))${plusNum(k)}\), which point must lie on \(y=g(x)\)?`,opts,opts.indexOf(correct),'Use the coordinate mapping rule for y=a f(b(x-h))+k.','The mapping is (x,y) → (x/b+h, ay+k).');
  }
  function gU1CompositionNR(){
    const a=ri(2,6), b=ri(-5,5), c=ri(2,5), d=ri(-4,4), x=ri(-3,3);
    const gx=c*x+d, ans=a*gx+b;
    return nr('',T`Let \(f(x)=${a}x${signed(b)}\) and \(g(x)=${c}x${signed(d)}\). Determine \((f\circ g)(${x})\).`,ans,'Evaluate g(x) first, then substitute that result into f.',T`\(g(${x})=${gx}\), so \(f(${gx})=${ans}\).`);
  }
  function gU1InverseInvariant(){
    const a=ri(-5,5); const good=`(${a}, ${a})`;
    const others=[`(${a}, ${a+2})`,`(${a+1}, ${a-1})`,`(${a-2}, ${a+3})`]; const opts=shuffle([good,...others]);
    return mc('',T`The graph of \(y=f(x)\) is reflected in the line \(y=x\) to produce \(y=f^{-1}(x)\). Which point could be invariant?`,opts,opts.indexOf(good),'Invariant points under reflection in y=x lie on the reflection line.','A point on y=x has equal x- and y-coordinates.');
  }
  function gU1WrittenTransform(){
    const a=pick([-3,-2,2,3]), b=pick([-2,2]), h=ri(-4,4), k=ri(-5,5);
    return wr('Written Response — show complete reasoning.',T`A function \(f\) has domain \([-6,4]\) and range \([-3,7]\). Define \(g(x)=${a}f(${b}(${shift(h)}))${plusNum(k)}\). (a) State the coordinate mapping. (b) Determine the domain and range of g. (c) Describe all transformations in order.`, 'Use mapping notation and transform endpoints carefully.', 'For y=a f(b(x-h))+k, the mapping is (x,y) → (x/b+h, ay+k). Transform both domain endpoints and both range endpoints, then reorder if a or b is negative.');
  }

  // ---------- Unit 2 ----------
  function gU2LogLaws(){
    const p=ri(2,6), q=ri(2,5); const correct=T`\log_b\!\left(\frac{x^{${p}}}{y^{${q}}}\right)`;
    const opts=shuffle([correct,T`\log_b(x^{${p}}y^{${q}})`,T`\log_b(x^{${p-q}}y)`,T`\frac{\log_b x^{${p}}}{\log_b y^{${q}}}`]);
    return mc('',T`Which expression is equivalent to \(${p}\log_b x-${q}\log_b y\)?`,opts,opts.indexOf(correct),'Use the power law first, then the quotient law.',T`\(${p}\log_b x=\log_b x^{${p}}\) and subtraction becomes division inside one logarithm.`);
  }
  function gU2SolveNR(){
    const base=pick([2,3,5]), f=ri(2,4), c=ri(2,6), d=ri(-8,8); const rhs=base**f; const ans=(rhs-d)/c;
    return nr('',T`Solve \(\log_{${base}}(${c}x${signed(d)})=${f}\).`,ans,'Rewrite in exponential form.',T`\(${c}x${signed(d)}=${base}^{${f}}=${rhs}\), so \(x=${ans}\).`);
  }
  function gU2Growth(){
    const a=ri(80,250), rate=pick([1.04,1.05,1.08,1.12]), t=ri(3,7); const value=a*Math.pow(rate,t); const correct=value.toFixed(1);
    const opts=shuffle([correct,(a*rate*t).toFixed(1),(a*Math.pow(1+(rate-1)/12,12*t)).toFixed(1),(a+t*rate).toFixed(1)]);
    return mc('A population follows an exponential model.',T`The model is \(P(t)=${a}(${rate})^t\). What is \(P(${t})\), to the nearest tenth?`,opts,opts.indexOf(correct),'Substitute the time directly into the exponent.',T`\(P(${t})=${a}(${rate})^{${t}}\approx ${correct}\).`);
  }
  function gU2LogGraph(){
    let h=ri(-5,5); if(h===0)h=2; let k=ri(-4,4); while(k===h||k===-h)k=ri(-4,4); const correct=`x = ${h}`; const opts=shuffle([correct,`y = ${h}`,`x = ${-h}`,`y = ${k}`]);
    return mc('',T`The function \(f(x)=\log_3(${shift(h)})${plusNum(k)}\) has which vertical asymptote?`,opts,opts.indexOf(correct),'Set the logarithm argument equal to zero.','For log_b(x-h)+k, the vertical asymptote is x=h.');
  }
  function gU2WrittenApplication(){
    const a=ri(2,6), b=ri(2,5); return wr('Written Response — logarithmic scale.',T`A measurement scale is defined by \(M=${a}\log_{10}(I/I_0)\). Two events have measurements that differ by ${b}. Algebraically determine the ratio of their intensities and explain the multiplicative interpretation.`, 'Subtract the two scale equations and use the definition of logarithm.', T`A difference of ${b} gives \(${b}=${a}\log_{10}(I_2/I_1)\), so \(I_2/I_1=10^{${frac(b,a)}}\).`);
  }

  // ---------- Unit 3 ----------
  function gU3ExactRatio(){
    const angle=pick([[150,'1/2',T`-\frac{\sqrt{3}}{2}`],[210,'-1/2',T`-\frac{\sqrt{3}}{2}`],[330,'-1/2',T`\frac{\sqrt{3}}{2}`],[225,T`-\frac{\sqrt2}{2}`,T`-\frac{\sqrt2}{2}`]]);
    const func=pick(['sin','cos']); const val=func==='sin'?angle[1]:angle[2];
    const correct=val; const bank=['1/2','-1/2',T`\frac{\sqrt2}{2}`,T`-\frac{\sqrt2}{2}`,T`\frac{\sqrt{3}}{2}`,T`-\frac{\sqrt{3}}{2}`]; const opts=shuffle([correct,...shuffle(bank.filter(v=>v!==correct)).slice(0,3)]);
    return mc('',T`Determine the exact value of \(${'\\'+func} ${angle[0]}^\circ\).`,opts,opts.indexOf(correct),'Use the reference angle and quadrant sign.','Identify the reference angle, then apply the sign in the given quadrant.');
  }
  function gU3UnitCircleNR(){
    const triples=[[3,4,5],[5,12,13],[8,15,17]]; const [x,y,r]=pick(triples); return nr('Point P lies on a circle centred at the origin.',T`If \(P(${x},y)\) lies on \(x^2+y^2=${r*r}\) in Quadrant I, determine y.`,y,'Use x²+y²=r².',T`\(${x}^2+y^2=${r*r}\Rightarrow y^2=${y*y}\Rightarrow y=${y}\) in Quadrant I.`);
  }
  function gU3Sinusoid(){
    const A=ri(2,7), period=pick([Math.PI,2*Math.PI,4*Math.PI]); const b=2*Math.PI/period; const d=ri(-4,5); const correct=`amplitude ${A}, midline y = ${d}`;
    const opts=shuffle([correct,`amplitude ${A+1}, midline y = ${d}`,`amplitude ${A}, midline y = ${d+2}`,`amplitude ${2*A}, midline y = ${d-1}`]);
    return mc('',T`For \(y=${A}\sin(${Number.isInteger(b)?b:T`\frac{1}{${Math.round(1/b)}}`}x)${plusNum(d)}\), which statement is correct?`,opts,opts.indexOf(correct),'Amplitude is |a| and midline is y=d.','Read a and d directly from y=a sin(bx)+d.');
  }
  function gU3Tangent(){
    const b=pick([2,3,4,5]); const correct=T`\frac{\pi}{${b}}`; const opts=shuffle([correct,T`\frac{2\pi}{${b}}`,T`${b}\pi`,T`\frac{\pi}{${2*b}}`]);
    return mc('',T`The period of \(y=\tan(${b}x)\) is`,opts,opts.indexOf(correct),'The basic tangent period is π.','For y=tan(bx), period = π/|b|.');
  }
  function gU3WrittenModel(){
    const r=ri(8,20), centre=r+ri(3,10), period=pick([20,24,30,40]); return wr('Written Response — sinusoidal model.',T`A Ferris wheel has radius ${r} m, centre height ${centre} m, and period ${period} s. A rider begins at the lowest point at t=0. (a) Write a cosine model for height h(t). (b) State the maximum and minimum heights. (c) Determine the angular frequency.`, 'Starting at a minimum suggests a negative cosine model.', T`One model is \(h(t)=-${r}\cos\!\left(\frac{2\pi}{${period}}t\right)${plusNum(centre)}\). The minimum is ${centre-r} and maximum is ${centre+r}.`);
  }

  // ---------- Unit 4 ----------
  function gU4FCP(){
    const letters=ri(20,24), digits=10; const ans=letters*(letters-1)*9*9*8; const correct=String(ans);
    const opts=shuffle([correct,String(letters*letters*9*10*10),String(letters*(letters-1)*9*8*7),String(letters*(letters-1)*10*9*8)]);
    return mc('A code consists of 2 different allowed letters followed by 3 different digits. The first digit cannot be 0.',T`If ${26-letters} letters are excluded from the alphabet, how many codes are possible?`,opts,opts.indexOf(correct),'Handle the restriction first in each stage.','Multiply the choices for each position, reducing choices when repetition is not allowed.');
  }
  function gU4RepeatedNR(){
    const a=ri(3,5), b=ri(2,4), c=ri(1,3), n=a+b+c; const fact=n=>Array.from({length:n},(_,i)=>i+1).reduce((p,v)=>p*v,1); const ans=fact(n)/(fact(a)*fact(b)*fact(c));
    return nr('',T`A word has ${n} letters: ${a} identical A's, ${b} identical B's, and ${c} identical C's. How many distinguishable arrangements are possible?`,ans,'Use n! divided by factorials for each repetition group.',T`\(\frac{${n}!}{${a}!${b}!${c}!}=${ans}\).`);
  }
  function gU4Combination(){
    const m=ri(5,8), w=ri(6,10), choose=5, women=ri(2,4); const men=choose-women; const C=(n,r)=>{let v=1;for(let i=1;i<=r;i++)v=v*(n-r+i)/i;return Math.round(v)}; const ans=C(w,women)*C(m,men); const correct=String(ans); const opts=shuffle([correct,String(ans+1),String(ans+2),String(ans+3)]);
    return mc('',T`A committee of ${choose} is selected from ${m} men and ${w} women. How many committees contain exactly ${women} women?`,opts,opts.indexOf(correct),'Choose the women and men independently, then multiply.',T`\(\binom{${w}}{${women}}\binom{${m}}{${men}}=${ans}\).`);
  }
  function gU4Binomial(){
    const n=ri(6,10), k=ri(2,n-2), a=pick([2,3]), b=pick([-2,-1,1,2]); const C=(n,r)=>{let v=1;for(let i=1;i<=r;i++)v=v*(n-r+i)/i;return Math.round(v)}; const coef=C(n,k)*(a**(n-k))*(b**k); const power=n-k; const correct=T`${coef}x^{${power}}`; const opts=shuffle([correct,T`${-coef}x^{${power}}`,T`${coef}x^{${power+1}}`,T`${coef+C(n,k)}x^{${power}}`]);
    return mc('',T`Determine the ${(k+1)}th term in the expansion of \((${a}x${b<0?'-':'+'}${Math.abs(b)})^{${n}}\).`,opts,opts.indexOf(correct),'Use T_{k+1}=C(n,k)(first)^{n-k}(second)^k.',T`\(T_{${k+1}}=\binom{${n}}{${k}}(${a}x)^{${n-k}}(${b})^{${k}}=${correct}\).`);
  }
  function gU4Written(){
    const p=ri(5,8), c=ri(4,7); return wr('Written Response — show counting expressions before evaluating.',T`A music program must contain 3 selections from ${p} popular pieces and 2 selections from ${c} classical pieces. The five chosen selections are then arranged in performance order. Determine the number of possible programs.`, 'Choose first, then arrange all five selected pieces.', T`The count is \(\binom{${p}}{3}\binom{${c}}{2}(5!)\).`);
  }

  // ---------- Unit 5 ----------
  function gU5Remainder(){
    const r=ri(-4,4)||2, a=ri(1,4), b=ri(-6,6), c=ri(-8,8), d=ri(-8,8); const val=a*r**3+b*r**2+c*r+d; const correct=String(val); const opts=shuffle([correct,String(val+1),String(val-1),String(val+Math.abs(r)+2)]);
    return mc('',T`When \(P(x)=${a}x^3${signed(b)}x^2${signed(c)}x${signed(d)}\) is divided by \(${factor(r)}\), the remainder is`,opts,opts.indexOf(correct),'Use the Remainder Theorem: remainder=P(r).',T`P(${r})=${val}.`);
  }
  function gU5FeatureNR(){
    const a=pick([2,3,4]), r1=ri(-4,-1), r2=ri(1,5), m=pick([2,3]); const constant=a*((-r1))*((-r2)**m); return nr('',T`For \(f(x)=${a}${factor(r1)}${factor(r2)}^{${m}}\), determine the constant term.`,constant,'Evaluate f(0).',T`f(0)=${a}(${Math.abs(r1)})(${(-r2)}^{${m}})=${constant}.`);
  }
  function gU5Sign(){
    const r1=ri(-5,-2), r2=ri(1,4); const correct=T`(-\infty,${r1})\cup(${r2},\infty)`; const opts=shuffle([correct,T`(${r1},${r2})`,T`(-\infty,${r2})`,T`(${r1},\infty)`]);
    return mc('',T`On which interval(s) is \(f(x)=${factor(r1)}^2${factor(r2)}\) positive?`,opts,opts.indexOf(correct),'A double root does not change sign; a simple root does.','Use a sign chart across the zeros and account for multiplicity.');
  }
  function gU5FactorSolve(){
    let r1=ri(-4,4), r2=ri(-5,5), r3=ri(-5,5); while(r2===r1)r2=ri(-5,5); while(r3===r1||r3===r2)r3=ri(-5,5); const roots=[r1,r2,r3]; const s1=r1+r2+r3, s2=r1*r2+r1*r3+r2*r3, s3=r1*r2*r3; const prompt=T`Solve \(x^3${signed(-s1)}x^2${signed(s2)}x${signed(-s3)}=0\), given that \(${factor(r1)}\) is a factor.`; const correct=roots.sort((a,b)=>a-b).join(', '); const opts=shuffle([correct,[r1,r2,r3+1].sort((a,b)=>a-b).join(', '),[r1,r2+1,r3].sort((a,b)=>a-b).join(', '),`${r1}, ${r2}`]);
    return mc('',prompt,opts,opts.indexOf(correct),'Divide by the known factor, then factor the quotient.','Synthetic division reduces the cubic to a quadratic whose roots give the remaining zeros.');
  }
  function gU5Written(){
    const r1=ri(-4,-1), r2=ri(1,4), mult=2, y0=pick([12,18,24,36]); const denom=(-r1)*(r2*r2); const a=y0/denom; return wr('Written Response — polynomial construction.',T`A lowest-degree polynomial has a zero at x=${r1}, a zero at x=${r2} with multiplicity 2, and y-intercept ${y0}. (a) Determine an equation in factored form. (b) State the end behaviour. (c) State the intervals where the function is positive.`, 'Begin with a(x-r1)(x-r2)^2 and use f(0)=y-intercept.', T`Use \(f(x)=a${factor(r1)}${factor(r2)}^2\) and solve \(f(0)=${y0}\) for a. Here \(a=${a}\).`);
  }

  // ---------- Unit 6 ----------
  function gU6RadicalDomain(){
    const b=pick([-4,-3,2,3,4]), h=ri(-5,5); const op=b>0?T`\ge`:T`\le`; const correct=T`x ${op} ${h}`; const opposite=b>0?T`\le`:T`\ge`; const opts=shuffle([correct,T`x ${opposite} ${h}`,T`x\ne ${h}`,T`x\in\mathbb{R}`]);
    return mc('',T`The domain of \(f(x)=\sqrt{${b}(${shift(h)})}\) is`,opts,opts.indexOf(correct),'The radicand must be at least zero.',T`Solve \(${b}(${shift(h)})\ge0\).`);
  }
  function gU6HoleNR(){
    const r=ri(-5,5), s=ri(-5,5); const y=r+s; return nr('',T`The function \(f(x)=\frac{${factor(r)}${factor(-s)}}{${factor(r)}}\) has a point discontinuity at \((m,n)\). Determine \(m+n\).`,r+y,'Cancel the common factor, but keep the original restriction.',T`The hole occurs at x=${r}. The simplified function is y=x${plusNum(s)}, so the missing point is (${r},${y}) and m+n=${r+y}.`);
  }
  function gU6Asymptotes(){
    let h=ri(-5,5); if(h===0)h=2; let k=ri(-4,6); while(k===0||k===h||k===-h)k=ri(-4,6); const a=ri(2,8); const correct=`x = ${h}, y = ${k}`; const opts=shuffle([correct,`x = ${k}, y = ${h}`,`x = ${-h}, y = ${k}`,`x = ${h}, y = ${-k}`]);
    return mc('',T`For \(f(x)=\frac{${a}}{${shift(h)}}${plusNum(k)}\), the vertical and horizontal asymptotes are`,opts,opts.indexOf(correct),'Use the transformed reciprocal form a/(x-h)+k.','Vertical asymptote x=h; horizontal asymptote y=k.');
  }
  function gU6ReciprocalEquation(){
    let h=ri(-5,5); if(h===0)h=2; let k=ri(-4,6); while(k===h||k===-h)k=ri(-4,6); const px=h+pick([-3,-2,2,3]), py=k+pick([-6,-4,4,6]); const a=(px-h)*(py-k); const correct=T`y=\frac{${a}}{${shift(h)}}${plusNum(k)}`; const opts=shuffle([correct,T`y=\frac{${a}}{${shift(-h)}}${plusNum(k)}`,T`y=\frac{${py-k}}{${shift(h)}}${plusNum(k)}`,T`y=\frac{${a}}{${shift(k)}}+${h}`]);
    return mc(`A rational function has vertical asymptote x=${h}, horizontal asymptote y=${k}, and passes through (${px},${py}).`,T`Which equation could represent the function?`,opts,opts.indexOf(correct),'Start with y=a/(x-h)+k and substitute the point.',T`\(a=(${px}${plusNum(-h)})(${py}${plusNum(-k)})=${a}\).`);
  }
  function gU6Written(){
    const r1=ri(-5,-1), r2=ri(1,5), hole=ri(-4,4); return wr('Written Response — rational/radical analysis.',T`Let \(f(x)=\frac{${factor(hole)}${factor(r1)}}{${factor(hole)}${factor(r2)}}\) and \(g(x)=\sqrt{f(x)}\). (a) Identify the hole and vertical/horizontal asymptotes of f. (b) State the domain of f. (c) Use a sign chart to determine the domain of g.`, 'Factor first, preserve non-permissible values, then solve f(x)≥0.', 'Cancel only to analyze the simplified curve; the cancelled denominator zero remains a hole. For g, retain all original restrictions and keep only intervals where f(x)≥0.');
  }

  // ---------- Unit 7 ----------
  function gU7IdentityMC(){
    const correct=T`\sec^2 x`; const opts=shuffle([correct,T`\csc^2 x`,T`\tan^2 x`,T`1`]);
    return mc('',T`Simplify \(1+\tan^2 x\).`,opts,opts.indexOf(correct),'Use a Pythagorean identity.',T`\(1+\tan^2 x=\sec^2 x\).`);
  }
  function gU7ExactNR(){
    // tan(45+30)=2+sqrt3; use integer-coded NR variant instead: exact numerator after rationalized form 2+sqrt3 -> ask coefficient.
    return nr('Use a sum identity. The exact value can be written in the form a + b√3.',T`If \(\tan 75^\circ=a+b\sqrt{3}\), determine \(a+b\).`,3,'Write 75°=45°+30° and use tan(A+B).',T`\(\tan 75^\circ=2+\sqrt{3}\), so \(a+b=3\).`);
  }
  function gU7DoubleAngle(){
    const correct=T`\cos 2x`; const opts=shuffle([correct,T`\sin 2x`,T`1`,T`-\cos 2x`]);
    return mc('',T`The expression \(\cos^2 x-\sin^2 x\) is equivalent to`,opts,opts.indexOf(correct),'Use a cosine double-angle identity.',T`\(\cos 2x=\cos^2 x-\sin^2 x\).`);
  }
  function gU7GeneralSolution(){
    const correct=T`x=\frac{\pi}{6}+n\pi\ \text{or}\ x=\frac{5\pi}{6}+n\pi,\ n\in\mathbb Z`; const opts=shuffle([correct,T`x=\frac{\pi}{6}+2n\pi`,T`x=\frac{5\pi}{6}+2n\pi`,T`x=\frac{\pi}{3}+n\pi`]);
    return mc('',T`The general solution of \(\sin x=\frac12\) is`,opts,opts.indexOf(correct),'Find both reference-angle solutions in one cycle, then add the sine period.','Sine equals 1/2 at π/6 and 5π/6, repeating every 2π; equivalently list each with +2nπ.');
  }
  function gU7WrittenProof(){
    return wr('Written Response — prove algebraically and state restrictions.',T`Prove \(\frac{\cos x}{1-\sin x}-\frac{\sin x}{\cos x}=\sec x\). State all non-permissible values of x.`, 'Rationalize the first fraction using 1+sin x and use 1−sin²x=cos²x.', T`\(\frac{\cos x}{1-\sin x}=\frac{\cos x(1+\sin x)}{\cos^2 x}=\frac{1+\sin x}{\cos x}\). Subtract \(\frac{\sin x}{\cos x}\) to get \(\frac{1}{\cos x}=\sec x\). Restrictions come from the original denominators: \(\cos x\ne0\) and \(1-\sin x\ne0\).`);
  }

  // ---------- Mixed written response ----------
  function gMixWRTransform(){
    return wr('Written Response — 5 marks.',T`The graph of \(y=f(x)\) has domain \([-4,6]\), range \([-2,8]\), and point \((2,5)\). Define \(g(x)=-2f\!\left(\frac12(x-3)\right)+1\). (a) Determine the image of (2,5). (b) Determine the domain and range of g. (c) State the transformations in order.`, 'Use mapping notation first, then transform endpoints.', 'For y=a f(b(x-h))+k, use (x,y)→(x/b+h, ay+k), then transform and reorder interval endpoints.');
  }
  function gMixWRTrig(){
    return wr('Written Response — 5 marks.',T`Given \(\cos\theta=-\frac{8}{17}\) and \(\frac\pi2<\theta<\pi\), determine the exact value of \(\frac{\sin2\theta-\cos2\theta}{\sin\theta}\). Show all algebraic reasoning.`, 'Find sin θ from the quadrant, then use double-angle identities.', 'From the 8–15–17 triangle, sinθ=15/17. Substitute sin2θ=2sinθcosθ and a suitable form of cos2θ, then simplify exactly.');
  }
  function gMixWRPCBT(){
    return wr('Written Response — 5 marks.',T`A committee of 6 is selected from 8 teachers and 10 students. It must contain at least 2 teachers. One selected member is then chosen as chair. Determine the number of possible committees-with-chair.`, 'Count valid committees by cases, then choose a chair from each committee.', T`Sum \(\binom8t\binom{10}{6-t}\) for valid t, then multiply each committee count by 6 for the chair position.`);
  }

  // ---------- UI ----------
  const $=id=>document.getElementById(id);
  const state={exam:'2016',pageSet:0,perPage:6,mode:'original',questions:[]};
  document.addEventListener('DOMContentLoaded',init);

  function init(){
    populateExam(); populateUnits(); bind(); renderOriginal(); generateSet();
    const mj=document.getElementById('MathJax-script');
    mj?.addEventListener('load',()=>typeset(document.getElementById('question-stack')),{once:true});
  }
  function populateExam(){
    const s=$('exam-select'); Object.entries(EXAMS).forEach(([k,v])=>{const o=document.createElement('option');o.value=k;o.textContent=v.label;s.appendChild(o);});
  }
  function populateUnits(){
    const s=$('unit-select'); UNITS.forEach(([k,v])=>{const o=document.createElement('option');o.value=k;o.textContent=v;s.appendChild(o);});
  }
  function bind(){
    $('original-tab').addEventListener('click',()=>switchMode('original'));
    $('generator-tab').addEventListener('click',()=>switchMode('generator'));
    $('exam-select').addEventListener('change',e=>{state.exam=e.target.value;state.pageSet=0;renderOriginal();});
    $('jump-page').addEventListener('click',jumpPage);
    $('page-search').addEventListener('keydown',e=>{if(e.key==='Enter')jumpPage();});
    $('generate-set').addEventListener('click',generateSet);
    $('unit-select').addEventListener('change',generateSet);
    $('format-select').addEventListener('change',generateSet);
    $('source-style-select').addEventListener('change',generateSet);
    $('question-stack').addEventListener('click',handleQuestionClick);
    $('question-stack').addEventListener('input',handleInput);
    $('modal-close').addEventListener('click',()=>$('original-modal').close());
    $('original-modal').addEventListener('click',e=>{if(e.target===$('original-modal'))$('original-modal').close();});
  }
  function switchMode(mode){
    state.mode=mode; $('original-panel').hidden=mode!=='original'; $('generator-panel').hidden=mode!=='generator'; $('original-tab').classList.toggle('active',mode==='original'); $('generator-tab').classList.toggle('active',mode==='generator');
  }
  function pageAsset(year,page){ return `diploma-practice-assets/${year}/page-${String(page).padStart(2,'0')}.jpg`; }
  function renderOriginal(){
    const ex=EXAMS[state.exam]; const pages=[]; for(let p=ex.first;p<=ex.last;p++)pages.push(p);
    const totalSets=Math.ceil(pages.length/state.perPage); if(state.pageSet>=totalSets)state.pageSet=totalSets-1;
    const slice=pages.slice(state.pageSet*state.perPage,(state.pageSet+1)*state.perPage);
    $('exam-note').textContent=ex.note; $('original-count').textContent=`${pages.length} source pages`;
    $('page-grid').innerHTML=slice.map(p=>`<article class="page-card"><img loading="eager" decoding="async" src="${pageAsset(state.exam,p)}" alt="${state.exam} released question page ${p}"><div class="page-meta"><strong>${state.exam} · source page ${p}</strong><button class="secondary open-page" data-page="${p}" type="button">Open full page</button></div></article>`).join('');
    $('page-grid').querySelectorAll('.open-page').forEach(b=>b.addEventListener('click',()=>openPage(+b.dataset.page)));
    $('pager').innerHTML=`<button id="prev-pages" ${state.pageSet===0?'disabled':''}>Previous</button><span class="muted" style="align-self:center">${state.pageSet+1} / ${totalSets}</span><button id="next-pages" ${state.pageSet===totalSets-1?'disabled':''}>Next</button>`;
    $('prev-pages').addEventListener('click',()=>{state.pageSet--;renderOriginal();window.scrollTo({top:430,behavior:'smooth'});});
    $('next-pages').addEventListener('click',()=>{state.pageSet++;renderOriginal();window.scrollTo({top:430,behavior:'smooth'});});
  }
  function jumpPage(){
    const ex=EXAMS[state.exam], p=parseInt($('page-search').value,10); if(!Number.isFinite(p)||p<ex.first||p>ex.last){$('page-search').value='';$('page-search').placeholder=`${ex.first}–${ex.last}`;return;} state.pageSet=Math.floor((p-ex.first)/state.perPage); renderOriginal(); setTimeout(()=>{const img=[...document.querySelectorAll('.page-card')].find(c=>c.textContent.includes(`page ${p}`)); if(img)img.scrollIntoView({behavior:'smooth',block:'center'});},50);
  }
  function openPage(p){$('modal-title').textContent=`${state.exam} released item · source page ${p}`;$('modal-image').src=pageAsset(state.exam,p);$('original-modal').showModal();}

  function generateSet(){
    const unit=$('unit-select').value, format=$('format-select').value; let pool=FAMILIES.filter(f=>(unit==='ALL'||f.unit===unit)&&(format==='ALL'||f.format===format));
    if(!pool.length){$('question-stack').innerHTML='<div class="empty-state">No generator families match those filters.</div>';return;}
    // All-units mode stays manageable: one family per unit/format mix, capped at 12.
    if(unit==='ALL'){
      const byUnit={}; pool.forEach(f=>(byUnit[f.unit]??=[]).push(f)); pool=shuffle(Object.values(byUnit).flatMap(group=>shuffle(group).slice(0,2))).slice(0,12);
    }
    const style=$('source-style-select').value;
    state.questions=pool.map((f,i)=>({id:`q${Date.now()}-${i}`,family:f,style,q:f.gen()})); renderQuestions();
  }
  function renderQuestions(){
    $('generated-count').textContent=`${state.questions.length} question${state.questions.length===1?'':'s'}`;
    $('question-stack').innerHTML=state.questions.map((item,i)=>renderQuestion(item,i)).join('');
    typeset(document.getElementById('question-stack'));
  }
  function escapeHtml(v){ return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function choiceHtml(c){ const s=String(c); const needsMath=/\\|[\^_{}]/.test(s); return needsMath?`\\(${escapeHtml(s)}\\)`:escapeHtml(s); }
  function renderQuestion(item,i){
    const q=item.q, fmt=q.format==='MC'?'Multiple Choice':q.format==='NR'?'Numerical Response':'Written Response';
    const choices=q.format==='MC'?`<div class="choices">${q.choices.map((c,j)=>`<label class="choice"><input type="radio" name="${item.id}" value="${j}"><strong>${String.fromCharCode(65+j)}.</strong><span>${choiceHtml(c)}</span></label>`).join('')}</div>`:'';
    const input=q.format==='NR'?`<div class="answer-row"><div><label>Type your answer</label><input type="text" class="student-answer" data-id="${item.id}" autocomplete="off" spellcheck="false"></div><div><label>Live typeset preview</label><div class="preview empty" data-preview="${item.id}">Your typeset answer will appear here.</div></div></div>`:'';
    const wrNote=q.format==='WR'?`<p class="muted">Work this on paper or in your notebook, then compare against the solution structure.</p>`:'';
    return `<article class="qcard" data-id="${item.id}"><div class="qhead"><span>${item.family.strand} · ${item.family.title}</span><span class="tag">${fmt}${item.style!=='mixed'?` · ${item.style}`:''}</span></div>${q.context?`<div class="qcontext">${escapeHtml(q.context)}</div>`:''}<div class="qtext">${escapeHtml(q.prompt)}</div>${choices}${input}${wrNote}<div class="qactions">${q.format!=='WR'?'<button class="primary check" type="button">Check Answer</button>':''}<button class="secondary hint-btn" type="button">Hint</button><button class="secondary solution-btn" type="button">Show Solution</button><button class="secondary regen" type="button">Generate Similar</button></div><div class="feedback" hidden></div><div class="hint" hidden>${escapeHtml(q.hint)}</div><div class="solution" hidden>${escapeHtml(q.solution)}</div></article>`;
  }
  function handleQuestionClick(e){
    const card=e.target.closest('.qcard'); if(!card)return; const item=state.questions.find(x=>x.id===card.dataset.id); if(!item)return;
    if(e.target.closest('.regen')){item.q=item.family.gen();renderQuestions();return;}
    if(e.target.closest('.hint-btn')){const box=card.querySelector('.hint');box.hidden=!box.hidden;typeset(box);return;}
    if(e.target.closest('.solution-btn')){const box=card.querySelector('.solution');box.hidden=!box.hidden;typeset(box);return;}
    if(e.target.closest('.check')) checkAnswer(card,item.q);
  }
  function handleInput(e){
    if(!e.target.classList.contains('student-answer'))return; const id=e.target.dataset.id; const p=document.querySelector(`[data-preview="${id}"]`); renderPreview(e.target.value,p);
  }
  function renderPreview(raw,p){
    const v=String(raw||'').trim(); if(!v){p.classList.add('empty');p.textContent='Your typeset answer will appear here.';return;} p.classList.remove('empty'); p.textContent=`\\[${v}\\]`; typeset(p);
  }
  function checkAnswer(card,q){
    let ok=false;
    if(q.format==='MC'){const checked=card.querySelector('input[type=radio]:checked'); ok=!!checked&&Number(checked.value)===q.answer;}
    else if(q.format==='NR'){const raw=card.querySelector('.student-answer').value.trim().replace(/,/g,''); const num=Number(raw); if(typeof q.answer==='number')ok=Number.isFinite(num)&&Math.abs(num-q.answer)<=q.tolerance; else ok=raw===String(q.answer);}
    const f=card.querySelector('.feedback'); f.hidden=false; f.className='feedback '+(ok?'correct':'incorrect'); f.textContent=ok?'Correct.':'Not yet. Check your work or use the hint.';
  }
  function typeset(el){
    if(!el) return;
    const run=()=>{
      if(!window.MathJax?.typesetPromise){ setTimeout(()=>typeset(el),80); return; }
      try{
        window.MathJax.typesetClear?.([el]);
        window.MathJax.typesetPromise([el]).catch(err=>console.warn('MathJax typeset error:',err));
      }catch(err){ console.warn('MathJax typeset error:',err); }
    };
    if(window.MathJax?.startup?.promise){ window.MathJax.startup.promise.then(run).catch(()=>setTimeout(run,80)); }
    else run();
  }
})();

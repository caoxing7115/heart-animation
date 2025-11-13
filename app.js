// app.js
let data = null;
let examQuestions = [];
let qList = [];
let currentIdx = 0;
let correctCount = 0;

async function loadData(){
  try{
    const resp = await fetch('题库.json');
    data = await resp.json();
    document.getElementById('info').innerText = `题库：单选 ${data.single_choice.length}，多选 ${data.multiple_choice.length}，判断 ${data.true_false.length}`;
  }catch(e){
    document.getElementById('info').innerText = '加载题库失败，请确认题库文件存在（题库.json）';
    console.error(e);
  }
}

function sample(arr, n){
  if(n >= arr.length) return [...arr];
  const copy = [...arr];
  const res = [];
  for(let i=0;i<n;i++){
    const idx = Math.floor(Math.random()*copy.length);
    res.push(copy.splice(idx,1)[0]);
  }
  return res;
}

function startExam(){
  const single = sample(data.single_choice, Math.min(20, data.single_choice.length));
  const multi = sample(data.multiple_choice, Math.min(10, data.multiple_choice.length));
  const tf = sample(data.true_false, Math.min(10, data.true_false.length));

  qList = [];
  single.forEach(q=> qList.push({type:'单选题', q}));
  multi.forEach(q=> qList.push({type:'多选题', q}));
  tf.forEach(q=> qList.push({type:'判断题', q}));
  // 打乱题序
  qList = qList.sort(()=>Math.random()-0.5);

  currentIdx = 0;
  correctCount = 0;

  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('result-screen').classList.add('hidden');
  document.getElementById('question-screen').classList.remove('hidden');

  renderQuestion();
}

function renderQuestion(){
  const cur = qList[currentIdx];
  const q = cur.q;
  document.getElementById('progress').innerText = `第 ${currentIdx+1} / ${qList.length} 题 — ${cur.type}`;
  document.getElementById('q-text').innerText = q.question;
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  document.getElementById('tf-options').classList.add('hidden');

  if(cur.type === '判断题'){
    document.getElementById('tf-options').classList.remove('hidden');
    Array.from(document.querySelectorAll('#tf-options .choice-btn')).forEach(b=>{
      b.onclick = ()=>handleAnswer(b.dataset.val);
    });
  }else{
    // 显示选项
    q.options.forEach(opt=>{
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerText = opt;
      btn.onclick = ()=> {
        // 多选题支持切换选中
        if(cur.type === '多选题'){
          btn.classList.toggle('selected');
        }else{
          // 单选：立即判断
          document.querySelectorAll('.choice-btn').forEach(b=>b.classList.remove('selected'));
          btn.classList.add('selected');
          // 直接判断并进入下一题
          const user = opt.trim().charAt(0); // A/B/C/D
          handleAnswer(user);
        }
      };
      optionsDiv.appendChild(btn);
    });

    if(cur.type === '多选题'){
      // 显示一个提交多选按钮
      let sub = document.createElement('button');
      sub.innerText = '提交多选答案';
      sub.style.marginTop = '8px';
      sub.onclick = ()=>{
        const sels = Array.from(document.querySelectorAll('.choice-btn.selected')).map(b => b.innerText.trim().charAt(0));
        handleAnswer(sels.join(''));
      }
      optionsDiv.appendChild(sub);
    }
  }
}

function normalizeAns(ans){
  // 标准化后端答案格式
  if(Array.isArray(ans)) return ans.join('');
  if(typeof ans === 'string') return ans.replace(/\s|,/g,'');
  return String(ans);
}

function handleAnswer(userAnsRaw){
  const cur = qList[currentIdx];
  const q = cur.q;
  let userAns = userAnsRaw;
  if(typeof userAns === 'string') userAns = userAns.trim().toUpperCase();

  let correct = false;
  if(cur.type === '单选题'){
    correct = (userAns === q.answer);
  }else if(cur.type === '多选题'){
    const ua = new Set(userAns.split(''));
    const ca = new Set(q.answer);
    if(ua.size === ca.size && [...ua].every(x=>ca.has(x))) correct = true;
  }else{
    // 判断题
    const mapped = (['正确','对','T','√','是'].includes(userAns) ? '正确' : '错误');
    correct = (mapped === q.answer);
  }

  if(correct) correctCount++;
  currentIdx++;
  if(currentIdx >= qList.length){
    showResult();
  }else{
    renderQuestion();
  }
}

function showResult(){
  document.getElementById('question-screen').classList.add('hidden');
  document.getElementById('result-screen').classList.remove('hidden');
  const total = qList.length;
  const acc = ((correctCount/total)*100).toFixed(2);
  let grade = '不及格';
  if(acc >= 90) grade = '优秀'; else if(acc >= 80) grade = '良好'; else if(acc >= 60) grade = '及格';
  document.getElementById('result').innerHTML = `
    总题数：${total} <br/>
    答对题数：${correctCount} <br/>
    正确率：${acc}% <br/>
    评级：${grade}
  `;
}

window.addEventListener('load', async ()=>{
  await loadData();
  document.getElementById('start-btn').onclick = startExam;
  document.getElementById('next-btn').onclick = ()=> {
    // 如果单选模式某些实现需要 next 按钮，这里留空（默认单选直接跳题）
    // 为了简洁，本示例把下一题按钮作为备用
    if(currentIdx < qList.length -1){ currentIdx++; renderQuestion(); } else showResult();
  };
  document.getElementById('retry-btn').onclick = ()=> {
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('result-screen').classList.add('hidden');
  }
});

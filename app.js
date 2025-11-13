let allQuestions = { single_choice: [], multiple_choice: [], true_false: [] };
let questions = [];
let currentIndex = 0;
let selectedOptions = new Set();
let isAnswered = false;
let score = 0;

// 随机抽取函数
function getRandomSubset(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 加载题库
async function loadQuestions() {
  try {
    const res = await fetch('./题库.json');
    const data = await res.json();
    allQuestions = data;
    generateNewSet();
  } catch (err) {
    document.getElementById('question').textContent = '❌ 题库加载失败，请检查路径';
    console.error(err);
  }
}

// 生成一套题
function generateNewSet() {
  score = 0;
  currentIndex = 0;
  selectedOptions.clear();

  const single = getRandomSubset(allQuestions.single_choice || [], 20);
  const multi = getRandomSubset(allQuestions.multiple_choice || [], 10);
  const judge = getRandomSubset(allQuestions.true_false || [], 10);

  // 为判断题自动添加选项（如果没有提供）
  judge.forEach(q => {
    if (!q.options || q.options.length === 0) {
      q.options = ["A. 正确", "B. 错误"];
    }
  });

  questions = [...single, ...multi, ...judge].sort(() => Math.random() - 0.5);

  document.getElementById('restartBtn').style.display = 'none';
  document.getElementById('submitBtn').style.display = 'inline-block';
  showQuestion();
}

// 显示题目
function showQuestion() {
  const q = questions[currentIndex];
  document.getElementById('progress').innerText = `第 ${currentIndex + 1} / ${questions.length} 题`;
  document.getElementById('question').innerText = `${q.id || currentIndex + 1}. ${q.question}`;
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';

  q.options.forEach((opt) => {
    const div = document.createElement('div');
    div.className = 'option';
    div.textContent = opt;
    div.onclick = () => selectOption(div, opt);
    optionsDiv.appendChild(div);
  });

  document.getElementById('result').innerText = '';
  isAnswered = false;
  selectedOptions.clear();
  document.getElementById('submitBtn').innerText = '提交';
}

// 多选题可以多选
function selectOption(div, optionText) {
  if (isAnswered) return;

  const q = questions[currentIndex];
  const type = detectType(q);

  if (type === 'multiple') {
    if (selectedOptions.has(optionText)) {
      selectedOptions.delete(optionText);
      div.classList.remove('selected');
    } else {
      selectedOptions.add(optionText);
      div.classList.add('selected');
    }
  } else {
    document.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
    div.classList.add('selected');
    selectedOptions.clear();
    selectedOptions.add(optionText);
  }
}

function detectType(q) {
  if (q.options.length === 2 && (q.options[0].includes('正确') || q.options[0].includes('错误'))) {
    return 'true_false';
  } else if (q.answer.includes(',') || q.answer.length > 1) {
    return 'multiple';
  }
  return 'single';
}

// 提交答案
document.getElementById('submitBtn').addEventListener('click', () => {
  if (isAnswered) {
    nextQuestion();
    return;
  }

  if (selectedOptions.size === 0) {
    alert('请选择答案！');
    return;
  }

  const q = questions[currentIndex];
  const correctAnswers = q.answer.split(',').map(a => a.trim());
  const resultDiv = document.getElementById('result');
  const userAnswers = Array.from(selectedOptions).map(o => o.trim().charAt(0));

  const isCorrect =
    userAnswers.length === correctAnswers.length &&
    userAnswers.every(a => correctAnswers.includes(a));

  if (isCorrect) {
    resultDiv.style.color = 'green';
    resultDiv.innerText = `✅ 回答正确！正确答案：${q.answer}`;
    score++;
  } else {
    resultDiv.style.color = 'red';
    resultDiv.innerText = `❌ 回答错误！正确答案：${q.answer}`;
  }

  isAnswered = true;
  document.getElementById('submitBtn').innerText = '下一题';

  // 高亮正确答案
  document.querySelectorAll('.option').forEach(o => {
    const optLetter = o.textContent.trim().charAt(0);
    if (correctAnswers.includes(optLetter)) {
      o.style.background = '#c8f7c5';
      o.style.borderColor = '#28a745';
    }
  });

  // 自动切换下一题
  setTimeout(nextQuestion, 1500);
});

// 下一题
function nextQuestion() {
  currentIndex++;
  if (currentIndex < questions.length) {
    showQuestion();
  } else {
    showFinalResult();
  }
}

// 结束页
function showFinalResult() {
  document.getElementById('question').innerText = `🎯 本次答题结束`;
  document.getElementById('options').innerHTML = '';
  document.getElementById('submitBtn').style.display = 'none';
  document.getElementById('restartBtn').style.display = 'inline-block';
  document.getElementById('progress').innerText = '';
  document.getElementById('result').style.color = '#333';
  document.getElementById('result').innerText = `你共答对 ${score} / ${questions.length} 题，正确率 ${(score / questions.length * 100).toFixed(1)}%`;
}

// 再来一套
document.getElementById('restartBtn').addEventListener('click', generateNewSet);

// 启动
loadQuestions();

let questions = [];
let currentIndex = 0;
let selectedOption = null;
let isAnswered = false; // 防止重复提交

// 加载题库
async function loadQuestions() {
  try {
    const res = await fetch('./题库.json');
    if (!res.ok) throw new Error('无法加载题库');
    const data = await res.json();
    questions = data.single_choice;
    showQuestion();
  } catch (err) {
    document.getElementById('question').textContent = '❌ 题库加载失败，请检查题库路径或文件名';
    console.error(err);
  }
}

// 显示题目和选项
function showQuestion() {
  const q = questions[currentIndex];
  document.getElementById('progress').innerText = `第 ${currentIndex + 1} / ${questions.length} 题`;
  document.getElementById('question').innerText = `${q.id}. ${q.question}`;
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
  selectedOption = null;
  isAnswered = false;
  document.getElementById('submitBtn').innerText = '提交';
}

// 选项点击
function selectOption(div, optionText) {
  if (isAnswered) return;
  document.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
  div.classList.add('selected');
  selectedOption = optionText;
}

// 提交答案
document.getElementById('submitBtn').addEventListener('click', () => {
  if (isAnswered) {
    nextQuestion();
    return;
  }

  if (!selectedOption) {
    alert('请选择一个选项！');
    return;
  }

  const q = questions[currentIndex];
  const correctAnswer = q.answer;
  const resultDiv = document.getElementById('result');

  // 判断是否正确
  if (selectedOption.startsWith(correctAnswer)) {
    resultDiv.style.color = 'green';
    resultDiv.innerText = `✅ 回答正确！正确答案：${correctAnswer}`;
  } else {
    resultDiv.style.color = 'red';
    resultDiv.innerText = `❌ 回答错误！正确答案：${correctAnswer}`;
  }

  // 禁止再次修改选项
  isAnswered = true;

  // ✅ 自动高亮正确选项
  document.querySelectorAll('.option').forEach(o => {
    if (o.textContent.startsWith(correctAnswer)) {
      o.style.background = '#c8f7c5'; // 绿色背景
      o.style.borderColor = '#28a745';
    }
  });

  document.getElementById('submitBtn').innerText = '下一题';

  // ✅ 1.5 秒后自动切换
  setTimeout(nextQuestion, 1500);
});

// 下一题逻辑
function nextQuestion() {
  currentIndex++;
  if (currentIndex < questions.length) {
    showQuestion();
  } else {
    document.getElementById('question').innerText = '🎉 所有题目已完成！';
    document.getElementById('options').innerHTML = '';
    document.getElementById('submitBtn').style.display = 'none';
    document.getElementById('result').innerText = '';
    document.getElementById('progress').innerText = '';
  }
}

// 启动加载
loadQuestions();

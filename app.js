let questions = [];
let currentIndex = 0;
let selectedOption = null;

// 加载题库
async function loadQuestions() {
  try {
    const res = await fetch('./题库.json');
    if (!res.ok) throw new Error('无法加载题库');
    const data = await res.json();
    questions = data.single_choice; // 使用你的题库结构
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
}

// 选项点击
function selectOption(div, optionText) {
  document.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
  div.classList.add('selected');
  selectedOption = optionText;
}

// 提交答案
document.getElementById('submitBtn').addEventListener('click', () => {
  if (!selectedOption) {
    alert('请选择一个选项！');
    return;
  }

  const correctAnswer = questions[currentIndex].answer;
  const resultDiv = document.getElementById('result');

  if (selectedOption.startsWith(correctAnswer)) {
    resultDiv.style.color = 'green';
    resultDiv.innerText = '✅ 回答正确！';
  } else {
    resultDiv.style.color = 'red';
    resultDiv.innerText = `❌ 回答错误！正确答案是：${correctAnswer}`;
  }

  // “下一题”按钮逻辑
  document.getElementById('submitBtn').innerText = '下一题';
  document.getElementById('submitBtn').onclick = () => nextQuestion();
});

function nextQuestion() {
  currentIndex++;
  if (currentIndex < questions.length) {
    document.getElementById('submitBtn').innerText = '提交';
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

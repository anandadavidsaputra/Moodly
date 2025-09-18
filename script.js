const moods = document.querySelectorAll(".mood");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");
const noteInput = document.getElementById("note");
const historyList = document.getElementById("historyList");
const statsPie = document.getElementById("statsPie");
const alertBox = document.getElementById("alertBox");
const streakText = document.getElementById("streakText");
const quoteText = document.getElementById("quoteText");
let selectedMood = null;
let selectedEmoji = null;
const emojiMap = {
  Senang: "😄",
  Biasa: "😐",
  Sedih: "😢",
  Marah: "😡",
  Lelah: "😴",
};
const colors = {
  Senang: "#00BFFF",
  Biasa: "#FFA500",
  Sedih: "#1E90FF",
  Marah: "#FF4500",
  Lelah: "#8A2BE2",
};
const quotes = [
  "Tetap semangat!",
  "Hari ini penuh warna 🌈",
  "Senyum dulu 😁",
  "Nikmati prosesnya",
  "Kamu hebat!",
];

// Hover label & pilih mood
moods.forEach((m) => {
  const label = m.querySelector(".mood-label");
  m.addEventListener("mouseenter", () => label.classList.add("show-label"));
  m.addEventListener("mouseleave", () => label.classList.remove("show-label"));
  m.addEventListener("click", (e) => {
    selectedMood = m.dataset.mood;
    selectedEmoji = m.dataset.emoji;
    moods.forEach((x) => (x.style.transform = "scale(1)"));
    m.style.transform = "scale(1.3)";
    // emoji fly
    const fly = document.createElement("div");
    fly.textContent = selectedEmoji;
    fly.className = "emoji-fly";
    document.body.appendChild(fly);
    const rect = m.getBoundingClientRect();
    fly.style.left = rect.left + rect.width / 2 + "px";
    fly.style.top = rect.top + "px";
    setTimeout(() => fly.remove(), 1000);
  });
});

// Alert
function showAlert(msg) {
  alertBox.textContent = msg;
  alertBox.style.display = "block";
  setTimeout(() => {
    alertBox.style.display = "none";
  }, 2000);
}

// Load history & stats
function loadHistory() {
  const data = JSON.parse(localStorage.getItem("moodlyData")) || [];
  historyList.innerHTML = "";
  let today = new Date().toISOString().split("T")[0];
  let todayExists = data.find((d) => d.date.split("T")[0] === today);
  saveBtn.textContent = todayExists ? "Update Mood" : "Simpan Mood";

  // Streak
  let streak = 0;
  data.sort((a, b) => new Date(a.date) - new Date(b.date));
  for (let i = data.length - 1; i >= 0; i--) {
    const dateDiff =
      (new Date(today) - new Date(data[i].date)) / (1000 * 60 * 60 * 24);
    if (dateDiff === streak) streak++;
    else break;
  }
  streakText.textContent =
    streak > 0 ? `Streak ${streak} hari berturut-turut` : "";

  // Quote
  quoteText.textContent = quotes[Math.floor(Math.random() * quotes.length)];

  data.forEach((item) => {
    const div = document.createElement("div");
    div.className = "history-item";
    const dateStr = new Date(item.date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    div.innerHTML = `<span>${emojiMap[item.mood]} ${
      item.mood
    } - ${dateStr}</span><span>${item.note || ""}</span>`;
    historyList.appendChild(div);
  });
  updateStats(data);
}

// Pie chart
function updateStats(data) {
  const ctx = statsPie.getContext("2d");
  ctx.clearRect(0, 0, statsPie.width, statsPie.height);
  const count = {};
  data.forEach((item) => (count[item.mood] = (count[item.mood] || 0) + 1));
  const total = data.length || 1;
  let start = 0;
  for (let mood in count) {
    if (count[mood] <= 0) continue;
    const percent = count[mood] / total;
    const end = start + percent * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(statsPie.width / 2, statsPie.height / 2);
    ctx.arc(statsPie.width / 2, statsPie.height / 2, 120, start, end);
    ctx.closePath();
    ctx.fillStyle = colors[mood];
    ctx.fill();
    // label
    const mid = (start + end) / 2;
    ctx.fillStyle = "#fff";
    ctx.font = "14px Poppins";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      `${emojiMap[mood]} ${Math.round(percent * 100)}%`,
      statsPie.width / 2 + Math.cos(mid) * 70,
      statsPie.height / 2 + Math.sin(mid) * 70
    );
    start = end;
  }
}

// Save mood
saveBtn.addEventListener("click", () => {
  if (!selectedMood) {
    showAlert("Pilih mood dulu!");
    return;
  }
  const note = noteInput.value.trim();
  const today = new Date().toISOString().split("T")[0];
  let data = JSON.parse(localStorage.getItem("moodlyData")) || [];
  const idx = data.findIndex((d) => d.date.split("T")[0] === today);
  if (idx >= 0) {
    data[idx].mood = selectedMood;
    data[idx].note = note;
    showAlert("Mood hari ini diperbarui!");
  } else {
    data.push({
      mood: selectedMood,
      note,
      date: new Date().toISOString(),
    });
    showAlert("Mood hari ini tersimpan!");
  }
  localStorage.setItem("moodlyData", JSON.stringify(data));
  noteInput.value = "";
  selectedMood = null;
  selectedEmoji = null;
  moods.forEach((x) => (x.style.transform = "scale(1)"));
  loadHistory();
});

// Reset
// resetBtn.addEventListener("click",()=>{
//   if(confirm("Hapus semua data mood?")){
//     localStorage.removeItem("moodlyData");
//     showAlert("Semua data mood terhapus!");
//     loadHistory();
//   }
// });

// Dummy data awal
// if(!localStorage.getItem("moodlyData")){
//   const testData=[];
//   const moodsArr=["Senang","Biasa","Sedih","Marah","Lelah"];
//   for(let i=1;i<=5;i++){
//     const mood=moodsArr[Math.floor(Math.random()*moodsArr.length)];
//     testData.push({mood,note:`Catatan contoh ${i}`,date:new Date(2025,8,i).toISOString()});
//   }
//   localStorage.setItem("moodlyData",JSON.stringify(testData));
// }

loadHistory();

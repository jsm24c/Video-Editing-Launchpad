document.addEventListener("DOMContentLoaded", function() {
  const openBtn = document.getElementById("openNotepadBtn");
  const closeBtn = document.getElementById("closeNotepadBtn");
  const notepad = document.getElementById("notepad");

  openBtn.addEventListener("click", () => {
    notepad.classList.add("active");
  });

  closeBtn.addEventListener("click", () => {
    notepad.classList.remove("active");
  });
});

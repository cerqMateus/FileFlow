const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const submitBtn = document.getElementById("submitBtn");
const statusMsg = document.getElementById("statusMsg");
const loadingSpinner = document.getElementById("loadingSpinner");
const btnText = document.getElementById("btnText");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) {
    alert("Por favor, selecione um arquivo PDF");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.classList.add("opacity-50", "cursor-not-allowed");
  loadingSpinner.classList.remove("hidden");
  btnText.textContent = "Convertendo...";
  statusMsg.textContent = "O arquivo está sendo processado. Aguarde...";
  statusMsg.classList.remove("hidden");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/convert/pdf-to-docx", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Erro na conversão");
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace("pdf", "docx");
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    statusMsg.textContent = "Sucesso! Download iniciado";
    statusMsg.classList.add("text-green-600");
  } catch (error) {
    console.error(error);
    statusMsg.textContent = "Ocorreu um erro ao converter o arquivo.";
    statusMsg.classList.add("text-red-600");
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
    loadingSpinner.classList.add("hidden");
    btnText.textContent = "Converter Novo Arquivo";
  }
});

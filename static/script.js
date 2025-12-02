// Elementos da UI
const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const submitBtn = document.getElementById("submitBtn");
const statusMsg = document.getElementById("statusMsg");
const loadingSpinner = document.getElementById("loadingSpinner");
const btnText = document.getElementById("btnText");
const inputLabel = document.getElementById("inputLabel");
const helperText = document.getElementById("helperText");

const tabPdf = document.getElementById("tabPdfToDocx");
const tabDocx = document.getElementById("tabDocxToPdf");

// Estado da Aplicação
let currentMode = "pdf-to-docx"; // 'pdf-to-docx' ou 'docx-to-pdf'

// Função para trocar de abas
function switchMode(mode) {
  currentMode = mode;
  fileInput.value = ""; // Limpa o arquivo anterior
  statusMsg.classList.add("hidden"); // Esconde mensagens antigas

  if (mode === "pdf-to-docx") {
    // Estilo das Abas
    tabPdf.className =
      "w-1/2 py-4 text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50 transition-colors";
    tabDocx.className =
      "w-1/2 py-4 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors";

    // Textos e Inputs
    inputLabel.textContent = "Selecione seu arquivo PDF";
    helperText.textContent = "Suporta apenas arquivos .pdf";
    fileInput.accept = ".pdf";
    btnText.textContent = "Converter para Word";
  } else {
    // Estilo das Abas
    tabDocx.className =
      "w-1/2 py-4 text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50 transition-colors";
    tabPdf.className =
      "w-1/2 py-4 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors";

    // Textos e Inputs
    inputLabel.textContent = "Selecione seu arquivo Word";
    helperText.textContent = "Suporta apenas arquivos .docx";
    fileInput.accept = ".docx";
    btnText.textContent = "Converter para PDF";
  }
}

// Lógica de Envio
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) {
    alert("Por favor, selecione um arquivo.");
    return;
  }

  // UX: Loading
  submitBtn.disabled = true;
  submitBtn.classList.add("opacity-50", "cursor-not-allowed");
  loadingSpinner.classList.remove("hidden");
  btnText.textContent = "Processando...";
  statusMsg.textContent = "Aguarde, estamos convertendo seu arquivo...";
  statusMsg.classList.remove("hidden", "text-green-600", "text-red-600");

  const formData = new FormData();
  formData.append("file", file);

  // Define qual rota chamar baseado no modo atual
  const endpoint =
    currentMode === "pdf-to-docx"
      ? "/convert/pdf-to-docx"
      : "/convert/docx-to-pdf";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errJson = await response.json();
      throw new Error(errJson.detail || "Erro na conversão.");
    }

    const blob = await response.blob();

    // Download Trigger - Compatível com mobile
    const url = window.URL.createObjectURL(blob);
    const originalName = file.name.split(".").slice(0, -1).join(".");
    const newExt = currentMode === "pdf-to-docx" ? ".docx" : ".pdf";
    const fileName = `${originalName}_convertido${newExt}`;

    // Detecta se é mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Solução para mobile: cria um link visível e clicável
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.textContent = "Clique aqui para baixar seu arquivo";
      a.className =
        "inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors";

      statusMsg.innerHTML = ""; // Limpa a mensagem anterior
      statusMsg.appendChild(document.createTextNode("Conversão concluída! "));
      statusMsg.appendChild(a);
      statusMsg.classList.add("text-green-600");

      // Tenta iniciar o download automaticamente mesmo assim
      setTimeout(() => {
        a.click();
      }, 100);
    } else {
      // Desktop: download automático funciona normalmente
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      statusMsg.textContent = "Sucesso! Seu download deve começar em breve.";
      statusMsg.classList.add("text-green-600");
    }

    // Limpa o URL após um tempo
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 10000);
  } catch (error) {
    console.error(error);
    statusMsg.textContent = `Erro: ${error.message}`;
    statusMsg.classList.add("text-red-600");
  } finally {
    // Reset UX
    submitBtn.disabled = false;
    submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
    loadingSpinner.classList.add("hidden");

    // Restaura o texto original do botão
    btnText.textContent =
      currentMode === "pdf-to-docx"
        ? "Converter para Word"
        : "Converter para PDF";
  }
});

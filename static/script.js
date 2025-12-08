const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const submitBtn = document.getElementById("submitBtn");
const statusMsg = document.getElementById("statusMsg");
const loadingSpinner = document.getElementById("loadingSpinner");
const btnText = document.getElementById("btnText");

const config = window.converterConfig;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) {
    alert("Por favor, selecione um arquivo.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.classList.add("opacity-50", "cursor-not-allowed");
  loadingSpinner.classList.remove("hidden");
  btnText.textContent = "Processando...";
  statusMsg.textContent = "Aguarde, estamos convertendo seu arquivo...";
  statusMsg.classList.remove("hidden", "text-green-600", "text-red-600");

  const formData = new FormData();
  formData.append("file", file);

  const endpoint = `/convert/${config.fromFormat}-to-${config.toFormat}`;

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

    const url = window.URL.createObjectURL(blob);
    const originalName = file.name.split(".").slice(0, -1).join(".");
    const newExt = `.${config.toFormat}`;
    const fileName = `${originalName}_convertido${newExt}`;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.textContent = "Clique aqui para baixar seu arquivo";
      a.className =
        "inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors";

      statusMsg.innerHTML = "";
      statusMsg.appendChild(document.createTextNode("Conversão concluída! "));
      statusMsg.appendChild(a);
      statusMsg.classList.add("text-green-600");

      setTimeout(() => {
        a.click();
      }, 100);
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      statusMsg.textContent = "Sucesso! Seu download deve começar em breve.";
      statusMsg.classList.add("text-green-600");
    }

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 10000);
  } catch (error) {
    console.error(error);
    statusMsg.textContent = `Erro: ${error.message}`;
    statusMsg.classList.add("text-red-600");
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
    loadingSpinner.classList.add("hidden");
    btnText.textContent = `Converter para ${config.toFormatLabel}`;
  }
});

function convertText() {
    let inputText = document.getElementById("inputText").value;
    
    let mimimiText = inputText.replace(/a/g, "i")
                              .replace(/e/g, "i")
                              .replace(/o/g, "i")
                              .replace(/u/g, "i")
                              .replace(/á/g, "i")
                              .replace(/é/g, "i")
                              .replace(/ó/g, "i")
                              .replace(/ú/g, "i")
                              .replace(/A/g, "I")
                              .replace(/E/g, "I")
                              .replace(/O/g, "I")
                              .replace(/U/g, "I")
                              .replace(/Á/g, "I")
                              .replace(/É/g, "I")
                              .replace(/Ó/g, "I")
                              .replace(/Ú/g, "I");

    document.getElementById("outputText").textContent = mimimiText;
}
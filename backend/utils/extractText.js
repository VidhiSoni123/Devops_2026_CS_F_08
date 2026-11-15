const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const WordExtractor = require("word-extractor");

const wordExtractor = new WordExtractor();

async function extractText(filePath) {
    const extension = path.extname(filePath).toLowerCase();

    if (!fs.existsSync(filePath)) {
        throw new Error("File not found.");
    }

    let extractedText = "";

    // PDF extraction
    if (extension === ".pdf") {
        const buffer = fs.readFileSync(filePath);
        const data = await pdfParse(buffer);

        extractedText = data.text;
    }

    // DOCX extraction
    else if (extension === ".docx") {
        const result = await mammoth.extractRawText({
            path: filePath
        });

        extractedText = result.value;
    }

    // DOC extraction
    else if (extension === ".doc") {
        const document = await wordExtractor.extract(filePath);

        extractedText = document.getBody();
    }

    else {
        throw new Error("Unsupported file format.");
    }

    // Normalize extracted text
    return extractedText
        .replace(/[\r\n\t]+/g, " ")
        .replace(/\s+/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/([a-zA-Z])([0-9])/g, "$1 $2")
        .replace(/([0-9])([a-zA-Z])/g, "$1 $2")
        .trim();
}

module.exports = extractText;
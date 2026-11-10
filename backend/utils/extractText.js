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

    if (extension === ".pdf") {
        const buffer = fs.readFileSync(filePath);
        const data = await pdfParse(buffer);
        extractedText = data.text;
    }

    else if (extension === ".docx") {
        const result = await mammoth.extractRawText({
            path: filePath
        });

        extractedText = result.value;
    }

    else if (extension === ".doc") {
        const document = await wordExtractor.extract(filePath);
        extractedText = document.getBody();
    }

    else {
        throw new Error("Unsupported file format.");
    }

    return extractedText
        .replace(/\s+/g, " ")
        .trim();
}

module.exports = extractText;
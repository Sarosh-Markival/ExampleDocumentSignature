// PDF.js Configuration and Loading
// PDF.js Configuration and Loading
const pdfUrl = 'https://github.com/Sarosh-Markival/ExampleDocumentSignature/blob/main/ContractSignature/PDF/example.pdf'; // Path to your PDF file
let pdfDoc = null;
let currentPage = 1;
let scale = 1; // Adjust the scale of the PDF rendering
const canvas = document.getElementById('pdf-canvas');
const context = canvas.getContext('2d');

// Function to render a specific page of the PDF
async function renderPage(pageNum) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    // Set up the canvas for PDF rendering
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render the page into the canvas context
    const renderContext = {
        canvasContext: context,
        viewport: viewport,
    };
    await page.render(renderContext).promise;

    // Update page counters
    document.getElementById('page-num').textContent = pageNum;
    document.getElementById('page-count').textContent = pdfDoc.numPages;
}

// Function to render the PDF
async function renderPDF() {
    try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        pdfDoc = await loadingTask.promise;
        renderPage(currentPage);
    } catch (error) {
        console.error('Error rendering PDF:', error);
    }
}

// Handle Previous and Next Page buttons
document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage <= 1) return;
    currentPage--;
    renderPage(currentPage);
});

document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage >= pdfDoc.numPages) return;
    currentPage++;
    renderPage(currentPage);
});

// Signature Pad Functionality
document.addEventListener('DOMContentLoaded', () => {
    renderPDF();

    // Signature Pad Setup
    const signaturePad = document.getElementById('signature-pad');
    const ctx = signaturePad.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function draw(e) {
        if (!isDrawing) return;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function stopDrawing() {
        isDrawing = false;
    }

    // Event listeners for mouse actions on the signature pad
    signaturePad.addEventListener('mousedown', startDrawing);
    signaturePad.addEventListener('mousemove', draw);
    signaturePad.addEventListener('mouseup', stopDrawing);
    signaturePad.addEventListener('mouseout', stopDrawing);

    // Clear Signature Pad
    document.getElementById('clear-btn').addEventListener('click', () => {
        ctx.clearRect(0, 0, signaturePad.width, signaturePad.height);
    });

    // Save the Signature
    document.getElementById('save-btn').addEventListener('click', () => {
        const dataURL = signaturePad.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'signature.png';
        link.click();
    });
});

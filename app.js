// Lấy các phần tử từ HTML
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const downloadButton = document.getElementById('downloadButton');
const resultText = document.getElementById('resultText');

// Kiểm tra trình duyệt có hỗ trợ Web Speech API không
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    alert('Rất tiếc, trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.');
}

const recognition = new SpeechRecognition();

// --- Cấu hình nhận dạng giọng nói ---
recognition.lang = 'en-US'; // Đặt ngôn ngữ là Tiếng Việt
recognition.interimResults = true; // Hiển thị kết quả tạm thời
recognition.continuous = true; // Ghi âm liên tục

let finalTranscript = ''; // Chuỗi để lưu kết quả cuối cùng

recognition.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
        } else {
            interimTranscript += event.results[i][0].transcript;
        }
    }
    // Hiển thị kết quả cuối cùng (có thể chỉnh sửa)
    resultText.innerHTML = finalTranscript + '<i style="color:grey;">' + interimTranscript + '</i>';
};

recognition.onend = () => {
    console.log('Nhận dạng giọng nói đã dừng.');
    startButton.disabled = false;
    stopButton.disabled = true;
};

recognition.onerror = (event) => {
    console.error('Lỗi nhận dạng giọng nói:', event.error);
};

// --- Xử lý sự kiện cho các nút ---
startButton.addEventListener('click', () => {
    finalTranscript = resultText.innerHTML.replace(/<[^>]*>/g, ''); // Giữ lại văn bản đã có
    recognition.start();
    console.log('Bắt đầu ghi âm...');
    startButton.disabled = true;
    stopButton.disabled = false;
});

stopButton.addEventListener('click', () => {
    recognition.stop();
    startButton.disabled = false;
    stopButton.disabled = true;
});

downloadButton.addEventListener('click', () => {
    const textToSave = resultText.innerText; // Lấy toàn bộ văn bản trong ô
    
    if (!textToSave.trim()) {
        alert('Không có nội dung để tải xuống.');
        return;
    }

    // Tạo tài liệu docx
    generateDocx(textToSave);
});

// --- Hàm tạo và tải file .docx ---
function generateDocx(text) {
    // Tách văn bản thành các đoạn dựa trên dấu xuống dòng
    const paragraphs = text.split('\n').map(line => 
        new docx.Paragraph({
            children: [new docx.TextRun(line)],
        })
    );

    const doc = new docx.Document({
        sections: [{
            properties: {},
            children: paragraphs,
        }],
    });

    // Tạo file và kích hoạt tải xuống
    docx.Packer.toBlob(doc).then(blob => {
        console.log(blob);
        // Sử dụng FileSaver.js hoặc cách thủ công để tải
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'van-ban-chuyen-doi.docx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
}
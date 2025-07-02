// src/lib/pdfService.js
export const savePDFFile = async (file, analysisId) => {
    try {
        // Convert file to base64 for storage
        const fileToBase64 = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        };

        const base64File = await fileToBase64(file);

        // In production, you'd save this to a file storage service
        // For now, we'll store in localStorage (not recommended for production)
        localStorage.setItem(`pdf_${analysisId}`, base64File);

        return {
            success: true,
            fileUrl: `pdf_${analysisId}`
        };
    } catch (error) {
        console.error('Error saving PDF:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export const getPDFFile = (analysisId) => {
    try {
        const base64File = localStorage.getItem(`pdf_${analysisId}`);
        return base64File;
    } catch (error) {
        console.error('Error retrieving PDF:', error);
        return null;
    }
};
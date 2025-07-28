// Utility untuk membuat prompt yang disesuaikan dengan jenis konten
export class NotesPromptGenerator {
    static createPrompt(text, language, sourceType, metadata = {}) {
        const languageConfig = this.getLanguageConfig(language);
        const sourceSpecificPrompt = this.getSourceSpecificPrompt(sourceType, metadata, languageConfig);

        return `${sourceSpecificPrompt}

KONTEN YANG AKAN DIANALISIS:
"${text}"

INSTRUKSI DETAIL PEMBUATAN CATATAN:

🎯 TUJUAN: Buat catatan pembelajaran yang komprehensif, terstruktur, dan actionable dalam ${languageConfig.name}

📋 FORMAT YANG DIHARAPKAN:

1. JUDUL
   - Buat judul yang menarik dan deskriptif
   - Awali dengan emotikon yang relevan dengan topik
   - Maksimal 10 kata, fokus pada value proposition

2. RINGKASAN 
   - Tulis dalam 2-3 kalimat yang menangkap esensi utama
   - Jelaskan apa yang akan dipelajari pembaca
   - Gunakan bahasa yang mudah dipahami

3. POIN KUNCI (5-8 poin)
   - Setiap poin harus spesifik dan actionable
   - Berikan penjelasan yang jelas (2-3 kalimat)
   - Rating kepentingan 1-5 berdasarkan dampak pada pembelajaran
   - Prioritaskan konsep yang dapat diterapkan

4. TOPIK UTAMA (3-6 tema)
   - Identifikasi tema besar yang dibahas
   - Gunakan kata kunci yang mudah dicari
   - Fokus pada konsep inti

5. ITEM TINDAKAN
   - Hal konkret yang bisa dilakukan setelah mempelajari materi
   - Berikan langkah spesifik, bukan saran umum
   - Minimal 3-5 action items yang praktis

6. KUTIPAN PENTING
   - Pilih quote yang memorable atau memberikan insight
   - Berikan konteks yang jelas dimana quote tersebut muncul
   - Maksimal 3-4 kutipan terbaik

7. KONSEP TERKAIT
   - Topik yang berhubungan untuk eksplorasi lebih lanjut
   - Bantu pembaca menemukan koneksi dengan topik lain
   - 4-6 konsep yang relevan

8. PERTANYAAN STUDI (5-7 pertanyaan)
   - Buat pertanyaan yang menguji pemahaman mendalam
   - Kombinasi pertanyaan faktual dan analitis
   - Bantu pembaca reflect dan internalisasi materi

9. TAG
   - 5-10 kata kunci untuk kategorisasi
   - Gunakan istilah yang umum digunakan
   - Bantu dalam pencarian dan filtering

${languageConfig.instruction}

⚠️ PENTING: 
- Jangan gunakan format markdown (**, _, dll)
- Semua output harus dalam format JSON sesuai schema
- Pastikan semua bagian terisi dengan informasi berkualitas
- Fokus pada pembelajaran yang praktis dan actionable`;
    }

    static getLanguageConfig(language) {
        const configs = {
            'indonesian': {
                name: 'Bahasa Indonesia',
                instruction: 'Gunakan Bahasa Indonesia yang natural dan mudah dipahami. Hindari jargon teknis yang tidak perlu. Pastikan terminologi konsisten dan sesuai konteks Indonesia.'
            },
            'english': {
                name: 'English',
                instruction: 'Use clear, natural English that is accessible to learners. Avoid unnecessary jargon while maintaining proper terminology. Ensure consistency in language use.'
            },
            'arab': {
                name: 'Arabic',
                instruction: 'استخدم اللغة العربية الواضحة والطبيعية التي يمكن للمتعلمين فهمها بسهولة. تجنب المصطلحات الفنية غير الضرورية مع الحفاظ على المصطلحات المناسبة.'
            }
        };
        return configs[language] || configs['indonesian'];
    }

    static getSourceSpecificPrompt(sourceType, metadata, languageConfig) {
        switch (sourceType) {
            case 'youtube':
                return this.getYouTubePrompt(metadata, languageConfig);
            case 'file':
                return this.getFilePrompt(metadata, languageConfig);
            case 'pdf':
                return this.getPDFPrompt(metadata, languageConfig);
            default:
                return this.getGeneralPrompt(languageConfig);
        }
    }

    static getYouTubePrompt(metadata, languageConfig) {
        const { title, duration, videoId } = metadata || {};

        return `🎥 ANALISIS VIDEO YOUTUBE
${title ? `Judul Video: "${title}"` : ''}
${duration ? `Durasi: ${duration}` : ''}
${videoId ? `Video ID: ${videoId}` : ''}

KONTEKS KHUSUS YOUTUBE:
- Ini adalah transkrip dari video YouTube yang perlu dianalisis untuk pembelajaran
- Video biasanya memiliki alur pembahasan yang kronologis
- Perhatikan poin-poin utama yang disampaikan pembicara
- Identifikasi momen-momen penting atau insight yang valuable
- Ekstrak wisdom atau pembelajaran praktis yang dapat diterapkan
- Perhatikan jika ada call-to-action atau rekomendasi dari pembicara

FOCUS AREA untuk YouTube:
✅ Poin utama yang dibahas pembicara
✅ Insight atau tips praktis
✅ Contoh konkret atau case study yang disebutkan
✅ Rekomendasi atau langkah selanjutnya
✅ Quote memorable dari pembicara
✅ Konsep yang dapat dipelajari lebih lanjut`;
    }

    static getFilePrompt(metadata, languageConfig) {
        const { filename, wordCount, fileType } = metadata || {};

        return `📄 ANALISIS DOKUMEN
${filename ? `Nama File: "${filename}"` : ''}
${wordCount ? `Jumlah Kata: ${wordCount}` : ''}
${fileType ? `Jenis File: ${fileType}` : ''}

KONTEKS KHUSUS DOKUMEN:
- Ini adalah konten dari dokumen yang perlu dianalisis untuk pembelajaran
- Dokumen biasanya memiliki struktur dan hierarki informasi
- Perhatikan bagian-bagian penting dan hubungan antar konsep
- Identifikasi informasi kunci dari setiap bagian
- Ekstrak konsep utama dan definisi penting
- Perhatikan jika ada data, statistik, atau fakta penting

FOCUS AREA untuk Dokumen:
✅ Struktur dan organisasi informasi
✅ Konsep kunci dan definisi
✅ Data atau statistik penting
✅ Metodologi atau framework yang dibahas
✅ Kesimpulan atau rekomendasi
✅ Referensi atau sumber yang disebutkan`;
    }

    static getPDFPrompt(metadata, languageConfig) {
        const { filename, pageCount, wordCount } = metadata || {};

        return `📚 ANALISIS PDF DOKUMEN
${filename ? `Nama File: "${filename}"` : ''}
${pageCount ? `Jumlah Halaman: ${pageCount}` : ''}
${wordCount ? `Jumlah Kata: ${wordCount}` : ''}

KONTEKS KHUSUS PDF:
- Ini adalah konten dari file PDF yang perlu dianalisis untuk pembelajaran
- PDF sering kali berupa dokumen formal, paper, atau materi pembelajaran
- Perhatikan struktur akademik atau professional
- Identifikasi abstract, introduction, metodologi, hasil, dan kesimpulan
- Ekstrak informasi dari tabel, diagram, atau visual jika disebutkan
- Perhatikan referensi dan citation yang penting

FOCUS AREA untuk PDF:
✅ Struktur dokumen (abstract, intro, body, conclusion)
✅ Metodologi atau approach yang digunakan
✅ Temuan atau hasil utama
✅ Implikasi praktis dari penelitian/analisis
✅ Keterbatasan dan future research
✅ Key references atau further reading`;
    }

    static getGeneralPrompt(languageConfig) {
        return `📝 ANALISIS KONTEN UMUM

KONTEKS UMUM:
- Ini adalah teks yang perlu dianalisis untuk pembelajaran
- Ekstrak informasi dan konsep penting
- Identifikasi struktur dan tema utama
- Cari poin-poin yang dapat ditindaklanjuti

FOCUS AREA untuk Konten Umum:
✅ Tema dan topik utama
✅ Konsep kunci yang dibahas
✅ Informasi faktual penting
✅ Insights atau pembelajaran
✅ Aplikasi praktis
✅ Konsep yang dapat dieksplorasi lebih lanjut`;
    }

    static validateText(text) {
        if (!text || typeof text !== 'string') {
            throw new Error('Text content is required');
        }

        if (text.trim().length < 50) {
            throw new Error('Text content is too short for meaningful analysis (minimum 50 characters)');
        }

        if (text.length > 100000) {
            throw new Error('Text content is too long (maximum 100,000 characters)');
        }

        return true;
    }

    static extractVideoMetadata(videoData) {
        return {
            title: videoData?.title || '',
            duration: videoData?.duration || '',
            videoId: videoData?.videoId || '',
            url: videoData?.url || ''
        };
    }

    static extractFileMetadata(fileData) {
        return {
            filename: fileData?.filename || '',
            fileType: fileData?.type || '',
            wordCount: fileData?.wordCount || 0,
            size: fileData?.size || 0
        };
    }
}

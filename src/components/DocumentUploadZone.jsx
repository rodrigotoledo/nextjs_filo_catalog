"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "@uploadthing/react";
import { FileText, Upload, X } from "lucide-react";

export default function DocumentUploadZone({ clientId, onDocumentUploaded }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = useCallback(async (fileList) => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('clientId', clientId);

    try {
      const response = await fetch('/api/upload-documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      console.log('Document upload successful:', result);

      // Callback para atualizar a lista de documentos do client
      if (onDocumentUploaded) {
        onDocumentUploaded(result);
      }

      alert(`${fileList.length} documento(s) enviado(s)! Processamento com IA iniciado.`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro no upload. Tente novamente.');
      setUploading(false);
      return;
    }

    setProgress(100);
    setTimeout(() => {
      setFiles([]);
      setProgress(0);
      setUploading(false);
    }, 600);
  }, [clientId, onDocumentUploaded]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
    handleUpload(acceptedFiles);
  }, [handleUpload]);

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
    },
    multiple: true,
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Lista de arquivos selecionados */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Arquivos selecionados:</h4>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-background/50 border border-border rounded-lg p-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-xs text-muted">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-red-500/10 rounded"
                disabled={uploading}
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Área de upload */}
      <div className="flex flex-col">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 text-center cursor-pointer transition-all bg-card/50 flex-1 flex items-center justify-center
            ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
            ${uploading && "opacity-70"}
          `}
        >
          <input {...getInputProps()} />

          {uploading ? (
            <div className="space-y-2 sm:space-y-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <div className="text-lg sm:text-xl md:text-3xl font-semibold">{progress}%</div>
              <div className="w-full max-w-sm mx-auto bg-border rounded-full h-1.5 sm:h-2 md:h-3">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted">Processando {files.length} documento(s)...</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              <Upload className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto text-muted" />
              <p className="text-sm sm:text-base md:text-lg font-medium">
                {isDragActive ? "Solte aqui" : "Arraste ou clique"}
              </p>
              <p className="text-xs text-muted">
                PDF, JPG, PNG, DOC, DOCX
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

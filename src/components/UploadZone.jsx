"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "@uploadthing/react";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, Image } from "lucide-react";

export default function UploadZone() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const handleUpload = useCallback(async (fileList) => {
    if (!description.trim()) {
      alert("Descrição é obrigatória!");
      return;
    }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('description', description);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      queryClient.invalidateQueries({ queryKey: ['photos'] });
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
      setDescription(""); // Clear description
      alert(`${fileList.length} fotos enviadas! Já estão na fila para processamento com IA.`);
    }, 600);
  }, [queryClient, description]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
    handleUpload(acceptedFiles);
  }, [handleUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Campo de descrição */}
      <div>
        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
          Descrição das fotos <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: viagem para praia, cachorros brincando..."
          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-card border border-border rounded-lg sm:rounded-xl focus:border-primary/60 focus:outline-none text-sm sm:text-base"
          required
        />
      </div>

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
              <p className="text-xs text-muted">Processando {files.length}...</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              <Upload className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto text-muted" />
              <p className="text-sm sm:text-base md:text-lg font-medium">
                {isDragActive ? "Solte aqui" : "Arraste ou clique"}
              </p>
              <p className="text-xs text-muted">
                Fotos ilimitadas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
      console.log('Upload successful:', result);
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      {/* Coluna da descrição */}
      <div className="flex flex-col h-full">
        <label className="block text-sm font-medium mb-2">
          Descrição das fotos <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva as fotos que vai enviar (ex: fotos da viagem para praia, cachorros brincando no parque...)"
          className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:border-primary/60 focus:outline-none resize-none flex-1"
          rows={6}
          required
        />
      </div>

      {/* Coluna do upload */}
      <div className="flex flex-col h-full">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all bg-card/50 flex-1 flex items-center justify-center
            ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
            ${uploading && "opacity-70"}
          `}
        >
          <input {...getInputProps()} />

          {uploading ? (
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <div className="text-3xl font-semibold">{progress}%</div>
              <div className="w-full max-w-sm mx-auto bg-border rounded-full h-3">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-muted">Processando {files.length} imagens...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <Upload className="w-16 h-16 mx-auto text-muted" />
              <p className="text-2xl font-medium">
                {isDragActive ? "Solte as fotos aqui" : "Arraste ou clique para fazer upload"}
              </p>
              <p className="text-sm text-muted">
                Aceita milhares de fotos de uma vez • Totalmente privado
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

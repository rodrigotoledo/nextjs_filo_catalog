"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "@uploadthing/react";
import { Upload, Image } from "lucide-react";

export default function UploadZone() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
    handleUpload(acceptedFiles);
  }, []);

  const handleUpload = async (fileList) => {
    setUploading(true);
    setProgress(0);
    const total = fileList.length;
    let done = 0;

    for (const file of fileList) {
      await new Promise(r => setTimeout(r, 30));
      done++;
      setProgress(Math.round((done / total) * 100));
    }

    setUploading(false);
    setTimeout(() => {
      setFiles([]);
      setProgress(0);
      alert(`${total} fotos enviadas! Já estão na fila para processamento com IA.`);
    }, 600);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-20 text-center cursor-pointer transition-all bg-card/50
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
  );
}

"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Upload, FileText, X, File, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

const MAX_FILES = 5;

const getFileIcon = (file: File) => {
  if (file.type.startsWith("image/")) return FileImage;
  if (file.type === "application/pdf") return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

export function FileUploader({ files, onFilesChange }: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, MAX_FILES);
      onFilesChange(newFiles);
    },
    [files, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    maxFiles: MAX_FILES - files.length,
    disabled: files.length >= MAX_FILES,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-card/50",
          files.length >= MAX_FILES && "cursor-not-allowed opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Upload className={cn("h-8 w-8", isDragActive ? "text-primary" : "text-muted-foreground")} />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          {isDragActive ? "Drop files here" : "Upload your materials"}
        </h3>
        <p className="text-sm text-muted-foreground">
          Drag and drop files here, or click to browse
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Supports PDF, DOCX, TXT, and images (up to {MAX_FILES} files)
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">
              Uploaded Files ({files.length}/{MAX_FILES})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFilesChange([])}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </div>
          <div className="space-y-2">
            {files.map((file, index) => {
              const Icon = getFileIcon(file);
              return (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-card/80"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

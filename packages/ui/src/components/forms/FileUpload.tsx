"use client";

import React, { useCallback, useState } from "react";
import { useDropzone, FileRejection, DropzoneOptions } from "react-dropzone";
import { UploadCloud, File, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

export interface FileUploadProps extends Omit<DropzoneOptions, "onDrop"> {
  onUpload?: (file: File) => Promise<void>;
  value?: string;
  className?: string;
  maxSize?: number;
  accept?: Record<string, string[]>;
}

export function FileUpload({
  onUpload,
  value,
  className,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept,
  ...dropzoneProps
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        setStatus("error");
        setErrorMsg(rejectedFiles[0].errors[0].message);
        return;
      }

      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setStatus("uploading");
        setErrorMsg(null);

        // Generate preview for images
        if (selectedFile.type.startsWith("image/")) {
          const objectUrl = URL.createObjectURL(selectedFile);
          setPreview(objectUrl);
        } else {
          setPreview(null);
        }

        if (onUpload) {
          try {
            await onUpload(selectedFile);
            setStatus("success");
          } catch (err: any) {
            setStatus("error");
            setErrorMsg(err.message || "Upload failed");
          }
        } else {
          // If no upload handler, just show success
          setStatus("success");
        }
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept,
    multiple: false,
    ...dropzoneProps,
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    setStatus("idle");
    setErrorMsg(null);
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          status === "error" && "border-destructive/50 bg-destructive/5",
          (status === "success" || file) && "border-success/50 bg-success/5"
        )}
      >
        <input {...getInputProps()} />

        {/* Uploading State */}
        {status === "uploading" && (
          <div className="flex flex-col items-center justify-center space-y-3 py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium">Uploading {file?.name}...</p>
          </div>
        )}

        {/* Success / Preview State */}
        {(status === "success" || (status === "idle" && preview)) && file && (
          <div className="flex w-full items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              {preview ? (
                <div className="h-16 w-16 overflow-hidden rounded-lg border border-border">
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <File className="h-8 w-8" />
                </div>
              )}
              <div className="flex flex-col">
                <p className="text-sm font-medium line-clamp-1">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {status === "success" && (
                  <span className="flex items-center text-xs font-medium text-success mt-1">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Upload complete
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center space-y-2 py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
              <AlertCircle className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-destructive">Upload Failed</p>
            <p className="text-xs text-muted-foreground text-center max-w-[250px]">
              {errorMsg}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                setStatus("idle");
              }}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Idle State */}
        {status === "idle" && !file && !preview && (
          <div className="flex flex-col items-center justify-center space-y-2 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">
              <span className="text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              SVG, PNG, JPG or PDF (max. {maxSize / 1024 / 1024}MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

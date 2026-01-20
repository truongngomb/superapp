/**
 * Reusable File Uploader Component
 * Support image preview, drag & drop, file validation
 */
import { useRef, useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@superapp/core-logic';

interface FileUploaderProps {
  value?: File | string; // File object or URL
  onChange?: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in bytes
  label?: string;
  preview?: boolean;
  className?: string;
  disabled?: boolean;
}

export function FileUploader({
  value,
  onChange,
  accept = 'image/*',
  maxSize = 5242880, // 5MB
  label = 'Upload File',
  preview = true,
  className,
  disabled = false,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  
  const previewUrl = value instanceof File 
    ? URL.createObjectURL(value) 
    : value;
  
  const handleFile = (file: File) => {
    if (disabled || !onChange) return;
    setError('');
    
    // Validate file size
    if (file.size > maxSize) {
      setError(`File size exceeds ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      return;
    }
    
    onChange(file);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };
  
  const handleDrag = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files.item(0);
      if (file) handleFile(file);
    }
  };
  
  const handleRemove = () => {
    if (disabled || !onChange) return;
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };
  
  return (
    <div className={className}>
      {/* Preview */}
      {preview && previewUrl && (
        <div className="relative mb-3">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className={cn(
              "w-full h-48 object-contain rounded-lg",
              disabled && "opacity-60"
            )}
          />
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-surface/90"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
      
      {/* Upload Area */}
      {!previewUrl && (
        <div
          className={cn(
            'h-full border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            disabled 
              ? 'border-border bg-muted/30 cursor-not-allowed opacity-60' 
              : 'cursor-pointer hover:border-primary',
            dragActive && !disabled && 'border-primary bg-primary/5',
            error && 'border-red-500'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted" />
          <p className="text-sm text-muted mb-2">{label}</p>
          {!disabled && (
            <>
              <p className="text-xs text-muted">or drag and drop</p>
              <p className="text-xs text-muted mt-1">
                Max {(maxSize / 1024 / 1024).toFixed(1)}MB
              </p>
            </>
          )}
        </div>
      )}
      
      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      
      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}

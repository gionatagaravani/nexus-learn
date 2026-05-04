"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, FileText, MoreVertical, Search, FileImage, FileBarChart, X } from "lucide-react";

interface Material {
  id: string
  subject_id: string
  storage_path: string
  filename: string
  file_type: string
  file_size: number
  created_at: string
}

export function MaterialsTab({ subjectId, userId }: { subjectId: string; userId?: string }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMaterials = async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `/api/materials/list?subjectId=${subjectId}&userId=${userId}`
      );
      const { materials: data } = await response.json();
      setMaterials(data || []);
    } catch (error) {
      console.error("Failed to load materials:", error);
    }
  };

  const filteredMaterials = materials.filter((m) =>
    m.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    loadMaterials();
  }, [subjectId, userId]);

  const handleUpload = async (file: File) => {
    if (!userId) {
      alert("Please sign in to upload materials");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subjectId", subjectId);
      formData.append("userId", userId);

      const response = await fetch("/api/materials/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      await loadMaterials();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5" strokeWidth={2} />;
      case 'image':
        return <FileImage className="w-5 h-5" strokeWidth={2} />;
      case 'slide':
        return <FileBarChart className="w-5 h-5" strokeWidth={2} />;
      default:
        return <FileText className="w-5 h-5" strokeWidth={2} />;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-9 pr-4 rounded-md bg-white border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus:border-neutral-300 focus:outline-none focus:ring-4 focus:ring-black/[0.03] text-sm transition-all placeholder:text-neutral-400"
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.png,.jpg,.jpeg,.ppt,.pptx"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="h-8 flex items-center gap-2 px-3 rounded-md bg-black text-white text-xs font-semibold transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:bg-neutral-800 focus:outline-none focus:ring-4 focus:ring-black/[0.04] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UploadCloud className="w-3.5 h-3.5" strokeWidth={2.5} />
          Upload material
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMaterials.map((material) => (
          <div
            key={material.id}
            className="bg-white rounded-[12px] border border-black/[0.08] p-5 flex gap-4 items-start shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-black/[0.15] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all group cursor-pointer"
          >
            <div className="p-3 rounded-lg bg-black/[0.04] text-black">
              {getFileIcon(material.file_type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-semibold text-black truncate" title={material.filename}>
                {material.filename}
              </h4>
              <p className="text-[12px] text-neutral-500 mt-0.5 font-medium">
                {formatFileSize(material.file_size)}
              </p>
              <div className="flex items-center gap-3 mt-3 text-[12px] font-semibold text-black opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="hover:underline">Summarize</span>
                <span className="hover:underline">Chat</span>
              </div>
            </div>
            <button className="text-neutral-400 hover:text-black transition-colors rounded-md hover:bg-black/[0.04] p-1">
              <MoreVertical className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        ))}

        {/* Upload Dropzone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border border-dashed border-black/[0.15] bg-[#FAFAFA] rounded-[12px] p-4 flex flex-col items-center justify-center text-center hover:bg-neutral-100/50 hover:border-black/[0.3] transition-colors cursor-pointer min-h-[140px]"
        >
          {isUploading ? (
            <>
              <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin mb-2" />
              <p className="text-[13px] font-semibold text-black">Uploading...</p>
            </>
          ) : (
            <>
              <UploadCloud className="w-5 h-5 text-neutral-400 mb-2" strokeWidth={2} />
              <p className="text-[13px] font-semibold text-black">Drag & drop material</p>
              <p className="text-[12px] text-neutral-500 mt-1 font-medium">PDF, PPTX, Images</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

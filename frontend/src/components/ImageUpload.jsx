import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ImageUpload({ value, onChange, label }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.mimetype && !file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
        // No headers needed for FormData; browser sets Content-Type boundary
      });

      const data = await res.json();
      if (data.success) {
        onChange(data.filePath);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Network error during upload');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onChange('');
  };

  // Helper to determine image src
  const getImgSrc = (val) => {
    if (!val) return null;
    if (val.startsWith('http')) return val;
    if (val.startsWith('/uploads')) return `${API_URL}${val}`;
    return val; // Fallback for /images/ paths
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      
      <div className="flex items-start gap-4">
        {/* Preview Area */}
        <div className="relative w-32 h-32 bg-gray-100 dark:bg-white/5 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10 flex items-center justify-center overflow-hidden transition-colors duration-500">
          {value ? (
            <>
              <img 
                src={getImgSrc(value)} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <ImageIcon className="text-gray-400 dark:text-white/20" size={32} />
          )}
          
          {uploading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1 space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 border border-primary text-primary 
                       rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium"
          >
            <Upload size={16} />
            {value ? 'Change Image' : 'Upload Image'}
          </button>
          <p className="text-[11px] text-gray-400 dark:text-white/30">
            JPG, PNG or SVG. Max size 5MB.
          </p>
          
          {/* Fallback Manual Input */}
          <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or enter image URL manualy..."
            className="w-full p-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-[11px] outline-none focus:border-primary text-dark dark:text-fontwhite transition-colors duration-500"
          />
        </div>
      </div>
    </div>
  );
}

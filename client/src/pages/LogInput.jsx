import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL + '/endpoints';
const MAX_FILE_SIZE = 15 * 1024 * 1024;

const isImageFile = (file) => file.type.startsWith('image/');

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getAttachmentIcon = (file) => {
  if (isImageFile(file)) return 'image';
  if (file.type.includes('pdf')) return 'picture_as_pdf';
  if (file.type.includes('word') || file.name.match(/\.(doc|docx)$/i)) return 'description';
  if (file.type.includes('sheet') || file.name.match(/\.(xls|xlsx|csv)$/i)) return 'table_chart';
  if (file.type.includes('zip') || file.name.match(/\.(zip|rar|7z)$/i)) return 'folder_zip';
  return 'attach_file';
};

const LogInput = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '',
    task_desc: '',
    day_number: '',
    week_number: '',
  });
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [liveTime, setLiveTime] = useState(
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  );
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(
        new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      attachments.forEach((attachment) => {
        if (attachment.preview) URL.revokeObjectURL(attachment.preview);
      });
    };
  }, [attachments]);

  const addAttachments = (fileList) => {
    const next = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.size > MAX_FILE_SIZE) continue;
      next.push({
        file,
        preview: isImageFile(file) ? URL.createObjectURL(file) : null,
      });
    }
    setAttachments((prev) => [...prev, ...next]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => {
      const target = prev[index];
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files.length) addAttachments(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('user_id', user.id);
      submitData.append('task_desc', formData.task_desc);
      submitData.append('hours', parseFloat(formData.hours));
      submitData.append('log_date', formData.date);
      if (formData.day_number) submitData.append('day_number', formData.day_number);
      if (formData.week_number) submitData.append('week_number', formData.week_number);
      attachments.forEach((attachment) => submitData.append('photos[]', attachment.file));

      await axios.post(`${API_BASE}/create.php`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/');
    } catch (error) {
      console.error('Error saving log', error);
      alert('Failed to save log.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-grid-pattern selection:bg-primary selection:text-black">
      <div className="z-10 flex items-center justify-between border-b border-primary/20 bg-background-dark/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-primary transition-colors hover:text-white">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <h2 className="text-base font-bold tracking-widest text-white">NEW LOG ENTRY</h2>
            <span className="text-[10px] font-mono tracking-widest text-primary/70">SYS_VER 5.0.0</span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto p-4 pb-36">
        <div className="mb-6 flex justify-center">
          <div className="flex items-center gap-3 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-mono tracking-widest text-primary">
            <span>TRAINING STATUS</span>
            <span className="text-primary/40">|</span>
            <span className="font-bold">{liveTime}</span>
            <span className="text-[10px] text-matrix-green">ACTIVE</span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-matrix-green"></span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-2xl rounded-xl border border-primary/20 bg-surface-dark/60 p-6 shadow-[0_0_30px_rgba(0,242,255,0.05)] backdrop-blur-lg">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-bold tracking-wide text-primary">
            <span className="material-symbols-outlined text-sm">terminal</span>
            TASK DETAILS
          </h3>

          <form id="log-input-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="col-span-1 group">
                <label className="mb-1 block text-xs font-mono tracking-wider text-primary/60 transition-colors group-focus-within:text-primary">&gt; DAY #</label>
                <input
                  type="number"
                  min="1"
                  value={formData.day_number}
                  onChange={(e) => setFormData({ ...formData, day_number: e.target.value })}
                  className="w-full rounded-lg border border-primary/30 bg-background-dark/80 px-4 py-3 text-center text-lg text-white transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="-"
                />
              </div>
              <div className="col-span-1 group">
                <label className="mb-1 block text-xs font-mono tracking-wider text-primary/60 transition-colors group-focus-within:text-primary">&gt; WEEK #</label>
                <input
                  type="number"
                  min="1"
                  value={formData.week_number}
                  onChange={(e) => setFormData({ ...formData, week_number: e.target.value })}
                  className="w-full rounded-lg border border-primary/30 bg-background-dark/80 px-4 py-3 text-center text-lg text-white transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="-"
                />
              </div>
              <div className="col-span-2 group">
                <label className="mb-1 block text-xs font-mono tracking-wider text-primary/60 transition-colors group-focus-within:text-primary">&gt; DATE [YYYY-MM-DD]</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-lg border border-primary/30 bg-background-dark/80 px-4 py-3 text-white transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="mb-1 block text-xs font-mono tracking-wider text-primary/60 transition-colors group-focus-within:text-primary">&gt; DURATION [HRS]</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.5"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  className="w-full rounded-lg border border-primary/30 bg-background-dark/80 px-4 py-3 pr-10 text-white transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="0.0"
                  required
                />
                <span className="material-symbols-outlined absolute right-3 text-primary/50">schedule</span>
              </div>
            </div>

            <div className="group">
              <label className="mb-1 block text-xs font-mono tracking-wider text-primary/60 transition-colors group-focus-within:text-primary">&gt; TASK_DESCRIPTION</label>
              <textarea
                rows="4"
                value={formData.task_desc}
                onChange={(e) => setFormData({ ...formData, task_desc: e.target.value })}
                className="w-full resize-none rounded-lg border border-primary/30 bg-background-dark/80 px-4 py-3 text-white transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Describe your training tasks..."
                required
              ></textarea>
            </div>

            <div className="group">
              <label className="mb-1 block text-xs font-mono tracking-wider text-primary/60">&gt; ATTACHMENTS [{attachments.length} ATTACHED]</label>

              {attachments.length > 0 && (
                <div className="mb-3 grid gap-2 sm:grid-cols-2">
                  {attachments.map((attachment, i) => (
                    <div key={`${attachment.file.name}-${i}`} className="relative overflow-hidden rounded-lg border border-primary/20 bg-background-dark/60">
                      {attachment.preview ? (
                        <img src={attachment.preview} alt={attachment.file.name} className="h-28 w-full object-cover" />
                      ) : (
                        <div className="flex h-28 flex-col items-center justify-center gap-2 text-slate-300">
                          <span className="material-symbols-outlined text-3xl text-primary/70">{getAttachmentIcon(attachment.file)}</span>
                          <span className="px-3 text-center text-xs">{attachment.file.name}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2 px-3 py-2 text-[10px] font-mono text-slate-300">
                        <span className="truncate">{attachment.file.name}</span>
                        <span>{formatFileSize(attachment.file.size)}</span>
                      </div>
                      <button type="button" onClick={() => removeAttachment(i)} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/80">
                        <span className="material-symbols-outlined text-xs text-white">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 transition-all duration-300 ${
                  dragActive ? 'border-primary bg-primary/10' : 'border-primary/20 bg-background-dark/50 hover:border-primary/50 hover:bg-primary/5'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <span className="material-symbols-outlined text-xl text-primary">attach_file</span>
                <p className="text-xs font-mono text-primary/80">{attachments.length > 0 ? 'ADD MORE FILES' : 'TAP TO UPLOAD OR DRAG & DROP FILES'}</p>
                <p className="text-[10px] font-mono text-slate-500">Images, PDF, Word, Excel, ZIP, and other files up to 15MB each</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                name="photos[]"
                multiple
                onChange={(e) => {
                  addAttachments(e.target.files);
                  e.target.value = '';
                }}
                className="hidden"
              />
            </div>
          </form>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-primary/10 bg-background-dark/90 px-4 py-2 backdrop-blur-md">
        <button
          type="submit"
          form="log-input-form"
          disabled={isLoading}
          className={`group relative flex w-full items-center justify-center gap-3 rounded-xl border border-primary/50 bg-surface-dark py-3.5 shadow-[0_0_15px_rgba(0,242,255,0.2)] transition-all duration-300 hover:border-primary hover:shadow-[0_0_30px_rgba(0,242,255,0.5)] ${
            isLoading ? 'cursor-wait opacity-50' : ''
          }`}
        >
          <span className="material-symbols-outlined text-xl text-primary transition-transform group-hover:scale-110">{isLoading ? 'sync' : 'save'}</span>
          <span className="text-sm font-bold tracking-widest text-primary">{isLoading ? 'SAVING...' : 'SAVE LOG'}</span>
        </button>
      </div>
    </div>
  );
};

export default LogInput;

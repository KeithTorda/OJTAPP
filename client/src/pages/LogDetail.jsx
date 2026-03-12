import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL + '/endpoints';
const MAX_FILE_SIZE = 15 * 1024 * 1024;

const isImageMime = (mime = '') => mime.startsWith('image/');

const getAttachmentIcon = (name = '', mime = '') => {
  if (isImageMime(mime)) return 'image';
  if (mime.includes('pdf') || name.match(/\.pdf$/i)) return 'picture_as_pdf';
  if (mime.includes('word') || name.match(/\.(doc|docx)$/i)) return 'description';
  if (mime.includes('sheet') || name.match(/\.(xls|xlsx|csv)$/i)) return 'table_chart';
  if (mime.includes('zip') || name.match(/\.(zip|rar|7z)$/i)) return 'folder_zip';
  return 'attach_file';
};

const LogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [log, setLog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [editData, setEditData] = useState({ task_desc: '', hours: '', log_date: '', day_number: '' });
  const [newAttachments, setNewAttachments] = useState([]);
  const [removePhotoIds, setRemovePhotoIds] = useState([]);

  useEffect(() => {
    if (user) fetchLog();
  }, [user]);

  useEffect(() => {
    return () => {
      newAttachments.forEach((attachment) => {
        if (attachment.preview) URL.revokeObjectURL(attachment.preview);
      });
    };
  }, [newAttachments]);

  const fetchLog = async () => {
    try {
      const response = await api.get(`/read.php?user_id=${user.id}`);
      if (response.data.records) {
        const found = response.data.records.find((l) => l.id.toString() === id.toString());
        if (found) {
          setLog(found);
          setEditData({
            task_desc: found.task_desc,
            hours: found.hours,
            log_date: found.log_date,
            day_number: found.day_number || '',
            week_number: found.week_number || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching log', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addAttachments = (fileList) => {
    const added = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.size > MAX_FILE_SIZE) continue;
      added.push({
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      });
    }
    setNewAttachments((prev) => [...prev, ...added]);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    newAttachments.forEach((attachment) => {
      if (attachment.preview) URL.revokeObjectURL(attachment.preview);
    });
    setNewAttachments([]);
    setRemovePhotoIds([]);
    if (log) setEditData({ task_desc: log.task_desc, hours: log.hours, log_date: log.log_date, day_number: log.day_number || '', week_number: log.week_number || '' });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const submitData = new FormData();
      submitData.append('id', id);
      submitData.append('user_id', user.id);
      submitData.append('task_desc', editData.task_desc);
      submitData.append('hours', parseFloat(editData.hours));
      submitData.append('log_date', editData.log_date);
      submitData.append('day_number', editData.day_number);
      submitData.append('week_number', editData.week_number);
      if (removePhotoIds.length > 0) submitData.append('remove_photo_ids', removePhotoIds.join(','));
      newAttachments.forEach((attachment) => submitData.append('photos[]', attachment.file));

      await axios.post(`${API_BASE}/update_log.php`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      handleCancelEdit();
      await fetchLog();
    } catch (error) {
      console.error('Error updating log', error);
      alert('Failed to update log.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this log entry?')) return;
    try {
      await api.post('/delete.php', { id: parseInt(id), user_id: user.id });
      navigate('/logs');
    } catch (error) {
      alert('Failed to delete log.');
    }
  };

  const handleExportPdf = () => {
    window.open(`${API_BASE}/export_single_pdf.php?log_id=${id}&user_id=${user.id}`, '_blank');
  };

  const existingAttachments = log?.photos?.filter((p) => !removePhotoIds.includes(p.id)) || [];
  const imageAttachments = existingAttachments.filter((attachment) => attachment.is_image);
  const fileAttachments = existingAttachments.filter((attachment) => !attachment.is_image);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-primary text-sm flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
          LOADING RECORD...
        </div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-red-400 text-5xl">error</span>
        <p className="text-red-400 text-sm">LOG NOT FOUND</p>
        <button onClick={() => navigate('/logs')} className="text-primary text-xs underline">RETURN TO LOGS</button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-grid-pattern selection:bg-primary selection:text-black">
      <div className="flex items-center justify-between border-b border-primary/20 bg-background-dark/90 backdrop-blur-md px-3 py-3 z-10 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => navigate('/logs')} className="text-primary hover:text-white transition-colors flex-shrink-0">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div className="flex flex-col min-w-0">
            <h2 className="text-sm font-bold tracking-widest text-white truncate">
              {isEditing ? 'EDIT LOG' : 'LOG DETAIL'}
            </h2>
            <span className="text-[10px] text-primary/70 tracking-widest">
              DAY {log.day_number || '-'} // ID: {log.id.toString().padStart(4, '0')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!isEditing ? (
            <>
              <button onClick={handleExportPdf} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-sm">edit</span>
                <span className="hidden sm:inline">EDIT</span>
              </button>
              <button onClick={handleDelete} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={handleCancelEdit} className="px-2.5 py-1.5 rounded-lg border border-slate-500/30 text-slate-400 text-xs hover:bg-slate-500/10 transition-colors">CANCEL</button>
              <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-matrix-green/30 bg-matrix-green/10 text-matrix-green text-xs hover:bg-matrix-green/20 transition-colors disabled:opacity-50">
                <span className="material-symbols-outlined text-sm">save</span>
                {isSaving ? 'SAVING...' : 'SAVE'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-surface-dark border border-primary/20 flex flex-col items-center justify-center shadow-neon">
              <span className="text-[10px] text-primary/60 uppercase">Day</span>
              <span className="text-2xl font-bold text-primary leading-none">{log.day_number || '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">{log.log_date}</span>
              <span className="text-xs text-primary/60">{log.hours} HRS LOGGED</span>
              <span className="text-[10px] text-matrix-green mt-1">VERIFIED</span>
            </div>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">attach_file</span>
                <span className="text-xs text-primary/70 tracking-wider">
                  ATTACHMENTS [{isEditing ? existingAttachments.length + newAttachments.length : (log.photos?.length || 0)}]
                </span>
              </div>
            </div>

            {isEditing ? (
              <div className="p-4 space-y-3">
                {(existingAttachments.length > 0 || newAttachments.length > 0) && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {existingAttachments.map((attachment) => (
                      <div key={attachment.id} className="relative rounded-lg overflow-hidden border border-primary/20 bg-background-dark/50">
                        {attachment.is_image ? (
                          <img src={attachment.url} alt={attachment.name} className="h-28 w-full object-cover" />
                        ) : (
                          <div className="flex h-28 flex-col items-center justify-center gap-2 text-slate-300">
                            <span className="material-symbols-outlined text-3xl text-primary/70">{getAttachmentIcon(attachment.name, attachment.mime_type)}</span>
                            <span className="px-3 text-center text-xs">{attachment.name}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setRemovePhotoIds((prev) => [...prev, attachment.id])}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-white text-xs">close</span>
                        </button>
                      </div>
                    ))}
                    {newAttachments.map((attachment, i) => (
                      <div key={`new-${i}`} className="relative rounded-lg overflow-hidden border border-matrix-green/30 bg-background-dark/50">
                        {attachment.preview ? (
                          <img src={attachment.preview} alt={attachment.file.name} className="h-28 w-full object-cover" />
                        ) : (
                          <div className="flex h-28 flex-col items-center justify-center gap-2 text-slate-300">
                            <span className="material-symbols-outlined text-3xl text-primary/70">{getAttachmentIcon(attachment.file.name, attachment.file.type)}</span>
                            <span className="px-3 text-center text-xs">{attachment.file.name}</span>
                          </div>
                        )}
                        <div className="absolute top-1 left-1 px-1 bg-matrix-green/80 rounded text-[8px] text-white">NEW</div>
                        <button
                          type="button"
                          onClick={() => {
                            const target = newAttachments[i];
                            if (target?.preview) URL.revokeObjectURL(target.preview);
                            setNewAttachments((prev) => prev.filter((_, idx) => idx !== i));
                          }}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-white text-xs">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  className="flex flex-col items-center justify-center gap-2 py-5 rounded-lg border-2 border-dashed border-primary/20 bg-background-dark/50 cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="material-symbols-outlined text-primary">attach_file</span>
                  <p className="text-xs text-primary/80">ADD MORE FILES</p>
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
            ) : (
              <div className="p-4 space-y-4">
                {imageAttachments.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {imageAttachments.map((attachment, i) => (
                      <div
                        key={attachment.id}
                        className="relative rounded-lg overflow-hidden border border-primary/10 cursor-pointer group/photo aspect-video"
                        onClick={() => setLightboxUrl(attachment.url)}
                      >
                        <img src={attachment.url} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover/photo:scale-105" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-end justify-between p-2">
                          <span className="text-[10px] text-primary truncate max-w-[80%]">{attachment.name}</span>
                          <span className="material-symbols-outlined text-white/70 text-sm">fullscreen</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {fileAttachments.length > 0 && (
                  <div className="space-y-2">
                    {fileAttachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-3 rounded-lg border border-primary/10 bg-background-dark/50 px-3 py-3 hover:bg-primary/10 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="material-symbols-outlined text-primary/70">{getAttachmentIcon(attachment.name, attachment.mime_type)}</span>
                          <span className="truncate text-sm text-white">{attachment.name}</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">open_in_new</span>
                      </a>
                    ))}
                  </div>
                )}

                {existingAttachments.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-slate-500">
                    <span className="material-symbols-outlined text-3xl mb-2">attach_file</span>
                    <span className="text-xs">NO ATTACHMENTS</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-primary/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">description</span>
              <span className="text-xs text-primary/70 tracking-wider">TASK_DETAILS</span>
            </div>

            {isEditing ? (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-primary/60 text-xs mb-1">&gt; DAY #</label>
                    <input type="number" min="1" value={editData.day_number} onChange={(e) => setEditData({...editData, day_number: e.target.value})}
                      className="w-full bg-background-dark/80 border border-primary/30 rounded-lg py-2.5 px-4 text-white text-center text-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" placeholder="-" />
                  </div>
                  <div>
                    <label className="block text-primary/60 text-xs mb-1">&gt; WEEK #</label>
                    <input type="number" min="1" value={editData.week_number} onChange={(e) => setEditData({...editData, week_number: e.target.value})}
                      className="w-full bg-background-dark/80 border border-primary/30 rounded-lg py-2.5 px-4 text-white text-center text-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" placeholder="-" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-primary/60 text-xs mb-1">&gt; DATE</label>
                    <input type="date" value={editData.log_date} onChange={(e) => setEditData({...editData, log_date: e.target.value})}
                      className="w-full bg-background-dark/80 border border-primary/30 rounded-lg py-2.5 px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-primary/60 text-xs mb-1">&gt; DURATION [HRS]</label>
                  <input type="number" step="0.5" value={editData.hours} onChange={(e) => setEditData({...editData, hours: e.target.value})}
                    className="w-full bg-background-dark/80 border border-primary/30 rounded-lg py-2.5 px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-primary/60 text-xs mb-1">&gt; DESCRIPTION</label>
                  <textarea rows="5" value={editData.task_desc} onChange={(e) => setEditData({...editData, task_desc: e.target.value})}
                    className="w-full bg-background-dark/80 border border-primary/30 rounded-lg py-2.5 px-4 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none"></textarea>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-primary/50 tracking-wider">DATE</span>
                    <span className="text-sm text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary/40 text-[14px]">calendar_month</span>{log.log_date}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-primary/50 tracking-wider">DURATION</span>
                    <span className="text-sm text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary/40 text-[14px]">schedule</span>{log.hours} HRS
                    </span>
                  </div>
                </div>
                <div className="h-px bg-primary/10"></div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-primary/50 tracking-wider">TASK DESCRIPTION</span>
                  <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{log.task_desc}</p>
                </div>
                <div className="h-px bg-primary/10"></div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-primary/50 tracking-wider">CREATED</span>
                  <span className="text-xs text-slate-400">{log.created_at}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {lightboxUrl && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button onClick={() => setLightboxUrl(null)} className="absolute -top-12 right-0 flex items-center gap-1 text-primary/80 hover:text-primary text-xs transition-colors z-10">
              <span className="material-symbols-outlined text-lg">close</span>CLOSE
            </button>
            <img src={lightboxUrl} alt="Full size" className="w-full h-full object-contain rounded-lg border border-primary/20 shadow-neon" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LogDetail;

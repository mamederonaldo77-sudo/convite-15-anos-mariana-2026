import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Crop,
  Check,
  Eye,
  Smartphone,
  Monitor,
  Move,
  Maximize2,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';

export interface ImageEditorTarget {
  id: string;
  title: string; // Ex: "Imagem do Cabeçalho", "Foto 1 da Galeria"
  category: 'header' | 'footer' | 'hero' | 'gallery' | 'timeline' | 'video';
  locationLabel: string; // Ex: "Cabeçalho Oficial", "Rodapé", "Carrossel Inicial"
  currentUrl: string;
  recommendedAspect?: '3:2' | '16:9' | '9:16' | '1:1' | '4:3' | 'free';
}

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: ImageEditorTarget | null;
  onSaveSuccess: (target: ImageEditorTarget, newUrl: string) => Promise<void>;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  onClose,
  target,
  onSaveSuccess,
}) => {
  // Image state
  const [currentImageSrc, setCurrentImageSrc] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Transformation states
  const [zoom, setZoom] = useState<number>(100); // 50 to 250%
  const [panX, setPanX] = useState<number>(0); // -100 to 100%
  const [panY, setPanY] = useState<number>(0); // -100 to 100%
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [aspectRatio, setAspectRatio] = useState<string>('free');
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');

  // Preview device simulation: 'desktop' or 'mobile'
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'mobile'>('desktop');
  const [showCropPreview, setShowCropPreview] = useState<boolean>(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string>('');

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; initialPanX: number; initialPanY: number }>({
    x: 0,
    y: 0,
    initialPanX: 0,
    initialPanY: 0,
  });

  // Action states
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize or reset when target changes
  useEffect(() => {
    if (target && isOpen) {
      setCurrentImageSrc(target.currentUrl);
      setSelectedFile(null);
      setZoom(100);
      setPanX(0);
      setPanY(0);
      setRotation(0);
      setAspectRatio(target.recommendedAspect || 'free');
      setFitMode(target.category === 'header' || target.category === 'footer' ? 'contain' : 'cover');
      setShowCropPreview(false);
      setPreviewBlobUrl('');
      setStatusMessage('');
      setErrorMessage('');
    }
  }, [target, isOpen]);

  // Clean up preview blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewBlobUrl && previewBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [previewBlobUrl]);

  if (!isOpen || !target) return null;

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCurrentImageSrc(objectUrl);
    setZoom(100);
    setPanX(0);
    setPanY(0);
    setRotation(0);
    setShowCropPreview(false);
    setStatusMessage('Nova imagem carregada. Você pode ajustar o enquadramento antes de salvar.');
    setErrorMessage('');
  };

  // Reset transforms
  const handleResetTransforms = () => {
    setZoom(100);
    setPanX(0);
    setPanY(0);
    setRotation(0);
    setShowCropPreview(false);
  };

  // Mouse drag handlers for direct canvas panning
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: panX,
      initialPanY: panY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    // Map mouse movement to percentage pan
    const sensitivity = 0.3;
    setPanX(Math.max(-100, Math.min(100, dragStartRef.current.initialPanX + dx * sensitivity)));
    setPanY(Math.max(-100, Math.min(100, dragStartRef.current.initialPanY + dy * sensitivity)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Generate cropped preview blob via HTML5 Canvas
  const generateCroppedBlob = async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        // Determine target aspect ratio dimensions
        let targetWidth = img.naturalWidth;
        let targetHeight = img.naturalHeight;

        if (aspectRatio === '16:9') {
          targetHeight = Math.round(targetWidth * (9 / 16));
        } else if (aspectRatio === '9:16') {
          targetWidth = Math.round(targetHeight * (9 / 16));
        } else if (aspectRatio === '1:1') {
          const minDim = Math.min(targetWidth, targetHeight);
          targetWidth = minDim;
          targetHeight = minDim;
        } else if (aspectRatio === '3:2') {
          targetHeight = Math.round(targetWidth * (2 / 3));
        } else if (aspectRatio === '4:3') {
          targetHeight = Math.round(targetWidth * (3 / 4));
        }

        canvas.width = Math.max(200, Math.min(2400, targetWidth));
        canvas.height = Math.max(200, Math.min(2400, targetHeight));

        // Background dark fill
        ctx.fillStyle = '#0b0813';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        // Translate to canvas center
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // Apply rotation
        ctx.rotate((rotation * Math.PI) / 180);

        // Apply zoom and panning
        const scaleFactor = zoom / 100;
        const offsetX = (panX / 100) * (canvas.width / 2);
        const offsetY = (panY / 100) * (canvas.height / 2);

        ctx.translate(offsetX, offsetY);
        ctx.scale(scaleFactor, scaleFactor);

        // Draw image centered
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;

        if (fitMode === 'contain') {
          const imgAspect = img.naturalWidth / img.naturalHeight;
          const canvasAspect = canvas.width / canvas.height;
          if (imgAspect > canvasAspect) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgAspect;
          } else {
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgAspect;
          }
        } else {
          // cover
          const imgAspect = img.naturalWidth / img.naturalHeight;
          const canvasAspect = canvas.width / canvas.height;
          if (imgAspect > canvasAspect) {
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgAspect;
          } else {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgAspect;
          }
        }

        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        ctx.restore();

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          'image/jpeg',
          0.92
        );
      };

      img.onerror = () => {
        resolve(null);
      };

      img.src = currentImageSrc;
    });
  };

  // Preview before saving
  const handleTogglePreview = async () => {
    if (!showCropPreview) {
      setIsSaving(true);
      const blob = await generateCroppedBlob();
      setIsSaving(false);
      if (blob) {
        if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
        const url = URL.createObjectURL(blob);
        setPreviewBlobUrl(url);
        setShowCropPreview(true);
      } else {
        setErrorMessage('Não foi possível gerar a prévia do recorte.');
      }
    } else {
      setShowCropPreview(false);
    }
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage('');
    setStatusMessage('Processando e salvando imagem...');

    try {
      let finalFileToUpload: File | null = null;

      // If user altered framing (zoom, pan, rotation, or aspect ratio), export cropped blob
      const hasTransformations =
        zoom !== 100 || panX !== 0 || panY !== 0 || rotation !== 0 || aspectRatio !== 'free';

      if (hasTransformations) {
        const blob = await generateCroppedBlob();
        if (blob) {
          const filename = `edited-${target.id}-${Date.now()}.jpg`;
          finalFileToUpload = new File([blob], filename, { type: 'image/jpeg' });
        }
      }

      // If no transformations but a new raw file was chosen, upload the raw file
      if (!finalFileToUpload && selectedFile) {
        finalFileToUpload = selectedFile;
      }

      let finalUrl = currentImageSrc;

      if (finalFileToUpload) {
        setStatusMessage('Enviando imagem para o servidor...');
        const uploadRes = await api.uploadMedia(finalFileToUpload);
        finalUrl = uploadRes.url;
      }

      setStatusMessage('Atualizando cadastro no sistema...');
      await onSaveSuccess(target, finalUrl);

      setStatusMessage('Imagem atualizada com sucesso!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Erro ao salvar imagem editada:', err);
      setErrorMessage(err.message || 'Falha ao salvar a imagem editada. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-900/40 bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel text-lg font-bold text-white tracking-wide">
                  {target.title}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-950/80 text-purple-300 border border-purple-400/25">
                  {target.locationLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Substitua a imagem, ajuste o enquadramento, proporção e visualize antes de salvar.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fechar e cancelar alterações"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Two columns on desktop */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Viewport / Interactive Canvas Preview (Cols 7) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5" /> Área de Edição e Enquadramento
              </span>

              {/* Device Preview Toggle */}
              <div className="flex items-center gap-1 bg-slate-900 border border-purple-400/20 rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setDevicePreview('desktop')}
                  className={`px-2.5 py-1 rounded flex items-center gap-1 transition-all ${
                    devicePreview === 'desktop'
                      ? 'bg-purple-700 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Simular proporção de computador (desktop)"
                >
                  <Monitor className="w-3.5 h-3.5" /> Computador
                </button>
                <button
                  type="button"
                  onClick={() => setDevicePreview('mobile')}
                  className={`px-2.5 py-1 rounded flex items-center gap-1 transition-all ${
                    devicePreview === 'mobile'
                      ? 'bg-purple-700 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Simular proporção de celular (mobile)"
                >
                  <Smartphone className="w-3.5 h-3.5" /> Celular
                </button>
              </div>
            </div>

            {/* Interactive Stage Viewport */}
            <div
              className={`relative mx-auto w-full rounded-xl overflow-hidden bg-slate-900 border border-purple-500/30 flex items-center justify-center select-none shadow-inner ${
                devicePreview === 'mobile'
                  ? 'max-w-[280px] h-[360px] border-purple-400/40'
                  : 'h-[320px] sm:h-[360px]'
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              {showCropPreview && previewBlobUrl ? (
                /* Cropped Preview Mode */
                <img
                  src={previewBlobUrl}
                  alt="Pré-visualização do recorte"
                  className="w-full h-full object-contain"
                />
              ) : (
                /* Interactive Edit Mode */
                <div
                  className="w-full h-full relative overflow-hidden flex items-center justify-center"
                  style={{
                    backgroundColor: '#0b0813',
                  }}
                >
                  <img
                    ref={imageRef}
                    src={currentImageSrc}
                    alt={target.title}
                    draggable={false}
                    className="max-w-none transition-transform duration-75 select-none"
                    style={{
                      transform: `translate(${panX}%, ${panY}%) scale(${zoom / 100}) rotate(${rotation}deg)`,
                      objectFit: fitMode,
                      maxWidth: fitMode === 'contain' ? '92%' : 'none',
                      maxHeight: fitMode === 'contain' ? '92%' : 'none',
                    }}
                  />
                </div>
              )}

              {/* Interactive Helper Overlay */}
              {!showCropPreview && (
                <div className="absolute bottom-2 left-2 right-2 pointer-events-none flex items-center justify-between text-[10px] text-purple-200/70 bg-slate-950/70 backdrop-blur-sm px-2.5 py-1 rounded-md border border-purple-400/20">
                  <span>Arraste com o mouse para reposicionar</span>
                  <span>Zoom: {zoom}%</span>
                </div>
              )}
            </div>

            {/* Action Bar Under Stage */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleResetTransforms}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-purple-400/20 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-400" /> Redefinir
              </button>

              <button
                type="button"
                onClick={handleTogglePreview}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                  showCropPreview
                    ? 'bg-purple-900/60 border-purple-400 text-purple-200'
                    : 'bg-purple-950/70 border-purple-400/30 text-purple-200 hover:bg-purple-900/60'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showCropPreview ? 'Voltar para Ajustes' : 'Ver Prévia Real'}</span>
              </button>
            </div>
          </div>

          {/* Right: Controls & Parameters (Cols 5) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* 1. Substituir Imagem (Upload) */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-purple-500/20">
              <label className="text-xs font-semibold text-purple-200 uppercase tracking-wider block mb-2">
                Substituir Imagem / Novo Arquivo
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-400/30 text-purple-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:border-purple-300 active:scale-98"
              >
                <Upload className="w-4 h-4 text-purple-300" />
                <span>Fazer Upload de Nova Imagem</span>
              </button>
              {selectedFile && (
                <p className="text-[11px] text-green-300 mt-2 truncate flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 inline" /> Arquivo selecionado: {selectedFile.name}
                </p>
              )}
            </div>

            {/* 2. Ajustes de Tamanho e Zoom */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-purple-200 uppercase tracking-wider flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-purple-300" /> Tamanho / Zoom
                </span>
                <span className="font-mono text-purple-300">{zoom}%</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(50, z - 10))}
                  className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  title="Diminuir"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="50"
                  max="250"
                  step="2"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(250, z + 10))}
                  className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  title="Aumentar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Rotação */}
              <div className="flex items-center justify-between pt-2 border-t border-purple-900/30 text-xs">
                <span className="text-slate-300">Girar Imagem:</span>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="px-2.5 py-1 rounded bg-purple-950/70 hover:bg-purple-900/80 border border-purple-400/25 text-purple-200 text-xs flex items-center gap-1 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{rotation}°</span>
                </button>
              </div>
            </div>

            {/* 3. Proporção e Enquadramento */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-purple-500/20 space-y-2.5">
              <label className="text-xs font-semibold text-purple-200 uppercase tracking-wider block">
                Proporção do Recorte
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {[
                  { id: 'free', label: 'Original' },
                  { id: '3:2', label: '3:2 (Arte Oficial)' },
                  { id: '16:9', label: '16:9 (Vídeo/PC)' },
                  { id: '9:16', label: '9:16 (Celular)' },
                  { id: '1:1', label: '1:1 (Quadrado)' },
                  { id: '4:3', label: '4:3 (Retrato)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAspectRatio(item.id)}
                    className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                      aspectRatio === item.id
                        ? 'bg-purple-700 text-white font-semibold border border-purple-400/40 shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Enquadramento: Conter vs Preencher */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-300">Modo de Encaixe:</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setFitMode('contain')}
                    className={`px-2 py-0.5 rounded text-[11px] ${
                      fitMode === 'contain'
                        ? 'bg-purple-700 text-white font-medium'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Inteira (Sem cortes)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFitMode('cover')}
                    className={`px-2 py-0.5 rounded text-[11px] ${
                      fitMode === 'cover'
                        ? 'bg-purple-700 text-white font-medium'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Preencher
                  </button>
                </div>
              </div>
            </div>

            {/* Status & Error Feedback */}
            {statusMessage && (
              <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-400/30 text-purple-200 text-xs">
                {statusMessage}
              </div>
            )}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions: Salvar e Cancelar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-purple-900/40 bg-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancelar Alterações
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-7 py-2.5 rounded-full bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white text-xs font-semibold tracking-wider flex items-center gap-2 shadow-lg shadow-purple-900/50 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-purple-400/30 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Salvar Alteração</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

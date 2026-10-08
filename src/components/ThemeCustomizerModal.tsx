import React, { useState, useEffect } from 'react';
import {
  EventSettings,
  ThemePreset,
  TitleFontFamily,
  BodyFontFamily,
} from '../types';
import { api, getStoredToken, setStoredToken } from '../services/api';
import {
  THEME_PRESETS,
  TITLE_FONTS,
  BODY_FONTS,
  ThemePresetOption,
  applyThemeToDocument,
} from '../utils/theme';
import {
  X,
  Palette,
  Type,
  FileText,
  KeyRound,
  Check,
  RotateCcw,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Sliders,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EventSettings;
  onSettingsUpdated: (newSettings: EventSettings) => void;
  isAdminAuthenticated?: boolean;
  onAdminAuthenticated?: (authed: boolean) => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsUpdated,
  isAdminAuthenticated = false,
  onAdminAuthenticated,
}) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'texts' | 'password'>('colors');
  const [formData, setFormData] = useState<EventSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Local admin authentication state if not passed from parent
  const [isAuthed, setIsAuthed] = useState<boolean>(isAdminAuthenticated || !!getStoredToken());
  const [authPinInput, setAuthPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Password change state
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pinChangeMsg, setPinChangeMsg] = useState<{ text: string; success: boolean } | null>(null);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      setIsAuthed(true);
    } else {
      const token = getStoredToken();
      if (token) {
        api.verifyAdmin().then((valid) => {
          setIsAuthed(valid);
          onAdminAuthenticated?.(valid);
        }).catch(() => {
          setIsAuthed(false);
        });
      } else {
        setIsAuthed(false);
      }
    }
  }, [isAdminAuthenticated, onAdminAuthenticated, isOpen]);

  if (!isOpen) return null;

  // Handle in-modal admin authentication if opened by non-authenticated admin
  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    try {
      const res = await api.loginAdmin(authPinInput);
      if (res.success) {
        setIsAuthed(true);
        onAdminAuthenticated?.(true);
        setAuthPinInput('');
      } else {
        setAuthError(res.message || 'Senha incorreta.');
      }
    } catch {
      setAuthError('Falha ao validar a senha.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleApplyPreset = (preset: ThemePresetOption) => {
    const updated: EventSettings = {
      ...formData,
      themePreset: preset.id,
      bgColor: preset.bgColor,
      accentLilac: preset.accentLilac,
      accentSecondary: preset.accentSecondary,
      fontTitle: preset.fontTitle,
      fontBody: preset.fontBody,
    };
    setFormData(updated);
    // Instant live preview on the entire webpage
    applyThemeToDocument(updated);
    onSettingsUpdated(updated);
  };

  const handleColorChange = (field: 'bgColor' | 'accentLilac' | 'accentSecondary', value: string) => {
    const updated: EventSettings = {
      ...formData,
      [field]: value,
      themePreset: undefined, // Custom
    };
    setFormData(updated);
    // Instant live preview on the entire webpage
    applyThemeToDocument(updated);
    onSettingsUpdated(updated);
  };

  const handleFontChange = (field: 'fontTitle' | 'fontBody', value: any) => {
    const updated: EventSettings = {
      ...formData,
      [field]: value,
      themePreset: undefined, // Custom
    };
    setFormData(updated);
    // Instant live preview on the entire webpage
    applyThemeToDocument(updated);
    onSettingsUpdated(updated);
  };

  const handleTextChange = (field: keyof EventSettings, value: string) => {
    const updated: EventSettings = { ...formData, [field]: value };
    setFormData(updated);
    onSettingsUpdated(updated);
  };

  const handleResetToDefault = () => {
    const defaultPreset = THEME_PRESETS[0]; // Lilás & Prata
    const updated: EventSettings = {
      ...formData,
      themePreset: defaultPreset.id,
      bgColor: defaultPreset.bgColor,
      accentLilac: defaultPreset.accentLilac,
      accentSecondary: defaultPreset.accentSecondary,
      fontTitle: defaultPreset.fontTitle,
      fontBody: defaultPreset.fontBody,
    };
    setFormData(updated);
    applyThemeToDocument(updated);
    onSettingsUpdated(updated);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      // Exclude adminPin from general settings update to avoid pin check mismatch
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { adminPin, ...cleanPayload } = formData;
      const updated = await api.updateSettings(cleanPayload);
      const merged: EventSettings = { ...formData, ...updated };
      setFormData(merged);
      applyThemeToDocument(merged);
      onSettingsUpdated(merged);
      setSaveSuccess(true);
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: [formData.accentLilac || '#c084fc', '#ffffff', formData.accentSecondary || '#e9d5ff'],
      });
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar alterações no servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeMsg(null);

    if (newPinInput.length < 3) {
      setPinChangeMsg({ text: 'A nova senha deve ter no mínimo 3 caracteres.', success: false });
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinChangeMsg({ text: 'A confirmação de senha não confere.', success: false });
      return;
    }

    try {
      const res = await api.changePin(currentPinInput, newPinInput);
      if (res.token) {
        setStoredToken(res.token);
      }
      setPinChangeMsg({ text: 'Senha de administrador alterada com sucesso!', success: true });
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setPinChangeMsg({ text: err.message || 'Erro ao alterar senha.', success: false });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-purple-400/35 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/40 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 p-[1.5px] shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                <Sliders className="w-5 h-5 text-purple-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel text-base sm:text-lg font-bold text-white">
                  Personalizar Convite & Aparência
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-400/40 text-[10px] text-purple-200 font-semibold tracking-wider uppercase">
                  Admin
                </span>
              </div>
              <p className="text-xs text-purple-300/80">
                Altere cores do cenário, fontes, textos oficiais e senha de acesso
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If user is not yet logged in as admin, require password prompt */}
        {!isAuthed ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
            <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-400/30 flex items-center justify-center text-purple-300 mb-4 shadow-xl">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="font-cormorant text-2xl sm:text-3xl font-bold text-white mb-2">
              Acesso Exclusivo do Administrador
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 font-light">
              Apenas o administrador do painel pode personalizar as cores, fontes, textos e senha do convite. Insira sua senha para prosseguir:
            </p>

            <form onSubmit={handleQuickLogin} className="w-full space-y-4">
              {authError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs">
                  {authError}
                </div>
              )}

              <div>
                <input
                  type="password"
                  value={authPinInput}
                  onChange={(e) => setAuthPinInput(e.target.value)}
                  placeholder="Senha de administrador (padrão: mariana15)"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-purple-400/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-300 text-sm text-center tracking-wider"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-medium text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-purple-900/40 cursor-pointer disabled:opacity-50"
              >
                {isAuthenticating ? 'Verificando...' : 'Entrar e Personalizar'}
              </button>

              <p className="text-[11px] text-purple-300/60 mt-3">
                Senha inicial: <code>mariana15</code>
              </p>
            </form>
          </div>
        ) : (
          <>
            {/* Success or Error Banner */}
            {saveSuccess && (
              <div className="px-6 py-2.5 bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Configurações salvas e aplicadas com sucesso em todo o site!</span>
              </div>
            )}
            {errorMessage && (
              <div className="px-6 py-2.5 bg-rose-950/90 border-b border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Tabs Bar */}
            <div className="flex items-center justify-between border-b border-purple-900/40 bg-slate-950/60 px-4 sm:px-6 overflow-x-auto no-scrollbar gap-2 py-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('colors')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'colors'
                      ? 'bg-purple-800 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Palette className="w-4 h-4 text-purple-300" />
                  <span>Cores do Cenário</span>
                </button>

                <button
                  onClick={() => setActiveTab('fonts')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'fonts'
                      ? 'bg-purple-800 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Type className="w-4 h-4 text-purple-300" />
                  <span>Estilo de Fontes</span>
                </button>

                <button
                  onClick={() => setActiveTab('texts')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'texts'
                      ? 'bg-purple-800 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <FileText className="w-4 h-4 text-purple-300" />
                  <span>Textos do Site</span>
                </button>

                <button
                  onClick={() => setActiveTab('password')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'password'
                      ? 'bg-purple-800 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <KeyRound className="w-4 h-4 text-purple-300" />
                  <span>Alterar Senha</span>
                </button>
              </div>

              {/* Reset to Default Button */}
              <button
                type="button"
                onClick={handleResetToDefault}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-purple-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Restaurar paleta padrão Lilás & Prata"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-6">
              {/* TAB 1: CORES DO CENÁRIO */}
              {activeTab === 'colors' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-cinzel text-sm font-bold text-white mb-1 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-300" />
                      <span>Paletas de Cenário Pré-Definidas</span>
                    </h4>
                    <p className="text-xs text-slate-400 mb-4">
                      Clique para aplicar instantaneamente uma paleta temática elegante no site (visualização em tempo real):
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {THEME_PRESETS.map((preset) => {
                        const isSelected = formData.themePreset === preset.id;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => handleApplyPreset(preset)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                              isSelected
                                ? 'bg-purple-950/80 border-purple-400 ring-2 ring-purple-500/50 shadow-lg'
                                : 'bg-slate-950/70 border-purple-400/20 hover:border-purple-300/40 hover:bg-slate-900'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-xs text-white">{preset.name}</span>
                                {isSelected && (
                                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                                    <Check className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                                {preset.desc}
                              </p>
                            </div>

                            {/* Swatches bar */}
                            <div className="flex items-center gap-1.5 pt-2 border-t border-purple-900/30">
                              <span
                                className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                                style={{ backgroundColor: preset.bgColor }}
                                title="Fundo"
                              />
                              <span
                                className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                                style={{ backgroundColor: preset.accentLilac }}
                                title="Destaque Principal"
                              />
                              <span
                                className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                                style={{ backgroundColor: preset.accentSecondary }}
                                title="Secundária / Brilhos"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Color Pickers */}
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-400/25 space-y-4">
                    <h4 className="font-cinzel text-sm font-bold text-white mb-2">
                      Ajuste Fino Personalizado de Cores
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Fundo */}
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                          Cor de Fundo do Cenário
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.bgColor || '#0b0813'}
                            onChange={(e) => handleColorChange('bgColor', e.target.value)}
                            className="w-10 h-10 rounded-xl bg-transparent border border-purple-400/30 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.bgColor || '#0b0813'}
                            onChange={(e) => handleColorChange('bgColor', e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-xs font-mono text-white focus:outline-none focus:border-purple-300"
                          />
                        </div>
                      </div>

                      {/* Destaque Principal */}
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                          Cor Principal (Destaque / Acentos)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.accentLilac || '#c084fc'}
                            onChange={(e) => handleColorChange('accentLilac', e.target.value)}
                            className="w-10 h-10 rounded-xl bg-transparent border border-purple-400/30 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.accentLilac || '#c084fc'}
                            onChange={(e) => handleColorChange('accentLilac', e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-xs font-mono text-white focus:outline-none focus:border-purple-300"
                          />
                        </div>
                      </div>

                      {/* Cor Secundária / Brilhos */}
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                          Cor Secundária (Brilhos & Textos)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.accentSecondary || '#e9d5ff'}
                            onChange={(e) => handleColorChange('accentSecondary', e.target.value)}
                            className="w-10 h-10 rounded-xl bg-transparent border border-purple-400/30 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.accentSecondary || '#e9d5ff'}
                            onChange={(e) => handleColorChange('accentSecondary', e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-xs font-mono text-white focus:outline-none focus:border-purple-300"
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-purple-300/80 italic flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                      <span>Todas as alterações refletem imediatamente no fundo, textos, botões e partículas do site.</span>
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: ESTILO DE FONTES */}
              {activeTab === 'fonts' && (
                <div className="space-y-6">
                  {/* Fonte dos Títulos */}
                  <div>
                    <h4 className="font-cinzel text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <Type className="w-4 h-4 text-purple-300" />
                      <span>Tipografia dos Títulos & Nome Principal</span>
                    </h4>
                    <p className="text-xs text-slate-400 mb-3">
                      Escolha o estilo de letra para os títulos, cabeçalhos e o nome principal ("X V da Mari"):
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {TITLE_FONTS.map((font) => {
                        const isSelected = (formData.fontTitle || 'Cinzel') === font.id;
                        return (
                          <div
                            key={font.id}
                            onClick={() => handleFontChange('fontTitle', font.id)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-purple-950/80 border-purple-400 ring-2 ring-purple-500/50 shadow-lg'
                                : 'bg-slate-950/70 border-purple-400/20 hover:border-purple-300/40 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-xs text-purple-200">{font.name}</span>
                              {isSelected && (
                                <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                                  <Check className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                            <div
                              className="text-2xl text-white my-1 font-bold truncate"
                              style={{ fontFamily: font.id }}
                            >
                              X V da Mari
                            </div>
                            <span className="text-[11px] text-slate-400 font-light">{font.sample}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fonte dos Textos */}
                  <div>
                    <h4 className="font-cinzel text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <Type className="w-4 h-4 text-purple-300" />
                      <span>Fonte dos Textos & Parágrafos</span>
                    </h4>
                    <p className="text-xs text-slate-400 mb-3">
                      Escolha o estilo de letra para os parágrafos, contagem e detalhes do convite:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {BODY_FONTS.map((font) => {
                        const isSelected = (formData.fontBody || 'Montserrat') === font.id;
                        return (
                          <div
                            key={font.id}
                            onClick={() => handleFontChange('fontBody', font.id)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-purple-950/80 border-purple-400 ring-2 ring-purple-500/50 shadow-lg'
                                : 'bg-slate-950/70 border-purple-400/20 hover:border-purple-300/40 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-xs text-purple-200">{font.name}</span>
                              {isSelected && (
                                <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                                  <Check className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-200 line-clamp-2 mt-1" style={{ fontFamily: font.id }}>
                              {font.sample}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TEXTOS DO SITE */}
              {activeTab === 'texts' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-400/25 space-y-4">
                    <h4 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-300" />
                      <span>Identificação Principal & Frases</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">
                          Nome Principal em Destaque
                        </label>
                        <input
                          type="text"
                          value={formData.debutanteName}
                          onChange={(e) => handleTextChange('debutanteName', e.target.value)}
                          placeholder="Ex: X V da Mari"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">
                          Título do Evento
                        </label>
                        <input
                          type="text"
                          value={formData.eventTitle}
                          onChange={(e) => handleTextChange('eventTitle', e.target.value)}
                          placeholder="Ex: Meus 15 anos"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">
                        Traje Sugerido (Dress Code)
                      </label>
                      <input
                        type="text"
                        value={formData.dressCode || ''}
                        onChange={(e) => handleTextChange('dressCode', e.target.value)}
                        placeholder="Ex: Esporte Fino / Traje de Gala"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">
                        Mensagem de Agradecimento (Rodapé)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.footerQuote || ''}
                        onChange={(e) => handleTextChange('footerQuote', e.target.value)}
                        placeholder="Ex: Obrigada por fazer parte da minha história..."
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-400/25 space-y-4">
                    <h4 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-300" />
                      <span>Localização, Horário & Contatos</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">
                          Local do Evento
                        </label>
                        <input
                          type="text"
                          value={formData.venueName}
                          onChange={(e) => handleTextChange('venueName', e.target.value)}
                          placeholder="Espaço 277"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">
                          Endereço Completo
                        </label>
                        <input
                          type="text"
                          value={formData.venueAddress}
                          onChange={(e) => handleTextChange('venueAddress', e.target.value)}
                          placeholder="Rua do Imperador, 277 - Viga, Nova Iguaçu - RJ"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">
                          Link do Mapa ("Como chegar")
                        </label>
                        <input
                          type="url"
                          value={formData.mapsUrl}
                          onChange={(e) => handleTextChange('mapsUrl', e.target.value)}
                          placeholder="https://maps.google.com/..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">
                          WhatsApp para Confirmações
                        </label>
                        <input
                          type="text"
                          value={formData.whatsappNumber}
                          onChange={(e) => handleTextChange('whatsappNumber', e.target.value)}
                          placeholder="5511987654321"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">
                          Chave Pix
                        </label>
                        <input
                          type="text"
                          value={formData.pixKey}
                          onChange={(e) => handleTextChange('pixKey', e.target.value)}
                          placeholder="mariana.amorim15anos@gmail.com"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">
                          Nome da Favorecida no Pix
                        </label>
                        <input
                          type="text"
                          value={formData.pixBeneficiary}
                          onChange={(e) => handleTextChange('pixBeneficiary', e.target.value)}
                          placeholder="X V da Mari"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ALTERAR SENHA */}
              {activeTab === 'password' && (
                <div className="space-y-6 max-w-xl mx-auto py-2">
                  <div className="text-center mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-purple-400/30 flex items-center justify-center text-purple-300 mx-auto mb-3 shadow-lg">
                      <KeyRound className="w-7 h-7" />
                    </div>
                    <h4 className="font-cormorant text-2xl font-bold text-white">
                      Alteração de Senha de Administrador
                    </h4>
                    <p className="text-xs text-slate-300 font-light max-w-sm mx-auto mt-1">
                      Defina uma nova senha para acessar o painel administrativo do cerimonial e gerenciar convidados.
                    </p>
                  </div>

                  {pinChangeMsg && (
                    <div
                      className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        pinChangeMsg.success
                          ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-200'
                          : 'bg-rose-950 border border-rose-500/40 text-rose-200'
                      }`}
                    >
                      {pinChangeMsg.success ? (
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      )}
                      <span>{pinChangeMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4 bg-slate-950/80 p-5 rounded-2xl border border-purple-400/25">
                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">
                        Senha Atual (padrão inicial: <code>mariana15</code>)
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={currentPinInput}
                        onChange={(e) => setCurrentPinInput(e.target.value)}
                        placeholder="Digite a senha atual"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">
                        Nova Senha
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        placeholder="Digite a nova senha desejada"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPinInput}
                        onChange={(e) => setConfirmPinInput(e.target.value)}
                        placeholder="Repita a nova senha"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-400/30 text-white text-xs focus:outline-none focus:border-purple-300"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs text-purple-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showPassword ? 'Ocultar caracteres' : 'Mostrar caracteres'}</span>
                      </button>

                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 text-white text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
                      >
                        Salvar Nova Senha
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Modal Footer with Save Action */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-purple-900/40 bg-slate-950/90">
              <span className="text-xs text-purple-300/80 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>{saveSuccess ? 'Alterações gravadas no banco de dados!' : 'Prévia ativa no site. Clique em Salvar para fixar.'}</span>
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Fechar
                </button>

                <button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 text-white text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

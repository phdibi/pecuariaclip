export const TIMELINE_SECTIONS = [
  { id: "intro", label: "INTRO", icon: "🎬", duration: "3-5s", desc: "Logo da fazenda + música dramática", color: "#B8860B" },
  { id: "hero", label: "PLANO GERAL", icon: "🐂", duration: "5-8s", desc: "Visão lateral completa, animal caminhando", color: "#8B4513" },
  { id: "angles", label: "ÂNGULOS 360°", icon: "🔄", duration: "15-20s", desc: "Frente, lateral esq/dir, traseira, caminhando", color: "#556B2F" },
  { id: "closeup", label: "DETALHES", icon: "🔍", duration: "10-15s", desc: "Cabeça, musculatura, aprumos, bolsa escrotal", color: "#704214" },
  { id: "data", label: "FICHA TÉCNICA", icon: "📊", duration: "8-10s", desc: "DEPs, peso, CE, avaliações genéticas", color: "#2F4F4F" },
  { id: "genealogy", label: "GENEALOGIA", icon: "🧬", duration: "5-8s", desc: "Árvore genealógica: pai, mãe, avós", color: "#4A3728" },
  { id: "progeny", label: "PROGÊNIE", icon: "🐄", duration: "8-10s", desc: "Filhos e filhas de destaque (opcional)", color: "#6B8E23" },
  { id: "cta", label: "CONTATO", icon: "📞", duration: "5s", desc: "WhatsApp, telefone, data do leilão", color: "#8B0000" },
];

export const OVERLAY_MAP = {
  intro: "intro",
  hero: "datacard",
  angles: "datacard",
  closeup: "datacard",
  data: "deps",
  genealogy: "genealogy",
  progeny: "datacard",
  cta: "cta",
};

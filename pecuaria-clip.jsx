import { useState, useRef, useEffect } from "react";

const FONTS_LINK = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;700&family=Bebas+Neue&display=swap";

// Inject fonts
const fontLink = document.createElement("link");
fontLink.href = FONTS_LINK;
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const TIMELINE_SECTIONS = [
  { id: "intro", label: "INTRO", icon: "🎬", duration: "3-5s", desc: "Logo da fazenda + música dramática", color: "#B8860B" },
  { id: "hero", label: "PLANO GERAL", icon: "🐂", duration: "5-8s", desc: "Visão lateral completa, animal caminhando", color: "#8B4513" },
  { id: "angles", label: "ÂNGULOS 360°", icon: "🔄", duration: "15-20s", desc: "Frente, lateral esq/dir, traseira, caminhando", color: "#556B2F" },
  { id: "closeup", label: "DETALHES", icon: "🔍", duration: "10-15s", desc: "Cabeça, musculatura, aprumos, bolsa escrotal", color: "#704214" },
  { id: "data", label: "FICHA TÉCNICA", icon: "📊", duration: "8-10s", desc: "DEPs, peso, CE, avaliações genéticas", color: "#2F4F4F" },
  { id: "genealogy", label: "GENEALOGIA", icon: "🧬", duration: "5-8s", desc: "Árvore genealógica: pai, mãe, avós", color: "#4A3728" },
  { id: "progeny", label: "PROGÊNIE", icon: "🐄", duration: "8-10s", desc: "Filhos e filhas de destaque (opcional)", color: "#6B8E23" },
  { id: "cta", label: "CONTATO", icon: "📞", duration: "5s", desc: "WhatsApp, telefone, data do leilão", color: "#8B0000" },
];

const SHOOTING_TIPS = {
  intro: [
    "Filme a placa/porteira da fazenda ao nascer do sol",
    "Use drone para vista aérea da propriedade",
    "Grave close da logo/marca da fazenda",
  ],
  hero: [
    "Filme o animal caminhando no pasto, lateral completa",
    "Mantenha câmera na altura do animal, estável",
    "Fundo limpo (pasto verde, sem obstáculos visuais)",
    "Luz natural, de preferência início da manhã ou fim de tarde",
  ],
  angles: [
    "FRENTE: chanfro, marrafa, chifres, expressão racial",
    "LATERAL ESQ/DIR: linha dorso-lombar, costelas, musculatura",
    "TRASEIRA: posterior, garupa, entre-pernas",
    "CAMINHANDO: avaliar aprumos e cascos em movimento",
  ],
  closeup: [
    "Cabeça: chanfro curto, boca larga, narinas amplas",
    "Cupim: implantação e proporção",
    "Musculatura: dorso-lombar, garupa, paleta",
    "Bolsa escrotal: tamanho, formato, posicionamento",
    "Umbigo/bainha: posição e tamanho",
    "Aprumos/cascos: filmando de perto enquanto caminha",
  ],
  data: [
    "Prepare a ficha ANTES da filmagem",
    "Use fundo escuro para texto claro (melhor legibilidade)",
    "Inclua: nome, RGD, raça, data nascimento, peso atual, CE",
    "DEPs principais: peso desmama, sobreano, hab. materna, carcaça",
  ],
  genealogy: [
    "Diagrama limpo: Pai → Avô/Avó | Mãe → Avô/Avó",
    "Destaque prêmios ou classificações TOP dos ancestrais",
    "Se possível, mostre fotos do pai e da mãe",
  ],
  progeny: [
    "Filme 3-5 filhos/filhas de destaque",
    "Mostre uniformidade do lote",
    "Inclua peso e idade dos produtos",
  ],
  cta: [
    "Nome completo da fazenda/criatório",
    "WhatsApp com DDD",
    "Data e horário do leilão (se aplicável)",
    "Logotipo da leiloeira parceira",
  ],
};

function AnimalDataForm({ data, setData }) {
  const fields = [
    { key: "name", label: "Nome do Animal", placeholder: "Ex: FENÔMENO FIV JMP", type: "text" },
    { key: "rgd", label: "RGD / Registro", placeholder: "Ex: ABCZ 12345", type: "text" },
    { key: "breed", label: "Raça", placeholder: "Ex: Nelore PO", type: "text" },
    { key: "birthDate", label: "Data de Nascimento", placeholder: "Ex: 15/03/2021", type: "text" },
    { key: "weight", label: "Peso Atual (kg)", placeholder: "Ex: 850", type: "text" },
    { key: "ce", label: "CE - Circ. Escrotal (cm)", placeholder: "Ex: 39", type: "text" },
    { key: "sire", label: "Pai (Touro)", placeholder: "Ex: BACKUP REM", type: "text" },
    { key: "dam", label: "Mãe (Vaca)", placeholder: "Ex: FLORESTA DA BELA", type: "text" },
    { key: "sireSire", label: "Avô Paterno", placeholder: "Ex: REM ARMADOR", type: "text" },
    { key: "damSire", label: "Avô Materno", placeholder: "Ex: GRAFITE DA BELA", type: "text" },
    { key: "farmName", label: "Nome da Fazenda", placeholder: "Ex: Fazenda Três Lagoas", type: "text" },
    { key: "whatsapp", label: "WhatsApp", placeholder: "Ex: (67) 99999-9999", type: "text" },
    { key: "auctionDate", label: "Data do Leilão (opcional)", placeholder: "Ex: 28/04/2026", type: "text" },
    { key: "auctionName", label: "Nome do Leilão (opcional)", placeholder: "Ex: Leilão Elite JMP", type: "text" },
  ];

  const depFields = [
    { key: "depPN", label: "DEP Peso Nasc.", placeholder: "+0.8" },
    { key: "depPD", label: "DEP Peso Desmama", placeholder: "+18.5" },
    { key: "depPS", label: "DEP Peso Sobreano", placeholder: "+25.3" },
    { key: "depHM", label: "DEP Hab. Materna", placeholder: "+12.1" },
    { key: "depAOL", label: "DEP Área Olho Lombo", placeholder: "+3.2" },
    { key: "depAC", label: "DEP Acab. Carcaça", placeholder: "+1.5" },
    { key: "iabcz", label: "iABCZ / MGTe", placeholder: "24.35" },
    { key: "top", label: "TOP % (Percentil)", placeholder: "1%" },
  ];

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", letterSpacing: "3px", color: "#B8860B", margin: "0 0 4px 0" }}>
        DADOS DO ANIMAL
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {fields.map(f => (
          <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#8B7355", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "1px" }}>
              {f.label}
            </label>
            <input
              value={data[f.key] || ""}
              onChange={e => setData({ ...data, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              style={{
                padding: "8px 10px", border: "1px solid #3A3020", borderRadius: "6px",
                background: "#1A1510", color: "#E8DCC8", fontSize: "13px",
                fontFamily: "'DM Sans', sans-serif", outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#B8860B"}
              onBlur={e => e.target.style.borderColor = "#3A3020"}
            />
          </div>
        ))}
      </div>

      <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", letterSpacing: "3px", color: "#B8860B", margin: "16px 0 4px 0" }}>
        AVALIAÇÃO GENÉTICA (DEPs)
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
        {depFields.map(f => (
          <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <label style={{ fontSize: "10px", fontWeight: 700, color: "#8B7355", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {f.label}
            </label>
            <input
              value={data[f.key] || ""}
              onChange={e => setData({ ...data, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              style={{
                padding: "8px 10px", border: "1px solid #3A3020", borderRadius: "6px",
                background: "#1A1510", color: "#E8DCC8", fontSize: "13px",
                fontFamily: "'DM Sans', sans-serif", outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = "#B8860B"}
              onBlur={e => e.target.style.borderColor = "#3A3020"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function OverlayPreview({ data, overlayType }) {
  if (overlayType === "intro") {
    return (
      <div style={{
        width: "100%", aspectRatio: "16/9", background: "linear-gradient(135deg, #0A0805 0%, #1A1208 40%, #0A0805 100%)",
        borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden", border: "1px solid #2A2015",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(184,134,11,0.15) 0%, transparent 70%)" }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "300px", height: "300px", border: "1px solid rgba(184,134,11,0.1)",
          borderRadius: "50%", animation: "pulse 3s ease-in-out infinite",
        }} />
        <div style={{
          fontFamily: "'Playfair Display', serif", fontSize: "clamp(16px, 4vw, 36px)", fontWeight: 900,
          color: "#B8860B", letterSpacing: "6px", textAlign: "center", zIndex: 1,
          textShadow: "0 0 40px rgba(184,134,11,0.3)",
        }}>
          {data.farmName || "FAZENDA EXEMPLO"}
        </div>
        <div style={{
          width: "60px", height: "2px", background: "linear-gradient(90deg, transparent, #B8860B, transparent)",
          margin: "12px 0", zIndex: 1,
        }} />
        <div style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(9px, 1.5vw, 13px)", color: "#8B7355",
          letterSpacing: "4px", textTransform: "uppercase", zIndex: 1,
        }}>
          GENÉTICA DE EXCELÊNCIA
        </div>
      </div>
    );
  }

  if (overlayType === "datacard") {
    return (
      <div style={{
        width: "100%", aspectRatio: "16/9", background: "linear-gradient(180deg, transparent 40%, rgba(10,8,5,0.85) 60%, rgba(10,8,5,0.95) 100%)",
        borderRadius: "8px", position: "relative", overflow: "hidden", border: "1px solid #2A2015",
        display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "20px",
      }}>
        <div style={{ position: "absolute", top: 12, right: 16, display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            background: "rgba(184,134,11,0.9)", padding: "4px 14px", borderRadius: "4px",
            fontFamily: "'Bebas Neue', sans-serif", fontSize: "14px", color: "#0A0805", letterSpacing: "2px",
          }}>
            {data.top ? `TOP ${data.top}` : "TOP 1%"}
          </div>
        </div>
        <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: "linear-gradient(180deg, #B8860B, transparent)" }} />
        
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{
            fontFamily: "'Playfair Display', serif", fontSize: "clamp(18px, 4vw, 32px)", fontWeight: 900,
            color: "#FFEAA7", lineHeight: 1, letterSpacing: "1px",
          }}>
            {data.name || "NOME DO ANIMAL"}
          </div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(9px, 1.5vw, 12px)", color: "#B8860B",
            letterSpacing: "2px", textTransform: "uppercase",
          }}>
            {data.breed || "NELORE PO"} • {data.rgd || "RGD 00000"} • NASC. {data.birthDate || "00/00/0000"}
          </div>
          
          <div style={{ display: "flex", gap: "16px", marginTop: "6px", flexWrap: "wrap" }}>
            {[
              { label: "PESO", value: data.weight ? `${data.weight} kg` : "850 kg" },
              { label: "CE", value: data.ce ? `${data.ce} cm` : "39 cm" },
              { label: "iABCZ", value: data.iabcz || "24.35" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "9px", color: "#8B7355", letterSpacing: "1.5px" }}>
                  {item.label}
                </span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(16px, 3vw, 24px)", color: "#E8DCC8", letterSpacing: "1px" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{
          position: "absolute", bottom: 12, right: 16,
          fontFamily: "'DM Sans', sans-serif", fontSize: "10px", color: "#5A4A35",
          letterSpacing: "1px",
        }}>
          {data.farmName || "FAZENDA EXEMPLO"}
        </div>
      </div>
    );
  }

  if (overlayType === "deps") {
    const deps = [
      { label: "Peso Nascimento", value: data.depPN || "+0.8", pct: 35 },
      { label: "Peso Desmama", value: data.depPD || "+18.5", pct: 78 },
      { label: "Peso Sobreano", value: data.depPS || "+25.3", pct: 82 },
      { label: "Hab. Materna", value: data.depHM || "+12.1", pct: 70 },
      { label: "Área Olho Lombo", value: data.depAOL || "+3.2", pct: 65 },
      { label: "Acab. Carcaça", value: data.depAC || "+1.5", pct: 55 },
    ];
    return (
      <div style={{
        width: "100%", aspectRatio: "16/9", background: "#0A0805",
        borderRadius: "8px", position: "relative", overflow: "hidden", border: "1px solid #2A2015",
        padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 50%, rgba(184,134,11,0.08) 0%, transparent 60%)" }} />
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "4px",
          color: "#B8860B", marginBottom: "14px",
        }}>
          AVALIAÇÃO GENÉTICA — DEPs
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {deps.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{
                width: "120px", fontFamily: "'DM Sans', sans-serif", fontSize: "10px",
                color: "#8B7355", letterSpacing: "0.5px", textTransform: "uppercase", flexShrink: 0,
              }}>
                {d.label}
              </span>
              <div style={{
                flex: 1, height: "6px", background: "#1A1510", borderRadius: "3px",
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${d.pct}%`, height: "100%", borderRadius: "3px",
                  background: `linear-gradient(90deg, #704214, #B8860B)`,
                  transition: "width 1s ease",
                }} />
              </div>
              <span style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", color: "#E8DCC8",
                width: "50px", textAlign: "right",
              }}>
                {d.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (overlayType === "genealogy") {
    return (
      <div style={{
        width: "100%", aspectRatio: "16/9", background: "#0A0805",
        borderRadius: "8px", position: "relative", overflow: "hidden", border: "1px solid #2A2015",
        padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "4px",
          color: "#B8860B", marginBottom: "16px",
        }}>
          GENEALOGIA
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", width: "100%" }}>
          {/* Animal */}
          <div style={{
            background: "linear-gradient(135deg, #B8860B, #8B6914)", padding: "8px 24px",
            borderRadius: "6px", textAlign: "center",
          }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(12px, 2.5vw, 18px)", fontWeight: 900, color: "#0A0805" }}>
              {data.name || "NOME DO ANIMAL"}
            </div>
          </div>
          
          <div style={{ width: "2px", height: "12px", background: "#3A3020" }} />
          
          {/* Parents */}
          <div style={{ display: "flex", gap: "30px", width: "100%", justifyContent: "center" }}>
            {[
              { label: "PAI", name: data.sire || "TOURO PAI", grandpa: data.sireSire || "AVÔ PATERNO" },
              { label: "MÃE", name: data.dam || "VACA MÃE", grandpa: data.damSire || "AVÔ MATERNO" },
            ].map((p, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div style={{
                  border: "1px solid #3A3020", padding: "6px 16px", borderRadius: "6px",
                  textAlign: "center", background: "rgba(26,21,16,0.8)",
                }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "8px", color: "#8B7355", letterSpacing: "2px", marginBottom: "2px" }}>
                    {p.label}
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(10px, 2vw, 14px)", fontWeight: 700, color: "#E8DCC8" }}>
                    {p.name}
                  </div>
                </div>
                <div style={{ width: "1px", height: "8px", background: "#3A3020" }} />
                <div style={{
                  border: "1px solid #2A2015", padding: "4px 12px", borderRadius: "4px",
                  textAlign: "center", background: "rgba(26,21,16,0.5)",
                }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "7px", color: "#6B5740", letterSpacing: "1px" }}>
                    AVÔ
                  </div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(9px, 1.5vw, 11px)", fontWeight: 500, color: "#8B7355" }}>
                    {p.grandpa}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (overlayType === "cta") {
    return (
      <div style={{
        width: "100%", aspectRatio: "16/9", background: "linear-gradient(135deg, #0A0805 0%, #1A1208 100%)",
        borderRadius: "8px", position: "relative", overflow: "hidden", border: "1px solid #2A2015",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(184,134,11,0.1) 0%, transparent 70%)" }} />
        {data.auctionName && (
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(12px, 3vw, 22px)", letterSpacing: "4px",
            color: "#B8860B", marginBottom: "4px", zIndex: 1,
          }}>
            {data.auctionName}
          </div>
        )}
        {data.auctionDate && (
          <div style={{
            fontFamily: "'Playfair Display', serif", fontSize: "clamp(18px, 5vw, 36px)", fontWeight: 900,
            color: "#FFEAA7", zIndex: 1, marginBottom: "8px",
          }}>
            {data.auctionDate}
          </div>
        )}
        <div style={{
          width: "60px", height: "2px", background: "linear-gradient(90deg, transparent, #B8860B, transparent)",
          margin: "8px 0", zIndex: 1,
        }} />
        <div style={{
          fontFamily: "'Playfair Display', serif", fontSize: "clamp(14px, 3vw, 24px)", fontWeight: 700,
          color: "#E8DCC8", zIndex: 1, marginBottom: "4px",
        }}>
          {data.farmName || "FAZENDA EXEMPLO"}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px", zIndex: 1,
          marginTop: "8px",
        }}>
          <div style={{
            background: "#25D366", color: "#fff", padding: "6px 16px", borderRadius: "20px",
            fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(10px, 1.5vw, 14px)", fontWeight: 700,
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            📱 {data.whatsapp || "(00) 00000-0000"}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function TimelineBar({ activeSection, setActiveSection }) {
  return (
    <div style={{
      display: "flex", gap: "2px", background: "#0A0805", borderRadius: "8px",
      padding: "4px", overflow: "auto",
    }}>
      {TIMELINE_SECTIONS.map((s, i) => (
        <button
          key={s.id}
          onClick={() => setActiveSection(s.id)}
          style={{
            flex: "1 0 auto", minWidth: "80px", padding: "8px 10px", border: "none",
            borderRadius: "6px", cursor: "pointer", textAlign: "center",
            background: activeSection === s.id ? s.color : "transparent",
            transition: "all 0.2s",
            opacity: activeSection === s.id ? 1 : 0.5,
          }}
        >
          <div style={{ fontSize: "16px" }}>{s.icon}</div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: "11px", letterSpacing: "1.5px",
            color: activeSection === s.id ? "#fff" : "#8B7355",
            marginTop: "2px",
          }}>
            {s.label}
          </div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: "9px",
            color: activeSection === s.id ? "rgba(255,255,255,0.7)" : "#5A4A35",
          }}>
            {s.duration}
          </div>
        </button>
      ))}
    </div>
  );
}

function ShootingGuide({ sectionId }) {
  const tips = SHOOTING_TIPS[sectionId] || [];
  const section = TIMELINE_SECTIONS.find(s => s.id === sectionId);
  
  return (
    <div style={{
      background: "#110E0A", border: "1px solid #2A2015", borderRadius: "8px",
      padding: "16px",
    }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", letterSpacing: "2px",
        color: section?.color || "#B8860B", marginBottom: "10px",
        display: "flex", alignItems: "center", gap: "8px",
      }}>
        <span>{section?.icon}</span> GUIA DE FILMAGEM — {section?.label}
      </div>
      <div style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#8B7355",
        marginBottom: "10px",
      }}>
        {section?.desc}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {tips.map((tip, i) => (
          <div key={i} style={{
            display: "flex", gap: "8px", alignItems: "flex-start",
            padding: "6px 10px", background: "rgba(184,134,11,0.05)",
            borderRadius: "4px", borderLeft: `2px solid ${section?.color || "#B8860B"}`,
          }}>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: "14px",
              color: section?.color || "#B8860B", minWidth: "16px",
            }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#C4B69C",
              lineHeight: 1.4,
            }}>
              {tip}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const OVERLAY_MAP = {
  intro: "intro",
  hero: "datacard",
  angles: "datacard",
  closeup: "datacard",
  data: "deps",
  genealogy: "genealogy",
  progeny: "datacard",
  cta: "cta",
};

export default function PecuariaClipPro() {
  const [tab, setTab] = useState("storyboard");
  const [activeSection, setActiveSection] = useState("intro");
  const [data, setData] = useState({});
  const [exportFormat, setExportFormat] = useState("landscape");

  const tabs = [
    { id: "storyboard", label: "STORYBOARD", icon: "🎬" },
    { id: "dados", label: "DADOS DO ANIMAL", icon: "🐂" },
    { id: "overlays", label: "OVERLAYS / GRÁFICOS", icon: "🎨" },
    { id: "export", label: "GUIA DE EXPORTAÇÃO", icon: "📤" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#0D0B08",
      fontFamily: "'DM Sans', sans-serif", color: "#E8DCC8",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0A0805; }
        ::-webkit-scrollbar-thumb { background: #3A3020; border-radius: 3px; }
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.05); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        .slide-in { animation: slideIn 0.3s ease forwards; }
        input::placeholder { color: #4A3D2E; }
      `}</style>
      
      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg, #110E0A 0%, #0D0B08 100%)",
        borderBottom: "1px solid #1A1510", padding: "16px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "1200px", margin: "0 auto" }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <span style={{
                fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 900,
                color: "#B8860B", letterSpacing: "1px",
              }}>
                PecuáriaClip
              </span>
              <span style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: "14px", letterSpacing: "3px",
                color: "#5A4A35",
              }}>
                PRO
              </span>
            </div>
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#5A4A35",
              letterSpacing: "1px", marginTop: "2px",
            }}>
              EDITOR DE VÍDEOS PROFISSIONAIS PARA PECUÁRIA DE ELITE
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "4px", background: "#0A0805", borderRadius: "8px", padding: "3px" }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "8px 14px", border: "none", borderRadius: "6px", cursor: "pointer",
                  background: tab === t.id ? "rgba(184,134,11,0.2)" : "transparent",
                  color: tab === t.id ? "#B8860B" : "#5A4A35",
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: "13px", letterSpacing: "2px",
                  transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px",
                }}
              >
                <span style={{ fontSize: "14px" }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 24px" }}>
        
        {/* STORYBOARD TAB */}
        {tab === "storyboard" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(184,134,11,0.1) 0%, transparent 60%)",
              border: "1px solid #2A2015", borderRadius: "10px", padding: "16px 20px",
            }}>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", letterSpacing: "3px",
                color: "#B8860B", marginBottom: "6px",
              }}>
                📋 PADRÃO PROFISSIONAL DE VÍDEO — LEILÃO / YOUTUBE
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#8B7355", lineHeight: 1.6 }}>
                Baseado na análise de centenas de vídeos profissionais de leilões como Canal Rural, Lance Rural, Canal do Boi e criatórios de elite.
                O formato padrão tem entre <strong style={{ color: "#B8860B" }}>60-90 segundos</strong> e segue a estrutura abaixo.
                Clique em cada seção para ver o guia de filmagem detalhado.
              </div>
            </div>

            <TimelineBar activeSection={activeSection} setActiveSection={setActiveSection} />
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <ShootingGuide sectionId={activeSection} />
              <div>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: "14px", letterSpacing: "2px",
                  color: "#5A4A35", marginBottom: "8px",
                }}>
                  PREVIEW DO OVERLAY
                </div>
                <OverlayPreview data={data} overlayType={OVERLAY_MAP[activeSection]} />
              </div>
            </div>

            <div style={{
              background: "#110E0A", border: "1px solid #2A2015", borderRadius: "8px",
              padding: "16px",
            }}>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", letterSpacing: "2px",
                color: "#B8860B", marginBottom: "10px",
              }}>
                🎵 TRILHA SONORA RECOMENDADA
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                {[
                  { style: "Sertanejo Raiz Instrumental", desc: "Viola caipira, ritmo calmo. Transmite tradição e confiança.", fit: "Fazendas tradicionais" },
                  { style: "Country/Western Épico", desc: "Batidas fortes, guitarra. Dramático e imponente.", fit: "Leilões de elite" },
                  { style: "Orquestral Cinematográfico", desc: "Cordas, crescendo. Sensação de grandeza e sofisticação.", fit: "Touros recordistas" },
                ].map((m, i) => (
                  <div key={i} style={{
                    border: "1px solid #2A2015", borderRadius: "6px", padding: "10px",
                    background: "rgba(184,134,11,0.03)",
                  }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", fontWeight: 700, color: "#C4B69C", marginBottom: "4px" }}>
                      {m.style}
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#8B7355", lineHeight: 1.4, marginBottom: "6px" }}>
                      {m.desc}
                    </div>
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: "9px", color: "#5A4A35",
                      letterSpacing: "1px", textTransform: "uppercase",
                    }}>
                      Ideal para: {m.fit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DADOS TAB */}
        {tab === "dados" && (
          <div className="fade-in" style={{
            background: "#110E0A", border: "1px solid #2A2015", borderRadius: "10px",
            padding: "20px",
          }}>
            <AnimalDataForm data={data} setData={setData} />
          </div>
        )}

        {/* OVERLAYS TAB */}
        {tab === "overlays" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(184,134,11,0.1) 0%, transparent 60%)",
              border: "1px solid #2A2015", borderRadius: "10px", padding: "16px 20px",
            }}>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "3px",
                color: "#B8860B", marginBottom: "4px",
              }}>
                🎨 GRÁFICOS E OVERLAYS DO SEU VÍDEO
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#8B7355" }}>
                Preencha os dados na aba "Dados do Animal" e todos os overlays serão gerados automaticamente.
                Estes são os gráficos que serão sobrepostos ao seu vídeo em cada seção.
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { type: "intro", label: "01 — INTRO / ABERTURA" },
                { type: "datacard", label: "02 — FICHA DO ANIMAL (LOWER THIRD)" },
                { type: "deps", label: "03 — DEPs / AVALIAÇÃO GENÉTICA" },
                { type: "genealogy", label: "04 — ÁRVORE GENEALÓGICA" },
                { type: "cta", label: "05 — TELA DE CONTATO / CTA" },
              ].map((item, i) => (
                <div key={i} className="slide-in" style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: "13px", letterSpacing: "2px",
                    color: "#5A4A35", marginBottom: "6px",
                  }}>
                    {item.label}
                  </div>
                  <OverlayPreview data={data} overlayType={item.type} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPORT TAB */}
        {tab === "export" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(184,134,11,0.1) 0%, transparent 60%)",
              border: "1px solid #2A2015", borderRadius: "10px", padding: "16px 20px",
            }}>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "3px",
                color: "#B8860B", marginBottom: "4px",
              }}>
                📤 GUIA DE EDIÇÃO E EXPORTAÇÃO
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#8B7355" }}>
                Siga este passo-a-passo para montar seu vídeo profissional usando os gráficos gerados.
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{
                background: "#110E0A", border: "1px solid #2A2015", borderRadius: "8px",
                padding: "16px",
              }}>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", letterSpacing: "2px",
                  color: "#B8860B", marginBottom: "12px",
                }}>
                  ⚙️ CONFIGURAÇÕES DE VÍDEO
                </div>
                {[
                  { label: "Resolução", value: "1920 × 1080 (Full HD) ou 3840 × 2160 (4K)" },
                  { label: "Proporção", value: "16:9 (paisagem) — padrão YouTube" },
                  { label: "FPS", value: "30 fps (padrão) ou 60 fps (slow motion)" },
                  { label: "Codec", value: "H.264 / H.265 — compatível com todas plataformas" },
                  { label: "Bitrate", value: "10-15 Mbps para Full HD / 35-50 Mbps para 4K" },
                  { label: "Duração ideal", value: "60 a 90 segundos por animal" },
                  { label: "Formato final", value: ".MP4 (mais compatível)" },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", padding: "6px 0",
                    borderBottom: i < 6 ? "1px solid #1A1510" : "none",
                  }}>
                    <span style={{ fontSize: "12px", color: "#8B7355" }}>{item.label}</span>
                    <span style={{ fontSize: "12px", color: "#C4B69C", fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div style={{
                background: "#110E0A", border: "1px solid #2A2015", borderRadius: "8px",
                padding: "16px",
              }}>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", letterSpacing: "2px",
                  color: "#B8860B", marginBottom: "12px",
                }}>
                  📱 APPS DE EDIÇÃO RECOMENDADOS
                </div>
                {[
                  { name: "CapCut", tier: "GRATUITO", desc: "Melhor custo-benefício. Templates prontos, textos, transições. Ideal para celular." },
                  { name: "VN Video Editor", tier: "GRATUITO", desc: "Poderoso e sem marca d'água. Bom controle de camadas e keyframes." },
                  { name: "InShot", tier: "FREEMIUM", desc: "Simples e intuitivo. Bom para vídeos rápidos com textos sobrepostos." },
                  { name: "DaVinci Resolve", tier: "GRÁTIS/PRO", desc: "Profissional nível cinema. Melhor opção para desktop. Cor e áudio excepcionais." },
                  { name: "Adobe Premiere Rush", tier: "PAGO", desc: "Versão simplificada do Premiere. Sync entre celular e desktop." },
                ].map((app, i) => (
                  <div key={i} style={{
                    padding: "8px", borderRadius: "6px", marginBottom: "6px",
                    background: "rgba(184,134,11,0.03)", border: "1px solid #1A1510",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 700, color: "#E8DCC8" }}>
                        {app.name}
                      </span>
                      <span style={{
                        fontFamily: "'Bebas Neue', sans-serif", fontSize: "10px", letterSpacing: "1px",
                        color: app.tier === "GRATUITO" ? "#6B8E23" : "#B8860B",
                        background: app.tier === "GRATUITO" ? "rgba(107,142,35,0.15)" : "rgba(184,134,11,0.15)",
                        padding: "2px 8px", borderRadius: "3px",
                      }}>
                        {app.tier}
                      </span>
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#8B7355", marginTop: "3px" }}>
                      {app.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: "#110E0A", border: "1px solid #2A2015", borderRadius: "8px",
              padding: "16px",
            }}>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", letterSpacing: "2px",
                color: "#B8860B", marginBottom: "12px",
              }}>
                🎯 PASSO A PASSO PARA MONTAR O VÍDEO
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                {[
                  { step: "01", title: "GRAVE", items: ["Siga o storyboard seção por seção", "Filme cada ângulo com pelo menos 10s", "Use tripé ou gimbal para estabilidade", "Luz natural: manhã cedo ou fim de tarde"] },
                  { step: "02", title: "IMPORTE", items: ["Transfira os vídeos para o app de edição", "Organize por seção (intro, hero, ângulos...)", "Selecione os melhores takes de cada seção", "Corte partes tremidas ou com ruído"] },
                  { step: "03", title: "MONTE", items: ["Siga a timeline: Intro → Hero → Ângulos → Detalhes → Dados → Genealogia → CTA", "Adicione os overlays gerados neste app", "Insira trilha sonora (música livre de direitos)", "Exporte em MP4 Full HD para YouTube"] },
                ].map((step, i) => (
                  <div key={i} style={{
                    border: "1px solid #2A2015", borderRadius: "8px", padding: "14px",
                    background: "rgba(184,134,11,0.03)",
                  }}>
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: "36px",
                      color: "rgba(184,134,11,0.2)", lineHeight: 1,
                    }}>
                      {step.step}
                    </div>
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "2px",
                      color: "#B8860B", marginBottom: "8px",
                    }}>
                      {step.title}
                    </div>
                    {step.items.map((item, j) => (
                      <div key={j} style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#8B7355",
                        padding: "4px 0", borderBottom: j < step.items.length - 1 ? "1px solid #1A1510" : "none",
                        lineHeight: 1.4,
                      }}>
                        → {item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: "linear-gradient(135deg, rgba(107,142,35,0.1) 0%, transparent 60%)",
              border: "1px solid rgba(107,142,35,0.3)", borderRadius: "10px", padding: "16px 20px",
            }}>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", letterSpacing: "2px",
                color: "#6B8E23", marginBottom: "6px",
              }}>
                💡 DICA PRO — YOUTUBE SEO PARA PECUÁRIA
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#8B7355", lineHeight: 1.6 }}>
                <strong style={{ color: "#6B8E23" }}>Título:</strong> "[NOME DO TOURO] — [RAÇA] [SAFRA] | [Nome da Fazenda] | TOP [X]% [Programa]"
                <br />
                <strong style={{ color: "#6B8E23" }}>Descrição:</strong> Inclua todas as DEPs, genealogia, peso, CE, contato WhatsApp e link para catálogo.
                <br />
                <strong style={{ color: "#6B8E23" }}>Tags:</strong> touro nelore, nelore PO, leilão, reprodutor, pecuária, CEIP, genética bovina, [sua cidade/estado]
                <br />
                <strong style={{ color: "#6B8E23" }}>Thumbnail:</strong> Foto lateral do animal com nome em fonte grande + badge "TOP 1%"
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

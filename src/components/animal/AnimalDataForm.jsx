import { theme } from '../../styles/theme';

const FIELDS = [
  { key: "name", label: "Nome do Animal", placeholder: "Ex: FENÔMENO FIV JMP" },
  { key: "rgd", label: "RGD / Registro", placeholder: "Ex: ABCZ 12345" },
  { key: "breed", label: "Raça", placeholder: "Ex: Nelore PO" },
  { key: "birthDate", label: "Data de Nascimento", placeholder: "Ex: 15/03/2021" },
  { key: "weight", label: "Peso Atual (kg)", placeholder: "Ex: 850" },
  { key: "ce", label: "CE - Circ. Escrotal (cm)", placeholder: "Ex: 39" },
  { key: "sire", label: "Pai (Touro)", placeholder: "Ex: BACKUP REM" },
  { key: "dam", label: "Mãe (Vaca)", placeholder: "Ex: FLORESTA DA BELA" },
  { key: "sireSire", label: "Avô Paterno", placeholder: "Ex: REM ARMADOR" },
  { key: "damSire", label: "Avô Materno", placeholder: "Ex: GRAFITE DA BELA" },
  { key: "farmName", label: "Nome da Fazenda", placeholder: "Ex: Fazenda Três Lagoas" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "Ex: (67) 99999-9999" },
  { key: "auctionDate", label: "Data do Leilão (opcional)", placeholder: "Ex: 28/04/2026" },
  { key: "auctionName", label: "Nome do Leilão (opcional)", placeholder: "Ex: Leilão Elite JMP" },
];

const DEP_FIELDS = [
  { key: "depPN", label: "DEP Peso Nasc.", placeholder: "+0.8" },
  { key: "depPD", label: "DEP Peso Desmama", placeholder: "+18.5" },
  { key: "depPS", label: "DEP Peso Sobreano", placeholder: "+25.3" },
  { key: "depHM", label: "DEP Hab. Materna", placeholder: "+12.1" },
  { key: "depAOL", label: "DEP Área Olho Lombo", placeholder: "+3.2" },
  { key: "depAC", label: "DEP Acab. Carcaça", placeholder: "+1.5" },
  { key: "iabcz", label: "iABCZ / MGTe", placeholder: "24.35" },
  { key: "top", label: "TOP % (Percentil)", placeholder: "1%" },
];

const inputStyle = {
  padding: "8px 10px",
  border: `1px solid ${theme.colors.border.secondary}`,
  borderRadius: "6px",
  background: theme.colors.bg.card,
  color: theme.colors.text.primary,
  fontSize: "13px",
  fontFamily: theme.fonts.body,
  outline: "none",
  transition: "border-color 0.2s",
};

export default function AnimalDataForm({ data, setData }) {
  const handleChange = (key, value) => setData({ ...data, [key]: value });

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <h3 style={{
        fontFamily: theme.fonts.heading, fontSize: "22px",
        letterSpacing: "3px", color: theme.colors.gold.primary,
        margin: "0 0 4px 0",
      }}>
        DADOS DO ANIMAL
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {FIELDS.map(f => (
          <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <label style={{
              fontSize: "11px", fontWeight: 700, color: theme.colors.text.muted,
              fontFamily: theme.fonts.body, textTransform: "uppercase", letterSpacing: "1px",
            }}>
              {f.label}
            </label>
            <input
              value={data[f.key] || ""}
              onChange={e => handleChange(f.key, e.target.value)}
              placeholder={f.placeholder}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = theme.colors.gold.primary}
              onBlur={e => e.target.style.borderColor = theme.colors.border.secondary}
            />
          </div>
        ))}
      </div>

      <h3 style={{
        fontFamily: theme.fonts.heading, fontSize: "22px",
        letterSpacing: "3px", color: theme.colors.gold.primary,
        margin: "16px 0 4px 0",
      }}>
        AVALIAÇÃO GENÉTICA (DEPs)
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
        {DEP_FIELDS.map(f => (
          <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <label style={{
              fontSize: "10px", fontWeight: 700, color: theme.colors.text.muted,
              fontFamily: theme.fonts.body, textTransform: "uppercase", letterSpacing: "0.5px",
            }}>
              {f.label}
            </label>
            <input
              value={data[f.key] || ""}
              onChange={e => handleChange(f.key, e.target.value)}
              placeholder={f.placeholder}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = theme.colors.gold.primary}
              onBlur={e => e.target.style.borderColor = theme.colors.border.secondary}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

import { Camera, DoorOpen, Fingerprint, PanelsTopLeft, Settings2, Wrench, type LucideIcon } from "lucide-react";
import type { ContactMethod, ProjectPurpose, PropertyType, QuoteService } from "../types/quoteRequest";

export const serviceOptions: Array<{ value: QuoteService; label: string; description: string; icon: LucideIcon }> = [
  { value: "energia-solar", label: "Energia Solar", description: "Projeto, instalação e manutenção fotovoltaica.", icon: PanelsTopLeft },
  { value: "cftv-seguranca", label: "CFTV e Monitoramento", description: "Câmeras, gravação e acesso remoto.", icon: Camera },
  { value: "automacao-portoes", label: "Automação de Portões", description: "Automação, sensores e manutenção.", icon: DoorOpen },
  { value: "controle-acesso", label: "Controle de Acesso", description: "Tags, biometria, fechaduras e interfones.", icon: Fingerprint },
  { value: "projeto-integrado", label: "Projeto Integrado", description: "Combine energia, segurança e automação.", icon: Settings2 },
  { value: "manutencao", label: "Manutenção", description: "Avaliação preventiva ou corretiva.", icon: Wrench },
];

export const propertyTypes: PropertyType[] = ["Residência", "Comércio", "Empresa", "Condomínio", "Indústria", "Propriedade rural", "Outro"];
export const purposes: ProjectPurpose[] = ["Nova instalação", "Ampliação", "Substituição", "Manutenção", "Avaliação técnica"];
export const contactMethods: ContactMethod[] = ["WhatsApp", "Telefone", "E-mail"];

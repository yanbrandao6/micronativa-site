import {Camera,DoorOpen,Fingerprint,PanelsTopLeft,Settings2,Wrench} from "lucide-react";import type {QuoteService,PropertyType,ProjectPurpose,ContactMethod} from "../types/quoteRequest";
export const serviceOptions:Array<{value:QuoteService;label:string;description:string;icon:any}>=[
{value:"energia-solar",label:"Energia Solar",description:"Projeto, instalação e manutenção fotovoltaica.",icon:PanelsTopLeft},
{value:"cftv-seguranca",label:"CFTV e Monitoramento",description:"Câmeras, gravação e acesso remoto.",icon:Camera},
{value:"automacao-portoes",label:"Automação de Portões",description:"Automação, sensores e manutenção.",icon:DoorOpen},
{value:"controle-acesso",label:"Controle de Acesso",description:"Tags, biometria, fechaduras e interfones.",icon:Fingerprint},
{value:"projeto-integrado",label:"Projeto Integrado",description:"Combine energia, segurança e automação.",icon:Settings2},
{value:"manutencao",label:"Manutenção",description:"Avaliação preventiva ou corretiva.",icon:Wrench}];
export const propertyTypes:PropertyType[]=["Residência","Comércio","Empresa","Condomínio","Indústria","Propriedade rural","Outro"];
export const purposes:ProjectPurpose[]=["Nova instalação","Ampliação","Substituição","Manutenção","Avaliação técnica"];
export const contactMethods:ContactMethod[]=["WhatsApp","Telefone","E-mail"];
export const acceptedTypes=["image/jpeg","image/png","image/webp","application/pdf"];export const MAX_FILES=6;export const MAX_FILE_SIZE=8*1024*1024;

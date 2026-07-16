import {Camera,DoorOpen,Fingerprint,PanelsTopLeft,Settings2,Wrench} from "lucide-react";import type {QuoteService,PropertyType,ProjectPurpose,ContactMethod} from "../types/quoteRequest";
export const serviceOptions:Array<{value:QuoteService;label:string;description:string;icon:any}>=[
{value:"energia-solar",label:"Energia Solar",description:"Projeto, instala??o e manuten??o fotovoltaica.",icon:PanelsTopLeft},
{value:"cftv-seguranca",label:"CFTV e Monitoramento",description:"C?meras, grava??o e acesso remoto.",icon:Camera},
{value:"automacao-portoes",label:"Automa??o de Port?es",description:"Automa??o, sensores e manuten??o.",icon:DoorOpen},
{value:"controle-acesso",label:"Controle de Acesso",description:"Tags, biometria, fechaduras e interfones.",icon:Fingerprint},
{value:"projeto-integrado",label:"Projeto Integrado",description:"Combine energia, seguran?a e automa??o.",icon:Settings2},
{value:"manutencao",label:"Manuten??o",description:"Avalia??o preventiva ou corretiva.",icon:Wrench}];
export const propertyTypes:PropertyType[]=["Resid?ncia","Com?rcio","Empresa","Condom?nio","Ind?stria","Propriedade rural","Outro"];
export const purposes:ProjectPurpose[]=["Nova instala??o","Amplia??o","Substitui??o","Manuten??o","Avalia??o t?cnica"];
export const contactMethods:ContactMethod[]=["WhatsApp","Telefone","E-mail"];
export const acceptedTypes=["image/jpeg","image/png","image/webp","application/pdf"];export const MAX_FILES=6;export const MAX_FILE_SIZE=8*1024*1024;

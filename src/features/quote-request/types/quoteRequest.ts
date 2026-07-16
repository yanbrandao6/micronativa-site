export type QuoteService="energia-solar"|"cftv-seguranca"|"automacao-portoes"|"controle-acesso"|"projeto-integrado"|"manutencao";
export type PropertyType="Residência"|"Comércio"|"Empresa"|"Condomínio"|"Indústria"|"Propriedade rural"|"Outro";
export type ProjectPurpose="Nova instalação"|"Ampliação"|"Substituição"|"Manutenção"|"Avaliação técnica";
export type ContactMethod="WhatsApp"|"Telefone"|"E-mail";
export interface QuoteAttachment {id:string;name:string;size:number;type:string;file:File}
export interface CustomerContact {name:string;phone:string;whatsapp:string;email:string}
export interface QuoteRequest {protocol?:string;service:QuoteService|"";additionalServices:QuoteService[];propertyType:PropertyType|"";purpose:ProjectPurpose|"";city:string;state:string;projectDetails:Record<string,string|boolean>;attachments:QuoteAttachment[];customer:CustomerContact;preferredContactMethod:ContactMethod;privacyConsent:boolean;sourcePage:string;projectReference?:string;}

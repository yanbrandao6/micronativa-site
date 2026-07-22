create or replace function public.default_public_status_message(status_value public.quote_request_status)
returns text
language sql
immutable
set search_path = ''
as $$
  select case status_value
    when 'recebido' then 'Recebemos sua solicitação.'
    when 'em_analise' then 'A solicitação está sendo analisada pela equipe.'
    when 'contato_realizado' then 'Nossa equipe realizou uma tentativa de contato.'
    when 'aguardando_cliente' then 'A solicitação aguarda um retorno do cliente.'
    when 'visita_agendada' then 'Uma visita técnica foi agendada.'
    when 'proposta_enviada' then 'A proposta foi preparada.'
    when 'em_execucao' then 'O serviço está em execução.'
    when 'concluido' then 'O serviço foi concluído.'
    when 'cancelado' then 'A solicitação foi cancelada.'
  end;
$$;

update public.quote_request_status_history
set public_message = public.default_public_status_message(new_status)
where position('Ã' in public_message) > 0
   or position('Â' in public_message) > 0;

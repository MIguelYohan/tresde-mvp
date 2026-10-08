-- Public display information is separate from private registration data.
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null check (length(name) between 3 and 150),
 avatar text not null default '', banner text not null default '',
 city text not null default '', state text not null default '',
 is_seller boolean not null default false,
 business_name text not null default '', categories text[] not null default '{}',
 skills text not null default '', verification_info text not null default '', certificate text not null default '',
 created_at timestamptz not null default now()
);
create table public.private_profiles (
 id uuid primary key references public.profiles(id) on delete cascade,
 data jsonb not null default '{}'
);
create unique index private_profiles_cpf on public.private_profiles ((data->>'cpf')) where coalesce(data->>'cpf','') <> '';
create table public.stock (
 id uuid primary key default gen_random_uuid(), seller_id uuid not null references public.profiles(id), data jsonb not null,
 check ((data->>'quantity')::integer >= 0 and (data->>'price')::numeric >= 0)
);
create table public.portfolio (
 id uuid primary key default gen_random_uuid(), seller_id uuid not null references public.profiles(id), data jsonb not null
);
create table public.requests (
 id uuid primary key default gen_random_uuid(), client_id uuid not null references public.profiles(id),
 seller_id uuid references public.profiles(id), selected_offer_id uuid,
 status text not null default 'Aberto' check (status in ('Aberto','Em análise','Em andamento','Concluído','Cancelado')),
 production_status text check (production_status in ('Recebido','Em Produção','Finalizado','Enviado','Entregue')),
 data jsonb not null, status_history jsonb not null default '[]', created_at timestamptz not null default now(),
 check ((data->>'budget')::numeric > 0), check (client_id is distinct from seller_id)
);
create table public.offers (
 id uuid primary key default gen_random_uuid(), request_id uuid not null references public.requests(id),
 seller_id uuid not null references public.profiles(id),
 status text not null default 'Pendente' check (status in ('Pendente','Negociando','Aceita','Recusada','Retirada')),
 data jsonb not null, counter_offer jsonb, created_at timestamptz not null default now(),
 check ((data->>'price')::numeric > 0)
);
alter table public.requests add constraint selected_offer_fk foreign key (selected_offer_id) references public.offers(id);
create unique index one_active_offer on public.offers(request_id,seller_id) where status in ('Pendente','Negociando','Aceita');
create table public.messages (
 id uuid primary key default gen_random_uuid(), request_id uuid not null references public.requests(id),
 sender_id uuid not null references public.profiles(id), text text not null check (length(trim(text)) between 1 and 400), created_at timestamptz not null default now()
);
create table public.reviews (
 id uuid primary key default gen_random_uuid(), request_id uuid not null references public.requests(id),
 reviewer_id uuid not null references public.profiles(id), target_id uuid not null references public.profiles(id),
 target_role text not null check (target_role in ('client','seller')), rating integer not null check (rating between 1 and 5),
 comment text not null default '', created_at timestamptz not null default now(), unique(request_id,reviewer_id)
);
create table public.notifications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id),
 request_id uuid references public.requests(id), title text not null, message text not null,
 read boolean not null default false, created_at timestamptz not null default now()
);
create table public.payments (
 id uuid primary key default gen_random_uuid(), request_id uuid not null unique references public.requests(id),
 client_id uuid not null references public.profiles(id), seller_id uuid not null references public.profiles(id),
 amount numeric(12,2) not null check (amount > 0), method text not null check (method in ('PIX','Cartão')),
 status text not null default 'Simulado' check (status = 'Simulado'), created_at timestamptz not null default now()
);
create index requests_client on public.requests(client_id);
create index requests_seller on public.requests(seller_id);
create index offers_request on public.offers(request_id);
create index offers_seller on public.offers(seller_id);
create index messages_request on public.messages(request_id,created_at);
create index notifications_user on public.notifications(user_id,created_at);
create index reviews_target on public.reviews(target_id);
create index stock_seller on public.stock(seller_id);
create index portfolio_seller on public.portfolio(seller_id);

-- No direct client writes: all mutations use the authenticated, validated RPC below.
do $$ declare t text; begin
 foreach t in array array['profiles','private_profiles','stock','portfolio','requests','offers','messages','reviews','notifications','payments'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
  execute format('grant select on public.%I to authenticated',t);
 end loop;
end $$;
grant select on public.profiles,public.stock,public.portfolio,public.requests,public.reviews to anon;
create policy profiles_read on public.profiles for select using (true);
create policy private_profiles_read on public.private_profiles for select to authenticated using (id = (select auth.uid()));
create policy stock_read on public.stock for select using (seller_id = (select auth.uid()) or coalesce((data->>'active')::boolean,true));
create policy portfolio_read on public.portfolio for select using (true);
create policy requests_read on public.requests for select using (status in ('Aberto','Em análise') or (select auth.uid()) in (client_id,seller_id));
create policy offers_read on public.offers for select to authenticated using (seller_id = (select auth.uid()) or exists(select 1 from public.requests r where r.id = request_id and r.client_id = (select auth.uid())));
create policy messages_read on public.messages for select to authenticated using (exists(select 1 from public.requests r where r.id = request_id and (select auth.uid()) in (r.client_id,r.seller_id)));
create policy reviews_read on public.reviews for select using (true);
create policy notifications_read on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy payments_read on public.payments for select to authenticated using ((select auth.uid()) in (client_id,seller_id));

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.profiles(id,name) values(new.id,coalesce(nullif(left(new.raw_user_meta_data->>'name',150),''),'Novo usuário'));
 insert into public.private_profiles(id) values(new.id);
 return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
revoke all on function public.handle_new_user() from public,anon,authenticated;

-- Shared moderation is also enforced in Postgres, including direct API calls.
create function public.check_text(value text) returns void language plpgsql set search_path = '' as $$
begin
 if length(coalesce(value,'')) > 10000 or lower(value) ~ '\m(porra|caralho|merda|puta|foder|foda|buceta|fdp)\M' then
  raise exception 'Revise o texto: conteúdo inválido ou ofensivo.';
 end if;
end $$;
revoke all on function public.check_text(text) from public,anon,authenticated;

create function public.marketplace_action(action text, payload jsonb default '{}') returns uuid
language plpgsql security definer set search_path = '' as $$
declare
 uid uuid := auth.uid(); rid uuid; oid uuid; result uuid; recipient uuid;
 r public.requests%rowtype; o public.offers%rowtype; p public.profiles%rowtype;
 d jsonb := coalesce(payload->'data','{}'); next_step text; history_status text; note text;
 steps text[] := array['Recebido','Em Produção','Finalizado','Enviado','Entregue'];
begin
 if uid is null then raise exception 'Entre na sua conta para continuar.'; end if;
 select * into strict p from public.profiles where id=uid;
 -- Evaluate only public text fields; passwords and contact data never pass this RPC.
 perform public.check_text(concat_ws(' ',d->>'name',d->>'title',d->>'description',d->>'notes',d->>'skills',d->>'businessName',d->>'verificationInfo',d->>'category',payload->>'text',payload->>'comment',payload->>'reason'));
 if action = 'save_profile' then
  if length(trim(d->>'name')) < 3 then raise exception 'Informe seu nome completo.'; end if;
  update public.profiles set name=trim(d->>'name'), avatar=coalesce(d->>'avatar',''),banner=coalesce(d->>'banner',''),city=coalesce(d->'address'->>'cidade',''),state=coalesce(d->'address'->>'uf','') where id=uid;
  update public.private_profiles set data=data || (d - array['name','avatar','banner','password','email','isSeller','sellerData']) where id=uid;
  return uid;
 elsif action = 'save_seller' then
  if length(trim(d->>'businessName')) < 3 or jsonb_array_length(coalesce(d->'categories','[]'))=0 then raise exception 'Informe nome comercial e especialidades.'; end if;
  update public.profiles set is_seller=true,business_name=d->>'businessName',categories=array(select jsonb_array_elements_text(d->'categories')),skills=coalesce(d->>'skills',''),verification_info=coalesce(d->>'verificationInfo',''),certificate=coalesce(d->>'certificate','') where id=uid;
  update public.private_profiles set data=data || jsonb_build_object('cnpj',coalesce(d->>'cnpj','')) where id=uid;
  return uid;
 elsif action in ('save_stock','save_portfolio','delete_stock','delete_portfolio') then
  if not p.is_seller then raise exception 'Ative seu cadastro de prestador.'; end if;
  result := coalesce((payload->>'id')::uuid,gen_random_uuid());
  if action = 'save_stock' then
   if coalesce(trim(d->>'name'),'')='' or (d->>'quantity')::integer is null or (d->>'price')::numeric is null then raise exception 'Item inválido.'; end if;
   insert into public.stock(id,seller_id,data) values(result,uid,d) on conflict(id) do update set data=excluded.data where stock.seller_id=uid;
  elsif action = 'save_portfolio' then
   if coalesce(trim(d->>'title'),'')='' or coalesce(d->>'image','')='' then raise exception 'Informe título e arquivo.'; end if;
   insert into public.portfolio(id,seller_id,data) values(result,uid,d) on conflict(id) do update set data=excluded.data where portfolio.seller_id=uid;
  elsif action = 'delete_stock' then delete from public.stock where id=result and seller_id=uid;
  else delete from public.portfolio where id=result and seller_id=uid; end if;
  if not found then raise exception 'Item não encontrado ou sem permissão.'; end if;
  return result;
 elsif action = 'read_notifications' then
  update public.notifications set read=true where user_id=uid and (payload->>'id' is null or id=(payload->>'id')::uuid);
  return uid;
 end if;

 -- Lock the request first in every workflow to serialize competing actions.
 rid := (payload->>'requestId')::uuid;
 oid := (payload->>'offerId')::uuid;
 if oid is not null then select request_id into rid from public.offers where id=oid; end if;
 if action='save_request' then rid := (payload->>'id')::uuid; end if;
 if rid is not null then select * into r from public.requests where id=rid for update; end if;
 if action='save_request' then
  if coalesce(trim(d->>'title'),'')='' or coalesce(trim(d->>'description'),'')='' or coalesce(trim(d->>'category'),'')='' or coalesce((d->>'budget')::numeric,0)<=0 or coalesce((d->>'desiredDeadline')::date,current_date-1)<current_date then raise exception 'Informe título, descrição, categoria, orçamento e prazo válidos.'; end if;
  if jsonb_array_length(coalesce(d->'attachments','[]'))>5 then raise exception 'Máximo de cinco anexos.'; end if;
  if r.id is not null then
   if r.client_id<>uid or r.status not in ('Aberto','Em análise') then raise exception 'Pedido não pode ser editado.'; end if;
   if exists(select 1 from public.offers where request_id=r.id and status in ('Pendente','Negociando') and (data->>'deadlineDate')::date>(d->>'desiredDeadline')::date) then raise exception 'O prazo conflita com uma proposta ativa.'; end if;
   update public.requests set data=d where id=r.id;
  else
   rid := coalesce(rid,gen_random_uuid());
   insert into public.requests(id,client_id,data,status_history) values(rid,uid,d,jsonb_build_array(jsonb_build_object('status','Aberto','timestamp',now(),'note','Requisição publicada.')));
   insert into public.notifications(user_id,request_id,title,message) select id,rid,'Nova requisição compatível',d->>'title' from public.profiles where is_seller and id<>uid and ((d->>'category')=any(categories) or (d->>'category'='Impressão 3D e Pintura' and categories && array['Impressão 3D','Pintura Manual']));
  end if;
  return rid;
 end if;
 if r.id is null then raise exception 'Pedido não encontrado.'; end if;
 if oid is not null then select * into o from public.offers where id=oid for update; end if;
 if action='save_offer' then
  if not p.is_seller or r.client_id=uid or r.status not in ('Aberto','Em análise') or not (r.data->>'category'=any(p.categories) or (r.data->>'category'='Impressão 3D e Pintura' and p.categories && array['Impressão 3D','Pintura Manual'])) then raise exception 'Oferta não permitida para este pedido.'; end if;
  if coalesce((d->>'price')::numeric,0)<=0 or coalesce((d->>'deadlineDate')::date,current_date-1)<current_date or (d->>'deadlineDate')::date>(r.data->>'desiredDeadline')::date or coalesce(trim(d->>'notes'),'')='' then raise exception 'Valor, prazo ou descrição inválidos.'; end if;
  if o.id is not null and (o.seller_id<>uid or o.status not in ('Pendente','Negociando')) then raise exception 'Oferta não pode ser editada.'; end if;
  result:=coalesce(o.id,gen_random_uuid());
  insert into public.offers(id,request_id,seller_id,data) values(result,r.id,uid,d) on conflict(id) do update set data=excluded.data,status='Pendente',counter_offer=null;
  if r.status='Aberto' then update public.requests set status='Em análise',status_history=status_history||jsonb_build_array(jsonb_build_object('status','Em análise','timestamp',now(),'note','Proposta recebida.')) where id=r.id; end if;
  insert into public.notifications(user_id,request_id,title,message) values(r.client_id,r.id,'Nova proposta recebida',r.data->>'title');
  return result;
 elsif action in ('withdraw_offer','reject_offer','negotiate','respond_counter','accept_offer') then
  if o.id is null or r.status not in ('Aberto','Em análise') or o.status not in ('Pendente','Negociando') then raise exception 'Esta proposta não está disponível.'; end if;
  if action in ('withdraw_offer','respond_counter') then
   if o.seller_id<>uid then raise exception 'Somente o prestador pode alterar sua oferta.'; end if;
  elsif r.client_id<>uid then raise exception 'Somente o cliente pode selecionar ou negociar propostas.'; end if;
  if action='withdraw_offer' then update public.offers set status='Retirada' where id=o.id;
  elsif action='reject_offer' then update public.offers set status='Recusada' where id=o.id;
  elsif action='negotiate' then
   if coalesce((d->>'price')::numeric,0)<=0 or coalesce((d->>'deadlineDate')::date,current_date-1)<current_date or (d->>'deadlineDate')::date>(r.data->>'desiredDeadline')::date or coalesce(trim(d->>'notes'),'')='' then raise exception 'Contraproposta inválida.'; end if;
   update public.offers set status='Negociando',counter_offer=d where id=o.id;
  elsif action='respond_counter' then
   if o.status<>'Negociando' then raise exception 'Não existe contraproposta pendente.'; end if;
   update public.offers set data=case when (payload->>'accept')::boolean then o.data||o.counter_offer else o.data end,status='Pendente',counter_offer=null where id=o.id;
  else
   if o.status<>'Pendente' or (o.data->>'deadlineDate')::date<current_date then raise exception 'A proposta precisa ser confirmada pelo prestador e ter prazo válido.'; end if;
   if coalesce(payload->>'method','') not in ('PIX','Cartão') then raise exception 'Forma de pagamento inválida.'; end if;
   update public.offers set status=case when id=o.id then 'Aceita' else 'Recusada' end where request_id=r.id and status in ('Pendente','Negociando');
   update public.requests set status='Em andamento',production_status='Recebido',seller_id=o.seller_id,selected_offer_id=o.id,status_history=status_history||jsonb_build_array(jsonb_build_object('status','Recebido','timestamp',now(),'note','Proposta aceita; pagamento simulado.')) where id=r.id;
   insert into public.payments(request_id,client_id,seller_id,amount,method) values(r.id,uid,o.seller_id,(o.data->>'price')::numeric,payload->>'method');
  end if;
  insert into public.notifications(user_id,request_id,title,message) values(case when uid=r.client_id then o.seller_id else r.client_id end,r.id,'Proposta atualizada',r.data->>'title');
  return o.id;
 elsif action='cancel_request' then
  if not ((r.status in ('Aberto','Em análise') and r.client_id=uid) or (r.status='Em andamento' and r.production_status in ('Recebido','Em Produção') and uid in (r.client_id,r.seller_id))) then raise exception 'Pedido não pode ser cancelado.'; end if;
  if length(trim(coalesce(payload->>'reason','')))<3 then raise exception 'Informe o motivo do cancelamento.'; end if;
  history_status:='Cancelado'; note:=payload->>'reason';
  update public.requests set status='Cancelado' where id=r.id;
  update public.offers set status='Recusada' where request_id=r.id and status in ('Pendente','Negociando');
 elsif action='advance_production' then
  if r.seller_id is distinct from uid or r.status<>'Em andamento' or r.production_status='Entregue' then raise exception 'Somente o prestador contratado pode avançar a produção.'; end if;
  next_step:=steps[array_position(steps,r.production_status)+1];
  update public.requests set production_status=next_step where id=r.id;
  history_status:=next_step;note:='Produção atualizada pelo prestador.';
 elsif action='confirm_receipt' then
  if r.client_id<>uid or r.status<>'Em andamento' or r.production_status<>'Entregue' then raise exception 'Somente o cliente pode confirmar após a entrega.'; end if;
  update public.requests set status='Concluído' where id=r.id;
  history_status:='Concluído';note:='Recebimento confirmado pelo cliente.';
 elsif action='send_message' then
  if not coalesce(uid in (r.client_id,r.seller_id),false) or r.status not in ('Em andamento','Concluído') then raise exception 'Chat restrito aos participantes do pedido.'; end if;
  insert into public.messages(request_id,sender_id,text) values(r.id,uid,trim(payload->>'text')) returning id into result;
  insert into public.notifications(user_id,request_id,title,message) values(case when uid=r.client_id then r.seller_id else r.client_id end,r.id,'Nova mensagem',r.data->>'title');
  return result;
 elsif action='review' then
  if r.status<>'Concluído' or not coalesce(uid in (r.client_id,r.seller_id),false) then raise exception 'Avaliação disponível aos participantes após o recebimento.'; end if;
  recipient:=case when uid=r.client_id then r.seller_id else r.client_id end;
  insert into public.reviews(request_id,reviewer_id,target_id,target_role,rating,comment) values(r.id,uid,recipient,case when uid=r.client_id then 'seller' else 'client' end,(payload->>'rating')::integer,coalesce(payload->>'comment','')) returning id into result;
  insert into public.notifications(user_id,request_id,title,message) values(recipient,r.id,'Nova avaliação',r.data->>'title');
  return result;
 else raise exception 'Ação desconhecida.';
 end if;
 update public.requests set status_history=status_history||jsonb_build_array(jsonb_build_object('status',history_status,'timestamp',now(),'note',note)) where id=r.id;
 insert into public.notifications(user_id,request_id,title,message)
 select distinct x,r.id,history_status,r.data->>'title' from (select r.client_id x union select r.seller_id union select seller_id from public.offers where request_id=r.id) recipients where x is not null and x<>uid;
 return r.id;
end $$;
revoke all on function public.marketplace_action(text,jsonb) from public,anon;
grant execute on function public.marketplace_action(text,jsonb) to authenticated;

-- Public images/portfolio and private request files have separate buckets.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('public-media','public-media',true,768000,array['image/png','image/jpeg','image/webp','application/pdf']),
 ('request-files','request-files',false,768000,array['image/png','image/jpeg','image/webp','application/pdf','application/octet-stream'])
on conflict(id) do nothing;
create policy upload_own_media on storage.objects for insert to authenticated with check (bucket_id in ('public-media','request-files') and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy delete_own_media on storage.objects for delete to authenticated using (bucket_id in ('public-media','request-files') and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy read_media on storage.objects for select using (
 bucket_id='public-media' or (bucket_id='request-files' and ((storage.foldername(name))[1]=(select auth.uid())::text or exists(
  select 1 from public.requests r where r.id::text=(storage.foldername(name))[2] and r.client_id::text=(storage.foldername(name))[1]
  and (r.status in ('Aberto','Em análise') or (select auth.uid()) in (r.client_id,r.seller_id))
  and exists(select 1 from jsonb_array_elements(coalesce(r.data->'attachments','[]')) a where a->>'path'=name)
 )))
);

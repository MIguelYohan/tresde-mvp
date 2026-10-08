-- Deliberately public aggregates for the existing marketplace. No individual
-- proposal, customer, payment, message or private request details are exposed.
create function public.marketplace_stats() returns jsonb
language sql stable security definer set search_path = '' as $$
 select jsonb_build_object(
  'offerCounts', coalesce((select jsonb_object_agg(id,offer_count) from (
   select r.id, count(o.id) filter(where o.status in ('Pendente','Negociando')) offer_count
   from public.requests r left join public.offers o on o.request_id=r.id
   where r.status in ('Aberto','Em análise') group by r.id
  ) counts),'{}'::jsonb),
  'makers', coalesce((select jsonb_object_agg(p.id,jsonb_build_object(
   'referencePrice',(select min(price) from (
    select (s.data->>'price')::numeric price from public.stock s where s.seller_id=p.id and coalesce((s.data->>'active')::boolean,true) and (s.data->>'quantity')::integer>0
    union all select (o.data->>'price')::numeric from public.offers o where o.seller_id=p.id and o.status<>'Retirada'
   ) prices),
   'completedWork',coalesce((select jsonb_agg(jsonb_build_object('title',r.data->>'title','category',r.data->>'category')) from public.requests r where r.seller_id=p.id and r.status='Concluído'),'[]'::jsonb)
  )) from public.profiles p where p.is_seller),'{}'::jsonb)
 );
$$;
revoke all on function public.marketplace_stats() from public;
grant execute on function public.marketplace_stats() to anon,authenticated;

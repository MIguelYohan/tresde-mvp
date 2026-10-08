-- Registration data survives the email-confirmation flow (which has no session yet).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
 d jsonb := coalesce(new.raw_user_meta_data->'registration','{}');
 s jsonb := new.raw_user_meta_data->'seller';
 seller boolean := jsonb_typeof(s)='object' and length(trim(s->>'businessName')) >= 3;
begin
 perform public.check_text(concat_ws(' ',new.raw_user_meta_data->>'name',s->>'businessName',s->>'skills'));
 insert into public.profiles(id,name,city,state,is_seller,business_name,categories,skills)
 values(new.id,coalesce(nullif(left(new.raw_user_meta_data->>'name',150),''),'Novo usuário'),
  coalesce(d->'address'->>'cidade',''),coalesce(d->'address'->>'uf',''),coalesce(seller,false),
  coalesce(s->>'businessName',''),array(select jsonb_array_elements_text(coalesce(s->'categories','[]'))),coalesce(s->>'skills',''));
 insert into public.private_profiles(id,data) values(new.id,jsonb_build_object(
  'cpf',regexp_replace(coalesce(d->>'cpf',''),'[^0-9]','','g'),'birthDate',d->>'birthDate',
  'cep',d->>'cep','address',d->'address','phone',d->>'phone','gender',d->>'gender','cnpj',s->>'cnpj'));
 return new;
end $$;

CREATE OR REPLACE FUNCTION public.start_asada_trial(p_user uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare e text; r public.trial_requests; a uuid;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 select asada_id into a from public.memberships where user_id=p_user;
 if a is not null then return a; end if;
 if exists(select 1 from public.platform_admins where user_id=p_user) then return null; end if;
 select lower(email) into e from auth.users where id=p_user and email_confirmed_at is not null;
 if e is null then return null; end if;
 select * into r from public.trial_requests where email=e for update;
 if r.email is null or r.asada_id is not null then return null; end if;
 insert into public.asadas(name,access_kind,trial_started_at,trial_ends_at) values(r.name,'trial',now(),now()+interval '120 hours') returning id into a;
 insert into public.memberships(user_id,asada_id,email,role) values(p_user,a,e,r.role);
 update public.trial_requests set asada_id=a,user_id=p_user where email=e;
 return a;
end; $function$;

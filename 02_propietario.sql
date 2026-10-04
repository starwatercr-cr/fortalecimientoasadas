-- Primero crear la cuenta de Star Water en Authentication > Users.
-- Cambiar el correo de ejemplo por el de esa cuenta. No asignar esta función
-- a usuarios de las ASADAS.
insert into public.platform_admins (user_id)
select id from auth.users where lower(email) = lower('CAMBIAR_POR_CORREO_DE_STAR_WATER')
on conflict (user_id) do update set active = true;

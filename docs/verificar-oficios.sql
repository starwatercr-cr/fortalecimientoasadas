-- Solo consulta: ambas restricciones deben incluir 'notice'.
select conname, pg_get_constraintdef(oid) as definicion
from pg_constraint
where conrelid = 'public.arrears_records'::regclass
  and conname in ('arrears_records_kind_check','arrears_records_check')
order by conname;

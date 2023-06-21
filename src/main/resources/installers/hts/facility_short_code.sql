with org_short as (
    select organisation_unit_id, cast(row_number() over () as text) as short_code
    from base_organisation_unit_identifier
    where name = 'DATIM_ID')
insert into base_organisation_unit_identifier (organisation_unit_id,
                                               code, name)
select organisation_unit_id,
       case
           when length(short_code::text) <= 2
               then lpad(short_code, 3, '0')
           else
               short_code
           end,
       'SHORT_CODE' as name
from org_short;
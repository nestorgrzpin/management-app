-- Check all projects and their ingresos_maximo values
SELECT id, name, client, ingresos_maximo, ingresos_minimo, costo FROM projects LIMIT 5;

-- If ingresos_maximo is null for all or most, populate from ingresos_minimo
UPDATE projects 
SET ingresos_maximo = ingresos_minimo 
WHERE ingresos_maximo IS NULL AND ingresos_minimo IS NOT NULL;

-- Verify the update
SELECT id, name, ingresos_maximo, ingresos_minimo FROM projects WHERE ingresos_maximo IS NOT NULL LIMIT 5;

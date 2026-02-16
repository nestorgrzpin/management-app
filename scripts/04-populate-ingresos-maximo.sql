-- Update ingresos_maximo with values from ingresos_minimo since estimated_amount was empty
UPDATE projects 
SET ingresos_maximo = ingresos_minimo 
WHERE ingresos_maximo IS NULL AND ingresos_minimo IS NOT NULL;

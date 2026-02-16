-- Rename columns in projects table
ALTER TABLE projects 
RENAME COLUMN ingresos TO ingresos_minimo;

ALTER TABLE projects 
RENAME COLUMN estimated_amount TO ingresos_maximo;

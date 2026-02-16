-- Step 1: Add missing columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS fase VARCHAR(50) DEFAULT 'Preparación de propuesta';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS relacion VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS empresa VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS ingresos NUMERIC(15, 2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS costo NUMERIC(15, 2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS utilidad NUMERIC(15, 2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS utilidad_porcentaje NUMERIC(5, 2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS devengado NUMERIC(15, 2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS pagado NUMERIC(15, 2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS por_cobrar NUMERIC(15, 2);

-- Step 2: Delete existing projects (disable constraint temporarily if needed)
DELETE FROM project_activities;
DELETE FROM projects;

-- Step 3: Get first admin user or any user, or use a specific UUID
-- Insert 19 new projects - using the first user from the users table if available
INSERT INTO projects (name, client, start_date, estimated_execution_date, estimated_amount, status, created_by, adjudication_type, fase, relacion, empresa, ingresos, costo, utilidad, utilidad_porcentaje, devengado, pagado, por_cobrar) 
SELECT 
    name, client, start_date, estimated_execution_date, estimated_amount, status, 
    COALESCE((SELECT id FROM users LIMIT 1), '00000000-0000-0000-0000-000000000001'::uuid),
    adjudication_type, fase, relacion, empresa, ingresos, costo, utilidad, utilidad_porcentaje, devengado, pagado, por_cobrar
FROM (VALUES
('RENOVACIÓN TECNOLÓGICA PEROTE', 'OADPYRS', '2026-04-01'::date, '2026-04-01'::date, 704.00::numeric, 'active', 'ADSN', 'Preparación de propuesta', 'TELINFRA', 'TELINFRA', 704.00::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric),
('RENOVACIÓN DE INFRAESTRUCTURA ALTIPLANO', 'OADPYRS', '2026-04-01'::date, '2026-04-01'::date, 522.00::numeric, 'active', 'ADSN', 'Preparación de propuesta', 'TELINFRA', 'TELINFRA', 522.00::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric),
('RENOVACIÓN DE INFRAESTRUCTURA PEROTE', 'OADPYRS', '2026-05-01'::date, '2026-05-01'::date, 464.00::numeric, 'active', 'ADSN', 'Preparación de propuesta', 'TELINFRA', 'TELINFRA', 464.00::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric),
('EQUIPAMIENTO TÉCNICO DEL C3', 'OADPYRS', '2026-04-01'::date, '2026-04-01'::date, 7.20::numeric, 'active', 'ADSN', 'Preparación de propuesta', 'TELINFRA', 'TELINFRA', 7.20::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric),
('BRAZALETES 2026', 'EDOMEX', '2026-01-01'::date, '2026-01-01'::date, 231.00::numeric, 'active', 'ADSN', 'Adjudicación', 'SIEGB', 'SIEGB', 331.00::numeric, 100.00::numeric, 231.00::numeric, 70::numeric, 34::numeric, 14::numeric, 10::numeric),
('INHIBICIÓN', 'EDOMEX', '2026-03-01'::date, '2026-03-01'::date, 230.00::numeric, 'active', 'ADSN', 'Preparación de propuesta', 'TELINFRA', 'TELINFRA', 230.00::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric),
('INHIBICIÓN', 'CDMX', '2026-01-01'::date, '2026-01-01'::date, 74.40::numeric, 'active', 'ADSN', 'Ejecución', 'SIEGB', 'SIEGB', 74.40::numeric, 60.00::numeric, 14.40::numeric, 19::numeric, 34::numeric, 14::numeric, 10::numeric),
('RED DIGITAL', 'CDMX', '2026-01-01'::date, '2026-01-01'::date, 51.90::numeric, 'active', 'ADSN', 'Ejecución', 'TELINFRA', 'TELINFRA', 51.90::numeric, 40.00::numeric, 11.90::numeric, 23::numeric, 34::numeric, 14::numeric, 10::numeric),
('SENTENCIADOS', 'CDMX', '2026-01-01'::date, '2026-01-01'::date, 27.60::numeric, 'active', 'ADSN', 'Ejecución', 'TELINFRA', 'TELINFRA', 27.60::numeric, 20.00::numeric, 7.60::numeric, 28::numeric, 34::numeric, 14::numeric, 10::numeric),
('AUDITORÍAS TÉCNICAS OAXACA', 'OADPYRS', '2026-01-01'::date, '2026-01-01'::date, 27.00::numeric, 'active', 'CONTRATO PRIVADO', 'Ejecución', 'SIEGB', 'SIEGB', 27.00::numeric, 20.00::numeric, 7.00::numeric, 26::numeric, 34::numeric, 14::numeric, 10::numeric),
('CPS MORELOS', 'OADPYRS', '2026-01-01'::date, '2026-01-01'::date, 72.38::numeric, 'active', 'CONTRATO PRIVADO', 'Ejecución', 'SIESIE', 'SIESIE', 72.38::numeric, 50.00::numeric, 22.38::numeric, 31::numeric, 34::numeric, 14::numeric, 10::numeric),
('CPS CHIAPAS', 'OADPYRS', '2026-02-01'::date, '2026-02-01'::date, 72.38::numeric, 'active', 'CONTRATO PRIVADO', 'Ejecución', 'SIESIE', 'SIESIE', 72.38::numeric, 50.00::numeric, 22.38::numeric, 31::numeric, 34::numeric, 14::numeric, 10::numeric),
('DIGITALIZACIÓN', 'CDMX', '2026-04-01'::date, '2026-04-01'::date, 165.88::numeric, 'active', 'AD', 'Preparación de propuesta', 'SIESIE', 'SIESIE', 165.88::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric),
('CCTV TERMINAL 1 Y 2', 'AICMC', '2026-02-05'::date, '2026-02-05'::date, 498.80::numeric, 'active', 'ADITP', 'Preparación de propuesta', 'SIESIE', 'SIESIE', 498.80::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric),
('GOBIERNO DIGITAL', 'GÓMEZ PALACIO', '2026-01-01'::date, '2026-01-01'::date, 7.00::numeric, 'active', NULL, 'Preparación de propuesta', 'SIE', 'SIE', 7.00::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric),
('SOPORTE APLICATIVOS', 'INFONACOT', '2026-01-01'::date, '2026-01-01'::date, 50.00::numeric, 'active', 'LICITACIÓN', 'Preparación de propuesta', 'IE', 'IE', 50.00::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric),
('VIDEOVIGILANCIA', 'PUEBLA', '2026-01-01'::date, '2026-01-01'::date, 12.00::numeric, 'active', 'MULTIANUAL', 'Preparación de propuesta', 'SIEGB', 'SIEGB', 12.00::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric),
('RENOVACIÓN TECNOLÓGICA 7', 'OADPYRS', '2026-01-01'::date, '2026-01-01'::date, 300.00::numeric, 'completed', NULL, 'Cierre', 'TELINFRA', 'TELINFRA', 400.00::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric),
('SISTEMA TECNOLÓGICO DE SEGURIDAD ALTIPLANO', 'OADPYRS', '2026-01-01'::date, '2026-01-01'::date, 300.00::numeric, 'completed', NULL, 'Cierre', 'TELINFRA', 'TELINFRA', 400.00::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric, 0::numeric)
) AS t(name, client, start_date, estimated_execution_date, estimated_amount, status, adjudication_type, fase, relacion, empresa, ingresos, costo, utilidad, utilidad_porcentaje, devengado, pagado, por_cobrar);

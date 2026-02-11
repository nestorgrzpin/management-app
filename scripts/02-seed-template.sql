-- Insert Phases
INSERT INTO phases (name, description, phase_number) VALUES
('FASE 1: IDENTIFICACIÓN DE OPORTUNIDADES', 'Identificación y evaluación inicial de oportunidades de negocio', 1),
('FASE 2: PREPARACIÓN DE PROPUESTA', 'Preparación completa de propuesta técnica y económica', 2),
('FASE 3: ADJUDICACIÓN Y CONTRATACIÓN', 'Gestión post-licitación y formalización de contratos', 3),
('FASE 4: EJECUCIÓN', 'Implementación del proyecto y ejecución de servicios', 4),
('FASE 5: MONITOREO Y CONTROL', 'Seguimiento y control del proyecto durante su ejecución', 5),
('FASE 6: CIERRE', 'Cierre del proyecto y lecciones aprendidas', 6)
ON CONFLICT DO NOTHING;

-- Get phase IDs for reference
WITH phase_ids AS (
  SELECT id, phase_number FROM phases
)

-- FASE 1: IDENTIFICACIÓN DE OPORTUNIDADES
INSERT INTO activities (code, name, objective, expected_info, phase_id, is_subactivity, base_duration_value, base_duration_unit, parent_activity_id) VALUES
('1.1', 'Monitoreo de CompraNet/licitaciones', 'Identificar oportunidades de negocio alineadas a capacidades SIE/Telinfra.', 'Lista de licitaciones vigentes con fechas límite.', (SELECT id FROM phases WHERE phase_number = 1), FALSE, 4, 'hours', NULL),
('1.2', 'Evaluación inicial de capacidad técnica', 'Determinar si SIE/Telinfra tiene recursos técnicos para el proyecto.', 'Matriz de capacidades vs. requisitos.', (SELECT id FROM phases WHERE phase_number = 1), FALSE, 8, 'hours', NULL),
('1.3', 'Simulación financiera preliminar', 'Proyectar P&L y flujo de caja del proyecto.', 'P&L proyectado con escenarios.', (SELECT id FROM phases WHERE phase_number = 1), FALSE, 8, 'hours', NULL),
('1.4', 'Evaluación de viabilidad financiera', 'Determinar si el proyecto es rentable y financiable.', 'Análisis costo-beneficio preliminar.', (SELECT id FROM phases WHERE phase_number = 1), FALSE, 8, 'hours', NULL),
('1.5', 'Análisis de requisitos legales/administrativos', 'Identificar requisitos documentales y legales de la licitación.', 'Checklist de documentos requeridos.', (SELECT id FROM phases WHERE phase_number = 1), FALSE, 6, 'hours', NULL),
('1.6', 'Identificación de aliados potenciales', 'Mapear proveedores y socios que complementen capacidades.', 'Lista de candidatos con fortalezas.', (SELECT id FROM phases WHERE phase_number = 1), FALSE, 16, 'hours', NULL),
('1.7', 'Definición de estrategia jurídica de la oportunidad', 'Definir estrategia legal para la participación.', 'Estrategia documentada.', (SELECT id FROM phases WHERE phase_number = 1), FALSE, 8, 'hours', NULL),
('1.8', 'Decisión Go/No-Go', 'Aprobar o rechazar participación en la licitación.', 'Acta de decisión con justificación.', (SELECT id FROM phases WHERE phase_number = 1), FALSE, 4, 'hours', NULL),
('1.9', 'Registro de oportunidad en sistema', 'Documentar la oportunidad para seguimiento.', 'Registro en sistema con datos clave.', (SELECT id FROM phases WHERE phase_number = 1), FALSE, 1, 'hours', NULL)
ON CONFLICT DO NOTHING;

-- FASE 2: PREPARACIÓN DE PROPUESTA
INSERT INTO activities (code, name, objective, expected_info, phase_id, is_subactivity, base_duration_value, base_duration_unit, parent_activity_id) VALUES
('2.1', 'Levantamiento técnico detallado', 'Recopilar información técnica en sitio del cliente.', 'Documento de requerimientos técnicos.', (SELECT id FROM phases WHERE phase_number = 2), FALSE, 40, 'hours', NULL),
('2.2', 'Diseño de solución técnica', 'Desarrollar arquitectura y especificaciones técnicas.', 'Diseño técnico detallado.', (SELECT id FROM phases WHERE phase_number = 2), FALSE, 80, 'hours', NULL),
('2.3', 'Solicitud de cotizaciones a proveedores', 'Obtener precios de proveedores para la solución.', 'Cotizaciones formales comparables.', (SELECT id FROM phases WHERE phase_number = 2), FALSE, 24, 'hours', NULL),
('2.4', 'Evaluación y selección de cotizaciones', 'Elegir proveedores óptimos por precio/calidad.', 'Matriz de evaluación con selección.', (SELECT id FROM phases WHERE phase_number = 2), FALSE, 16, 'hours', NULL),
('2.5', 'Simulación financiera detallada (P&L)', 'Proyectar rentabilidad con costos confirmados.', 'P&L detallado con contingencias.', (SELECT id FROM phases WHERE phase_number = 2), FALSE, 16, 'hours', NULL),
('2.6', 'Análisis de flujo de caja', 'Proyectar necesidades de financiamiento.', 'Flujo de caja proyectado.', (SELECT id FROM phases WHERE phase_number = 2), FALSE, 8, 'hours', NULL),
('2.7', 'Definición de estrategia fiscal', 'Establecer estructura fiscal óptima para el proyecto.', 'Estrategia fiscal documentada.', (SELECT id FROM phases WHERE phase_number = 2), FALSE, 8, 'hours', NULL),
('2.8', 'Definición de estrategia jurídica de la contratación', 'Definir estructura legal de contratación.', 'Estrategia documentada.', (SELECT id FROM phases WHERE phase_number = 2), FALSE, 8, 'hours', NULL),
('2.9', 'Preparación de documentación legal SIE/Telinfra', 'Elaborar documentos legales de SIE/Telinfra para la propuesta.', 'Expediente legal completo de SIE/Telinfra.', (SELECT id FROM phases WHERE phase_number = 2), FALSE, 24, 'hours', NULL),
('2.9.1', 'Preparación de documentación legal Empresa Principal', 'Recabar documentos jurídico/administrativos de la Empresa Principal.', 'Expediente legal de Empresa Principal.', (SELECT id FROM phases WHERE phase_number = 2), TRUE, 24, 'hours', NULL),
('2.10', 'Acuerdos de confidencialidad (NDA)', 'Formalizar confidencialidad con proveedores/aliados.', 'NDAs firmados.', (SELECT id FROM phases WHERE phase_number = 2), FALSE, 4, 'hours', NULL),
('2.11', 'Convenios de participación conjunta', 'Formalizar alianzas para la propuesta.', 'Convenios firmados.', (SELECT id FROM phases WHERE phase_number = 2), FALSE, 16, 'hours', NULL),
('2.12', 'Due diligence de proveedores', 'Validar cumplimiento fiscal/legal de proveedores.', 'Reporte de due diligence.', (SELECT id FROM phases WHERE phase_number = 2), FALSE, 16, 'hours', NULL),
('2.13', 'Integración de propuesta técnica', 'Consolidar todos los elementos técnicos.', 'Propuesta técnica lista para entrega.', (SELECT id FROM phases WHERE phase_number = 2), FALSE, 40, 'hours', NULL),
('2.14', 'Integración de propuesta económica', 'Consolidar oferta económica final.', 'Propuesta económica lista para entrega.', (SELECT id FROM phases WHERE phase_number = 2), FALSE, 16, 'hours', NULL),
('2.15', 'Revisión y aprobación final de propuesta', 'Validar propuesta completa antes de entrega.', 'Propuesta aprobada para entrega.', (SELECT id FROM phases WHERE phase_number = 2), FALSE, 8, 'hours', NULL),
('2.16', 'Presentación física de oferta', 'Entregar propuesta en tiempo y forma.', 'Acuse de recibo de propuesta.', (SELECT id FROM phases WHERE phase_number = 2), FALSE, 8, 'hours', NULL)
ON CONFLICT DO NOTHING;

-- FASE 3: ADJUDICACIÓN Y CONTRATACIÓN
INSERT INTO activities (code, name, objective, expected_info, phase_id, is_subactivity, base_duration_value, base_duration_unit, parent_activity_id) VALUES
('3.1', 'Seguimiento de fallo', 'Monitorear resultado de la licitación.', 'Notificación de fallo.', (SELECT id FROM phases WHERE phase_number = 3), FALSE, 4, 'hours', NULL),
('3.2', 'Negociación de contrato con cliente', 'Acordar términos finales del contrato.', 'Contrato negociado.', (SELECT id FROM phases WHERE phase_number = 3), FALSE, 24, 'hours', NULL),
('3.3', 'Formalización de alianzas estratégicas', 'Firmar contratos definitivos con aliados.', 'Contratos de alianza firmados.', (SELECT id FROM phases WHERE phase_number = 3), FALSE, 16, 'hours', NULL),
('3.4', 'Contratos con subcontratistas', 'Formalizar contratos con proveedores operativos.', 'Contratos firmados con proveedores.', (SELECT id FROM phases WHERE phase_number = 3), FALSE, 24, 'hours', NULL),
('3.5', 'Gestión de fianzas y garantías', 'Obtener fianzas requeridas por el contrato.', 'Fianzas emitidas y entregadas.', (SELECT id FROM phases WHERE phase_number = 3), FALSE, 8, 'hours', NULL),
('3.6', 'Registro fiscal de operaciones', 'Dar de alta fiscalmente el proyecto.', 'Alta fiscal del proyecto.', (SELECT id FROM phases WHERE phase_number = 3), FALSE, 8, 'hours', NULL),
('3.7', 'Definición de estrategia jurídica de cumplimiento', 'Definir estrategia de cumplimiento contractual.', 'Estrategia documentada.', (SELECT id FROM phases WHERE phase_number = 3), FALSE, 8, 'hours', NULL),
('3.8', 'Encendido del contrato', 'Activar el contrato formalmente.', 'Contrato activado.', (SELECT id FROM phases WHERE phase_number = 3), FALSE, 2, 'hours', NULL),
('3.9', 'Kickoff meeting interno de encendido del proyecto', 'Alinear al equipo sobre el proyecto adjudicado.', 'Minuta de kickoff con compromisos.', (SELECT id FROM phases WHERE phase_number = 3), FALSE, 4, 'hours', NULL)
ON CONFLICT DO NOTHING;

-- FASE 4: EJECUCIÓN
INSERT INTO activities (code, name, objective, expected_info, phase_id, is_subactivity, base_duration_value, base_duration_unit, parent_activity_id) VALUES
('4.1', 'Plan de implementación detallado', 'Desarrollar cronograma y plan de trabajo.', 'Plan de proyecto con hitos.', (SELECT id FROM phases WHERE phase_number = 4), FALSE, 40, 'hours', NULL),
('4.2', 'Encendido del proyecto con el cliente', 'Iniciar interacción con cliente.', 'Kickoff cliente completado.', (SELECT id FROM phases WHERE phase_number = 4), FALSE, 4, 'hours', NULL),
('4.3', 'Coordinación de equipos técnicos', 'Gestionar recursos humanos del proyecto.', 'Reportes de asignación de personal.', (SELECT id FROM phases WHERE phase_number = 4), FALSE, 0, 'days', NULL),
('4.4', 'Gestión de proveedores en sitio', 'Supervisar trabajo de proveedores.', 'Reportes de desempeño de proveedores.', (SELECT id FROM phases WHERE phase_number = 4), FALSE, 0, 'days', NULL),
('4.5', 'Control de calidad técnica', 'Asegurar que entregables cumplan especificaciones.', 'Reportes de calidad.', (SELECT id FROM phases WHERE phase_number = 4), FALSE, 0, 'days', NULL),
('4.6', 'Gestión de cambios de alcance', 'Controlar y documentar cambios al proyecto.', 'Solicitudes de cambio aprobadas.', (SELECT id FROM phases WHERE phase_number = 4), FALSE, 16, 'hours', NULL),
('4.7', 'Facturación al cliente', 'Emitir facturas según contrato.', 'Facturas emitidas y enviadas.', (SELECT id FROM phases WHERE phase_number = 4), FALSE, 8, 'hours', NULL),
('4.7.1', 'Facturación de Empresa Principal al cliente', 'Empresa Principal emite facturas al cliente final.', 'Facturas de Empresa Principal emitidas.', (SELECT id FROM phases WHERE phase_number = 4), TRUE, 8, 'hours', NULL),
('4.8', 'Gestión de cobranza', 'Dar seguimiento a pagos del cliente.', 'Estatus de cuentas por cobrar.', (SELECT id FROM phases WHERE phase_number = 4), FALSE, 0, 'days', NULL),
('4.8.1', 'Gestión de cobranza de Empresa Principal', 'Empresa Principal da seguimiento a pagos del cliente.', 'Estatus de cuentas por cobrar de Empresa Principal.', (SELECT id FROM phases WHERE phase_number = 4), TRUE, 0, 'days', NULL),
('4.9', 'Procesamiento de pagos a proveedores', 'Ejecutar pagos conforme a contratos.', 'Comprobantes de pago.', (SELECT id FROM phases WHERE phase_number = 4), FALSE, 8, 'hours', NULL),
('4.9.1', 'Pago de Empresa Principal a SIE/Telinfra', 'Empresa Principal paga a SIE/Telinfra por servicios.', 'Pagos recibidos de Empresa Principal.', (SELECT id FROM phases WHERE phase_number = 4), TRUE, 8, 'hours', NULL),
('4.10', 'Control presupuestal', 'Monitorear gastos vs. presupuesto.', 'Reporte de variaciones presupuestales.', (SELECT id FROM phases WHERE phase_number = 4), FALSE, 0, 'days', NULL),
('4.11', 'Cumplimiento fiscal continuo', 'Asegurar cumplimiento de obligaciones fiscales.', 'Declaraciones y pagos al día.', (SELECT id FROM phases WHERE phase_number = 4), FALSE, 0, 'days', NULL),
('4.12', 'Documentación de entregables', 'Generar evidencia de cumplimiento.', 'Expediente de entregables.', (SELECT id FROM phases WHERE phase_number = 4), FALSE, 0, 'days', NULL),
('4.12.1', 'Documentación de entregables para Empresa Principal', 'Generar evidencia para que Empresa Principal facture.', 'Expediente de entregables para Empresa Principal.', (SELECT id FROM phases WHERE phase_number = 4), TRUE, 0, 'days', NULL)
ON CONFLICT DO NOTHING;

-- FASE 5: MONITOREO Y CONTROL
INSERT INTO activities (code, name, objective, expected_info, phase_id, is_subactivity, base_duration_value, base_duration_unit, parent_activity_id) VALUES
('5.1', 'Seguimiento de cronograma', 'Monitorear avance vs. plan.', 'Reporte de avance de cronograma.', (SELECT id FROM phases WHERE phase_number = 5), FALSE, 0, 'days', NULL),
('5.2', 'Monitoreo de presupuesto vs. real', 'Comparar gastos reales vs. proyectados.', 'Análisis de variaciones.', (SELECT id FROM phases WHERE phase_number = 5), FALSE, 0, 'days', NULL),
('5.3', 'Actualización de dashboard', 'Mantener visibilidad ejecutiva del proyecto.', 'Dashboard actualizado.', (SELECT id FROM phases WHERE phase_number = 5), FALSE, 0, 'days', NULL),
('5.4', 'Emisión de alertas de desviaciones', 'Notificar riesgos identificados oportunamente.', 'Alertas con recomendación de acción.', (SELECT id FROM phases WHERE phase_number = 5), FALSE, 0, 'days', NULL),
('5.5', 'Reuniones de seguimiento (cada 8 días)', 'Revisar estatus y tomar decisiones.', 'Minuta con acuerdos.', (SELECT id FROM phases WHERE phase_number = 5), FALSE, 2, 'hours', NULL),
('5.6', 'Reportes ejecutivos a dirección', 'Informar a GRI sobre estatus de proyectos.', 'Reporte ejecutivo consolidado.', (SELECT id FROM phases WHERE phase_number = 5), FALSE, 8, 'hours', NULL),
('5.7', 'Gestión de riesgos operativos', 'Identificar y mitigar riesgos del proyecto.', 'Matriz de riesgos actualizada.', (SELECT id FROM phases WHERE phase_number = 5), FALSE, 0, 'days', NULL),
('5.8', 'Control de deductivas/penalizaciones', 'Monitorear y gestionar penalizaciones.', 'Reporte de deductivas aplicadas.', (SELECT id FROM phases WHERE phase_number = 5), FALSE, 0, 'days', NULL)
ON CONFLICT DO NOTHING;

-- FASE 6: CIERRE
INSERT INTO activities (code, name, objective, expected_info, phase_id, is_subactivity, base_duration_value, base_duration_unit, parent_activity_id) VALUES
('6.1', 'Elaboración de actas de entrega-recepción', 'Formalizar entrega de proyecto al cliente.', 'Actas firmadas por cliente.', (SELECT id FROM phases WHERE phase_number = 6), FALSE, 16, 'hours', NULL),
('6.2', 'Cierre fiscal de contratos', 'Finalizar obligaciones fiscales del proyecto.', 'Expediente fiscal cerrado.', (SELECT id FROM phases WHERE phase_number = 6), FALSE, 16, 'hours', NULL),
('6.3', 'Elaboración de P&L final', 'Calcular rentabilidad real del proyecto.', 'P&L final con análisis.', (SELECT id FROM phases WHERE phase_number = 6), FALSE, 16, 'hours', NULL),
('6.4', 'Liberación de fianzas', 'Recuperar fianzas una vez cumplido contrato.', 'Fianzas liberadas.', (SELECT id FROM phases WHERE phase_number = 6), FALSE, 8, 'hours', NULL),
('6.5', 'Evaluación de desempeño de proveedores', 'Calificar proveedores para futuros proyectos.', 'Scorecard de proveedores.', (SELECT id FROM phases WHERE phase_number = 6), FALSE, 8, 'hours', NULL),
('6.6', 'Sesión de lecciones aprendidas', 'Documentar aprendizajes del proyecto.', 'Documento de lecciones aprendidas.', (SELECT id FROM phases WHERE phase_number = 6), FALSE, 4, 'hours', NULL),
('6.7', 'Archivo de documentación del proyecto', 'Resguardar expediente completo del proyecto.', 'Expediente archivado.', (SELECT id FROM phases WHERE phase_number = 6), FALSE, 8, 'hours', NULL)
ON CONFLICT DO NOTHING;

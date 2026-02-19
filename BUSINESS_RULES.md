# Reglas de Negocio - Sistema de Gestión de Proyectos

## Agrupación de Etapas en Kanban Board

Los proyectos se agrupan en **3 etapas operacionales** (no 6 fases):

### 1. Planeación
Agrupa las fases:
- Fase 1: Identificación de Oportunidades
- Fase 2: Preparación de Propuesta

Actividades: 1.1 a 2.16

### 2. Ejecución
Agrupa las fases:
- Fase 3: Adjudicación y Contratación
- Fase 4: Ejecución
- Fase 5: Monitoreo y Control

Actividades: 3.1 a 5.8

### 3. Cierre
Agrupa la fase:
- Fase 6: Cierre

Actividades: 6.1 a 6.7

## Campos de Proyecto

- `id`: UUID único del proyecto
- `name`: Nombre del proyecto
- `descripcion`: Descripción general del proyecto
- `fase`: Una de las 6 fases (identificación, preparación, adjudicación, ejecución, monitoreo, cierre)
- `presupuesto`: Monto estimado en millones
- `fecha_inicio`: Fecha de inicio del proyecto
- `fecha_estimada_fin`: Fecha estimada de finalización
- `estado`: not_started, in_progress, completed, on_hold
- `responsable_id`: ID del usuario responsable del proyecto
- `empresa_principal_id`: ID de la empresa principal

## Campos de Actividad

- `project_id`: ID del proyecto al que pertenece
- `name`: Nombre descriptivo de la actividad
- `phase`: Una de las 6 fases del documento de plantilla
- `status`: not_started, in_progress, review, completed, not_applicable
- `start_date`: Fecha de inicio
- `end_date`: Fecha de finalización
- `estimated_duration_days`: Duración estimada en días
- `duration_days`: Duración real en días
- `responsible_user_id`: ID del usuario responsable
- `progress_percentage`: Porcentaje de avance (0-100)
- `sharepoint_link`: Enlace a documentos en SharePoint
- `dependencies`: Array con IDs de actividades dependientes

## Validaciones

1. Un proyecto en "Planeación" solo contiene actividades de Fases 1-2
2. Un proyecto en "Ejecución" solo contiene actividades de Fases 3-5
3. Un proyecto en "Cierre" solo contiene actividades de Fase 6
4. Las actividades deben respetar las dependencias definidas en el documento de plantilla
5. La duración estimada no puede ser negativa
6. El presupuesto es requerido y debe ser mayor a 0

## Responsables

Los proyectos deben tener un responsable asignado que pertenezca al equipo de SIE/Telinfra.

## Roles y Permisos

- **Admin**: Acceso total a todos los proyectos
- **Responsable de Proyecto**: Puede editar solo sus proyectos
- **Consultor**: Acceso de lectura a proyectos asignados

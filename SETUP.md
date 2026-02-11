# SIE - Sistema de Gestión de Proyectos

## Configuración Inicial

### 1. Variables de Entorno
Agrega las siguientes variables en la sección "Vars" de v0:

```
NEXT_PUBLIC_SUPABASE_URL=<tu_url_supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<tu_service_role_key>
```

### 2. Estructura de la Base de Datos

La aplicación utiliza las siguientes tablas:

- **users**: Información de usuarios (email, rol, nombre completo)
- **projects**: Proyectos con datos generales (nombre, cliente, fechas, monto)
- **project_activities**: Actividades del proyecto clonadas de la plantilla
- **template_activities**: Plantilla con 6 fases y sus actividades/subactividades

### 3. Características

#### Para Usuarios
- **Registro e Inicio de Sesión**: Sistema de autenticación con Supabase
- **Crear Proyectos**: Formulario para alta de nuevos proyectos con datos:
  - Nombre del proyecto
  - Cliente
  - Fecha de inicio
  - Monto estimado
  - Tipo de adjudicación
  - Fecha estimada de ejecución

#### Para Administradores
- **Gestión Completa**: Acceso a todos los proyectos
- **Auditoría**: Vista de todas las actividades de usuarios

#### Cronograma Gantt
- **Visualización**: Gráfico de barras horizontales mostrando:
  - Código de actividad
  - Nombre de actividad
  - Duración en días
  - Fechas de inicio y fin calculadas automáticamente
- **Cálculo Automático**: Las fechas de fin se calculan sumando la duración a la fecha de inicio

#### Gestión de Actividades
- **Edición de Duración**: Modificar horas o días de cada actividad
- **Jerarquía**: Las subactividades (3 dígitos) se diferencian visualmente
- **Recalculeo Automático**: Las fechas se actualizan cuando cambias la duración

### 4. Roles de Usuario

1. **Analista**: Acceso a sus propios proyectos
2. **Administrador**: Acceso a todos los proyectos

### 5. Flujo de Uso

1. Regístrate como Analista o Administrador
2. Ve al Dashboard
3. Haz clic en "Nuevo Proyecto"
4. Completa los datos del proyecto
5. Se clonará automáticamente la plantilla de actividades
6. Visualiza el cronograma Gantt
7. Edita duraciones si es necesario
8. Las fechas se calculan automáticamente

### 6. API Endpoints

#### POST /api/projects
Crear nuevo proyecto. Auto-clona la plantilla de actividades.

#### GET /api/projects?user_id={id}
Obtener proyectos del usuario.

## Modelo de Datos

### Fases del Proyecto (6 fases)
La plantilla incluye 6 fases principales con sus actividades y subactividades asociadas.

### Niveles de Agregación
- **Fase**: Nivel superior (ej: "FASE 1")
- **Actividad**: 2 dígitos (ej: "01")
- **Subactividad**: 3 dígitos (ej: "01.001")

## Deploy

La aplicación está lista para deployar en Vercel:
1. Conecta tu repositorio Git
2. Asegúrate que las variables de entorno están configuradas
3. Deploy automático desde Git

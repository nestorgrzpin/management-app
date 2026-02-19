# Sistema de Gestión de Proyectos - SIE/Telinfra

## Descripción

Sistema integral para gestionar proyectos desde la identificación de oportunidades hasta el cierre, con seguimiento detallado de actividades, responsables y presupuestos.

## Características Principales

- **Dashboard Ejecutivo**: Panel Kanban con 3 etapas (Planeación, Ejecución, Cierre)
- **Gestión de Proyectos**: Crear, editar y monitorear proyectos
- **Plantilla de Actividades**: 57 actividades predefinidas basadas en ciclo de proyecto estándar
- **Seguimiento de Actividades**: Tabla detallada con fases, duraciones, responsables y progreso
- **Gestión de Responsables**: Asignación de equipos a proyectos y actividades

## Estructura del Proyecto

```
app/
├── (app)/               # Rutas protegidas por autenticación
│   ├── dashboard/       # Panel ejecutivo y vistas de proyecto
│   └── admin/           # Panel de administración
├── (auth)/              # Rutas de autenticación
│   ├── login/
│   └── signup/
└── api/                 # APIs backend

components/
├── ui/                  # Componentes base (shadcn/ui)
├── activities-table.tsx # Tabla de actividades
└── ...

lib/
├── supabase.ts          # Cliente de Supabase
└── ...
```

## Variables de Entorno Requeridas

```
NEXT_PUBLIC_SUPABASE_URL=<tu_url_supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu_anon_key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Reglas de Negocio

Ver `BUSINESS_RULES.md` para detalles completos sobre:
- Agrupación de etapas
- Validaciones de proyectos
- Campos de datos
- Ciclo de actividades

## Flujo de Proyecto

1. **Planeación** (Fases 1-2): Identificación y preparación de propuesta
2. **Ejecución** (Fases 3-5): Adjudicación, contratación y ejecución
3. **Cierre** (Fase 6): Cierre y documentación final

## Seeding de Datos

Para poblar actividades de ejemplo:

```bash
# Acceder a la interfaz de seed
http://localhost:3000/seed-activities-ui

# O hacer POST directo a
http://localhost:3000/api/seed/activities
```

## Tecnologías

- Next.js 16 (App Router)
- TypeScript
- Supabase (PostgreSQL + Auth)
- Tailwind CSS
- shadcn/ui
- Recharts (gráficos)

## Desarrollo

```bash
# Instalar dependencias
pnpm install

# Ejecutar servidor de desarrollo
pnpm dev

# Build para producción
pnpm build
```

## Contacto

Para preguntas sobre reglas de negocio, consultar `BUSINESS_RULES.md`.

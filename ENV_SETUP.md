# Configuración de SIE - Variables de Entorno

## Paso 1: Obtener las Credenciales de Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto o usa uno existente
3. Ve a **Settings → API**
4. Copia estas claves:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Secret** → `SUPABASE_SERVICE_ROLE_KEY`

## Paso 2: Agregar Variables en v0

En la sección **Vars** del chat de v0, agrega:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Paso 3: Verificar la Base de Datos

Las tablas se crearon automáticamente cuando ejecutaste los scripts SQL:

- ✓ `users` - Información de usuarios
- ✓ `projects` - Proyectos
- ✓ `project_activities` - Actividades de proyectos
- ✓ `template_activities` - Plantilla de fases

## Paso 4: Probar la Aplicación

1. Abre la Preview de v0
2. Regístrate con email y contraseña
3. Selecciona tu rol (Analista o Admin)
4. Accede al Dashboard
5. Crea un nuevo proyecto
6. Visualiza el cronograma Gantt

## Roles Disponibles

### Analista
- Ver sus propios proyectos
- Crear proyectos
- Editar actividades
- Ver cronogramas

### Administrador
- Acceso a todos los proyectos
- Panel administrativo
- Ver estadísticas globales
- Gestionar usuarios

## Troubleshooting

### Error: "NEXT_PUBLIC_SUPABASE_URL is not set"
- Verifica que las variables están en la sección Vars
- Reinicia la preview con Cmd+K / Ctrl+K

### Error: "Database connection failed"
- Verifica que la URL de Supabase es correcta
- Comprueba que los scripts SQL se ejecutaron sin errores

### Las actividades no aparecen
- Abre el proyecto recién creado
- Las actividades se clonan automáticamente de la plantilla
- Si no aparecen, verifica el estado en la BD de Supabase

## Estructura de Carpetas

```
/app
  /(auth)           # Páginas de login/signup
    /login
    /signup
  /(app)            # Páginas protegidas
    /dashboard
      /projects     # Detalle de proyectos
      /admin        # Panel administrativo
/api
  /projects         # API para gestión de proyectos
  /activities       # API para actividades
/components
  /gantt-chart      # Componente del cronograma
  /activities-table # Tabla de actividades
/lib
  /supabase.ts      # Cliente de Supabase
```

## Deploy en Vercel

1. Sube el código a GitHub
2. Crea un proyecto en Vercel
3. Conecta el repositorio
4. Agrega las variables de entorno en **Settings → Environment Variables**
5. Deploy automático desde el main branch

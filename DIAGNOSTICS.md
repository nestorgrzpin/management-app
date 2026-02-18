# Solución de Problemas - Variables de Entorno de Supabase

## Problema: "Variables de entorno de Supabase no están configuradas"

Si ves este mensaje, significa que `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_ANON_KEY` no están disponibles para la aplicación.

## Solución Paso a Paso

### 1. Verifica que las variables están en Vars

Ve a la sección **Vars** en la barra lateral izquierda de v0 y asegúrate de que tienes:

- `NEXT_PUBLIC_SUPABASE_URL` = `https://ugsfsdhhaognpzmyyicz.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = [tu clave anónima]
- `SUPABASE_SERVICE_ROLE_KEY` = [tu clave de servicio]

### 2. Recarga la Preview

Las variables de entorno se cargan cuando inicia el dev server. Si las acabas de agregar:

1. Presiona **Ctrl+K** (o **Cmd+K** en Mac) en la preview
2. O recarga la página completamente con **F5** o **Cmd+R**

### 3. Verifica el formato correcto

Las claves de Supabase deben:
- **URL**: Comenzar con `https://` y terminar con `.supabase.co`
- **Anon Key**: Ser una cadena larga de caracteres (usualmente comienza con `eyJ...`)
- **Service Role Key**: Ser una cadena larga de caracteres (usualmente comienza con `eyJ...`)

### 4. Obtén las claves correctas de Supabase

1. Ve a [app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto: `ugsfsdhhaognpzmyyicz`
3. Dirígete a **Settings → API**
4. En la sección **Project API keys**, copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 5. Verifica el diagnóstico en la página de login

Si aún hay errores, la página de login mostrará un componente rojo que indica:
- ✗ NEXT_PUBLIC_SUPABASE_URL (si no está configurada)
- ✗ NEXT_PUBLIC_SUPABASE_ANON_KEY (si no está configurada)

## ¿Aún no funciona?

### Opción 1: Reinicia la Preview
- Presiona **Ctrl+Shift+R** para forzar una recarga completa
- Cierra y reabre la preview

### Opción 2: Verifica el endpoint de diagnóstico
- Abre en tu navegador: `/api/debug/env`
- Debería mostrar el estado de todas las variables:
  ```json
  {
    "supabaseUrl": "SET",
    "supabaseKey": "SET",
    "supabaseServiceRole": "SET"
  }
  ```

### Opción 3: Verifica los logs del navegador
- Abre DevTools (**F12** o **Cmd+Option+I**)
- Ve a la pestaña **Console**
- Busca mensajes que digan `[v0]` para ver logs de depuración
- Si hay un error, cópialo y verifica el mensaje exacto

## Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | `https://ugsfsdhhaognpzmyyicz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anónima | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de rol de servicio | `eyJhbGciOiJIUzI1NiIs...` |

## Después de Configurar las Variables

1. ✓ Registro: Crea una nueva cuenta en `/signup`
2. ✓ Login: Accede con tus credenciales en `/login`
3. ✓ Dashboard: Verás el panel de proyectos en `/dashboard`

## Soporte Adicional

Si aún tienes problemas:
1. Verifica que el proyecto de Supabase existe y está activo
2. Comprueba que tienes las tablas correctas en Supabase:
   - `users`
   - `projects`
   - `project_activities`
   - `template_activities`
3. Abre un ticket de soporte en [vercel.com/help](https://vercel.com/help)

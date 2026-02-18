#!/bin/bash

echo "=== Verificación de Configuración de SIE ==="
echo ""
echo "Verificando variables de entorno..."
echo ""

# Check if variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_URL: NO CONFIGURADA"
else
  echo "✓ NEXT_PUBLIC_SUPABASE_URL: Configurada"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: NO CONFIGURADA"
else
  echo "✓ NEXT_PUBLIC_SUPABASE_ANON_KEY: Configurada"
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ SUPABASE_SERVICE_ROLE_KEY: NO CONFIGURADA"
else
  echo "✓ SUPABASE_SERVICE_ROLE_KEY: Configurada"
fi

echo ""
echo "=== Pasos a realizar si hay errores ==="
echo "1. Ve a la sección 'Vars' en el chat de v0"
echo "2. Agrega las siguientes variables:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "3. Recarga la preview del proyecto"
echo ""

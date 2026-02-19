import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Template activities based on the PDF structure
const TEMPLATE_ACTIVITIES = [
  // FASE 1: IDENTIFICACIÓN DE OPORTUNIDADES
  {
    number: "1.1",
    name: "Monitoreo de CompraNet/licitaciones",
    phase: "Fase 1: Identificación de oportunidades",
    estimated_duration_days: 0.5,
    dependencies: [],
    status: "not_started"
  },
  {
    number: "1.2",
    name: "Evaluación inicial de capacidad técnica",
    phase: "Fase 1: Identificación de oportunidades",
    estimated_duration_days: 1,
    dependencies: ["1.1"],
    status: "not_started"
  },
  {
    number: "1.3",
    name: "Simulación financiera preliminar",
    phase: "Fase 1: Identificación de oportunidades",
    estimated_duration_days: 1,
    dependencies: ["1.2"],
    status: "not_started"
  },
  {
    number: "1.4",
    name: "Evaluación de viabilidad financiera",
    phase: "Fase 1: Identificación de oportunidades",
    estimated_duration_days: 1,
    dependencies: ["1.2", "1.3"],
    status: "not_started"
  },
  {
    number: "1.5",
    name: "Análisis de requisitos legales/administrativos",
    phase: "Fase 1: Identificación de oportunidades",
    estimated_duration_days: 1,
    dependencies: ["1.1", "1.2", "1.3"],
    status: "not_started"
  },
  {
    number: "1.6",
    name: "Identificación de aliados potenciales",
    phase: "Fase 1: Identificación de oportunidades",
    estimated_duration_days: 2,
    dependencies: ["1.2", "1.4"],
    status: "not_started"
  },
  {
    number: "1.7",
    name: "Definición de estrategia jurídica de la oportunidad",
    phase: "Fase 1: Identificación de oportunidades",
    estimated_duration_days: 1,
    dependencies: [],
    status: "not_started"
  },
  {
    number: "1.8",
    name: "Decisión Go/No-Go",
    phase: "Fase 1: Identificación de oportunidades",
    estimated_duration_days: 0.5,
    dependencies: ["1.2", "1.3", "1.4", "1.6"],
    status: "not_started"
  },
  {
    number: "1.9",
    name: "Registro de oportunidad en sistema",
    phase: "Fase 1: Identificación de oportunidades",
    estimated_duration_days: 0.25,
    dependencies: ["1.7"],
    status: "not_started"
  },
  // FASE 2: PREPARACIÓN DE PROPUESTA
  {
    number: "2.1",
    name: "Levantamiento técnico detallado",
    phase: "Fase 2: Preparación de propuesta",
    estimated_duration_days: 5,
    dependencies: ["1.7"],
    status: "not_started"
  },
  {
    number: "2.2",
    name: "Diseño de solución técnica",
    phase: "Fase 2: Preparación de propuesta",
    estimated_duration_days: 10,
    dependencies: ["2.1"],
    status: "not_started"
  },
  {
    number: "2.3",
    name: "Solicitud de cotizaciones a proveedores",
    phase: "Fase 2: Preparación de propuesta",
    estimated_duration_days: 3,
    dependencies: ["2.2"],
    status: "not_started"
  },
  {
    number: "2.4",
    name: "Evaluación y selección de cotizaciones",
    phase: "Fase 2: Preparación de propuesta",
    estimated_duration_days: 2,
    dependencies: ["2.3"],
    status: "not_started"
  },
  {
    number: "2.5",
    name: "Simulación financiera detallada (P&L)",
    phase: "Fase 2: Preparación de propuesta",
    estimated_duration_days: 2,
    dependencies: ["2.4"],
    status: "not_started"
  },
  {
    number: "2.6",
    name: "Análisis de flujo de caja",
    phase: "Fase 2: Preparación de propuesta",
    estimated_duration_days: 1,
    dependencies: ["2.5"],
    status: "not_started"
  },
  {
    number: "2.7",
    name: "Definición de estrategia fiscal",
    phase: "Fase 2: Preparación de propuesta",
    estimated_duration_days: 1,
    dependencies: ["2.5", "2.6"],
    status: "not_started"
  },
  {
    number: "2.8",
    name: "Definición de estrategia jurídica de la contratación",
    phase: "Fase 2: Preparación de propuesta",
    estimated_duration_days: 1,
    dependencies: [],
    status: "not_started"
  },
  {
    number: "2.9",
    name: "Preparación de documentación legal SIE/Telinfra",
    phase: "Fase 2: Preparación de propuesta",
    estimated_duration_days: 3,
    dependencies: ["1.4", "2.7"],
    status: "not_started"
  },
  {
    number: "2.10",
    name: "Acuerdos de confidencialidad (NDA)",
    phase: "Fase 2: Preparación de propuesta",
    estimated_duration_days: 0.5,
    dependencies: ["1.5"],
    status: "not_started"
  },
  {
    number: "2.11",
    name: "Convenios de participación conjunta",
    phase: "Fase 2: Preparación de propuesta",
    estimated_duration_days: 2,
    dependencies: ["2.4", "2.7"],
    status: "not_started"
  },
  {
    number: "2.12",
    name: "Due diligence de proveedores",
    phase: "Fase 2: Preparación de propuesta",
    estimated_duration_days: 2,
    dependencies: ["2.4"],
    status: "not_started"
  },
  {
    number: "2.13",
    name: "Integración de propuesta técnica",
    phase: "Fase 2: Preparación de propuesta",
    estimated_duration_days: 5,
    dependencies: ["2.2", "2.8"],
    status: "not_started"
  },
  {
    number: "2.14",
    name: "Integración de propuesta económica",
    phase: "Fase 2: Preparación de propuesta",
    estimated_duration_days: 2,
    dependencies: ["2.5", "2.6", "2.7"],
    status: "not_started"
  },
  {
    number: "2.15",
    name: "Revisión y aprobación final de propuesta",
    phase: "Fase 2: Preparación de propuesta",
    estimated_duration_days: 1,
    dependencies: ["2.12", "2.13"],
    status: "not_started"
  },
  {
    number: "2.16",
    name: "Presentación física de oferta",
    phase: "Fase 2: Preparación de propuesta",
    estimated_duration_days: 1,
    dependencies: ["2.14"],
    status: "not_started"
  },
  // FASE 3: ADJUDICACIÓN Y CONTRATACIÓN
  {
    number: "3.1",
    name: "Seguimiento de fallo",
    phase: "Fase 3: Adjudicación y contratación",
    estimated_duration_days: 0.5,
    dependencies: ["2.15"],
    status: "not_started"
  },
  {
    number: "3.2",
    name: "Negociación de contrato con cliente",
    phase: "Fase 3: Adjudicación y contratación",
    estimated_duration_days: 3,
    dependencies: ["3.1"],
    status: "not_started"
  },
  {
    number: "3.3",
    name: "Formalización de alianzas estratégicas",
    phase: "Fase 3: Adjudicación y contratación",
    estimated_duration_days: 2,
    dependencies: ["3.1", "2.10"],
    status: "not_started"
  },
  {
    number: "3.4",
    name: "Contratos con subcontratistas",
    phase: "Fase 3: Adjudicación y contratación",
    estimated_duration_days: 3,
    dependencies: ["3.1", "2.11"],
    status: "not_started"
  },
  {
    number: "3.5",
    name: "Gestión de fianzas y garantías",
    phase: "Fase 3: Adjudicación y contratación",
    estimated_duration_days: 1,
    dependencies: ["3.2"],
    status: "not_started"
  },
  {
    number: "3.6",
    name: "Registro fiscal de operaciones",
    phase: "Fase 3: Adjudicación y contratación",
    estimated_duration_days: 1,
    dependencies: ["3.2", "2.7"],
    status: "not_started"
  },
  {
    number: "3.7",
    name: "Definición de estrategia jurídica de cumplimiento",
    phase: "Fase 3: Adjudicación y contratación",
    estimated_duration_days: 1,
    dependencies: [],
    status: "not_started"
  },
  {
    number: "3.9",
    name: "Kickoff meeting interno de encendido del proyecto",
    phase: "Fase 3: Adjudicación y contratación",
    estimated_duration_days: 0.5,
    dependencies: ["3.2", "3.3", "3.4"],
    status: "not_started"
  },
  // FASE 4: EJECUCIÓN
  {
    number: "4.1",
    name: "Plan de implementación detallado",
    phase: "Fase 4: Ejecución",
    estimated_duration_days: 5,
    dependencies: ["3.7"],
    status: "not_started"
  },
  {
    number: "4.3",
    name: "Coordinación de equipos técnicos",
    phase: "Fase 4: Ejecución",
    estimated_duration_days: 0,
    dependencies: ["4.1"],
    status: "not_started"
  },
  {
    number: "4.4",
    name: "Gestión de proveedores en sitio",
    phase: "Fase 4: Ejecución",
    estimated_duration_days: 0,
    dependencies: ["4.1"],
    status: "not_started"
  },
  {
    number: "4.5",
    name: "Control de calidad técnica",
    phase: "Fase 4: Ejecución",
    estimated_duration_days: 0,
    dependencies: [],
    status: "not_started"
  },
  {
    number: "4.6",
    name: "Gestión de cambios de alcance",
    phase: "Fase 4: Ejecución",
    estimated_duration_days: 0,
    dependencies: ["4.1"],
    status: "not_started"
  },
  {
    number: "4.7",
    name: "Facturación al cliente",
    phase: "Fase 4: Ejecución",
    estimated_duration_days: 0,
    dependencies: ["4.4"],
    status: "not_started"
  },
  {
    number: "4.8",
    name: "Gestión de cobranza",
    phase: "Fase 4: Ejecución",
    estimated_duration_days: 0,
    dependencies: ["4.6"],
    status: "not_started"
  },
  {
    number: "4.9",
    name: "Procesamiento de pagos a proveedores",
    phase: "Fase 4: Ejecución",
    estimated_duration_days: 0,
    dependencies: ["4.3", "4.7"],
    status: "not_started"
  },
  {
    number: "4.10",
    name: "Control presupuestal",
    phase: "Fase 4: Ejecución",
    estimated_duration_days: 0,
    dependencies: ["4.1"],
    status: "not_started"
  },
  {
    number: "4.11",
    name: "Cumplimiento fiscal continuo",
    phase: "Fase 4: Ejecución",
    estimated_duration_days: 0,
    dependencies: ["3.6"],
    status: "not_started"
  },
  {
    number: "4.12",
    name: "Documentación de entregables",
    phase: "Fase 4: Ejecución",
    estimated_duration_days: 0,
    dependencies: ["4.4"],
    status: "not_started"
  },
  // FASE 5: MONITOREO Y CONTROL
  {
    number: "5.1",
    name: "Seguimiento de cronograma",
    phase: "Fase 5: Monitoreo y control",
    estimated_duration_days: 0,
    dependencies: ["4.1"],
    status: "not_started"
  },
  {
    number: "5.2",
    name: "Monitoreo de presupuesto vs. real",
    phase: "Fase 5: Monitoreo y control",
    estimated_duration_days: 0,
    dependencies: ["4.9"],
    status: "not_started"
  },
  {
    number: "5.3",
    name: "Actualización de dashboard",
    phase: "Fase 5: Monitoreo y control",
    estimated_duration_days: 0,
    dependencies: ["5.1", "5.2"],
    status: "not_started"
  },
  {
    number: "5.4",
    name: "Emisión de alertas de desviaciones",
    phase: "Fase 5: Monitoreo y control",
    estimated_duration_days: 0,
    dependencies: ["5.1", "5.2", "5.3"],
    status: "not_started"
  },
  {
    number: "5.5",
    name: "Reuniones de seguimiento (cada 8 días)",
    phase: "Fase 5: Monitoreo y control",
    estimated_duration_days: 0.25,
    dependencies: ["5.1", "5.2"],
    status: "not_started"
  },
  {
    number: "5.6",
    name: "Reportes ejecutivos a dirección",
    phase: "Fase 5: Monitoreo y control",
    estimated_duration_days: 1,
    dependencies: ["5.3"],
    status: "not_started"
  },
  {
    number: "5.7",
    name: "Gestión de riesgos operativos",
    phase: "Fase 5: Monitoreo y control",
    estimated_duration_days: 0,
    dependencies: ["4.1"],
    status: "not_started"
  },
  {
    number: "5.8",
    name: "Control de deductivas/penalizaciones",
    phase: "Fase 5: Monitoreo y control",
    estimated_duration_days: 0,
    dependencies: ["4.4"],
    status: "not_started"
  },
  // FASE 6: CIERRE
  {
    number: "6.1",
    name: "Elaboración de actas de entrega-recepción",
    phase: "Fase 6: Cierre",
    estimated_duration_days: 2,
    dependencies: ["4.1"],
    status: "not_started"
  },
  {
    number: "6.2",
    name: "Cierre fiscal de contratos",
    phase: "Fase 6: Cierre",
    estimated_duration_days: 2,
    dependencies: ["6.1"],
    status: "not_started"
  },
  {
    number: "6.3",
    name: "Elaboración de P&L final",
    phase: "Fase 6: Cierre",
    estimated_duration_days: 2,
    dependencies: ["6.1", "6.2"],
    status: "not_started"
  },
  {
    number: "6.4",
    name: "Liberación de fianzas",
    phase: "Fase 6: Cierre",
    estimated_duration_days: 1,
    dependencies: ["6.1"],
    status: "not_started"
  },
  {
    number: "6.5",
    name: "Evaluación de desempeño de proveedores",
    phase: "Fase 6: Cierre",
    estimated_duration_days: 1,
    dependencies: ["6.1"],
    status: "not_started"
  },
  {
    number: "6.6",
    name: "Sesión de lecciones aprendidas",
    phase: "Fase 6: Cierre",
    estimated_duration_days: 0.5,
    dependencies: ["6.1", "6.3"],
    status: "not_started"
  },
  {
    number: "6.7",
    name: "Archivo de documentación del proyecto",
    phase: "Fase 6: Cierre",
    estimated_duration_days: 1,
    dependencies: ["6.1", "6.2", "6.3", "6.6"],
    status: "not_started"
  }
];

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Seed activities: Starting');
    
    // Get all projects
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id, name");

    if (projectsError) throw projectsError;

    if (!projects || projects.length === 0) {
      console.log('[v0] Seed activities: No projects found');
      return NextResponse.json({
        error: "No projects found",
        status: 404,
      });
    }

    console.log('[v0] Seed activities: Found', projects.length, 'projects');

    const activitiesData = [];

    // Create activities for each project based on template
    for (const project of projects) {
      console.log('[v0] Seed activities: Creating activities for project:', project.name);
      for (const activity of TEMPLATE_ACTIVITIES) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + activitiesData.length);
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Math.max(1, activity.estimated_duration_days));

        activitiesData.push({
          project_id: project.id,
          name: activity.name,
          phase: activity.phase,
          status: activity.status,
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          estimated_duration_days: activity.estimated_duration_days || 1,
          duration_days: activity.estimated_duration_days || 1,
          progress_percentage: 0,
          notes: `Activity: ${activity.number} - ${activity.name}`,
        });
      }
    }

    console.log('[v0] Seed activities: Preparing to insert', activitiesData.length, 'activities');

    // Insert activities
    const { data: insertedActivities, error: insertError } = await supabase
      .from("project_activities")
      .insert(activitiesData)
      .select();

    if (insertError) {
      console.error('[v0] Seed activities: Insert error:', insertError);
      throw insertError;
    }

    console.log('[v0] Seed activities: Success! Created', insertedActivities?.length, 'activities');

    return NextResponse.json({
      success: true,
      message: `Created ${insertedActivities?.length || 0} activities for ${projects.length} projects`,
      data: insertedActivities,
    });
  } catch (error) {
    console.error("[v0] Seed activities error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}

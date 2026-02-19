import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    // Get all projects
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id, name")
      .limit(5);

    if (projectsError) throw projectsError;

    if (!projects || projects.length === 0) {
      return NextResponse.json({
        error: "No projects found",
        status: 404,
      });
    }

    const activitiesData = [];

    // Create sample activities for each project
    for (const project of projects) {
      const phases = ["Planificación", "Ejecución", "Cierre"];
      const activityNames = [
        "Análisis de requisitos",
        "Diseño de solución",
        "Implementación",
        "Pruebas",
        "Documentación",
        "Capacitación",
        "Deployment",
        "Cierre",
      ];

      for (let i = 0; i < 5; i++) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + i * 5);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 3 + Math.floor(Math.random() * 5));

        activitiesData.push({
          project_id: project.id,
          name: activityNames[i % activityNames.length],
          phase: phases[Math.floor(i / 2) % phases.length],
          status: ["not_started", "in_progress", "completed"][
            Math.floor(Math.random() * 3)
          ],
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          estimated_duration_days: 3 + Math.floor(Math.random() * 10),
          duration_days: 3 + Math.floor(Math.random() * 10),
          progress_percentage: Math.floor(Math.random() * 100),
          notes: `Activity ${i + 1} for project ${project.name}`,
        });
      }
    }

    // Insert activities
    const { data: insertedActivities, error: insertError } = await supabase
      .from("project_activities")
      .insert(activitiesData)
      .select();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      message: `Created ${insertedActivities?.length || 0} activities`,
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

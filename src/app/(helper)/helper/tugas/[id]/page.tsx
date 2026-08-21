import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export default async function LegacyHelperTaskDetailPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/tugas/${id}`);
}

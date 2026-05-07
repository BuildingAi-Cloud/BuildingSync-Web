import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/EmptyState";
import { DocumentsList } from "@/app/team/documents/DocumentsList";

export default async function ResidentDocumentsPage() {
  const { appUser } = await requireUser();

  return (
    <main className="min-h-dvh px-4 md:px-6 py-8 md:py-10 max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Documents</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Building bylaws, fire-safety plan, and other documents your building team has shared.
      </p>

      {!appUser.buildingId ? (
        <div className="mt-8">
          <EmptyState
            icon="inbox"
            title="No building assigned yet"
            description="Once your Building Manager links you to a building, their public documents show up here."
          />
        </div>
      ) : (
        <ResidentDocumentsList buildingId={appUser.buildingId} />
      )}
    </main>
  );
}

async function ResidentDocumentsList({ buildingId }: { buildingId: string }) {
  const documents = await prisma.document.findMany({
    where: { buildingId, visibility: "public", deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { name: true, email: true } } },
  });

  if (documents.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          icon="inbox"
          title="No documents shared yet"
          description="When your building team posts bylaws, fire plans, or other public documents, they'll appear here."
        />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <DocumentsList
        canManage={false}
        documents={documents.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          category: d.category,
          visibility: d.visibility,
          mimeType: d.mimeType,
          sizeBytes: d.sizeBytes,
          uploadedByLabel: d.uploadedBy.name || d.uploadedBy.email,
          createdAt: d.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}

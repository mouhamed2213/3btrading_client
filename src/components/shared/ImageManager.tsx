import { ImagePlus, Trash2 } from "lucide-react";
import { useRef } from "react";
import { api } from "@/lib/api";
import { useAction } from "@/lib/hooks";
import type { Img } from "@/lib/types";
import { Button } from "@/components/ui/Button";

/** Photos d'un engin ou d'une pièce (stockées dans Supabase via l'API). */
export function ImageManager({ images, uploadPath }: { images: Img[]; uploadPath: string }) {
  const input = useRef<HTMLInputElement>(null);
  const upload = useAction(
    (files: File[]) => {
      const fd = new FormData();
      files.forEach((f) => fd.append("images", f));
      return api.post(uploadPath, fd);
    },
    { success: "Photos ajoutées" },
  );
  const remove = useAction((id: string) => api.delete(`/images/${id}`), { success: "Photo supprimée" });

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {images.map((img, i) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden bg-surface">
            <img src={img.url} alt="" className="size-full object-cover" />
            {i === 0 && <span className="absolute left-1 top-1 bg-lime px-1.5 py-0.5 text-[9px] font-bold text-brand">COUVERTURE</span>}
            <button onClick={() => confirm("Supprimer cette photo ?") && remove.mutate(img.id)} aria-label="Supprimer la photo" className="absolute right-1 top-1 hidden size-7 place-items-center bg-white text-danger group-hover:grid"><Trash2 size={14} /></button>
          </div>
        ))}
        {images.length < 8 && (
          <button onClick={() => input.current?.click()} className="grid aspect-square place-items-center border border-dashed border-line text-muted hover:border-olive hover:text-ink"><ImagePlus size={22} /></button>
        )}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => { const f = [...(e.target.files ?? [])]; if (f.length) upload.mutate(f); e.target.value = ""; }} />
      <p className="mt-2 text-[11px] text-muted">JPEG, PNG ou WebP · 8 Mo max · 8 photos max.{upload.isPending && " Envoi en cours…"}</p>
      <Button variant="outline" size="sm" className="mt-2" onClick={() => input.current?.click()} loading={upload.isPending} icon={<ImagePlus size={14} />}>Ajouter des photos</Button>
    </div>
  );
}

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { useT } from './form-fields';

/** Rebuilds the content packs the app downloads (reviewers and admins). */
export function PublishButton() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const publish = useMutation({
    mutationFn: async () => {
      const { data, error } = await api.POST('/v1/publishing/packs', { body: {} });
      if (error || !data) throw new Error(t('ui.error'));
      return data;
    },
    onSuccess: (data) => {
      setOpen(false);
      const version = data.manifest?.packs[0]?.version;
      toast.success(data.queued || version === undefined ? t('publish.queued') : t('publish.done', { version }));
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-brand-cyan to-brand-violet text-ink hover:opacity-90">
          <Rocket className="size-4" /> {t('publish.button')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('publish.button')}</DialogTitle>
          <DialogDescription>{t('publish.confirm')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t('ui.cancel')}</Button>
          </DialogClose>
          <Button disabled={publish.isPending} onClick={() => publish.mutate()}>
            {t('publish.button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import type { ContentStatus } from '@jfa/shared';
import { Badge } from '@/components/ui/badge';
import { useT } from './form-fields';
import { cn } from '@/lib/utils';

const STYLES: Record<ContentStatus, string> = {
  draft: 'bg-slate-100 text-slate-800 border-slate-300',
  in_review: 'bg-amber-100 text-amber-900 border-amber-300',
  published: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  archived: 'bg-zinc-200 text-zinc-700 border-zinc-300',
};

/** Status shown as text + colour (never colour alone). */
export function StatusBadge({ status }: { status: ContentStatus }) {
  const t = useT();
  return (
    <Badge variant="outline" className={cn('font-medium', STYLES[status])}>
      {t(`content.statuses.${status}`)}
    </Badge>
  );
}

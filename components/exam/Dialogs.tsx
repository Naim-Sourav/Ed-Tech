import React from 'react';
import { DoorOpen, Flag, ListChecks, RotateCcw } from 'lucide-react';
import { Button, Dialog, DialogHeader, Stat } from './ui';
import { bn } from './model';

export function SubmitDialog({
  open,
  onClose,
  onConfirm,
  total,
  answered,
  flagged,
  submitting,
  onReviewFlagged,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  total: number;
  answered: number;
  flagged: number;
  submitting: boolean;
  onReviewFlagged?: () => void;
}) {
  const left = total - answered;
  return (
    <Dialog open={open} onClose={onClose} label="পরীক্ষা জমা দাও" dismissible={!submitting}>
      <DialogHeader
        icon={ListChecks}
        tone={left > 0 ? 'gold' : 'emerald'}
        title={left > 0 ? `${bn(left)} টি প্রশ্ন এখনো বাকি` : 'সব প্রশ্নের উত্তর দিয়েছ!'}
        description={
          left > 0
            ? 'জমা দিলে বাকি প্রশ্নগুলো বাদ (skipped) হিসেবে গণ্য হবে। তুমি চাইলে ফিরে গিয়ে শেষ করতে পারো।'
            : 'জমা দিলে সাথে সাথে ফলাফল ও ব্যাখ্যা দেখতে পাবে।'
        }
        onClose={submitting ? undefined : onClose}
      />
      <div className="mt-5 grid grid-cols-3 gap-2">
        <Stat value={bn(answered)} label="উত্তর দেওয়া" tone="ink" />
        <Stat value={bn(left)} label="বাকি" tone={left > 0 ? 'flag' : 'neutral'} />
        <Stat value={bn(flagged)} label="পরে দেখব" tone={flagged > 0 ? 'gold' : 'neutral'} />
      </div>
      {flagged > 0 && onReviewFlagged && (
        <button
          type="button"
          onClick={onReviewFlagged}
          className="focus-ring mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-deep hover:underline"
        >
          <Flag className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" /> ফ্ল্যাগ করা প্রশ্নগুলো আগে দেখে নাও
        </button>
      )}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
        <Button variant="ghost" onClick={onClose} disabled={submitting} className="flex-1">
          ফিরে যাও
        </Button>
        <Button variant="ink" onClick={onConfirm} disabled={submitting} className="flex-1">
          {submitting ? 'জমা হচ্ছে…' : 'হ্যাঁ, জমা দাও'}
        </Button>
      </div>
    </Dialog>
  );
}

export function ExitDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} label="পরীক্ষা থেকে বের হও">
      <DialogHeader
        icon={DoorOpen}
        tone="flag"
        title="পরীক্ষা ছেড়ে বের হবে?"
        description="বের হলে এই পরীক্ষার অগ্রগতি মুছে যাবে — উত্তরগুলো আর ফিরে পাবে না।"
        onClose={onClose}
      />
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
        <Button variant="ghost" onClick={onClose} className="flex-1">
          না, চালিয়ে যাই
        </Button>
        <Button variant="danger" onClick={onConfirm} className="flex-1">
          হ্যাঁ, বের হও
        </Button>
      </div>
    </Dialog>
  );
}

export function RetakeDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} label="আবার পরীক্ষা দাও">
      <DialogHeader
        icon={RotateCcw}
        tone="brand"
        title="একই প্রশ্নে আবার দেবে?"
        description="সময় ও উত্তর নতুন করে শুরু হবে। আগের ফলাফলটা তোমার ইতিহাসে থেকেই যাবে।"
        onClose={onClose}
      />
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
        <Button variant="ghost" onClick={onClose} className="flex-1">
          থাক
        </Button>
        <Button variant="primary" onClick={onConfirm} className="flex-1" icon={RotateCcw}>
          শুরু করো
        </Button>
      </div>
    </Dialog>
  );
}

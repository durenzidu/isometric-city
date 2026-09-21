'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { T } from 'gt-next';

interface VinnieDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VinnieDialog({ open, onOpenChange }: VinnieDialogProps) {
  const { addMoney, addNotification } = useGame();

  const handleAccept = () => {
    addMoney(500000);
    addNotification(
      'Questionable Finances',
      'You received $500,000 from a mysterious bubble. Your accountants are... concerned.',
      'disaster'
    );
    onOpenChange(false);
  };

  const handleDecline = () => {
    addMoney(10000);
    addNotification(
      'Integrity Bonus',
      'You declined the offer of the mysterious bubble. A secret benefactor rewards your honesty with $10,000.',
      'trophy'
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-red-400"><T>A Shady Offer</T></DialogTitle>
          <DialogDescription asChild>
            <div className="text-slate-300 pt-2">
              <p className="mb-2">
                <T>Hey there, Mayor... A mysterious bubble heard you could use some help with the city budget.</T>
              </p>
              <p className="mb-2">
                <T>The mysterious bubble is offering</T>{' '}
                <span className="text-green-400 font-semibold">$500,000</span>{' '}
                <T>as a starter gift — no strings attached.</T>
              </p>
              <p className="text-slate-400 italic">
                <T>Well, maybe a few strings.</T>
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleDecline}
            className="border-slate-600 text-slate-200 hover:bg-slate-800"
          >
            <T>Decline</T>
          </Button>
          <Button
            onClick={handleAccept}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <T>Accept Offer</T>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

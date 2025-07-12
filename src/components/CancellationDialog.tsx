import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CancellationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (justification: string) => void;
  taskTitle: string;
}

export function CancellationDialog({ open, onOpenChange, onSubmit, taskTitle }: CancellationDialogProps) {
  const [justification, setJustification] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) return;
    
    onSubmit(justification.trim());
    setJustification('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cancel Task</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You are about to cancel the task: <strong>"{taskTitle}"</strong>
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="justification">Justification for Cancellation *</Label>
              <Textarea
                id="justification"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Please provide a reason for cancelling this task..."
                className="mt-1"
                rows={4}
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Keep Task
              </Button>
              <Button type="submit" variant="destructive">
                Cancel Task
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
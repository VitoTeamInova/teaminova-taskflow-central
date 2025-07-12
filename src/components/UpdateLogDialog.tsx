import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface UpdateLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (updateText: string) => void;
}

export function UpdateLogDialog({ open, onOpenChange, onSubmit }: UpdateLogDialogProps) {
  const [updateText, setUpdateText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateText.trim()) return;
    
    onSubmit(updateText.trim());
    setUpdateText('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Update</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="updateText">Update Details</Label>
            <Textarea
              id="updateText"
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
              placeholder="Enter update details..."
              className="mt-1"
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-hover">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
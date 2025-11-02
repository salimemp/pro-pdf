
'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface JobConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobType: string;
  files: File[];
  settings: any;
  onJobCreated: () => void;
}

export function JobConfigDialog({ 
  open, 
  onOpenChange, 
  jobType, 
  files, 
  settings,
  onJobCreated 
}: JobConfigDialogProps) {
  const [jobName, setJobName] = useState(`${jobType} - ${new Date().toLocaleDateString()}`);
  const [priority, setPriority] = useState("medium");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState("daily");
  const [scheduleDate, setScheduleDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateJob = async () => {
    setLoading(true);
    try {
      const jobData = {
        name: jobName,
        type: jobType,
        priority,
        isRecurring,
        recurrence: isRecurring ? recurrence : null,
        nextRunAt: scheduleDate ? new Date(scheduleDate).toISOString() : null,
        inputFiles: files.map(f => f.name),
        settings
      };

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });

      if (response.ok) {
        toast.success('Job created successfully!', {
          description: isRecurring ? 'Your recurring job has been scheduled' : 'Job added to queue'
        });
        onJobCreated();
        onOpenChange(false);
      } else {
        toast.error('Failed to create job');
      }
    } catch (error) {
      toast.error('Error creating job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure Job</DialogTitle>
          <DialogDescription className="text-slate-400">
            Set up priority, scheduling, and recurrence for your PDF processing job
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Job Name */}
          <div className="space-y-2">
            <Label htmlFor="jobName" className="text-white">Job Name</Label>
            <Input
              id="jobName"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white"
              placeholder="Enter a descriptive name for this job"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-white">Priority Level</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Process when system is idle</SelectItem>
                <SelectItem value="medium">Medium - Standard processing</SelectItem>
                <SelectItem value="high">High - Process soon</SelectItem>
                <SelectItem value="urgent">Urgent - Process immediately</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-400">
              Higher priority jobs are processed first
            </p>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <Label htmlFor="scheduleDate" className="text-white flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule for Later (Optional)
            </Label>
            <Input
              id="scheduleDate"
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white"
            />
            <p className="text-xs text-slate-400">
              Leave empty to start immediately
            </p>
          </div>

          {/* Recurring */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Make Recurring
                </Label>
                <p className="text-xs text-slate-400">
                  Automatically repeat this job on a schedule
                </p>
              </div>
              <Switch
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
            </div>

            {isRecurring && (
              <div className="space-y-2 pl-6 border-l-2 border-purple-500/30">
                <Label className="text-white">Recurrence Pattern</Label>
                <Select value={recurrence} onValueChange={setRecurrence}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily - Every day at scheduled time</SelectItem>
                    <SelectItem value="weekly">Weekly - Once per week</SelectItem>
                    <SelectItem value="monthly">Monthly - Once per month</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-start space-x-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg mt-4">
                  <AlertTriangle className="w-4 h-4 text-purple-400 mt-0.5" />
                  <p className="text-xs text-purple-300">
                    Recurring jobs require premium subscription and will use the same settings for each run
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Job Summary */}
          <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-2">
            <h4 className="text-sm font-semibold text-white">Job Summary</h4>
            <div className="space-y-1 text-xs text-slate-400">
              <p>• Type: {jobType}</p>
              <p>• Files: {files.length} file(s)</p>
              <p>• Priority: {priority}</p>
              {scheduleDate && <p>• Scheduled: {new Date(scheduleDate).toLocaleString()}</p>}
              {isRecurring && <p>• Recurrence: {recurrence}</p>}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-600 text-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateJob}
            disabled={loading || !jobName}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Creating...' : 'Create Job'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

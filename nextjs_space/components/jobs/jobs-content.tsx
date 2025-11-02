
'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/header";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Calendar,
  Filter,
  Search,
  ArrowUpDown,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  AlertCircle,
  FileText,
  Scissors,
  Archive,
  Lock,
  PenTool,
  FileImage
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

interface Job {
  id: string;
  name: string;
  type: string;
  status: string;
  priority: string;
  progress: number;
  isRecurring: boolean;
  recurrence?: string;
  nextRunAt?: string;
  lastRunAt?: string;
  errorMessage?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

const jobTypeIcons: Record<string, any> = {
  merge: FileText,
  split: Scissors,
  compress: Archive,
  encrypt: Lock,
  sign: PenTool,
  convert: FileImage
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  processing: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  completed: "bg-green-500/20 text-green-300 border-green-500/30",
  failed: "bg-red-500/20 text-red-300 border-red-500/30",
  scheduled: "bg-purple-500/20 text-purple-300 border-purple-500/30"
};

const priorityColors: Record<string, string> = {
  low: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  medium: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  urgent: "bg-red-500/20 text-red-300 border-red-500/30"
};

export function JobsContent() {
  const { data: session } = useSession() || {};
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [searchQuery, setSearchQuery] = useState("");
  const [completedJobIds, setCompletedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        
        // Check for newly completed jobs
        const newCompletedIds = new Set<string>();
        data.forEach((job: Job) => {
          if (job.status === 'completed' && !completedJobIds.has(job.id)) {
            newCompletedIds.add(job.id);
            toast.success(`Job "${job.name}" completed successfully!`, {
              description: `Your ${job.type} operation is ready`,
              duration: 5000
            });
          }
        });
        
        if (newCompletedIds.size > 0) {
          setCompletedJobIds(prev => new Set([...prev, ...newCompletedIds]));
        }
        
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Job deleted successfully');
        fetchJobs();
      } else {
        toast.error('Failed to delete job');
      }
    } catch (error) {
      toast.error('Error deleting job');
    }
  };

  const retryJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/retry`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast.success('Job restarted');
        fetchJobs();
      } else {
        toast.error('Failed to restart job');
      }
    } catch (error) {
      toast.error('Error restarting job');
    }
  };

  const filteredJobs = jobs
    .filter(job => {
      if (filterStatus !== "all" && job.status !== filterStatus) return false;
      if (filterType !== "all" && job.type !== filterType) return false;
      if (searchQuery && !job.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "createdAt") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "priority") {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
      }
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return 0;
    });

  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'pending').length,
    processing: jobs.filter(j => j.status === 'processing').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    recurring: jobs.filter(j => j.isRecurring).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Job Queue</h1>
          <p className="text-slate-400">
            Track and manage your PDF processing jobs
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8"
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <p className="text-xs text-slate-400">Total Jobs</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-300">{stats.pending}</div>
              <p className="text-xs text-slate-400">Pending</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-300">{stats.processing}</div>
              <p className="text-xs text-slate-400">Processing</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-300">{stats.completed}</div>
              <p className="text-xs text-slate-400">Completed</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-300">{stats.failed}</div>
              <p className="text-xs text-slate-400">Failed</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-300">{stats.recurring}</div>
              <p className="text-xs text-slate-400">Recurring</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="merge">Merge</SelectItem>
                    <SelectItem value="split">Split</SelectItem>
                    <SelectItem value="compress">Compress</SelectItem>
                    <SelectItem value="encrypt">Encrypt</SelectItem>
                    <SelectItem value="sign">Sign</SelectItem>
                    <SelectItem value="convert">Convert</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date Created</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-20 text-center">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No jobs found</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job, index) => {
                const Icon = jobTypeIcons[job.type] || FileText;
                const isNew = completedJobIds.has(job.id) && job.status === 'completed';
                
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      scale: isNew ? [1, 1.02, 1] : 1
                    }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.05,
                      scale: { duration: 0.6, repeat: isNew ? 2 : 0 }
                    }}
                  >
                    <Card className={`bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all ${
                      isNew ? 'ring-2 ring-green-500/50' : ''
                    }`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className={`w-12 h-12 rounded-lg ${
                              job.status === 'completed' ? 'bg-green-500' :
                              job.status === 'processing' ? 'bg-blue-500' :
                              job.status === 'failed' ? 'bg-red-500' :
                              'bg-slate-600'
                            } flex items-center justify-center`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-white font-semibold">{job.name}</h3>
                                {job.isRecurring && (
                                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    {job.recurrence}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Badge className={statusColors[job.status]}>
                                  {job.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                  {job.status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                  {job.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                                  {job.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                  {job.status === 'scheduled' && <Calendar className="w-3 h-3 mr-1" />}
                                  {job.status}
                                </Badge>
                                
                                <Badge className={priorityColors[job.priority]}>
                                  {job.priority} priority
                                </Badge>
                                
                                <span className="text-xs text-slate-400">
                                  {job.type}
                                </span>
                              </div>
                              
                              {job.status === 'processing' && (
                                <div className="mb-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-slate-400">Progress</span>
                                    <span className="text-xs text-blue-400">{job.progress}%</span>
                                  </div>
                                  <Progress value={job.progress} className="h-2" />
                                </div>
                              )}
                              
                              {job.errorMessage && (
                                <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-2">
                                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                                  <p className="text-xs text-red-400">{job.errorMessage}</p>
                                </div>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                                <span>Created: {format(new Date(job.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                                {job.completedAt && (
                                  <span>Completed: {format(new Date(job.completedAt), 'MMM dd, yyyy HH:mm')}</span>
                                )}
                                {job.nextRunAt && (
                                  <span className="text-purple-400">
                                    Next run: {format(new Date(job.nextRunAt), 'MMM dd, yyyy HH:mm')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {job.status === 'failed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                                onClick={() => retryJob(job.id)}
                              >
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Retry
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-400 hover:bg-red-500/10"
                              onClick={() => deleteJob(job.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}

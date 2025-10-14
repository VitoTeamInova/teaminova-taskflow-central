import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Download, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface ErrorLog {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  message: string;
  stack?: string;
  user_id?: string;
  context?: any;
  resolved: boolean;
}

const severityColors = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive',
  critical: 'destructive',
} as const;

export function ErrorLogViewer() {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchErrorLogs();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('error_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'error_logs'
        },
        () => {
          fetchErrorLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchErrorLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setErrorLogs((data || []) as ErrorLog[]);
    } catch (error) {
      console.error('Error fetching error logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    try {
      const exportData = errorLogs.map(log => ({
        'Timestamp': new Date(log.timestamp).toLocaleString(),
        'Severity': log.severity,
        'Category': log.category,
        'Message': log.message,
        'Stack Trace': log.stack || '',
        'User ID': log.user_id || 'N/A',
        'Context': JSON.stringify(log.context || {}),
        'Resolved': log.resolved ? 'Yes' : 'No',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Error Logs');
      
      XLSX.writeFile(workbook, `error-logs-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Success",
        description: "Error logs exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export error logs",
        variant: "destructive",
      });
    }
  };

  const markAsResolved = async (id: string) => {
    try {
      const { error } = await supabase
        .from('error_logs')
        .update({ resolved: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Error marked as resolved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update error status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Error Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading error logs...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Error Log ({errorLogs.filter(log => !log.resolved).length} unresolved)
          </CardTitle>
          <Button onClick={exportToExcel} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {errorLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No errors logged yet
            </div>
          ) : (
            <div className="space-y-2">
              {errorLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-lg border ${
                    log.resolved ? 'bg-muted/30 opacity-60' : 'bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={severityColors[log.severity]}>
                        {log.severity}
                      </Badge>
                      <Badge variant="outline">{log.category}</Badge>
                      {log.resolved && (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Resolved
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      {!log.resolved && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsResolved(log.id)}
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-medium mb-1">{log.message}</p>
                  {log.stack && (
                    <details className="text-xs text-muted-foreground mt-2">
                      <summary className="cursor-pointer hover:text-foreground">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                        {log.stack}
                      </pre>
                    </details>
                  )}
                  {log.context && Object.keys(log.context).length > 0 && (
                    <details className="text-xs text-muted-foreground mt-2">
                      <summary className="cursor-pointer hover:text-foreground">
                        Additional Context
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                        {JSON.stringify(log.context, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

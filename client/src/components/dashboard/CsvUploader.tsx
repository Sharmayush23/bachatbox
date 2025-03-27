import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { parseFileData, detectColumnMappings } from '../../services/csvService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CsvUploaderProps = {
  onDataImported: (data: any) => void;
};

const CsvUploader = ({ onDataImported }: CsvUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editRowIndex, setEditRowIndex] = useState<number | null>(null);
  const [editRowData, setEditRowData] = useState<any>(null);
  const { toast } = useToast();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    
    // Validate file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'csv' && fileExt !== 'xlsx' && fileExt !== 'xls') {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or Excel file (.csv, .xlsx, .xls)",
        variant: "destructive",
      });
      setFileName(null);
      return;
    }
  };
  
  const handleUpload = async () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    const file = fileInput.files?.[0];
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const data = await parseFileData(file);
      setImportedData(data);
      
      // Show preview dialog instead of immediate import
      setShowPreviewDialog(true);
      
      toast({
        title: "File loaded successfully",
        description: `Loaded ${data.length} records from ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Failed to import file",
        description: "There was an error processing your file. Please check the format and try again.",
        variant: "destructive",
      });
      console.error("Import error:", error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleConfirmImport = () => {
    onDataImported(importedData);
    setShowPreviewDialog(false);
    
    toast({
      title: "Data imported successfully",
      description: `Imported ${importedData.length} records`,
    });
  };
  
  const handleCancelImport = () => {
    setImportedData([]);
    setShowPreviewDialog(false);
  };
  
  const startEditing = (index: number) => {
    setEditRowIndex(index);
    setEditRowData({...importedData[index]});
    setEditMode(true);
  };
  
  const saveEditedRow = () => {
    if (editRowIndex === null || !editRowData) return;
    
    const updatedData = [...importedData];
    updatedData[editRowIndex] = editRowData;
    setImportedData(updatedData);
    setEditMode(false);
    setEditRowIndex(null);
    setEditRowData(null);
    
    toast({
      title: "Record updated",
      description: "The record has been successfully updated",
    });
  };
  
  const handleEditChange = (field: string, value: string) => {
    if (!editRowData) return;
    setEditRowData({
      ...editRowData,
      [field]: value
    });
  };
  
  const cancelEditing = () => {
    setEditMode(false);
    setEditRowIndex(null);
    setEditRowData(null);
  };
  
  const deleteRow = (index: number) => {
    const updatedData = [...importedData];
    updatedData.splice(index, 1);
    setImportedData(updatedData);
    
    toast({
      title: "Record deleted",
      description: "The record has been removed from the import data",
    });
  };
  
  // Get column headers for the table
  const getTableHeaders = () => {
    if (importedData.length === 0) return [];
    
    // Get headers from the first row
    return Object.keys(importedData[0]);
  };
  
  return (
    <>
      <Card className="bg-card border border-border">
        <CardContent className="p-6">
          <h3 className="font-medium text-foreground mb-4">Import Financial Data</h3>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              Upload your financial data to visualize spending patterns and track expenses.
            </p>
            
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="upload">Upload File</TabsTrigger>
                <TabsTrigger value="format">File Format</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="file"
                      id="file-upload"
                      className="sr-only"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-border bg-background py-3 hover:bg-secondary/30"
                    >
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-file-upload text-primary"></i>
                        <span className="text-sm font-medium text-muted-foreground">
                          {fileName || "Select CSV or Excel file"}
                        </span>
                      </div>
                    </label>
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading || !fileName}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    {isUploading ? (
                      <span className="flex items-center space-x-1">
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Processing...</span>
                      </span>
                    ) : (
                      "Import"
                    )}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="format">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Supported Formats</h4>
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                      <li>CSV (.csv): Comma separated values</li>
                      <li>Excel (.xlsx, .xls): Microsoft Excel spreadsheets</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Required Columns</h4>
                    <p className="text-xs text-muted-foreground mb-1">
                      Your file should contain at least these columns (column names can vary):
                    </p>
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                      <li>Date: Transaction date (e.g., 2024-03-15)</li>
                      <li>Amount: Transaction amount (e.g., 120.45)</li>
                      <li>Category: Transaction category (e.g., Groceries)</li>
                      <li>Description: Details about the transaction</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Examples</h4>
                    <p className="text-xs text-muted-foreground">
                      <strong>CSV:</strong> Date, Category, Description, Amount, Type<br />
                      2024-03-15, Groceries, Supermarket, 120.45, expense
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      {/* Data Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review and Edit Import Data</DialogTitle>
            <DialogDescription>
              Review the data before importing. You can edit or delete rows as needed.
            </DialogDescription>
          </DialogHeader>
          
          {importedData.length > 0 && (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {getTableHeaders().map((header, index) => (
                      <TableHead key={index} className="whitespace-nowrap">
                        {header}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importedData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {getTableHeaders().map((header, colIndex) => (
                        <TableCell key={colIndex} className="py-2">
                          {editMode && editRowIndex === rowIndex ? (
                            <Input
                              value={editRowData ? editRowData[header] || '' : ''}
                              onChange={(e) => handleEditChange(header, e.target.value)}
                              className="h-8 w-full"
                            />
                          ) : (
                            row[header] || '-'
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-right space-x-1">
                        {editMode && editRowIndex === rowIndex ? (
                          <>
                            <Button size="sm" variant="outline" onClick={saveEditedRow} className="h-7 px-2 py-1">
                              <i className="fas fa-save mr-1"></i> Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-7 px-2 py-1">
                              <i className="fas fa-times mr-1"></i> Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => startEditing(rowIndex)} className="h-7 px-2 py-1">
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteRow(rowIndex)} className="h-7 px-2 py-1 text-red-500">
                              <i className="fas fa-trash"></i>
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={handleCancelImport}>
              Cancel
            </Button>
            <Button onClick={handleConfirmImport} className="bg-primary text-white">
              Import Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CsvUploader;
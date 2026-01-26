import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@superapp/ui-kit";
import {
  TableHeader,
  TableRow,
  Progress,
  TableHead,
  TableBody,
  TableCell,
  Table
} from "@superapp/ui-kit";
import { formatBytes } from "@/utils/format";
import { useTranslation } from "react-i18next";

interface DiskTableProps {
  disks: Array<{
    fs: string;
    type: string;
    size: number;
    used: number;
    available: number;
    mount: string;
    use: number;
  }>;
}

export function DiskTable({ disks }: DiskTableProps) {
  const { t } = useTranslation(['system_health']);
  
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>{t('disk_table.title')}</CardTitle>
        <CardDescription>{t('disk_table.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('disk_table.filesystem')}</TableHead>
              <TableHead>{t('disk_table.type')}</TableHead>
              <TableHead>{t('disk_table.mount')}</TableHead>
              <TableHead>{t('disk_table.size')}</TableHead>
              <TableHead>{t('disk_table.used')}</TableHead>
              <TableHead>{t('disk_table.available')}</TableHead>
              <TableHead className="w-[150px]">{t('disk_table.use_percent')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disks.map((disk, index) => (
              <TableRow key={`${disk.fs}-${index.toString()}`}>
                <TableCell className="font-medium">{disk.fs}</TableCell>
                <TableCell>{disk.type}</TableCell>
                <TableCell>{disk.mount}</TableCell>
                <TableCell>{formatBytes(disk.size)}</TableCell>
                <TableCell>{formatBytes(disk.used)}</TableCell>
                <TableCell>{formatBytes(disk.available)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={disk.use} className="h-2" />
                    <span className="text-xs w-8">{Math.round(disk.use).toString()}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
